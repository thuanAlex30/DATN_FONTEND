import { api } from '../config/axios';
import incidentService from './incidentService';
import { getDashboardStats as getPPEDashboardStats } from './ppeService';
import { trainingStatsApi } from './trainingApi';
import projectService from './projectService';
import SystemLogService from './SystemLogService';

export interface HeaderDepartmentDashboardStats {
  incidents: {
    total: number;
    inProgress: number;
    resolved: number;
    critical: number;
    resolutionRate: number;
  };
  training: {
    activeCourses: number;
    completionRate: number;
    employeesNeedingTraining: number;
    certificatesExpiringSoon: number;
  };
  ppe: {
    lowStock: number;
    expiringSoon: number;
    issuedThisMonth: number;
    totalInUse: number;
  };
  certificates: {
    expiringSoon: number;
    expired: number;
    needRenewal: number;
  };
  projects: {
    active: number;
    highRisk: number;
    milestonesDueSoon: number;
  };
}

export interface IncidentTrend {
  date: string;
  count: number;
  resolved: number;
}

export interface RecentActivity {
  _id: string;
  action: string;
  module: string;
  severity: 'info' | 'success' | 'warning' | 'error' | 'critical';
  user_id?: {
    _id: string;
    username: string;
    full_name: string;
  };
  timestamp: string;
  details?: any;
}

class HeaderDepartmentDashboardService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<HeaderDepartmentDashboardStats> {
    try {
      // Fetch all stats in parallel
      const [incidentsRes, trainingStats, ppeStats, projectStats] = await Promise.allSettled([
        incidentService.getIncidents(),
        trainingStatsApi.getDashboardStats(),
        getPPEDashboardStats(),
        projectService.getProjectStats(),
      ]);

      // Process incidents
      let incidents = {
        total: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0,
        resolutionRate: 0,
      };

      if (incidentsRes.status === 'fulfilled') {
        const incidentsData = incidentsRes.value.data?.data || incidentsRes.value.data || [];
        const total = incidentsData.length;
        const inProgress = incidentsData.filter(
          (inc: any) => inc.status === 'in_progress' || inc.status === 'investigating' || inc.status === 'pending'
        ).length;
        const resolved = incidentsData.filter(
          (inc: any) => inc.status === 'resolved' || inc.status === 'closed'
        ).length;
        const critical = incidentsData.filter(
          (inc: any) => inc.severity === 'rất nghiêm trọng' || inc.priority === 'high' || inc.severity === 'critical'
        ).length;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        incidents = { total, inProgress, resolved, critical, resolutionRate };
      }

      // Process training stats
      let training = {
        activeCourses: 0,
        completionRate: 0,
        employeesNeedingTraining: 0,
        certificatesExpiringSoon: 0,
      };

      if (trainingStats.status === 'fulfilled') {
        const trainingData = trainingStats.value;
        training = {
          activeCourses: trainingData.active_courses || trainingData.activeCourses || 0,
          completionRate: trainingData.completion_rate || trainingData.completionRate || 0,
          employeesNeedingTraining: trainingData.employees_needing_training || trainingData.employeesNeedingTraining || 0,
          certificatesExpiringSoon: trainingData.certificates_expiring_soon || trainingData.certificatesExpiringSoon || 0,
        };
      }

      // Process PPE stats
      let ppe = {
        lowStock: 0,
        expiringSoon: 0,
        issuedThisMonth: 0,
        totalInUse: 0,
      };

      if (ppeStats.status === 'fulfilled') {
        const ppeData = ppeStats.value;
        ppe = {
          lowStock: ppeData.low_stock_items || ppeData.lowStock || 0,
          expiringSoon: ppeData.expiring_soon || ppeData.expiringSoon || 0,
          issuedThisMonth: ppeData.issued_this_month || ppeData.issuedThisMonth || 0,
          totalInUse: ppeData.total_in_use || ppeData.totalInUse || 0,
        };
      }

      // Process project stats
      let projects = {
        active: 0,
        highRisk: 0,
        milestonesDueSoon: 0,
      };

      if (projectStats.status === 'fulfilled' && projectStats.value.success) {
        const projectData = projectStats.value.data;
        projects = {
          active: projectData.active_projects || projectData.active || 0,
          highRisk: projectData.high_risk_projects || projectData.highRisk || 0,
          milestonesDueSoon: projectData.milestones_due_soon || projectData.milestonesDueSoon || 0,
        };
      }

      // Certificates - try to get from training stats or set defaults
      const certificates = {
        expiringSoon: training.certificatesExpiringSoon,
        expired: 0, // Will need separate API
        needRenewal: training.certificatesExpiringSoon,
      };

      return {
        incidents,
        training,
        ppe,
        certificates,
        projects,
      };
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values on error
      return {
        incidents: { total: 0, inProgress: 0, resolved: 0, critical: 0, resolutionRate: 0 },
        training: { activeCourses: 0, completionRate: 0, employeesNeedingTraining: 0, certificatesExpiringSoon: 0 },
        ppe: { lowStock: 0, expiringSoon: 0, issuedThisMonth: 0, totalInUse: 0 },
        certificates: { expiringSoon: 0, expired: 0, needRenewal: 0 },
        projects: { active: 0, highRisk: 0, milestonesDueSoon: 0 },
      };
    }
  }

  /**
   * Get incident trends for chart
   */
  async getIncidentTrends(days: number = 30): Promise<IncidentTrend[]> {
    try {
      const response = await incidentService.getIncidents();
      const incidents = response.data?.data || response.data || [];

      // Group by date
      const trendsMap = new Map<string, { count: number; resolved: number }>();
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      incidents.forEach((inc: any) => {
        const date = new Date(inc.created_at || inc.createdAt || inc.reported_at || inc.reportedAt);
        if (date >= startDate) {
          const dateKey = date.toISOString().split('T')[0];
          const current = trendsMap.get(dateKey) || { count: 0, resolved: 0 };
          current.count++;
          if (inc.status === 'resolved' || inc.status === 'closed') {
            current.resolved++;
          }
          trendsMap.set(dateKey, current);
        }
      });

      // Convert to array and sort
      const trends: IncidentTrend[] = Array.from(trendsMap.entries())
        .map(([date, data]) => ({
          date,
          count: data.count,
          resolved: data.resolved,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return trends;
    } catch (error) {
      console.error('Error fetching incident trends:', error);
      return [];
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await SystemLogService.getRecentActivities(limit);
      return response.data || response || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  /**
   * Get alerts and notifications
   */
  async getAlerts(): Promise<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    module: string;
    timestamp: string;
  }>> {
    try {
      const stats = await this.getDashboardStats();
      const alerts: Array<{
        id: string;
        type: 'warning' | 'error' | 'info';
        title: string;
        message: string;
        module: string;
        timestamp: string;
      }> = [];

      // Critical incidents
      if (stats.incidents.critical > 0) {
        alerts.push({
          id: 'critical-incidents',
          type: 'error',
          title: 'Sự cố nghiêm trọng',
          message: `Có ${stats.incidents.critical} sự cố nghiêm trọng cần xử lý ngay`,
          module: 'incidents',
          timestamp: new Date().toISOString(),
        });
      }

      // Low stock PPE
      if (stats.ppe.lowStock > 0) {
        alerts.push({
          id: 'low-stock-ppe',
          type: 'warning',
          title: 'PPE tồn kho thấp',
          message: `Có ${stats.ppe.lowStock} loại PPE đang ở mức tồn kho thấp`,
          module: 'ppe',
          timestamp: new Date().toISOString(),
        });
      }

      // Expiring certificates
      if (stats.certificates.expiringSoon > 0) {
        alerts.push({
          id: 'expiring-certificates',
          type: 'warning',
          title: 'Chứng chỉ sắp hết hạn',
          message: `Có ${stats.certificates.expiringSoon} chứng chỉ sắp hết hạn trong 30 ngày tới`,
          module: 'certificates',
          timestamp: new Date().toISOString(),
        });
      }

      // High risk projects
      if (stats.projects.highRisk > 0) {
        alerts.push({
          id: 'high-risk-projects',
          type: 'warning',
          title: 'Dự án rủi ro cao',
          message: `Có ${stats.projects.highRisk} dự án đang có rủi ro cao`,
          module: 'projects',
          timestamp: new Date().toISOString(),
        });
      }

      // Employees needing training
      if (stats.training.employeesNeedingTraining > 0) {
        alerts.push({
          id: 'employees-needing-training',
          type: 'info',
          title: 'Nhân viên cần đào tạo',
          message: `Có ${stats.training.employeesNeedingTraining} nhân viên cần được đào tạo`,
          module: 'training',
          timestamp: new Date().toISOString(),
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }
}

export default new HeaderDepartmentDashboardService();

