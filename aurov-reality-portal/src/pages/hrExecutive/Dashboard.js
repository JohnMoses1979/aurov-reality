import DepartmentExecutiveDashboardPage from '../../components/workflow/DepartmentExecutiveDashboardPage.js';
import { hrExecutiveDashboardApi } from '../../services/api.js';

export default function HrExecutiveDashboard() {
  return (
    <DepartmentExecutiveDashboardPage
      title="HR Executive Dashboard"
      roleLabel="HR Manager"
      dashboardApi={hrExecutiveDashboardApi}
    />
  );
}
