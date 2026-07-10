import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
  ['Dashboard', 'dashboard'],
  ['Assigned Work', 'assigned-work'],
  ['My Executives', 'my-executives'],
  ['Assign Tasks', 'assign-tasks'],
  ['Task Updates', 'task-updates'],
  ['Submit Work to MD/OH', 'submit-work'],
  ['Complaints', 'complaints'],
  ['Reports', 'reports'],
  ['Settings', 'settings'],
];

export default function CRMManagerSidebar(props) {
  return <RoleSidebarBase roleLabel="CRM Manager" basePath="/crm-manager" links={links} {...props} />;
}
