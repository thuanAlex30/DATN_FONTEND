import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Divider
} from 'antd';
import {
  SafetyOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import styles from './About.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

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
              className={styles.navLink}
              onClick={() => navigate('/')}
            >
              Trang chủ
            </Button>
            <Button
              type="link"
              className={styles.navLinkActive}
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

      <Content className={styles.content}>
        <div className={styles.pageContainer}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            className={styles.backButton}
          >
            Quay lại trang chủ
          </Button>

          <section className={styles.aboutSection}>
            <Title level={1} className={styles.pageTitle}>
              Giới thiệu về hệ thống
            </Title>
            
            <Row gutter={[48, 48]} align="middle" className={styles.aboutRow}>
              <Col xs={24} lg={12}>
                <Paragraph className={styles.aboutText}>
                  Hệ thống Quản lý An toàn Lao động được phát triển nhằm hỗ trợ các tổ chức
                  quản lý toàn diện các hoạt động liên quan đến an toàn lao động. Với giao diện
                  thân thiện và các tính năng mạnh mẽ, hệ thống giúp:
                </Paragraph>
                <ul className={styles.aboutList}>
                  <li>
                    <CheckCircleOutlined className={styles.listIcon} />
                    Nâng cao hiệu quả quản lý an toàn lao động
                  </li>
                  <li>
                    <CheckCircleOutlined className={styles.listIcon} />
                    Giảm thiểu rủi ro và sự cố tại nơi làm việc
                  </li>
                  <li>
                    <CheckCircleOutlined className={styles.listIcon} />
                    Theo dõi và quản lý đào tạo an toàn
                  </li>
                  <li>
                    <CheckCircleOutlined className={styles.listIcon} />
                    Quản lý thiết bị bảo hộ cá nhân (PPE)
                  </li>
                  <li>
                    <CheckCircleOutlined className={styles.listIcon} />
                    Tạo báo cáo và thống kê chi tiết
                  </li>
                  <li>
                    <CheckCircleOutlined className={styles.listIcon} />
                    Xử lý sự cố nhanh chóng và hiệu quả
                  </li>
                </ul>
              </Col>
              <Col xs={24} lg={12}>
                <div className={styles.aboutImage}>
                  <SafetyOutlined className={styles.aboutIcon} />
                </div>
              </Col>
            </Row>
          </section>
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

export default AboutPage;

