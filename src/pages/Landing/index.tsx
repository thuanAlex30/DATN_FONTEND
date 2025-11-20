import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Divider,
  Carousel,
  Badge
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
  TwitterOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  StarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import styles from './Landing.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&q=80',
    alt: 'Giám sát an toàn tại công trường'
  },
  {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    alt: 'Thiết bị bảo hộ lao động'
  },
  {
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
    alt: 'Điều phối quy trình làm việc'
  },
  {
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
    alt: 'Đào tạo an toàn cho nhân viên'
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [imageTimeouts, setImageTimeouts] = useState<Record<number, ReturnType<typeof setTimeout>>>({});
  const [isVisible, setIsVisible] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    setImageErrors({});
    setImageLoaded({});
    setIsVisible(true);

    const timeouts: Record<number, ReturnType<typeof setTimeout>> = {};
    heroImages.forEach((_, index) => {
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

    // Scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(`.${styles.fadeInUp}`);
    elements.forEach(el => observer.observe(el));

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
      observer.disconnect();
    };
  }, []);

  const handleImageError = (index: number) => {
    if (imageTimeouts[index]) {
      clearTimeout(imageTimeouts[index]);
    }
    setImageErrors(prev => ({ ...prev, [index]: true }));
    setImageLoaded(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoad = (index: number) => {
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
            <div className={styles.heroFrame}>
              <Row gutter={[48, 32]} align="middle" className={styles.heroRow}>
              {/* Left Side - Text Content */}
              <Col xs={24} lg={12} className={styles.heroColLeft}>
                <div className={`${styles.heroContent} ${isVisible ? styles.visible : ''}`}>
                  <div className={styles.heroTitleWrapper}>
                    <div className={styles.heroTitleTop}>
                      <RocketOutlined className={styles.heroTitleIcon} />
                      <Badge.Ribbon text="Mới" color="volcano" className={styles.heroBadge}>
                        <span className={styles.heroTitleLabel}>Giải pháp số 1</span>
                      </Badge.Ribbon>
                    </div>
                    <Title level={1} className={styles.heroTitle}>
                      Quản Lý An Toàn Lao Động
                    </Title>
                    <Title level={2} className={styles.heroSubtitle}>
                      <ThunderboltOutlined className={styles.subtitleIcon} />
                      Chuyên nghiệp & Hiệu quả
                    </Title>
                  </div>
                  <Paragraph className={styles.heroDescription}>
                    Khám phá hệ thống quản lý toàn diện giúp tổ chức của bạn đảm bảo an toàn lao động,
                    quản lý đào tạo, theo dõi thiết bị bảo hộ và xử lý sự cố một cách hiệu quả.
                  </Paragraph>
                  <div className={styles.heroStats}>
                    <div className={styles.heroStatItem}>
                      <div className={styles.heroStatNumber}>1000+</div>
                      <div className={styles.heroStatLabel}>Doanh nghiệp tin dùng</div>
                    </div>
                    <div className={styles.heroStatItem}>
                      <div className={styles.heroStatNumber}>99.9%</div>
                      <div className={styles.heroStatLabel}>Uptime</div>
                    </div>
                    <div className={styles.heroStatItem}>
                      <div className={styles.heroStatNumber}>24/7</div>
                      <div className={styles.heroStatLabel}>Hỗ trợ</div>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    className={styles.ctaButton}
                    icon={<RocketOutlined />}
                    disabled
                    title="Chức năng đang phát triển"
                  >
                    Tham gia hệ thống của chúng tôi
                  </Button>
                </div>
              </Col>
              
              {/* Right Side - Image/Illustration */}
              <Col xs={24} lg={12} className={styles.heroColRight}>
                <div className={styles.heroImage}>
                  <Carousel
                    autoplay
                    autoplaySpeed={4000}
                    dots={true}
                    className={styles.heroCarousel}
                    effect="fade"
                    fade={true}
                  >
                    {heroImages.map((image, index) => (
                      <div key={index} className={styles.heroCarouselItem}>
                        <div className={styles.heroCarouselImageWrapper}>
                          {imageErrors[index] ? (
                            <div className={styles.heroCarouselFallback}>
                              <SafetyOutlined style={{ fontSize: '64px', color: '#fff', marginBottom: '16px' }} />
                              <div className={styles.heroCarouselFallbackText}>{image.alt}</div>
                            </div>
                          ) : (
                            <>
                              {!imageLoaded[index] && (
                                <div className={styles.heroCarouselPlaceholder}>
                                  <SafetyOutlined className={styles.heroCarouselPlaceholderIcon} />
                                </div>
                              )}
                              <img
                                src={image.url}
                                alt={image.alt}
                                className={styles.heroCarouselImage}
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
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.featuresSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                Tính năng nổi bật
              </Title>
              <Paragraph className={styles.sectionSubtitle}>
                Khám phá những tính năng mạnh mẽ giúp doanh nghiệp của bạn quản lý an toàn lao động hiệu quả
              </Paragraph>
            </div>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card className={`${styles.featureCard} ${styles.fadeInUp}`} hoverable>
                    <div className={styles.featureIconWrapper}>
                      <div className={styles.featureIcon}>{feature.icon}</div>
                      <div className={styles.featureIconGlow}></div>
                    </div>
                    <Title level={4} className={styles.featureTitle}>
                      {feature.title}
                    </Title>
                    <Text className={styles.featureDescription}>
                      {feature.description}
                    </Text>
                    <div className={styles.featureArrow}>
                      <span>→</span>
                    </div>
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
