import React, { useState } from 'react';
import './PPEManagement.css';

// Types
interface PPECategory {
  category_id: number;
  category_name: string;
  description: string;
  lifespan_months: number;
}

interface Site {
  site_id: number;
  site_name: string;
  address: string;
  is_active: boolean;
}

interface PPEItem {
  item_id: number;
  category_id: number;
  item_code: string;
  item_name: string;
  brand?: string;
  model?: string;
  reorder_level: number;
}

interface PPEInventory {
  inventory_id: number;
  item_id: number;
  site_id: number;
  quantity_available: number;
  quantity_allocated: number;
  last_updated: string;
}

interface User {
  user_id: number;
  full_name: string;
  email: string;
  department: string;
}

interface PPEIssuance {
  issuance_id: number;
  user_id: number;
  item_id: number;
  quantity: number;
  issued_date: string;
  expected_return_date: string;
  issued_by: number;
  status: 'issued' | 'returned' | 'overdue';
  actual_return_date?: string;
}

const PPEManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [showModal, setShowModal] = useState<string | null>(null);
  
  // Sample data
  const ppeCategories: PPECategory[] = [
    { category_id: 1, category_name: "Bảo vệ đầu", description: "Nón bảo hộ, mũ cứng", lifespan_months: 12 },
    { category_id: 2, category_name: "Bảo vệ mắt", description: "Kính bảo hộ, mặt nạ", lifespan_months: 6 },
    { category_id: 3, category_name: "Bảo vệ hô hấp", description: "Khẩu trang, mặt nạ phòng độc", lifespan_months: 1 },
    { category_id: 4, category_name: "Bảo vệ chân tay", description: "Găng tay, giày bảo hộ", lifespan_months: 3 }
  ];

  const sites: Site[] = [
    { site_id: 1, site_name: "Công trường A", address: "123 Đường ABC, Quận 1", is_active: true },
    { site_id: 2, site_name: "Công trường B", address: "456 Đường XYZ, Quận 2", is_active: true },
    { site_id: 3, site_name: "Kho trung tâm", address: "789 Đường DEF, Quận 3", is_active: true }
  ];

  const ppeItems: PPEItem[] = [
    {
      item_id: 1,
      category_id: 1,
      item_code: "HELMET-001",
      item_name: "Nón bảo hộ trắng",
      brand: "3M",
      model: "H-700",
      reorder_level: 20
    },
    {
      item_id: 2,
      category_id: 1,
      item_code: "HELMET-002", 
      item_name: "Nón bảo hộ vàng",
      brand: "MSA",
      model: "V-Gard",
      reorder_level: 15
    },
    {
      item_id: 3,
      category_id: 2,
      item_code: "GLASS-001",
      item_name: "Kính bảo hộ trong suốt",
      brand: "Honeywell",
      model: "A800",
      reorder_level: 30
    },
    {
      item_id: 4,
      category_id: 3,
      item_code: "MASK-001",
      item_name: "Khẩu trang N95",
      brand: "3M",
      model: "8210",
      reorder_level: 100
    },
    {
      item_id: 5,
      category_id: 4,
      item_code: "GLOVE-001",
      item_name: "Găng tay da",
      brand: "Ansell",
      model: "PowerFlex",
      reorder_level: 50
    },
    {
      item_id: 6,
      category_id: 4,
      item_code: "BOOT-001",
      item_name: "Giày bảo hộ da",
      brand: "Red Wing",
      model: "2412",
      reorder_level: 25
    }
  ];

  const ppeInventory: PPEInventory[] = [
    { inventory_id: 1, item_id: 1, site_id: 1, quantity_available: 45, quantity_allocated: 15, last_updated: "2024-03-10T14:30:00" },
    { inventory_id: 2, item_id: 1, site_id: 2, quantity_available: 32, quantity_allocated: 8, last_updated: "2024-03-10T14:30:00" },
    { inventory_id: 3, item_id: 1, site_id: 3, quantity_available: 120, quantity_allocated: 0, last_updated: "2024-03-10T14:30:00" },
    { inventory_id: 4, item_id: 2, site_id: 1, quantity_available: 28, quantity_allocated: 12, last_updated: "2024-03-10T14:30:00" },
    { inventory_id: 5, item_id: 3, site_id: 1, quantity_available: 85, quantity_allocated: 25, last_updated: "2024-03-10T14:30:00" },
    { inventory_id: 6, item_id: 4, site_id: 1, quantity_available: 250, quantity_allocated: 50, last_updated: "2024-03-10T14:30:00" },
    { inventory_id: 7, item_id: 5, site_id: 1, quantity_available: 75, quantity_allocated: 25, last_updated: "2024-03-10T14:30:00" },
    { inventory_id: 8, item_id: 6, site_id: 1, quantity_available: 18, quantity_allocated: 7, last_updated: "2024-03-10T14:30:00" },
    { inventory_id: 9, item_id: 4, site_id: 2, quantity_available: 8, quantity_allocated: 2, last_updated: "2024-03-10T14:30:00" }
  ];

  const users: User[] = [
    { user_id: 1, full_name: "Nguyễn Văn An", email: "an.nguyen@company.com", department: "Kỹ thuật" },
    { user_id: 2, full_name: "Trần Thị Bình", email: "binh.tran@company.com", department: "An toàn" },
    { user_id: 3, full_name: "Lê Văn Cường", email: "cuong.le@company.com", department: "Sản xuất" },
    { user_id: 4, full_name: "Phạm Thị Dung", email: "dung.pham@company.com", department: "Kỹ thuật" },
    { user_id: 5, full_name: "Hoàng Văn Em", email: "em.hoang@company.com", department: "Bảo trì" },
    { user_id: 100, full_name: "Admin User", email: "admin@company.com", department: "Quản lý" }
  ];

  const ppeIssuances: PPEIssuance[] = [
    {
      issuance_id: 1,
      user_id: 1,
      item_id: 1,
      quantity: 1,
      issued_date: "2024-03-01",
      expected_return_date: "2024-09-01",
      issued_by: 100,
      status: "issued"
    },
    {
      issuance_id: 2,
      user_id: 2,
      item_id: 3,
      quantity: 2,
      issued_date: "2024-03-05",
      expected_return_date: "2024-09-05",
      issued_by: 100,
      status: "issued"
    },
    {
      issuance_id: 3,
      user_id: 3,
      item_id: 4,
      quantity: 10,
      issued_date: "2024-02-15",
      expected_return_date: "2024-03-15",
      issued_by: 100,
      status: "overdue"
    },
    {
      issuance_id: 4,
      user_id: 4,
      item_id: 5,
      quantity: 2,
      issued_date: "2024-01-20",
      expected_return_date: "2024-04-20",
      issued_by: 100,
      status: "returned",
      actual_return_date: "2024-04-18"
    },
    {
      issuance_id: 5,
      user_id: 5,
      item_id: 6,
      quantity: 1,
      issued_date: "2024-03-08",
      expected_return_date: "2024-12-08",
      issued_by: 100,
      status: "issued"
    }
  ];

  // Utility functions
  const getCategoryName = (categoryId: number): string => {
    const category = ppeCategories.find(c => c.category_id === categoryId);
    return category ? category.category_name : 'Không xác định';
  };

  const getCategoryIcon = (categoryId: number): string => {
    const icons: { [key: number]: string } = {
      1: 'fas fa-hard-hat',
      2: 'fas fa-glasses',
      3: 'fas fa-head-side-mask',
      4: 'fas fa-mitten'
    };
    return icons[categoryId] || 'fas fa-box';
  };

  const getItemName = (itemId: number): string => {
    const item = ppeItems.find(i => i.item_id === itemId);
    return item ? item.item_name : 'Không xác định';
  };

  const getUserName = (userId: number): string => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.full_name : 'Không xác định';
  };

  const getStockStatus = (available: number, reorderLevel: number): string => {
    if (available === 0) return 'out';
    if (available <= reorderLevel) return 'low';
    return 'good';
  };

  const getStockStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      'out': 'Hết hàng',
      'low': 'Sắp hết',
      'good': 'Đầy đủ'
    };
    return labels[status] || status;
  };

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      'issued': 'Đã phát',
      'returned': 'Đã trả',
      'overdue': 'Quá hạn'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const openModal = (modalId: string) => {
    setShowModal(modalId);
  };

  const closeModal = () => {
    setShowModal(null);
  };

  return (
    <div className="ppe-management-container">
      <div className="ppe-content">
        {/* Header */}
        <div className="header">
          <div>
            <h1><i className="fas fa-hard-hat"></i> Quản lý thiết bị bảo hộ</h1>
            <div className="breadcrumb">
              <a href="/admin/dashboard">Dashboard</a> / Thiết bị bảo hộ
            </div>
          </div>
          <a href="/admin/dashboard" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Quay lại
          </a>
        </div>

      {/* Tabs */}
      <div className="tabs">
        <div className="tab-nav">
          <button 
            className={`tab-button ${activeTab === 'items' ? 'active' : ''}`} 
            onClick={() => switchTab('items')}
          >
            <i className="fas fa-box"></i> Danh mục PPE
          </button>
          <button 
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`} 
            onClick={() => switchTab('inventory')}
          >
            <i className="fas fa-warehouse"></i> Kho hàng
          </button>
          <button 
            className={`tab-button ${activeTab === 'issuance' ? 'active' : ''}`} 
            onClick={() => switchTab('issuance')}
          >
            <i className="fas fa-hand-holding"></i> Phát PPE
          </button>
          <button 
            className={`tab-button ${activeTab === 'tracking' ? 'active' : ''}`} 
            onClick={() => switchTab('tracking')}
          >
            <i className="fas fa-history"></i> Theo dõi
          </button>
        </div>

        {/* PPE Items Tab */}
        {activeTab === 'items' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Tìm kiếm thiết bị..." />
                </div>
                
                <select className="filter-select">
                  <option value="">Tất cả danh mục</option>
                  <option value="1">Bảo vệ đầu</option>
                  <option value="2">Bảo vệ mắt</option>
                  <option value="3">Bảo vệ hô hấp</option>
                  <option value="4">Bảo vệ chân tay</option>
                </select>
              </div>
              
              <button className="btn btn-primary" onClick={() => openModal('addItemModal')}>
                <i className="fas fa-plus"></i> Thêm thiết bị
              </button>
            </div>

            <div className="data-grid">
              {ppeItems.map(item => {
                const totalStock = ppeInventory
                  .filter(inv => inv.item_id === item.item_id)
                  .reduce((sum, inv) => sum + inv.quantity_available, 0);
                
                const stockStatus = getStockStatus(totalStock, item.reorder_level);
                
                return (
                  <div key={item.item_id} className="ppe-card">
                    <div className="card-header">
                      <div className="card-title">{item.item_name}</div>
                      <div className="card-subtitle">{item.item_code}</div>
                      <div className="ppe-icon">
                        <i className={getCategoryIcon(item.category_id)}></i>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="ppe-info">
                        <div className="info-item">
                          <i className="fas fa-layer-group"></i>
                          <span>{getCategoryName(item.category_id)}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-copyright"></i>
                          <span>{item.brand || 'Không xác định'}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-tag"></i>
                          <span>{item.model || 'Không xác định'}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>Min: {item.reorder_level}</span>
                        </div>
                      </div>
                      
                      <div className="stock-status">
                        <div className="stock-title">Tổng tồn kho</div>
                        <div className="stock-row">
                          <span>Có sẵn:</span>
                          <span>{totalStock}</span>
                        </div>
                        <div className={`stock-alert alert-${stockStatus}`}>
                          {getStockStatusLabel(stockStatus)}
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="btn btn-warning btn-sm">
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        <button className="btn btn-success btn-sm">
                          <i className="fas fa-warehouse"></i> Kho
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          <i className="fas fa-history"></i> Lịch sử
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Tìm kiếm kho..." />
                </div>
                
                <select className="filter-select">
                  <option value="">Tất cả địa điểm</option>
                  <option value="1">Công trường A</option>
                  <option value="2">Công trường B</option>
                  <option value="3">Kho trung tâm</option>
                </select>
                
                <select className="filter-select">
                  <option value="">Tất cả trạng thái</option>
                  <option value="low">Sắp hết</option>
                  <option value="out">Hết hàng</option>
                  <option value="good">Đầy đủ</option>
                </select>
              </div>
              
              <button className="btn btn-success" onClick={() => openModal('updateStockModal')}>
                <i className="fas fa-plus-circle"></i> Nhập kho
              </button>
            </div>

            <div className="data-grid">
              {ppeInventory.map(inv => {
                const item = ppeItems.find(i => i.item_id === inv.item_id);
                const site = sites.find(s => s.site_id === inv.site_id);
                const stockStatus = getStockStatus(inv.quantity_available, item?.reorder_level || 0);
                
                return (
                  <div key={inv.inventory_id} className="ppe-card">
                    <div className="card-header">
                      <div className="card-title">{item?.item_name || 'Không xác định'}</div>
                      <div className="card-subtitle">{site?.site_name || 'Không xác định'}</div>
                      <div className="ppe-icon">
                        <i className={getCategoryIcon(item?.category_id || 1)}></i>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="ppe-info">
                        <div className="info-item">
                          <i className="fas fa-code"></i>
                          <span>{item?.item_code || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-calendar"></i>
                          <span>{formatDateTime(inv.last_updated)}</span>
                        </div>
                      </div>
                      
                      <div className="stock-status">
                        <div className="stock-title">Tình trạng kho</div>
                        <div className="stock-row">
                          <span>Có sẵn:</span>
                          <span>{inv.quantity_available}</span>
                        </div>
                        <div className="stock-row">
                          <span>Đã phát:</span>
                          <span>{inv.quantity_allocated}</span>
                        </div>
                        <div className="stock-row">
                          <span>Tối thiểu:</span>
                          <span>{item?.reorder_level || 0}</span>
                        </div>
                        <div className={`stock-alert alert-${stockStatus}`}>
                          {getStockStatusLabel(stockStatus)}
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="btn btn-success btn-sm">
                          <i className="fas fa-plus"></i> Nhập
                        </button>
                        <button className="btn btn-warning btn-sm">
                          <i className="fas fa-edit"></i> Điều chỉnh
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Issuance Tab */}
        {activeTab === 'issuance' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Tìm kiếm theo tên nhân viên..." />
                </div>
              </div>
              
              <button className="btn btn-primary" onClick={() => openModal('issueModal')}>
                <i className="fas fa-hand-holding"></i> Phát PPE
              </button>
            </div>

            <div className="data-table">
              <div className="table-header">
                <h3 className="table-title">Lịch sử phát PPE</h3>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Thiết bị</th>
                    <th>Số lượng</th>
                    <th>Ngày phát</th>
                    <th>Ngày trả dự kiến</th>
                    <th>Người phát</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {ppeIssuances.map(issuance => (
                    <tr key={issuance.issuance_id}>
                      <td style={{fontWeight: 600, color: '#2c3e50'}}>{getUserName(issuance.user_id)}</td>
                      <td>{getItemName(issuance.item_id)}</td>
                      <td style={{textAlign: 'center', fontWeight: 600}}>{issuance.quantity}</td>
                      <td>{formatDate(issuance.issued_date)}</td>
                      <td>{formatDate(issuance.expected_return_date)}</td>
                      <td>{getUserName(issuance.issued_by)}</td>
                      <td>
                        <span className={`status-badge status-${issuance.status}`}>
                          {getStatusLabel(issuance.status)}
                        </span>
                      </td>
                      <td>
                        {(issuance.status === 'issued' || issuance.status === 'overdue') ? (
                          <button className="btn btn-success btn-sm">
                            <i className="fas fa-undo"></i> Trả về
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm">
                            <i className="fas fa-eye"></i> Xem
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Tìm kiếm..." />
                </div>
                
                <select className="filter-select">
                  <option value="">Tất cả trạng thái</option>
                  <option value="issued">Đã phát</option>
                  <option value="returned">Đã trả</option>
                  <option value="overdue">Quá hạn</option>
                </select>
              </div>
              
              <button className="btn btn-success">
                <i className="fas fa-download"></i> Xuất báo cáo
              </button>
            </div>

            <div className="data-table">
              <div className="table-header">
                <h3 className="table-title">Theo dõi PPE</h3>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Thiết bị</th>
                    <th>Số lượng</th>
                    <th>Ngày phát</th>
                    <th>Hạn trả</th>
                    <th>Ngày trả thực tế</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {ppeIssuances.map(issuance => (
                    <tr key={issuance.issuance_id}>
                      <td style={{fontWeight: 600, color: '#2c3e50'}}>{getUserName(issuance.user_id)}</td>
                      <td>{getItemName(issuance.item_id)}</td>
                      <td style={{textAlign: 'center', fontWeight: 600}}>{issuance.quantity}</td>
                      <td>{formatDate(issuance.issued_date)}</td>
                      <td>{formatDate(issuance.expected_return_date)}</td>
                      <td>{issuance.status === 'returned' ? formatDate(issuance.actual_return_date || issuance.expected_return_date) : '-'}</td>
                      <td>
                        <span className={`status-badge status-${issuance.status}`}>
                          {getStatusLabel(issuance.status)}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm">
                          <i className="fas fa-search"></i> Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal === 'addItemModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Thêm thiết bị bảo hộ</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Mã thiết bị *</label>
                  <input type="text" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tên thiết bị *</label>
                  <input type="text" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Danh mục *</label>
                  <select className="form-input" required>
                    <option value="">Chọn danh mục</option>
                    <option value="1">Bảo vệ đầu</option>
                    <option value="2">Bảo vệ mắt</option>
                    <option value="3">Bảo vệ hô hấp</option>
                    <option value="4">Bảo vệ chân tay</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Thương hiệu</label>
                  <input type="text" className="form-input" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input type="text" className="form-input" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mức tồn kho tối thiểu</label>
                  <input type="number" className="form-input" min="0" defaultValue="10" />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Thêm thiết bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'updateStockModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Cập nhật tồn kho</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Thiết bị *</label>
                  <select className="form-input" required>
                    <option value="">Chọn thiết bị</option>
                    {ppeItems.map(item => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.item_name} ({item.item_code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Địa điểm *</label>
                  <select className="form-input" required>
                    <option value="">Chọn địa điểm</option>
                    <option value="1">Công trường A</option>
                    <option value="2">Công trường B</option>
                    <option value="3">Kho trung tâm</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Số lượng nhập *</label>
                  <input type="number" className="form-input" required min="1" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <input type="text" className="form-input" placeholder="Lý do nhập kho..." />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-success">
                  <i className="fas fa-plus-circle"></i> Nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'issueModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Phát thiết bị bảo hộ</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nhân viên *</label>
                  <select className="form-input" required>
                    <option value="">Chọn nhân viên</option>
                    {users.filter(user => user.user_id !== 100).map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.full_name} - {user.department}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Thiết bị *</label>
                  <select className="form-input" required>
                    <option value="">Chọn thiết bị</option>
                    {ppeItems.map(item => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.item_name} ({item.item_code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Số lượng *</label>
                  <input type="number" className="form-input" required min="1" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ngày trả dự kiến *</label>
                  <input type="date" className="form-input" required />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-hand-holding"></i> Phát PPE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PPEManagement;
