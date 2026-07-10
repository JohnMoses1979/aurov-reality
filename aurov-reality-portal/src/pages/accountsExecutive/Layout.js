import RoleShell from '../../components/role/RoleShell.js';
import Sidebar from './Sidebar.js';

export default function AccountsExecutiveLayout() {
  return <RoleShell SidebarComponent={Sidebar} />;
}
