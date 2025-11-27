import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import positionService from '../../services/positionService';
import type { Position, PositionCreate, PositionUpdate, PositionQuery } from '../../types/position';

interface PositionState {
  positions: Position[];
  selectedPosition: Position | null;
  loading: boolean;
  error: string | null;
}

const initialState: PositionState = {
  positions: [],
  selectedPosition: null,
  loading: false,
  error: null,
};

// === Thunks ===
export const fetchPositions = createAsyncThunk(
  'positions/fetchPositions',
  async (query: PositionQuery, { rejectWithValue }) => {
    try {
      const res = await positionService.getAll(query);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch positions');
    }
  }
);

export const fetchPositionById = createAsyncThunk(
  'positions/fetchPositionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await positionService.getById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch position');
    }
  }
);

export const createPosition = createAsyncThunk(
  'positions/createPosition',
  async (data: PositionCreate, { rejectWithValue }) => {
    try {
      const res = await positionService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create position');
    }
  }
);

export const updatePosition = createAsyncThunk(
  'positions/updatePosition',
  async ({ id, data }: { id: string; data: PositionUpdate }, { rejectWithValue }) => {
    try {
      const res = await positionService.update(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to update position');
    }
  }
);

export const deletePosition = createAsyncThunk(
  'positions/deletePosition',
  async (id: string, { rejectWithValue }) => {
    try {
      await positionService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to delete position');
    }
  }
);

// === Slice ===
const positionSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    clearSelectedPosition: (state) => {
      state.selectedPosition = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPositionById.fulfilled, (state, action) => {
        state.selectedPosition = action.payload;
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        state.positions.push(action.payload);
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        const idx = state.positions.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.positions[idx] = action.payload;
        if (state.selectedPosition?.id === action.payload.id) {
          state.selectedPosition = action.payload;
        }
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.positions = state.positions.filter((p) => p.id !== action.payload);
        if (state.selectedPosition?.id === action.payload) {
          state.selectedPosition = null;
        }
      });
  },
});

export const { clearSelectedPosition } = positionSlice.actions;
export default positionSlice.reducer;
