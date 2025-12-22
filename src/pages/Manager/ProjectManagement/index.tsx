import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ManagerLayout } from '../../../components/Manager';
import { ProjectOutlined } from '@ant-design/icons';
import {
  Card,
  Tabs,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Empty,
  Tag,
  Button,
  Space,
  Table,
  Progress,
  Badge,
  Alert,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Upload,
  Image
} from 'antd';
import {
  ProjectOutlined as ProjectIcon,
  CheckCircleOutlined,
  FlagOutlined,
  ReloadOutlined,
  EyeOutlined,
  WarningOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  UserOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { RootState } from '../../../store';
import projectService from '../../../services/projectService';
import { projectTaskService } from '../../../services/projectTaskService';
import { projectRiskService } from '../../../services/projectRiskService';
import { projectMilestoneService } from '../../../services/projectMilestoneService';
import { clearProjectRiskCache, clearProjectTaskCache, clearProjectMilestoneCache } from '../../../utils/apiCache';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Project {
  id?: string;
  _id?: string;
  project_name: string;
  status: string;
  priority: string;
  progress: number;
  start_date: string;
  end_date: string;
  leader_id?: any;
}

interface Task {
  id?: string;
  _id: string;
  task_name: string;
  project_id: any;
  status: string;
  priority: string;
  due_date?: string;
  planned_end_date?: string;
  progress?: number;
  progress_percentage?: number;
  responsible_user_id?: any;
  assigned_to?: any;
  task_code?: string;
}

interface Risk {
  id?: string;
  _id: string;
  risk_name: string;
  project_id: any;
  status: string;
  risk_score: number;
  owner_id?: any;
  target_resolution_date: string;
  progress?: number;
}

interface Milestone {
  id: string;
  milestone_name: string;
  project_id: any;
  status: string;
  planned_date: string;
  responsible_user_id?: any;
  progress?: number;
}

const ManagerProjectManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [taskReportModalOpen, setTaskReportModalOpen] = useState(false);
  const [taskReportLoading, setTaskReportLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskReportForm] = Form.useForm();
  const [taskImages, setTaskImages] = useState<File[]>([]);
  const [taskImageUrls, setTaskImageUrls] = useState<string[]>([]);
  const [taskConfirmLoading, setTaskConfirmLoading] = useState<string | null>(null);
  const [confirmedTaskIds, setConfirmedTaskIds] = useState<Set<string>>(new Set());
  const [riskReportModalOpen, setRiskReportModalOpen] = useState(false);
  const [riskReportLoading, setRiskReportLoading] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [riskReportForm] = Form.useForm();
  const [riskImages, setRiskImages] = useState<File[]>([]);
  const [riskImageUrls, setRiskImageUrls] = useState<string[]>([]);
  const [riskConfirmLoading, setRiskConfirmLoading] = useState<string | null>(null);
  const [confirmedRiskIds, setConfirmedRiskIds] = useState<Set<string>>(new Set());
  const [milestoneReportModalOpen, setMilestoneReportModalOpen] = useState(false);
  const [milestoneReportLoading, setMilestoneReportLoading] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [milestoneReportForm] = Form.useForm();
  const [milestoneImages, setMilestoneImages] = useState<File[]>([]);
  const [milestoneImageUrls, setMilestoneImageUrls] = useState<string[]>([]);
  const [milestoneConfirmLoading, setMilestoneConfirmLoading] = useState<string | null>(null);
  const [confirmedMilestoneIds, setConfirmedMilestoneIds] = useState<Set<string>>(new Set());
  
  // Progress log history states
  const [taskHistoryModalOpen, setTaskHistoryModalOpen] = useState(false);
  const [taskProgressLogs, setTaskProgressLogs] = useState<any[]>([]);
  const [loadingTaskLogs, setLoadingTaskLogs] = useState(false);
  const [riskHistoryModalOpen, setRiskHistoryModalOpen] = useState(false);
  const [riskProgressLogs, setRiskProgressLogs] = useState<any[]>([]);
  const [loadingRiskLogs, setLoadingRiskLogs] = useState(false);
  const [milestoneHistoryModalOpen, setMilestoneHistoryModalOpen] = useState(false);
  const [milestoneProgressLogs, setMilestoneProgressLogs] = useState<any[]>([]);
  const [loadingMilestoneLogs, setLoadingMilestoneLogs] = useState(false);
  
  // Data states
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [assignedRisks, setAssignedRisks] = useState<Risk[]>([]);
  const [assignedMilestones, setAssignedMilestones] = useState<Milestone[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    totalRisks: 0,
    totalMilestones: 0,
    pendingTasks: 0,
    highPriorityRisks: 0,
    overdueMilestones: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user?.id]);

  const loadAllData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load projects first
      await loadAssignedProjects();
      
      // Then load other data based on assigned projects
      await Promise.all([
        loadAssignedTasks(),
        loadAssignedRisks(),
        loadAssignedMilestones()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedProjects = async () => {
    try {
      if (!user?.id) {
        console.warn('User ID not available');
        return;
      }

      // Lấy projects được phân công cho Manager qua 2 cách:
      // 1. Projects mà Manager là leader (leader_id)
      // 2. Projects được assign cho Manager qua ProjectAssignment
      
      const [allProjectsResponse, userProjectsResponse] = await Promise.all([
        projectService.getAllProjects({}),
        projectService.getUserProjects()
      ]);

      console.log('All Projects Response:', allProjectsResponse);
      console.log('User Projects Response:', userProjectsResponse);
      console.log('Current User ID:', user?.id);

      const assignedProjectsSet = new Set<string>();
      const projects: Project[] = [];

      // 1. Lấy projects mà Manager là leader
      if (allProjectsResponse.success && allProjectsResponse.data && Array.isArray(allProjectsResponse.data)) {
        const userId = String(user.id);
        
        allProjectsResponse.data.forEach((project: Project) => {
          let leaderId: string | null = null;
          
          if (typeof project.leader_id === 'object' && project.leader_id) {
            leaderId = String(project.leader_id?.id || project.leader_id?._id || '');
          } else if (project.leader_id) {
            leaderId = String(project.leader_id);
          }
          
          if (leaderId && leaderId === userId) {
            const projectId = project.id || project._id || String(project);
            if (projectId && !assignedProjectsSet.has(projectId)) {
              assignedProjectsSet.add(projectId);
              projects.push(project);
              console.log(`Found project as leader: ${project.project_name}`);
            }
          }
        });
      }

      // 2. Lấy projects được assign qua ProjectAssignment
      if (userProjectsResponse.success && userProjectsResponse.data && Array.isArray(userProjectsResponse.data)) {
        userProjectsResponse.data.forEach((project: Project) => {
          const projectId = project.id || project._id || String(project);
          if (projectId && !assignedProjectsSet.has(projectId)) {
            assignedProjectsSet.add(projectId);
            projects.push(project);
            console.log(`Found project via assignment: ${project.project_name}`);
          }
        });
      }

      console.log('Total assigned projects:', projects.length);
      console.log('Assigned projects data:', projects);
      setAssignedProjects(projects);
      setStats(prev => ({ ...prev, totalProjects: projects.length }));
    } catch (error) {
      console.error('Error loading assigned projects:', error);
    }
  };

  const loadAssignedTasks = async () => {
    try {
      if (!user?.id) return;
      const currentUserId = String(user.id);

      const isMine = (t: any) => {
        const resp = t?.responsible_user_id;
        const respId =
          typeof resp === 'object' && resp ? String(resp.id || resp._id || '') : String(resp || '');

        const assigned = t?.assigned_to;
        const assignedId =
          typeof assigned === 'object' && assigned ? String(assigned.id || assigned._id || '') : String(assigned || '');

        return (respId && respId === currentUserId) || (assignedId && assignedId === currentUserId);
      };

      // Cách 1: query trực tiếp theo user_id (OR responsible/assigned) - không phụ thuộc assignedProjects
      const allTasks: any[] = [];
      const response = await projectTaskService.getAllTasks({ user_id: currentUserId });
      if (response.success && response.data) {
        allTasks.push(...(response.data as any[]));
      }

      // Fallback: nếu không có data, loop theo projectId assigned endpoint
      if (allTasks.length === 0) {
        const currentProjects = assignedProjects.length > 0 ? assignedProjects : await getAssignedProjectsList();
        for (const project of currentProjects) {
          const projectId = project.id || (project as any)._id;
          if (!projectId) continue;
          const r = await projectTaskService.getAssignedTasks(currentUserId, projectId);
          if (r.success && r.data) allTasks.push(...(r.data as any[]));
        }
      }

      // Filter safety + dedupe by id
      const unique = new Map<string, any>();
      for (const t of allTasks.filter(isMine)) {
        const id = String(t.id || t._id || '');
        if (!id) continue;
        if (!unique.has(id)) unique.set(id, t);
      }
      const safeTasks = Array.from(unique.values());

      setAssignedTasks(safeTasks as any);
      setStats(prev => ({
        ...prev,
        totalTasks: safeTasks.length,
        pendingTasks: safeTasks.filter((t: any) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length
      }));
    } catch (error) {
      console.error('Error loading assigned tasks:', error);
    }
  };

  const getAssignedProjectsList = async (): Promise<Project[]> => {
    try {
      if (!user?.id) return [];

      // Lấy projects từ cả leader_id và assignments
      const [allProjectsResponse, userProjectsResponse] = await Promise.all([
        projectService.getAllProjects({}),
        projectService.getUserProjects()
      ]);

      const assignedProjectsSet = new Set<string>();
      const projects: Project[] = [];

      // 1. Projects mà Manager là leader
      if (allProjectsResponse.success && allProjectsResponse.data && Array.isArray(allProjectsResponse.data)) {
        const userId = String(user.id);
        
        allProjectsResponse.data.forEach((project: Project) => {
          let leaderId: string | null = null;
          
          if (typeof project.leader_id === 'object' && project.leader_id) {
            leaderId = String(project.leader_id?.id || project.leader_id?._id || '');
          } else if (project.leader_id) {
            leaderId = String(project.leader_id);
          }
          
          if (leaderId && leaderId === userId) {
            const projectId = project.id || String(project);
            if (!assignedProjectsSet.has(projectId)) {
              assignedProjectsSet.add(projectId);
              projects.push(project);
            }
          }
        });
      }

      // 2. Projects được assign qua ProjectAssignment
      if (userProjectsResponse.success && userProjectsResponse.data && Array.isArray(userProjectsResponse.data)) {
        userProjectsResponse.data.forEach((project: Project) => {
          const projectId = project.id || String(project);
          if (!assignedProjectsSet.has(projectId)) {
            assignedProjectsSet.add(projectId);
            projects.push(project);
          }
        });
      }

      return projects;
    } catch (error) {
      console.error('Error getting assigned projects:', error);
      return [];
    }
  };

  const loadAssignedRisks = async () => {
    try {
      if (!user?.id) return;

      const currentUserId = String(user.id);
      const isMine = (r: any) => {
        const owner = r?.owner_id;
        const ownerId =
          typeof owner === 'object' && owner
            ? String(owner.id || owner._id || '')
            : String(owner || '');
        return ownerId && ownerId === currentUserId;
      };

      // Cách 1: Lấy tất cả risks theo owner_id (không cần projectId)
      const allRisks: Risk[] = [];
      const response = await projectRiskService.getAllRisks({ owner_id: currentUserId });
      if (response.success && response.data) {
        allRisks.push(...(response.data as any[]));
      }

      // Fallback: nếu không có dữ liệu, loop theo projectId đúng (id || _id)
      if (allRisks.length === 0) {
        const currentProjects = assignedProjects.length > 0 ? assignedProjects : await getAssignedProjectsList();
        for (const project of currentProjects) {
          const projectId = project.id || (project as any)._id;
          if (!projectId) continue;
          const r = await projectRiskService.getAssignedRisks(currentUserId, projectId);
          if (r.success && r.data) allRisks.push(...(r.data as any[]));
        }
      }

      // Filter safety + dedupe by id
      const unique = new Map<string, any>();
      for (const r of allRisks.filter(isMine)) {
        const id = String(r.id || r._id || '');
        if (!id) continue;
        if (!unique.has(id)) unique.set(id, r);
      }
      const safeRisks = Array.from(unique.values());

      setAssignedRisks(safeRisks as any);
      setStats(prev => ({
        ...prev,
        totalRisks: safeRisks.length,
        highPriorityRisks: safeRisks.filter((r: any) => (r.risk_score ?? 0) >= 15).length
      }));
    } catch (error) {
      console.error('Error loading assigned risks:', error);
    }
  };

  const loadAssignedMilestones = async () => {
    try {
      if (!user?.id) {
        console.warn('User ID not available for loading milestones');
        return;
      }

      const currentUserId = String(user.id);
      let allMilestones: Milestone[] = [];

      const isMine = (m: any) => {
        const responsible = m?.responsible_user_id;
        const responsibleId =
          typeof responsible === 'object' && responsible
            ? String(responsible.id || responsible._id || '')
            : String(responsible || '');
        return responsibleId && responsibleId === currentUserId;
      };
      
      // Cách 1: Gọi API getAllMilestones với filter responsible_user_id (không cần projectId)
      try {
        const response = await projectMilestoneService.getAllMilestones({ responsible_user_id: currentUserId });
        
        if (response.success && response.data && response.data.length > 0) {
          allMilestones = response.data
            .filter(isMine) // extra safety: never show other users' milestones
            .map((m: any) => ({
              id: m.id || m._id || '',
              milestone_name: m.milestone_name || '',
              project_id: m.project_id,
              status: m.status || 'PENDING',
              planned_date: m.planned_date || '',
              responsible_user_id: m.responsible_user_id,
              progress: m.progress || 0
            }));
        }
      } catch (err) {
        console.error('Error calling getAllMilestones:', err);
      }
      
      // Nếu cách 1 không có kết quả, thử cách 2: Lấy tất cả projects rồi loop
      if (allMilestones.length === 0) {
        const allProjectsResponse = await projectService.getAllProjects({});
        
        if (allProjectsResponse.success && allProjectsResponse.data) {
          const allProjects = Array.isArray(allProjectsResponse.data) ? allProjectsResponse.data : [];
          
          // Loop qua tất cả projects để lấy milestones
          for (const project of allProjects) {
            const projectId = project.id || (project as any)._id;
            if (!projectId) continue;
            
            try {
              const milestoneResponse = await projectMilestoneService.getAssignedMilestones(user.id, projectId);
              if (milestoneResponse.success && milestoneResponse.data && milestoneResponse.data.length > 0) {
                const mappedMilestones = milestoneResponse.data.map((m: any) => ({
                  id: m.id || m._id || '',
                  milestone_name: m.milestone_name || '',
                  project_id: m.project_id || project,
                  status: m.status || 'PENDING',
                  planned_date: m.planned_date || '',
                  responsible_user_id: m.responsible_user_id,
                  progress: m.progress || 0
                }));
                allMilestones.push(...mappedMilestones);
              }
            } catch (err) {
              console.error(`Error loading milestones for project ${projectId}:`, err);
            }
          }
        }
      }

      // Deduplicate + final safety filter
      const unique = new Map<string, Milestone>();
      for (const m of allMilestones.filter(isMine)) {
        if (!m.id) continue;
        if (!unique.has(m.id)) unique.set(m.id, m);
      }
      const safeMilestones = Array.from(unique.values());
      
      setAssignedMilestones(safeMilestones);
      const overdue = safeMilestones.filter(m => {
        const plannedDate = dayjs(m.planned_date);
        return plannedDate.isBefore(dayjs()) && m.status !== 'COMPLETED';
      });
      
      setStats(prev => ({
        ...prev,
        totalMilestones: safeMilestones.length,
        overdueMilestones: overdue.length
      }));
    } catch (error) {
      console.error('Error loading assigned milestones:', error);
    }
  };


  // Helper function to upload images to backend
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    try {
      const { api } = await import('../../../config/axios');
      const response = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      }
      return [];
    } catch (error: any) {
      console.error('Error uploading images:', error);
      message.error('Không thể upload ảnh: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  // Handler for task image upload
  const handleTaskImageUpload = (file: File) => {
    if (taskImages.length >= 10) {
      message.warning('Tối đa 10 hình ảnh');
      return false;
    }
    setTaskImages([...taskImages, file]);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setTaskImageUrls([...taskImageUrls, e.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleRemoveTaskImage = (index: number) => {
    setTaskImages(taskImages.filter((_, i) => i !== index));
    setTaskImageUrls(taskImageUrls.filter((_, i) => i !== index));
  };

  // Handler for risk image upload
  const handleRiskImageUpload = (file: File) => {
    if (riskImages.length >= 10) {
      message.warning('Tối đa 10 hình ảnh');
      return false;
    }
    setRiskImages([...riskImages, file]);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setRiskImageUrls([...riskImageUrls, e.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleRemoveRiskImage = (index: number) => {
    setRiskImages(riskImages.filter((_, i) => i !== index));
    setRiskImageUrls(riskImageUrls.filter((_, i) => i !== index));
  };

  // Handler for milestone image upload
  const handleMilestoneImageUpload = (file: File) => {
    if (milestoneImages.length >= 10) {
      message.warning('Tối đa 10 hình ảnh');
      return false;
    }
    setMilestoneImages([...milestoneImages, file]);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMilestoneImageUrls([...milestoneImageUrls, e.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleRemoveMilestoneImage = (index: number) => {
    setMilestoneImages(milestoneImages.filter((_, i) => i !== index));
    setMilestoneImageUrls(milestoneImageUrls.filter((_, i) => i !== index));
  };

  const handleOpenTaskReport = (task: Task) => {
    if (task.status === 'PENDING') {
      message.warning('Vui lòng xác nhận nhận nhiệm vụ trước khi báo cáo.');
      return;
    }
    // Kiểm tra nếu task đã được Header Department đóng (COMPLETED)
    const status = String(task.status || '').toUpperCase();
    if (status === 'COMPLETED' || status === 'HOÀN THÀNH' || status === 'HOAN THANH') {
      message.warning('Nhiệm vụ đã được Header Department đóng. Bạn chỉ có thể xem lịch sử.');
      return;
    }
    // Vẫn cho phép báo cáo dù progress = 100% (chờ xác nhận từ Header Department)
    setSelectedTask(task);
    setTaskImages([]);
    setTaskImageUrls([]);
    taskReportForm.setFieldsValue({
      progress: task.progress_percentage ?? task.progress ?? 0,
      notes: ''
    });
    setTaskReportModalOpen(true);
  };

  const handleSubmitTaskReport = async () => {
    if (!selectedTask) return;
    try {
      const values = await taskReportForm.validateFields();
      
      // Validate images: at least 5 images required
      if (taskImages.length < 5) {
        message.error('Vui lòng upload ít nhất 5 hình ảnh');
        return;
      }
      
      setTaskReportLoading(true);
      
      // Upload images first
      const uploadedImageUrls = await uploadImages(taskImages);
      if (uploadedImageUrls.length === 0) {
        message.error('Không thể upload ảnh. Vui lòng thử lại.');
        return;
      }
      
      // Lấy task ID (hỗ trợ cả id và _id)
      const taskId = selectedTask.id || selectedTask._id;
      if (!taskId) {
        message.error('Không tìm thấy ID nhiệm vụ');
        return;
      }
      
      const progressValue = Number(values.progress) || 0;
      // Clear cache trước khi cập nhật
      clearProjectTaskCache();
      // Cập nhật tiến độ
      await projectTaskService.updateTaskProgress(taskId, progressValue, values.notes);
      // Thêm log tiến độ (gửi lại báo cáo cho Header Department) với image URLs
      await projectTaskService.addProgressLog(taskId, {
        task_id: taskId,
        progress_percentage: progressValue,
        hours_worked: 0,
        work_description: values.notes || 'Báo cáo tiến độ',
        log_date: new Date().toISOString(),
        images: uploadedImageUrls
      });
      // Clear cache sau khi cập nhật
      clearProjectTaskCache();
      message.success('Đã gửi báo cáo tiến độ');
      setTaskReportModalOpen(false);
      setSelectedTask(null);
      setTaskImages([]);
      setTaskImageUrls([]);
      taskReportForm.resetFields();
      // Đợi một chút để đảm bảo database đã được cập nhật
      await new Promise(resolve => setTimeout(resolve, 100));
      loadAssignedTasks();
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error?.message || 'Không thể gửi báo cáo');
      }
    } finally {
      setTaskReportLoading(false);
    }
  };

  const handleOpenRiskReport = (risk: Risk) => {
    if (risk.status === 'PENDING' || risk.status === 'IDENTIFIED') {
      message.warning('Vui lòng xác nhận nhận rủi ro trước khi báo cáo.');
      return;
    }
    // Kiểm tra nếu risk đã được Header Department đóng (RESOLVED)
    const status = String(risk.status || '').toUpperCase();
    if (status === 'RESOLVED' || status === 'ĐÃ GIẢI QUYẾT' || status === 'DA GIAI QUYET') {
      message.warning('Rủi ro đã được Header Department đóng. Bạn chỉ có thể xem lịch sử.');
      return;
    }
    // Vẫn cho phép báo cáo dù progress = 100% (chờ xác nhận từ Header Department)
    setSelectedRisk(risk);
    setRiskImages([]);
    setRiskImageUrls([]);
    riskReportForm.setFieldsValue({
      progress: risk.progress,
      notes: ''
    });
    setRiskReportModalOpen(true);
  };

  const handleSubmitRiskReport = async () => {
    if (!selectedRisk) return;
    try {
      const values = await riskReportForm.validateFields();
      
      // Validate images: at least 5 images required
      if (riskImages.length < 5) {
        message.error('Vui lòng upload ít nhất 5 hình ảnh');
        return;
      }
      
      setRiskReportLoading(true);
      
      // Upload images first
      const uploadedImageUrls = await uploadImages(riskImages);
      if (uploadedImageUrls.length === 0) {
        message.error('Không thể upload ảnh. Vui lòng thử lại.');
        return;
      }
      
      // Lấy risk ID (hỗ trợ cả id và _id)
      const riskId = (selectedRisk as any).id || selectedRisk._id;
      if (!riskId) {
        message.error('Không tìm thấy ID rủi ro');
        return;
      }
      
      const progressValue = Number(values.progress) || 0;
      // Clear cache trước khi cập nhật
      clearProjectRiskCache();
      // Cập nhật tiến độ
      await projectRiskService.updateRiskProgress(riskId, String(progressValue));
      // Thêm log tiến độ (gửi lại báo cáo cho Header Department) với image URLs
      await projectRiskService.addRiskProgressLog(riskId, {
        risk_id: riskId,
        progress_percentage: progressValue,
        hours_worked: 0,
        work_description: values.notes || 'Báo cáo tiến độ rủi ro',
        log_date: new Date().toISOString(),
        images: uploadedImageUrls
      });
      // Clear cache sau khi cập nhật
      clearProjectRiskCache();
      message.success('Đã gửi báo cáo rủi ro');
      setRiskReportModalOpen(false);
      setSelectedRisk(null);
      setRiskImages([]);
      setRiskImageUrls([]);
      riskReportForm.resetFields();
      // Đợi một chút để đảm bảo database đã được cập nhật
      await new Promise(resolve => setTimeout(resolve, 100));
      loadAssignedRisks();
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error?.message || 'Không thể gửi báo cáo rủi ro');
      }
    } finally {
      setRiskReportLoading(false);
    }
  };

  const handleOpenMilestoneReport = (milestone: Milestone) => {
    if (milestone.status === 'PENDING') {
      message.warning('Vui lòng xác nhận nhận cột mốc trước khi báo cáo.');
      return;
    }
    setSelectedMilestone(milestone);
    setMilestoneImages([]);
    setMilestoneImageUrls([]);
    milestoneReportForm.setFieldsValue({
      progress: milestone.progress,
      notes: ''
    });
    setMilestoneReportModalOpen(true);
  };

  const handleSubmitMilestoneReport = async () => {
    if (!selectedMilestone) return;
    try {
      const values = await milestoneReportForm.validateFields();
      
      // Validate images: at least 5 images required
      if (milestoneImages.length < 5) {
        message.error('Vui lòng upload ít nhất 5 hình ảnh');
        return;
      }
      
      setMilestoneReportLoading(true);
      
      // Upload images first
      const uploadedImageUrls = await uploadImages(milestoneImages);
      if (uploadedImageUrls.length === 0) {
        message.error('Không thể upload ảnh. Vui lòng thử lại.');
        return;
      }
      
      const progressValue = Number(values.progress) || 0;
      const milestoneId = selectedMilestone.id || (selectedMilestone as any)._id;
      // Clear cache trước khi cập nhật
      clearProjectMilestoneCache();
      // Cập nhật tiến độ
      await projectMilestoneService.updateMilestoneProgress(milestoneId, String(progressValue));
      // Thêm log tiến độ (gửi lại báo cáo cho Header Department) với image URLs
      await projectMilestoneService.addMilestoneProgressLog(milestoneId, {
        milestone_id: milestoneId,
        progress_percentage: progressValue,
        hours_worked: 0,
        work_description: values.notes || 'Báo cáo tiến độ cột mốc',
        log_date: new Date().toISOString(),
        images: uploadedImageUrls
      });
      // Clear cache sau khi cập nhật
      clearProjectMilestoneCache();
      message.success('Đã gửi báo cáo cột mốc');
      setMilestoneReportModalOpen(false);
      setSelectedMilestone(null);
      setMilestoneImages([]);
      setMilestoneImageUrls([]);
      milestoneReportForm.resetFields();
      // Đợi một chút để đảm bảo database đã được cập nhật
      await new Promise(resolve => setTimeout(resolve, 100));
      loadAssignedMilestones();
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error?.message || 'Không thể gửi báo cáo cột mốc');
      }
    } finally {
      setMilestoneReportLoading(false);
    }
  };

  const handleViewTaskHistory = async (task: Task) => {
    const taskId = task.id || task._id;
    if (!taskId) {
      message.error('Không tìm thấy ID nhiệm vụ');
      return;
    }
    
    setSelectedTask(task);
    setLoadingTaskLogs(true);
    setTaskHistoryModalOpen(true);
    
    try {
      const response = await projectTaskService.getTaskProgressLogs(taskId);
      if (response.success && response.data) {
        setTaskProgressLogs(response.data);
      } else {
        setTaskProgressLogs([]);
      }
    } catch (error: any) {
      console.error('Error loading task progress logs:', error);
      message.error('Không thể tải lịch sử báo cáo');
      setTaskProgressLogs([]);
    } finally {
      setLoadingTaskLogs(false);
    }
  };

  const handleViewRiskHistory = async (risk: Risk) => {
    const riskId = risk.id || risk._id;
    if (!riskId) {
      message.error('Không tìm thấy ID rủi ro');
      return;
    }
    
    setSelectedRisk(risk);
    setLoadingRiskLogs(true);
    setRiskHistoryModalOpen(true);
    
    try {
      const response = await projectRiskService.getRiskProgressLogs(riskId);
      if (response.success && response.data) {
        setRiskProgressLogs(response.data);
      } else {
        setRiskProgressLogs([]);
      }
    } catch (error: any) {
      console.error('Error loading risk progress logs:', error);
      message.error('Không thể tải lịch sử báo cáo');
      setRiskProgressLogs([]);
    } finally {
      setLoadingRiskLogs(false);
    }
  };

  const handleViewMilestoneHistory = async (milestone: Milestone) => {
    const milestoneId = milestone.id || (milestone as any)._id;
    if (!milestoneId) {
      message.error('Không tìm thấy ID cột mốc');
      return;
    }
    
    setSelectedMilestone(milestone);
    setLoadingMilestoneLogs(true);
    setMilestoneHistoryModalOpen(true);
    
    try {
      const response = await projectMilestoneService.getMilestoneProgressLogs(milestoneId);
      if (response.success && response.data) {
        setMilestoneProgressLogs(response.data);
      } else {
        setMilestoneProgressLogs([]);
      }
    } catch (error: any) {
      console.error('Error loading milestone progress logs:', error);
      message.error('Không thể tải lịch sử báo cáo');
      setMilestoneProgressLogs([]);
    } finally {
      setLoadingMilestoneLogs(false);
    }
  };

  const handleConfirmTask = async (task: Task) => {
    const taskId = task._id || (task as any).id || task.id;
    if (!taskId) {
      message.error('Không xác định được ID nhiệm vụ');
      return;
    }
    try {
      setTaskConfirmLoading(taskId);
      // Cập nhật trạng thái để Header Department thấy đã nhận
      await projectTaskService.updateTask(taskId, {
        status: 'IN_PROGRESS' as any,
        progress_percentage: task.progress_percentage ?? task.progress ?? 0
      });
      await projectTaskService.updateTaskProgress(taskId, task.progress || 0, 'Manager xác nhận nhận nhiệm vụ');
      setConfirmedTaskIds(prev => {
        const next = new Set(prev);
        next.add(taskId);
        return next;
      });
      message.success('Đã xác nhận nhận nhiệm vụ');
      loadAssignedTasks();
    } catch (error: any) {
      message.error(error?.message || 'Không thể xác nhận nhiệm vụ');
    } finally {
      setTaskConfirmLoading(null);
    }
  };

  const handleConfirmRisk = async (risk: Risk) => {
    // Lấy risk ID (hỗ trợ cả id và _id)
    const riskId = risk.id || risk._id;
    if (!riskId) {
      message.error('Không xác định được ID rủi ro');
      return;
    }
    
    try {
      setRiskConfirmLoading(riskId);
      await projectRiskService.updateRiskStatus(riskId, 'IN_PROGRESS' as any);
      setConfirmedRiskIds(prev => {
        const next = new Set(prev);
        next.add(riskId);
        return next;
      });
      message.success('Đã xác nhận nhận rủi ro');
      loadAssignedRisks();
    } catch (error: any) {
      message.error(error?.message || 'Không thể xác nhận rủi ro');
    } finally {
      setRiskConfirmLoading(null);
    }
  };

  const handleConfirmMilestone = async (milestone: Milestone) => {
    const milestoneId = milestone.id || (milestone as any)._id;
    try {
      setMilestoneConfirmLoading(milestoneId);
      await projectMilestoneService.updateMilestoneStatus(milestoneId, 'IN_PROGRESS' as any);
      setConfirmedMilestoneIds(prev => {
        const next = new Set(prev);
        next.add(milestoneId);
        return next;
      });
      message.success('Đã xác nhận nhận cột mốc');
      loadAssignedMilestones();
    } catch (error: any) {
      message.error(error?.message || 'Không thể xác nhận cột mốc');
    } finally {
      setMilestoneConfirmLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'processing',
      'IN_PROGRESS': 'processing',
      'PENDING': 'warning',
      'COMPLETED': 'success',
      'RESOLVED': 'success',
      'CLOSED': 'default',
      'CANCELLED': 'error',
      'DELAYED': 'error',
      'OVERDUE': 'error',
      'IDENTIFIED': 'warning'
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: { [key: string]: string } = {
      'ACTIVE': 'Đang hoạt động',
      'IN_PROGRESS': 'Đang thực hiện',
      'PENDING': 'Chờ thực hiện',
      'COMPLETED': 'Hoàn thành',
      'RESOLVED': 'Đã giải quyết',
      'CLOSED': 'Đã đóng',
      'CANCELLED': 'Đã hủy',
      'DELAYED': 'Bị trễ',
      'OVERDUE': 'Quá hạn',
      'IDENTIFIED': 'Đã xác định'
    };
    return labelMap[status] || status;
  };

  const projectColumns = [
    {
      title: 'Tên dự án',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text: string) => (
        <Space>
          <ProjectIcon style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Task) => {
        const statusUpper = String(status || '').toUpperCase();
        const isCompleted = statusUpper === 'COMPLETED' || statusUpper === 'HOÀN THÀNH' || statusUpper === 'HOAN THANH';
        const progress = Number(record.progress_percentage || record.progress || 0);
        
        // Nếu progress = 100% nhưng chưa COMPLETED → hiển thị "Chờ xác nhận"
        if (progress >= 100 && !isCompleted) {
          return (
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              Chờ xác nhận
            </Tag>
          );
        }
        
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colorMap: { [key: string]: string } = {
          'HIGH': 'red',
          'MEDIUM': 'orange',
          'LOW': 'blue'
        };
        return <Tag color={colorMap[priority] || 'default'}>{priority}</Tag>;
      }
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" status={progress === 100 ? 'success' : 'active'} />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Project) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/header-department/project-management/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  const taskColumns = [
    {
      title: 'Tên nhiệm vụ',
      dataIndex: 'task_name',
      key: 'task_name',
      render: (text: string, record: Task) => (
        <Space>
          <CheckCircleOutlined style={{ color: '#1890ff' }} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {typeof record.project_id === 'object' ? record.project_id?.project_name : 'N/A'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Task) => {
        const statusUpper = String(status || '').toUpperCase();
        const isCompleted = statusUpper === 'COMPLETED' || statusUpper === 'HOÀN THÀNH' || statusUpper === 'HOAN THANH';
        const progress = Number(record.progress_percentage || record.progress || 0);
        
        // Nếu progress = 100% nhưng chưa COMPLETED → hiển thị "Chờ xác nhận"
        if (progress >= 100 && !isCompleted) {
          return (
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              Chờ xác nhận
            </Tag>
          );
        }
        
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress_percentage',
      key: 'progress_percentage',
      render: (progress: number | undefined, record: Task) => {
        const progressValue = progress ?? record.progress ?? 0;
        return (
          <Progress percent={progressValue} size="small" />
        );
      }
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'planned_end_date',
      key: 'planned_end_date',
      render: (date: string | undefined, record: Task) => {
        const endDate = date || record.due_date;
        if (!endDate) return <Text type="secondary">N/A</Text>;
        const isOverdue = dayjs(endDate).isBefore(dayjs()) && endDate;
        return (
          <Text style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            {dayjs(endDate).format('DD/MM/YYYY')}
          </Text>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Task) => (
        <Space>
          {record.status === 'PENDING' ? (
            <Button
              type="primary"
              shape="round"
              loading={taskConfirmLoading === record._id}
              onClick={() => handleConfirmTask(record)}
              style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', border: 'none' }}
            >
              {confirmedTaskIds.has(record._id) ? 'Đã nhận' : 'Xác nhận nhận'}
            </Button>
          ) : (
            <>
              {(() => {
                const status = String(record.status || '').toUpperCase();
                const isCompleted = status === 'COMPLETED' || status === 'HOÀN THÀNH' || status === 'HOAN THANH';
                
                return (
                  <Button
                    type="link"
                    shape="round"
                    onClick={() => handleOpenTaskReport(record)}
                    icon={<CheckCircleOutlined />}
                    disabled={isCompleted}
                    style={isCompleted ? { color: '#d9d9d9', cursor: 'not-allowed' } : {}}
                  >
                    Báo cáo tiến độ
                  </Button>
                );
              })()}
              <Button
                type="link"
                shape="round"
                onClick={() => handleViewTaskHistory(record)}
                icon={<EyeOutlined />}
              >
                Lịch sử
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const riskColumns = [
    {
      title: 'Tên rủi ro',
      dataIndex: 'risk_name',
      key: 'risk_name',
      render: (text: string, record: Risk) => (
        <Space>
          <WarningOutlined style={{ color: '#ff4d4f' }} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {typeof record.project_id === 'object' ? record.project_id?.project_name : 'N/A'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Điểm rủi ro',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (score: number) => (
        <Tag color={score >= 15 ? 'red' : score >= 10 ? 'orange' : 'blue'}>
          {score}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Risk) => {
        const statusUpper = String(status || '').toUpperCase();
        const isResolved = statusUpper === 'RESOLVED' || statusUpper === 'ĐÃ GIẢI QUYẾT' || statusUpper === 'DA GIAI QUYET';
        const progress = Number((record as any).progress || (record as any).progress_percentage || 0);
        
        // Nếu progress = 100% nhưng chưa RESOLVED → hiển thị "Chờ xác nhận"
        if (progress >= 100 && !isResolved) {
          return (
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              Chờ xác nhận
            </Tag>
          );
        }
        
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Hạn giải quyết',
      dataIndex: 'target_resolution_date',
      key: 'target_resolution_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number | undefined, record: Risk) => {
        // Lấy progress từ nhiều nguồn có thể
        const progressFromDataIndex = progress;
        const progressFromRecord = (record as any).progress;
        const progressFromRecordProgress = (record as any).progress_percentage;
        
        // Log chỉ khi có vấn đề
        if (progressFromDataIndex === undefined && progressFromRecord === undefined && progressFromRecordProgress === undefined) {
          console.warn('Risk progress not found:', {
            recordId: record.id || (record as any)._id,
            recordName: record.risk_name,
            recordKeys: Object.keys(record),
            fullRecord: record
          });
        }
        
        const progressValue = progressFromDataIndex ?? progressFromRecord ?? progressFromRecordProgress ?? 0;
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Progress 
              percent={progressValue} 
              size="small" 
              status={progressValue >= 100 ? 'success' : 'active'}
              strokeColor={progressValue >= 100 ? '#52c41a' : '#1890ff'}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {progressValue}%
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Risk) => (
        <Space>
          {record.status === 'IDENTIFIED' || record.status === 'PENDING' ? (
            <Button
              type="primary"
              shape="round"
              loading={riskConfirmLoading === record._id}
              onClick={() => handleConfirmRisk(record)}
              style={{ background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)', border: 'none' }}
            >
              {confirmedRiskIds.has(record._id) ? 'Đã nhận' : 'Xác nhận nhận'}
            </Button>
          ) : (
            <>
              {(() => {
                const status = String(record.status || '').toUpperCase();
                const isResolved = status === 'RESOLVED' || status === 'ĐÃ GIẢI QUYẾT' || status === 'DA GIAI QUYET';
                
                return (
                  <Button
                    type="link"
                    shape="round"
                    onClick={() => handleOpenRiskReport(record)}
                    icon={<WarningOutlined />}
                    disabled={isResolved}
                    style={isResolved ? { color: '#d9d9d9', cursor: 'not-allowed' } : {}}
                  >
                    Báo cáo rủi ro
                  </Button>
                );
              })()}
              <Button
                type="link"
                shape="round"
                onClick={() => handleViewRiskHistory(record)}
                icon={<EyeOutlined />}
              >
                Lịch sử
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const milestoneColumns = [
    {
      title: 'Tên cột mốc',
      dataIndex: 'milestone_name',
      key: 'milestone_name',
      render: (text: string, record: Milestone) => (
        <Space>
          <FlagOutlined style={{ color: '#722ed1' }} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {typeof record.project_id === 'object' ? record.project_id?.project_name : 'N/A'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Task) => {
        const statusUpper = String(status || '').toUpperCase();
        const isCompleted = statusUpper === 'COMPLETED' || statusUpper === 'HOÀN THÀNH' || statusUpper === 'HOAN THANH';
        const progress = Number(record.progress_percentage || record.progress || 0);
        
        // Nếu progress = 100% nhưng chưa COMPLETED → hiển thị "Chờ xác nhận"
        if (progress >= 100 && !isCompleted) {
          return (
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              Chờ xác nhận
            </Tag>
          );
        }
        
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Ngày dự kiến',
      dataIndex: 'planned_date',
      key: 'planned_date',
      render: (date: string) => {
        const isOverdue = dayjs(date).isBefore(dayjs()) && date;
        return (
          <Text style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Text>
        );
      }
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number | undefined, record: Milestone) => {
        // Lấy progress từ nhiều nguồn có thể
        const progressFromDataIndex = progress;
        const progressFromRecord = (record as any).progress;
        const progressFromRecordProgress = (record as any).progress_percentage;
        
        // Log chỉ khi có vấn đề
        if (progressFromDataIndex === undefined && progressFromRecord === undefined && progressFromRecordProgress === undefined) {
          console.warn('Milestone progress not found:', {
            recordId: record.id || (record as any)._id,
            recordName: record.milestone_name,
            recordKeys: Object.keys(record),
            fullRecord: record
          });
        }
        
        const progressValue = progressFromDataIndex ?? progressFromRecord ?? progressFromRecordProgress ?? 0;
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Progress 
              percent={progressValue} 
              size="small" 
              status={progressValue >= 100 ? 'success' : 'active'}
              strokeColor={progressValue >= 100 ? '#52c41a' : '#1890ff'}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {progressValue}%
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Milestone) => (
        <Space>
          {record.status === 'PENDING' ? (
            <Button
              type="primary"
              shape="round"
              loading={milestoneConfirmLoading === (record.id || (record as any)._id)}
              onClick={() => handleConfirmMilestone(record)}
              style={{ background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)', border: 'none' }}
            >
              {confirmedMilestoneIds.has(record.id || (record as any)._id) ? 'Đã nhận' : 'Xác nhận nhận'}
            </Button>
          ) : (
            <>
              <Button
                type="link"
                shape="round"
                onClick={() => handleOpenMilestoneReport(record)}
                icon={<FlagOutlined />}
              >
                Báo cáo cột mốc
              </Button>
              <Button
                type="link"
                shape="round"
                onClick={() => handleViewMilestoneHistory(record)}
                icon={<EyeOutlined />}
              >
                Lịch sử
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];


  return (
    <ManagerLayout
      title="Quản lý dự án"
      icon={<ProjectOutlined />}
    >
        <div style={{ 
        padding: '32px'
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
              <ProjectIcon style={{ marginRight: '12px', fontSize: '28px' }} />
              Quản lý dự án - Manager
            </Title>
        </div>
          <Text type="secondary" style={{ fontSize: '15px', color: '#64748b', fontWeight: 500 }}>
            Xem và thực hiện các phân công từ Header Department
          </Text>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <Card 
              size="small"
              style={{ 
                borderRadius: '12px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ fontSize: '13px' }}>Dự án được phân công</span>}
                value={stats.totalProjects}
                prefix={<ProjectIcon style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <Card 
              size="small"
              style={{ 
                borderRadius: '12px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ fontSize: '13px' }}>Nhiệm vụ</span>}
                value={stats.totalTasks}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                suffix={
                  stats.pendingTasks > 0 && (
                    <Badge count={stats.pendingTasks} style={{ backgroundColor: '#faad14' }} />
                  )
                }
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <Card 
              size="small"
              style={{ 
                borderRadius: '12px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ fontSize: '13px' }}>Rủi ro</span>}
                value={stats.totalRisks}
                prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                suffix={
                  stats.highPriorityRisks > 0 && (
                    <Badge count={stats.highPriorityRisks} style={{ backgroundColor: '#ff4d4f' }} />
                  )
                }
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
            <Card 
              size="small"
              style={{ 
                borderRadius: '12px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ fontSize: '13px' }}>Cột mốc</span>}
                value={stats.totalMilestones}
                prefix={<FlagOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                suffix={
                  stats.overdueMilestones > 0 && (
                    <Badge count={stats.overdueMilestones} style={{ backgroundColor: '#ff4d4f' }} />
                  )
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Card 
          style={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.05)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
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
                  <ProjectIcon />
                  Dự án được phân công ({stats.totalProjects})
                </span>
              }
              key="projects"
            >
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0 }}>Danh sách dự án được phân công làm Trưởng dự án</Title>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadAssignedProjects}
                    loading={loading}
                    style={{ borderRadius: '8px' }}
                  >
                    Làm mới
                  </Button>
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : assignedProjects.length === 0 ? (
                  <div>
                    <Empty
                      description="Chưa có dự án nào được phân công"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <Alert
                      message="Hướng dẫn"
                      description="Để xem dự án được phân công, Header Department cần: (1) Chỉnh sửa dự án và đặt bạn làm Trưởng dự án, hoặc (2) Thêm bạn vào dự án qua phần Quản lý thành viên."
                      type="info"
                      showIcon
                      style={{ marginTop: '16px', maxWidth: '800px', margin: '16px auto 0' }}
                    />
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={projectColumns}
                      dataSource={assignedProjects}
                      rowKey={(record: Project, index) =>
                        record.id ||
                        (record as any)._id ||
                        (record as any).project_code ||
                        `project-${index}`
                      }
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <CheckCircleOutlined />
                  Nhiệm vụ ({stats.totalTasks})
                  {stats.pendingTasks > 0 && (
                    <Badge count={stats.pendingTasks} style={{ marginLeft: '8px' }} />
                  )}
                </span>
              }
              key="tasks"
            >
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0 }}>Nhiệm vụ được phân công</Title>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadAssignedTasks}
                    loading={loading}
                    style={{ borderRadius: '8px' }}
                  >
                    Làm mới
                  </Button>
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : assignedTasks.length === 0 ? (
                  <Empty
                    description="Chưa có nhiệm vụ nào được phân công"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={taskColumns}
                      dataSource={assignedTasks}
                      rowKey={(record: Task, index) =>
                        record._id ||
                        (record as any).id ||
                        record.task_code ||
                        `task-${index}`
                      }
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <WarningOutlined />
                  Rủi ro ({stats.totalRisks})
                  {stats.highPriorityRisks > 0 && (
                    <Badge count={stats.highPriorityRisks} style={{ marginLeft: '8px', backgroundColor: '#ff4d4f' }} />
                  )}
                </span>
              }
              key="risks"
            >
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0 }}>Rủi ro được phân công làm Người phụ trách</Title>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadAssignedRisks}
                    loading={loading}
                    style={{ borderRadius: '8px' }}
                  >
                    Làm mới
                  </Button>
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : assignedRisks.length === 0 ? (
                  <Empty
                    description="Chưa có rủi ro nào được phân công"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={riskColumns}
                      dataSource={assignedRisks}
                      rowKey={(record: Risk, index) =>
                        record._id ||
                        (record as any).id ||
                        `risk-${index}`
                      }
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <FlagOutlined />
                  Cột mốc ({stats.totalMilestones})
                  {stats.overdueMilestones > 0 && (
                    <Badge count={stats.overdueMilestones} style={{ marginLeft: '8px', backgroundColor: '#ff4d4f' }} />
                  )}
                </span>
              }
              key="milestones"
            >
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0 }}>Cột mốc được phân công làm Người phụ trách</Title>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadAssignedMilestones}
                    loading={loading}
                    style={{ borderRadius: '8px' }}
                  >
                    Làm mới
                  </Button>
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : assignedMilestones.length === 0 ? (
                  <Empty
                    description="Chưa có cột mốc nào được phân công"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={milestoneColumns}
                      dataSource={assignedMilestones}
                      rowKey={(record: Milestone, index) =>
                        record.id ||
                        (record as any)._id ||
                        `milestone-${index}`
                      }
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                )}
              </div>
            </TabPane>

          </Tabs>
        </Card>
        <Modal
          title={selectedTask ? `Báo cáo tiến độ - ${selectedTask.task_name}` : 'Báo cáo tiến độ'}
          open={taskReportModalOpen}
          onCancel={() => {
            setTaskReportModalOpen(false);
            setSelectedTask(null);
            setTaskImages([]);
            setTaskImageUrls([]);
            taskReportForm.resetFields();
          }}
          onOk={handleSubmitTaskReport}
          confirmLoading={taskReportLoading}
          okText="Gửi báo cáo"
          cancelText="Hủy"
        >
          <Form
            form={taskReportForm}
            layout="vertical"
            initialValues={{ progress: 0, notes: '' }}
          >
            {(() => {
              if (!selectedTask) return null;
              const progress = Number(selectedTask.progress_percentage || selectedTask.progress || 0);
              const status = String(selectedTask.status || '').toUpperCase();
              const isCompleted = status === 'COMPLETED' || status === 'HOÀN THÀNH' || status === 'HOAN THANH';
              
              // Hiển thị Alert "Chờ xác nhận" nếu progress = 100% nhưng chưa được Header Department xác nhận
              if (progress >= 100 && !isCompleted) {
                return (
                  <Alert
                    message="Chờ xác nhận"
                    description="Nhiệm vụ đã đạt 100% tiến độ. Đang chờ Header Department xác nhận hoàn thành. Bạn vẫn có thể gửi báo cáo bổ sung."
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                );
              }
              return null;
            })()}
            <Form.Item
              label="Tiến độ (%)"
              name="progress"
              rules={[{ required: true, message: 'Nhập tiến độ' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="Ghi chú gửi Header Department"
              name="notes"
              rules={[{ required: true, message: 'Nhập ghi chú' }]}
            >
              <Input.TextArea rows={4} placeholder="Nội dung báo cáo, vướng mắc, đề xuất..." />
            </Form.Item>
            <Form.Item
              label="Hình ảnh (tối thiểu 5 ảnh)"
              required
              help={taskImages.length < 5 ? `Cần thêm ${5 - taskImages.length} ảnh nữa` : ''}
            >
              <Upload
                accept="image/*"
                multiple
                beforeUpload={handleTaskImageUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
              </Upload>
              {taskImageUrls.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Row gutter={[8, 8]}>
                    {taskImageUrls.map((url, idx) => (
                      <Col key={idx} xs={12} sm={8} md={6}>
                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                          <Image
                            src={url}
                            alt={`task-${idx}`}
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            preview={false}
                          />
                          <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveTaskImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              minWidth: '24px',
                              height: '24px',
                              padding: '0'
                            }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                    Đã chọn: {taskImages.length}/10 (tối thiểu 5)
                  </Text>
                </div>
              )}
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={selectedRisk ? `Báo cáo rủi ro - ${selectedRisk.risk_name}` : 'Báo cáo rủi ro'}
          open={riskReportModalOpen}
          onCancel={() => {
            setRiskReportModalOpen(false);
            setSelectedRisk(null);
            setRiskImages([]);
            setRiskImageUrls([]);
            riskReportForm.resetFields();
          }}
          onOk={handleSubmitRiskReport}
          confirmLoading={riskReportLoading}
          okText="Gửi báo cáo"
          cancelText="Hủy"
        >
          <Form
            form={riskReportForm}
            layout="vertical"
            initialValues={{ progress: 0, notes: '' }}
          >
            {(() => {
              if (!selectedRisk) return null;
              const progress = Number((selectedRisk as any).progress || (selectedRisk as any).progress_percentage || 0);
              const status = String(selectedRisk.status || '').toUpperCase();
              const isResolved = status === 'RESOLVED' || status === 'ĐÃ GIẢI QUYẾT' || status === 'DA GIAI QUYET';
              
              // Hiển thị Alert "Chờ xác nhận" nếu progress = 100% nhưng chưa được Header Department xác nhận
              if (progress >= 100 && !isResolved) {
                return (
                  <Alert
                    message="Chờ xác nhận"
                    description="Rủi ro đã đạt 100% tiến độ. Đang chờ Header Department xác nhận hoàn thành. Bạn vẫn có thể gửi báo cáo bổ sung."
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                );
              }
              return null;
            })()}
            <Form.Item
              label="Tiến độ xử lý (%)"
              name="progress"
              rules={[{ required: true, message: 'Nhập tiến độ' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="Ghi chú gửi Header Department"
              name="notes"
              rules={[{ required: true, message: 'Nhập ghi chú' }]}
            >
              <Input.TextArea rows={4} placeholder="Nội dung cập nhật, rủi ro còn tồn tại, đề xuất hỗ trợ..." />
            </Form.Item>
            <Form.Item
              label="Hình ảnh (tối thiểu 5 ảnh)"
              required
              help={riskImages.length < 5 ? `Cần thêm ${5 - riskImages.length} ảnh nữa` : ''}
            >
              <Upload
                accept="image/*"
                multiple
                beforeUpload={handleRiskImageUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
              </Upload>
              {riskImageUrls.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Row gutter={[8, 8]}>
                    {riskImageUrls.map((url, idx) => (
                      <Col key={idx} xs={12} sm={8} md={6}>
                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                          <Image
                            src={url}
                            alt={`risk-${idx}`}
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            preview={false}
                          />
                          <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveRiskImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              minWidth: '24px',
                              height: '24px',
                              padding: '0'
                            }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                    Đã chọn: {riskImages.length}/10 (tối thiểu 5)
                  </Text>
                </div>
              )}
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={selectedMilestone ? `Báo cáo cột mốc - ${selectedMilestone.milestone_name}` : 'Báo cáo cột mốc'}
          open={milestoneReportModalOpen}
          onCancel={() => {
            setMilestoneReportModalOpen(false);
            setSelectedMilestone(null);
            setMilestoneImages([]);
            setMilestoneImageUrls([]);
            milestoneReportForm.resetFields();
          }}
          onOk={handleSubmitMilestoneReport}
          confirmLoading={milestoneReportLoading}
          okText="Gửi báo cáo"
          cancelText="Hủy"
        >
          <Form
            form={milestoneReportForm}
            layout="vertical"
            initialValues={{ progress: 0, notes: '' }}
          >
            <Form.Item
              label="Tiến độ thực hiện (%)"
              name="progress"
              rules={[{ required: true, message: 'Nhập tiến độ' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="Ghi chú gửi Header Department"
              name="notes"
              rules={[{ required: true, message: 'Nhập ghi chú' }]}
            >
              <Input.TextArea rows={4} placeholder="Nội dung cập nhật, vướng mắc, đề xuất hỗ trợ..." />
            </Form.Item>
            <Form.Item
              label="Hình ảnh (tối thiểu 5 ảnh)"
              required
              help={milestoneImages.length < 5 ? `Cần thêm ${5 - milestoneImages.length} ảnh nữa` : ''}
            >
              <Upload
                accept="image/*"
                multiple
                beforeUpload={handleMilestoneImageUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
              </Upload>
              {milestoneImageUrls.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Row gutter={[8, 8]}>
                    {milestoneImageUrls.map((url, idx) => (
                      <Col key={idx} xs={12} sm={8} md={6}>
                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                          <Image
                            src={url}
                            alt={`milestone-${idx}`}
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            preview={false}
                          />
                          <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveMilestoneImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              minWidth: '24px',
                              height: '24px',
                              padding: '0'
                            }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                    Đã chọn: {milestoneImages.length}/10 (tối thiểu 5)
                  </Text>
                </div>
              )}
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={
            <Space>
              <HistoryOutlined />
              <span>Lịch sử báo cáo - {selectedTask?.task_name}</span>
            </Space>
          }
          open={taskHistoryModalOpen}
          onCancel={() => {
            setTaskHistoryModalOpen(false);
            setSelectedTask(null);
            setTaskProgressLogs([]);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setTaskHistoryModalOpen(false);
              setSelectedTask(null);
              setTaskProgressLogs([]);
            }}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          {loadingTaskLogs ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : taskProgressLogs.length === 0 ? (
            <Empty description="Chưa có lịch sử báo cáo" />
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {taskProgressLogs.map((log: any, index: number) => (
                <Card
                  key={log.id || log._id || index}
                  style={{ marginBottom: '16px', borderRadius: '8px' }}
                  size="small"
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <Text strong>
                          {dayjs(log.report_date || log.log_date || log.created_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </Space>
                      <Tag color="blue">{log.progress_percentage || 0}%</Tag>
                    </div>
                    {log.user_id && (
                      <div>
                        <UserOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                        <Text type="secondary">
                          {typeof log.user_id === 'object' 
                            ? log.user_id?.full_name || log.user_id?.email || 'N/A'
                            : 'N/A'}
                        </Text>
                      </div>
                    )}
                    {log.work_description && (
                      <div style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '4px' }}>Ghi chú:</Text>
                        <Text>{log.work_description}</Text>
                      </div>
                    )}
                    {log.hours_worked > 0 && (
                      <div>
                        <Text type="secondary">Giờ làm việc: {log.hours_worked}h</Text>
                      </div>
                    )}
                    {log.images && Array.isArray(log.images) && log.images.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1890ff' }}>
                          Hình ảnh báo cáo:
                        </Text>
                        <Row gutter={[8, 8]}>
                          {log.images.map((imageUrl: string, imgIdx: number) => (
                            <Col key={imgIdx} xs={12} sm={8} md={6}>
                              <Image
                                src={imageUrl}
                                alt={`task-report-${index}-${imgIdx}`}
                                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                preview={{
                                  mask: 'Xem ảnh'
                                }}
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </Space>
                </Card>
              ))}
            </div>
          )}
        </Modal>
        <Modal
          title={
            <Space>
              <HistoryOutlined />
              <span>Lịch sử báo cáo - {selectedRisk?.risk_name}</span>
            </Space>
          }
          open={riskHistoryModalOpen}
          onCancel={() => {
            setRiskHistoryModalOpen(false);
            setSelectedRisk(null);
            setRiskProgressLogs([]);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setRiskHistoryModalOpen(false);
              setSelectedRisk(null);
              setRiskProgressLogs([]);
            }}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          {loadingRiskLogs ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : riskProgressLogs.length === 0 ? (
            <Empty description="Chưa có lịch sử báo cáo" />
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {riskProgressLogs.map((log: any, index: number) => (
                <Card
                  key={log.id || log._id || index}
                  style={{ marginBottom: '16px', borderRadius: '8px' }}
                  size="small"
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <Text strong>
                          {dayjs(log.report_date || log.log_date || log.created_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </Space>
                      <Tag color="blue">{log.progress_percentage || 0}%</Tag>
                    </div>
                    {log.user_id && (
                      <div>
                        <UserOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                        <Text type="secondary">
                          {typeof log.user_id === 'object' 
                            ? log.user_id?.full_name || log.user_id?.email || 'N/A'
                            : 'N/A'}
                        </Text>
                      </div>
                    )}
                    {log.work_description && (
                      <div style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '4px' }}>Ghi chú:</Text>
                        <Text>{log.work_description}</Text>
                      </div>
                    )}
                    {log.hours_worked > 0 && (
                      <div>
                        <Text type="secondary">Giờ làm việc: {log.hours_worked}h</Text>
                      </div>
                    )}
                    {log.images && Array.isArray(log.images) && log.images.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1890ff' }}>
                          Hình ảnh báo cáo:
                        </Text>
                        <Row gutter={[8, 8]}>
                          {log.images.map((imageUrl: string, imgIdx: number) => (
                            <Col key={imgIdx} xs={12} sm={8} md={6}>
                              <Image
                                src={imageUrl}
                                alt={`risk-report-${index}-${imgIdx}`}
                                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                preview={{
                                  mask: 'Xem ảnh'
                                }}
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </Space>
                </Card>
              ))}
            </div>
          )}
        </Modal>
        <Modal
          title={
            <Space>
              <HistoryOutlined />
              <span>Lịch sử báo cáo - {selectedMilestone?.milestone_name}</span>
            </Space>
          }
          open={milestoneHistoryModalOpen}
          onCancel={() => {
            setMilestoneHistoryModalOpen(false);
            setSelectedMilestone(null);
            setMilestoneProgressLogs([]);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setMilestoneHistoryModalOpen(false);
              setSelectedMilestone(null);
              setMilestoneProgressLogs([]);
            }}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          {loadingMilestoneLogs ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : milestoneProgressLogs.length === 0 ? (
            <Empty description="Chưa có lịch sử báo cáo" />
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {milestoneProgressLogs.map((log: any, index: number) => (
                <Card
                  key={log.id || log._id || index}
                  style={{ marginBottom: '16px', borderRadius: '8px' }}
                  size="small"
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <Text strong>
                          {dayjs(log.report_date || log.log_date || log.created_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </Space>
                      <Tag color="blue">{log.progress_percentage || 0}%</Tag>
                    </div>
                    {log.user_id && (
                      <div>
                        <UserOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                        <Text type="secondary">
                          {typeof log.user_id === 'object' 
                            ? log.user_id?.full_name || log.user_id?.email || 'N/A'
                            : 'N/A'}
                        </Text>
                      </div>
                    )}
                    {log.work_description && (
                      <div style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '4px' }}>Ghi chú:</Text>
                        <Text>{log.work_description}</Text>
                      </div>
                    )}
                    {log.hours_worked > 0 && (
                      <div>
                        <Text type="secondary">Giờ làm việc: {log.hours_worked}h</Text>
                      </div>
                    )}
                    {log.images && Array.isArray(log.images) && log.images.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1890ff' }}>
                          Hình ảnh báo cáo:
                        </Text>
                        <Row gutter={[8, 8]}>
                          {log.images.map((imageUrl: string, imgIdx: number) => (
                            <Col key={imgIdx} xs={12} sm={8} md={6}>
                              <Image
                                src={imageUrl}
                                alt={`milestone-report-${index}-${imgIdx}`}
                                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                preview={{
                                  mask: 'Xem ảnh'
                                }}
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </Space>
                </Card>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </ManagerLayout>
  );
};

export default ManagerProjectManagement;
