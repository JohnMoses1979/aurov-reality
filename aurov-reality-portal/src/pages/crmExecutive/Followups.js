import { useMemo, useRef, useState } from 'react';
import { FiCheckCircle, FiDownload, FiSearch, FiUploadCloud } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';

const TITLE = 'Followups';

function taskMine(task, user = {}) {
  const keys = [user.id, user.employeeId, user.username, user.email, user.name].filter(Boolean).map((item) => String(item).toLowerCase());
  return [task.assigneeId, task.assigneeEmployeeId, task.assigneeUsername, task.assigneeEmail, task.assignee]
    .filter(Boolean)
    .some((item) => keys.includes(String(item).toLowerCase()));
}

export default function CrmExecutiveFollowups() {
  const { user } = useAuth();
  const app = useAppData();
  const [search, setSearch] = useState('');
  const updateInput = useRef({});
  const completionInput = useRef({});
  const tasks = useMemo(() => (app.tasks || []).filter((task) => taskMine(task, user || {})), [app.tasks, user]);
  const filtered = tasks.filter((task) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [task.id, task.title, task.status, task.assignedBy, task.pdfName].filter(Boolean).join(' ').toLowerCase().includes(q);
  });

  const upload = async (task, file, kind) => {
    if (!file) return;
    await app.uploadTaskPdf(task.id, file, kind);
  };

  return (
    <div>
      <PageHeader title={TITLE} subtitle="All PDF work assigned by your manager. Update status and upload PDFs from this page." />
      <SectionCard
        title="Assigned Tasks"
        subtitle="Download assigned PDF, update status, upload update PDF, upload completion PDF."
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <FiSearch className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent text-sm font-bold outline-none" placeholder="Search assigned tasks" />
          </div>
        }
      >
        <div className="grid gap-4">
          {filtered.map((task) => (
            <div key={task.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-black text-slate-900">{task.title}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{task.id} · {task.pdfName || 'Assignment PDF'}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">Assigned by {task.assignedByName || task.assignedBy || 'Manager'} · Due {task.due || '-'}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
                <select value={task.status || 'Pending'} onChange={(e) => app.updateTaskStatus(task.id, e.target.value, user)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none">
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadTaskPdf(task, 'assignment')}><FiDownload /> Download Assigned PDF</PrimaryButton>
                  <PrimaryButton variant="outline" className="py-2" onClick={() => updateInput.current[task.id]?.click()}><FiUploadCloud /> Upload Update PDF</PrimaryButton>
                  <input ref={(el) => { updateInput.current[task.id] = el; }} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => upload(task, e.target.files?.[0], 'update')} />
                  <PrimaryButton variant="green" className="py-2" onClick={() => completionInput.current[task.id]?.click()}><FiCheckCircle /> Upload Completion PDF</PrimaryButton>
                  <input ref={(el) => { completionInput.current[task.id] = el; }} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => upload(task, e.target.files?.[0], 'completion')} />
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No assigned tasks found.</p>}
        </div>
      </SectionCard>
    </div>
  );
}
