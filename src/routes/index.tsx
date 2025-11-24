import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, type ComponentType } from 'react';
import AuthGuard from '../components/AuthGuard';
import AdminLayout from '../pages/Admin/layout/AdminLayout';
import LoginPage from '../pages/Login';
import UnauthorizedPage from '../pages/Unauthorized';
import HomePage from '../pages/Home';
import DashboardPage from '../pages/Admin/Dashboard';
import UserManagementPage from '../pages/Admin/UserManagement';
import DepartmentPositionPage from '../pages/Admin/DepartmentPosition';
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
import HeaderDepartmentLayout from '../components/HeaderDepartment/HeaderDepartmentLayout';
import SystemAdminPage from '../pages/system_admin';
import ReportIncident from '../pages/Employee/ReportIncident';
import EmployeeTraining from '../pages/Employee/Training';
import TrainingSession from '../pages/Employee/TrainingSession';
import EmployeePPE from '../pages/Employee/PPE';
import EmployeeProjectManagement from '../pages/Employee/ProjectManagement';
import EmployeeDashboard from '../pages/Employee/Dashboard';
import ManagerDashboard from '../pages/Manager/Dashboard';
import ManagerPPEManagement from '../pages/Manager/PPEManagement';
import ManagerProjectManagement from '../pages/Manager/ProjectManagement';
import ManagerTraining from '../pages/Manager/Training';
import WebSocketTest from '../pages/WebSocketTest';
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
            <Route path="/login" element={<LoginPage />} />
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

            {/* Employee routes */}
            <Route 
                path="/employee/incidents/report" 
                element={
                    <AuthGuard requiredRole="employee">
                        <ReportIncident />
                    </AuthGuard>
                } 
            />
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
                path="/websocket-test" 
                element={<WebSocketTest />} 
            />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* System Admin route - highest level admin */}
            <Route 
                path="/system_admin" 
                element={
                    <AuthGuard requiredRole="system_admin">
                        <SystemAdminPage />
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
                        <HeaderDepartmentLayout>
                            <HeaderDepartmentDashboard />
                        </HeaderDepartmentLayout>
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
                path="/admin/department-position" 
                element={
                    <AuthGuard minRoleLevel={90} tenantScope="tenant">
                        <AdminLayout>
                            <DepartmentPositionPage />
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
            {/* Các route /admin dưới đây đã được chuyển cho Header Department nên tạm thời ẩn khỏi Admin:
                - /admin/training-management
                - /admin/certificate-management
                - /admin/ppe-management
                - /admin/incident-management
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
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <InvestigateIncident />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/progress" 
                element={
                    <AuthGuard requiredRole="header_department">
                        <HeaderDepartmentLayout>
                            <UpdateProgress />
                        </HeaderDepartmentLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/header-department/incident-management/:id/progress-history" 
                element={
                    <AuthGuard requiredRole="header_department">
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