// import { useMemo, useState } from 'react';
// import { FiCheckCircle, FiDownload, FiSearch, FiXCircle } from 'react-icons/fi';
// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { useAuth } from '../../context/AuthContext.js';

// const ROLE = 'Sales Manager';
// const DEPARTMENT = 'Sales';
// const TITLE = 'Sales PDF Center';

// export default function SalesManagerPDFCenter() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const [search, setSearch] = useState('');
//   const tasks = useMemo(
//     () => (app.tasks || []).filter((task) => task.department === DEPARTMENT || task.assignedBy === ROLE),
//     [app.tasks],
//   );

//   const updatedTasks = tasks.filter((task) => task.updatePdf || task.completionPdf || ['Completed', 'Approved', 'Rejected', 'Closed'].includes(task.status));
//   const filtered = updatedTasks.filter((task) => {
//     const q = search.trim().toLowerCase();
//     if (!q) return true;
//     return [task.id, task.title, task.assignee, task.assigneeEmployeeId, task.status, task.pdfName]
//       .filter(Boolean)
//       .join(' ')
//       .toLowerCase()
//       .includes(q);
//   });

//   return (
//     <div>
//       <PageHeader title={TITLE} subtitle={'Review task PDF updates from ' + DEPARTMENT + ' executives.'} />
//       <SectionCard
//         title="Task Updates"
//         subtitle="Approve, reject, close, download update PDFs and completion PDFs."
//         action={
//           <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
//             <FiSearch className="text-slate-400" />
//             <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent text-sm font-bold outline-none" placeholder="Search updates" />
//           </div>
//         }
//       >
//         <div className="table-wrap">
//           <table className="min-w-[1100px] w-full text-left">
//             <thead>
//               <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
//                 <th className="py-4 pr-4">Task</th>
//                 <th className="py-4 pr-4">Executive</th>
//                 <th className="py-4 pr-4">Update PDF</th>
//                 <th className="py-4 pr-4">Completion PDF</th>
//                 <th className="py-4 pr-4">Status</th>
//                 <th className="py-4 pr-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((task) => (
//                 <tr key={task.id} className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top">
//                   <td className="py-4 pr-4"><p className="font-black text-slate-900">{task.title}</p><p className="text-xs text-slate-500">{task.id}</p></td>
//                   <td className="py-4 pr-4">{task.assignee}<br /><span className="text-xs text-slate-500">{task.assigneeEmployeeId}</span></td>
//                   <td className="py-4 pr-4">{task.updatePdf ? <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(task.updatePdf, task.updatePdf.name)}><FiDownload /> Download</PrimaryButton> : '-'}</td>
//                   <td className="py-4 pr-4">{task.completionPdf ? <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(task.completionPdf, task.completionPdf.name)}><FiDownload /> Download</PrimaryButton> : '-'}</td>
//                   <td className="py-4 pr-4"><StatusBadge status={task.status} /></td>
//                   <td className="py-4 pr-4">
//                     <div className="flex flex-wrap gap-2">
//                       <PrimaryButton variant="green" className="py-2" onClick={() => app.reviewTask(task.id, 'approve')}><FiCheckCircle /> Approve</PrimaryButton>
//                       <PrimaryButton variant="danger" className="py-2" onClick={() => app.reviewTask(task.id, 'reject')}><FiXCircle /> Reject</PrimaryButton>
//                       <PrimaryButton variant="outline" className="py-2" onClick={() => app.reviewTask(task.id, 'close')}>Close</PrimaryButton>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {filtered.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No task updates found.</p>}
//       </SectionCard>
//     </div>
//   );
// }






import { useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiDownload,
  FiSearch,
  FiXCircle,
} from 'react-icons/fi';

import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { salesPdfCenterApi } from '../../services/api.js';

const DEPARTMENT = 'Sales';
const TITLE = 'Sales PDF Center';

export default function SalesManagerPDFCenter() {
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setMessage('');

      const data = await salesPdfCenterApi.getUpdates();

      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || 'Unable to load PDF task updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      return tasks;
    }

    return tasks.filter((task) =>
      [
        task.id,
        task.title,
        task.assignee,
        task.assigneeEmployeeId,
        task.status,
        task.pdfName,
        task.updatePdf?.name,
        task.completionPdf?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [tasks, search]);

  const downloadFile = async (task, file) => {
    try {
      setMessage('');

      await salesPdfCenterApi.downloadTaskFile(
        task.taskId,
        file.type,
        file.name
      );
    } catch (error) {
      setMessage(error.message || 'Unable to download file.');
    }
  };

  const reviewTask = async (task, decision) => {
    try {
      setMessage('');

      await salesPdfCenterApi.reviewTask(task.taskId, decision);
      await loadUpdates();

      const label =
        decision === 'approve'
          ? 'approved'
          : decision === 'reject'
            ? 'rejected'
            : 'closed';

      setMessage('Task ' + label + ' successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to update task review.');
    }
  };

  return (
    <div>
      <PageHeader
        title={TITLE}
        subtitle={'Review task PDF updates from ' + DEPARTMENT + ' executives.'}
      />

      <SectionCard
        title="Task Updates"
        subtitle="Approve, reject, close, download update PDFs and completion PDFs."
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <FiSearch className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-56 bg-transparent text-sm font-bold outline-none"
              placeholder="Search updates"
            />
          </div>
        }
      >
        {message && (
          <p className="mb-4 rounded-2xl bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">
            {message}
          </p>
        )}

        {loading && (
          <p className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            Loading task updates...
          </p>
        )}

        {!loading && (
          <div className="table-wrap">
            <table className="min-w-[1100px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Task</th>
                  <th className="py-4 pr-4">Executive</th>
                  <th className="py-4 pr-4">Update PDF</th>
                  <th className="py-4 pr-4">Completion PDF</th>
                  <th className="py-4 pr-4">Status</th>
                  <th className="py-4 pr-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-black text-slate-900">
                        {task.title}
                      </p>

                      <p className="text-xs text-slate-500">
                        {task.id}
                      </p>
                    </td>

                    <td className="py-4 pr-4">
                      {task.assignee}
                      <br />

                      <span className="text-xs text-slate-500">
                        {task.assigneeEmployeeId}
                      </span>
                    </td>

                    <td className="py-4 pr-4">
                      {task.updatePdf ? (
                        <PrimaryButton
                          variant="outline"
                          className="py-2"
                          onClick={() => downloadFile(task, task.updatePdf)}
                        >
                          <FiDownload /> Download
                        </PrimaryButton>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      {task.completionPdf ? (
                        <PrimaryButton
                          variant="outline"
                          className="py-2"
                          onClick={() =>
                            downloadFile(task, task.completionPdf)
                          }
                        >
                          <FiDownload /> Download
                        </PrimaryButton>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <PrimaryButton
                          variant="green"
                          className="py-2"
                          onClick={() => reviewTask(task, 'approve')}
                        >
                          <FiCheckCircle /> Approve
                        </PrimaryButton>

                        <PrimaryButton
                          variant="danger"
                          className="py-2"
                          onClick={() => reviewTask(task, 'reject')}
                        >
                          <FiXCircle /> Reject
                        </PrimaryButton>

                        <PrimaryButton
                          variant="outline"
                          className="py-2"
                          onClick={() => reviewTask(task, 'close')}
                        >
                          Close
                        </PrimaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            No task updates found.
          </p>
        )}
      </SectionCard>
    </div>
  );
}