import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roleService from '../../services/roleService';
import type { Role, RoleCreate, RoleUpdate, RoleQuery } from '../../types/role';

interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  selectedRole: null,
  loading: false,
  error: null,
};

// === Thunks ===
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (query: RoleQuery, { rejectWithValue }) => {
    try {
      const res = await roleService.getRoles(query);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch roles');
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  'roles/fetchRoleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await roleService.getRoleById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch role');
    }
  }
);

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (data: RoleCreate, { rejectWithValue }) => {
    try {
      const res = await roleService.createRole(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ id, data }: { id: string; data: RoleUpdate }, { rejectWithValue }) => {
    try {
      const res = await roleService.updateRole(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to update role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (id: string, { rejectWithValue }) => {
    try {
      await roleService.deleteRole(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to delete role');
    }
  }
);

// === Slice ===
const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.roles) {
          state.roles = action.payload.roles;
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        if (action.payload?.role) {
          state.selectedRole = action.payload.role;
        }
      })
      .addCase(createRole.fulfilled, (state, action) => {
        if (action.payload?.role) {
          state.roles.push(action.payload.role);
        }
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        if (action.payload?.role) {
          const role = action.payload.role;
          const idx = state.roles.findIndex((r) => r.id === role.id);
          if (idx !== -1) state.roles[idx] = role;
          if (state.selectedRole?.id === role.id) {
            state.selectedRole = role;
          }
        }
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
        if (state.selectedRole?.id === action.payload) {
          state.selectedRole = null;
        }
      });
  },
});

export const { clearSelectedRole } = roleSlice.actions;
export default roleSlice.reducer;
