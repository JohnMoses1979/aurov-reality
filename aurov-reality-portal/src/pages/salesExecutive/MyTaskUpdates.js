// import { useMemo, useState } from 'react';
// import { FiDownload, FiSearch } from 'react-icons/fi';
// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { useAuth } from '../../context/AuthContext.js';

// const TITLE = 'My Task Updates';

// function taskMine(task, user = {}) {
//   const keys = [user.id, user.employeeId, user.username, user.email, user.name].filter(Boolean).map((item) => String(item).toLowerCase());
//   return [task.assigneeId, task.assigneeEmployeeId, task.assigneeUsername, task.assigneeEmail, task.assignee]
//     .filter(Boolean)
//     .some((item) => keys.includes(String(item).toLowerCase()));
// }

// export default function SalesExecutiveMyTaskUpdates() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const [search, setSearch] = useState('');
//   const tasks = useMemo(() => (app.tasks || []).filter((task) => taskMine(task, user || {})), [app.tasks, user]);
//   const updates = tasks.filter((task) => task.updatePdf || task.completionPdf || task.status !== 'Pending');
//   const filtered = updates.filter((task) => {
//     const q = search.trim().toLowerCase();
//     if (!q) return true;
//     return [task.id, task.title, task.status, task.pdfName].filter(Boolean).join(' ').toLowerCase().includes(q);
//   });

//   return (
//     <div>
//       <PageHeader title={TITLE} subtitle="Track PDFs and status updates you submitted to your manager." />
//       <SectionCard
//         title="My Task Updates"
//         subtitle="Update PDFs, completion PDFs, and manager review status."
//         action={
//           <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
//             <FiSearch className="text-slate-400" />
//             <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent text-sm font-bold outline-none" placeholder="Search updates" />
//           </div>
//         }
//       >
//         <div className="table-wrap">
//           <table className="min-w-[950px] w-full text-left">
//             <thead>
//               <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
//                 <th className="py-4 pr-4">Task</th>
//                 <th className="py-4 pr-4">Update PDF</th>
//                 <th className="py-4 pr-4">Completion PDF</th>
//                 <th className="py-4 pr-4">Submitted</th>
//                 <th className="py-4 pr-4">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((task) => (
//                 <tr key={task.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
//                   <td className="py-4 pr-4"><p className="font-black text-slate-900">{task.title}</p><p className="text-xs text-slate-500">{task.id}</p></td>
//                   <td className="py-4 pr-4">{task.updatePdf ? <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(task.updatePdf, task.updatePdf.name)}><FiDownload /> Download</PrimaryButton> : '-'}</td>
//                   <td className="py-4 pr-4">{task.completionPdf ? <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(task.completionPdf, task.completionPdf.name)}><FiDownload /> Download</PrimaryButton> : '-'}</td>
//                   <td className="py-4 pr-4">{task.submittedAt || task.updatedAt || '-'}</td>
//                   <td className="py-4 pr-4"><StatusBadge status={task.status} /></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {filtered.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No task updates submitted yet.</p>}
//       </SectionCard>
//     </div>
//   );
// }





import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiSearch } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { salesExecutiveTaskUpdatesApi } from '../../services/api.js';

const TITLE = 'My Task Updates';

export default function SalesExecutiveMyTaskUpdates() {
  const [search, setSearch] = useState('');
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const loadUpdates = async () => {
      try {
        const data = await salesExecutiveTaskUpdatesApi.getMine();
        setUpdates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setUpdates([]);
      }
    };

    loadUpdates();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return updates;

    return updates.filter((task) =>
      [
        task.id,
        task.title,
        task.status,
        task.pdfName,
        task.updatePdfName,
        task.completionPdfName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [updates, search]);

  const downloadPdf = async (task, kind) => {
    try {
      await salesExecutiveTaskUpdatesApi.downloadPdf(task, kind);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <PageHeader title={TITLE} subtitle="Track PDFs and status updates you submitted to your manager." />
      <SectionCard
        title="My Task Updates"
        subtitle="Update PDFs, completion PDFs, and manager review status."
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <FiSearch className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent text-sm font-bold outline-none" placeholder="Search updates" />
          </div>
        }
      >
        <div className="table-wrap">
          <table className="min-w-[950px] w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 pr-4">Task</th>
                <th className="py-4 pr-4">Update PDF</th>
                <th className="py-4 pr-4">Completion PDF</th>
                <th className="py-4 pr-4">Submitted</th>
                <th className="py-4 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                  <td className="py-4 pr-4"><p className="font-black text-slate-900">{task.title}</p><p className="text-xs text-slate-500">{task.id}</p></td>
                  <td className="py-4 pr-4">{task.updatePdfName || task.updatePdf ? <PrimaryButton variant="outline" className="py-2" onClick={() => downloadPdf(task, 'update')}><FiDownload /> Download</PrimaryButton> : '-'}</td>
                  <td className="py-4 pr-4">{task.completionPdfName || task.completionPdf ? <PrimaryButton variant="outline" className="py-2" onClick={() => downloadPdf(task, 'completion')}><FiDownload /> Download</PrimaryButton> : '-'}</td>
                  <td className="py-4 pr-4">{task.submittedAt || task.updatedAt || '-'}</td>
                  <td className="py-4 pr-4"><StatusBadge status={task.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No task updates submitted yet.</p>}
      </SectionCard>
    </div>
  );
}