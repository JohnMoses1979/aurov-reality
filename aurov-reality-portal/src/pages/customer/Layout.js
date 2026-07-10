import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

import Sidebar from './Sidebar.js';
import Logo from '../../components/ui/Logo.js';
import { useAuth } from '../../context/AuthContext.js';
import { initials } from '../../utils/formatters.js';
import NotificationBell from '../../components/layout/NotificationBell.js';

export default function CustomerLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#F8FAFC]/90 px-4 py-3 backdrop-blur-xl lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 lg:hidden"
              onClick={() => setMobileOpen(true)}
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
                {initials(user?.name || user?.role || 'C')}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-black text-slate-900">{user?.name || 'Customer'}</p>
                <p className="text-xs font-bold text-slate-500">
                  {user?.email || user?.mobileNumber || 'customer@aurov.in'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
