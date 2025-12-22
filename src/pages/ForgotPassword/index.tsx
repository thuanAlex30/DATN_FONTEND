import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Steps,
  message,
  Alert
} from 'antd';
import {
  SafetyOutlined,
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useSafeNavigate } from '../../hooks/useSafeNavigate';
import forgotPasswordService from '../../services/forgotPasswordService';
import styles from './ForgotPassword.module.css';

const { Title, Text } = Typography;
const { Step } = Steps;

const ForgotPasswordPage: React.FC = () => {
  const safeNavigate = useSafeNavigate();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [otpToken, setOtpToken] = useState<string>('');

  const handleStep1Submit = async (values: { email: string }) => {
    try {
      setLoading(true);
      await forgotPasswordService.sendOTP(values.email);
      setEmail(values.email);
      setCurrentStep(1);
      message.success('Mã OTP đã được gửi đến email của bạn!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      message.error(error.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (values: { otp: string }) => {
    try {
      setLoading(true);
      const response = await forgotPasswordService.verifyOTP(email, values.otp);
      setOtpToken(response.data?.token || '');
      setCurrentStep(2);
      message.success('Mã OTP hợp lệ!');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      message.error(error.response?.data?.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (values: { newPassword: string; confirmPassword: string }) => {
    try {
      setLoading(true);
      await forgotPasswordService.resetPassword(email, values.newPassword, otpToken);
      message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      message.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await forgotPasswordService.sendOTP(email);
      message.success('Mã OTP mới đã được gửi đến email của bạn!');
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      message.error(error.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            name="forgot-password-email"
            onFinish={handleStep1Submit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email của bạn"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Gửi mã OTP
              </Button>
            </Form.Item>
          </Form>
        );

      case 1:
        return (
          <Form
            form={form}
            name="forgot-password-otp"
            onFinish={handleStep2Submit}
            layout="vertical"
            size="large"
          >
            <Alert
              message="Mã OTP đã được gửi"
              description={`Mã OTP đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư của bạn.`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="otp"
              rules={[
                { required: true, message: 'Vui lòng nhập mã OTP!' },
                { len: 6, message: 'Mã OTP phải có 6 chữ số!' },
                { pattern: /^\d+$/, message: 'Mã OTP chỉ chứa số!' }
              ]}
            >
              <Input
                maxLength={6}
                className={styles.otpInput}
              />
            </Form.Item>

            <Form.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  Xác nhận OTP
                </Button>
                <Button
                  type="link"
                  onClick={handleResendOTP}
                  loading={loading}
                  block
                >
                  Gửi lại mã OTP
                </Button>
              </Space>
            </Form.Item>
          </Form>
        );

      case 2:
        return (
          <Form
            form={form}
            name="forgot-password-reset"
            onFinish={handleStep3Submit}
            layout="vertical"
            size="large"
          >
            <Alert
              message="Xác nhận OTP thành công"
              description="Vui lòng nhập mật khẩu mới của bạn."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
                  message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<CheckCircleOutlined />}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.forgotPasswordLayout}>
      {/* Back Button */}
      <div
        className={styles.backButton}
        onClick={() => safeNavigate('/login')}
      >
        <ArrowLeftOutlined className={styles.backButtonIcon} />
        <span>Quay lại đăng nhập</span>
      </div>

      <div className={styles.forgotPasswordContainer}>
        <Card className={styles.forgotPasswordCard}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <div className={styles.header}>
              <SafetyOutlined className={styles.icon} />
              <Title level={2} className={styles.title}>
                Quên mật khẩu
              </Title>
              <Text className={styles.subtitle}>
                Vui lòng làm theo các bước sau để đặt lại mật khẩu
              </Text>
            </div>

            {/* Steps */}
            <Steps current={currentStep} className={styles.steps}>
              <Step title="Nhập email" />
              <Step title="Xác nhận OTP" />
              <Step title="Đặt lại mật khẩu" />
            </Steps>

            {/* Form Content */}
            <div className={styles.formContent}>
              {renderStepContent()}
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

