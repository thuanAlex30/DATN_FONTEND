import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Form,
  Input,
  message,
  Card,
  Divider
} from 'antd';
import {
  SafetyOutlined,
  LoginOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  MessageOutlined,
  SendOutlined,
  BulbOutlined,
  LockOutlined,
  CustomerServiceOutlined,
  TeamOutlined
} from '@ant-design/icons';
import styles from './Contact.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleContactSubmit = (values: any) => {
    console.log('Contact form values:', values);
    message.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    form.resetFields();
  };

  return (
    <Layout className={styles.layout}>
      {/* Header with Navigation */}
      <Header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logo} onClick={handleBackToHome}>
            <SafetyOutlined className={styles.logoIcon} />
            <Title level={4} className={styles.logoText}>
              Hệ Thống Quản Lý An Toàn Lao Động
            </Title>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
            className={styles.loginBtn}
          >
            Đăng nhập
          </Button>
        </div>
        <div className={styles.navBar}>
          <Space size="large" className={styles.navLinks}>
            <Button
              type="link"
              className={styles.navLink}
              onClick={handleBackToHome}
            >
              Trang chủ
            </Button>
            <Button
              type="link"
              className={styles.navLink}
              onClick={() => navigate('/about')}
            >
              Giới thiệu
            </Button>
            <Button
              type="link"
              className={styles.navLinkActive}
              onClick={() => navigate('/contact')}
            >
              Liên Hệ
            </Button>
            <Button
              type="link"
              className={styles.navLink}
              onClick={() => navigate('/faq')}
            >
              FAQ
            </Button>
          </Space>
        </div>
      </Header>

      <Content className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <MessageOutlined className={styles.heroBadgeIcon} />
              <span>Hỗ trợ nhanh chóng & tận tâm</span>
            </div>
            <Title level={1} className={styles.heroTitle}>
              Liên hệ với chúng tôi
            </Title>
            <Text className={styles.heroSubtitle}>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin để được tư vấn tốt nhất!
            </Text>
            
            <Row gutter={[24, 24]} className={styles.heroCards}>
              <Col xs={24} sm={8}>
                <div className={styles.heroCard}>
                  <CustomerServiceOutlined className={styles.heroCardIcon} />
                  <Title level={2} className={styles.heroCardNumber}>24/7</Title>
                  <Text className={styles.heroCardLabel}>Hỗ trợ</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className={styles.heroCard}>
                  <TeamOutlined className={styles.heroCardIcon} />
                  <Title level={2} className={styles.heroCardNumber}>1000+</Title>
                  <Text className={styles.heroCardLabel}>Khách hàng</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className={styles.heroCard}>
                  <MessageOutlined className={styles.heroCardIcon} />
                  <Title level={2} className={styles.heroCardNumber}>&lt; 5 phút</Title>
                  <Text className={styles.heroCardLabel}>Phản hồi</Text>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Top Section - Primary Contact Methods */}
        <div className={styles.topSection}>
          <div className={styles.pageContainer}>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <div className={styles.contactMethodCard}>
                  <div className={`${styles.contactMethodIcon} ${styles.phoneIcon}`}>
                    <PhoneOutlined />
                  </div>
                  <div className={styles.contactMethodContent}>
                    <Text strong className={styles.contactMethodTitle}>Điện thoại</Text>
                    <Text className={styles.contactMethodValue}>+84 (0) 123456789</Text>
                    <Text className={styles.contactMethodNote}>Hotline hỗ trợ 24/7</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className={styles.contactMethodCard}>
                  <div className={`${styles.contactMethodIcon} ${styles.emailIcon}`}>
                    <MailOutlined />
                  </div>
                  <div className={styles.contactMethodContent}>
                    <Text strong className={styles.contactMethodTitle}>Email</Text>
                    <Text className={styles.contactMethodValue}>support@safety-system.com</Text>
                    <Text className={styles.contactMethodNote}>Phản hồi trong 24h</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className={styles.contactMethodCard}>
                  <div className={`${styles.contactMethodIcon} ${styles.chatIcon}`}>
                    <MessageOutlined />
                  </div>
                  <div className={styles.contactMethodContent}>
                    <Text strong className={styles.contactMethodTitle}>Live Chat</Text>
                    <Text className={styles.contactMethodValue}>Chat trực tuyến</Text>
                    <Text className={styles.contactMethodNote}>Hỗ trợ tức thì</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Main Contact Section - 2 Columns */}
        <div className={styles.pageContainer}>
          <Row gutter={[24, 24]} style={{ marginTop: '2rem' }}>
            {/* Left Column: Contact Info + Working Hours */}
            <Col xs={24} lg={12}>
              <Card className={styles.contactInfoCard}>
                <Title level={4} className={styles.contactInfoTitle}>
                  Thông tin liên hệ
                </Title>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div className={styles.contactInfoItem}>
                    <div className={`${styles.contactInfoIconWrapper} ${styles.phoneIconWrapper}`}>
                      <PhoneOutlined className={styles.contactInfoIcon} />
                    </div>
                    <div className={styles.contactInfoText}>
                      <Text className={styles.contactInfoLabel}>Số điện thoại</Text>
                      <Text className={styles.contactInfoValue}>+84 (0) 123456789</Text>
                      <Text className={styles.contactInfoNote}>Hotline 24/7</Text>
                    </div>
                  </div>
                  <div className={styles.contactInfoItem}>
                    <div className={`${styles.contactInfoIconWrapper} ${styles.emailIconWrapper}`}>
                      <MailOutlined className={styles.contactInfoIcon} />
                    </div>
                    <div className={styles.contactInfoText}>
                      <Text className={styles.contactInfoLabel}>Email</Text>
                      <Text className={styles.contactInfoValueEmail}>support@safety-system.com</Text>
                      <Text className={styles.contactInfoNote}>Phản hồi trong 24h</Text>
                    </div>
                  </div>
                  <div className={styles.contactInfoItem}>
                    <div className={`${styles.contactInfoIconWrapper} ${styles.addressIconWrapper}`}>
                      <EnvironmentOutlined className={styles.contactInfoIcon} />
                    </div>
                    <div className={styles.contactInfoText}>
                      <Text className={styles.contactInfoLabel}>Địa chỉ</Text>
                      <Text className={styles.contactInfoValue}>123 Đường ABC, Quận XYZ, TP.Hồ Chí Minh</Text>
                      <Text className={styles.contactInfoNote}>Văn phòng chính</Text>
                    </div>
                  </div>
                </Space>
              </Card>

              {/* Working Hours Card */}
              <Card className={styles.workingHoursCard}>
                <div className={styles.workingHoursHeader}>
                  <ClockCircleOutlined className={styles.workingHoursIcon} />
                  <Title level={4} className={styles.workingHoursTitle}>Giờ làm việc</Title>
                </div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div className={styles.workingHoursRow}>
                    <Text className={styles.workingHoursText}>Thứ Hai - Thứ Sáu:</Text>
                    <Text className={styles.workingHoursTime}>8:00 - 17:30</Text>
                  </div>
                  <div className={styles.workingHoursRow}>
                    <Text className={styles.workingHoursText}>Thứ Bảy:</Text>
                    <Text className={styles.workingHoursTime}>8:00 - 12:00</Text>
                  </div>
                  <div className={styles.workingHoursRow}>
                    <Text className={styles.workingHoursText}>Chủ Nhật:</Text>
                    <Text className={styles.workingHoursTime}>Nghỉ</Text>
                  </div>
                </Space>
                <div className={styles.workingHoursTip}>
                  <BulbOutlined className={styles.workingHoursTipIcon} />
                  <Text className={styles.workingHoursTipText}>
                    Tip: Gọi điện trước khi đến để được hỗ trợ tốt nhất!
                  </Text>
                </div>
              </Card>
            </Col>

            {/* Right Column: Contact Form */}
            <Col xs={24} lg={12}>
              <Card className={styles.contactFormCard}>
                <Title level={4} className={styles.contactFormTitle}>
                  Gửi thông tin liên hệ
                </Title>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleContactSubmit}
                  className={styles.contactForm}
                >
                  <Form.Item
                    name="name"
                    label="Họ và tên *"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                  >
                    <Input placeholder="Nhập họ tên của bạn" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email *"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="your.email@example.com" />
                  </Form.Item>
                  <Form.Item
                    name="subject"
                    label="Tiêu đề *"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                  >
                    <Input placeholder="Chủ đề bạn muốn trao đổi" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    label="Nội dung *"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Mô tả chi tiết nội dung bạn muốn trao đổi..."
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<SendOutlined />}
                      className={styles.submitButton}
                      block
                    >
                      Gửi tin nhắn
                    </Button>
                  </Form.Item>
                  <div className={styles.privacyMessage}>
                    <LockOutlined className={styles.privacyIcon} />
                    <Text className={styles.privacyText}>Thông tin của bạn được bảo mật tuyệt đối</Text>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Footer */}
      <Footer className={styles.footer}>
        <div className={styles.footerContent}>
          <Row gutter={[48, 32]}>
            {/* Column 1: Logo & Contact Info */}
            <Col xs={24} sm={12} md={6}>
              <div className={styles.footerLogo}>
                <SafetyOutlined className={styles.footerLogoIcon} />
                <Title level={4} className={styles.footerLogoText}>
                  Hệ Thống An Toàn
                </Title>
              </div>
              <div className={styles.footerContactInfo}>
                <div className={styles.footerContactItem}>
                  <EnvironmentOutlined className={styles.footerContactIcon} />
                  <Text>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</Text>
                </div>
                <div className={styles.footerContactItem}>
                  <PhoneOutlined className={styles.footerContactIcon} />
                  <Text>Số điện thoại: +84 (0) 123 456 789</Text>
                </div>
                <div className={styles.footerContactItem}>
                  <MailOutlined className={styles.footerContactIcon} />
                  <Text>Email: support@safety-system.com</Text>
                </div>
              </div>
            </Col>

            {/* Column 2: Công Ty */}
            <Col xs={24} sm={12} md={4}>
              <Title level={5} className={styles.footerColumnTitle}>Công Ty</Title>
              <Space direction="vertical" size="small" className={styles.footerLinks}>
                <Button
                  type="link"
                  className={styles.footerLink}
                  onClick={() => navigate('/about')}
                >
                  Giới thiệu về chúng tôi
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Chính sách chất lượng
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Quy chế hoạt động
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Bảo mật thông tin
                </Button>
              </Space>
            </Col>

            {/* Column 3: Tài Khoản */}
            <Col xs={24} sm={12} md={4}>
              <Title level={5} className={styles.footerColumnTitle}>Tài Khoản</Title>
              <Space direction="vertical" size="small" className={styles.footerLinks}>
                <Button type="link" className={styles.footerLink} onClick={handleLogin}>
                  Đăng nhập
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Đăng ký thành viên
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Quên mật khẩu
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Thông tin cá nhân
                </Button>
              </Space>
            </Col>

            {/* Column 4: Đối Tác */}
            <Col xs={24} sm={12} md={5}>
              <Title level={5} className={styles.footerColumnTitle}>Đối Tác</Title>
              <Space direction="vertical" size="small" className={styles.footerLinks}>
                <Button type="link" className={styles.footerLink}>
                  Nhà cung cấp
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Chương trình hợp tác
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Đối tác kinh doanh
                </Button>
                <Button type="link" className={styles.footerLink}>
                  Liên hệ hợp tác
                </Button>
              </Space>
            </Col>

            {/* Column 5: Phổ biến */}
            <Col xs={24} sm={12} md={5}>
              <Title level={5} className={styles.footerColumnTitle}>Phổ biến</Title>
              <Space direction="vertical" size="small" className={styles.footerLinks}>
                <Button
                  type="link"
                  className={styles.footerLink}
                  onClick={() => navigate('/')}
                >
                  Tính năng hệ thống
                </Button>
                <Button
                  type="link"
                  className={styles.footerLink}
                  onClick={() => navigate('/faq')}
                >
                  Câu hỏi thường gặp
                </Button>
                <Button
                  type="link"
                  className={styles.footerLink}
                  onClick={() => navigate('/contact')}
                >
                  Liên hệ
                </Button>
              </Space>
            </Col>
          </Row>
          
          <Divider className={styles.footerDivider} />
          
          <div className={styles.footerBottom}>
            <Text className={styles.footerCopyright}>
              © {new Date().getFullYear()} Hệ Thống Quản Lý An Toàn Lao Động. Tất cả các quyền được bảo lưu.
            </Text>
            <div className={styles.footerSocial}>
              <Button
                type="link"
                icon={<FacebookOutlined />}
                className={styles.socialButton}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              />
              <Button
                type="link"
                icon={<InstagramOutlined />}
                className={styles.socialButton}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              />
              <Button
                type="link"
                icon={<TwitterOutlined />}
                className={styles.socialButton}
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

export default ContactPage;

