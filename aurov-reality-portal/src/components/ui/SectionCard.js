import { motion } from 'framer-motion';

export default function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-black text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
