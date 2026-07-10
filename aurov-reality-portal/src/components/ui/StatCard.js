import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0B4F8F] via-[#0B7A8F] to-[#16B77A] p-5 text-white shadow-xl shadow-blue-900/10"
    >

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white/75">{label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{value}</p>
          {trend && <p className="mt-2 text-xs font-bold text-white/80">{trend}</p>}
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
          <Icon className="text-xl" />
        </div>
      </div>
    </motion.div>
  );
}
