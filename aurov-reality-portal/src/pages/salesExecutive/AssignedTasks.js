import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiCheckCircle,
  FiDownload,
  FiSearch,
  FiUploadCloud,
} from 'react-icons/fi';

import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { salesExecutiveTaskApi } from '../../services/api.js';

const TITLE = 'Assigned Tasks';

export default function SalesExecutiveAssignedTasks() {
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateInput = useRef({});
  const completionInput = useRef({});

  const loadTasks = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const data = await salesExecutiveTaskApi.getMine();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to load assigned tasks.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return tasks;

    return tasks.filter((task) =>
      [
        task.id,
        task.title,
        task.status,
        task.assignedBy,
        task.assignedByName,
        task.pdfName,
        task.updatePdfName,
        task.completionPdfName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [search, tasks]);

  const updateStatus = async (task, status) => {
    try {
      const updatedTask = await salesExecutiveTaskApi.updateStatus(task.id, status);

      setTasks((old) =>
        old.map((item) => (item.id === task.id ? updatedTask : item))
      );

      setMessage({
        type: 'success',
        text:
          status === 'Submitted'
            ? 'Work submitted to sales manager successfully.'
            : 'Task status updated successfully.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to update task status.',
      });
    }
  };

  const upload = async (task, file, kind) => {
    if (!file) return;

    try {
      const updatedTask = await salesExecutiveTaskApi.uploadPdf(task.id, file, kind);

      setTasks((old) =>
        old.map((item) => (item.id === task.id ? updatedTask : item))
      );

      setMessage({
        type: 'success',
        text:
          kind === 'completion'
            ? 'Completion PDF uploaded successfully.'
            : 'Work update submitted to sales manager successfully.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to upload PDF.',
      });
    }
  };

  const downloadTaskPdf = async (task, kind) => {
    try {
      await salesExecutiveTaskApi.downloadPdf(task, kind);
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
        title={TITLE}
        subtitle="All PDF work assigned by your manager. Submit update files, upload completion PDFs, and track task progress from this page."
      />

      {message && (
        <div
          className={`mb-4 rounded-2xl border p-4 text-sm font-bold ${
            message.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
          Loading assigned tasks...
        </div>
      )}

      <SectionCard
        title="Assigned Tasks"
        subtitle="Download assigned PDF, submit update PDF to sales manager, upload completion PDF, and update task status."
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <FiSearch className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 bg-transparent text-sm font-bold outline-none"
              placeholder="Search assigned tasks"
            />
          </div>
        }
      >
        <div className="grid gap-4">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-black text-slate-900">{task.title}</p>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {task.id} · {task.pdfName || 'Assignment PDF'}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Assigned by {task.assignedByName || task.assignedBy || 'Manager'} · Due {task.due || '-'}
                  </p>
                </div>

                <StatusBadge status={task.status} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
                <select
                  value={task.status || 'Pending'}
                  onChange={(e) => updateStatus(task, e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none"
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Submitted</option>
                  <option>Completed</option>
                </select>

                <div className="flex flex-wrap gap-2">
                  <PrimaryButton
                    variant="outline"
                    className="py-2"
                    onClick={() => downloadTaskPdf(task, 'assignment')}
                  >
                    <FiDownload /> Download Assigned PDF
                  </PrimaryButton>

                  <PrimaryButton
                    variant="outline"
                    className="py-2"
                    onClick={() => updateInput.current[task.id]?.click()}
                  >
                    <FiUploadCloud /> Submit Update PDF
                  </PrimaryButton>

                  <input
                    ref={(el) => {
                      updateInput.current[task.id] = el;
                    }}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => upload(task, e.target.files?.[0], 'update')}
                  />

                  <PrimaryButton
                    variant="green"
                    className="py-2"
                    onClick={() => completionInput.current[task.id]?.click()}
                  >
                    <FiCheckCircle /> Upload Completion PDF
                  </PrimaryButton>

                  <input
                    ref={(el) => {
                      completionInput.current[task.id] = el;
                    }}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => upload(task, e.target.files?.[0], 'completion')}
                  />
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
              No assigned tasks found.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
