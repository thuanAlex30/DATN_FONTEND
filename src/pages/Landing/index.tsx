import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Typography, Card, Row, Col, Space, Divider } from 'antd';
import {
  SafetyOutlined,
  LoginOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  PlayCircleOutlined,
  ScheduleOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  CustomerServiceOutlined,
  AreaChartOutlined,
  AuditOutlined,
  ProjectOutlined,
  UserSwitchOutlined,
  MessageOutlined
} from '@ant-design/icons';
import styles from './Landing.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const BRAND_NAME = 'Hệ Thống Quản Lý An Toàn Lao Động';
const BRAND_SHORT = 'Safety';

const moduleCards: Array<{
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}> = [
  {
    icon: <SafetyOutlined />,
    title: 'Quản lý An toàn',
    description: 'Theo dõi và quản lý các hoạt động an toàn lao động, sự cố và rủi ro.',
    iconColor: '#f97316',
    iconBg: 'linear-gradient(135deg, #fff4e6 0%, #ffe5d0 100%)'
  },
  {
    icon: <ReadOutlined />,
    title: 'Đào tạo & Chứng chỉ',
    description: 'Quản lý các khóa đào tạo an toàn và theo dõi chứng chỉ của nhân viên.',
    iconColor: '#2563eb',
    iconBg: 'linear-gradient(135deg, #e6f0ff 0%, #d0e2ff 100%)'
  },
  {
    icon: <TeamOutlined />,
    title: 'Quản lý Nhân sự',
    description: 'Quản lý thông tin nhân viên, phòng ban, chức vụ và vai trò.',
    iconColor: '#db2777',
    iconBg: 'linear-gradient(135deg, #ffe6f1 0%, #ffd0e5 100%)'
  },
  {
    icon: <AreaChartOutlined />,
    title: 'Báo cáo & Thống kê',
    description: 'Tạo báo cáo chi tiết và xem thống kê về an toàn lao động.',
    iconColor: '#16a34a',
    iconBg: 'linear-gradient(135deg, #e6f9ee 0%, #cff5dc 100%)'
  },
  {
    icon: <AuditOutlined />,
    title: 'Quản lý PPE',
    description: 'Theo dõi và quản lý thiết bị bảo hộ cá nhân cho nhân viên.',
    iconColor: '#9333ea',
    iconBg: 'linear-gradient(135deg, #f5e6ff 0%, #ebd4ff 100%)'
  },
  {
    icon: <ProjectOutlined />,
    title: 'Quản lý Dự án',
    description: 'Quản lý các dự án, cột mốc, tài nguyên và rủi ro dự án.',
    iconColor: '#0ea5e9',
    iconBg: 'linear-gradient(135deg, #e0f7ff 0%, #c8efff 100%)'
  }
];

const heroMetrics = [
  { value: '1.200+', label: 'Doanh nghiệp đang sử dụng' },
  { value: '98%', label: 'Quy trình được tự động hóa' },
  { value: '24/7', label: 'Đồng hành & hỗ trợ' }
];

const heroHighlights = [
  { icon: <TeamOutlined />, label: 'Chuẩn hóa quy trình' },
  { icon: <ThunderboltOutlined />, label: 'Cảnh báo thời gian thực' },
  { icon: <CheckCircleOutlined />, label: 'Tuân thủ pháp lý' }
];

const heroSlides = [
  'https://hbcg.vn/laravel-filemanager/app/public/media/image/an-toan-lao-dong-trong-xay-dung-4.jpg',
  'https://vinacontrolce.vn/wp-content/uploads/2023/01/5-quy-dinh-ve-an-toan-lao-dong-trong-xay-dung.jpg',
  'https://knacert.com.vn/storage/die-can-biet-ve-an-toan-lao-dong.jpg'
];

const HERO_SLIDE_INTERVAL = 7;

const reasonHighlights = [
  {
    icon: <ThunderboltOutlined />,
    title: 'Triển khai tức thời',
    description: 'Mẫu quy trình dựng sẵn, kết nối nhanh với dữ liệu hiện trường.'
  },
  {
    icon: <RocketOutlined />,
    title: 'Tính năng vượt trội',
    description: 'Kết hợp quản lý nhiệm vụ, dự án, rủi ro và tuân thủ trên cùng nền tảng.'
  },
  {
    icon: <CustomerServiceOutlined />,
    title: 'Hỗ trợ chuyên nghiệp',
    description: 'Đội ngũ chuyên gia đồng hành từ khảo sát đến vận hành, phản hồi 24/7.'
  },
  {
    icon: <SafetyOutlined />,
    title: 'Bảo mật cao',
    description: 'Chuẩn bảo mật đa lớp, mã hóa dữ liệu và sao lưu trên nền tảng đám mây riêng.'
  }
];

const trustedClients = [
  { name: 'Vietracimex Infra', src: 'https://nqs.1cdn.vn/2023/06/08/dautu.kinhtechungkhoan.vn-stores-news_dataimages-2023-062023-08-18-_220230608181438.png' },
  { name: 'Viteccons', src: 'https://nhathuduc.com.vn/pl/img/29/logo-viteccons-02.jpg' },
  { name: 'Coteccons (CTD)', src: 'https://finance.vietstock.vn/image/CTD' },
  { name: 'Central Cons', src: 'https://tse4.mm.bing.net/th/id/OIP.0__3T40cyOLhyymX6eLqxwHaB8?pid=Api&P=0&h=220' },
  { name: 'Hòa Bình Construction', src: 'https://cdn.haitrieu.com/wp-content/uploads/2022/08/logo-hoa-binh-1024x1020.png' },
  { name: 'Cofico', src: 'https://liphoco.com/wp-content/uploads/2023/03/cofico.png' },
  { name: 'Kusto Home', src: 'https://tse1.mm.bing.net/th/id/OIP.BBs6SrZdj8zoP6N4WIR_iQHaDW?pid=Api&P=0&h=220' },
  { name: 'Nova E&C (Novaland)', src: 'https://novalandnovaworld.vn/wp-content/uploads/2022/09/141306novae-c-full.png' },
  { name: 'APC Corporation', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/APC-logo.svg/1200px-APC-logo.svg.png' },
  { name: 'Ricons', src: 'https://cms.vietnamreport.net/source/LogoBusiness/logo%20Ricons%202004new-01.png' }
];

const trustedClientRows = Array.from(
  { length: Math.ceil(trustedClients.length / 5) },
  (_, rowIndex) => trustedClients.slice(rowIndex * 5, rowIndex * 5 + 5)
);

const CLIENT_LOGO_FALLBACK = 'https://placehold.co/140x60/f8fafc/0f172a?text=Logo';

const workflowSteps = [
  {
    icon: <PlayCircleOutlined />,
    title: 'Khởi tạo nhanh',
    description: 'Chuẩn hóa chính sách, khai báo form mẫu, dữ liệu nhân sự và phân quyền chỉ trong 48h.',
    metric: 'Tự động 75% biểu mẫu'
  },
  {
    icon: <ScheduleOutlined />,
    title: 'Vận hành & giám sát',
    description: 'Theo dõi checklist, phân ca, cảnh báo sự cố và phê duyệt trên mobile & web.',
    metric: 'Giảm 40% thời gian báo cáo'
  },
  {
    icon: <RiseOutlined />,
    title: 'Phân tích & cải tiến',
    description: 'Kho dữ liệu tập trung giúp phân tích KPI, đào tạo và tối ưu vận hành.',
    metric: 'Tăng 3x tốc độ xử lý'
  }
];

const supportChannels = [
  {
    icon: <UserSwitchOutlined />,
    title: 'Nhân viên tư vấn',
    description: 'Đội ngũ chuyên gia đồng hành từ bước khảo sát đến lúc vận hành trơn tru.',
    contact: 'support@safety-system.com',
    iconColor: '#059669',
    iconBg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
  },
  {
    icon: <PhoneOutlined />,
    title: 'Tổng đài 0123456789',
    description: 'Hỗ trợ 24/7 tất cả các ngày trong tuần, phản hồi trong vòng 5 phút.',
    contact: '09 1800 6181',
    iconColor: '#2563eb',
    iconBg: 'linear-gradient(135deg, #e0f2ff 0%, #c9e4ff 100%)'
  },
  {
    icon: <MessageOutlined />,
    title: 'Livechat & ticket',
    description: 'Gửi yêu cầu trên app hoặc portal, theo dõi trạng thái xử lý minh bạch.',
    contact: 'support.safety.vn',
    iconColor: '#f97316',
    iconBg: 'linear-gradient(135deg, #fff4e6 0%, #ffe0c7 100%)'
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

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

    return () => observer.disconnect();
  }, []);

  const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    target.onerror = null;
    target.src = CLIENT_LOGO_FALLBACK;
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/');
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
        <section className={styles.heroSection}>
          <div className={styles.heroBackground}>
            <div className={styles.heroSlider} aria-hidden="true">
              {heroSlides.map((src, index) => (
                <div
                  key={src}
                  className={styles.heroSlide}
                  style={{
                    backgroundImage: `url(${src})`,
                    animationDelay: `${index * HERO_SLIDE_INTERVAL}s`,
                    animationDuration: `${heroSlides.length * HERO_SLIDE_INTERVAL}s`
                  }}
                />
              ))}
            </div>
            <div className={`${styles.heroContent} ${isVisible ? styles.visible : ''}`}>
              <div className={styles.heroBadge}>
                <RocketOutlined />
                <span>{BRAND_NAME}</span>
                <span>+1.000 doanh nghiệp</span>
              </div>

              <Title level={1} className={styles.heroTitle}>
                Nền tảng quản lý <span>an toàn lao động tại công trường</span> 
              </Title>

              <Paragraph className={styles.heroDescription}>
                Kết nối con người, quy trình và dữ liệu trong một nền tảng duy nhất. Chuẩn hóa vận hành, tự động hóa
                nhắc việc và hiển thị KPI realtime trên mọi thiết bị.
              </Paragraph>

              <ul className={styles.heroHighlights}>
                {heroHighlights.map((item) => (
                  <li key={item.label} className={styles.heroHighlight}>
                    <span className={styles.heroHighlightIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.heroMetrics}>
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className={styles.heroMetric}>
                    <div className={styles.heroMetricValue}>{metric.value}</div>
                    <div className={styles.heroMetricLabel}>{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className={styles.heroJoinButton}>
                <Button
                  type="primary"
                  size="large"
                  className={styles.joinSystemButton}
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/pricing')}
                >
                  Tham gia hệ thống của chúng tôi
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.whySection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                Vì sao bạn nên chọn {BRAND_NAME}?
              </Title>
              <Paragraph className={styles.sectionSubtitle}>
                Chúng tôi mang tới người dùng nền tảng phần mềm bằng cả Tâm, Trí và Tầm, bảo đảm tốc độ triển khai và tính
                bảo mật cao nhất.
              </Paragraph>
            </div>

            <div className={styles.reasonGrid}>
              {reasonHighlights.map((reason) => (
                <Card key={reason.title} className={styles.reasonCard}>
                  <div className={styles.reasonIcon}>{reason.icon}</div>
                  <Title level={4} className={styles.reasonTitle}>
                    {reason.title}
                  </Title>
                  <Paragraph className={styles.reasonDescription}>{reason.description}</Paragraph>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.trustedClientsSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.clientsIntro}>
              <Title level={2} className={styles.sectionTitle}>
                +1000 khách hàng đã tin dùng {BRAND_SHORT}
              </Title>
              <Paragraph className={styles.sectionSubtitle}>
                Sự hài lòng của khách hàng là thành công lớn nhất của chúng tôi.
              </Paragraph>
            </div>
            <div className={styles.clientLogos}>
              {trustedClientRows.map((row, rowIndex) => (
                <div key={`client-row-${rowIndex}`} className={styles.clientLogosRow}>
                  {row.map((client) => (
                    <div key={client.name} className={styles.clientLogoCard}>
                      <img
                        src={client.src}
                        alt={client.name}
                        className={styles.clientLogo}
                        onError={handleLogoError}
                      />
                      <span>{client.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className={styles.featuresSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                Hệ sinh thái tính năng {BRAND_SHORT}
              </Title>
              <Paragraph className={styles.sectionSubtitle}>
                Các module được kết nối logic giúp đội vận hành thao tác nhanh, dữ liệu đồng bộ xuyên suốt từ hiện trường
                đến phòng điều hành.
              </Paragraph>
            </div>
            <div className={styles.featureGrid}>
              <Row gutter={[24, 24]}>
                {moduleCards.map((feature) => (
                  <Col xs={24} sm={12} lg={8} key={feature.title}>
                    <Card className={`${styles.featureCard} ${styles.fadeInUp}`}>
                      <div className={styles.featureIconWrap} style={{ background: feature.iconBg }}>
                        <span className={styles.featureIconSymbol} style={{ color: feature.iconColor }}>
                          {feature.icon}
                        </span>
                      </div>
                      <Title level={4} className={styles.featureTitle}>{feature.title}</Title>
                      <Paragraph className={styles.featureDescription}>{feature.description}</Paragraph>
                      <div className={styles.featureMeta}>
                        <span>Chi tiết</span>
                        <ArrowRightOutlined />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </section>

        <section className={styles.workflowSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                Quy trình triển khai 3 bước
              </Title>
              <Paragraph className={styles.sectionSubtitle}>
                Lộ trình được chứng thực bởi hàng trăm doanh nghiệp: bắt đầu nhanh, mở rộng dễ và cải tiến liên tục.
              </Paragraph>
            </div>
            <Row gutter={[24, 24]} className={styles.workflowGrid}>
              {workflowSteps.map((step) => (
                <Col xs={24} md={8} key={step.title}>
                  <Card className={styles.workflowCard}>
                    <div className={styles.workflowIcon}>{step.icon}</div>
                    <Title level={4} className={styles.workflowTitle}>{step.title}</Title>
                    <Paragraph className={styles.workflowDescription}>{step.description}</Paragraph>
                    <div className={styles.workflowMetric}>{step.metric}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <section className={styles.supportSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                Trung tâm hỗ trợ & tư vấn
              </Title>
              <Paragraph className={styles.sectionSubtitle}>
                {BRAND_SHORT} luôn ở đây 24/7 để phản hồi mọi yêu cầu dù ngày hay đêm, dù trời nắng hay mưa.
              </Paragraph>
            </div>
            <div className={styles.supportGrid}>
              {supportChannels.map((channel) => (
                <Card key={channel.title} className={styles.supportCard}>
                  <div className={styles.supportIcon} style={{ background: channel.iconBg }}>
                    <span className={styles.supportIconSymbol} style={{ color: channel.iconColor }}>
                      {channel.icon}
                    </span>
                  </div>
                  <Title level={4}>{channel.title}</Title>
                  <Paragraph>{channel.description}</Paragraph>
                  <div className={styles.supportContact}>{channel.contact}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </Content>

      {/* Floating consult button */}
      <div className={styles.floatingConsultWrap}>
        <Button
          type="primary"
          size="large"
          className={styles.floatingConsultButton}
          onClick={() => navigate('/contact')}
        >
          <span className={styles.floatingConsultGlow} />

          <span className={styles.floatingConsultIcon}>
            <span className={styles.floatingConsultIconPulse} />
            <PhoneOutlined />
          </span>

          <span className={styles.floatingConsultText}>
            Yêu cầu tư vấn
            <span className={styles.floatingConsultSub}>Gọi lại trong 5 phút</span>
          </span>
        </Button>
      </div>

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

export default LandingPage;