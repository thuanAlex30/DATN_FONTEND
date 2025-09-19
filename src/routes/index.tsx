import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';
import AdminLayout from '../pages/Admin/layout/AdminLayout';
import LoginPage from '../pages/Login';
import UnauthorizedPage from '../pages/Unauthorized';
import HomePage from '../pages/Home';
import DashboardPage from '../pages/Admin/Dashboard';
import UserManagementPage from '../pages/Admin/UserManagement';
import DepartmentPositionPage from '../pages/Admin/DepartmentPosition';
import SystemLogsPage from '../pages/Admin/SystemSettings';
import ProjectManagementPage from '../pages/Admin/ProjectManagement';
import TrainingManagementPage from '../pages/Admin/TrainingManagement';
import CertificateManagementPage from '../pages/Admin/CertificateManagement';
import PPEManagementPage from '../pages/Admin/PPEManagement';
import RoleManagementPage from '../pages/Admin/RoleManagement';

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
                            <ProjectManagementPage />
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

            {/* Fallback for non-existent routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;