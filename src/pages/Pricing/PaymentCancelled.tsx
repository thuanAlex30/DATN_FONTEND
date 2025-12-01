import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { ExclamationCircleOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import landingStyles from '../Landing/Landing.module.css';

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();
  const orderIdFromStorage = localStorage.getItem('pending_order_id');

  // Xóa orderId khỏi localStorage
  React.useEffect(() => {
    if (orderIdFromStorage) {
      localStorage.removeItem('pending_order_id');
    }
  }, [orderIdFromStorage]);

  return (
    <div className={landingStyles.layout} style={{ background: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Result
          icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
          status="warning"
          title="Thanh toán đã bị hủy"
          subTitle="Bạn đã hủy quá trình thanh toán. Nếu bạn muốn tiếp tục, vui lòng thử lại."
          extra={[
            <Button
              type="primary"
              key="retry"
              icon={<ReloadOutlined />}
              onClick={() => navigate('/pricing')}
              size="large"
            >
              Chọn gói lại
            </Button>,
            <Button
              key="home"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              size="large"
            >
              Về trang chủ
            </Button>
          ]}
        />
      </div>
    </div>
  );
};

export default PaymentCancelled;

