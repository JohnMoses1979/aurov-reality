import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import BookingsChart from '../charts/BookingsChart.js';
import SalesChart from '../charts/SalesChart.js';
import PropertyStatusChart from '../charts/PropertyStatusChart.js';
import StatusBadge from '../ui/StatusBadge.js';
import StatCard from '../ui/StatCard.js';
import { FiBriefcase, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { isExecutiveRole } from '../../constants/roles.js';

const completedStatuses = ['Completed', 'Approved', 'Closed'];

function sameAssignee(task, employee = {}) {
  const keys = [employee.id, employee.employeeId, employee.username, employee.email, employee.name]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase());
  return [task.assigneeId, task.assigneeEmployeeId, task.assigneeUsername, task.assigneeEmail, task.assignee]
    .filter(Boolean)
    .some((item) => keys.includes(String(item).toLowerCase()));
}

function progressFor(employee, tasks = []) {
  const assigned = tasks.filter((task) => sameAssignee(task, employee));
  const completed = assigned.filter((task) => completedStatuses.includes(task.status));
  return {
    total: assigned.length,
    completed: completed.length,
    percent: assigned.length ? Math.round((completed.length / assigned.length) * 100) : 0,
  };
}

export default function Reports() {
  const { user } = useAuth();
  const app = useAppData();
  const data = app.getRoleData(user?.role || '', user);
  const submittedWorks = data.submittedWorks || [];
  const executives = data.employees.filter((employee) => isExecutiveRole(employee.role));
  const completedTasks = data.tasks.filter((task) => completedStatuses.includes(task.status));
  const overall = data.tasks.length ? Math.round((completedTasks.length / data.tasks.length) * 100) : 0;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Management reporting dashboard powered by Local Storage. Team progress uses actual task formula: Completed Tasks ÷ Total Assigned Tasks × 100." />
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Bookings Report"><BookingsChart /></SectionCard>
        <SectionCard title="Sales Report"><SalesChart /></SectionCard>
        <SectionCard title="Property Report"><PropertyStatusChart /></SectionCard>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Tasks" value={data.tasks.length} icon={FiBriefcase} trend="Assigned work" />
        <StatCard label="Completed Tasks" value={completedTasks.length} icon={FiCheckCircle} trend="Completed / approved / closed" />
        <StatCard label="Overall Progress" value={`${overall}%`} icon={FiRefreshCw} trend="Actual formula" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard title="Team Progress" subtitle="Completed Tasks ÷ Total Assigned Tasks × 100">
          <div className="space-y-4">
            {executives.map((employee) => {
              const progress = progressFor(employee, data.tasks);
              return (
                <div key={employee.id}>
                  <div className="mb-2 flex justify-between gap-3 text-sm font-bold text-slate-700"><span>{employee.name} <span className="text-xs text-slate-400">{employee.employeeId || employee.id}</span></span><span>{progress.percent}%</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#12B76A]" style={{ width: `${progress.percent}%` }} /></div>
                  <p className="mt-1 text-xs font-bold text-slate-500">{progress.completed} completed of {progress.total} assigned tasks</p>
                </div>
              );
            })}
            {executives.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No executives found for this report.</p>}
          </div>
        </SectionCard>
        <SectionCard title="Submitted Work Review Status" subtitle="Manager work submissions sent to MD/OH">
          <div className="space-y-3">
            {submittedWorks.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div><p className="font-black text-slate-900">{item.title}</p><p className="text-xs font-bold text-slate-500">{item.id} · {item.managerName} · {item.department}</p></div>
                <StatusBadge status={item.status} />
              </div>
            ))}
            {submittedWorks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No submitted work records yet.</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
