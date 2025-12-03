import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import userService from '../../services/userService';
import './ImportUsers.css';

interface ImportResult {
  success: Array<{
    row: number;
    username: string;
    email: string;
    full_name: string;
  }>;
  errors: Array<{
    row: number;
    error: string;
  }>;
  total: number;
}

const ImportUsers: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
      }

      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        return;
      }

      setFile(selectedFile);
      setResult(null);
      setShowResult(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);
    setShowResult(false);
    
    try {
      console.log(`📤 Starting upload: ${file.name} (${file.size} bytes)`);

      const response = await userService.importUsers(file);
      console.log('✅ Upload successful:', response);
      setResult(response.data);
      setShowResult(true);
    } catch (error: any) {
      console.error('❌ Import error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi import file';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Import timeout - file quá lớn hoặc server đang xử lý chậm. Vui lòng thử lại với file nhỏ hơn.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        username: 'admin001',
        email: 'admin001@company.com',
        password: 'Password123',
        full_name: 'Nguyễn Văn Admin',
        phone: '0901234567',
        birth_date: '1990-01-15',
        address: '123 Đường ABC Hà Nội',
        department_name: 'Ban Giám đốc',
      },
      {
        username: 'manager001',
        email: 'manager001@company.com',
        password: 'Password123',
        full_name: 'Trần Thị Manager',
        phone: '0901234568',
        birth_date: '1985-05-20',
        address: '456 Đường XYZ TP.HCM',
        department_name: 'Ban Giám đốc',
      },
      {
        username: 'user001',
        email: 'user001@company.com',
        password: 'Password123',
        full_name: 'Lê Văn User',
        phone: '0901234569',
        birth_date: '1992-08-10',
        address: '789 Đường DEF Đà Nẵng',
        department_name: 'Ban Giám đốc',
      }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Add instructions sheet
    const instructions = [
      ['HƯỚNG DẪN NHẬP DỮ LIỆU USER'],
      [''],
      ['Các trường bắt buộc:'],
      ['- username: Tên đăng nhập (duy nhất)'],
      ['- email: Email (duy nhất)'],
      ['- password: Mật khẩu (tối thiểu 6 ký tự)'],
      ['- full_name: Họ và tên'],
      [''],
      ['Các trường tùy chọn:'],
      ['- phone: Số điện thoại'],
      ['- birth_date: Ngày sinh (YYYY-MM-DD)'],
      ['- address: Địa chỉ'],
      ['- department_name: Tên phòng ban'],
      [''],
      ['Lưu ý:'],
      ['- Role sẽ được tự động gán: Manager -> leader, Employee -> employee'],
      ['- department_name phải khớp với hệ thống'],
      ['- Username và email phải duy nhất trong hệ thống'],
      ['- File Excel phải có định dạng .xlsx hoặc .xls']
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Hướng dẫn');
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Download file
    XLSX.writeFile(wb, 'user_import_template.xlsx');
  };

  const closeResult = () => {
    setShowResult(false);
    setResult(null);
    setFile(null);
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="import-users-container">
      <div className="import-header">
        <h2 className="import-title">Import Users từ Excel</h2>
        <button
          onClick={downloadTemplate}
          className="download-template-btn"
        >
          <Download size={20} />
          Tải Template
        </button>
      </div>

      <div className="import-content">
        {/* File Upload */}
        <div className="file-upload-area">
          <FileSpreadsheet className="file-icon" size={48} />
          <div className="upload-section">
            <label htmlFor="file-input" className="file-input-label">
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="upload-button">
                <Upload size={20} />
                Chọn File Excel
              </div>
            </label>
          </div>
          <p className="upload-description">
            Chọn file Excel (.xlsx hoặc .xls) để import users
          </p>
          <p className="file-size-limit">
            Kích thước tối đa: 10MB
          </p>
        </div>

        {/* Selected File */}
        {file && (
          <div className="selected-file-container">
            <div className="selected-file-info">
              <div className="file-info">
                <FileSpreadsheet className="file-icon-small" size={24} />
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  const fileInput = document.getElementById('file-input') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="remove-file-btn"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="import-button"
          >
            {isUploading ? (
              <>
                <div className="loading-spinner"></div>
                Đang xử lý file Excel... (có thể mất vài phút)
              </>
            ) : (
              <>
                <Upload size={20} />
                Import Users
              </>
            )}
          </button>
        )}
      </div>

      {/* Results Modal */}
      {showResult && result && (
        <div className="results-modal-overlay">
          <div className="results-modal-content">
            <div className="results-modal-header">
              <h3 className="results-modal-title">Kết quả Import</h3>
              <button
                onClick={closeResult}
                className="close-results-btn"
              >
                <X size={24} />
              </button>
            </div>

            {/* Summary */}
            <div className="results-summary">
              <div className="summary-card total">
                <div className="summary-number">{result.total}</div>
                <div className="summary-label">Tổng số dòng</div>
              </div>
              <div className="summary-card success">
                <div className="summary-number">{result.success.length}</div>
                <div className="summary-label">Thành công</div>
              </div>
              <div className="summary-card error">
                <div className="summary-number">{result.errors.length}</div>
                <div className="summary-label">Lỗi</div>
              </div>
            </div>

            {/* Success Results */}
            {result.success.length > 0 && (
              <div className="success-section">
                <h4 className="success-title">
                  <CheckCircle size={20} />
                  Users được tạo thành công ({result.success.length})
                </h4>
                <div className="success-list">
                  {result.success.map((item, index) => (
                    <div key={index} className="success-item">
                      <span className="row-number">Dòng {item.row}:</span> {item.full_name} ({item.username} - {item.email})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Results */}
            {result.errors.length > 0 && (
              <div className="error-section">
                <h4 className="error-title">
                  <AlertCircle size={20} />
                  Lỗi ({result.errors.length})
                </h4>
                <div className="error-list">
                  {result.errors.map((item, index) => (
                    <div key={index} className="error-item">
                      <span className="row-number">Dòng {item.row}:</span> {item.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="results-modal-footer">
              <button
                onClick={closeResult}
                className="close-results-button"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportUsers;
