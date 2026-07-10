export const ROLES = [
  'Managing Director',
  'Operational Head',
  'Sales Manager',
  'Sales Executive',
  'Marketing Manager',
  'Marketing Executive',
  'CRM Manager',
  'CRM Executive',
  'Accounts Manager',
  'Accounts Executive',
  'HR Manager',
  'HR Executive',
  'Customer',
];

export const SUPER_ROLES = ['Managing Director', 'Operational Head'];

export const DEPARTMENT_MANAGER_ROLES = [
  'Sales Manager',
  'Marketing Manager',
  'CRM Manager',
  'Accounts Manager',
  'HR Manager',
];

export const EXECUTIVE_ROLES = [
  'Sales Executive',
  'Marketing Executive',
  'CRM Executive',
  'Accounts Executive',
  'HR Executive',
];

export const MANAGER_ROLES = [
  ...SUPER_ROLES,
  ...DEPARTMENT_MANAGER_ROLES,
];

export const ROLE_HIERARCHY = {
  'Managing Director': DEPARTMENT_MANAGER_ROLES,
  'Operational Head': DEPARTMENT_MANAGER_ROLES,
  'Sales Manager': ['Sales Executive'],
  'Marketing Manager': ['Marketing Executive'],
  'CRM Manager': ['CRM Executive'],
  'Accounts Manager': ['Accounts Executive'],
  'HR Manager': ['HR Executive'],
};

export const MANAGER_TO_EXECUTIVE_ROLE = {
  'Sales Manager': 'Sales Executive',
  'Marketing Manager': 'Marketing Executive',
  'CRM Manager': 'CRM Executive',
  'Accounts Manager': 'Accounts Executive',
  'HR Manager': 'HR Executive',
};

export const EMPLOYEE_ID_PREFIX_BY_ROLE = {
  'Sales Manager': 'SM',
  'Sales Executive': 'SE',
  'Marketing Manager': 'MM',
  'Marketing Executive': 'ME',
  'CRM Manager': 'CM',
  'CRM Executive': 'CE',
  'Accounts Manager': 'AM',
  'Accounts Executive': 'AE',
  'HR Manager': 'HM',
  'HR Executive': 'HE',
};

export const getEmployeeIdPrefix = (role = '') => EMPLOYEE_ID_PREFIX_BY_ROLE[role] || 'EMP';

export const getManagerRoleForDepartment = (department = '') => {
  if (department === 'Sales') return 'Sales Manager';
  if (department === 'Marketing') return 'Marketing Manager';
  if (department === 'CRM') return 'CRM Manager';
  if (department === 'Accounts') return 'Accounts Manager';
  if (department === 'HR') return 'HR Manager';
  return '';
};

export const isManagerRole = (role) => MANAGER_ROLES.includes(role);
export const isDepartmentManagerRole = (role) => DEPARTMENT_MANAGER_ROLES.includes(role);
export const isExecutiveRole = (role) => EXECUTIVE_ROLES.includes(role);
export const isSuperRole = (role) => SUPER_ROLES.includes(role);

export const getRoleDepartment = (role = '') => {
  if (role.includes('Sales')) return 'Sales';
  if (role.includes('Marketing')) return 'Marketing';
  if (role.includes('CRM')) return 'CRM';
  if (role.includes('Accounts')) return 'Accounts';
  if (role.includes('HR')) return 'HR';
  if (role.includes('Operational')) return 'Operations';
  if (role.includes('Managing')) return 'Management';
  return 'Customer';
};

export const getCreatableRoles = (currentRole = '') => ROLE_HIERARCHY[currentRole] || [];
