// import { useMemo, useState } from 'react';
// import { FiBarChart2, FiBriefcase, FiCheckCircle, FiFileText, FiMessageSquare, FiSearch, FiUsers } from 'react-icons/fi';
// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import StatCard from '../../components/ui/StatCard.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { useAuth } from '../../context/AuthContext.js';
// import { isExecutiveRole } from '../../constants/roles.js';

// const ROLE = 'Sales Manager';
// const DEPARTMENT = 'Sales';
// const TITLE = 'Sales Manager Dashboard';
// const completedStatuses = ['Completed', 'Approved', 'Closed'];

// function taskBelongsTo(task, employee = {}) {
//   const employeeKeys = [employee.id, employee.employeeId, employee.username, employee.email, employee.name]
//     .filter(Boolean)
//     .map((item) => String(item).toLowerCase());
//   return [task.assigneeId, task.assigneeEmployeeId, task.assigneeUsername, task.assigneeEmail, task.assignee]
//     .filter(Boolean)
//     .some((item) => employeeKeys.includes(String(item).toLowerCase()));
// }

// function progressForExecutive(employee, tasks = []) {
//   const assigned = tasks.filter((task) => taskBelongsTo(task, employee));
//   const completed = assigned.filter((task) => completedStatuses.includes(task.status));
//   return {
//     total: assigned.length,
//     completed: completed.length,
//     percent: assigned.length ? Math.round((completed.length / assigned.length) * 100) : 0,
//   };
// }

// export default function SalesManagerDashboard() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const [search, setSearch] = useState('');
//   const roleData = app.getRoleData(ROLE, user || {});

//   const executives = useMemo(
//     () => (app.employees || []).filter((employee) => employee.department === DEPARTMENT && isExecutiveRole(employee.role)),
//     [app.employees],
//   );

//   const departmentTasks = useMemo(
//     () => (app.tasks || []).filter((task) => task.department === DEPARTMENT || task.assignedBy === ROLE),
//     [app.tasks],
//   );

//   const submittedTasks = departmentTasks.filter((task) => ['Completed', 'Submitted', 'Approved', 'Rejected', 'Closed'].includes(task.status));
//   const completedTasks = departmentTasks.filter((task) => completedStatuses.includes(task.status));
//   const departmentComplaints = (roleData.complaints || []).filter((complaint) => complaint.department === DEPARTMENT);
//   const departmentBookings = (roleData.bookings || []).filter((booking) => booking.department === DEPARTMENT || DEPARTMENT === 'Sales');
//   const departmentLeads = (roleData.leads || []).filter((lead) => lead.department === DEPARTMENT || DEPARTMENT === 'Sales');

//   const filteredExecutives = executives.filter((employee) => {
//     const q = search.trim().toLowerCase();
//     if (!q) return true;
//     return [employee.name, employee.employeeId, employee.email, employee.username, employee.role, employee.status]
//       .filter(Boolean)
//       .join(' ')
//       .toLowerCase()
//       .includes(q);
//   });

//   const recentActivity = [
//     ...departmentTasks.map((item) => ({ id: item.id, title: item.title, subtitle: item.assignee, status: item.status, date: item.updatedAt || item.createdAt, type: 'Task' })),
//     ...departmentComplaints.map((item) => ({ id: item.id, title: item.subject, subtitle: item.employeeName || item.from, status: item.status, date: item.createdAt, type: 'Complaint' })),
//     ...departmentLeads.map((item) => ({ id: item.id, title: item.name || item.customerName || item.title, subtitle: item.source || item.phone, status: item.status, date: item.createdAt || item.date, type: 'Lead' })),
//   ].slice(0, 8);

//   const overallProgress = departmentTasks.length ? Math.round((completedTasks.length / departmentTasks.length) * 100) : 0;

//   return (
//     <div>
//       <PageHeader
//         title={TITLE}
//         subtitle={'Department dashboard for ' + DEPARTMENT + ' operations with real Local Storage data, task progress, complaints, PDF submissions, and customer activity.'}
//       />

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard label="Department Executives" value={executives.length} icon={FiUsers} trend="Active team records" />
//         <StatCard label="Assigned Tasks" value={departmentTasks.length} icon={FiBriefcase} trend={completedTasks.length + ' completed'} />
//         <StatCard label="PDF Updates" value={submittedTasks.length} icon={FiFileText} trend="Updates received" />
//         <StatCard label="Team Progress" value={overallProgress + '%'} icon={FiBarChart2} trend="Completed ÷ Assigned" />
//       </div>

//       <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
//         <SectionCard
//           title={DEPARTMENT + ' Executives'}
//           subtitle="Real-time executive progress based on completed tasks divided by assigned tasks."
//           action={
//             <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
//               <FiSearch className="text-slate-400" />
//               <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-44 bg-transparent text-sm font-bold outline-none" placeholder="Search team" />
//             </div>
//           }
//         >
//           <div className="space-y-4">
//             {filteredExecutives.map((employee) => {
//               const progress = progressForExecutive(employee, departmentTasks);
//               return (
//                 <div key={employee.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
//                   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] font-black text-white">
//                         {(employee.name || 'E').slice(0, 1)}
//                       </div>
//                       <div>
//                         <p className="font-black text-slate-900">{employee.name}</p>
//                         <p className="text-xs font-bold text-slate-500">{employee.employeeId || employee.id} · {employee.role}</p>
//                       </div>
//                     </div>
//                     <StatusBadge status={employee.status || 'Active'} />
//                   </div>
//                   <div className="mt-4">
//                     <div className="mb-2 flex justify-between text-sm font-black">
//                       <span>{progress.completed}/{progress.total} tasks completed</span>
//                       <span>{progress.percent}%</span>
//                     </div>
//                     <div className="h-3 overflow-hidden rounded-full bg-white">
//                       <div className="h-full rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#12B76A]" style={{ width: progress.percent + '%' }} />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//             {filteredExecutives.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No executives found for this department.</p>}
//           </div>
//         </SectionCard>

//         <div className="space-y-6">
//           <SectionCard title="Task Updates" subtitle="PDF updates submitted by executives.">
//             <div className="space-y-3">
//               {submittedTasks.slice(0, 6).map((task) => (
//                 <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <p className="font-black text-slate-900">{task.title}</p>
//                       <p className="text-xs font-bold text-slate-500">{task.assignee} · {task.id}</p>
//                     </div>
//                     <StatusBadge status={task.status} />
//                   </div>
//                   <div className="mt-3 flex flex-wrap gap-2">
//                     {task.updatePdf && <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(task.updatePdf, task.updatePdf.name)}>Update PDF</PrimaryButton>}
//                     {task.completionPdf && <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(task.completionPdf, task.completionPdf.name)}>Completion PDF</PrimaryButton>}
//                     {task.status === 'Completed' && <PrimaryButton variant="green" className="py-2" onClick={() => app.reviewTask(task.id, 'approve')}><FiCheckCircle /> Approve</PrimaryButton>}
//                   </div>
//                 </div>
//               ))}
//               {submittedTasks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No submitted task updates yet.</p>}
//             </div>
//           </SectionCard>

//           <SectionCard title="Department Activity" subtitle="Bookings, leads, complaints, and task activity.">
//             <div className="space-y-3">
//               {recentActivity.map((item) => (
//                 <div key={item.type + item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
//                   <div>
//                     <p className="font-black text-slate-900">{item.title}</p>
//                     <p className="text-xs font-bold text-slate-500">{item.type} · {item.subtitle || 'No details'}</p>
//                   </div>
//                   <StatusBadge status={item.status || 'New'} />
//                 </div>
//               ))}
//               {recentActivity.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No activity found.</p>}
//             </div>
//           </SectionCard>
//         </div>
//       </div>

//       <div className="mt-6 grid gap-6 xl:grid-cols-2">
//         <SectionCard title="Bookings & Leads" subtitle="Customer enquiries connected to this department.">
//           <div className="table-wrap">
//             <table className="min-w-[780px] w-full text-left">
//               <thead>
//                 <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
//                   <th className="py-3 pr-4">Customer</th>
//                   <th className="py-3 pr-4">Source</th>
//                   <th className="py-3 pr-4">Contact</th>
//                   <th className="py-3 pr-4">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {[...departmentLeads, ...departmentBookings].slice(0, 8).map((item) => (
//                   <tr key={item.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
//                     <td className="py-3 pr-4">{item.name || item.customerName || item.customer || 'Customer'}</td>
//                     <td className="py-3 pr-4">{item.source || item.type || 'Booking'}</td>
//                     <td className="py-3 pr-4">{item.phone || item.mobile || item.email || '-'}</td>
//                     <td className="py-3 pr-4"><StatusBadge status={item.status || 'New'} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </SectionCard>

//         <SectionCard title="Executive Complaints" subtitle="Complaints raised by department executives.">
//           <div className="space-y-3">
//             {departmentComplaints.slice(0, 7).map((complaint) => (
//               <div key={complaint.id} className="rounded-2xl border border-slate-200 p-4">
//                 <div className="flex items-start justify-between gap-3">
//                   <div>
//                     <p className="font-black text-slate-900">{complaint.subject}</p>
//                     <p className="text-xs font-bold text-slate-500">{complaint.employeeName || complaint.from} · {complaint.employeeId || complaint.fromEmployeeId}</p>
//                   </div>
//                   <StatusBadge status={complaint.status} />
//                 </div>
//               </div>
//             ))}
//             {departmentComplaints.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No complaints found.</p>}
//           </div>
//         </SectionCard>
//       </div>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from 'react';
import {
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiFileText,
  FiMessageSquare,
  FiSearch,
  FiUsers,
} from 'react-icons/fi';

import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import StatCard from '../../components/ui/StatCard.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { salesDashboardApi } from '../../services/api.js';

const DEPARTMENT = 'Sales';
const TITLE = 'Sales Manager Dashboard';

export default function SalesManagerDashboard() {
  const [search, setSearch] = useState('');
  const [dashboard, setDashboard] = useState({
    stats: {
      executives: 0,
      assignedTasks: 0,
      submittedTasks: 0,
      completedTasks: 0,
      overallProgress: 0,
    },
    executives: [],
    submittedTasks: [],
    recentActivity: [],
    customers: [],
    complaints: [],
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage('');

      const data = await salesDashboardApi.getDashboard();

      setDashboard({
        stats: data.stats || dashboard.stats,
        executives: data.executives || [],
        submittedTasks: data.submittedTasks || [],
        recentActivity: data.recentActivity || [],
        customers: data.customers || [],
        complaints: data.complaints || [],
      });
    } catch (error) {
      setMessage(error.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredExecutives = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      return dashboard.executives;
    }

    return dashboard.executives.filter((employee) =>
      [
        employee.name,
        employee.employeeId,
        employee.email,
        employee.username,
        employee.role,
        employee.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [dashboard.executives, search]);

  const downloadFile = async (task, file) => {
    try {
      setMessage('');
      await salesDashboardApi.downloadTaskFile(
        task.taskId,
        file.type,
        file.name
      );
    } catch (error) {
      setMessage(error.message || 'Unable to download file.');
    }
  };

  const approveTask = async (task) => {
    try {
      setMessage('');

      await salesDashboardApi.reviewTask(task.taskId, 'approve');
      await loadDashboard();

      setMessage('Task approved successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to approve task.');
    }
  };

  return (
    <div>
      <PageHeader
        title={TITLE}
        subtitle={
          'Department dashboard for ' +
          DEPARTMENT +
          ' operations with backend data, task progress, complaints, PDF submissions, and customer activity.'
        }
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
          label="Department Executives"
          value={dashboard.stats.executives}
          icon={FiUsers}
          trend="Active team records"
        />

        <StatCard
          label="Assigned Tasks"
          value={dashboard.stats.assignedTasks}
          icon={FiBriefcase}
          trend={dashboard.stats.completedTasks + ' completed'}
        />

        <StatCard
          label="PDF Updates"
          value={dashboard.stats.submittedTasks}
          icon={FiFileText}
          trend="Updates received"
        />

        <StatCard
          label="Team Progress"
          value={dashboard.stats.overallProgress + '%'}
          icon={FiBarChart2}
          trend="Completed ÷ Assigned"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title={DEPARTMENT + ' Executives'}
          subtitle="Real-time executive progress based on completed tasks divided by assigned tasks."
          action={
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
              <FiSearch className="text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-44 bg-transparent text-sm font-bold outline-none"
                placeholder="Search team"
              />
            </div>
          }
        >
          <div className="space-y-4">
            {filteredExecutives.map((employee) => (
              <div
                key={employee.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] font-black text-white">
                      {(employee.name || 'E').slice(0, 1)}
                    </div>

                    <div>
                      <p className="font-black text-slate-900">
                        {employee.name}
                      </p>

                      <p className="text-xs font-bold text-slate-500">
                        {employee.employeeId || employee.id} · {employee.role}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={employee.status || 'Active'} />
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-sm font-black">
                    <span>
                      {employee.completedTasks}/{employee.totalTasks} tasks
                      completed
                    </span>

                    <span>{employee.progressPercent}%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#12B76A]"
                      style={{ width: employee.progressPercent + '%' }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {filteredExecutives.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                No executives found for this department.
              </p>
            )}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Task Updates"
            subtitle="PDF updates submitted by executives."
          >
            <div className="space-y-3">
              {dashboard.submittedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">
                        {task.title}
                      </p>

                      <p className="text-xs font-bold text-slate-500">
                        {task.assignee} · {task.id}
                      </p>
                    </div>

                    <StatusBadge status={task.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.updatePdf && (
                      <PrimaryButton
                        variant="outline"
                        className="py-2"
                        onClick={() => downloadFile(task, task.updatePdf)}
                      >
                        Update PDF
                      </PrimaryButton>
                    )}

                    {task.completionPdf && (
                      <PrimaryButton
                        variant="outline"
                        className="py-2"
                        onClick={() =>
                          downloadFile(task, task.completionPdf)
                        }
                      >
                        Completion PDF
                      </PrimaryButton>
                    )}

                    {task.status === 'Completed' && (
                      <PrimaryButton
                        variant="green"
                        className="py-2"
                        onClick={() => approveTask(task)}
                      >
                        <FiCheckCircle /> Approve
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              ))}

              {dashboard.submittedTasks.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No submitted task updates yet.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Department Activity"
            subtitle="Bookings, leads, complaints, and task activity."
          >
            <div className="space-y-3">
              {dashboard.recentActivity.map((item) => (
                <div
                  key={item.type + item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-black text-slate-900">
                      {item.title}
                    </p>

                    <p className="text-xs font-bold text-slate-500">
                      {item.type} · {item.subtitle || 'No details'}
                    </p>
                  </div>

                  <StatusBadge status={item.status || 'New'} />
                </div>
              ))}

              {dashboard.recentActivity.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No activity found.
                </p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Bookings & Leads"
          subtitle="Customer enquiries connected to this department."
        >
          <div className="table-wrap">
            <table className="min-w-[780px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Source</th>
                  <th className="py-3 pr-4">Contact</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.customers.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700"
                  >
                    <td className="py-3 pr-4">
                      {item.customer || 'Customer'}
                    </td>

                    <td className="py-3 pr-4">
                      {item.source || 'Booking'}
                    </td>

                    <td className="py-3 pr-4">
                      {item.phone || item.email || '-'}
                    </td>

                    <td className="py-3 pr-4">
                      <StatusBadge status={item.status || 'New'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Executive Complaints"
          subtitle="Complaints raised by department executives."
        >
          <div className="space-y-3">
            {dashboard.complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">
                      {complaint.subject}
                    </p>

                    <p className="text-xs font-bold text-slate-500">
                      {complaint.employeeName} · {complaint.employeeId}
                    </p>
                  </div>

                  <StatusBadge status={complaint.status} />
                </div>
              </div>
            ))}

            {dashboard.complaints.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                No complaints found.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}