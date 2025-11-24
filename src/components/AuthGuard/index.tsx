import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[]; // Legacy: role_name or role_code
  minRoleLevel?: number; // New: minimum role level required
  maxRoleLevel?: number; // New: maximum role level allowed
  tenantScope?: 'global' | 'tenant' | 'self'; // New: tenant scope requirement
  departmentScope?: 'all' | 'hierarchy' | 'own' | 'none'; // New: department scope requirement
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  minRoleLevel,
  maxRoleLevel,
  tenantScope,
  departmentScope
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

  // Check role-based access (legacy: by role_name/role_code)
  if (requiredRole && requiredRole !== "") {
    const userRoleName = user.role?.role_name;
    const userRoleCode = user.role?.role_code;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Helper function to normalize role names for matching
    const normalizeRole = (role: string): string[] => {
      const normalized = role.toLowerCase().trim();
      // Generate all possible variations
      const variations = [
        normalized,
        normalized.replace(/\s+/g, '_'), // "department header" -> "department_header"
        normalized.replace(/_/g, ' '),  // "department_header" -> "department header"
        normalized.replace(/\s+/g, ''), // "department header" -> "departmentheader"
      ];
      return [...new Set(variations)]; // Remove duplicates
    };
    
    // Role name mapping for common variations
    const roleMapping: { [key: string]: string[] } = {
      'header_department': ['department header', 'department_header', 'header_department', 'header department'],
      'department_header': ['department header', 'department_header', 'header_department', 'header department'],
      'department header': ['department header', 'department_header', 'header_department', 'header department'],
      'company_admin': ['company admin', 'company_admin', 'admin'],
      'system_admin': ['system admin', 'system_admin'],
      'department_manager': ['department manager', 'department_manager', 'manager'],
      'department manager': ['department manager', 'department_manager', 'manager'],
      'manager': ['department manager', 'department_manager', 'manager', 'dept manager'],
      'team_leader': ['team leader', 'team_leader', 'leader'],
      'team leader': ['team leader', 'team_leader', 'leader'],
      'leader': ['team leader', 'team_leader', 'leader'],
      'safety_officer': ['safety officer', 'safety_officer'],
      'warehouse_staff': ['warehouse staff', 'warehouse_staff'],
      'maintenance_staff': ['maintenance staff', 'maintenance_staff'],
    };
    
    const hasRoleMatch = allowedRoles.some(role => {
      const normalizedRole = role.toLowerCase().trim();
      const roleVariations = normalizeRole(normalizedRole);
      
      // Get mapped variations if available
      const mappedVariations = roleMapping[normalizedRole] || [];
      const allRoleVariations = [...new Set([...roleVariations, ...mappedVariations])];
      
      // Check user role_name variations
      if (userRoleName) {
        const userRoleNameLower = userRoleName.toLowerCase().trim();
        const userRoleNameVariations = normalizeRole(userRoleName);
        
        // Check direct match
        if (allRoleVariations.includes(userRoleNameLower)) {
          return true;
        }
        
        // Check if any variation matches
        if (roleVariations.some(rv => userRoleNameVariations.includes(rv))) {
          return true;
        }
        
        // Check mapped variations
        if (mappedVariations.some(mv => userRoleNameVariations.includes(mv))) {
          return true;
        }
      }
      
      // Check user role_code variations
      if (userRoleCode) {
        const userRoleCodeLower = userRoleCode.toLowerCase().trim();
        const userRoleCodeVariations = normalizeRole(userRoleCode);
        
        // Check direct match
        if (allRoleVariations.includes(userRoleCodeLower)) {
          return true;
        }
        
        // Check if any variation matches
        if (roleVariations.some(rv => userRoleCodeVariations.includes(rv))) {
          return true;
        }
        
        // Check mapped variations
        if (mappedVariations.some(mv => userRoleCodeVariations.includes(mv))) {
          return true;
        }
      }
      
      // Direct match (original logic)
      return normalizedRole === userRoleName?.toLowerCase() || 
             normalizedRole === userRoleCode?.toLowerCase();
    });
    
    console.log('🔍 AuthGuard: Role comparison details:', {
      userRoleName,
      userRoleCode,
      allowedRoles,
      hasRoleMatch
    });
    
    if (!hasRoleMatch) {
      console.log('❌ AuthGuard: Role mismatch, redirecting to unauthorized', {
        userRoleName,
        userRoleCode,
        allowedRoles,
        requiredRole
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check role level (new: priority-based authorization)
  if (minRoleLevel !== undefined || maxRoleLevel !== undefined) {
    const userRoleLevel = user.role?.role_level;
    const userRoleName = user.role?.role_name;
    const userRoleCode = user.role?.role_code;
    
    // If roleLevel is not available, fallback to role_name/role_code matching
    if (userRoleLevel === undefined || userRoleLevel === null) {
      console.log('⚠️ AuthGuard: User role level not available, falling back to role_name/role_code check');
      
      // Define role level mappings based on role_name/role_code
      const roleLevelMap: { [key: string]: number } = {
        // Admin roles (level 90-100)
        'system admin': 100,
        'system_admin': 100,
        'company admin': 90,
        'company_admin': 90,
        'admin': 90,
        // Header Department (level 80)
        'header_department': 80,
        'department header': 80,
        'department_header': 80,
        // Manager (level 70)
        'manager': 70,
        'department manager': 70,
        // Team Leader (level 60)
        'team leader': 60,
        'team_leader': 60,
        // Special roles (level 55)
        'trainer': 55,
        'safety officer': 55,
        'safety_officer': 55,
        // Staff roles (level 50)
        'warehouse staff': 50,
        'warehouse_staff': 50,
        'maintenance staff': 50,
        'maintenance_staff': 50,
        // Employee (level 10)
        'employee': 10
      };
      
      // Try to get role level from role_name or role_code
      const normalizedRoleName = userRoleName?.toLowerCase().trim() || '';
      const normalizedRoleCode = userRoleCode?.toLowerCase().trim() || '';
      const inferredLevel = roleLevelMap[normalizedRoleName] || roleLevelMap[normalizedRoleCode];
      
      if (inferredLevel !== undefined) {
        console.log('✅ AuthGuard: Inferred role level from role_name/role_code:', {
          roleName: userRoleName,
          roleCode: userRoleCode,
          inferredLevel
        });
        
        // Use inferred level for validation
        if (minRoleLevel !== undefined && inferredLevel < minRoleLevel) {
          console.log('❌ AuthGuard: Inferred role level too low', {
            inferredLevel,
            minRoleLevel
          });
          return <Navigate to="/unauthorized" replace />;
        }

        if (maxRoleLevel !== undefined && inferredLevel > maxRoleLevel) {
          console.log('❌ AuthGuard: Inferred role level too high', {
            inferredLevel,
            maxRoleLevel
          });
          return <Navigate to="/unauthorized" replace />;
        }
        
        // Role level check passed with inferred value
      } else {
        // No role level and cannot infer from role_name/role_code
        console.log('❌ AuthGuard: User role level not available and cannot infer from role_name/role_code', {
          roleName: userRoleName,
          roleCode: userRoleCode
        });
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      // Role level is available, use it directly
      if (minRoleLevel !== undefined && userRoleLevel < minRoleLevel) {
        console.log('❌ AuthGuard: Role level too low', {
          userRoleLevel,
          minRoleLevel
        });
        return <Navigate to="/unauthorized" replace />;
      }

      if (maxRoleLevel !== undefined && userRoleLevel > maxRoleLevel) {
        console.log('❌ AuthGuard: Role level too high', {
          userRoleLevel,
          maxRoleLevel
        });
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // Check tenant scope
  if (tenantScope) {
    // If scope_rules not available, infer from role_name/role_code
    let userTenantScope = user.role?.scope_rules?.tenant_scope;
    
    if (!userTenantScope) {
      // Fallback: infer from role_name/role_code
      const userRoleName = user.role?.role_name?.toLowerCase().trim() || '';
      const userRoleCode = user.role?.role_code?.toLowerCase().trim() || '';
      
      // System Admin has global scope
      if (userRoleName === 'system admin' || userRoleCode === 'system_admin') {
        userTenantScope = 'global';
      } else {
        // Default to tenant scope for other roles
        userTenantScope = 'tenant';
      }
      
      console.log('⚠️ AuthGuard: Tenant scope not in role data, inferred:', {
        roleName: user.role?.role_name,
        roleCode: user.role?.role_code,
        inferredTenantScope: userTenantScope
      });
    }
    
    if (tenantScope === 'global' && userTenantScope !== 'global') {
      console.log('❌ AuthGuard: Tenant scope insufficient', {
        userTenantScope,
        requiredTenantScope: tenantScope
      });
      return <Navigate to="/unauthorized" replace />;
    }
    
    if (tenantScope === 'tenant' && userTenantScope === 'self') {
      console.log('❌ AuthGuard: Tenant scope insufficient', {
        userTenantScope,
        requiredTenantScope: tenantScope
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check department scope
  if (departmentScope) {
    // If scope_rules not available, infer from role_name/role_code
    let userDeptScope = user.role?.scope_rules?.department_scope;
    
    if (!userDeptScope) {
      // Fallback: infer from role_name/role_code
      const userRoleName = user.role?.role_name?.toLowerCase().trim() || '';
      const userRoleCode = user.role?.role_code?.toLowerCase().trim() || '';
      
      // System Admin and Company Admin have 'all' scope
      if (userRoleName === 'system admin' || userRoleCode === 'system_admin' ||
          userRoleName === 'company admin' || userRoleCode === 'company_admin') {
        userDeptScope = 'all';
      } 
      // Department Header has 'hierarchy' scope
      else if (userRoleName === 'department header' || userRoleCode === 'department_header' ||
               userRoleName === 'header_department' || userRoleCode === 'header_department') {
        userDeptScope = 'hierarchy';
      }
      // Department Manager has 'hierarchy' scope (can view own department and sub-departments)
      else if (userRoleName === 'department manager' || userRoleCode === 'department_manager' ||
               userRoleName === 'manager' || userRoleCode === 'manager') {
        userDeptScope = 'hierarchy';
      } 
      // Default to 'own' for other roles
      else {
        userDeptScope = 'own';
      }
      
      console.log('⚠️ AuthGuard: Department scope not in role data, inferred:', {
        roleName: user.role?.role_name,
        roleCode: user.role?.role_code,
        inferredDeptScope: userDeptScope
      });
    }
    
    if (departmentScope === 'all' && userDeptScope !== 'all') {
      console.log('❌ AuthGuard: Department scope insufficient', {
        userDeptScope,
        requiredDeptScope: departmentScope
      });
      return <Navigate to="/unauthorized" replace />;
    }
    
    if (departmentScope === 'hierarchy' && userDeptScope === 'own') {
      console.log('❌ AuthGuard: Department scope insufficient', {
        userDeptScope,
        requiredDeptScope: departmentScope
      });
      return <Navigate to="/unauthorized" replace />;
    }
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
