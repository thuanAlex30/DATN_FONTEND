import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { refreshTokenService } from '../../services/tokenService';
import websocketClient from '../../services/websocketClient';
import apiClient from '../../config/axios';
import { ENV } from '../../config/env';
import type { AxiosResponse } from 'axios';
import type { LoginRequest, LoginResponse, UserProfile } from '../../types/auth';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Helper function to get user from localStorage
const getUserFromStorage = (): UserProfile | null => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const initialState: AuthState = {
  user: null, // Don't initialize from localStorage to avoid race conditions
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  { user: UserProfile; token: string; refreshToken: string },
  LoginRequest,                             
  { rejectValue: string }                   
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<LoginResponse> = await authService.login(credentials);
      console.log('🔍 Login response:', response);
      console.log('🔍 Login response.data:', response.data);
      console.log('🔍 Login response.data.data:', response.data?.data);
      
      // Check if response indicates failure
      if (response.data && !response.data.success) {
        const errorMessage = response.data.message || 'Sai thông tin tài khoản hoặc mật khẩu';
        console.error('❌ Login failed in response:', errorMessage);
        return rejectWithValue(errorMessage);
      }
      
      // Handle nested response structure
      // Backend structure: ApiResponse.success(res, result.data, ...)
      // Where result.data = { user, tokens } from createResponse
      // So: response.data.data = { user, tokens }
      let responseData = response.data?.data;
      console.log('🔍 Response data (first level):', responseData);
      
      // Check if responseData has nested data structure (in case of double wrapping)
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        responseData = responseData.data;
        console.log('🔍 Response data (unwrapped):', responseData);
      }
      
      if (!responseData) {
        console.error('❌ No data in response. Full response:', response.data);
        return rejectWithValue('Sai thông tin tài khoản hoặc mật khẩu');
      }
      
      // Extract user and tokens from the response data
      // Expected structure: { user: {...}, tokens: {...} }
      const { tokens, user } = responseData;
      
      console.log('🔍 Extracted tokens:', tokens);
      console.log('🔍 Extracted user:', user);
      
      // Validate tokens and user exist
      if (!tokens || !user) {
        console.error('❌ Missing tokens or user data:', { 
          tokens: !!tokens, 
          user: !!user,
          responseDataKeys: Object.keys(responseData || {}),
          responseData
        });
        return rejectWithValue('Sai thông tin tài khoản hoặc mật khẩu');
      }
      console.log('🔍 Tokens:', tokens);
      console.log('🔍 User:', user);
      
      // Get detailed user info to include department
      let detailedUser = user;
      try {
        // Set the token temporarily for the API call
        const originalToken = apiClient.defaults.headers.common['Authorization'];
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        const userDetailsResponse = await authService.me();
        console.log('🔍 /auth/me response:', userDetailsResponse.data);
        if (userDetailsResponse.data) {
          detailedUser = userDetailsResponse.data;
          console.log('🔍 Detailed user with department:', detailedUser);
          console.log('🔍 User role from /auth/me:', detailedUser.role);
        }
        
        // Restore original token
        if (originalToken) {
          apiClient.defaults.headers.common['Authorization'] = originalToken;
        } else {
          delete apiClient.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch detailed user info, using basic user data:', error);
      }
      
      // Merge user data from login and detailed profile
      const userData = {
        ...user,
        ...detailedUser,
        // Ensure role information is properly set from the correct structure
        roleName: user.role?.role_name || detailedUser.role?.role_name,
        role: {
          ...(user.role || detailedUser.role),
          // Ensure role_level, role_code, scope_rules are included
          role_level: user.role?.role_level || detailedUser.role?.role_level,
          role_code: user.role?.role_code || detailedUser.role?.role_code,
          scope_rules: user.role?.scope_rules || detailedUser.role?.scope_rules || {}
        },
        // Ensure department information is properly set
        department: detailedUser.department || user.department,
        department_id: detailedUser.department_id || user.department_id,
        // Ensure tenant_id is included
        tenant_id: detailedUser.tenant_id || user.tenant_id,
        // Store department_ids as array for multi-department support (future)
        department_ids: detailedUser.department_ids || (detailedUser.department_id ? [detailedUser.department_id] : [])
      };
      
      console.log('🔍 Final userData after merge:', {
        roleName: userData.roleName,
        role: userData.role,
        role_name: userData.role?.role_name,
        department: userData.department
      });
      
      localStorage.setItem(ENV.JWT_STORAGE_KEY, tokens.accessToken);
      localStorage.setItem(ENV.REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Connect WebSocket after successful login
      if (ENV.ENABLE_WEBSOCKET) {
        websocketClient.connect(ENV.WS_BASE_URL, tokens.accessToken);
      }
      
      return { user: userData, token: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch (error: any) {
      console.error('❌ Login error details:', {
        error,
        response: error.response,
        data: error.response?.data,
        message: error.response?.data?.message
      });
      
      // Try to extract error message from various possible response structures
      let errorMessage = 'Sai thông tin tài khoản hoặc mật khẩu';
      
      if (error.response?.data) {
        // If data is a string, use it directly
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
        // If data is an object with message property
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        // If data itself is an object, try to stringify or use default
        else if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.message || 'Sai thông tin tài khoản hoặc mật khẩu';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshToken = createAsyncThunk<
  { token: string; refreshToken: string },
  string,
  { rejectValue: string }
>(
  'auth/refreshToken',
  async (refreshTokenValue, { rejectWithValue }) => {
    try {
      const response = await refreshTokenService(refreshTokenValue);
      const { tokens } = response.data.data;
      
      localStorage.setItem(ENV.JWT_STORAGE_KEY, tokens.accessToken);
      localStorage.setItem(ENV.REFRESH_TOKEN_KEY, tokens.refreshToken);
      
      // WebSocket will automatically reconnect with new token via WebSocketProvider
      
      return { token: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Token refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const token = localStorage.getItem(ENV.JWT_STORAGE_KEY);
      const refreshToken = localStorage.getItem(ENV.REFRESH_TOKEN_KEY);
      const user = getUserFromStorage();
      
      console.log('🔍 initializeAuth debug:', {
        token: token ? 'exists' : 'missing',
        refreshToken: refreshToken ? 'exists' : 'missing',
        user: user ? {
          id: user.id,
          username: user.username,
          role: user.role,
          role_name: user.role?.role_name,
          department: user.department,
          is_active: user.is_active
        } : null
      });
      
      // Additional debugging for role structure
      if (user && user.role) {
        console.log('🔍 Role object structure:', {
          role: user.role,
          role_keys: Object.keys(user.role),
          role_name: user.role.role_name,
          role_id: user.role._id
        });
      } else if (user) {
        console.log('🔍 User has no role object:', user);
      }
      
      if (token && user) {
        state.user = user;
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        
        console.log('✅ Auth initialized successfully');
        
        // Connect WebSocket if enabled
        if (ENV.ENABLE_WEBSOCKET) {
          websocketClient.connect(ENV.WS_BASE_URL, token);
        }
      } else {
        console.log('❌ Auth initialization failed - missing token or user');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem(ENV.JWT_STORAGE_KEY);
      localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
      localStorage.removeItem('user');
      
      // Disconnect WebSocket
      if (ENV.ENABLE_WEBSOCKET) {
        websocketClient.disconnect();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // If refresh fails, logout user
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem(ENV.JWT_STORAGE_KEY);
        localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
        localStorage.removeItem('user');
      });
  },
});

export const { initializeAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
