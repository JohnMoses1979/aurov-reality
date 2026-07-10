import { brand } from '../../config/brand.js';

export default function Logo({ collapsed = false, light = false, size = 'md' }) {
  const imageSize = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex items-center gap-3">
      <div className={`${imageSize} grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-blue-950/10 ring-1 ring-white/30`}>
        <img src={brand.logo} alt={`${brand.name} logo`} className="h-full w-full object-contain p-1.5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className={`${titleSize} font-black tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>{brand.name}</p>
          <p className={`text-xs font-semibold ${light ? 'text-white/75' : 'text-slate-500'}`}>{brand.portalName}</p>
        </div>
      )}
    </div>
  );
}
