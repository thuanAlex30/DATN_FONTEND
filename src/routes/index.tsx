import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, type ComponentType } from 'react';
import AuthGuard from '../components/AuthGuard';
import AdminLayout from '../pages/Admin/layout/AdminLayout';
import LoginPage from '../pages/Login';
import ForgotPasswordPage from '../pages/ForgotPassword';
import UnauthorizedPage from '../pages/Unauthorized';
import HomePage from '../pages/Home';
import DashboardPage from '../pages/Admin/Dashboard';
import DepartmentManagementPage from '../pages/Admin/DepartmentManagement';
import SystemAdminHome from '../pages/Admin/SystemAdminHome';
import CustomersPage from '../pages/Admin/Customers';
import SupportMessagesPage from '../pages/system_admin/SupportMessages';
import UserManagementPage from '../pages/Admin/UserManagement';
import SystemLogsPage from '../pages/Admin/SystemSettings';
import ProjectManagement from '../pages/header_department/ProjectManagement';
import RoleManagementPage from '../pages/Admin/RoleManagement';
import ClassifyIncident from '../pages/header_department/IncidentManagement/ClassifyIncident';
import AssignIncident from '../pages/header_department/IncidentManagement/AssignIncident';
import InvestigateIncident from '../pages/header_department/IncidentManagement/InvestigateIncident';
import UpdateProgress from '../pages/header_department/IncidentManagement/UpdateProgress';
import CloseIncident from '../pages/header_department/IncidentManagement/CloseIncident';
import ProgressHistory from '../pages/header_department/IncidentManagement/ProgressHistory';
import EscalateIncident from '../pages/header_department/IncidentManagement/EscalateIncident';
import HeaderDepartmentCertificateManagementPage from '../pages/header_department/CertificateManagement';
import HeaderDepartmentIncidentManagementPage from '../pages/header_department/IncidentManagement';
import HeaderDepartmentPPEManagementPage from '../pages/header_department/PPEManagement';
import HeaderDepartmentTrainingManagementPage from '../pages/header_department/TrainingManagement';
import HeaderDepartmentDashboard from '../pages/header_department/Dashboard';
import HeaderDepartmentHikvisionEventsPage from '../pages/header_department/HikvisionEvents';
import HeaderDepartmentLayout from '../components/HeaderDepartment/HeaderDepartmentLayout';
import { ManagerLayout } from '../components/Manager';
import ManagerReportIncident from '../pages/Manager/ReportIncident';
import AssignedIncidents from '../pages/Manager/IncidentHandling/AssignedIncidents';
import EmployeeTraining from '../pages/Employee/Training';
import TrainingSession from '../pages/Employee/TrainingSession';
import EmployeePPE from '../pages/Employee/PPE';
import EmployeeProjectManagement from '../pages/Employee/ProjectManagement';
import EmployeeDashboard from '../pages/Employee/Dashboard';
import ManagerDashboard from '../pages/Manager/Dashboard';
import ManagerPPEManagement from '../pages/Manager/PPEManagement';
import ManagerProjectManagement from '../pages/Manager/ProjectManagement';
import ManagerTraining from '../pages/Manager/Training';
import ManagerHikvisionEventsPage from '../pages/Manager/HikvisionEvents';
import ManagerCertificates from '../pages/Manager/Certificates';
import EmployeeCertificates from '../pages/Employee/Certificates';
import WebSocketTest from '../pages/WebSocketTest';
import LandingPage from '../pages/Landing';
import PricingPage from '../pages/Pricing';
import OrderFormPage from '../pages/Pricing/OrderForm';
import ContractPreviewPage from '../pages/Pricing/ContractPreview';
import PaymentSuccess from '../pages/Pricing/PaymentSuccess';
import PaymentFailed from '../pages/Pricing/PaymentFailed';
import PaymentCancelled from '../pages/Pricing/PaymentCancelled';
import AboutPage from '../pages/About';
import ContactPage from '../pages/Contact';
import FAQPage from '../pages/FAQ';
import ProfilePage from '../pages/Profile';
import { projectManagementRoutes } from './projectManagementRoutes';
import ProjectManagementRouteWrapper from './ProjectManagementRouteWrapper';

interface ProjectManagementRoute {
    path: string;
    component: ComponentType<{ projectId: string }>;
}

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/pricing/order" element={<OrderFormPage />} />
            <Route path="/pricing/contract-preview" element={<ContractPreviewPage />} />
            <Route path="/pricing/payment-success" element={<PaymentSuccess />} />
            <Route path="/pricing/payment-failed" element={<PaymentFailed />} />
            <Route path="/pricing/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Home route for non-admin users */}
            <Route 
                path="/home" 
                element={
                    <AuthGuard>
                        <HomePage />
                    </AuthGuard>
                } 
            />

            {/* Profile route - accessible to all authenticated users */}
            <Route 
                path="/profile" 
                element={
                    <AuthGuard>
                        <AdminLayout>
                            <ProfilePage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />

            {/* Employee Dashboard */}
            <Route 
                path="/employee/dashboard" 
                element={
                    <AuthGuard minRoleLevel={10} maxRoleLevel={20} tenantScope="tenant" departmentScope="own">
                        <EmployeeDashboard />
                    </AuthGuard>
                } 
            />

            {/* Manager Dashboard */}
            <Route 
                path="/manager/dashboard" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerDashboard />
                    </AuthGuard>
                } 
            />

            {/* Manager routes */}
            <Route 
                path="/manager/ppe" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerPPEManagement />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/project-management" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerProjectManagement />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/training" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerTraining />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/hikvision-events" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerHikvisionEventsPage />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/certificates" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerCertificates />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/incidents/report" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerReportIncident />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/incidents/assigned" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerLayout>
                            <AssignedIncidents />
                        </ManagerLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/incidents/:id/investigate" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerLayout>
                            <InvestigateIncident />
                        </ManagerLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/incidents/:id/escalate" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerLayout>
                            <EscalateIncident />
                        </ManagerLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/incidents/:id/progress-history" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerLayout>
                            <ProgressHistory />
                        </ManagerLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/incidents/:id/progress" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <ManagerLayout>
                            <UpdateProgress />
                        </ManagerLayout>
                    </AuthGuard>
                } 
            />

            {/* Employee routes */}
            <Route 
                path="/employee/training" 
                element={
                    <AuthGuard requiredRole="employee">
                        <EmployeeTraining />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/training/session" 
                element={
                    <AuthGuard requiredRole="employee">
                        <TrainingSession />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/employee/ppe" 
                element={
                    <AuthGuard requiredRole={["employee", "manager"]}>
                        <EmployeePPE />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/employee/project-management" 
                element={
                    <AuthGuard requiredRole={["manager", "leader"]}>
                        <EmployeeProjectManagement />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/employee/certificates" 
                element={
                    <AuthGuard requiredRole={["employee", "manager"]}>
                        <EmployeeCertificates />
                    </AuthGuard>
                } 
            />
            
            <Route 
                path="/websocket-test" 
                element={<WebSocketTest />} 
            />
            
            {/* System Admin Home - Global scope */}
            <Route 
                path="/system-admin/home" 
                element={
                    <AuthGuard minRoleLevel={100} tenantScope="global">
                        <AdminLayout>
                            <SystemAdminHome />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />

            {/* System Admin - Participating Customers */}
            <Route 
                path="/system-admin/customers" 
                element={
                    <AuthGuard minRoleLevel={100} tenantScope="global">
                        <AdminLayout>
                            <CustomersPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />

            {/* System Admin - Support Messages */}
            <Route 
                path="/system-admin/support-messages" 
                element={
                    <AuthGuard minRoleLevel={100} tenantScope="global">
                        <AdminLayout>
                            <SupportMessagesPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />

            {/* Protected admin routes */}
            <Route 
                path="/admin/dashboard" 
                element={
                    <AuthGuard minRoleLevel={90} tenantScope="tenant">
                        <AdminLayout>
                            <DashboardPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />

            {/* Header Department routes */}
            <Route 
                path="/header-department/dashboard" 
                element={
                    <AuthGuard minRoleLevel={80} tenantScope="tenant" departmentScope="hierarchy">
                        <HeaderDepartmentDashboard />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/training-management" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <HeaderDepartmentTrainingManagementPage />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/certificate-management" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <HeaderDepartmentCertificateManagementPage />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/ppe-management" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <HeaderDepartmentPPEManagementPage />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <HeaderDepartmentIncidentManagementPage />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/hikvision-events" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentHikvisionEventsPage />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/user-management" 
                element={
                    <AuthGuard minRoleLevel={90} tenantScope="tenant">
                        <AdminLayout>
                            <UserManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/role-management" 
                element={
                    <AuthGuard minRoleLevel={90} tenantScope="tenant">
                        <AdminLayout>
                            <RoleManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/department-management" 
                element={
                    <AuthGuard minRoleLevel={90} tenantScope="tenant">
                        <AdminLayout>
                            <DepartmentManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/system-logs" 
                element={
                    <AuthGuard minRoleLevel={90} tenantScope="tenant">
                        <AdminLayout>
                            <SystemLogsPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/project-management" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <ProjectManagement />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/project-management/:projectId/*" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <ProjectManagement />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            {/* Các route /admin dưới đây đã được chuyển hoàn toàn cho Header Department:
                - /admin/training-management (đã chuyển sang /header-department/training-management)
                - /admin/certificate-management (đã chuyển sang /header-department/certificate-management)
                - /admin/ppe-management (đã chuyển sang /header-department/ppe-management)
                - /admin/incident-management (đã chuyển sang /header-department/incident-management)
            */}
            {/* Header Department incident action routes */}
            <Route 
                path="/header-department/incident-management/:id/classify" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <ClassifyIncident />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/assign" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <AssignIncident />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/investigate" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <HeaderDepartmentLayout>
                            <InvestigateIncident />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/progress" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <HeaderDepartmentLayout>
                            <UpdateProgress />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/update-progress" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <HeaderDepartmentLayout>
                            <UpdateProgress />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/progress-history" 
                element={
                    <AuthGuard minRoleLevel={70} tenantScope="tenant" departmentScope="hierarchy">
                        <HeaderDepartmentLayout>
                            <ProgressHistory />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/close" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <CloseIncident />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/escalate" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <EscalateIncident />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            
            {/* Project Management Routes */}
            {projectManagementRoutes.map((route: ProjectManagementRoute) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={
                        <AuthGuard requiredRole="header_department">
                            <HeaderDepartmentLayout>
                                <Suspense fallback={<div className="loading">Đang tải...</div>}>
                                    <ProjectManagementRouteWrapper Component={route.component} />
                                </Suspense>
                            </HeaderDepartmentLayout>
                        </AuthGuard>
                    }
                />
            ))}
            
            {/* Fallback for non-existent routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;