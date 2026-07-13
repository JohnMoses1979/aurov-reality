export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const FILE_BASE_URL = API_BASE_URL.replace('/api', '');

const TOKEN_STORAGE_KEYS = [
  'aurov_token',
  'token',
  'authToken',
  'jwt',
  'aurovToken',
];

const USER_STORAGE_KEYS = ['aurov-user', 'aurov_user'];
const TOKEN_EXPIRY_STORAGE_KEY = 'aurov_token_expires_at';

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const API_STARTUP_RETRY_DELAYS_MS = [750, 1500, 3000, 5000];

const wait = (delayMs) =>
  new Promise((resolve) => window.setTimeout(resolve, delayMs));

const readLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage access issues during logout/cleanup.
  }
};

export const getAuthToken = () =>
  TOKEN_STORAGE_KEYS.map(readLocalStorage).find(Boolean) || null;

export function getToken() {
  return getAuthToken();
}

export function clearStoredAuth() {
  [...TOKEN_STORAGE_KEYS, ...USER_STORAGE_KEYS, TOKEN_EXPIRY_STORAGE_KEY].forEach(
    removeLocalStorage
  );
}

export function persistAuthSession(token, user, expiresInMs) {
  clearStoredAuth();

  if (token) {
    localStorage.setItem('aurov_token', token);
  }

  if (user) {
    const serializedUser = JSON.stringify(user);
    localStorage.setItem('aurov-user', serializedUser);
    localStorage.setItem('aurov_user', serializedUser);
  }

  if (Number.isFinite(expiresInMs) && expiresInMs > 0) {
    localStorage.setItem(
      TOKEN_EXPIRY_STORAGE_KEY,
      String(Date.now() + Number(expiresInMs))
    );
  }
}

function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isStoredTokenExpired(token = getToken()) {
  if (!token) return true;

  const savedExpiry = Number(readLocalStorage(TOKEN_EXPIRY_STORAGE_KEY));
  if (Number.isFinite(savedExpiry) && savedExpiry > 0) {
    return Date.now() >= savedExpiry;
  }

  const payload = parseJwtPayload(token);
  if (payload?.exp) {
    return Date.now() >= Number(payload.exp) * 1000;
  }

  return false;
}

const buildHeaders = (headers = {}, body) => {
  const token = getToken();
  const isFormData = body instanceof FormData;

  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
};

const normalizeBody = (body) => {
  if (body instanceof FormData) return body;
  if (body && typeof body !== 'string') return JSON.stringify(body);
  return body;
};

const parseResponse = async (response, responseType = 'json') => {
  if (responseType === 'blob') return response.blob();
  if (responseType === 'text') return response.text();
  return response.json().catch(() => null);
};

const request = async (path, options = {}) => {
  const requestOptions = {
    ...options,
    headers: buildHeaders(options.headers, options.body),
    body: normalizeBody(options.body),
  };

  let response;
  let lastNetworkError;

  for (let attempt = 0; attempt <= API_STARTUP_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
      lastNetworkError = null;

      if (!RETRYABLE_STATUS_CODES.has(response.status)) {
        break;
      }
    } catch (error) {
      lastNetworkError = error;
    }

    if (attempt < API_STARTUP_RETRY_DELAYS_MS.length) {
      await wait(API_STARTUP_RETRY_DELAYS_MS[attempt]);
    }
  }

  if (!response) {
    throw new Error(
      'The server is still starting. Please wait a few seconds and try again.',
      { cause: lastNetworkError }
    );
  }
  const data = await parseResponse(response, options.responseType);

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
    }

    const validationMessage = data?.validationErrors
      ? Object.values(data.validationErrors).join(', ')
      : '';

    throw new Error(
      validationMessage ||
        data?.message ||
        data?.error ||
        (RETRYABLE_STATUS_CODES.has(response.status)
          ? 'The server is still starting. Please wait a few seconds and try again.'
          : 'Something went wrong. Please try again.')
    );
  }

  return data;
};

export async function apiRequest(path, options = {}) {
  return request(path, options);
}

export async function apiBlobRequest(path, options = {}) {
  return request(path, {
    ...options,
    responseType: 'blob',
  });
}

const api = {
  get: async (path, config = {}) => {
    const query = config.params
      ? `?${new URLSearchParams(
          Object.entries(config.params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        ).toString()}`
      : '';

    const data = await request(`${path}${query}`, {
      method: 'GET',
      headers: config.headers,
      responseType: config.responseType,
    });

    return { data };
  },

  post: async (path, body, config = {}) => {
    const data = await request(path, {
      method: 'POST',
      body,
      headers: config.headers,
      responseType: config.responseType,
    });

    return { data };
  },

  put: async (path, body, config = {}) => {
    const data = await request(path, {
      method: 'PUT',
      body,
      headers: config.headers,
      responseType: config.responseType,
    });

    return { data };
  },

  patch: async (path, body, config = {}) => {
    const data = await request(path, {
      method: 'PATCH',
      body,
      headers: config.headers,
      responseType: config.responseType,
    });

    return { data };
  },

  delete: async (path, config = {}) => {
    const data = await request(path, {
      method: 'DELETE',
      headers: config.headers,
      responseType: config.responseType,
    });

    return { data };
  },
};

export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${FILE_BASE_URL}${url}`;
}; 

export const authApi = {
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  requestCustomerRegistrationOtp: (payload) =>
    apiRequest('/auth/customer/register/otp', { method: 'POST', body: payload }),
  registerCustomer: (payload) =>
    apiRequest('/auth/register-customer', { method: 'POST', body: payload }),
  requestPasswordResetOtp: (payload) =>
    apiRequest('/auth/password-reset/otp', { method: 'POST', body: payload }),
  verifyPasswordResetOtp: (payload) =>
    apiRequest('/auth/password-reset/verify', { method: 'POST', body: payload }),
  resetPassword: (payload) =>
    apiRequest('/auth/password-reset', { method: 'POST', body: payload }),
  requestProfileMobileOtp: (payload) =>
    apiRequest('/auth/profile-mobile/otp', { method: 'POST', body: payload }),
  verifyProfileMobileOtp: (payload) =>
    apiRequest('/auth/profile-mobile/verify', { method: 'POST', body: payload }),
  me: () => apiRequest('/users/me'),
  logout: () => clearStoredAuth(),
};

export const userApi = {
  me: () => apiRequest('/users/me'),
  updateProfile: (payload) =>
    apiRequest('/users/me/profile', { method: 'PUT', body: payload }),
};


export const notificationApi = {
  getMy: () => apiRequest('/notifications'),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),
};
export const ventureApi = {
  getAll: () => api.get('/ventures'),
  getById: (id) => api.get(`/ventures/${id}`),
  create: (formData) => api.post('/ventures', formData),
  update: (id, formData) => api.put(`/ventures/${id}`, formData),
  delete: (id) => api.delete(`/ventures/${id}`),
};

export const propertyApi = {
  getAll: (ventureId) => api.get('/properties', { params: ventureId ? { ventureId } : {} }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (formData) => api.post('/properties', formData),
  update: (id, formData) => api.put(`/properties/${id}`, formData),
  delete: (id) => api.delete(`/properties/${id}`),
};

export const employeeApi = {
  list: () => apiRequest('/employees'),
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  createEmployee: (payload) => apiRequest('/admin/employees', { method: 'POST', body: payload }),
  create: (formData) => api.post('/employees', formData),
  update: (id, formData) => api.put(`/employees/${id}`, formData),
  updateProfile: (id, form, photoFile) => {
    const body = new FormData();
    body.append('mobileNumber', form.mobileNumber || '');
    body.append('address', form.address || '');

    if (photoFile) body.append('photo', photoFile);

    return apiRequest(`/employees/${id}/profile`, { method: 'PUT', body });
  },
  toggleStatus: (id) => api.patch(`/employees/${id}/toggle-status`),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const bookingApi = {
  getAll: () => api.get('/bookings'),
  createSiteVisit: (data) => api.post('/site-visits', data),
  updateSiteVisit: (id, data) => api.put(`/site-visits/${id}`, data),
  updateSiteVisitStatus: (id, status) =>
    api.patch(`/customer/site-visits/${id}/status`, { status }),
  deleteSiteVisit: (id) => api.delete(`/site-visits/${id}`),
  createReservation: (data) => api.post('/property-reservations', data),
  updateReservation: (id, data) => api.put(`/property-reservations/${id}`, data),
  updateReservationStatus: (id, status) => api.patch(`/property-reservations/${id}/status`, { status }),
  deleteReservation: (id) => api.delete(`/property-reservations/${id}`),
};

export const customerBookingApi = {
  getOptions: () => apiRequest('/customer/booking-options'),
  bookProperty: (payload) =>
    apiRequest('/customer/book-property', { method: 'POST', body: payload }),
  getBookings: (phone = '') => {
    const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    return apiRequest(`/customer/bookings${query}`);
  },
};

export const customerHomeApi = {
  getHome: () => apiRequest('/customer/home'),
};

export const customerSiteVisitApi = {
  getOptions: () => apiRequest('/customer/site-visit-options'),
  create: (payload) =>
    apiRequest('/customer/site-visits', { method: 'POST', body: payload }),
  getAll: (phone = '') => {
    const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    return apiRequest(`/customer/site-visits${query}`);
  },
  updateStatus: (id, status) =>
    apiRequest(`/customer/site-visits/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
};

export const customerContactApi = {
  getOptions: () => apiRequest('/customer/contact-options'),
  submit: (payload) =>
    apiRequest('/customer/contact-requests', { method: 'POST', body: payload }),
};

export const customerPropertiesApi = {
  getPage: (ventureId = '') => {
    const query = ventureId ? `?ventureId=${encodeURIComponent(ventureId)}` : '';
    return apiRequest(`/customer/properties-page${query}`);
  },
};

export const razorpayApi = {
  createOrder: (payload) =>
    apiRequest('/payments/razorpay/create-order', { method: 'POST', body: payload }),
  verifyPayment: (payload) =>
    apiRequest('/payments/razorpay/verify', { method: 'POST', body: payload }),
};

export const submittedWorkApi = {
  submit: (formData) => api.post('/submitted-works', formData),
  getMy: () => api.get('/submitted-works/my'),
  getLeadership: () => api.get('/submitted-works/leadership'),
  getAll: (params = {}) => api.get('/submitted-works', { params }),
  getById: (id) => api.get(`/submitted-works/${id}`),
  update: (id, formData) => api.put(`/submitted-works/${id}`, formData),
  review: (id, status, remarks) => api.patch(`/submitted-works/${id}/review`, { status, remarks }),
  delete: (id) => api.delete(`/submitted-works/${id}`),
  getPdfBlob: (id) => api.get(`/submitted-works/${id}/pdf`, { responseType: 'blob' }),
  openPdf: async (id) => {
    const res = await api.get(`/submitted-works/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 30000);
  },
  downloadPdf: async (id, fileName = 'submitted-work.pdf') => {
    const res = await api.get(`/submitted-works/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'submitted-work.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  getCalendarActivities: (date) => api.get('/leadership/calendar', { params: { date } }),
};

export const complaintApi = {
  getAll: (params = {}) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  createEmployeeComplaint: (formData) => api.post('/complaints/employee', formData),
  createCustomerComplaint: (formData) => api.post('/complaints/customer', formData),
  updateStatus: (id, status, note) => api.patch(`/complaints/${id}/status`, { status, note }),
  delete: (id) => api.delete(`/complaints/${id}`),
  openAttachment: async (complaintId, attachmentId) => {
    const res = await api.get(`/complaints/${complaintId}/attachments/${attachmentId}`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 30000);
  },
  downloadAttachment: async (complaintId, attachmentId, fileName) => {
    const res = await api.get(`/complaints/${complaintId}/attachments/${attachmentId}`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'complaint-attachment';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const managerTaskApi = {
  getManagers: () => api.get('/manager-tasks/managers'),
  create: (formData) => api.post('/manager-tasks', formData),
  getAll: () => api.get('/manager-tasks'),
  getMyTasks: () => api.get('/manager-tasks/my'),
  getById: (id) => api.get(`/manager-tasks/${id}`),
  update: (id, formData) => api.put(`/manager-tasks/${id}`, formData),
  updateStatus: (id, status) => api.patch(`/manager-tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/manager-tasks/${id}`),
  openPdf: async (id) => {
    const res = await api.get(`/manager-tasks/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 30000);
  },
  downloadPdf: async (id, fileName = 'assignment.pdf') => {
    const res = await api.get(`/manager-tasks/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'assignment.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const workflowApi = {
  snapshot: () => apiRequest('/workflows'),

  createTask: (payload, file) => {
    const body = new FormData();
    body.append('assigneeId', payload.assigneeId);
    body.append('title', payload.title || '');
    body.append('due', payload.due || '');
    body.append('file', file);
    return apiRequest('/workflows/tasks', { method: 'POST', body });
  },

  updateTaskStatus: (id, status) => {
    const body = new FormData();
    body.append('status', status);
    return apiRequest(`/workflows/tasks/${id}/status`, { method: 'PATCH', body });
  },

  uploadTaskPdf: (id, kind, file) => {
    const body = new FormData();
    body.append('kind', kind);
    body.append('file', file);
    return apiRequest(`/workflows/tasks/${id}/pdf`, { method: 'POST', body });
  },

  reviewTask: (id, decision) => {
    const body = new FormData();
    body.append('decision', decision);
    return apiRequest(`/workflows/tasks/${id}/review`, { method: 'PATCH', body });
  },

  submitManagerWork: (payload, file) => {
    const body = new FormData();
    body.append('title', payload.title || '');
    body.append('description', payload.description || '');
    body.append('submissionDate', payload.submissionDate || '');
    body.append('file', file);
    return apiRequest('/workflows/submitted-work', { method: 'POST', body });
  },

  reviewSubmittedWork: (id, status, remarks = '') => {
    const body = new FormData();
    body.append('status', status);
    body.append('remarks', remarks);
    return apiRequest(`/workflows/submitted-work/${id}/review`, { method: 'PATCH', body });
  },

  raiseComplaint: (payload) => {
    const body = new FormData();
    body.append('subject', payload.subject || '');
    body.append('description', payload.description || '');
    body.append('priority', payload.priority || 'Medium');
    body.append('attachments', JSON.stringify(payload.attachments || []));
    return apiRequest('/workflows/complaints', { method: 'POST', body });
  },

  updateComplaintStatus: (id, status, note = '') => {
    const body = new FormData();
    body.append('status', status);
    body.append('note', note);
    return apiRequest(`/workflows/complaints/${id}/status`, { method: 'PATCH', body });
  },
};

export const dashboardApi = {
  getManagingDirectorDashboard: async (date) => {
    const { data } = await api.get('/dashboard/md', { params: date ? { date } : {} });
    return data;
  },

  downloadLeadershipSalesTaskFile: async (taskId, fileType, fileName = 'Task.pdf') => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/dashboard/md/sales-task-updates/${taskId}/files/${fileType}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },
};
export { api };
export default api;
export const salesPdfTaskApi = {
  getExecutives: () => request('/sales/pdf-tasks/executives'),

  getTasks: () => request('/sales/pdf-tasks'),

  assign: ({ title, assigneeId, due, file }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('assigneeId', assigneeId);

    if (due) {
      formData.append('due', due);
    }

    formData.append('file', file);

    return request('/sales/pdf-tasks', {
      method: 'POST',
      body: formData,
    });
  },

  downloadPdf: async (task) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/sales/pdf-tasks/${task.taskId}/pdf`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = task.pdfName || 'Assignment.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },
};

export const salesTaskApi = {
  getExecutives: () => request('/sales/tasks/executives'),

  getTasks: () => request('/sales/tasks'),

  assign: ({ title, assigneeId, due, file }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('assigneeId', assigneeId);

    if (due) {
      formData.append('due', due);
    }

    formData.append('file', file);

    return request('/sales/tasks', {
      method: 'POST',
      body: formData,
    });
  },

  downloadPdf: async (task) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/sales/tasks/${task.taskId}/pdf`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = task.pdfName || 'Assignment.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },
};

export const salesCustomerActivityApi = {
  getAll: () => request('/sales/customer-activity'),

  updateLeadStatus: (leadId, status) =>
    request(`/sales/customer-activity/leads/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateBookingStatus: (bookingId, status) =>
    request(`/sales/customer-activity/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const complaintsApi = {
  getAll: () => request('/complaints'),

  create: (payload, currentUser = {}) => {
    const formData = new FormData();

    formData.append('target', payload.target || 'Leadership');
    formData.append('subject', payload.subject || '');
    formData.append('description', payload.description || '');
    formData.append('priority', payload.priority || 'Medium');
    formData.append('department', payload.department || currentUser.department || '');
    formData.append('employeeId', payload.employeeId || currentUser.employeeId || String(currentUser.id || ''));
    formData.append('employeeName', payload.employeeName || currentUser.name || currentUser.fullName || '');
    formData.append('employeeRole', payload.employeeRole || currentUser.role || '');

    (payload.attachments || []).forEach((item) => {
      const file = item?.file || item;
      if (file) {
        formData.append('attachments', file, item?.name || file.name || 'attachment');
      }
    });

    return request('/complaints/employee', {
      method: 'POST',
      body: formData,
    });
  },

  raise: (payload, currentUser = {}) =>
    complaintsApi.create(payload, currentUser),

  updateStatus: (complaintId, status, note = '') =>
    request(`/complaints/${complaintId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),

  downloadAttachment: async (complaintId, attachment, fileName) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/complaints/${complaintId}/attachments/${typeof attachment === 'object' ? attachment.id : attachment}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download attachment');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName || attachment?.name || 'attachment';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },

  previewAttachment: async (complaintId, attachment) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/complaints/${complaintId}/attachments/${typeof attachment === 'object' ? attachment.id : attachment}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to preview attachment');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
  },
};
export const salesLeadsApi = {
  getAll: () => request('/sales/leads'),

  updateLeadStatus: (leadId, status) =>
    request(`/sales/leads/customer-leads/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateBookingStatus: (bookingId, status) =>
    request(`/sales/leads/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

function buildEmployeeFormData(payload) {
  const formData = new FormData();

  const existingDocumentIds = (payload.documents || [])
    .filter((doc) => doc.serverDocument && doc.id)
    .map((doc) => doc.id);

  const employeePayload = {
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    email: payload.email || '',
    mobileNumber: payload.mobileNumber || '',
    address: payload.address || '',
    department: payload.department || '',
    role: payload.role || '',
    designation: payload.designation || payload.role || '',
    password: payload.password || '',
    joiningDate: payload.joiningDate || null,
    status: payload.status || undefined,
    existingDocumentIds,
  };

  formData.append(
    'employee',
    new Blob([JSON.stringify(employeePayload)], {
      type: 'application/json',
    })
  );

  (payload.documents || [])
    .filter((doc) => doc.file)
    .forEach((doc) => {
      formData.append('documents', doc.file, doc.name || doc.file.name);
    });

  return formData;
}

export const employeeManagementApi = {
  getData: () => request('/employees/management'),

  create: (payload) =>
    request('/employees/management', {
      method: 'POST',
      body: buildEmployeeFormData(payload),
    }),

  update: (employeeId, payload) =>
    request('/employees/management/' + employeeId, {
      method: 'PUT',
      body: buildEmployeeFormData(payload),
    }),

  toggleStatus: (employeeId) =>
    request('/employees/management/' + employeeId + '/toggle-status', {
      method: 'PATCH',
    }),

  remove: (employeeId) =>
    request('/employees/management/' + employeeId, {
      method: 'DELETE',
    }),

  downloadDocument: async (employeeId, doc) => {
    const token = getToken();

    const response = await fetch(
      API_BASE_URL + '/employees/management/' + employeeId + '/documents/' + doc.id + '/download',
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download document');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = doc.name || 'document';
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },

  previewDocument: async (employeeId, doc) => {
    const token = getToken();

    const response = await fetch(
      API_BASE_URL + '/employees/management/' + employeeId + '/documents/' + doc.id + '/preview',
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to preview document');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => window.URL.revokeObjectURL(url), 30000);
  },
};

export const salesPdfCenterApi = {
  getUpdates: () => request('/sales/pdf-center'),

  reviewTask: (taskId, decision) =>
    request(`/sales/pdf-center/tasks/${taskId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decision }),
    }),

  downloadTaskFile: async (taskId, fileType, fileName = 'Task.pdf') => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/sales/pdf-center/tasks/${taskId}/files/${fileType}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },
};


export const salesDashboardApi = {
  getDashboard: () => request('/sales/dashboard'),

  reviewTask: (taskId, decision) =>
    request(`/sales/dashboard/tasks/${taskId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decision }),
    }),

  downloadTaskFile: async (taskId, fileType, fileName = 'Task.pdf') => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/sales/dashboard/tasks/${taskId}/files/${fileType}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },
};
export const salesReportsApi = {
  getReports: () => request('/sales/reports'),
};

export const salesSubmitWorkApi = {
  getMySubmissions: () => request('/sales/submit-work/my'),

  submit: ({ title, description, submissionDate, file }) => {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('submissionDate', submissionDate);
    formData.append('file', file);

    return request('/sales/submit-work', {
      method: 'POST',
      body: formData,
    });
  },

  downloadPdf: async (work) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/sales/submit-work/${work.workId}/pdf`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = work.pdf?.name || 'SubmittedWork.pdf';
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },
};

export const salesTaskUpdatesApi = {
  getUpdates: () => request('/sales/task-updates'),

  reviewTask: (taskId, decision) =>
    request(`/sales/task-updates/${taskId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decision }),
    }),

  downloadTaskFile: async (taskId, fileType, fileName = 'Task.pdf') => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/sales/task-updates/${taskId}/files/${fileType}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error('Unable to download file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  },
};


async function downloadWithAuth(path, fallbackName = 'file.pdf') {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders({}, undefined),
  });

  if (!response.ok) {
    throw new Error('Unable to download file.');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const fileName = match?.[1] || fallbackName;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

function createDepartmentManagerWorkflowApi(managerKey) {
  return {
    getDashboard: () => request(`/${managerKey}/dashboard`),

    reviewDashboardTask: (taskId, decision) =>
      request(`/${managerKey}/dashboard/tasks/${taskId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
      }),

    downloadDashboardTaskFile: async (taskId, fileType, fileName = 'Task.pdf') => {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/${managerKey}/dashboard/tasks/${taskId}/files/${fileType}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error('Unable to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    },

    getExecutives: () => request(`/${managerKey}/pdf-tasks/executives`),

    getTasks: () => request(`/${managerKey}/pdf-tasks`),

    assign: ({ title, assigneeId, due, file }) => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('assigneeId', assigneeId);

      if (due) {
        formData.append('due', due);
      }

      formData.append('file', file);

      return request(`/${managerKey}/pdf-tasks`, {
        method: 'POST',
        body: formData,
      });
    },

    downloadPdf: (task) =>
      downloadProtectedFile(
        `/${managerKey}/pdf-tasks/${task.taskId}/pdf`,
        task.pdfName || 'Assignment.pdf'
      ),
    getTaskUpdates: () => request(`/${managerKey}/task-updates`),

    reviewTask: (taskId, decision) =>
      request(`/${managerKey}/task-updates/${taskId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
      }),

    downloadTaskFile: async (taskId, fileType, fileName = 'Task.pdf') => {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/${managerKey}/task-updates/${taskId}/files/${fileType}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error('Unable to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    },
  };
}

export const departmentManagerWorkflowApi = {
  marketing: createDepartmentManagerWorkflowApi('marketing'),
  crm: createDepartmentManagerWorkflowApi('crm'),
  accounts: createDepartmentManagerWorkflowApi('accounts'),
  hr: createDepartmentManagerWorkflowApi('hr'),
};
export const salesExecutiveTaskApi = {
  getMine() {
    return apiRequest('/sales-executive/tasks/mine');
  },

  updateStatus(taskId, status) {
    return apiRequest(`/sales-executive/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  uploadPdf(taskId, file, kind) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`/sales-executive/tasks/${taskId}/upload/${kind}`, {
      method: 'POST',
      body: formData,
    });
  },

  downloadPdf(task, kind) {
    const fileName =
      kind === 'assignment'
        ? task.pdfName || 'assignment.pdf'
        : kind === 'update'
          ? task.updatePdfName || 'update.pdf'
          : task.completionPdfName || 'completion.pdf';

    return downloadWithAuth(`/sales-executive/tasks/${task.id}/download/${kind}`, fileName);
  },
};


const createDepartmentExecutiveDashboardApi = (executiveKey) => ({
  getDashboard() {
    return apiRequest(`/${executiveKey}-executive/dashboard`);
  },

  updateTaskStatus(taskId, status) {
    return apiRequest(`/${executiveKey}-executive/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  uploadTaskPdf(taskId, file, kind) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`/${executiveKey}-executive/tasks/${taskId}/upload/${kind}`, {
      method: 'POST',
      body: formData,
    });
  },

  downloadTaskPdf(task, kind) {
    const fileName =
      kind === 'assignment'
        ? task.pdfName || task.assignmentPdf?.name || 'Assignment.pdf'
        : kind === 'update'
          ? task.updatePdfName || task.updatePdf?.name || 'Update.pdf'
          : task.completionPdfName || task.completionPdf?.name || 'Completion.pdf';

    return downloadWithAuth(
      `/${executiveKey}-executive/tasks/${task.id}/download/${kind}`,
      fileName
    );
  },
});
export const salesExecutiveDashboardApi = {
  getDashboard() {
    return apiRequest('/sales-executive/dashboard');
  },

  updateTaskStatus(taskId, status) {
    return apiRequest(`/sales-executive/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  uploadTaskPdf(taskId, file, kind) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`/sales-executive/tasks/${taskId}/upload/${kind}`, {
      method: 'POST',
      body: formData,
    });
  },

  downloadTaskPdf(task, kind) {
    const fileName =
      kind === 'assignment'
        ? task.pdfName || task.assignmentPdf?.name || 'Assignment.pdf'
        : kind === 'update'
          ? task.updatePdfName || task.updatePdf?.name || 'Update.pdf'
          : task.completionPdfName || task.completionPdf?.name || 'Completion.pdf';

    return downloadWithAuth(
      `/sales-executive/tasks/${task.id}/download/${kind}`,
      fileName
    );
  },
};

export const marketingExecutiveDashboardApi = createDepartmentExecutiveDashboardApi('marketing');
export const crmExecutiveDashboardApi = createDepartmentExecutiveDashboardApi('crm');
export const accountsExecutiveDashboardApi = createDepartmentExecutiveDashboardApi('accounts');
export const hrExecutiveDashboardApi = createDepartmentExecutiveDashboardApi('hr');
export const salesExecutiveLeadsApi = {
  getMine() {
    return apiRequest('/sales-executive/leads/mine');
  },

  updateStatus(taskId, status) {
    return apiRequest(`/sales-executive/leads/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  uploadPdf(taskId, file, kind) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`/sales-executive/leads/${taskId}/upload/${kind}`, {
      method: 'POST',
      body: formData,
    });
  },

  downloadPdf(task, kind) {
    const fileName =
      kind === 'assignment'
        ? task.pdfName || 'Assignment.pdf'
        : kind === 'update'
          ? task.updatePdfName || 'Update.pdf'
          : task.completionPdfName || 'Completion.pdf';

    return downloadWithAuth(
      `/sales-executive/leads/${task.id}/download/${kind}`,
      fileName
    );
  },
};

export const salesExecutiveTaskUpdatesApi = {
  getMine() {
    return apiRequest('/sales-executive/task-updates/mine');
  },

  downloadPdf(task, kind) {
    const fileName =
      kind === 'update'
        ? task.updatePdfName || task.updatePdf?.name || 'Update.pdf'
        : task.completionPdfName || task.completionPdf?.name || 'Completion.pdf';

    return downloadWithAuth(
      `/sales-executive/task-updates/${task.id}/download/${kind}`,
      fileName
    );
  },
};


const createDepartmentExecutiveTaskApi = (executiveKey) => ({
  getMine() {
    return apiRequest(`/${executiveKey}-executive/tasks/mine`);
  },

  updateStatus(taskId, status) {
    return apiRequest(`/${executiveKey}-executive/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  uploadPdf(taskId, file, kind) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`/${executiveKey}-executive/tasks/${taskId}/upload/${kind}`, {
      method: 'POST',
      body: formData,
    });
  },

  downloadPdf(task, kind) {
    const fileName =
      kind === 'assignment'
        ? task.pdfName || 'assignment.pdf'
        : kind === 'update'
          ? task.updatePdfName || 'update.pdf'
          : task.completionPdfName || 'completion.pdf';

    return downloadWithAuth(`/${executiveKey}-executive/tasks/${task.id}/download/${kind}`, fileName);
  },
});

const createDepartmentExecutiveTaskUpdatesApi = (executiveKey) => ({
  getMine() {
    return apiRequest(`/${executiveKey}-executive/task-updates/mine`);
  },

  downloadPdf(task, kind) {
    const fileName =
      kind === 'update'
        ? task.updatePdfName || task.updatePdf?.name || 'Update.pdf'
        : task.completionPdfName || task.completionPdf?.name || 'Completion.pdf';

    return downloadWithAuth(
      `/${executiveKey}-executive/task-updates/${task.id}/download/${kind}`,
      fileName
    );
  },
});
export const marketingExecutiveTaskApi = {
  getMine() {
    return apiRequest('/marketing-executive/tasks/mine');
  },

  updateStatus(taskId, status) {
    return apiRequest(`/marketing-executive/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  uploadPdf(taskId, file, kind) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`/marketing-executive/tasks/${taskId}/upload/${kind}`, {
      method: 'POST',
      body: formData,
    });
  },

  downloadPdf(task, kind) {
    const fileName =
      kind === 'assignment'
        ? task.pdfName || 'assignment.pdf'
        : kind === 'update'
          ? task.updatePdfName || 'update.pdf'
          : task.completionPdfName || 'completion.pdf';

    return downloadWithAuth(`/marketing-executive/tasks/${task.id}/download/${kind}`, fileName);
  },
};

export const marketingExecutiveTaskUpdatesApi = {
  getMine() {
    return apiRequest('/marketing-executive/task-updates/mine');
  },

  downloadPdf(task, kind) {
    const fileName =
      kind === 'update'
        ? task.updatePdfName || task.updatePdf?.name || 'Update.pdf'
        : task.completionPdfName || task.completionPdf?.name || 'Completion.pdf';

    return downloadWithAuth(
      `/marketing-executive/task-updates/${task.id}/download/${kind}`,
      fileName
    );
  },
};

export const crmExecutiveTaskApi = createDepartmentExecutiveTaskApi('crm');
export const crmExecutiveTaskUpdatesApi = createDepartmentExecutiveTaskUpdatesApi('crm');

export const accountsExecutiveTaskApi = createDepartmentExecutiveTaskApi('accounts');
export const accountsExecutiveTaskUpdatesApi = createDepartmentExecutiveTaskUpdatesApi('accounts');

export const hrExecutiveTaskApi = createDepartmentExecutiveTaskApi('hr');
export const hrExecutiveTaskUpdatesApi = createDepartmentExecutiveTaskUpdatesApi('hr');
export const salesExecutivePdfUpdatesApi = {
  getMine() {
    return apiRequest('/sales-executive/pdf-updates/mine');
  },

  downloadPdf(task, kind) {
    const fileName =
      kind === 'update'
        ? task.updatePdfName || task.updatePdf?.name || 'Update.pdf'
        : task.completionPdfName || task.completionPdf?.name || 'Completion.pdf';

    return downloadWithAuth(
      `/sales-executive/pdf-updates/${task.id}/download/${kind}`,
      fileName
    );
  },
};

export const mailApi = {
  send: async ({ to, cc, subject, message }) => {
    const data = await apiRequest('/mail/send', {
      method: 'POST',
      body: JSON.stringify({
        to,
        cc,
        subject,
        message,
      }),
    });

    return { data };
  },
};











