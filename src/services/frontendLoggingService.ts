import api from './api';

export interface FrontendLogData {
    action: string;
    module: string;
    details?: any;
    page?: string;
    component?: string;
    user_action?: string;
    timestamp?: string;
}

class FrontendLoggingService {
    private static instance: FrontendLoggingService;
    private logQueue: FrontendLogData[] = [];
    private isProcessing = false;
    private readonly BATCH_SIZE = 5;
    private readonly FLUSH_INTERVAL = 5000; // 5 seconds

    private constructor() {
        // Start periodic flush
        setInterval(() => {
            this.flushLogs();
        }, this.FLUSH_INTERVAL);

        // Flush logs before page unload
        window.addEventListener('beforeunload', () => {
            this.flushLogs(true);
        });
    }

    public static getInstance(): FrontendLoggingService {
        if (!FrontendLoggingService.instance) {
            FrontendLoggingService.instance = new FrontendLoggingService();
        }
        return FrontendLoggingService.instance;
    }

    /**
     * Log frontend activity
     */
    public logActivity(logData: FrontendLogData): void {
        const enhancedLogData: FrontendLogData = {
            ...logData,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            component: this.getCurrentComponent(),
            user_action: this.detectUserAction(logData.action)
        };

        this.logQueue.push(enhancedLogData);
        
        // Auto flush if queue is full
        if (this.logQueue.length >= this.BATCH_SIZE) {
            this.flushLogs();
        }
    }

    /**
     * Log page navigation
     */
    public logNavigation(from: string, to: string, method: string = 'click'): void {
        this.logActivity({
            action: `Chuyển từ ${from} sang ${to}`,
            module: 'navigation',
            details: {
                from_page: from,
                to_page: to,
                navigation_method: method,
                referrer: document.referrer
            }
        });
    }

    /**
     * Log tab switching
     */
    public logTabSwitch(module: string, fromTab: string, toTab: string): void {
        this.logActivity({
            action: `Chuyển tab từ ${fromTab} sang ${toTab}`,
            module: module,
            details: {
                from_tab: fromTab,
                to_tab: toTab,
                module: module
            }
        });
    }

    /**
     * Log form interactions
     */
    public logFormInteraction(formName: string, action: string, details?: any): void {
        this.logActivity({
            action: `${action} form ${formName}`,
            module: 'form',
            details: {
                form_name: formName,
                form_action: action,
                ...details
            }
        });
    }

    /**
     * Log button clicks
     */
    public logButtonClick(buttonName: string, module: string, details?: any): void {
        this.logActivity({
            action: `Nhấn nút ${buttonName}`,
            module: module,
            details: {
                button_name: buttonName,
                module: module,
                ...details
            }
        });
    }

    /**
     * Log data loading
     */
    public logDataLoad(module: string, dataType: string, success: boolean, details?: any): void {
        this.logActivity({
            action: `${success ? 'Tải thành công' : 'Lỗi tải'} dữ liệu ${dataType}`,
            module: module,
            details: {
                data_type: dataType,
                success: success,
                module: module,
                ...details
            }
        });
    }

    /**
     * Log search activities
     */
    public logSearch(module: string, searchTerm: string, resultsCount: number, filters?: any): void {
        this.logActivity({
            action: `Tìm kiếm "${searchTerm}"`,
            module: module,
            details: {
                search_term: searchTerm,
                results_count: resultsCount,
                filters: filters,
                module: module
            }
        });
    }

    /**
     * Log filter changes
     */
    public logFilterChange(module: string, filterType: string, filterValue: any): void {
        this.logActivity({
            action: `Thay đổi bộ lọc ${filterType}`,
            module: module,
            details: {
                filter_type: filterType,
                filter_value: filterValue,
                module: module
            }
        });
    }

    /**
     * Log export activities
     */
    public logExport(module: string, format: string, recordCount: number): void {
        this.logActivity({
            action: `Xuất dữ liệu ${format}`,
            module: module,
            details: {
                export_format: format,
                record_count: recordCount,
                module: module
            }
        });
    }

    /**
     * Flush logs to server
     */
    private async flushLogs(sync: boolean = false): Promise<void> {
        if (this.isProcessing || this.logQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const logsToSend = [...this.logQueue];
        this.logQueue = [];

        try {
            // Temporarily disabled to avoid 404 errors
            console.log('Frontend logs (disabled):', logsToSend);
            return;

            if (sync) {
                // Synchronous request for page unload
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/v1/system-logs/frontend', false);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
                xhr.send(JSON.stringify({ logs: logsToSend }));
            } else {
                // Asynchronous request
                await api.post('/system-logs/frontend', { logs: logsToSend });
            }
        } catch (error) {
            console.error('Error sending frontend logs:', error);
            // Re-queue logs if sending failed
            this.logQueue.unshift(...logsToSend);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Get current component name
     */
    private getCurrentComponent(): string {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        
        if (segments.length === 0) return 'home';
        if (segments[0] === 'admin') {
            return segments[1] || 'dashboard';
        }
        return segments[0];
    }

    /**
     * Detect user action type
     */
    private detectUserAction(action: string): string {
        if (action.includes('Chuyển') || action.includes('chuyển')) return 'navigation';
        if (action.includes('Nhấn') || action.includes('nhấn')) return 'click';
        if (action.includes('Tìm kiếm') || action.includes('tìm kiếm')) return 'search';
        if (action.includes('Tải') || action.includes('tải')) return 'load';
        if (action.includes('Xuất') || action.includes('xuất')) return 'export';
        if (action.includes('Thay đổi') || action.includes('thay đổi')) return 'filter';
        return 'interaction';
    }
}

// Export singleton instance
export default FrontendLoggingService.getInstance();
