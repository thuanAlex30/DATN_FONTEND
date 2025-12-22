import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Row,
  Col,
  Space,
  message,
  Alert
} from 'antd';
import {
  SafetyOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
  LoginOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import { type CompanyInfo, type ContactPerson } from '../../services/pricingService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import landingStyles from '../Landing/Landing.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const OrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const planType = searchParams.get('plan') as 'monthly' | 'quarterly' | 'yearly' | null;
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!planType || !['monthly', 'quarterly', 'yearly'].includes(planType)) {
      message.error('Gói dịch vụ không hợp lệ');
      navigate('/pricing');
      return;
    }

    // Nếu user đã đăng nhập, điền thông tin tự động
    if (user) {
      form.setFieldsValue({
        companyName: '',
        companyEmail: user.email || '',
        companyPhone: user.phone || '',
        contactName: user.full_name || '',
        contactEmail: user.email || '',
        contactPhone: user.phone || ''
      });
    }
  }, [planType, user, form, navigate]);

  const getPlanName = () => {
    switch (planType) {
      case 'monthly': return 'Gói Tháng';
      case 'quarterly': return 'Gói Quý';
      case 'yearly': return 'Gói Năm';
      default: return 'Gói Dịch vụ';
    }
  };

  const getPlanPrice = () => {
    switch (planType) {
      case 'monthly': return '5,000';
      case 'quarterly': return '12,000';
      case 'yearly': return '55,000';
      default: return '0';
    }
  };

  const handleBack = () => {
    navigate('/pricing');
  };

  const handleSubmitOrder = async (values: any) => {
    if (!planType) return;

    try {
      setLoading(true);

      const companyInfo: CompanyInfo = {
        name: values.companyName?.trim() || '',
        address: values.companyAddress?.trim() || '',
        phone: values.companyPhone?.trim() || '',
        email: values.companyEmail?.trim() || '',
        taxCode: values.taxCode?.trim() || undefined
      };

      const contactPerson: ContactPerson = {
        name: values.contactName?.trim() || '',
        email: values.contactEmail?.trim() || '',
        phone: values.contactPhone?.trim() || '',
        position: values.contactPosition?.trim() || undefined
      };

      navigate('/pricing/contract-preview', {
        state: {
          planType,
          companyInfo,
          contactPerson
        }
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Layout className={landingStyles.layout}>
      {/* Header with Navigation */}
      <Header className={landingStyles.header}>
        <div className={landingStyles.headerTop}>
          <div className={landingStyles.logo} onClick={() => navigate('/')}>
            <SafetyOutlined className={landingStyles.logoIcon} />
            <Title level={4} className={landingStyles.logoText}>
              Hệ Thống Quản Lý An Toàn Lao Động
            </Title>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
            className={landingStyles.loginBtn}
          >
            Đăng nhập
          </Button>
        </div>
        <div className={landingStyles.navBar}>
          <Space size="large" className={landingStyles.navLinks}>
            <Button
              type="link"
              className={landingStyles.navLink}
              onClick={() => navigate('/')}
            >
              Trang chủ
            </Button>
            <Button
              type="link"
              className={landingStyles.navLink}
              onClick={() => navigate('/about')}
            >
              Giới thiệu
            </Button>
            <Button
              type="link"
              className={landingStyles.navLink}
              onClick={() => navigate('/contact')}
            >
              Liên Hệ
            </Button>
            <Button
              type="link"
              className={landingStyles.navLink}
              onClick={() => navigate('/faq')}
            >
              FAQ
            </Button>
            <Button
              type="link"
              className={landingStyles.navLink}
              onClick={() => navigate('/pricing')}
            >
              Bảng giá
            </Button>
          </Space>
        </div>
      </Header>

      <Content className={landingStyles.content} style={{ background: '#f0f2f5', padding: '40px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginBottom: 20 }}
            >
              Quay lại trang bảng giá
            </Button>
            <Title level={2}>Đăng ký {getPlanName()}</Title>
            <Text type="secondary">
              Vui lòng điền thông tin để hoàn tất đăng ký
            </Text>
          </div>

          {/* Form Card */}
          <Card>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitOrder}
                autoComplete="off"
                size="large"
              >
                {/* Plan Summary */}
                <Alert
                  message={`Bạn đang đăng ký ${getPlanName()}`}
                  description={`Giá: ${getPlanPrice()} VNĐ`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Divider orientation="left">Thông tin công ty</Divider>
                
                <Form.Item
                  name="companyName"
                  label="Tên công ty"
                  rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
                >
                  <Input placeholder="Nhập tên công ty" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="companyEmail"
                      label="Email công ty"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email công ty' },
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input placeholder="company@example.com" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="companyPhone"
                      label="Số điện thoại"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                      <Input placeholder="0123456789" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="companyAddress"
                  label="Địa chỉ công ty"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ công ty' }]}
                >
                  <Input.TextArea rows={2} placeholder="Nhập địa chỉ công ty" />
                </Form.Item>

                <Form.Item
                  name="taxCode"
                  label="Mã số thuế (tùy chọn)"
                >
                  <Input placeholder="Nhập mã số thuế" />
                </Form.Item>

                <Divider orientation="left">Thông tin người liên hệ</Divider>

                <Form.Item
                  name="contactName"
                  label="Họ và tên người đại diện"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="contactEmail"
                      label="Email liên hệ"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input placeholder="contact@example.com" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="contactPhone"
                      label="Số điện thoại liên hệ"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                      <Input placeholder="0123456789" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="contactPosition"
                  label="Chức vụ (tùy chọn)"
                >
                  <Input placeholder="Ví dụ: Giám đốc, Trưởng phòng..." />
                </Form.Item>

                <Divider />

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={loading}
                      icon={loading ? <LoadingOutlined /> : null}
                    >
                      {loading ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                    </Button>
                    <Button onClick={handleBack} size="large">
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
          </Card>
        </div>
      </Content>

      {/* Footer */}
      <Footer className={landingStyles.footer}>
        <div className={landingStyles.footerContent}>
          <Row gutter={[48, 32]}>
            {/* Column 1: Logo & Contact Info */}
            <Col xs={24} sm={12} md={6}>
              <div className={landingStyles.footerLogo}>
                <SafetyOutlined className={landingStyles.footerLogoIcon} />
                <Title level={4} className={landingStyles.footerLogoText}>
                  Hệ Thống An Toàn
                </Title>
              </div>
              <div className={landingStyles.footerContactInfo}>
                <div className={landingStyles.footerContactItem}>
                  <EnvironmentOutlined className={landingStyles.footerContactIcon} />
                  <Text>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</Text>
                </div>
                <div className={landingStyles.footerContactItem}>
                  <PhoneOutlined className={landingStyles.footerContactIcon} />
                  <Text>Số điện thoại: +84 (0) 123 456 789</Text>
                </div>
                <div className={landingStyles.footerContactItem}>
                  <MailOutlined className={landingStyles.footerContactIcon} />
                  <Text>Email: support@safety-system.com</Text>
                </div>
              </div>
            </Col>

            {/* Column 2: Công Ty */}
            <Col xs={24} sm={12} md={4}>
              <Title level={5} className={landingStyles.footerColumnTitle}>Công Ty</Title>
              <Space direction="vertical" size="small" className={landingStyles.footerLinks}>
                <Button
                  type="link"
                  className={landingStyles.footerLink}
                  onClick={() => navigate('/about')}
                >
                  Giới thiệu về chúng tôi
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Chính sách chất lượng
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Tuyển dụng
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Quy chế hoạt động
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Bảo mật thông tin
                </Button>
              </Space>
            </Col>

            {/* Column 3: Tài Khoản */}
            <Col xs={24} sm={12} md={4}>
              <Title level={5} className={landingStyles.footerColumnTitle}>Tài Khoản</Title>
              <Space direction="vertical" size="small" className={landingStyles.footerLinks}>
                <Button type="link" className={landingStyles.footerLink} onClick={handleLogin}>
                  Đăng nhập
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Đăng ký thành viên
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Quên mật khẩu
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Thông tin cá nhân
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Lịch sử giao dịch
                </Button>
              </Space>
            </Col>

            {/* Column 4: Đối Tác */}
            <Col xs={24} sm={12} md={5}>
              <Title level={5} className={landingStyles.footerColumnTitle}>Đối Tác</Title>
              <Space direction="vertical" size="small" className={landingStyles.footerLinks}>
                <Button type="link" className={landingStyles.footerLink}>
                  Nhà cung cấp
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Chương trình hợp tác
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Đối tác giao hàng
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Đối tác kinh doanh
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Liên hệ hợp tác
                </Button>
              </Space>
            </Col>

            {/* Column 5: Phổ biến */}
            <Col xs={24} sm={12} md={5}>
              <Title level={5} className={landingStyles.footerColumnTitle}>Phổ biến</Title>
              <Space direction="vertical" size="small" className={landingStyles.footerLinks}>
                <Button
                  type="link"
                  className={landingStyles.footerLink}
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Tính năng hệ thống
                </Button>
                <Button
                  type="link"
                  className={landingStyles.footerLink}
                  onClick={() => navigate('/faq')}
                >
                  Câu hỏi thường gặp
                </Button>
                <Button
                  type="link"
                  className={landingStyles.footerLink}
                  onClick={() => navigate('/contact')}
                >
                  Liên hệ
                </Button>
                <Button type="link" className={landingStyles.footerLink}>
                  Tài liệu hướng dẫn
                </Button>
              </Space>
            </Col>
          </Row>
          
          <Divider className={landingStyles.footerDivider} />
          
          <div className={landingStyles.footerBottom}>
            <Text className={landingStyles.footerCopyright}>
              © {new Date().getFullYear()} Hệ Thống Quản Lý An Toàn Lao Động. Tất cả các quyền được bảo lưu.
            </Text>
            <div className={landingStyles.footerSocial}>
              <Button
                type="link"
                icon={<FacebookOutlined />}
                className={landingStyles.socialButton}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              />
              <Button
                type="link"
                icon={<InstagramOutlined />}
                className={landingStyles.socialButton}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              />
              <Button
                type="link"
                icon={<TwitterOutlined />}
                className={landingStyles.socialButton}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              />
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default OrderFormPage;

