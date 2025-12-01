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
  ArrowLeftOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import styles from './Contact.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = () => {
    navigate('/login');
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
              className={styles.navLink}
              onClick={() => navigate('/about')}
            >
              Giới thiệu
            </Button>
            <Button
              type="link"
              className={styles.navLinkActive}
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

          <section className={styles.contactSection}>
            <Title level={1} className={styles.pageTitle}>
              Liên hệ với chúng tôi
            </Title>
            
            <Row gutter={[48, 48]}>
              <Col xs={24} lg={12}>
                <Paragraph className={styles.contactText}>
                  Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi
                  qua các kênh sau:
                </Paragraph>
                <Space direction="vertical" size="large" className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <PhoneOutlined className={styles.contactIcon} />
                    <div>
                      <Text strong>Điện thoại</Text>
                      <br />
                      <Text>+84 (0) 123 456 789</Text>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <MailOutlined className={styles.contactIcon} />
                    <div>
                      <Text strong>Email</Text>
                      <br />
                      <Text>support@safety-system.com</Text>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <EnvironmentOutlined className={styles.contactIcon} />
                    <div>
                      <Text strong>Địa chỉ</Text>
                      <br />
                      <Text>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</Text>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <ClockCircleOutlined className={styles.contactIcon} />
                    <div>
                      <Text strong>Giờ làm việc</Text>
                      <br />
                      <Text>Thứ 2 - Thứ 6: 8:00 - 17:30</Text>
                      <br />
                      <Text>Thứ 7: 8:00 - 12:00</Text>
                      <br />
                      <Text>Chủ nhật: Nghỉ</Text>
                    </div>
                  </div>
                </Space>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Gửi tin nhắn cho chúng tôi" className={styles.contactFormCard}>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleContactSubmit}
                  >
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                      <Input placeholder="Nhập họ và tên của bạn" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input placeholder="Nhập email của bạn" />
                    </Form.Item>
                    <Form.Item
                      name="subject"
                      label="Chủ đề"
                      rules={[{ required: true, message: 'Vui lòng nhập chủ đề!' }]}
                    >
                      <Input placeholder="Nhập chủ đề" />
                    </Form.Item>
                    <Form.Item
                      name="message"
                      label="Nội dung"
                      rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                      <TextArea
                        rows={6}
                        placeholder="Nhập nội dung tin nhắn của bạn"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" block>
                        Gửi tin nhắn
                      </Button>
                    </Form.Item>
                  </Form>
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

export default ContactPage;

