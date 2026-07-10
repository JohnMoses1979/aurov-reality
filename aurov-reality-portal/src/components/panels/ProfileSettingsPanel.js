import { useEffect, useMemo, useState } from 'react';
import { FiCamera, FiKey, FiLogOut, FiShield, FiUser } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import { useAuth } from '../../context/AuthContext.js';
import { useAppData } from '../../context/AppDataContext.js';
import { authApi, userApi } from '../../services/api.js';

function findProfile(user, app) {
  if (!user) return null;

  const userKeys = [
    user.customerId,
    user.employeeId,
    user.id,
    user.email,
    user.username,
    user.mobileNumber,
    user.mobile,
    user.phone,
  ].filter(Boolean).map(String);

  const appProfile = user.role === 'Customer'
    ? (app.customers || []).find((customer) =>
      [customer.customerId, customer.id, customer.mobileNumber, customer.mobile, customer.phone, customer.email]
        .filter(Boolean)
        .map(String)
        .some((value) => userKeys.includes(value))
    )
    : (app.employees || []).find((employee) =>
      [employee.employeeId, employee.id, employee.email, employee.username, employee.mobileNumber, employee.mobile, employee.phone]
        .filter(Boolean)
        .map(String)
        .some((value) => userKeys.includes(value))
    );

  return {
    ...(appProfile || {}),
    ...user,
    address: user.address ?? appProfile?.address ?? '',
    profilePhoto: user.profilePhoto || appProfile?.profilePhoto || appProfile?.photo || '',
    mobileNumber: user.mobileNumber || user.mobile || appProfile?.mobileNumber || appProfile?.mobile || appProfile?.phone || '',
  };
}

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) {
    resolve('');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function ProfileSettingsPanel() {
  const { user, logout, updateUser } = useAuth();
  const app = useAppData();
  const storedProfile = useMemo(() => findProfile(user, app), [user, app.employees, app.customers]);
  const [localProfile, setLocalProfile] = useState(null);
  const profile = localProfile || storedProfile;

  const [form, setForm] = useState({ mobileNumber: '', mobileOtp: '', address: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');
  const [profileOtp, setProfileOtp] = useState({ sent: false, verified: false });
  const [otpState, setOtpState] = useState({ sent: false, entered: '', verified: false });
  const [passwords, setPasswords] = useState({ mobileNumber: '', password: '', confirm: '' });

  useEffect(() => {
    const mobile = profile?.mobileNumber || profile?.mobile || profile?.phone || user?.mobileNumber || '';
    setForm({ mobileNumber: mobile, mobileOtp: '', address: profile?.address || '' });
    setPasswords((old) => ({ ...old, mobileNumber: mobile }));
    setProfileOtp({ sent: false, verified: false });
  }, [profile?.id, profile?.mobileNumber, profile?.mobile, profile?.phone, profile?.address, user?.mobileNumber]);

  const role = user?.role || profile?.role || '';
  const isCustomer = role === 'Customer';
  const identifier = isCustomer ? profile?.customerId || profile?.id || 'Demo Customer' : profile?.employeeId || profile?.id || 'Demo Employee';
  const displayName = profile?.name || profile?.fullName || user?.name || user?.fullName || role;
  const photo = profile?.profilePhoto || profile?.photo || '';
  const currentMobile = profile?.mobileNumber || profile?.mobile || profile?.phone || user?.mobileNumber || '';
  const mobileChanged = form.mobileNumber && form.mobileNumber !== currentMobile;

  const rememberProfile = (updatedProfile) => {
    const normalized = {
      ...updatedProfile,
      name: updatedProfile.name || updatedProfile.fullName || updatedProfile.role,
      mobileNumber: updatedProfile.mobileNumber || updatedProfile.mobile || '',
    };
    setLocalProfile(normalized);

    try {
      localStorage.setItem('aurov-user', JSON.stringify(normalized));
      localStorage.setItem('aurov_user', JSON.stringify(normalized));
    } catch {}
  };

  const sendProfileMobileOtp = async () => {
    setError('');
    setProfileMessage('');

    if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
      setError('Please enter a valid 10 digit mobile number.');
      return;
    }

    try {
      const result = await authApi.requestProfileMobileOtp({ mobile: form.mobileNumber.trim() });
      setProfileOtp({ sent: true, verified: false });
      setProfileMessage(result.message || 'OTP sent to mobile number.');
    } catch (err) {
      setError(err.message || 'Unable to send OTP. Please check SMS/Twilio configuration.');
    }
  };

  const verifyProfileMobileOtp = async () => {
    setError('');
    setProfileMessage('');

    if (!profileOtp.sent || !/^\d{6}$/.test(form.mobileOtp.trim())) {
      setError('Please enter the 6 digit mobile OTP.');
      return;
    }

    try {
      await authApi.verifyProfileMobileOtp({ mobile: form.mobileNumber.trim(), otp: form.mobileOtp.trim() });
      setProfileOtp((old) => ({ ...old, verified: true }));
      setProfileMessage('Mobile number OTP verified successfully. Save profile to register it.');
    } catch (err) {
      setError(err.message || 'Invalid OTP.');
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setProfileMessage('');

    if (mobileChanged && !profileOtp.verified) {
      setError('Please send and verify OTP for the new mobile number before saving.');
      return;
    }

    try {
      const profilePhoto = photoFile ? await readFileAsDataUrl(photoFile) : '';
      const updatedProfile = await userApi.updateProfile({
        mobile: form.mobileNumber.trim(),
        mobileOtp: mobileChanged ? form.mobileOtp.trim() : '',
        address: form.address,
        profilePhoto,
      });

      try { await app.updateUserProfile(user, updatedProfile, photoFile); } catch {}
      rememberProfile(updatedProfile);
      updateUser?.(updatedProfile);
      setProfileMessage(mobileChanged ? 'Mobile number registered successfully.' : 'Profile updated successfully.');
      setPhotoFile(null);
      setProfileOtp({ sent: false, verified: false });
    setOtpState({ sent: false, entered: '', verified: false });
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    }
  };

  const generateOtp = async (event) => {
    event.preventDefault();
    setError('');
    setPasswordMessage('');

    if (!/^\d{10}$/.test(passwords.mobileNumber.trim())) {
      setError('Please enter registered 10 digit mobile number.');
      return;
    }

    try {
      const result = await authApi.requestPasswordResetOtp({ mobile: passwords.mobileNumber.trim() });
      setOtpState({ sent: true, entered: '', verified: false });
      setPasswordMessage(result.message || 'OTP sent to registered mobile number.');
    } catch (err) {
      setError(err.message || 'Unable to send OTP. Please check SMS/Twilio configuration.');
    }
  };

  const verifyOtp = async () => {
    setError('');
    setPasswordMessage('');

    if (!otpState.sent || !/^\d{6}$/.test(otpState.entered.trim())) {
      setError('Please enter the 6 digit OTP.');
      return;
    }

    try {
      await authApi.verifyPasswordResetOtp({ mobile: passwords.mobileNumber.trim(), otp: otpState.entered.trim() });
      setOtpState((old) => ({ ...old, verified: true }));
      setPasswordMessage('OTP verified. Enter new password.');
    } catch (err) {
      setError(err.message || 'Invalid OTP.');
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError('');
    setPasswordMessage('');

    if (!otpState.verified) {
      setError('Please verify OTP first.');
      return;
    }

    if (!passwords.password || passwords.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (passwords.password !== passwords.confirm) {
      setError('New password and confirm password must match.');
      return;
    }

    try {
      await authApi.resetPassword({ mobile: passwords.mobileNumber.trim(), otp: otpState.entered.trim(), password: passwords.password });
      try { app.changePassword(user, passwords.mobileNumber, passwords.password); } catch {}
      setPasswordMessage('Password changed successfully. Please login again with the new password.');
      setPasswords({ mobileNumber: passwords.mobileNumber, password: '', confirm: '' });
      setOtpState({ sent: false, entered: '', verified: false });
      logout();
    } catch (err) {
      setError(err.message || 'Unable to change password.');
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage profile details, photo, mobile number, address, and OTP-based password changes." />

      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Profile" subtitle="Account details from backend">
          <div className="flex items-center gap-4">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] text-3xl font-black text-white">
              {photo ? <img src={photo} alt={displayName} className="h-full w-full object-cover" /> : (displayName || 'A').slice(0, 1)}
            </div>

            <div>
              <p className="text-xl font-black text-slate-900">{displayName}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">{identifier} - {role}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">{profile?.department || user?.department || (isCustomer ? 'Customer' : '-')}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm font-bold text-slate-700">
            <p><span className="text-slate-400">Email:</span> {profile?.email || user?.email || '-'}</p>
            <p><span className="text-slate-400">Mobile:</span> {profile?.mobileNumber || profile?.mobile || profile?.phone || user?.mobileNumber || '-'}</p>
            <p><span className="text-slate-400">Username:</span> {profile?.username || user?.username || '-'}</p>
            <p><span className="text-slate-400">Status:</span> {profile?.status || 'Active'}</p>
          </div>
        </SectionCard>

        <SectionCard title="Edit Profile" subtitle="Only photo, mobile number, and address are editable here">
          {profileMessage && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">{profileMessage}</div>}

          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Profile Photo</span>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] px-4 py-4 text-sm font-black text-[#0B7A8F]">
                <FiCamera /> {photoFile?.name || 'Select Photo'}
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Mobile Number</span>
              <input value={form.mobileNumber} onChange={(e) => { setForm({ ...form, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10), mobileOtp: '' }); setProfileOtp({ sent: false, verified: false }); }} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Mobile OTP</span>
              <input value={form.mobileOtp} onChange={(e) => setForm({ ...form, mobileOtp: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Address</span>
              <textarea rows="4" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" />
            </label>

            <PrimaryButton type="button" variant="outline" onClick={sendProfileMobileOtp}><FiShield /> Send OTP</PrimaryButton>
            <PrimaryButton type="button" variant="outline" onClick={verifyProfileMobileOtp}>Verify OTP</PrimaryButton>
            <PrimaryButton type="submit" variant="green"><FiUser /> Save Profile</PrimaryButton>
          </form>
        </SectionCard>

        <SectionCard title="Change Password" subtitle="OTP-based mobile password change" className="xl:col-span-2">
          {passwordMessage && <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-black text-[#0B3D91]">{passwordMessage}</div>}

          <form onSubmit={changePassword} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Registered Mobile</span><input value={passwords.mobileNumber} onChange={(e) => { setPasswords({ ...passwords, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }); setOtpState({ sent: false, entered: '', verified: false }); setPasswordMessage(''); }} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">OTP</span><input value={otpState.entered} onChange={(e) => setOtpState({ ...otpState, entered: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">New Password</span><input type="password" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Confirm Password</span><input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
            <div className="flex flex-col justify-end gap-2"><PrimaryButton type="button" variant="outline" onClick={generateOtp}><FiShield /> Generate OTP</PrimaryButton><PrimaryButton type="button" variant="outline" onClick={verifyOtp}>Verify OTP</PrimaryButton><PrimaryButton type="submit" variant="green"><FiKey /> Save</PrimaryButton></div>
          </form>
        </SectionCard>

        <SectionCard title="Logout" subtitle="Sign out from this portal and return to the login screen" className="xl:col-span-2">
          <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-black text-slate-900">End current session</p><p className="mt-1 text-sm font-semibold text-slate-500">You will be redirected to /login.</p></div>
            <PrimaryButton type="button" variant="danger" onClick={logout}><FiLogOut /> Logout</PrimaryButton>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}



