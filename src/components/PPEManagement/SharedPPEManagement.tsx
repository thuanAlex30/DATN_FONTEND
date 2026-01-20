import React, { useState, useEffect, useMemo } from 'react';
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
  Tag,
  Tooltip,
  Table,
  Alert,
  Progress,
  Image,
  Avatar
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
  ToolOutlined,
  TeamOutlined,
  SendOutlined,
  UserOutlined,
  PlusOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import * as ppeService from '../../services/ppeService';
import type { PPEIssuance } from '../../services/ppeService';
import dayjs from 'dayjs';
import { usePPEWebSocket } from '../../hooks/usePPEWebSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import IssueToEmployeeModal from '../../pages/header_department/PPEManagement/IssueToEmployeeModal';
import PPEReturnConfirmationModal from '../../pages/Manager/PPEManagement/PPEReturnConfirmationModal';
import PPEAssignmentHistoryModal from '../../pages/Manager/PPEManagement/PPEAssignmentHistoryModal';
import { ENV } from '../../config/env';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Modal state for serials display
// (shows serial numbers only when user requests)
// Using local state in this component

interface ManagerPPE {
  item: {
    id: string;
    item_name: string;
    item_code: string;
    brand?: string;
    model?: string;
    quantity_available: number;
  };
  total_received: number;
  total_issued_to_employees: number;
  total_returned: number;
  remaining: number;
  remaining_in_hand?: number;
  availableToReturn?: number;
  employee_issuances?: any[];
  employee_issuances_counts?: {
    pending: number;
    issued: number;
    returned: number;
    total: number;
  };
  currentlyHeldByEmployees?: number;
  issuances: PPEIssuance[];
}

// local state hook definitions (placed near component body)

interface SharedPPEManagementProps {
  userRole: 'employee' | 'manager';
  layoutComponent: React.ComponentType<any>;
}

const SharedPPEManagement: React.FC<SharedPPEManagementProps> = ({
  userRole,
  layoutComponent: LayoutComponent
}) => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]);
  const [managerPPE, setManagerPPE] = useState<ManagerPPE[]>([]);
  const [employeePPE, setEmployeePPE] = useState<PPEIssuance[]>([]);
  const [ppeHistory, setPpeHistory] = useState<PPEIssuance[]>([]);
  const [loading, setLoading] = useState(false);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnPPEModalVisible, setReturnPPEModalVisible] = useState(false);
  const [selectedIssuanceForReturn, setSelectedIssuanceForReturn] = useState<PPEIssuance | null>(null);
  const [returnForm] = Form.useForm();
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [viewReportModalVisible, setViewReportModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<PPEIssuance | null>(null);
  const [selectedManagerSummary, setSelectedManagerSummary] = useState<any | null>(null);
  const [ppeStats, setPpeStats] = useState({
    totalItems: 0,
    totalReceived: 0,
    totalIssuedToEmployees: 0,
    totalReturned: 0,
    totalRemaining: 0,
    overdueCount: 0,
    pendingConfirmationCount: 0
  });

  // Form instances
  const [reportForm] = Form.useForm();
  const [confirmForm] = Form.useForm();

  const isManager = userRole === 'manager';
  // Serial modal state
  const [serialsModalVisible, setSerialsModalVisible] = useState(false);
  const [serialsModalData, setSerialsModalData] = useState<{ serials: string[]; title?: string }>({ serials: [], title: '' });

  const openSerialsModal = (serials: string[], title?: string) => {
    setSerialsModalData({ serials: serials || [], title: title || '' });
    setSerialsModalVisible(true);
  };
  const closeSerialsModal = () => {
    setSerialsModalVisible(false);
    setSerialsModalData({ serials: [], title: '' });
  };
  // note: closeSerialsModal intentionally left for potential external use
  // reference to avoid 'declared but not used' linter warning
  void closeSerialsModal;
  
  // Helper function to resolve image URL
  const apiBaseForImages = useMemo(() => {
    return ENV.API_BASE_URL.replace(/\/api\/?$/, '');
  }, []);

  const resolveImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${apiBaseForImages}${url}`;
  };

  const handleRefresh = () => {
    setLoading(true);
    const tasks = [loadUserPPE()];
    if (isManager) {
      tasks.push(loadManagerPPE(), loadEmployeePPE(), loadPPEHistory());
    } else {
      tasks.push(loadEmployeePPEHistory());
    }
    Promise.all(tasks).finally(() => setLoading(false));
  };

  // WebSocket hook for realtime updates
  const { isConnected } = usePPEWebSocket({
    userId: user?.id,
    token: token || '',
    showNotifications: true,
    onPPEDistributed: (data) => {
      console.log('PPE distributed to me:', data);
      loadUserPPE();
      if (isManager) {
        loadManagerPPE();
      }
    },
    onPPEReturned: (data) => {
      console.log('PPE returned:', data);
      loadUserPPE();
      if (isManager) {
        loadManagerPPE();
        loadEmployeePPE();
      } else {
        loadEmployeePPEHistory();
      }
    },
    onPPEReported: (data) => {
      console.log('PPE reported:', data);
      loadUserPPE();
      if (!isManager) {
        loadEmployeePPEHistory();
      }
    },
    onPPEQuantityUpdate: (data) => {
      console.log('PPE quantity updated:', data);
      if (isManager) {
        loadManagerPPE();
        loadEmployeePPE();
      } else {
        loadEmployeePPEHistory();
      }
      loadUserPPE();
    }
  });

  useEffect(() => {
    loadUserPPE();
    if (isManager) {
      loadManagerPPE();
      loadEmployeePPE();
      loadPPEHistory();
    } else {
      // Load PPE history for employee
      loadEmployeePPEHistory();
    }
  }, [isManager]);

  // (listener moved below after loader function definitions)

  const loadUserPPE = async () => {
    try {
      setLoading(true);
      const data = await ppeService.getMyPPEIssuances();
      setPpeIssuances(data);
    } catch (error) {
      console.error('Error loading user PPE:', error);
      message.error('Không thể tải danh sách PPE');
    } finally {
      setLoading(false);
    }
  };

  const loadManagerPPE = async () => {
    try {
      const response = await ppeService.getManagerPPE();
      // Debug log raw response shape to help diagnose mismatched counts
      console.debug('loadManagerPPE raw response:', response);

      // Normalize various possible response shapes:
      // - { success: true, data: { ppe_summary: [...] } }
      // - { data: { ppe_summary: [...] } }
      // - { ppe_summary: [...] }
      // - direct array [...]
      const raw = response && (response.data?.ppe_summary ?? response.ppe_summary ?? response.data ?? response) || {};
      let summaryArray: any[] = [];
      if (Array.isArray(raw)) {
        summaryArray = raw;
      } else if (Array.isArray(raw.ppe_summary)) {
        summaryArray = raw.ppe_summary;
      } else if (Array.isArray(raw.ppeSummary)) {
        summaryArray = raw.ppeSummary;
      } else if (Array.isArray(response.data)) {
        summaryArray = response.data;
      }

      // Normalize numeric fields and ensure issuances exist
      const ppeSummaryWithRemaining = summaryArray.map((ppe: any) => {
        const normalizedIssuances = Array.isArray(ppe.issuances) ? ppe.issuances.map((issuance: any) => ({
          ...issuance,
          // Giữ remaining_quantity từng lần phát nếu có; fallback về item-level nếu thiếu
          remaining_quantity: (issuance.remaining_quantity !== undefined && issuance.remaining_quantity !== null)
            ? Number(issuance.remaining_quantity)
            : (Number(ppe.remaining_in_hand) || Number(ppe.remaining) || Number(ppe.remaining_quantity) || 0),
          remaining_in_hand: Number(ppe.remaining_in_hand) || ppe.remaining_in_hand || 0,
          total_issued_to_employees: Number(ppe.total_issued_to_employees) || ppe.total_issued_to_employees || 0
        })) : [];

        // Tính lại số còn lại ở Manager dựa trên các issuance Admin → Manager
        const adminIssuances = normalizedIssuances.filter((iss: any) => {
          const lvl = (iss.issuance_level || iss.level || iss.issuanceLevel || '').toString().toLowerCase();
          return lvl.includes('admin');
        });
        let remainingAtManager = 0;
        for (const iss of adminIssuances) {
          const qty = Number(iss.quantity || 0);
          const rem = (iss.remaining_quantity !== undefined && iss.remaining_quantity !== null)
            ? Number(iss.remaining_quantity)
            : qty;
          remainingAtManager += rem;
        }
        if (!adminIssuances.length) {
          remainingAtManager = Number(ppe.remaining_in_hand) || Number(ppe.remaining) || Number(ppe.remaining_quantity) || 0;
        }

        return {
          ...ppe,
          total_received: Number(ppe.total_received) || 0,
          total_issued_to_employees: Number(ppe.total_issued_to_employees) || 0,
          total_returned: Number(ppe.total_returned) || 0,
          // Cột "Còn lại" trong bảng Manager = số PPE còn tại Manager (không tính số đang ở Employee).
          remaining: remainingAtManager,
          issuances: normalizedIssuances,
          employee_issuances: ppe.employee_issuances || []
        } as ManagerPPE;
      });

      setManagerPPE(ppeSummaryWithRemaining);
      calculateStats(ppeSummaryWithRemaining);
    } catch (error) {
      console.error('Error loading manager PPE:', error);
      message.error('Lỗi khi tải PPE của Manager');
    }
  };

  const loadEmployeePPE = async () => {
    try {
      let response;
      if (isManager) {
        // Manager xem PPE của employees trong department
        response = await ppeService.getDepartmentEmployeesPPE();
      } else {
        // Employee xem PPE của chính họ
        response = await ppeService.getEmployeePPE();
      }
      
      if (response.success) {
        setEmployeePPE(response.data.issuances);
      }
    } catch (error) {
      console.error('Error loading employee PPE:', error);
      message.error('Lỗi khi tải PPE của Employee');
    }
  };

  const loadPPEHistory = async () => {
    if (!isManager) return;
    
    try {
      const response = await ppeService.getManagerPPEHistory();

      // Normalize possible response shapes:
      // - Array directly
      // - { success, data: { history: [...] } }
      // - { success, data: [...] }
      // - { history: [...] }
      // - { data: { data: [...] } } (nested)
      let historyArr: any[] = [];

      if (!response) {
        historyArr = [];
      } else if (Array.isArray(response)) {
        historyArr = response as any[];
      } else if (Array.isArray((response as any).history)) {
        historyArr = (response as any).history;
      } else if (Array.isArray((response as any).data) && !(response as any).data.history) {
        historyArr = (response as any).data;
      } else if (Array.isArray((response as any).data?.history)) {
        historyArr = (response as any).data.history;
      } else if (Array.isArray((response as any).data?.data)) {
        historyArr = (response as any).data.data;
      } else if ((response as any).success && Array.isArray((response as any).data?.issuances)) {
        historyArr = (response as any).data.issuances;
      } else {
        // last resort: try to find any array-valued field
        const maybeArray = Object.values(response).find(v => Array.isArray(v));
        historyArr = Array.isArray(maybeArray) ? (maybeArray as any[]) : [];
      }

      // Manager history tab chỉ hiển thị các lượt phát Manager → Employee,
      // KHÔNG hiển thị các lượt Admin → Manager để tránh nhầm với cấp phát của Header.
      const managerToEmployeeHistory = historyArr.filter((iss: any) => {
        if (!iss) return false;
        const rawLevel = iss.issuance_level || iss.level || iss.issuanceLevel || iss.type || iss.issuance_type || '';
        const v = String(rawLevel).toLowerCase().replace(/[^a-z0-9]/g, '');
        const hasManagerId = iss.manager_id || iss.managerId;

        if (v) {
          if (v === 'manager_to_employee' || v === 'managertoemployee') return true;
          if (v.includes('manager') && v.includes('employee')) return true;
          // Nếu level rõ ràng là admin_to_manager thì loại bỏ
          if (v === 'admin_to_manager' || v === 'admintomanager' || (v.includes('admin') && v.includes('manager'))) return false;
        }

        // Fallback cấu trúc: có manager_id thì coi là manager → employee
        return !!hasManagerId;
      });

      setPpeHistory(managerToEmployeeHistory);
    } catch (error) {
      console.error('Error loading PPE history:', error);
      message.error('Lỗi khi tải lịch sử PPE');
    }
  };

  const loadEmployeePPEHistory = async () => {
    if (isManager) return;
    
    try {
      const data = await ppeService.getMyPPEIssuances();
      setPpeHistory(data);
    } catch (error) {
      console.error('Error loading employee PPE history:', error);
      message.error('Lỗi khi tải lịch sử PPE');
    }
  };

  const calculateStats = (ppeData: ManagerPPE[]) => {
    const stats = ppeData.reduce((acc, ppe) => {
      // Tính toán lại tổng nhận & còn lại dựa trên các issuance Admin → Manager,
      // nhưng giữ nguyên total_returned từ backend (chỉ đếm các lần thực sự trả về Header).
      const adminIssuances = Array.isArray((ppe as any).issuances) ? (ppe as any).issuances : [];
      let totalReceived = 0;
      let remainingAtManager = 0;

      for (const iss of adminIssuances) {
        const qty = Number(iss.quantity || 0);
        const remaining =
          iss.remaining_quantity !== undefined && iss.remaining_quantity !== null
            ? Number(iss.remaining_quantity)
            : qty;

        totalReceived += qty;
        remainingAtManager += remaining;
      }

      // Fallback: nếu backend đã tính sẵn total_received nhưng không có issuances (trường hợp bất thường)
      if (!adminIssuances.length) {
        totalReceived = Number((ppe as any).total_received) || 0;
        remainingAtManager = Number((ppe as any).remaining_in_hand) || Number((ppe as any).remaining) || 0;
      }

      const totalIssuedToEmployees = Number((ppe as any).total_issued_to_employees) || 0;
      const totalReturnedToHeader = Number((ppe as any).total_returned) || 0;
      const totalReturnedByEmployees = Number((ppe as any).total_returned_by_employees) || 0;

      // Đã phát cho Employee (hiển thị trong thống kê) = tổng đã phát - tổng Employee đã trả
      const netIssuedToEmployees = Math.max(0, totalIssuedToEmployees - totalReturnedByEmployees);

      if (totalReceived > 0) {
        acc.totalItems += 1;
      }

      acc.totalReceived += totalReceived;
      acc.totalIssuedToEmployees += netIssuedToEmployees;
      acc.totalReturned += totalReturnedToHeader;
      acc.totalRemaining += Math.max(0, remainingAtManager);

      return acc;
    }, {
      totalItems: 0,
      totalReceived: 0,
      totalIssuedToEmployees: 0,
      totalReturned: 0,
      totalRemaining: 0,
      overdueCount: 0,
      pendingConfirmationCount: 0
    });

    setPpeStats(stats);
  };

  // Listen for global PPE refresh events (dispatched after mutations)
  useEffect(() => {
    const handler = () => {
      setLoading(true);
      loadUserPPE();
      if (isManager) {
        Promise.allSettled([loadManagerPPE(), loadEmployeePPE(), loadPPEHistory()]).finally(() => setLoading(false));
      } else {
        loadEmployeePPEHistory().finally(() => setLoading(false));
      }
    };
    window.addEventListener('ppe:refresh', handler);
    return () => window.removeEventListener('ppe:refresh', handler);
  }, [isManager, loadUserPPE, loadManagerPPE, loadEmployeePPE, loadPPEHistory, loadEmployeePPEHistory]);

  // Removed unused employee stats calculation

  const handleReturnToAdmin = (issuance: any, managerSummary?: any) => {
    // For employees, show return PPE modal with serial selection
    if (!isManager && issuance.assigned_serial_numbers && issuance.assigned_serial_numbers.length > 0) {
      setSelectedIssuanceForReturn(issuance);
      setReturnPPEModalVisible(true);
    } else {
      // For managers, show existing return modal
      setSelectedIssuance(issuance);
      setSelectedManagerSummary(managerSummary || null);
      setReturnModalVisible(true);
    }
  };

  const handleReturnPPE = async (values: any) => {
    if (!selectedIssuanceForReturn) return;

    setLoading(true);
    try {
      const returnData: any = {
        actual_return_date: values.actual_return_date.toISOString(),
        // Employee không cần chọn tình trạng, mặc định là 'good' khi trả
        return_condition: 'good',
        returned_serial_numbers: values.returned_serial_numbers,
        notes: values.notes || ''
      };

      await ppeService.returnPPEIssuanceEmployee(selectedIssuanceForReturn.id, returnData);
      message.success('Đã trả PPE thành công, chờ Manager xác nhận');
      setReturnPPEModalVisible(false);
      setSelectedIssuanceForReturn(null);
      returnForm.resetFields();
      // Reload data
      loadEmployeePPE();
    } catch (error: any) {
      console.error('Error returning PPE:', error);
      message.error(error.response?.data?.message || 'Lỗi khi trả PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    setHistoryModalVisible(true);
  };

  const handleReportPPE = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    reportForm.setFieldsValue({
      report_type: 'damage',
      description: '',
      severity: 'medium',
      reported_date: dayjs()
    });
    setReportModalVisible(true);
  };

  // Xem báo cáo hư hỏng đã tạo
  const handleViewDamageReport = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    setViewReportModalVisible(true);
  };

  // Helper để hiển thị loại báo cáo
  const getReportTypeLabel = (type?: string) => {
    switch (type) {
      case 'damage': return 'Hư hại';
      case 'replacement': return 'Cần thay thế';
      case 'lost': return 'Mất';
      default: return 'Không xác định';
    }
  };

  // Helper để hiển thị mức độ nghiêm trọng
  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'low': return { label: 'Thấp', color: 'green' };
      case 'medium': return { label: 'Trung bình', color: 'orange' };
      case 'high': return { label: 'Cao', color: 'red' };
      default: return { label: 'Không xác định', color: 'default' };
    }
  };

  const handleReportSubmit = async (values: any) => {
    if (!selectedIssuance) return;

    setLoading(true);
    try {
      await ppeService.reportPPEIssuanceEmployee(selectedIssuance.id, {
        report_type: values.report_type,
        description: values.description,
        severity: values.severity,
        reported_date: values.reported_date.format('YYYY-MM-DD')
      });

      message.success('Báo cáo sự cố thành công!');
      reportForm.resetFields();
      setReportModalVisible(false);
      setSelectedIssuance(null);
      loadUserPPE();
    } catch (error: any) {
      console.error('Error reporting PPE:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi báo cáo sự cố');
    } finally {
      setLoading(false);
    }
  };

  // Employee xác nhận nhận PPE từ Manager hoặc Manager xác nhận nhận PPE từ Header Department
  const handleConfirmReceived = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    confirmForm.setFieldsValue({
      confirmation_notes: ''
    });
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async (values: any) => {
    if (!selectedIssuance) return;

    setLoading(true);
    try {
      // Kiểm tra nếu là Manager xác nhận nhận PPE từ Header Department
      if (isManager && selectedIssuance.issuance_level === 'admin_to_manager') {
        // Manager xác nhận nhận PPE từ Header Department
        // Sử dụng API confirmReceivedPPE nhưng với logic khác (cần backend hỗ trợ)
        // Tạm thời dùng API confirmReceivedPPE, backend sẽ cần mở rộng để hỗ trợ admin_to_manager
        await ppeService.confirmReceivedPPE(selectedIssuance.id, {
          confirmation_notes: values.confirmation_notes || ''
        });
      } else {
        // Employee xác nhận nhận PPE từ Manager
        await ppeService.confirmReceivedPPE(selectedIssuance.id, {
          confirmation_notes: values.confirmation_notes || ''
        });
      }

      message.success('Xác nhận nhận PPE thành công!');
      confirmForm.resetFields();
      setConfirmModalVisible(false);
      setSelectedIssuance(null);
      loadUserPPE();
      if (isManager) {
        loadManagerPPE();
        loadEmployeePPE();
      } else {
        loadEmployeePPEHistory();
      }
    } catch (error: any) {
      console.error('Error confirming PPE:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận nhận PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSuccess = () => {
    loadManagerPPE();
    loadEmployeePPE();
    setIssueModalVisible(false);
  };

  const handleReturnSuccess = () => {
    loadUserPPE();
    if (isManager) {
      loadManagerPPE();
      loadEmployeePPE();
    }
    setReturnModalVisible(false);
    setSelectedIssuance(null);
  };

  // Manager xác nhận nhận PPE từ Employee
  const handleConfirmEmployeeReturn = async (issuance: PPEIssuance) => {
    Modal.confirm({
      title: 'Xác nhận nhận PPE từ Employee',
      content: `Bạn xác nhận đã nhận PPE "${typeof issuance.item_id === 'object' ? issuance.item_id.item_name : ''}" từ ${typeof issuance.user_id === 'object' ? issuance.user_id.full_name : ''}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await ppeService.confirmEmployeeReturn(issuance.id);
          message.success('Xác nhận nhận PPE thành công!');
          // Immediately reload manager and department employee PPE data
          // Run in parallel and don't block the UI on slow endpoints
          Promise.allSettled([
            loadManagerPPE(),
            loadEmployeePPE(),
            loadUserPPE(),
            loadPPEHistory()
          ]).then(results => {
            console.debug('Post-confirm reload results:', results);
          });
        } catch (error: any) {
          console.error('Error confirming employee return:', error);
          message.error(error.message || 'Có lỗi xảy ra khi xác nhận nhận PPE');
        }
      }
    });
  };

  const getActiveIssuances = () => {
    // Nếu là Manager, lấy từ managerPPE (có remaining_quantity)
    if (isManager && managerPPE.length > 0) {
      const allIssuances = managerPPE.flatMap(ppe => ppe.issuances || []);
      return allIssuances.filter(issuance => 
        issuance.status === 'pending_confirmation' || // PPE từ Header Department chờ xác nhận
        issuance.status === 'issued' || 
        issuance.status === 'overdue' ||
        issuance.status === 'damaged' ||
        issuance.status === 'replacement_needed' ||
        issuance.status === 'pending_manager_return'
      );
    }
    
    // Nếu là Employee, lấy từ ppeIssuances
    return ppeIssuances.filter(issuance => 
      issuance.status === 'pending_confirmation' || // hiển thị để Employee có thể xác nhận
      issuance.status === 'issued' || 
      issuance.status === 'overdue' ||
      issuance.status === 'damaged' ||
      issuance.status === 'replacement_needed' ||
      issuance.status === 'pending_manager_return'
    );
  };

  const getReturnedIssuances = () => {
    if (isManager && managerPPE.length > 0) {
      // Manager: tính số PPE đã trả từ managerPPE stats
      return managerPPE.reduce((total, ppe) => total + ppe.total_returned, 0);
    }
    
    // Employee: đếm issuances có status 'returned'
    return ppeIssuances.filter(issuance => issuance.status === 'returned').length;
  };

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      'pending_confirmation': 'Chờ xác nhận',
      'issued': 'Đang sử dụng',
      'returned': 'Đã trả',
      'overdue': 'Quá hạn',
      'damaged': 'Hư hại',
      'replacement_needed': 'Cần thay thế',
      'pending_manager_return': 'Chờ Manager xác nhận'
    };
    const label = labels[status] || (!status ? 'Không xác định' : status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    // Debug: log mapping for troubleshooting
    // eslint-disable-next-line no-console
    console.debug('[getStatusLabel]', { status, label });
    return label;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending_confirmation': 'orange',
      'issued': 'blue',
      'returned': 'green',
      'overdue': 'red',
      'damaged': 'orange',
      'replacement_needed': 'purple',
      'pending_manager_return': 'gold'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'pending_confirmation': <ClockCircleOutlined />,
      'issued': <CheckCircleOutlined />,
      'returned': <UndoOutlined />,
      'overdue': <ExclamationCircleOutlined />,
      'damaged': <WarningOutlined />,
      'replacement_needed': <ToolOutlined />
    };
    return icons[status] || <InfoCircleOutlined />;
  };

  // If an issuance's assigned serial numbers appear in any returned history record,
  // consider that issuance (or the matching serials) returned.
  const issuanceHasReturnedSerials = (issuance: any): boolean => {
    try {
      const serials: string[] = issuance?.assigned_serial_numbers || [];
      if (!serials || serials.length === 0) return false;
      // ppeHistory contains past issuances/returns; look for returned entries with returned_serial_numbers
      for (const hist of ppeHistory || []) {
        if (!hist || !Array.isArray(hist.returned_serial_numbers) || hist.returned_serial_numbers.length === 0) continue;
        const returnedSet = new Set(hist.returned_serial_numbers.map((s: any) => String(s)));
        for (const s of serials) {
          if (returnedSet.has(String(s))) return true;
        }
      }
      return false;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('issuanceHasReturnedSerials error', e);
      return false;
    }
  };

  // Compute which issuance ids should be considered returned based on aggregated returns for the same item.
  const computeReturnedIssuanceIdsForSummary = (summary: any): Set<string> => {
    const result = new Set<string>();
    try {
      const itemId = (summary.item && (((summary.item as any).id) || ((summary.item as any)._id))) || summary.item_id;
      if (!itemId) return result;

      // Calculate total returned count for this item from history
      let totalReturnedCount = 0;
      for (const hist of ppeHistory || []) {
        const histItemId = (hist.item_id && (((hist.item_id as any).id) || ((hist.item_id as any)._id))) || hist.item_id;
        if (!histItemId) continue;
        if (String(histItemId) !== String(itemId)) continue;
        if (Array.isArray(hist.returned_serial_numbers) && hist.returned_serial_numbers.length > 0) {
          totalReturnedCount += hist.returned_serial_numbers.length;
        } else if (typeof hist.remaining_quantity === 'number') {
          totalReturnedCount += Math.max(0, (hist.quantity || 0) - hist.remaining_quantity);
        } else if (hist.status === 'returned') {
          totalReturnedCount += (hist.quantity || 0);
        }
      }

      if (totalReturnedCount <= 0) return result;

      // Determine which issuance entries (from summary.issuances) are consumed by returned count.
      const issuances = Array.isArray(summary.issuances) ? [...summary.issuances] : [];
      // sort by issued_date ascending (oldest first)
      issuances.sort((a: any, b: any) => new Date(a.issued_date).getTime() - new Date(b.issued_date).getTime());
      let remainingToMark = totalReturnedCount;
      for (const iss of issuances) {
        const qty = Number(iss.quantity || 0);
        if (remainingToMark <= 0) break;
        if (qty <= remainingToMark) {
          if (iss.id) result.add(iss.id);
          remainingToMark -= qty;
        } else {
          // partial consumption: mark this issuance as partially returned if remainingToMark > 0
          if (iss.id) result.add(iss.id);
          remainingToMark = 0;
          break;
        }
      }
      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('computeReturnedIssuanceIdsForSummary error', e);
      return result;
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  const isOverdue = (expectedReturnDate: string): boolean => {
    return new Date(expectedReturnDate) < new Date();
  };

  const managerPPEColumns = [
    {
      title: 'Thiết bị PPE',
      dataIndex: ['item', 'item_name'],
      key: 'item_name',
      render: (text: string, record: ManagerPPE) => {
        const imageUrl = (record.item as any)?.image_url;
        return (
          <Space>
            {imageUrl ? (
              <Image
                src={resolveImageUrl(imageUrl)}
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
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.item.item_code}
              </Text>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Đã nhận từ Header Department',
      dataIndex: 'total_received',
      key: 'total_received',
      render: (value: number) => (
        <Tag color="blue" icon={<InboxOutlined />}>
          {value}
        </Tag>
      )
    },
    {
      title: 'Đã phát cho Employee',
      dataIndex: 'total_issued_to_employees',
      key: 'total_issued_to_employees',
      render: (_: number, record: ManagerPPE) => {
        const totalIssued = Number((record as any).total_issued_to_employees) || 0;
        const totalReturnedByEmployees = Number((record as any).total_returned_by_employees) || 0;
        const netIssued = Math.max(0, totalIssued - totalReturnedByEmployees);
        return (
          <Tag color="purple" icon={<SendOutlined />}>
            {netIssued}
          </Tag>
        );
      }
    },
    {
      title: 'Đã trả cho Header Department',
      dataIndex: 'total_returned',
      key: 'total_returned',
      render: (value: number) => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {value}
        </Tag>
      )
    },
    {
      title: 'Còn lại',
      dataIndex: 'remaining',
      key: 'remaining',
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'red'} icon={<NumberOutlined />}>
          {value}
        </Tag>
      )
    },
    {
      title: 'Tỷ lệ sử dụng',
      key: 'usage_rate',
      render: (record: ManagerPPE) => {
        const rate = record.total_received > 0 ? (record.total_returned / record.total_received) * 100 : 0;
        const percent = Math.min(100, Math.max(0, Math.round(rate)));
        return (
          <Progress
            percent={percent}
            size="small"
            status={percent >= 80 ? 'success' : percent >= 50 ? 'normal' : 'exception'}
          />
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: ManagerPPE) => {
        // Kiểm tra xem có PPE nào chưa xác nhận nhận từ Header Department không
        const hasUnconfirmedPPE = record.issuances.some(issuance => 
          issuance.status === 'pending_confirmation' && issuance.issuance_level === 'admin_to_manager'
        );
        
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={() => setIssueModalVisible(true)}
              disabled={record.remaining === 0 || hasUnconfirmedPPE}
              title={hasUnconfirmedPPE ? 'Vui lòng xác nhận nhận PPE từ Header Department trước khi phát cho Employee' : ''}
            >
              Phát cho Employee
            </Button>
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record.issuances[0])}
            >
              Lịch sử
            </Button>
          </Space>
        );
      }
    }
  ];

  const employeePPEColumns = [
    {
      title: 'Employee',
      dataIndex: ['user_id', 'full_name'],
      key: 'user_name',
      render: (text: string, record: PPEIssuance) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {typeof record.user_id === 'object' && record.user_id ? record.user_id.email : 'N/A'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Thiết bị PPE',
      dataIndex: ['item_id', 'item_name'],
      key: 'item_name',
      render: (text: string, record: PPEIssuance) => {
        const item = typeof record.item_id === 'object' && record.item_id ? record.item_id : null;
        const imageUrl = (item as any)?.image_url;
        return (
          <Space>
            {imageUrl ? (
              <Image
                src={resolveImageUrl(imageUrl)}
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
              <div>{text}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {item?.item_code || 'N/A'}
              </Text>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number, record: PPEIssuance) => (
        <Space>
          <Tag color="blue" icon={<NumberOutlined />}>
            Tổng: {value}
          </Tag>
          {record.remaining_quantity !== undefined && (
            <Tag color={record.remaining_quantity > 0 ? 'green' : 'red'}>
              Còn: {record.remaining_quantity}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Ngày phát',
      dataIndex: 'issued_date',
      key: 'issued_date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY')}
        </Space>
      )
    },
    {
      title: 'Ngày trả dự kiến',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date',
      render: (date: string) => {
        const isOverdueItem = isOverdue(date);
        return (
          <Space>
            <CalendarOutlined style={{ color: isOverdueItem ? '#ff4d4f' : '#52c41a' }} />
            <Text style={{ color: isOverdueItem ? '#ff4d4f' : '#52c41a' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </Text>
            {isOverdueItem && <Tag color="red">Quá hạn</Tag>}
          </Space>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        return (
          <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
            {getStatusLabel(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: PPEIssuance) => (
        <Space>
          {record.status === 'pending_manager_return' ? (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirmEmployeeReturn(record)}
            >
              Xác nhận nhận
            </Button>
          ) : (
            <Tooltip title={
              record.status === 'returned' ? 'Đã trả' :
              (record.remaining_quantity || record.quantity) <= 0 ? 'Không còn PPE để trả' :
              'Xem chi tiết'
            }>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewHistory(record)}
              >
                Chi tiết
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <LayoutComponent>
      <div style={{ 
        padding: '24px',
        maxWidth: '100%',
        width: '100%',
        overflowX: 'hidden',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        boxSizing: 'border-box'
      }}>
        {/* Header Section */}
        <Card 
          style={{ 
            marginBottom: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.05)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(20px)'
          }}
          bodyStyle={{ padding: '28px 32px' }}
        >
          <div style={{ marginBottom: '12px' }}>
            <Title level={2} style={{ 
              margin: 0,
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              fontSize: '28px',
              letterSpacing: '-0.02em'
            }}>
              <SafetyOutlined style={{ marginRight: '12px', fontSize: '28px' }} />
              Quản lý PPE - {isManager ? 'Manager' : 'Employee'}
            </Title>
          </div>
          <Text type="secondary" style={{ fontSize: '15px', color: '#64748b', fontWeight: 500 }}>
            {isManager 
              ? 'Quản lý PPE nhận từ Header Department và phân phối cho Employee'
              : 'Quản lý PPE cá nhân được phát từ Manager'
            }
          </Text>
        </Card>

        {/* WebSocket Status */}
        <Alert
          message={`WebSocket: ${isConnected ? 'Đã kết nối' : 'Mất kết nối'}`}
          type={isConnected ? 'success' : 'warning'}
          showIcon
          style={{ 
            marginBottom: '20px',
            borderRadius: '6px'
          }}
        />

        {/* Statistics Cards - General */}
        <Card 
          title="Tổng quan chung"
          style={{ 
            marginBottom: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          {isManager ? (
            <Row>
              <Col span={24}>
                <Card size="small" style={{ borderRadius: '6px', border: '1px solid #e8e8e8' }} bodyStyle={{ padding: '16px' }}>
                  <Statistic
                    title="Đã nhận từ Header Department"
                    value={ppeStats.totalReceived}
                    prefix={<InboxOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                  />
                </Card>
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title="Đang sử dụng"
                    value={getActiveIssuances().length}
                    prefix={<SafetyOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title="Đã trả"
                    value={getReturnedIssuances()}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title="Quá hạn"
                    value={ppeIssuances.filter(issuance => 
                      issuance.status === 'overdue' || 
                      isOverdue(issuance.expected_return_date)
                    ).length}
                    prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title="Tổng PPE đang giữ"
                    value={getActiveIssuances().length}
                    prefix={<InboxOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Card>

        {/* Employee-specific statistics */}
        {!isManager && (
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Chờ xác nhận"
                  value={ppeIssuances.filter(issuance => issuance.status === 'pending_confirmation').length}
                  prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Chờ Manager xác nhận"
                  value={ppeIssuances.filter(issuance => issuance.status === 'pending_manager_return').length}
                  prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={8}>
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
        )}

        {/* Manager-specific statistics */}
        {isManager && (
          <Card 
            title="Thống kê chi tiết - Manager"
            style={{ 
              marginBottom: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12} md={8} lg={6} xl={4}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title={<span style={{ fontSize: '13px' }}>Tổng thiết bị</span>}
                    value={ppeStats.totalItems}
                    prefix={<SafetyOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff', fontSize: '22px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={8} lg={6} xl={4}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title={<span style={{ fontSize: '13px' }}>Đã nhận từ Header Department</span>}
                    value={ppeStats.totalReceived}
                    prefix={<InboxOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a', fontSize: '22px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={8} lg={6} xl={4}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title={<span style={{ fontSize: '13px' }}>Đã phát cho Employee</span>}
                    value={ppeStats.totalIssuedToEmployees}
                    prefix={<SendOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1', fontSize: '22px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={8} lg={6} xl={4}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title={<span style={{ fontSize: '13px' }}>Đã trả cho Header Department</span>}
                    value={ppeStats.totalReturned}
                    prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
                    valueStyle={{ color: '#13c2c2', fontSize: '22px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={8} lg={6} xl={4}>
                <Card 
                  size="small"
                  style={{ 
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title={<span style={{ fontSize: '13px' }}>Còn lại</span>}
                    value={ppeStats.totalRemaining}
                    prefix={<NumberOutlined style={{ color: ppeStats.totalRemaining > 0 ? '#faad14' : '#ff4d4f' }} />}
                    valueStyle={{ color: ppeStats.totalRemaining > 0 ? '#faad14' : '#ff4d4f', fontSize: '22px' }}
                  />
                </Card>
              </Col>
              {/* Các thống kê chờ xác nhận được ẩn theo yêu cầu */}
            </Row>
          </Card>
        )}

        {/* Main Content */}
        <Card 
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            style={{ padding: '0 24px' }}
            tabBarStyle={{ marginBottom: 0, paddingTop: '16px' }}
            tabBarExtraContent={
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Làm mới
              </Button>
            }
          >
            <TabPane
              tab={
                <span>
                  <BarChartOutlined />
                  Tổng quan
                </span>
              }
              key="overview"
            >
              <div style={{ padding: '24px' }}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Card 
                      title="PPE hiện tại" 
                      size="small"
                      style={{ 
                        borderRadius: '6px',
                        border: '1px solid #e8e8e8'
                      }}
                      bodyStyle={{ padding: '20px' }}
                    >
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                      </div>
                    ) : (
                      <Row gutter={[16, 16]}>
                        { (isManager ? managerPPE.filter(p => ((p?.availableToReturn ?? p?.remaining ?? (p?.employee_issuances?.length ?? 0)) ?? 0) > 0) : getActiveIssuances()).map((issuanceOrItem: any) => {
                          const isManagerViewItem = isManager && issuanceOrItem && issuanceOrItem.item;
                          // For manager view, issuanceOrItem is a ManagerPPE summary for an item.
                          // For employee view, issuanceOrItem is a PPEIssuance.
                          let issuanceObj: any = null;
                          let itemObj: any = null;
                          if (isManagerViewItem) {
                            issuanceObj = (issuanceOrItem.issuances && issuanceOrItem.issuances[0]) || null;
                            itemObj = issuanceOrItem.item || (issuanceObj && issuanceObj.item_id) || null;
                          } else {
                            issuanceObj = issuanceOrItem;
                            itemObj = (issuanceObj && typeof issuanceObj.item_id === 'object') ? issuanceObj.item_id : null;
                          }
                          const isOverdueFlag = isOverdue(issuanceObj?.expected_return_date);
                          const imgUrl = (itemObj as any)?.image_url;
                          const issuance = issuanceObj || issuanceOrItem;
                          // If this is a manager summary, prefer the admin->manager issuance when returning to Admin
                          const adminIssuance = isManagerViewItem && Array.isArray(issuanceOrItem.issuances)
                            ? (issuanceOrItem.issuances.find((i: any) => {
                                const lvl = i.issuance_level || i.level || i.issuanceLevel || '';
                                const hasManagerId = !!(i.manager_id || i.managerId);
                                return String(lvl).toLowerCase().includes('admin') || !hasManagerId;
                              }) || issuanceOrItem.issuances[0])
                            : null;
                          const remainingForCard = isManagerViewItem
                            ? (issuanceOrItem.availableToReturn ?? issuanceOrItem.remaining ?? 0)
                            : (issuance?.remaining_quantity ?? issuance?.quantity ?? 0);

                          // Manager cần kiểm soát cả PPE đang ở Employee.
                          // currentlyHeldByEmployees được backend trả về trong summary.
                          const currentlyHeldByEmployeesForCard = isManagerViewItem
                            ? (issuanceOrItem.currentlyHeldByEmployees ?? 0)
                            : 0;

                          // Tổng số PPE đang lưu hành (Manager + Employee)
                          const totalQuantityForCard = isManagerViewItem
                            ? remainingForCard + currentlyHeldByEmployeesForCard
                            : (issuanceObj?.quantity ?? 0);
                          // Determine effective display status:
                          // - If this is a manager summary, compute returned issuance ids by aggregation and prefer those as returned
                          let displayStatus = (issuance?.status || '');
                          if (isManagerViewItem && issuanceOrItem) {
                            const returnedIds = computeReturnedIssuanceIdsForSummary(issuanceOrItem);
                            if (issuance && issuance.id && returnedIds.has(issuance.id)) {
                              displayStatus = 'returned';
                            } else if (issuanceHasReturnedSerials(issuance) || issuance?.actual_return_date || (Number(issuance?.remaining_quantity) <= 0 && issuance?.remaining_quantity !== undefined)) {
                              displayStatus = 'returned';
                            } else if (displayStatus === 'returned' && remainingForCard > 0) {
                              displayStatus = 'issued';
                            }
                          } else {
                            if (issuanceHasReturnedSerials(issuance) || issuance?.actual_return_date || (Number(issuance?.remaining_quantity) <= 0 && issuance?.remaining_quantity !== undefined)) {
                              displayStatus = 'returned';
                            } else if (displayStatus === 'returned' && remainingForCard > 0) {
                              displayStatus = 'issued';
                            }
                          }

                          // Chuẩn bị danh sách serial numbers để Manager có thể xem đầy đủ
                          let serialsForCard: string[] = [];
                          if (isManagerViewItem) {
                            const adminSerials = Array.isArray(issuanceOrItem.issuances)
                              ? (issuanceOrItem.issuances as any[]).flatMap((i: any) => i.assigned_serial_numbers || [])
                              : [];
                            const employeeSerials = Array.isArray(issuanceOrItem.employee_issuances)
                              ? (issuanceOrItem.employee_issuances as any[]).flatMap((i: any) => i.assigned_serial_numbers || [])
                              : [];
                            serialsForCard = Array.from(new Set([...adminSerials, ...employeeSerials].map((s) => String(s))));
                          } else {
                            serialsForCard = (issuanceObj?.assigned_serial_numbers as string[]) || [];
                          }
                          const activeSerialCountForCard = serialsForCard.length;

                          return (
                            <Col xs={24} sm={12} lg={8} xl={6} key={issuance.id}>
                              <Card
                                hoverable
                                style={{ 
                                  borderRadius: '8px',
                                  border: `1px solid ${isOverdueFlag ? '#ff4d4f' : '#e8e8e8'}`,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                                  height: '100%',
                                  transition: 'all 0.3s ease'
                                }}
                                bodyStyle={{ padding: '16px' }}
                                title={
                                  <Space style={{ width: '100%' }}>
                                    {imgUrl ? (
                                      <Image
                                        src={resolveImageUrl(imgUrl)}
                                        width={32}
                                        height={32}
                                        style={{ objectFit: 'cover', borderRadius: 6 }}
                                        preview={{ mask: 'Xem ảnh' }}
                                        fallback=""
                                      />
                                    ) : (
                                      <SafetyOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                    )}
                                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                      {itemObj?.item_name || 'Không xác định'}
                                    </span>
                                  </Space>
                                }
                                actions={[
                                  isManager ? (
                                    <Tooltip title="Xem chi tiết" key="view">
                                      <Button 
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleViewHistory(issuance)}
                                        style={{ border: 'none' }}
                                      />
                                    </Tooltip>
                                  ) : null,
                                  issuance.status === 'pending_confirmation' ? (
                                    <Tooltip title={isManager && issuance.issuance_level === 'admin_to_manager' ? 'Xác nhận nhận PPE từ Header Department' : 'Xác nhận nhận PPE'} key="confirm">
                                      <Button 
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => handleConfirmReceived(issuance)}
                                        style={{ 
                                          backgroundColor: '#52c41a', 
                                          borderColor: '#52c41a',
                                          borderRadius: '4px'
                                        }}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip
                                      title={
                                        displayStatus === 'pending_manager_return'
                                          ? 'Đã trả, chờ Manager xác nhận'
                                          : displayStatus === 'returned'
                                          ? 'Đã trả'
                                          : !isManager && (displayStatus === 'damaged' || displayStatus === 'replacement_needed')
                                          ? 'Đã báo cáo hư hại, không thể trả PPE'
                                          : isManager && issuance.issuance_level === 'admin_to_manager'
                                          ? 'Trả PPE về Header Department'
                                          : !isManager && issuance.assigned_serial_numbers && issuance.assigned_serial_numbers.length > 0
                                          ? 'Trả PPE với Serial Numbers'
                                          : 'Trả PPE'
                                      }
                                      key="return"
                                    >
                                      <Button
                                        type="primary"
                                        icon={<UndoOutlined />}
                                        onClick={() =>
                                          handleReturnToAdmin(
                                            isManagerViewItem ? (adminIssuance || issuanceObj || issuanceOrItem) : issuance,
                                            isManagerViewItem ? issuanceOrItem : undefined
                                          )
                                        }
                                        disabled={
                                          remainingForCard <= 0 ||
                                          (!isManager && (displayStatus === 'damaged' || displayStatus === 'replacement_needed'))
                                        }
                                        style={{ borderRadius: '4px' }}
                                      />
                                    </Tooltip>
                                  ),
                                  isManager ? null : (
                                    // Nếu đã báo cáo hư hỏng -> hiện nút "Xem báo cáo"
                                    // Nếu chưa -> hiện nút "Báo cáo sự cố"
                                    (displayStatus === 'damaged' || displayStatus === 'replacement_needed') ? (
                                      <Tooltip title="Xem báo cáo hư hỏng" key="view-report">
                                        <Button 
                                          type="primary"
                                          icon={<EyeOutlined />}
                                          onClick={() => handleViewDamageReport(issuance)}
                                          style={{ borderRadius: '4px' }}
                                        />
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Báo cáo sự cố" key="report">
                                        <Button 
                                          type="primary"
                                          danger
                                          icon={<ExclamationCircleOutlined />}
                                          onClick={() => handleReportPPE(issuance)}
                                          disabled={issuance.status === 'pending_confirmation'}
                                          style={{ borderRadius: '4px' }}
                                        />
                                      </Tooltip>
                                    )
                                  )
                                ]}
                              >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                  {/* Trạng thái hiển thị riêng, không đè lên tiêu đề */}
                                  <div>
                                    <Tag 
                                      color={getStatusColor(displayStatus)} 
                                      icon={getStatusIcon(displayStatus)}
                                      style={{ margin: 0 }}
                                    >
                                      {getStatusLabel(displayStatus)}
                                    </Tag>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BarcodeOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                    <Text strong style={{ fontSize: '13px' }}>Mã: </Text>
                                    <Text style={{ fontSize: '13px' }}>{itemObj?.item_code || 'N/A'}</Text>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <NumberOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                    <Text strong style={{ fontSize: '13px' }}>Số lượng: </Text>
                                    <Badge 
                                      count={totalQuantityForCard}
                                      style={{ backgroundColor: '#52c41a' }}
                                      overflowCount={Number.MAX_SAFE_INTEGER}
                                    />
                                  </div>
                                  {/* Hiển thị Serial Numbers cho toàn bộ PPE (Manager + Employee) */}
                                  {activeSerialCountForCard > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <BarcodeOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                      <Text strong style={{ fontSize: '13px' }}>Serial Numbers: </Text>
                                      <Button
                                        type="link"
                                        onClick={() =>
                                          openSerialsModal(
                                            serialsForCard,
                                            `${itemObj?.item_name || itemObj?.item_code || ''}`
                                          )
                                        }
                                      >
                                        Xem ({activeSerialCountForCard})
                                      </Button>
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <CalendarOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                    <Text strong style={{ fontSize: '13px' }}>Ngày phát: </Text>
                                    <Text style={{ fontSize: '13px' }}>{formatDateTime(issuanceObj?.issued_date || (isManagerViewItem ? issuanceOrItem.issuances?.[0]?.issued_date : ''))}</Text>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <ClockCircleOutlined style={{ 
                                      color: isOverdueFlag ? '#ff4d4f' : '#1890ff',
                                      fontSize: '16px'
                                    }} />
                                    <Text strong style={{ fontSize: '13px' }}>Hạn trả: </Text>
                                    <Text style={{ 
                                      color: isOverdueFlag ? '#ff4d4f' : 'inherit',
                                      fontSize: '13px'
                                    }}>
                                      {formatDateTime(issuanceObj?.expected_return_date || (isManagerViewItem ? issuanceOrItem.issuances?.[0]?.expected_return_date : ''))}
                                    </Text>
                                    {isOverdueFlag && (
                                      <Tag color="red" style={{ marginLeft: '4px', fontSize: '11px' }}>
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
                            <div style={{ 
                              textAlign: 'center', 
                              padding: '60px 20px',
                              backgroundColor: '#fafafa',
                              borderRadius: '8px',
                              border: '1px dashed #d9d9d9'
                            }}>
                              <Empty
                                image={<InboxOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                                description={
                                  <div>
                                    <Title level={4} style={{ color: '#8c8c8c', marginTop: '16px' }}>Chưa có PPE</Title>
                                    <Text type="secondary" style={{ fontSize: '14px' }}>Bạn chưa được phát PPE nào</Text>
                                  </div>
                                }
                              />
                            </div>
                          </Col>
                        )}
                      </Row>
                    )}
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {isManager && (
              <TabPane
                tab={
                  <span>
                    <InboxOutlined />
                    PPE từ Header Department
                  </span>
                }
                key="from-admin"
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={loadManagerPPE}
                      loading={loading}
                      style={{ borderRadius: '6px' }}
                    >
                      Làm mới
                    </Button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={managerPPEColumns}
                      dataSource={managerPPE}
                      rowKey={(record) => record.item?.id || record.item?.item_code || `ppe-${Math.random()}`}
                      pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                        style: { marginTop: '16px' }
                      }}
                      loading={loading}
                      scroll={{ x: 'max-content' }}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>
                </div>
              </TabPane>
            )}

            {isManager && (
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    PPE của Employee
                  </span>
                }
                key="employee-ppe"
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <Space>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIssueModalVisible(true)}
                        style={{ borderRadius: '6px' }}
                      >
                        Phát PPE cho Employee
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={loadEmployeePPE}
                        loading={loading}
                        style={{ borderRadius: '6px' }}
                      >
                        Làm mới
                      </Button>
                    </Space>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={employeePPEColumns}
                      dataSource={employeePPE}
                      rowKey={(record) => record.id || `employee-ppe-${Math.random()}`}
                      pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                        style: { marginTop: '16px' }
                      }}
                      loading={loading}
                      scroll={{ x: 'max-content' }}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>
                </div>
              </TabPane>
            )}

            {isManager && (
            <TabPane
              tab={
                <span>
                  <HistoryOutlined />
                  Lịch sử PPE
                </span>
              }
              key="history"
            >
              <div style={{ padding: '24px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : ppeHistory.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có lịch sử PPE"
                    style={{ padding: '40px' }}
                  >
                    <Text type="secondary">Bạn chưa có hoạt động PPE nào</Text>
                  </Empty>
                ) : (
                  <Row gutter={[16, 16]}>
                    {ppeHistory.map((issuance, index) => {
                      const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                        issuance.item_id : null;
                      const employee = typeof issuance.user_id === 'object' && issuance.user_id
                        ? issuance.user_id
                        : null;
                      const imageUrl = (item as any)?.image_url;
                      
                      return (
                        <Col xs={24} sm={12} lg={8} key={issuance.id || `history-${index}`}>
                          <Card
                            hoverable
                            title={
                              <Space>
                                {imageUrl ? (
                                  <Image
                                    src={resolveImageUrl(imageUrl)}
                                    width={32}
                                    height={32}
                                    style={{ objectFit: 'cover', borderRadius: 6 }}
                                    preview={{ mask: 'Xem ảnh' }}
                                    fallback=""
                                  />
                                ) : (
                                  <SafetyOutlined style={{ color: '#52c41a' }} />
                                )}
                                <span style={{ fontWeight: 'bold' }}>
                                  {item?.item_name || 'Không xác định'}
                                </span>
                              </Space>
                            }
                            actions={[
                              <Tooltip title="Xem chi tiết">
                                <Button 
                                  type="text"
                                  icon={<EyeOutlined />}
                                  onClick={() => handleViewHistory(issuance)}
                                />
                              </Tooltip>
                            ]}
                          >
                            <Space direction="vertical" style={{ width: '100%' }}>
                              {/* Trạng thái hiển thị riêng, không đè lên tiêu đề */}
                              <div>
                                <Tag
                                  color={getStatusColor(issuance.status)}
                                  icon={getStatusIcon(issuance.status)}
                                  style={{ margin: 0 }}
                                >
                                  {getStatusLabel(issuance.status)}
                                </Tag>
                              </div>
                              <div>
                                <BarcodeOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Mã: </Text>
                                <Text>{item?.item_code || 'N/A'}</Text>
                              </div>
                              <div>
                                <NumberOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Số lượng: </Text>
                                <Badge 
                                  count={issuance.quantity} 
                                  style={{ backgroundColor: '#52c41a' }} 
                                  overflowCount={Number.MAX_SAFE_INTEGER}
                                  showZero
                                />
                              </div>
                              <div>
                                <CalendarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Ngày phát: </Text>
                                <Text>{formatDateTime(issuance.issued_date)}</Text>
                              </div>
                              <div>
                                <ClockCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Ngày trả dự kiến: </Text>
                                <Text>
                                  {issuance.expected_return_date ? formatDateTime(issuance.expected_return_date) : '-'}
                                </Text>
                              </div>
                              {issuance.actual_return_date && (
                                <div>
                                  <CheckCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                  <Text strong>Ngày trả thực tế: </Text>
                                  <Text>{formatDateTime(issuance.actual_return_date)}</Text>
                                </div>
                              )}
                              <div>
                                <UserOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                <Text strong>Cấp độ: </Text>
                                <Text>{(issuance as any).issuance_level === 'admin_to_manager' ? 'Admin → Manager' : 'Manager → Employee'}</Text>
                              </div>
                              {employee && (issuance as any).issuance_level === 'manager_to_employee' && (
                                <div>
                                  <UserOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                  <Text strong>Nhân viên: </Text>
                                  <Text>
                                    {(employee as any).full_name || 'Không xác định'}
                                    {(employee as any).email ? ` (${(employee as any).email})` : ''}
                                  </Text>
                                </div>
                              )}
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
                    
                    {getReturnedIssuances() === 0 && (
                      <Col span={24}>
                        <Empty
                         
                          description={
                            <div>
                             
                              
                            </div>
                          }
                        />
                      </Col>
                    )}
                  </Row>
                )}
              </div>
            </TabPane>
            )}
          </Tabs>
        </Card>

        {/* Modals */}
        {isManager && (
          <IssueToEmployeeModal
            visible={issueModalVisible}
            onCancel={() => setIssueModalVisible(false)}
            onSuccess={handleIssueSuccess}
            managerId={user?.id || ''}
          />
        )}

        <PPEReturnConfirmationModal
          visible={returnModalVisible}
          onCancel={() => {
            setReturnModalVisible(false);
            setSelectedIssuance(null);
          }}
          onSuccess={handleReturnSuccess}
        issuance={selectedIssuance}
        managerSummary={selectedManagerSummary}
        userRole={userRole}
        />

        <PPEAssignmentHistoryModal
          visible={historyModalVisible}
          onCancel={() => {
            setHistoryModalVisible(false);
            setSelectedIssuance(null);
          }}
          issuance={selectedIssuance}
        />

        {/* Report Modal */}
        <Modal
          title="Báo cáo PPE"
          open={reportModalVisible}
          onCancel={() => {
            setReportModalVisible(false);
            setSelectedIssuance(null);
            reportForm.resetFields();
          }}
          footer={null}
          width={500}
        >
          <Form
            form={reportForm}
            layout="vertical"
            onFinish={handleReportSubmit}
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
                <Button onClick={() => {
                  setReportModalVisible(false);
                  setSelectedIssuance(null);
                  reportForm.resetFields();
                }}>
                  Hủy
                </Button>
                <Button type="primary" danger htmlType="submit" loading={loading}>
                  {loading ? 'Đang báo cáo...' : 'Gửi báo cáo'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal xem báo cáo hư hỏng đã tạo */}
        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>Chi tiết báo cáo hư hỏng</span>
            </Space>
          }
          open={viewReportModalVisible}
          onCancel={() => {
            setViewReportModalVisible(false);
            setSelectedIssuance(null);
          }}
          footer={[
            <Button 
              key="close" 
              type="primary"
              onClick={() => {
                setViewReportModalVisible(false);
                setSelectedIssuance(null);
              }}
            >
              Đóng
            </Button>
          ]}
          width={500}
        >
          {selectedIssuance && (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Thông tin thiết bị */}
              <Card size="small" title="Thông tin thiết bị">
                <Row gutter={[16, 8]}>
                  <Col span={8}><Text type="secondary">Thiết bị:</Text></Col>
                  <Col span={16}>
                    <Text strong>
                      {typeof selectedIssuance.item_id === 'object' && selectedIssuance.item_id 
                        ? selectedIssuance.item_id.item_name 
                        : 'Không xác định'}
                    </Text>
                  </Col>
                  <Col span={8}><Text type="secondary">Mã:</Text></Col>
                  <Col span={16}>
                    <Text>
                      {typeof selectedIssuance.item_id === 'object' && selectedIssuance.item_id 
                        ? selectedIssuance.item_id.item_code 
                        : 'N/A'}
                    </Text>
                  </Col>
                  <Col span={8}><Text type="secondary">Trạng thái:</Text></Col>
                  <Col span={16}>
                    <Tag color={getStatusColor(selectedIssuance.status)}>
                      {getStatusLabel(selectedIssuance.status)}
                    </Tag>
                  </Col>
                  {/* Serial Numbers */}
                  {selectedIssuance.assigned_serial_numbers && selectedIssuance.assigned_serial_numbers.length > 0 && (
                    <>
                      <Col span={8}><Text type="secondary">Serial Numbers:</Text></Col>
                      <Col span={16}>
                        <Space wrap size={[4, 4]}>
                          {selectedIssuance.assigned_serial_numbers.map((serial: string, index: number) => (
                            <Tag key={index} color="blue">
                              {serial}
                            </Tag>
                          ))}
                        </Space>
                      </Col>
                    </>
                  )}
                </Row>
              </Card>

              {/* Chi tiết báo cáo */}
              <Card size="small" title="Chi tiết báo cáo">
                <Row gutter={[16, 8]}>
                  <Col span={8}><Text type="secondary">Loại báo cáo:</Text></Col>
                  <Col span={16}>
                    <Tag color="red">
                      {getReportTypeLabel(selectedIssuance.report_type)}
                    </Tag>
                  </Col>
                  <Col span={8}><Text type="secondary">Mức độ:</Text></Col>
                  <Col span={16}>
                    <Tag color={getSeverityLabel(selectedIssuance.report_severity).color}>
                      {getSeverityLabel(selectedIssuance.report_severity).label}
                    </Tag>
                  </Col>
                  <Col span={8}><Text type="secondary">Mô tả:</Text></Col>
                  <Col span={16}>
                    <Text>
                      {selectedIssuance.report_description || 'Không có mô tả chi tiết'}
                    </Text>
                  </Col>
                </Row>
              </Card>

              {/* Thông báo trạng thái */}
              <Alert
                message="Báo cáo đã được gửi"
                description="Manager đã nhận được báo cáo của bạn."
                type="info"
                showIcon
              />
            </Space>
          )}
        </Modal>

        {/* Confirm PPE Modal */}
        <Modal
          title="Xác nhận nhận PPE"
          open={confirmModalVisible}
          onCancel={() => {
            setConfirmModalVisible(false);
            setSelectedIssuance(null);
            confirmForm.resetFields();
          }}
          footer={null}
          width={500}
        >
          <Form
            form={confirmForm}
            layout="vertical"
            onFinish={handleConfirmSubmit}
          >
            <Form.Item label="Thiết bị">
              <Input
                value={typeof selectedIssuance?.item_id === 'object' && selectedIssuance?.item_id ? 
                  selectedIssuance.item_id.item_name : 'Không xác định'}
                disabled
              />
            </Form.Item>
            
            <Form.Item label="Số lượng">
              <Input
                value={selectedIssuance?.quantity || 0}
                disabled
              />
            </Form.Item>
            
            <Form.Item label="Ngày phát">
              <Input
                value={selectedIssuance?.issued_date ? formatDateTime(selectedIssuance.issued_date) : 'N/A'}
                disabled
              />
            </Form.Item>
            
            <Form.Item 
              label="Ghi chú xác nhận" 
              name="confirmation_notes"
            >
              <TextArea
                placeholder="Ghi chú khi xác nhận nhận PPE (tùy chọn)..."
                rows={3}
              />
            </Form.Item>
            
            <Alert
              message="Xác nhận nhận PPE"
              description={
                isManager && selectedIssuance?.issuance_level === 'admin_to_manager'
                  ? "Bạn có chắc chắn đã nhận PPE này từ Header Department? Sau khi xác nhận, bạn có thể phát PPE cho Employee."
                  : "Bạn có chắc chắn đã nhận PPE này từ Manager? Sau khi xác nhận, PPE sẽ được chuyển sang trạng thái 'Đang sử dụng'."
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setConfirmModalVisible(false);
                  setSelectedIssuance(null);
                  confirmForm.resetFields();
                }}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                  {loading ? 'Đang xác nhận...' : 'Xác nhận nhận PPE'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Return PPE Modal for Employees */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UndoOutlined style={{ color: '#1890ff' }} />
              <span>Trả PPE cho Manager</span>
            </div>
          }
          open={returnPPEModalVisible}
          onCancel={() => {
            setReturnPPEModalVisible(false);
            setSelectedIssuanceForReturn(null);
            returnForm.resetFields();
          }}
          footer={null}
          width={600}
          destroyOnClose
          maskClosable={false}
        >
          {selectedIssuanceForReturn && (
            <Form
              form={returnForm}
              layout="vertical"
              onFinish={handleReturnPPE}
              initialValues={{
                actual_return_date: dayjs(),
                return_condition: 'good',
                notes: ''
              }}
            >
              {/* PPE Information */}
              <Card
                size="small"
                title="Thông tin PPE"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Mã thiết bị: </Text>
                    <Text>
                      {typeof selectedIssuanceForReturn.item_id === 'object' && selectedIssuanceForReturn.item_id
                        ? selectedIssuanceForReturn.item_id.item_code || 'N/A'
                        : (selectedIssuanceForReturn.item_id ? String(selectedIssuanceForReturn.item_id) : 'N/A')}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Tên thiết bị: </Text>
                    <Text>
                      {typeof selectedIssuanceForReturn.item_id === 'object' && selectedIssuanceForReturn.item_id
                        ? selectedIssuanceForReturn.item_id.item_name || 'N/A'
                        : (selectedIssuanceForReturn.item_id ? String(selectedIssuanceForReturn.item_id) : 'N/A')}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Số lượng: </Text>
                    <Text>{selectedIssuanceForReturn.quantity}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Ngày phát: </Text>
                    <Text>{formatDateTime(selectedIssuanceForReturn.issued_date)}</Text>
                  </Col>
                </Row>

                {/* Display assigned serial numbers */}
                {selectedIssuanceForReturn.assigned_serial_numbers && selectedIssuanceForReturn.assigned_serial_numbers.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Text strong>Serial Numbers đã gán: </Text>
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedIssuanceForReturn.assigned_serial_numbers.map((serial, index) => (
                        <Tag key={index} color="blue" style={{ fontSize: '12px' }}>
                          {serial}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Alert
                message="Vui lòng chọn Serial Numbers bạn muốn trả lại"
                description="Bạn có thể trả lại một phần hoặc toàn bộ Serial Numbers đã được gán."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                label="Serial Numbers cần trả"
                name="returned_serial_numbers"
                rules={[
                  { required: true, message: 'Vui lòng chọn Serial Numbers cần trả' },
                  {
                    validator: (_, value) => {
                      if (value && selectedIssuanceForReturn.assigned_serial_numbers) {
                        const invalidSerials = value.filter((serial: string) =>
                          !selectedIssuanceForReturn.assigned_serial_numbers!.includes(serial)
                        );
                        if (invalidSerials.length > 0) {
                          return Promise.reject(`Serial numbers không hợp lệ: ${invalidSerials.join(', ')}`);
                        }
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn Serial Numbers cần trả lại"
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                  maxTagCount={5}
                  maxTagTextLength={15}
                >
                  {selectedIssuanceForReturn.assigned_serial_numbers?.map((serial, index) => (
                    <Option key={index} value={serial}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarcodeOutlined style={{ color: '#1890ff' }} />
                        <span>{serial}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Ngày trả thực tế"
                name="actual_return_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày trả' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>

              <Form.Item
                label="Ghi chú"
                name="notes"
              >
                <TextArea
                  rows={3}
                  placeholder="Ghi chú về tình trạng PPE khi trả (tùy chọn)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => {
                    setReturnPPEModalVisible(false);
                    setSelectedIssuanceForReturn(null);
                    returnForm.resetFields();
                  }}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} danger>
                    {loading ? 'Đang trả PPE...' : 'Trả PPE'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>

        {/* Serial numbers modal (show on demand) */}
        <Modal
          title={serialsModalData.title ? `Serial Numbers - ${serialsModalData.title}` : 'Serial Numbers'}
          open={serialsModalVisible}
          onCancel={() => setSerialsModalVisible(false)}
          footer={null}
          width={600}
        >
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {serialsModalData.serials && serialsModalData.serials.length > 0 ? (
              serialsModalData.serials.map((s, idx) => (
                <Tag key={idx} color="blue" style={{ fontSize: 12 }}>{s}</Tag>
              ))
            ) : (
              <Empty description="No serial numbers" />
            )}
          </div>
        </Modal>

      </div>
    </LayoutComponent>
  );
};

export default SharedPPEManagement;
