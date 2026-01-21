import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Timeline,
  Tag,
  Avatar,
  Row,
  Col,
  message,
  Alert,
  Badge,
  Image
} from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  PictureOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

interface ProgressEntry {
  _id: string;
  action: string;
  note: string;
  performedBy: {
    _id: string;
    full_name: string;
    username: string;
  } | null;
  timestamp: string;
  findingsImages?: string[]; // Hình ảnh minh chứng cho action "Điều tra"
}

interface Incident {
  _id: string;
  incidentId?: string;
  title: string;
  description?: string;
  status?: string;
  assignedTo?: {
    _id?: string;
    full_name?: string;
    username?: string;
    email?: string;
  } | string;
  histories?: ProgressEntry[];
}

const { Title, Text } = Typography;

const ProgressHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncident = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await incidentService.getIncidentById(id);
      // ApiResponse.success() => { success, message, data }
      const incidentData = response.data?.success ? response.data.data : response.data;
      console.log('Incident data:', incidentData);
      console.log('Histories:', incidentData?.histories);
      if (incidentData?.histories) {
        incidentData.histories.forEach((entry: any, index: number) => {
          console.log(`History ${index}:`, {
            action: entry.action,
            findingsImages: entry.findingsImages,
            hasFindingsImages: !!entry.findingsImages,
            findingsImagesLength: entry.findingsImages?.length
          });
        });
      }
      setIncident(incidentData || null);
    } catch (err: any) {
      setError('Không thể tải thông tin sự cố');
      message.error('Không thể tải thông tin sự cố');
      console.error('Error fetching incident:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIncident();
    setRefreshing(false);
    message.success('Đã làm mới dữ liệu');
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);


  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'ghi nhận':
        return 'blue';
      case 'phân loại':
        return 'orange';
      case 'phân công':
        return 'purple';
      case 'điều tra':
        return 'cyan';
      case 'khắc phục':
        return 'green';
      case 'cập nhật tiến độ':
        return 'volcano';
      case 'đóng sự cố':
      case 'đóng':
        return 'red';
      case 'escalate':
      case 'yêu cầu đóng':
        return 'red';
      default:
        return 'default';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'ghi nhận':
        return <ExclamationCircleOutlined />;
      case 'phân loại':
        return <InfoCircleOutlined />;
      case 'phân công':
        return <UserOutlined />;
      case 'điều tra':
        return <InfoCircleOutlined />;
      case 'khắc phục':
        return <CheckCircleOutlined />;
      case 'cập nhật tiến độ':
        return <ClockCircleOutlined />;
      case 'đóng sự cố':
      case 'đóng':
        return <CheckCircleOutlined />;
      case 'escalate':
        return <ArrowUpOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // Format note cho action "Phân công" - hiển thị tên thay vì user ID
  const formatNote = (entry: ProgressEntry) => {
    if (entry.action?.toLowerCase() === 'phân công' && entry.note) {
      // Nếu note chứa "user ID:", thử lấy tên từ incident.assignedTo
      if (entry.note.includes('user ID:') || entry.note.includes('user_id:')) {
        const userIdMatch = entry.note.match(/(?:user ID:|user_id:)\s*([a-f0-9]{24})/i);
        if (userIdMatch && incident?.assignedTo) {
          const assignedToId = typeof incident.assignedTo === 'object' 
            ? incident.assignedTo._id 
            : incident.assignedTo;
          
          // Nếu ID khớp với assignedTo của incident, hiển thị tên
          if (assignedToId && userIdMatch[1] === assignedToId.toString()) {
            const fullName = typeof incident.assignedTo === 'object' 
              ? incident.assignedTo.full_name 
              : null;
            const username = typeof incident.assignedTo === 'object' 
              ? incident.assignedTo.username 
              : null;
            
            if (fullName || username) {
              return `Phân công xử lý cho ${fullName || username}${username && fullName !== username ? ` (${username})` : ''}`;
            }
          }
        }
      }
    }
    return entry.note;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 50%, #f0f2f5 100%)'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1677ff 0%, #1890ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(22, 119, 255, 0.3)',
          marginBottom: 20
        }}>
          <ClockCircleOutlined style={{ color: '#fff', fontSize: 32 }} spin />
        </div>
        <Text type="secondary" style={{ fontSize: 16, marginTop: 16 }}>Đang tải lịch sử tiến độ...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => navigate('/header-department/incident-management')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  if (!incident) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="Không tìm thấy sự cố"
          description="Sự cố không tồn tại hoặc đã bị xóa"
          type="warning"
          showIcon
        />
      </div>
    );
  }

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
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/header-department/incident-management');
              }
            }}
            style={{
              borderRadius: 8,
              height: 36,
              paddingLeft: 16,
              paddingRight: 16
            }}
          >
            Quay lại
          </Button>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
              type="default"
              style={{ borderRadius: 8 }}
            >
              Làm mới
            </Button>
            <Badge 
              count={incident?.histories?.length || 0} 
              style={{ backgroundColor: '#1677ff' }}
              showZero
            />
          </Space>
        </Space>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1677ff 0%, #1890ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)'
          }}>
            <ClockCircleOutlined style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 28 }}>
              Lịch sử tiến độ sự cố
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              <FileTextOutlined style={{ marginRight: 6 }} />
              Mã sự cố: <Text strong style={{ color: '#1677ff' }}>{incident.incidentId || incident._id}</Text>
            </Text>
          </div>
        </div>
      </Card>

      {/* Incident Info */}
      <Card 
        styles={{ body: { padding: 28 } }}
        style={{ 
          marginBottom: '24px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={14}>
            <div style={{ marginBottom: 12 }}>
              <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 600 }}>
                {incident.title}
              </Title>
              {incident.description && (
                <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  {incident.description}
                </Text>
              )}
            </div>
          </Col>
          <Col xs={24} md={10}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ 
                padding: 16, 
                background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%)',
                borderRadius: 12,
                border: '1px solid #d6e4ff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <ClockCircleOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                  <Text strong style={{ fontSize: 13, color: '#595959' }}>Trạng thái</Text>
                </div>
                <Tag 
                  style={{
                    color: '#fff',
                    backgroundColor: incident.status === 'Đã đóng' ? '#52c41a' : '#1677ff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    boxShadow: `0 2px 8px ${incident.status === 'Đã đóng' ? '#52c41a40' : '#1677ff40'}`
                  }}
                >
                  {incident.status || 'Chưa xác định'}
                </Tag>
              </div>
              <div style={{ 
                padding: 16, 
                background: 'linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%)',
                borderRadius: 12,
                border: '1px solid #d9f7be'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <FileTextOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                  <Text strong style={{ fontSize: 13, color: '#595959' }}>Tổng số bước</Text>
                </div>
                <Badge 
                  count={incident.histories?.length || 0} 
                  showZero
                  style={{ 
                    backgroundColor: '#52c41a',
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '4px 8px',
                    minWidth: 32
                  }}
                />
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Progress Timeline */}
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
          marginBottom: 24, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingBottom: 20,
          borderBottom: '2px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(114, 46, 209, 0.25)'
            }}>
              <ClockCircleOutlined style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                {incident.status === 'Đã đóng' ? 'Quy trình giải quyết sự cố' : 'Timeline tiến độ'}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {incident.histories?.length || 0} bước đã thực hiện
              </Text>
            </div>
          </div>
        </div>
        
        {incident.status === 'Đã đóng' && (
          <Alert
            message="Sự cố đã được đóng"
            description="Đây là chế độ xem lại. Bạn chỉ có thể xem quy trình giải quyết sự cố, không thể thêm hoặc chỉnh sửa."
            type="info"
            showIcon
            style={{ 
              marginBottom: 24, 
              borderRadius: 12,
              border: '1px solid #91d5ff',
              background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)'
            }}
          />
        )}

        {incident.histories && incident.histories.length > 0 ? (
          <div style={{ position: 'relative' }}>
            {/* Progress indicator */}
            <div style={{
              position: 'absolute',
              left: 16,
              top: 16,
              bottom: 16,
              width: 3,
              background: 'linear-gradient(180deg, #1677ff 0%, #52c41a 100%)',
              borderRadius: 2,
              opacity: 0.3,
              zIndex: 0
            }} />
            
            <Timeline
              style={{ position: 'relative', zIndex: 1 }}
              items={incident.histories
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((entry, index) => {
                  const isLast = index === incident.histories!.length - 1;
                  const dotColor = getActionColor(entry.action);
                  
                  // Debug log để kiểm tra dữ liệu
                  const isInvestigation = entry.action?.toLowerCase()?.trim() === 'điều tra';
                  if (isInvestigation) {
                    console.log('🔍 Điều tra entry found:', {
                      index,
                      action: entry.action,
                      actionLower: entry.action?.toLowerCase()?.trim(),
                      findingsImages: entry.findingsImages,
                      findingsImagesType: typeof entry.findingsImages,
                      isArray: Array.isArray(entry.findingsImages),
                      length: entry.findingsImages?.length,
                      fullEntry: JSON.stringify(entry, null, 2)
                    });
                  }
                  const getGradientColors = (color: string) => {
                    switch (color) {
                      case 'red': return { from: '#ff4d4f', to: '#ff7875' };
                      case 'blue': return { from: '#1677ff', to: '#1890ff' };
                      case 'green': return { from: '#52c41a', to: '#73d13d' };
                      case 'orange': return { from: '#fa8c16', to: '#ffa940' };
                      case 'purple': return { from: '#722ed1', to: '#9254de' };
                      case 'cyan': return { from: '#13c2c2', to: '#36cfc9' };
                      case 'volcano': return { from: '#ff7875', to: '#ff9c9c' };
                      default: return { from: '#d9d9d9', to: '#e8e8e8' };
                    }
                  };
                  const colors = getGradientColors(dotColor);
                  
                  return {
                    dot: (
                      <div 
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${colors.from}40, 0 0 0 4px rgba(255,255,255,0.8)`,
                          border: '2px solid #fff',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          animation: `fadeInUp 0.5s ease ${index * 0.1}s both`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)';
                          e.currentTarget.style.boxShadow = `0 6px 20px ${colors.from}60, 0 0 0 4px rgba(255,255,255,0.9)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.from}40, 0 0 0 4px rgba(255,255,255,0.8)`;
                        }}
                      >
                        <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                          {getActionIcon(entry.action)}
                        </span>
                        {isLast && (
                          <div style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: '#52c41a',
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(82, 196, 26, 0.4)',
                            animation: 'pulse 2s infinite'
                          }} />
                        )}
                      </div>
                    ),
                    color: dotColor,
                    children: (
                      <Card 
                        size="small" 
                        style={{ 
                          marginBottom: 20,
                          marginLeft: 8,
                          borderRadius: 14,
                          border: 'none',
                          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
                          animation: `fadeInRight 0.5s ease ${index * 0.1}s both`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                          const card = e.currentTarget;
                          const shimmer = document.createElement('div');
                          shimmer.style.cssText = `
                            position: absolute;
                            top: 0;
                            left: -100%;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                            transition: left 0.5s;
                          `;
                          card.appendChild(shimmer);
                          setTimeout(() => {
                            shimmer.style.left = '100%';
                            setTimeout(() => shimmer.remove(), 500);
                          }, 10);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)';
                          e.currentTarget.style.transform = 'translateX(0) scale(1)';
                        }}
                      >
                        {/* Decorative top border */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                          borderRadius: '14px 14px 0 0'
                        }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingTop: 8 }}>
                          <Space size="middle" wrap>
                            {entry.action?.toLowerCase() === 'escalate' ? (
                              <Tag 
                                style={{ 
                                  backgroundColor: '#cf1322', 
                                  color: '#fff', 
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: 8,
                                  fontWeight: 700,
                                  fontSize: 13,
                                  boxShadow: '0 4px 12px rgba(207, 19, 34, 0.4)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}
                              >
                                {entry.action}
                              </Tag>
                            ) : (
                              <Tag 
                                style={{
                                  backgroundColor: colors.from,
                                  color: '#fff',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: 8,
                                  fontWeight: 600,
                                  fontSize: 13,
                                  boxShadow: `0 4px 12px ${colors.from}40`
                                }}
                              >
                                {entry.action}
                              </Tag>
                            )}
                            <Space size="small" style={{ 
                              padding: '6px 14px',
                              background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
                              borderRadius: 8,
                              border: '1px solid #e8e8e8'
                            }}>
                              <CalendarOutlined style={{ color: '#1677ff', fontSize: 13 }} />
                              <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
                                {new Date(entry.timestamp).toLocaleString('vi-VN')}
                              </Text>
                            </Space>
                          </Space>
                          <Space size="small" style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%)',
                            borderRadius: 8,
                            border: '1px solid #d6e4ff'
                          }}>
                            <Avatar 
                              size="small" 
                              icon={<UserOutlined />} 
                              style={{ 
                                backgroundColor: '#1677ff',
                                boxShadow: '0 2px 6px rgba(22, 119, 255, 0.3)'
                              }} 
                            />
                            <Text strong style={{ fontSize: 13, color: '#262626' }}>
                              {entry.performedBy?.full_name || entry.performedBy?.username || 'Người dùng không xác định'}
                            </Text>
                          </Space>
                        </div>
                        {entry.note && (
                          <div style={{ 
                            padding: 14,
                            background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                            borderRadius: 10,
                            borderLeft: `4px solid ${colors.from}`,
                            marginTop: 12,
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: 10,
                              left: 10,
                              width: 3,
                              height: 'calc(100% - 20px)',
                              background: `linear-gradient(180deg, ${colors.from}40, ${colors.to}40)`,
                              borderRadius: 2
                            }} />
                            <Text style={{ fontSize: 14, color: '#595959', lineHeight: 1.7, paddingLeft: 8 }}>
                              {formatNote(entry)}
                            </Text>
                          </div>
                        )}
                        {entry.action?.toLowerCase()?.trim() === 'điều tra' && entry.findingsImages && Array.isArray(entry.findingsImages) && entry.findingsImages.length > 0 && (
                          <div style={{ 
                            marginTop: 12,
                            padding: 14,
                            background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%)',
                            borderRadius: 10,
                            border: '1px solid #d6e4ff'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                              <PictureOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                              <Text strong style={{ fontSize: 14, color: '#1677ff' }}>
                                Hình ảnh minh chứng điều tra ({entry.findingsImages.length})
                              </Text>
                            </div>
                            <Image.PreviewGroup>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: 16
                              }}>
                                {entry.findingsImages.map((image, imgIndex) => {
                                  // Validate và format base64 string
                                  let imageSrc = image;
                                  if (image && typeof image === 'string') {
                                    // Kiểm tra xem đã có prefix data: chưa
                                    if (image.startsWith('data:image')) {
                                      // Đã có prefix, sử dụng trực tiếp
                                      imageSrc = image;
                                    } else if (image.startsWith('data:')) {
                                      // Có prefix data: nhưng không phải image, thử thêm image/jpeg
                                      imageSrc = `data:image/jpeg;base64,${image.split(',')[1] || image}`;
                                    } else {
                                      // Không có prefix, thêm prefix data:image/jpeg;base64,
                                      // Loại bỏ khoảng trắng và ký tự xuống dòng
                                      const cleanBase64 = image.trim().replace(/\s+/g, '');
                                      imageSrc = `data:image/jpeg;base64,${cleanBase64}`;
                                    }
                                  }
                                  
                                  return (
                                    <div
                                      key={imgIndex}
                                      style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '16/9',
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: '2px solid #d6e4ff',
                                        transition: 'all 0.3s ease',
                                        background: '#fff'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#1677ff';
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.3)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#d6e4ff';
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                      }}
                                    >
                                      <Image
                                        src={imageSrc}
                                        alt={`Minh chứng ${imgIndex + 1}`}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          objectPosition: 'center center',
                                          display: 'block'
                                        }}
                                        preview={{
                                          mask: 'Phóng to'
                                        }}
                                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ELỗi%3C/text%3E%3C/svg%3E"
                                        onError={(e) => {
                                          console.error(`❌ Error loading image ${imgIndex + 1}:`, {
                                            src: imageSrc?.substring(0, 100),
                                            originalImage: image?.substring(0, 100),
                                            error: e,
                                            imageSrcType: typeof imageSrc,
                                            imageSrcLength: imageSrc?.length
                                          });
                                        }}
                                        onLoad={() => {
                                          console.log(`✅ Image ${imgIndex + 1} loaded successfully`, {
                                            srcPreview: imageSrc?.substring(0, 100)
                                          });
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </Image.PreviewGroup>
                          </div>
                        )}
                      </Card>
                    ),
                  };
                })}
            />
            
            {/* Add keyframes for animations */}
            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes fadeInRight {
                from {
                  opacity: 0;
                  transform: translateX(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                  transform: scale(1);
                }
                50% {
                  opacity: 0.8;
                  transform: scale(1.1);
                }
              }
            `}</style>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 40px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated background circles */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(22, 119, 255, 0.1) 0%, transparent 70%)',
              animation: 'pulse 3s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(22, 119, 255, 0.05) 0%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite 0.5s'
            }} />
            
            <div style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #1677ff 0%, #1890ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(22, 119, 255, 0.3)',
              position: 'relative',
              zIndex: 1,
              animation: 'fadeInUp 0.6s ease'
            }}>
              <ClockCircleOutlined style={{ fontSize: 48, color: '#fff' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Text type="secondary" style={{ fontSize: 16, fontWeight: 500 }}>
                Chưa có lịch sử tiến độ nào
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Bắt đầu theo dõi tiến độ xử lý sự cố bằng cách thêm bước đầu tiên
                </Text>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProgressHistory;