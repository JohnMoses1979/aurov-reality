// import { useMemo, useRef, useState } from 'react';
// import { FiDownload, FiEye, FiFilter, FiMessageSquare, FiSearch, FiUploadCloud, FiX } from 'react-icons/fi';
// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import StatCard from '../../components/ui/StatCard.js';
// import { useAuth } from '../../context/AuthContext.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { getManagerRoleForDepartment, getRoleDepartment, isExecutiveRole, isManagerRole, isSuperRole } from '../../constants/roles.js';

// const departments = ['Sales', 'Marketing', 'CRM', 'Accounts', 'HR'];
// const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
// const validAttachmentTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

// function normalizeStatus(status = '') {
//   if (status === 'Open') return 'Pending';
//   return status || 'Pending';
// }

// function toDateKey(value) {
//   if (!value) return '';
//   if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) return String(value).slice(0, 10);
//   const parsed = new Date(value);
//   return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
// }

// function matchesDateRange(complaint, fromDate, toDate) {
//   const dateKey = toDateKey(complaint.createdIso || complaint.createdAt || complaint.dateTime);
//   if (!dateKey) return true;
//   if (fromDate && dateKey < fromDate) return false;
//   if (toDate && dateKey > toDate) return false;
//   return true;
// }

// function normalizeComplaintForView(complaint) {
//   return {
//     ...complaint,
//     status: normalizeStatus(complaint.status),
//     employeeId: complaint.employeeId || complaint.fromEmployeeId || '-',
//     employeeName: complaint.employeeName || complaint.from || '-',
//     employeeRole: complaint.employeeRole || complaint.role || '-',
//     createdAt: complaint.createdAt || complaint.dateTime || '-',
//     raisedTo: complaint.targetLabel || complaint.target || (complaint.audience || []).join(', ') || '-',
//     statusHistory: Array.isArray(complaint.statusHistory) && complaint.statusHistory.length
//       ? complaint.statusHistory
//       : [{ status: normalizeStatus(complaint.status), note: 'Complaint created', dateTime: complaint.createdAt || '-' }],
//     attachments: Array.isArray(complaint.attachments) ? complaint.attachments : [],
//   };
// }

// export default function Complaints() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const role = user?.role || '';
//   const department = user?.department || getRoleDepartment(role);
//   const managerRole = getManagerRoleForDepartment(department);
//   const executiveUser = isExecutiveRole(role);
//   const managerUser = isManagerRole(role) && !isSuperRole(role);
//   const leadershipUser = isSuperRole(role);
//   const canRaiseComplaint = !leadershipUser && (managerUser || executiveUser);
//   const canUpdateComplaints = leadershipUser || managerUser;
//   const fileInputRef = useRef(null);

//   const [form, setForm] = useState({
//     target: executiveUser ? 'Manager' : 'Leadership',
//     subject: '',
//     description: '',
//     priority: 'Medium',
//     attachments: [],
//   });
//   const [message, setMessage] = useState('');
//   const [activeDepartment, setActiveDepartment] = useState('All');
//   const [activeStatus, setActiveStatus] = useState('All');
//   const [search, setSearch] = useState('');
//   const [employeeId, setEmployeeId] = useState('');
//   const [employeeName, setEmployeeName] = useState('');
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [selectedComplaint, setSelectedComplaint] = useState(null);
//   const [reviewStatus, setReviewStatus] = useState('In Progress');
//   const [reviewNote, setReviewNote] = useState('');

//   const roleComplaints = app.getRoleData(role, user).complaints.map(normalizeComplaintForView);

//   const targetOptions = useMemo(() => {
//     if (executiveUser) {
//       return [
//         { value: 'Manager', label: `Send to Manager${managerRole ? ` (${managerRole})` : ''}` },
//         { value: 'Leadership', label: 'Send to Operational Head & Managing Director' },
//       ];
//     }
//     if (canRaiseComplaint) return [{ value: 'Leadership', label: 'Send to Operational Head & Managing Director' }];
//     return [];
//   }, [executiveUser, canRaiseComplaint, managerRole]);

//   const summary = useMemo(() => {
//     const all = roleComplaints;
//     const pending = all.filter((item) => item.status === 'Pending').length;
//     const resolved = all.filter((item) => item.status === 'Resolved').length;
//     const escalated = all.filter((item) => item.target === 'Leadership' || (item.audience || []).some((audience) => ['Managing Director', 'Operational Head'].includes(audience))).length;
//     return { total: all.length, pending, resolved, escalated };
//   }, [roleComplaints]);

//   const filteredComplaints = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     const eid = employeeId.trim().toLowerCase();
//     const name = employeeName.trim().toLowerCase();
//     return roleComplaints.filter((complaint) => {
//       if (activeDepartment !== 'All' && complaint.department !== activeDepartment) return false;
//       if (activeStatus !== 'All' && complaint.status !== activeStatus) return false;
//       if (eid && !String(complaint.employeeId || '').toLowerCase().includes(eid)) return false;
//       if (name && !String(complaint.employeeName || '').toLowerCase().includes(name)) return false;
//       if (!matchesDateRange(complaint, fromDate, toDate)) return false;
//       if (!q) return true;
//       return [
//         complaint.id,
//         complaint.employeeId,
//         complaint.employeeName,
//         complaint.department,
//         complaint.employeeRole,
//         complaint.subject,
//         complaint.description,
//         complaint.raisedTo,
//         complaint.status,
//       ].filter(Boolean).join(' ').toLowerCase().includes(q);
//     });
//   }, [roleComplaints, activeDepartment, activeStatus, search, employeeId, employeeName, fromDate, toDate]);

//   const uploadAttachments = async (event) => {
//     const files = Array.from(event.target.files || []);
//     event.target.value = '';
//     if (!files.length) return;
//     const invalid = files.find((file) => !validAttachmentTypes.includes(file.type) && !/\.(pdf|jpe?g|png|webp)$/i.test(file.name));
//     if (invalid) {
//       setMessage('Only PDF, JPG, JPEG, PNG, and WEBP attachments are allowed.');
//       return;
//     }
//     const docs = await Promise.all(files.map((file) => app.fileToData(file)));
//     setForm((old) => ({ ...old, attachments: [...old.attachments, ...docs.filter(Boolean)] }));
//   };

//   const removeAttachment = (id) => {
//     setForm((old) => ({ ...old, attachments: old.attachments.filter((item) => (item.id || item.name) !== id) }));
//   };

//   const raise = (event) => {
//     event.preventDefault();
//     setMessage('');
//     if (!form.subject.trim() || !form.description.trim()) {
//       setMessage('Please enter complaint subject and description.');
//       return;
//     }
//     try {
//       app.raiseComplaint(form, user);
//       setForm({ target: executiveUser ? 'Manager' : 'Leadership', subject: '', description: '', priority: 'Medium', attachments: [] });
//       setMessage('Complaint submitted successfully.');
//     } catch (error) {
//       setMessage(error.message || 'Unable to submit complaint.');
//     }
//   };

//   const openDrawer = (complaint) => {
//     setSelectedComplaint(complaint);
//     setReviewStatus(complaint.status === 'Closed' ? 'Closed' : complaint.status === 'Resolved' ? 'Resolved' : 'In Progress');
//     setReviewNote('');
//   };

//   const updateStatus = (status = reviewStatus, note = reviewNote) => {
//     if (!selectedComplaint) return;
//     app.updateComplaintStatus(selectedComplaint.id, status, note, user);
//     setSelectedComplaint({ ...selectedComplaint, status, remarks: note, resolutionNotes: ['Resolved', 'Closed'].includes(status) ? note : selectedComplaint.resolutionNotes, statusHistory: [{ status, note: note || `${status} by ${role}`, dateTime: new Date().toLocaleString('en-IN') }, ...selectedComplaint.statusHistory] });
//     setReviewNote('');
//   };

//   const clearFilters = () => {
//     setActiveDepartment('All');
//     setActiveStatus('All');
//     setSearch('');
//     setEmployeeId('');
//     setEmployeeName('');
//     setFromDate('');
//     setToDate('');
//   };

//   return (
//     <div>
//       <PageHeader
//         title={leadershipUser ? 'Complaint Management' : executiveUser ? 'My Complaints' : `${department} Complaints`}
//         subtitle={leadershipUser ? 'Department-wise complaint dashboard with filters, status tracking, and resolution workflow.' : canRaiseComplaint ? 'Raise complaints, track status, and review department complaint history.' : 'Complaint records routed through Local Storage.'}
//       />

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard label="Total Complaints" value={summary.total} icon={FiMessageSquare} trend="All visible records" />
//         <StatCard label="Pending Complaints" value={summary.pending} icon={FiFilter} trend="Need review" />
//         <StatCard label="Resolved Complaints" value={summary.resolved} icon={FiEye} trend="Resolved issues" />
//         <StatCard label="Escalated Complaints" value={summary.escalated} icon={FiUploadCloud} trend="Sent to leadership" />
//       </div>

//       <div className={`mt-6 grid gap-6 ${canRaiseComplaint ? 'xl:grid-cols-[420px_minmax(0,1fr)]' : ''}`}>
//         {canRaiseComplaint && (
//           <SectionCard title="Raise Complaint" subtitle={executiveUser ? 'Send to your manager or escalate to MD/OH.' : 'Managers can send complaints directly to leadership.'}>
//             {message && <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">{message}</div>}
//             <form onSubmit={raise} className="space-y-4">
//               <label className="block">
//                 <span className="mb-2 block text-sm font-extrabold text-slate-700">Complaint Routing</span>
//                 <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]">
//                   {targetOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
//                 </select>
//               </label>

//               <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">
//                 <p><b>Employee ID:</b> {user?.employeeId || user?.id || 'Demo Account'}</p>
//                 <p><b>Employee Name:</b> {user?.name || role}</p>
//                 <p><b>Department:</b> {department}</p>
//                 <p><b>Role:</b> {role}</p>
//               </div>

//               <label className="block">
//                 <span className="mb-2 block text-sm font-extrabold text-slate-700">Complaint Subject</span>
//                 <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Short complaint subject" />
//               </label>

//               <label className="block">
//                 <span className="mb-2 block text-sm font-extrabold text-slate-700">Complaint Description</span>
//                 <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="5" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Describe the issue or escalation details" />
//               </label>

//               <label className="block">
//                 <span className="mb-2 block text-sm font-extrabold text-slate-700">Priority</span>
//                 <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option>High</option><option>Medium</option><option>Low</option></select>
//               </label>

//               <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={uploadAttachments} className="hidden" />
//               <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
//                 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                   <div>
//                     <p className="font-black text-slate-900">Attachments</p>
//                     <p className="text-xs font-bold text-slate-500">Optional PDF or image proof files.</p>
//                   </div>
//                   <PrimaryButton type="button" variant="outline" className="py-2" onClick={() => fileInputRef.current?.click()}><FiUploadCloud /> Upload</PrimaryButton>
//                 </div>
//                 {form.attachments.length > 0 && (
//                   <div className="mt-3 flex flex-wrap gap-2">
//                     {form.attachments.map((doc) => (
//                       <span key={doc.id || doc.name} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
//                         {doc.name}
//                         <button type="button" onClick={() => removeAttachment(doc.id || doc.name)} className="text-red-500"><FiX /></button>
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <PrimaryButton type="submit" variant="green"><FiMessageSquare /> Submit Complaint</PrimaryButton>
//             </form>
//           </SectionCard>
//         )}

//         <SectionCard title={leadershipUser ? 'Complaint Dashboard' : executiveUser ? 'My Complaint Status' : `${department} Complaint Records`} subtitle="Use filters, tabs, search, and status actions to manage complaints." className={!canRaiseComplaint ? 'xl:col-span-2' : ''}>
//           <div className="mb-5 space-y-4">
//             {leadershipUser && (
//               <div className="flex flex-wrap gap-2">
//                 {['All', ...departments].map((item) => (
//                   <button key={item} onClick={() => setActiveDepartment(item)} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeDepartment === item ? 'bg-[#0B3D91] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//                     {item === 'All' ? 'All Complaints' : `${item} Department`}
//                   </button>
//                 ))}
//               </div>
//             )}

//             <div className="flex flex-wrap gap-2">
//               {['All', ...statuses].map((item) => (
//                 <button key={item} onClick={() => setActiveStatus(item)} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeStatus === item ? 'bg-[#12B76A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//                   {item === 'All' ? 'All Status' : item}
//                 </button>
//               ))}
//             </div>

//             <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
//               <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 xl:col-span-2"><FiSearch className="text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Search complaint, subject, role..." /></label>
//               <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none" placeholder="Employee ID" />
//               <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none" placeholder="Employee Name" />
//               <button onClick={clearFilters} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-200">Clear</button>
//             </div>
//             <div className="grid gap-3 sm:grid-cols-2">
//               <label className="block"><span className="mb-1 block text-xs font-black uppercase text-slate-500">From Date</span><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none" /></label>
//               <label className="block"><span className="mb-1 block text-xs font-black uppercase text-slate-500">To Date</span><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none" /></label>
//             </div>
//           </div>

//           <div className="table-wrap">
//             <table className="min-w-[1180px] w-full text-left">
//               <thead>
//                 <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
//                   <th className="py-4 pr-4">Complaint ID</th>
//                   <th className="py-4 pr-4">Employee ID</th>
//                   <th className="py-4 pr-4">Employee Name</th>
//                   <th className="py-4 pr-4">Department</th>
//                   <th className="py-4 pr-4">Role</th>
//                   <th className="py-4 pr-4">Complaint Subject</th>
//                   <th className="py-4 pr-4">Raised To</th>
//                   <th className="py-4 pr-4">Status</th>
//                   <th className="py-4 pr-4">Created Date</th>
//                   <th className="py-4 pr-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredComplaints.map((complaint) => (
//                   <tr key={complaint.id} className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top">
//                     <td className="py-4 pr-4 font-black text-[#0B3D91]">{complaint.id}</td>
//                     <td className="py-4 pr-4">{complaint.employeeId}</td>
//                     <td className="py-4 pr-4 font-black text-slate-900">{complaint.employeeName}</td>
//                     <td className="py-4 pr-4">{complaint.department}</td>
//                     <td className="py-4 pr-4">{complaint.employeeRole}</td>
//                     <td className="py-4 pr-4"><p className="max-w-[260px] truncate">{complaint.subject}</p></td>
//                     <td className="py-4 pr-4"><p className="max-w-[220px] truncate">{complaint.raisedTo}</p></td>
//                     <td className="py-4 pr-4"><StatusBadge status={complaint.status} /></td>
//                     <td className="py-4 pr-4">{complaint.createdAt}</td>
//                     <td className="py-4 pr-4">
//                       <div className="flex flex-wrap gap-2">
//                         <PrimaryButton variant="outline" className="py-2" onClick={() => openDrawer(complaint)}><FiEye /> View</PrimaryButton>
//                         {canUpdateComplaints && complaint.status !== 'Closed' && <PrimaryButton variant="outline" className="py-2" onClick={() => { openDrawer(complaint); setReviewStatus('In Progress'); }}>Update</PrimaryButton>}
//                         {canUpdateComplaints && !['Resolved', 'Closed'].includes(complaint.status) && <PrimaryButton variant="green" className="py-2" onClick={() => app.updateComplaintStatus(complaint.id, 'Resolved', 'Resolved from table action', user)}>Resolve</PrimaryButton>}
//                         {canUpdateComplaints && complaint.status !== 'Closed' && <PrimaryButton variant="danger" className="py-2" onClick={() => app.updateComplaintStatus(complaint.id, 'Closed', 'Closed from table action', user)}>Close</PrimaryButton>}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           {filteredComplaints.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No complaint records found for the selected filters.</p>}
//         </SectionCard>
//       </div>

//       {selectedComplaint && (
//         <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
//           <button className="absolute inset-0" onClick={() => setSelectedComplaint(null)} aria-label="Close complaint details" />
//           <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
//             <div className="mb-5 flex items-start justify-between gap-3">
//               <div>
//                 <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">Complaint Details</p>
//                 <h2 className="mt-2 text-2xl font-black text-slate-900">{selectedComplaint.subject}</h2>
//                 <p className="mt-1 text-sm font-bold text-slate-500">{selectedComplaint.id} · {selectedComplaint.createdAt}</p>
//               </div>
//               <button onClick={() => setSelectedComplaint(null)} className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"><FiX /></button>
//             </div>

//             <div className="grid gap-4 sm:grid-cols-2">
//               <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
//                 <h3 className="font-black text-slate-900">Employee Details</h3>
//                 <div className="mt-3 space-y-2 text-sm font-bold text-slate-600">
//                   <p>ID: <span className="text-slate-900">{selectedComplaint.employeeId}</span></p>
//                   <p>Name: <span className="text-slate-900">{selectedComplaint.employeeName}</span></p>
//                   <p>Department: <span className="text-slate-900">{selectedComplaint.department}</span></p>
//                   <p>Role: <span className="text-slate-900">{selectedComplaint.employeeRole}</span></p>
//                 </div>
//               </div>
//               <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
//                 <h3 className="font-black text-slate-900">Complaint Details</h3>
//                 <div className="mt-3 space-y-2 text-sm font-bold text-slate-600">
//                   <p>Raised To: <span className="text-slate-900">{selectedComplaint.raisedTo}</span></p>
//                   <p>Priority: <StatusBadge status={selectedComplaint.priority} /></p>
//                   <p>Status: <StatusBadge status={selectedComplaint.status} /></p>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 rounded-3xl border border-slate-200 p-4">
//               <h3 className="font-black text-slate-900">Description</h3>
//               <p className="mt-2 text-sm font-bold leading-7 text-slate-600">{selectedComplaint.description || 'No description provided.'}</p>
//             </div>

//             <div className="mt-4 rounded-3xl border border-slate-200 p-4">
//               <h3 className="font-black text-slate-900">Attachments</h3>
//               <div className="mt-3 flex flex-wrap gap-2">
//                 {selectedComplaint.attachments.map((doc) => (
//                   <div key={doc.id || doc.name} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
//                     <span>{doc.name}</span>
//                     <button onClick={() => app.previewFile(doc)} className="text-[#0B3D91]"><FiEye /></button>
//                     <button onClick={() => app.downloadFile(doc, doc.name)} className="text-emerald-700"><FiDownload /></button>
//                   </div>
//                 ))}
//                 {selectedComplaint.attachments.length === 0 && <p className="text-sm font-bold text-slate-500">No attachments uploaded.</p>}
//               </div>
//             </div>

//             {canUpdateComplaints && (
//               <div className="mt-4 rounded-3xl border border-slate-200 p-4">
//                 <h3 className="font-black text-slate-900">Update Status</h3>
//                 <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr]">
//                   <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-black outline-none">
//                     {statuses.map((status) => <option key={status}>{status}</option>)}
//                   </select>
//                   <input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none" placeholder="Resolution notes / remarks" />
//                 </div>
//                 <div className="mt-3 flex flex-wrap gap-2">
//                   <PrimaryButton variant="outline" onClick={() => updateStatus(reviewStatus)}>Update Status</PrimaryButton>
//                   <PrimaryButton variant="green" onClick={() => updateStatus('Resolved', reviewNote || 'Resolved')}>Resolve</PrimaryButton>
//                   <PrimaryButton variant="danger" onClick={() => updateStatus('Closed', reviewNote || 'Closed')}>Close</PrimaryButton>
//                 </div>
//               </div>
//             )}

//             <div className="mt-4 rounded-3xl border border-slate-200 p-4">
//               <h3 className="font-black text-slate-900">Status History</h3>
//               <div className="mt-3 space-y-3">
//                 {selectedComplaint.statusHistory.map((entry, index) => (
//                   <div key={`${entry.status}-${entry.dateTime}-${index}`} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
//                     <div className="flex flex-wrap items-center justify-between gap-2"><StatusBadge status={entry.status} /><span className="text-xs text-slate-400">{entry.dateTime}</span></div>
//                     <p className="mt-2">{entry.note || entry.remarks || '-'}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="mt-4 rounded-3xl border border-slate-200 p-4">
//               <h3 className="font-black text-slate-900">Resolution Notes</h3>
//               <p className="mt-2 text-sm font-bold leading-7 text-slate-600">{selectedComplaint.resolutionNotes || selectedComplaint.remarks || 'No resolution notes yet.'}</p>
//             </div>
//           </aside>
//         </div>
//       )}
//     </div>
//   );
// }







import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiDownload,
  FiEye,
  FiFilter,
  FiMessageSquare,
  FiSearch,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';

import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import StatCard from '../../components/ui/StatCard.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  getManagerRoleForDepartment,
  getRoleDepartment,
  isExecutiveRole,
  isManagerRole,
  isSuperRole,
} from '../../constants/roles.js';
import { complaintsApi } from '../../services/api.js';

const departments = ['Sales', 'Marketing', 'CRM', 'Accounts', 'HR'];
const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
const validAttachmentTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

function toDateKey(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
    return String(value).slice(0, 10);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ''
    : parsed.toISOString().slice(0, 10);
}

function matchesDateRange(complaint, fromDate, toDate) {
  const dateKey = toDateKey(
    complaint.createdIso || complaint.createdAt || complaint.dateTime
  );

  if (!dateKey) return true;
  if (fromDate && dateKey < fromDate) return false;
  if (toDate && dateKey > toDate) return false;

  return true;
}

export default function Complaints() {
  const { user } = useAuth();

  const role = user?.role || '';
  const department = user?.department || getRoleDepartment(role);
  const managerRole = getManagerRoleForDepartment(department);

  const executiveUser = isExecutiveRole(role);
  const managerUser = isManagerRole(role) && !isSuperRole(role);
  const leadershipUser = isSuperRole(role);

  const canRaiseComplaint = !leadershipUser && (managerUser || executiveUser);
  const canUpdateComplaints = leadershipUser || managerUser;

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    target: executiveUser ? 'Manager' : 'Leadership',
    subject: '',
    description: '',
    priority: 'Medium',
    attachments: [],
  });

  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [activeDepartment, setActiveDepartment] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('In Progress');
  const [reviewNote, setReviewNote] = useState('');

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setMessage('');

      const data = await complaintsApi.getAll();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || 'Unable to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const targetOptions = useMemo(() => {
    if (executiveUser) {
      return [
        {
          value: 'Manager',
          label: `Send to Manager${managerRole ? ` (${managerRole})` : ''}`,
        },
        {
          value: 'Leadership',
          label: 'Send to Operational Head & Managing Director',
        },
      ];
    }

    if (canRaiseComplaint) {
      return [
        {
          value: 'Leadership',
          label: 'Send to Operational Head & Managing Director',
        },
      ];
    }

    return [];
  }, [executiveUser, canRaiseComplaint, managerRole]);

  const summary = useMemo(() => {
    const pending = complaints.filter((item) => item.status === 'Pending').length;
    const resolved = complaints.filter((item) => item.status === 'Resolved').length;
    const escalated = complaints.filter(
      (item) =>
        item.target === 'LEADERSHIP' ||
        String(item.raisedTo || '').includes('Managing Director') ||
        String(item.raisedTo || '').includes('Operational Head')
    ).length;

    return {
      total: complaints.length,
      pending,
      resolved,
      escalated,
    };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const q = search.trim().toLowerCase();
    const eid = employeeId.trim().toLowerCase();
    const name = employeeName.trim().toLowerCase();

    return complaints.filter((complaint) => {
      if (
        activeDepartment !== 'All' &&
        complaint.department !== activeDepartment
      ) {
        return false;
      }

      if (activeStatus !== 'All' && complaint.status !== activeStatus) {
        return false;
      }

      if (
        eid &&
        !String(complaint.employeeId || '').toLowerCase().includes(eid)
      ) {
        return false;
      }

      if (
        name &&
        !String(complaint.employeeName || '').toLowerCase().includes(name)
      ) {
        return false;
      }

      if (!matchesDateRange(complaint, fromDate, toDate)) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [
        complaint.id,
        complaint.employeeId,
        complaint.employeeName,
        complaint.department,
        complaint.employeeRole,
        complaint.subject,
        complaint.description,
        complaint.raisedTo,
        complaint.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [
    complaints,
    activeDepartment,
    activeStatus,
    search,
    employeeId,
    employeeName,
    fromDate,
    toDate,
  ]);

  const uploadAttachments = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    const invalid = files.find(
      (file) =>
        !validAttachmentTypes.includes(file.type) &&
        !/\.(pdf|jpe?g|png|webp)$/i.test(file.name)
    );

    if (invalid) {
      setMessage('Only PDF, JPG, JPEG, PNG, and WEBP attachments are allowed.');
      return;
    }

    setForm((old) => ({
      ...old,
      attachments: [...old.attachments, ...files],
    }));
  };

  const removeAttachment = (key) => {
    setForm((old) => ({
      ...old,
      attachments: old.attachments.filter(
        (item) => `${item.name}-${item.lastModified}` !== key
      ),
    }));
  };

  const raise = async (event) => {
    event.preventDefault();

    setMessage('');

    if (!form.subject.trim() || !form.description.trim()) {
      setMessage('Please enter complaint subject and description.');
      return;
    }

    try {
      await complaintsApi.raise({
        target: form.target,
        subject: form.subject.trim(),
        description: form.description.trim(),
        priority: form.priority,
        attachments: form.attachments,
      }, user);

      setForm({
        target: executiveUser ? 'Manager' : 'Leadership',
        subject: '',
        description: '',
        priority: 'Medium',
        attachments: [],
      });

      setMessage('Complaint submitted successfully.');
      await loadComplaints();
    } catch (error) {
      setMessage(error.message || 'Unable to submit complaint.');
    }
  };

  const openDrawer = (complaint) => {
    setSelectedComplaint(complaint);

    setReviewStatus(
      complaint.status === 'Closed'
        ? 'Closed'
        : complaint.status === 'Resolved'
          ? 'Resolved'
          : 'In Progress'
    );

    setReviewNote('');
  };

  const updateStatus = async (status = reviewStatus, note = reviewNote) => {
    if (!selectedComplaint) return;

    try {
      const updated = await complaintsApi.updateStatus(
        selectedComplaint.id,
        status,
        note
      );

      setSelectedComplaint(updated);
      setReviewNote('');
      await loadComplaints();
    } catch (error) {
      setMessage(error.message || 'Unable to update complaint status.');
    }
  };

  const quickUpdateStatus = async (complaint, status, note) => {
    try {
      await complaintsApi.updateStatus(complaint.id, status, note);
      await loadComplaints();
    } catch (error) {
      setMessage(error.message || 'Unable to update complaint status.');
    }
  };

  const previewAttachment = async (doc) => {
    if (!selectedComplaint) return;

    try {
      await complaintsApi.previewAttachment(selectedComplaint.id, doc);
    } catch (error) {
      setMessage(error.message || 'Unable to preview attachment.');
    }
  };

  const downloadAttachment = async (doc) => {
    if (!selectedComplaint) return;

    try {
      await complaintsApi.downloadAttachment(selectedComplaint.id, doc);
    } catch (error) {
      setMessage(error.message || 'Unable to download attachment.');
    }
  };

  const clearFilters = () => {
    setActiveDepartment('All');
    setActiveStatus('All');
    setSearch('');
    setEmployeeId('');
    setEmployeeName('');
    setFromDate('');
    setToDate('');
  };

  return (
    <div>
      <PageHeader
        title={
          leadershipUser
            ? 'Complaint Management'
            : executiveUser
              ? 'My Complaints'
              : `${department} Complaints`
        }
        subtitle={
          leadershipUser
            ? 'Department-wise complaint dashboard with filters, status tracking, and resolution workflow.'
            : canRaiseComplaint
              ? 'Raise complaints, track status, and review department complaint history.'
              : 'Complaint records routed through backend database.'
        }
      />

      {message && (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">
          {message}
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
          Loading complaints...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Complaints"
          value={summary.total}
          icon={FiMessageSquare}
          trend="All visible records"
        />

        <StatCard
          label="Pending Complaints"
          value={summary.pending}
          icon={FiFilter}
          trend="Need review"
        />

        <StatCard
          label="Resolved Complaints"
          value={summary.resolved}
          icon={FiEye}
          trend="Resolved issues"
        />

        <StatCard
          label="Escalated Complaints"
          value={summary.escalated}
          icon={FiUploadCloud}
          trend="Sent to leadership"
        />
      </div>

      <div
        className={`mt-6 grid gap-6 ${
          canRaiseComplaint ? 'xl:grid-cols-[420px_minmax(0,1fr)]' : ''
        }`}
      >
        {canRaiseComplaint && (
          <SectionCard
            title="Raise Complaint"
            subtitle={
              executiveUser
                ? 'Send to your manager or escalate to MD/OH.'
                : 'Managers can send complaints directly to leadership.'
            }
          >
            <form onSubmit={raise} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Complaint Routing
                </span>

                <select
                  value={form.target}
                  onChange={(event) =>
                    setForm({ ...form, target: event.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                >
                  {targetOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">
                <p>
                  <b>Employee ID:</b>{' '}
                  {user?.employeeId || user?.id || 'Demo Account'}
                </p>

                <p>
                  <b>Employee Name:</b> {user?.name || role}
                </p>

                <p>
                  <b>Department:</b> {department}
                </p>

                <p>
                  <b>Role:</b> {role}
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Complaint Subject
                </span>

                <input
                  value={form.subject}
                  onChange={(event) =>
                    setForm({ ...form, subject: event.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  placeholder="Short complaint subject"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Complaint Description
                </span>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  rows="5"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  placeholder="Describe the issue or escalation details"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Priority
                </span>

                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm({ ...form, priority: event.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                onChange={uploadAttachments}
                className="hidden"
              />

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-900">Attachments</p>

                    <p className="text-xs font-bold text-slate-500">
                      Optional PDF or image proof files.
                    </p>
                  </div>

                  <PrimaryButton
                    type="button"
                    variant="outline"
                    className="py-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiUploadCloud /> Upload
                  </PrimaryButton>
                </div>

                {form.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.attachments.map((doc) => {
                      const key = `${doc.name}-${doc.lastModified}`;

                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600"
                        >
                          {doc.name}

                          <button
                            type="button"
                            onClick={() => removeAttachment(key)}
                            className="text-red-500"
                          >
                            <FiX />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <PrimaryButton type="submit" variant="green">
                <FiMessageSquare /> Submit Complaint
              </PrimaryButton>
            </form>
          </SectionCard>
        )}

        <SectionCard
          title={
            leadershipUser
              ? 'Complaint Dashboard'
              : executiveUser
                ? 'My Complaint Status'
                : `${department} Complaint Records`
          }
          subtitle="Use filters, tabs, search, and status actions to manage complaints."
          className={!canRaiseComplaint ? 'xl:col-span-2' : ''}
        >
          <div className="mb-5 space-y-4">
            {leadershipUser && (
              <div className="flex flex-wrap gap-2">
                {['All', ...departments].map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveDepartment(item)}
                    className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                      activeDepartment === item
                        ? 'bg-[#0B3D91] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item === 'All' ? 'All Complaints' : `${item} Department`}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {['All', ...statuses].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveStatus(item)}
                  className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                    activeStatus === item
                      ? 'bg-[#12B76A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item === 'All' ? 'All Status' : item}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 xl:col-span-2">
                <FiSearch className="text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent text-sm font-bold outline-none"
                  placeholder="Search complaint, subject, role..."
                />
              </label>

              <input
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none"
                placeholder="Employee ID"
              />

              <input
                value={employeeName}
                onChange={(event) => setEmployeeName(event.target.value)}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none"
                placeholder="Employee Name"
              />

              <button
                onClick={clearFilters}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-200"
              >
                Clear
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase text-slate-500">
                  From Date
                </span>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase text-slate-500">
                  To Date
                </span>

                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none"
                />
              </label>
            </div>
          </div>

          <div className="table-wrap">
            <table className="min-w-[1180px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Complaint ID</th>
                  <th className="py-4 pr-4">Employee ID</th>
                  <th className="py-4 pr-4">Employee Name</th>
                  <th className="py-4 pr-4">Department</th>
                  <th className="py-4 pr-4">Role</th>
                  <th className="py-4 pr-4">Complaint Subject</th>
                  <th className="py-4 pr-4">Raised To</th>
                  <th className="py-4 pr-4">Status</th>
                  <th className="py-4 pr-4">Created Date</th>
                  <th className="py-4 pr-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top"
                  >
                    <td className="py-4 pr-4 font-black text-[#0B3D91]">
                      {complaint.id}
                    </td>

                    <td className="py-4 pr-4">
                      {complaint.employeeId}
                    </td>

                    <td className="py-4 pr-4 font-black text-slate-900">
                      {complaint.employeeName}
                    </td>

                    <td className="py-4 pr-4">
                      {complaint.department}
                    </td>

                    <td className="py-4 pr-4">
                      {complaint.employeeRole}
                    </td>

                    <td className="py-4 pr-4">
                      <p className="max-w-[260px] truncate">
                        {complaint.subject}
                      </p>
                    </td>

                    <td className="py-4 pr-4">
                      <p className="max-w-[220px] truncate">
                        {complaint.raisedTo}
                      </p>
                    </td>

                    <td className="py-4 pr-4">
                      <StatusBadge status={complaint.status} />
                    </td>

                    <td className="py-4 pr-4">
                      {complaint.createdAt}
                    </td>

                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <PrimaryButton
                          variant="outline"
                          className="py-2"
                          onClick={() => openDrawer(complaint)}
                        >
                          <FiEye /> View
                        </PrimaryButton>

                        {canUpdateComplaints && complaint.status !== 'Closed' && (
                          <PrimaryButton
                            variant="outline"
                            className="py-2"
                            onClick={() => {
                              openDrawer(complaint);
                              setReviewStatus('In Progress');
                            }}
                          >
                            Update
                          </PrimaryButton>
                        )}

                        {canUpdateComplaints &&
                          !['Resolved', 'Closed'].includes(complaint.status) && (
                            <PrimaryButton
                              variant="green"
                              className="py-2"
                              onClick={() =>
                                quickUpdateStatus(
                                  complaint,
                                  'Resolved',
                                  'Resolved from table action'
                                )
                              }
                            >
                              Resolve
                            </PrimaryButton>
                          )}

                        {canUpdateComplaints && complaint.status !== 'Closed' && (
                          <PrimaryButton
                            variant="danger"
                            className="py-2"
                            onClick={() =>
                              quickUpdateStatus(
                                complaint,
                                'Closed',
                                'Closed from table action'
                              )
                            }
                          >
                            Close
                          </PrimaryButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredComplaints.length === 0 && !loading && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
              No complaint records found for the selected filters.
            </p>
          )}
        </SectionCard>
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
          <button
            className="absolute inset-0"
            onClick={() => setSelectedComplaint(null)}
            aria-label="Close complaint details"
          />

          <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">
                  Complaint Details
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {selectedComplaint.subject}
                </h2>

                <p className="mt-1 text-sm font-bold text-slate-500">
                  {selectedComplaint.id} · {selectedComplaint.createdAt}
                </p>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
              >
                <FiX />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black text-slate-900">
                  Employee Details
                </h3>

                <div className="mt-3 space-y-2 text-sm font-bold text-slate-600">
                  <p>
                    ID:{' '}
                    <span className="text-slate-900">
                      {selectedComplaint.employeeId}
                    </span>
                  </p>

                  <p>
                    Name:{' '}
                    <span className="text-slate-900">
                      {selectedComplaint.employeeName}
                    </span>
                  </p>

                  <p>
                    Department:{' '}
                    <span className="text-slate-900">
                      {selectedComplaint.department}
                    </span>
                  </p>

                  <p>
                    Role:{' '}
                    <span className="text-slate-900">
                      {selectedComplaint.employeeRole}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black text-slate-900">
                  Complaint Details
                </h3>

                <div className="mt-3 space-y-2 text-sm font-bold text-slate-600">
                  <p>
                    Raised To:{' '}
                    <span className="text-slate-900">
                      {selectedComplaint.raisedTo}
                    </span>
                  </p>

                  <p>
                    Priority: <StatusBadge status={selectedComplaint.priority} />
                  </p>

                  <p>
                    Status: <StatusBadge status={selectedComplaint.status} />
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-900">Description</h3>

              <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
                {selectedComplaint.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-900">Attachments</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {(selectedComplaint.attachments || []).map((doc) => (
                  <div
                    key={doc.id || doc.name}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
                  >
                    <span>{doc.name}</span>

                    <button
                      onClick={() => previewAttachment(doc)}
                      className="text-[#0B3D91]"
                    >
                      <FiEye />
                    </button>

                    <button
                      onClick={() => downloadAttachment(doc)}
                      className="text-emerald-700"
                    >
                      <FiDownload />
                    </button>
                  </div>
                ))}

                {(selectedComplaint.attachments || []).length === 0 && (
                  <p className="text-sm font-bold text-slate-500">
                    No attachments uploaded.
                  </p>
                )}
              </div>
            </div>

            {canUpdateComplaints && (
              <div className="mt-4 rounded-3xl border border-slate-200 p-4">
                <h3 className="font-black text-slate-900">Update Status</h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr]">
                  <select
                    value={reviewStatus}
                    onChange={(event) => setReviewStatus(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-black outline-none"
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <input
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none"
                    placeholder="Resolution notes / remarks"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <PrimaryButton
                    variant="outline"
                    onClick={() => updateStatus(reviewStatus)}
                  >
                    Update Status
                  </PrimaryButton>

                  <PrimaryButton
                    variant="green"
                    onClick={() =>
                      updateStatus('Resolved', reviewNote || 'Resolved')
                    }
                  >
                    Resolve
                  </PrimaryButton>

                  <PrimaryButton
                    variant="danger"
                    onClick={() =>
                      updateStatus('Closed', reviewNote || 'Closed')
                    }
                  >
                    Close
                  </PrimaryButton>
                </div>
              </div>
            )}

            <div className="mt-4 rounded-3xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-900">Status History</h3>

              <div className="mt-3 space-y-3">
                {(selectedComplaint.statusHistory || []).map((entry, index) => (
                  <div
                    key={`${entry.status}-${entry.dateTime}-${index}`}
                    className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge status={entry.status} />

                      <span className="text-xs text-slate-400">
                        {entry.dateTime}
                      </span>
                    </div>

                    <p className="mt-2">{entry.note || entry.remarks || '-'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-900">Resolution Notes</h3>

              <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
                {selectedComplaint.resolutionNotes ||
                  selectedComplaint.remarks ||
                  'No resolution notes yet.'}
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}