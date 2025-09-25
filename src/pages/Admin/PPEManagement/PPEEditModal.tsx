import React, { useState, useEffect } from 'react';
import type { PPEItem, PPECategory } from '../../../services/ppeService';
import * as ppeService from '../../../services/ppeService';

interface PPEEditModalProps {
  ppeItem: PPEItem | null;
  ppeCategories: PPECategory[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedItem: PPEItem) => void;
}

const PPEEditModal: React.FC<PPEEditModalProps> = ({
  ppeItem,
  ppeCategories,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    item_name: '',
    item_code: '',
    brand: '',
    model: '',
    reorder_level: '',
    categoryId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && ppeItem) {
      setFormData({
        item_name: ppeItem.item_name || '',
        item_code: ppeItem.item_code || '',
        brand: ppeItem.brand || '',
        model: ppeItem.model || '',
        reorder_level: ppeItem.reorder_level?.toString() || '',
        categoryId: ppeItem.category_id?._id?.toString() || ''
      });
      setError(null);
    }
  }, [isOpen, ppeItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppeItem) return;

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        item_name: formData.item_name.trim(),
        item_code: formData.item_code.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        reorder_level: parseInt(formData.reorder_level) || 0,
        category_id: formData.categoryId || undefined
      };

      const updatedItem = await ppeService.updatePPEItem(ppeItem._id, updateData);
      onUpdate(updatedItem);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật PPE');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !ppeItem) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ppe-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chỉnh sửa PPE: {ppeItem.item_name}</h2>
          <button className="close-modal" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
                <button type="button" className="close-alert" onClick={() => setError(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="item_name">
                <i className="fas fa-tag"></i> Tên PPE *
              </label>
              <input
                type="text"
                id="item_name"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
                required
                placeholder="Nhập tên PPE"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="item_code">
                <i className="fas fa-code"></i> Mã PPE *
              </label>
              <input
                type="text"
                id="item_code"
                name="item_code"
                value={formData.item_code}
                onChange={handleInputChange}
                required
                placeholder="Nhập mã PPE"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">
                <i className="fas fa-tag"></i> Thương hiệu
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Nhập thương hiệu"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">
                <i className="fas fa-cog"></i> Model
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Nhập model"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reorder_level">
                <i className="fas fa-exclamation-triangle"></i> Mức tối thiểu *
              </label>
              <input
                type="number"
                id="reorder_level"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="Nhập mức tối thiểu"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">
                <i className="fas fa-folder"></i> Danh mục
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Chọn danh mục</option>
                {ppeCategories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              <i className="fas fa-times"></i> Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang cập nhật...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PPEEditModal;
