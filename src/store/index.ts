import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import departmentReducer from './slices/departmentSlice';
import positionReducer from './slices/positionSlice';
import websocketReducer from './slices/websocketSlice';

// Gộp tất cả reducers
const rootReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  roles: roleReducer,
  departments: departmentReducer,
  positions: positionReducer,
  websocket: websocketReducer,
});

// Cấu hình redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // chỉ persist auth (token, user info)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // cần tắt vì redux-persist
    }),
});

// Tạo persistor để dùng với PersistGate
export const persistor = persistStore(store);

// Types cho dispatch và state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
