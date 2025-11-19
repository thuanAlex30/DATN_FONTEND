import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { refreshTokenService } from '../../services/tokenService';
import websocketClient from '../../services/websocketClient';
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
      console.log('🔍 Login response:', response.data);
      
      // Handle nested response structure: response.data.data.data
      const responseData = response.data.data;
      console.log('🔍 Response data:', responseData);
      
      const { tokens, user } = responseData.data;
      console.log('🔍 Tokens:', tokens);
      console.log('🔍 User:', user);
      
      localStorage.setItem(ENV.JWT_STORAGE_KEY, tokens.accessToken);
      localStorage.setItem(ENV.REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Connect WebSocket after successful login
      if (ENV.ENABLE_WEBSOCKET) {
        websocketClient.connect(ENV.WS_BASE_URL, tokens.accessToken);
      }
      
      return { user, token: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Login failed';
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
          role: user.role?.role_name,
          is_active: user.is_active
        } : null
      });
      
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
