import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Tabs,
  Statistic,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Spin,
  Empty,
  Space,
  Typography,
  Descriptions,
  Tag,
  Tooltip
} from 'antd';
import {
  SafetyOutlined,
  ReloadOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  BarcodeOutlined,
  NumberOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  ToolOutlined
} from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import type { PPEIssuance } from '../../../services/ppeService';
import { EmployeeLayout } from '../../../components/Employee';
import dayjs from 'dayjs';
import { usePPEWebSocket } from '../../../hooks/usePPEWebSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const EmployeePPE: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('current');
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]);
  const [loading, setLoading] = useState(false);
  
  // WebSocket hook for realtime updates
  const { isConnected } = usePPEWebSocket({
    userId: user?.id,
    token: token || '',
    showNotifications: false, // Disable notifications here since WebSocketProvider handles them
    onPPEDistributed: (data) => {
      console.log('PPE distributed to me:', data);
      // Reload data when PPE is distributed to me
      loadUserPPE();
    },
    onPPEReturned: (data) => {
      console.log('PPE returned:', data);
      // Reload data when PPE is returned
      loadUserPPE();
    },
    onPPEReported: (data) => {
      console.log('PPE reported:', data);
      // Reload data when PPE issue is reported
      loadUserPPE();
    },
    onPPEOverdue: (data) => {
      console.log('PPE overdue:', data);
      // Show overdue notification
      message.warning(`PPE quá hạn: ${data.item_name}`);
    }
  });
  
  // Modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<PPEIssuance | null>(null);
  
  // Form states
  const [returnForm] = Form.useForm();
  const [reportForm] = Form.useForm();

  useEffect(() => {
    loadUserPPE();
  }, []);

  const loadUserPPE = async () => {
    setLoading(true);
    try {
      const data = await ppeService.getMyPPEIssuances();
      setPpeIssuances(data);
    } catch (err) {
      console.error('Error loading user PPE:', err);
      message.error('Không thể tải danh sách PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnPPE = async (values: any) => {
    if (!selectedIssuance) return;
    
    setLoading(true);
    try {
      await ppeService.returnPPEIssuanceEmployee(selectedIssuance.id, {
        actual_return_date: values.actual_return_date.format('YYYY-MM-DD'),
        return_condition: values.return_condition,
        notes: values.notes || ''
      });
      
      await loadUserPPE(); // Reload data
      setShowReturnModal(false);
      setSelectedIssuance(null);
      returnForm.resetFields();
      message.success('Trả PPE thành công!');
    } catch (err: any) {
      console.error('Error returning PPE:', err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi trả PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleReportPPE = async (values: any) => {
    if (!selectedIssuance) return;
    
    setLoading(true);
    try {
      await ppeService.reportPPEIssuanceEmployee(selectedIssuance.id, {
        report_type: values.report_type,
        description: values.description,
        severity: values.severity,
        reported_date: values.reported_date.format('YYYY-MM-DD')
      });
      
      await loadUserPPE(); // Reload data
      setShowReportModal(false);
      setSelectedIssuance(null);
      reportForm.resetFields();
      message.success('Báo cáo sự cố thành công!');
    } catch (err: any) {
      console.error('Error reporting PPE:', err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi báo cáo sự cố');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      'issued': 'Đang sử dụng',
      'returned': 'Đã trả',
      'overdue': 'Quá hạn',
      'damaged': 'Hư hại',
      'replacement_needed': 'Cần thay thế'
    };
    return labels[status] || 'Không xác định';
  };


  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  const isOverdue = (expectedReturnDate: string): boolean => {
    return new Date(expectedReturnDate) < new Date();
  };

  const getActiveIssuances = () => {
    return ppeIssuances.filter(issuance => 
      issuance.status === 'issued' || 
      issuance.status === 'overdue' ||
      issuance.status === 'damaged' ||
      issuance.status === 'replacement_needed'
    );
  };

  const getReturnedIssuances = () => {
    return ppeIssuances.filter(issuance => issuance.status === 'returned');
  };

  const handleViewDetail = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    setShowDetailModal(true);
  };

  const handleReturnClick = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    returnForm.setFieldsValue({
      actual_return_date: dayjs(),
      return_condition: 'good',
      notes: ''
    });
    setShowReturnModal(true);
  };

  const handleReportClick = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    reportForm.setFieldsValue({
      report_type: 'damage',
      description: '',
      severity: 'medium',
      reported_date: dayjs()
    });
    setShowReportModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'issued': 'blue',
      'returned': 'green',
      'overdue': 'red',
      'damaged': 'orange',
      'replacement_needed': 'purple'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'issued': <CheckCircleOutlined />,
      'returned': <UndoOutlined />,
      'overdue': <ExclamationCircleOutlined />,
      'damaged': <WarningOutlined />,
      'replacement_needed': <ToolOutlined />
    };
    return icons[status] || <InfoCircleOutlined />;
  };

  return (
    <EmployeeLayout
      title="Quản lý PPE cá nhân"
      icon={<SafetyOutlined />}
      headerExtra={
        <Space>
          <Badge 
            status={isConnected ? 'success' : 'error'} 
            text={isConnected ? 'Realtime' : 'Offline'}
          />
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={loadUserPPE}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      }
    >
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang sử dụng"
              value={getActiveIssuances().length}
              prefix={<SafetyOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã trả"
              value={getReturnedIssuances().length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={ppeIssuances.filter(issuance => 
                issuance.status === 'overdue' || 
                isOverdue(issuance.expected_return_date)
              ).length}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng PPE"
              value={ppeIssuances.length}
              prefix={<InboxOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <SafetyOutlined />
                PPE hiện tại
              </span>
            } 
            key="current"
          >
            <div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {getActiveIssuances().map(issuance => {
                  const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                    issuance.item_id : null;
                  const isOverdueItem = isOverdue(issuance.expected_return_date);
                  
                  return (
                    <Col xs={24} sm={12} lg={8} key={issuance.id}>
                      <Card
                        hoverable
                        title={
                          <Space>
                            <SafetyOutlined style={{ color: '#1890ff' }} />
                            <span style={{ fontWeight: 'bold' }}>
                              {item?.item_name || 'Không xác định'}
                            </span>
                          </Space>
                        }
                        extra={
                          <Tag 
                            color={getStatusColor(issuance.status)} 
                            icon={getStatusIcon(issuance.status)}
                          >
                            {getStatusLabel(issuance.status)}
                          </Tag>
                        }
                        actions={[
                          <Tooltip title="Xem chi tiết">
                            <Button 
                              type="text"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewDetail(issuance)}
                            />
                          </Tooltip>,
                          <Tooltip title="Trả PPE">
                            <Button 
                              type="primary"
                              icon={<UndoOutlined />}
                              onClick={() => handleReturnClick(issuance)}
                            />
                          </Tooltip>,
                          <Tooltip title="Báo cáo sự cố">
                            <Button 
                              type="primary"
                              danger
                              icon={<ExclamationCircleOutlined />}
                              onClick={() => handleReportClick(issuance)}
                            />
                          </Tooltip>
                        ]}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <BarcodeOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Text strong>Mã: </Text>
                            <Text>{item?.item_code || 'N/A'}</Text>
                          </div>
                          <div>
                            <NumberOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Text strong>Số lượng: </Text>
                            <Badge count={issuance.quantity} style={{ backgroundColor: '#52c41a' }} />
                          </div>
                          <div>
                            <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Text strong>Ngày phát: </Text>
                            <Text>{formatDateTime(issuance.issued_date)}</Text>
                          </div>
                          <div>
                            <ClockCircleOutlined style={{ 
                              marginRight: '8px', 
                              color: isOverdueItem ? '#ff4d4f' : '#1890ff' 
                            }} />
                            <Text strong>Hạn trả: </Text>
                            <Text style={{ color: isOverdueItem ? '#ff4d4f' : 'inherit' }}>
                              {formatDateTime(issuance.expected_return_date)}
                            </Text>
                            {isOverdueItem && (
                              <Tag color="red" style={{ marginLeft: '8px' }}>
                                QUÁ HẠN
                              </Tag>
                            )}
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
                
                {getActiveIssuances().length === 0 && (
                  <Col span={24}>
                    <Empty
                      image={<InboxOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                      description={
                        <div>
                          <Title level={4} style={{ color: '#8c8c8c' }}>Chưa có PPE</Title>
                          <Text type="secondary">Bạn chưa được phát PPE nào</Text>
                        </div>
                      }
                    />
                  </Col>
                )}
              </Row>
            )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                  Lịch sử PPE
                </span>
              } 
              key="history"
            >
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : (
                  <Row gutter={[16, 16]}>
                    {getReturnedIssuances().map(issuance => {
                      const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                        issuance.item_id : null;
                      
                      return (
                        <Col xs={24} sm={12} lg={8} key={issuance.id}>
                          <Card
                            hoverable
                            title={
                              <Space>
                                <SafetyOutlined style={{ color: '#52c41a' }} />
                                <span style={{ fontWeight: 'bold' }}>
                                  {item?.item_name || 'Không xác định'}
                                </span>
                              </Space>
                            }
                            extra={
                              <Tag 
                                color="green" 
                                icon={<CheckCircleOutlined />}
                              >
                                Đã trả
                              </Tag>
                            }
                            actions={[
                              <Tooltip title="Xem chi tiết">
                                <Button 
                                  type="text"
                                  icon={<EyeOutlined />}
                                  onClick={() => handleViewDetail(issuance)}
                                />
                              </Tooltip>
                            ]}
                          >
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <div>
                                <BarcodeOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Mã: </Text>
                                <Text>{item?.item_code || 'N/A'}</Text>
                              </div>
                              <div>
                                <NumberOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Số lượng: </Text>
                                <Badge count={issuance.quantity} style={{ backgroundColor: '#52c41a' }} />
                              </div>
                              <div>
                                <CalendarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Ngày phát: </Text>
                                <Text>{formatDateTime(issuance.issued_date)}</Text>
                              </div>
                              <div>
                                <ClockCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Ngày trả: </Text>
                                <Text>{issuance.actual_return_date ? formatDateTime(issuance.actual_return_date) : 'Chưa có'}</Text>
                              </div>
                              {issuance.return_condition && (
                                <div>
                                  <CheckCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                  <Text strong>Tình trạng: </Text>
                                  <Tag color={
                                    issuance.return_condition === 'good' ? 'green' :
                                    issuance.return_condition === 'damaged' ? 'orange' : 'red'
                                  }>
                                    {issuance.return_condition === 'good' ? 'Tốt' :
                                     issuance.return_condition === 'damaged' ? 'Hư hỏng' : 'Mòn'}
                                  </Tag>
                                </div>
                              )}
                            </Space>
                          </Card>
                        </Col>
                      );
                    })}
                    
                    {getReturnedIssuances().length === 0 && (
                      <Col span={24}>
                        <Empty
                          image={<HistoryOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                          description={
                            <div>
                              <Title level={4} style={{ color: '#8c8c8c' }}>Chưa có lịch sử</Title>
                              <Text type="secondary">Bạn chưa trả PPE nào</Text>
                            </div>
                          }
                        />
                      </Col>
                    )}
                  </Row>
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <UndoOutlined />
                  Trả PPE
                </span>
              } 
              key="return"
            >
              <div>
                <Title level={3} style={{ marginBottom: '8px' }}>Trả PPE</Title>
                <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
                  Chọn PPE cần trả và điền thông tin trả
                </Text>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : (
                  <Row gutter={[16, 16]}>
                    {getActiveIssuances().map(issuance => {
                      const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                        issuance.item_id : null;
                      
                      return (
                        <Col xs={24} sm={12} lg={8} key={issuance.id}>
                          <Card
                            title={
                              <Space>
                                <SafetyOutlined style={{ color: '#f39c12' }} />
                                {item?.item_name || 'Không xác định'}
                              </Space>
                            }
                            extra={
                              <Badge status="warning" text="Có thể trả" />
                            }
                            actions={[
                              <Button 
                                type="primary"
                                size="small"
                                icon={<UndoOutlined />}
                                onClick={() => {
                                  setSelectedIssuance(issuance);
                                  setShowReturnModal(true);
                                }}
                              >
                                Trả PPE này
                              </Button>
                            ]}
                          >
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <div>
                                <BarcodeOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                                <Text>{item?.item_code || 'N/A'}</Text>
                              </div>
                              <div>
                                <NumberOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                                <Text>Số lượng: {issuance.quantity}</Text>
                              </div>
                              <div>
                                <ClockCircleOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                                <Text>Hạn trả: {formatDateTime(issuance.expected_return_date)}</Text>
                              </div>
                            </Space>
                          </Card>
                        </Col>
                      );
                    })}
                    
                    {getActiveIssuances().length === 0 && (
                      <Col span={24}>
                        <Empty
                          image={<InboxOutlined style={{ fontSize: '48px', color: '#bdc3c7' }} />}
                          description={
                            <div>
                              <Title level={4}>Không có PPE để trả</Title>
                              <Text>Bạn không có PPE nào đang sử dụng</Text>
                            </div>
                          }
                        />
                      </Col>
                    )}
                  </Row>
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <ExclamationCircleOutlined />
                  Báo cáo
                </span>
              } 
              key="report"
            >
              <div>
                <Title level={3} style={{ marginBottom: '8px' }}>Báo cáo PPE</Title>
                <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
                  Báo cáo hư hại hoặc cần thay thế PPE
                </Text>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : (
                  <Row gutter={[16, 16]}>
                    {getActiveIssuances().map(issuance => {
                      const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                        issuance.item_id : null;
                      
                      return (
                        <Col xs={24} sm={12} lg={8} key={issuance.id}>
                          <Card
                            title={
                              <Space>
                                <SafetyOutlined style={{ color: '#e74c3c' }} />
                                {item?.item_name || 'Không xác định'}
                              </Space>
                            }
                            extra={
                              <Badge status="error" text="Cần báo cáo" />
                            }
                            actions={[
                              <Button 
                                type="primary"
                                danger
                                size="small"
                                icon={<ExclamationCircleOutlined />}
                                onClick={() => {
                                  setSelectedIssuance(issuance);
                                  setShowReportModal(true);
                                }}
                              >
                                Báo cáo vấn đề
                              </Button>
                            ]}
                          >
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <div>
                                <BarcodeOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                                <Text>{item?.item_code || 'N/A'}</Text>
                              </div>
                              <div>
                                <NumberOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                                <Text>Số lượng: {issuance.quantity}</Text>
                              </div>
                              <div>
                                <ClockCircleOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                                <Text>Hạn trả: {formatDateTime(issuance.expected_return_date)}</Text>
                              </div>
                            </Space>
                          </Card>
                        </Col>
                      );
                    })}
                    
                    {getActiveIssuances().length === 0 && (
                      <Col span={24}>
                        <Empty
                          image={<InboxOutlined style={{ fontSize: '48px', color: '#bdc3c7' }} />}
                          description={
                            <div>
                              <Title level={4}>Không có PPE để báo cáo</Title>
                              <Text>Bạn không có PPE nào đang sử dụng</Text>
                            </div>
                          }
                        />
                      </Col>
                    )}
                  </Row>
                )}
              </div>
            </TabPane>
          </Tabs>
        </Card>

      {/* Return PPE Modal */}
      <Modal
        title="Trả PPE"
        open={showReturnModal}
        onCancel={() => setShowReturnModal(false)}
        footer={null}
        width={500}
      >
        <Form
          form={returnForm}
          layout="vertical"
          onFinish={handleReturnPPE}
        >
          <Form.Item label="Thiết bị">
            <Input
              value={typeof selectedIssuance?.item_id === 'object' && selectedIssuance?.item_id ? 
                selectedIssuance.item_id.item_name : 'Không xác định'}
              disabled
            />
          </Form.Item>
          
          <Form.Item 
            label="Ngày trả" 
            name="actual_return_date"
            rules={[{ required: true, message: 'Vui lòng chọn ngày trả' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            label="Tình trạng khi trả" 
            name="return_condition"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
          >
            <Select>
              <Option value="good">Tốt</Option>
              <Option value="damaged">Hư hại</Option>
              <Option value="worn">Mòn</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Ghi chú" name="notes">
            <TextArea
              placeholder="Ghi chú về tình trạng PPE khi trả..."
              rows={4}
            />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowReturnModal(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {loading ? 'Đang trả...' : 'Trả PPE'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Report PPE Modal */}
      <Modal
        title="Báo cáo PPE"
        open={showReportModal}
        onCancel={() => setShowReportModal(false)}
        footer={null}
        width={500}
      >
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={handleReportPPE}
        >
          <Form.Item label="Thiết bị">
            <Input
              value={typeof selectedIssuance?.item_id === 'object' && selectedIssuance?.item_id ? 
                selectedIssuance.item_id.item_name : 'Không xác định'}
              disabled
            />
          </Form.Item>
          
          <Form.Item 
            label="Loại báo cáo" 
            name="report_type"
            rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo' }]}
          >
            <Select>
              <Option value="damage">Hư hại</Option>
              <Option value="replacement">Cần thay thế</Option>
              <Option value="lost">Mất</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Mức độ nghiêm trọng" 
            name="severity"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ nghiêm trọng' }]}
          >
            <Select>
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Mô tả chi tiết" 
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
          >
            <TextArea
              placeholder="Mô tả chi tiết về vấn đề với PPE..."
              rows={4}
            />
          </Form.Item>
          
          <Form.Item 
            label="Ngày báo cáo" 
            name="reported_date"
            rules={[{ required: true, message: 'Vui lòng chọn ngày báo cáo' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowReportModal(false)}>
                Hủy
              </Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                {loading ? 'Đang báo cáo...' : 'Gửi báo cáo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết PPE</span>
          </Space>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={700}
      >
        {selectedIssuance && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Thiết bị PPE" span={2}>
                <Space>
                  <SafetyOutlined />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {typeof selectedIssuance.item_id === 'object' && selectedIssuance.item_id
                        ? selectedIssuance.item_id.item_name
                        : 'Không xác định'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Mã: {typeof selectedIssuance.item_id === 'object' && selectedIssuance.item_id
                        ? selectedIssuance.item_id.item_code
                        : 'N/A'}
                    </div>
                  </div>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Số lượng">
                <Badge count={selectedIssuance.quantity} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedIssuance.status)} icon={getStatusIcon(selectedIssuance.status)}>
                  {getStatusLabel(selectedIssuance.status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày phát">
                {formatDateTime(selectedIssuance.issued_date)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày trả dự kiến">
                {formatDateTime(selectedIssuance.expected_return_date)}
              </Descriptions.Item>

              {selectedIssuance.actual_return_date && (
                <Descriptions.Item label="Ngày trả thực tế">
                  {formatDateTime(selectedIssuance.actual_return_date)}
                </Descriptions.Item>
              )}

              {selectedIssuance.return_condition && (
                <Descriptions.Item label="Tình trạng trả">
                  <Tag color={
                    selectedIssuance.return_condition === 'good' ? 'green' :
                    selectedIssuance.return_condition === 'damaged' ? 'orange' : 'red'
                  }>
                    {selectedIssuance.return_condition === 'good' ? 'Tốt' :
                     selectedIssuance.return_condition === 'damaged' ? 'Hư hỏng' : 'Mòn'}
                  </Tag>
                </Descriptions.Item>
              )}

              {selectedIssuance.return_notes && (
                <Descriptions.Item label="Ghi chú trả" span={2}>
                  {selectedIssuance.return_notes}
                </Descriptions.Item>
              )}

              {selectedIssuance.report_description && (
                <Descriptions.Item label="Báo cáo sự cố" span={2}>
                  <div>
                    <div><strong>Loại:</strong> {selectedIssuance.report_type}</div>
                    <div><strong>Mô tả:</strong> {selectedIssuance.report_description}</div>
                    {selectedIssuance.report_severity && (
                      <div><strong>Mức độ:</strong> {selectedIssuance.report_severity}</div>
                    )}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setShowDetailModal(false)}>
                  Đóng
                </Button>
                {selectedIssuance.status === 'issued' && (
                  <>
                    <Button 
                      type="primary"
                      icon={<UndoOutlined />}
                      onClick={() => {
                        handleReturnClick(selectedIssuance);
                        setShowDetailModal(false);
                      }}
                    >
                      Trả PPE
                    </Button>
                    <Button 
                      type="primary"
                      danger
                      icon={<ExclamationCircleOutlined />}
                      onClick={() => {
                        handleReportClick(selectedIssuance);
                        setShowDetailModal(false);
                      }}
                    >
                      Báo cáo sự cố
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </EmployeeLayout>
  );
};

export default EmployeePPE;

