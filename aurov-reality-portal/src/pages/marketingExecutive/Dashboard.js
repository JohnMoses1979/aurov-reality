import DepartmentExecutiveDashboardPage from '../../components/workflow/DepartmentExecutiveDashboardPage.js';
import { marketingExecutiveDashboardApi } from '../../services/api.js';

export default function MarketingExecutiveDashboard() {
  return (
    <DepartmentExecutiveDashboardPage
      title="Marketing Executive Dashboard"
      roleLabel="Marketing Manager"
      dashboardApi={marketingExecutiveDashboardApi}
    />
  );
}
