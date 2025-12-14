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
  message
} from 'antd';
import {
  ProjectOutlined as ProjectIcon,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  ReloadOutlined,
  EyeOutlined,
  WarningOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  UserOutlined
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
  const [taskConfirmLoading, setTaskConfirmLoading] = useState<string | null>(null);
  const [confirmedTaskIds, setConfirmedTaskIds] = useState<Set<string>>(new Set());
  const [riskReportModalOpen, setRiskReportModalOpen] = useState(false);
  const [riskReportLoading, setRiskReportLoading] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [riskReportForm] = Form.useForm();
  const [riskConfirmLoading, setRiskConfirmLoading] = useState<string | null>(null);
  const [confirmedRiskIds, setConfirmedRiskIds] = useState<Set<string>>(new Set());
  const [milestoneReportModalOpen, setMilestoneReportModalOpen] = useState(false);
  const [milestoneReportLoading, setMilestoneReportLoading] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [milestoneReportForm] = Form.useForm();
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
      // Lấy tất cả tasks từ các projects được phân công
      const allTasks: Task[] = [];
      const currentProjects = assignedProjects.length > 0 ? assignedProjects : await getAssignedProjectsList();
      
      for (const project of currentProjects) {
        const projectId = project.id || project._id;
        if (!projectId) continue;
        const response = await projectTaskService.getProjectTasks(projectId);
        if (response.success && response.data) {
          // Filter tasks được phân công cho Manager
          const userId = String(user?.id || '');
          const managerTasks = response.data.filter((task: Task) => {
            let responsibleId: string | null = null;
            if (typeof task.responsible_user_id === 'object' && task.responsible_user_id) {
              responsibleId = String(task.responsible_user_id?.id || task.responsible_user_id?._id || '');
            } else if (task.responsible_user_id) {
              responsibleId = String(task.responsible_user_id);
            }
            
            let assignedToId: string | null = null;
            if (typeof task.assigned_to === 'object' && task.assigned_to) {
              assignedToId = String(task.assigned_to?.id || task.assigned_to?._id || '');
            } else if (task.assigned_to) {
              assignedToId = String(task.assigned_to);
            }
            
            return (responsibleId && responsibleId === userId) || (assignedToId && assignedToId === userId);
          });
          allTasks.push(...managerTasks);
        }
      }
      
      setAssignedTasks(allTasks);
      setStats(prev => ({
        ...prev,
        totalTasks: allTasks.length,
        pendingTasks: allTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length
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
      // Lấy tất cả risks được phân công cho Manager
      const allRisks: Risk[] = [];
      const currentProjects = assignedProjects.length > 0 ? assignedProjects : await getAssignedProjectsList();
      
      for (const project of currentProjects) {
        const response = await projectRiskService.getAssignedRisks(user?.id || '', project.id);
        if (response.success && response.data) {
          // Log để debug
          console.log('loadAssignedRisks - Response data:', response.data.map((r: any) => ({
            id: r.id || r._id,
            risk_name: r.risk_name,
            progress: r.progress,
            status: r.status
          })));
          allRisks.push(...response.data);
        }
      }
      
      // Log để debug
      console.log('loadAssignedRisks - All risks before setState:', allRisks.map((r: any) => ({
        id: r.id || r._id,
        risk_name: r.risk_name,
        progress: r.progress,
        status: r.status
      })));
      
      setAssignedRisks(allRisks);
      setStats(prev => ({
        ...prev,
        totalRisks: allRisks.length,
        highPriorityRisks: allRisks.filter(r => r.risk_score >= 15).length
      }));
    } catch (error) {
      console.error('Error loading assigned risks:', error);
    }
  };

  const loadAssignedMilestones = async () => {
    try {
      // Lấy tất cả milestones được phân công cho Manager
      const allMilestones: Milestone[] = [];
      const currentProjects = assignedProjects.length > 0 ? assignedProjects : await getAssignedProjectsList();
      
      for (const project of currentProjects) {
        const response = await projectMilestoneService.getAssignedMilestones(user?.id || '', project.id);
        if (response.success && response.data) {
          // Log để debug
          console.log('loadAssignedMilestones - Response data:', response.data.map((m: any) => ({
            id: m.id || m._id,
            milestone_name: m.milestone_name,
            progress: m.progress,
            status: m.status
          })));
          allMilestones.push(...response.data);
        }
      }
      
      // Log để debug
      console.log('loadAssignedMilestones - All milestones before setState:', allMilestones.map((m: any) => ({
        id: m.id || m._id,
        milestone_name: m.milestone_name,
        progress: m.progress,
        status: m.status
      })));
      
      setAssignedMilestones(allMilestones);
      const overdue = allMilestones.filter(m => {
        const plannedDate = dayjs(m.planned_date);
        return plannedDate.isBefore(dayjs()) && m.status !== 'COMPLETED';
      });
      
      setStats(prev => ({
        ...prev,
        totalMilestones: allMilestones.length,
        overdueMilestones: overdue.length
      }));
    } catch (error) {
      console.error('Error loading assigned milestones:', error);
    }
  };


  const handleOpenTaskReport = (task: Task) => {
    if (task.status === 'PENDING') {
      message.warning('Vui lòng xác nhận nhận nhiệm vụ trước khi báo cáo.');
      return;
    }
    setSelectedTask(task);
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
      setTaskReportLoading(true);
      
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
      // Thêm log tiến độ (gửi lại báo cáo cho Header Department)
      await projectTaskService.addProgressLog(taskId, {
        task_id: taskId,
        progress_percentage: progressValue,
        hours_worked: 0,
        work_description: values.notes || 'Báo cáo tiến độ',
        log_date: new Date().toISOString()
      });
      // Clear cache sau khi cập nhật
      clearProjectTaskCache();
      message.success('Đã gửi báo cáo tiến độ');
      setTaskReportModalOpen(false);
      setSelectedTask(null);
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
    setSelectedRisk(risk);
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
      setRiskReportLoading(true);
      
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
      // Thêm log tiến độ (gửi lại báo cáo cho Header Department)
      await projectRiskService.addRiskProgressLog(riskId, {
        risk_id: riskId,
        progress_percentage: progressValue,
        hours_worked: 0,
        work_description: values.notes || 'Báo cáo tiến độ rủi ro',
        log_date: new Date().toISOString()
      });
      // Clear cache sau khi cập nhật
      clearProjectRiskCache();
      message.success('Đã gửi báo cáo rủi ro');
      setRiskReportModalOpen(false);
      setSelectedRisk(null);
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
      setMilestoneReportLoading(true);
      const progressValue = Number(values.progress) || 0;
      const milestoneId = selectedMilestone.id || (selectedMilestone as any)._id;
      // Clear cache trước khi cập nhật
      clearProjectMilestoneCache();
      // Cập nhật tiến độ
      await projectMilestoneService.updateMilestoneProgress(milestoneId, String(progressValue));
      // Thêm log tiến độ (gửi lại báo cáo cho Header Department)
      await projectMilestoneService.addMilestoneProgressLog(milestoneId, {
        milestone_id: milestoneId,
        progress_percentage: progressValue,
        hours_worked: 0,
        work_description: values.notes || 'Báo cáo tiến độ cột mốc',
        log_date: new Date().toISOString()
      });
      // Clear cache sau khi cập nhật
      clearProjectMilestoneCache();
      message.success('Đã gửi báo cáo cột mốc');
      setMilestoneReportModalOpen(false);
      setSelectedMilestone(null);
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
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      )
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
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      )
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
              <Button
                type="link"
                shape="round"
                onClick={() => handleOpenTaskReport(record)}
                icon={<CheckCircleOutlined />}
              >
                Báo cáo tiến độ
              </Button>
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
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      )
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
              <Button
                type="link"
                shape="round"
                onClick={() => handleOpenRiskReport(record)}
                icon={<WarningOutlined />}
              >
                Báo cáo rủi ro
              </Button>
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
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      )
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
          </Form>
        </Modal>
        <Modal
          title={selectedRisk ? `Báo cáo rủi ro - ${selectedRisk.risk_name}` : 'Báo cáo rủi ro'}
          open={riskReportModalOpen}
          onCancel={() => {
            setRiskReportModalOpen(false);
            setSelectedRisk(null);
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
          </Form>
        </Modal>
        <Modal
          title={selectedMilestone ? `Báo cáo cột mốc - ${selectedMilestone.milestone_name}` : 'Báo cáo cột mốc'}
          open={milestoneReportModalOpen}
          onCancel={() => {
            setMilestoneReportModalOpen(false);
            setSelectedMilestone(null);
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
