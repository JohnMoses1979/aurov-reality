export const managerNav = [
  ['Dashboard', 'dashboard'],
  ['Assigned Work', 'assigned-work'],
  ['My Executives', 'my-executives'],
  ['Assign Tasks', 'assign-tasks'],
  ['Task Updates', 'task-updates'],
  ['Submit Work to MD/OH', 'submit-work'],
  ['Complaints', 'complaints'],
  ['Bookings', 'bookings'],
  ['Reports', 'reports'],
  ['Settings', 'settings'],
];

export const executiveNav = [
  ['Dashboard', 'dashboard'],
  ['Assigned Tasks', 'assigned-tasks'],
  ['My Task Updates', 'my-task-updates'],
  ['Complaints', 'complaints'],
  ['Settings', 'settings'],
];

export const roleRouteConfig = {
  'Managing Director': {
    key: 'md',
    base: '/md',
    label: 'Managing Director',
    department: 'Management',
    nav: [['Dashboard', 'dashboard'], ['Ventures', 'ventures'], ['Properties', 'properties'], ['Employees', 'employees'], ['Bookings', 'bookings'], ['Reports', 'reports'],['Assigned Work', 'assigned-work'], ['Submitted Work', 'submitted-work'], ['Complaints', 'complaints'], ['Settings', 'settings']],
  },
  'Operational Head': {
    key: 'operationalHead',
    base: '/operational-head',
    label: 'Operational Head',
    department: 'Operations',
    nav: [['Dashboard', 'dashboard'], ['Ventures', 'ventures'], ['Properties', 'properties'], ['Employees', 'employees'], ['Bookings', 'bookings'], ['Reports', 'reports'],['Assigned Work', 'assigned-work'], ['Submitted Work', 'submitted-work'], ['Complaints', 'complaints'], ['Settings', 'settings']],
  },
  'Sales Manager': { key: 'salesManager', base: '/sales-manager', label: 'Sales Manager', department: 'Sales', nav: managerNav },
  'Marketing Manager': { key: 'marketingManager', base: '/marketing-manager', label: 'Marketing Manager', department: 'Marketing', nav: managerNav },
  'CRM Manager': { key: 'crmManager', base: '/crm-manager', label: 'CRM Manager', department: 'CRM', nav: managerNav },
  'Accounts Manager': { key: 'accountsManager', base: '/accounts-manager', label: 'Accounts Manager', department: 'Accounts', nav: managerNav },
  'HR Manager': { key: 'hrManager', base: '/hr-manager', label: 'HR Manager', department: 'HR', nav: managerNav },
  'Sales Executive': { key: 'salesExecutive', base: '/sales-executive', label: 'Sales Executive', department: 'Sales', nav: executiveNav },
  'Marketing Executive': { key: 'marketingExecutive', base: '/marketing-executive', label: 'Marketing Executive', department: 'Marketing', nav: executiveNav },
  'CRM Executive': { key: 'crmExecutive', base: '/crm-executive', label: 'CRM Executive', department: 'CRM', nav: executiveNav },
  'Accounts Executive': { key: 'accountsExecutive', base: '/accounts-executive', label: 'Accounts Executive', department: 'Accounts', nav: executiveNav },
  'HR Executive': { key: 'hrExecutive', base: '/hr-executive', label: 'HR Executive', department: 'HR', nav: executiveNav },
  Customer: {
    key: 'customer',
    base: '/customer',
    label: 'Customer',
    department: 'Customer',
    nav: [['Home', 'home'], ['Ventures', 'ventures'], ['Properties', 'properties'], ['Book Demo', 'book-demo'], ['Contact Us', 'contact-us'], ['Book Property', 'book-property'], ['Booking History', 'booking-history'], ['Settings', 'settings']],
  },
};

export const getRoleHomePath = (role) => `${roleRouteConfig[role]?.base || '/login'}/${role === 'Customer' ? 'home' : 'dashboard'}`;
export const getRoleBasePath = (role) => roleRouteConfig[role]?.base || '/login';
export const roleToRouteKey = (role) => roleRouteConfig[role]?.key || 'guest';
