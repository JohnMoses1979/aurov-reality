import { Link } from 'react-router-dom';
import PrimaryButton from '../components/ui/PrimaryButton.js';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] px-4 text-center">
      <div className="max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <p className="text-7xl font-black text-[#0B3D91]">404</p>
        <h1 className="mt-4 text-2xl font-black text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">The requested Aurov Reality page does not exist.</p>
        <Link to="/login"><PrimaryButton className="mt-6">Go to Login</PrimaryButton></Link>
      </div>
    </main>
  );
}
