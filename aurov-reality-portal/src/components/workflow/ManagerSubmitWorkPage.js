// import { useEffect, useRef, useState } from 'react';
// import {
//   FiCheckCircle,
//   FiDownload,
//   FiFileText,
//   FiSend,
//   FiUploadCloud,
//   FiXCircle,
// } from 'react-icons/fi';

// import PageHeader from '../ui/PageHeader.js';
// import SectionCard from '../ui/SectionCard.js';
// import PrimaryButton from '../ui/PrimaryButton.js';
// import StatusBadge from '../ui/StatusBadge.js';
// import StatCard from '../ui/StatCard.js';
// import { submittedWorkApi } from '../../services/api.js';

// export default function ManagerSubmitWorkPage({ department, title }) {
//   const fileRef = useRef(null);
//   const [file, setFile] = useState(null);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [submitting, setSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [submissions, setSubmissions] = useState([]);
//   const [form, setForm] = useState({
//     title: '',
//     description: '',
//     submissionDate: new Date().toISOString().slice(0, 10),
//   });

//   const loadSubmissions = async () => {
//     try {
//       setLoading(true);
//       const res = await submittedWorkApi.getMy();
//       setSubmissions(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       setMessage({
//         type: 'error',
//         text: error.message || 'Unable to load submitted work history.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSubmissions();
//   }, []);

//   const submittedCount = submissions.filter(
//     (work) => work.status === 'Submitted' || work.status === 'Reviewed'
//   ).length;
//   const approvedCount = submissions.filter((work) => work.status === 'Approved').length;
//   const rejectedCount = submissions.filter((work) => work.status === 'Rejected').length;

//   const selectFile = (event) => {
//     const selected = event.target.files?.[0] || null;
//     setMessage({ type: '', text: '' });

//     if (!selected) {
//       setFile(null);
//       return;
//     }

//     const isPdf =
//       selected.type === 'application/pdf' ||
//       /\.pdf$/i.test(selected.name || '');

//     if (!isPdf) {
//       setFile(null);
//       if (fileRef.current) {
//         fileRef.current.value = '';
//       }
//       setMessage({
//         type: 'error',
//         text: 'Only PDF files are allowed for submitted work.',
//       });
//       return;
//     }

//     setFile(selected);
//   };

//   const submit = async (event) => {
//     event.preventDefault();
//     setMessage({ type: '', text: '' });

//     if (!form.title.trim()) {
//       setMessage({ type: 'error', text: 'Please enter the work title.' });
//       return;
//     }

//     if (!form.description.trim()) {
//       setMessage({ type: 'error', text: 'Please enter the work description.' });
//       return;
//     }

//     if (!form.submissionDate) {
//       setMessage({ type: 'error', text: 'Please select the submission date.' });
//       return;
//     }

//     if (!file) {
//       setMessage({
//         type: 'error',
//         text: 'Please select a PDF file before submitting work.',
//       });
//       return;
//     }

//     const data = new FormData();
//     data.append('title', form.title.trim());
//     data.append('description', form.description.trim());
//     data.append('submissionDate', form.submissionDate);
//     data.append('department', department);
//     data.append('pdf', file);

//     setSubmitting(true);

//     try {
//       const res = await submittedWorkApi.submit(data);
//       const work = res.data;

//       setMessage({
//         type: 'success',
//         text:
//           'Work submitted successfully to MD and Operational Head. Submission ID: ' +
//           (work?.submissionCode || work?.id || ''),
//       });

//       setForm({
//         title: '',
//         description: '',
//         submissionDate: new Date().toISOString().slice(0, 10),
//       });
//       setFile(null);
//       if (fileRef.current) {
//         fileRef.current.value = '';
//       }

//       await loadSubmissions();
//     } catch (error) {
//       setMessage({
//         type: 'error',
//         text:
//           error.message ||
//           'Unable to submit work. Please check all fields and try again.',
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const downloadPdf = async (work) => {
//     try {
//       setMessage({ type: '', text: '' });
//       await submittedWorkApi.downloadPdf(
//         work.id,
//         work.pdf?.name || `${work.title || 'submitted-work'}.pdf`
//       );
//     } catch (error) {
//       setMessage({
//         type: 'error',
//         text: error.message || 'Unable to download PDF.',
//       });
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title={title}
//         subtitle={`Submit completed ${department} department work with PDF attachment. It is saved in backend database and appears for Managing Director and Operational Head.`}
//       />

//       {loading && (
//         <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
//           Loading submitted work history...
//         </div>
//       )}

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard label="Total Submitted" value={submissions.length} icon={FiFileText} trend="My work submissions" />
//         <StatCard label="Pending Review" value={submittedCount} icon={FiFileText} trend="Submitted / reviewed" />
//         <StatCard label="Approved" value={approvedCount} icon={FiCheckCircle} trend="Approved by MD/OH" />
//         <StatCard label="Rejected" value={rejectedCount} icon={FiXCircle} trend="Needs correction" />
//       </div>

//       <div className="mt-6 grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)]">
//         <SectionCard title="Submit Completed Work" subtitle="Fill all fields, attach one PDF, then submit to leadership.">
//           {message.text && (
//             <div className={`mb-4 rounded-2xl border p-3 text-sm font-black ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
//               {message.text}
//             </div>
//           )}

//           <form onSubmit={submit} className="space-y-4">
//             <label className="block">
//               <span className="mb-2 block text-sm font-extrabold text-slate-700">Work Title *</span>
//               <input
//                 value={form.title}
//                 onChange={(event) => setForm({ ...form, title: event.target.value })}
//                 className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
//                 placeholder="Example: Monthly department closure report"
//               />
//             </label>

//             <label className="block">
//               <span className="mb-2 block text-sm font-extrabold text-slate-700">Description *</span>
//               <textarea
//                 rows={4}
//                 value={form.description}
//                 onChange={(event) => setForm({ ...form, description: event.target.value })}
//                 className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
//                 placeholder="Write completed work summary, outcomes, and next steps"
//               />
//             </label>

//             <div className="grid gap-4 sm:grid-cols-2">
//               <label className="block">
//                 <span className="mb-2 block text-sm font-extrabold text-slate-700">Submission Date *</span>
//                 <input
//                   type="date"
//                   value={form.submissionDate}
//                   onChange={(event) => setForm({ ...form, submissionDate: event.target.value })}
//                   className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
//                 />
//               </label>

//               <label className="block">
//                 <span className="mb-2 block text-sm font-extrabold text-slate-700">Department</span>
//                 <input
//                   value={department}
//                   readOnly
//                   className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 outline-none"
//                 />
//               </label>
//             </div>

//             <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
//               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <p className="font-black text-slate-900">PDF Attachment *</p>
//                   <p className="mt-1 text-xs font-bold text-slate-500">{file ? file.name : 'No PDF selected yet.'}</p>
//                 </div>

//                 <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#1E5EFF]">
//                   <FiUploadCloud /> Select PDF
//                   <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={selectFile} />
//                 </label>
//               </div>
//             </div>

//             <PrimaryButton type="submit" variant="green" className="w-full" disabled={submitting}>
//               <FiSend /> {submitting ? 'Submitting Work...' : 'Submit Work to MD/OH'}
//             </PrimaryButton>
//           </form>
//         </SectionCard>

//         <SectionCard title="My Submitted Work History" subtitle="Review status from Managing Director and Operational Head.">
//           <div className="table-wrap">
//             <table className="min-w-[920px] w-full text-left">
//               <thead>
//                 <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
//                   <th className="py-4 pr-4">Submission</th>
//                   <th className="py-4 pr-4">Department</th>
//                   <th className="py-4 pr-4">Date</th>
//                   <th className="py-4 pr-4">PDF</th>
//                   <th className="py-4 pr-4">Status</th>
//                   <th className="py-4 pr-4">Remarks</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {submissions.map((work) => (
//                   <tr key={work.id} className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top">
//                     <td className="py-4 pr-4">
//                       <p className="font-black text-slate-900">{work.title}</p>
//                       <p className="text-xs text-slate-500">{work.submissionCode || work.id}</p>
//                       <p className="max-w-[300px] truncate text-xs text-slate-400">{work.description}</p>
//                     </td>
//                     <td className="py-4 pr-4">{work.department}</td>
//                     <td className="py-4 pr-4">{work.submissionDate}</td>
//                     <td className="py-4 pr-4">
//                       {work.pdf ? (
//                         <PrimaryButton variant="outline" className="py-2" onClick={() => downloadPdf(work)}>
//                           <FiDownload /> Download
//                         </PrimaryButton>
//                       ) : '-'}
//                     </td>
//                     <td className="py-4 pr-4"><StatusBadge status={work.status} /></td>
//                     <td className="py-4 pr-4"><p className="max-w-[260px] text-xs leading-5 text-slate-500">{work.remarks || '-'}</p></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {!loading && submissions.length === 0 && (
//             <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No work submissions yet.</p>
//           )}
//         </SectionCard>
//       </div>
//     </div>
//   );
// }




import { useEffect, useRef, useState } from 'react';
import {
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiSend,
  FiUploadCloud,
  FiXCircle,
} from 'react-icons/fi';

import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import StatusBadge from '../ui/StatusBadge.js';
import StatCard from '../ui/StatCard.js';
import { submittedWorkApi } from '../../services/api.js';

export default function ManagerSubmitWorkPage({ department, title }) {
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    submissionDate: new Date().toISOString().slice(0, 10),
  });

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const res = await submittedWorkApi.getMy();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      setSubmissions(list);
    } catch (error) {
      setSubmissions([]);
      setMessage({
        type: 'error',
        text: error.message || 'Unable to load submitted work history.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const submittedCount = submissions.filter(
    (work) => work.status === 'Submitted' || work.status === 'Reviewed'
  ).length;

  const approvedCount = submissions.filter((work) => work.status === 'Approved').length;
  const rejectedCount = submissions.filter((work) => work.status === 'Rejected').length;

  const updateForm = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  };

  const selectFile = (event) => {
    const selected = event.target.files?.[0] || null;
    setMessage({ type: '', text: '' });

    if (!selected) {
      setFile(null);
      return;
    }

    const isPdf =
      selected.type === 'application/pdf' ||
      /\.pdf$/i.test(selected.name || '');

    if (!isPdf) {
      setFile(null);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      setMessage({
        type: 'error',
        text: 'Only PDF files are allowed for submitted work.',
      });

      return;
    }

    setFile(selected);
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter the work title.' });
      return;
    }

    if (!form.description.trim()) {
      setMessage({ type: 'error', text: 'Please enter the work description.' });
      return;
    }

    if (!form.submissionDate) {
      setMessage({ type: 'error', text: 'Please select the submission date.' });
      return;
    }

    if (!file) {
      setMessage({
        type: 'error',
        text: 'Please select a PDF file before submitting work.',
      });
      return;
    }

    const data = new FormData();
    data.append('title', form.title.trim());
    data.append('description', form.description.trim());
    data.append('submissionDate', form.submissionDate);
    data.append('department', department);
    data.append('pdf', file);

    setSubmitting(true);

    try {
      const res = await submittedWorkApi.submit(data);
      const work = res?.data || res;

      setMessage({
        type: 'success',
        text:
          'Work submitted successfully to MD and Operational Head. Submission ID: ' +
          (work?.submissionCode || work?.id || ''),
      });

      setForm({
        title: '',
        description: '',
        submissionDate: new Date().toISOString().slice(0, 10),
      });

      setFile(null);

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      await loadSubmissions();
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error.message ||
          'Unable to submit work. Please check all fields and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = async (work) => {
    try {
      setMessage({ type: '', text: '' });

      const filename =
        work?.pdf?.name ||
        work?.pdfName ||
        `${work?.title || 'submitted-work'}.pdf`;

      await submittedWorkApi.downloadPdf(work.id, filename);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to download PDF.',
      });
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={`Submit completed ${department} department work with PDF attachment. It is saved in backend database and appears for Managing Director and Operational Head.`}
      />

      {loading && (
        <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
          Loading submitted work history...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Submitted"
          value={submissions.length}
          icon={FiFileText}
          trend="My work submissions"
        />

        <StatCard
          label="Pending Review"
          value={submittedCount}
          icon={FiFileText}
          trend="Submitted / reviewed"
        />

        <StatCard
          label="Approved"
          value={approvedCount}
          icon={FiCheckCircle}
          trend="Approved by MD/OH"
        />

        <StatCard
          label="Rejected"
          value={rejectedCount}
          icon={FiXCircle}
          trend="Needs correction"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)]">
        <SectionCard
          title="Submit Completed Work"
          subtitle="Fill all fields, attach one PDF, then submit to leadership."
        >
          {message.text && (
            <div
              className={`mb-4 rounded-2xl border p-3 text-sm font-black ${
                message.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Work Title *
              </span>

              <input
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                placeholder="Example: Monthly department closure report"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Description *
              </span>

              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                placeholder="Write completed work summary, outcomes, and next steps"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Submission Date *
                </span>

                <input
                  type="date"
                  value={form.submissionDate}
                  onChange={(event) => updateForm('submissionDate', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Department
                </span>

                <input
                  value={department}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 outline-none"
                />
              </label>
            </div>

            <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-slate-900">PDF Attachment *</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {file ? file.name : 'No PDF selected yet.'}
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#1E5EFF]">
                  <FiUploadCloud /> Select PDF

                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={selectFile}
                  />
                </label>
              </div>
            </div>

            <PrimaryButton
              type="submit"
              variant="green"
              className="w-full"
              disabled={submitting}
            >
              <FiSend /> {submitting ? 'Submitting Work...' : 'Submit Work to MD/OH'}
            </PrimaryButton>
          </form>
        </SectionCard>

        <SectionCard
          title="My Submitted Work History"
          subtitle="Review status from Managing Director and Operational Head."
        >
          <div className="table-wrap">
            <table className="min-w-[920px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Submission</th>
                  <th className="py-4 pr-4">Department</th>
                  <th className="py-4 pr-4">Date</th>
                  <th className="py-4 pr-4">PDF</th>
                  <th className="py-4 pr-4">Status</th>
                  <th className="py-4 pr-4">Remarks</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((work) => (
                  <tr
                    key={work.id}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700 align-top"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-black text-slate-900">{work.title}</p>
                      <p className="text-xs text-slate-500">
                        {work.submissionCode || work.id}
                      </p>
                      <p className="max-w-[300px] truncate text-xs text-slate-400">
                        {work.description}
                      </p>
                    </td>

                    <td className="py-4 pr-4">{work.department}</td>

                    <td className="py-4 pr-4">
                      {work.submissionDate || work.createdAt || '-'}
                    </td>

                    <td className="py-4 pr-4">
                      {work.pdf || work.pdfName ? (
                        <PrimaryButton
                          variant="outline"
                          className="py-2"
                          onClick={() => downloadPdf(work)}
                        >
                          <FiDownload /> Download
                        </PrimaryButton>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      <StatusBadge status={work.status} />
                    </td>

                    <td className="py-4 pr-4">
                      <p className="max-w-[260px] text-xs leading-5 text-slate-500">
                        {work.remarks || '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && submissions.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
              No work submissions yet.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}