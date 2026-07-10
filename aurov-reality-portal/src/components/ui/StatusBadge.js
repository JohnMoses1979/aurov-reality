const statusStyles = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Reserved: 'bg-amber-50 text-amber-700 ring-amber-200',
  Sold: 'bg-red-50 text-red-700 ring-red-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  Submitted: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
  Reviewed: 'bg-blue-50 text-blue-700 ring-blue-200',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Escalated: 'bg-purple-50 text-purple-700 ring-purple-200',
  Closed: 'bg-slate-100 text-slate-700 ring-slate-200',
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Open: 'bg-red-50 text-red-700 ring-red-200',
  'In Review': 'bg-blue-50 text-blue-700 ring-blue-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Payment Due': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Site Visit': 'bg-blue-50 text-blue-700 ring-blue-200',
  Negotiation: 'bg-purple-50 text-purple-700 ring-purple-200',
  Booked: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Visit Scheduled': 'bg-blue-50 text-blue-700 ring-blue-200',
  'New Lead': 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  New: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  Contacted: 'bg-blue-50 text-blue-700 ring-blue-200',
  'Follow-up': 'bg-purple-50 text-purple-700 ring-purple-200',
  'Site Visit Scheduled': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Converted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  Archived: 'bg-slate-100 text-slate-700 ring-slate-200',
  Reservation: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  High: 'bg-red-50 text-red-700 ring-red-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${statusStyles[status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {status}
    </span>
  );
}
