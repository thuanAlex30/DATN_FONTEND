import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Tooltip,
  Popconfirm,
  Image,
  Descriptions,
  Empty,
  Form,
  DatePicker,
  InputNumber,
  Switch,
  AutoComplete
} from 'antd';
import { 
  SafetyCertificateOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import certificateService from '../../../services/certificateService';
import authService from '../../../services/authService';
import userService from '../../../services/userService';
import dayjs, { Dayjs } from 'dayjs';
import styles from './CertificateManagement.module.css';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

interface Certificate {
  _id: string;
  certificateName: string;
  certificateCode: string;
  description?: string;
  category: 'SAFETY' | 'TECHNICAL' | 'MANAGEMENT' | 'QUALITY' | 'ENVIRONMENTAL' | 'HEALTH' | 'OTHER';
  subCategory?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issuingAuthority: string;
  legalBasis?: string;
  applicableRegulations?: string[];
  validityPeriod: number;
  validityPeriodUnit: 'DAYS' | 'MONTHS' | 'YEARS';
  renewalRequired: boolean;
  renewalProcess?: string;
  renewalDocuments?: string[];
  cost: number;
  currency: string;
  contactInfo: {
    organization?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';
  reminderSettings: {
    enabled: boolean;
    reminderDays: number[];
    notificationMethods: ('EMAIL' | 'SMS' | 'SYSTEM')[];
    recipients: string[];
  };
  attachments: Array<{
    _id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  createdBy: string;
  updatedBy?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  issueDate?: string;
  expiryDate?: string;
  lastRenewalDate?: string;
  renewalNotes?: string;
}

const CertificateManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [renewTarget, setRenewTarget] = useState<Certificate | null>(null);
  const [renewalDate, setRenewalDate] = useState<Dayjs | null>(null);
  const [renewalNotes, setRenewalNotes] = useState('');
  const [form] = Form.useForm();
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<Certificate | null>(null);
  const [reminderForm] = Form.useForm();
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [expiringCertificates, setExpiringCertificates] = useState<Certificate[]>([]);
  const [expiringModalVisible, setExpiringModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTenant, setCurrentTenant] = useState<any>(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0
  });

  // Load certificates (tối ưu: có thể tắt loading indicator)
  const loadCertificates = async (showLoading = true) => {
    const startTime = performance.now();
    console.log('⏱️ [PERFORMANCE] Bắt đầu load certificates:', new Date().toISOString());
    
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      const res = await certificateService.getCertificates();
      console.log('CertificateList API Response:', res);
      
      // Handle response like IncidentList does
      let certificatesData = [];
      
      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data)) {
          // Direct array: data.data (like incident)
          certificatesData = res.data.data;
        } else if (res.data.data && typeof res.data.data === 'object' && Array.isArray(res.data.data.data)) {
          // Nested array: data.data.data (certificate with pagination)
          certificatesData = res.data.data.data;
        } else {
          certificatesData = [];
        }
      } else {
        certificatesData = [];
      }
      
      console.log('Final certificates data:', certificatesData);
      console.log('Certificates data type:', typeof certificatesData);
      console.log('Certificates data is array:', Array.isArray(certificatesData));
      console.log('Certificates data length:', Array.isArray(certificatesData) ? certificatesData.length : 'Not array');
      if (Array.isArray(certificatesData) && certificatesData.length > 0) {
        console.log('First certificate structure:', certificatesData[0]);
        console.log('First certificate keys:', Object.keys(certificatesData[0]));
      }
      setCertificates(certificatesData);
      
      // Calculate stats - ensure certificatesData is array
      const total = Array.isArray(certificatesData) ? certificatesData.length : 0;
      const active = Array.isArray(certificatesData) ? certificatesData.filter((cert: any) => cert.status === 'ACTIVE').length : 0;
      const inactive = Array.isArray(certificatesData) ? certificatesData.filter((cert: any) => cert.status === 'INACTIVE').length : 0;
      const expired = Array.isArray(certificatesData) ? certificatesData.filter((cert: any) => cert.status === 'EXPIRED').length : 0;
      
      setStats({ total, active, inactive, expired });
      
      const totalTime = performance.now() - startTime;
      console.log('✅ [PERFORMANCE] Tổng thời gian load certificates:', totalTime.toFixed(2), 'ms');
    } catch (err: any) {
      console.error('CertificateList fetch error:', err);
      setError('Không thể tải danh sách chứng chỉ');
      if (showLoading) {
        message.error('Không thể tải danh sách chứng chỉ');
      }
      console.log('❌ [PERFORMANCE] Load certificates thất bại sau:', (performance.now() - startTime).toFixed(2), 'ms');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Load current user and tenant info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const response = await authService.me();
        const userData = response.data;
        setCurrentUser(userData);
        // tenant_id có thể là string (ID) hoặc object (populated)
        if (userData?.tenant_id) {
          if (typeof userData.tenant_id === 'object' && userData.tenant_id.name) {
            setCurrentTenant(userData.tenant_id);
          } else if (typeof userData.tenant_id === 'string') {
            // Nếu chỉ có ID, có thể fetch thông tin tenant sau
            setCurrentTenant({ _id: userData.tenant_id, name: 'Đang tải...' });
          }
        }
      } catch (err) {
        console.error('Error loading user info:', err);
      }
    };
    loadUserInfo();
  }, []);

  useEffect(() => {
    loadCertificates();
  }, []);

  // Load employees list - chỉ load khi cần (lazy loading)
  const loadEmployees = async () => {
    if (employees.length > 0) {
      return; // Đã load rồi, không load lại
    }
    
    try {
      setLoadingEmployees(true);
      console.log('⏱️ [PERFORMANCE] Bắt đầu load employees...');
      const startTime = performance.now();
      
      // Tăng timeout cho API này và giảm limit để nhanh hơn
      const response = await userService.getUsers({
        is_active: true,
        limit: 100 // Giảm xuống 100 nhân viên để nhanh hơn
      });
      
      console.log('📦 [DEBUG] Response structure:', response);
      console.log('📦 [DEBUG] Response.data:', (response as any).data);
      
      // userService.getUsers trả về UsersResponse
      // Cấu trúc: { success: boolean, message: string, data: { users: User[], pagination?: ... } }
      let usersData: any[] = [];
      
      if ((response as any).data?.users) {
        // Cấu trúc: { data: { users: [...] } }
        usersData = (response as any).data.users;
      } else if ((response as any).users) {
        // Cấu trúc: { users: [...] }
        usersData = (response as any).users;
      } else if (Array.isArray((response as any).data)) {
        // Cấu trúc: { data: [...] }
        usersData = (response as any).data;
      } else if (Array.isArray(response)) {
        // Cấu trúc: [...] (direct array)
        usersData = response as any[];
      }
      
      usersData = Array.isArray(usersData) ? usersData : [];
      setEmployees(usersData);
      
      console.log('⏱️ [PERFORMANCE] Load employees mất:', (performance.now() - startTime).toFixed(2), 'ms');
      console.log('📊 [PERFORMANCE] Số lượng nhân viên:', usersData.length);
      
      if (usersData.length === 0) {
        console.warn('⚠️ Không có nhân viên nào được load!');
        message.warning('Không tìm thấy nhân viên nào. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Filter certificates - ensure certificates is an array
  const filteredCertificates = Array.isArray(certificates) ? certificates.filter(certificate => {
    const matchesSearch = !searchTerm || 
      certificate.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.certificateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || certificate.category === categoryFilter;
    const matchesStatus = !statusFilter || certificate.status === statusFilter;
    const matchesPriority = !priorityFilter || certificate.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  }) : [];

  // Danh sách chứng chỉ mẫu có sẵn (database của chứng chỉ phổ biến)
  const certificateDatabase = [
    {
      name: 'Chứng chỉ An toàn lao động',
      category: 'SAFETY',
      issuingAuthority: 'Cục An toàn lao động - Bộ Lao động Thương binh và Xã hội',
      validityPeriod: 24,
      validityPeriodUnit: 'MONTHS',
      priority: 'HIGH',
      description: 'Chứng chỉ về an toàn lao động theo quy định của pháp luật'
    },
    {
      name: 'Chứng chỉ Vệ sinh an toàn thực phẩm',
      category: 'HEALTH',
      issuingAuthority: 'Cục An toàn thực phẩm - Bộ Y tế',
      validityPeriod: 12,
      validityPeriodUnit: 'MONTHS',
      priority: 'CRITICAL',
      description: 'Chứng chỉ về vệ sinh an toàn thực phẩm'
    },
    {
      name: 'Chứng chỉ Môi trường',
      category: 'ENVIRONMENTAL',
      issuingAuthority: 'Bộ Tài nguyên và Môi trường',
      validityPeriod: 36,
      validityPeriodUnit: 'MONTHS',
      priority: 'HIGH',
      description: 'Chứng chỉ về bảo vệ môi trường'
    },
    {
      name: 'Chứng chỉ Chất lượng ISO 9001',
      category: 'QUALITY',
      issuingAuthority: 'Tổ chức chứng nhận chất lượng',
      validityPeriod: 36,
      validityPeriodUnit: 'MONTHS',
      priority: 'MEDIUM',
      description: 'Chứng chỉ hệ thống quản lý chất lượng ISO 9001'
    },
    {
      name: 'Chứng chỉ ISO 14001 - Môi trường',
      category: 'ENVIRONMENTAL',
      issuingAuthority: 'Tổ chức chứng nhận quốc tế',
      validityPeriod: 36,
      validityPeriodUnit: 'MONTHS',
      priority: 'HIGH',
      description: 'Chứng chỉ hệ thống quản lý môi trường ISO 14001'
    },
    {
      name: 'Chứng chỉ OHSAS 18001 - An toàn sức khỏe nghề nghiệp',
      category: 'SAFETY',
      issuingAuthority: 'Tổ chức chứng nhận quốc tế',
      validityPeriod: 36,
      validityPeriodUnit: 'MONTHS',
      priority: 'CRITICAL',
      description: 'Chứng chỉ hệ thống quản lý an toàn sức khỏe nghề nghiệp'
    },
    {
      name: 'Chứng chỉ PCCC - Phòng cháy chữa cháy',
      category: 'SAFETY',
      issuingAuthority: 'Cảnh sát Phòng cháy chữa cháy',
      validityPeriod: 12,
      validityPeriodUnit: 'MONTHS',
      priority: 'CRITICAL',
      description: 'Chứng chỉ về phòng cháy chữa cháy'
    },
    {
      name: 'Chứng chỉ Vận hành thiết bị áp lực',
      category: 'TECHNICAL',
      issuingAuthority: 'Cục An toàn lao động',
      validityPeriod: 24,
      validityPeriodUnit: 'MONTHS',
      priority: 'HIGH',
      description: 'Chứng chỉ vận hành thiết bị áp lực'
    },
    {
      name: 'Chứng chỉ Vận hành cần trục',
      category: 'TECHNICAL',
      issuingAuthority: 'Cục An toàn lao động',
      validityPeriod: 24,
      validityPeriodUnit: 'MONTHS',
      priority: 'HIGH',
      description: 'Chứng chỉ vận hành cần trục'
    },
    {
      name: 'Chứng chỉ Quản lý chất thải nguy hại',
      category: 'ENVIRONMENTAL',
      issuingAuthority: 'Bộ Tài nguyên và Môi trường',
      validityPeriod: 36,
      validityPeriodUnit: 'MONTHS',
      priority: 'HIGH',
      description: 'Chứng chỉ quản lý chất thải nguy hại'
    }
  ];

  // Certificate templates
  const certificateTemplates = [
    {
      name: 'Chứng chỉ An toàn lao động',
      data: {
        certificateName: 'Chứng chỉ An toàn lao động',
        category: 'SAFETY',
        issuingAuthority: 'Cục An toàn lao động - Bộ Lao động Thương binh và Xã hội',
        validityPeriod: 24,
        validityPeriodUnit: 'MONTHS',
        priority: 'HIGH',
        status: 'ACTIVE',
        renewalRequired: true,
        cost: 0,
        currency: 'VND',
        description: 'Chứng chỉ về an toàn lao động theo quy định của pháp luật'
      }
    },
    {
      name: 'Chứng chỉ Vệ sinh an toàn thực phẩm',
      data: {
        certificateName: 'Chứng chỉ Vệ sinh an toàn thực phẩm',
        category: 'HEALTH',
        issuingAuthority: 'Cục An toàn thực phẩm - Bộ Y tế',
        validityPeriod: 12,
        validityPeriodUnit: 'MONTHS',
        priority: 'CRITICAL',
        status: 'ACTIVE',
        renewalRequired: true,
        cost: 0,
        currency: 'VND',
        description: 'Chứng chỉ về vệ sinh an toàn thực phẩm'
      }
    },
    {
      name: 'Chứng chỉ Môi trường',
      data: {
        certificateName: 'Chứng chỉ Môi trường',
        category: 'ENVIRONMENTAL',
        issuingAuthority: 'Bộ Tài nguyên và Môi trường',
        validityPeriod: 36,
        validityPeriodUnit: 'MONTHS',
        priority: 'HIGH',
        status: 'ACTIVE',
        renewalRequired: true,
        cost: 0,
        currency: 'VND',
        description: 'Chứng chỉ về bảo vệ môi trường'
      }
    },
    {
      name: 'Chứng chỉ Chất lượng ISO',
      data: {
        certificateName: 'Chứng chỉ Chất lượng ISO 9001',
        category: 'QUALITY',
        issuingAuthority: 'Tổ chức chứng nhận chất lượng',
        validityPeriod: 36,
        validityPeriodUnit: 'MONTHS',
        priority: 'MEDIUM',
        status: 'ACTIVE',
        renewalRequired: true,
        cost: 0,
        currency: 'VND',
        description: 'Chứng chỉ hệ thống quản lý chất lượng ISO 9001'
      }
    },
    {
      name: 'Chứng chỉ Kỹ thuật',
      data: {
        certificateName: 'Chứng chỉ Kỹ thuật',
        category: 'TECHNICAL',
        issuingAuthority: 'Cơ quan có thẩm quyền',
        validityPeriod: 24,
        validityPeriodUnit: 'MONTHS',
        priority: 'MEDIUM',
        status: 'ACTIVE',
        renewalRequired: true,
        cost: 0,
        currency: 'VND',
        description: 'Chứng chỉ về kỹ thuật chuyên ngành'
      }
    }
  ];

  // Open create modal
  const openCreateModal = async () => {
    console.log('⏱️ [PERFORMANCE] Mở modal tạo chứng chỉ...');
    const startTime = performance.now();
    
    setEditingCertificate(null);
    form.resetFields();
    form.setFieldsValue({
      validityPeriodUnit: 'MONTHS',
      priority: 'MEDIUM',
      status: 'ACTIVE',
      renewalRequired: true,
      cost: 0,
      currency: 'VND'
    });
    
    // Mở modal ngay
    setFormModalVisible(true);
    
    // Load employees ngay khi mở modal (không đợi focus)
    if (employees.length === 0) {
      console.log('🔄 Loading employees khi mở modal...');
      loadEmployees().catch(err => {
        console.error('❌ Error loading employees:', err);
        console.error('❌ Error details:', err?.response?.data || err?.message);
        message.error('Không thể tải danh sách nhân viên. Vui lòng thử lại.');
      });
    } else {
      console.log('✅ Employees đã có sẵn:', employees.length);
    }
    
    console.log('⏱️ [PERFORMANCE] Modal mở sau:', (performance.now() - startTime).toFixed(2), 'ms');
  };

  // Open template modal
  const openTemplateModal = () => {
    setTemplateModalVisible(true);
  };

  // Apply template
  const applyTemplate = (template: any) => {
    const templateData = { ...template.data, issueDate: dayjs() };
    // Generate code for template
    const generatedCode = generateCertificateCode(templateData.certificateName, templateData.category);
    templateData.certificateCode = generatedCode;
    form.setFieldsValue(templateData);
    setTemplateModalVisible(false);
    setFormModalVisible(true);
    message.success('Đã áp dụng mẫu chứng chỉ. Vui lòng kiểm tra và chỉnh sửa thông tin.');
  };

  // Generate certificate code function (same logic as backend)
  const generateCertificateCode = (certificateName: string, category: string = '') => {
    if (!certificateName || certificateName.trim() === '') {
      return '';
    }
    
    const timestamp = Date.now().toString(36).toUpperCase();
    const namePrefix = certificateName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3);
    
    const categoryPrefix = category ? category.substring(0, 3).toUpperCase() : 'CERT';
    
    return `${categoryPrefix}-${namePrefix}-${timestamp}`;
  };

  // Handle certificate name change - auto generate code and fill data from database
  const handleCertificateNameChange = (value: string) => {
    // Tìm chứng chỉ trong database
    const matchedCertificate = certificateDatabase.find(
      cert => cert.name.toLowerCase() === value.toLowerCase()
    );
    
    if (matchedCertificate) {
      // Tự động điền thông tin từ database
      form.setFieldsValue({
        certificateName: matchedCertificate.name,
        category: matchedCertificate.category,
        issuingAuthority: matchedCertificate.issuingAuthority,
        validityPeriod: matchedCertificate.validityPeriod,
        validityPeriodUnit: matchedCertificate.validityPeriodUnit,
        priority: matchedCertificate.priority,
        description: matchedCertificate.description,
        certificateCode: generateCertificateCode(matchedCertificate.name, matchedCertificate.category)
      });
      message.success('Đã tự động điền thông tin từ dữ liệu có sẵn');
    } else {
      // Nếu không tìm thấy, chỉ generate code
      const category = form.getFieldValue('category') || '';
      const currentCode = form.getFieldValue('certificateCode');
      if (!currentCode || currentCode.startsWith(category.substring(0, 3).toUpperCase() + '-')) {
        const generatedCode = generateCertificateCode(value, category);
        if (generatedCode) {
          form.setFieldsValue({ certificateCode: generatedCode });
        }
      }
    }
  };

  // Handle category change - regenerate code if name exists
  const handleCategoryChange = (value: string) => {
    const name = form.getFieldValue('certificateName');
    if (name) {
      const generatedCode = generateCertificateCode(name, value);
      if (generatedCode) {
        form.setFieldsValue({ certificateCode: generatedCode });
      }
    }
  };

  // Open edit modal
  const openEditModal = (record: Certificate) => {
    setEditingCertificate(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : null,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null
    });
    setFormModalVisible(true);
  };

  const handleFormSubmit = async () => {
    const startTime = performance.now();
    console.log('⏱️ [PERFORMANCE] Bắt đầu submit form:', new Date().toISOString());
    
    try {
      const validationStart = performance.now();
      const values = await form.validateFields();
      console.log('⏱️ [PERFORMANCE] Validation mất:', (performance.now() - validationStart).toFixed(2), 'ms');
      
      const payload: any = {
        ...values,
        // Đảm bảo validityPeriod là number
        validityPeriod: values.validityPeriod ? Number(values.validityPeriod) : undefined,
        // Đảm bảo cost là number nếu có
        cost: values.cost !== undefined ? Number(values.cost) : undefined,
        // Format dates
        issueDate: values.issueDate ? values.issueDate.toISOString() : undefined,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : undefined,
      };

      // Loại bỏ các field undefined hoặc null
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      console.log('📤 [PERFORMANCE] Payload to send:', payload);

      setLoading(true);
      let newCertificate: Certificate | null = null;
      
      const apiStart = performance.now();
      if (editingCertificate?._id) {
        console.log('🔄 [PERFORMANCE] Bắt đầu update certificate...');
        newCertificate = await certificateService.updateCertificate(editingCertificate._id, payload);
        console.log('⏱️ [PERFORMANCE] API Update mất:', (performance.now() - apiStart).toFixed(2), 'ms');
        message.success('Cập nhật chứng chỉ thành công');
      } else {
        console.log('➕ [PERFORMANCE] Bắt đầu create certificate...');
        newCertificate = await certificateService.createCertificate(payload);
        const apiTime = performance.now() - apiStart;
        console.log('⏱️ [PERFORMANCE] API Create mất:', apiTime.toFixed(2), 'ms');
        message.success('Tạo chứng chỉ thành công');
        
        // Optimistically add new certificate to list (don't wait for full reload)
        const optimisticStart = performance.now();
        if (newCertificate) {
          // Đảm bảo thêm vào đầu danh sách và force re-render
          const certToAdd = newCertificate;
          setCertificates(prev => {
            // Kiểm tra xem đã có chưa để tránh duplicate
            const exists = prev.some(cert => cert._id === certToAdd._id);
            if (exists) {
              return prev; // Đã có rồi, không thêm nữa
            }
            return [certToAdd, ...prev];
          });
          // Update stats
          setStats(prev => ({
            total: prev.total + 1,
            active: certToAdd.status === 'ACTIVE' ? prev.active + 1 : prev.active,
            inactive: certToAdd.status === 'INACTIVE' ? prev.inactive + 1 : prev.inactive,
            expired: certToAdd.status === 'EXPIRED' ? prev.expired + 1 : prev.expired
          }));
          
          // Force reload sau 500ms để đảm bảo data sync (silent reload)
          setTimeout(() => {
            loadCertificates(false).catch(err => {
              console.error('Error reloading certificates after create:', err);
            });
          }, 500);
        }
        console.log('⏱️ [PERFORMANCE] Optimistic update mất:', (performance.now() - optimisticStart).toFixed(2), 'ms');
      }
      
      // Đóng modal và reset form NGAY (không đợi reload)
      const uiUpdateStart = performance.now();
      setFormModalVisible(false);
      setEditingCertificate(null);
      form.resetFields();
      setLoading(false); // Tắt loading ngay
      console.log('⏱️ [PERFORMANCE] UI update mất:', (performance.now() - uiUpdateStart).toFixed(2), 'ms');
      
      const totalTime = performance.now() - startTime;
      console.log('✅ [PERFORMANCE] Tổng thời gian submit:', totalTime.toFixed(2), 'ms');
      
      // KHÔNG reload danh sách sau khi create vì đã có optimistic update
      // Chỉ reload nếu là edit (để cập nhật thông tin đã thay đổi) - nhưng không show loading
      if (editingCertificate?._id) {
        // Reload khi edit nhưng không show loading (silent reload)
        loadCertificates(false).catch(err => {
          console.error('Error reloading certificates after edit:', err);
        });
      }
      // Với create: không cần reload vì đã có optimistic update → hiển thị ngay lập tức!
    } catch (err: any) {
      console.error('Save certificate error:', err);
      console.error('Error response:', err?.response?.data);
      console.error('Error message:', err?.message);
      
      if (err?.errorFields) {
        // Validation errors từ form
        const firstError = err.errorFields[0];
        message.error(firstError?.errors?.[0] || 'Vui lòng kiểm tra lại thông tin đã nhập');
      } else if (err?.response?.data) {
        // Backend error
        const errorData = err.response.data;
        const errorMessage = errorData?.message || errorData?.errors?.[0]?.msg || 'Không thể lưu chứng chỉ';
        message.error(errorMessage);
        
        // Hiển thị chi tiết lỗi validation nếu có
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          const errorDetails = errorData.errors.map((e: any) => e.msg || e.message).join(', ');
          console.error('Validation errors:', errorDetails);
        }
      } else {
        message.error(err?.message || 'Không thể lưu chứng chỉ');
      }
    } finally {
      setLoading(false);
    }
  };

  const openRenewModal = (record: Certificate) => {
    setRenewTarget(record);
    setRenewalDate(dayjs());
    setRenewalNotes('');
    setRenewModalVisible(true);
  };

  const handleRenewSubmit = async () => {
    if (!renewTarget) return;
    try {
      setLoading(true);
      await certificateService.renewCertificate(renewTarget._id, {
        renewalDate: renewalDate ? renewalDate.toISOString() : undefined,
        notes: renewalNotes || undefined
      });
      message.success('Gia hạn chứng chỉ thành công');
      setRenewModalVisible(false);
      setRenewTarget(null);
      await loadCertificates();
    } catch (err) {
      message.error('Không thể gia hạn chứng chỉ');
      console.error('Renew certificate error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'SAFETY': 'An toàn lao động',
      'TECHNICAL': 'Kỹ thuật',
      'MANAGEMENT': 'Quản lý',
      'QUALITY': 'Chất lượng',
      'ENVIRONMENTAL': 'Môi trường',
      'HEALTH': 'Sức khỏe',
      'OTHER': 'Khác'
    };
    return labels[category] || category;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'green',
      'INACTIVE': 'default',
      'SUSPENDED': 'orange',
      'EXPIRED': 'red'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'LOW': 'green',
      'MEDIUM': 'blue',
      'HIGH': 'orange',
      'CRITICAL': 'red'
    };
    return colors[priority] || 'default';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'ACTIVE': <CheckCircleOutlined />,
      'INACTIVE': <ClockCircleOutlined />,
      'SUSPENDED': <WarningOutlined />,
      'EXPIRED': <ExclamationCircleOutlined />
    };
    return icons[status] || <InfoCircleOutlined />;
  };

  // Handle view certificate
  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  // Handle delete certificate
  const handleDeleteCertificate = async (id: string) => {
    try {
      setLoading(true);
      await certificateService.deleteCertificate(id);
      message.success('Xóa chứng chỉ thành công');
      await loadCertificates();
    } catch (err: any) {
      message.error('Không thể xóa chứng chỉ');
      console.error('Delete certificate error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Close image modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  // Handle view expiring certificates
  const handleViewExpiring = async () => {
    try {
      setLoading(true);
      const expiring = await certificateService.getExpiringCertificates(30);
      setExpiringCertificates(expiring);
      setExpiringModalVisible(true);
    } catch (err: any) {
      message.error('Không thể tải danh sách chứng chỉ sắp hết hạn');
      console.error('Get expiring certificates error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle view stats
  const handleViewStats = async () => {
    try {
      setLoading(true);
      const statsData = await certificateService.getCertificateStats();
      setDetailedStats(statsData);
      setStatsModalVisible(true);
    } catch (err: any) {
      message.error('Không thể tải thống kê chứng chỉ');
      console.error('Get certificate stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Columns definition
  const columns = [
    {
      title: 'Tên chứng chỉ',
      dataIndex: 'certificateName',
      key: 'certificateName',
      width: 200,
      render: (text: string, record: Certificate) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.certificateCode}</div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color="blue">{getCategoryLabel(category)}</Tag>
      ),
    },
    {
      title: 'Cơ quan cấp',
      dataIndex: 'issuingAuthority',
      key: 'issuingAuthority',
      width: 150,
      render: (text: string) => (
        <div style={{ fontSize: '12px' }}>{text}</div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusClass = status === 'ACTIVE' ? styles.statusActive :
                           status === 'INACTIVE' ? styles.statusInactive :
                           status === 'EXPIRED' ? styles.statusExpired :
                           styles.statusSuspended;
        return (
          <Tag className={`${styles.statusTag} ${statusClass}`} icon={getStatusIcon(status)}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const priorityClass = priority === 'CRITICAL' ? styles.priorityCritical :
                             priority === 'HIGH' ? styles.priorityHigh :
                             priority === 'MEDIUM' ? styles.priorityMedium :
                             styles.priorityLow;
        return (
          <Tag className={`${styles.priorityTag} ${priorityClass}`}>
            {priority}
          </Tag>
        );
      },
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      key: 'cost',
      width: 120,
      render: (cost: number, record: Certificate) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{formatCurrency(cost)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.currency}</div>
        </div>
      ),
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 120,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_: any, record: Certificate) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCertificate(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Gia hạn">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => openRenewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Cài đặt nhắc nhở">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setReminderTarget(record);
                reminderForm.resetFields();
                reminderForm.setFieldsValue({
                  enabled: record.reminderSettings?.enabled || false,
                  reminderDays: record.reminderSettings?.reminderDays || [],
                  notificationMethods: record.reminderSettings?.notificationMethods || [],
                  recipients: record.reminderSettings?.recipients || []
                });
                setReminderModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa chứng chỉ này?"
            onConfirm={() => handleDeleteCertificate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
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
            <button onClick={() => loadCertificates()}>
              Thử lại
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <Card className={styles.headerCard} styles={{ body: { padding: '20px 24px' } }}>
        <Title level={2} className={styles.headerTitle}>
          <SafetyCertificateOutlined className={styles.headerIcon} /> Quản lý chứng chỉ
        </Title>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card className={`${styles.statsCard} ${styles.statsCardTotal}`} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Tổng chứng chỉ"
              value={stats.total}
              valueStyle={{ color: 'var(--primary-green)' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className={`${styles.statsCard} ${styles.statsCardActive}`} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: 'var(--success-green)' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className={`${styles.statsCard} ${styles.statsCardInactive}`} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Không hoạt động"
              value={stats.inactive}
              valueStyle={{ color: 'var(--text-muted)' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className={`${styles.statsCard} ${styles.statsCardExpired}`} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Hết hạn"
              value={stats.expired}
              valueStyle={{ color: 'var(--error-red)' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className={styles.filterCard} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle" className={styles.filterRow}>
          {/* Search */}
          <Col xs={24} sm={12} md={6} lg={5}>
            <Search
              className={styles.searchInput}
              placeholder="Tìm kiếm chứng chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={setSearchTerm}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          {/* Filters */}
          <Col xs={8} sm={6} md={4} lg={3}>
            <Select
              className={styles.filterSelect}
              placeholder="Danh mục"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="SAFETY">An toàn lao động</Option>
              <Option value="TECHNICAL">Kỹ thuật</Option>
              <Option value="MANAGEMENT">Quản lý</Option>
              <Option value="QUALITY">Chất lượng</Option>
              <Option value="ENVIRONMENTAL">Môi trường</Option>
              <Option value="HEALTH">Sức khỏe</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </Col>
          <Col xs={8} sm={6} md={4} lg={3}>
            <Select
              className={styles.filterSelect}
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="ACTIVE">Đang hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
              <Option value="SUSPENDED">Tạm dừng</Option>
              <Option value="EXPIRED">Đã hết hạn</Option>
            </Select>
          </Col>
          <Col xs={8} sm={6} md={4} lg={3}>
            <Select
              className={styles.filterSelect}
              placeholder="Mức độ"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="LOW">Thấp</Option>
              <Option value="MEDIUM">Trung bình</Option>
              <Option value="HIGH">Cao</Option>
              <Option value="CRITICAL">Nghiêm trọng</Option>
            </Select>
          </Col>
          {/* Action Buttons - All in one row */}
          <Col xs={24} sm={24} md={6} lg={10} className={styles.actionsCol}>
            <Space size="middle" wrap className={styles.actionsSpace}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadCertificates()}
                className={styles.secondaryButton}
                size="middle"
              >
                Tải lại
              </Button>
              <Button
                icon={<ClockCircleOutlined />}
                onClick={handleViewExpiring}
                className={styles.expiringButton}
                size="middle"
              >
                Sắp hết hạn
              </Button>
              <Button
                icon={<BarChartOutlined />}
                onClick={handleViewStats}
                className={styles.secondaryButton}
                size="middle"
              >
                Thống kê
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                className={styles.primaryButton}
                size="middle"
              >
                Tạo mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCertificates}
          rowKey={(record) => record._id || (record as any).id || record.certificateCode || Math.random().toString()}
          loading={loading}
          pagination={{
            total: filteredCertificates.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chứng chỉ`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có chứng chỉ nào"
              />
            ),
          }}
        />
      </Card>

      {/* Create / Update Modal */}
      <Modal
        title={editingCertificate ? 'Chỉnh sửa chứng chỉ' : 'Tạo mới chứng chỉ'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          setEditingCertificate(null);
        }}
        onOk={handleFormSubmit}
        confirmLoading={loading}
        width={720}
      >
        <Form layout="vertical" form={form}>
          {/* Hiển thị thông tin công ty (read-only) */}
          {currentTenant && !editingCertificate && (
            <Alert
              message={
                <span>
                  <strong>📋 Công ty:</strong> {typeof currentTenant === 'object' && currentTenant && 'name' in currentTenant ? (currentTenant.name || 'N/A') : 'Đang tải...'}
                  <br />
                  <small style={{ color: '#666' }}>
                    Chứng chỉ sẽ được tạo cho công ty này. Thông tin công ty được tự động lấy từ tài khoản của bạn.
                  </small>
                </span>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên chứng chỉ"
                name="certificateName"
                rules={[{ required: true, message: 'Vui lòng nhập hoặc chọn tên nhân viên' }]}
                tooltip="Nhập tên nhân viên hoặc chọn từ danh sách có sẵn. Tên chứng chỉ = Tên nhân viên."
              >
                <AutoComplete
                  options={employees.map((emp: any) => ({
                    value: emp.full_name || emp.username,
                    label: (
                      <div>
                        <strong>{emp.full_name || emp.username}</strong>
                        {emp.email && <div style={{ fontSize: '12px', color: '#666' }}>{emp.email}</div>}
                      </div>
                    )
                  }))}
                  placeholder="Nhập hoặc chọn tên nhân viên..."
                  filterOption={(inputValue, option) =>
                    (option?.value as string)?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  onSelect={(value) => {
                    // Tự động generate code khi chọn tên
                    const category = form.getFieldValue('category') || '';
                    const generatedCode = generateCertificateCode(value, category);
                    if (generatedCode) {
                      form.setFieldsValue({ certificateCode: generatedCode });
                    }
                  }}
                  onChange={(value) => {
                    // Generate code khi nhập tên
                    const category = form.getFieldValue('category') || '';
                    const generatedCode = generateCertificateCode(value, category);
                    if (generatedCode) {
                      form.setFieldsValue({ certificateCode: generatedCode });
                    }
                  }}
                  onFocus={() => {
                    // Load employees khi focus vào AutoComplete
                    if (employees.length === 0 && !loadingEmployees) {
                      console.log('🔄 Loading employees on focus...');
                      loadEmployees();
                    }
                  }}
                  notFoundContent={loadingEmployees ? <Spin size="small" /> : <div>Không tìm thấy nhân viên</div>}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mã chứng chỉ"
                name="certificateCode"
                rules={[{ max: 50, message: 'Tối đa 50 ký tự' }]}
                tooltip="Mã chứng chỉ sẽ tự động tạo khi bạn nhập tên. Bạn có thể chỉnh sửa nếu cần."
              >
                <Input 
                  placeholder="Tự động tạo khi nhập tên" 
                  style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select 
                  placeholder="Chọn danh mục"
                  onChange={handleCategoryChange}
                >
                  <Option value="SAFETY">An toàn lao động</Option>
                  <Option value="TECHNICAL">Kỹ thuật</Option>
                  <Option value="MANAGEMENT">Quản lý</Option>
                  <Option value="QUALITY">Chất lượng</Option>
                  <Option value="ENVIRONMENTAL">Môi trường</Option>
                  <Option value="HEALTH">Sức khỏe</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cơ quan cấp"
                name="issuingAuthority"
                rules={[{ required: true, message: 'Vui lòng nhập cơ quan cấp' }]}
              >
                <Input placeholder="Tên cơ quan cấp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Thời hạn"
                name="validityPeriod"
                rules={[
                  { required: true, message: 'Nhập thời hạn' },
                  { type: 'number', min: 1, max: 36, message: 'Phải từ 1 đến 36 (tối đa 3 năm)' }
                ]}
              >
                <InputNumber min={1} max={36} style={{ width: '100%' }} placeholder="1-36" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Đơn vị"
                name="validityPeriodUnit"
                rules={[{ required: true, message: 'Chọn đơn vị' }]}
                initialValue="MONTHS"
              >
                <Select>
                  <Option value="DAYS">Ngày</Option>
                  <Option value="MONTHS">Tháng</Option>
                  <Option value="YEARS">Năm</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ngày cấp" name="issueDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Mức độ" name="priority">
                <Select>
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="CRITICAL">Nghiêm trọng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái" name="status">
                <Select>
                  <Option value="ACTIVE">ACTIVE</Option>
                  <Option value="INACTIVE">INACTIVE</Option>
                  <Option value="SUSPENDED">SUSPENDED</Option>
                  <Option value="EXPIRED">EXPIRED</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Chi phí" name="cost">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="VND" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tiền tệ" name="currency">
                <Input placeholder="VND" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Yêu cầu gia hạn" name="renewalRequired" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Renew Modal */}
      <Modal
        title="Gia hạn chứng chỉ"
        open={renewModalVisible}
        onCancel={() => setRenewModalVisible(false)}
        onOk={handleRenewSubmit}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <DatePicker
            style={{ width: '100%' }}
            value={renewalDate}
            onChange={setRenewalDate}
            placeholder="Chọn ngày gia hạn"
          />
          <Input.TextArea
            rows={3}
            placeholder="Ghi chú gia hạn (tùy chọn)"
            value={renewalNotes}
            onChange={(e) => setRenewalNotes(e.target.value)}
          />
        </Space>
      </Modal>

      {/* Certificate Detail Modal */}
      <Modal
        title="Chi tiết chứng chỉ"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedCertificate && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Tên chứng chỉ" span={2}>
                {selectedCertificate.certificateName}
              </Descriptions.Item>
              <Descriptions.Item label="Mã chứng chỉ">
                {selectedCertificate.certificateCode}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                <Tag color="blue">{getCategoryLabel(selectedCertificate.category)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cơ quan cấp">
                {selectedCertificate.issuingAuthority}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedCertificate.status)}>
                  {selectedCertificate.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ">
                <Tag color={getPriorityColor(selectedCertificate.priority)}>
                  {selectedCertificate.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chi phí">
                {formatCurrency(selectedCertificate.cost)} {selectedCertificate.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Thời hạn">
                {selectedCertificate.validityPeriod} {selectedCertificate.validityPeriodUnit}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cấp">
                {selectedCertificate.issueDate ? formatDate(selectedCertificate.issueDate) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hết hạn">
                {selectedCertificate.expiryDate ? formatDate(selectedCertificate.expiryDate) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedCertificate.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        title="Xem trước hình ảnh"
        open={!!modalImage}
        onCancel={closeImageModal}
        footer={[
          <Button key="close" onClick={closeImageModal}>
            Đóng
          </Button>,
        ]}
      >
        {modalImage && (
          <Image
            src={modalImage}
            alt="Preview"
            style={{ width: '100%' }}
          />
        )}
      </Modal>

      {/* Reminder Settings Modal */}
      <Modal
        title="Cài đặt nhắc nhở"
        open={reminderModalVisible}
        onCancel={() => {
          setReminderModalVisible(false);
          setReminderTarget(null);
        }}
        onOk={async () => {
          try {
            const values = await reminderForm.validateFields();
            if (!reminderTarget) return;
            setLoading(true);
            await certificateService.updateReminderSettings(reminderTarget._id, {
              enabled: values.enabled,
              reminderDays: values.reminderDays || [],
              notificationMethods: values.notificationMethods || [],
              recipients: values.recipients || []
            });
            message.success('Cập nhật cài đặt nhắc nhở thành công');
            setReminderModalVisible(false);
            setReminderTarget(null);
            await loadCertificates();
          } catch (err: any) {
            if (!err?.errorFields) {
              message.error('Không thể cập nhật cài đặt nhắc nhở');
            }
          } finally {
            setLoading(false);
          }
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form layout="vertical" form={reminderForm}>
          <Form.Item
            name="enabled"
            label="Bật nhắc nhở"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="reminderDays"
            label="Nhắc nhở trước (ngày)"
            tooltip="Nhập các số ngày cách nhau bởi dấu phẩy, ví dụ: 30, 7, 1"
          >
            <Select
              mode="tags"
              placeholder="Nhập số ngày, ví dụ: 30, 7, 1"
              tokenSeparators={[',']}
            />
          </Form.Item>
          <Form.Item
            name="notificationMethods"
            label="Phương thức thông báo"
          >
            <Select mode="multiple" placeholder="Chọn phương thức">
              <Option value="EMAIL">Email</Option>
              <Option value="SMS">SMS</Option>
              <Option value="SYSTEM">Hệ thống</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Expiring Certificates Modal */}
      <Modal
        title={
          <span>
            <ClockCircleOutlined style={{ color: 'var(--warning-yellow)', marginRight: 8 }} />
            Chứng chỉ sắp hết hạn (30 ngày)
          </span>
        }
        open={expiringModalVisible}
        onCancel={() => setExpiringModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setExpiringModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={1000}
        mask={true}
        maskClosable={false}
        destroyOnClose={true}
        style={{ zIndex: 1000 }}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
      >
        {expiringCertificates.length === 0 ? (
          <Empty description="Không có chứng chỉ nào sắp hết hạn trong 30 ngày tới" />
        ) : (
          <Table
            columns={[
              {
                title: 'Tên chứng chỉ',
                dataIndex: 'certificateName',
                key: 'certificateName',
              },
              {
                title: 'Mã chứng chỉ',
                dataIndex: 'certificateCode',
                key: 'certificateCode',
              },
              {
                title: 'Danh mục',
                dataIndex: 'category',
                key: 'category',
                render: (category: string) => (
                  <Tag className={styles.categoryTag}>{getCategoryLabel(category)}</Tag>
                ),
              },
              {
                title: 'Ngày hết hạn',
                dataIndex: 'expiryDate',
                key: 'expiryDate',
                render: (date: string) => date ? formatDate(date) : '-',
              },
              {
                title: 'Còn lại',
                key: 'daysLeft',
                render: (_: any, record: Certificate) => {
                  if (!record.expiryDate) return '-';
                  const expiryDate = new Date(record.expiryDate);
                  const now = new Date();
                  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <Tag color={daysLeft <= 7 ? 'red' : daysLeft <= 30 ? 'orange' : 'green'}>
                      {daysLeft} ngày
                    </Tag>
                  );
                },
              },
            ]}
            dataSource={expiringCertificates}
            rowKey={(record) => record._id}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>

      {/* Statistics Modal */}
      <Modal
        title="Thống kê chứng chỉ"
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setStatsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {detailedStats && (
          <div>
            {detailedStats.overview && (
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Statistic title="Tổng số" value={detailedStats.overview.total || 0} />
                </Col>
                <Col span={6}>
                  <Statistic title="Đang hoạt động" value={detailedStats.overview.active || 0} valueStyle={{ color: '#52c41a' }} />
                </Col>
                <Col span={6}>
                  <Statistic title="Hết hạn" value={detailedStats.overview.expired || 0} valueStyle={{ color: '#ff4d4f' }} />
                </Col>
                <Col span={6}>
                  <Statistic title="Sắp hết hạn" value={detailedStats.overview.expiring || 0} valueStyle={{ color: '#faad14' }} />
                </Col>
              </Row>
            )}
            {detailedStats.byCategory && detailedStats.byCategory.length > 0 && (
              <Card title="Thống kê theo danh mục" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  {detailedStats.byCategory.map((item: any) => (
                    <Col xs={12} sm={8} md={6} key={item._id}>
                      <Card size="small" bordered>
                        <Statistic 
                          title={getCategoryLabel(item._id || 'Khác')} 
                          value={item.count || 0}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
            {detailedStats.byPriority && (
              <Card title="Thống kê theo mức độ ưu tiên" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title="CRITICAL" value={detailedStats.byPriority.CRITICAL || 0} valueStyle={{ color: '#ff4d4f' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="HIGH" value={detailedStats.byPriority.HIGH || 0} valueStyle={{ color: '#faad14' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="MEDIUM" value={detailedStats.byPriority.MEDIUM || 0} valueStyle={{ color: '#1890ff' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="LOW" value={detailedStats.byPriority.LOW || 0} valueStyle={{ color: '#52c41a' }} />
                  </Col>
                </Row>
              </Card>
            )}
            {detailedStats.byExpiryStatus && (
              <Card title="Thống kê theo trạng thái hết hạn">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title="Đã hết hạn" value={detailedStats.byExpiryStatus.expired || 0} valueStyle={{ color: '#ff4d4f' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Hết hạn trong 7 ngày" value={detailedStats.byExpiryStatus.expiringIn7Days || 0} valueStyle={{ color: '#faad14' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Hết hạn trong 30 ngày" value={detailedStats.byExpiryStatus.expiringIn30Days || 0} valueStyle={{ color: '#1890ff' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Hết hạn trong 90 ngày" value={detailedStats.byExpiryStatus.expiringIn90Days || 0} valueStyle={{ color: '#52c41a' }} />
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>


      {/* Template Selection Modal */}
      <Modal
        title="Chọn mẫu chứng chỉ"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {certificateTemplates.map((template, index) => (
            <Card
              key={index}
              hoverable
              style={{ marginBottom: 12, cursor: 'pointer' }}
              onClick={() => applyTemplate(template)}
            >
              <Row gutter={16} align="middle">
                <Col span={18}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {template.name}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {template.data.category} • {template.data.validityPeriod} {template.data.validityPeriodUnit === 'MONTHS' ? 'tháng' : template.data.validityPeriodUnit === 'YEARS' ? 'năm' : 'ngày'}
                  </Typography.Text>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Button type="primary" size="small">
                    Chọn
                  </Button>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CertificateManagement;