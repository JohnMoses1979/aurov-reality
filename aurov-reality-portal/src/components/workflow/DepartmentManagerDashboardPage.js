import { useEffect, useMemo, useState } from 'react';
import {
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiFileText,
  FiSearch,
  FiUsers,
} from 'react-icons/fi';

import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import StatCard from '../ui/StatCard.js';
import StatusBadge from '../ui/StatusBadge.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import { departmentManagerWorkflowApi } from '../../services/api.js';

export default function DepartmentManagerDashboardPage({ managerKey, department, title }) {
  const workflowApi = departmentManagerWorkflowApi[managerKey];
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
    complaints: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage('');

      const data = await workflowApi.getDashboard();
      setDashboard({
        stats: data?.stats || {
          executives: 0,
          assignedTasks: 0,
          submittedTasks: 0,
          completedTasks: 0,
          overallProgress: 0,
        },
        executives: Array.isArray(data?.executives) ? data.executives : [],
        submittedTasks: Array.isArray(data?.submittedTasks) ? data.submittedTasks : [],
        recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity : [],
        complaints: Array.isArray(data?.complaints) ? data.complaints : [],
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
      await workflowApi.downloadDashboardTaskFile(task.taskId, file.type, file.name);
    } catch (error) {
      setMessage(error.message || 'Unable to download file.');
    }
  };

  const approveTask = async (task) => {
    try {
      setMessage('');
      await workflowApi.reviewDashboardTask(task.taskId, 'approve');
      await loadDashboard();
      setMessage('Task approved successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to approve task.');
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={
          'Department dashboard for ' +
          department +
          ' operations with backend task progress, complaints, PDF submissions, and department activity.'
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
        <StatCard label="Department Executives" value={dashboard.stats.executives} icon={FiUsers} trend="Active team records" />
        <StatCard label="Assigned Tasks" value={dashboard.stats.assignedTasks} icon={FiBriefcase} trend={dashboard.stats.completedTasks + ' completed'} />
        <StatCard label="PDF Updates" value={dashboard.stats.submittedTasks} icon={FiFileText} trend="Updates received" />
        <StatCard label="Team Progress" value={dashboard.stats.overallProgress + '%'} icon={FiBarChart2} trend="Completed / Assigned" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title={department + ' Executives'}
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
              <div key={employee.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] font-black text-white">
                      {(employee.name || 'E').slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{employee.name}</p>
                      <p className="text-xs font-bold text-slate-500">{employee.employeeId || employee.id} � {employee.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={employee.status || 'Active'} />
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-sm font-black">
                    <span>{employee.completedTasks}/{employee.totalTasks} tasks completed</span>
                    <span>{employee.progressPercent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#12B76A]" style={{ width: employee.progressPercent + '%' }} />
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
          <SectionCard title="Task Updates" subtitle="Task updates and submitted PDFs from executives.">
            <div className="space-y-3">
              {dashboard.submittedTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">{task.title}</p>
                      <p className="text-xs font-bold text-slate-500">{task.assignee} � {task.id}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.updatePdf && (
                      <PrimaryButton variant="outline" className="py-2" onClick={() => downloadFile(task, task.updatePdf)}>
                        Update PDF
                      </PrimaryButton>
                    )}
                    {task.completionPdf && (
                      <PrimaryButton variant="outline" className="py-2" onClick={() => downloadFile(task, task.completionPdf)}>
                        Completion PDF
                      </PrimaryButton>
                    )}
                    {task.status === 'Completed' && (
                      <PrimaryButton variant="green" className="py-2" onClick={() => approveTask(task)}>
                        <FiCheckCircle /> Approve
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              ))}

              {dashboard.submittedTasks.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No task updates found yet.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Department Activity" subtitle="Complaints and task activity.">
            <div className="space-y-3">
              {dashboard.recentActivity.map((item) => (
                <div key={item.type + item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                  <div>
                    <p className="font-black text-slate-900">{item.title}</p>
                    <p className="text-xs font-bold text-slate-500">{item.type} � {item.subtitle || 'No details'}</p>
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

      <div className="mt-6">
        <SectionCard title="Executive Complaints" subtitle="Complaints raised by department executives.">
          <div className="space-y-3">
            {dashboard.complaints.slice(0, 7).map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{complaint.subject}</p>
                    <p className="text-xs font-bold text-slate-500">{complaint.employeeName || complaint.from} � {complaint.employeeId || complaint.fromEmployeeId}</p>
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
