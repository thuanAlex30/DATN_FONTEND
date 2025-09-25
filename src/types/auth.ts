export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
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
    permissions: Record<string, boolean>;
    is_active: boolean;
  };
  is_active: boolean;
  last_login: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
