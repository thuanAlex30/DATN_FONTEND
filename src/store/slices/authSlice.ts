import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import type { AxiosResponse } from 'axios';
import type { LoginRequest, LoginResponse, UserProfile } from '../../types/auth';

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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
