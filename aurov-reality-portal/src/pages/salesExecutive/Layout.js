import RoleShell from '../../components/role/RoleShell.js';
import Sidebar from './Sidebar.js';

export default function SalesExecutiveLayout() {
  return <RoleShell SidebarComponent={Sidebar} />;
}
