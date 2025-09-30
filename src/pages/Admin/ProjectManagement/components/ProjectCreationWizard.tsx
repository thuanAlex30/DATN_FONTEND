import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  Steps, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Spin,
  Modal,
  Row,
  Col,
  Progress,
  Tag,
  Badge,
  message,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Table,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  EnvironmentOutlined,
  FlagOutlined,
  BoxPlotOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined as MapPinOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { type SiteArea } from '../../../../types/siteArea';
import { type WorkLocation } from '../../../../services/workLocationService';
import { type ProjectPhase } from '../../../../services/projectPhaseService';
import { type ProjectResource } from '../../../../services/projectResourceService';
import { type ProjectRisk } from '../../../../services/projectRiskService';
import { type ProjectMilestone } from '../../../../services/projectMilestoneService';
import siteAreaService from '../../../../services/siteAreaService';
import projectPhaseService from '../../../../services/projectPhaseService';
import projectService from '../../../../services/projectService';

const { Title, Text, Paragraph } = Typography;

interface ProjectCreationWizardProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProjectBasicInfo {
  project_id?: string;
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  project_type: 'CONSTRUCTION' | 'MAINTENANCE' | 'RENOVATION' | 'INSPECTION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  leader_id: string;
  site_id: string;
  site_name?: string;
  budget?: number;
}

const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({ 
  visible,
  onClose, 
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [projectBasicInfo, setProjectBasicInfo] = useState<ProjectBasicInfo | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Data states
  const [siteAreas, setSiteAreas] = useState<SiteArea[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [projectPhases, setProjectPhases] = useState<ProjectPhase[]>([]);
  const [projectResources, setProjectResources] = useState<ProjectResource[]>([]);
  const [projectRisks, setProjectRisks] = useState<ProjectRisk[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);

  // Load data when component mounts
  useEffect(() => {
    if (visible) {
      loadAvailableEmployees();
      if (createdProjectId) {
        loadSiteAreas();
      }
    }
  }, [visible, createdProjectId]);

  // Load project phases when project ID is available
  useEffect(() => {
    if (visible && createdProjectId) {
      loadProjectPhases();
    }
  }, [visible, createdProjectId]);

  const loadAvailableEmployees = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAvailableEmployees();
      if (response.success && response.data) {
        setAvailableEmployees(response.data);
      }
    } catch (error: any) {
      console.error('Error loading available employees:', error);
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const loadSiteAreas = async () => {
    if (!createdProjectId) return;
    
    try {
      setLoading(true);
      // For now, we'll load all site areas since we don't have site_id yet
      // This will be updated when we implement site management
      const areas = await siteAreaService.getAllAreas();
      setSiteAreas(areas);
    } catch (error: any) {
      console.error('Error loading site areas:', error);
      message.error('Không thể tải danh sách khu vực');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectPhases = async () => {
    if (!createdProjectId) return;
    
    try {
      setLoading(true);
      const phases = await projectPhaseService.getProjectPhases(createdProjectId);
      setProjectPhases(phases.sort((a, b) => a.phase_order - b.phase_order));
    } catch (error: any) {
      console.error('Error loading project phases:', error);
      message.error('Không thể tải danh sách giai đoạn');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Thông tin Dự án',
      description: 'Tạo dự án mới',
      icon: <ProjectOutlined />,
      data: [],
      dataKey: 'projectInfo',
      fields: [
        { name: 'project_name', label: 'Tên dự án', type: 'input', required: true },
        { name: 'description', label: 'Mô tả dự án', type: 'textarea', required: true },
        { name: 'start_date', label: 'Ngày bắt đầu', type: 'date', required: true },
        { name: 'end_date', label: 'Ngày kết thúc', type: 'date', required: true },
        { name: 'project_type', label: 'Loại dự án', type: 'select', required: true, options: [
          { value: 'CONSTRUCTION', label: 'Xây dựng' },
          { value: 'MAINTENANCE', label: 'Bảo trì' },
          { value: 'RENOVATION', label: 'Cải tạo' },
          { value: 'INSPECTION', label: 'Kiểm tra' },
          { value: 'SAFETY', label: 'An toàn' },
          { value: 'TRAINING', label: 'Đào tạo' }
        ]},
        { name: 'priority', label: 'Mức độ ưu tiên', type: 'select', required: true, options: [
          { value: 'LOW', label: 'Thấp' },
          { value: 'MEDIUM', label: 'Trung bình' },
          { value: 'HIGH', label: 'Cao' },
          { value: 'URGENT', label: 'Khẩn cấp' }
        ]},
        { name: 'site_name', label: 'Tên công trường', type: 'input', required: true },
        { name: 'leader_id', label: 'Trưởng dự án', type: 'select', required: true, options: [] },
        { name: 'budget', label: 'Ngân sách (VNĐ)', type: 'number', required: false },
        { name: 'client_name', label: 'Tên khách hàng', type: 'input', required: false }
      ]
    },
    {
      title: 'Site & Khu vực',
      description: 'Quản lý Site và Khu vực',
      icon: <EnvironmentOutlined />,
      data: siteAreas,
      dataKey: 'siteAreas',
      fields: [
        { name: 'area_code', label: 'Mã khu vực', type: 'input', required: true },
        { name: 'area_name', label: 'Tên khu vực', type: 'input', required: true },
        { name: 'area_type', label: 'Loại khu vực', type: 'select', required: true, options: [
          { value: 'CONSTRUCTION', label: 'Thi công' },
          { value: 'STORAGE', label: 'Kho bãi' },
          { value: 'OFFICE', label: 'Văn phòng' },
          { value: 'SAFETY', label: 'An toàn' },
          { value: 'EQUIPMENT', label: 'Thiết bị' },
          { value: 'PARKING', label: 'Bãi đỗ xe' }
        ]},
        { name: 'area_size_sqm', label: 'Diện tích (m²)', type: 'number', required: true },
        { name: 'safety_level', label: 'Mức độ an toàn', type: 'select', required: true, options: [
          { value: 'LOW', label: 'Thấp' },
          { value: 'MEDIUM', label: 'Trung bình' },
          { value: 'HIGH', label: 'Cao' },
          { value: 'CRITICAL', label: 'Nghiêm trọng' }
        ]},
        { name: 'description', label: 'Mô tả', type: 'textarea', required: false },
        { name: 'supervisor_id', label: 'ID Giám sát', type: 'input', required: false }
      ]
    },
    {
      title: 'Giai đoạn Dự án',
      description: 'Lập kế hoạch Giai đoạn',
      icon: <FlagOutlined />,
      data: projectPhases,
      dataKey: 'projectPhases',
      fields: [
        { name: 'phaseName', label: 'Tên Giai đoạn', type: 'input', required: true },
        { name: 'description', label: 'Mô tả', type: 'textarea', required: false },
        { name: 'startDate', label: 'Ngày bắt đầu', type: 'date', required: true },
        { name: 'endDate', label: 'Ngày kết thúc', type: 'date', required: true },
        { name: 'budget', label: 'Ngân sách (VNĐ)', type: 'number', required: false }
      ]
    },
    {
      title: 'Tài nguyên',
      description: 'Phân bổ Tài nguyên',
      icon: <BoxPlotOutlined />,
      data: projectResources,
      dataKey: 'projectResources',
      fields: [
        { name: 'resourceName', label: 'Tên Tài nguyên', type: 'input', required: true },
        { name: 'resourceType', label: 'Loại tài nguyên', type: 'select', required: true, options: [
          { value: 'HUMAN', label: 'Nhân lực' },
          { value: 'MATERIAL', label: 'Vật liệu' },
          { value: 'EQUIPMENT', label: 'Thiết bị' },
          { value: 'FINANCIAL', label: 'Tài chính' }
        ]},
        { name: 'quantity', label: 'Số lượng', type: 'number', required: true },
        { name: 'unit', label: 'Đơn vị', type: 'input', required: true },
        { name: 'cost', label: 'Chi phí (VNĐ)', type: 'number', required: false },
        { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: [
          { value: 'AVAILABLE', label: 'Có sẵn' },
          { value: 'ALLOCATED', label: 'Đã phân bổ' },
          { value: 'DEPLETED', label: 'Hết hàng' }
        ]}
      ]
    },
    {
      title: 'Rủi ro',
      description: 'Đánh giá Rủi ro',
      icon: <SafetyOutlined />,
      data: projectRisks,
      dataKey: 'projectRisks',
      fields: [
        { name: 'riskName', label: 'Tên Rủi ro', type: 'input', required: true },
        { name: 'description', label: 'Mô tả', type: 'textarea', required: true },
        { name: 'probability', label: 'Xác suất (%)', type: 'number', required: true, min: 0, max: 100 },
        { name: 'impact', label: 'Tác động', type: 'select', required: true, options: [
          { value: 'LOW', label: 'Thấp' },
          { value: 'MEDIUM', label: 'Trung bình' },
          { value: 'HIGH', label: 'Cao' },
          { value: 'CRITICAL', label: 'Nghiêm trọng' }
        ]},
        { name: 'mitigation', label: 'Biện pháp giảm thiểu', type: 'textarea', required: false },
        { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: [
          { value: 'IDENTIFIED', label: 'Đã xác định' },
          { value: 'MONITORING', label: 'Đang theo dõi' },
          { value: 'MITIGATED', label: 'Đã giảm thiểu' },
          { value: 'CLOSED', label: 'Đã đóng' }
        ]}
      ]
    },
    {
      title: 'Milestone',
      description: 'Quản lý Milestone',
      icon: <CheckCircleOutlined />,
      data: projectMilestones,
      dataKey: 'projectMilestones',
      fields: [
        { name: 'milestoneName', label: 'Tên Milestone', type: 'input', required: true },
        { name: 'description', label: 'Mô tả', type: 'textarea', required: false },
        { name: 'targetDate', label: 'Ngày mục tiêu', type: 'date', required: true },
        { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: [
          { value: 'PENDING', label: 'Chờ thực hiện' },
          { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
          { value: 'COMPLETED', label: 'Hoàn thành' },
          { value: 'OVERDUE', label: 'Quá hạn' }
        ]},
        { name: 'priority', label: 'Độ ưu tiên', type: 'select', required: true, options: [
          { value: 'LOW', label: 'Thấp' },
          { value: 'MEDIUM', label: 'Trung bình' },
          { value: 'HIGH', label: 'Cao' },
          { value: 'CRITICAL', label: 'Nghiêm trọng' }
        ]}
      ]
    },
    {
      title: 'Vị trí Làm việc',
      description: 'Vị trí Làm việc',
      icon: <MapPinOutlined />,
      data: workLocations,
      dataKey: 'workLocations',
      fields: [
        { name: 'locationName', label: 'Tên Vị trí', type: 'input', required: true },
        { name: 'address', label: 'Địa chỉ', type: 'textarea', required: true },
        { name: 'city', label: 'Thành phố', type: 'input', required: true },
        { name: 'province', label: 'Tỉnh/Thành', type: 'input', required: true },
        { name: 'coordinates', label: 'Tọa độ (lat,lng)', type: 'input', required: false },
        { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: [
          { value: 'ACTIVE', label: 'Hoạt động' },
          { value: 'INACTIVE', label: 'Không hoạt động' },
          { value: 'MAINTENANCE', label: 'Bảo trì' }
        ]}
      ]
    }
  ];

  // Load data for current step
  useEffect(() => {
    const loadStepData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        switch (currentStep) {
          case 0: // Project Basic Info
            // No data to load for step 0
            break;
          case 1: // Project Phases
            setProjectPhases([]);
            break;
          case 2: // Project Resources
            setProjectResources([]);
            break;
          case 3: // Project Risks
            setProjectRisks([]);
            break;
          case 4: // Project Milestones
            setProjectMilestones([]);
            break;
          case 5: // Work Locations
            setWorkLocations([]);
            break;
        }
      } catch (err) {
        setError(`Lỗi khi tải dữ liệu: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadStepData();
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    try {
      // Validate form first
      if (!projectBasicInfo) {
        message.error('Vui lòng điền đầy đủ thông tin dự án trước khi tạo');
        setLoading(false);
        return;
      }

      // Check required fields
      const requiredFields: (keyof ProjectBasicInfo)[] = ['project_name', 'start_date', 'end_date', 'project_type', 'priority', 'site_name', 'leader_id'];
      const missingFields = requiredFields.filter(field => !projectBasicInfo[field]);
      
      if (missingFields.length > 0) {
        message.error('Vui lòng điền đầy đủ các trường bắt buộc');
        setLoading(false);
        return;
      }
      
      const projectData = {
        project_name: projectBasicInfo.project_name,
        description: projectBasicInfo.description,
        start_date: projectBasicInfo.start_date,
        end_date: projectBasicInfo.end_date,
        project_type: projectBasicInfo.project_type,
        priority: projectBasicInfo.priority,
        budget: projectBasicInfo.budget,
        leader_id: projectBasicInfo.leader_id,
        site_id: projectBasicInfo.site_id,
        site_name: projectBasicInfo.site_name || '' // Add required site_name
      };
      
      console.log('Creating project with data:', projectData);
      
      // Import project service
      const { default: projectService } = await import('../../../../services/projectService');
      const response = await projectService.createProject(projectData);
      
      console.log('Project creation response:', response);
      
      if (response.success && response.data) {
        console.log('Project created successfully:', response.data);
        
        // Store the created project ID
        const projectId = response.data.id;
        setCreatedProjectId(projectId);
        
        // Show success message
        message.success('Dự án đã được tạo thành công! Bạn có thể tiếp tục thêm các thông tin chi tiết.');
        
        // Auto advance to next step
        setTimeout(() => {
          setCurrentStep(1);
        }, 1000);
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      message.error(`Lỗi khi tạo dự án: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      message.success('Tất cả thông tin dự án đã được cấu hình thành công!');
      onSuccess();
    } catch (err) {
      console.error('Error completing project setup:', err);
      message.error(`Lỗi khi hoàn thành cấu hình: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    console.log('Adding new item for step:', currentStep);
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    
    // Map API data to form fields based on current step
    let formValues = { ...item };
    
    if (currentStep === 1) { // Project phases
      formValues = {
        phaseName: item.phase_name,
        description: item.description,
        startDate: item.planned_start_date ? item.planned_start_date.split('T')[0] : '',
        endDate: item.planned_end_date ? item.planned_end_date.split('T')[0] : '',
        budget: item.planned_budget
      };
    }
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleDeleteItem = async (item: any) => {
    try {
      setLoading(true);
      // Delete logic based on current step
      switch (currentStep) {
        case 0:
          console.log('Deleting site area:', item._id);
          try {
            await siteAreaService.deleteArea(item._id);
            setSiteAreas(prev => prev.filter(s => s._id !== item._id));
            message.success('Xóa khu vực thành công');
          } catch (error: any) {
            console.error('Error deleting site area:', error);
            message.error('Không thể xóa khu vực');
          }
          break;
          case 1:
            console.log('Deleting project phase:', item._id);
            try {
              await projectPhaseService.deletePhase(item._id);
              setProjectPhases(prev => prev.filter(p => p._id !== item._id));
              message.success('Xóa giai đoạn thành công');
            } catch (error: any) {
              console.error('Error deleting project phase:', error);
              message.error('Không thể xóa giai đoạn');
            }
            break;
        case 2:
          console.log('Deleting project resource:', item._id);
          setProjectResources(prev => prev.filter(r => r._id !== item._id));
          break;
        case 3:
          console.log('Deleting project risk:', item._id);
          setProjectRisks(prev => prev.filter(r => r._id !== item._id));
          break;
        case 4:
          console.log('Deleting project milestone:', item._id);
          setProjectMilestones(prev => prev.filter(m => m._id !== item._id));
          break;
        case 5:
          console.log('Deleting work location:', item._id);
          setWorkLocations(prev => prev.filter(l => l._id !== item._id));
          break;
      }
      message.success('Xóa thành công!');
    } catch (err) {
      message.error('Lỗi khi xóa!');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (values: any) => {
    console.log('=== FORM SUBMIT DEBUG ===');
    console.log('Form submitted with values:', values);
    console.log('Current step:', currentStep);
    console.log('Current step data:', currentStepData);
    console.log('Form values keys:', Object.keys(values));
    console.log('Form values values:', Object.values(values));
    
    try {
      setLoading(true);
      
      if (editingItem) {
        // Update existing item
        switch (currentStep) {
          case 0:
            console.log('Updating site area:', editingItem._id, values);
            try {
              const updatedArea = await siteAreaService.updateArea(editingItem._id, values);
              setSiteAreas(prev => prev.map(s => s._id === editingItem._id ? updatedArea : s));
              message.success('Cập nhật khu vực thành công');
            } catch (error: any) {
              console.error('Error updating site area:', error);
              message.error('Không thể cập nhật khu vực');
            }
            break;
          case 1:
            console.log('Updating project phase:', editingItem._id, values);
            try {
              // Map form values to API format
              const phaseData = {
                phase_name: values.phaseName,
                description: values.description,
                phase_order: values.phaseOrder || projectPhases.length + 1,
                planned_start_date: values.startDate?.format ? values.startDate.format('YYYY-MM-DD') : 
                                 values.startDate?.$d ? values.startDate.$d.toISOString().split('T')[0] :
                                 values.startDate,
                planned_end_date: values.endDate?.format ? values.endDate.format('YYYY-MM-DD') : 
                               values.endDate?.$d ? values.endDate.$d.toISOString().split('T')[0] :
                               values.endDate,
                planned_budget: values.budget || 0
              };
              
              const updatedPhase = await projectPhaseService.updatePhase(editingItem._id, phaseData);
              setProjectPhases(prev => prev.map(p => p._id === editingItem._id ? updatedPhase : p));
              message.success('Cập nhật giai đoạn thành công');
            } catch (error: any) {
              console.error('Error updating project phase:', error);
              message.error('Không thể cập nhật giai đoạn');
            }
            break;
          case 2:
            console.log('Updating project resource:', editingItem._id, values);
            setProjectResources(prev => prev.map(r => r._id === editingItem._id ? { ...r, ...values } : r));
            break;
          case 3:
            console.log('Updating project risk:', editingItem._id, values);
            setProjectRisks(prev => prev.map(r => r._id === editingItem._id ? { ...r, ...values } : r));
            break;
          case 4:
            console.log('Updating project milestone:', editingItem._id, values);
            setProjectMilestones(prev => prev.map(m => m._id === editingItem._id ? { ...m, ...values } : m));
            break;
          case 5:
            console.log('Updating work location:', editingItem._id, values);
            setWorkLocations(prev => prev.map(l => l._id === editingItem._id ? { ...l, ...values } : l));
            break;
        }
        message.success('Cập nhật thành công!');
      } else {
        // Create new item
        switch (currentStep) {
          case 0:
            console.log('Saving project basic info:', values);
            setProjectBasicInfo(values);
            message.success('Lưu thông tin dự án thành công!');
            break;
          case 1:
            console.log('Creating project phase:', values);
            console.log('=== BEFORE VALIDATION ===');
            console.log('values.phaseName:', values.phaseName);
            console.log('values.startDate:', values.startDate);
            console.log('values.endDate:', values.endDate);
            console.log('projectBasicInfo:', projectBasicInfo);
            console.log('projectBasicInfo.project_id:', projectBasicInfo?.project_id);
            
            // Validate required fields
            if (!values.phaseName) {
              message.error('Tên giai đoạn là bắt buộc');
              return;
            }
            if (!values.startDate) {
              message.error('Ngày bắt đầu là bắt buộc');
              return;
            }
            if (!values.endDate) {
              message.error('Ngày kết thúc là bắt buộc');
              return;
            }
            if (!createdProjectId) {
              message.error('Vui lòng tạo dự án trước khi thêm giai đoạn');
              return;
            }
            
            try {
              console.log('=== CREATING PHASE DATA ===');
              console.log('createdProjectId:', createdProjectId);
              console.log('values.phaseName:', values.phaseName);
              console.log('values.startDate before conversion:', values.startDate);
              console.log('values.endDate before conversion:', values.endDate);
              
              // Check if project_id exists
              if (!createdProjectId) {
                message.error('Vui lòng hoàn thành việc tạo dự án trước khi tạo giai đoạn!');
                setCurrentStep(0); // Quay về step 0
                return;
              }
              
              // Map form values to API format
              const phaseData = {
                project_id: createdProjectId,
                phase_name: values.phaseName,
                description: values.description || '',
                phase_order: projectPhases.length + 1,
                planned_start_date: values.startDate?.format ? values.startDate.format('YYYY-MM-DD') : 
                                 values.startDate?.$d ? values.startDate.$d.toISOString().split('T')[0] :
                                 values.startDate,
                planned_end_date: values.endDate?.format ? values.endDate.format('YYYY-MM-DD') : 
                               values.endDate?.$d ? values.endDate.$d.toISOString().split('T')[0] :
                               values.endDate,
                planned_budget: values.budget || 0
              };
              
              console.log('=== PHASE DATA CREATED ===');
              console.log('Phase data object:', phaseData);
              console.log('=== SENDING PHASE DATA TO API ===');
              console.log('Raw startDate:', values.startDate);
              console.log('Raw endDate:', values.endDate);
              console.log('startDate type:', typeof values.startDate);
              console.log('endDate type:', typeof values.endDate);
              console.log('startDate methods:', Object.getOwnPropertyNames(values.startDate || {}));
              console.log('startDate keys:', Object.keys(values.startDate || {}));
              console.log('startDate format method:', values.startDate?.format);
              console.log('startDate toISOString method:', values.startDate?.toISOString);
              console.log('startDate $d property:', values.startDate?.$d);
              console.log('Converted startDate:', values.startDate?.format ? values.startDate.format('YYYY-MM-DD') : values.startDate?.$d ? values.startDate.$d.toISOString().split('T')[0] : values.startDate);
              console.log('Converted endDate:', values.endDate?.format ? values.endDate.format('YYYY-MM-DD') : values.endDate?.$d ? values.endDate.$d.toISOString().split('T')[0] : values.endDate);
              console.log('Phase data:', phaseData);
              
              const newPhase = await projectPhaseService.createPhase(phaseData);
              setProjectPhases(prev => [...prev, newPhase]);
              message.success('Tạo giai đoạn thành công');
            } catch (error: any) {
              console.error('Error creating project phase:', error);
              message.error('Không thể tạo giai đoạn');
            }
            break;
          case 2:
            console.log('Creating project resource:', values);
            // Check if project exists
            if (!createdProjectId) {
              message.error('Vui lòng hoàn thành việc tạo dự án trước khi tạo tài nguyên!');
              setCurrentStep(0);
              return;
            }
            const newResource = { ...values, _id: `mock_${Date.now()}` };
            setProjectResources(prev => [...prev, newResource as ProjectResource]);
            break;
          case 3:
            console.log('Creating project risk:', values);
            // Check if project exists
            if (!createdProjectId) {
              message.error('Vui lòng hoàn thành việc tạo dự án trước khi tạo rủi ro!');
              setCurrentStep(0);
              return;
            }
            const newRisk = { ...values, _id: `mock_${Date.now()}` };
            setProjectRisks(prev => [...prev, newRisk as ProjectRisk]);
            break;
          case 4:
            console.log('Creating project milestone:', values);
            // Check if project exists
            if (!createdProjectId) {
              message.error('Vui lòng hoàn thành việc tạo dự án trước khi tạo cột mốc!');
              setCurrentStep(0);
              return;
            }
            const newMilestone = { ...values, _id: `mock_${Date.now()}` };
            setProjectMilestones(prev => [...prev, newMilestone as ProjectMilestone]);
            break;
          case 5:
            console.log('Creating work location:', values);
            // Check if project exists
            if (!createdProjectId) {
              message.error('Vui lòng hoàn thành việc tạo dự án trước khi tạo địa điểm làm việc!');
              setCurrentStep(0);
              return;
            }
            const newLocation = { ...values, _id: `mock_${Date.now()}` };
            setWorkLocations(prev => [...prev, newLocation as WorkLocation]);
            break;
        }
        message.success('Tạo mới thành công!');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (err) {
      message.error('Lỗi khi lưu dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (field: any) => {
    console.log('Rendering field:', field);
    const commonProps = {
      name: field.name,
      label: field.label,
      rules: field.required ? [{ required: true, message: `Vui lòng nhập ${field.label.toLowerCase()}` }] : []
    };

    const inputProps = {
      placeholder: field.type === 'select' ? `Chọn ${field.label.toLowerCase()}` : `Nhập ${field.label.toLowerCase()}`
    };

    let inputComponent;
    switch (field.type) {
      case 'input':
        inputComponent = <Input {...inputProps} />;
        break;
      case 'textarea':
        inputComponent = <Input.TextArea {...inputProps} rows={3} />;
        break;
      case 'number':
        inputComponent = <InputNumber {...inputProps} style={{ width: '100%' }} min={field.min} max={field.max} />;
        break;
      case 'date':
        inputComponent = <DatePicker {...inputProps} style={{ width: '100%' }} />;
        break;
      case 'select':
        // Special handling for leader_id field
        const options = field.name === 'leader_id' 
          ? availableEmployees.map((emp: any) => ({
              value: emp.id,
              label: `${emp.full_name} (${emp.email})`
            }))
          : field.options || [];
        
        inputComponent = (
          <Select {...inputProps}>
            {options.map((option: any) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
        break;
      default:
        inputComponent = <Input {...inputProps} />;
    }

    return (
      <Form.Item {...commonProps}>
        {inputComponent}
      </Form.Item>
    );
  };

  const currentStepData = steps[currentStep];

  return (
    <Modal
      title="Tạo Dự Án Mới"
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      destroyOnClose
      className="project-creation-modal"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Title level={3} className="mb-2">
            Cấu Hình Chi Tiết Dự Án
          </Title>
          <Text type="secondary">
            Quản lý và cấu hình tất cả các thành phần của dự án
          </Text>
        </div>

        {/* Warning for steps that require project creation */}
        {currentStep > 0 && !createdProjectId && (
          <Alert
            message="Cần hoàn thành tạo dự án trước"
            description="Vui lòng hoàn thành bước 1 (Tạo dự án) trước khi thêm các thông tin chi tiết khác."
            type="warning"
            showIcon
            className="mb-4"
            action={
              <Button 
                size="small" 
                type="primary" 
                onClick={() => setCurrentStep(0)}
              >
                Quay về bước 1
              </Button>
            }
          />
        )}

        {/* Project Basic Info Summary */}
        {projectBasicInfo && (
          <Card 
            className="mb-6 border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50"
            style={{ borderRadius: '12px' }}
          >
            <div className="p-4">
              <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                📋 Thông Tin Dự Án
              </Title>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Tên dự án:</Text> {projectBasicInfo.project_name}
                </Col>
                <Col span={12}>
                  <Text strong>Loại dự án:</Text> {
                    projectBasicInfo.project_type === 'CONSTRUCTION' ? 'Xây dựng' :
                    projectBasicInfo.project_type === 'MAINTENANCE' ? 'Bảo trì' :
                    projectBasicInfo.project_type === 'RENOVATION' ? 'Cải tạo' : 'Kiểm tra'
                  }
                </Col>
                <Col span={12}>
                  <Text strong>Mức độ ưu tiên:</Text> {
                    projectBasicInfo.priority === 'HIGH' ? 'Cao' :
                    projectBasicInfo.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'
                  }
                </Col>
                <Col span={12}>
                  <Text strong>Ngân sách:</Text> {projectBasicInfo.budget ? `${projectBasicInfo.budget.toLocaleString()} VNĐ` : 'Chưa xác định'}
                </Col>
                <Col span={12}>
                  <Text strong>Trưởng dự án:</Text> {
                    availableEmployees.find(emp => emp.id === projectBasicInfo.leader_id)?.full_name || 'Chưa chọn'
                  }
                </Col>
                <Col span={12}>
                  <Text strong>Tên công trường:</Text> {projectBasicInfo.site_name || 'Chưa xác định'}
                </Col>
                <Col span={24}>
                  <Text strong>Mô tả:</Text> {projectBasicInfo.description}
                </Col>
              </Row>
            </div>
          </Card>
        )}

        {/* Progress Steps */}
        <Card className="mb-6 shadow-lg">
          <Steps
            current={currentStep}
            items={steps.map(step => ({
              title: step.title,
              description: step.description,
              icon: step.icon
            }))}
            className="mb-6"
          />
          
          <Progress 
            percent={Math.round(((currentStep + 1) / steps.length) * 100)} 
            strokeColor="#1890ff"
            className="mb-4"
          />
        </Card>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl text-blue-600">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <Title level={3} className="mb-1">
                      {currentStepData.title}
                    </Title>
                    <Text className="text-gray-600">
                      {currentStepData.description}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge 
                    count={currentStepData.data.length} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddItem}
                  >
                    Thêm {currentStepData.title}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert
                  message="Lỗi"
                  description={error}
                  type="error"
                  showIcon
                  className="mb-4"
                />
              )}

              {loading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                  <Paragraph className="mt-4 text-gray-600">
                    Đang tải dữ liệu...
                  </Paragraph>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentStepData.data.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl text-gray-400 mb-4">
                        {currentStepData.icon}
                      </div>
                      <Title level={4} className="text-gray-500 mb-2">
                        Chưa có dữ liệu
                      </Title>
                      <Paragraph className="text-gray-400">
                        Bắt đầu thêm {currentStepData.title.toLowerCase()} cho dự án của bạn
                      </Paragraph>
                    </div>
                  ) : (
                    <Table
                      dataSource={currentStepData.data as any[]}
                      rowKey={'_id'}
                      pagination={{ pageSize: 10 }}
                      columns={[
                        {
                          title: 'Tên',
                          dataIndex: currentStepData.dataKey === 'siteAreas' ? 'area_name' : 
                                     currentStepData.dataKey === 'projectPhases' ? 'phase_name' :
                                     currentStepData.dataKey === 'projectResources' ? 'resourceName' :
                                     currentStepData.dataKey === 'projectRisks' ? 'riskName' :
                                     currentStepData.dataKey === 'projectMilestones' ? 'milestoneName' :
                                     'locationName',
                          key: 'name',
                          render: (text: string) => (
                            <div className="flex items-center space-x-2">
                              <div className="text-blue-600">
                                {currentStepData.icon}
                              </div>
                              <span className="font-medium">{text}</span>
                            </div>
                          )
                        },
                        {
                          title: 'Mô tả',
                          dataIndex: 'description',
                          key: 'description',
                          ellipsis: true,
                          render: (text: string) => text || 'Không có mô tả'
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: currentStepData.dataKey === 'siteAreas' ? 'is_active' : 'status',
                          key: 'status',
                          render: (value: any) => {
                            if (currentStepData.dataKey === 'siteAreas') {
                              return <Tag color={value ? 'green' : 'red'}>{value ? 'Hoạt động' : 'Không hoạt động'}</Tag>;
                            }
                            
                            const statusConfig: any = {
                              'ACTIVE': { color: 'green', text: 'Hoạt động' },
                              'INACTIVE': { color: 'red', text: 'Không hoạt động' },
                              'MAINTENANCE': { color: 'orange', text: 'Bảo trì' },
                              'PLANNING': { color: 'blue', text: 'Lập kế hoạch' },
                              'IN_PROGRESS': { color: 'processing', text: 'Đang thực hiện' },
                              'COMPLETED': { color: 'success', text: 'Hoàn thành' },
                              'ON_HOLD': { color: 'warning', text: 'Tạm dừng' },
                              'PENDING': { color: 'default', text: 'Chờ thực hiện' },
                              'OVERDUE': { color: 'error', text: 'Quá hạn' },
                              'AVAILABLE': { color: 'green', text: 'Có sẵn' },
                              'ALLOCATED': { color: 'blue', text: 'Đã phân bổ' },
                              'DEPLETED': { color: 'red', text: 'Hết hàng' },
                              'IDENTIFIED': { color: 'orange', text: 'Đã xác định' },
                              'MONITORING': { color: 'blue', text: 'Đang theo dõi' },
                              'MITIGATED': { color: 'green', text: 'Đã giảm thiểu' },
                              'CLOSED': { color: 'default', text: 'Đã đóng' }
                            };
                            const config = statusConfig[value] || { color: 'default', text: value };
                            return <Tag color={config.color}>{config.text}</Tag>;
                          }
                        },
                        ...(currentStepData.dataKey === 'projectPhases' ? [
                          {
                            title: 'Ngày bắt đầu',
                            dataIndex: 'planned_start_date',
                            key: 'start_date',
                            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
                          },
                          {
                            title: 'Ngày kết thúc',
                            dataIndex: 'planned_end_date',
                            key: 'end_date',
                            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
                          },
                          {
                            title: 'Ngân sách',
                            dataIndex: 'planned_budget',
                            key: 'budget',
                            render: (amount: number) => amount ? new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(amount) : '-'
                          }
                        ] : []),
                        {
                          title: 'Hành động',
                          key: 'actions',
                          render: (_, record: any) => (
                            <Space>
                              <Tooltip title="Chỉnh sửa">
                                <Button 
                                  type="primary" 
                                  size="small" 
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditItem(record)}
                                />
                              </Tooltip>
                              <Popconfirm
                                title="Bạn có chắc chắn muốn xóa?"
                                onConfirm={() => handleDeleteItem(record)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Tooltip title="Xóa">
                                  <Button 
                                    danger 
                                    size="small" 
                                    icon={<DeleteOutlined />}
                                  />
                                </Tooltip>
                              </Popconfirm>
                            </Space>
                          )
                        }
                      ]}
                    />
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <Card className="shadow-lg">
          <div className="flex justify-between items-center">
            <Button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              size="large"
            >
              Quay lại
            </Button>
            
            <Space>
              <Button onClick={onClose} size="large">
                Hủy
              </Button>
              {currentStep === 0 ? (
                <Button 
                  type="primary" 
                  onClick={handleCreateProject}
                  loading={loading}
                  size="large"
                  icon={<PlusOutlined />}
                >
                  Tạo dự án
                </Button>
              ) : currentStep === steps.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={handleComplete}
                  loading={loading}
                  size="large"
                  icon={<CheckOutlined />}
                >
                  Hoàn thành
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  onClick={nextStep}
                  size="large"
                >
                  Tiếp theo
                </Button>
              )}
            </Space>
          </div>
        </Card>

        {/* Modal Form */}
        <Modal
          title={editingItem ? `Chỉnh sửa ${currentStepData.title}` : `Thêm ${currentStepData.title}`}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              console.log('=== FORM onFinish CALLED ===');
              console.log('Form onFinish called with values:', values);
              handleModalSubmit(values);
            }}
            onFinishFailed={(errorInfo) => {
              console.log('=== FORM VALIDATION FAILED ===');
              console.log('Form validation failed:', errorInfo);
              console.log('Error fields:', errorInfo.errorFields);
            }}
            className="mt-4"
          >
            <Row gutter={16}>
              {currentStepData.fields && currentStepData.fields.length > 0 ? (
                currentStepData.fields.map((field: any) => (
                  <Col span={field.type === 'textarea' ? 24 : 12} key={field.name}>
                    {renderFormField(field)}
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <div className="text-center text-gray-500 py-8">
                    Không có trường dữ liệu nào được định nghĩa cho bước này
                  </div>
                </Col>
              )}
            </Row>
            
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                loading={loading}
                onClick={async () => {
                  console.log('=== SUBMIT BUTTON CLICKED ===');
                  console.log('Submit button clicked');
                  console.log('Form values before submit:', form.getFieldsValue());
                  console.log('Form instance:', form);
                  console.log('Form fields:', form.getFieldsValue());
                  
                  try {
                    console.log('=== VALIDATING FORM ===');
                    const values = await form.validateFields();
                    console.log('=== FORM VALIDATION PASSED ===');
                    console.log('Form validation passed, values:', values);
                    console.log('=== CALLING handleModalSubmit ===');
                    await handleModalSubmit(values);
                  } catch (error: any) {
                    console.log('=== FORM VALIDATION FAILED ===');
                    console.log('Form validation failed:', error);
                    console.log('Error details:', error.errorFields);
                  }
                }}
              >
                {editingItem ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form>
        </Modal>
      </motion.div>
    </Modal>
  );
};

export default ProjectCreationWizard;