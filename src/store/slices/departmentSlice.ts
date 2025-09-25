import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import departmentService from '../../services/departmentService';
import type { Department, DepartmentCreate, DepartmentUpdate, DepartmentQuery } from '../../types/department';

interface DepartmentState {
  departments: Department[];
  selectedDepartment: Department | null;
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  selectedDepartment: null,
  loading: false,
  error: null,
};

// === Thunks ===
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (query: DepartmentQuery, { rejectWithValue }) => {
    try {
      const res = await departmentService.getAll(query);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch departments');
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  'departments/fetchDepartmentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await departmentService.getById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch department');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (data: DepartmentCreate, { rejectWithValue }) => {
    try {
      const res = await departmentService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create department');
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, data }: { id: string; data: DepartmentUpdate }, { rejectWithValue }) => {
    try {
      const res = await departmentService.update(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to update department');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id: string, { rejectWithValue }) => {
    try {
      await departmentService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to delete department');
    }
  }
);

// === Slice ===
const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.selectedDepartment = action.payload;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const idx = state.departments.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.departments[idx] = action.payload;
        if (state.selectedDepartment?.id === action.payload.id) {
          state.selectedDepartment = action.payload;
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d.id !== action.payload);
        if (state.selectedDepartment?.id === action.payload) {
          state.selectedDepartment = null;
        }
      });
  },
});

export const { clearSelectedDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
