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
      console.log('🔍 updateProfile action - updateData:', updateData);
      const state = getState() as { auth: AuthState };
      console.log('🔍 updateProfile action - state.auth.user:', state.auth.user);
      console.log('🔍 updateProfile action - state.auth.user keys:', Object.keys(state.auth.user || {}));
      console.log('🔍 updateProfile action - state.auth.user full object:', JSON.stringify(state.auth.user, null, 2));
      // Try to get user ID from different possible fields
      const userId = state.auth.user?.id || 
                    (state.auth.user as any)?._id || 
                    (state.auth.user as any)?.user_id || 
                    (state.auth.user as any)?.userId ||
                    (state.auth.user as any)?.data?.id;
      
      // If user object has API response structure, extract the actual user data
      let actualUser = state.auth.user;
      if ((state.auth.user as any)?.data) {
        actualUser = (state.auth.user as any).data;
        console.log('🔍 updateProfile - extracted user data from API response:', actualUser);
      }
      
      console.log('🔍 updateProfile action - userId after all attempts:', userId);
      
      if (!userId) {
        console.log('❌ No user ID found, trying to update without ID');
        // If no user ID found, try to update without ID (let backend handle it)
        const updatedUser = await userService.updateCurrentUserProfile(updateData);
        console.log('🔍 updateProfile action - updatedUser without ID:', updatedUser);
        
        // Convert User to UserProfile format
        const userProfile: UserProfile = {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          phone: updatedUser.phone || '',
          avatar: (updatedUser as any).avatar,
          role: updatedUser.role,
          is_active: updatedUser.is_active,
          last_login: (updatedUser as any).last_login || new Date().toISOString()
        };
        
        return userProfile;
      }

      const updatedUser = await userService.updateCurrentUserProfile(updateData);
      console.log('🔍 updateProfile action - updatedUser:', updatedUser);
      
      // Convert User to UserProfile format
      const userProfile: UserProfile = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        phone: updatedUser.phone || '',
        avatar: (updatedUser as any).avatar,
        role: updatedUser.role,
        is_active: updatedUser.is_active,
        last_login: (updatedUser as any).last_login || new Date().toISOString()
      };
      
      return userProfile;
    } catch (error: any) {
      console.error('❌ updateProfile action - error:', error);
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
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Change password failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshUserProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>(
  'auth/refreshUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to refresh profile';
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
    updateAvatar: (state, action) => {
      console.log('🔍 updateAvatar action - payload:', action.payload);
      if (state.user) {
        console.log('🔍 updateAvatar - before:', state.user.avatar);
        state.user.avatar = action.payload;
        console.log('🔍 updateAvatar - after:', state.user.avatar);
        console.log('🔍 updateAvatar - state.user after update:', state.user);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('🔍 login.fulfilled - action.payload:', action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        console.log('🔍 login.fulfilled - state.user after login:', state.user);
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
        console.log('🔍 updateProfile.fulfilled - action.payload:', action.payload);
        state.loading = false;
        state.user = action.payload;
        console.log('🔍 updateProfile.fulfilled - state.user after update:', state.user);
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
      })
      .addCase(refreshUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUserProfile.fulfilled, (state, action) => {
        console.log('🔍 refreshUserProfile.fulfilled - action.payload:', action.payload);
        state.loading = false;
        
        // Handle API response structure
        if ((action.payload as any)?.data) {
          state.user = (action.payload as any).data;
          console.log('🔍 refreshUserProfile.fulfilled - extracted user data:', state.user);
        } else {
          state.user = action.payload;
        }
        
        console.log('🔍 refreshUserProfile.fulfilled - state.user after refresh:', state.user);
      })
      .addCase(refreshUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, updateAvatar } = authSlice.actions;
export default authSlice.reducer;
