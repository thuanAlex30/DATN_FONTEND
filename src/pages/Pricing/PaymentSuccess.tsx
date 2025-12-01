import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Card, Spin } from 'antd';
import { CheckCircleOutlined, HomeOutlined, LoginOutlined } from '@ant-design/icons';
import pricingService from '../../services/pricingService';
import type { OrderInfo } from '../../services/pricingService';
import landingStyles from '../Landing/Landing.module.css';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  
  // Lấy orderId từ URL params hoặc localStorage
  const orderIdFromUrl = searchParams.get('orderId');
  const orderIdFromStorage = localStorage.getItem('pending_order_id');
  const orderId = orderIdFromUrl || orderIdFromStorage;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const orderData = await pricingService.getOrder(orderId);
        setOrder(orderData);
        // Xóa orderId khỏi localStorage sau khi đã lấy được
        if (orderIdFromStorage) {
          localStorage.removeItem('pending_order_id');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, orderIdFromStorage]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={landingStyles.layout} style={{ background: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          status="success"
          title="Thanh toán thành công!"
          subTitle={
            order ? (
              <>
                <p>Đơn hàng của bạn đã được xử lý thành công.</p>
                <Card style={{ marginTop: 20, textAlign: 'left' }}>
                  <p><strong>Mã đơn hàng:</strong> {order.orderId}</p>
                  <p><strong>Gói dịch vụ:</strong> {
                    order.planType === 'monthly' ? 'Gói Tháng' :
                    order.planType === 'quarterly' ? 'Gói Quý' :
                    order.planType === 'yearly' ? 'Gói Năm' : order.planType
                  }</p>
                  <p><strong>Số tiền:</strong> {order.amount.toLocaleString('vi-VN')} ₫</p>
                  {order.paymentDate && (
                    <p><strong>Ngày thanh toán:</strong> {new Date(order.paymentDate).toLocaleString('vi-VN')}</p>
                  )}
                </Card>
                {order.status === 'paid' && (
                  <div style={{ marginTop: 20, padding: 15, background: '#e6f7ff', borderRadius: 5 }}>
                    <p style={{ margin: 0 }}>
                      ✅ Tài khoản của bạn đã được kích hoạt. Vui lòng kiểm tra email để nhận thông tin đăng nhập.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p>Đơn hàng của bạn đã được xử lý thành công.</p>
            )
          }
          extra={[
            <Button
              type="primary"
              key="login"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              size="large"
            >
              Đăng nhập ngay
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

export default PaymentSuccess;

