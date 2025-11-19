import React from 'react';
import { ManagerLayout } from '../../../components/Manager';
import { BookOutlined } from '@ant-design/icons';

const ManagerTraining: React.FC = () => {
  return (
    <ManagerLayout
      title="Quản lý đào tạo"
      icon={<BookOutlined />}
    >
      <div style={{ padding: '24px' }}>
        <h2>Quản lý đào tạo - Manager</h2>
        <p>Trang quản lý đào tạo dành cho Manager sẽ được phát triển sau.</p>
        <div style={{ 
          background: '#f0f2f5', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <p>🚧 Tính năng đang được phát triển</p>
          <p>Manager có thể xem và quản lý đào tạo của nhân viên trong department.</p>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerTraining;
