import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Table,
  Tag,
  Avatar,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  message,
  Popconfirm,
  Tabs,
  Spin,
  Alert,
  Tooltip,
  Badge,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Descriptions
} from 'antd';
import { 
  SafetyOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined, 
  ShoppingCartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  UserOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  TeamOutlined,
  ToolOutlined,
  BarChartOutlined,
  DownloadOutlined,
  SendOutlined,
  UndoOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import PDFPreviewModal from '../../../components/PDFPreviewModal';
import { generatePDF } from '../../../utils/pdfGenerator';
import * as ppeService from '../../../services/ppeService';
import departmentService from '../../../services/departmentService';
import CategoryEditModal from './CategoryEditModal';
import CategoryDetailModal from './CategoryDetailModal';
import ImportCategoriesModal from './ImportCategoriesModal';
import ImportItemsModal from './ImportItemsModal';
import AssignPPEModal from './AssignPPEModal';
import InventoryUpdateModal from './InventoryUpdateModal';
import CreateAssignmentModal from './CreateAssignmentModal';
import CreateMaintenanceModal from './CreateMaintenanceModal';
import CreateReportModal from './CreateReportModal';
import PPEEditModal from './PPEEditModal';
import IssueToManagerModal from './IssueToManagerModal';
import IssueToEmployeeModal from './IssueToEmployeeModal';
import type { 
  PPECategory, 
  PPEItem, 
  PPEIssuance
} from '../../../services/ppeService';
import dayjs from 'dayjs';
import { usePPEWebSocket } from '../../../hooks/usePPEWebSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import PPEAssignmentDetailsModal from './components/PPEAssignmentDetailsModal';
// Advanced Features Components
import BatchIssuanceModal from '../../../components/PPEAdvanced/BatchIssuanceModal';
import ExpiryManagementModal from '../../../components/PPEAdvanced/ExpiryManagementModal';
import OptimisticLockingModal from '../../../components/PPEAdvanced/OptimisticLockingModal';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const ConsolidatedPPEManagement: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('assets');
  const [activeSubTab, setActiveSubTab] = useState('categories');
  
  // WebSocket hook for realtime updates
  const { isConnected } = usePPEWebSocket();

  // State for data
  const [ppeCategories, setPpeCategories] = useState<PPECategory[]>([]);
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]);
  const [adminIssuedPPE, setAdminIssuedPPE] = useState<PPEIssuance[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    categories: false,
    items: false,
    issuances: false,
    users: false,
    inventory: false,
    assignments: false,
    maintenance: false,
    reports: false,
    distributing: false
  });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true, items: true, issuances: true }));
      const [categoriesRes, itemsRes, issuancesRes] = await Promise.all([
        ppeService.getPPECategories(),
        ppeService.getPPEItems(),
        ppeService.getPPEIssuances()
      ]);
      
      setPpeCategories(categoriesRes || []);
      setPpeItems(itemsRes || []);
      
      const allIssuances = issuancesRes || [];
      const mappedHistory = allIssuances.map((issuance: any) => {
        const userObj = typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id : null;
        const itemObj = typeof issuance.item_id === 'object' && issuance.item_id ? issuance.item_id : null;

        return {
          ...issuance,
          user_name: userObj?.full_name || issuance.user_name || 'Không xác định',
          department_name: userObj?.department_id?.department_name || issuance.department_name,
          item_name: itemObj?.item_name || issuance.item_name,
          item_code: itemObj?.item_code || issuance.item_code,
        };
      });

      setPpeIssuances(mappedHistory);
      
      const adminToManagerPPE = allIssuances.filter(
        (issuance: any) => issuance.issuance_level === 'admin_to_manager'
      );
      setAdminIssuedPPE(adminToManagerPPE);
      
    } catch (err) {
      console.error('Error loading PPE data:', err);
      message.error('Không thể tải dữ liệu PPE');
    } finally {
      setLoading(prev => ({ ...prev, categories: false, items: false, issuances: false }));
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Get filtered categories
  const getFilteredCategories = () => {
    let filtered = ppeCategories;
    
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get filtered items
  const getFilteredItems = () => {
    let filtered = ppeItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategoryFilter) {
      filtered = filtered.filter(item => item.category_id === selectedCategoryFilter);
    }
    
    return filtered;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <Space>
              <Title level={2} style={{ margin: 0 }}>
                <SafetyOutlined /> Quản lý PPE (Tối ưu hóa)
              </Title>
              <Badge 
                status={isConnected ? 'success' : 'error'} 
                text={isConnected ? 'Kết nối realtime' : 'Mất kết nối'}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <Space style={{ float: 'right' }}>
              <Button 
                type="primary"
                icon={<ReloadOutlined />}
                onClick={loadAllData}
                loading={loading.categories || loading.items || loading.issuances}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng danh mục"
              value={ppeCategories.length}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng thiết bị"
              value={ppeItems.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã phát"
              value={ppeIssuances.filter(iss => iss.status === 'issued').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Cần bổ sung"
              value={ppeItems.filter(item => {
                const remaining = (item.quantity_available || 0) - (item.quantity_allocated || 0);
                return remaining <= (item.reorder_level || 0);
              }).length}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content - Cấu trúc mới với 4 tab chính */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          
          {/* 1. QUẢN LÝ TÀI SẢN - Gộp Danh mục + Thiết bị + Tồn kho */}
          <TabPane tab={<span><DatabaseOutlined />Quản lý Tài sản</span>} key="assets">
            <Tabs activeKey={activeSubTab} onChange={setActiveSubTab} type="card">
              
              {/* Danh mục Sub-tab */}
              <TabPane tab="Danh mục" key="categories">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                      <Search
                        placeholder="Tìm kiếm danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => {/* Handle add category */}}
                        >
                          Thêm danh mục
                        </Button>
                        <Button 
                          icon={<UploadOutlined />}
                          onClick={() => {/* Handle import */}}
                        >
                          Import
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {loading.categories ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Tên danh mục',
                        dataIndex: 'category_name',
                        key: 'category_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<SafetyOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.description || 'Không có mô tả'}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Thời gian sử dụng',
                        dataIndex: 'lifespan_months',
                        key: 'lifespan_months',
                        render: (value: number) => `${value} tháng`,
                      },
                      {
                        title: 'Thống kê',
                        key: 'stats',
                        render: (_: unknown, record: any) => {
                          const categoryItems = ppeItems.filter(item => item.category_id === record.id);
                          const totalItems = categoryItems.length;
                          const availableItems = categoryItems.filter(item => (item.quantity_available || 0) > 0).length;
                          const issuedItems = categoryItems.filter(item => (item.quantity_allocated || 0) > 0).length;
                          const reorderItems = categoryItems.filter(item => {
                            const remaining = (item.quantity_available || 0) - (item.quantity_allocated || 0);
                            return remaining <= (item.reorder_level || 0);
                          }).length;

                          return (
                            <Space direction="vertical" size="small">
                              <div>Tổng: <Text strong>{totalItems}</Text></div>
                              <div>Còn lại: <Text strong style={{ color: '#52c41a' }}>{availableItems}</Text></div>
                              <div>Đã phát: <Text strong style={{ color: '#1890ff' }}>{issuedItems}</Text></div>
                              <div>Cần bổ sung: <Text strong style={{ color: '#ff4d4f' }}>{reorderItems}</Text></div>
                            </Space>
                          );
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown, record: any) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Xem</Button>
                            <Button type="link" icon={<EditOutlined />}>Sửa</Button>
                            <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => {/* Handle delete */}}>
                              <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={getFilteredCategories()}
                    rowKey={(record) => record.id || (record as any)._id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} danh mục`,
                    }}
                  />
                )}
              </TabPane>

              {/* Thiết bị Sub-tab */}
              <TabPane tab="Thiết bị" key="items">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8}>
                      <Search
                        placeholder="Tìm kiếm thiết bị..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Select
                        placeholder="Lọc theo danh mục"
                        style={{ width: '100%' }}
                        value={selectedCategoryFilter}
                        onChange={setSelectedCategoryFilter}
                        allowClear
                      >
                        {ppeCategories.map(category => (
                          <Select.Option key={category.id || (category as any)._id} value={category.id || (category as any)._id}>
                            {category.category_name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => {/* Handle add item */}}
                        >
                          Thêm thiết bị
                        </Button>
                        <Button 
                          icon={<UploadOutlined />}
                          onClick={() => {/* Handle import */}}
                        >
                          Import
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {loading.items ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Thiết bị',
                        dataIndex: 'item_name',
                        key: 'item_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<SafetyOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.item_code} - {record.brand}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Danh mục',
                        dataIndex: 'category_id',
                        key: 'category_id',
                        render: (categoryId: string) => {
                          const category = ppeCategories.find(cat => cat.id === categoryId);
                          return category ? category.category_name : 'Không xác định';
                        },
                      },
                      {
                        title: 'Tồn kho',
                        key: 'stock',
                        render: (_: unknown, record: any) => (
                          <Space direction="vertical" size="small">
                            <div>Tổng: <Text strong>{record.quantity_available || 0}</Text></div>
                            <div>Còn lại: <Text strong style={{ color: '#52c41a' }}>{record.quantity_available || 0}</Text></div>
                            <div>Đã phát: <Text strong style={{ color: '#1890ff' }}>{record.quantity_allocated || 0}</Text></div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Trạng thái',
                        key: 'status',
                        render: (_: unknown, record: any) => {
                          const remaining = (record.quantity_available || 0) - (record.quantity_allocated || 0);
                          const reorderLevel = record.reorder_level || 0;
                          
                          if (remaining <= 0) {
                            return <Tag color="red">Hết hàng</Tag>;
                          } else if (remaining <= reorderLevel) {
                            return <Tag color="orange">Cần bổ sung</Tag>;
                          } else {
                            return <Tag color="green">Còn hàng</Tag>;
                          }
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown, record: any) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Xem</Button>
                            <Button type="link" icon={<EditOutlined />}>Sửa</Button>
                            <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => {/* Handle delete */}}>
                              <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={getFilteredItems()}
                    rowKey={(record) => record.id || (record as any)._id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} thiết bị`,
                    }}
                  />
                )}
              </TabPane>

              {/* Tồn kho Sub-tab */}
              <TabPane tab="Tồn kho" key="inventory">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                      <Search
                        placeholder="Tìm kiếm tồn kho..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => {/* Handle update inventory */}}
                        >
                          Cập nhật tồn kho
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {loading.inventory ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Thiết bị',
                        dataIndex: 'item_name',
                        key: 'item_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<SafetyOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.item_code} - {record.brand}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Tồn kho',
                        key: 'stock',
                        render: (_: unknown, record: any) => (
                          <Space direction="vertical" size="small">
                            <div>Tổng: <Text strong>{record.total_quantity ?? (record.quantity_available ?? 0) + (record.quantity_allocated ?? 0)}</Text></div>
                            <div>Còn lại: <Text strong style={{ color: '#52c41a' }}>{record.remaining_quantity ?? record.quantity_available ?? 0}</Text></div>
                            <div>Đã phát: <Text strong style={{ color: '#1890ff' }}>{record.quantity_allocated ?? record.actual_allocated_quantity ?? 0}</Text></div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Trạng thái',
                        key: 'status',
                        render: (_: unknown, record: any) => {
                          const remaining = record.remaining_quantity ?? record.quantity_available ?? 0;
                          const reorderLevel = record.reorder_level || 0;
                          
                          if (remaining <= 0) {
                            return <Tag color="red">Hết hàng</Tag>;
                          } else if (remaining <= reorderLevel) {
                            return <Tag color="orange">Cần bổ sung</Tag>;
                          } else {
                            return <Tag color="green">Còn hàng</Tag>;
                          }
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Chi tiết</Button>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={inventory}
                    rowKey={(record) => record.id || record._id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} thiết bị`,
                    }}
                  />
                )}
              </TabPane>
            </Tabs>
          </TabPane>

          {/* 2. CẤP PHÁT PPE - Gộp Phát PPE + Phân Công + Lịch sử */}
          <TabPane tab={<span><TeamOutlined />Cấp phát PPE</span>} key="issuances">
            <Tabs activeKey={activeSubTab} onChange={setActiveSubTab} type="card">
              
              {/* Phát PPE Sub-tab */}
              <TabPane tab="Phát PPE" key="issue">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                      <Search
                        placeholder="Tìm kiếm PPE đã phát..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<SendOutlined />}
                          onClick={() => {/* Handle issue to manager */}}
                        >
                          Phát cho Manager
                        </Button>
                        <Button 
                          icon={<TeamOutlined />}
                          onClick={() => {/* Handle distribute PPE */}}
                        >
                          Phát trực tiếp
                        </Button>
                        <Button 
                          icon={<DownloadOutlined />}
                          onClick={() => message.info('Tính năng xuất báo cáo đang được phát triển')}
                        >
                          Xuất báo cáo
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Tổng PPE đã phát cho Manager"
                        value={adminIssuedPPE.length}
                        prefix={<SafetyOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Đang giữ (Manager)"
                        value={adminIssuedPPE.filter(i => i.status === 'issued').length}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Quá hạn"
                        value={adminIssuedPPE.filter(i => i.status === 'overdue').length}
                        prefix={<ExclamationCircleOutlined />}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Đã trả"
                        value={adminIssuedPPE.filter(i => i.status === 'returned').length}
                        prefix={<UndoOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {loading.issuances ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Người nhận',
                        dataIndex: 'user_name',
                        key: 'user_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<UserOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.department_name || 'Không xác định'}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Thiết bị',
                        dataIndex: 'item_name',
                        key: 'item_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<SafetyOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.item_code} - Số lượng: {record.quantity}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Ngày phát',
                        dataIndex: 'issued_date',
                        key: 'issued_date',
                        render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Ngày trả dự kiến',
                        dataIndex: 'expected_return_date',
                        key: 'expected_return_date',
                        render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: string) => {
                          const statusMap: { [key: string]: { color: string; text: string } } = {
                            'issued': { color: 'blue', text: 'Đã phát' },
                            'returned': { color: 'green', text: 'Đã trả' },
                            'overdue': { color: 'red', text: 'Quá hạn' },
                            'replacement_needed': { color: 'orange', text: 'Cần thay thế' }
                          };
                          const statusInfo = statusMap[status] || { color: 'default', text: status };
                          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown, record: any) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Xem chi tiết</Button>
                            {record.status === 'issued' && (
                              <Button type="link" icon={<UndoOutlined />}>Cập nhật trả</Button>
                            )}
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={adminIssuedPPE}
                    rowKey={(record) => record.id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} bản ghi phát cho Manager`,
                    }}
                  />
                )}
              </TabPane>

              {/* Phân Công Sub-tab */}
              <TabPane tab="Phân Công" key="assignments">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                      <Search
                        placeholder="Tìm kiếm phân công..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => {/* Handle create assignment */}}
                        >
                          Tạo phân công
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {loading.assignments ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Nhân viên',
                        dataIndex: 'user_name',
                        key: 'user_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<UserOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.department_name || 'Không xác định'}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Thiết bị được phân',
                        key: 'assigned_items',
                        render: (_: unknown, record: any) => (
                          <Space direction="vertical" size="small">
                            {record.assigned_items?.map((item: any, index: number) => (
                              <div key={index}>
                                <Text strong>{item.item_name}</Text> - Số lượng: {item.quantity}
                              </div>
                            )) || 'Không có'}
                          </Space>
                        ),
                      },
                      {
                        title: 'Ngày phân công',
                        dataIndex: 'assignment_date',
                        key: 'assignment_date',
                        render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: string) => {
                          const statusMap: { [key: string]: { color: string; text: string } } = {
                            'pending': { color: 'orange', text: 'Chờ xử lý' },
                            'assigned': { color: 'blue', text: 'Đã phân công' },
                            'completed': { color: 'green', text: 'Hoàn thành' },
                            'cancelled': { color: 'red', text: 'Đã hủy' }
                          };
                          const statusInfo = statusMap[status] || { color: 'default', text: status };
                          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown, record: any) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Xem chi tiết</Button>
                            <Button type="link" icon={<EditOutlined />}>Sửa</Button>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={assignments}
                    rowKey={(record) => record.id || record._id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} phân công`,
                    }}
                  />
                )}
              </TabPane>

              {/* Lịch sử phát PPE Sub-tab */}
              <TabPane tab="Lịch sử phát PPE" key="history">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                      <Search
                        placeholder="Tìm kiếm lịch sử..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <Button 
                          icon={<DownloadOutlined />}
                          onClick={() => {/* Handle export history */}}
                        >
                          Xuất lịch sử
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {loading.issuances ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Người nhận',
                        dataIndex: 'user_name',
                        key: 'user_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<UserOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.department_name || 'Không xác định'}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Thiết bị',
                        dataIndex: 'item_name',
                        key: 'item_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<SafetyOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.item_code} - Số lượng: {record.quantity}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Ngày phát',
                        dataIndex: 'issued_date',
                        key: 'issued_date',
                        render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                      },
                      {
                        title: 'Ngày trả',
                        dataIndex: 'returned_date',
                        key: 'returned_date',
                        render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: string) => {
                          const statusMap: { [key: string]: { color: string; text: string } } = {
                            'issued': { color: 'blue', text: 'Đã phát' },
                            'returned': { color: 'green', text: 'Đã trả' },
                            'overdue': { color: 'red', text: 'Quá hạn' },
                            'replacement_needed': { color: 'orange', text: 'Cần thay thế' }
                          };
                          const statusInfo = statusMap[status] || { color: 'default', text: status };
                          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown, record: any) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Xem chi tiết</Button>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={ppeIssuances}
                    rowKey={(record) => record.id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} bản ghi lịch sử`,
                    }}
                  />
                )}
              </TabPane>
            </Tabs>
          </TabPane>

          {/* 3. BẢO TRÌ & QUẢN LÝ */}
          <TabPane tab={<span><ToolOutlined />Bảo trì & Quản lý</span>} key="maintenance">
            <Tabs activeKey={activeSubTab} onChange={setActiveSubTab} type="card">
              
              {/* Bảo Trì Sub-tab */}
              <TabPane tab="Bảo Trì" key="maintenance">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                      <Search
                        placeholder="Tìm kiếm bảo trì..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => {/* Handle create maintenance */}}
                        >
                          Tạo lịch bảo trì
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {loading.maintenance ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Thiết bị',
                        dataIndex: 'item_name',
                        key: 'item_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<SafetyOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.item_code} - {record.brand}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Loại bảo trì',
                        dataIndex: 'maintenance_type',
                        key: 'maintenance_type',
                        render: (type: string) => {
                          const typeMap: { [key: string]: { color: string; text: string } } = {
                            'preventive': { color: 'blue', text: 'Phòng ngừa' },
                            'corrective': { color: 'orange', text: 'Sửa chữa' },
                            'emergency': { color: 'red', text: 'Khẩn cấp' }
                          };
                          const typeInfo = typeMap[type] || { color: 'default', text: type };
                          return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
                        },
                      },
                      {
                        title: 'Ngày bảo trì',
                        dataIndex: 'maintenance_date',
                        key: 'maintenance_date',
                        render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: string) => {
                          const statusMap: { [key: string]: { color: string; text: string } } = {
                            'scheduled': { color: 'blue', text: 'Đã lên lịch' },
                            'in_progress': { color: 'orange', text: 'Đang thực hiện' },
                            'completed': { color: 'green', text: 'Hoàn thành' },
                            'cancelled': { color: 'red', text: 'Đã hủy' }
                          };
                          const statusInfo = statusMap[status] || { color: 'default', text: status };
                          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown, record: any) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Xem chi tiết</Button>
                            <Button type="link" icon={<EditOutlined />}>Sửa</Button>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={maintenance}
                    rowKey={(record) => record.id || record._id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} bảo trì`,
                    }}
                  />
                )}
              </TabPane>

              {/* Quản lý nhân viên Sub-tab */}
              <TabPane tab="Quản lý nhân viên" key="employees">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                      <Search
                        placeholder="Tìm kiếm nhân viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => {/* Handle add employee */}}
                        >
                          Thêm nhân viên
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {loading.users ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Nhân viên',
                        dataIndex: 'full_name',
                        key: 'full_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<UserOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.department_name || 'Không xác định'} - {record.position || 'Không xác định'}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'PPE hiện tại',
                        key: 'current_ppe',
                        render: (_: unknown, record: any) => {
                          const userPPE = ppeIssuances.filter((issuance) => {
                            const matchesUser = issuance.user_id === record.id ||
                              (typeof issuance.user_id === 'object' && (issuance.user_id as any).id === record.id);
                            const isActive = issuance.status === 'issued' || issuance.status === 'overdue' || issuance.status === 'replacement_needed';
                            return matchesUser && isActive;
                          });
                          return (
                            <Space>
                              <Badge count={userPPE.length} showZero />
                              <Text type="secondary">thiết bị</Text>
                            </Space>
                          );
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown, record: any) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Xem PPE</Button>
                            <Button type="link" icon={<PlusOutlined />}>Phát PPE</Button>
                            {record.role?.role_name === 'manager' && (
                              <Button type="link" icon={<TeamOutlined />}>Phát cho NV</Button>
                            )}
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={users}
                    rowKey={(record) => record.id || record._id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} nhân viên`,
                    }}
                  />
                )}
              </TabPane>
            </Tabs>
          </TabPane>

          {/* 4. BÁO CÁO & PHÂN TÍCH */}
          <TabPane tab={<span><BarChartOutlined />Báo cáo & Phân tích</span>} key="reports">
            <Tabs activeKey={activeSubTab} onChange={setActiveSubTab} type="card">
              
              {/* Báo Cáo Sub-tab */}
              <TabPane tab="Báo Cáo" key="reports">
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                      <Search
                        placeholder="Tìm kiếm báo cáo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => {/* Handle create report */}}
                        >
                          Tạo báo cáo
                        </Button>
                        <Button 
                          icon={<DownloadOutlined />}
                          onClick={() => {/* Handle export reports */}}
                        >
                          Xuất báo cáo
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {loading.reports ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'Tên báo cáo',
                        dataIndex: 'report_name',
                        key: 'report_name',
                        render: (text: string, record: any) => (
                          <Space>
                            <Avatar icon={<BarChartOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{text}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.report_type} - {record.description}
                              </div>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: 'Loại báo cáo',
                        dataIndex: 'report_type',
                        key: 'report_type',
                        render: (type: string) => {
                          const typeMap: { [key: string]: { color: string; text: string } } = {
                            'inventory': { color: 'blue', text: 'Tồn kho' },
                            'issuance': { color: 'green', text: 'Cấp phát' },
                            'maintenance': { color: 'orange', text: 'Bảo trì' },
                            'summary': { color: 'purple', text: 'Tổng hợp' }
                          };
                          const typeInfo = typeMap[type] || { color: 'default', text: type };
                          return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
                        },
                      },
                      {
                        title: 'Ngày tạo',
                        dataIndex: 'created_at',
                        key: 'created_at',
                        render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: string) => {
                          const statusMap: { [key: string]: { color: string; text: string } } = {
                            'draft': { color: 'orange', text: 'Nháp' },
                            'generated': { color: 'blue', text: 'Đã tạo' },
                            'completed': { color: 'green', text: 'Hoàn thành' },
                            'failed': { color: 'red', text: 'Lỗi' }
                          };
                          const statusInfo = statusMap[status] || { color: 'default', text: status };
                          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                        },
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        render: (_: unknown, record: any) => (
                          <Space>
                            <Button type="link" icon={<EyeOutlined />}>Xem</Button>
                            <Button type="link" icon={<DownloadOutlined />}>Tải</Button>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={reports}
                    rowKey={(record) => record.id || record._id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} báo cáo`,
                    }}
                  />
                )}
              </TabPane>

              {/* Advanced Features Sub-tab */}
              <TabPane tab="Tính năng nâng cao" key="advanced">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card title="PPE Advanced Features" size="small">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                          <Card 
                            hoverable
                            onClick={() => {/* Handle batch operations */}}
                            style={{ textAlign: 'center', cursor: 'pointer' }}
                          >
                            <TeamOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                            <Title level={4}>Batch Operations</Title>
                            <Text type="secondary">
                              Xử lý hàng loạt PPE issuance với progress tracking
                            </Text>
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card 
                            hoverable
                            onClick={() => {/* Handle expiry management */}}
                            style={{ textAlign: 'center', cursor: 'pointer' }}
                          >
                            <WarningOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                            <Title level={4}>Expiry Management</Title>
                            <Text type="secondary">
                              Quản lý hạn sử dụng PPE và gửi thông báo
                            </Text>
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card 
                            hoverable
                            onClick={() => {/* Handle optimistic locking */}}
                            style={{ textAlign: 'center', cursor: 'pointer' }}
                          >
                            <LockOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                            <Title level={4}>Optimistic Locking</Title>
                            <Text type="secondary">
                              Cập nhật PPE items với version control
                            </Text>
                          </Card>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ConsolidatedPPEManagement;
