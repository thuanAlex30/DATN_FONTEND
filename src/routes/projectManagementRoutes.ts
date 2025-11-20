import { lazy } from 'react';

// Lazy load project management components
const ChangeRequests = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectChangeRequests'));
const Milestones = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectMilestones'));
const Tasks = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectTasks'));
const Resources = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectResources'));
const StatusReports = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectStatusReports'));
const Incidents = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectIncidents'));

export const projectManagementRoutes = [
  {
    path: '/admin/project-management/:projectId/change-requests',
    component: ChangeRequests,
  },
  {
    path: '/admin/project-management/:projectId/milestones',
    component: Milestones,
  },
  {
    path: '/admin/project-management/:projectId/tasks',
    component: Tasks,
  },
  {
    path: '/admin/project-management/:projectId/resources',
    component: Resources,
  },
  {
    path: '/admin/project-management/:projectId/status-reports',
    component: StatusReports,
  },
  {
    path: '/admin/project-management/:projectId/incidents',
    component: Incidents,
  },
];
