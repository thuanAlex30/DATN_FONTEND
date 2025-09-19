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
        
        <h1 className="unauthorized-title">访问被拒绝</h1>
        
        <p className="unauthorized-message">
          抱歉，您没有权限访问此页面。请联系系统管理员获取相应权限。
        </p>
        
        <div className="unauthorized-actions">
          <Button
            variant="outline"
            onClick={handleGoBack}
          >
            返回上一页
          </Button>
          
          <Button
            variant="primary"
            onClick={handleGoHome}
          >
            返回登录页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
