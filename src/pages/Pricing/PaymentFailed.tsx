import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CloseCircleOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import landingStyles from '../Landing/Landing.module.css';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');
  const orderIdFromStorage = localStorage.getItem('pending_order_id');
  const orderId = orderIdFromUrl || orderIdFromStorage;
  const error = searchParams.get('error');

  // Xóa orderId khỏi localStorage
  React.useEffect(() => {
    if (orderIdFromStorage) {
      localStorage.removeItem('pending_order_id');
    }
  }, [orderIdFromStorage]);

  const getErrorMessage = () => {
    switch (error) {
      case 'missing_order_code':
        return 'Thiếu mã đơn hàng. Vui lòng liên hệ hỗ trợ.';
      case 'payment_not_found':
        return 'Không tìm thấy thông tin thanh toán.';
      case 'order_not_found':
        return 'Không tìm thấy đơn hàng.';
      case 'internal_error':
        return 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
      default:
        return 'Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
    }
  };

  return (
    <div className={landingStyles.layout} style={{ background: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Result
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          status="error"
          title="Thanh toán thất bại"
          subTitle={getErrorMessage()}
          extra={[
            orderId && (
              <Button
                type="primary"
                key="retry"
                icon={<ReloadOutlined />}
                onClick={() => navigate(`/pricing/order?plan=monthly`)}
                size="large"
              >
                Thử lại
              </Button>
            ),
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

export default PaymentFailed;

