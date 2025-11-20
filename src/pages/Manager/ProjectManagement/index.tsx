import React from 'react';
import { ManagerLayout } from '../../../components/Manager';
import { ProjectOutlined } from '@ant-design/icons';

const ManagerProjectManagement: React.FC = () => {
  return (
    <ManagerLayout
      title="Quản lý dự án"
      icon={<ProjectOutlined />}
    >
      <div style={{ padding: '24px' }}>
        <h2>Quản lý dự án - Manager</h2>
        <p>Trang quản lý dự án dành cho Manager sẽ được phát triển sau.</p>
        <div style={{ 
          background: '#f0f2f5', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <p>🚧 Tính năng đang được phát triển</p>
          <p>Manager có thể xem và quản lý các dự án trong department của mình.</p>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerProjectManagement;
