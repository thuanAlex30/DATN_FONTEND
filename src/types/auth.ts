export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: UserProfile;
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
  role: string;
  created_at: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
