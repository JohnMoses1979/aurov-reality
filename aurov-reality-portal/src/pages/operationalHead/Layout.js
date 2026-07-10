import RoleShell from '../../components/role/RoleShell.js';
import Sidebar from './Sidebar.js';

export default function OperationalHeadLayout() {
  return <RoleShell SidebarComponent={Sidebar} />;
}
