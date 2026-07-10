import RoleShell from '../../components/role/RoleShell.js';
import Sidebar from './Sidebar.js';

export default function HRExecutiveLayout() {
  return <RoleShell SidebarComponent={Sidebar} />;
}
