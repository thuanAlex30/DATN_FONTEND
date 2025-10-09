import { lazy } from 'react';

// Lazy load project management components
const ChangeRequests = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectChangeRequests'));
const Milestones = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectMilestones'));
const Tasks = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectTasks'));
const Resources = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectResources'));
const Risks = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectRisks'));
const StatusReports = lazy(() => import('../pages/Admin/ProjectManagement/components/ProjectStatusReports'));

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
