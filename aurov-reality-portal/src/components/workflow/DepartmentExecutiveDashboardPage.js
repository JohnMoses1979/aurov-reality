import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiSearch,
  FiUploadCloud,
} from 'react-icons/fi';

import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import StatCard from '../ui/StatCard.js';
import StatusBadge from '../ui/StatusBadge.js';
import PrimaryButton from '../ui/PrimaryButton.js';

export default function DepartmentExecutiveDashboardPage({ title, roleLabel, dashboardApi }) {
  const [search, setSearch] = useState('');
  const [myTasks, setMyTasks] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const updateInput = useRef({});
  const completionInput = useRef({});

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage('');

      const data = await dashboardApi.getDashboard();
      setMyTasks(Array.isArray(data?.tasks) ? data.tasks : []);
      setMyComplaints(Array.isArray(data?.complaints) ? data.complaints : []);
    } catch (error) {
      setMessage(error.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return myTasks;

    return myTasks.filter((task) =>
      [
        task.title,
        task.id,
        task.status,
        task.pdfName,
        task.updatePdfName,
        task.completionPdfName,
        task.assignedByName,
        task.assignedBy,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [myTasks, search]);

  const completedTasks = myTasks.filter((task) =>
    ['Completed', 'Approved', 'Closed'].includes(task.status)
  );

  const progress = myTasks.length
    ? Math.round((completedTasks.length / myTasks.length) * 100)
    : 0;

  const updateLocalTask = (updatedTask) => {
    setMyTasks((old) => old.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const updateStatus = async (task, status) => {
    try {
      const updatedTask = await dashboardApi.updateTaskStatus(task.id, status);
      updateLocalTask(updatedTask);
      setMessage(
        status === 'Submitted'
          ? 'Work submitted to ' + roleLabel.toLowerCase() + ' successfully.'
          : 'Task status updated successfully.'
      );
    } catch (error) {
      setMessage(error.message || 'Unable to update task status.');
    }
  };

  const handleUpload = async (task, file, kind) => {
    if (!file) return;

    try {
      const updatedTask = await dashboardApi.uploadTaskPdf(task.id, file, kind);
      updateLocalTask(updatedTask);
      setMessage(
        kind === 'completion'
          ? 'Completion PDF uploaded successfully.'
          : 'Work update submitted to ' + roleLabel.toLowerCase() + ' successfully.'
      );
    } catch (error) {
      setMessage(error.message || 'Unable to upload PDF.');
    }
  };

  const downloadTaskPdf = async (task, kind) => {
    try {
      await dashboardApi.downloadTaskPdf(task, kind);
    } catch (error) {
      setMessage(error.message || 'Unable to download PDF.');
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle="Personal executive workspace with assigned PDFs, live task status updates, completion uploads, and complaint tracking."
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
        <StatCard label="Assigned Tasks" value={myTasks.length} icon={FiBriefcase} trend="Tasks from manager" />
        <StatCard label="In Progress" value={myTasks.filter((task) => task.status === 'In Progress').length} icon={FiClock} trend="Currently active" />
        <StatCard label="Completed" value={completedTasks.length} icon={FiCheckCircle} trend="Completed / approved / closed" />
        <StatCard label="My Progress" value={progress + '%'} icon={FiFileText} trend="Completed / Assigned" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Assigned Tasks"
          subtitle={'Download ' + roleLabel + ' PDF, update status, upload update PDF, and submit completion PDF.'}
          action={
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
              <FiSearch className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-44 bg-transparent text-sm font-bold outline-none"
                placeholder="Search tasks"
              />
            </div>
          }
        >
          <div className="space-y-4">
            {visibleTasks.map((task) => (
              <div key={task.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-black text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{task.id} · Assigned by {task.assignedByName || task.assignedBy || 'Manager'}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">PDF: {task.pdfName || task.assignmentPdf?.name || 'Assignment.pdf'}</p>
                  </div>
                  <StatusBadge status={task.status || 'Pending'} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
                  <select
                    value={task.status || 'Pending'}
                    onChange={(event) => updateStatus(task, event.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Submitted</option>
                    <option>Completed</option>
                  </select>

                  <div className="flex flex-wrap gap-2">
                    <PrimaryButton variant="outline" className="py-2" onClick={() => downloadTaskPdf(task, 'assignment')}>
                      Download PDF
                    </PrimaryButton>

                    <PrimaryButton variant="outline" className="py-2" onClick={() => updateInput.current[task.id]?.click()}>
                      <FiUploadCloud /> Submit Update PDF
                    </PrimaryButton>
                    <input
                      ref={(el) => {
                        updateInput.current[task.id] = el;
                      }}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(event) => handleUpload(task, event.target.files?.[0], 'update')}
                    />

                    <PrimaryButton variant="green" className="py-2" onClick={() => completionInput.current[task.id]?.click()}>
                      <FiCheckCircle /> Upload Completion PDF
                    </PrimaryButton>
                    <input
                      ref={(el) => {
                        completionInput.current[task.id] = el;
                      }}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(event) => handleUpload(task, event.target.files?.[0], 'completion')}
                    />
                  </div>
                </div>
              </div>
            ))}

            {visibleTasks.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                No assigned tasks found.
              </p>
            )}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="My Task Updates" subtitle="Uploaded update and completion PDFs.">
            <div className="space-y-3">
              {myTasks
                .filter((task) => task.updatePdfName || task.completionPdfName || task.updatePdf || task.completionPdf || task.status !== 'Pending')
                .slice(0, 8)
                .map((task) => (
                  <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-900">{task.title}</p>
                        <p className="text-xs font-bold text-slate-500">{task.updatedAt || task.submittedAt || task.createdAt || '-'}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(task.updatePdfName || task.updatePdf) && (
                        <PrimaryButton variant="outline" className="py-2" onClick={() => downloadTaskPdf(task, 'update')}>
                          Update PDF
                        </PrimaryButton>
                      )}
                      {(task.completionPdfName || task.completionPdf) && (
                        <PrimaryButton variant="outline" className="py-2" onClick={() => downloadTaskPdf(task, 'completion')}>
                          Completion PDF
                        </PrimaryButton>
                      )}
                    </div>
                  </div>
                ))}

              {myTasks.filter((task) => task.updatePdfName || task.completionPdfName || task.updatePdf || task.completionPdf || task.status !== 'Pending').length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No updates uploaded yet.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Complaints" subtitle="Your raised complaint history.">
            <div className="space-y-3">
              {myComplaints.slice(0, 6).map((complaint) => (
                <div key={complaint.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">{complaint.subject}</p>
                      <p className="text-xs font-bold text-slate-500">{complaint.createdAt || '-'}</p>
                    </div>
                    <StatusBadge status={complaint.status || 'Pending'} />
                  </div>
                </div>
              ))}

              {myComplaints.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No complaints raised yet.
                </p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
