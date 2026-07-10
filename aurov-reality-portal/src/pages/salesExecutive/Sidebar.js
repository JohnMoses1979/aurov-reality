import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
  ['Dashboard', 'dashboard'],
  ['Assigned Tasks', 'assigned-tasks'],
  ['My Task Updates', 'my-task-updates'],
  ['Complaints', 'complaints'],
  ['Settings', 'settings'],
];

export default function SalesExecutiveSidebar(props) {
  return <RoleSidebarBase roleLabel="Sales Executive" basePath="/sales-executive" links={links} {...props} />;
}
