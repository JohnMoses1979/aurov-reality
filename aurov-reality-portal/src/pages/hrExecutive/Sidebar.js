import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
  ['Dashboard', 'dashboard'],
  ['Assigned Tasks', 'assigned-tasks'],
  ['My Task Updates', 'my-task-updates'],
  ['Complaints', 'complaints'],
  ['Settings', 'settings'],
];

export default function HRExecutiveSidebar(props) {
  return <RoleSidebarBase roleLabel="HR Executive" basePath="/hr-executive" links={links} {...props} />;
}
