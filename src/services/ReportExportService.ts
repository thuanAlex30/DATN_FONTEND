import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export interface ExportOptions {
    title: string;
    subtitle?: string;
    dateRange?: {
        start: string;
        end: string;
    };
    filters?: any;
    includeCharts?: boolean;
    includeAnalytics?: boolean;
}

export interface SystemLogExportData {
    logs: any[];
    analytics?: any;
    summary?: any;
}

class ReportExportService {
    /**
     * Export system logs to PDF
     */
    static async exportToPDF(
        data: SystemLogExportData, 
        options: ExportOptions
    ): Promise<void> {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // Header
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(options.title, pageWidth / 2, 30, { align: 'center' });
            
            if (options.subtitle) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'normal');
                doc.text(options.subtitle, pageWidth / 2, 40, { align: 'center' });
            }
            
            // Date range
            if (options.dateRange) {
                doc.setFontSize(10);
                doc.text(
                    `Từ: ${this.formatDate(options.dateRange.start)} - Đến: ${this.formatDate(options.dateRange.end)}`,
                    pageWidth / 2, 50, { align: 'center' }
                );
            }
            
            // Generated date
            doc.setFontSize(10);
            doc.text(
                `Được tạo: ${new Date().toLocaleString('vi-VN')}`,
                pageWidth / 2, 60, { align: 'center' }
            );
            
            // Summary section
            if (data.summary) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Tổng Quan', 20, 80);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                let yPos = 90;
                
                Object.entries(data.summary).forEach(([key, value]) => {
                    doc.text(`${key}: ${value}`, 20, yPos);
                    yPos += 7;
                });
                
                yPos += 10;
            }
            
            // Analytics section
            if (data.analytics && options.includeAnalytics) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Phân Tích Dữ Liệu', 20, yPos);
                yPos += 15;
                
                // Severity distribution
                if (data.analytics.severityDistribution) {
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Phân Bố Mức Độ Nghiêm Trọng', 20, yPos);
                    yPos += 10;
                    
                    const severityData = Object.entries(data.analytics.severityDistribution).map(([severity, count]) => [
                        this.getSeverityLabel(severity),
                        count,
                        `${((count as number) / data.analytics.totalLogs * 100).toFixed(1)}%`
                    ]);
                    
                    (doc as any).autoTable({
                        head: [['Mức độ', 'Số lượng', 'Tỷ lệ']],
                        body: severityData,
                        startY: yPos,
                        styles: { fontSize: 10 },
                        headStyles: { fillColor: [52, 152, 219] }
                    });
                    
                    yPos = (doc as any).lastAutoTable.finalY + 20;
                }
                
                // Module distribution
                if (data.analytics.moduleDistribution) {
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Phân Bố Module', 20, yPos);
                    yPos += 10;
                    
                    const moduleData = Object.entries(data.analytics.moduleDistribution).map(([module, count]) => [
                        this.getModuleLabel(module),
                        count,
                        `${((count as number) / data.analytics.totalLogs * 100).toFixed(1)}%`
                    ]);
                    
                    (doc as any).autoTable({
                        head: [['Module', 'Số lượng', 'Tỷ lệ']],
                        body: moduleData,
                        startY: yPos,
                        styles: { fontSize: 10 },
                        headStyles: { fillColor: [46, 204, 113] }
                    });
                    
                    yPos = (doc as any).lastAutoTable.finalY + 20;
                }
            }
            
            // Logs table
            if (data.logs && data.logs.length > 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Chi Tiết Nhật Ký', 20, yPos);
                yPos += 15;
                
                const logsData = data.logs.map(log => [
                    this.formatDateTime(log.timestamp),
                    log.user_id?.username || 'N/A',
                    this.getModuleLabel(log.module),
                    this.getSeverityLabel(log.severity),
                    log.action,
                    log.ip_address
                ]);
                
                (doc as any).autoTable({
                    head: [['Thời gian', 'Người dùng', 'Module', 'Mức độ', 'Hành động', 'IP']],
                    body: logsData,
                    startY: yPos,
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [44, 62, 80] },
                    columnStyles: {
                        0: { cellWidth: 30 },
                        1: { cellWidth: 25 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 40 },
                        5: { cellWidth: 25 }
                    }
                });
            }
            
            // Footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Trang ${i} / ${pageCount}`,
                    pageWidth - 30,
                    pageHeight - 10
                );
            }
            
            // Save the PDF
            const filename = `bao_cao_${options.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            throw new Error('Lỗi khi xuất báo cáo PDF');
        }
    }
    
    /**
     * Export system logs to Excel
     */
    static async exportToExcel(
        data: SystemLogExportData, 
        options: ExportOptions
    ): Promise<void> {
        try {
            const workbook = XLSX.utils.book_new();
            
            // Summary sheet
            if (data.summary) {
                const summaryData = [
                    ['Báo Cáo', options.title],
                    ['Ngày tạo', new Date().toLocaleString('vi-VN')],
                    ['Khoảng thời gian', options.dateRange ? 
                        `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}` : 
                        'Tất cả'
                    ],
                    [''],
                    ['Tổng Quan', ''],
                    ...Object.entries(data.summary).map(([key, value]) => [key, value])
                ];
                
                const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng Quan');
            }
            
            // Analytics sheet
            if (data.analytics && options.includeAnalytics) {
                const analyticsData = [
                    ['Phân Tích Dữ Liệu', ''],
                    [''],
                    ['Phân Bố Mức Độ Nghiêm Trọng', ''],
                    ['Mức độ', 'Số lượng', 'Tỷ lệ (%)'],
                    ...Object.entries(data.analytics.severityDistribution || {}).map(([severity, count]) => [
                        this.getSeverityLabel(severity),
                        count,
                        ((count as number) / data.analytics.totalLogs * 100).toFixed(1)
                    ]),
                    [''],
                    ['Phân Bố Module', ''],
                    ['Module', 'Số lượng', 'Tỷ lệ (%)'],
                    ...Object.entries(data.analytics.moduleDistribution || {}).map(([module, count]) => [
                        this.getModuleLabel(module),
                        count,
                        ((count as number) / data.analytics.totalLogs * 100).toFixed(1)
                    ])
                ];
                
                const analyticsSheet = XLSX.utils.aoa_to_sheet(analyticsData);
                XLSX.utils.book_append_sheet(workbook, analyticsSheet, 'Phân Tích');
            }
            
            // Logs sheet
            if (data.logs && data.logs.length > 0) {
                const logsData = [
                    ['Thời gian', 'Người dùng', 'Module', 'Mức độ', 'Hành động', 'Chi tiết', 'IP Address'],
                    ...data.logs.map(log => [
                        this.formatDateTime(log.timestamp),
                        log.user_id?.username || 'N/A',
                        this.getModuleLabel(log.module),
                        this.getSeverityLabel(log.severity),
                        log.action,
                        JSON.stringify(log.details),
                        log.ip_address
                    ])
                ];
                
                const logsSheet = XLSX.utils.aoa_to_sheet(logsData);
                
                // Set column widths
                logsSheet['!cols'] = [
                    { wch: 20 }, // Thời gian
                    { wch: 15 }, // Người dùng
                    { wch: 15 }, // Module
                    { wch: 12 }, // Mức độ
                    { wch: 30 }, // Hành động
                    { wch: 50 }, // Chi tiết
                    { wch: 15 }  // IP Address
                ];
                
                XLSX.utils.book_append_sheet(workbook, logsSheet, 'Chi Tiết');
            }
            
            // Save the Excel file
            const filename = `bao_cao_${options.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, filename);
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw new Error('Lỗi khi xuất báo cáo Excel');
        }
    }
    
    /**
     * Export charts to image and include in PDF
     */
    static async exportChartsToPDF(
        chartElements: HTMLElement[], 
        options: ExportOptions
    ): Promise<void> {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Header
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(options.title, pageWidth / 2, 30, { align: 'center' });
            
            if (options.subtitle) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'normal');
                doc.text(options.subtitle, pageWidth / 2, 40, { align: 'center' });
            }
            
            let yPos = 60;
            
            for (let i = 0; i < chartElements.length; i++) {
                const canvas = await html2canvas(chartElements[i], {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 40;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                // Check if we need a new page
                if (yPos + imgHeight > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 20;
            }
            
            const filename = `bieu_do_${options.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
        } catch (error) {
            console.error('Error exporting charts to PDF:', error);
            throw new Error('Lỗi khi xuất biểu đồ');
        }
    }
    
    /**
     * Export analytics dashboard to PDF
     */
    static async exportAnalyticsDashboard(
        analyticsData: any,
        options: ExportOptions
    ): Promise<void> {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Header
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Báo Cáo Thống Kê Hệ Thống', pageWidth / 2, 30, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Khoảng thời gian: ${options.dateRange ? 
                `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}` : 
                'Hôm nay'
            }`, pageWidth / 2, 40, { align: 'center' });
            
            doc.text(`Được tạo: ${new Date().toLocaleString('vi-VN')}`, pageWidth / 2, 50, { align: 'center' });
            
            let yPos = 70;
            
            // Metrics
            if (analyticsData.metrics) {
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Chỉ Số Chính', 20, yPos);
                yPos += 20;
                
                const metricsData = [
                    ['Chỉ số', 'Giá trị', 'Xu hướng'],
                    ['Tổng số log', analyticsData.metrics.totalLogs, ''],
                    ['Log hôm nay', analyticsData.metrics.todayLogs, ''],
                    ['Log tuần này', analyticsData.metrics.weekLogs, ''],
                    ['Log tháng này', analyticsData.metrics.monthLogs, '']
                ];
                
                (doc as any).autoTable({
                    head: [metricsData[0]],
                    body: metricsData.slice(1),
                    startY: yPos,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [52, 152, 219] }
                });
                
                yPos = (doc as any).lastAutoTable.finalY + 20;
            }
            
            // Severity distribution
            if (analyticsData.severityDistribution) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Phân Bố Mức Độ Nghiêm Trọng', 20, yPos);
                yPos += 15;
                
                const severityData = Object.entries(analyticsData.severityDistribution).map(([severity, count]) => [
                    this.getSeverityLabel(severity),
                    count,
                    `${((count as number) / analyticsData.totalLogs * 100).toFixed(1)}%`
                ]);
                
                (doc as any).autoTable({
                    head: [['Mức độ', 'Số lượng', 'Tỷ lệ']],
                    body: severityData,
                    startY: yPos,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [231, 76, 60] }
                });
                
                yPos = (doc as any).lastAutoTable.finalY + 20;
            }
            
            // Module distribution
            if (analyticsData.moduleDistribution) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Phân Bố Module', 20, yPos);
                yPos += 15;
                
                const moduleData = Object.entries(analyticsData.moduleDistribution).map(([module, count]) => [
                    this.getModuleLabel(module),
                    count,
                    `${((count as number) / analyticsData.totalLogs * 100).toFixed(1)}%`
                ]);
                
                (doc as any).autoTable({
                    head: [['Module', 'Số lượng', 'Tỷ lệ']],
                    body: moduleData,
                    startY: yPos,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [46, 204, 113] }
                });
                
                yPos = (doc as any).lastAutoTable.finalY + 20;
            }
            
            // Top users
            if (analyticsData.topUsers) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Top Người Dùng Hoạt Động', 20, yPos);
                yPos += 15;
                
                const usersData = analyticsData.topUsers.map((user: any, index: number) => [
                    index + 1,
                    user.user_name || user.username || 'N/A',
                    user.count
                ]);
                
                (doc as any).autoTable({
                    head: [['Xếp hạng', 'Người dùng', 'Số lượng']],
                    body: usersData,
                    startY: yPos,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [155, 89, 182] }
                });
            }
            
            const filename = `bao_cao_thong_ke_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
        } catch (error) {
            console.error('Error exporting analytics dashboard:', error);
            throw new Error('Lỗi khi xuất báo cáo thống kê');
        }
    }
    
    /**
     * Helper methods
     */
    private static formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }
    
    private static formatDateTime(dateString: string): string {
        return new Date(dateString).toLocaleString('vi-VN');
    }
    
    private static getSeverityLabel(severity: string): string {
        const labels: { [key: string]: string } = {
            'info': 'Thông tin',
            'success': 'Thành công',
            'warning': 'Cảnh báo',
            'error': 'Lỗi',
            'critical': 'Nghiêm trọng'
        };
        return labels[severity] || severity;
    }
    
    private static getModuleLabel(module: string): string {
        const labels: { [key: string]: string } = {
            'auth': 'Xác thực',
            'user': 'Người dùng',
            'role': 'Vai trò',
            'permission': 'Quyền hạn',
            'system': 'Hệ thống',
            'notification': 'Thông báo',
            'log': 'Nhật ký',
            'dashboard': 'Bảng điều khiển',
            'settings': 'Cài đặt',
            'profile': 'Hồ sơ',
            'training': 'Đào tạo',
            'safety': 'An toàn',
            'ppe': 'PPE',
            'project': 'Dự án',
            'incident': 'Sự cố',
            'audit': 'Kiểm toán'
        };
        return labels[module] || module;
    }
}

export default ReportExportService;
