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
  Tag,
  Tooltip,
  Table,
  Alert,
  Progress
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

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

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
  issuances: PPEIssuance[];
}

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
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<PPEIssuance | null>(null);
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
      if (response.success) {
        // Gán remaining_quantity, remaining_in_hand, total_issued_to_employees cho từng issuance từ ppe_summary
        const ppeSummaryWithRemaining = response.data.ppe_summary.map((ppe: ManagerPPE) => ({
          ...ppe,
          issuances: ppe.issuances.map(issuance => ({
            ...issuance,
            remaining_quantity: ppe.remaining, // Gán remaining từ summary vào từng issuance
            remaining_in_hand: ppe.remaining_in_hand, // Số PPE Manager đang giữ (sau khi trừ đã trả Admin)
            total_issued_to_employees: ppe.total_issued_to_employees // Số PPE đã phát cho employee
          }))
        }));
        setManagerPPE(ppeSummaryWithRemaining);
        calculateStats(ppeSummaryWithRemaining);
      }
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
      if (response.success) {
        setPpeHistory(response.data.history);
      }
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
      acc.totalItems += 1;
      acc.totalReceived += ppe.total_received;
      acc.totalIssuedToEmployees += ppe.total_issued_to_employees || 0;
      acc.totalReturned += ppe.total_returned;
      acc.totalRemaining += ppe.remaining;
      
      // Đếm PPE chờ Employee xác nhận
      const pendingConfirmations = ppe.issuances.filter(issuance => 
        issuance.status === 'pending_confirmation'
      ).length;
      acc.pendingConfirmationCount += pendingConfirmations;
      
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

  // Removed unused employee stats calculation

  const handleReturnToAdmin = (issuance: PPEIssuance) => {
    setSelectedIssuance(issuance);
    setReturnModalVisible(true);
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
          loadManagerPPE();
          loadEmployeePPE();
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
    return labels[status] || 'Không xác định';
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
      render: (text: string, record: ManagerPPE) => (
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.item.item_code}
            </Text>
          </div>
        </Space>
      )
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
      render: (value: number) => (
        <Tag color="purple" icon={<SendOutlined />}>
          {value}
        </Tag>
      )
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
        return (
          <Progress
            percent={Math.round(rate)}
            size="small"
            status={rate >= 80 ? 'success' : rate >= 50 ? 'normal' : 'exception'}
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
      render: (text: string, record: PPEIssuance) => (
        <Space>
          <SafetyOutlined />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {typeof record.item_id === 'object' && record.item_id ? record.item_id.item_code : 'N/A'}
            </Text>
          </div>
        </Space>
      )
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
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewHistory(record)}
          >
            Chi tiết
          </Button>
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
                  title="Tổng PPE"
                  value={ppeIssuances.length}
                  prefix={<InboxOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                />
              </Card>
            </Col>
          </Row>
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
                    title={<span style={{ fontSize: '13px' }}>Chờ Employee xác nhận</span>}
                    value={ppeStats.pendingConfirmationCount}
                    prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#fa8c16', fontSize: '22px' }}
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
                    title={<span style={{ fontSize: '13px' }}>Chờ xác nhận</span>}
                    value={employeePPE.filter((issuance: PPEIssuance) => issuance.status === 'pending_manager_return').length}
                    prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                    valueStyle={{ color: '#faad14', fontSize: '22px' }}
                  />
                </Card>
              </Col>
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
                        {getActiveIssuances().map(issuance => {
                          const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                            issuance.item_id : null;
                          const isOverdueItem = isOverdue(issuance.expected_return_date);
                          
                          return (
                            <Col xs={24} sm={12} lg={8} xl={6} key={issuance.id}>
                              <Card
                                hoverable
                                style={{ 
                                  borderRadius: '8px',
                                  border: '1px solid #e8e8e8',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                                  height: '100%',
                                  transition: 'all 0.3s ease'
                                }}
                                bodyStyle={{ padding: '16px' }}
                                title={
                                  <Space style={{ width: '100%' }}>
                                    <SafetyOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                      {item?.item_name || 'Không xác định'}
                                    </span>
                                  </Space>
                                }
                                extra={
                                  <Tag 
                                    color={getStatusColor(issuance.status)} 
                                    icon={getStatusIcon(issuance.status)}
                                    style={{ margin: 0 }}
                                  >
                                    {getStatusLabel(issuance.status)}
                                  </Tag>
                                }
                                actions={[
                                  <Tooltip title="Xem chi tiết" key="view">
                                    <Button 
                                      type="text"
                                      icon={<EyeOutlined />}
                                      onClick={() => handleViewHistory(issuance)}
                                      style={{ border: 'none' }}
                                    />
                                  </Tooltip>,
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
                                    <Tooltip title={issuance.status === 'pending_manager_return' ? 'Đã trả, chờ Manager xác nhận' : issuance.status === 'returned' ? 'Đã trả' : isManager && issuance.issuance_level === 'admin_to_manager' ? 'Trả PPE về Header Department' : 'Trả PPE'} key="return">
                                      <Button 
                                        type="primary"
                                        icon={<UndoOutlined />}
                                        onClick={() => handleReturnToAdmin(issuance)}
                                        disabled={issuance.status === 'pending_manager_return' || issuance.status === 'returned'}
                                        style={{ borderRadius: '4px' }}
                                      />
                                    </Tooltip>
                                  ),
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
                                ]}
                              >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BarcodeOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                    <Text strong style={{ fontSize: '13px' }}>Mã: </Text>
                                    <Text style={{ fontSize: '13px' }}>{item?.item_code || 'N/A'}</Text>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <NumberOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                    <Text strong style={{ fontSize: '13px' }}>Số lượng: </Text>
                                    <Badge 
                                      count={issuance.quantity} 
                                      style={{ backgroundColor: '#52c41a' }}
                                      overflowCount={999}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <CalendarOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                    <Text strong style={{ fontSize: '13px' }}>Ngày phát: </Text>
                                    <Text style={{ fontSize: '13px' }}>{formatDateTime(issuance.issued_date)}</Text>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <ClockCircleOutlined style={{ 
                                      color: isOverdueItem ? '#ff4d4f' : '#1890ff',
                                      fontSize: '16px'
                                    }} />
                                    <Text strong style={{ fontSize: '13px' }}>Hạn trả: </Text>
                                    <Text style={{ 
                                      color: isOverdueItem ? '#ff4d4f' : 'inherit',
                                      fontSize: '13px'
                                    }}>
                                      {formatDateTime(issuance.expected_return_date)}
                                    </Text>
                                    {isOverdueItem && (
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
                      rowKey={(record) => record.item.id}
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
                      rowKey={(record) => record.id}
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
                    {ppeHistory.map(issuance => {
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
                                color={
                                  issuance.status === 'returned' ? 'green' :
                                  issuance.status === 'issued' ? 'blue' :
                                  issuance.status === 'overdue' ? 'red' :
                                  issuance.status === 'damaged' ? 'orange' :
                                  issuance.status === 'pending_manager_return' ? 'gold' : 'default'
                                }
                                icon={
                                  issuance.status === 'returned' ? <CheckCircleOutlined /> :
                                  issuance.status === 'issued' ? <ClockCircleOutlined /> :
                                  issuance.status === 'overdue' ? <ExclamationCircleOutlined /> :
                                  issuance.status === 'damaged' ? <WarningOutlined /> :
                                  issuance.status === 'pending_manager_return' ? <ClockCircleOutlined /> : <InfoCircleOutlined />
                                }
                              >
                                {issuance.status === 'returned' ? 'Đã trả' :
                                 issuance.status === 'issued' ? 'Đang sử dụng' :
                                 issuance.status === 'overdue' ? 'Quá hạn' :
                                 issuance.status === 'damaged' ? 'Hỏng' :
                                 issuance.status === 'pending_manager_return' ? 'Chờ Manager xác nhận' : issuance.status}
                              </Tag>
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
                                <Text strong>Ngày trả dự kiến: </Text>
                                <Text>{formatDateTime(issuance.expected_return_date)}</Text>
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
      </div>
    </LayoutComponent>
  );
};

export default SharedPPEManagement;
