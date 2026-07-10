import { useEffect, useMemo, useRef, useState } from 'react';
import { FiFileText, FiSearch, FiSend, FiUploadCloud } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { useAuth } from '../../context/AuthContext.js';
import { isSuperRole } from '../../constants/roles.js';
import { managerTaskApi } from '../../services/api.js';

const TITLE = 'Assign Tasks to Managers';

function getManagerDepartment(role) {
  if (role === 'Sales Manager') return 'Sales';
  if (role === 'Marketing Manager') return 'Marketing';
  if (role === 'CRM Manager') return 'CRM';
  if (role === 'Accounts Manager') return 'Accounts';
  if (role === 'HR Manager') return 'HR';
  return '';
}

export default function MdOhAssignManagerTasks() {
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [search, setSearch] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [managers, setManagers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [form, setForm] = useState({
    title: '',
    assigneeId: '',
    due: '',
  });

  const currentRole = user?.role || '';
  const canAssign = isSuperRole(currentRole);

  const loadData = async () => {
    try {
      setLoading(true);
      const [managerRes, taskRes] = await Promise.all([
        managerTaskApi.getManagers(),
        managerTaskApi.getAll(),
      ]);
      setManagers(managerRes?.data || []);
      setTasks(taskRes?.data || []);
    } catch (error) {
      setMessage(error.message || 'Unable to load assigned work data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tasks.filter((task) => {
      if (!q) return true;

      return [
        task.id,
        task.taskCode,
        task.title,
        task.assignee,
        task.assigneeEmployeeId,
        task.assigneeRole,
        task.department,
        task.status,
        task.pdfName,
        task.assignedBy,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [search, tasks]);

  const selectedManager = managers.find(
    (employee) => String(employee.id) === String(form.assigneeId)
  );

  const submitTask = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!canAssign) {
      setMessage('Only Managing Director and Operational Head can assign tasks to managers.');
      return;
    }

    if (!form.title.trim()) {
      setMessage('Please enter task title.');
      return;
    }

    if (!form.assigneeId) {
      setMessage('Please select manager.');
      return;
    }

    if (!file) {
      setMessage('Please upload assignment PDF.');
      return;
    }

    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setMessage('Only PDF files are allowed.');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('assigneeId', form.assigneeId);
      formData.append('due', form.due || '');
      formData.append('pdf', file);

      const res = await managerTaskApi.create(formData);
      const assigned = res?.data;

      setTasks((old) => [assigned, ...old]);
      setMessage(
        `Task assigned successfully to ${assigned?.assignee || selectedManager?.name}.`
      );
      setForm({ title: '', assigneeId: '', due: '' });
      setFile(null);

      if (fileRef.current) {
        fileRef.current.value = '';
      }
    } catch (error) {
      setMessage(error.message || 'Unable to assign task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={TITLE}
        subtitle="Managing Director and Operational Head can assign PDF work to Sales Manager, Marketing Manager, CRM Manager, Accounts Manager, and HR Manager."
      />

      {!canAssign && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-700">
          Only Managing Director and Operational Head can access this task assignment page.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <SectionCard
          title="Assign PDF Task"
          subtitle="Select manager, upload PDF, and assign work."
        >
          {message && (
            <p className="mb-4 rounded-2xl bg-blue-50 p-3 text-sm font-black text-[#0B3D91]">
              {message}
            </p>
          )}

          <form onSubmit={submitTask} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Work Title
              </span>

              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                placeholder="Enter task title"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Select Manager
              </span>

              <select
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              >
                <option value="">Choose manager</option>
                {managers.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.employeeId || employee.id} - {employee.name} - {employee.role}
                  </option>
                ))}
              </select>
            </label>

            {selectedManager && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">
                <p><b>Manager:</b> {selectedManager.name}</p>
                <p><b>Employee ID:</b> {selectedManager.employeeId || selectedManager.id}</p>
                <p><b>Role:</b> {selectedManager.role}</p>
                <p><b>Department:</b> {selectedManager.department || getManagerDepartment(selectedManager.role)}</p>
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Due Date
              </span>

              <input
                type="date"
                value={form.due}
                onChange={(e) => setForm({ ...form, due: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>

            <div className="rounded-[24px] border border-dashed border-[#0B7A8F]/40 bg-[#F0FDFA] p-4">
              <p className="font-black text-slate-900">Assignment PDF</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Only PDF files are allowed.
              </p>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#0B3D91] px-4 py-3 text-sm font-black text-white">
                <FiUploadCloud /> {file ? file.name : 'Select PDF'}

                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    if (
                      selected &&
                      selected.type !== 'application/pdf' &&
                      !/\.pdf$/i.test(selected.name)
                    ) {
                      setMessage('Only PDF files are allowed.');
                      e.target.value = '';
                      setFile(null);
                      return;
                    }
                    setFile(selected);
                  }}
                />
              </label>
            </div>

            <PrimaryButton
              type="submit"
              variant="green"
              className="w-full"
              disabled={!canAssign || saving}
            >
              <FiSend /> {saving ? 'Assigning...' : 'Assign PDF'}
            </PrimaryButton>
          </form>
        </SectionCard>

        <SectionCard
          title="Assigned Manager Tasks"
          subtitle="Tasks assigned by Managing Director or Operational Head to department managers."
          action={
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
              <FiSearch className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 bg-transparent text-sm font-bold outline-none"
                placeholder="Search tasks"
              />
            </div>
          }
        >
          {loading ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
              Loading assigned work...
            </p>
          ) : (
            <>
              <div className="table-wrap">
                <table className="min-w-[980px] w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                      <th className="py-4 pr-4">Task</th>
                      <th className="py-4 pr-4">Manager</th>
                      <th className="py-4 pr-4">Role / Department</th>
                      <th className="py-4 pr-4">PDF</th>
                      <th className="py-4 pr-4">Due</th>
                      <th className="py-4 pr-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b border-slate-100 text-sm font-bold text-slate-700"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-black text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.taskCode || task.id}</p>
                          <p className="text-xs text-slate-400">
                            Assigned by: {task.assignedByRole || task.assignedBy || '-'}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          {task.assignee}
                          <br />
                          <span className="text-xs text-slate-500">
                            {task.assigneeEmployeeId}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          <p>{task.assigneeRole || '-'}</p>
                          <p className="text-xs text-slate-500">{task.department || '-'}</p>
                        </td>

                        <td className="py-4 pr-4">
                          <button
                            type="button"
                            onClick={() => managerTaskApi.downloadPdf(task.id, task.pdfName || 'Assignment.pdf')}
                            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#0B3D91]"
                          >
                            <FiFileText /> {task.pdfName || 'Assignment.pdf'}
                          </button>
                        </td>

                        <td className="py-4 pr-4">{task.due || '-'}</td>

                        <td className="py-4 pr-4">
                          <StatusBadge status={task.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTasks.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No assigned manager tasks found.
                </p>
              )}
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
