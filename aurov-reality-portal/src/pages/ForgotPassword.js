import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiKey, FiPhone } from 'react-icons/fi';
import Logo from '../components/ui/Logo.js';
import PrimaryButton from '../components/ui/PrimaryButton.js';
import { authApi } from '../services/api.js';

export default function ForgotPassword() {
  const [step, setStep] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!/^\d{10}$/.test(mobile.trim())) {
      setError('Mobile number must be 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.requestPasswordResetOtp({ mobile: mobile.trim() });
      setStep('password');
      setMessage(result.message || 'OTP sent to registered mobile number.');
    } catch (err) {
      setError(err.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Please enter the 6 digit OTP.');
      return;
    }

    if (!passwords.password || passwords.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (passwords.password !== passwords.confirm) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({
        mobile: mobile.trim(),
        otp: otp.trim(),
        password: passwords.password,
      });
      setStep('done');
      setMessage('Password updated successfully. You can now login with your mobile number and new password.');
    } catch (err) {
      setError(err.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#EEF4FF,transparent_32%),radial-gradient(circle_at_bottom_right,#ECFDF5,transparent_34%)] p-4">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[560px] rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-8">
        <Logo />
        <div className="mt-8 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] text-white shadow-xl shadow-blue-900/15">
          <FiKey className="text-2xl" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-950">Forgot Password</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">Use your registered mobile number OTP to create a new employee password.</p>

        {message && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-extrabold text-emerald-700">{message}</div>}
        {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-extrabold text-red-700">{error}</div>}

        {step === 'mobile' && (
          <form onSubmit={requestOtp} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Registered Mobile Number</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#1E5EFF]">
                <FiPhone className="text-slate-400" />
                <input value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full bg-transparent text-sm font-semibold outline-none" />
              </div>
            </label>
            <PrimaryButton type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Generate OTP'}</PrimaryButton>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={savePassword} className="mt-6 space-y-4">
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">OTP</span><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">New Password</span><input type="password" value={passwords.password} onChange={(event) => setPasswords({ ...passwords, password: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Confirm Password</span><input type="password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
            <PrimaryButton type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Save New Password'}</PrimaryButton>
          </form>
        )}

        {step === 'done' && <Link to="/login" className="mt-6 block"><PrimaryButton className="w-full">Go to Login</PrimaryButton></Link>}

        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0B3D91] hover:underline"><FiArrowLeft /> Back to Login</Link>
      </motion.section>
    </main>
  );
}
