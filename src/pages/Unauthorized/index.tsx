import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import './Unauthorized.css';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/login');
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
        
        <h1 className="unauthorized-title">Truy cập bị từ chối!</h1>
        
        <p className="unauthorized-message">
          Rất tiếc, bạn không có quyền truy cập trang này, vui lòng liên hệ quản trị viên để cấp quyền。
        </p>
        
        <div className="unauthorized-actions">
          <Button
            variant="outline"
            onClick={handleGoBack}
          >
           Back
          </Button>
          
          <Button
            variant="primary"
            onClick={handleGoHome}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
