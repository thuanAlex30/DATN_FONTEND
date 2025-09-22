import React from 'react';
import type { PPECategory, PPEItem } from '../../../services/ppeService';

interface CategoryDetailModalProps {
  category: PPECategory | null;
  ppeItems: PPEItem[];
  isOpen: boolean;
  onClose: () => void;
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  ppeItems,
  isOpen,
  onClose
}) => {
  if (!isOpen || !category) return null;

  // Get items in this category
  const categoryItems = ppeItems.filter(item => 
    item.category_id && 
    (typeof item.category_id === 'object' && item.category_id ? item.category_id._id : item.category_id) === category._id
  );

  // Calculate total stock for this category
  const totalStock = categoryItems.reduce((sum, item) => sum + item.quantity_available, 0);

  // Calculate total allocated
  const totalAllocated = categoryItems.reduce((sum, item) => sum + item.quantity_allocated, 0);

  // Calculate total reorder level
  const totalReorderLevel = categoryItems.reduce((sum, item) => sum + (item.reorder_level || 0), 0);

  // Get stock status
  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return 'out';
    if (stock <= reorderLevel) return 'low';
    return 'good';
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return 'Đầy đủ';
      case 'low': return 'Sắp hết';
      case 'out': return 'Hết hàng';
      default: return 'Không xác định';
    }
  };

  const stockStatus = getStockStatus(totalStock, totalReorderLevel);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết danh mục: {category.category_name}</h2>
          <button className="close-modal" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3><i className="fas fa-info-circle"></i> Thông tin cơ bản</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Tên danh mục:</label>
                <span>{category.category_name}</span>
              </div>
              <div className="detail-item">
                <label>Mô tả:</label>
                <span>{category.description || 'Không có mô tả'}</span>
              </div>
              <div className="detail-item">
                <label>Tuổi thọ:</label>
                <span>{category.lifespan_months} tháng</span>
              </div>
              <div className="detail-item">
                <label>Ngày tạo:</label>
                <span>{category.createdAt ? formatDate(category.createdAt) : 'Không xác định'}</span>
              </div>
              <div className="detail-item">
                <label>Cập nhật lần cuối:</label>
                <span>{category.updatedAt ? formatDate(category.updatedAt) : 'Không xác định'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3><i className="fas fa-chart-bar"></i> Thống kê tồn kho</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-box"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{categoryItems.length}</div>
                  <div className="stat-label">Số thiết bị</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-warehouse"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalStock}</div>
                  <div className="stat-label">Tổng tồn kho</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalReorderLevel}</div>
                  <div className="stat-label">Mức tối thiểu</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-hand-holding"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalAllocated}</div>
                  <div className="stat-label">Đã phân phối</div>
                </div>
              </div>
              <div className="stat-card">
                <div className={`stat-icon status-${stockStatus}`}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-content">
                  <div className={`stat-value status-${stockStatus}`}>
                    {getStockStatusLabel(stockStatus)}
                  </div>
                  <div className="stat-label">Trạng thái</div>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3><i className="fas fa-list"></i> Danh sách thiết bị trong danh mục</h3>
            {categoryItems.length === 0 ? (
              <div className="no-items">
                <i className="fas fa-box-open"></i>
                <p>Chưa có thiết bị nào trong danh mục này</p>
              </div>
            ) : (
              <div className="items-list">
                {categoryItems.map(item => {
                  return (
                    <div key={item._id} className="item-card">
                      <div className="item-header">
                        <div className="item-name">{item.item_name}</div>
                        <div className="item-code">{item.item_code}</div>
                      </div>
                      <div className="item-details">
                        <div className="item-info">
                          <span><i className="fas fa-tag"></i> {item.brand || 'Không có thương hiệu'}</span>
                          <span><i className="fas fa-cog"></i> {item.model || 'Không có model'}</span>
                        </div>
                        <div className="item-stock">
                          <span className={`stock-badge ${getStockStatus(item.quantity_available, item.reorder_level || 0)}`}>
                            <i className="fas fa-warehouse"></i>
                            {item.quantity_available} / {item.reorder_level || 0}
                          </span>
                          <span className="allocated-badge">
                            <i className="fas fa-hand-holding"></i>
                            {item.quantity_allocated} đã phát
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            <i className="fas fa-times"></i> Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;

