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
  Divider,
  Table,
  Collapse
} from 'antd';
import {
  SafetyOutlined,
  LoginOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import styles from './Pricing.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  popular?: boolean;
  whyChoose: string[];
  keyFeatures: string[];
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  const baseMonthlyPrice = 5000; // 5,000 VND/tháng

  const pricingPlans: PricingPlan[] = [
    {
      id: 'monthly',
      name: 'Gói Tháng',
      description: 'Thanh toán theo tháng, linh hoạt và dễ dàng',
      monthlyPrice: baseMonthlyPrice,
      yearlyPrice: baseMonthlyPrice,
      currency: '₫',
      whyChoose: [
        'Cần sự linh hoạt trong thanh toán',
        'Muốn thử nghiệm dịch vụ trong thời gian ngắn',
        'Phù hợp cho các dự án ngắn hạn'
      ],
      keyFeatures: [
        'Quản lý tối đa 50 nhân viên',
        'Tất cả tính năng cơ bản',
        'Báo cáo và thống kê',
        'Hỗ trợ email',
        'Cập nhật tự động',
        'Bảo mật dữ liệu'
      ]
    },
    {
      id: 'quarterly',
      name: 'Gói Quý',
      description: 'Thanh toán theo quý, tiết kiệm 20%',
      monthlyPrice: baseMonthlyPrice,
      yearlyPrice: 12000, // 12,000 VND/quý
      currency: '₫',
      popular: true,
      whyChoose: [
        'Muốn tiết kiệm chi phí so với thanh toán tháng',
        'Cam kết sử dụng dịch vụ trong thời gian dài hơn',
        'Phù hợp cho các doanh nghiệp vừa và nhỏ'
      ],
      keyFeatures: [
        'Quản lý tối đa 50 nhân viên',
        'Tất cả tính năng cơ bản',
        'Báo cáo và thống kê nâng cao',
        'Hỗ trợ email và chat',
        'Cập nhật tự động',
        'Bảo mật dữ liệu',
        'Ưu tiên hỗ trợ',
        'Backup dữ liệu hàng tuần'
      ]
    },
    {
      id: 'yearly',
      name: 'Gói Năm',
      description: 'Thanh toán theo năm, tiết kiệm 8.33%',
      monthlyPrice: baseMonthlyPrice,
      yearlyPrice: 55000, // 55,000 VND/năm
      currency: '₫',
      whyChoose: [
        'Muốn tiết kiệm tối đa chi phí',
        'Cam kết sử dụng dịch vụ lâu dài',
        'Phù hợp cho các doanh nghiệp lớn'
      ],
      keyFeatures: [
        'Quản lý không giới hạn nhân viên',
        'Tất cả tính năng cao cấp',
        'Báo cáo và thống kê chi tiết',
        'Hỗ trợ 24/7',
        'Cập nhật tự động',
        'Bảo mật dữ liệu cao cấp',
        'Ưu tiên hỗ trợ cao nhất',
        'Backup dữ liệu hàng ngày',
        'Tùy chỉnh giao diện',
        'API tích hợp',
        'Đào tạo nhóm',
        'Tư vấn chuyên nghiệp'
      ]
    }
  ];

  const featuresComparison = [
    {
      category: 'Quản lý Nhân viên',
      feature: 'Số lượng nhân viên',
      monthly: 'Tối đa 50',
      quarterly: 'Tối đa 50',
      yearly: 'Không giới hạn'
    },
    {
      category: 'Tính năng',
      feature: 'Báo cáo và thống kê',
      monthly: true,
      quarterly: 'Nâng cao',
      yearly: 'Chi tiết'
    },
    {
      category: 'Hỗ trợ',
      feature: 'Hỗ trợ email',
      monthly: true,
      quarterly: true,
      yearly: true
    },
    {
      category: 'Hỗ trợ',
      feature: 'Hỗ trợ chat',
      monthly: false,
      quarterly: true,
      yearly: true
    },
    {
      category: 'Hỗ trợ',
      feature: 'Hỗ trợ 24/7',
      monthly: false,
      quarterly: false,
      yearly: true
    },
    {
      category: 'Bảo mật',
      feature: 'Bảo mật dữ liệu',
      monthly: true,
      quarterly: true,
      yearly: 'Cao cấp'
    },
    {
      category: 'Bảo mật',
      feature: 'Backup dữ liệu',
      monthly: 'Hàng tháng',
      quarterly: 'Hàng tuần',
      yearly: 'Hàng ngày'
    },
    {
      category: 'Tùy chỉnh',
      feature: 'Tùy chỉnh giao diện',
      monthly: false,
      quarterly: false,
      yearly: true
    },
    {
      category: 'Tích hợp',
      feature: 'API tích hợp',
      monthly: false,
      quarterly: false,
      yearly: true
    },
    {
      category: 'Đào tạo',
      feature: 'Đào tạo nhóm',
      monthly: false,
      quarterly: false,
      yearly: true
    },
    {
      category: 'Tư vấn',
      feature: 'Tư vấn chuyên nghiệp',
      monthly: false,
      quarterly: false,
      yearly: true
    }
  ];

  const faqData = [
    {
      key: '1',
      question: 'Tôi có thể thay đổi gói sau khi đăng ký không?',
      answer: 'Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. Thay đổi sẽ có hiệu lực ngay lập tức.'
    },
    {
      key: '2',
      question: 'Có phí ẩn nào không?',
      answer: 'Không, giá hiển thị là giá cuối cùng. Không có phí ẩn hay phí setup.'
    },
    {
      key: '3',
      question: 'Tôi có thể hủy bất cứ lúc nào không?',
      answer: 'Có, bạn có thể hủy gói đăng ký bất cứ lúc nào mà không phải chịu phí phạt.'
    },
    {
      key: '4',
      question: 'Có giảm giá cho giáo dục không?',
      answer: 'Có, chúng tôi cung cấp giảm giá đặc biệt cho các tổ chức giáo dục. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.'
    }
  ];


  const columns = [
    {
      title: 'Tính năng',
      dataIndex: 'feature',
      key: 'feature',
      width: '40%',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.category}</Text>
        </div>
      )
    },
    {
      title: 'Gói Tháng',
      dataIndex: 'monthly',
      key: 'monthly',
      align: 'center' as const,
      render: (value: any) => 
        value === true ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} /> :
        value === false ? <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} /> :
        <Text>{value}</Text>
    },
    {
      title: 'Gói Quý',
      dataIndex: 'quarterly',
      key: 'quarterly',
      align: 'center' as const,
      render: (value: any) => 
        value === true ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} /> :
        value === false ? <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} /> :
        <Text>{value}</Text>
    },
    {
      title: 'Gói Năm',
      dataIndex: 'yearly',
      key: 'yearly',
      align: 'center' as const,
      render: (value: any) => 
        value === true ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} /> :
        value === false ? <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} /> :
        <Text>{value}</Text>
    }
  ];

  const handleSelectPlan = (planId: string) => {
    // Navigate to order form page
    navigate(`/pricing/order?plan=${planId}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
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

      {/* Content */}
      <Content className={styles.content}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <Title level={1} className={styles.heroTitle}>
              Chọn gói phù hợp với bạn
            </Title>
            <Paragraph className={styles.heroDescription}>
              Tất cả các gói đều bao gồm quyền truy cập vào tất cả các tính năng cơ bản
            </Paragraph>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className={styles.pricingSection}>
          <div className={styles.pricingContainer}>
            <Row gutter={[24, 24]} justify="center">
              {pricingPlans.map((plan) => {
                const isMonthly = plan.id === 'monthly';
                const isQuarterly = plan.id === 'quarterly';
                const isYearlyPlan = plan.id === 'yearly';
                
                let price = 0;
                let period = '';
                let originalPrice = 0;
                let savingsAmount = 0;
                let savingsPercentage = 0;
                
                if (isMonthly) {
                  price = plan.monthlyPrice;
                  period = 'tháng';
                } else if (isQuarterly) {
                  price = plan.yearlyPrice; // 12,000 VND/quý
                  period = 'quý';
                  originalPrice = baseMonthlyPrice * 3; // 15,000 VND (nếu mua 3 tháng riêng)
                  savingsAmount = originalPrice - price; // 3,000 VND
                  savingsPercentage = Math.round((savingsAmount / originalPrice) * 100); // 20%
                } else if (isYearlyPlan) {
                  price = plan.yearlyPrice; // 55,000 VND/năm
                  period = 'năm';
                  originalPrice = baseMonthlyPrice * 12; // 60,000 VND (nếu mua 12 tháng riêng)
                  savingsAmount = originalPrice - price; // 5,000 VND
                  savingsPercentage = Math.round((savingsAmount / originalPrice) * 100); // 8.33%
                }
                
                return (
                  <Col xs={24} sm={24} md={8} key={plan.id}>
                    <Card
                      className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ''}`}
                    >
                      {plan.popular && (
                        <div className={styles.popularBadge}>Phổ biến nhất</div>
                      )}
                      <div className={styles.cardHeader}>
                        <Title level={3} className={styles.planName}>
                          {plan.name}
                        </Title>
                        <Paragraph className={styles.planDescription}>
                          {plan.description}
                        </Paragraph>
                      </div>
                      <div className={styles.priceSection}>
                        <div className={styles.priceContainer}>
                          <Text className={styles.currency}>{plan.currency}</Text>
                          <Title level={1} className={styles.price}>
                            {price.toLocaleString('vi-VN')}
                          </Title>
                        </div>
                        <Text className={styles.period}>/{period}</Text>
                        {isQuarterly && savingsAmount > 0 && (
                          <Text className={styles.originalPrice}>
                            <Text delete>{plan.currency}{originalPrice.toLocaleString('vi-VN')}</Text> (Tiết kiệm {savingsAmount.toLocaleString('vi-VN')}₫ - {savingsPercentage}%)
                          </Text>
                        )}
                        {isYearlyPlan && savingsAmount > 0 && (
                          <Text className={styles.originalPrice}>
                            <Text delete>{plan.currency}{originalPrice.toLocaleString('vi-VN')}</Text> (Tiết kiệm {savingsAmount.toLocaleString('vi-VN')}₫ - {savingsPercentage}%)
                          </Text>
                        )}
                      </div>
                      <Button
                        type={plan.popular ? 'primary' : 'default'}
                        size="large"
                        block
                        className={styles.selectButton}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        Chọn gói này
                      </Button>
                      <Divider />
                      <div className={styles.whyChoose}>
                        <Text strong className={styles.whyChooseTitle}>
                          Tại sao chọn {plan.name}?
                        </Text>
                        <Text className={styles.whyChooseSubtitle}>
                          Chọn <strong>{plan.name}</strong> nếu bạn:
                        </Text>
                        <ul className={styles.whyChooseList}>
                          {plan.whyChoose.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <Divider />
                      <div className={styles.keyFeatures}>
                        <Text strong className={styles.keyFeaturesTitle}>
                          Tính năng chính:
                        </Text>
                        <ul className={styles.keyFeaturesList}>
                          {plan.keyFeatures.map((feature, index) => (
                            <li key={index}>
                              <CheckCircleOutlined className={styles.checkIcon} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        </section>

        {/* Compare Features Section */}
        <section className={styles.compareSection}>
          <div className={styles.compareContainer}>
            <Title level={2} className={styles.sectionTitle}>
              So sánh tất cả tính năng
            </Title>
            <Table
              dataSource={featuresComparison}
              columns={columns}
              pagination={false}
              className={styles.comparisonTable}
              rowKey="feature"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.faqContainer}>
            <Title level={2} className={styles.faqTitle}>
              <QuestionCircleOutlined className={styles.faqTitleIcon} /> Câu hỏi thường gặp
            </Title>
            <div className={styles.faqContent}>
              <Collapse
                items={faqData.map(item => ({
                  key: item.key,
                  label: (
                    <div className={styles.faqQuestion}>
                      <Text strong className={styles.faqQuestionText}>{item.question}</Text>
                    </div>
                  ),
                  children: (
                    <div className={styles.faqAnswer}>
                      <Paragraph className={styles.faqAnswerText}>{item.answer}</Paragraph>
                    </div>
                  )
                }))}
                className={styles.faqCollapse}
                expandIcon={({ isActive }) => (
                  <span className={`${styles.faqExpandIcon} ${isActive ? styles.faqExpandIconActive : ''}`}>
                    {isActive ? '−' : '+'}
                  </span>
                )}
              />
            </div>
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
                  onClick={() => navigate('/')}
                >
                  Tính năng hệ thống
                </Button>
                <Button
                  type="link"
                  className={styles.footerLink}
                  onClick={() => {
                    const faqSection = document.querySelector(`.${styles.faqSection}`);
                    faqSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
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

export default PricingPage;
