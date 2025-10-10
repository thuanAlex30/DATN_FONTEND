# Employee Components

This directory contains reusable components for employee pages in the application.

## Components

### EmployeeLayout
A complete layout component that combines sidebar and header for employee pages.

**Props:**
- `children: React.ReactNode` - The page content
- `title: string` - The page title displayed in the header
- `icon?: React.ReactNode` - Optional icon to display next to the title
- `showUserInfo?: boolean` - Whether to show user information (default: true)
- `showNotifications?: boolean` - Whether to show notification bell (default: true)
- `onLogout?: () => void` - Custom logout handler
- `headerExtra?: React.ReactNode` - Additional content to display in the header
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { EmployeeLayout } from '../../../components/Employee';

const MyPage = () => {
  return (
    <EmployeeLayout
      title="My Page Title"
      icon={<MyIcon />}
      headerExtra={<Button>Extra Action</Button>}
    >
      <div>Page content goes here</div>
    </EmployeeLayout>
  );
};
```

### EmployeeSidebar
A standalone sidebar component with navigation menu for employee pages.

**Props:**
- `onLogout?: () => void` - Custom logout handler

**Features:**
- Navigation menu with employee-specific routes
- Fixed positioning
- Responsive design
- Logout button at the bottom

### EmployeeHeader
A standalone header component for employee pages.

**Props:**
- `title: string` - The page title
- `icon?: React.ReactNode` - Optional icon
- `showUserInfo?: boolean` - Whether to show user information (default: true)
- `showNotifications?: boolean` - Whether to show notifications (default: true)
- `onLogout?: () => void` - Custom logout handler
- `extra?: React.ReactNode` - Additional content

## Usage Examples

### Basic Layout
```tsx
import { EmployeeLayout } from '../../../components/Employee';
import { BookOutlined } from '@ant-design/icons';

const TrainingPage = () => {
  return (
    <EmployeeLayout
      title="Đào tạo an toàn lao động"
      icon={<BookOutlined />}
    >
      <div>Training content</div>
    </EmployeeLayout>
  );
};
```

### With Header Extra Content
```tsx
import { EmployeeLayout } from '../../../components/Employee';
import { Button } from 'antd';
import { ReloadOutlined, SafetyOutlined } from '@ant-design/icons';

const PPEPage = () => {
  const handleRefresh = () => {
    // Refresh logic
  };

  return (
    <EmployeeLayout
      title="Quản lý PPE cá nhân"
      icon={<SafetyOutlined />}
      headerExtra={
        <Button 
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          Làm mới
        </Button>
      }
    >
      <div>PPE content</div>
    </EmployeeLayout>
  );
};
```

### Custom Logout Handler
```tsx
import { EmployeeLayout } from '../../../components/Employee';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Custom logout logic
    localStorage.clear();
    navigate('/login');
  };

  return (
    <EmployeeLayout
      title="My Page"
      onLogout={handleLogout}
    >
      <div>Page content</div>
    </EmployeeLayout>
  );
};
```

## Styling

The components use CSS modules for styling. The main layout includes:
- Fixed sidebar with navigation
- Responsive design
- Purple gradient background
- Consistent spacing and typography

## Navigation Routes

The sidebar includes the following navigation items:
- Trang chủ (/home)
- Thông tin cá nhân (/employee/profile)
- Báo cáo sự cố (/employee/incidents/report)
- Đào tạo (/employee/training)
- PPE cá nhân (/employee/ppe)
- Chứng chỉ (/employee/certificates)
