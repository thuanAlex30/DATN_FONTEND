import api from './api';

export interface SystemLog {
    _id: string;
    user_id?: {
        _id: string;
        username: string;
        full_name: string;
    };
    action: string;
    module: string;
    severity: 'info' | 'success' | 'warning' | 'error' | 'critical';
    details: any;
    ip_address: string;
    user_agent?: string;
    timestamp: string;
}

export interface SystemLogFilters {
    page?: number;
    limit?: number;
    module?: string;
    severity?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
}

export interface SystemLogStats {
    total_logs: number;
    error_logs: number;
    active_users: number;
    most_active_module: string;
}

export interface AnalyticsData {
    severity_distribution: Array<{ _id: string; count: number }>;
    module_distribution: Array<{ _id: string; count: number }>;
    daily_activity: Array<{ _id: { day: number; month: number; year: number }; count: number }>;
    top_users: Array<{ user_name?: string; username?: string; count: number }>;
}

class SystemLogService {
    static async getLogs(filters: SystemLogFilters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });

            console.log('Making request to:', `/system-logs?${params.toString()}`);
            const response = await api.get(`/system-logs?${params.toString()}`);
            console.log('System logs response:', response.data);
            return response.data.data; // Access the actual data from the API response
        } catch (error) {
            console.error('SystemLogService.getLogs error:', error);
            throw error;
        }
    }

    static async getStats(timeRange: string = 'today') {
        try {
            console.log('Making request to:', `/system-logs/stats?time_range=${timeRange}`);
            const response = await api.get(`/system-logs/stats?time_range=${timeRange}`);
            console.log('System stats response:', response.data);
            return response.data.data; // Access the actual data from the API response
        } catch (error) {
            console.error('SystemLogService.getStats error:', error);
            throw error;
        }
    }

    static async getDetailedStats() {
        try {
            console.log('Making request to:', '/system-logs/detailed-stats');
            const response = await api.get('/system-logs/detailed-stats');
            console.log('Detailed stats response:', response.data);
            return response.data.data; // Access the actual data from the API response
        } catch (error) {
            console.error('SystemLogService.getDetailedStats error:', error);
            throw error;
        }
    }

    static async getAnalytics(timeRange: string = 'today') {
        try {
            console.log('Making request to:', `/system-logs/analytics?time_range=${timeRange}`);
            const response = await api.get(`/system-logs/analytics?time_range=${timeRange}`);
            console.log('System analytics response:', response.data);
            return response.data.data; // Access the actual data from the API response
        } catch (error) {
            console.error('SystemLogService.getAnalytics error:', error);
            throw error;
        }
    }

    static async bulkDeleteLogs(logIds: string[]) {
        const response = await api.delete('/system-logs/bulk-delete', {
            data: { log_ids: logIds }
        });
        return response.data;
    }

    static async exportSelectedLogs(logIds: string[], format: 'json' | 'csv' = 'json') {
        const response = await api.post('/system-logs/export-selected', {
            log_ids: logIds,
            format: format
        }, {
            responseType: 'blob'
        });
        return response.data;
    }

    static async cleanupOldLogs(days: number = 90) {
        try {
            const response = await api.post('/system-logs/cleanup-old', {
                days: days
            });
            return response.data;
        } catch (error: any) {
            console.error('SystemLogService.cleanupOldLogs error:', error);
            // Re-throw the error with more context
        if (error.response?.status === 403) {
            throw new Error('Không có quyền thực hiện hành động này. Chỉ Admin và Super Admin mới có thể dọn dẹp logs cũ.');
            } else if (error.response?.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Lỗi không xác định khi dọn dẹp logs cũ');
            }
        }
    }

    static async exportLogs(format: 'json' | 'csv', filters: SystemLogFilters = {}) {
        const params = new URLSearchParams();
        params.append('format', format);
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get(`/system-logs/export?${params.toString()}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    static downloadExportedFile(blob: Blob, filename: string) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    static getRelativeTime(dateTimeString: string): string {
        const now = new Date();
        const date = new Date(dateTimeString);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds} giây trước`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        }
    }

    static getSeverityIcon(severity: string): string {
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            critical: 'fas fa-skull-crossbones'
        };
        return icons[severity as keyof typeof icons] || 'fas fa-info-circle';
    }

    static formatDateTime(dateTimeString: string): string {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

export default SystemLogService;
