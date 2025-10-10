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
  InboxOutlined
} from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import type { PPEIssuance } from '../../../services/ppeService';
import { EmployeeLayout } from '../../../components/Employee';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const EmployeePPE: React.FC = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<PPEIssuance | null>(null);
  
  // Form states
  const [returnForm, setReturnForm] = useState({
    actual_return_date: new Date().toISOString().split('T')[0],
    return_condition: 'good' as 'good' | 'damaged' | 'worn',
    notes: ''
  });
  
  const [reportForm, setReportForm] = useState({
    report_type: 'damage' as 'damage' | 'replacement' | 'lost',
    description: '',
    severity: 'low' as 'low' | 'medium' | 'high',
    reported_date: new Date().toISOString().split('T')[0]
  });

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

  const handleReturnPPE = async () => {
    if (!selectedIssuance) return;
    
    setLoading(true);
    try {
      await ppeService.returnPPEIssuanceEmployee(selectedIssuance.id, returnForm);
      await loadUserPPE(); // Reload data
      setShowReturnModal(false);
      setSelectedIssuance(null);
      setReturnForm({
        actual_return_date: new Date().toISOString().split('T')[0],
        return_condition: 'good' as 'good' | 'damaged' | 'worn',
        notes: ''
      });
      message.success('Trả PPE thành công!');
    } catch (err) {
      console.error('Error returning PPE:', err);
      message.error('Có lỗi khi trả PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleReportPPE = async () => {
    if (!selectedIssuance) return;
    
    setLoading(true);
    try {
      // Use the new employee-specific report API
      const reportData = {
        report_type: reportForm.report_type,
        description: reportForm.description,
        severity: reportForm.severity,
        reported_date: reportForm.reported_date
      };
      
      await ppeService.reportPPEIssuanceEmployee(selectedIssuance.id, reportData);
      await loadUserPPE(); // Reload data
      setShowReportModal(false);
      setSelectedIssuance(null);
      setReportForm({
        report_type: 'damage' as 'damage' | 'replacement' | 'lost',
        description: '',
        severity: 'low' as 'low' | 'medium' | 'high',
        reported_date: new Date().toISOString().split('T')[0]
      });
      message.success('Báo cáo PPE thành công!');
    } catch (err) {
      console.error('Error reporting PPE:', err);
      message.error('Có lỗi khi báo cáo PPE');
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

  return (
    <EmployeeLayout
      title="Quản lý PPE cá nhân"
      icon={<SafetyOutlined />}
      headerExtra={
        <Button 
          type="primary"
          icon={<ReloadOutlined />}
          onClick={loadUserPPE}
          loading={loading}
        >
          Làm mới
        </Button>
      }
    >
      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <SafetyOutlined />
                Xem PPE
              </span>
            } 
            key="view"
          >
            <div>
              <Title level={3} style={{ marginBottom: '24px' }}>PPE đang sử dụng</Title>

              {/* Statistics */}
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="Đang sử dụng"
                        value={getActiveIssuances().length}
                        prefix={<SafetyOutlined style={{ color: '#3498db' }} />}
                        valueStyle={{ color: '#2c3e50' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="Đã trả"
                        value={getReturnedIssuances().length}
                        prefix={<CheckCircleOutlined style={{ color: '#27ae60' }} />}
                        valueStyle={{ color: '#2c3e50' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="Quá hạn"
                        value={ppeIssuances.filter(issuance => 
                          issuance.status === 'overdue' || 
                          isOverdue(issuance.expected_return_date)
                        ).length}
                        prefix={<ExclamationCircleOutlined style={{ color: '#e74c3c' }} />}
                        valueStyle={{ color: '#2c3e50' }}
                      />
                    </Card>
                  </Col>
                </Row>

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
                            title={
                              <Space>
                                <SafetyOutlined style={{ color: '#3498db' }} />
                                {item?.item_name || 'Không xác định'}
                              </Space>
                            }
                            extra={
                              <Badge 
                                status={isOverdueItem ? 'error' : 'success'} 
                                text={getStatusLabel(issuance.status)}
                              />
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
                                Trả PPE
                              </Button>,
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
                                Báo cáo
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
                                <CalendarOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                                <Text>Ngày phát: {formatDateTime(issuance.issued_date)}</Text>
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
                              <Title level={4}>Chưa có PPE</Title>
                              <Text>Bạn chưa được phát PPE nào</Text>
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
          
          <Form.Item label="Ngày trả" required>
            <DatePicker
              style={{ width: '100%' }}
              value={returnForm.actual_return_date ? dayjs(returnForm.actual_return_date) : null}
              onChange={(date) => setReturnForm(prev => ({ 
                ...prev, 
                actual_return_date: date ? date.format('YYYY-MM-DD') : '' 
              }))}
            />
          </Form.Item>
          
          <Form.Item label="Tình trạng khi trả" required>
            <Select
              value={returnForm.return_condition}
              onChange={(value) => setReturnForm(prev => ({ ...prev, return_condition: value }))}
            >
              <Option value="good">Tốt</Option>
              <Option value="damaged">Hư hại</Option>
              <Option value="worn">Mòn</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Ghi chú">
            <TextArea
              value={returnForm.notes}
              onChange={(e) => setReturnForm(prev => ({ ...prev, notes: e.target.value }))}
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
          
          <Form.Item label="Loại báo cáo" required>
            <Select
              value={reportForm.report_type}
              onChange={(value) => setReportForm(prev => ({ ...prev, report_type: value }))}
            >
              <Option value="damage">Hư hại</Option>
              <Option value="replacement">Cần thay thế</Option>
              <Option value="lost">Mất</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Mức độ nghiêm trọng" required>
            <Select
              value={reportForm.severity}
              onChange={(value) => setReportForm(prev => ({ ...prev, severity: value }))}
            >
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Mô tả chi tiết" required>
            <TextArea
              value={reportForm.description}
              onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả chi tiết về vấn đề với PPE..."
              rows={4}
            />
          </Form.Item>
          
          <Form.Item label="Ngày báo cáo" required>
            <DatePicker
              style={{ width: '100%' }}
              value={reportForm.reported_date ? dayjs(reportForm.reported_date) : null}
              onChange={(date) => setReportForm(prev => ({ 
                ...prev, 
                reported_date: date ? date.format('YYYY-MM-DD') : '' 
              }))}
            />
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
    </EmployeeLayout>
  );
};

export default EmployeePPE;
