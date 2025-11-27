import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Divider
} from 'antd';
import {
  SafetyOutlined,
  LoginOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  BookOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import styles from './Landing.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };


  const features = [
    {
      icon: <SafetyOutlined />,
      title: 'Quản lý An toàn',
      description: 'Theo dõi và quản lý các hoạt động an toàn lao động, sự cố và rủi ro'
    },
    {
      icon: <BookOutlined />,
      title: 'Đào tạo & Chứng chỉ',
      description: 'Quản lý các khóa đào tạo an toàn và theo dõi chứng chỉ của nhân viên'
    },
    {
      icon: <TeamOutlined />,
      title: 'Quản lý Nhân sự',
      description: 'Quản lý thông tin nhân viên, phòng ban, chức vụ và vai trò'
    },
    {
      icon: <BarChartOutlined />,
      title: 'Báo cáo & Thống kê',
      description: 'Tạo báo cáo chi tiết và xem thống kê về an toàn lao động'
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Quản lý PPE',
      description: 'Theo dõi và quản lý thiết bị bảo hộ cá nhân cho nhân viên'
    },
    {
      icon: <InfoCircleOutlined />,
      title: 'Quản lý Dự án',
      description: 'Quản lý các dự án, cột mốc, tài nguyên và rủi ro dự án'
    }
  ];

  return (
    <Layout className={styles.layout}>
      {/* Header with Navigation */}
      <Header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logo} onClick={() => navigate('/')}>
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
              className={styles.navLinkActive}
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
              className={styles.navLink}
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

      {/* Hero Section */}
      <Content className={styles.content}>
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <Row gutter={[48, 32]} align="middle">
              {/* Left Side - Text Content */}
              <Col xs={24} lg={12}>
                <div className={styles.heroContent}>
                  <Title level={1} className={styles.heroTitle}>
                    Quản Lý An Toàn Lao Động
                  </Title>
                  <Title level={2} className={styles.heroSubtitle}>
                    Chuyên nghiệp & Hiệu quả
                  </Title>
                  <Paragraph className={styles.heroDescription}>
                    Khám phá hệ thống quản lý toàn diện giúp tổ chức của bạn đảm bảo an toàn lao động,
                    quản lý đào tạo, theo dõi thiết bị bảo hộ và xử lý sự cố một cách hiệu quả.
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    className={styles.ctaButton}
                    disabled
                    title="Chức năng đang phát triển"
                  >
                    Tham gia hệ thống của chúng tôi
                  </Button>
                </div>
              </Col>
              
              {/* Right Side - Image/Illustration */}
              <Col xs={24} lg={12}>
                <div className={styles.heroImage}>
                  <img 
                    src="/hero-image.jpg" 
                    alt="Quản lý an toàn lao động"
                    className={styles.heroImageImg}
                    onError={(e) => {
                      // Fallback nếu ảnh không tồn tại
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  {/* Fallback placeholder nếu ảnh không tồn tại */}
                  <div className={styles.heroImagePlaceholder}>
                    <SafetyOutlined className={styles.heroImageIcon} />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.featuresSection}>
          <div className={styles.sectionContainer}>
            <Title level={2} className={styles.sectionTitle}>
              Tính năng nổi bật
            </Title>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card className={styles.featureCard} hoverable>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <Title level={4} className={styles.featureTitle}>
                      {feature.title}
                    </Title>
                    <Text className={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

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
                  Tuyển dụng
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
                <Button type="link" className={styles.footerLink}>
                  Lịch sử giao dịch
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
                  Đối tác giao hàng
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
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
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
                <Button type="link" className={styles.footerLink}>
                  Tài liệu hướng dẫn
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

export default LandingPage;
