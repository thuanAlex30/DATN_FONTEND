import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Form,
  Input,
  Select,
  message,
  Alert,
  Row,
  Col,
  Divider,
  Avatar,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';
import userService from '../../../services/userService';

const { Title, Text } = Typography;

const AssignIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [incident, setIncident] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch incident info
      if (id) {
        try {
          const response = await incidentService.getIncidentById(id);
          const incidentData = response.data?.success ? response.data.data : response.data;
          setIncident(incidentData || null);
        } catch (err) {
          console.error('Error fetching incident:', err);
        }
      }

      // Fetch users
      try {
        const allUsers = await userService.getAllUsers();
        
        // Department Header chỉ được phân công cho Manager
        // Filter: chỉ hiển thị users có role là Manager
        const filteredUsers = allUsers.filter((user: any) => {
          const roleCode = user.role?.role_code?.toLowerCase();
          const roleName = user.role?.role_name?.toLowerCase();
          const userRoleLevel = user.role?.role_level;
          
          // Kiểm tra role_code trước
          if (roleCode) {
            return roleCode === 'manager';
          }
          
          // Nếu không có role_code, kiểm tra role_name
          if (roleName) {
            return roleName.includes('manager') || roleName === 'department manager';
          }
          
          // Nếu không có role_code và role_name, kiểm tra role_level (Manager: 70)
          if (userRoleLevel !== undefined && userRoleLevel !== null) {
            return userRoleLevel === 70;
          }
          
          return false;
        });
        
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    
    // Prevent double submit
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      await incidentService.assignIncident(id, { assignedTo: values.assignedTo });
      message.success('Phân công thành công');
      navigate('/header-department/incident-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể phân công';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 50%, #f0f2f5 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Card
        styles={{ body: { padding: '24px 28px' } }}
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}
      >
        <Space style={{ marginBottom: '20px', width: '100%', justifyContent: 'space-between' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{
              borderRadius: 8,
              height: 36,
              paddingLeft: 16,
              paddingRight: 16
            }}
          >
            Quay lại
          </Button>
          {incident && (
            <Badge 
              count={incident.status === 'Mới ghi nhận' ? 'Chưa phân công' : 0} 
              style={{ backgroundColor: '#fa8c16' }}
            />
          )}
        </Space>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)'
          }}>
            <TeamOutlined style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 28 }}>
              Phân công người phụ trách
            </Title>
            {incident && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                <FileTextOutlined style={{ marginRight: 6 }} />
                Mã sự cố: <Text strong style={{ color: '#1677ff' }}>{incident.incidentId || incident._id}</Text>
              </Text>
            )}
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Incident Info */}
        {incident && (
          <Col xs={24} lg={10}>
            <Card
              styles={{ body: { padding: 28 } }}
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                height: '100%'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                marginBottom: 24,
                paddingBottom: 20,
                borderBottom: '2px solid #f0f0f0'
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #1677ff 0%, #1890ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(22, 119, 255, 0.25)'
                }}>
                  <FileTextOutlined style={{ color: '#fff', fontSize: 22 }} />
                </div>
                <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                  Thông tin sự cố
                </Title>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16, color: '#262626', display: 'block', marginBottom: 8 }}>
                  {incident.title}
                </Text>
                {incident.description && (
                  <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    {incident.description}
                  </Text>
                )}
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {incident.location && (
                  <div style={{ 
                    padding: 12, 
                    background: '#f5f5f5',
                    borderRadius: 8
                  }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      Vị trí
                    </Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {incident.location}
                    </Text>
                  </div>
                )}
                
                {incident.severity && (
                  <div style={{ 
                    padding: 12, 
                    background: '#fff7e6',
                    borderRadius: 8,
                    border: '1px solid #ffe7ba'
                  }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      Mức độ
                    </Text>
                    <Text strong style={{ fontSize: 14, color: '#fa8c16' }}>
                      {incident.severity}
                    </Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        )}

        {/* Assignment Form */}
        <Col xs={24} lg={incident ? 14 : 24}>
          <Card
            styles={{ body: { padding: 28 } }}
            style={{ 
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 28,
              paddingBottom: 20,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.25)'
              }}>
                <UserOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                  Chọn người phụ trách
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Phân công sự cố cho Manager hoặc Employee để xử lý
                </Text>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Form.Item
                name="assignedTo"
                label={
                  <Space>
                    <TeamOutlined style={{ color: '#1677ff' }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>Người phụ trách</Text>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
                style={{ marginBottom: 24 }}
              >
                <Select
                  placeholder="Chọn người phụ trách..."
                  showSearch
                  size="large"
                  optionLabelProp="label"
                  filterOption={(input, option) => {
                    const searchText = input.toLowerCase();
                    const userId = option?.value;
                    const user = users.find(u => (u.id || u._id) === userId);
                    if (user) {
                      const fullSearch = `${user.full_name} ${user.username} ${user.role?.role_name || ''}`.toLowerCase();
                      return fullSearch.includes(searchText);
                    }
                    return false;
                  }}
                  style={{
                    borderRadius: 8,
                    fontSize: 14
                  }}
                  dropdownStyle={{
                    borderRadius: 8
                  }}
                >
                  {users.map(user => {
                    const userId = user.id || user._id;
                    const displayLabel = `${user.full_name} (${user.username})`;
                    return (
                      <Select.Option 
                        key={userId} 
                        value={userId}
                        label={displayLabel}
                      >
                        <Space>
                          <Avatar 
                            size="small" 
                            icon={<UserOutlined />} 
                            style={{ backgroundColor: '#1677ff' }} 
                          />
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {user.full_name}
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                              {user.username} • {user.role?.role_name || 'N/A'}
                            </div>
                          </div>
                        </Space>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Divider style={{ margin: '24px 0' }} />

              <Form.Item
                name="note"
                label={
                  <Space>
                    <FileTextOutlined style={{ color: '#1677ff' }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>Ghi chú</Text>
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                <Input.TextArea 
                  rows={5} 
                  placeholder="Nhập ghi chú về việc phân công, hướng dẫn xử lý, hoặc lưu ý đặc biệt..." 
                  style={{
                    borderRadius: 8,
                    fontSize: 14,
                    padding: '12px 16px',
                    border: '1px solid #d9d9d9',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1677ff';
                    e.target.style.boxShadow = '0 0 0 2px rgba(22, 119, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d9d9d9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Item>

              {error && (
                <Alert
                  message="Lỗi"
                  description={error}
                  type="error"
                  showIcon
                  style={{ 
                    marginBottom: 24,
                    borderRadius: 8,
                    border: '1px solid #ffccc7'
                  }}
                />
              )}

              <Divider style={{ margin: '28px 0 24px 0' }} />

              <Form.Item style={{ marginBottom: 0 }}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }} size="middle">
                  <Button 
                    onClick={() => navigate(-1)}
                    size="large"
                    style={{
                      borderRadius: 8,
                      height: 44,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 15,
                      fontWeight: 500
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<CheckCircleOutlined />}
                    size="large"
                    style={{
                      borderRadius: 8,
                      height: 44,
                      paddingLeft: 32,
                      paddingRight: 32,
                      fontSize: 15,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(114, 46, 209, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(114, 46, 209, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Phân công
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssignIncident;
