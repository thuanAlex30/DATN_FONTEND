import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './PPE.css';
import * as ppeService from '../../../services/ppeService';
import type { PPEIssuance } from '../../../services/ppeService';
import type { RootState } from '../../../store';

const EmployeePPE: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('view');
  const [ppeIssuances, setPpeIssuances] = useState<PPEIssuance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<PPEIssuance | null>(null);
  
  // Form states
  const [returnForm, setReturnForm] = useState({
    return_date: new Date().toISOString().split('T')[0],
    return_condition: 'good' as 'good' | 'damaged' | 'worn',
    notes: ''
  });
  
  const [reportForm, setReportForm] = useState({
    report_type: 'damage' as 'damage' | 'replacement' | 'lost',
    description: '',
    severity: 'low' as 'low' | 'medium' | 'high',
    reported_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadUserPPE();
  }, []);

  const loadUserPPE = async () => {
    setLoading(true);
    try {
      const data = await ppeService.getMyPPEIssuances();
      setPpeIssuances(data);
    } catch (err) {
      console.error('Error loading user PPE:', err);
      setError('Không thể tải danh sách PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnPPE = async () => {
    if (!selectedIssuance) return;
    
    setLoading(true);
    try {
      await ppeService.returnPPEIssuanceEmployee(selectedIssuance._id, returnForm);
      await loadUserPPE(); // Reload data
      setShowReturnModal(false);
      setSelectedIssuance(null);
      setReturnForm({
        return_date: new Date().toISOString().split('T')[0],
        return_condition: 'good' as 'good' | 'damaged' | 'worn',
        notes: ''
      });
      setError(null);
    } catch (err) {
      console.error('Error returning PPE:', err);
      setError('Có lỗi khi trả PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleReportPPE = async () => {
    if (!selectedIssuance) return;
    
    setLoading(true);
    try {
      // Use the new employee-specific report API
      const reportData = {
        report_type: reportForm.report_type,
        description: reportForm.description,
        severity: reportForm.severity,
        reported_date: reportForm.reported_date
      };
      
      await ppeService.reportPPEIssuanceEmployee(selectedIssuance._id, reportData);
      await loadUserPPE(); // Reload data
      setShowReportModal(false);
      setSelectedIssuance(null);
      setReportForm({
        report_type: 'damage' as 'damage' | 'replacement' | 'lost',
        description: '',
        severity: 'low' as 'low' | 'medium' | 'high',
        reported_date: new Date().toISOString().split('T')[0]
      });
      setError(null);
    } catch (err) {
      console.error('Error reporting PPE:', err);
      setError('Có lỗi khi báo cáo PPE');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      'issued': 'Đang sử dụng',
      'returned': 'Đã trả',
      'overdue': 'Quá hạn',
      'damaged': 'Hư hại',
      'replacement_needed': 'Cần thay thế'
    };
    return labels[status] || 'Không xác định';
  };

  const getStatusClass = (status: string): string => {
    const classes: { [key: string]: string } = {
      'issued': 'status-issued',
      'returned': 'status-returned',
      'overdue': 'status-overdue',
      'damaged': 'status-damaged',
      'replacement_needed': 'status-replacement'
    };
    return classes[status] || 'status-unknown';
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  const isOverdue = (expectedReturnDate: string): boolean => {
    return new Date(expectedReturnDate) < new Date();
  };

  const getActiveIssuances = () => {
    return ppeIssuances.filter(issuance => 
      issuance.status === 'issued' || 
      issuance.status === 'overdue' ||
      issuance.status === 'damaged' ||
      issuance.status === 'replacement_needed'
    );
  };

  const getReturnedIssuances = () => {
    return ppeIssuances.filter(issuance => issuance.status === 'returned');
  };

  return (
    <div className="employee-ppe-container">
      <div className="ppe-content">
        {/* Header */}
        <div className="header">
          <div>
            <h1>
              <i className="fas fa-hard-hat"></i>
              Quản lý PPE cá nhân
            </h1>
            <div className="breadcrumb">
              <a href="/home">
                <i className="fas fa-home"></i>
                Trang chủ
              </a>
              <i className="fas fa-chevron-right"></i>
              <span>PPE cá nhân</span>
            </div>
          </div>
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={loadUserPPE}
              disabled={loading}
            >
              <i className="fas fa-sync-alt"></i>
              Làm mới
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
            <button onClick={() => setError(null)} className="alert-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <div className="tab-nav">
            <button 
              className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              <i className="fas fa-eye"></i>
              Xem PPE
            </button>
            <button 
              className={`tab-button ${activeTab === 'return' ? 'active' : ''}`}
              onClick={() => setActiveTab('return')}
            >
              <i className="fas fa-undo"></i>
              Trả PPE
            </button>
            <button 
              className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
              onClick={() => setActiveTab('report')}
            >
              <i className="fas fa-exclamation-triangle"></i>
              Báo cáo
            </button>
          </div>

          {/* View PPE Tab */}
          {activeTab === 'view' && (
            <div className="tab-content active">
              <div className="section-header">
                <h2>PPE đang sử dụng</h2>
              </div>

              {/* Statistics */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-hard-hat"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{getActiveIssuances().length}</div>
                    <div className="stat-label">Đang sử dụng</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{getReturnedIssuances().length}</div>
                    <div className="stat-label">Đã trả</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {ppeIssuances.filter(issuance => 
                        issuance.status === 'overdue' || 
                        isOverdue(issuance.expected_return_date)
                      ).length}
                    </div>
                    <div className="stat-label">Quá hạn</div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang tải dữ liệu...</span>
                </div>
              ) : (
                <div className="ppe-grid">
                  {getActiveIssuances().map(issuance => {
                    const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                      issuance.item_id : null;
                    const isOverdueItem = isOverdue(issuance.expected_return_date);
                    
                    return (
                      <div key={issuance._id} className="ppe-card">
                        <div className="card-header">
                          <div className="card-title">
                            {item?.item_name || 'Không xác định'}
                          </div>
                          <div className="ppe-icon">
                            <i className="fas fa-shield-alt"></i>
                          </div>
                        </div>
                        
                        <div className="card-body">
                          <div className="ppe-info">
                            <div className="info-item">
                              <i className="fas fa-barcode"></i>
                              <span>{item?.item_code || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                              <i className="fas fa-hashtag"></i>
                              <span>Số lượng: {issuance.quantity}</span>
                            </div>
                            <div className="info-item">
                              <i className="fas fa-calendar-plus"></i>
                              <span>Ngày phát: {formatDateTime(issuance.issued_date)}</span>
                            </div>
                            <div className="info-item">
                              <i className="fas fa-calendar-check"></i>
                              <span>Hạn trả: {formatDateTime(issuance.expected_return_date)}</span>
                            </div>
                          </div>
                          
                          <div className="ppe-status">
                            <span className={`status-badge ${getStatusClass(issuance.status)} ${isOverdueItem ? 'overdue' : ''}`}>
                              {getStatusLabel(issuance.status)}
                              {isOverdueItem && ' (Quá hạn)'}
                            </span>
                          </div>
                          
                          <div className="card-actions">
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => {
                                setSelectedIssuance(issuance);
                                setShowReturnModal(true);
                              }}
                            >
                              <i className="fas fa-undo"></i> Trả PPE
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setSelectedIssuance(issuance);
                                setShowReportModal(true);
                              }}
                            >
                              <i className="fas fa-exclamation-triangle"></i> Báo cáo
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {getActiveIssuances().length === 0 && (
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <h4>Chưa có PPE</h4>
                      <p>Bạn chưa được phát PPE nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Return PPE Tab */}
          {activeTab === 'return' && (
            <div className="tab-content active">
              <div className="section-header">
                <h2>Trả PPE</h2>
                <p>Chọn PPE cần trả và điền thông tin trả</p>
              </div>

              {loading ? (
                <div className="loading-container">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang tải dữ liệu...</span>
                </div>
              ) : (
                <div className="ppe-grid">
                  {getActiveIssuances().map(issuance => {
                    const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                      issuance.item_id : null;
                    
                    return (
                      <div key={issuance._id} className="ppe-card return-card">
                        <div className="card-header">
                          <div className="card-title">
                            {item?.item_name || 'Không xác định'}
                          </div>
                          <div className="ppe-icon">
                            <i className="fas fa-shield-alt"></i>
                          </div>
                        </div>
                        
                        <div className="card-body">
                          <div className="ppe-info">
                            <div className="info-item">
                              <i className="fas fa-barcode"></i>
                              <span>{item?.item_code || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                              <i className="fas fa-hashtag"></i>
                              <span>Số lượng: {issuance.quantity}</span>
                            </div>
                            <div className="info-item">
                              <i className="fas fa-calendar-check"></i>
                              <span>Hạn trả: {formatDateTime(issuance.expected_return_date)}</span>
                            </div>
                          </div>
                          
                          <div className="card-actions">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedIssuance(issuance);
                                setShowReturnModal(true);
                              }}
                            >
                              <i className="fas fa-undo"></i> Trả PPE này
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {getActiveIssuances().length === 0 && (
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <h4>Không có PPE để trả</h4>
                      <p>Bạn không có PPE nào đang sử dụng</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Report PPE Tab */}
          {activeTab === 'report' && (
            <div className="tab-content active">
              <div className="section-header">
                <h2>Báo cáo PPE</h2>
                <p>Báo cáo hư hại hoặc cần thay thế PPE</p>
              </div>

              {loading ? (
                <div className="loading-container">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang tải dữ liệu...</span>
                </div>
              ) : (
                <div className="ppe-grid">
                  {getActiveIssuances().map(issuance => {
                    const item = typeof issuance.item_id === 'object' && issuance.item_id ? 
                      issuance.item_id : null;
                    
                    return (
                      <div key={issuance._id} className="ppe-card report-card">
                        <div className="card-header">
                          <div className="card-title">
                            {item?.item_name || 'Không xác định'}
                          </div>
                          <div className="ppe-icon">
                            <i className="fas fa-shield-alt"></i>
                          </div>
                        </div>
                        
                        <div className="card-body">
                          <div className="ppe-info">
                            <div className="info-item">
                              <i className="fas fa-barcode"></i>
                              <span>{item?.item_code || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                              <i className="fas fa-hashtag"></i>
                              <span>Số lượng: {issuance.quantity}</span>
                            </div>
                            <div className="info-item">
                              <i className="fas fa-calendar-check"></i>
                              <span>Hạn trả: {formatDateTime(issuance.expected_return_date)}</span>
                            </div>
                          </div>
                          
                          <div className="card-actions">
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setSelectedIssuance(issuance);
                                setShowReportModal(true);
                              }}
                            >
                              <i className="fas fa-exclamation-triangle"></i> Báo cáo vấn đề
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {getActiveIssuances().length === 0 && (
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <h4>Không có PPE để báo cáo</h4>
                      <p>Bạn không có PPE nào đang sử dụng</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Return PPE Modal */}
      {showReturnModal && selectedIssuance && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Trả PPE</h3>
              <button onClick={() => setShowReturnModal(false)} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleReturnPPE();
            }}>
              <div className="form-group">
                <label className="form-label">Thiết bị</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={typeof selectedIssuance.item_id === 'object' && selectedIssuance.item_id ? 
                    selectedIssuance.item_id.item_name : 'Không xác định'}
                  disabled
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Ngày trả</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={returnForm.return_date}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, return_date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tình trạng khi trả</label>
                <select 
                  className="form-select" 
                  value={returnForm.return_condition}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, return_condition: e.target.value as 'good' | 'damaged' | 'worn' }))}
                  required
                >
                  <option value="good">Tốt</option>
                  <option value="damaged">Hư hại</option>
                  <option value="worn">Mòn</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <textarea 
                  className="form-textarea" 
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú về tình trạng PPE khi trả..."
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowReturnModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang trả...' : 'Trả PPE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report PPE Modal */}
      {showReportModal && selectedIssuance && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Báo cáo PPE</h3>
              <button onClick={() => setShowReportModal(false)} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleReportPPE();
            }}>
              <div className="form-group">
                <label className="form-label">Thiết bị</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={typeof selectedIssuance.item_id === 'object' && selectedIssuance.item_id ? 
                    selectedIssuance.item_id.item_name : 'Không xác định'}
                  disabled
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Loại báo cáo</label>
                <select 
                  className="form-select" 
                  value={reportForm.report_type}
                  onChange={(e) => setReportForm(prev => ({ ...prev, report_type: e.target.value as 'damage' | 'replacement' | 'lost' }))}
                  required
                >
                  <option value="damage">Hư hại</option>
                  <option value="replacement">Cần thay thế</option>
                  <option value="lost">Mất</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Mức độ nghiêm trọng</label>
                <select 
                  className="form-select" 
                  value={reportForm.severity}
                  onChange={(e) => setReportForm(prev => ({ ...prev, severity: e.target.value as 'low' | 'medium' | 'high' }))}
                  required
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Mô tả chi tiết</label>
                <textarea 
                  className="form-textarea" 
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về vấn đề với PPE..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Ngày báo cáo</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={reportForm.reported_date}
                  onChange={(e) => setReportForm(prev => ({ ...prev, reported_date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-danger" disabled={loading}>
                  {loading ? 'Đang báo cáo...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePPE;
