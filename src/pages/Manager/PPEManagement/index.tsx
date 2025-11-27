import React from 'react';
import { ManagerLayout } from '../../../components/Manager';
import SharedPPEManagement from '../../../components/PPEManagement/SharedPPEManagement';

const ManagerPPEManagement: React.FC = () => {
  return (
    <SharedPPEManagement 
      userRole="manager" 
      layoutComponent={ManagerLayout} 
    />
  );
};

export default ManagerPPEManagement;
