import { lazy } from 'react';

// Lazy load project management components for Header Department
const Milestones = lazy(() => import('../pages/header_department/ProjectManagement/components/ProjectMilestones'));
const Tasks = lazy(() => import('../pages/header_department/ProjectManagement/components/ProjectTasks'));
const StatusReports = lazy(() => import('../pages/header_department/ProjectManagement/components/ProjectStatusReports'));

export const projectManagementRoutes = [
  {
    path: '/header-department/project-management/:projectId/milestones',
    component: Milestones,
  },
  {
    path: '/header-department/project-management/:projectId/tasks',
    component: Tasks,
  },
  {
    path: '/header-department/project-management/:projectId/status-reports',
    component: StatusReports,
  },
];