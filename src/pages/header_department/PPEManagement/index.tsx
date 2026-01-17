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
  Descriptions,
  Image,
  Empty
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
  LockOutlined,
  ClockCircleOutlined
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
import { ENV } from '../../../config/env';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const PPEManagement: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('issuances');
  const [assignmentDetailsVisible, setAssignmentDetailsVisible] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  
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
    },
    // Advanced Features Events
    onPPEQuantityUpdate: (data) => {
      console.log('PPE quantity updated:', data);
      loadAllData();
    },
    onPPEConditionUpdate: (data) => {
      console.log('PPE condition updated:', data);
      loadAllData();
    },
    onPPEExpiryWarning: (data) => {
      console.log('PPE expiry warning:', data);
      message.warning(`PPE sắp hết hạn: ${data.item_name} (còn ${data.days_until_expiry} ngày)`);
    },
    onPPEExpired: (data) => {
      console.log('PPE expired:', data);
      message.error(`PPE đã hết hạn: ${data.item_name}`);
      loadAllData();
    },
    onPPEReplaced: (data) => {
      console.log('PPE replaced:', data);
      message.success(`PPE đã được thay thế: ${data.item_name}`);
      loadAllData();
    },
    onPPEDisposed: (data) => {
      console.log('PPE disposed:', data);
      message.info(`PPE đã được xử lý: ${data.item_name}`);
      loadAllData();
    },
    onBatchProcessingStarted: (data) => {
      console.log('Batch processing started:', data);
      message.info(`Bắt đầu xử lý batch: ${data.batch_name}`);
    },
    onBatchProcessingProgress: (data) => {
      console.log('Batch processing progress:', data);
    },
    onBatchProcessingComplete: (data) => {
      console.log('Batch processing complete:', data);
      message.success(`Hoàn thành batch: ${data.batch_name}`);
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
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showIssuanceDetailModal, setShowIssuanceDetailModal] = useState(false);
  const [showPPEEditModal, setShowPPEEditModal] = useState(false);
  const [showIssueToManagerModal, setShowIssueToManagerModal] = useState(false);
  const [showIssueToEmployeeModal, setShowIssueToEmployeeModal] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<PPEIssuance | null>(null);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  
  // PDF Preview states
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewReportData, setPreviewReportData] = useState<any>(null);
  const [previewReportType, setPreviewReportType] = useState<string>('');
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Advanced Features Modal States
  const [showBatchIssuanceModal, setShowBatchIssuanceModal] = useState(false);
  const [showExpiryManagementModal, setShowExpiryManagementModal] = useState(false);
  const [showOptimisticLockingModal, setShowOptimisticLockingModal] = useState(false);
  
  // State for data
  const [ppeCategories, setPpeCategories] = useState<PPECategory[]>([]);
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]); // All issuances for "Lịch sử phát PPE"
  const [adminIssuedPPE, setAdminIssuedPPE] = useState<PPEIssuance[]>([]); // Admin->Manager issuances for "Phát PPE" tab
  const [users, setUsers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('');
  
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
  // History tab specific search and status filter
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('');

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true, items: true, issuances: true }));
      const [categoriesRes, itemsRes, issuancesRes] = await Promise.all([
        ppeService.getPPECategories(),
        ppeService.getPPEItems(),
        ppeService.getPPEIssuances()
      ]);
      
      // Ensure data is an array - handle both direct array and wrapped response
      let categories: PPECategory[] = [];
      let items: PPEItem[] = [];
      
      if (Array.isArray(categoriesRes)) {
        categories = categoriesRes;
      } else if (categoriesRes && typeof categoriesRes === 'object' && 'data' in categoriesRes) {
        categories = Array.isArray((categoriesRes as any).data) ? (categoriesRes as any).data : [];
      }
      
      if (Array.isArray(itemsRes)) {
        items = itemsRes;
      } else if (itemsRes && typeof itemsRes === 'object') {
        // Handle different response formats
        if ('data' in itemsRes) {
          items = Array.isArray((itemsRes as any).data) ? (itemsRes as any).data : [];
        } else if ('items' in itemsRes) {
          // Handle inventoryReport format
          items = Array.isArray((itemsRes as any).items) ? (itemsRes as any).items : [];
        }
      }
      
      // If items is still empty, try to get from inventory report as fallback
      if (items.length === 0) {
        try {
          const inventoryReport = await ppeService.getInventoryReport();
          if (inventoryReport && (inventoryReport as any).items && Array.isArray((inventoryReport as any).items)) {
            items = (inventoryReport as any).items;
            console.log('[PPE Management] Using items from inventory report:', items.length);
          }
        } catch (err) {
          console.warn('[PPE Management] Could not load items from inventory report:', err);
        }
      }
      
      // Normalize items data - ensure consistent structure
      items = items.map((item: any) => {
        // Handle category_id as object or string
        const categoryId = typeof item.category_id === 'object' && item.category_id
          ? (item.category_id.id || (item.category_id as any)._id || item.category_id)
          : item.category_id;
        
        return {
          ...item,
          id: item.id || item._id,
          category_id: categoryId,
          // Ensure all required fields exist
          item_name: item.item_name || '',
          item_code: item.item_code || '',
          quantity_available: item.quantity_available || 0,
          quantity_allocated: item.quantity_allocated || 0,
        };
      });
      
      console.log('[PPE Management] Loaded categories:', categories.length);
      console.log('[PPE Management] Loaded items:', items.length);
      console.log('[PPE Management] Items data:', items);
      
      setPpeCategories(categories);
      setPpeItems(items);
      
      // Filter to show only Admin->Manager issuances in "Phát PPE" tab
      const allIssuances = issuancesRes || [];

      // Normalize data for "Lịch sử phát PPE" table so it always has display fields
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

      setPpeIssuances(mappedHistory); // For "Lịch sử phát PPE"
      
      // Filter only Admin->Manager issuances for "Phát PPE" tab
      const adminToManagerPPE = allIssuances.filter(
        (issuance: any) => issuance.issuance_level === 'admin_to_manager'
      );
      setAdminIssuedPPE(adminToManagerPPE);
      
      console.log('[Admin PPE] Total issuances:', allIssuances.length);
      console.log('[Admin PPE] Admin->Manager issuances:', adminToManagerPPE.length);
    } catch (err: any) {
      console.error('Error loading PPE data:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu PPE';
      message.error(errorMessage);
      
      // Set empty arrays on error to prevent undefined issues
      setPpeCategories([]);
      setPpeItems([]);
      setPpeIssuances([]);
      setAdminIssuedPPE([]);
    } finally {
      setLoading(prev => ({ ...prev, categories: false, items: false, issuances: false }));
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    loadUsers();
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
    if (!ppeItems || !Array.isArray(ppeItems)) {
      console.warn('[PPE Management] ppeItems is not an array:', ppeItems);
      return [];
    }
    
    let filtered = ppeItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const itemName = item.item_name?.toLowerCase() || '';
        const itemCode = item.item_code?.toLowerCase() || '';
        const brand = (item.brand || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return itemName.includes(search) || itemCode.includes(search) || brand.includes(search);
      });
    }
    
    if (selectedCategoryFilter) {
      filtered = filtered.filter(item => {
        // Handle both string and object category_id
        const itemCategoryId = typeof item.category_id === 'object' && item.category_id 
          ? (item.category_id.id || (item.category_id as any)._id)
          : item.category_id;
        return itemCategoryId === selectedCategoryFilter || 
               (itemCategoryId && itemCategoryId.toString() === selectedCategoryFilter);
      });
    }
    
    return filtered;
  };

// Get filtered issuances for "Lịch sử phát PPE"
const getFilteredIssuances = () => {
  if (!Array.isArray(ppeIssuances)) return [];
  let filtered = ppeIssuances;

  if (historySearchTerm) {
    const s = historySearchTerm.toLowerCase();
    filtered = filtered.filter((iss: any) => {
      const user = iss.user_name || (iss.user_id && typeof iss.user_id === 'object' ? iss.user_id.full_name : '') || '';
      const item = iss.item_name || (iss.item_id && typeof iss.item_id === 'object' ? iss.item_id.item_name : '') || '';
      const itemCode = iss.item_code || (iss.item_id && typeof iss.item_id === 'object' ? iss.item_id.item_code : '') || '';
      const dept = iss.department_name || (iss.user_id && iss.user_id.department_id && iss.user_id.department_id.department_name) || '';
      const issuedDate = iss.issued_date ? new Date(iss.issued_date).toLocaleDateString('vi-VN') : '';
      const haystack = `${user} ${item} ${itemCode} ${dept} ${issuedDate}`.toLowerCase();
      return haystack.includes(s);
    });
  }

  if (historyStatusFilter) {
    filtered = filtered.filter((iss: any) => (iss.status || '').toString() === historyStatusFilter);
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
      
      // Chỉ hiển thị người dùng là quản lý phòng ban (managers)
      const response = await departmentService.getDepartments();
      if (!response.success || !response.data?.departments) {
        message.error('Không thể tải danh sách phòng ban');
        setUsers([]);
        return;
      }

      const departments = response.data.departments || [];

      // Lấy danh sách managers từ các phòng ban có gán manager
      const managers = departments
        .filter((dept: any) => !!dept.manager_id)
        .map((dept: any) => {
          const mgr: any = dept.manager_id;
          return {
            id: mgr.id || mgr._id,
            username: mgr.username,
            full_name: mgr.full_name || mgr.username,
            email: mgr.email,
            phone: mgr.phone,
            role: { role_name: 'manager', id: mgr.role_id?.id || mgr.role_id?._id },
            department_id: { id: dept.id || dept._id, department_name: dept.department_name },
            // convenience fields for table renderers
            department_name: dept.department_name,
            is_active: mgr.is_active ?? true,
            created_at: mgr.created_at,
          } as any;
        });

      // Loại trùng nếu có cùng manager xuất hiện ở nhiều phòng ban (trường hợp dữ liệu không chuẩn)
      const uniqueManagersMap = new Map<string, any>();
      managers.forEach((m: any) => {
        if (!uniqueManagersMap.has(m.id)) uniqueManagersMap.set(m.id, m);
      });

      setUsers(Array.from(uniqueManagersMap.values()));
    } catch (err: any) {
      console.error('Error loading users:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách người dùng';
      message.error(errorMessage);
      setUsers([]);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);


  const loadAssignments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, assignments: true }));
      const assignmentsData = await ppeService.getAllAssignments();
      const normalized = (assignmentsData || []).map((assignment: any) => {
        const userObj = assignment && typeof assignment.user_id === 'object' && assignment.user_id !== null
          ? assignment.user_id
          : {};
        const itemObj = assignment && typeof assignment.item_id === 'object' && assignment.item_id !== null
          ? assignment.item_id
          : {};
        return {
          ...assignment,
          id: assignment.id ?? assignment._id,
          user_name: assignment?.user_name ?? userObj?.full_name ?? 'Không xác định',
          department_name: assignment?.department_name ?? userObj?.department_id?.department_name ?? '',
          item_name: assignment?.item_name ?? itemObj?.item_name ?? '',
          item_code: assignment?.item_code ?? itemObj?.item_code ?? '',
        };
      });
      setAssignments(normalized);
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
      
      // Load different types of reports with error handling for each
      const results = await Promise.allSettled([
        ppeService.getInventoryReport().catch(err => {
          console.error('Error loading inventory report:', err);
          return null;
        }),
        ppeService.getAssignmentReport().catch(err => {
          console.error('Error loading assignment report:', err);
          return null;
        }),
        ppeService.getMaintenanceReport().catch(err => {
          console.error('Error loading maintenance report:', err);
          return null;
        })
      ]);
      
      const inventoryReport = results[0].status === 'fulfilled' ? results[0].value : null;
      const assignmentReport = results[1].status === 'fulfilled' ? results[1].value : null;
      const maintenanceReport = results[2].status === 'fulfilled' ? results[2].value : null;
      
      console.log('Raw API responses:', { inventoryReport, assignmentReport, maintenanceReport });
      
      // Create report objects with proper structure for display
      const reportsData = [];
      
      // Inventory Report
      if (inventoryReport && (inventoryReport.categories || inventoryReport.items)) {
        // Calculate totals from the report data
        const totalCategories = inventoryReport.categories?.length || 0;
        const totalDevices = inventoryReport.items?.length || 0;
        const availableDevices = inventoryReport.items?.reduce((sum: number, item: any) => 
          sum + ((item.quantity_available || 0) - (item.quantity_allocated || 0)), 0) || 0;
        const issuedDevices = inventoryReport.items?.reduce((sum: number, item: any) => 
          sum + (item.quantity_allocated || 0), 0) || 0;

        // Calculate additional statistics for charts
        const maintenanceCount = inventoryReport.items?.reduce((sum: number, item: any) => 
          sum + (item.quantity_maintenance || 0), 0) || 0;
        const expiredCount = inventoryReport.items?.reduce((sum: number, item: any) => 
          sum + (item.quantity_expired || 0), 0) || 0;

        // Load categories separately if not in report
        let categoriesMap = new Map();
        if (inventoryReport.categories && inventoryReport.categories.length > 0) {
          inventoryReport.categories.forEach((cat: any) => {
            const catId = cat.id || cat._id;
            if (catId) {
              categoriesMap.set(catId.toString(), cat.category_name || cat.name || 'N/A');
            }
          });
        }
        
        // Normalize items to ensure category_name is available
        const normalizedItems = (inventoryReport.items || []).map((item: any) => {
          let categoryName = item.category_name;
          
          // Check if category_name is in nested category object (from aggregation pipeline)
          if (!categoryName && item.category) {
            if (typeof item.category === 'object') {
              categoryName = item.category.category_name || item.category.name || 'N/A';
            }
          }
          
          // If category_name is not available, try to get it from category_id
          if (!categoryName && item.category_id) {
            if (typeof item.category_id === 'object') {
              // category_id is populated object
              categoryName = item.category_id.category_name || item.category_id.name || 'N/A';
            } else {
              // category_id is just an ID string/ObjectId
              const catIdStr = item.category_id.toString();
              categoryName = categoriesMap.get(catIdStr) || 'N/A';
              
              // If still not found, try to find in categories array
              if (categoryName === 'N/A' && inventoryReport.categories) {
                const category = inventoryReport.categories.find((cat: any) => {
                  const catId = (cat.id || cat._id)?.toString();
                  return catId === catIdStr;
                });
                if (category) {
                  categoryName = category.category_name || category.name || 'N/A';
                }
              }
            }
          }
          
          return {
            ...item,
            category_name: categoryName || 'N/A'
          };
        });

        reportsData.push({
          id: 'inventory-report',
          report_name: 'Báo cáo tồn kho',
          description: `Tổng số danh mục: ${totalCategories}, Tổng số thiết bị: ${totalDevices}, Có sẵn: ${availableDevices}, Đã phát: ${issuedDevices}`,
          report_type: 'inventory',
          created_at: new Date().toISOString(),
          data: {
            ...inventoryReport,
            items: normalizedItems,
            total_categories: totalCategories,
            total_devices: totalDevices,
            available_devices: availableDevices,
            issued_devices: issuedDevices,
            maintenance_count: maintenanceCount,
            expired_count: expiredCount
          }
        });
      }
      
      // Assignment Report
      if (assignmentReport) {
        // Handle different response structures
        let assignments = assignmentReport.assignments || assignmentReport.data?.assignments || [];
        
        // Normalize assignments data to ensure user_name and item_name are available
        assignments = assignments.map((assignment: any) => {
          // Extract user name
          let userName = assignment.user_name;
          if (!userName && assignment.user_id) {
            if (typeof assignment.user_id === 'object') {
              userName = assignment.user_id.full_name || assignment.user_id.username || 'N/A';
            }
          }
          
          // Extract item name
          let itemName = assignment.item_name;
          if (!itemName && assignment.item_id) {
            if (typeof assignment.item_id === 'object') {
              itemName = assignment.item_id.item_name || 'N/A';
            }
          }
          
          // Extract start date
          const startDate = assignment.start_date || assignment.issued_date || assignment.created_at;
          
          return {
            ...assignment,
            user_name: userName || 'N/A',
            item_name: itemName || 'N/A',
            start_date: startDate,
            // Keep original user_id and item_id for reference
            user_id: assignment.user_id,
            item_id: assignment.item_id
          };
        });
        
        const totalAssignments = assignments.length;
        const activeAssignments = assignments.filter((a: any) => {
          const status = a.status || (a as any).assignment_status;
          return status === 'active' || status === 'assigned' || status === 'issued';
        }).length;
        const completedAssignments = assignments.filter((a: any) => {
          const status = a.status || (a as any).assignment_status;
          return status === 'completed' || status === 'returned';
        }).length;
        const overdueAssignments = assignments.filter((a: any) => {
          const endDate = a.end_date || a.expected_return_date || (a as any).expected_return_date;
          if (!endDate) return false;
          const status = a.status || (a as any).assignment_status;
          return new Date(endDate) < new Date() && (status === 'active' || status === 'assigned' || status === 'issued');
        }).length;

        reportsData.push({
          id: 'assignment-report',
          report_name: 'Báo cáo phân công',
          description: `Tổng số phân công: ${totalAssignments}, Đang hoạt động: ${activeAssignments}, Đã hoàn thành: ${completedAssignments}, Quá hạn: ${overdueAssignments}`,
          report_type: 'usage',
          created_at: assignmentReport.generated_at || assignmentReport.created_at || new Date().toISOString(),
          data: {
            ...assignmentReport,
            assignments: assignments,
            total_assignments: totalAssignments,
            active_assignments: activeAssignments,
            completed_assignments: completedAssignments,
            overdue_assignments: overdueAssignments
          }
        });
      }
      
      // Maintenance Report
      if (maintenanceReport) {
        const maintenanceRecords = maintenanceReport.maintenance_records || 
                                   maintenanceReport.maintenance || 
                                   maintenanceReport.data?.maintenance_records || 
                                   maintenanceReport.data?.maintenance || 
                                   [];
        const totalMaintenance = maintenanceRecords.length;
        const completedMaintenance = maintenanceRecords.filter((m: any) => {
          const status = m.status || (m as any).maintenance_status;
          return status === 'completed' || status === 'done';
        }).length;
        const pendingMaintenance = maintenanceRecords.filter((m: any) => {
          const status = m.status || (m as any).maintenance_status;
          return status === 'pending' || status === 'scheduled' || status === 'in_progress';
        }).length;
        const overdueMaintenance = maintenanceRecords.filter((m: any) => {
          const dueDate = m.due_date || m.scheduled_date || (m as any).next_maintenance_date;
          if (!dueDate) return false;
          const status = m.status || (m as any).maintenance_status;
          return new Date(dueDate) < new Date() && (status === 'pending' || status === 'scheduled');
        }).length;

        reportsData.push({
          id: 'maintenance-report',
          report_name: 'Báo cáo bảo trì',
          description: `Tổng số bảo trì: ${totalMaintenance}, Đã hoàn thành: ${completedMaintenance}, Đang chờ: ${pendingMaintenance}, Quá hạn: ${overdueMaintenance}`,
          report_type: 'maintenance',
          created_at: maintenanceReport.generated_at || maintenanceReport.created_at || new Date().toISOString(),
          data: {
            ...maintenanceReport,
            maintenance_records: maintenanceRecords,
            total_maintenance: totalMaintenance,
            completed_maintenance: completedMaintenance,
            pending_maintenance: pendingMaintenance,
            overdue_maintenance: overdueMaintenance
          }
        });
      }
      
      if (reportsData.length === 0) {
        message.warning('Không có dữ liệu báo cáo nào được tải');
      } else {
        console.log('Processed reports data:', reportsData);
      }
      
      setReports(reportsData);
    } catch (err: any) {
      console.error('Error loading reports:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách báo cáo';
      message.error(errorMessage);
      setReports([]);
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  }, []);

  // Report handling functions
  const handleViewReport = (record: any) => {
    console.log('Viewing report:', record);
    setPreviewReportData(record.data);
    setPreviewReportType(record.report_type);
    setShowPDFPreview(true);
  };

  const handleDownloadReport = async (record: any) => {
    try {
      setPdfLoading(true);
      console.log('Downloading report:', record);
      
      const filename = `bao_cao_${record.report_type}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      await generatePDF({
        reportData: record.data,
        reportType: record.report_type,
        filename: filename
      });
      
      message.success(`Đã tải báo cáo PDF: ${record.report_name}`);
    } catch (error) {
      console.error('Error downloading report:', error);
      message.error('Không thể tải báo cáo PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // Export history (usage) report for the filtered issuances table
  const handleExportHistoryReport = async () => {
    try {
      setPdfLoading(true);

      const assignments = getFilteredIssuances();

      const totalAssignments = assignments.length;
      const activeAssignments = assignments.filter((a: any) => {
        const status = a.status || a.assignment_status || '';
        return status === 'active' || status === 'assigned' || status === 'issued';
      }).length;
      const completedAssignments = assignments.filter((a: any) => {
        const status = a.status || a.assignment_status || '';
        return status === 'completed' || status === 'returned';
      }).length;
      const overdueAssignments = assignments.filter((a: any) => {
        const endDate = a.expected_return_date || a.end_date || a.return_date;
        if (!endDate) return false;
        const status = a.status || a.assignment_status || '';
        return new Date(endDate) < new Date() && (status === 'active' || status === 'assigned' || status === 'issued');
      }).length;

      const reportData = {
        assignments,
        total_assignments: totalAssignments,
        active_assignments: activeAssignments,
        completed_assignments: completedAssignments,
        overdue_assignments: overdueAssignments,
        generated_at: new Date().toISOString()
      };

      const filename = `bao_cao_lich_su_phat_${new Date().toISOString().split('T')[0]}.pdf`;

      await generatePDF({
        reportData,
        reportType: 'usage',
        filename
      });

      message.success('Đã xuất báo cáo lịch sử phát PPE');
    } catch (err) {
      console.error('Error exporting history report:', err);
      message.error('Không thể xuất báo cáo lịch sử phát PPE');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadFromPreview = async () => {
    if (!previewReportData || !previewReportType) return;
    
    try {
      setPdfLoading(true);
      const filename = `bao_cao_${previewReportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      await generatePDF({
        reportData: previewReportData,
        reportType: previewReportType,
        filename: filename
      });
      
      message.success('Đã tải báo cáo PDF');
    } catch (error) {
      console.error('Error downloading report from preview:', error);
      message.error('Không thể tải báo cáo PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // PPE Distribution functions
  const handleDistributePPE = () => {
    setShowDistributeModal(true);
    distributeForm.resetFields();
    setSelectedDistributeUser(null);
    setSelectedDistributeItem(null);
    setAvailableQuantity(0);
  };

  const handleIssueToManager = () => {
    setShowIssueToManagerModal(true);
  };

  const handleIssueToEmployee = (manager: any) => {
    setSelectedManager(manager);
    setShowIssueToEmployeeModal(true);
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedDistributeUser(user);
    distributeForm.setFieldsValue({ user_id: userId });
  };

  const handleItemSelect = (itemId: string) => {
    const item = ppeItems.find(i => i.id === itemId);
    setSelectedDistributeItem(item || null);
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
        issued_by: user?.id || ''
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

  const apiBaseForImages = React.useMemo(() => {
    if (!ENV.API_BASE_URL) return '';
    return ENV.API_BASE_URL.replace(/\/api\/?$/, '');
  }, []);

  const resolveImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${apiBaseForImages}${url}`;
  };

  // Category columns for table
  const categoryColumns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text: string, record: PPECategory) => (
        <Space>
          {record.image_url ? (
            <Image
              src={resolveImageUrl(record.image_url)}
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 8 }}
              preview={{ mask: 'Xem ảnh' }}
              fallback=""
            />
          ) : (
            <Avatar icon={<SafetyOutlined />} />
          )}
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
          <Image
            src={resolveImageUrl(record.image_url)}
            fallback={resolveImageUrl(
              ppeCategories.find(cat => cat.id === record.category_id || (cat as any)._id === record.category_id)?.image_url
            )}
            width={40}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview={{ mask: 'Xem ảnh' }}
            placeholder={
              <Avatar
                icon={<SafetyOutlined />}
                style={{ width: 40, height: 40, borderRadius: 8 }}
              />
            }
          />
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
      title: 'Manager',
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
      render: (status: string, record: PPEIssuance) => {
        // Helper function to get status configuration
        const getStatusConfig = (statusValue: string) => {
          const statusMap: { [key: string]: { color: string; text: string; icon: React.ReactNode } } = {
            'pending_confirmation': { 
              color: 'orange', 
              text: 'Chờ xác nhận', 
              icon: <ClockCircleOutlined /> 
            },
            'issued': { 
              color: 'blue', 
              text: 'Đã phát', 
              icon: <CheckCircleOutlined /> 
            },
            'returned': { 
              color: 'green', 
              text: 'Đã trả', 
              icon: <CheckCircleOutlined /> 
            },
            'overdue': { 
              color: 'red', 
              text: 'Quá hạn', 
              icon: <ExclamationCircleOutlined /> 
            },
            'damaged': { 
              color: 'orange', 
              text: 'Hư hỏng', 
              icon: <WarningOutlined /> 
            },
            'replacement_needed': { 
              color: 'purple', 
              text: 'Cần thay thế', 
              icon: <ToolOutlined /> 
            },
            'pending_manager_return': { 
              color: 'cyan', 
              text: 'Chờ trả', 
              icon: <UndoOutlined /> 
            }
          };
          
          return statusMap[statusValue] || { 
            color: 'default', 
            text: statusValue || 'Không xác định', 
            icon: <InfoCircleOutlined /> 
          };
        };
        
        const config = getStatusConfig(status);
        
        return (
          <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ 
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: '4px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
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
          {record.status === 'pending_manager_return' && (
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
      title: 'Ngày trả dự kiến',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Ngày trả thực tế',
      dataIndex: 'actual_return_date',
      key: 'actual_return_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Báo cáo',
      key: 'report',
      render: (_: unknown, record: any) => {
        const severity = record.report_severity || record.reportSeverity || '';
        const desc = record.report_description || record.report_description || '';
        const type = record.report_type || record.reportType || '';
        if (!severity && !desc && !type) return <Text type="secondary">Không có</Text>;
        return (
          <Space direction="vertical" size="small" style={{ maxWidth: 240 }}>
            {type && <Text><strong>Loại:</strong> {type}</Text>}
            {severity && <Tag color={severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'green'}>{severity}</Tag>}
            {desc && <Text type="secondary" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 }}>{desc}</Text>}
          </Space>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        // Helper function to get status configuration with icons
        const getStatusConfig = (statusValue: string) => {
          const statusMap: { [key: string]: { color: string; text: string; icon: React.ReactNode } } = {
            'pending_confirmation': { 
              color: 'orange', 
              text: 'Chờ xác nhận', 
              icon: <ClockCircleOutlined /> 
            },
            'issued': { 
              color: 'blue', 
              text: 'Đang sử dụng', 
              icon: <CheckCircleOutlined /> 
            },
            'returned': { 
              color: 'green', 
              text: 'Đã trả', 
              icon: <CheckCircleOutlined /> 
            },
            'overdue': { 
              color: 'red', 
              text: 'Quá hạn', 
              icon: <ExclamationCircleOutlined /> 
            },
            'damaged': { 
              color: 'orange', 
              text: 'Hư hỏng', 
              icon: <WarningOutlined /> 
            },
            'replacement_needed': { 
              color: 'purple', 
              text: 'Cần thay thế', 
              icon: <ToolOutlined /> 
            },
            'pending_manager_return': { 
              color: 'cyan', 
              text: 'Chờ trả', 
              icon: <UndoOutlined /> 
            }
          };
          
          return statusMap[statusValue] || { 
            color: 'default', 
            text: statusValue || 'Không xác định', 
            icon: <InfoCircleOutlined /> 
          };
        };
        
        const config = getStatusConfig(status);
        
        return (
          <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ 
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: '4px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {config.text}
          </Tag>
        );
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
              setSelectedAssignmentId(record.id || record._id);
              setAssignmentDetailsVisible(true);
            }}
          >
            Chi tiết
          </Button>
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
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: any) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewReport(record)}
          >
            Xem
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadReport(record)}
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
          {/* Asset Management Tab - Gộp Danh mục + Thiết bị + Tồn kho */}
          <TabPane tab={<span><DatabaseOutlined />Quản lý Tài sản</span>} key="assets">
            <Tabs defaultActiveKey="categories" type="card">
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

              {/* Items Sub-tab */}
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
                rowKey={(record) => record.id || (record as any)._id || `item-${Math.random()}`}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} thiết bị`,
                }}
                locale={{
                  emptyText: (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <SafetyOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                      <div style={{ color: '#999', fontSize: '16px' }}>Chưa có thiết bị nào</div>
                      <div style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
                        Nhấn "Thêm thiết bị" để tạo thiết bị mới
                      </div>
                    </div>
                  )
                }}
              />
            )}
              </TabPane>
            </Tabs>
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
                      onClick={handleIssueToManager}
                    >
                      Phát cho Manager
                    </Button>
                    <Button 
                      icon={<TeamOutlined />}
                      onClick={handleDistributePPE}
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
                columns={issuanceColumns}
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

          {/* Lịch sử phát PPE Tab */}
          <TabPane tab={<span><HistoryOutlined />Lịch sử phát PPE</span>} key="history">
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <Search
                    placeholder="Tìm kiếm lịch sử..."
                    style={{ width: '100%' }}
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Lọc theo trạng thái"
                    style={{ width: '100%' }}
                    allowClear
                    value={historyStatusFilter}
                    onChange={(value) => setHistoryStatusFilter(value || '')}
                  >
                    <Select.Option value="pending_confirmation">Chờ xác nhận</Select.Option>
                    <Select.Option value="issued">Đang sử dụng</Select.Option>
                    <Select.Option value="returned">Đã trả</Select.Option>
                    <Select.Option value="overdue">Quá hạn</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8}>
                  <Space>
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={handleExportHistoryReport}
                      loading={pdfLoading}
                    >
                      Xuất báo cáo
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              columns={assignmentColumns}
              dataSource={getFilteredIssuances()}
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
                    value={reportSearchTerm}
                    onChange={(e) => setReportSearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Lọc theo loại"
                    style={{ width: '100%' }}
                    allowClear
                    value={reportTypeFilter}
                    onChange={(value) => setReportTypeFilter(value || '')}
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
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setReportSearchTerm('');
                        setReportTypeFilter('');
                        loadReports();
                      }}
                    >
                      Làm mới
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {loading.reports ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            ) : (() => {
              // Filter reports based on search term and type filter
              const filteredReports = reports.filter((report: any) => {
                const matchesSearch = !reportSearchTerm || 
                  report.report_name?.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                  report.description?.toLowerCase().includes(reportSearchTerm.toLowerCase());
                const matchesType = !reportTypeFilter || report.report_type === reportTypeFilter;
                return matchesSearch && matchesType;
              });

              if (filteredReports.length === 0 && reports.length > 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Empty description="Không tìm thấy báo cáo nào phù hợp với bộ lọc" />
                  </div>
                );
              }

              if (filteredReports.length === 0 && reports.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Empty description="Chưa có báo cáo nào. Hãy tạo báo cáo mới." />
                  </div>
                );
              }

              return (
                <Table
                  columns={reportColumns}
                  dataSource={filteredReports}
                  rowKey={(record) => record.id || record._id}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} của ${total} báo cáo`,
                  }}
                />
              );
            })()}
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
        destroyOnHidden
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

              <Descriptions.Item label="Số lượng đã phát">
                <Badge count={selectedIssuance.quantity} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              
              {selectedIssuance.remaining_quantity !== undefined && (
                <Descriptions.Item label="Số lượng đã trả">
                  <Badge 
                    count={selectedIssuance.quantity - (selectedIssuance.remaining_quantity || 0)} 
                    style={{ backgroundColor: '#1890ff' }} 
                  />
                </Descriptions.Item>
              )}
              
              {selectedIssuance.remaining_quantity !== undefined && (
                <Descriptions.Item label="Số lượng còn lại">
                  <Badge 
                    count={selectedIssuance.remaining_quantity || 0} 
                    style={{ backgroundColor: '#fa8c16' }} 
                  />
                </Descriptions.Item>
              )}
              
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
                {selectedIssuance.status === 'pending_manager_return' && (
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

      <PPEAssignmentDetailsModal
        visible={assignmentDetailsVisible}
        onCancel={() => {
          setAssignmentDetailsVisible(false);
          setSelectedAssignmentId(null);
        }}
        assignmentId={selectedAssignmentId}
        onUpdate={() => {
          // Reload assignments data
          loadAllData();
        }}
      />

      {/* Issue to Manager Modal */}
      <IssueToManagerModal
        visible={showIssueToManagerModal}
        onCancel={() => setShowIssueToManagerModal(false)}
        onSuccess={() => {
          loadAllData();
          setShowIssueToManagerModal(false);
        }}
      />

      {/* Issue to Employee Modal */}
      <IssueToEmployeeModal
        visible={showIssueToEmployeeModal}
        onCancel={() => {
          setShowIssueToEmployeeModal(false);
          setSelectedManager(null);
        }}
        onSuccess={() => {
          loadAllData();
          setShowIssueToEmployeeModal(false);
          setSelectedManager(null);
        }}
        managerId={selectedManager?.id || selectedManager?._id || ''}
      />

      {/* Advanced Features Modals */}
      <BatchIssuanceModal
        visible={showBatchIssuanceModal}
        onCancel={() => setShowBatchIssuanceModal(false)}
        onSuccess={() => {
          loadAllData();
          setShowBatchIssuanceModal(false);
        }}
        issuanceLevel="admin"
      />

      <ExpiryManagementModal
        visible={showExpiryManagementModal}
        onCancel={() => setShowExpiryManagementModal(false)}
        onSuccess={() => {
          loadAllData();
          setShowExpiryManagementModal(false);
        }}
      />

      <OptimisticLockingModal
        visible={showOptimisticLockingModal}
        onCancel={() => setShowOptimisticLockingModal(false)}
        onSuccess={() => {
          loadAllData();
          setShowOptimisticLockingModal(false);
        }}
        itemId={selectedItem?.id}
      />

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        visible={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        reportData={previewReportData}
        reportType={previewReportType}
        onDownload={handleDownloadFromPreview}
        loading={pdfLoading}
      />
    </div>
  );
};

export default PPEManagement;
