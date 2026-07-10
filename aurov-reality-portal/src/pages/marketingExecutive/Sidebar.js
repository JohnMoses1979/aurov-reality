import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
  ['Dashboard', 'dashboard'],
  ['Assigned Tasks', 'assigned-tasks'],
  ['My Task Updates', 'my-task-updates'],
  ['Complaints', 'complaints'],
  ['Settings', 'settings'],
];

export default function MarketingExecutiveSidebar(props) {
  return <RoleSidebarBase roleLabel="Marketing Executive" basePath="/marketing-executive" links={links} {...props} />;
}
