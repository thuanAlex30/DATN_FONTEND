import React, { useState, useRef } from 'react';
import { parsePPECategoryExcel, generatePPECategoryTemplate, validatePPECategoryData } from '../../../utils/excelUtils';
import type { ImportResult } from '../../../utils/excelUtils';
import { importPPECategories } from '../../../services/ppeService';

interface ImportCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const ImportCategoriesModal: React.FC<ImportCategoriesModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.xlsx') && 
        !selectedFile.name.toLowerCase().endsWith('.xls')) {
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    setFile(selectedFile);
    setStep('preview');

    try {
      const result = await parsePPECategoryExcel(selectedFile);
      setImportResult(result);
      
      if (!result.success) {
        setStep('upload');
      }
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Có lỗi khi đọc file Excel');
      setStep('upload');
    } finally {
      // Loading completed
    }
  };

  const handleDownloadTemplate = () => {
    generatePPECategoryTemplate();
  };

  const handleImport = async () => {
    if (!importResult || !importResult.success) return;

    setImporting(true);
    setStep('importing');

    try {
      // Validate data before import
      const validationErrors = validatePPECategoryData(importResult.data as any);
      if (validationErrors.length > 0) {
        setImportResult(prev => prev ? {
          ...prev,
          errors: [...prev.errors, ...validationErrors]
        } : null);
        setStep('preview');
        setImporting(false);
        return;
      }

      // Use the new import function from ppeService
      const response = await importPPECategories(file!);

      if (response.success) {
        setImportResult(prev => prev ? {
          ...prev,
          success: response.data.success,
          errors: response.data.errors,
          validRows: response.data.success.length
        } : null);
        setStep('complete');
        onImportSuccess();
      } else {
        throw new Error(response.message || 'Import failed');
      }

    } catch (error) {
      console.error('Error importing categories:', error);
      alert('Có lỗi khi import dữ liệu');
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImportResult(null);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-file-excel"></i>
            Import Danh mục PPE từ Excel
          </h3>
          <button onClick={handleClose} className="modal-close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="import-step">
              <div className="step-header">
                <div className="step-number">1</div>
                <h4>Chọn file Excel</h4>
              </div>
              
              <div className="template-section">
                <div className="template-info">
                  <i className="fas fa-info-circle"></i>
                  <span>Tải template mẫu để biết định dạng file Excel</span>
                </div>
                <button 
                  type="button" 
                  onClick={handleDownloadTemplate}
                  className="btn btn-info"
                >
                  <i className="fas fa-download"></i>
                  Tải Template
                </button>
              </div>

              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="file-input"
                  id="excel-file"
                />
                <label htmlFor="excel-file" className="file-upload-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>Chọn file Excel</span>
                  <small>Hỗ trợ định dạng .xlsx và .xls</small>
                </label>
              </div>

              {file && (
                <div className="selected-file">
                  <i className="fas fa-file-excel"></i>
                  <span>{file.name}</span>
                  <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && importResult && (
            <div className="import-step">
              <div className="step-header">
                <div className="step-number">2</div>
                <h4>Xem trước dữ liệu</h4>
              </div>

              <div className="import-summary">
                <div className="summary-item">
                  <i className="fas fa-list"></i>
                  <span>Tổng dòng: <strong>{importResult.totalRows}</strong></span>
                </div>
                <div className="summary-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Dòng hợp lệ: <strong>{importResult.validRows}</strong></span>
                </div>
                <div className="summary-item">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Lỗi: <strong>{importResult.errors.length}</strong></span>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="error-list">
                  <h5>Danh sách lỗi:</h5>
                  <ul>
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="error-item">
                        <i className="fas fa-times-circle"></i>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.success && importResult.data.length > 0 && (
                <div className="preview-table">
                  <h5>Dữ liệu sẽ được import:</h5>
                  <div className="table-container">
                    <table className="preview-table-content">
                      <thead>
                        <tr>
                          <th>Tên danh mục</th>
                          <th>Mô tả</th>
                          <th>Tuổi thọ (tháng)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(importResult.data as any[]).slice(0, 10).map((item, index) => (
                          <tr key={index}>
                            <td>{item.category_name}</td>
                            <td>{item.description}</td>
                            <td>{item.lifespan_months}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importResult.data.length > 10 && (
                      <div className="table-note">
                        <i className="fas fa-info-circle"></i>
                        Chỉ hiển thị 10 dòng đầu tiên. Tổng cộng {importResult.data.length} dòng.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Importing */}
          {step === 'importing' && (
            <div className="import-step">
              <div className="step-header">
                <div className="step-number">3</div>
                <h4>Đang import dữ liệu...</h4>
              </div>
              
              <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang tạo danh mục PPE...</span>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="import-step">
              <div className="step-header">
                <div className="step-number success">
                  <i className="fas fa-check"></i>
                </div>
                <h4>Import thành công!</h4>
              </div>
              
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <p>Đã import thành công {importResult?.validRows} danh mục PPE</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {step === 'upload' && (
            <>
              <button type="button" onClick={handleClose} className="btn btn-secondary">
                <i className="fas fa-times"></i>
                Hủy
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </button>
              {importResult?.success && (
                <button 
                  type="button" 
                  onClick={handleImport}
                  className="btn btn-success"
                  disabled={importing}
                >
                  <i className="fas fa-upload"></i>
                  Import Dữ liệu
                </button>
              )}
            </>
          )}

          {step === 'complete' && (
            <>
              <button type="button" onClick={handleClose} className="btn btn-primary">
                <i className="fas fa-check"></i>
                Hoàn thành
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportCategoriesModal;
