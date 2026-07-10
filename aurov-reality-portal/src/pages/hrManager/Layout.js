import RoleShell from '../../components/role/RoleShell.js';
import Sidebar from './Sidebar.js';

export default function HRManagerLayout() {
  return <RoleShell SidebarComponent={Sidebar} />;
}
