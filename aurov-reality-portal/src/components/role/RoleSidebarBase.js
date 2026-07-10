import { NavLink } from 'react-router-dom';
import { FiChevronLeft, FiX } from 'react-icons/fi';
import Logo from '../ui/Logo.js';
import { getNavIcon } from './RoleIcons.js';

export default function RoleSidebarBase({ roleLabel, basePath, links, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const safeLinks = Array.isArray(links)
    ? links.filter((link) => Array.isArray(link) && typeof link[0] === 'string' && typeof link[1] === 'string')
    : [];

  const panel = (
    <aside className={`premium-gradient flex h-full flex-col overflow-hidden p-4 text-white transition-all duration-300 ${collapsed ? 'w-[88px]' : 'w-[292px]'}`}>
      <div className="flex items-center justify-between gap-2 px-1 py-2">
        <Logo collapsed={collapsed} light />
        <button onClick={() => setCollapsed?.((value) => !value)} className="hidden rounded-2xl bg-white/10 p-2 text-white transition hover:bg-white/20 lg:block" aria-label="Collapse sidebar">
          <FiChevronLeft className={`transition ${collapsed ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={() => setMobileOpen?.(false)} className="rounded-2xl bg-white/10 p-2 text-white lg:hidden" aria-label="Close sidebar"><FiX /></button>
      </div>

      {!collapsed && <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white/75">{roleLabel} Portal</p>}

      <div className="mt-5 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {safeLinks.map(([label, path]) => {
          const Icon = getNavIcon(label);
          const to = `${basePath}/${path}`;
          return (
            <NavLink key={to} to={to} onClick={() => setMobileOpen?.(false)} className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${isActive ? 'bg-white text-[#0B3D91] shadow-lg shadow-blue-950/10' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="shrink-0 text-xl" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{panel}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0 max-w-[88vw]">{panel}</div>
        </div>
      )}
    </>
  );
}
