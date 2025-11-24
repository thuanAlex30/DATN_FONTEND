import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Typography,
  Collapse,
  Space,
  Row,
  Col,
  Divider
} from 'antd';
import {
  SafetyOutlined,
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import MarketingHeader from '../../components/MarketingHeader';
import styles from './FAQ.module.css';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const FAQPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const faqData = [
    {
      key: '1',
      label: 'Hệ thống quản lý an toàn lao động là gì?',
      children: 'Hệ thống quản lý an toàn lao động là một nền tảng tích hợp giúp quản lý toàn diện các hoạt động an toàn, đào tạo, thiết bị bảo hộ cá nhân (PPE), sự cố và dự án trong tổ chức.'
    },
    {
      key: '2',
      label: 'Ai có thể sử dụng hệ thống này?',
      children: 'Hệ thống được thiết kế cho tất cả các thành viên trong tổ chức, bao gồm: Quản trị viên, Quản lý, Trưởng nhóm, Nhân viên, Giảng viên và Nhân viên an toàn. Mỗi vai trò có quyền truy cập và chức năng phù hợp.'
    },
    {
      key: '3',
      label: 'Làm thế nào để đăng nhập vào hệ thống?',
      children: 'Bạn cần có tài khoản được cấp bởi quản trị viên. Nhấn nút "Đăng nhập" ở góc trên bên phải và nhập tên đăng nhập cùng mật khẩu của bạn.'
    },
    {
      key: '4',
      label: 'Tôi quên mật khẩu, phải làm sao?',
      children: 'Nếu bạn quên mật khẩu, vui lòng liên hệ với quản trị viên hệ thống hoặc bộ phận IT để được hỗ trợ đặt lại mật khẩu.'
    },
    {
      key: '5',
      label: 'Hệ thống có hỗ trợ trên mobile không?',
      children: 'Có, hệ thống được thiết kế responsive và có thể truy cập trên các thiết bị di động, máy tính bảng và máy tính để bàn.'
    },
    {
      key: '6',
      label: 'Làm thế nào để báo cáo sự cố?',
      children: 'Sau khi đăng nhập, người dùng có quyền báo cáo sự cố có thể truy cập vào mục "Báo cáo sự cố" trong menu và điền thông tin chi tiết về sự cố.'
    }
  ];

  const faqHighlights = [
    {
      value: '24/7',
      label: 'Hỗ trợ chuyên gia'
    },
    {
      value: '500+',
      label: 'Doanh nghiệp đang tin dùng'
    },
    {
      value: '99%',
      label: 'Phản hồi được giải quyết'
    }
  ];

  return (
    <Layout className={styles.layout}>
      <MarketingHeader activeKey="faq" />

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

          <section className={styles.faqSection}>
            <Row gutter={[48, 40]} align="middle" className={styles.faqHeroRow}>
              <Col xs={24} lg={12} xl={11}>
                <div className={styles.faqHero}>
                  <Title level={1} className={styles.pageTitle}>
                    Câu hỏi thường gặp
                  </Title>
                  <Text className={styles.faqSubtitle}>
                    Tất cả thông tin bạn cần biết về hệ thống quản lý an toàn lao động đều có tại đây.
                  </Text>
                  <div className={styles.faqHighlights}>
                    {faqHighlights.map(item => (
                      <div key={item.label} className={styles.faqHighlightCard}>
                        <span className={styles.faqHighlightValue}>{item.value}</span>
                        <span className={styles.faqHighlightLabel}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12} xl={13}>
                <div className={styles.faqImageContainer}>
                  <img 
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80" 
                    alt="An toàn lao động" 
                    className={styles.faqHeroImage}
                  />
                  <div className={styles.faqImageOverlay}></div>
                </div>
              </Col>
            </Row>
            
            <div className={styles.faqContentWrapper}>
              <Row gutter={[32, 32]} align="stretch">
                <Col xs={24} lg={16} xl={15}>
                  <div className={styles.faqQuestionsWrapper}>
                    <Collapse
                      items={faqData}
                      className={styles.faqCollapse}
                      expandIcon={({ isActive }) => (
                        <QuestionCircleOutlined rotate={isActive ? 90 : 0} />
                      )}
                    />
                  </div>
                </Col>
                <Col xs={24} lg={8} xl={9}>
                  <div className={styles.faqSideImages}>
                    <div className={styles.faqSideImageCard}>
                      <div className={styles.faqSideImageWrapper}>
                        <img 
                          src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80" 
                          alt="Thiết bị bảo hộ" 
                          className={styles.faqSideImage}
                        />
                      </div>
                      <div className={styles.faqSideImageContent}>
                        <Title level={5}>Thiết bị bảo hộ</Title>
                        <Text>Quản lý và theo dõi thiết bị bảo hộ cá nhân</Text>
                      </div>
                    </div>
                    <div className={styles.faqSideImageCard}>
                      <div className={styles.faqSideImageWrapper}>
                        <img 
                          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80" 
                          alt="Đào tạo an toàn" 
                          className={styles.faqSideImage}
                        />
                      </div>
                      <div className={styles.faqSideImageContent}>
                        <Title level={5}>Đào tạo an toàn</Title>
                        <Text>Chương trình đào tạo chuyên nghiệp</Text>
                      </div>
                    </div>
                    <div className={styles.faqSideImageCard}>
                      <div className={styles.faqSideImageWrapper}>
                        <img 
                          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80" 
                          alt="Quản lý dự án" 
                          className={styles.faqSideImage}
                        />
                      </div>
                      <div className={styles.faqSideImageContent}>
                        <Title level={5}>Quản lý dự án</Title>
                        <Text>Theo dõi và quản lý dự án hiệu quả</Text>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
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
              <Button type="link" icon={<FacebookOutlined />} className={styles.socialButton} />
              <Button type="link" icon={<InstagramOutlined />} className={styles.socialButton} />
              <Button type="link" icon={<TwitterOutlined />} className={styles.socialButton} />
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default FAQPage;

