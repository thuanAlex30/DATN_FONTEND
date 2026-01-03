import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Modal, Tabs, Form, Input, Button, Switch, message, Space, Typography, Card } from 'antd';
import {
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  SaveOutlined
} from '@ant-design/icons';
import authService from '../../services/authService';
import NotificationService from '../../services/notificationService';
import type { NotificationSettings } from '../../services/notificationService';
import { logout } from '../../store/slices/authSlice';
import styles from './SettingsModal.module.css';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Password } = Input;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [passwordForm] = Form.useForm();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotificationSettings();
    }
  }, [isOpen]);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const settings = await NotificationService.getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      message.error('Không thể tải cài đặt thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setSaving(true);
      console.log('🔄 Changing password with values:', {
        currentPassword: '***',
        newPassword: '***',
        confirmNewPassword: '***'
      });
      
      const response = await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword
      });
      
      console.log('✅ Password change response:', response);
      
      // Show success message
      message.success({
        content: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.',
        duration: 3,
      });
      
      // Reset form
      passwordForm.resetFields();
      
      // Close modal
      onClose();
      
      // Wait a bit for the message to be visible, then logout and redirect
      setTimeout(() => {
        // Dispatch logout to clear Redux state and localStorage
        dispatch(logout());
        
        // Navigate to login page
        navigate('/login', { replace: true });
      }, 1500);
    } catch (error: any) {
      console.error('❌ Error changing password:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Multiple validation errors
          const errorMessages = errorData.errors.map((err: any) => err.message || err).join(', ');
          message.error(`Lỗi validation: ${errorMessages}`);
        } else {
          // Single error message
          const errorMessage = errorData.message || 'Lỗi validation';
          message.error(errorMessage);
        }
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Không thể đổi mật khẩu. Vui lòng thử lại sau.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    if (!notificationSettings) return;

    try {
      setSaving(true);
      await NotificationService.updateNotificationSettings(notificationSettings);
      message.success('Cập nhật cài đặt thông báo thành công');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      message.error('Không thể lưu cài đặt thông báo');
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (
    category: 'types' | 'categories' | 'priorities',
    index: number,
    field: 'enabled',
    value: boolean
  ) => {
    if (!notificationSettings) return;

    const updated = { ...notificationSettings };
    updated[category] = [...updated[category]];
    updated[category][index] = {
      ...updated[category][index],
      [field]: value
    };
    setNotificationSettings(updated);
  };

  const updateNotificationGeneralSetting = (
    category: 'auto_cleanup' | 'real_time',
    field: string,
    value: boolean | number
  ) => {
    if (!notificationSettings) return;

    const updated = { ...notificationSettings };
    if (category === 'auto_cleanup') {
      updated.auto_cleanup = {
        ...updated.auto_cleanup,
        [field]: value
      } as { enabled: boolean; days: number };
    } else if (category === 'real_time') {
      updated.real_time = {
        ...updated.real_time,
        [field]: value
      } as { enabled: boolean; interval: number };
    }
    setNotificationSettings(updated);
  };

  return (
    <Modal
      title={
        <Space>
          <GlobalOutlined />
          <span>Cài đặt</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      className={styles.settingsModal}
    >
      <Tabs defaultActiveKey="password" size="large">
        <TabPane
          tab={
            <span>
              <LockOutlined />
              Đổi mật khẩu
            </span>
          }
          key="password"
        >
          <Card>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              className={styles.passwordForm}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Password placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
                    message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
                  }
                ]}
              >
                <Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                    }
                  })
                ]}
              >
                <Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  block
                >
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BellOutlined />
              Thông báo
            </span>
          }
          key="notifications"
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Đang tải cài đặt...</Text>
            </div>
          ) : notificationSettings ? (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Notification Types */}
              <Card title="Loại thông báo" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {notificationSettings.types.map((type, index) => (
                    <div key={type.value} className={styles.settingItem}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          <div
                            className={styles.colorIndicator}
                            style={{ backgroundColor: type.color }}
                          />
                          <Text>{type.label}</Text>
                        </Space>
                        <Switch
                          checked={type.enabled}
                          onChange={(checked) =>
                            updateNotificationSetting('types', index, 'enabled', checked)
                          }
                        />
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>

              {/* Notification Categories */}
              <Card title="Danh mục thông báo" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {notificationSettings.categories.map((category, index) => (
                    <div key={category.value} className={styles.settingItem}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text>{category.label}</Text>
                        <Switch
                          checked={category.enabled}
                          onChange={(checked) =>
                            updateNotificationSetting('categories', index, 'enabled', checked)
                          }
                        />
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>

              {/* Notification Priorities */}
              <Card title="Mức độ ưu tiên" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {notificationSettings.priorities.map((priority, index) => (
                    <div key={priority.value} className={styles.settingItem}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          <div
                            className={styles.colorIndicator}
                            style={{ backgroundColor: priority.color }}
                          />
                          <Text>{priority.label}</Text>
                        </Space>
                        <Switch
                          checked={priority.enabled}
                          onChange={(checked) =>
                            updateNotificationSetting('priorities', index, 'enabled', checked)
                          }
                        />
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>

              {/* General Settings */}
              <Card title="Cài đặt chung" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div className={styles.settingItem}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>Tự động dọn dẹp thông báo cũ</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Xóa thông báo sau {notificationSettings.auto_cleanup.days} ngày
                        </Text>
                      </div>
                      <Switch
                        checked={notificationSettings.auto_cleanup.enabled}
                        onChange={(checked) =>
                          updateNotificationGeneralSetting('auto_cleanup', 'enabled', checked)
                        }
                      />
                    </Space>
                  </div>

                  <div className={styles.settingItem}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>Thông báo thời gian thực</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Cập nhật mỗi {notificationSettings.real_time.interval} giây
                        </Text>
                      </div>
                      <Switch
                        checked={notificationSettings.real_time.enabled}
                        onChange={(checked) =>
                          updateNotificationGeneralSetting('real_time', 'enabled', checked)
                        }
                      />
                    </Space>
                  </div>
                </Space>
              </Card>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveNotificationSettings}
                loading={saving}
                block
                size="large"
              >
                Lưu cài đặt thông báo
              </Button>
            </Space>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Không thể tải cài đặt thông báo</Text>
            </div>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default SettingsModal;

