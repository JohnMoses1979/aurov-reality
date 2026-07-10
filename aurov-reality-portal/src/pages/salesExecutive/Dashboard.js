// import { useMemo, useRef, useState } from 'react';
// import { FiBriefcase, FiCheckCircle, FiClock, FiDownload, FiFileText, FiMessageSquare, FiSearch, FiUploadCloud } from 'react-icons/fi';
// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import StatCard from '../../components/ui/StatCard.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { useAuth } from '../../context/AuthContext.js';

// const ROLE = 'Sales Executive';
// const DEPARTMENT = 'Sales';
// const TITLE = 'Sales Executive Dashboard';
// const completedStatuses = ['Completed', 'Approved', 'Closed'];

// function taskMine(task, user = {}) {
//   const keys = [user.id, user.employeeId, user.username, user.email, user.name]
//     .filter(Boolean)
//     .map((item) => String(item).toLowerCase());
//   return [task.assigneeId, task.assigneeEmployeeId, task.assigneeUsername, task.assigneeEmail, task.assignee]
//     .filter(Boolean)
//     .some((item) => keys.includes(String(item).toLowerCase()));
// }

// export default function SalesExecutiveDashboard() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const [search, setSearch] = useState('');
//   const updateInput = useRef({});
//   const completionInput = useRef({});

//   const myTasks = useMemo(
//     () => (app.tasks || []).filter((task) => taskMine(task, user || {})),
//     [app.tasks, user],
//   );

//   const visibleTasks = myTasks.filter((task) => {
//     const q = search.trim().toLowerCase();
//     if (!q) return true;
//     return [task.title, task.id, task.status, task.pdfName, task.assignedByName, task.assignedBy]
//       .filter(Boolean)
//       .join(' ')
//       .toLowerCase()
//       .includes(q);
//   });

//   const completedTasks = myTasks.filter((task) => completedStatuses.includes(task.status));
//   const progress = myTasks.length ? Math.round((completedTasks.length / myTasks.length) * 100) : 0;
//   const myComplaints = (app.complaints || []).filter((complaint) => {
//     const keys = [user?.id, user?.employeeId, user?.username, user?.email, user?.name].filter(Boolean).map((item) => String(item).toLowerCase());
//     return [complaint.employeeId, complaint.fromEmployeeId, complaint.fromUsername, complaint.fromEmail, complaint.employeeName, complaint.from]
//       .filter(Boolean)
//       .some((item) => keys.includes(String(item).toLowerCase()));
//   });

//   const handleUpload = async (task, file, kind) => {
//     if (!file) return;
//     await app.uploadTaskPdf(task.id, file, kind);
//   };

//   return (
//     <div>
//       <PageHeader
//         title={TITLE}
//         subtitle="Personal executive workspace with assigned PDFs, status updates, completion uploads, complaints, and real Local Storage synchronization."
//       />

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard label="Assigned Tasks" value={myTasks.length} icon={FiBriefcase} trend="Tasks from manager" />
//         <StatCard label="In Progress" value={myTasks.filter((task) => task.status === 'In Progress').length} icon={FiClock} trend="Currently active" />
//         <StatCard label="Completed" value={completedTasks.length} icon={FiCheckCircle} trend="Completed / approved / closed" />
//         <StatCard label="My Progress" value={progress + '%'} icon={FiFileText} trend="Completed ÷ Assigned" />
//       </div>

//       <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
//         <SectionCard
//           title="Assigned Tasks"
//           subtitle="Download manager PDF, update status, upload update PDF, and submit completion PDF."
//           action={
//             <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
//               <FiSearch className="text-slate-400" />
//               <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-44 bg-transparent text-sm font-bold outline-none" placeholder="Search tasks" />
//             </div>
//           }
//         >
//           <div className="space-y-4">
//             {visibleTasks.map((task) => (
//               <div key={task.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
//                 <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
//                   <div>
//                     <p className="font-black text-slate-900">{task.title}</p>
//                     <p className="mt-1 text-xs font-bold text-slate-500">{task.id} · Assigned by {task.assignedByName || task.assignedBy || 'Manager'}</p>
//                     <p className="mt-1 text-xs font-bold text-slate-400">PDF: {task.pdfName || task.assignmentPdf?.name || 'Assignment.pdf'}</p>
//                   </div>
//                   <StatusBadge status={task.status || 'Pending'} />
//                 </div>

//                 <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
//                   <select
//                     value={task.status || 'Pending'}
//                     onChange={(e) => app.updateTaskStatus(task.id, e.target.value, user)}
//                     className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none"
//                   >
//                     <option>Pending</option>
//                     <option>In Progress</option>
//                     <option>Completed</option>
//                   </select>

//                   <div className="flex flex-wrap gap-2">
//                     <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadTaskPdf(task, 'assignment')}><FiDownload /> Download PDF</PrimaryButton>

//                     <PrimaryButton variant="outline" className="py-2" onClick={() => updateInput.current[task.id]?.click()}><FiUploadCloud /> Upload Update</PrimaryButton>
//                     <input ref={(el) => { updateInput.current[task.id] = el; }} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => handleUpload(task, e.target.files?.[0], 'update')} />

//                     <PrimaryButton variant="green" className="py-2" onClick={() => completionInput.current[task.id]?.click()}><FiCheckCircle /> Upload Completion</PrimaryButton>
//                     <input ref={(el) => { completionInput.current[task.id] = el; }} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => handleUpload(task, e.target.files?.[0], 'completion')} />
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {visibleTasks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No assigned tasks found.</p>}
//           </div>
//         </SectionCard>

//         <div className="space-y-6">
//           <SectionCard title="My Task Updates" subtitle="Uploaded update and completion PDFs.">
//             <div className="space-y-3">
//               {myTasks.filter((task) => task.updatePdf || task.completionPdf || task.status !== 'Pending').slice(0, 8).map((task) => (
//                 <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <p className="font-black text-slate-900">{task.title}</p>
//                       <p className="text-xs font-bold text-slate-500">{task.updatedAt || task.submittedAt || task.createdAt}</p>
//                     </div>
//                     <StatusBadge status={task.status} />
//                   </div>
//                   <div className="mt-3 flex flex-wrap gap-2">
//                     {task.updatePdf && <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(task.updatePdf, task.updatePdf.name)}>Update PDF</PrimaryButton>}
//                     {task.completionPdf && <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(task.completionPdf, task.completionPdf.name)}>Completion PDF</PrimaryButton>}
//                   </div>
//                 </div>
//               ))}
//               {myTasks.filter((task) => task.updatePdf || task.completionPdf || task.status !== 'Pending').length === 0 && (
//                 <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No updates uploaded yet.</p>
//               )}
//             </div>
//           </SectionCard>

//           <SectionCard title="Complaints" subtitle="Your raised complaint history.">
//             <div className="space-y-3">
//               {myComplaints.slice(0, 6).map((complaint) => (
//                 <div key={complaint.id} className="rounded-2xl bg-slate-50 p-4">
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <p className="font-black text-slate-900">{complaint.subject}</p>
//                       <p className="text-xs font-bold text-slate-500">{complaint.createdAt}</p>
//                     </div>
//                     <StatusBadge status={complaint.status || 'Pending'} />
//                   </div>
//                 </div>
//               ))}
//               {myComplaints.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No complaints raised yet.</p>}
//             </div>
//           </SectionCard>
//         </div>
//       </div>
//     </div>
//   );
// }





import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiMessageSquare,
  FiSearch,
  FiUploadCloud,
} from 'react-icons/fi';

import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import StatCard from '../../components/ui/StatCard.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { salesExecutiveDashboardApi } from '../../services/api.js';

const ROLE = 'Sales Executive';
const DEPARTMENT = 'Sales';
const TITLE = 'Sales Executive Dashboard';
const completedStatuses = ['Completed', 'Approved', 'Closed'];

export default function SalesExecutiveDashboard() {
  const [search, setSearch] = useState('');
  const [myTasks, setMyTasks] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const updateInput = useRef({});
  const completionInput = useRef({});

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage('');

      const data = await salesExecutiveDashboardApi.getDashboard();

      setMyTasks(Array.isArray(data.tasks) ? data.tasks : []);
      setMyComplaints(Array.isArray(data.complaints) ? data.complaints : []);
    } catch (error) {
      setMessage(error.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return myTasks;

    return myTasks.filter((task) =>
      [
        task.title,
        task.id,
        task.status,
        task.pdfName,
        task.updatePdfName,
        task.completionPdfName,
        task.assignedByName,
        task.assignedBy,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [myTasks, search]);

  const completedTasks = myTasks.filter((task) =>
    completedStatuses.includes(task.status)
  );

  const progress = myTasks.length
    ? Math.round((completedTasks.length / myTasks.length) * 100)
    : 0;

  const updateLocalTask = (updatedTask) => {
    setMyTasks((old) =>
      old.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleStatusChange = async (task, status) => {
    try {
      const updatedTask = await salesExecutiveDashboardApi.updateTaskStatus(
        task.id,
        status
      );

      updateLocalTask(updatedTask);
      setMessage('Task status updated successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to update task status.');
    }
  };

  const handleUpload = async (task, file, kind) => {
    if (!file) return;

    try {
      const updatedTask = await salesExecutiveDashboardApi.uploadTaskPdf(
        task.id,
        file,
        kind
      );

      updateLocalTask(updatedTask);

      setMessage(
        kind === 'completion'
          ? 'Completion PDF uploaded successfully.'
          : 'Update PDF uploaded successfully.'
      );
    } catch (error) {
      setMessage(error.message || 'Unable to upload PDF.');
    }
  };

  const handleDownload = async (task, kind) => {
    try {
      await salesExecutiveDashboardApi.downloadTaskPdf(task, kind);
    } catch (error) {
      setMessage(error.message || 'Unable to download PDF.');
    }
  };

  const taskHasUpdate = (task) =>
    Boolean(task.updatePdf || task.updatePdfName || task.updatePdfPath);

  const taskHasCompletion = (task) =>
    Boolean(task.completionPdf || task.completionPdfName || task.completionPdfPath);

  const taskUpdateRecords = myTasks.filter(
    (task) =>
      taskHasUpdate(task) ||
      taskHasCompletion(task) ||
      task.status !== 'Pending'
  );

  return (
    <div>
      <PageHeader
        title={TITLE}
        subtitle="Personal executive workspace with assigned PDFs, status updates, completion uploads, complaints, and real backend synchronization."
      />

      {message && (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">
          {message}
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
          Loading dashboard...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned Tasks"
          value={myTasks.length}
          icon={FiBriefcase}
          trend="Tasks from manager"
        />

        <StatCard
          label="In Progress"
          value={myTasks.filter((task) => task.status === 'In Progress').length}
          icon={FiClock}
          trend="Currently active"
        />

        <StatCard
          label="Completed"
          value={completedTasks.length}
          icon={FiCheckCircle}
          trend="Completed / approved / closed"
        />

        <StatCard
          label="My Progress"
          value={progress + '%'}
          icon={FiFileText}
          trend="Completed ÷ Assigned"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Assigned Tasks"
          subtitle="Download manager PDF, update status, upload update PDF, and submit completion PDF."
          action={
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
              <FiSearch className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 bg-transparent text-sm font-bold outline-none"
                placeholder="Search tasks"
              />
            </div>
          }
        >
          <div className="space-y-4">
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-black text-slate-900">{task.title}</p>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {task.id} · Assigned by{' '}
                      {task.assignedByName || task.assignedBy || 'Manager'}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-400">
                      PDF:{' '}
                      {task.pdfName ||
                        task.assignmentPdf?.name ||
                        'Assignment.pdf'}
                    </p>
                  </div>

                  <StatusBadge status={task.status || 'Pending'} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
                  <select
                    value={task.status || 'Pending'}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>

                  <div className="flex flex-wrap gap-2">
                    <PrimaryButton
                      variant="outline"
                      className="py-2"
                      onClick={() => handleDownload(task, 'assignment')}
                    >
                      <FiDownload /> Download PDF
                    </PrimaryButton>

                    <PrimaryButton
                      variant="outline"
                      className="py-2"
                      onClick={() => updateInput.current[task.id]?.click()}
                    >
                      <FiUploadCloud /> Upload Update
                    </PrimaryButton>

                    <input
                      ref={(el) => {
                        updateInput.current[task.id] = el;
                      }}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleUpload(task, e.target.files?.[0], 'update')
                      }
                    />

                    <PrimaryButton
                      variant="green"
                      className="py-2"
                      onClick={() => completionInput.current[task.id]?.click()}
                    >
                      <FiCheckCircle /> Upload Completion
                    </PrimaryButton>

                    <input
                      ref={(el) => {
                        completionInput.current[task.id] = el;
                      }}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleUpload(task, e.target.files?.[0], 'completion')
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            {visibleTasks.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                No assigned tasks found.
              </p>
            )}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="My Task Updates"
            subtitle="Uploaded update and completion PDFs."
          >
            <div className="space-y-3">
              {taskUpdateRecords.slice(0, 8).map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">{task.title}</p>

                      <p className="text-xs font-bold text-slate-500">
                        {task.updatedAt || task.submittedAt || task.createdAt}
                      </p>
                    </div>

                    <StatusBadge status={task.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {taskHasUpdate(task) && (
                      <PrimaryButton
                        variant="outline"
                        className="py-2"
                        onClick={() => handleDownload(task, 'update')}
                      >
                        Update PDF
                      </PrimaryButton>
                    )}

                    {taskHasCompletion(task) && (
                      <PrimaryButton
                        variant="outline"
                        className="py-2"
                        onClick={() => handleDownload(task, 'completion')}
                      >
                        Completion PDF
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              ))}

              {taskUpdateRecords.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No updates uploaded yet.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Complaints" subtitle="Your raised complaint history.">
            <div className="space-y-3">
              {myComplaints.slice(0, 6).map((complaint) => (
                <div key={complaint.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">
                        {complaint.subject}
                      </p>

                      <p className="text-xs font-bold text-slate-500">
                        {complaint.createdAt || complaint.dateTime || '-'}
                      </p>
                    </div>

                    <StatusBadge status={complaint.status || 'Pending'} />
                  </div>
                </div>
              ))}

              {myComplaints.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No complaints raised yet.
                </p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}