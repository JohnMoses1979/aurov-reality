

import { useEffect, useMemo, useState } from 'react';
import {
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiHome,
  FiMessageSquare,
  FiUsers,
} from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import StatCard from '../../components/ui/StatCard.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { dashboardApi } from '../../services/api.js';

const TITLE = 'Operational Head Dashboard';

const PROPERTY_COLORS = ['#12B76A', '#F59E0B', '#EF4444', '#64748B'];

function formatCurrency(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return 'Rs 0';
  }

  if (amount >= 100000) {
    return `Rs ${Math.round(amount / 100000)}L`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(status) {
  if (!status) {
    return 'Submitted';
  }

  return String(status)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 10);
}

export default function MdDashboard() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [dashboard, setDashboard] = useState(null);
  const [salesTaskUpdates, setSalesTaskUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await dashboardApi.getManagingDirectorDashboard(selectedDate);
      setDashboard(data);
      setSalesTaskUpdates(Array.isArray(data.salesTaskUpdates) ? data.salesTaskUpdates : []);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedDate]);

  const summary = dashboard?.summary || {};

  const propertyStatus = useMemo(
    () => dashboard?.propertyStatus || [],
    [dashboard]
  );

  const propertyStatusTotal = propertyStatus.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const bookingOverview = dashboard?.bookingOverview || [];

  const calendar = dashboard?.calendar || {
    submitted: [],
    bookings: [],
    siteVisits: [],
    demoRequests: [],
    complaints: [],
  };

  const submittedWorks = dashboard?.latestSubmittedWorks || [];
  const taskUpdates = salesTaskUpdates.slice(0, 8);

  if (loading && !dashboard) {
    return (
      <div>
        <PageHeader
          title={TITLE}
          subtitle="Loading real backend dashboard data..."
        />

        <div className="rounded-3xl bg-white p-6 text-sm font-black text-slate-500 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={TITLE}
        subtitle="Centralized dashboard using real backend data from ventures, properties, employees, bookings, complaints, and manager submissions."
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventures"
          value={summary.ventures || 0}
          icon={FiHome}
          trend="Created projects"
        />
        <StatCard
          label="Properties"
          value={summary.properties || 0}
          icon={FiBriefcase}
          trend="Plots, flats, villas"
        />
        <StatCard
          label="Employees"
          value={summary.employees || 0}
          icon={FiUsers}
          trend="Managers and executives"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(summary.revenue)}
          icon={FiBarChart2}
          trend={`${summary.salesCount || 0} sold properties`}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Submitted Works"
          value={summary.submittedWorks || 0}
          icon={FiFileText}
          trend="From managers"
        />
        <StatCard
          label="Pending Reviews"
          value={summary.pendingReviews || 0}
          icon={FiCalendar}
          trend="Submitted / reviewed"
        />
        <StatCard
          label="Approved Works"
          value={summary.approvedWorks || 0}
          icon={FiCheckCircle}
          trend="Approved by leadership"
        />
        <StatCard
          label="Rejected Works"
          value={summary.rejectedWorks || 0}
          icon={FiMessageSquare}
          trend="Rejected submissions"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Bookings Overview"
          subtitle="Graph calculated from demo bookings, reservations, purchases, and site visits."
        >
          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingOverview}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fontWeight: 700 }}
                  stroke="#64748B"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fontWeight: 700 }}
                  stroke="#64748B"
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    fontWeight: 700,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 800 }} />
                <Bar
                  dataKey="demoBookings"
                  name="Demo"
                  fill="#1E5EFF"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="reservations"
                  name="Reservations"
                  fill="#F59E0B"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="purchases"
                  name="Purchases"
                  fill="#0B7A8F"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="siteVisits"
                  name="Site Visits"
                  fill="#12B76A"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Property Status"
          subtitle="Calculated from actual backend properties."
        >
          <div className="h-64">
            {propertyStatusTotal > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                  >
                    {propertyStatus.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PROPERTY_COLORS[index % PROPERTY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-3xl bg-slate-50 text-sm font-black text-slate-400">
                No properties created yet
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm font-black">
            {propertyStatus.map((item) => (
              <span key={item.name}>
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Calendar View"
          subtitle="Select date to view daily activity."
        >
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
          />

          <div className="space-y-3">
            <div className="rounded-2xl bg-blue-50 p-3 font-black text-[#0B3D91]">
              {calendar.demoRequests?.length || 0} Demo Requests
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 font-black text-emerald-700">
              {calendar.bookings?.length || 0} Property Bookings
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 font-black text-indigo-700">
              {calendar.submitted?.length || 0} Submitted Works
            </div>
            <div className="rounded-2xl bg-red-50 p-3 font-black text-red-700">
              {calendar.complaints?.length || 0} Complaints
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 font-black text-amber-700">
              {calendar.siteVisits?.length || 0} Site Visits
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Submitted Work Review"
          subtitle="Latest manager submissions visible to MD and OH."
        >
          <div className="table-wrap">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Submission</th>
                  <th className="py-4 pr-4">Manager</th>
                  <th className="py-4 pr-4">Department</th>
                  <th className="py-4 pr-4">Date</th>
                  <th className="py-4 pr-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {submittedWorks.slice(0, 8).map((work) => (
                  <tr
                    key={work.id}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-black text-slate-900">{work.title}</p>
                      <p className="text-xs text-slate-500">
                        WORK-{work.id}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      {work.managerName}
                      <br />
                      <span className="text-xs text-slate-500">
                        {work.employeeId}
                      </span>
                    </td>
                    <td className="py-4 pr-4">{work.department}</td>
                    <td className="py-4 pr-4">
                      {formatDate(work.submissionDate || work.createdAt)}
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={formatStatus(work.status)} />
                    </td>
                  </tr>
                ))}

                {submittedWorks.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="rounded-2xl bg-slate-50 p-5 text-sm font-black text-slate-500"
                    >
                      No submitted work found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Sales Task Updates"
          subtitle="Updates from tasks assigned in Sales now visible to MD and OH."
        >
          <div className="table-wrap">
            <table className="min-w-[960px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Task</th>
                  <th className="py-4 pr-4">Executive</th>
                  <th className="py-4 pr-4">Update PDF</th>
                  <th className="py-4 pr-4">Completion PDF</th>
                  <th className="py-4 pr-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {taskUpdates.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-black text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.id}</p>
                    </td>

                    <td className="py-4 pr-4">
                      {task.assignee}
                      <br />
                      <span className="text-xs text-slate-500">{task.assigneeEmployeeId}</span>
                    </td>

                    <td className="py-4 pr-4">
                      {task.updatePdf ? (
                        <PrimaryButton
                          variant="outline"
                          className="py-2"
                          onClick={() =>
                            dashboardApi.downloadLeadershipSalesTaskFile(
                              task.taskId,
                              task.updatePdf.type,
                              task.updatePdf.name
                            )
                          }
                        >
                          Update PDF
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
                            dashboardApi.downloadLeadershipSalesTaskFile(
                              task.taskId,
                              task.completionPdf.type,
                              task.completionPdf.name
                            )
                          }
                        >
                          Completion PDF
                        </PrimaryButton>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}

                {taskUpdates.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="rounded-2xl bg-slate-50 p-5 text-sm font-black text-slate-500"
                    >
                      No sales task updates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}





