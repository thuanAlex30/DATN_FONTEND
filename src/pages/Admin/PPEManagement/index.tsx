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
  Divider,
  Progress,
  Timeline,
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
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleOutlined
} from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
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
import type { 
  PPECategory, 
  PPEItem, 
  PPEIssuance
} from '../../../services/ppeService';
import dayjs from 'dayjs';
import { usePPEWebSocket } from '../../../hooks/usePPEWebSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const PPEManagement: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('issuances');
  
  // WebSocket hook for realtime updates
  const { isConnected } = usePPEWebSocket({
    isAdmin: true,
    token: token || '',
    showNotifications: false, // Disable notifications here since WebSocketProvider handles them
    onPPEDistributed: (data) => {
      console.log('PPE distributed:', data);
      // Reload data when PPE is distributed
      loadAllData();
    },
    onPPEReturned: (data) => {
      console.log('PPE returned:', data);
      // Reload data when PPE is returned
      loadAllData();
    },
    onPPEReported: (data) => {
      console.log('PPE reported:', data);
      // Reload data when PPE issue is reported
      loadAllData();
    },
    onPPEOverdue: (data) => {
      console.log('PPE overdue:', data);
      // Show overdue notification
      message.warning(`PPE quá hạn: ${data.item_name} của ${data.user_name}`);
    },
    onPPELowStock: (data) => {
      console.log('PPE low stock:', data);
      // Reload data when stock is low
      loadAllData();
    }
  });
  
  // Modal states
  const [selectedCategory, setSelectedCategory] = useState<PPECategory | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<PPEItem | null>(null);
  const [showCategoryDetailModal, setShowCategoryDetailModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [showImportCategoriesModal, setShowImportCategoriesModal] = useState(false);
  const [showImportItemsModal, setShowImportItemsModal] = useState(false);
  const [showAssignPPEModal, setShowAssignPPEModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showIssuanceDetailModal, setShowIssuanceDetailModal] = useState(false);
  const [showPPEEditModal, setShowPPEEditModal] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<PPEIssuance | null>(null);
  
  // State for data
  const [ppeCategories, setPpeCategories] = useState<PPECategory[]>([]);
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  // Form states
  const [distributeForm] = Form.useForm();
  const [selectedDistributeUser, setSelectedDistributeUser] = useState<any>(null);
  const [selectedDistributeItem, setSelectedDistributeItem] = useState<PPEItem | null>(null);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  
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
  
  // Error states
  const [error] = useState<string | null>(null);
  
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
      setPpeIssuances(issuancesRes || []);
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

  useEffect(() => {
    loadUsers();
    loadInventory();
    loadAssignments();
    loadMaintenance();
    loadReports();
  }, []);

  // Get filtered categories
  const getFilteredCategories = () => {
    let filtered = ppeCategories;
    
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
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
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategoryFilter) {
      filtered = filtered.filter(item => item.category_id === selectedCategoryFilter);
    }
    
    return filtered;
  };

  // Get category stats
  const getCategoryStats = (categoryId: string) => {
    const categoryItems = ppeItems.filter(item => item.category_id === categoryId);
    const totalItems = categoryItems.length;
    const totalQuantity = categoryItems.reduce((sum, item) => sum + (item.quantity_available || 0), 0);
    const totalAllocated = categoryItems.reduce((sum, item) => sum + (item.quantity_allocated || 0), 0);
    const totalRemaining = totalQuantity - totalAllocated;
    const lowStockItems = categoryItems.filter(item => (item.quantity_available || 0) <= (item.reorder_level || 0)).length;
    
    return {
      totalItems,
      totalQuantity,
      totalAllocated,
      totalRemaining,
      lowStockItems
    };
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await ppeService.deletePPECategory(categoryId);
      message.success('Xóa danh mục thành công');
      loadAllData();
    } catch (err) {
      message.error('Không thể xóa danh mục');
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await ppeService.deletePPEItem(itemId);
      message.success('Xóa thiết bị thành công');
      loadAllData();
    } catch (err) {
      message.error('Không thể xóa thiết bị');
    }
  };

  // Load additional data functions
  const loadUsers = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const usersData = await ppeService.getAllUsers();
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, inventory: true }));
      const inventoryData = await ppeService.getAllInventory();
      setInventory(inventoryData || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, assignments: true }));
      const assignmentsData = await ppeService.getAllAssignments();
      setAssignments(assignmentsData || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  }, []);

  const loadMaintenance = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, maintenance: true }));
      const maintenanceData = await ppeService.getAllMaintenance();
      setMaintenance(maintenanceData || []);
    } catch (err) {
      console.error('Error loading maintenance:', err);
    } finally {
      setLoading(prev => ({ ...prev, maintenance: false }));
    }
  }, []);

  const loadReports = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, reports: true }));
      // Load different types of reports
      const [inventoryReport, assignmentReport, maintenanceReport] = await Promise.all([
        ppeService.getInventoryReport(),
        ppeService.getAssignmentReport(),
        ppeService.getMaintenanceReport()
      ]);
      
      const reportsData = [
        ...(Array.isArray(inventoryReport) ? inventoryReport : []).map((report: any) => ({ ...report, report_type: 'inventory' })),
        ...(Array.isArray(assignmentReport) ? assignmentReport : []).map((report: any) => ({ ...report, report_type: 'usage' })),
        ...(Array.isArray(maintenanceReport) ? maintenanceReport : []).map((report: any) => ({ ...report, report_type: 'maintenance' }))
      ];
      
      setReports(reportsData);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  }, []);

  // PPE Distribution functions
  const handleDistributePPE = () => {
    setShowDistributeModal(true);
    distributeForm.resetFields();
    setSelectedDistributeUser(null);
    setSelectedDistributeItem(null);
    setAvailableQuantity(0);
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedDistributeUser(user);
    distributeForm.setFieldsValue({ user_id: userId });
  };

  const handleItemSelect = (itemId: string) => {
    const item = ppeItems.find(i => i.id === itemId);
    setSelectedDistributeItem(item);
    setAvailableQuantity(item?.quantity_available || 0);
    distributeForm.setFieldsValue({ 
      item_id: itemId,
      max_quantity: item?.quantity_available || 0
    });
  };

  const onDistributeSubmit = async (values: any) => {
    if (!selectedDistributeUser || !selectedDistributeItem) {
      message.error('Vui lòng chọn nhân viên và thiết bị PPE');
      return;
    }

    if (values.quantity > availableQuantity) {
      message.error('Số lượng yêu cầu vượt quá số lượng có sẵn');
      return;
    }

    setLoading(prev => ({ ...prev, distributing: true }));
    try {
      const issuanceData = {
        user_id: selectedDistributeUser.id,
        item_id: selectedDistributeItem.id,
        quantity: values.quantity,
        issued_date: values.issued_date.format('YYYY-MM-DD'),
        expected_return_date: values.expected_return_date.format('YYYY-MM-DD'),
        issued_by: user?.id || user?._id || ''
      };

      await ppeService.createIssuance(issuanceData);
      message.success(`Đã phát ${values.quantity} ${selectedDistributeItem.item_name} cho ${selectedDistributeUser.full_name}`);
      
      // Reload data
      await loadAllData();
      setShowDistributeModal(false);
      distributeForm.resetFields();
      setSelectedDistributeUser(null);
      setSelectedDistributeItem(null);
      setAvailableQuantity(0);
    } catch (err: any) {
      console.error('Error distributing PPE:', err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi phát PPE');
    } finally {
      setLoading(prev => ({ ...prev, distributing: false }));
    }
  };

  const handleViewIssuanceDetail = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    setShowIssuanceDetailModal(true);
  };

  const handleReturnIssuance = async (issuanceId: string) => {
    try {
      await ppeService.returnIssuance(issuanceId, {
        actual_return_date: new Date().toISOString().split('T')[0],
        return_condition: 'good',
        notes: 'Trả bởi admin'
      });
      message.success('Đã cập nhật trạng thái trả PPE');
      await loadAllData();
    } catch (err: any) {
      console.error('Error returning issuance:', err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Category columns for table
  const categoryColumns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text: string, record: PPECategory) => (
        <Space>
          <Avatar icon={<SafetyOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tuổi thọ (tháng)',
      dataIndex: 'lifespan_months',
      key: 'lifespan_months',
      render: (months: number) => months ? `${months} tháng` : '-',
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (_: unknown, record: PPECategory) => {
        const stats = getCategoryStats(record.id || (record as any)._id);
        return (
          <Space direction="vertical" size="small">
            <div>Tổng thiết bị: <Text strong>{stats.totalItems}</Text></div>
            <div>Còn lại: <Text strong style={{ color: '#52c41a' }}>{stats.totalRemaining}</Text></div>
            <div>Đã phát: <Text strong style={{ color: '#1890ff' }}>{stats.totalAllocated}</Text></div>
            {stats.lowStockItems > 0 && (
              <div style={{ color: '#ff4d4f' }}>
                <ExclamationCircleOutlined /> {stats.lowStockItems} thiết bị cần bổ sung
              </div>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PPECategory) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCategory(record);
                setShowCategoryDetailModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedCategory(record);
                setShowCategoryEditModal(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDeleteCategory(record.id || (record as any)._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Item columns for table
  const itemColumns = [
    {
      title: 'Thiết bị',
      dataIndex: 'item_name',
      key: 'item_name',
      render: (text: string, record: PPEItem) => (
        <Space>
          <Avatar icon={<SafetyOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.item_code} - {record.brand} {record.model}
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
        const category = ppeCategories.find(cat => cat.id === categoryId || (cat as any)._id === categoryId);
        return category ? category.category_name : 'Không xác định';
      },
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: unknown, record: PPEItem) => (
        <Space direction="vertical" size="small">
          <div>Tổng: <Text strong>{record.quantity_available || 0}</Text></div>
          <div>Còn lại: <Text strong style={{ color: '#52c41a' }}>{(record.quantity_available || 0) - (record.quantity_allocated || 0)}</Text></div>
          <div>Đã phát: <Text strong style={{ color: '#1890ff' }}>{record.quantity_allocated || 0}</Text></div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: PPEItem) => {
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
      render: (_: unknown, record: PPEItem) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedItem(record);
                setShowPPEEditModal(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thiết bị này?"
            onConfirm={() => handleDeleteItem(record.id || (record as any)._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Issuance columns for table
  const issuanceColumns = [
    {
      title: 'Nhân viên',
      key: 'user',
      render: (_: unknown, record: PPEIssuance) => {
        const user = typeof record.user_id === 'object' ? record.user_id : 
          users.find(u => u.id === record.user_id);
        return (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 'bold' }}>{user?.full_name || 'Không xác định'}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {user?.department_id?.department_name || 'Không xác định'}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Thiết bị PPE',
      key: 'item',
      render: (_: unknown, record: PPEIssuance) => {
        const item = typeof record.item_id === 'object' ? record.item_id : 
          ppeItems.find(i => i.id === record.item_id);
        return (
          <Space>
            <SafetyOutlined />
            <div>
              <div style={{ fontWeight: 'bold' }}>{item?.item_name || 'Không xác định'}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {item?.item_code || 'Không có mã'}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => (
        <Badge count={quantity} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Ngày phát',
      dataIndex: 'issued_date',
      key: 'issued_date',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày trả dự kiến',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date',
      render: (date: string) => {
        const returnDate = new Date(date);
        const today = new Date();
        const isOverdue = returnDate < today;
        return (
          <Space>
            <span style={{ color: isOverdue ? '#ff4d4f' : '#52c41a' }}>
              {returnDate.toLocaleDateString('vi-VN')}
            </span>
            {isOverdue && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'issued': { color: 'blue', text: 'Đã phát', icon: <CheckCircleOutlined /> },
          'returned': { color: 'green', text: 'Đã trả', icon: <CheckCircleFilled /> },
          'overdue': { color: 'red', text: 'Quá hạn', icon: <ExclamationCircleOutlined /> },
          'damaged': { color: 'orange', text: 'Hư hỏng', icon: <WarningOutlined /> },
          'replacement_needed': { color: 'purple', text: 'Cần thay thế', icon: <ToolOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || 
          { color: 'default', text: status, icon: <InfoCircleOutlined /> };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PPEIssuance) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleViewIssuanceDetail(record)}
            />
          </Tooltip>
          {record.status === 'issued' && (
            <Tooltip title="Cập nhật trả">
              <Button 
                type="link" 
                icon={<UndoOutlined />}
                onClick={() => handleReturnIssuance(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // User columns for assignment
  const userColumns = [
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
        const userPPE = ppeIssuances.filter(issuance => 
          issuance.user_id === record.id || issuance.user_id === record._id
        );
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
      render: (record: any) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              // Show user PPE details - to be implemented
              message.info('Tính năng xem PPE của nhân viên đang được phát triển');
            }}
          >
            Xem PPE
          </Button>
          <Button 
            type="link" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setShowAssignPPEModal(true);
            }}
          >
            Phát PPE
          </Button>
        </Space>
      ),
    },
  ];

  // Inventory columns
  const inventoryColumns = [
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
          <div>Tổng: <Text strong>{record.total_quantity || 0}</Text></div>
          <div>Còn lại: <Text strong style={{ color: '#52c41a' }}>{record.available_quantity || 0}</Text></div>
          <div>Đã phát: <Text strong style={{ color: '#1890ff' }}>{record.allocated_quantity || 0}</Text></div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: any) => {
        const remaining = record.available_quantity || 0;
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
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              setShowInventoryModal(true);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  // Assignment columns
  const assignmentColumns = [
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
      title: 'Thiết bị',
      dataIndex: 'item_name',
      key: 'item_name',
      render: (text: string, record: any) => (
        <Space>
          <SafetyOutlined />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.item_code}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => (
        <Text strong>{quantity}</Text>
      ),
    },
    {
      title: 'Ngày phát',
      dataIndex: 'issued_date',
      key: 'issued_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: { [key: string]: { color: string; text: string } } = {
          'issued': { color: 'blue', text: 'Đang sử dụng' },
          'returned': { color: 'green', text: 'Đã trả' },
          'overdue': { color: 'red', text: 'Quá hạn' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: 'Không xác định' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: any) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              // Show assignment details - to be implemented
              message.info('Tính năng xem chi tiết phân công đang được phát triển');
            }}
          >
            Chi tiết
          </Button>
          {record && record.status === 'issued' && (
            <Button 
              type="link" 
              danger
              onClick={() => {
                // Return PPE - to be implemented
                message.info('Tính năng trả PPE đang được phát triển');
              }}
            >
              Trả PPE
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Maintenance columns
  const maintenanceColumns = [
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
              {record.item_code}
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
        const typeInfo = typeMap[type] || { color: 'default', text: 'Không xác định' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: 'Ngày bảo trì',
      dataIndex: 'maintenance_date',
      key: 'maintenance_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
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
          'cancelled': { color: 'red', text: 'Hủy bỏ' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: 'Không xác định' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              // Show maintenance details - to be implemented
              message.info('Tính năng xem chi tiết bảo trì đang được phát triển');
            }}
          >
            Chi tiết
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => {
              // Edit maintenance - to be implemented
              message.info('Tính năng chỉnh sửa bảo trì đang được phát triển');
            }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  // Report columns
  const reportColumns = [
    {
      title: 'Báo cáo',
      dataIndex: 'report_name',
      key: 'report_name',
      render: (text: string, record: any) => (
        <Space>
          <BarChartOutlined />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.description}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'report_type',
      key: 'report_type',
      render: (type: string) => {
        const typeMap: { [key: string]: { color: string; text: string } } = {
          'inventory': { color: 'blue', text: 'Tồn kho' },
          'usage': { color: 'green', text: 'Sử dụng' },
          'maintenance': { color: 'orange', text: 'Bảo trì' },
          'compliance': { color: 'purple', text: 'Tuân thủ' }
        };
        const typeInfo = typeMap[type] || { color: 'default', text: 'Không xác định' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_date',
      key: 'created_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              // View report - to be implemented
              message.info('Tính năng xem báo cáo đang được phát triển');
            }}
          >
            Xem
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />}
            onClick={() => {
              // Download report - to be implemented
              message.info('Tính năng tải báo cáo đang được phát triển');
            }}
          >
            Tải
          </Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={loadAllData}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <Space>
              <Title level={2} style={{ margin: 0 }}>
                <SafetyOutlined /> Quản lý PPE
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

      {/* Main Content */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Categories Tab */}
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
                      onClick={() => setShowCategoryEditModal(true)}
                    >
                      Thêm danh mục
                    </Button>
                    <Button 
                      icon={<UploadOutlined />}
                      onClick={() => setShowImportCategoriesModal(true)}
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
                columns={categoryColumns}
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

          {/* Items Tab */}
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
                      onClick={() => {
                        setSelectedItem(null);
                        setShowPPEEditModal(true);
                      }}
                    >
                      Thêm thiết bị
                    </Button>
                    <Button 
                      icon={<UploadOutlined />}
                      onClick={() => setShowImportItemsModal(true)}
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
                columns={itemColumns}
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

          {/* Phát PPE Tab */}
          <TabPane tab={<span><SendOutlined />Phát PPE</span>} key="issuances">
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12}>
                  <Search
                    placeholder="Tìm kiếm PPE đã phát..."
                    style={{ width: '100%' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />}
                      onClick={handleDistributePPE}
                    >
                      Phát PPE mới
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
                    title="Tổng PPE đã phát"
                    value={ppeIssuances.length}
                    prefix={<SafetyOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Đang sử dụng"
                    value={ppeIssuances.filter(i => i.status === 'issued').length}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Quá hạn"
                    value={ppeIssuances.filter(i => i.status === 'overdue').length}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Đã trả"
                    value={ppeIssuances.filter(i => i.status === 'returned').length}
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
                columns={issuanceColumns}
                dataSource={ppeIssuances}
                rowKey={(record) => record.id}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} bản ghi phát PPE`,
                }}
              />
            )}
          </TabPane>

          {/* Quản lý nhân viên Tab */}
          <TabPane tab={<span><UserOutlined />Quản lý nhân viên</span>} key="assign">
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12}>
                  <Search
                    placeholder="Tìm kiếm nhân viên..."
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setShowAssignPPEModal(true)}
                    >
                      Phát PPE mới
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
                columns={userColumns}
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

          {/* Lịch sử phát PPE Tab */}
          <TabPane tab={<span><HistoryOutlined />Lịch sử phát PPE</span>} key="history">
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <Search
                    placeholder="Tìm kiếm lịch sử..."
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Lọc theo trạng thái"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Select.Option value="issued">Đang sử dụng</Select.Option>
                    <Select.Option value="returned">Đã trả</Select.Option>
                    <Select.Option value="overdue">Quá hạn</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8}>
                  <Space>
                    <Button icon={<DownloadOutlined />}>
                      Xuất báo cáo
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              columns={assignmentColumns}
              dataSource={ppeIssuances}
              rowKey={(record) => record.id || (record as any)._id}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} bản ghi`,
              }}
            />
          </TabPane>

          {/* Tồn Kho Tab */}
          <TabPane tab={<span><DatabaseOutlined />Tồn Kho</span>} key="inventory">
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <Search
                    placeholder="Tìm kiếm tồn kho..."
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Lọc theo trạng thái"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Select.Option value="in_stock">Còn hàng</Select.Option>
                    <Select.Option value="low_stock">Cần bổ sung</Select.Option>
                    <Select.Option value="out_of_stock">Hết hàng</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setShowInventoryModal(true)}
                    >
                      Cập nhật tồn kho
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      Xuất báo cáo
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
                columns={inventoryColumns}
                dataSource={inventory.length > 0 ? inventory : ppeItems}
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

          {/* Phân Công Tab */}
          <TabPane tab={<span><TeamOutlined />Phân Công</span>} key="assignment">
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <Search
                    placeholder="Tìm kiếm phân công..."
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Lọc theo trạng thái"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Select.Option value="active">Đang hoạt động</Select.Option>
                    <Select.Option value="completed">Hoàn thành</Select.Option>
                    <Select.Option value="cancelled">Hủy bỏ</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setShowAssignmentModal(true)}
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
                columns={assignmentColumns}
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

          {/* Bảo Trì Tab */}
          <TabPane tab={<span><ToolOutlined />Bảo Trì</span>} key="maintenance">
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <Search
                    placeholder="Tìm kiếm bảo trì..."
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Lọc theo loại"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Select.Option value="preventive">Phòng ngừa</Select.Option>
                    <Select.Option value="corrective">Sửa chữa</Select.Option>
                    <Select.Option value="emergency">Khẩn cấp</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setShowMaintenanceModal(true)}
                    >
                      Tạo lịch bảo trì
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      Xuất báo cáo
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
                columns={maintenanceColumns}
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

          {/* Báo Cáo Tab */}
          <TabPane tab={<span><BarChartOutlined />Báo Cáo</span>} key="reports">
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <Search
                    placeholder="Tìm kiếm báo cáo..."
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Lọc theo loại"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Select.Option value="inventory">Tồn kho</Select.Option>
                    <Select.Option value="usage">Sử dụng</Select.Option>
                    <Select.Option value="maintenance">Bảo trì</Select.Option>
                    <Select.Option value="compliance">Tuân thủ</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setShowReportModal(true)}
                    >
                      Tạo báo cáo
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
                columns={reportColumns}
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
        </Tabs>
      </Card>

      {/* Modals */}
      <CategoryEditModal
        isOpen={showCategoryEditModal}
        onClose={() => setShowCategoryEditModal(false)}
        onSuccess={() => {
          loadAllData();
          setShowCategoryEditModal(false);
        }}
        category={selectedCategory}
      />

      <CategoryDetailModal
        isOpen={showCategoryDetailModal}
        onClose={() => setShowCategoryDetailModal(false)}
        category={selectedCategory}
        items={ppeItems.filter(item => item.category_id === (selectedCategory?.id || (selectedCategory as any)?._id))}
      />

      <ImportCategoriesModal
        isOpen={showImportCategoriesModal}
        onClose={() => setShowImportCategoriesModal(false)}
        onImportSuccess={() => {
          loadAllData();
          setShowImportCategoriesModal(false);
        }}
      />

      <ImportItemsModal
        isOpen={showImportItemsModal}
        onClose={() => setShowImportItemsModal(false)}
        onImportSuccess={() => {
          loadAllData();
          setShowImportItemsModal(false);
        }}
        categories={ppeCategories}
      />

      <AssignPPEModal
        isOpen={showAssignPPEModal}
        onClose={() => {
          setShowAssignPPEModal(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          loadAllData();
          setShowAssignPPEModal(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser}
      />

      <InventoryUpdateModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        onSuccess={() => {
          loadAllData();
          loadInventory();
          setShowInventoryModal(false);
        }}
      />

      <CreateAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onSuccess={() => {
          loadAssignments();
          setShowAssignmentModal(false);
        }}
      />

      <CreateMaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        onSuccess={() => {
          loadMaintenance();
          setShowMaintenanceModal(false);
        }}
      />

      <CreateReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={() => {
          loadReports();
          setShowReportModal(false);
        }}
      />

      <PPEEditModal
        item={selectedItem}
        categories={ppeCategories}
        isOpen={showPPEEditModal}
        onClose={() => {
          setShowPPEEditModal(false);
          setSelectedItem(null);
        }}
        onSuccess={() => {
          loadAllData();
          setShowPPEEditModal(false);
          setSelectedItem(null);
        }}
      />

      {/* PPE Distribution Modal */}
      <Modal
        title={
          <Space>
            <SendOutlined />
            <span>Phát PPE cho nhân viên</span>
          </Space>
        }
        open={showDistributeModal}
        onCancel={() => setShowDistributeModal(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={distributeForm}
          layout="vertical"
          onFinish={onDistributeSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chọn nhân viên"
                name="user_id"
                rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
              >
                <Select
                  placeholder="Chọn nhân viên"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleUserSelect}
                  loading={loading.users}
                >
                  {users.map(user => (
                    <Select.Option key={user.id} value={user.id}>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <div>
                          <div>{user.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {user.department_id?.department_name || 'Không xác định'}
                          </div>
                        </div>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chọn thiết bị PPE"
                name="item_id"
                rules={[{ required: true, message: 'Vui lòng chọn thiết bị PPE' }]}
              >
                <Select
                  placeholder="Chọn thiết bị PPE"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleItemSelect}
                  loading={loading.items}
                >
                  {ppeItems.map(item => (
                    <Select.Option key={item.id} value={item.id}>
                      <Space>
                        <SafetyOutlined />
                        <div>
                          <div>{item.item_name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Còn lại: {item.quantity_available || 0} | Mã: {item.item_code}
                          </div>
                        </div>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng' },
                  { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
                  { 
                    validator: (_, value) => {
                      if (value > availableQuantity) {
                        return Promise.reject(new Error(`Số lượng không được vượt quá ${availableQuantity}`));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  min={1}
                  max={availableQuantity}
                  style={{ width: '100%' }}
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ngày phát"
                name="issued_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày phát' }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ngày trả dự kiến"
                name="expected_return_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày trả dự kiến' }]}
                initialValue={dayjs().add(30, 'day')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {selectedDistributeUser && selectedDistributeItem && (
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{selectedDistributeUser.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {selectedDistributeUser.department_id?.department_name || 'Không xác định'}
                      </div>
                    </div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space>
                    <SafetyOutlined />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{selectedDistributeItem.item_name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Còn lại: <Text strong style={{ color: '#52c41a' }}>{availableQuantity}</Text>
                      </div>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowDistributeModal(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading.distributing}
                icon={<SendOutlined />}
              >
                Phát PPE
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Issuance Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết PPE đã phát</span>
          </Space>
        }
        open={showIssuanceDetailModal}
        onCancel={() => setShowIssuanceDetailModal(false)}
        footer={null}
        width={700}
      >
        {selectedIssuance && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Nhân viên" span={2}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {typeof selectedIssuance.user_id === 'object' 
                        ? selectedIssuance.user_id.full_name 
                        : users.find(u => u.id === selectedIssuance.user_id)?.full_name || 'Không xác định'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {typeof selectedIssuance.user_id === 'object' 
                        ? selectedIssuance.user_id.department_id?.department_name 
                        : users.find(u => u.id === selectedIssuance.user_id)?.department_id?.department_name || 'Không xác định'}
                    </div>
                  </div>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Thiết bị PPE" span={2}>
                <Space>
                  <SafetyOutlined />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {typeof selectedIssuance.item_id === 'object' 
                        ? selectedIssuance.item_id.item_name 
                        : ppeItems.find(i => i.id === selectedIssuance.item_id)?.item_name || 'Không xác định'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Mã: {typeof selectedIssuance.item_id === 'object' 
                        ? selectedIssuance.item_id.item_code 
                        : ppeItems.find(i => i.id === selectedIssuance.item_id)?.item_code || 'Không có mã'}
                    </div>
                  </div>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Số lượng">
                <Badge count={selectedIssuance.quantity} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái">
                <Tag color={
                  selectedIssuance.status === 'issued' ? 'blue' :
                  selectedIssuance.status === 'returned' ? 'green' :
                  selectedIssuance.status === 'overdue' ? 'red' :
                  selectedIssuance.status === 'damaged' ? 'orange' : 'purple'
                }>
                  {selectedIssuance.status === 'issued' ? 'Đã phát' :
                   selectedIssuance.status === 'returned' ? 'Đã trả' :
                   selectedIssuance.status === 'overdue' ? 'Quá hạn' :
                   selectedIssuance.status === 'damaged' ? 'Hư hỏng' : 'Cần thay thế'}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày phát">
                {new Date(selectedIssuance.issued_date).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày trả dự kiến">
                {new Date(selectedIssuance.expected_return_date).toLocaleDateString('vi-VN')}
              </Descriptions.Item>

              {selectedIssuance.actual_return_date && (
                <Descriptions.Item label="Ngày trả thực tế">
                  {new Date(selectedIssuance.actual_return_date).toLocaleDateString('vi-VN')}
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
                <Button onClick={() => setShowIssuanceDetailModal(false)}>
                  Đóng
                </Button>
                {selectedIssuance.status === 'issued' && (
                  <Button 
                    type="primary"
                    icon={<UndoOutlined />}
                    onClick={() => {
                      handleReturnIssuance(selectedIssuance.id);
                      setShowIssuanceDetailModal(false);
                    }}
                  >
                    Cập nhật trả
                  </Button>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PPEManagement;
