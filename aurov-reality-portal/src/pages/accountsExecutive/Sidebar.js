import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
  ['Dashboard', 'dashboard'],
  ['Assigned Tasks', 'assigned-tasks'],
  ['My Task Updates', 'my-task-updates'],
  ['Complaints', 'complaints'],
  ['Settings', 'settings'],
];

export default function AccountsExecutiveSidebar(props) {
  return <RoleSidebarBase roleLabel="Accounts Executive" basePath="/accounts-executive" links={links} {...props} />;
}
