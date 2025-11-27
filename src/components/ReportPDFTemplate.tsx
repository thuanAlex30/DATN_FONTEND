import React from 'react';

interface ReportPDFTemplateProps {
  reportData: any;
  reportType: string;
}

const ReportPDFTemplate: React.FC<ReportPDFTemplateProps> = ({ reportData, reportType }) => {
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'inventory':
        return 'BÁO CÁO TỒN KHO THIẾT BỊ BẢO HỘ LAO ĐỘNG';
      case 'usage':
        return 'BÁO CÁO PHÂN CÔNG THIẾT BỊ BẢO HỘ LAO ĐỘNG';
      case 'maintenance':
        return 'BÁO CÁO BẢO TRÌ THIẾT BỊ BẢO HỘ LAO ĐỘNG';
      default:
        return 'BÁO CÁO HỆ THỐNG QUẢN LÝ AN TOÀN LAO ĐỘNG';
    }
  };

  const getReportContent = () => {
    switch (reportType) {
      case 'inventory':
        return (
          <div className="inventory-content">
            <div className="summary-section">
              <h3>TỔNG QUAN TỒN KHO</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Tổng số danh mục:</span>
                  <span className="value">{reportData.total_categories || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Tổng số thiết bị:</span>
                  <span className="value">{reportData.total_devices || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Thiết bị có sẵn:</span>
                  <span className="value">{reportData.available_devices || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Thiết bị đã phát:</span>
                  <span className="value">{reportData.issued_devices || 0}</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ và thống kê chi tiết */}
            <div className="charts-section">
              <h3>BIỂU ĐỒ VÀ THỐNG KÊ</h3>
              
              {/* Biểu đồ phân bố theo danh mục */}
              <div className="chart-container">
                <h4>Phân bố thiết bị theo danh mục</h4>
                <div className="chart-placeholder">
                  {reportData.categories && reportData.categories.map((category: any, index: number) => {
                    const percentage = reportData.total_devices > 0 ? 
                      Math.round((category.total_quantity || 0) / reportData.total_devices * 100) : 0;
                    return (
                      <div key={index} className="chart-bar">
                        <div className="bar-label">{category.name}</div>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <span className="bar-value">{category.total_quantity || 0} ({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thống kê tình trạng */}
              <div className="stats-container">
                <h4>Thống kê tình trạng thiết bị</h4>
                <div className="stats-grid">
                  <div className="stat-card available">
                    <div className="stat-icon">✓</div>
                    <div className="stat-content">
                      <div className="stat-number">{reportData.available_devices || 0}</div>
                      <div className="stat-label">Có sẵn</div>
                      <div className="stat-percentage">
                        {reportData.total_devices > 0 ? 
                          Math.round((reportData.available_devices || 0) / reportData.total_devices * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="stat-card issued">
                    <div className="stat-icon">📤</div>
                    <div className="stat-content">
                      <div className="stat-number">{reportData.issued_devices || 0}</div>
                      <div className="stat-label">Đã phát</div>
                      <div className="stat-percentage">
                        {reportData.total_devices > 0 ? 
                          Math.round((reportData.issued_devices || 0) / reportData.total_devices * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="stat-card maintenance">
                    <div className="stat-icon">🔧</div>
                    <div className="stat-content">
                      <div className="stat-number">{reportData.maintenance_count || 0}</div>
                      <div className="stat-label">Cần bảo trì</div>
                      <div className="stat-percentage">
                        {reportData.total_devices > 0 ? 
                          Math.round((reportData.maintenance_count || 0) / reportData.total_devices * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="stat-card expired">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                      <div className="stat-number">{reportData.expired_count || 0}</div>
                      <div className="stat-label">Hết hạn</div>
                      <div className="stat-percentage">
                        {reportData.total_devices > 0 ? 
                          Math.round((reportData.expired_count || 0) / reportData.total_devices * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phân tích xu hướng */}
              <div className="trend-analysis">
                <h4>Phân tích xu hướng</h4>
                <div className="trend-grid">
                  <div className="trend-item">
                    <div className="trend-label">Tỷ lệ sử dụng</div>
                    <div className="trend-value">
                      {reportData.total_devices > 0 ? 
                        Math.round((reportData.issued_devices || 0) / reportData.total_devices * 100) : 0}%
                    </div>
                    <div className="trend-status">
                      {reportData.total_devices > 0 && (reportData.issued_devices || 0) / reportData.total_devices > 0.8 ? 
                        'Cao' : reportData.total_devices > 0 && (reportData.issued_devices || 0) / reportData.total_devices > 0.5 ? 
                        'Trung bình' : 'Thấp'}
                    </div>
                  </div>
                  <div className="trend-item">
                    <div className="trend-label">Hiệu quả quản lý</div>
                    <div className="trend-value">
                      {reportData.total_devices > 0 ? 
                        Math.round((reportData.available_devices || 0) / reportData.total_devices * 100) : 0}%
                    </div>
                    <div className="trend-status">
                      {reportData.total_devices > 0 && (reportData.available_devices || 0) / reportData.total_devices > 0.3 ? 
                        'Tốt' : 'Cần cải thiện'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {reportData.categories && reportData.categories.length > 0 && (
              <div className="details-section">
                <h3>CHI TIẾT THEO DANH MỤC</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên danh mục</th>
                      <th>Số lượng</th>
                      <th>Đã phát</th>
                      <th>Còn lại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.categories.map((category: any, index: number) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{category.name}</td>
                        <td>{category.total_quantity || 0}</td>
                        <td>{category.issued_quantity || 0}</td>
                        <td>{category.remaining_quantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'usage':
        return (
          <div className="usage-content">
            <div className="summary-section">
              <h3>TỔNG QUAN PHÂN CÔNG</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Tổng số phân công:</span>
                  <span className="value">{reportData.total_assignments || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Phân công đang hoạt động:</span>
                  <span className="value">{reportData.active_assignments || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Phân công đã hoàn thành:</span>
                  <span className="value">{reportData.completed_assignments || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Phân công quá hạn:</span>
                  <span className="value">{reportData.overdue_assignments || 0}</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ và thống kê cho báo cáo sử dụng */}
            <div className="charts-section">
              <h3>BIỂU ĐỒ VÀ THỐNG KÊ</h3>
              
              {/* Biểu đồ trạng thái phân công */}
              <div className="chart-container">
                <h4>Phân bố trạng thái phân công</h4>
                <div className="pie-chart-placeholder">
                  <div className="pie-segment active">
                    <div className="segment-label">Đang hoạt động</div>
                    <div className="segment-value">{reportData.active_assignments || 0}</div>
                    <div className="segment-percentage">
                      {reportData.total_assignments > 0 ? 
                        Math.round((reportData.active_assignments || 0) / reportData.total_assignments * 100) : 0}%
                    </div>
                  </div>
                  <div className="pie-segment completed">
                    <div className="segment-label">Đã hoàn thành</div>
                    <div className="segment-value">{reportData.completed_assignments || 0}</div>
                    <div className="segment-percentage">
                      {reportData.total_assignments > 0 ? 
                        Math.round((reportData.completed_assignments || 0) / reportData.total_assignments * 100) : 0}%
                    </div>
                  </div>
                  <div className="pie-segment overdue">
                    <div className="segment-label">Quá hạn</div>
                    <div className="segment-value">{reportData.overdue_assignments || 0}</div>
                    <div className="segment-percentage">
                      {reportData.total_assignments > 0 ? 
                        Math.round((reportData.overdue_assignments || 0) / reportData.total_assignments * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Thống kê hiệu suất */}
              <div className="performance-stats">
                <h4>Thống kê hiệu suất</h4>
                <div className="performance-grid">
                  <div className="performance-item">
                    <div className="performance-label">Tỷ lệ hoàn thành</div>
                    <div className="performance-value">
                      {reportData.total_assignments > 0 ? 
                        Math.round((reportData.completed_assignments || 0) / reportData.total_assignments * 100) : 0}%
                    </div>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill" 
                        style={{ 
                          width: `${reportData.total_assignments > 0 ? 
                            Math.round((reportData.completed_assignments || 0) / reportData.total_assignments * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="performance-item">
                    <div className="performance-label">Tỷ lệ quá hạn</div>
                    <div className="performance-value">
                      {reportData.total_assignments > 0 ? 
                        Math.round((reportData.overdue_assignments || 0) / reportData.total_assignments * 100) : 0}%
                    </div>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill overdue" 
                        style={{ 
                          width: `${reportData.total_assignments > 0 ? 
                            Math.round((reportData.overdue_assignments || 0) / reportData.total_assignments * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {reportData.assignments && reportData.assignments.length > 0 && (
              <div className="details-section">
                <h3>CHI TIẾT PHÂN CÔNG</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Người được phân công</th>
                      <th>Thiết bị</th>
                      <th>Số lượng</th>
                      <th>Ngày bắt đầu</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.assignments.slice(0, 20).map((assignment: any, index: number) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{assignment.user_name || 'N/A'}</td>
                        <td>{assignment.item_name || 'N/A'}</td>
                        <td>{assignment.quantity || 0}</td>
                        <td>{assignment.start_date ? new Date(assignment.start_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                        <td>{assignment.status || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.assignments.length > 20 && (
                  <p className="note">* Chỉ hiển thị 20 bản ghi đầu tiên</p>
                )}
              </div>
            )}
          </div>
        );

      case 'maintenance':
        return (
          <div className="maintenance-content">
            <div className="summary-section">
              <h3>TỔNG QUAN BẢO TRÌ</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Tổng số bảo trì:</span>
                  <span className="value">{reportData.total_maintenance || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Bảo trì đã hoàn thành:</span>
                  <span className="value">{reportData.completed_maintenance || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Bảo trì đang chờ:</span>
                  <span className="value">{reportData.pending_maintenance || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Bảo trì quá hạn:</span>
                  <span className="value">{reportData.overdue_maintenance || 0}</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ và thống kê cho báo cáo bảo trì */}
            <div className="charts-section">
              <h3>BIỂU ĐỒ VÀ THỐNG KÊ</h3>
              
              {/* Biểu đồ loại bảo trì */}
              <div className="chart-container">
                <h4>Phân bố loại bảo trì</h4>
                <div className="maintenance-chart">
                  <div className="maintenance-type">
                    <div className="type-label">Bảo trì định kỳ</div>
                    <div className="type-bar">
                      <div className="type-fill scheduled" style={{ width: '60%' }}></div>
                      <span className="type-value">60%</span>
                    </div>
                  </div>
                  <div className="maintenance-type">
                    <div className="type-label">Bảo trì khẩn cấp</div>
                    <div className="type-bar">
                      <div className="type-fill emergency" style={{ width: '25%' }}></div>
                      <span className="type-value">25%</span>
                    </div>
                  </div>
                  <div className="maintenance-type">
                    <div className="type-label">Bảo trì sửa chữa</div>
                    <div className="type-bar">
                      <div className="type-fill repair" style={{ width: '15%' }}></div>
                      <span className="type-value">15%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thống kê hiệu quả bảo trì */}
              <div className="maintenance-stats">
                <h4>Thống kê hiệu quả bảo trì</h4>
                <div className="maintenance-grid">
                  <div className="maintenance-card">
                    <div className="card-icon">✅</div>
                    <div className="card-content">
                      <div className="card-number">{reportData.completed_maintenance || 0}</div>
                      <div className="card-label">Đã hoàn thành</div>
                      <div className="card-percentage">
                        {reportData.total_maintenance > 0 ? 
                          Math.round((reportData.completed_maintenance || 0) / reportData.total_maintenance * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="maintenance-card">
                    <div className="card-icon">⏳</div>
                    <div className="card-content">
                      <div className="card-number">{reportData.pending_maintenance || 0}</div>
                      <div className="card-label">Đang chờ</div>
                      <div className="card-percentage">
                        {reportData.total_maintenance > 0 ? 
                          Math.round((reportData.pending_maintenance || 0) / reportData.total_maintenance * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="maintenance-card">
                    <div className="card-icon">⚠️</div>
                    <div className="card-content">
                      <div className="card-number">{reportData.overdue_maintenance || 0}</div>
                      <div className="card-label">Quá hạn</div>
                      <div className="card-percentage">
                        {reportData.total_maintenance > 0 ? 
                          Math.round((reportData.overdue_maintenance || 0) / reportData.total_maintenance * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {reportData.maintenance_records && reportData.maintenance_records.length > 0 && (
              <div className="details-section">
                <h3>CHI TIẾT BẢO TRÌ</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Thiết bị</th>
                      <th>Loại bảo trì</th>
                      <th>Ngày bảo trì</th>
                      <th>Trạng thái</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.maintenance_records.slice(0, 20).map((record: any, index: number) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{record.item_name || 'N/A'}</td>
                        <td>{record.maintenance_type || 'N/A'}</td>
                        <td>{record.maintenance_date ? new Date(record.maintenance_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                        <td>{record.status || 'N/A'}</td>
                        <td>{record.notes || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.maintenance_records.length > 20 && (
                  <p className="note">* Chỉ hiển thị 20 bản ghi đầu tiên</p>
                )}
              </div>
            )}
          </div>
        );

      default:
        return <div>Không có dữ liệu báo cáo</div>;
    }
  };

  return (
    <div className="pdf-template" style={{
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.4',
      color: '#333',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div className="header" style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #1890ff',
        paddingBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1890ff',
          margin: '0 0 10px 0'
        }}>
          {getReportTitle()}
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '0'
        }}>
          Ngày tạo báo cáo: {getCurrentDate()}
        </p>
      </div>

      {/* Content */}
      <div className="content">
        {getReportContent()}
      </div>

      {/* Footer */}
      <div className="footer" style={{
        marginTop: '40px',
        textAlign: 'center',
        fontSize: '10px',
        color: '#999',
        borderTop: '1px solid #eee',
        paddingTop: '10px'
      }}>
        <p>Hệ thống quản lý an toàn lao động - SafetyPro</p>
        <p>Trang 1/1</p>
      </div>

      <style>{`
        .summary-section {
          margin-bottom: 30px;
        }
        
        .summary-section h3 {
          font-size: 16px;
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #1890ff;
        }
        
        .summary-item .label {
          font-weight: 500;
          color: #333;
        }
        
        .summary-item .value {
          font-weight: bold;
          color: #1890ff;
          font-size: 14px;
        }
        
        .details-section {
          margin-top: 30px;
        }
        
        .details-section h3 {
          font-size: 16px;
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        
        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .report-table th,
        .report-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        
        .report-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #333;
        }
        
        .report-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .note {
          font-style: italic;
          color: #666;
          font-size: 10px;
          margin-top: 10px;
        }

        /* Charts and Statistics Styles */
        .charts-section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        
        .charts-section h3 {
          font-size: 16px;
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 20px;
          border-bottom: 2px solid #1890ff;
          padding-bottom: 10px;
        }
        
        .charts-section h4 {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
        }

        /* Chart Container */
        .chart-container {
          margin-bottom: 25px;
          padding: 15px;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          background-color: #fafafa;
        }

        /* Bar Chart Styles */
        .chart-placeholder {
          margin-top: 15px;
        }
        
        .chart-bar {
          margin-bottom: 12px;
        }
        
        .bar-label {
          font-size: 11px;
          font-weight: 500;
          color: #333;
          margin-bottom: 5px;
        }
        
        .bar-container {
          position: relative;
          height: 20px;
          background-color: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #1890ff, #40a9ff);
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        
        .bar-value {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          font-weight: bold;
          color: #333;
        }

        /* Stats Grid */
        .stats-container {
          margin-bottom: 25px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 15px;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid;
        }
        
        .stat-card.available {
          background-color: #f6ffed;
          border-left-color: #52c41a;
        }
        
        .stat-card.issued {
          background-color: #e6f7ff;
          border-left-color: #1890ff;
        }
        
        .stat-card.maintenance {
          background-color: #fff7e6;
          border-left-color: #fa8c16;
        }
        
        .stat-card.expired {
          background-color: #fff2f0;
          border-left-color: #ff4d4f;
        }
        
        .stat-icon {
          font-size: 24px;
          margin-right: 15px;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-number {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 2px;
        }
        
        .stat-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .stat-percentage {
          font-size: 10px;
          color: #999;
        }

        /* Trend Analysis */
        .trend-analysis {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 6px;
        }
        
        .trend-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 15px;
        }
        
        .trend-item {
          text-align: center;
          padding: 15px;
          background-color: white;
          border-radius: 6px;
          border: 1px solid #e8e8e8;
        }
        
        .trend-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .trend-value {
          font-size: 20px;
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 5px;
        }
        
        .trend-status {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }
        
        .trend-status:contains('Cao'), .trend-status:contains('Tốt') {
          background-color: #f6ffed;
          color: #52c41a;
        }
        
        .trend-status:contains('Trung bình') {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        
        .trend-status:contains('Thấp'), .trend-status:contains('Cần cải thiện') {
          background-color: #fff2f0;
          color: #ff4d4f;
        }

        /* Pie Chart Styles */
        .pie-chart-placeholder {
          display: flex;
          justify-content: space-around;
          margin-top: 15px;
        }
        
        .pie-segment {
          text-align: center;
          padding: 15px;
          border-radius: 8px;
          min-width: 80px;
        }
        
        .pie-segment.active {
          background-color: #e6f7ff;
          border: 2px solid #1890ff;
        }
        
        .pie-segment.completed {
          background-color: #f6ffed;
          border: 2px solid #52c41a;
        }
        
        .pie-segment.overdue {
          background-color: #fff2f0;
          border: 2px solid #ff4d4f;
        }
        
        .segment-label {
          font-size: 10px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .segment-value {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 2px;
        }
        
        .segment-percentage {
          font-size: 10px;
          color: #999;
        }

        /* Performance Stats */
        .performance-stats {
          margin-top: 20px;
        }
        
        .performance-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 15px;
        }
        
        .performance-item {
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e8e8e8;
        }
        
        .performance-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .performance-value {
          font-size: 18px;
          font-weight: bold;
          color: #1890ff;
          margin-bottom: 8px;
        }
        
        .performance-bar {
          height: 8px;
          background-color: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .performance-fill {
          height: 100%;
          background: linear-gradient(90deg, #52c41a, #73d13d);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .performance-fill.overdue {
          background: linear-gradient(90deg, #ff4d4f, #ff7875);
        }

        /* Maintenance Chart */
        .maintenance-chart {
          margin-top: 15px;
        }
        
        .maintenance-type {
          margin-bottom: 12px;
        }
        
        .type-label {
          font-size: 11px;
          color: #333;
          margin-bottom: 5px;
        }
        
        .type-bar {
          position: relative;
          height: 16px;
          background-color: #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .type-fill {
          height: 100%;
          border-radius: 8px;
        }
        
        .type-fill.scheduled {
          background: linear-gradient(90deg, #52c41a, #73d13d);
        }
        
        .type-fill.emergency {
          background: linear-gradient(90deg, #ff4d4f, #ff7875);
        }
        
        .type-fill.repair {
          background: linear-gradient(90deg, #fa8c16, #ffa940);
        }
        
        .type-value {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          font-weight: bold;
          color: #333;
        }

        /* Maintenance Stats */
        .maintenance-stats {
          margin-top: 20px;
        }
        
        .maintenance-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 15px;
        }
        
        .maintenance-card {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e8e8e8;
          background-color: white;
        }
        
        .card-icon {
          font-size: 24px;
          margin-right: 15px;
        }
        
        .card-content {
          flex: 1;
        }
        
        .card-number {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 2px;
        }
        
        .card-label {
          font-size: 10px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .card-percentage {
          font-size: 9px;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default ReportPDFTemplate;
