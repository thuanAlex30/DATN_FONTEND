import { lazy } from 'react';

// Lazy load project management components
const ChangeRequests = lazy(() => import('../pages/Admin/ProjectManagement/ChangeRequests'));
const Milestones = lazy(() => import('../pages/Admin/ProjectManagement/Milestones'));
const Phases = lazy(() => import('../pages/Admin/ProjectManagement/Phases'));
const Tasks = lazy(() => import('../pages/Admin/ProjectManagement/Tasks'));
const Resources = lazy(() => import('../pages/Admin/ProjectManagement/Resources'));
const Risks = lazy(() => import('../pages/Admin/ProjectManagement/Risks'));
const StatusReports = lazy(() => import('../pages/Admin/ProjectManagement/StatusReports'));

export const projectManagementRoutes = [
  {
    path: '/admin/project-management/change-requests',
    component: ChangeRequests,
  },
  {
    path: '/admin/project-management/milestones',
    component: Milestones,
  },
  {
    path: '/admin/project-management/phases',
    component: Phases,
  },
  {
    path: '/admin/project-management/tasks',
    component: Tasks,
  },
  {
    path: '/admin/project-management/resources',
    component: Resources,
  },
  {
    path: '/admin/project-management/risks',
    component: Risks,
  },
  {
    path: '/admin/project-management/status-reports',
    component: StatusReports,
  },
];
