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
  Badge,
  List,
  Tag,
  Image,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';
import userService from '../../../services/userService';
import { LocationConflictError, ActiveIncidentError } from '../../../types/incident';

const { Title, Text } = Typography;

const AssignIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<LocationConflictError | null>(null);
  const [activeIncidentData, setActiveIncidentData] = useState<ActiveIncidentError | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [userStatusMap, setUserStatusMap] = useState<Record<string, { hasActiveIncident: boolean; activeIncident?: any }>>({});
  const [form] = Form.useForm();
  const [incident, setIncident] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

        // Fetch active incidents cho mỗi manager
        const statusMap: Record<string, { hasActiveIncident: boolean; activeIncident?: any }> = {};
        
        await Promise.all(
          filteredUsers.map(async (user: any) => {
            const userId = user.id || user._id;
            try {
              // Lấy incidents được phân công cho manager này
              const res = await incidentService.getIncidents(undefined, userId);
              const incidentsData = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
              
              // Kiểm tra xem có incident nào đang xử lý không
              const activeIncident = incidentsData.find((inc: any) => inc.status === 'Đang xử lý');
              
              statusMap[userId] = {
                hasActiveIncident: !!activeIncident,
                activeIncident: activeIncident || undefined
              };
            } catch (err) {
              console.error(`Error checking status for user ${userId}:`, err);
              statusMap[userId] = {
                hasActiveIncident: false
              };
            }
          })
        );
        
        setUserStatusMap(statusMap);
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
      setConflictData(null);
      
      // Prepare assign data
      const assignData: { assignedTo: string } = {
        assignedTo: values.assignedTo
      };
      
      await incidentService.assignIncident(id, assignData);
      message.success('Phân công thành công');
      navigate('/header-department/incident-management');
    } catch (err: any) {
      const errorResponse = err?.response?.data;
      const errorMessage = errorResponse?.message || 'Không thể phân công';
      
      // Reset previous error states
      setConflictData(null);
      setActiveIncidentData(null);
      
      // Check if this is an active incident error (new rule: 1 manager chỉ được xử lý 1 sự cố)
      if (errorResponse?.data?.hasActiveIncident) {
        setActiveIncidentData(errorResponse.data);
        setError(`❌ ${errorMessage}`);
      } 
      // Check if this is a location conflict error (backward compatibility)
      else if (errorResponse?.data?.hasConflict) {
        setConflictData(errorResponse.data);
        setError(`❌ ${errorMessage}`);
      } 
      else {
        setError(errorMessage);
      }
      
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

              {/* Hình ảnh đính kèm */}
              {incident.images && incident.images.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '2px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <EyeOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>Hình ảnh đính kèm</Text>
                    <Badge count={incident.images.length} style={{ backgroundColor: '#1677ff' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {incident.images.slice(0, 6).map((src: string, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(src)}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px solid #e8e8e8',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#1677ff';
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e8e8e8';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <img
                          src={src}
                          alt={`incident-img-${idx}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          loading="lazy"
                        />
                      </div>
                    ))}
                    {incident.images.length > 6 && (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          border: '2px dashed #d9d9d9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fafafa',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setPreviewImage(incident.images[6])}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#1677ff';
                          e.currentTarget.style.background = '#f0f7ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#d9d9d9';
                          e.currentTarget.style.background = '#fafafa';
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                          +{incident.images.length - 6}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                style={{ marginBottom: 20 }}
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
                    const userStatus = userStatusMap[userId];
                    const hasActiveIncident = userStatus?.hasActiveIncident || false;
                    const activeIncident = userStatus?.activeIncident;
                    const incidentInfo = hasActiveIncident && activeIncident 
                      ? ` - Đang xử lý: ${activeIncident.incidentId || activeIncident.title || 'N/A'}`
                      : '';
                    
                    return (
                      <Select.Option 
                        key={userId} 
                        value={userId}
                        label={displayLabel}
                        disabled={hasActiveIncident}
                        title={hasActiveIncident ? `Đang xử lý sự cố: ${activeIncident?.incidentId || activeIncident?.title || 'N/A'}` : 'Sẵn sàng nhận sự cố mới'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Space>
                            <Avatar 
                              size="small" 
                              icon={<UserOutlined />} 
                              style={{ 
                                backgroundColor: hasActiveIncident ? '#d9d9d9' : '#1677ff' 
                              }} 
                            />
                            <div>
                              <div style={{ 
                                fontWeight: 500,
                                color: hasActiveIncident ? '#bfbfbf' : '#262626'
                              }}>
                                {user.full_name}
                              </div>
                              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                {user.username} • {user.role?.role_name || 'N/A'}
                                {incidentInfo && (
                                  <span style={{ color: '#fa8c16', marginLeft: 4 }}>
                                    {incidentInfo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Space>
                          {hasActiveIncident ? (
                            <Tag color="red" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
                              Đang xử lý sự cố
                            </Tag>
                          ) : (
                            <Tag color="green" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
                              Sẵn sàng
                            </Tag>
                          )}
                        </div>
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
                  message="Không thể phân công sự cố"
                  description={
                    <div>
                      <Text>{error}</Text>
                      
                      {/* Active Incident Error (New Rule: 1 manager chỉ được xử lý 1 sự cố) */}
                      {activeIncidentData?.activeIncident && (
                        <div style={{ marginTop: 16 }}>
                          <Text strong style={{ display: 'block', marginBottom: 8, color: '#ff4d4f' }}>
                            <WarningOutlined /> Sự cố đang được xử lý:
                          </Text>
                          <div
                            style={{
                              padding: '12px 16px',
                              border: '1px solid #ffccc7',
                              borderRadius: 8,
                              background: '#fff1f0'
                            }}
                          >
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                              <Space>
                                <Tag color="red">#{activeIncidentData.activeIncident.incidentId || activeIncidentData.activeIncident._id.slice(-6)}</Tag>
                                <Text strong style={{ fontSize: 14 }}>{activeIncidentData.activeIncident.title}</Text>
                              </Space>
                              <Space wrap>
                                {activeIncidentData.activeIncident.location && (
                                  <Space>
                                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                      Địa điểm: <Text strong>{activeIncidentData.activeIncident.location}</Text>
                                    </Text>
                                  </Space>
                                )}
                                <Tag color="processing">{activeIncidentData.activeIncident.status}</Tag>
                                {activeIncidentData.activeIncident.actualStartTime && (
                                  <Space>
                                    <ClockCircleOutlined />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      Bắt đầu: {new Date(activeIncidentData.activeIncident.actualStartTime).toLocaleString('vi-VN')}
                                    </Text>
                                  </Space>
                                )}
                              </Space>
                            </Space>
                          </div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
                            💡 <Text strong>Lưu ý:</Text> Một người chỉ được quyền xử lý 1 sự cố tại một thời điểm. Vui lòng đợi sự cố hiện tại được đóng trước khi phân công sự cố mới cho người này.
                          </Text>
                        </div>
                      )}

                      {/* Location Conflict Error (Backward Compatibility) */}
                      {conflictData?.conflictingIncidents && conflictData.conflictingIncidents.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <Text strong style={{ display: 'block', marginBottom: 8, color: '#ff4d4f' }}>
                            <WarningOutlined /> Các sự cố đang conflict:
                          </Text>
                          <List
                            size="small"
                            dataSource={conflictData.conflictingIncidents}
                            renderItem={(conflictIncident) => (
                              <List.Item
                                style={{
                                  padding: '8px 12px',
                                  border: '1px solid #ffccc7',
                                  borderRadius: 6,
                                  marginBottom: 8,
                                  background: '#fff1f0'
                                }}
                              >
                                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                  <Space>
                                    <Tag color="red">#{conflictIncident.incidentId || conflictIncident._id.slice(-6)}</Tag>
                                    <Text strong>{conflictIncident.title}</Text>
                                  </Space>
                                  <Space>
                                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      Địa điểm: <Text strong>{conflictIncident.location}</Text>
                                    </Text>
                                    <Tag color="blue">{conflictIncident.status}</Tag>
                                  </Space>
                                </Space>
                              </List.Item>
                            )}
                          />
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                            💡 <Text strong>Gợi ý:</Text> Vui lòng hoàn thành hoặc hủy phân công các sự cố trên trước khi phân công sự cố mới cho người này.
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
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

      {/* Image Preview Modal */}
      <Modal
        open={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage(null)}
        centered
        width="auto"
        style={{ maxWidth: '90vw' }}
      >
        {previewImage && (
          <Image
            src={previewImage}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default AssignIncident;
