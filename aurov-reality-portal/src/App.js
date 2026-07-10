import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login.js';
import ForgotPassword from './pages/ForgotPassword.js';
import CustomerForgotPassword from './pages/CustomerForgotPassword.js';
import NotFound from './pages/NotFound.js';
import ProtectedRoute, { RoleHomeRedirect, RootEntry } from './routes/ProtectedRoute.js';
import { LegacyVentureRedirect } from './routes/LegacyRedirects.js';
import MDLayout from './pages/md/Layout.js';
import MDDashboard from './pages/md/Dashboard.js';
import MDVentures from './pages/md/Ventures.js';
import MDProperties from './pages/md/Properties.js';
import MDEmployees from './pages/md/Employees.js';
import MDBookings from './pages/md/Bookings.js';
import MDReports from './pages/md/Reports.js';
import MDComplaints from './pages/md/Complaints.js';
import MDSettings from './pages/md/Settings.js';
import MDSubmittedWork from './pages/md/SubmittedWork.js';
import MdOhAssignManagerTasks from './pages/md/MdOhAssignManagerTasks.js';
import OperationalHeadLayout from './pages/operationalHead/Layout.js';
import OperationalHeadDashboard from './pages/operationalHead/Dashboard.js';
import OperationalHeadVentures from './pages/operationalHead/Ventures.js';
import OperationalHeadProperties from './pages/operationalHead/Properties.js';
import OperationalHeadEmployees from './pages/operationalHead/Employees.js';
import OperationalHeadBookings from './pages/operationalHead/Bookings.js';
import OperationalHeadReports from './pages/operationalHead/Reports.js';
import OperationalHeadComplaints from './pages/operationalHead/Complaints.js';
import OperationalHeadSettings from './pages/operationalHead/Settings.js';
import OperationalHeadSubmittedWork from './pages/operationalHead/SubmittedWork.js';
import SalesManagerLayout from './pages/salesManager/Layout.js';
import SalesManagerDashboard from './pages/salesManager/Dashboard.js';
import SalesManagerLeads from './pages/salesManager/Leads.js';
import SalesManagerSalesExecutives from './pages/salesManager/SalesExecutives.js';
import SalesManagerAssignPDFTasks from './pages/salesManager/AssignPDFTasks.js';
import SalesManagerPDFCenter from './pages/salesManager/PDFCenter.js';
import SalesManagerReports from './pages/salesManager/Reports.js';
import SalesManagerComplaints from './pages/salesManager/Complaints.js';
import SalesManagerTaskUpdates from './pages/salesManager/TaskUpdates.js';
import SalesManagerBookings from './pages/salesManager/Bookings.js';
import SalesManagerSubmitWork from './pages/salesManager/SubmitWork.js';
import SalesManagerAssignedWork from './pages/salesManager/AssignedWork.js';
import SalesExecutiveLayout from './pages/salesExecutive/Layout.js';
import SalesExecutiveDashboard from './pages/salesExecutive/Dashboard.js';
import SalesExecutiveAssignedTasks from './pages/salesExecutive/AssignedTasks.js';
import SalesExecutiveMyLeads from './pages/salesExecutive/MyLeads.js';
import SalesExecutiveUploadPDFUpdates from './pages/salesExecutive/UploadPDFUpdates.js';
import SalesExecutiveComplaints from './pages/salesExecutive/Complaints.js';
import SalesExecutiveMyTaskUpdates from './pages/salesExecutive/MyTaskUpdates.js';
import MarketingManagerLayout from './pages/marketingManager/Layout.js';
import MarketingManagerDashboard from './pages/marketingManager/Dashboard.js';
import MarketingManagerMarketingExecutives from './pages/marketingManager/MarketingExecutives.js';
import MarketingManagerCampaigns from './pages/marketingManager/Campaigns.js';
import MarketingManagerAssignTasks from './pages/marketingManager/AssignTasks.js';
import MarketingManagerReports from './pages/marketingManager/Reports.js';
import MarketingManagerComplaints from './pages/marketingManager/Complaints.js';
import MarketingManagerTaskUpdates from './pages/marketingManager/TaskUpdates.js';
import MarketingManagerSubmitWork from './pages/marketingManager/SubmitWork.js';
import MarketingManagerAssignedWork from './pages/marketingManager/AssignedWork.js';
import MarketingExecutiveLayout from './pages/marketingExecutive/Layout.js';
import MarketingExecutiveDashboard from './pages/marketingExecutive/Dashboard.js';
import MarketingExecutiveAssignedCampaigns from './pages/marketingExecutive/AssignedCampaigns.js';
import MarketingExecutiveUploadReports from './pages/marketingExecutive/UploadReports.js';
import MarketingExecutiveComplaints from './pages/marketingExecutive/Complaints.js';
import MarketingExecutiveAssignedTasks from './pages/marketingExecutive/AssignedTasks.js';
import MarketingExecutiveMyTaskUpdates from './pages/marketingExecutive/MyTaskUpdates.js';
import CRMManagerLayout from './pages/crmManager/Layout.js';
import CRMManagerDashboard from './pages/crmManager/Dashboard.js';
import CRMManagerCRMExecutives from './pages/crmManager/CRMExecutives.js';
import CRMManagerCustomerFollowups from './pages/crmManager/CustomerFollowups.js';
import CRMManagerAssignTasks from './pages/crmManager/AssignTasks.js';
import CRMManagerComplaints from './pages/crmManager/Complaints.js';
import CRMManagerTaskUpdates from './pages/crmManager/TaskUpdates.js';
import CRMManagerReports from './pages/crmManager/Reports.js';
import CRMManagerSubmitWork from './pages/crmManager/SubmitWork.js';
import CRMManagerAssignedWork from './pages/crmManager/AssignedWork.js';
import CRMExecutiveLayout from './pages/crmExecutive/Layout.js';
import CRMExecutiveDashboard from './pages/crmExecutive/Dashboard.js';
import CRMExecutiveFollowups from './pages/crmExecutive/Followups.js';
import CRMExecutiveUploadReports from './pages/crmExecutive/UploadReports.js';
import CRMExecutiveComplaints from './pages/crmExecutive/Complaints.js';
import CRMExecutiveAssignedTasks from './pages/crmExecutive/AssignedTasks.js';
import CRMExecutiveMyTaskUpdates from './pages/crmExecutive/MyTaskUpdates.js';
import AccountsManagerLayout from './pages/accountsManager/Layout.js';
import AccountsManagerDashboard from './pages/accountsManager/Dashboard.js';
import AccountsManagerAccountsExecutives from './pages/accountsManager/AccountsExecutives.js';
import AccountsManagerPayments from './pages/accountsManager/Payments.js';
import AccountsManagerInvoices from './pages/accountsManager/Invoices.js';
import AccountsManagerReports from './pages/accountsManager/Reports.js';
import AccountsManagerComplaints from './pages/accountsManager/Complaints.js';
import AccountsManagerAssignTasks from './pages/accountsManager/AssignTasks.js';
import AccountsManagerTaskUpdates from './pages/accountsManager/TaskUpdates.js';
import AccountsManagerSubmitWork from './pages/accountsManager/SubmitWork.js';
import AccountsManagerAssignedWork from './pages/accountsManager/AssignedWork.js';
import AccountsExecutiveLayout from './pages/accountsExecutive/Layout.js';
import AccountsExecutiveDashboard from './pages/accountsExecutive/Dashboard.js';
import AccountsExecutivePaymentVerification from './pages/accountsExecutive/PaymentVerification.js';
import AccountsExecutiveUploadReports from './pages/accountsExecutive/UploadReports.js';
import AccountsExecutiveComplaints from './pages/accountsExecutive/Complaints.js';
import AccountsExecutiveAssignedTasks from './pages/accountsExecutive/AssignedTasks.js';
import AccountsExecutiveMyTaskUpdates from './pages/accountsExecutive/MyTaskUpdates.js';
import HRManagerLayout from './pages/hrManager/Layout.js';
import HRManagerDashboard from './pages/hrManager/Dashboard.js';
import HRManagerHRExecutives from './pages/hrManager/HRExecutives.js';
import HRManagerRecruitment from './pages/hrManager/Recruitment.js';
import HRManagerEmployeeRecords from './pages/hrManager/EmployeeRecords.js';
import HRManagerComplaints from './pages/hrManager/Complaints.js';
import HRManagerAssignTasks from './pages/hrManager/AssignTasks.js';
import HRManagerTaskUpdates from './pages/hrManager/TaskUpdates.js';
import HRManagerReports from './pages/hrManager/Reports.js';
import HRManagerSubmitWork from './pages/hrManager/SubmitWork.js';
import HRManagerAssignedWork from './pages/hrManager/AssignedWork.js';
import HRExecutiveLayout from './pages/hrExecutive/Layout.js';
import HRExecutiveDashboard from './pages/hrExecutive/Dashboard.js';
import HRExecutiveRecruitmentTasks from './pages/hrExecutive/RecruitmentTasks.js';
import HRExecutiveEmployeeUpdates from './pages/hrExecutive/EmployeeUpdates.js';
import HRExecutiveComplaints from './pages/hrExecutive/Complaints.js';
import HRExecutiveAssignedTasks from './pages/hrExecutive/AssignedTasks.js';
import HRExecutiveMyTaskUpdates from './pages/hrExecutive/MyTaskUpdates.js';
import CustomerLayout from './pages/customer/Layout.js';
import CustomerHome from './pages/customer/CustomerHome.js';
import CustomerVentures from './pages/customer/CustomerVentures.js';
import VentureDetails from './pages/customer/VentureDetails.js';
import CustomerProperties from './pages/customer/CustomerProperties.js';
import PropertyDetails from './pages/customer/PropertyDetails.js';
import LeadershipVentureDetails from './pages/shared/LeadershipVentureDetails.js';
import LeadershipPropertyDetails from './pages/shared/LeadershipPropertyDetails.js';
import BookSiteVisit from './pages/customer/BookSiteVisit.js';
import Contact from './pages/customer/Contact.js';
import BookProperty from './pages/customer/BookProperty.js';
import BookingHistory from './pages/customer/BookingHistory.js';
import CustomerAbout from './pages/customer/CustomerAbout.js';
import CustomerRegister from './pages/customer/Register.js';
import SalesManagerSettings from './pages/salesManager/Settings.js';
import SalesExecutiveSettings from './pages/salesExecutive/Settings.js';
import MarketingManagerSettings from './pages/marketingManager/Settings.js';
import MarketingExecutiveSettings from './pages/marketingExecutive/Settings.js';
import CRMManagerSettings from './pages/crmManager/Settings.js';
import CRMExecutiveSettings from './pages/crmExecutive/Settings.js';
import AccountsManagerSettings from './pages/accountsManager/Settings.js';
import AccountsExecutiveSettings from './pages/accountsExecutive/Settings.js';
import HRManagerSettings from './pages/hrManager/Settings.js';
import HRExecutiveSettings from './pages/hrExecutive/Settings.js';
import CustomerSettings from './pages/customer/Settings.js';
import HomePage from './pages/home/HomePage.js';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/customer-forgot-password" element={<CustomerForgotPassword />} />
        <Route path="/customer-register" element={<CustomerRegister />} />
        <Route path="/app/*" element={<RoleHomeRedirect />} />
        <Route path="/venture/:id" element={<LegacyVentureRedirect />} />

        <Route path="/md" element={<ProtectedRoute allowedRole="Managing Director"><MDLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MDDashboard />} />
          <Route path="ventures" element={<MDVentures />} />
          <Route path="properties" element={<MDProperties />} />
          <Route path="employees" element={<MDEmployees />} />
          <Route path="bookings" element={<MDBookings />} />
          <Route path="reports" element={<MDReports />} />
          <Route path="assigned-work" element={<MdOhAssignManagerTasks />} />
          <Route path="ventures/:id" element={<LeadershipVentureDetails />} />
          <Route path="properties/:id" element={<LeadershipPropertyDetails />} />
          <Route path="submitted-work" element={<MDSubmittedWork />} />
          <Route path="complaints" element={<MDComplaints />} />
          <Route path="settings" element={<MDSettings />} />
        </Route>

        <Route path="/operational-head" element={<ProtectedRoute allowedRole="Operational Head"><OperationalHeadLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OperationalHeadDashboard />} />
          <Route path="ventures" element={<OperationalHeadVentures />} />
          <Route path="properties" element={<OperationalHeadProperties />} />
          <Route path="employees" element={<OperationalHeadEmployees />} />
          <Route path="bookings" element={<OperationalHeadBookings />} />
          <Route path="reports" element={<OperationalHeadReports />} />
          <Route path="assigned-work" element={<MdOhAssignManagerTasks />} />
          <Route path="ventures/:id" element={<LeadershipVentureDetails />} />
          <Route path="properties/:id" element={<LeadershipPropertyDetails />} />
          <Route path="submitted-work" element={<OperationalHeadSubmittedWork />} />
          <Route path="complaints" element={<OperationalHeadComplaints />} />
          <Route path="settings" element={<OperationalHeadSettings />} />
        </Route>

        <Route path="/sales-manager" element={<ProtectedRoute allowedRole="Sales Manager"><SalesManagerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SalesManagerDashboard />} />
          <Route path="assigned-work" element={<SalesManagerAssignedWork />} />
          <Route path="my-executives" element={<SalesManagerSalesExecutives />} />
          <Route path="assign-tasks" element={<SalesManagerAssignPDFTasks />} />
          <Route path="task-updates" element={<SalesManagerTaskUpdates />} />
          <Route path="submit-work" element={<SalesManagerSubmitWork />} />
          <Route path="complaints" element={<SalesManagerComplaints />} />
          <Route path="bookings" element={<SalesManagerBookings />} />
          <Route path="reports" element={<SalesManagerReports />} />
          <Route path="leads" element={<Navigate to="bookings" replace />} />
          <Route path="sales-executives" element={<Navigate to="my-executives" replace />} />
          <Route path="assign-pdf-tasks" element={<Navigate to="assign-tasks" replace />} />
          <Route path="pdf-center" element={<Navigate to="task-updates" replace />} />
          <Route path="settings" element={<SalesManagerSettings />} />
        </Route>

        <Route path="/sales-executive" element={<ProtectedRoute allowedRole="Sales Executive"><SalesExecutiveLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SalesExecutiveDashboard />} />
          <Route path="assigned-tasks" element={<SalesExecutiveAssignedTasks />} />
          <Route path="my-task-updates" element={<SalesExecutiveMyTaskUpdates />} />
          <Route path="complaints" element={<SalesExecutiveComplaints />} />
          <Route path="my-leads" element={<Navigate to="assigned-tasks" replace />} />
          <Route path="upload-pdf-updates" element={<Navigate to="my-task-updates" replace />} />
          <Route path="settings" element={<SalesExecutiveSettings />} />
        </Route>

        <Route path="/marketing-manager" element={<ProtectedRoute allowedRole="Marketing Manager"><MarketingManagerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MarketingManagerDashboard />} />
          <Route path="assigned-work" element={<MarketingManagerAssignedWork />} />
          <Route path="my-executives" element={<MarketingManagerMarketingExecutives />} />
          <Route path="assign-tasks" element={<MarketingManagerAssignTasks />} />
          <Route path="task-updates" element={<MarketingManagerTaskUpdates />} />
          <Route path="submit-work" element={<MarketingManagerSubmitWork />} />
          <Route path="complaints" element={<MarketingManagerComplaints />} />
          <Route path="bookings" element={<Navigate to="dashboard" replace />} />
          <Route path="reports" element={<MarketingManagerReports />} />
          <Route path="marketing-executives" element={<Navigate to="my-executives" replace />} />
          <Route path="campaigns" element={<Navigate to="dashboard" replace />} />
          <Route path="settings" element={<MarketingManagerSettings />} />
        </Route>

        <Route path="/marketing-executive" element={<ProtectedRoute allowedRole="Marketing Executive"><MarketingExecutiveLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MarketingExecutiveDashboard />} />
          <Route path="assigned-tasks" element={<MarketingExecutiveAssignedTasks />} />
          <Route path="my-task-updates" element={<MarketingExecutiveMyTaskUpdates />} />
          <Route path="complaints" element={<MarketingExecutiveComplaints />} />
          <Route path="assigned-campaigns" element={<Navigate to="assigned-tasks" replace />} />
          <Route path="upload-reports" element={<Navigate to="my-task-updates" replace />} />
          <Route path="settings" element={<MarketingExecutiveSettings />} />
        </Route>

        <Route path="/crm-manager" element={<ProtectedRoute allowedRole="CRM Manager"><CRMManagerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CRMManagerDashboard />} />
          <Route path="assigned-work" element={<CRMManagerAssignedWork />} />
          <Route path="my-executives" element={<CRMManagerCRMExecutives />} />
          <Route path="assign-tasks" element={<CRMManagerAssignTasks />} />
          <Route path="task-updates" element={<CRMManagerTaskUpdates />} />
          <Route path="submit-work" element={<CRMManagerSubmitWork />} />
          <Route path="complaints" element={<CRMManagerComplaints />} />
          <Route path="bookings" element={<Navigate to="dashboard" replace />} />
          <Route path="reports" element={<CRMManagerReports />} />
          <Route path="crm-executives" element={<Navigate to="my-executives" replace />} />
          <Route path="customer-followups" element={<Navigate to="dashboard" replace />} />
          <Route path="settings" element={<CRMManagerSettings />} />
        </Route>

        <Route path="/crm-executive" element={<ProtectedRoute allowedRole="CRM Executive"><CRMExecutiveLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CRMExecutiveDashboard />} />
          <Route path="assigned-tasks" element={<CRMExecutiveAssignedTasks />} />
          <Route path="my-task-updates" element={<CRMExecutiveMyTaskUpdates />} />
          <Route path="complaints" element={<CRMExecutiveComplaints />} />
          <Route path="followups" element={<Navigate to="assigned-tasks" replace />} />
          <Route path="upload-reports" element={<Navigate to="my-task-updates" replace />} />
          <Route path="settings" element={<CRMExecutiveSettings />} />
        </Route>

        <Route path="/accounts-manager" element={<ProtectedRoute allowedRole="Accounts Manager"><AccountsManagerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AccountsManagerDashboard />} />
          <Route path="assigned-work" element={<AccountsManagerAssignedWork />} />
          <Route path="my-executives" element={<AccountsManagerAccountsExecutives />} />
          <Route path="assign-tasks" element={<AccountsManagerAssignTasks />} />
          <Route path="task-updates" element={<AccountsManagerTaskUpdates />} />
          <Route path="submit-work" element={<AccountsManagerSubmitWork />} />
          <Route path="complaints" element={<AccountsManagerComplaints />} />
          <Route path="bookings" element={<Navigate to="dashboard" replace />} />
          <Route path="reports" element={<AccountsManagerReports />} />
          <Route path="accounts-executives" element={<Navigate to="my-executives" replace />} />
          <Route path="payments" element={<Navigate to="reports" replace />} />
          <Route path="invoices" element={<Navigate to="reports" replace />} />
          <Route path="settings" element={<AccountsManagerSettings />} />
        </Route>

        <Route path="/accounts-executive" element={<ProtectedRoute allowedRole="Accounts Executive"><AccountsExecutiveLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AccountsExecutiveDashboard />} />
          <Route path="assigned-tasks" element={<AccountsExecutiveAssignedTasks />} />
          <Route path="my-task-updates" element={<AccountsExecutiveMyTaskUpdates />} />
          <Route path="complaints" element={<AccountsExecutiveComplaints />} />
          <Route path="payment-verification" element={<Navigate to="assigned-tasks" replace />} />
          <Route path="upload-reports" element={<Navigate to="my-task-updates" replace />} />
          <Route path="settings" element={<AccountsExecutiveSettings />} />
        </Route>

        <Route path="/hr-manager" element={<ProtectedRoute allowedRole="HR Manager"><HRManagerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HRManagerDashboard />} />
          <Route path="assigned-work" element={<HRManagerAssignedWork />} />
          <Route path="my-executives" element={<HRManagerHRExecutives />} />
          <Route path="assign-tasks" element={<HRManagerAssignTasks />} />
          <Route path="task-updates" element={<HRManagerTaskUpdates />} />
          <Route path="submit-work" element={<HRManagerSubmitWork />} />
          <Route path="complaints" element={<HRManagerComplaints />} />
          <Route path="bookings" element={<Navigate to="dashboard" replace />} />
          <Route path="reports" element={<HRManagerReports />} />
          <Route path="hr-executives" element={<Navigate to="my-executives" replace />} />
          <Route path="recruitment" element={<Navigate to="my-executives" replace />} />
          <Route path="employee-records" element={<Navigate to="my-executives" replace />} />
          <Route path="settings" element={<HRManagerSettings />} />
        </Route>

        <Route path="/hr-executive" element={<ProtectedRoute allowedRole="HR Executive"><HRExecutiveLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HRExecutiveDashboard />} />
          <Route path="assigned-tasks" element={<HRExecutiveAssignedTasks />} />
          <Route path="my-task-updates" element={<HRExecutiveMyTaskUpdates />} />
          <Route path="complaints" element={<HRExecutiveComplaints />} />
          <Route path="recruitment-tasks" element={<Navigate to="assigned-tasks" replace />} />
          <Route path="employee-updates" element={<Navigate to="my-task-updates" replace />} />
          <Route path="settings" element={<HRExecutiveSettings />} />
        </Route>

        <Route path="/customer" element={<ProtectedRoute allowedRole="Customer"><CustomerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<CustomerHome />} />
          <Route path="about" element={<CustomerAbout />} />
          <Route path="ventures" element={<CustomerVentures />} />
          <Route path="ventures/:id" element={<VentureDetails />} />
          <Route path="properties" element={<CustomerProperties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="book-demo" element={<BookSiteVisit />} />
          <Route path="book-site-visit" element={<Navigate to="/customer/book-demo" replace />} />
          <Route path="contact-us" element={<Contact />} />
          <Route path="contact" element={<Navigate to="/customer/contact-us" replace />} />
          <Route path="book-property" element={<BookProperty />} />
          <Route path="booking-history" element={<BookingHistory />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}






