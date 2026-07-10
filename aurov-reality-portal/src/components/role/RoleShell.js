import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Topbar from '../layout/Topbar.js';

export default function RoleShell({ SidebarComponent }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SidebarComponent collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="min-w-0 flex-1">
        <Topbar setMobileOpen={setMobileOpen} />
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
