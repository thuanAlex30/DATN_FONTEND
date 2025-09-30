import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import departmentReducer from './slices/departmentSlice';
import positionReducer from './slices/positionSlice';
import roleReducer from './slices/roleSlice';
import websocketReducer from './slices/websocketSlice';

// Project Management Reducers
import projectChangeRequestReducer from './slices/projectChangeRequestSlice';
import projectMilestoneReducer from './slices/projectMilestoneSlice';
import projectPhaseReducer from './slices/projectPhaseSlice';
import projectTaskReducer from './slices/projectTaskSlice';
import projectResourceReducer from './slices/projectResourceSlice';
import projectRiskReducer from './slices/projectRiskSlice';
import projectStatusReportReducer from './slices/projectStatusReportSlice';
import qualityCheckpointReducer from './slices/qualityCheckpointSlice';
import siteAreaReducer from './slices/siteAreaSlice';
import workLocationReducer from './slices/workLocationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    department: departmentReducer,
    position: positionReducer,
    role: roleReducer,
    websocket: websocketReducer,
    
    // Project Management
    projectChangeRequest: projectChangeRequestReducer,
    projectMilestone: projectMilestoneReducer,
    projectPhase: projectPhaseReducer,
    projectTask: projectTaskReducer,
    projectResource: projectResourceReducer,
    projectRisk: projectRiskReducer,
    projectStatusReport: projectStatusReportReducer,
    qualityCheckpoint: qualityCheckpointReducer,
    siteArea: siteAreaReducer,
    workLocation: workLocationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
