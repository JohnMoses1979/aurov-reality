import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.js';
import { initials } from '../../utils/formatters.js';
import Logo from '../ui/Logo.js';
import NotificationBell from './NotificationBell.js';

export default function Topbar({ setMobileOpen }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#F8FAFC]/90 px-4 py-3 backdrop-blur-xl lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>

        <div className="hidden shrink-0 lg:block">
          <Logo size="sm" />
        </div>

        <div className="flex-1" />

        <NotificationBell />

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF4FF] text-sm font-black text-[#0B3D91]">
            {initials(user?.role || 'AR')}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-black text-slate-900">{user?.role || 'Guest'}</p>
            <p className="text-xs font-bold text-slate-500">
              {user?.employeeId ? `${user.employeeId} - ` : ''}{user?.email || user?.mobileNumber || 'demo@aurov.in'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
