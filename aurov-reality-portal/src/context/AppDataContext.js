import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCreatableRoles,
  getEmployeeIdPrefix,
  getManagerRoleForDepartment,
  getRoleDepartment,
  isExecutiveRole,
  isManagerRole,
  isSuperRole,
} from '../constants/roles.js';
import { getBookingOverview, getPropertyStatusData, getSalesOverview, getSalesTotals, getTaskProgressForEmployee as calculateRealTaskProgress, getVentureStats as calculateVentureStats } from '../utils/analytics.js';
import { hardcodedCustomerProperties, hardcodedCustomerVentures } from '../data/hardcodedCustomerData.js';

const STORAGE_KEY = 'aurov-reality-local-system-v6';
const LEGACY_STORAGE_KEYS = ['aurov-reality-local-system-v5', 'aurov-reality-local-system-v4', 'aurov-reality-local-system-v3'];
const AppDataContext = createContext(null);

const fallbackImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80';
const nowLabel = () => new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const dateLabel = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const makeId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

const MAX_INLINE_FILE_LENGTH = 320_000;
const MAX_INLINE_IMAGE_LENGTH = 950_000;
const FILE_DB_NAME = 'aurov-reality-file-store-v1';
const FILE_STORE_NAME = 'files';

const isBrowser = () => typeof window !== 'undefined';

const isQuotaError = (error) => error?.name === 'QuotaExceededError' || error?.code === 22 || error?.code === 1014;

const openFileDb = () => new Promise((resolve, reject) => {
  if (!isBrowser() || !('indexedDB' in window)) {
    reject(new Error('IndexedDB is not available in this browser.'));
    return;
  }
  const request = indexedDB.open(FILE_DB_NAME, 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(FILE_STORE_NAME)) db.createObjectStore(FILE_STORE_NAME, { keyPath: 'id' });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const saveFileRecord = async (id, dataUrl, meta = {}) => {
  try {
    const db = await openFileDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
      tx.objectStore(FILE_STORE_NAME).put({ id, dataUrl, meta, savedAt: new Date().toISOString() });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return true;
  } catch (error) {
    console.warn('Unable to store file in IndexedDB:', error);
    return false;
  }
};

const readFileRecord = async (id) => {
  if (!id) return '';
  try {
    const db = await openFileDb();
    const record = await new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_STORE_NAME, 'readonly');
      const request = tx.objectStore(FILE_STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return record?.dataUrl || '';
  } catch (error) {
    console.warn('Unable to read file from IndexedDB:', error);
    return '';
  }
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const compressImageFile = async (file) => {
  const original = await readFileAsDataUrl(file);
  try {
    const image = new Image();
    image.src = original;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    const maxWidth = 1200;
    const maxHeight = 850;
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    const compressed = canvas.toDataURL('image/jpeg', 0.72);
    return compressed.length < original.length ? compressed : original;
  } catch {
    return original;
  }
};

const sanitizeForLocalStorage = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeForLocalStorage);
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && value.startsWith('data:') && value.length > MAX_INLINE_IMAGE_LENGTH) return fallbackImage;
    return value;
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (key === 'dataUrl' && typeof item === 'string' && item.length > MAX_INLINE_FILE_LENGTH) return [key, ''];
    if ((key === 'image' || key === 'images') && typeof item === 'string' && item.startsWith('data:') && item.length > MAX_INLINE_IMAGE_LENGTH) return [key, fallbackImage];
    return [key, sanitizeForLocalStorage(item)];
  }));
};

const persistState = (state) => {
  if (!isBrowser()) return;
  const compact = sanitizeForLocalStorage(state);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    if (!isQuotaError(error)) {
      console.warn('Unable to persist Aurov local data:', error);
      return;
    }
    try {
      const emergency = {
        ...defaultState,
        ...compact,
        employees: (compact.employees || []).map((employee) => ({ ...employee, documents: (employee.documents || []).map((doc) => ({ ...doc, dataUrl: '' })) })),
        tasks: (compact.tasks || []).map((task) => ({
          ...task,
          assignmentPdf: task.assignmentPdf ? { ...task.assignmentPdf, dataUrl: '' } : null,
          updatePdf: task.updatePdf ? { ...task.updatePdf, dataUrl: '' } : null,
          completionPdf: task.completionPdf ? { ...task.completionPdf, dataUrl: '' } : null,
        })),
      };
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emergency));
      console.warn('Local Storage quota reached. Large inline file contents were moved/removed from the JSON state to keep the app running.');
    } catch (secondError) {
      console.warn('Aurov local data could not be persisted because browser storage is full:', secondError);
    }
  }
};


const properCase = (value = '') => {
  const clean = String(value).trim();
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

const usernameBase = (firstName = '', lastName = '') => {
  const first = String(firstName).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const last = String(lastName).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return [first, last].filter(Boolean).join('.') || `employee${Date.now().toString(36)}`;
};

const buildUniqueUsername = (firstName, lastName, employees = [], editingId = null) => {
  const base = usernameBase(firstName, lastName);
  const existing = new Set(
    employees
      .filter((employee) => employee.id !== editingId)
      .map((employee) => employee.username)
      .filter(Boolean)
      .map((item) => item.toLowerCase()),
  );
  if (!existing.has(base)) return base;
  let counter = 1;
  while (existing.has(`${base}${counter}`)) counter += 1;
  return `${base}${counter}`;
};

const buildPassword = (firstName = '') => `${properCase(firstName) || 'Employee'}@123`;

const isValidEmployeeIdForRole = (value = '', role = '') => {
  const id = String(value || '').trim().toUpperCase();
  const prefix = getEmployeeIdPrefix(role);
  return new RegExp(`^${prefix}\\d{3,}$`).test(id);
};

const nextEmployeeId = (role = '', employees = [], editingId = null) => {
  const prefix = getEmployeeIdPrefix(role);
  let max = 0;
  const used = new Set();
  employees
    .filter((employee) => employee.id !== editingId)
    .forEach((employee) => {
      [employee.employeeId, employee.id].filter(Boolean).forEach((value) => {
        const id = String(value).trim().toUpperCase();
        used.add(id);
        const match = id.match(new RegExp(`^${prefix}(\\d+)$`));
        if (match) max = Math.max(max, Number(match[1]));
      });
    });
  let counter = max + 1;
  let candidate = `${prefix}${String(counter).padStart(3, '0')}`;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `${prefix}${String(counter).padStart(3, '0')}`;
  }
  return candidate;
};

const ensureEmployeeIds = (employees = []) => {
  const normalized = employees.map((item, index) => normalizeEmployee(item, index));
  const counters = {};
  const used = new Set();

  normalized.forEach((employee) => {
    const prefix = getEmployeeIdPrefix(employee.role);
    const existing = [employee.employeeId, employee.id].find((value) => isValidEmployeeIdForRole(value, employee.role));
    if (existing) {
      const id = String(existing).trim().toUpperCase();
      used.add(id);
      const number = Number(id.replace(prefix, '')) || 0;
      counters[prefix] = Math.max(counters[prefix] || 0, number);
    }
  });

  return normalized.map((employee) => {
    const existing = [employee.employeeId, employee.id].find((value) => isValidEmployeeIdForRole(value, employee.role));
    if (existing && !used.has(`${String(existing).trim().toUpperCase()}__DUPLICATE_MARKER__`)) {
      const employeeId = String(existing).trim().toUpperCase();
      used.add(`${employeeId}__DUPLICATE_MARKER__`);
      return { ...employee, employeeId };
    }

    const prefix = getEmployeeIdPrefix(employee.role);
    let counter = (counters[prefix] || 0) + 1;
    let employeeId = `${prefix}${String(counter).padStart(3, '0')}`;
    while (used.has(employeeId) || used.has(`${employeeId}__DUPLICATE_MARKER__`)) {
      counter += 1;
      employeeId = `${prefix}${String(counter).padStart(3, '0')}`;
    }
    counters[prefix] = counter;
    used.add(employeeId);
    used.add(`${employeeId}__DUPLICATE_MARKER__`);
    return { ...employee, employeeId };
  });
};

const splitName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
};

const toAmenities = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return ['Gated community', 'Internal roads', 'Landscaped parks', 'Street lighting', 'Clear documentation'];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

const normalizeVenture = (item = {}) => {
  const image = item.image || item.imageDataUrl || item.images?.[0] || fallbackImage;
  return {
    id: item.id || makeId('V'),
    name: item.name || 'Aurov Venture',
    location: item.location || 'Hyderabad, Telangana',
    description: item.description || 'A premium Aurov Reality venture with planned infrastructure, verified inventory, customer booking workflow, and end-to-end management visibility.',
    amenities: toAmenities(item.amenities),
    image,
    images: item.images?.length ? item.images : [image],
    availableUnits: Number(item.availableUnits || 0),
    bookedUnits: Number(item.bookedUnits || 0),
    totalUnits: Number(item.totalUnits || item.availableUnits + item.bookedUnits || 0),
    startingPrice: Number(item.startingPrice || 0),
    launchLabel: item.launchLabel || '',
    category: item.category || item.type || 'Venture',
    layoutDetails: item.layoutDetails || null,
    revenue: Number(item.revenue || 0),
    type: item.type || 'Plots + Villas',
    progress: Number(item.progress || 0),
    createdBy: item.createdBy || 'Seed Data',
    createdAt: item.createdAt || 'Initial',
  };
};


const normalizeProperty = (item = {}) => ({
  id: item.id || makeId('P'),
  ventureId: item.ventureId || '',
  type: item.type || 'Plot',
  number: item.number || item.plotNumber || item.flatNumber || item.villaNumber || '',
  area: item.area || '',
  price: Number(item.price || 0),
  status: item.status || 'Available',
  facing: item.facing || '',
  floor: item.floor || '',
  bhkType: item.bhkType || item.bhk || '',
  image: item.image || item.imageDataUrl || item.images?.[0] || '',
  images: item.images?.length ? item.images : item.image ? [item.image] : [],
  layoutBlock: item.layoutBlock || '',
  createdBy: item.createdBy || '',
  createdAt: item.createdAt || nowLabel(),
  createdIso: item.createdIso || new Date().toISOString(),
  updatedAt: item.updatedAt || '',
  updatedIso: item.updatedIso || '',
  reservedAt: item.reservedAt || '',
  soldAt: item.soldAt || '',
});

const normalizeEmployee = (item = {}, index = 0) => {
  const fromName = splitName(item.name);
  const firstName = item.firstName || fromName.firstName || `Employee${index + 1}`;
  const lastName = item.lastName || fromName.lastName || '';
  const role = item.role || 'Sales Executive';
  const department = item.department || getRoleDepartment(role);
  const username = item.username || usernameBase(firstName, lastName || item.id || index + 1);
  const providedEmployeeId = item.employeeId || (isValidEmployeeIdForRole(item.id, role) ? item.id : '');
  return {
    id: item.id || providedEmployeeId || makeId('EMP'),
    employeeId: providedEmployeeId,
    firstName,
    lastName,
    name: item.name || `${firstName} ${lastName}`.trim(),
    email: item.email || '',
    mobileNumber: item.mobileNumber || item.phone || '',
    phone: item.phone || item.mobileNumber || '',
    address: item.address || '',
    profilePhoto: item.profilePhoto || item.photo || '',
    department,
    role,
    designation: item.designation || role,
    joiningDate: item.joiningDate || '',
    documents: Array.isArray(item.documents) ? item.documents : [],
    username,
    password: item.password || buildPassword(firstName),
    progress: Number(item.progress || 0),
    status: item.status || 'Active',
    createdBy: item.createdBy || 'Seed Data',
    createdAt: item.createdAt || 'Initial',
    updatedAt: item.updatedAt || '',
  };
};


const nextCustomerId = (customers = []) => {
  let max = 0;
  customers.forEach((customer) => {
    const id = String(customer.customerId || customer.id || '').toUpperCase();
    const match = id.match(/^CU(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `CU${String(max + 1).padStart(3, '0')}`;
};

const normalizeCustomer = (item = {}, index = 0) => {
  const name = item.fullName || item.name || `Customer ${index + 1}`;
  const customerId = item.customerId || (String(item.id || '').startsWith('CU') ? item.id : '');
  return {
    id: item.id || customerId || makeId('C'),
    customerId,
    fullName: name,
    name,
    mobileNumber: item.mobileNumber || item.phone || '',
    phone: item.phone || item.mobileNumber || '',
    email: item.email || '',
    username: item.username || item.mobileNumber || item.phone || '',
    password: item.password || '123456',
    address: item.address || '',
    profilePhoto: item.profilePhoto || '',
    role: 'Customer',
    status: item.status || 'Active',
    createdAt: item.createdAt || nowLabel(),
    createdIso: item.createdIso || new Date().toISOString(),
    updatedAt: item.updatedAt || '',
  };
};

const hardcodedVentures = hardcodedCustomerVentures.map(normalizeVenture);
const hardcodedProperties = hardcodedCustomerProperties.map(normalizeProperty);

const mergeById = (base = [], incoming = []) => {
  const map = new Map();
  base.forEach((item) => map.set(item.id, item));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
};

const mergeHardcodedCustomerInventory = (ventures = [], properties = []) => ({
  ventures: mergeById(hardcodedVentures, ventures),
  properties: mergeById(hardcodedProperties, properties),
});

const emptySystemState = {
  ventures: hardcodedVentures,
  properties: hardcodedProperties,
  employees: [],
  customers: [],
  bookings: [],
  leads: [],
  tasks: [],
  complaints: [],
  submittedWorks: [],
  notifications: [],
};

const seedIds = {
  ventures: new Set(['V-001', 'V-002', 'V-003', 'V-004']),
  properties: new Set(['P-101', 'P-102', 'P-103', 'P-104', 'P-105', 'P-106', 'P-107', 'P-108']),
  employees: new Set(['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005', 'EMP-006']),
  bookings: new Set(['B-7001', 'B-7002', 'B-7003', 'B-7004']),
  leads: new Set(['L-1001', 'L-1002', 'L-1003']),
  tasks: new Set(['T-901', 'T-902', 'T-903', 'T-904']),
  complaints: new Set(['CMP-01', 'CMP-02', 'CMP-03']),
  submittedWorks: new Set([]),
};

const looksSeeded = (item = {}, bucket = '') => {
  if (!item || typeof item !== 'object') return false;
  if (item.createdBy === 'Seed Data' || item.createdAt === 'Initial') return true;
  return Boolean(seedIds[bucket]?.has(item.id));
};

const stripSeedRecords = (items = [], bucket = '') => items.filter((item) => !looksSeeded(item, bucket));

const defaultState = emptySystemState;

const normalizeComplaintStatus = (status = '') => {
  if (status === 'Open') return 'Pending';
  if (status === 'Resolved') return 'Resolved';
  if (status === 'Closed') return 'Closed';
  if (status === 'In Progress') return 'In Progress';
  return status || 'Pending';
};

const normalizeComplaint = (item = {}) => ({
  id: item.id || makeId('CMP'),
  employeeId: item.employeeId || item.fromEmployeeId || '',
  employeeName: item.employeeName || item.from || '',
  employeeRole: item.employeeRole || item.role || '',
  from: item.from || item.employeeName || '',
  fromEmployeeId: item.fromEmployeeId || item.employeeId || '',
  fromEmail: item.fromEmail || '',
  fromUsername: item.fromUsername || '',
  department: item.department || getRoleDepartment(item.employeeRole || item.role || ''),
  role: item.role || item.employeeRole || '',
  target: item.target || 'Leadership',
  targetLabel: item.targetLabel || item.target || 'Leadership Review',
  audience: Array.isArray(item.audience) ? item.audience : [],
  subject: item.subject || 'Complaint',
  description: item.description || '',
  priority: item.priority || 'Medium',
  status: normalizeComplaintStatus(item.status),
  attachments: Array.isArray(item.attachments) ? item.attachments : [],
  statusHistory: Array.isArray(item.statusHistory) && item.statusHistory.length ? item.statusHistory : [{ status: normalizeComplaintStatus(item.status), note: 'Complaint created', dateTime: item.dateTime || item.createdAt || nowLabel() }],
  resolutionNotes: item.resolutionNotes || '',
  remarks: item.remarks || '',
  createdAt: item.createdAt || nowLabel(),
  createdIso: item.createdIso || new Date().toISOString(),
  dateTime: item.dateTime || item.createdAt || nowLabel(),
  updatedAt: item.updatedAt || '',
});

const normalizeSubmittedWork = (item = {}) => ({
  id: item.id || makeId('SW'),
  managerName: item.managerName || item.submittedByName || item.createdBy || 'Manager',
  managerRole: item.managerRole || item.submittedByRole || '',
  employeeId: item.employeeId || item.managerEmployeeId || '',
  employeeEmail: item.employeeEmail || item.managerEmail || '',
  department: item.department || getRoleDepartment(item.managerRole || item.submittedByRole || ''),
  title: item.title || item.workTitle || 'Submitted Work',
  description: item.description || '',
  submissionDate: item.submissionDate || dateLabel(),
  submissionIso: item.submissionIso || item.createdIso || new Date().toISOString(),
  status: item.status || 'Submitted',
  remarks: item.remarks || '',
  pdf: item.pdf || item.attachment || null,
  statusHistory: Array.isArray(item.statusHistory) && item.statusHistory.length ? item.statusHistory : [{ status: item.status || 'Submitted', remarks: item.remarks || 'Work submitted', dateTime: item.createdAt || nowLabel() }],
  createdAt: item.createdAt || nowLabel(),
  createdIso: item.createdIso || item.submissionIso || new Date().toISOString(),
  updatedAt: item.updatedAt || '',
});


const hydrateState = (data = {}) => {
  const savedVentures = stripSeedRecords(data.ventures || [], 'ventures').map(normalizeVenture);
  const savedProperties = stripSeedRecords(data.properties || [], 'properties').map(normalizeProperty);
  const { ventures, properties } = mergeHardcodedCustomerInventory(savedVentures, savedProperties);
  const employees = ensureEmployeeIds(stripSeedRecords(data.employees || [], 'employees'));
  return {
    ...defaultState,
    ventures,
    properties,
    employees,
    customers: stripSeedRecords(data.customers || [], 'customers').map(normalizeCustomer),
    bookings: stripSeedRecords(data.bookings || [], 'bookings'),
    leads: stripSeedRecords(data.leads || [], 'leads'),
    tasks: stripSeedRecords(data.tasks || [], 'tasks'),
    complaints: stripSeedRecords(data.complaints || [], 'complaints').map(normalizeComplaint),
    submittedWorks: stripSeedRecords(data.submittedWorks || [], 'submittedWorks').map(normalizeSubmittedWork),
    notifications: stripSeedRecords(data.notifications || [], 'notifications'),
  };
};

const safeRead = () => {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!raw) return defaultState;
    return hydrateState(JSON.parse(raw));
  } catch (error) {
    console.warn('Unable to read Aurov local data:', error);
    return defaultState;
  }
};

const fileToData = async (file) => {
  if (!file) return null;
  const id = makeId('DOC');
  const isImage = file.type?.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
  const dataUrl = isImage ? await compressImageFile(file) : await readFileAsDataUrl(file);
  const shouldInline = isImage ? dataUrl.length <= MAX_INLINE_IMAGE_LENGTH : dataUrl.length <= MAX_INLINE_FILE_LENGTH;
  let storageKey = '';
  if (!shouldInline || !isImage) {
    storageKey = id;
    await saveFileRecord(storageKey, dataUrl, { name: file.name, type: file.type || 'application/octet-stream' });
  }
  return {
    id,
    name: file.name,
    size: `${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB`,
    type: file.type || 'application/octet-stream',
    dataUrl: shouldInline ? dataUrl : '',
    storageKey,
    file,
    uploadedAt: nowLabel(),
  };
};

const getFileDataUrl = async (file) => {
  if (!file) return '';
  if (file.dataUrl) return file.dataUrl;
  if (file.storageKey) return readFileRecord(file.storageKey);
  return '';
};

const downloadFile = async (file, fallbackName = 'Aurov_File.pdf') => {
  if (!file) return;
  const dataUrl = await getFileDataUrl(file);
  if (!dataUrl) {
    const blob = new Blob([`Aurov Reality demo placeholder for ${file.name || fallbackName}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (file.name || fallbackName).replace(/\.pdf$/i, '.txt');
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = file.name || fallbackName;
  a.click();
};

const previewFile = async (file) => {
  if (!file) return;
  const dataUrl = await getFileDataUrl(file);
  const win = window.open('', '_blank');
  if (!win) return;
  if (!dataUrl) {
    win.document.write(`<title>${file.name || 'Preview'}</title><body style="margin:0;font-family:Inter,Arial;background:#f8fafc;color:#1e293b;display:grid;place-items:center;min-height:100vh"><div style="max-width:560px;padding:32px;border-radius:24px;background:white;box-shadow:0 20px 60px rgba(15,23,42,.12)"><h2>Preview unavailable</h2><p>This seed/demo file has metadata only. Newly uploaded files are stored in browser IndexedDB and can be previewed or downloaded.</p></div></body>`);
    return;
  }
  if (file.type?.startsWith('image/')) {
    win.document.write(`<title>${file.name}</title><body style="margin:0;background:#0f172a;display:grid;place-items:center;min-height:100vh"><img src="${dataUrl}" style="max-width:96vw;max-height:96vh;border-radius:18px" /></body>`);
  } else {
    win.document.write(`<title>${file.name}</title><iframe src="${dataUrl}" style="border:0;width:100vw;height:100vh"></iframe>`);
  }
};


const completedTaskStatuses = ['Completed', 'Approved', 'Closed'];

const taskMatchesUser = (task = {}, user = {}) => {
  const keys = [user.id, user.employeeId, user.username, user.email, user.name]
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase());
  return [task.assigneeId, task.assigneeEmployeeId, task.assigneeUsername, task.assigneeEmail, task.assignee]
    .filter(Boolean)
    .some((item) => keys.includes(String(item).trim().toLowerCase()));
};

const calculateTaskProgress = (employee = {}, tasks = []) => {
  const assignedTasks = tasks.filter((task) => taskMatchesUser(task, employee));
  const completedTasks = assignedTasks.filter((task) => completedTaskStatuses.includes(task.status));
  return {
    total: assignedTasks.length,
    completed: completedTasks.length,
    percent: assignedTasks.length ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 0,
  };
};

function getVisibleByDepartment(items, role, key = 'department') {
  if (isSuperRole(role)) return items;
  const department = getRoleDepartment(role);
  return items.filter((item) => item[key] === department || item.createdBy === role || item.assignedBy === role);
}

function taskVisibleForRole(task, role, user = {}) {
  if (isSuperRole(role)) return true;
  const department = getRoleDepartment(role);
  if (isExecutiveRole(role)) {
    return taskMatchesUser(task, user) || (!user.employeeId && !user.id && task.department === department);
  }
  if (isManagerRole(role)) return task.department === department || task.assignedBy === role;
  return false;
}


function submittedWorkVisibleForRole(work, role, user = {}) {
  if (isSuperRole(role)) return true;
  if (isManagerRole(role)) {
    const department = getRoleDepartment(role);
    const userKeys = [user.employeeId, user.id, user.email, user.name]
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase());
    const workKeys = [work.employeeId, work.employeeEmail, work.managerName]
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase());
    const exactManagerMatch = workKeys.some((item) => userKeys.includes(item));
    const demoRoleMatch = !userKeys.length && work.managerRole === role && work.department === department;
    return work.department === department && (exactManagerMatch || demoRoleMatch || work.managerRole === role);
  }
  return false;
}

function complaintVisibleForRole(complaint, role, user = {}) {
  if (!role || role === 'Customer') return false;
  const department = getRoleDepartment(role);
  const audience = complaint.audience || complaint.visibleToRoles || [];
  const target = complaint.target || complaint.targetType || '';

  if (isSuperRole(role)) {
    return !audience.length || audience.includes(role) || target === 'Leadership';
  }

  if (isManagerRole(role)) {
    const managerRole = getManagerRoleForDepartment(complaint.department || department);
    return (
      complaint.fromEmployeeId === user.employeeId ||
      complaint.fromEmail === user.email ||
      audience.includes(role) ||
      (target === 'Manager' && complaint.department === department && managerRole === role) ||
      (!audience.length && complaint.department === department)
    );
  }

  if (isExecutiveRole(role)) {
    return complaint.fromEmployeeId === user.employeeId || complaint.fromEmail === user.email || complaint.fromUsername === user.username;
  }

  return false;
}

function assertEmployeeRoleAllowed(currentRole, targetRole, editing = false) {
  if (editing && isSuperRole(currentRole)) return;
  const allowed = getCreatableRoles(currentRole);
  if (!allowed.includes(targetRole)) {
    if (isSuperRole(currentRole)) throw new Error('Managing Director and Operational Head can create department managers only. Managers create their own executives.');
    throw new Error('Managers can create only their own department executives.');
  }
}

export function AppDataProvider({ children }) {
  const [state, setState] = useState(safeRead);

  useEffect(() => {
    persistState(state);
  }, [state]);

  useEffect(() => {
    const onStorage = (event) => {
      if ((event.key === STORAGE_KEY || LEGACY_STORAGE_KEYS.includes(event.key)) && event.newValue) {
        setState(hydrateState(JSON.parse(event.newValue)));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const notify = (title, type = 'System', audience = ['Managing Director', 'Operational Head']) => {
    const notification = { id: makeId('N'), title, type, audience, createdAt: nowLabel(), read: false };
    setState((old) => ({ ...old, notifications: [notification, ...old.notifications] }));
    return notification;
  };

  const actions = useMemo(() => ({
    resetDemoData: () => setState(defaultState),

    getRoleData(role, user = {}) {
      return {
        ventures: state.ventures,
        properties: state.properties,
        employees: getVisibleByDepartment(state.employees, role),
        customers: isSuperRole(role) || role === 'Sales Manager' ? state.customers : state.customers,
        bookings: isSuperRole(role) || role === 'Sales Manager' ? state.bookings : [],
        leads: isSuperRole(role) || role === 'Sales Manager' ? state.leads : [],
        tasks: state.tasks.filter((task) => taskVisibleForRole(task, role, user)),
        complaints: state.complaints.map(normalizeComplaint).filter((complaint) => complaintVisibleForRole(complaint, role, user)),
        submittedWorks: state.submittedWorks.map(normalizeSubmittedWork).filter((work) => submittedWorkVisibleForRole(work, role, user)),
      };
    },

    getNotificationsForRole(role) {
      return state.notifications.filter((item) => !item.audience?.length || item.audience.includes(role) || isSuperRole(role));
    },

    getTaskProgressForEmployee(employee) {
      return calculateRealTaskProgress(employee, state.tasks);
    },

    getVentureStats(ventureId) {
      return calculateVentureStats(ventureId, state.properties);
    },

    getAnalytics(role = '', user = {}) {
      const data = {
        ventures: state.ventures,
        properties: state.properties,
        employees: getVisibleByDepartment(state.employees, role),
        bookings: isSuperRole(role) || role === 'Sales Manager' ? state.bookings : [],
        leads: isSuperRole(role) || role === 'Sales Manager' ? state.leads : [],
        tasks: state.tasks.filter((task) => taskVisibleForRole(task, role, user)),
      };
      const salesTotals = getSalesTotals(data.properties);
      return {
        bookingOverview: getBookingOverview(data.bookings, data.leads),
        salesOverview: getSalesOverview(data.properties),
        propertyStatus: getPropertyStatusData(data.properties),
        totalRevenue: salesTotals.totalRevenue,
        salesCount: salesTotals.salesCount,
      };
    },

    updateTaskStatus(taskId, status, currentUser = {}) {
      const allowed = ['Pending', 'In Progress', 'Completed', 'Approved', 'Rejected', 'Closed'];
      if (!allowed.includes(status)) throw new Error('Invalid task status.');
      let updatedTask;
      setState((old) => ({
        ...old,
        tasks: old.tasks.map((task) => {
          if (task.id !== taskId) return task;
          updatedTask = { ...task, status, updatedAt: nowLabel() };
          return updatedTask;
        }),
        notifications: [
          { id: makeId('N'), type: 'Task Status', title: `${currentUser?.name || 'Executive'} updated task ${taskId} to ${status}`, audience: ['Managing Director', 'Operational Head', updatedTask?.assignedBy || `${updatedTask?.department || 'Sales'} Manager`, `${updatedTask?.department || 'Sales'} Manager`], createdAt: nowLabel(), read: false },
          ...old.notifications,
        ],
      }));
      return updatedTask;
    },

    addVenture(payload, userRole = 'Managing Director') {
      const image = payload.image || fallbackImage;
      const venture = normalizeVenture({
        id: makeId('V'),
        name: payload.name,
        location: payload.location,
        description: payload.description,
        amenities: payload.amenities,
        image,
        images: payload.images?.length ? payload.images : [image],
        availableUnits: payload.availableUnits,
        bookedUnits: payload.bookedUnits,
        revenue: payload.revenue,
        type: payload.type,
        progress: payload.progress,
        createdBy: userRole,
        createdAt: nowLabel(),
      });
      setState((old) => ({
        ...old,
        ventures: [venture, ...old.ventures],
        notifications: [
          { id: makeId('N'), type: 'Venture', title: `${userRole} created new venture: ${venture.name}`, audience: ['Managing Director', 'Operational Head', 'Sales Manager', 'Customer'], createdAt: nowLabel(), read: false },
          ...old.notifications,
        ],
      }));
      return venture;
    },

    updateVenture(id, patch) {
      setState((old) => ({ ...old, ventures: old.ventures.map((venture) => venture.id === id ? normalizeVenture({ ...venture, ...patch }) : venture) }));
    },

    addProperty(payload, userRole = 'Managing Director') {
      const property = normalizeProperty({
        id: makeId('P'),
        ventureId: payload.ventureId,
        type: payload.type || 'Plot',
        number: payload.number,
        area: payload.area,
        price: payload.price,
        status: payload.status || 'Available',
        facing: payload.facing || '',
        floor: payload.floor || '',
        bhkType: payload.bhkType || '',
        image: payload.image || '',
        images: payload.image ? [payload.image] : [],
        createdBy: userRole,
        createdAt: nowLabel(),
        createdIso: new Date().toISOString(),
        soldAt: payload.status === 'Sold' ? new Date().toISOString() : '',
        reservedAt: payload.status === 'Reserved' ? new Date().toISOString() : '',
      });
      setState((old) => ({
        ...old,
        properties: [property, ...old.properties],
        notifications: [
          { id: makeId('N'), type: 'Property', title: `${userRole} added ${property.type} ${property.number}`, audience: ['Managing Director', 'Operational Head', 'Sales Manager', 'Customer'], createdAt: nowLabel(), createdIso: new Date().toISOString(), read: false },
          ...old.notifications,
        ],
      }));
      return property;
    },

    updateProperty(id, patch) {
      setState((old) => ({
        ...old,
        properties: old.properties.map((property) => {
          if (property.id !== id) return property;
          const nextStatus = patch.status || property.status;
          return normalizeProperty({
            ...property,
            ...patch,
            updatedAt: nowLabel(),
            updatedIso: new Date().toISOString(),
            soldAt: nextStatus === 'Sold' ? (property.soldAt || new Date().toISOString()) : '',
            reservedAt: nextStatus === 'Reserved' ? (property.reservedAt || new Date().toISOString()) : property.reservedAt,
          });
        }),
      }));
    },

    createCustomerLead(payload, source = 'Contact Request') {
      const venture = state.ventures.find((item) => item.id === payload.ventureId) || state.ventures.find((item) => item.name === payload.venture) || state.ventures[0];
      const property = state.properties.find((item) => item.id === payload.propertyId);
      const timestamp = nowLabel();
      const iso = new Date().toISOString();
      const manualBookingAmount = String(payload.bookingAmount ?? payload.amount ?? '').trim();
      const customer = {
        id: makeId('C'),
        name: payload.name,
        fullName: payload.name,
        phone: payload.phone,
        mobileNumber: payload.phone,
        email: payload.email || '',
        interested: venture?.name || payload.venture || 'Aurov Reality',
        budget: payload.budget || manualBookingAmount || 'Not specified',
        status: source === 'Demo Visit' ? 'Visit Scheduled' : source === 'Property Reservation' ? 'Booked' : 'New Lead',
        dateTime: timestamp,
        createdAt: timestamp,
        createdIso: iso,
      };
      const lead = {
        id: makeId('L'),
        customerName: payload.name,
        name: payload.name,
        phone: payload.phone,
        mobileNumber: payload.phone,
        email: payload.email || '',
        source,
        leadType: source,
        venture: venture?.name || payload.venture || 'Aurov Reality',
        ventureId: venture?.id || payload.ventureId || '',
        property: property ? `${property.type} ${property.number}` : payload.property || '-',
        propertyDetails: property ? `${property.type} ${property.number} · ${property.area || ''} · ₹${property.price || 0}` : payload.property || '-',
        propertyId: property?.id || payload.propertyId || '',
        date: payload.date || '',
        timeSlot: payload.timeSlot || '',
        message: payload.message || payload.remarks || '',
        remarks: payload.remarks || payload.message || '',
        bookingAmount: manualBookingAmount,
        amount: manualBookingAmount,
        paymentMode: payload.paymentMode || '',
        status: source === 'Demo Visit' ? 'Site Visit Scheduled' : 'New',
        department: 'Sales',
        dateTime: timestamp,
        createdAt: timestamp,
        createdIso: iso,
      };
      const booking = source === 'Demo Visit' || source === 'Property Reservation'
        ? {
            id: makeId(source === 'Demo Visit' ? 'SV' : 'B'),
            customer: payload.name,
            phone: payload.phone,
            email: payload.email || '',
            property: property ? `${property.type} ${property.number}` : payload.property || '-',
        propertyDetails: property ? `${property.type} ${property.number} · ${property.area || ''} · ₹${property.price || 0}` : payload.property || '-',
            venture: venture?.name || payload.venture || 'Aurov Reality',
            ventureId: venture?.id || payload.ventureId || '',
            propertyId: property?.id || payload.propertyId || '',
            amount: manualBookingAmount,
            bookingAmount: manualBookingAmount,
            paid: source === 'Property Reservation' ? manualBookingAmount : 0,
            propertyPrice: property?.price || '',
            remarks: payload.remarks || payload.message || '',
            status: source === 'Demo Visit' ? 'Site Visit' : 'Pending',
            type: source === 'Demo Visit' ? 'Site Visit' : 'Reservation',
            source,
            date: payload.date || dateLabel(),
            timeSlot: payload.timeSlot || '',
            department: 'Sales',
            createdAt: timestamp,
            createdIso: iso,
          }
        : null;

      setState((old) => ({
        ...old,
        customers: (() => {
          const existing = old.customers.find((item) => String(item.phone || item.mobileNumber || '').trim() === String(customer.phone || '').trim());
          if (existing) {
            return old.customers.map((item) => item.id === existing.id ? normalizeCustomer({ ...item, ...customer, id: item.id, customerId: item.customerId, password: item.password, username: item.username, status: item.status || 'Active' }) : item);
          }
          return [normalizeCustomer(customer), ...old.customers];
        })(),
        leads: [lead, ...old.leads],
        bookings: booking ? [booking, ...old.bookings] : old.bookings,
        properties: source === 'Property Reservation' && property ? old.properties.map((item) => item.id === property.id ? { ...item, status: 'Reserved', reservedAt: iso, updatedAt: timestamp, updatedIso: iso } : item) : old.properties,
        notifications: [
          { id: makeId('N'), type: source, title: `${payload.name} submitted ${source.toLowerCase()} for ${venture?.name || 'Aurov Reality'}`, audience: ['Managing Director', 'Operational Head', 'Sales Manager'], createdAt: timestamp, createdIso: iso, read: false },
          ...old.notifications,
        ],
      }));
      return { customer, lead, booking };
    },

    updateLeadStatus(id, status) {
      setState((old) => ({ ...old, leads: old.leads.map((lead) => lead.id === id ? { ...lead, status, updatedAt: nowLabel(), updatedIso: new Date().toISOString() } : lead) }));
    },

    updateBookingStatus(id, status) {
      const iso = new Date().toISOString();
      const label = nowLabel();
      setState((old) => {
        const target = old.bookings.find((booking) => booking.id === id);
        return {
          ...old,
          bookings: old.bookings.map((booking) => booking.id === id ? { ...booking, status, updatedAt: label, updatedIso: iso, type: status === 'Confirmed' ? 'Purchase' : booking.type } : booking),
          properties: target?.propertyId && status === 'Confirmed'
            ? old.properties.map((property) => property.id === target.propertyId ? { ...property, status: 'Sold', soldAt: iso, updatedAt: label, updatedIso: iso } : property)
            : old.properties,
        };
      });
    },

    saveEmployee(payload, currentRole = 'Managing Director') {
      const isEditing = Boolean(payload.id);
      assertEmployeeRoleAllowed(currentRole, payload.role, isEditing);
      const existingEmployee = isEditing ? state.employees.find((employee) => employee.id === payload.id) : null;
      const firstName = String(payload.firstName || '').trim();
      const lastName = String(payload.lastName || '').trim();
      const email = String(payload.email || '').trim();
      const mobileNumber = String(payload.mobileNumber || payload.phone || '').trim();
      const documents = Array.isArray(payload.documents) ? payload.documents : [];
      const savedDocuments = isEditing ? documents : documents;
      const department = getRoleDepartment(payload.role);

      if (!firstName || !lastName || !email || !mobileNumber || !payload.address || !payload.role || !payload.joiningDate) {
        throw new Error('Please fill all employee details before saving.');
      }
      if (!isEditing && savedDocuments.length < 2) {
        throw new Error('Please upload at least 2 documents before creating the account.');
      }
      if (isEditing && savedDocuments.length < 2) {
        throw new Error('Employee record must retain at least 2 uploaded documents.');
      }

      if (isEditing) {
        const updated = normalizeEmployee({
          ...existingEmployee,
          ...payload,
          name: `${firstName} ${lastName}`.trim(),
          phone: mobileNumber,
          mobileNumber,
          department,
          employeeId: existingEmployee?.employeeId || nextEmployeeId(payload.role, state.employees, payload.id),
          username: existingEmployee?.username || buildUniqueUsername(firstName, lastName, state.employees, payload.id),
          password: existingEmployee?.password || buildPassword(firstName),
          designation: payload.designation || payload.role || existingEmployee?.designation || existingEmployee?.role,
          status: payload.status || existingEmployee?.status || 'Active',
          updatedAt: nowLabel(),
        });
        setState((old) => ({
          ...old,
          employees: old.employees.map((employee) => employee.id === payload.id ? updated : employee),
          notifications: [
            { id: makeId('N'), type: 'Employee', title: `${currentRole} updated employee ${updated.name}`, audience: ['Managing Director', 'Operational Head', currentRole], createdAt: nowLabel(), read: false },
            ...old.notifications,
          ],
        }));
        return updated;
      }

      const employeeId = nextEmployeeId(payload.role, state.employees);
      const username = buildUniqueUsername(firstName, lastName, state.employees);
      const password = buildPassword(firstName);
      const employee = normalizeEmployee({
        id: employeeId,
        employeeId,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        role: payload.role,
        department,
        designation: payload.designation || payload.role,
        joiningDate: payload.joiningDate,
        address: payload.address,
        email,
        mobileNumber,
        phone: mobileNumber,
        documents: savedDocuments,
        username,
        password,
        progress: 0,
        status: 'Active',
        createdBy: currentRole,
        createdAt: nowLabel(),
      });
      setState((old) => ({
        ...old,
        employees: [employee, ...old.employees],
        notifications: [
          { id: makeId('N'), type: 'Employee', title: `${currentRole} created ${employee.role}: ${employee.name}`, audience: ['Managing Director', 'Operational Head', currentRole, employee.role], createdAt: nowLabel(), read: false },
          ...old.notifications,
        ],
      }));
      return employee;
    },

    toggleEmployeeStatus(id) {
      setState((old) => ({
        ...old,
        employees: old.employees.map((employee) => employee.id === id ? { ...employee, status: employee.status === 'Active' ? 'Inactive' : 'Active', updatedAt: nowLabel() } : employee),
      }));
    },

    removeEmployee(id) {
      setState((old) => ({ ...old, employees: old.employees.filter((employee) => employee.id !== id) }));
    },

    async assignPdfTask(payload, file, currentRole = 'Sales Manager') {
      if (!file) throw new Error('Please select a PDF file.');
      if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name || '')) throw new Error('Only PDF files are allowed for task assignment.');
      const pdf = await fileToData(file);
      const assignee = state.employees.find((employee) => employee.id === payload.assigneeId || employee.employeeId === payload.assigneeId) || state.employees.find((employee) => employee.name === payload.assignee);
      if (!assignee) throw new Error('Please select an employee to assign the task.');
      if (isSuperRole(currentRole)) {
        if (!isManagerRole(assignee.role) || isSuperRole(assignee.role)) {
          throw new Error('Managing Director and Operational Head can assign tasks only to managers.');
        }
      } else if (!isExecutiveRole(assignee.role)) {
        throw new Error('Managers can assign tasks only to executives.');
      }
      const managerDepartment = getRoleDepartment(currentRole);
      if (!isSuperRole(currentRole) && assignee.department !== managerDepartment) {
        throw new Error('Managers can assign PDFs only to executives in their department.');
      }
      const assignedToRoleGroup = payload.assignedToRoleGroup || (isSuperRole(currentRole) ? 'Managers' : 'Executives');
      const task = {
        id: makeId('T'),
        title: payload.title,
        assigneeId: assignee.id,
        assigneeEmployeeId: assignee.employeeId || assignee.id,
        assignee: assignee.name,
        assigneeRole: assignee.role || payload.assigneeRole || '',
        role: assignee.role || payload.assigneeRole || '',
        assigneeEmail: assignee.email || '',
        assigneeUsername: assignee.username || '',
        department: assignee.department || payload.department || managerDepartment,
        assignedBy: currentRole,
        assignedByName: currentRole,
        assignedToRoleGroup,
        assignmentPdf: pdf || { name: payload.pdfName || 'Task_Assignment.pdf', size: 'Demo PDF', dataUrl: '', type: 'application/pdf' },
        pdfName: pdf?.name || payload.pdfName || 'Task_Assignment.pdf',
        updatePdf: null,
        completionPdf: null,
        status: 'Pending',
        due: payload.due || '',
        createdAt: nowLabel(),
      };
      setState((old) => ({
        ...old,
        tasks: [task, ...old.tasks],
        notifications: [
          { id: makeId('N'), type: 'PDF Task', title: `${currentRole} assigned PDF task to ${task.assignee}`, audience: ['Managing Director', 'Operational Head', currentRole, task.assignee, task.assigneeRole, task.assigneeEmail, task.assigneeUsername, `${task.department} Executive`, `${task.department} Manager`], createdAt: nowLabel(), read: false },
          ...old.notifications,
        ],
      }));
      return task;
    },

    downloadTaskPdf(task, kind = 'assignment') {
      const map = { assignment: task.assignmentPdf, update: task.updatePdf, completion: task.completionPdf };
      downloadFile(map[kind], task.pdfName || 'Aurov_Task.pdf');
      if (kind === 'assignment' && task.status === 'Pending') {
        setState((old) => ({ ...old, tasks: old.tasks.map((item) => item.id === task.id ? { ...item, status: 'In Progress' } : item) }));
      }
    },

    async uploadTaskPdf(taskId, file, kind = 'completion') {
      const pdf = await fileToData(file);
      if (!pdf) return null;
      let updatedTask;
      setState((old) => ({
        ...old,
        tasks: old.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const patch = kind === 'update'
            ? { updatePdf: pdf, status: task.status === 'Pending' ? 'In Progress' : task.status, updatedAt: nowLabel() }
            : { completionPdf: pdf, status: 'Completed', submittedAt: nowLabel(), updatedAt: nowLabel() };
          updatedTask = { ...task, ...patch };
          return updatedTask;
        }),
        notifications: [
          { id: makeId('N'), type: 'PDF Upload', title: `${updatedTask?.assignee || 'Executive'} uploaded ${kind === 'update' ? 'task update' : 'completion'} PDF for ${updatedTask?.title || 'task'}`, audience: ['Managing Director', 'Operational Head', updatedTask?.assignedBy || 'Sales Manager', `${updatedTask?.department || 'Sales'} Manager`], createdAt: nowLabel(), read: false },
          ...old.notifications,
        ],
      }));
      return pdf;
    },

    reviewTask(taskId, decision) {
      const nextStatus = decision === 'approve' ? 'Approved' : decision === 'close' ? 'Closed' : 'Rejected';
      setState((old) => ({
        ...old,
        tasks: old.tasks.map((task) => task.id === taskId ? { ...task, status: nextStatus, reviewedAt: nowLabel() } : task),
        notifications: [
          { id: makeId('N'), type: 'Task Review', title: `Task ${taskId} marked ${nextStatus}`, audience: ['Managing Director', 'Operational Head'], createdAt: nowLabel(), read: false },
          ...old.notifications,
        ],
      }));
    },


    async submitManagerWork(payload, file, currentUser = {}) {
      const role = currentUser?.role || payload.managerRole || '';
      if (!isManagerRole(role) || isSuperRole(role)) throw new Error('Only department managers can submit work to MD/OH.');
      if (!payload?.title?.trim()) throw new Error('Please enter work title.');
      if (!payload?.description?.trim()) throw new Error('Please enter work description.');
      if (!file) throw new Error('Please upload a PDF attachment.');
      if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name || '')) throw new Error('Only PDF files are allowed.');
      const pdf = await fileToData(file);
      const department = getRoleDepartment(role) || payload.department || currentUser?.department;
      const iso = payload.submissionDate ? new Date(`${payload.submissionDate}T10:00:00`).toISOString() : new Date().toISOString();
      const work = normalizeSubmittedWork({
        id: makeId('SW'),
        managerName: currentUser?.name || role,
        managerRole: role,
        employeeId: currentUser?.employeeId || currentUser?.id || '',
        employeeEmail: currentUser?.email || '',
        department,
        title: payload.title.trim(),
        description: payload.description.trim(),
        submissionDate: payload.submissionDate || dateLabel(),
        submissionIso: iso,
        status: 'Submitted',
        remarks: '',
        pdf,
        createdAt: nowLabel(),
        createdIso: new Date().toISOString(),
        statusHistory: [{ status: 'Submitted', remarks: 'Submitted to Managing Director and Operational Head', dateTime: nowLabel() }],
      });
      setState((old) => ({
        ...old,
        submittedWorks: [work, ...old.submittedWorks],
        notifications: [
          { id: makeId('N'), type: 'Submitted Work', title: `${work.managerName} submitted ${work.title}`, audience: ['Managing Director', 'Operational Head'], createdAt: nowLabel(), createdIso: new Date().toISOString(), read: false },
          ...old.notifications,
        ],
      }));
      return work;
    },

    reviewSubmittedWork(id, status, remarks = '', reviewer = {}) {
      const allowed = ['Submitted', 'Reviewed', 'Approved', 'Rejected'];
      if (!allowed.includes(status)) throw new Error('Invalid submitted work status.');
      setState((old) => ({
        ...old,
        submittedWorks: old.submittedWorks.map((work) => {
          if (work.id !== id) return work;
          const history = Array.isArray(work.statusHistory) ? work.statusHistory : [];
          return normalizeSubmittedWork({
            ...work,
            status,
            remarks,
            updatedAt: nowLabel(),
            statusHistory: [{ status, remarks: remarks || `${status} by ${reviewer?.role || 'Leadership'}`, dateTime: nowLabel() }, ...history],
          });
        }),
        notifications: [
          { id: makeId('N'), type: 'Submitted Work Review', title: `Submitted work ${id} marked ${status}`, audience: ['Managing Director', 'Operational Head'], createdAt: nowLabel(), createdIso: new Date().toISOString(), read: false },
          ...old.notifications,
        ],
      }));
    },

    updateComplaintStatus(id, status, note = '', reviewer = {}) {
      const allowed = ['Pending', 'In Progress', 'Resolved', 'Closed'];
      if (!allowed.includes(status)) throw new Error('Invalid complaint status.');
      setState((old) => ({
        ...old,
        complaints: old.complaints.map((complaint) => {
          if (complaint.id !== id) return complaint;
          const normalized = normalizeComplaint(complaint);
          return normalizeComplaint({
            ...normalized,
            status,
            resolutionNotes: status === 'Resolved' || status === 'Closed' ? (note || normalized.resolutionNotes) : normalized.resolutionNotes,
            remarks: note || normalized.remarks,
            updatedAt: nowLabel(),
            statusHistory: [{ status, note: note || `${status} by ${reviewer?.role || 'Reviewer'}`, dateTime: nowLabel() }, ...(normalized.statusHistory || [])],
          });
        }),
        notifications: [
          { id: makeId('N'), type: 'Complaint Status', title: `Complaint ${id} marked ${status}`, audience: ['Managing Director', 'Operational Head'], createdAt: nowLabel(), createdIso: new Date().toISOString(), read: false },
          ...old.notifications,
        ],
      }));
    },

    getCalendarActivities(dateValue) {
      const selected = dateValue || new Date().toISOString().slice(0, 10);
      const toKey = (value) => {
        if (!value) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) return String(value).slice(0, 10);
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
      };
      const byDate = (value) => toKey(value) === selected;
      const submitted = state.submittedWorks.filter((item) => byDate(item.submissionIso || item.createdIso || item.submissionDate));
      const bookings = state.bookings.filter((item) => byDate(item.createdIso || item.updatedIso || item.date));
      const siteVisits = state.bookings.filter((item) => (item.type === 'Site Visit' || item.status === 'Site Visit' || item.source === 'Demo Visit') && byDate(item.createdIso || item.date));
      const demoRequests = state.leads.filter((item) => item.source === 'Demo Visit' && byDate(item.createdIso || item.date));
      const complaints = state.complaints.filter((item) => byDate(item.createdIso || item.createdAt));
      return { submitted, bookings, siteVisits, demoRequests, complaints };
    },


    registerCustomer(payload = {}) {
      const fullName = String(payload.fullName || payload.name || '').trim();
      const mobileNumber = String(payload.mobileNumber || payload.phone || '').trim();
      if (!fullName || !mobileNumber) throw new Error('Full name and mobile number are required.');
      const existing = state.customers.find((customer) => String(customer.mobileNumber || customer.phone).trim() === mobileNumber);
      const password = payload.password || `${properCase(fullName.split(/\s+/)[0] || 'Customer')}@123`;
      if (existing) {
        const updated = normalizeCustomer({ ...existing, fullName, name: fullName, mobileNumber, phone: mobileNumber, password, status: 'Active', updatedAt: nowLabel() });
        setState((old) => ({
          ...old,
          customers: old.customers.map((customer) => customer.id === existing.id ? updated : customer),
          notifications: [{ id: makeId('N'), type: 'Customer', title: `${fullName} updated customer account`, audience: ['Managing Director', 'Operational Head', 'Sales Manager'], createdAt: nowLabel(), createdIso: new Date().toISOString(), read: false }, ...old.notifications],
        }));
        return updated;
      }
      const customerId = nextCustomerId(state.customers);
      const customer = normalizeCustomer({
        id: customerId,
        customerId,
        fullName,
        name: fullName,
        mobileNumber,
        phone: mobileNumber,
        email: payload.email || '',
        username: mobileNumber,
        password,
        address: payload.address || '',
        profilePhoto: payload.profilePhoto || '',
        createdAt: nowLabel(),
        createdIso: new Date().toISOString(),
      });
      setState((old) => ({
        ...old,
        customers: [customer, ...old.customers],
        notifications: [{ id: makeId('N'), type: 'Customer', title: `${customer.name} created customer account`, audience: ['Managing Director', 'Operational Head', 'Sales Manager'], createdAt: nowLabel(), createdIso: new Date().toISOString(), read: false }, ...old.notifications],
      }));
      return customer;
    },

    findCustomerAccount(identifier = '') {
      const lookup = String(identifier || '').trim().toLowerCase();
      return state.customers.map(normalizeCustomer).find((customer) => [customer.customerId, customer.id, customer.mobileNumber, customer.phone, customer.username, customer.email].filter(Boolean).map((item) => String(item).toLowerCase()).includes(lookup)) || null;
    },

    updateCustomerPassword(identifier = '', password = '') {
      const target = actions.findCustomerAccount(identifier);
      if (!target) throw new Error('Customer not found.');
      setState((old) => ({ ...old, customers: old.customers.map((customer) => customer.id === target.id ? normalizeCustomer({ ...customer, password, updatedAt: nowLabel() }) : customer) }));
      return true;
    },

    async updateUserProfile(currentUser = {}, patch = {}, photoFile = null) {
      let photo = patch.profilePhoto || '';
      if (photoFile) {
        const file = await fileToData(photoFile);
        photo = file?.dataUrl || photo;
      }
      const role = currentUser?.role || '';
      const isCustomer = role === 'Customer';
      let updatedRecord = null;
      setState((old) => {
        if (isCustomer) {
          const customers = old.customers.map((customer) => {
            const match = [customer.customerId, customer.id, customer.mobileNumber, customer.phone, customer.email].filter(Boolean).includes(currentUser.customerId || currentUser.id || currentUser.mobileNumber || currentUser.email);
            if (!match) return customer;
            updatedRecord = normalizeCustomer({ ...customer, mobileNumber: patch.mobileNumber || customer.mobileNumber, phone: patch.mobileNumber || customer.phone, address: patch.address ?? customer.address, profilePhoto: photo || customer.profilePhoto, updatedAt: nowLabel() });
            return updatedRecord;
          });
          return { ...old, customers };
        }
        const employees = old.employees.map((employee) => {
          const match = [employee.employeeId, employee.id, employee.email, employee.username].filter(Boolean).includes(currentUser.employeeId || currentUser.id || currentUser.email || currentUser.username);
          if (!match) return employee;
          updatedRecord = normalizeEmployee({ ...employee, mobileNumber: patch.mobileNumber || employee.mobileNumber, phone: patch.mobileNumber || employee.phone, address: patch.address ?? employee.address, profilePhoto: photo || employee.profilePhoto, updatedAt: nowLabel() });
          return updatedRecord;
        });
        return { ...old, employees };
      });
      if (updatedRecord && typeof localStorage !== 'undefined') {
        const nextUser = { ...currentUser, ...updatedRecord, role: role || updatedRecord.role };
        localStorage.setItem('aurov-user', JSON.stringify(nextUser));
      }
      return updatedRecord;
    },

    changePassword(currentUser = {}, mobileNumber = '', newPassword = '') {
      const role = currentUser?.role || '';
      if (!newPassword) throw new Error('New password is required.');
      let changed = false;
      setState((old) => {
        if (role === 'Customer') {
          const customers = old.customers.map((customer) => {
            const isCurrent = [customer.customerId, customer.id, customer.mobileNumber, customer.phone, customer.email].filter(Boolean).includes(currentUser.customerId || currentUser.id || currentUser.mobileNumber || currentUser.email);
            const phoneMatches = String(customer.mobileNumber || customer.phone || '').trim() === String(mobileNumber || '').trim();
            if (!isCurrent || !phoneMatches) return customer;
            changed = true;
            return normalizeCustomer({ ...customer, password: newPassword, updatedAt: nowLabel() });
          });
          return { ...old, customers };
        }
        const employees = old.employees.map((employee) => {
          const isCurrent = [employee.employeeId, employee.id, employee.email, employee.username].filter(Boolean).includes(currentUser.employeeId || currentUser.id || currentUser.email || currentUser.username);
          const phoneMatches = String(employee.mobileNumber || employee.phone || '').trim() === String(mobileNumber || '').trim();
          if (!isCurrent || !phoneMatches) return employee;
          changed = true;
          return normalizeEmployee({ ...employee, password: newPassword, updatedAt: nowLabel() });
        });
        return { ...old, employees };
      });
      if (!changed) throw new Error('Registered mobile number does not match this account.');
      return true;
    },

    raiseComplaint(payload, currentUser = {}) {
      const role = currentUser?.role || payload.role || 'Employee';
      if (isSuperRole(role) || role === 'Customer') {
        throw new Error('Only managers and executives can raise complaints. Managing Director and Operational Head can review complaints only.');
      }
      const department = currentUser?.department || getRoleDepartment(role);
      const employeeId = currentUser?.employeeId || currentUser?.id || `DEMO-${getEmployeeIdPrefix(role)}`;
      const employeeName = currentUser?.name || payload.employeeName || role;
      const target = payload.target === 'Manager' && isExecutiveRole(role) ? 'Manager' : 'Leadership';
      const managerRole = getManagerRoleForDepartment(department);
      const audience = target === 'Manager' ? [managerRole] : ['Operational Head', 'Managing Director'];
      const complaint = {
        id: makeId('CMP'),
        employeeId,
        employeeName,
        employeeRole: role,
        from: employeeName,
        fromEmployeeId: employeeId,
        fromEmail: currentUser?.email || '',
        fromUsername: currentUser?.username || '',
        department,
        role,
        target,
        targetLabel: target === 'Manager' ? `Send to ${managerRole}` : 'Send to Operational Head & Managing Director',
        audience,
        subject: payload.subject,
        description: payload.description,
        priority: payload.priority || 'Medium',
        status: 'Pending',
        attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
        statusHistory: [{ status: 'Pending', note: 'Complaint created', dateTime: nowLabel() }],
        resolutionNotes: '',
        createdAt: nowLabel(),
        createdIso: new Date().toISOString(),
        dateTime: nowLabel(),
      };
      setState((old) => ({
        ...old,
        complaints: [complaint, ...old.complaints],
        notifications: [
          { id: makeId('N'), type: 'Complaint', title: `${employeeName} (${employeeId}) raised complaint: ${payload.subject}`, audience, createdAt: nowLabel(), read: false },
          ...old.notifications,
        ],
      }));
      return complaint;
    },
  }), [state]);

  const value = useMemo(() => ({ ...state, ...actions, fileToData, getFileDataUrl, downloadFile, previewFile }), [state, actions]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}


