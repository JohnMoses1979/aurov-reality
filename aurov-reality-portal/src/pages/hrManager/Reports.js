import { useMemo } from 'react';
import { FiBarChart2, FiBriefcase, FiCheckCircle, FiUsers } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import StatCard from '../../components/ui/StatCard.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { useAppData } from '../../context/AppDataContext.js';
import { isExecutiveRole } from '../../constants/roles.js';

const ROLE = 'HR Manager';
const DEPARTMENT = 'HR';
const TITLE = 'HR Reports';
const completedStatuses = ['Completed', 'Approved', 'Closed'];

function taskBelongsTo(task, employee = {}) {
  const keys = [employee.id, employee.employeeId, employee.username, employee.email, employee.name].filter(Boolean).map((item) => String(item).toLowerCase());
  return [task.assigneeId, task.assigneeEmployeeId, task.assigneeUsername, task.assigneeEmail, task.assignee]
    .filter(Boolean)
    .some((item) => keys.includes(String(item).toLowerCase()));
}

function progressFor(employee, tasks) {
  const assigned = tasks.filter((task) => taskBelongsTo(task, employee));
  const completed = assigned.filter((task) => completedStatuses.includes(task.status));
  return { assigned: assigned.length, completed: completed.length, percent: assigned.length ? Math.round((completed.length / assigned.length) * 100) : 0 };
}

export default function HrManagerReports() {
  const app = useAppData();
  const executives = useMemo(() => (app.employees || []).filter((employee) => employee.department === DEPARTMENT && isExecutiveRole(employee.role)), [app.employees]);
  const tasks = useMemo(() => (app.tasks || []).filter((task) => task.department === DEPARTMENT || task.assignedBy === ROLE), [app.tasks]);
  const completed = tasks.filter((task) => completedStatuses.includes(task.status));
  const overall = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  return (
    <div>
      <PageHeader title={TITLE} subtitle="Real task-based reports. Team Progress = Completed Tasks ÷ Total Assigned Tasks × 100." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Executives" value={executives.length} icon={FiUsers} trend={DEPARTMENT + ' department'} />
        <StatCard label="Assigned Tasks" value={tasks.length} icon={FiBriefcase} trend="Total PDF tasks" />
        <StatCard label="Completed Tasks" value={completed.length} icon={FiCheckCircle} trend="Completed / approved / closed" />
        <StatCard label="Overall Progress" value={overall + '%'} icon={FiBarChart2} trend="Completed ÷ Assigned" />
      </div>

      <SectionCard title="Executive Progress" subtitle="Calculated from actual assigned and completed tasks." className="mt-6">
        <div className="space-y-4">
          {executives.map((employee) => {
            const progress = progressFor(employee, tasks);
            return (
              <div key={employee.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-900">{employee.name}</p>
                    <p className="text-xs font-bold text-slate-500">{employee.employeeId || employee.id} · {employee.role}</p>
                  </div>
                  <StatusBadge status={employee.status || 'Active'} />
                </div>
                <div className="mb-2 flex justify-between text-sm font-black">
                  <span>{progress.completed}/{progress.assigned} tasks completed</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#12B76A]" style={{ width: progress.percent + '%' }} />
                </div>
              </div>
            );
          })}
          {executives.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No executives found.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Task Status Report" subtitle="All department tasks." className="mt-6">
        <div className="table-wrap">
          <table className="min-w-[850px] w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 pr-4">Task</th>
                <th className="py-4 pr-4">Executive</th>
                <th className="py-4 pr-4">PDF</th>
                <th className="py-4 pr-4">Status</th>
                <th className="py-4 pr-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                  <td className="py-4 pr-4">{task.title}<br /><span className="text-xs text-slate-500">{task.id}</span></td>
                  <td className="py-4 pr-4">{task.assignee}<br /><span className="text-xs text-slate-500">{task.assigneeEmployeeId}</span></td>
                  <td className="py-4 pr-4">{task.pdfName || '-'}</td>
                  <td className="py-4 pr-4"><StatusBadge status={task.status} /></td>
                  <td className="py-4 pr-4">{task.updatedAt || task.createdAt || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
