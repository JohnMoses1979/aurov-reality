import { useMemo, useState } from 'react';
import { FiArchive, FiDownload, FiEye, FiUploadCloud } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import StatusBadge from '../ui/StatusBadge.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { getRoleDepartment, isExecutiveRole, isSuperRole } from '../../constants/roles.js';

const tabs = ['Assigned PDFs', 'Submitted PDFs', 'Approved PDFs', 'Rejected PDFs', 'Archived PDFs'];

function taskToFile(task, type) {
  const source = type === 'Submitted PDFs' ? task.completionPdf : type === 'Assigned PDFs' ? task.assignmentPdf : task.completionPdf || task.assignmentPdf;
  return {
    id: `${task.id}-${type}`,
    task,
    type,
    name: source?.name || task.pdfName || 'Aurov_Task.pdf',
    owner: task.assignedBy,
    assignedTo: task.assignee,
    status: task.status,
    size: source?.size || 'Demo PDF',
    date: task.submittedAt || task.reviewedAt || task.createdAt || 'Initial',
    file: source,
  };
}

export default function PDFCenter() {
  const { user } = useAuth();
  const app = useAppData();
  const [active, setActive] = useState('Assigned PDFs');
  const [preview, setPreview] = useState(null);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const role = user?.role || '';
  const department = getRoleDepartment(role);

  const visibleTasks = useMemo(() => {
    if (isSuperRole(role)) return app.tasks;
    if (isExecutiveRole(role)) return app.tasks.filter((task) => task.assigneeEmail === user?.email || task.assigneeId === user?.employeeId || (!user?.employeeId && task.department === department));
    return app.tasks.filter((task) => task.department === department || task.assignedBy === role);
  }, [app.tasks, role, department, user?.email]);

  const files = useMemo(() => visibleTasks.flatMap((task) => {
    const list = [];
    if (task.assignmentPdf && ['Pending', 'In Progress'].includes(task.status)) list.push(taskToFile(task, 'Assigned PDFs'));
    if (task.completionPdf && ['Submitted', 'Completed'].includes(task.status)) list.push(taskToFile(task, 'Submitted PDFs'));
    if (task.status === 'Approved') list.push(taskToFile(task, 'Approved PDFs'));
    if (task.status === 'Rejected') list.push(taskToFile(task, 'Rejected PDFs'));
    if (task.status === 'Closed') list.push(taskToFile(task, 'Archived PDFs'));
    return list;
  }), [visibleTasks]);

  const currentFiles = files.filter((file) => file.type === active);

  const openPreview = async (file) => {
    setPreview(file);
    setPreviewDataUrl('');
    const dataUrl = await app.getFileDataUrl(file.file);
    setPreviewDataUrl(dataUrl);
  };

  return (
    <div>
      <PageHeader title="PDF Center" subtitle="Assigned, submitted, approved, rejected, and archived PDF files are generated from real Local Storage task data." action={<PrimaryButton variant="green"><FiUploadCloud /> Upload PDF</PrimaryButton>} />

      <div className="mb-6 overflow-x-auto rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm scrollbar-thin">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActive(tab)} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${active === tab ? 'bg-[#0B3D91] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{tab} <span className="ml-1 opacity-70">{files.filter((file) => file.type === tab).length}</span></button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <SectionCard title={active} subtitle="Preview, download, approve, reject, and archive task PDFs">
          <div className="grid gap-4 md:grid-cols-2">
            {currentFiles.map((file) => (
              <article key={file.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-red-50 text-2xl text-red-500"><FiArchive /></div>
                  <StatusBadge status={file.status} />
                </div>
                <h3 className="mt-4 break-words text-lg font-black text-slate-900">{file.name}</h3>
                <p className="mt-2 text-sm font-bold text-slate-500">Owner: {file.owner}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">Assigned: {file.assignedTo}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{file.size} · {file.date}</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <PrimaryButton variant="outline" className="px-2" onClick={() => openPreview(file)}><FiEye /> Preview</PrimaryButton>
                  <PrimaryButton variant="outline" className="px-2" onClick={() => app.downloadFile(file.file, file.name)}><FiDownload /> Download</PrimaryButton>
                  <PrimaryButton className="px-2" onClick={() => openPreview(file)}>Open</PrimaryButton>
                </div>
              </article>
            ))}
            {currentFiles.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500 md:col-span-2">No files in {active}.</p>}
          </div>
        </SectionCard>
        <SectionCard title="PDF Preview" subtitle="PDF preview from Local Storage metadata + IndexedDB file cache where browser supports it">
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            {previewDataUrl ? (
              <iframe title="PDF preview" src={previewDataUrl} className="h-[520px] w-full rounded-2xl border border-slate-200 bg-white" />
            ) : (
              <div className="p-6">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-white text-4xl text-red-500 shadow-sm"><FiArchive /></div>
                <h3 className="mt-5 text-xl font-black text-slate-900">{preview ? preview.name : 'Preview PDF'}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">{preview ? 'This is a demo seed PDF without stored file content. Uploaded PDFs are stored in browser IndexedDB and preview here.' : 'Select any PDF card to preview here.'}</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
