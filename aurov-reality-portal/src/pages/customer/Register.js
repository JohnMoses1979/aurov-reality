import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    otp: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSentFor, setOtpSentFor] = useState('');

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const sendOtp = async () => {
    setError('');
    setSuccess('');

    const mobile = form.mobile.trim();

    if (!/^\d{10}$/.test(mobile)) {
      setError('Mobile number must be 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.requestCustomerRegistrationOtp({ mobile });
      setOtpSentFor(mobile);
      setSuccess(result.message || 'OTP sent to your mobile number.');
    } catch (err) {
      setError(err.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const mobile = form.mobile.trim();

    if (!/^\d{10}$/.test(mobile)) {
      setError('Mobile number must be 10 digits.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (otpSentFor !== mobile) {
      setError('Please send OTP to this mobile number first.');
      return;
    }

    if (!/^\d{6}$/.test(form.otp.trim())) {
      setError('Please enter the 6 digit OTP.');
      return;
    }

    setLoading(true);

    try {
      await authApi.registerCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile,
        password: form.password,
        otp: form.otp.trim(),
      });

      setSuccess('Account created successfully. Login with your mobile number and password.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-slate-900">Create Customer Account</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Register and login using mobile number.</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">Full Name</span>
            <input
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E5EFF]"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E5EFF]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">Mobile Number</span>
            <input
              value={form.mobile}
              onChange={(e) => {
                update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10));
                update('otp', '');
                setOtpSentFor('');
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E5EFF]"
              required
            />
          </label>

          <PrimaryButton className="w-full" type="button" variant="outline" onClick={sendOtp} disabled={loading}>
            {loading && otpSentFor !== form.mobile.trim() ? 'Sending...' : 'Send OTP'}
          </PrimaryButton>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">OTP</span>
            <input
              value={form.otp}
              onChange={(e) => update('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E5EFF]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">Password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#1E5EFF]">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full bg-transparent text-sm font-semibold outline-none"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((old) => !old)}
                className="text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-extrabold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-extrabold text-emerald-700">
            {success}
          </div>
        )}

        <PrimaryButton className="mt-5 w-full" type="submit" disabled={loading}>
          {loading && otpSentFor === form.mobile.trim() ? 'Creating...' : 'Create Account'}
        </PrimaryButton>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm font-extrabold text-[#0B3D91] hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    </main>
  );
}
