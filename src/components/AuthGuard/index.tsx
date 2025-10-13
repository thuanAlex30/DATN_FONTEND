import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  console.log('🔍 AuthGuard check:', {
    user: user ? { id: user.id, username: user.username, role: user.role?.role_name } : null,
    token: token ? 'exists' : 'missing',
    isAuthenticated,
    requiredRole,
    currentPath: location.pathname
  });

  // Check if user is authenticated - use isAuthenticated flag to avoid race conditions
  if (!isAuthenticated || !user || !token) {
    console.log('❌ AuthGuard: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is active
  if (user.is_active === false) {
    console.log('❌ AuthGuard: User inactive, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && requiredRole !== "" && user.role?.role_name !== requiredRole) {
    console.log('❌ AuthGuard: Role mismatch, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ AuthGuard: Access granted');
  // Add a small delay to prevent DOM issues
  return (
    <div key={`auth-guard-${user.id}`}>
      {children}
    </div>
  );
};

export default AuthGuard; 
