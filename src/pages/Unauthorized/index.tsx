import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Result, 
  Button, 
  Space,
  Layout
} from 'antd';
import { 
  ArrowLeftOutlined, 
  LoginOutlined,
  StopOutlined 
} from '@ant-design/icons';

const { Content } = Layout;

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <Result
          status="403"
          icon={<StopOutlined style={{ color: '#ff4d4f' }} />}
          title="Truy cập bị từ chối!"
          subTitle="Rất tiếc, bạn không có quyền truy cập trang này, vui lòng liên hệ quản trị viên để cấp quyền."
          extra={
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
              >
                Quay lại
              </Button>
              <Button 
                type="primary" 
                icon={<LoginOutlined />}
                onClick={handleGoHome}
              >
                Đăng nhập
              </Button>
            </Space>
          }
        />
      </Content>
    </Layout>
  );
};

export default UnauthorizedPage;
