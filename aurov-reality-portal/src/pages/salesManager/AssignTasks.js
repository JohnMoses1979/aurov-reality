// import { useMemo, useRef, useState } from 'react';
// import { FiFileText, FiSearch, FiSend, FiUploadCloud } from 'react-icons/fi';
// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { useAuth } from '../../context/AuthContext.js';
// import { isExecutiveRole } from '../../constants/roles.js';

// const ROLE = 'Sales Manager';
// const DEPARTMENT = 'Sales';
// const TITLE = 'Sales Assign Tasks';

// export default function SalesManagerAssignTasks() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const fileRef = useRef(null);
//   const [search, setSearch] = useState('');
//   const [file, setFile] = useState(null);
//   const [message, setMessage] = useState('');
//   const executives = useMemo(
//     () => (app.employees || []).filter((employee) => employee.department === DEPARTMENT && isExecutiveRole(employee.role) && employee.status !== 'Inactive'),
//     [app.employees],
//   );
//   const [form, setForm] = useState({ title: '', assigneeId: '', due: '' });

//   const tasks = (app.tasks || []).filter((task) => task.department === DEPARTMENT || task.assignedBy === ROLE);

//   const filteredTasks = tasks.filter((task) => {
//     const q = search.trim().toLowerCase();
//     if (!q) return true;
//     return [task.id, task.title, task.assignee, task.assigneeEmployeeId, task.status, task.pdfName]
//       .filter(Boolean)
//       .join(' ')
//       .toLowerCase()
//       .includes(q);
//   });

//   const submitTask = async (event) => {
//     event.preventDefault();
//     setMessage('');
//     try {
//       const assigned = await app.assignPdfTask({ ...form, assigneeId: form.assigneeId }, file, ROLE);
//       setMessage('Task assigned successfully to ' + assigned.assignee + '.');
//       setForm({ title: '', assigneeId: '', due: '' });
//       setFile(null);
//       if (fileRef.current) fileRef.current.value = '';
//     } catch (error) {
//       setMessage(error.message || 'Unable to assign task.');
//     }
//   };

//   return (
//     <div>
//       <PageHeader title={TITLE} subtitle={'Assign PDF work to ' + DEPARTMENT + ' executives. The task appears instantly in the executive dashboard.'} />
//       <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
//         <SectionCard title="Assign PDF Task" subtitle="Select executive, upload PDF, and assign work.">
//           {message && <p className="mb-4 rounded-2xl bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">{message}</p>}
//           <form onSubmit={submitTask} className="space-y-4">
//             <label className="block">
//               <span className="mb-2 block text-sm font-extrabold text-slate-700">Work Title</span>
//               <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Enter task title" />
//             </label>
//             <label className="block">
//               <span className="mb-2 block text-sm font-extrabold text-slate-700">Select Executive</span>
//               <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]">
//                 <option value="">Choose executive</option>
//                 {executives.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeId || employee.id} - {employee.name}</option>)}
//               </select>
//             </label>
//             <label className="block">
//               <span className="mb-2 block text-sm font-extrabold text-slate-700">Due Date</span>
//               <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" />
//             </label>
//             <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
//               <p className="font-black text-slate-900">Assignment PDF</p>
//               <p className="mt-1 text-xs font-bold text-slate-500">Only PDF files are allowed.</p>
//               <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white">
//                 <FiUploadCloud /> {file ? file.name : 'Select PDF'}
//                 <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
//               </label>
//             </div>
//             <PrimaryButton type="submit" variant="green" className="w-full"><FiSend /> Assign PDF</PrimaryButton>
//           </form>
//         </SectionCard>

//         <SectionCard
//           title="Assigned Tasks"
//           subtitle="Tasks assigned by this department manager."
//           action={
//             <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
//               <FiSearch className="text-slate-400" />
//               <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent text-sm font-bold outline-none" placeholder="Search tasks" />
//             </div>
//           }
//         >
//           <div className="table-wrap">
//             <table className="min-w-[900px] w-full text-left">
//               <thead>
//                 <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
//                   <th className="py-4 pr-4">Task</th>
//                   <th className="py-4 pr-4">Executive</th>
//                   <th className="py-4 pr-4">PDF</th>
//                   <th className="py-4 pr-4">Due</th>
//                   <th className="py-4 pr-4">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredTasks.map((task) => (
//                   <tr key={task.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
//                     <td className="py-4 pr-4"><p className="font-black text-slate-900">{task.title}</p><p className="text-xs text-slate-500">{task.id}</p></td>
//                     <td className="py-4 pr-4">{task.assignee}<br /><span className="text-xs text-slate-500">{task.assigneeEmployeeId}</span></td>
//                     <td className="py-4 pr-4"><button onClick={() => app.downloadTaskPdf(task, 'assignment')} className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#0B3D91]"><FiFileText /> {task.pdfName || 'Assignment.pdf'}</button></td>
//                     <td className="py-4 pr-4">{task.due || '-'}</td>
//                     <td className="py-4 pr-4"><StatusBadge status={task.status} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           {filteredTasks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No assigned tasks found.</p>}
//         </SectionCard>
//       </div>
//     </div>
//   );
// }





import { useEffect, useMemo, useRef, useState } from 'react';
import { FiFileText, FiSearch, FiSend, FiUploadCloud } from 'react-icons/fi';

import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { salesTaskApi } from '../../services/api.js';

const DEPARTMENT = 'Sales';
const TITLE = 'Sales Assign Tasks';

export default function SalesManagerAssignTasks() {
  const fileRef = useRef(null);

  const [search, setSearch] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const [executives, setExecutives] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    assigneeId: '',
    due: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage('');

      const [executivesData, tasksData] = await Promise.all([
        salesTaskApi.getExecutives(),
        salesTaskApi.getTasks(),
      ]);

      setExecutives(Array.isArray(executivesData) ? executivesData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      setMessage(error.message || 'Unable to load sales task data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return tasks;

    return tasks.filter((task) =>
      [
        task.id,
        task.title,
        task.assignee,
        task.assigneeEmployeeId,
        task.status,
        task.pdfName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [tasks, search]);

  const submitTask = async (event) => {
    event.preventDefault();

    setMessage('');

    if (!form.title.trim()) {
      setMessage('Please enter task title.');
      return;
    }

    if (!form.assigneeId) {
      setMessage('Please select executive.');
      return;
    }

    if (!file) {
      setMessage('Please select PDF file.');
      return;
    }

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setMessage('Only PDF files are allowed.');
      return;
    }

    try {
      setSubmitting(true);

      const assigned = await salesTaskApi.assign({
        title: form.title.trim(),
        assigneeId: form.assigneeId,
        due: form.due,
        file,
      });

      setMessage('Task assigned successfully to ' + assigned.assignee + '.');

      setForm({
        title: '',
        assigneeId: '',
        due: '',
      });

      setFile(null);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      await loadData();
    } catch (error) {
      setMessage(error.message || 'Unable to assign task.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = async (task) => {
    try {
      setMessage('');
      await salesTaskApi.downloadPdf(task);
    } catch (error) {
      setMessage(error.message || 'Unable to download PDF.');
    }
  };

  return (
    <div>
      <PageHeader
        title={TITLE}
        subtitle={
          'Assign PDF work to ' +
          DEPARTMENT +
          ' executives. The task appears instantly in the executive dashboard.'
        }
      />

      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <SectionCard
          title="Assign PDF Task"
          subtitle="Select executive, upload PDF, and assign work."
        >
          {message && (
            <p className="mb-4 rounded-2xl bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">
              {message}
            </p>
          )}

          {loading && (
            <p className="mb-4 rounded-2xl bg-slate-50 p-3 text-sm font-black text-slate-500">
              Loading executives and tasks...
            </p>
          )}

          <form onSubmit={submitTask} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Work Title
              </span>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                placeholder="Enter task title"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Select Executive
              </span>

              <select
                value={form.assigneeId}
                onChange={(e) =>
                  setForm({ ...form, assigneeId: e.target.value })
                }
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              >
                <option value="">Choose executive</option>

                {executives.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.employeeId || employee.id} - {employee.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Due Date
              </span>

              <input
                type="date"
                value={form.due}
                onChange={(e) =>
                  setForm({ ...form, due: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>

            <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
              <p className="font-black text-slate-900">Assignment PDF</p>

              <p className="mt-1 text-xs font-bold text-slate-500">
                Only PDF files are allowed.
              </p>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white">
                <FiUploadCloud /> {file ? file.name : 'Select PDF'}

                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <PrimaryButton
              type="submit"
              variant="green"
              className="w-full"
              disabled={loading || submitting}
            >
              <FiSend /> {submitting ? 'Assigning...' : 'Assign PDF'}
            </PrimaryButton>
          </form>
        </SectionCard>

        <SectionCard
          title="Assigned Tasks"
          subtitle="Tasks assigned by this department manager."
          action={
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
              <FiSearch className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 bg-transparent text-sm font-bold outline-none"
                placeholder="Search tasks"
              />
            </div>
          }
        >
          <div className="table-wrap">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Task</th>
                  <th className="py-4 pr-4">Executive</th>
                  <th className="py-4 pr-4">PDF</th>
                  <th className="py-4 pr-4">Due</th>
                  <th className="py-4 pr-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700"
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
                      <button
                        type="button"
                        onClick={() => downloadPdf(task)}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#0B3D91]"
                      >
                        <FiFileText /> {task.pdfName || 'Assignment.pdf'}
                      </button>
                    </td>

                    <td className="py-4 pr-4">
                      {task.due || '-'}
                    </td>

                    <td className="py-4 pr-4">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
              No assigned tasks found.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
