import DepartmentExecutiveDashboardPage from '../../components/workflow/DepartmentExecutiveDashboardPage.js';
import { accountsExecutiveDashboardApi } from '../../services/api.js';

export default function AccountsExecutiveDashboard() {
  return (
    <DepartmentExecutiveDashboardPage
      title="Accounts Executive Dashboard"
      roleLabel="Accounts Manager"
      dashboardApi={accountsExecutiveDashboardApi}
    />
  );
}
