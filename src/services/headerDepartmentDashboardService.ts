import incidentService from './incidentService';
import { getDashboardStats as getPPEDashboardStats, getDashboardData as getPPEDashboardData } from './ppeService';
import { trainingStatsApi } from './trainingApi';
import projectService from './projectService';
import projectRiskService from './projectRiskService';
import projectMilestoneService from './projectMilestoneService';
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
    pendingConfirmationCount?: number;
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
      // Use getIncidentStats endpoint instead of getIncidents to get properly filtered stats
      const [
        incidentsStatsRes,
        trainingStats,
        ppeStats,
        projectStats,
        riskStatsRes,
        milestonesRes
      ] = await Promise.allSettled([
        incidentService.getIncidentStats(),
        trainingStatsApi.getDashboardStats(),
        getPPEDashboardStats(),
        projectService.getProjectStats(),
        projectRiskService.getAllRisks({ risk_level: 'HIGH' }),
        projectMilestoneService.getAllMilestones()
      ]);

      // Process incidents from stats endpoint
      let incidents = {
        total: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0,
        resolutionRate: 0,
      };

      if (incidentsStatsRes.status === 'fulfilled') {
        const statsData = incidentsStatsRes.value.data?.data || incidentsStatsRes.value.data || {};
        const total = statsData.total || 0;
        const inProgress = statsData.inProgress || 0;
        const resolved = statsData.resolved || 0;
        const critical = statsData.critical || 0;
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
        const trainingData = trainingStats.value as any; // Type assertion để tránh lỗi type checking
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
      pendingConfirmationCount: 0,
      };

      if (ppeStats.status === 'fulfilled') {
        const rawPpe = ppeStats.value;
        // Support different response wrappers: { data: { data: {...} } }, { data: {...} }, or direct object
        const ppeData: any = (rawPpe && (rawPpe.data?.data ?? rawPpe.data ?? rawPpe)) || {};

        const pick = (obj: any, keys: string[]) => {
          for (const k of keys) {
            if (obj && typeof obj === 'object' && obj[k] !== undefined && obj[k] !== null) return obj[k];
          }
          return undefined;
        };

        let lowStock = pick(ppeData, ['low_stock_items', 'lowStock', 'lowStockItems', 'low_stock']);
        let expiringSoon = pick(ppeData, ['expiring_soon', 'expiringSoon']);
        let issuedThisMonth = pick(ppeData, ['issued_this_month', 'issuedThisMonth']);
        let totalInUse = pick(ppeData, ['total_in_use', 'totalInUse', 'totalIssuances', 'total_issuances']);
        let pendingConfirmationCount = pick(ppeData, ['pending_confirmation_count', 'pendingConfirmationCount']);

        // If the primary stats endpoint didn't provide the expected fields, try the alternate dashboard endpoint
        if (
          (lowStock === undefined || lowStock === null) &&
          (expiringSoon === undefined || expiringSoon === null) &&
          (issuedThisMonth === undefined || issuedThisMonth === null) &&
          (totalInUse === undefined || totalInUse === null) &&
          (pendingConfirmationCount === undefined || pendingConfirmationCount === null)
        ) {
          try {
            const fallback = await getPPEDashboardData();
            const rawFb: any = fallback;
            const fb: any = (rawFb && (rawFb.data?.data ?? rawFb.data ?? rawFb)) || {};
            lowStock = lowStock ?? fb?.lowStockItems ?? fb?.low_stock_items ?? 0;
            expiringSoon = expiringSoon ?? fb?.expiringSoon ?? fb?.expiring_soon ?? 0;
            issuedThisMonth = issuedThisMonth ?? fb?.issuedThisMonth ?? fb?.issued_this_month ?? 0;
            totalInUse = totalInUse ?? fb?.totalInUse ?? fb?.total_in_use ?? fb?.totalIssuances ?? fb?.total_issuances ?? 0;
            pendingConfirmationCount = pendingConfirmationCount ?? fb?.pendingConfirmationCount ?? fb?.pending_confirmation_count ?? 0;
          } catch (e) {
            // Non-fatal: leave defaults
            console.debug('Fallback PPE dashboard call failed:', e);
          }
        }

        ppe = {
          lowStock: Number(lowStock) || 0,
          expiringSoon: Number(expiringSoon) || 0,
          issuedThisMonth: Number(issuedThisMonth) || 0,
          totalInUse: Number(totalInUse) || 0,
          pendingConfirmationCount: Number(pendingConfirmationCount) || 0,
        };
      }

      // Process project stats
      let projects = {
        active: 0,
        highRisk: 0,
        milestonesDueSoon: 0,
      };

      if (projectStats.status === 'fulfilled') {
        const rawProj: any = projectStats.value;
        const projData: any = (rawProj && (rawProj.data?.data ?? rawProj.data ?? rawProj)) || {};

        const pickProj = (obj: any, keys: string[]) => {
          // Prefer a non-zero / meaningful value if multiple aliases exist.
          // If only zero values are present, return the first zero found.
          let firstZeroOrPresent: any = undefined;
          for (const k of keys) {
            if (!(obj && typeof obj === 'object')) continue;
            const v = obj[k];
            if (v === undefined || v === null) continue;
            // treat numeric or numeric-strings
            const numeric = Number(v);
            if (!Number.isNaN(numeric) && numeric !== 0) return v;
            // treat non-empty strings as meaningful
            if (typeof v === 'string' && v.trim() !== '') return v;
            // store first present (could be 0) to return if no non-zero found
            if (firstZeroOrPresent === undefined) firstZeroOrPresent = v;
          }
          return firstZeroOrPresent;
        };

        const active = pickProj(projData, ['active_projects', 'activeProjects', 'active', 'ACTIVE', 'total', 'TOTAL']);
        // highRisk and milestones may come from separate services; default undefined here
        let highRisk = pickProj(projData, ['high_risk_projects', 'highRisk', 'high_risk']);
        let milestonesDueSoon = pickProj(projData, ['milestones_due_soon', 'milestonesDueSoon', 'milestones_due']);

        projects = {
          active: Number(active) || 0,
          highRisk: Number(highRisk) || 0,
          milestonesDueSoon: Number(milestonesDueSoon) || 0,
        };
      }

      // If risk stats endpoint returned data, use its high risk count
      if (riskStatsRes && riskStatsRes.status === 'fulfilled') {
        try {
          const rawRisk = (riskStatsRes as any).value;
          // projectRiskService.getAllRisks returns { data: ProjectRisk[], success: boolean }
          const maybeArray = rawRisk && (rawRisk.data ?? rawRisk);
          let highRiskCount = 0;
          if (Array.isArray(maybeArray)) {
            highRiskCount = maybeArray.length;
          } else {
            const riskData = (rawRisk && (rawRisk.data?.data ?? rawRisk.data ?? rawRisk)) || {};
            highRiskCount = ((riskData.high_risk_count ?? riskData.highRiskCount ?? riskData.high_risk) as any) || 0;
          }
          projects.highRisk = Number(highRiskCount) || projects.highRisk || 0;
        } catch (e) {
          // ignore
        }
      }

      // If milestones endpoint returned data, compute upcoming milestones within 30 days
      if (milestonesRes && milestonesRes.status === 'fulfilled') {
        try {
          const rawMilestones = (milestonesRes as any).value;
          const milestones = (rawMilestones && (rawMilestones.data?.data ?? rawMilestones.data ?? rawMilestones)) || [];
          const now = new Date();
          const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          const upcomingCount = Array.isArray(milestones)
            ? milestones.filter((m: any) => {
                const planned = new Date(m.planned_date || m.plannedDate || m.plannedAt || m.planned_at);
                return planned >= now && planned <= in30;
              }).length
            : 0;
          projects.milestonesDueSoon = Number(upcomingCount) || projects.milestonesDueSoon || 0;
        } catch (e) {
          // ignore
        }
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

