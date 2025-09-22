import React from 'react';
import type { PPEItem, PPEIssuance } from '../../../services/ppeService';

interface PPEDetailModalProps {
  ppeItem: PPEItem | null;
  ppeIssuances: PPEIssuance[];
  isOpen: boolean;
  onClose: () => void;
}

const PPEDetailModal: React.FC<PPEDetailModalProps> = ({
  ppeItem,
  ppeIssuances,
  isOpen,
  onClose
}) => {
  if (!isOpen || !ppeItem) return null;

  // Get issuances for this PPE item
  const itemIssuances = ppeIssuances.filter(iss => iss.item_id.toString() === ppeItem._id);

  // Calculate total stock from PPE item data
  const totalStock = ppeItem.total_quantity || (ppeItem.quantity_available + ppeItem.quantity_allocated);

  // Calculate total issued
  const totalIssued = itemIssuances.reduce((sum, iss) => sum + iss.quantity, 0);

  // Calculate available stock
  const availableStock = ppeItem.remaining_quantity || ppeItem.quantity_available;

  // Get stock status
  const getStockStatus = () => {
    if (availableStock === 0) return { status: 'out', text: 'Hết hàng', class: 'alert-out' };
    if (availableStock <= 10) return { status: 'low', text: 'Sắp hết', class: 'alert-low' };
    return { status: 'good', text: 'Còn hàng', class: 'alert-good' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ppe-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết PPE: {ppeItem.item_name}</h2>
          <button className="close-modal" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Basic Information */}
          <div className="detail-section">
            <h3><i className="fas fa-info-circle"></i> Thông tin cơ bản</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Tên PPE:</label>
                <span>{ppeItem.item_name}</span>
              </div>
              <div className="detail-item">
                <label>Mã PPE:</label>
                <span>{ppeItem.item_code}</span>
              </div>
              <div className="detail-item">
                <label>Thương hiệu:</label>
                <span>{ppeItem.brand || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Model:</label>
                <span>{ppeItem.model || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Danh mục:</label>
                <span>{ppeItem.category_id?.category_name || 'Chưa phân loại'}</span>
              </div>
              <div className="detail-item">
                <label>Mức tối thiểu:</label>
                <span>{ppeItem.reorder_level}</span>
              </div>
              <div className="detail-item">
                <label>Ngày tạo:</label>
                <span>{new Date(ppeItem.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="detail-item">
                <label>Cập nhật lần cuối:</label>
                <span>{new Date(ppeItem.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="detail-section">
            <h3><i className="fas fa-boxes"></i> Thông tin tồn kho</h3>
            <div className="stock-summary">
              <div className="stock-item">
                <div className="stock-label">Tổng nhập:</div>
                <div className="stock-value">{totalStock}</div>
              </div>
              <div className="stock-item">
                <div className="stock-label">Đã xuất:</div>
                <div className="stock-value">{totalIssued}</div>
              </div>
              <div className="stock-item">
                <div className="stock-label">Còn lại:</div>
                <div className="stock-value">{availableStock}</div>
              </div>
              <div className="stock-item">
                <div className="stock-label">Trạng thái:</div>
                <div className={`stock-status ${stockStatus.class}`}>
                  {stockStatus.text}
                </div>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="detail-section">
            <h3><i className="fas fa-warehouse"></i> Thông tin tồn kho</h3>
            <div className="stock-summary">
              <div className="stock-item">
                <div className="stock-label">Tổng số lượng:</div>
                <div className="stock-value">{totalStock}</div>
              </div>
              <div className="stock-item">
                <div className="stock-label">Đã phát:</div>
                <div className="stock-value">{ppeItem.actual_allocated_quantity || ppeItem.quantity_allocated}</div>
              </div>
              <div className="stock-item">
                <div className="stock-label">Còn lại:</div>
                <div className="stock-value">{availableStock}</div>
              </div>
              <div className="stock-item">
                <div className="stock-label">Mức tối thiểu:</div>
                <div className="stock-value">{ppeItem.reorder_level}</div>
              </div>
            </div>
          </div>

          {/* Issuance History */}
          <div className="detail-section">
            <h3><i className="fas fa-hand-holding"></i> Lịch sử phát PPE ({itemIssuances.length})</h3>
            {itemIssuances.length > 0 ? (
              <div className="history-table">
                <div className="table-header">
                  <div>Ngày phát</div>
                  <div>Số lượng</div>
                  <div>Người nhận</div>
                  <div>Hạn trả</div>
                  <div>Trạng thái</div>
                </div>
                {itemIssuances.map((iss) => {
                  const user = typeof iss.user_id === 'object' && iss.user_id ? iss.user_id : null;
                  return (
                    <div key={iss._id} className="table-row">
                      <div>{new Date(iss.issued_date).toLocaleDateString('vi-VN')}</div>
                      <div>{iss.quantity}</div>
                      <div>{user?.full_name || 'N/A'}</div>
                      <div>{new Date(iss.expected_return_date).toLocaleDateString('vi-VN')}</div>
                      <div>
                        <span className={`status-badge status-${iss.status}`}>
                          {iss.status === 'issued' ? 'Đang sử dụng' : 
                           iss.status === 'returned' ? 'Đã trả' : 'Quá hạn'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">Chưa có lịch sử phát PPE</div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            <i className="fas fa-times"></i> Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PPEDetailModal;
