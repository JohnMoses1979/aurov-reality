import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0B7A8F]">Aurov Reality</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}
