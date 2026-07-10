const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function safeDate(value) {
  if (!value) return new Date();
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? new Date() : value;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date();
}

function monthLabel(item = {}) {
  const date = safeDate(item.createdIso || item.soldAt || item.reservedAt || item.updatedIso || item.createdAt || item.date);
  return MONTHS[date.getMonth()];
}

function emptyMonthRows() {
  return MONTHS.map((month) => ({ month }));
}

export function getBookingOverview(bookings = [], leads = []) {
  const rows = emptyMonthRows().map((row) => ({
    ...row,
    demoBookings: 0,
    reservations: 0,
    purchases: 0,
    siteVisits: 0,
  }));
  const map = Object.fromEntries(rows.map((row) => [row.month, row]));

  leads.forEach((lead) => {
    if (!String(lead.source || '').toLowerCase().includes('demo')) return;
    map[monthLabel(lead)].demoBookings += 1;
  });

  bookings.forEach((booking) => {
    const row = map[monthLabel(booking)];
    const type = String(booking.type || '').toLowerCase();
    const status = String(booking.status || '').toLowerCase();
    const source = String(booking.source || '').toLowerCase();

    if (type.includes('site') || status.includes('site') || source.includes('demo')) row.siteVisits += 1;
    if (type.includes('reservation') || source.includes('reservation')) row.reservations += 1;
    if (type.includes('purchase') || status === 'confirmed' || status === 'closed' || status === 'converted') row.purchases += 1;
  });

  return rows;
}

export function getSalesOverview(properties = []) {
  const rows = emptyMonthRows().map((row) => ({ ...row, revenue: 0, salesCount: 0 }));
  const map = Object.fromEntries(rows.map((row) => [row.month, row]));

  properties
    .filter((property) => String(property.status || '').toLowerCase() === 'sold')
    .forEach((property) => {
      const row = map[monthLabel(property)];
      row.revenue += Number(property.price || 0);
      row.salesCount += 1;
    });

  return rows.map((row) => ({
    ...row,
    revenueLakhs: Number((row.revenue / 100000).toFixed(2)),
  }));
}

export function getPropertyStatusData(properties = []) {
  return ['Available', 'Reserved', 'Sold'].map((name) => ({
    name,
    value: properties.filter((item) => String(item.status || '').toLowerCase() === name.toLowerCase()).length,
  }));
}

export function getSalesTotals(properties = []) {
  const sold = properties.filter((item) => String(item.status || '').toLowerCase() === 'sold');
  return {
    totalRevenue: sold.reduce((sum, item) => sum + Number(item.price || 0), 0),
    salesCount: sold.length,
  };
}

const completedTaskStatuses = ['Completed', 'Approved', 'Closed'];

function sameAssignee(task = {}, employee = {}) {
  const keys = [employee.id, employee.employeeId, employee.username, employee.email, employee.name]
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase());
  return [task.assigneeId, task.assigneeEmployeeId, task.assigneeUsername, task.assigneeEmail, task.assignee]
    .filter(Boolean)
    .some((item) => keys.includes(String(item).trim().toLowerCase()));
}

export function getTaskProgressForEmployee(employee = {}, tasks = []) {
  const assigned = tasks.filter((task) => sameAssignee(task, employee));
  const completed = assigned.filter((task) => completedTaskStatuses.includes(task.status));
  return {
    total: assigned.length,
    completed: completed.length,
    percent: assigned.length ? Math.round((completed.length / assigned.length) * 100) : 0,
  };
}

export function getVentureStats(ventureId, properties = []) {
  const ventureProperties = properties.filter((property) => property.ventureId === ventureId);
  const availableUnits = ventureProperties.filter((property) => property.status === 'Available').length;
  const reservedUnits = ventureProperties.filter((property) => property.status === 'Reserved').length;
  const soldUnits = ventureProperties.filter((property) => property.status === 'Sold').length;
  const bookedUnits = reservedUnits + soldUnits;
  const revenue = ventureProperties
    .filter((property) => property.status === 'Sold')
    .reduce((sum, property) => sum + Number(property.price || 0), 0);
  const progress = ventureProperties.length ? Math.round((bookedUnits / ventureProperties.length) * 100) : 0;
  return { totalUnits: ventureProperties.length, availableUnits, reservedUnits, soldUnits, bookedUnits, revenue, progress };
}
