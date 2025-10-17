import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
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
  BoxPlotOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../../store';
import { store } from '../../../../store';
import { type RootState } from '../../../../store';
import { 
  fetchSitesByProject,
  setCurrentProjectId as setSiteCurrentProjectId
} from '../../../../store/slices/siteSlice';
import { 
  fetchAreasByProject,
  setCurrentProjectId as setAreaCurrentProjectId,
  createAreaForProject,
  updateAreaForProject,
  deleteAreaForProject
} from '../../../../store/slices/siteAreaSlice';
import { type ProjectResource } from '../../../../services/projectResourceService';
import { type ProjectRisk } from '../../../../services/projectRiskService';
import projectRiskService from '../../../../services/projectRiskService';
import { type ProjectMilestone } from '../../../../services/projectMilestoneService';
// import siteAreaService from '../../../../services/siteAreaService'; // Not used directly
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
  project_type: 'CONSTRUCTION' | 'MAINTENANCE' | 'RENOVATION' | 'INSPECTION' | 'SAFETY' | 'TRAINING';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  leader_id: string;
  project_location: string;
}

const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({ 
  visible,
  onClose, 
  onSuccess
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { areas } = useSelector((state: RootState) => state.siteArea);
  
  const [currentStep, setCurrentStep] = useState(0);
  // Track completion per step using stepCompletionStatus only; no separate parallel tracking needed
  const [loading, setLoading] = useState(false);
  
  // Trạng thái hoàn thành cho sơ đồ trực quan
  const [stepCompletionStatus, setStepCompletionStatus] = useState<{
    [step: number]: boolean
  }>({
    0: false, // Thông tin Dự án
    1: false, // Site & Khu vực
    2: false, // Rủi ro
    3: false, // Tài nguyên
    4: false, // Milestone
  });
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [basicInfoModalVisible, setBasicInfoModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [basicInfoForm] = Form.useForm();
  const [projectBasicInfo, setProjectBasicInfo] = useState<ProjectBasicInfo | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Data states
  // siteAreas now comes from Redux store
  const [projectResources, setProjectResources] = useState<ProjectResource[]>([]);
  const [projectRisks, setProjectRisks] = useState<ProjectRisk[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  // Temporary storage for areas when project doesn't exist yet
  const [tempAreas, setTempAreas] = useState<any[]>([]);
  // availableSites now comes from Redux store
  
  // Combine Redux areas with temporary areas for display
  const allAreas = useMemo(() => {
    return createdProjectId ? areas : [...areas, ...tempAreas];
  }, [createdProjectId, areas, tempAreas]);


  // Update step completion status when areas changes
  useEffect(() => {
    setStepCompletionStatus(prev => ({
      ...prev,
      1: allAreas.length > 0
    }));
  }, [allAreas.length]);

  // Update step completion status when projectRisks changes
  useEffect(() => {
    setStepCompletionStatus(prev => ({
      ...prev,
      2: projectRisks.length > 0
    }));
  }, [projectRisks.length]);


  // Update step completion status when projectResources changes
  useEffect(() => {
    setStepCompletionStatus(prev => ({
      ...prev,
      3: projectResources.length > 0
    }));
  }, [projectResources.length]);

  // Update step completion status when projectMilestones changes
  useEffect(() => {
    setStepCompletionStatus(prev => ({
      ...prev,
      4: projectMilestones.length > 0
    }));
  }, [projectMilestones.length]);


  const loadAvailableEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectService.getAvailableEmployees();
      if (response.success && response.data) {
        setAvailableEmployees(response.data);
        console.log('Available employees loaded:', response.data);
      } else {
        console.error('Failed to load available employees:', response.message);
        message.warning('Không thể tải danh sách nhân viên khả dụng');
      }
    } catch (error: any) {
      console.error('Error loading available employees:', error);
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAvailableSites = useCallback(async () => {
    // Allow loading sites even without createdProjectId for configuration
    try {
      // If we have a createdProjectId, load project-specific sites
      if (createdProjectId) {
        dispatch(setSiteCurrentProjectId(createdProjectId));
        await dispatch(fetchSitesByProject(createdProjectId)).unwrap();
      }
      // Otherwise, sites will be loaded when project is created
    } catch (error: any) {
      console.error('Error loading available sites:', error);
      message.error('Không thể tải danh sách địa điểm');
    }
  }, [createdProjectId, dispatch]);

  const loadSiteAreas = useCallback(async () => {
    // Allow loading areas even without createdProjectId for configuration
    try {
      setLoading(true);
      // If we have a createdProjectId, load project-specific areas
      if (createdProjectId) {
        console.log('Loading areas for project:', createdProjectId);
        dispatch(setAreaCurrentProjectId(createdProjectId));
        const result = await dispatch(fetchAreasByProject(createdProjectId)).unwrap();
        console.log('Areas loaded successfully:', result);
        
        // If no areas found, try to create default areas for the project's sites
        if (result.areas && result.areas.length === 0) {
          console.log('No areas found, checking if we need to create default areas...');
          await createDefaultAreasForProject();
        }
      }
      // Otherwise, areas will be loaded when project is created
    } catch (error: any) {
      console.error('Error loading site areas:', error);
      message.error('Không thể tải danh sách khu vực');
    } finally {
      setLoading(false);
    }
  }, [createdProjectId, dispatch]);

  const createDefaultAreasForProject = useCallback(async () => {
    try {
      console.log('Creating default areas for project...');
      // Get project's sites first
      const sites = store.getState().site.sites;
      const currentUser = store.getState().auth.user;
      console.log('Available sites:', sites);
      
      if (sites.length === 0) {
        console.log('No sites found for project');
        return;
      }

      // Create a default area for each site
      for (const site of sites) {
        try {
          const defaultAreaData = {
            site_id: site._id,
            area_code: `AREA_${site.site_name?.toUpperCase().replace(/\s+/g, '_') || 'DEFAULT'}_001`,
            area_name: `Khu vực chính - ${site.site_name || 'Site mặc định'}`,
            area_type: 'CONSTRUCTION' as const,
            description: `Khu vực làm việc chính của ${site.site_name || 'site'}`,
            area_size_sqm: 100,
            safety_level: 'MEDIUM' as const,
            supervisor_id: currentUser?.id || '',
            capacity: 10,
            special_requirements: ''
          };

          console.log('Creating default area:', defaultAreaData);
          await dispatch(createAreaForProject({ 
            projectId: createdProjectId!, 
            data: defaultAreaData 
          })).unwrap();
          console.log('Default area created successfully for site:', site.site_name);
        } catch (areaError) {
          console.warn(`Could not create default area for site ${site.site_name}:`, areaError);
        }
      }
      
      // Reload areas after creating defaults
      console.log('Reloading areas after creating defaults...');
      await dispatch(fetchAreasByProject(createdProjectId!)).unwrap();
    } catch (error) {
      console.error('Error creating default areas:', error);
    }
  }, [createdProjectId, dispatch]);

  const loadProjectRisks = useCallback(async () => {
    // Allow loading risks even without createdProjectId for configuration
    try {
      setLoading(true);
      // If we have a createdProjectId, load project-specific risks
      if (createdProjectId) {
        const risks = await projectRiskService.getProjectRisks(createdProjectId);
        setProjectRisks(risks.data || []);
      }
      // Otherwise, risks will be loaded when project is created
    } catch (error: any) {
      console.error('Error loading project risks:', error);
      message.error('Không thể tải danh sách rủi ro');
    } finally {
      setLoading(false);
    }
  }, [createdProjectId]);


  const loadProjectResources = useCallback(async () => {
    // Allow loading resources even without createdProjectId for configuration
    try {
      setLoading(true);
      // If we have a createdProjectId, load project-specific resources
      if (createdProjectId) {
        const { default: projectResourceService } = await import('../../../../services/projectResourceService');
        const resources = await projectResourceService.getProjectResources(createdProjectId);
        setProjectResources(resources);
      }
      // Otherwise, resources will be loaded when project is created
    } catch (error: any) {
      console.error('Error loading project resources:', error);
      message.error('Không thể tải danh sách tài nguyên');
    } finally {
      setLoading(false);
    }
  }, [createdProjectId]);

  const loadProjectMilestones = useCallback(async () => {
    // Allow loading milestones even without createdProjectId for configuration
    try {
      setLoading(true);
      // If we have a createdProjectId, load project-specific milestones
      if (createdProjectId) {
        const { default: projectMilestoneService } = await import('../../../../services/projectMilestoneService');
        const milestones = await projectMilestoneService.getProjectMilestones(createdProjectId);
        setProjectMilestones(milestones.data || []);
      }
      // Otherwise, milestones will be loaded when project is created
    } catch (error: any) {
      console.error('Error loading project milestones:', error);
      message.error('Không thể tải danh sách milestone');
    } finally {
      setLoading(false);
    }
  }, [createdProjectId]);

  // Load data when component mounts
  useEffect(() => {
    if (visible) {
      loadAvailableEmployees();
      loadAvailableSites();
    }
  }, [visible, loadAvailableEmployees, loadAvailableSites]);

  // Load site areas when createdProjectId changes or when on site & area step
  useEffect(() => {
    if (createdProjectId && currentStep === 1) {
      loadSiteAreas();
    }
  }, [createdProjectId, currentStep, loadSiteAreas]);

  // Load project risks when createdProjectId changes or when on risk step
  useEffect(() => {
    if (currentStep === 2) {
      if (createdProjectId) {
        loadProjectRisks();
      }
      // If no createdProjectId, keep existing projectRisks state (don't reset)
    }
  }, [createdProjectId, currentStep, loadProjectRisks]);


  // Load project resources when createdProjectId changes or when on resources step
  useEffect(() => {
    if (currentStep === 3) {
      if (createdProjectId) {
        loadProjectResources();
      }
      // If no createdProjectId, keep existing projectResources state (don't reset)
    }
  }, [createdProjectId, currentStep, loadProjectResources]);

  // Load project milestones when createdProjectId changes or when on milestones step
  useEffect(() => {
    if (currentStep === 4) {
      if (createdProjectId) {
        loadProjectMilestones();
      }
      // If no createdProjectId, keep existing projectMilestones state (don't reset)
    }
  }, [createdProjectId, currentStep, loadProjectMilestones]);

  const steps = useMemo(() => [
    {
      title: 'Thông tin Dự án',
      description: 'Tạo dự án mới',
      icon: <ProjectOutlined />,
      type: 'sequential',
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
        { name: 'leader_id', label: 'Trưởng dự án', type: 'select', required: true, options: [] },
        { name: 'project_location', label: 'Địa điểm dự án', type: 'input', required: true }
      ]
    },
    {
      title: 'Site & Khu vực',
      description: 'Quản lý Site và Khu vực',
      icon: <EnvironmentOutlined />,
      type: 'parallel',
      group: 'parallel1',
      data: allAreas,
      dataKey: 'siteAreas',
      fields: [
        { name: 'area_name', label: 'Tên khu vực', type: 'input', required: true },
        { name: 'area_type', label: 'Loại khu vực', type: 'select', required: true, options: [
          { value: 'CONSTRUCTION', label: 'Thi công' },
          { value: 'STORAGE', label: 'Kho bãi' },
          { value: 'OFFICE', label: 'Văn phòng' },
          { value: 'SAFETY', label: 'An toàn' },
          { value: 'EQUIPMENT', label: 'Thiết bị' },
          { value: 'PARKING', label: 'Bãi đỗ xe' }
        ]},
        { name: 'area_size_sqm', label: 'Diện tích (m²)', type: 'number', required: true, min: 0 },
        { name: 'safety_level', label: 'Mức độ an toàn', type: 'select', required: true, options: [
          { value: 'LOW', label: 'Thấp' },
          { value: 'MEDIUM', label: 'Trung bình' },
          { value: 'HIGH', label: 'Cao' },
          { value: 'CRITICAL', label: 'Nghiêm trọng' }
        ]},
        { name: 'description', label: 'Mô tả', type: 'textarea', required: false },
        { name: 'capacity', label: 'Sức chứa (người)', type: 'number', required: false, min: 1 },
        { name: 'supervisor_id', label: 'Giám sát viên', type: 'select', required: true, options: [] }
      ]
    },
    {
      title: 'Rủi ro',
      description: 'Đánh giá Rủi ro',
      icon: <SafetyOutlined />,
      type: 'parallel',
      group: 'parallel1',
      data: projectRisks,
      dataKey: 'projectRisks',
      fields: [
        { name: 'risk_name', label: 'Tên Rủi ro', type: 'input', required: true },
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
      title: 'Tài nguyên',
      description: 'Phân bổ Tài nguyên',
      icon: <BoxPlotOutlined />,
      type: 'parallel',
      group: 'parallel2',
      data: projectResources,
      dataKey: 'projectResources',
      fields: [
        { name: 'resource_name', label: 'Tên Tài nguyên', type: 'input', required: true },
        { name: 'resource_type', label: 'Loại tài nguyên', type: 'select', required: true, options: [
          { value: 'MATERIAL', label: 'Vật liệu' },
          { value: 'EQUIPMENT', label: 'Thiết bị' },
          { value: 'TOOL', label: 'Công cụ' },
          { value: 'VEHICLE', label: 'Phương tiện' },
          { value: 'PERSONNEL', label: 'Nhân sự' },
          { value: 'SUBCONTRACTOR', label: 'Nhà thầu phụ' }
        ]},
        { name: 'quantity', label: 'Số lượng', type: 'number', required: true },
        { name: 'unit', label: 'Đơn vị', type: 'input', required: true },
        { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: [
          { value: 'PLANNED', label: 'Đã lên kế hoạch' },
          { value: 'ORDERED', label: 'Đã đặt hàng' },
          { value: 'DELIVERED', label: 'Đã giao hàng' },
          { value: 'IN_USE', label: 'Đang sử dụng' },
          { value: 'CONSUMED', label: 'Đã sử dụng hết' },
          { value: 'RETURNED', label: 'Đã trả lại' }
        ]}
      ]
    },
    {
      title: 'Milestone',
      description: 'Quản lý Milestone',
      icon: <CheckCircleOutlined />,
      type: 'parallel',
      group: 'parallel2',
      data: projectMilestones,
      dataKey: 'projectMilestones',
      fields: [
        { name: 'milestone_name', label: 'Tên Milestone', type: 'input', required: true },
        { name: 'description', label: 'Mô tả', type: 'textarea', required: false },
        { name: 'planned_date', label: 'Ngày dự kiến', type: 'date', required: true },
        { name: 'milestone_type', label: 'Loại milestone', type: 'select', required: true, options: [
          { value: 'PHASE_COMPLETION', label: 'Hoàn thành giai đoạn' },
          { value: 'DELIVERY', label: 'Giao hàng' },
          { value: 'APPROVAL', label: 'Phê duyệt' },
          { value: 'REVIEW', label: 'Đánh giá' },
          { value: 'CHECKPOINT', label: 'Điểm kiểm tra' }
        ]},
        { name: 'completion_criteria', label: 'Tiêu chí hoàn thành', type: 'textarea', required: true },
        { name: 'responsible_user_id', label: 'Người phụ trách', type: 'select', required: true, options: availableEmployees.map(emp => ({ value: emp._id || emp.id, label: emp.full_name || emp.name || emp.fullName })) },
        { name: 'is_critical', label: 'Milestone quan trọng', type: 'checkbox', required: false }
      ]
    }
  ], [allAreas, projectRisks, projectResources, projectMilestones, availableEmployees]);

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
          case 1: // Site & Areas
            // Site areas are loaded via separate useEffect
            break;
          case 2: // Project Risks
            // Don't reset projectRisks - let the separate useEffect handle loading
            break;
          case 3: // Project Resources
            // Don't reset projectResources - let the separate useEffect handle loading
            break;
          case 4: // Project Milestones
            // Don't reset projectMilestones - let the separate useEffect handle loading
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

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);


  const handleNext = useCallback(async () => {
    setLoading(true);
    try {
      // Với bước 0: yêu cầu đã lưu thông tin qua modal
      if (!projectBasicInfo) {
        message.error('Vui lòng bấm "Nhập thông tin dự án" để lưu trước khi tiếp tục');
        setBasicInfoModalVisible(true);
        setLoading(false);
        return;
      }

      // Nếu có khu vực, sử dụng site_id từ khu vực đầu tiên
      // Nếu chưa có khu vực, tạo dự án với project_location
      let siteId = null;
      if (allAreas && allAreas.length > 0) {
        const mainSite = allAreas[0];
        if (mainSite && mainSite._id) {
          siteId = mainSite._id;
        }
      }

      const projectData: any = {
        project_name: projectBasicInfo.project_name,
        description: projectBasicInfo.description,
        start_date: projectBasicInfo.start_date,
        end_date: projectBasicInfo.end_date,
        project_type: projectBasicInfo.project_type,
        priority: projectBasicInfo.priority,
        leader_id: projectBasicInfo.leader_id,
        project_location: projectBasicInfo.project_location
      };

      // Chỉ thêm site_id nếu có giá trị
      if (siteId) {
        projectData.site_id = siteId;
      }
      
      // Chỉ chuyển sang bước tiếp theo, không tạo dự án ngay
      setCurrentStep(1);
    } catch (err) {
      console.error('Error in handleNext:', err);
      message.error(`Lỗi khi chuyển bước: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [projectBasicInfo, allAreas]);

  const handleComplete = useCallback(async () => {
    setLoading(true);
    try {
      // Tạo dự án với tất cả thông tin đã thu thập
      if (!projectBasicInfo) {
        message.error('Vui lòng nhập thông tin dự án trước khi hoàn thành');
        return;
      }

      // Import project service
      const { default: projectService } = await import('../../../../services/projectService');
      
      // Tạo project trước (không cần site_id)
      const projectData: any = {
        project_name: projectBasicInfo.project_name,
        description: projectBasicInfo.description || '',
        start_date: projectBasicInfo.start_date,
        end_date: projectBasicInfo.end_date,
        project_type: projectBasicInfo.project_type,
        priority: projectBasicInfo.priority,
        leader_id: projectBasicInfo.leader_id,
        project_location: projectBasicInfo.project_location || ''
        // Không có site_id ở đây
      };
      
      // Create project
      const response = await projectService.createProject(projectData);
      
      if (response.success && response.data) {
        // Store the created project ID
        const projectId = response.data.id;
        setCreatedProjectId(projectId);
        console.log(`Created project ${projectId}`);
        
        // Tạo site mặc định sau khi có project_id
        let defaultSiteId: string | null = null;
        
        try {
          const siteData = {
            project_id: projectId, // ✅ Bây giờ có project_id
            site_name: `Site chính - ${projectBasicInfo.project_name}`,
            address: projectBasicInfo.project_location || 'Địa chỉ chưa xác định',
            description: `Site chính cho dự án ${projectBasicInfo.project_name}`,
            contact_person: '',
            contact_phone: '',
            contact_email: ''
          };
          
          const siteResponse = await projectService.createSite(siteData);
          if (siteResponse.success && siteResponse.data) {
            defaultSiteId = siteResponse.data.id;
            console.log(`Created default site ${defaultSiteId} for project ${projectId}`);
            
            // Cập nhật project với site_id
            try {
              await projectService.updateProject(projectId, { site_id: defaultSiteId });
              console.log(`Updated project ${projectId} with site_id ${defaultSiteId}`);
            } catch (updateError) {
              console.error('Error updating project with site_id:', updateError);
            }
          } else {
            console.error('Failed to create default site:', siteResponse.message);
            message.warning('Dự án đã được tạo nhưng không thể tạo site mặc định');
          }
        } catch (siteError) {
          console.error('Error creating default site:', siteError);
          message.warning('Dự án đã được tạo nhưng có lỗi khi tạo site mặc định');
        }
        
        // Create areas with the default site ID
        if (tempAreas.length > 0 && defaultSiteId) {
          try {
            console.log(`Creating ${tempAreas.length} areas for project ${projectId} with site ${defaultSiteId}`);
            
            for (const tempArea of tempAreas) {
              try {
                await dispatch(createAreaForProject({
                  projectId: projectId,
                  data: {
                    site_id: defaultSiteId, // ✅ Sử dụng site_id đã tạo
                    area_code: tempArea.area_code,
                    area_name: tempArea.area_name,
                    area_type: tempArea.area_type,
                    description: tempArea.description || '',
                    area_size_sqm: tempArea.area_size_sqm || 0,
                    safety_level: tempArea.safety_level || 'MEDIUM',
                    supervisor_id: tempArea.supervisor_id,
                    capacity: tempArea.capacity || 1,
                    special_requirements: tempArea.special_requirements || ''
                  }
                })).unwrap();
                console.log(`Created area: ${tempArea.area_name}`);
              } catch (areaError) {
                console.error('Error creating area:', areaError);
              }
            }
            
            // Clear temporary areas after successful creation
            const tempAreasCount = tempAreas.length;
            setTempAreas([]);
            message.success(`Đã tạo ${tempAreasCount} khu vực cho dự án`);
          } catch (error) {
            console.error('Error creating areas:', error);
            message.warning('Dự án đã được tạo nhưng có lỗi khi tạo một số khu vực');
          }
        }
        
        // Create temporary risks, work locations, resources, and milestones if any exist
        try {
          // Create temporary risks
          if (projectRisks.length > 0) {
            const { default: projectRiskService } = await import('../../../../services/projectRiskService');
            for (const risk of projectRisks) {
              if (risk._id && risk._id.startsWith('temp_')) {
                const riskData = {
                  project_id: projectId,
                  risk_name: risk.risk_name,
                  description: risk.description || '',
                  risk_category: risk.risk_category || 'TECHNICAL',
                  probability: risk.probability || 0.5,
                  impact_score: risk.impact_score || 2,
                  mitigation_plan: risk.mitigation_plan || '',
                  owner_id: risk.owner_id || availableEmployees[0]?._id || availableEmployees[0]?.id || null,
                  target_resolution_date: risk.target_resolution_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  schedule_impact_days: risk.schedule_impact_days || 0
                };
                await projectRiskService.createRisk(riskData);
              }
            }
          }


          // Create temporary resources
          if (projectResources.length > 0) {
            const { default: projectResourceService } = await import('../../../../services/projectResourceService');
            for (const resource of projectResources) {
              if (resource._id && resource._id.startsWith('temp_')) {
                const { _id, project_id, ...resourceWithoutId } = resource;
                const resourceData = {
                  project_id: projectId,
                  ...resourceWithoutId
                };
                await projectResourceService.createResource(resourceData);
              }
            }
          }

          // Create temporary milestones
          if (projectMilestones.length > 0) {
            const { default: projectMilestoneService } = await import('../../../../services/projectMilestoneService');
            for (const milestone of projectMilestones) {
              if (milestone.id && milestone.id.startsWith('temp_')) {
                const milestoneData = {
                  project_id: projectId,
                  phase_id: 'default',
                  milestone_name: milestone.milestone_name,
                  description: milestone.description || '',
                  planned_date: milestone.planned_date,
                  milestone_type: milestone.milestone_type || 'CHECKPOINT',
                  completion_criteria: milestone.completion_criteria || '',
                  responsible_user_id: typeof milestone.responsible_user_id === 'string' ? milestone.responsible_user_id : availableEmployees[0]?.id || null,
                  is_critical: milestone.is_critical || false
                };
                await projectMilestoneService.createMilestone(milestoneData);
              }
            }
          }
        } catch (error) {
          console.error('Error creating temporary items:', error);
          message.warning('Dự án đã được tạo nhưng có lỗi khi tạo một số mục phụ');
        }
        
        // Cập nhật trạng thái hoàn thành cho tất cả các bước
        setStepCompletionStatus(prev => ({
          ...prev,
          0: true,
          1: true,
          2: true,
          3: true,
          4: true,
          5: true
        }));
        
        message.success('Dự án đã được tạo thành công với tất cả thông tin chi tiết!');
        onSuccess();
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error completing project setup:', err);
      message.error(`Lỗi khi hoàn thành cấu hình: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [projectBasicInfo, allAreas, tempAreas, onSuccess, dispatch]);

  const handleAddItem = useCallback(() => {
    // console.log('Adding new item for step:', currentStep); // Removed to prevent spam
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleEditItem = useCallback((item: any) => {
    setEditingItem(item);
    
    // Map API data to form fields based on current step
    let formValues = { ...item };
    
    // No special mapping needed for the new step order
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  }, [form]);

  const handleDeleteItem = useCallback(async (item: any) => {
    try {
      setLoading(true);
      // Delete logic based on current step
      switch (currentStep) {
        case 0:
          // console.log('Cannot delete project basic info'); // Removed to prevent spam
          message.warning('Không thể xóa thông tin cơ bản dự án');
          break;
        case 1: // Site & Areas
          // console.log('Deleting site area:', item._id); // Removed to prevent spam
          try {
            await dispatch(deleteAreaForProject(item._id)).unwrap();
            message.success('Xóa khu vực thành công');
          } catch (error: any) {
            console.error('Error deleting site area:', error);
            message.error('Không thể xóa khu vực');
          }
          break;
        case 2: // Project Risks
          // console.log('Deleting project risk:', item._id); // Removed to prevent spam
          setProjectRisks(prev => prev.filter(r => r._id !== item._id));
          break;
        case 3: // Project Resources
          // console.log('Deleting project resource:', item._id); // Removed to prevent spam
          setProjectResources(prev => prev.filter(r => r._id !== item._id));
          break;
        case 4: // Project Milestones
          // console.log('Deleting project milestone:', item._id); // Removed to prevent spam
          setProjectMilestones(prev => prev.filter(m => m.id !== item.id));
          break;
      }
      message.success('Xóa thành công!');
    } catch (err) {
      message.error('Lỗi khi xóa!');
    } finally {
      setLoading(false);
    }
  }, [currentStep, dispatch]);

  const handleModalSubmit = useCallback(async (values: any) => {
    // Form submit completed
    // console.log('Form submitted with values:', values);
    // console.log('Current step:', currentStep);
    // console.log('Current step data:', currentStepData);
    // console.log('Form values keys:', Object.keys(values));
    // console.log('Form values values:', Object.values(values));
    
    try {
      setLoading(true);
      
      if (editingItem) {
        // Update existing item
        switch (currentStep) {
          case 0:
            // console.log('Updating project basic info:', values); // Removed to prevent spam
            setProjectBasicInfo(values);
            message.success('Cập nhật thông tin dự án thành công');
            break;
          case 1: // Site & Areas
            // console.log('Updating site area:', editingItem._id, values); // Removed to prevent spam
            try {
              await dispatch(updateAreaForProject({
                id: editingItem._id,
                data: values
              })).unwrap();
              message.success('Cập nhật khu vực thành công');
            } catch (error: any) {
              console.error('Error updating site area:', error);
              message.error('Không thể cập nhật khu vực');
            }
            break;
          case 2: // Project Risks
            // console.log('Updating project risk:', editingItem._id, values); // Removed to prevent spam
            setProjectRisks(prev => prev.map(r => r._id === editingItem._id ? { ...r, ...values } : r));
            break;
          case 3: // Project Resources
            // console.log('Updating project resource:', editingItem._id, values); // Removed to prevent spam
            setProjectResources(prev => prev.map(r => r._id === editingItem._id ? { ...r, ...values } : r));
            break;
          case 4: // Project Milestones
            // console.log('Updating project milestone:', editingItem._id, values); // Removed to prevent spam
            setProjectMilestones(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...values } : m));
            break;
        }
      } else {
        // Create new item
        switch (currentStep) {
          case 0:
            // console.log('Saving project basic info:', values); // Removed to prevent spam
            setProjectBasicInfo(values);
            message.success('Lưu thông tin dự án thành công!');
            break;
          case 1: // Site & Areas
            // console.log('Creating site area:', values); // Removed to prevent spam
            // console.log('Created project ID:', createdProjectId); // Removed to prevent spam
            // Check if project exists - allow configuration but show info message
            if (!createdProjectId) {
              message.info('Thông tin khu vực sẽ được lưu khi hoàn thành tạo dự án');
              // Store temporarily in local state for display
              const tempArea = { ...values, _id: `temp_${Date.now()}` };
              setTempAreas(prev => [...prev, tempArea]);
              message.success('Thông tin khu vực đã được lưu tạm thời');
              setModalVisible(false);
              return;
            }
            try {
              await dispatch(createAreaForProject({
                projectId: createdProjectId,
                data: {
                  ...values
                }
              })).unwrap();
              message.success('Tạo khu vực thành công');
              setModalVisible(false);
            } catch (error: any) {
              console.error('Error creating site area:', error);
              message.error('Không thể tạo khu vực');
            }
            break;
          case 2: // Project Risks
            // console.log('Creating project risk:', values); // Removed to prevent spam
            // Check if project exists - allow configuration but show info message
            if (!createdProjectId) {
              message.info('Thông tin rủi ro sẽ được lưu khi hoàn thành tạo dự án');
              // Store temporarily for later creation
              setProjectRisks(prev => [...prev, { ...values, _id: `temp_${Date.now()}` }]);
              message.success('Thông tin rủi ro đã được lưu tạm thời');
              setModalVisible(false);
              return;
            }
            
            try {
              // Check if we have available employees
              if (!availableEmployees || availableEmployees.length === 0) {
                message.error('Không có nhân viên khả dụng để gán làm chủ sở hữu rủi ro!');
                return;
              }

              // Transform form values to match risk API
              const riskData = {
                project_id: createdProjectId,
                risk_name: values.risk_name || values.riskName, // Support both field names
                description: values.description || '',
                risk_category: values.risk_category || 'TECHNICAL',
                probability: typeof values.probability === 'number' ? values.probability / 100 : 0.5, // Convert percentage to decimal
                impact_score: values.impact_score || (values.impact === 'LOW' ? 1 : values.impact === 'MEDIUM' ? 2 : values.impact === 'HIGH' ? 3 : 4),
                mitigation_plan: values.mitigation_plan || values.mitigation || 'Chưa có biện pháp giảm thiểu cụ thể',
                owner_id: values.owner_id || availableEmployees[0]?._id || availableEmployees[0]?.id || null,
                target_resolution_date: values.target_resolution_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                schedule_impact_days: values.schedule_impact_days || 0
              };
              
              // console.log('Final risk data being sent:', riskData); // Removed to prevent spam
              // console.log('Available employees:', availableEmployees); // Removed to prevent spam
              
              await projectRiskService.createRisk(riskData);
              // Reload all risks to ensure consistency
              await loadProjectRisks();
              message.success('Đã tạo rủi ro thành công!');
              setModalVisible(false);
            } catch (error: any) {
              console.error('Error creating risk:', error);
              message.error('Không thể tạo rủi ro: ' + (error.response?.data?.message || error.message));
              return;
            }
            break;
          case 3: // Project Resources
            // console.log('Creating project resource:', values); // Removed to prevent spam
            // Check if project exists - allow configuration but show info message
            if (!createdProjectId) {
              message.info('Thông tin tài nguyên sẽ được lưu khi hoàn thành tạo dự án');
              // Store temporarily for later creation
              setProjectResources(prev => [...prev, { ...values, _id: `temp_${Date.now()}` }]);
              message.success('Thông tin tài nguyên đã được lưu tạm thời');
              setModalVisible(false);
              return;
            }
            try {
              const { default: projectResourceService } = await import('../../../../services/projectResourceService');
              const resourceData = {
                project_id: createdProjectId,
                ...values
              };
              const newResource = await projectResourceService.createResource(resourceData);
              setProjectResources(prev => [...prev, newResource]);
              // Reload project resources to ensure consistency
              await loadProjectResources();
              message.success('Tạo tài nguyên thành công');
              setModalVisible(false);
            } catch (error: any) {
              console.error('Error creating project resource:', error);
              message.error('Không thể tạo tài nguyên');
            }
            break;
          case 4: // Project Milestones
            // console.log('Creating project milestone:', values); // Removed to prevent spam
            // Check if project exists - allow configuration but show info message
            if (!createdProjectId) {
              message.info('Thông tin milestone sẽ được lưu khi hoàn thành tạo dự án');
              // Store temporarily for later creation
              setProjectMilestones(prev => [...prev, { ...values, _id: `temp_${Date.now()}` }]);
              message.success('Thông tin milestone đã được lưu tạm thời');
              setModalVisible(false);
              return;
            }
            try {
              const { default: projectMilestoneService } = await import('../../../../services/projectMilestoneService');
              
              // Transform form values to match milestone API
              const milestoneData = {
                project_id: createdProjectId,
                phase_id: values.phase_id || 'default', // Provide default phase_id
                milestone_name: values.milestone_name,
                description: values.description || '',
                planned_date: values.planned_date,
                milestone_type: values.milestone_type || 'CHECKPOINT',
                completion_criteria: values.completion_criteria || '',
                responsible_user_id: values.responsible_user_id || availableEmployees[0]?._id || availableEmployees[0]?.id || null,
                is_critical: values.is_critical || false
              };
              
              const newMilestone = await projectMilestoneService.createMilestone(milestoneData);
              if (newMilestone.data && typeof newMilestone.data === 'object' && 'id' in newMilestone.data && newMilestone.data !== null) {
                setProjectMilestones(prev => [...prev, newMilestone.data as ProjectMilestone]);
              }
              // Reload project milestones to ensure consistency
              await loadProjectMilestones();
              message.success('Tạo milestone thành công');
              setModalVisible(false);
            } catch (error: any) {
              console.error('Error creating project milestone:', error);
              message.error('Không thể tạo milestone: ' + (error.response?.data?.message || error.message));
            }
            break;
        }
      }
      
      setModalVisible(false);
      form.resetFields();
      
      // Cập nhật trạng thái hoàn thành cho bước hiện tại
      setStepCompletionStatus(prev => ({
        ...prev,
        [currentStep]: true
      }));
      
      // Cập nhật trạng thái hoàn thành cho bước song song
      // Parallel group completion is implied by stepCompletionStatus and navigation logic
      
    } catch (err) {
      message.error('Lỗi khi lưu dữ liệu!');
    } finally {
      setLoading(false);
    }
  }, [currentStep, editingItem, createdProjectId, availableEmployees, form, dispatch, loadProjectRisks, loadProjectResources, loadProjectMilestones]);

  const renderFormField = useCallback((field: any) => {
    // console.log('Rendering field:', field); // Removed to prevent spam
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
        let options = [];
        
        // Special handling for different field types
        if (field.name === 'leader_id' || field.name === 'supervisor_id' || field.name === 'responsible_user_id') {
          options = availableEmployees.map((emp: any) => ({
            value: emp._id || emp.id,
            label: `${emp.full_name || emp.name || emp.fullName} (${emp.email || emp.email_address || 'N/A'})`
          }));
        } else if (field.options === 'siteAreas') {
          // Load site areas for area_id field
          options = areas.map((area: any) => ({
            value: area._id || area.id,
            label: `${area.area_name} (${area.area_code})`
          }));
        } else {
          options = field.options || [];
        }
        
        inputComponent = (
          <Select 
            {...inputProps}
            placeholder={field.name === 'responsible_user_id' ? 'Chọn người phụ trách' : `Chọn ${field.label.toLowerCase()}`}
            notFoundContent={options.length === 0 ? 'Không có dữ liệu' : 'Không tìm thấy'}
            loading={loading}
          >
            {options.filter((option: any) => option.value !== null && option.value !== undefined).map((option: any) => (
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
  }, [availableEmployees, areas]);

  const currentStepData = useMemo(() => steps[currentStep], [steps, currentStep]);

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

        {/* Visual Flowchart (no Tailwind required) */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>Luồng Tạo Dự Án</Title>
          <div style={{ background: '#f8fafc', padding: 24, borderRadius: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 24, justifyContent: 'center' }}>
              {/* Helper styles */}
              {(() => {
                const boxBase: React.CSSProperties = {
                  width: 192,
                  height: 64,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff'
                };
                const smallBoxBase: React.CSSProperties = { ...boxBase, width: 160 };
                const vStack: React.CSSProperties = { display: 'flex', flexDirection: 'column', rowGap: 16, alignItems: 'center' };
                const hLine: React.CSSProperties = { height: 2, width: 32, background: '#d1d5db' };

                const getStyles = (active: boolean, done: boolean): React.CSSProperties => ({
                  ...boxBase,
                  borderColor: done ? '#52c41a' : active ? '#1677ff' : '#d1d5db',
                  background: done ? '#f6ffed' : active ? '#e6f4ff' : '#fff'
                });
                const getSmallStyles = (active: boolean, done: boolean): React.CSSProperties => ({
                  ...smallBoxBase,
                  borderColor: done ? '#52c41a' : active ? '#1677ff' : '#d1d5db',
                  background: done ? '#f6ffed' : active ? '#e6f4ff' : '#fff'
                });

                return (
                  <>
                    {/* Column 1: Step 0 */}
                    <div style={getStyles(currentStep === 0, !!stepCompletionStatus[0])}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {stepCompletionStatus[0] ? (
                          <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        ) : (
                          <ProjectOutlined style={{ color: '#6b7280', marginRight: 8 }} />
                        )}
                        <Text strong style={{ color: stepCompletionStatus[0] ? '#237804' : undefined }}>Thông tin Dự án</Text>
                      </div>
                    </div>

                    {/* Connector to Column 2 */}
                    <div style={hLine} />

                    {/* Column 2: Parallel 1 (stacked) */}
                    <div style={vStack}>
                      <div style={getSmallStyles(currentStep === 1, !!stepCompletionStatus[1])}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {stepCompletionStatus[1] ? (
                            <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          ) : (
                            <EnvironmentOutlined style={{ color: '#6b7280', marginRight: 8 }} />
                          )}
                          <Text strong style={{ color: stepCompletionStatus[1] ? '#237804' : undefined }}>Site & Khu vực</Text>
                        </div>
                      </div>

                      <div style={getSmallStyles(currentStep === 2, !!stepCompletionStatus[2])}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {stepCompletionStatus[2] ? (
                            <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          ) : (
                            <SafetyOutlined style={{ color: '#6b7280', marginRight: 8 }} />
                          )}
                          <Text strong style={{ color: stepCompletionStatus[2] ? '#237804' : undefined }}>Rủi ro</Text>
                        </div>
                      </div>
                    </div>

                    {/* Connector to Column 3 */}
                    <div style={hLine} />

                    {/* Column 3: Parallel 2 (stacked) */}
                    <div style={vStack}>
                      <div style={getSmallStyles(currentStep === 3, !!stepCompletionStatus[3])}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {stepCompletionStatus[3] ? (
                            <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          ) : (
                            <BoxPlotOutlined style={{ color: '#6b7280', marginRight: 8 }} />
                          )}
                          <Text strong style={{ color: stepCompletionStatus[3] ? '#237804' : undefined }}>Tài nguyên</Text>
                        </div>
                      </div>

                      <div style={getSmallStyles(currentStep === 4, !!stepCompletionStatus[4])}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {stepCompletionStatus[4] ? (
                            <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          ) : (
                            <CheckCircleOutlined style={{ color: '#6b7280', marginRight: 8 }} />
                          )}
                          <Text strong style={{ color: stepCompletionStatus[4] ? '#237804' : undefined }}>Milestone</Text>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Warning for steps that require project creation - REMOVED: Allow navigation through all steps */}

        {/* Project Basic Info Summary is now rendered inside step 0 content */}

        {/* Progress Steps */}
        <Card className="mb-6 shadow-lg">
          
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
                  {currentStep !== 0 && (
                    <>
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
                    </>
                  )}
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
                  {currentStep === 0 ? (
                    <>
                      <Space style={{ marginBottom: 16 }}>
                        <Button type="primary" onClick={() => {
                          basicInfoForm.setFieldsValue(projectBasicInfo || {});
                          setBasicInfoModalVisible(true);
                        }}>
                          {projectBasicInfo ? 'Chỉnh sửa thông tin dự án' : 'Nhập thông tin dự án'}
                        </Button>
                      </Space>
                      {projectBasicInfo ? (
                        <>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Card size="small" title="Thông tin tổng quan">
                                <div><strong>Tên dự án:</strong> {projectBasicInfo.project_name}</div>
                                <div><strong>Mô tả:</strong> {projectBasicInfo.description}</div>
                                <div><strong>Loại dự án:</strong> {projectBasicInfo.project_type}</div>
                                <div><strong>Mức ưu tiên:</strong> {projectBasicInfo.priority}</div>
                              </Card>
                            </Col>
                            <Col span={12}>
                              <Card size="small" title="Thời gian & Liên quan">
                                <div><strong>Ngày bắt đầu:</strong> {projectBasicInfo.start_date as any}</div>
                                <div><strong>Ngày kết thúc:</strong> {projectBasicInfo.end_date as any}</div>
                                <div><strong>Trưởng dự án:</strong> {projectBasicInfo.leader_id}</div>
                                <div><strong>Địa điểm dự án:</strong> {projectBasicInfo.project_location}</div>
                              </Card>
                            </Col>
                          </Row>
                          
                          {/* Thông báo hướng dẫn */}
                          {(!allAreas || allAreas.length === 0) && (
                            <Alert
                              message="Chưa có khu vực nào"
                              description="Bạn có thể tạo dự án ngay bây giờ hoặc chuyển sang bước 'Site & Khu vực' để tạo khu vực trước."
                              type="info"
                              showIcon
                              className="mt-4"
                            />
                          )}
                        </>
                      ) : (
                        <Alert type="info" message='Chưa có thông tin. Bấm "Nhập thông tin dự án" để thêm.' showIcon />
                      )}
                    </>
                  ) : currentStepData.data.length === 0 ? (
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
                      rowKey={(record: any) => record._id || record.id || `temp_${record.temp_id || Date.now()}`}
                      pagination={{ pageSize: 10 }}
                      columns={[
                        {
                          title: 'Tên',
                          dataIndex: currentStepData.dataKey === 'siteAreas' ? 'area_name' : 
                                     currentStepData.dataKey === 'projectResources' ? 'resource_name' :
                                     currentStepData.dataKey === 'projectRisks' ? 'risk_name' :
                                     currentStepData.dataKey === 'projectMilestones' ? 'milestone_name' :
                                     'location_name',
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
              {/* Parallel Step Navigation */}
              {currentStepData.type === 'parallel' && currentStepData.group && (
                <Space>
                  {steps
                    .filter(step => step.group === currentStepData.group)
                    .map((step) => {
                      const stepIndex = steps.indexOf(step);
                      return (
                        <Button
                          key={stepIndex}
                          type={currentStep === stepIndex ? 'primary' : 'default'}
                          onClick={() => setCurrentStep(stepIndex)}
                          size="large"
                          icon={step.icon}
                        >
                          {step.title}
                        </Button>
                      );
                    })}
                </Space>
              )}
              
              <Button onClick={onClose} size="large">
                Hủy
              </Button>
              {currentStep === 0 ? (
                <Button 
                  type="primary" 
                  onClick={handleNext}
                  loading={loading}
                  size="large"
                  disabled={!projectBasicInfo}
                >
                  Tiếp theo
                </Button>
              ) : currentStep === steps.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={handleComplete}
                  loading={loading}
                  size="large"
                  icon={<CheckOutlined />}
                >
                  Tạo dự án
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
        {/* Basic Info Modal for Step 0 */}
        <Modal
          title={projectBasicInfo ? 'Chỉnh sửa thông tin dự án' : 'Nhập thông tin dự án'}
          open={basicInfoModalVisible}
          onCancel={() => setBasicInfoModalVisible(false)}
          footer={null}
          width={900}
          destroyOnClose
        >
          <Form
            form={basicInfoForm}
            layout="vertical"
            initialValues={projectBasicInfo || {}}
            onFinish={async (values) => {
              try {
                // Chuẩn hóa ngày về chuỗi nếu là moment
                const normalize = (val: any) => (val && val.format ? val.format('YYYY-MM-DD') : val);
                const saved = {
                  ...values,
                  start_date: normalize(values.start_date),
                  end_date: normalize(values.end_date)
                } as ProjectBasicInfo;
                setProjectBasicInfo(saved);
                setStepCompletionStatus(prev => ({ ...prev, 0: true }));
                message.success('Đã lưu thông tin dự án');
                setBasicInfoModalVisible(false);
              } catch (e) {
                message.error('Không thể lưu thông tin');
              }
            }}
          >
            <Row gutter={16}>
              {steps[0].fields.map((field: any) => (
                <Col span={field.type === 'textarea' ? 24 : 12} key={field.name}>
                  {renderFormField(field)}
                </Col>
              ))}
            </Row>
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button onClick={() => setBasicInfoModalVisible(false)}>Hủy</Button>
              <Button type="primary" onClick={() => basicInfoForm.submit()}>Lưu thông tin</Button>
            </div>
          </Form>
        </Modal>

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
              // console.log('=== FORM onFinish CALLED ==='); // Removed to prevent spam
              // console.log('Form onFinish called with values:', values); // Removed to prevent spam
              handleModalSubmit(values);
            }}
            onFinishFailed={() => {
              // Form validation failed - handled in submit button onClick
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
                  try {
                    const values = await form.validateFields();
                    await handleModalSubmit(values);
                  } catch (error: any) {
                    console.error('Form validation failed:', error.errorFields);
                    if (error.errorFields && error.errorFields.length > 0) {
                      const firstError = error.errorFields[0];
                      message.error(`Vui lòng kiểm tra lại: ${firstError.errors[0]}`);
                    } else {
                      message.error('Vui lòng kiểm tra lại thông tin đã nhập');
                    }
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