import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
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

export default function SalesManagerSidebar(props) {
  return <RoleSidebarBase roleLabel="Sales Manager" basePath="/sales-manager" links={links} {...props} />;
}
