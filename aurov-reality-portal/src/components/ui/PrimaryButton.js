export default function PrimaryButton({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-[#0B3D91] text-white hover:bg-[#092f70]',
    green: 'bg-[#12B76A] text-white hover:bg-[#0f9f5c]',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition active:scale-[0.98] ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
