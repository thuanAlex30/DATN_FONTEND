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
import ProjectManagement from '../pages/Admin/ProjectManagement';
import TrainingManagementPage from '../pages/Admin/TrainingManagement';
import CertificateManagementPage from '../pages/Admin/CertificateManagement';
import PPEManagementPage from '../pages/Admin/PPEManagement';
import RoleManagementPage from '../pages/Admin/RoleManagement';
import IncidentManagementPage from '../pages/Admin/IncidentManagement';
import ClassifyIncident from '../pages/Admin/IncidentManagement/ClassifyIncident';
import AssignIncident from '../pages/Admin/IncidentManagement/AssignIncident';
import InvestigateIncident from '../pages/Admin/IncidentManagement/InvestigateIncident';
import UpdateProgress from '../pages/Admin/IncidentManagement/UpdateProgress';
import CloseIncident from '../pages/Admin/IncidentManagement/CloseIncident';
import ProgressHistory from '../pages/Admin/IncidentManagement/ProgressHistory';
import ReportIncident from '../pages/Employee/ReportIncident';
import EmployeeTraining from '../pages/Employee/Training';
import TrainingSession from '../pages/Employee/TrainingSession';
import EmployeePPE from '../pages/Employee/PPE';
import WebSocketTest from '../pages/WebSocketTest';

interface ProjectManagementRoute {
    path: string;
    component: ComponentType;
}

const projectManagementRoutes: ProjectManagementRoute[] = [];

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
                    <AuthGuard requiredRole="">
                        <HomePage />
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
                    <AuthGuard requiredRole="employee">
                        <EmployeePPE />
                    </AuthGuard>
                } 
            />
            
            <Route 
                path="/websocket-test" 
                element={<WebSocketTest />} 
            />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
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
            
            {/* Project Management Routes */}
            {projectManagementRoutes.map((route: ProjectManagementRoute) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={
                        <AuthGuard requiredRole="admin">
                            <AdminLayout>
                                <Suspense fallback={<div className="loading">Đang tải...</div>}>
                                    <route.component />
                                </Suspense>
                            </AdminLayout>
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