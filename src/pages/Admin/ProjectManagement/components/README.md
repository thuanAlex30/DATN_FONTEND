# Project Management Components

## Tổng quan

Bộ components này cung cấp đầy đủ các chức năng "Thông tin bổ sung" cho quy trình tạo dự án, bao gồm:

1. **Site Management** - Quản lý Site và Site Areas
2. **Work Location Management** - Quản lý Vị trí Làm việc
3. **Project Phase Management** - Quản lý Giai đoạn Dự án
4. **Resource Allocation Management** - Phân bổ Tài nguyên
5. **Risk Assessment Management** - Đánh giá Rủi ro
6. **Milestone Management** - Quản lý Milestone
7. **Project Creation Wizard** - Wizard tổng hợp

## Cấu trúc Files

```
components/
├── SiteManagement.tsx                    # Quản lý Site và Site Areas
├── SiteManagement.module.css
├── WorkLocationManagement.tsx            # Quản lý Vị trí Làm việc
├── WorkLocationManagement.module.css
├── ProjectPhaseManagement.tsx            # Quản lý Giai đoạn Dự án
├── ProjectPhaseManagement.module.css
├── ResourceAllocationManagement.tsx      # Phân bổ Tài nguyên
├── ResourceAllocationManagement.module.css
├── RiskAssessmentManagement.tsx          # Đánh giá Rủi ro
├── RiskAssessmentManagement.module.css
├── MilestoneManagement.tsx               # Quản lý Milestone
├── MilestoneManagement.module.css
├── ProjectCreationWizard.tsx             # Wizard tổng hợp
├── ProjectCreationWizard.module.css
└── README.md                             # File này
```

## Services

Các service files tương ứng:

```
services/
├── siteAreaService.ts                    # API cho Site Areas
├── workLocationService.ts                # API cho Work Locations
├── projectPhaseService.ts                # API cho Project Phases
├── projectResourceService.ts             # API cho Project Resources
├── projectRiskService.ts                 # API cho Project Risks
└── projectMilestoneService.ts            # API cho Project Milestones
```

## Cách sử dụng

### 1. Sử dụng từng component riêng lẻ

```tsx
import SiteManagement from './components/SiteManagement';
import ProjectPhaseManagement from './components/ProjectPhaseManagement';

// Trong component của bạn
<SiteManagement 
  projectId="project-id" 
  onComplete={() => console.log('Site setup completed')} 
/>

<ProjectPhaseManagement 
  projectId="project-id" 
  onComplete={() => console.log('Phases setup completed')} 
/>
```

### 2. Sử dụng Project Creation Wizard (Khuyến nghị)

```tsx
import ProjectCreationWizard from './components/ProjectCreationWizard';

// Trong component của bạn
<ProjectCreationWizard 
  projectId="project-id"
  onComplete={() => console.log('All setup completed')}
  onCancel={() => console.log('Setup cancelled')}
/>
```

## Tính năng chính

### 1. Site Management
- ✅ Tạo và quản lý Site
- ✅ Tạo và quản lý Site Areas
- ✅ Gán Supervisor cho từng khu vực
- ✅ Cấu hình địa chỉ và tọa độ Site
- ✅ Quản lý thông tin chi tiết khu vực

### 2. Work Location Management
- ✅ Tạo và quản lý Vị trí Làm việc
- ✅ Thiết lập yêu cầu truy cập
- ✅ Quản lý thiết bị an toàn yêu cầu
- ✅ Cấu hình sức chứa và hướng dẫn đặc biệt

### 3. Project Phase Management
- ✅ Tạo và quản lý Giai đoạn Dự án
- ✅ Thiết lập thứ tự và phụ thuộc giữa các giai đoạn
- ✅ Phân bổ ngân sách và thời gian cho từng giai đoạn
- ✅ Drag & Drop để sắp xếp lại thứ tự
- ✅ Cập nhật tiến độ giai đoạn

### 4. Resource Allocation Management
- ✅ Quản lý tài nguyên (Vật liệu, Thiết bị, Nhân lực, v.v.)
- ✅ Phân bổ ngân sách theo từng loại tài nguyên
- ✅ Thiết lập lịch trình cung cấp tài nguyên
- ✅ Theo dõi chi phí thực tế vs dự kiến
- ✅ Quản lý nhà cung cấp

### 5. Risk Assessment Management
- ✅ Xác định các rủi ro tiềm ẩn
- ✅ Đánh giá mức độ tác động và khả năng xảy ra
- ✅ Lập kế hoạch giảm thiểu rủi ro
- ✅ Gán người chịu trách nhiệm theo dõi rủi ro
- ✅ Phân loại rủi ro theo mức độ nghiêm trọng

### 6. Milestone Management
- ✅ Xác định các milestone quan trọng
- ✅ Thiết lập tiêu chí hoàn thành
- ✅ Gán người phụ trách
- ✅ Theo dõi tiến độ hoàn thành
- ✅ Đánh dấu milestone quan trọng

## API Endpoints

Tất cả các API đã được cấu hình sẵn trong backend:

- `GET/POST/PUT/DELETE /api/site-areas/*` - Site Areas
- `GET/POST/PUT/DELETE /api/work-locations/*` - Work Locations  
- `GET/POST/PUT/DELETE /api/project-phases/*` - Project Phases
- `GET/POST/PUT/DELETE /api/project-resources/*` - Project Resources
- `GET/POST/PUT/DELETE /api/project-risks/*` - Project Risks
- `GET/POST/PUT/DELETE /api/project-milestones/*` - Project Milestones

## Styling

Tất cả components sử dụng CSS Modules với:
- ✅ Responsive design
- ✅ Modern UI/UX
- ✅ Consistent color scheme
- ✅ Hover effects và animations
- ✅ Mobile-friendly

## Dependencies

Các dependencies cần thiết:
- React 18+
- TypeScript
- Redux Toolkit
- React Router
- Font Awesome Icons

## Lưu ý

1. **Authentication**: Tất cả components yêu cầu user đã đăng nhập
2. **Permissions**: Cần quyền admin để truy cập
3. **Data Validation**: Tất cả forms đều có validation
4. **Error Handling**: Có xử lý lỗi đầy đủ
5. **Loading States**: Hiển thị trạng thái loading

## Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. API endpoints có hoạt động không
2. User có quyền truy cập không
3. Dữ liệu có đúng format không
4. Console có lỗi gì không




