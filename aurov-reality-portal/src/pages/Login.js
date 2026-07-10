import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi';
import { FaChevronRight } from 'react-icons/fa6';
import logo from '../assets/logo.png';
import PrimaryButton from '../components/ui/PrimaryButton.js';
import { useAuth } from '../context/AuthContext.js';

const features = ['Venture Management', 'Employee Management', 'Customer Bookings', 'PDF Task Management'];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({
      identifier: form.email.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    setLoading(false);

    if (result && result.success === false) {
      setError(result.error || 'Invalid login credentials.');
      return;
    }

    navigate(result.homePath, { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-3 sm:p-4">
      <div className="grid min-h-[calc(100vh-24px)] overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="premium-gradient relative overflow-hidden p-6 text-white sm:p-10 lg:p-14">
          <div className="absolute left-[-6rem] top-[-6rem] h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-[-8rem] right-[-7rem] h-96 w-96 rounded-full bg-[#16C47F]/30 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex min-h-full flex-col justify-center"
          >
            <div className="mb-8 flex justify-center lg:mb-10">
              <img
                src={logo}
                alt="Aurov Reality"
                className="h-28 w-28 rounded-3xl bg-white p-3 object-contain shadow-2xl shadow-black/25 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
              />
            </div>

            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] ring-1 ring-white/20">
                Premium Real Estate SaaS
              </span>

              <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                One Portal for Real Estate Operations
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/85 sm:text-lg">
                Manage ventures, plots, villas, bookings, employee workflows, customer interactions, and company operations from a single platform.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map((item) => (
                  <motion.div
                    whileHover={{ y: -4 }}
                    key={item}
                    className="rounded-3xl bg-white/12 p-4 ring-1 ring-white/18 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <FiCheckCircle className="text-xl text-emerald-200" />
                      <span className="font-extrabold">{item}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-sm font-semibold text-white/70">
              © 2026 Aurov Reality. Enterprise frontend demo.
            </p>
          </motion.div>
        </section>

        <section className="relative grid place-items-center bg-[radial-gradient(circle_at_top_right,#ECFDF5,transparent_34%),radial-gradient(circle_at_bottom_left,#EEF4FF,transparent_30%)] p-4 sm:p-6 lg:p-10">
          <motion.form
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            onSubmit={submit}
            className="glass-card w-full max-w-[455px] rounded-[24px] p-5 sm:p-6"
          >
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] text-white shadow-xl shadow-blue-900/15">
                <FiLock className="text-xl" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Login directly with your Employee ID, username, email, or mobile number and password.
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link
                  to="/home"
                  className="rounded-2xl border border-[#0B3D91]/20 bg-white px-4 py-2 text-xs font-extrabold text-[#0B3D91] hover:bg-[#F8FAFC]"
                >
                  Homepage
                </Link>

                <Link
                  to="/customer-register"
                  className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 hover:bg-emerald-100"
                >
                  Create Account
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Employee ID / Username / Email / Mobile
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-[#1E5EFF]">
                  <FiUser className="text-slate-400" />
                  <input
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold outline-none"
                    placeholder="Employee ID, email, username, or mobile"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Password
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-[#1E5EFF]">
                  <FiLock className="text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => update('password', event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold outline-none"
                    placeholder="Password"
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

            <PrimaryButton className="mt-5 w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'} <FaChevronRight />
            </PrimaryButton>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm font-extrabold">
              <Link to="/forgot-password" className="text-[#0B3D91] hover:underline">
                Employee Forgot Password?
              </Link>

              <span className="text-slate-300">|</span>

              <Link to="/customer-forgot-password" className="text-[#0B3D91] hover:underline">
                Customer Forgot Password?
              </Link>
            </div>
          </motion.form>
        </section>
      </div>
    </main>
  );
}

