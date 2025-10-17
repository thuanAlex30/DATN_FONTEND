import React from 'react';
import { EmployeeLayout } from '../../../components/Employee';
import SharedPPEManagement from '../../../components/PPEManagement/SharedPPEManagement';

const EmployeePPE: React.FC = () => {
  return (
    <SharedPPEManagement 
      userRole="employee" 
      layoutComponent={EmployeeLayout} 
    />
  );
};

export default EmployeePPE;

