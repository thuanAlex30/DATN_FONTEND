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
  requiredRole = 'admin' 
}) => {
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Check if user is authenticated
  if (!user || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is active
  if (user.is_active === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && requiredRole !== "" && user.role?.role_name !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Add a small delay to prevent DOM issues
  return (
    <div key={`auth-guard-${user.id}`}>
      {children}
    </div>
  );
};

export default AuthGuard; 
