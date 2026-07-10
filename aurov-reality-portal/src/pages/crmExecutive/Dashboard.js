import DepartmentExecutiveDashboardPage from '../../components/workflow/DepartmentExecutiveDashboardPage.js';
import { crmExecutiveDashboardApi } from '../../services/api.js';

export default function CrmExecutiveDashboard() {
  return (
    <DepartmentExecutiveDashboardPage
      title="CRM Executive Dashboard"
      roleLabel="CRM Manager"
      dashboardApi={crmExecutiveDashboardApi}
    />
  );
}
