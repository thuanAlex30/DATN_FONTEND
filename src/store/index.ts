import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import departmentReducer from './slices/departmentSlice';
import websocketReducer from './slices/websocketSlice';
import projectReducer from './slices/projectSlice';
import projectChangeRequestReducer from './slices/projectChangeRequestSlice';
import projectTaskReducer from './slices/projectTaskSlice';
import projectRiskReducer from './slices/projectRiskSlice';
import projectStatusReportReducer from './slices/projectStatusReportSlice';
import projectResourceReducer from './slices/projectResourceSlice';
import projectMilestoneReducer from './slices/projectMilestoneSlice';
import projectAssignmentReducer from './slices/projectAssignmentSlice';
import projectTimelineReducer from './slices/projectTimelineSlice';
import projectCommunicationReducer from './slices/projectCommunicationSlice';
import siteReducer from './slices/siteSlice';
import siteAreaReducer from './slices/siteAreaSlice';
import workLocationReducer from './slices/workLocationSlice';

// Gộp tất cả reducers
const rootReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  roles: roleReducer,
  departments: departmentReducer,
  websocket: websocketReducer,
  project: projectReducer,
  projectChangeRequest: projectChangeRequestReducer,
  projectTask: projectTaskReducer,
  projectRisk: projectRiskReducer,
  projectStatusReport: projectStatusReportReducer,
  projectResource: projectResourceReducer,
  projectMilestone: projectMilestoneReducer,
  projectAssignment: projectAssignmentReducer,
  projectTimeline: projectTimelineReducer,
  projectCommunication: projectCommunicationReducer,
  site: siteReducer,
  siteArea: siteAreaReducer,
  workLocation: workLocationReducer,
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
// Dùng rootReducer để giữ đầy đủ các slice khi kết hợp với PersistPartial
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
