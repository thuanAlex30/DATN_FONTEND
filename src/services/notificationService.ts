import { api } from '../config/axios';

export interface Notification {
    _id: string;
    notification_id?: number;
    user_id: string | {
        _id: string;
        full_name: string;
        username: string;
    };
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    is_read: boolean;
    read_at?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'system' | 'training' | 'safety' | 'ppe' | 'project' | 'user' | 'general';
    action_url?: string;
    expires_at?: string;
    created_at: string;
    formatted_created_at?: string;
    relative_time?: string;
}

export interface NotificationFilters {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    is_read?: boolean;
    priority?: string;
    search?: string;
    sort?: string;
    order?: string;
}

export interface NotificationStats {
    total_notifications: number;
    unread_notifications: number;
    type_breakdown: {
        info: number;
        warning: number;
        error: number;
        success: number;
    };
}

export interface NotificationResponse {
    notifications: Notification[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
    };
}

export interface NotificationType {
    value: string;
    label: string;
    color: string;
}

export interface NotificationCategory {
    value: string;
    label: string;
}

export interface CreateNotificationData {
    user_id: string;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: 'system' | 'training' | 'safety' | 'ppe' | 'project' | 'user' | 'general';
    action_url?: string;
    expires_at?: string;
}

class NotificationService {
    // Get notifications for current user
    static async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
        try {
            // Check if user is authenticated before making request
            const token = localStorage.getItem('safety_management_token');
            if (!token) {
                console.log('No auth token found, returning empty notifications');
                return {
                    notifications: [],
                    pagination: {
                        current_page: 1,
                        total_pages: 0,
                        total_items: 0,
                        items_per_page: 10
                    }
                };
            }

            // Try private notifications first, fallback to public if timeout
            try {
                const response = await api.get('/notifications', { 
                    params: filters,
                    timeout: 10000 // 10 seconds timeout
                });
                return response.data.data;
            } catch (timeoutError: any) {
                if (timeoutError.code === 'ECONNABORTED' || timeoutError.message?.includes('timeout')) {
                    console.log('Private notifications timeout, trying public notifications...');
                    // Fallback to public notifications
                    const publicResponse = await api.get('/notifications/public', { 
                        params: filters,
                        timeout: 10000
                    });
                    return publicResponse.data.data;
                }
                throw timeoutError;
            }
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                console.log('Unauthorized - main interceptor will handle');
                // Let main axios interceptor handle 401 errors
                throw error;
            }
            
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                console.log('Request timeout - returning empty notifications');
                return {
                    notifications: [],
                    pagination: {
                        current_page: 1,
                        total_pages: 0,
                        total_items: 0,
                        items_per_page: 10
                    }
                };
            }
            
            throw error;
        }
    }

    // Get notification by ID
    static async getNotificationById(id: string): Promise<Notification> {
        try {
            const response = await api.get(`/notifications/${id}`, {
                timeout: 5000
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notification by ID:', error);
            throw error;
        }
    }

    // Get notification statistics
    static async getStats(): Promise<NotificationStats> {
        try {
            const response = await api.get('/notifications/stats');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notification stats:', error);
            throw error;
        }
    }

    // Get notification types
    static async getTypes(): Promise<NotificationType[]> {
        try {
            const response = await api.get('/notifications/types');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notification types:', error);
            throw error;
        }
    }

    // Get notification categories
    static async getCategories(): Promise<NotificationCategory[]> {
        try {
            const response = await api.get('/notifications/categories');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notification categories:', error);
            throw error;
        }
    }

    // Create notification (admin only)
    static async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
        try {
            const response = await api.post('/notifications', notificationData, {
                timeout: 60000 // 60 seconds timeout
            });
            return response.data.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Create bulk notifications (admin only)
    static async createBulkNotifications(notifications: CreateNotificationData[]): Promise<{
        created_count: number;
        notifications: Notification[];
    }> {
        try {
            const response = await api.post('/notifications/bulk', { notifications });
            return response.data.data;
        } catch (error) {
            console.error('Error creating bulk notifications:', error);
            throw error;
        }
    }

    // Mark notification as read
    static async markAsRead(id: string): Promise<Notification> {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            return response.data.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Mark all notifications as read
    static async markAllAsRead(): Promise<{ modified_count: number }> {
        try {
            const response = await api.put('/notifications/mark-all-read');
            return response.data.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Delete notification
    static async deleteNotification(id: string): Promise<void> {
        try {
            await api.delete(`/notifications/${id}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Clean up expired notifications (admin only)
    static async cleanupExpiredNotifications(): Promise<{ deleted_count: number }> {
        try {
            const response = await api.delete('/notifications/cleanup/expired');
            return response.data.data;
        } catch (error) {
            console.error('Error cleaning up expired notifications:', error);
            throw error;
        }
    }

    // Helper method to get relative time
    static getRelativeTime(dateTimeString: string): string {
        const now = new Date();
        const date = new Date(dateTimeString);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }

    // Helper method to format date time
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

    // Helper method to get notification icon
    static getNotificationIcon(type: string): { icon: string; color: string } {
        const icons: Record<string, string> = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };
        const colors: Record<string, string> = {
            info: 'linear-gradient(135deg, #3498db, #2980b9)',
            success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
            error: 'linear-gradient(135deg, #e74c3c, #c0392b)'
        };
        return { 
            icon: icons[type] || 'fas fa-bell', 
            color: colors[type] || '#6c757d' 
        };
    }

    // Helper method to get priority color
    static getPriorityColor(priority: string): string {
        const colors: Record<string, string> = {
            low: '#95a5a6',
            medium: '#3498db',
            high: '#f39c12',
            urgent: '#e74c3c'
        };
        return colors[priority] || '#6c757d';
    }

    // Helper method to check if notification is expired
    static isExpired(expiresAt?: string): boolean {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    }

    // Helper method to get category label
    static getCategoryLabel(category: string): string {
        const labels: Record<string, string> = {
            system: 'Hệ thống',
            training: 'Đào tạo',
            safety: 'An toàn',
            ppe: 'PPE',
            project: 'Dự án',
            user: 'Người dùng',
            general: 'Chung'
        };
        return labels[category] || category;
    }

    // Helper method to get type label
    static getTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            info: 'Thông tin',
            success: 'Thành công',
            warning: 'Cảnh báo',
            error: 'Lỗi'
        };
        return labels[type] || type;
    }

    // Bulk delete notifications
    static async bulkDeleteNotifications(notificationIds: string[]) {
        try {
            const response = await api.delete('/notifications/bulk-delete', {
                data: { notification_ids: notificationIds }
            });
            return response.data;
        } catch (error) {
            console.error('Error bulk deleting notifications:', error);
            throw error;
        }
    }


    // Get notification settings
    static async getNotificationSettings() {
        try {
            const response = await api.get('/notifications/settings');
            return response.data;
        } catch (error) {
            console.error('Error getting notification settings:', error);
            throw error;
        }
    }

    // Update notification settings
    static async updateNotificationSettings(settings: any) {
        try {
            const response = await api.put('/notifications/settings', { settings });
            return response.data;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    }

    // Get public notifications (no authentication required)
    static async getPublicNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
        try {
            const response = await api.get('/notifications/public', { 
                params: filters,
                timeout: 20000 // 20 seconds timeout
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching public notifications:', error);
            throw error;
        }
    }
}

export default NotificationService;
