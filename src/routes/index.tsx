import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, type ComponentType } from 'react';
import AuthGuard from '../components/AuthGuard';
import AdminLayout from '../pages/Admin/layout/AdminLayout';
import LoginPage from '../pages/Login';
import UnauthorizedPage from '../pages/Unauthorized';
import LandingPage from '../pages/Landing';
import AboutPage from '../pages/About';
import ContactPage from '../pages/Contact';
import FAQPage from '../pages/FAQ';
import HomePage from '../pages/Home';
import Homepage from '../pages/Homepage';
import DashboardPage from '../pages/Admin/Dashboard';
import UserManagementPage from '../pages/Admin/UserManagement';
import DepartmentPositionPage from '../pages/Admin/DepartmentPosition';
import SystemLogsPage from '../pages/Admin/SystemSettings';
import ProjectManagement from '../pages/Admin/ProjectManagement';
import TrainingManagementPage from '../pages/Admin/TrainingManagement';
import PPEManagementPage from '../pages/Admin/PPEManagement';
import RoleManagementPage from '../pages/Admin/RoleManagement';
import IncidentManagementPage from '../pages/Admin/IncidentManagement';
import CertificateManagementPage from '../pages/Admin/CertificateManagement';
import ManagerIncidentHandling from '../pages/Manager/IncidentHandling';
import ClassifyIncident from '../pages/Admin/IncidentManagement/ClassifyIncident';
import AssignIncident from '../pages/Admin/IncidentManagement/AssignIncident';
import InvestigateIncident from '../pages/Admin/IncidentManagement/InvestigateIncident';
import UpdateProgress from '../pages/Admin/IncidentManagement/UpdateProgress';
import CloseIncident from '../pages/Admin/IncidentManagement/CloseIncident';
import ProgressHistory from '../pages/Admin/IncidentManagement/ProgressHistory';
import UpdateEmployeeIncident from '../pages/Admin/IncidentManagement/UpdateEmployeeIncident';
import ReportIncident from '../pages/Manager/ReportIncident';
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
            {/* Landing page - trang công khai */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public routes */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Homepage chung cho tất cả users */}
            <Route 
                path="/homepage" 
                element={
                    <AuthGuard>
                        <Homepage />
                    </AuthGuard>
                } 
            />
            
            {/* Home route for non-admin users (legacy - giữ lại để tương thích) */}
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
                    <AuthGuard requiredRole="employee">
                        <EmployeeDashboard />
                    </AuthGuard>
                } 
            />

            {/* Manager Dashboard */}
            <Route 
                path="/manager/dashboard" 
                element={
                    <AuthGuard requiredRole="manager">
                        <ManagerDashboard />
                    </AuthGuard>
                } 
            />

            {/* Manager routes */}
            <Route 
                path="/manager/ppe" 
                element={
                    <AuthGuard requiredRole="manager">
                        <ManagerPPEManagement />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/project-management" 
                element={
                    <AuthGuard requiredRole="manager">
                        <ManagerProjectManagement />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/training" 
                element={
                    <AuthGuard requiredRole="manager">
                        <ManagerTraining />
                    </AuthGuard>
                } 
            />

            {/* Employee routes */}
            <Route 
                path="/manager/incidents/report" 
                element={
                    <AuthGuard requiredRole="manager">
                        <ReportIncident />
                    </AuthGuard>
                } 
            />
            <Route 
                path="/manager/incident-handling" 
                element={
                    <AuthGuard requiredRole="manager">
                        <ManagerIncidentHandling />
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
            
            
            {/* Protected admin routes */}
            <Route 
                path="/admin/dashboard" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <DashboardPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/user-management" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <UserManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/role-management" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <RoleManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/department-position" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <DepartmentPositionPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/system-logs" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <SystemLogsPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/project-management" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <ProjectManagement />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/project-management/:projectId/*" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <ProjectManagement />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/training-management" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <TrainingManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/ppe-management" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <PPEManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/certificate-management" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <CertificateManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/incident-management" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <IncidentManagementPage />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            {/* Admin incident action routes */}
            <Route 
                path="/admin/incidents/:id/classify" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <ClassifyIncident />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/incidents/:id/assign" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <AssignIncident />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/incidents/:id/investigate" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <InvestigateIncident />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/incidents/:id/progress" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <UpdateProgress />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/incidents/:id/progress-history" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <ProgressHistory />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/incidents/:id/close" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <CloseIncident />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            <Route 
                path="/admin/incidents/:id/update-employee" 
                element={
                    <AuthGuard requiredRole="admin">
                        <AdminLayout>
                            <UpdateEmployeeIncident />
                        </AdminLayout>
                    </AuthGuard>
                } 
            />
            
            {/* Project Management Routes */}
            {projectManagementRoutes.map((route: ProjectManagementRoute) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={
                        <AuthGuard requiredRole="admin">
                            <AdminLayout>
                                <Suspense fallback={<div className="loading">Đang tải...</div>}>
                                    <ProjectManagementRouteWrapper Component={route.component} />
                                </Suspense>
                            </AdminLayout>
                        </AuthGuard>
                    }
                />
            ))}
            
            {/* Fallback for non-existent routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;