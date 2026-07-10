import { useMemo, useRef, useState } from 'react';
import { FiCalendar, FiCheckCircle, FiDownload, FiEye, FiFileText, FiFilter, FiSearch, FiSend, FiUploadCloud, FiXCircle } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import StatusBadge from '../ui/StatusBadge.js';
import StatCard from '../ui/StatCard.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { getRoleDepartment, isSuperRole } from '../../constants/roles.js';

const departments = ['Sales', 'Marketing', 'CRM', 'Accounts', 'HR'];
const statuses = ['Submitted', 'Reviewed', 'Approved', 'Rejected'];

function dateInputValue(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) return String(value).slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
}

function includesText(work, query) {
  if (!query) return true;
  return [work.id, work.managerName, work.employeeId, work.department, work.title, work.description, work.status]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(query.toLowerCase());
}

function sameDate(value, dateKey) {
  if (!dateKey) return true;
  return dateInputValue(value) === dateKey;
}

function CalendarActivityList({ title, items, render }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-black text-slate-900">{title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map(render)}
        {items.length === 0 && <p className="text-sm font-bold text-slate-500">No records.</p>}
      </div>
    </div>
  );
}

export function ManagerSubmitWorkPanel() {
  const { user } = useAuth();
  const app = useAppData();
  const role = user?.role || '';
  const department = user?.department || getRoleDepartment(role);
  const data = app.getRoleData(role, user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    submissionDate: new Date().toISOString().slice(0, 10),
    department,
  });

  const mySubmissions = data.submittedWorks || [];
  const submitted = mySubmissions.filter((item) => item.status === 'Submitted').length;
  const approved = mySubmissions.filter((item) => item.status === 'Approved').length;
  const rejected = mySubmissions.filter((item) => item.status === 'Rejected').length;

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!form.title.trim() || !form.description.trim() || !form.department || !form.submissionDate) {
      setMessage('Please fill Work Title, Description, Submission Date, Department, and select one PDF file. The grey text inside fields is only a placeholder, not entered data.');
      return;
    }
    if (!file) {
      setMessage('Please upload a PDF file before submitting work.');
      return;
    }
    setSubmitting(true);
    try {
      await app.submitManagerWork({ ...form, managerRole: role }, file, { ...(user || {}), role, department, name: user?.name || role });
      setMessage('Work submitted successfully to Managing Director and Operational Head.');
      setForm({ title: '', description: '', submissionDate: new Date().toISOString().slice(0, 10), department });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (error) {
      setMessage(error.message || 'Unable to submit work.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf' && !/\.pdf$/i.test(selected.name)) {
      setMessage('Only PDF files are allowed.');
      event.target.value = '';
      return;
    }
    setFile(selected);
  };

  return (
    <div>
      <PageHeader title="Submit Work to MD/OH" subtitle="Submit completed department work with PDF attachment. Records are saved in Local Storage and instantly visible to MD and Operational Head." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Submitted Works" value={mySubmissions.length} icon={FiFileText} trend="My department submissions" />
        <StatCard label="Pending Reviews" value={submitted} icon={FiFilter} trend="Awaiting review" />
        <StatCard label="Approved Works" value={approved} icon={FiCheckCircle} trend="Approved by leadership" />
        <StatCard label="Rejected Works" value={rejected} icon={FiXCircle} trend="Needs correction" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <SectionCard title="Submit Completed Work" subtitle="Upload one PDF and submit work details to leadership.">
          {message && <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">{message}</div>}
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Work Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Monthly sales closure report" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Description</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="5" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Explain completed work, outcomes, and next steps" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">Submission Date</span>
                <input type="date" value={form.submissionDate} onChange={(e) => setForm({ ...form, submissionDate: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">Department</span>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]">
                  {departments.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={selectFile} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-between gap-3 rounded-3xl border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4 text-left transition hover:border-[#0B7A8F]">
              <div>
                <p className="font-black text-slate-900">PDF Attachment</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{file ? file.name : 'Click to choose PDF file'}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B3D91] text-white"><FiUploadCloud /></span>
            </button>

            <PrimaryButton type="submit" variant="green" disabled={submitting}><FiSend /> {submitting ? 'Submitting...' : 'Submit Work'}</PrimaryButton>
          </form>
        </SectionCard>

        <SectionCard title="My Submitted Work History" subtitle="Status updates from Managing Director and Operational Head.">
          <div className="table-wrap">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Submission ID</th>
                  <th className="py-4 pr-4">Title</th>
                  <th className="py-4 pr-4">Department</th>
                  <th className="py-4 pr-4">Date</th>
                  <th className="py-4 pr-4">Status</th>
                  <th className="py-4 pr-4">PDF</th>
                  <th className="py-4 pr-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top">
                    <td className="py-4 pr-4 font-black text-[#0B3D91]">{item.id}</td>
                    <td className="py-4 pr-4"><p className="font-black text-slate-900">{item.title}</p><p className="max-w-[260px] truncate text-xs text-slate-500">{item.description}</p></td>
                    <td className="py-4 pr-4">{item.department}</td>
                    <td className="py-4 pr-4">{item.submissionDate}</td>
                    <td className="py-4 pr-4"><StatusBadge status={item.status} /></td>
                    <td className="py-4 pr-4">{item.pdf ? <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(item.pdf, item.pdf.name)}><FiDownload /> Download</PrimaryButton> : '-'}</td>
                    <td className="py-4 pr-4"><p className="max-w-[240px] text-xs leading-5 text-slate-500">{item.remarks || '-'}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mySubmissions.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No work submissions yet.</p>}
        </SectionCard>
      </div>
    </div>
  );
}

export function LeadershipSubmittedWorkPanel() {
  const { user } = useAuth();
  const app = useAppData();
  const role = user?.role || '';
  const works = isSuperRole(role) ? app.submittedWorks : app.getRoleData(role, user).submittedWorks;
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [managerFilter, setManagerFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [remarks, setRemarks] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const managers = useMemo(() => ['All', ...Array.from(new Set(works.map((item) => item.managerName).filter(Boolean)))], [works]);

  const summary = useMemo(() => ({
    total: works.length,
    pending: works.filter((item) => ['Submitted', 'Reviewed'].includes(item.status)).length,
    approved: works.filter((item) => item.status === 'Approved').length,
    rejected: works.filter((item) => item.status === 'Rejected').length,
  }), [works]);

  const filteredWorks = useMemo(() => works.filter((item) => {
    if (departmentFilter !== 'All' && item.department !== departmentFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (managerFilter !== 'All' && item.managerName !== managerFilter) return false;
    if (dateFilter && !sameDate(item.submissionIso || item.submissionDate || item.createdIso, dateFilter)) return false;
    return includesText(item, search);
  }), [works, departmentFilter, statusFilter, managerFilter, dateFilter, search]);

  const activities = app.getCalendarActivities(selectedDate);
  const activityTotals = [
    { label: 'Demo Requests', count: activities.demoRequests.length },
    { label: 'Property Bookings', count: activities.bookings.filter((item) => item.type === 'Reservation' || item.type === 'Purchase').length },
    { label: 'Submitted Works', count: activities.submitted.length },
    { label: 'Complaints', count: activities.complaints.length },
  ];

  const review = (item, status) => {
    app.reviewSubmittedWork(item.id, status, remarks[item.id] || '', user);
    setRemarks((old) => ({ ...old, [item.id]: '' }));
  };

  return (
    <div>
      <PageHeader title="Submitted Work" subtitle="Review manager-submitted PDF work, approve or reject submissions, and monitor daily operational activities." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Submitted Works" value={summary.total} icon={FiFileText} trend="All manager submissions" />
        <StatCard label="Pending Reviews" value={summary.pending} icon={FiFilter} trend="Submitted / reviewed" />
        <StatCard label="Approved Works" value={summary.approved} icon={FiCheckCircle} trend="Approved submissions" />
        <StatCard label="Rejected Works" value={summary.rejected} icon={FiXCircle} trend="Rejected submissions" />
      </div>

      <SectionCard title="Submitted Work Review" subtitle="Filter by department, status, manager, date, or search by submission ID / manager / employee ID." className="mt-6">
        <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-black outline-none"><option>All</option>{departments.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-black outline-none"><option>All</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-black outline-none">{managers.map((item) => <option key={item}>{item}</option>)}</select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-black outline-none" />
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 xl:col-span-2"><FiSearch className="text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Search Submission ID, Manager, Employee ID..." /></label>
        </div>

        <div className="table-wrap">
          <table className="min-w-[1280px] w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 pr-4">Submission ID</th>
                <th className="py-4 pr-4">Manager Name</th>
                <th className="py-4 pr-4">Employee ID</th>
                <th className="py-4 pr-4">Department</th>
                <th className="py-4 pr-4">Work Title</th>
                <th className="py-4 pr-4">Description</th>
                <th className="py-4 pr-4">PDF Attachment</th>
                <th className="py-4 pr-4">Submission Date</th>
                <th className="py-4 pr-4">Status</th>
                <th className="py-4 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorks.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top">
                  <td className="py-4 pr-4 font-black text-[#0B3D91]">{item.id}</td>
                  <td className="py-4 pr-4"><p className="font-black text-slate-900">{item.managerName}</p><p className="text-xs text-slate-500">{item.managerRole}</p></td>
                  <td className="py-4 pr-4">{item.employeeId || '-'}</td>
                  <td className="py-4 pr-4">{item.department}</td>
                  <td className="py-4 pr-4"><p className="max-w-[220px] font-black text-slate-900">{item.title}</p></td>
                  <td className="py-4 pr-4"><p className="max-w-[260px] leading-5 text-slate-500">{item.description}</p></td>
                  <td className="py-4 pr-4"><div className="flex flex-wrap gap-2">{item.pdf && <PrimaryButton variant="outline" className="py-2" onClick={() => app.previewFile(item.pdf)}><FiEye /> View</PrimaryButton>}{item.pdf && <PrimaryButton variant="outline" className="py-2" onClick={() => app.downloadFile(item.pdf, item.pdf.name)}><FiDownload /> Download</PrimaryButton>}</div></td>
                  <td className="py-4 pr-4">{item.submissionDate}</td>
                  <td className="py-4 pr-4"><StatusBadge status={item.status} /></td>
                  <td className="py-4 pr-4">
                    <div className="space-y-2">
                      <input value={remarks[item.id] || ''} onChange={(e) => setRemarks({ ...remarks, [item.id]: e.target.value })} className="w-full min-w-[220px] rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none" placeholder="Add remarks" />
                      <div className="flex flex-wrap gap-2">
                        <PrimaryButton variant="outline" className="py-2" onClick={() => review(item, 'Reviewed')}>Reviewed</PrimaryButton>
                        <PrimaryButton variant="green" className="py-2" onClick={() => review(item, 'Approved')}>Approve</PrimaryButton>
                        <PrimaryButton variant="danger" className="py-2" onClick={() => review(item, 'Rejected')}>Reject</PrimaryButton>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredWorks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No submitted work records found.</p>}
      </SectionCard>

      <SectionCard title="Calendar View" subtitle="Select a date to view submitted work, bookings, site visits, demo requests, and complaints." className="mt-6">
        <div className="mb-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-3xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] p-5 text-white">
            <p className="text-sm font-bold text-white/75">Selected Date</p>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-3 w-full rounded-2xl border border-white/20 bg-white/15 px-3 py-3 text-sm font-black text-white outline-none [color-scheme:dark]" />
            <div className="mt-5 space-y-2">
              {activityTotals.map((item) => <div key={item.label} className="flex justify-between rounded-2xl bg-white/10 px-3 py-2 text-sm font-black"><span>{item.label}</span><span>{item.count}</span></div>)}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CalendarActivityList title="Submitted Work" items={activities.submitted} render={(item) => <div key={item.id} className="text-sm font-bold text-slate-600"><b>{item.title}</b><br /><span className="text-xs">{item.managerName} · {item.department}</span></div>} />
            <CalendarActivityList title="Bookings" items={activities.bookings} render={(item) => <div key={item.id} className="text-sm font-bold text-slate-600"><b>{item.customer}</b><br /><span className="text-xs">{item.type} · {item.status}</span></div>} />
            <CalendarActivityList title="Site Visits" items={activities.siteVisits} render={(item) => <div key={item.id} className="text-sm font-bold text-slate-600"><b>{item.customer}</b><br /><span className="text-xs">{item.date} {item.timeSlot || ''}</span></div>} />
            <CalendarActivityList title="Demo Requests" items={activities.demoRequests} render={(item) => <div key={item.id} className="text-sm font-bold text-slate-600"><b>{item.name}</b><br /><span className="text-xs">{item.venture}</span></div>} />
            <CalendarActivityList title="Complaints" items={activities.complaints} render={(item) => <div key={item.id} className="text-sm font-bold text-slate-600"><b>{item.subject}</b><br /><span className="text-xs">{item.employeeName || item.from} · {item.department}</span></div>} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
