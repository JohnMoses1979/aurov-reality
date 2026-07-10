import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
  ['Dashboard', 'dashboard'],
  ['Ventures', 'ventures'],
  ['Properties', 'properties'],
  ['Employees', 'employees'],
  ['Bookings', 'bookings'],
  ['Reports', 'reports'],
  ['Assigned Work', 'assigned-work'],
  ['Submitted Work', 'submitted-work'],
  ['Complaints', 'complaints'],
  ['Settings', 'settings'],
];

export default function MDSidebar(props) {
  return <RoleSidebarBase roleLabel="Managing Director" basePath="/md" links={links} {...props} />;
}
