export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
      user: UserProfile;
      tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
      };
    };
    timestamp: string;
  };
  timestamp: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: {
    _id: string;
    role_name: string;
    role_code: string;
    role_level: number;
    scope_rules?: {
      tenant_scope?: 'global' | 'tenant' | 'self';
      department_scope?: 'all' | 'hierarchy' | 'own' | 'none';
      data_scope?: 'full' | 'department' | 'self';
      can_assign_lower_roles?: boolean;
    };
    permissions: Record<string, boolean>;
    is_active: boolean;
  };
  tenant_id?: string;
  department?: {
    id: string;
    department_name: string;
  };
  department_id?: {
    id: string;
    department_name: string;
  };
  // Hỗ trợ user thuộc nhiều phòng ban (multi-department)
  department_ids?: {
    id: string;
    department_name: string;
  }[];
  is_active: boolean;
  last_login: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
