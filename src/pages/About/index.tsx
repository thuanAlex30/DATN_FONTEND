
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Divider,
  Card,
  Statistic,
  Carousel
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
  TwitterOutlined,
  TeamOutlined,
  TrophyOutlined,
  RocketOutlined,
  EyeOutlined,
  BulbOutlined,
  HeartOutlined,
  BarChartOutlined,
  UserOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import styles from './About.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [imageTimeouts, setImageTimeouts] = useState<Record<number, ReturnType<typeof setTimeout>>>({});

  // Hình ảnh xây dựng cho carousel
  const constructionImages = [
    {
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
      alt: 'Công trình xây dựng an toàn'
    },
    {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
      alt: 'Nhân viên làm việc an toàn'
    },
    {
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
      alt: 'Thiết bị bảo hộ lao động'
    },
    {
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80',
      alt: 'Công trường xây dựng'
    },
    {
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
      alt: 'An toàn lao động'
    }
  ];

  // Reset image errors khi component mount lại và setup timeout cho tất cả hình ảnh
  useEffect(() => {
    setImageErrors({});
    setImageLoaded({});
    
    // Setup timeout cho tất cả hình ảnh - nếu không load trong 5 giây thì hiển thị fallback
    const timeouts: Record<number, ReturnType<typeof setTimeout>> = {};
    constructionImages.forEach((_, index) => {
      timeouts[index] = setTimeout(() => {
        setImageErrors(prev => {
          if (!prev[index]) {
            return { ...prev, [index]: true };
          }
          return prev;
        });
      }, 5000);
    });
    setImageTimeouts(timeouts);
    
    // Clear all timeouts on unmount
    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleImageError = (index: number) => {
    // Clear timeout if exists
    if (imageTimeouts[index]) {
      clearTimeout(imageTimeouts[index]);
    }
    // Hiển thị fallback ngay lập tức
    setImageErrors(prev => ({ ...prev, [index]: true }));
    setImageLoaded(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoad = (index: number) => {
    // Clear timeout if exists
    if (imageTimeouts[index]) {
      clearTimeout(imageTimeouts[index]);
      setImageTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[index];
        return newTimeouts;
      });
    }
    setImageLoaded(prev => ({ ...prev, [index]: true }));
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
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
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <SafetyOutlined className={styles.badgeIcon} />
                <span>Về Hệ Thống</span>
              </div>
              <Title level={1} className={styles.heroTitle}>
              Giới thiệu về hệ thống
            </Title>
              <Paragraph className={styles.heroDescription}>
                Hệ thống Quản lý An toàn Lao động được phát triển nhằm hỗ trợ các tổ chức
                quản lý toàn diện các hoạt động liên quan đến an toàn lao động. Với giao diện
                thân thiện và các tính năng mạnh mẽ, hệ thống giúp nâng cao hiệu quả và đảm bảo an toàn tại nơi làm việc.
              </Paragraph>
            </div>
          </div>
        </section>

        <div className={styles.pageContainer}>
          {/* Main About Section */}
          <section className={styles.aboutSection}>
            <Card className={styles.aboutFrameCard}>
            <Row gutter={[48, 48]} align="middle" className={styles.aboutRow}>
              <Col xs={24} lg={12}>
                  <div className={styles.aboutContent}>
                    <div className={styles.aboutContentHeader}>
                      <div className={styles.aboutTitleBadge}>
                        <SafetyOutlined className={styles.titleBadgeIcon} />
                        <span>Về Hệ Thống</span>
                      </div>
                      <Title level={2} className={styles.aboutSectionTitle}>
                        Hệ thống của chúng tôi
                      </Title>
                    </div>
                <Paragraph className={styles.aboutText}>
                      Hệ thống Quản lý An toàn Lao động là giải pháp toàn diện được thiết kế để hỗ trợ
                      các tổ chức trong việc quản lý và đảm bảo an toàn lao động một cách hiệu quả.
                      Với công nghệ hiện đại và giao diện thân thiện, hệ thống giúp:
                </Paragraph>
                <ul className={styles.aboutList}>
                  <li>
                        <div className={styles.listItemWrapper}>
                    <CheckCircleOutlined className={styles.listIcon} />
                          <span>Nâng cao hiệu quả quản lý an toàn lao động</span>
                        </div>
                  </li>
                  <li>
                        <div className={styles.listItemWrapper}>
                    <CheckCircleOutlined className={styles.listIcon} />
                          <span>Giảm thiểu rủi ro và sự cố tại nơi làm việc</span>
                        </div>
                  </li>
                  <li>
                        <div className={styles.listItemWrapper}>
                    <CheckCircleOutlined className={styles.listIcon} />
                          <span>Theo dõi và quản lý đào tạo an toàn</span>
                        </div>
                  </li>
                  <li>
                        <div className={styles.listItemWrapper}>
                    <CheckCircleOutlined className={styles.listIcon} />
                          <span>Quản lý thiết bị bảo hộ cá nhân (PPE)</span>
                        </div>
                  </li>
                  <li>
                        <div className={styles.listItemWrapper}>
                    <CheckCircleOutlined className={styles.listIcon} />
                          <span>Tạo báo cáo và thống kê chi tiết</span>
                        </div>
                  </li>
                  <li>
                        <div className={styles.listItemWrapper}>
                    <CheckCircleOutlined className={styles.listIcon} />
                          <span>Xử lý sự cố nhanh chóng và hiệu quả</span>
                        </div>
                  </li>
                </ul>
                  </div>
              </Col>
              <Col xs={24} lg={12}>
                  <div className={styles.aboutCarouselWrapper}>
                    <Carousel
                      autoplay
                      autoplaySpeed={4000}
                      dots={true}
                      className={styles.aboutCarousel}
                      effect="fade"
                      fade={true}
                    >
                      {constructionImages.map((image, index) => (
                        <div key={index} className={styles.carouselItem}>
                          <div className={styles.carouselImageContainer}>
                            {imageErrors[index] ? (
                              <div className={styles.carouselImageFallback}>
                                <SafetyOutlined style={{ fontSize: '64px', color: '#fff', marginBottom: '16px' }} />
                                <div className={styles.carouselImageFallbackText}>{image.alt}</div>
                              </div>
                            ) : (
                              <>
                                {!imageLoaded[index] && (
                                  <div className={styles.carouselImagePlaceholder}>
                                    <SafetyOutlined style={{ fontSize: '48px', color: 'rgba(255,255,255,0.5)' }} />
                                  </div>
                                )}
                                <img
                                  src={image.url}
                                  alt={image.alt}
                                  className={styles.carouselImage}
                                  onError={() => handleImageError(index)}
                                  onLoad={() => handleImageLoad(index)}
                                  loading="eager"
                                  style={{ 
                                    display: 'block',
                                    opacity: imageLoaded[index] ? 1 : 0.3,
                                    transition: 'opacity 0.5s ease',
                                    visibility: 'visible'
                                  }}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </Carousel>
                </div>
                </Col>
              </Row>
            </Card>
          </section>

          {/* Statistics Section */}
          <section className={styles.statsSection}>
            <Row gutter={[24, 24]}>
              <Col xs={12} sm={6}>
                <Card className={styles.statCard}>
                  <Statistic
                    title="Người dùng"
                    value={1000}
                    suffix="+"
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className={styles.statCard}>
                  <Statistic
                    title="Dự án"
                    value={500}
                    suffix="+"
                    prefix={<SafetyCertificateOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className={styles.statCard}>
                  <Statistic
                    title="Sự cố đã xử lý"
                    value={95}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className={styles.statCard}>
                  <Statistic
                    title="Đánh giá"
                    value={4.8}
                    suffix="/5"
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#eb2f96' }}
                  />
                </Card>
              </Col>
            </Row>
          </section>

          {/* Values Section */}
          <section className={styles.valuesSection}>
            <Title level={2} className={styles.sectionTitle}>
              Giá trị cốt lõi
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <Card className={styles.valueCard} hoverable>
                  <div className={styles.valueIcon}>
                    <EyeOutlined />
                  </div>
                  <Title level={4} className={styles.valueTitle}>
                    Tầm nhìn
                  </Title>
                  <Paragraph className={styles.valueText}>
                    Trở thành hệ thống quản lý an toàn lao động hàng đầu, góp phần xây dựng môi trường làm việc an toàn và bền vững.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className={styles.valueCard} hoverable>
                  <div className={styles.valueIcon}>
                    <RocketOutlined />
                  </div>
                  <Title level={4} className={styles.valueTitle}>
                    Sứ mệnh
                  </Title>
                  <Paragraph className={styles.valueText}>
                    Cung cấp giải pháp công nghệ hiện đại giúp các tổ chức quản lý an toàn lao động hiệu quả và chuyên nghiệp.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className={styles.valueCard} hoverable>
                  <div className={styles.valueIcon}>
                    <BulbOutlined />
                  </div>
                  <Title level={4} className={styles.valueTitle}>
                    Đổi mới
                  </Title>
                  <Paragraph className={styles.valueText}>
                    Không ngừng cải tiến và phát triển các tính năng mới để đáp ứng nhu cầu ngày càng cao của khách hàng.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className={styles.valueCard} hoverable>
                  <div className={styles.valueIcon}>
                    <HeartOutlined />
                  </div>
                  <Title level={4} className={styles.valueTitle}>
                    Cam kết
                  </Title>
                  <Paragraph className={styles.valueText}>
                    Đặt sự an toàn và sức khỏe của người lao động lên hàng đầu trong mọi quyết định và hoạt động.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </section>

          {/* Features Grid */}
          <section className={styles.featuresSection}>
            <Title level={2} className={styles.sectionTitle}>
              Tính năng nổi bật
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={8}>
                <Card className={styles.featureCard} hoverable>
                  <div className={styles.featureIcon}>
                    <SafetyOutlined />
                  </div>
                  <Title level={4} className={styles.featureTitle}>
                    Quản lý An toàn
                  </Title>
                  <Paragraph className={styles.featureDescription}>
                    Theo dõi và quản lý các hoạt động an toàn lao động, sự cố và rủi ro một cách toàn diện.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className={styles.featureCard} hoverable>
                  <div className={styles.featureIcon}>
                    <BarChartOutlined />
                  </div>
                  <Title level={4} className={styles.featureTitle}>
                    Báo cáo & Thống kê
                  </Title>
                  <Paragraph className={styles.featureDescription}>
                    Tạo báo cáo chi tiết và xem thống kê về an toàn lao động với biểu đồ trực quan.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className={styles.featureCard} hoverable>
                  <div className={styles.featureIcon}>
                    <TeamOutlined />
                  </div>
                  <Title level={4} className={styles.featureTitle}>
                    Quản lý Nhân sự
                  </Title>
                  <Paragraph className={styles.featureDescription}>
                    Quản lý thông tin nhân viên, phòng ban, chức vụ và vai trò một cách hệ thống.
                  </Paragraph>
                </Card>
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

