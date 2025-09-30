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
  Badge
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
  DownloadOutlined
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
import type { 
  PPECategory, 
  PPEItem, 
  PPEIssuance
} from '../../../services/ppeService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const PPEManagement: React.FC = () => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('categories');
  
  // Modal states
  const [selectedCategory, setSelectedCategory] = useState<PPECategory | null>(null);
  const [showCategoryDetailModal, setShowCategoryDetailModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [showImportCategoriesModal, setShowImportCategoriesModal] = useState(false);
  const [showImportItemsModal, setShowImportItemsModal] = useState(false);
  const [showAssignPPEModal, setShowAssignPPEModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // State for data
  const [ppeCategories, setPpeCategories] = useState<PPECategory[]>([]);
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]);
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
    reports: false
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
        ...(inventoryReport || []).map((report: any) => ({ ...report, report_type: 'inventory' })),
        ...(assignmentReport || []).map((report: any) => ({ ...report, report_type: 'usage' })),
        ...(maintenanceReport || []).map((report: any) => ({ ...report, report_type: 'maintenance' }))
      ];
      
      setReports(reportsData);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  }, []);

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
                // TODO: Implement item edit modal
                message.info('Tính năng chỉnh sửa thiết bị đang được phát triển');
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
      render: (_: unknown) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              // TODO: Show user PPE details
              message.info('Tính năng xem PPE của nhân viên đang được phát triển');
            }}
          >
            Xem PPE
          </Button>
          <Button 
            type="link" 
            icon={<PlusOutlined />}
            onClick={() => {
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
              // TODO: Show assignment details
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
                // TODO: Return PPE
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
              // TODO: Show maintenance details
              message.info('Tính năng xem chi tiết bảo trì đang được phát triển');
            }}
          >
            Chi tiết
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => {
              // TODO: Edit maintenance
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
              // TODO: View report
              message.info('Tính năng xem báo cáo đang được phát triển');
            }}
          >
            Xem
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />}
            onClick={() => {
              // TODO: Download report
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
        <Title level={2}>
          <SafetyOutlined /> Quản lý PPE
        </Title>
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
              value={ppeItems.filter(item => (item.quantity_available || 0) <= (item.reorder_level || 0)).length}
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
                      onClick={() => message.info('Tính năng thêm thiết bị đang được phát triển')}
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
          <TabPane tab={<span><UserOutlined />Phát PPE</span>} key="assign">
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
        onClose={() => setShowAssignPPEModal(false)}
        onSuccess={() => {
          loadAllData();
          setShowAssignPPEModal(false);
        }}
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
    </div>
  );
};

export default PPEManagement;
