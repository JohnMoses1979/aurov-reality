import RoleShell from '../../components/role/RoleShell.js';
import Sidebar from './Sidebar.js';

export default function AccountsManagerLayout() {
  return <RoleShell SidebarComponent={Sidebar} />;
}
