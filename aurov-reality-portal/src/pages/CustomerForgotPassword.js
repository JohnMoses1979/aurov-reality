import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiKey, FiPhone } from 'react-icons/fi';
import PageHeader from '../components/ui/PageHeader.js';
import PrimaryButton from '../components/ui/PrimaryButton.js';
import { authApi } from '../services/api.js';

export default function CustomerForgotPassword() {
  const [step, setStep] = useState('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setError('Mobile number must be 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.requestPasswordResetOtp({
        mobile: mobileNumber.trim(),
      });

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
        mobile: mobileNumber.trim(),
        otp: otp.trim(),
        password: passwords.password,
      });

      setMessage(
        'Password updated successfully. You can now login with your mobile number and new password.'
      );
      setStep('done');
    } catch (err) {
      setError(err.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-4">
      <section className="w-full max-w-[560px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/8 sm:p-8">
        <PageHeader
          title="Customer Forgot Password"
          subtitle="Use registered mobile OTP to create a new password."
        />

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {step === 'mobile' && (
          <form onSubmit={requestOtp} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Registered Mobile Number
              </span>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#1E5EFF]">
                <FiPhone className="text-slate-400" />

                <input
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </label>

            <PrimaryButton type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Generate OTP'}
            </PrimaryButton>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={savePassword} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                OTP
              </span>

              <input
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                New Password
              </span>

              <input
                type="password"
                value={passwords.password}
                onChange={(e) =>
                  setPasswords({ ...passwords, password: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Confirm Password
              </span>

              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>

            <PrimaryButton
              type="submit"
              variant="green"
              className="w-full"
              disabled={loading}
            >
              <FiKey /> {loading ? 'Saving...' : 'Save New Password'}
            </PrimaryButton>
          </form>
        )}

        {step === 'done' && (
          <Link to="/login">
            <PrimaryButton className="w-full">Go to Login</PrimaryButton>
          </Link>
        )}

        <Link
          to="/login"
          className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0B3D91] hover:underline"
        >
          <FiArrowLeft /> Back to Login
        </Link>
      </section>
    </main>
  );
}