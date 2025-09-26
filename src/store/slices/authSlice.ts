import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import userService from '../../services/userService';
import type { AxiosResponse } from 'axios';
import type { LoginRequest, LoginResponse, UserProfile, ChangePasswordRequest } from '../../types/auth';
import type { UserUpdate } from '../../types/user';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  { user: UserProfile; accessToken: string },
  LoginRequest,                             
  { rejectValue: string }                   
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<LoginResponse> = await authService.login(credentials);
      const { data } = response.data;
      const { tokens, user } = data;
      
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return { user, accessToken: tokens.accessToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk<
  UserProfile,
  UserUpdate,
  { rejectValue: string }
>(
  'auth/updateProfile',
  async (updateData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;
      
      if (!userId) {
        return rejectWithValue('User not found');
      }

      const updatedUser = await userService.updateUser(userId, updateData);
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Update failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const changePassword = createAsyncThunk<
  { message: string },
  ChangePasswordRequest,
  { rejectValue: string }
>(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Change password failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.clear();
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
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        // Password changed successfully, no need to update user data
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
