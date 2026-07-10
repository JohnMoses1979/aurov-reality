import { useMemo, useRef, useState } from 'react';
import { FiCheckCircle, FiDownload, FiFilePlus, FiUploadCloud, FiXCircle } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import StatusBadge from '../ui/StatusBadge.js';
import { useAuth } from '../../context/AuthContext.js';
import { useAppData } from '../../context/AppDataContext.js';
import { getRoleDepartment, isExecutiveRole, isManagerRole, isSuperRole } from '../../constants/roles.js';

const blank = { title: '', assigneeId: '', due: '30 Jun 2026' };

export default function Tasks() {
  const { user } = useAuth();
  const app = useAppData();
  const [form, setForm] = useState(blank);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingTask, setUploadingTask] = useState(null);
  const [uploadKind, setUploadKind] = useState('completion');
  const [message, setMessage] = useState('');
  const assignInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const role = user?.role || '';
  const department = getRoleDepartment(role);
  const isManager = isManagerRole(role) && !isExecutiveRole(role);
  const isExec = isExecutiveRole(role);

  const executives = useMemo(() => {
    const list = app.employees.filter((employee) => employee.role.includes('Executive') && employee.status === 'Active');
    return isSuperRole(role) ? list : list.filter((employee) => employee.department === department);
  }, [app.employees, role, department]);

  const tasks = useMemo(() => {
    if (isSuperRole(role)) return app.tasks;
    if (isExec) return app.tasks.filter((task) => task.department === department || task.assigneeEmail === user?.email);
    return app.tasks.filter((task) => task.department === department || task.assignedBy === role);
  }, [app.tasks, role, department, user?.email, isExec]);

  const createTask = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!form.title.trim() || !form.assigneeId || !selectedFile) return setMessage('Please enter title, select executive, and choose a PDF file.');
    try {
      await app.assignPdfTask(form, selectedFile, role);
      setMessage('PDF task assigned successfully. It is now visible in the executive dashboard.');
    } catch (error) {
      return setMessage(error.message || 'Unable to assign PDF task.');
    }
    setForm(blank);
    setSelectedFile(null);
    if (assignInputRef.current) assignInputRef.current.value = '';
  };

  const triggerUpload = (task, kind) => {
    setUploadingTask(task);
    setUploadKind(kind);
    setTimeout(() => uploadInputRef.current?.click(), 0);
  };

  const handleTaskUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !uploadingTask) return;
    await app.uploadTaskPdf(uploadingTask.id, file, uploadKind);
    setMessage(uploadKind === 'update' ? 'Update PDF uploaded successfully. Manager can see it now.' : 'Completion PDF submitted successfully. Manager can approve or reject it now.');
    setUploadingTask(null);
    event.target.value = '';
  };

  return (
    <div>
      <PageHeader title="PDF Task System" subtitle="Managers assign task PDFs from a file picker. Executives download assigned PDFs, upload update PDFs, and submit completion PDFs. All data is saved in Local Storage." />
      <input ref={uploadInputRef} type="file" accept="application/pdf" onChange={handleTaskUpload} className="hidden" />
      {message && <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <SectionCard title={isManager ? 'Assign PDF Work' : 'Executive Upload Center'} subtitle={isManager ? 'Only active executives from your department are selectable' : 'Download assignment PDF and submit updates'}>
          {isManager ? (
            <form onSubmit={createTask} className="space-y-4">
              <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Task Title</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Enter PDF task title" /></label>
              <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Assign to Executive</span><select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option value="">Select Executive</option>{executives.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.role}</option>)}</select></label>
              <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Due Date</span><input value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
              <input ref={assignInputRef} type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
              <button type="button" onClick={() => assignInputRef.current?.click()} className="w-full rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#0B7A8F] hover:bg-[#F0FDFA]">
                <FiFilePlus className="mx-auto text-4xl text-[#0B7A8F]" />
                <p className="mt-3 text-lg font-black text-slate-900">Assign PDF</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{selectedFile ? selectedFile.name : 'Click here to open file picker and choose PDF'}</p>
              </button>
              <PrimaryButton type="submit" variant="green" className="w-full">Create & Assign PDF Task</PrimaryButton>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <FiUploadCloud className="mx-auto text-4xl text-[#0B7A8F]" />
                <p className="mt-3 text-lg font-black text-slate-900">My PDF Workflow</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Select a task below to download, upload update PDF, or submit completion PDF.</p>
              </div>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">Status flow: Pending → In Progress → Submitted → Approved → Closed. Rejected tasks stay visible in PDF Center.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Task Assignments" subtitle="Submitted PDFs appear immediately for manager approval">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-black text-[#0B3D91]">{task.id}</span><StatusBadge status={task.status} /></div>
                    <h3 className="text-base font-black text-slate-900">{task.title}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">Assignee: {task.assignee} · Department: {task.department} · Due: {task.due}</p>
                    <p className="mt-1 text-sm font-extrabold text-[#0B7A8F]">Assignment: {task.assignmentPdf?.name || task.pdfName}</p>
                    {task.updatePdf && <p className="mt-1 text-xs font-bold text-slate-500">Update PDF: {task.updatePdf.name}</p>}
                    {task.completionPdf && <p className="mt-1 text-xs font-bold text-slate-500">Completion PDF: {task.completionPdf.name}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PrimaryButton variant="outline" onClick={() => app.downloadTaskPdf(task, 'assignment')}><FiDownload /> Download PDF</PrimaryButton>
                    {isExec && <PrimaryButton variant="outline" onClick={() => triggerUpload(task, 'update')}><FiUploadCloud /> Upload Update</PrimaryButton>}
                    {isExec && <PrimaryButton variant="green" onClick={() => triggerUpload(task, 'completion')}><FiUploadCloud /> Submit Completion</PrimaryButton>}
                    {isManager && task.status === 'Submitted' && <PrimaryButton variant="green" onClick={() => app.reviewTask(task.id, 'approve')}><FiCheckCircle /> Approve</PrimaryButton>}
                    {isManager && task.status === 'Submitted' && <PrimaryButton variant="danger" onClick={() => app.reviewTask(task.id, 'reject')}><FiXCircle /> Reject</PrimaryButton>}
                    {isManager && task.status === 'Approved' && <PrimaryButton onClick={() => app.reviewTask(task.id, 'close')}>Close</PrimaryButton>}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No PDF tasks available for this role yet.</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
