// import { useEffect, useMemo, useState } from 'react';
// import { FiDownload, FiEdit, FiEye, FiFileText, FiImage, FiPower, FiSearch, FiTrash2, FiUploadCloud, FiUserPlus, FiX } from 'react-icons/fi';
// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { getCreatableRoles, getRoleDepartment, isExecutiveRole, isManagerRole, isSuperRole } from '../../constants/roles.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { useAuth } from '../../context/AuthContext.js';

// const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
// const documentHelp = 'Supported: PDF, JPG, JPEG, PNG. Upload at least 2 documents. Recommended: Profile Photo, Aadhaar, PAN, Resume, Educational Certificate, Experience Certificate.';

// const blankEmployee = (role = 'Sales Executive') => ({
//   firstName: '',
//   lastName: '',
//   email: '',
//   mobileNumber: '',
//   address: '',
//   department: getRoleDepartment(role),
//   role,
//   designation: role,
//   joiningDate: '',
//   documents: [],
// });

// function fileIcon(doc) {
//   if (doc?.type?.startsWith('image/')) return <FiImage />;
//   return <FiFileText />;
// }


// export default function EmployeeManagementPanel() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const currentRole = user?.role || '';
//   const currentDepartment = getRoleDepartment(currentRole);
//   const creatableRoles = useMemo(() => getCreatableRoles(currentRole), [currentRole]);
//   const [form, setForm] = useState(() => blankEmployee(creatableRoles[0] || 'Sales Executive'));
//   const [editingId, setEditingId] = useState(null);
//   const [message, setMessage] = useState(null);
//   const [search, setSearch] = useState('');
//   const [uploading, setUploading] = useState(false);

//   const canManage = isSuperRole(currentRole) || isManagerRole(currentRole);
//   const roleOptions = useMemo(() => {
//     const options = [...creatableRoles];
//     if (editingId && form.role && !options.includes(form.role)) options.push(form.role);
//     return options;
//   }, [creatableRoles, editingId, form.role]);

//   useEffect(() => {
//     if (!editingId && creatableRoles.length && !creatableRoles.includes(form.role)) {
//       const role = creatableRoles[0];
//       setForm((old) => ({ ...old, role, department: getRoleDepartment(role), designation: role }));
//     }
//   }, [creatableRoles, editingId, form.role]);

//   const allVisible = app.getRoleData(currentRole, user).employees;
//   const employees = useMemo(() => {
//     const scoped = isSuperRole(currentRole)
//       ? allVisible
//       : allVisible.filter((employee) => employee.department === currentDepartment && isExecutiveRole(employee.role));
//     const q = search.trim().toLowerCase();
//     if (!q) return scoped;
//     return scoped.filter((employee) => [
//       employee.firstName,
//       employee.lastName,
//       employee.name,
//       employee.email,
//       employee.mobileNumber,
//       employee.username,
//       employee.role,
//       employee.department,
//       employee.designation,
//     ].filter(Boolean).join(' ').toLowerCase().includes(q));
//   }, [allVisible, currentRole, currentDepartment, search]);

//   const reset = () => {
//     const role = creatableRoles[0] || 'Sales Executive';
//     setForm(blankEmployee(role));
//     setEditingId(null);
//   };

//   const setRole = (role) => {
//     setForm((old) => ({ ...old, role, department: getRoleDepartment(role), designation: old.designation === old.role || !old.designation ? role : old.designation }));
//   };

//   const handleDocuments = async (event) => {
//     const files = Array.from(event.target.files || []);
//     event.target.value = '';
//     if (!files.length) return;
//     const rejected = files.filter((file) => !validTypes.includes(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name));
//     if (rejected.length) {
//       setMessage({ type: 'error', text: 'Only PDF, JPG, JPEG, and PNG files are allowed.' });
//       return;
//     }
//     setUploading(true);
//     try {
//       const docs = await Promise.all(files.map((file) => app.fileToData(file)));
//       setForm((old) => ({ ...old, documents: [...old.documents, ...docs.filter(Boolean)] }));
//       setMessage({ type: 'success', text: `${docs.length} document(s) uploaded for preview.` });
//     } catch {
//       setMessage({ type: 'error', text: 'Unable to read selected files. Please try again.' });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removeDocument = (docId) => {
//     setForm((old) => ({ ...old, documents: old.documents.filter((doc) => doc.id !== docId && doc.name !== docId) }));
//   };

//   const saveEmployee = (event) => {
//     event.preventDefault();
//     setMessage(null);
//     try {
//       const employee = app.saveEmployee({ ...form, id: editingId }, currentRole);
//       setMessage({
//         type: 'success',
//         text: editingId
//           ? 'Employee updated successfully.'
//           : 'Employee created successfully. Credentials have been sent to the registered email.',
//         employee,
//       });
//       reset();
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message || 'Unable to save employee.' });
//     }
//   };

//   const editEmployee = (employee) => {
//     setEditingId(employee.id);
//     setForm({
//       firstName: employee.firstName || '',
//       lastName: employee.lastName || '',
//       email: employee.email || '',
//       mobileNumber: employee.mobileNumber || employee.phone || '',
//       address: employee.address || '',
//       department: employee.department || getRoleDepartment(employee.role),
//       role: employee.role,
//       designation: employee.designation || employee.role,
//       joiningDate: employee.joiningDate || '',
//       documents: employee.documents || [],
//       status: employee.status || 'Active',
//     });
//     setMessage(null);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const title = isSuperRole(currentRole) ? 'Employee Management' : `${currentDepartment} Executive Management`;
//   const formTitle = editingId ? 'Edit Employee Record' : isSuperRole(currentRole) ? 'Create Department Manager' : `Create ${currentDepartment} Executive`;
//   const formSubtitle = isSuperRole(currentRole)
//     ? 'MD and Operational Head can create Sales, Marketing, CRM, Accounts, and HR Managers.'
//     : 'Department managers can create only their own executives.';

//   return (
//     <div>
//       <PageHeader
//         title={title}
//         subtitle="Hierarchy-based employee creation with mandatory document upload, generated credentials, Local Storage persistence, and instant login access."
//       />

//       <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
//         {canManage && roleOptions.length > 0 && (
//           <SectionCard title={formTitle} subtitle={formSubtitle}>
//             {message && (
//               <div className={`mb-4 rounded-2xl border p-4 text-sm font-bold ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
//                 <p>{message.text}</p>
//                 {message.employee && (
//                   <div className="mt-3 grid gap-2 rounded-2xl bg-white/75 p-3 text-slate-800 sm:grid-cols-3">
//                     <p><span className="text-slate-500">Employee ID:</span> {message.employee.employeeId || message.employee.id}</p>
//                     <p><span className="text-slate-500">Username:</span> {message.employee.username}</p>
//                     <p><span className="text-slate-500">Password:</span> {message.employee.password}</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             <form onSubmit={saveEmployee} className="space-y-5">
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">First Name</span><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//                 <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Last Name</span><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Email</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//                 <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Mobile Number</span><input value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//               </div>

//               <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Address</span><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Role</span><select value={form.role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]">{roleOptions.map((role) => <option key={role}>{role}</option>)}</select></label>
//                 <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Department</span><input value={form.department} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 outline-none" /></label>
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Designation</span><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//                 <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Joining Date</span><input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//               </div>

//               <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
//                 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                   <div>
//                     <p className="font-black text-slate-900">Mandatory Document Upload</p>
//                     <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{documentHelp}</p>
//                   </div>
//                   <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#1E5EFF]">
//                     <FiUploadCloud /> {uploading ? 'Uploading...' : 'Select Files'}
//                     <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleDocuments} className="hidden" />
//                   </label>
//                 </div>

//                 <div className="mt-4 grid gap-3 sm:grid-cols-2">
//                   {form.documents.map((doc, index) => (
//                     <div key={doc.id || doc.name} className="rounded-2xl border border-white bg-white p-3 shadow-sm">
//                       <div className="flex items-start gap-3">
//                         <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#0B3D91]">{fileIcon(doc)}</div>
//                         <div className="min-w-0 flex-1">
//                           <p className="truncate text-sm font-black text-slate-900">{doc.name}</p>
//                           <p className="text-xs font-bold text-slate-500">{doc.size} · {doc.type || 'file'}</p>
//                           <div className="mt-2 flex flex-wrap gap-2">
//                             <button type="button" onClick={() => app.previewFile(doc)} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"><FiEye /> Preview</button>
//                             <button type="button" onClick={() => app.downloadFile(doc, doc.name)} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"><FiDownload /> Download</button>
//                             <button type="button" onClick={() => removeDocument(doc.id || doc.name)} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600"><FiX /> Remove</button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <p className={`mt-3 text-xs font-black ${form.documents.length >= 2 ? 'text-emerald-700' : 'text-amber-700'}`}>{form.documents.length}/2 minimum documents uploaded.</p>
//               </div>

//               <div className="rounded-2xl bg-blue-50 p-3 text-xs font-bold leading-5 text-[#0B3D91]">
//                 Credentials are generated automatically after creation: username <b>firstname.lastname</b>, password <b>FirstName@123</b>. Duplicate usernames become <b>firstname.lastname1</b>, <b>firstname.lastname2</b>.
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 <PrimaryButton type="submit" variant="green"><FiUserPlus /> {editingId ? 'Update Employee' : 'Create Employee'}</PrimaryButton>
//                 {editingId && <PrimaryButton type="button" variant="outline" onClick={reset}>Cancel Edit</PrimaryButton>}
//               </div>
//             </form>
//           </SectionCard>
//         )}

//         <SectionCard title="Employee Records" subtitle={isSuperRole(currentRole) ? 'All managers and executives across departments' : `${currentDepartment} executives only`} className={!canManage ? 'xl:col-span-2' : ''}>
//           <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
//             <FiSearch className="text-slate-400" />
//             <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Search by name, role, department, email, username..." />
//           </div>

//           <div className="table-wrap">
//             <table className="min-w-[1280px] w-full text-left">
//               <thead>
//                 <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
//                   <th className="py-4 pr-4">Employee</th>
//                   <th className="py-4 pr-4">Role / Department</th>
//                   <th className="py-4 pr-4">Contact</th>
//                   <th className="py-4 pr-4">Joining</th>
//                   <th className="py-4 pr-4">Credentials</th>
//                   <th className="py-4 pr-4">Documents</th>
//                   <th className="py-4 pr-4">Status</th>
//                   <th className="py-4 pr-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {employees.map((employee) => {
//                   const imageDoc = employee.documents?.find((doc) => doc.type?.startsWith('image/'));
//                   return (
//                     <tr key={employee.id} className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top">
//                       <td className="py-4 pr-4">
//                         <div className="flex items-center gap-3">
//                           {imageDoc?.dataUrl ? <img src={imageDoc.dataUrl} alt={employee.name} className="h-12 w-12 rounded-2xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] text-white">{employee.firstName?.slice(0, 1) || 'E'}</div>}
//                           <div>
//                             <p className="font-black text-slate-900">{employee.name}</p>
//                             <p className="text-xs font-semibold text-slate-500">Employee ID: {employee.employeeId || employee.id}</p>
//                             <p className="text-xs font-semibold text-slate-400">Created by {employee.createdBy || 'System'}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="py-4 pr-4"><p className="font-black text-slate-900">{employee.role}</p><p className="text-xs text-slate-500">{employee.department}</p><p className="text-xs text-slate-500">{employee.designation}</p></td>
//                       <td className="py-4 pr-4"><p>{employee.email}</p><p className="text-xs text-slate-500">{employee.mobileNumber || employee.phone}</p><p className="max-w-[220px] truncate text-xs text-slate-400">{employee.address || 'No address'}</p></td>
//                       <td className="py-4 pr-4"><p>{employee.joiningDate || '-'}</p><p className="text-xs text-slate-500">{employee.createdAt}</p></td>
//                       <td className="py-4 pr-4"><p className="text-xs font-black text-slate-500">{employee.employeeId || employee.id}</p><p className="font-black text-[#0B3D91]">{employee.username}</p><p className="text-xs font-black text-emerald-700">{employee.password}</p></td>
//                       <td className="py-4 pr-4">
//                         <p className="mb-2 text-xs font-black text-slate-500">{employee.documents?.length || 0} files</p>
//                         <div className="flex max-w-[260px] flex-wrap gap-2">
//                           {(employee.documents || []).slice(0, 3).map((doc) => <button key={doc.id || doc.name} type="button" onClick={() => app.previewFile(doc)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{doc.name}</button>)}
//                           {(employee.documents || []).length > 3 && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">+{employee.documents.length - 3}</span>}
//                         </div>
//                       </td>
//                       <td className="py-4 pr-4"><StatusBadge status={employee.status} /></td>
//                       <td className="py-4 pr-4">
//                         <div className="flex flex-wrap gap-2">
//                           {canManage && <PrimaryButton variant="outline" className="py-2" onClick={() => editEmployee(employee)}><FiEdit /> Edit</PrimaryButton>}
//                           {canManage && <PrimaryButton variant="outline" className="py-2" onClick={() => app.toggleEmployeeStatus(employee.id)}><FiPower /> {employee.status === 'Active' ? 'Deactivate' : 'Activate'}</PrimaryButton>}
//                           {canManage && <PrimaryButton variant="danger" className="py-2" onClick={() => app.removeEmployee(employee.id)}><FiTrash2 /></PrimaryButton>}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//           {employees.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No employee records found.</p>}
//         </SectionCard>
//       </div>
//     </div>
//   );
// }






import { useEffect, useMemo, useState } from 'react';
import {
  FiDownload,
  FiEdit,
  FiEye,
  FiFileText,
  FiImage,
  FiPower,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiUserPlus,
  FiX,
} from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import {
  getCreatableRoles,
  getRoleDepartment,
  isExecutiveRole,
  isManagerRole,
  isSuperRole,
} from '../../constants/roles.js';
import { useAuth } from '../../context/AuthContext.js';
import { employeeManagementApi, getFileUrl } from '../../services/api.js';

const validDocumentTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const validImageTypes = ['image/jpeg', 'image/png'];

const documentHelp =
  'Supported: PDF, JPG, JPEG, PNG. Upload profile photo, resume, certificates, experience letter, etc. Aadhaar and PAN have separate image sections below.';

const blankEmployee = (role = 'Sales Executive') => ({
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: '',
  address: '',
  department: getRoleDepartment(role),
  role,
  password: '',
  joiningDate: '',
  documents: [],
  aadhaarImage: '',
  panImage: '',
  status: 'Active',
});

function fileIcon(doc) {
  if (doc?.type?.startsWith('image/')) return <FiImage />;
  return <FiFileText />;
}

function getDocumentKey(doc, index, scope = 'doc') {
  return [scope, doc?.id, doc?.url, doc?.fileName, doc?.name, index].filter(Boolean).join('-');
}

function normalizeIndianMobile(value) {
  let digits = (value || '').replace(/\D/g, '');

  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(-10);
  }

  return digits;
}

function fileToPreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve({
        file,
        name: file.name,
        type: file.type,
        size: `${Math.round(file.size / 1024)} KB`,
        dataUrl: reader.result,
      });

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EmployeeManagementPanel() {
  const { user } = useAuth();

  const currentRole = user?.role || '';
  const currentDepartment = getRoleDepartment(currentRole);

  const creatableRoles = useMemo(
    () => getCreatableRoles(currentRole),
    [currentRole]
  );

  const [form, setForm] = useState(() =>
    blankEmployee(creatableRoles[0] || 'Sales Executive')
  );

  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentialHints, setCredentialHints] = useState({});

  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);

  const canManage = isSuperRole(currentRole) || isManagerRole(currentRole);

  const roleOptions = useMemo(() => {
    const options = [...creatableRoles];

    if (editingId && form.role && !options.includes(form.role)) {
      options.push(form.role);
    }

    return options;
  }, [creatableRoles, editingId, form.role]);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const data = await employeeManagementApi.getData();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.message || 'Unable to load employee records from backend.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (
      !editingId &&
      creatableRoles.length &&
      !creatableRoles.includes(form.role)
    ) {
      const role = creatableRoles[0];

      setForm((old) => ({
        ...old,
        role,
        department: getRoleDepartment(role),
      }));
    }
  }, [creatableRoles, editingId, form.role]);

  useEffect(() => {
    if (!editingId && form.firstName && !form.password) {
      const cleanFirstName = form.firstName.trim();

      if (cleanFirstName) {
        setForm((old) => ({
          ...old,
          password: `${cleanFirstName}@123`,
        }));
      }
    }
  }, [form.firstName, editingId]);

  const visibleEmployees = useMemo(() => {
    const scoped = isSuperRole(currentRole)
      ? employees
      : employees.filter(
          (employee) =>
            employee.department === currentDepartment &&
            isExecutiveRole(employee.role)
        );

    const q = search.trim().toLowerCase();

    if (!q) return scoped;

    return scoped.filter((employee) =>
      [
        employee.firstName,
        employee.lastName,
        employee.name,
        employee.email,
        employee.mobileNumber,
        employee.username,
        employee.role,
        employee.department,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [employees, currentRole, currentDepartment, search]);

  const reset = () => {
    const role = creatableRoles[0] || 'Sales Executive';

    setForm(blankEmployee(role));
    setEditingId(null);
    setAadhaarFile(null);
    setPanFile(null);
    setDocumentFiles([]);
  };

  const setRole = (role) => {
    setForm((old) => ({
      ...old,
      role,
      department: getRoleDepartment(role),
    }));
  };

  const handleDocuments = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    const rejected = files.filter(
      (file) =>
        !validDocumentTypes.includes(file.type) &&
        !/\.(pdf|jpe?g|png)$/i.test(file.name)
    );

    if (rejected.length) {
      setMessage({
        type: 'error',
        text: 'Only PDF, JPG, JPEG, and PNG files are allowed.',
      });
      return;
    }

    setUploading(true);

    try {
      const docs = await Promise.all(files.map(fileToPreview));

      setDocumentFiles((old) => [...old, ...files]);

      setForm((old) => ({
        ...old,
        documents: [...old.documents, ...docs],
      }));

      setMessage({
        type: 'success',
        text: `${docs.length} document(s) uploaded for preview.`,
      });
    } catch {
      setMessage({
        type: 'error',
        text: 'Unable to read selected files. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAadhaarImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (
      !validImageTypes.includes(file.type) &&
      !/\.(jpe?g|png)$/i.test(file.name)
    ) {
      setMessage({
        type: 'error',
        text: 'Aadhaar image must be JPG, JPEG, or PNG.',
      });
      return;
    }

    const preview = await fileToPreview(file);

    setAadhaarFile(file);
    setForm((old) => ({
      ...old,
      aadhaarImage: preview.dataUrl,
    }));

    setMessage({
      type: 'success',
      text: 'Aadhaar image uploaded for preview.',
    });
  };

  const handlePanImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (
      !validImageTypes.includes(file.type) &&
      !/\.(jpe?g|png)$/i.test(file.name)
    ) {
      setMessage({
        type: 'error',
        text: 'PAN card image must be JPG, JPEG, or PNG.',
      });
      return;
    }

    const preview = await fileToPreview(file);

    setPanFile(file);
    setForm((old) => ({
      ...old,
      panImage: preview.dataUrl,
    }));

    setMessage({
      type: 'success',
      text: 'PAN card image uploaded for preview.',
    });
  };

  const removeDocument = (docIndex) => {
    setForm((old) => ({
      ...old,
      documents: old.documents.filter((_, index) => index !== docIndex),
    }));
  };

  const previewFile = async (doc, employeeId = editingId) => {
    if (doc?.dataUrl) {
      window.open(doc.dataUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (employeeId && doc?.id) {
      try {
        await employeeManagementApi.previewDocument(employeeId, doc);
        return;
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Unable to preview document.',
        });
        return;
      }
    }

    const url = getFileUrl(doc?.url);

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadFile = async (doc, employeeId = editingId) => {
    if (doc?.dataUrl) {
      const link = document.createElement('a');
      link.href = doc.dataUrl;
      link.download = doc.name || 'document';
      link.click();
      return;
    }

    if (employeeId && doc?.id) {
      try {
        await employeeManagementApi.downloadDocument(employeeId, doc);
        return;
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Unable to download document.',
        });
        return;
      }
    }

    const url = getFileUrl(doc?.url);

    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name || 'document';
    link.click();
  };

  const buildEmployeePayload = () => {
    const existingDocuments = (form.documents || [])
      .filter((doc) => doc?.id && !doc?.dataUrl)
      .map((doc) => ({ ...doc, serverDocument: true }));

    const uploadedDocuments = documentFiles.map((file) => ({
      file,
      name: file.name,
    }));

    const requiredDocuments = [];

    if (aadhaarFile) {
      requiredDocuments.push({
        file: aadhaarFile,
        name: aadhaarFile.name || 'aadhaar-document',
      });
    }

    if (panFile) {
      requiredDocuments.push({
        file: panFile,
        name: panFile.name || 'pan-document',
      });
    }

    return {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      mobileNumber: normalizeIndianMobile(form.mobileNumber),
      address: form.address.trim(),
      designation: form.designation || form.role,
      password: form.password.trim(),
      joiningDate: form.joiningDate || null,
      status: form.status || 'Active',
      documents: [
        ...existingDocuments,
        ...uploadedDocuments,
        ...requiredDocuments,
      ],
    };
  };

  const saveEmployee = async (event) => {
    event.preventDefault();

    setMessage(null);

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !normalizeIndianMobile(form.mobileNumber) ||
      !form.role ||
      !form.department
    ) {
      setMessage({
        type: 'error',
        text: 'Please enter first name, last name, email, mobile number, role, and department.',
      });
      return;
    }

    if (normalizeIndianMobile(form.mobileNumber).length !== 10) {
      setMessage({
        type: 'error',
        text: 'Mobile number must contain exactly 10 digits.',
      });
      return;
    }

    if (!editingId && !aadhaarFile) {
      setMessage({
        type: 'error',
        text: 'Please upload Aadhaar card image.',
      });
      return;
    }

    if (!editingId && !panFile) {
      setMessage({
        type: 'error',
        text: 'Please upload PAN card image.',
      });
      return;
    }

    try {
      setLoading(true);

      const payload = buildEmployeePayload();

      const res = editingId
        ? await employeeManagementApi.update(editingId, payload)
        : await employeeManagementApi.create(payload);

      const savedEmployee = res.data;

      if (savedEmployee?.id && savedEmployee?.temporaryPassword) {
        setCredentialHints((old) => ({
          ...old,
          [savedEmployee.id]: savedEmployee.temporaryPassword,
        }));
      }

      setMessage({
        type: 'success',
        text: editingId
          ? 'Employee updated successfully.'
          : 'Employee created successfully. Use the username, password, and role shown below to log in.',
        employee: savedEmployee,
      });

      reset();
      await loadEmployees();
    } catch (error) {
      console.error(error);

      setMessage({
        type: 'error',
        text:
          error?.message ||
          error?.response?.data?.message ||
          error?.response?.data ||
          'Unable to save employee.',
      });
    } finally {
      setLoading(false);
    }
  };

  const editEmployee = (employee) => {
    setEditingId(employee.id);

    setForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      mobileNumber: employee.mobileNumber || employee.phone || '',
      address: employee.address || '',
      department: employee.department || getRoleDepartment(employee.role),
      role: employee.role,
      password: '',
      joiningDate: employee.joiningDate || '',
      documents: employee.documents || [],
      aadhaarImage: employee.aadhaarImageUrl || employee.aadhaarImage || '',
      panImage: employee.panImageUrl || employee.panImage || '',
      status: employee.status || 'Active',
    });

    setAadhaarFile(null);
    setPanFile(null);
    setDocumentFiles([]);
    setMessage(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStatus = async (employeeId) => {
    try {
      await employeeManagementApi.toggleStatus(employeeId);
      await loadEmployees();
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: 'Unable to change employee status.',
      });
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      await employeeManagementApi.remove(employeeId);
      await loadEmployees();
      setMessage({
        type: 'success',
        text: 'Employee deleted successfully.',
      });
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: 'Unable to delete employee.',
      });
    }
  };

  const title = isSuperRole(currentRole)
    ? 'Employee Management'
    : `${currentDepartment} Executive Management`;

  const formTitle = editingId
    ? 'Edit Employee Record'
    : isSuperRole(currentRole)
      ? 'Create Department Manager'
      : `Create ${currentDepartment} Executive`;

  const formSubtitle = isSuperRole(currentRole)
    ? 'MD and Operational Head can create Sales, Marketing, CRM, Accounts, and HR Managers.'
    : 'Department managers can create only their own executives.';

  return (
    <div>
      <PageHeader
        title={title}
        subtitle="Employee creation with auto-generated username, password field, Aadhaar image, PAN image, document storage, and backend login access."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        {canManage && roleOptions.length > 0 && (
          <SectionCard title={formTitle} subtitle={formSubtitle}>
            {message && (
              <div
                className={`mb-4 rounded-2xl border p-4 text-sm font-bold ${
                  message.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                <p>{message.text}</p>

                {message.employee && (
                  <div className="mt-3 grid gap-2 rounded-2xl bg-white/75 p-3 text-slate-800 sm:grid-cols-3">
                    <p>
                      <span className="text-slate-500">Employee ID:</span>{' '}
                      {message.employee.employeeId || message.employee.id}
                    </p>
                    <p>
                      <span className="text-slate-500">Username:</span>{' '}
                      {message.employee.username}
                    </p>
                    <p>
                      <span className="text-slate-500">Password:</span>{' '}
                      {message.employee.temporaryPassword || form.password || '-'}
                    </p>
                    <p>
                      <span className="text-slate-500">Role:</span>{' '}
                      {message.employee.role || form.role}
                    </p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={saveEmployee} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    First Name
                  </span>
                  <input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    Last Name
                  </span>
                  <input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    Email
                  </span>
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    Mobile Number
                  </span>
                  <input
                    value={form.mobileNumber}
                    onChange={(e) =>
                      setForm({ ...form, mobileNumber: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Address
                </span>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    Role
                  </span>
                  <select
                    value={form.role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  >
                    {roleOptions.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    Department
                  </span>
                  <input
                    value={form.department}
                    readOnly
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    Password
                  </span>
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                    placeholder="FirstName@123"
                  />
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Leave password empty to auto-generate FirstName@123, or enter your own password manually.
                  </p>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    Joining Date
                  </span>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      setForm({ ...form, joiningDate: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
                  <p className="font-black text-slate-900">
                    Aadhaar Card Image
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Upload JPG, JPEG, or PNG.
                  </p>

                  <label className="mt-3 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white">
                    <FiUploadCloud /> Upload Aadhaar
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleAadhaarImage}
                      className="hidden"
                    />
                  </label>

                  {form.aadhaarImage && (
                    <img
                      src={getFileUrl(form.aadhaarImage)}
                      alt="Aadhaar preview"
                      className="mt-4 h-40 w-full rounded-2xl object-cover"
                    />
                  )}
                </div>

                <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
                  <p className="font-black text-slate-900">
                    PAN Card Image
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Upload JPG, JPEG, or PNG.
                  </p>

                  <label className="mt-3 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white">
                    <FiUploadCloud /> Upload PAN
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handlePanImage}
                      className="hidden"
                    />
                  </label>

                  {form.panImage && (
                    <img
                      src={getFileUrl(form.panImage)}
                      alt="PAN preview"
                      className="mt-4 h-40 w-full rounded-2xl object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-900">
                      Other Document Upload
                    </p>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                      {documentHelp}
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#1E5EFF]">
                    <FiUploadCloud /> {uploading ? 'Uploading...' : 'Select Files'}
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={handleDocuments}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {form.documents.map((doc, index) => (
                    <div
                      key={getDocumentKey(doc, index, 'form-doc')}
                      className="rounded-2xl border border-white bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#0B3D91]">
                          {fileIcon(doc)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-900">
                            {doc.name}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
                            {doc.size || ''} · {doc.type || 'file'}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => previewFile(doc, employee.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
                            >
                              <FiEye /> Preview
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadFile(doc, employee.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                            >
                              <FiDownload /> Download
                            </button>

                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600"
                            >
                              <FiX /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs font-black text-slate-500">
                  {form.documents.length} other document(s) selected.
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-3 text-xs font-bold leading-5 text-[#0B3D91]">
                Credentials are generated automatically after creation:
                username <b>firstname.lastname</b>, password{' '}
                <b>FirstName@123</b>. Duplicate usernames become{' '}
                <b>firstname.lastname1</b>, <b>firstname.lastname2</b>.
              </div>

              <div className="flex flex-wrap gap-2">
                <PrimaryButton type="submit" variant="green" disabled={loading}>
                  <FiUserPlus />{' '}
                  {loading
                    ? 'Saving...'
                    : editingId
                      ? 'Update Employee'
                      : 'Create Employee'}
                </PrimaryButton>

                {editingId && (
                  <PrimaryButton type="button" variant="outline" onClick={reset}>
                    Cancel Edit
                  </PrimaryButton>
                )}
              </div>
            </form>
          </SectionCard>
        )}

        <SectionCard
          title="Employee Records"
          subtitle={
            isSuperRole(currentRole)
              ? 'All managers and executives across departments'
              : `${currentDepartment} executives only`
          }
          className={!canManage ? 'xl:col-span-2' : ''}
        >
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <FiSearch className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm font-bold outline-none"
              placeholder="Search by name, role, department, email, username..."
            />
          </div>

          <div className="table-wrap">
            <table className="min-w-[1350px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Employee</th>
                  <th className="py-4 pr-4">Role / Department</th>
                  <th className="py-4 pr-4">Contact</th>
                  <th className="py-4 pr-4">Joining</th>
                  <th className="py-4 pr-4">Credentials</th>
                  <th className="py-4 pr-4">Aadhaar / PAN</th>
                  <th className="py-4 pr-4">Documents</th>
                  <th className="py-4 pr-4">Status</th>
                  <th className="py-4 pr-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleEmployees.map((employee) => {
                  const profileImage =
                    employee.aadhaarImageUrl ||
                    employee.aadhaarImage ||
                    employee.documents?.find((doc) =>
                      doc.type?.startsWith('image/')
                    )?.url;

                  return (
                    <tr
                      key={employee.id}
                      className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          {profileImage ? (
                            <img
                              src={getFileUrl(profileImage)}
                              alt={employee.name}
                              className="h-12 w-12 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#12B76A] text-white">
                              {employee.firstName?.slice(0, 1) || 'E'}
                            </div>
                          )}

                          <div>
                            <p className="font-black text-slate-900">
                              {employee.name}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              Employee ID:{' '}
                              {employee.employeeId || employee.id}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              Created by {employee.createdBy || 'System'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        <p className="font-black text-slate-900">
                          {employee.role}
                        </p>
                        <p className="text-xs text-slate-500">
                          {employee.department}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        <p>{employee.email}</p>
                        <p className="text-xs text-slate-500">
                          {employee.mobileNumber || employee.phone}
                        </p>
                        <p className="max-w-[220px] truncate text-xs text-slate-400">
                          {employee.address || 'No address'}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        <p>{employee.joiningDate || '-'}</p>
                        <p className="text-xs text-slate-500">
                          {employee.createdAt}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        <p className="text-xs font-black text-slate-500">
                          {employee.employeeId || employee.id}
                        </p>
                        <p className="font-black text-[#0B3D91]">
                          {employee.username}
                        </p>
                        <p className="text-xs font-black text-emerald-700">
                          {employee.temporaryPassword ||
                            credentialHints[employee.id] ||
                            'Password secured'}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        <div className="flex flex-col gap-2">
                          {employee.aadhaarImageUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  getFileUrl(employee.aadhaarImageUrl),
                                  '_blank'
                                )
                              }
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#0B3D91]"
                            >
                              View Aadhaar
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Aadhaar not uploaded
                            </span>
                          )}

                          {employee.panImageUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  getFileUrl(employee.panImageUrl),
                                  '_blank'
                                )
                              }
                              className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                            >
                              View PAN
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              PAN not uploaded
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        <p className="mb-2 text-xs font-black text-slate-500">
                          {employee.documents?.length || 0} files
                        </p>

                        <div className="flex max-w-[260px] flex-wrap gap-2">
                          {(employee.documents || []).slice(0, 3).map((doc, index) => (
                            <button
                              key={getDocumentKey(doc, index, 'employee-doc')}
                              type="button"
                              onClick={() => previewFile(doc, employee.id)}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
                            >
                              {doc.name}
                            </button>
                          ))}

                          {(employee.documents || []).length > 3 && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                              +{employee.documents.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        <StatusBadge status={employee.status} />
                      </td>

                      <td className="py-4 pr-4">
                        <div className="flex flex-wrap gap-2">
                          {canManage && (
                            <PrimaryButton
                              variant="outline"
                              className="py-2"
                              onClick={() => editEmployee(employee)}
                            >
                              <FiEdit /> Edit
                            </PrimaryButton>
                          )}

                          {canManage && (
                            <PrimaryButton
                              variant="outline"
                              className="py-2"
                              onClick={() => toggleStatus(employee.id)}
                            >
                              <FiPower />{' '}
                              {employee.status === 'Active'
                                ? 'Deactivate'
                                : 'Activate'}
                            </PrimaryButton>
                          )}

                          {canManage && (
                            <PrimaryButton
                              variant="danger"
                              className="py-2"
                              onClick={() => deleteEmployee(employee.id)}
                            >
                              <FiTrash2 />
                            </PrimaryButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {visibleEmployees.length === 0 && !loading && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
              No employee records found.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}










