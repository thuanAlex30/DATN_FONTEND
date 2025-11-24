
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
import MarketingHeader from '../../components/MarketingHeader';
import styles from './About.module.css';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [imageTimeouts, setImageTimeouts] = useState<Record<number, ReturnType<typeof setTimeout>>>({});
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [statsValues, setStatsValues] = useState({
    users: 0,
    projects: 0,
    incidents: 0,
    rating: 0
  });

  // Hình ảnh xây dựng cho carousel
  const constructionImages = [
  'https://cdn.vietnambiz.vn/2019/12/1/photo-1-1575201255304457023286.jpg',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
  'https://img.timvieckysu.com/2020/08/cong-nhan-xay-dung-la-gi-1.jpg',
  'https://media.vneconomy.vn/w800/images/upload/2022/12/13/ctd-xay-tet-2.jpg',
  'https://jobs365.vn/wp-content/uploads/2021/06/ky-su-xay-dung-can-biet-nhung-gi-1.jpg'
  ];

  // Reset image errors khi component mount lại và setup timeout cho tất cả hình ảnh
  useEffect(() => {
    setImageErrors({});
    setImageLoaded({});
    
    // Preload images và đảm bảo hình ảnh luôn hiển thị
    const timeouts: Record<number, ReturnType<typeof setTimeout>> = {};
    constructionImages.forEach((imageUrl, index) => {
      // Preload images để hình ảnh load nhanh hơn
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        handleImageLoad(index);
      };
      img.onerror = () => {
        handleImageError(index);
      };
      
      // Đảm bảo hình ảnh luôn hiển thị ngay cả khi đang load
      setImageLoaded(prev => ({ ...prev, [index]: false }));
      
      // Timeout dài hơn để đợi hình ảnh load (15 giây)
      timeouts[index] = setTimeout(() => {
        setImageLoaded(prevLoaded => {
          if (!prevLoaded[index]) {
            // Nếu chưa load sau 15 giây, vẫn hiển thị hình ảnh với opacity thấp
            return { ...prevLoaded, [index]: true };
          }
          return prevLoaded;
        });
      }, 15000);
    });
    setImageTimeouts(timeouts);
    
    // Clear all timeouts on unmount
    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Scroll animations với Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set(prev).add(entry.target.id));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('[data-scroll-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Count up animation cho statistics
  useEffect(() => {
    const statsSection = document.getElementById('stats-section');
    if (!statsSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate count up
            const duration = 2000;
            const steps = 60;
            const stepDuration = duration / steps;
            
            const targetValues = { users: 1000, projects: 500, incidents: 95, rating: 4.8 };
            
            let currentStep = 0;
            const interval = setInterval(() => {
              currentStep++;
              const progress = currentStep / steps;
              
              setStatsValues({
                users: Math.floor(targetValues.users * progress),
                projects: Math.floor(targetValues.projects * progress),
                incidents: Math.floor(targetValues.incidents * progress),
                rating: Number((targetValues.rating * progress).toFixed(1))
              });

              if (currentStep >= steps) {
                clearInterval(interval);
                setStatsValues(targetValues);
              }
            }, stepDuration);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(statsSection);

    return () => observer.disconnect();
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
      <MarketingHeader activeKey="about" />

      <Content className={styles.content}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
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
          <section 
            className={`${styles.aboutSection} ${visibleSections.has('about-section') ? styles.visible : ''}`}
            id="about-section"
            data-scroll-section
          >
            <Card className={styles.aboutFrameCard}>
            <Row gutter={[48, 48]} align="stretch" className={styles.aboutRow}>
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
                      {constructionImages.map((imageUrl, index) => (
                        <div key={index} className={styles.carouselItem}>
                          <div className={styles.carouselImageContainer}>
                            <img
                              src={imageUrl}
                              className={styles.carouselImage}
                              onError={() => handleImageError(index)}
                              onLoad={() => handleImageLoad(index)}
                              loading="eager"
                              style={{ 
                                display: 'block',
                                opacity: imageLoaded[index] ? 1 : 0.8,
                                transition: 'opacity 0.8s ease-in-out',
                                visibility: 'visible',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'relative',
                                zIndex: 1
                              }}
                            />
                            {imageErrors[index] && (
                              <div className={styles.carouselImageFallback}>
                                <SafetyOutlined style={{ fontSize: '64px', color: '#fff', opacity: 0.9 }} />
                              </div>
                            )}
                            {!imageLoaded[index] && !imageErrors[index] && (
                              <div className={styles.carouselImagePlaceholder}>
                                <SafetyOutlined style={{ fontSize: '48px', opacity: 0.4, color: '#fff' }} />
                              </div>
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
          <section 
            id="stats-section"
            className={`${styles.statsSection} ${visibleSections.has('stats-section') ? styles.visible : ''}`}
            data-scroll-section
          >
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={6}>
                <Card className={styles.statCard}>
                  <Statistic
                    title="Người dùng"
                    value={statsValues.users}
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
                    value={statsValues.projects}
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
                    value={statsValues.incidents}
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
                    value={statsValues.rating}
                    suffix="/5"
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#eb2f96' }}
                  />
                </Card>
              </Col>
            </Row>
          </section>

          {/* Values Section */}
          <section 
            className={`${styles.valuesSection} ${visibleSections.has('values-section') ? styles.visible : ''}`}
            id="values-section"
            data-scroll-section
          >
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
          <section 
            className={`${styles.featuresSection} ${visibleSections.has('features-section') ? styles.visible : ''}`}
            id="features-section"
            data-scroll-section
          >
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

