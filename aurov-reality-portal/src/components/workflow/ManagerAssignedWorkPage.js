import { useEffect, useMemo, useState } from 'react';
import { FiClock, FiDownload, FiSearch } from 'react-icons/fi';

import PageHeader from '../ui/PageHeader.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import SectionCard from '../ui/SectionCard.js';
import StatusBadge from '../ui/StatusBadge.js';
import { managerTaskApi } from '../../services/api.js';

const STATUS_ACTIONS = {
  Assigned: ['In Progress', 'Submitted'],
  'In Progress': ['Submitted', 'Completed'],
  Submitted: ['Completed', 'Closed'],
  Completed: ['Closed'],
};

export default function ManagerAssignedWorkPage({ title, managerRole }) {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await managerTaskApi.getMyTasks();
      const data = Array.isArray(response?.data) ? response.data : [];
      setTasks(data.filter((task) => !managerRole || task.assigneeRole === managerRole));
    } catch (error) {
      setMessage(error.message || 'Unable to load assigned work.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return tasks;
    }

    return tasks.filter((task) =>
      [
        task.taskCode,
        task.title,
        task.assignee,
        task.assigneeEmployeeId,
        task.assigneeRole,
        task.department,
        task.status,
        task.assignedByRole,
        task.assignedBy,
        task.pdfName,
        task.due,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search, tasks]);

  const updateStatus = async (taskId, status) => {
    try {
      setUpdatingId(taskId);
      setMessage('');
      await managerTaskApi.updateStatus(taskId, status);
      await loadTasks();
      setMessage('Work status updated to ' + status + '.');
    } catch (error) {
      setMessage(error.message || 'Unable to update work status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle="Track work assigned by Managing Director or Operational Head, download the PDF, and keep the status updated."
      />

      <SectionCard
        title="Assigned Work"
        subtitle="Manager work assignments from leadership."
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <FiSearch className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-56 bg-transparent text-sm font-bold outline-none"
              placeholder="Search assigned work"
            />
          </div>
        }
      >
        {message && (
          <p className="mb-4 rounded-2xl bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">
            {message}
          </p>
        )}

        {loading && (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            Loading assigned work...
          </p>
        )}

        {!loading && (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const actions = STATUS_ACTIONS[task.status] || [];

              return (
                <div key={task.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-black text-slate-900">{task.title}</p>
                        <StatusBadge status={task.status || 'Assigned'} />
                      </div>

                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {task.taskCode || task.id}
                      </p>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-600">
                        <span>Assigned by: {task.assignedByRole || task.assignedBy || '-'}</span>
                        <span>Department: {task.department || '-'}</span>
                        <span>Role: {task.assigneeRole || '-'}</span>
                        <span className="inline-flex items-center gap-2"><FiClock /> Due: {task.due || '-'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <PrimaryButton
                        variant="outline"
                        className="py-2"
                        onClick={() => managerTaskApi.downloadPdf(task.id, task.pdfName || 'Assignment.pdf')}
                      >
                        <FiDownload /> Download PDF
                      </PrimaryButton>
                    </div>
                  </div>

                  {actions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {actions.map((status) => (
                        <PrimaryButton
                          key={status}
                          variant={status === 'Closed' ? 'outline' : status === 'Completed' ? 'green' : 'primary'}
                          className="py-2"
                          disabled={updatingId === task.id}
                          onClick={() => updateStatus(task.id, status)}
                        >
                          {updatingId === task.id ? 'Updating...' : status}
                        </PrimaryButton>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                No assigned work found.
              </p>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
