import { FiAward, FiShield, FiUsers } from 'react-icons/fi';

export default function CustomerAbout() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-16 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">About Us</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">A premium real estate company built on trust, transparency, and execution.</h1>
          <p className="mt-6 text-base font-medium leading-8 text-slate-600">Aurov Reality helps customers discover verified plots, flats, villas, and ventures with a smooth booking and site-visit workflow. This demo frontend shows how customer and employee operations can live in one portal.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[['Verified Ventures', FiShield], ['Expert Team', FiUsers], ['Premium Service', FiAward]].map(([title, Icon]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="text-3xl text-[#0B3D91]" />
                <p className="mt-4 font-black text-slate-900">{title}</p>
              </div>
            ))}
          </div>
        </div>
        <img className="h-[500px] w-full rounded-[36px] object-cover shadow-xl shadow-slate-900/10" src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80" alt="Aurov Reality office" />
      </div>
    </main>
  );
}
