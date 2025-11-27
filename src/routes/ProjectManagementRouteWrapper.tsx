import React from 'react';
import { useParams } from 'react-router-dom';
import type { ComponentType } from 'react';

interface ProjectManagementRouteWrapperProps {
  Component: ComponentType<{ projectId: string }>;
}

const ProjectManagementRouteWrapper: React.FC<ProjectManagementRouteWrapperProps> = ({ Component }) => {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    return <div>Project ID not found</div>;
  }
  
  return <Component projectId={projectId} />;
};

export default ProjectManagementRouteWrapper;
