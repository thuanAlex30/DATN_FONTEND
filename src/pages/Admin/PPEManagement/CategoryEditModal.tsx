import React, { useState, useEffect } from 'react';
import type { PPECategory } from '../../../services/ppeService';
import * as ppeService from '../../../services/ppeService';

interface CategoryEditModalProps {
  category: PPECategory | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCategory: PPECategory) => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  category,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    lifespan_months: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && category) {
      setFormData({
        category_name: category.category_name || '',
        description: category.description || '',
        lifespan_months: category.lifespan_months?.toString() || ''
      });
      setError(null);
    }
  }, [isOpen, category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        category_name: formData.category_name.trim(),
        description: formData.description.trim(),
        lifespan_months: parseInt(formData.lifespan_months) || 0
      };

      const updatedCategory = await ppeService.updatePPECategory(category._id, updateData);
      onUpdate(updatedCategory);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chỉnh sửa danh mục: {category.category_name}</h2>
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
              <label htmlFor="category_name">
                <i className="fas fa-tag"></i> Tên danh mục *
              </label>
              <input
                type="text"
                id="category_name"
                name="category_name"
                value={formData.category_name}
                onChange={handleInputChange}
                required
                placeholder="Nhập tên danh mục"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <i className="fas fa-info-circle"></i> Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả danh mục"
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lifespan_months">
                <i className="fas fa-calendar-alt"></i> Tuổi thọ (tháng) *
              </label>
              <input
                type="number"
                id="lifespan_months"
                name="lifespan_months"
                value={formData.lifespan_months}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Nhập tuổi thọ (tháng)"
                disabled={loading}
              />
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

export default CategoryEditModal;


