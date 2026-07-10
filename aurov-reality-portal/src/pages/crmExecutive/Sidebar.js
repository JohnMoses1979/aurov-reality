import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
  ['Dashboard', 'dashboard'],
  ['Assigned Tasks', 'assigned-tasks'],
  ['My Task Updates', 'my-task-updates'],
  ['Complaints', 'complaints'],
  ['Settings', 'settings'],
];

export default function CRMExecutiveSidebar(props) {
  return <RoleSidebarBase roleLabel="CRM Executive" basePath="/crm-executive" links={links} {...props} />;
}
