import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import { useAuth } from '../../context/AuthContext.js';
import { useAppData } from '../../context/AppDataContext.js';

export default function Settings() {
  const { user } = useAuth();
  const { resetDemoData } = useAppData();
  return (
    <div>
      <PageHeader title="Settings" subtitle="Portal settings, profile details, role preferences, and frontend-only Local Storage controls." />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Profile Settings" subtitle="Current login role">
          <div className="space-y-4">
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Role</span><input value={user?.role || ''} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Employee ID</span><input value={user?.employeeId || 'Demo account'} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Email</span><input value={user?.email || ''} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold" /></label>
            <PrimaryButton variant="green">Save Settings</PrimaryButton>
          </div>
        </SectionCard>
        <SectionCard title="Local Storage System" subtitle="Frontend-only data persistence controls">
          <div className="space-y-4">
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">All ventures, properties, employees, leads, bookings, PDF tasks, complaints, and notifications are stored in browser Local Storage. Data persists after refresh until you reset it.</p>
            <PrimaryButton variant="danger" onClick={resetDemoData}>Reset Demo Data</PrimaryButton>
          </div>
        </SectionCard>
        <SectionCard title="System Preferences" subtitle="Premium enterprise dashboard theme" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {['New Enquiry Notifications', 'PDF Approval Alerts', 'Mobile Drawer Navigation', 'Responsive Charts'].map((item) => (
              <label key={item} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"><span className="text-sm font-black text-slate-700">{item}</span><input type="checkbox" defaultChecked className="h-5 w-5 accent-[#12B76A]" /></label>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
