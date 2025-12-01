# 📋 TỔNG HỢP TẤT CẢ CHỨC NĂNG PPE MANAGEMENT

## 🎯 TỔNG QUAN

Hệ thống PPE Management là một module toàn diện để quản lý thiết bị bảo hộ cá nhân (Personal Protective Equipment) với đầy đủ các tính năng từ quản lý danh mục, tồn kho, phát hành, trả về, báo cáo và thống kê.

---

## 📦 1. QUẢN LÝ DANH MỤC PPE (PPE Categories)

### 1.1. CRUD Danh mục
- ✅ **Xem danh sách danh mục**: Hiển thị tất cả danh mục PPE
- ✅ **Xem chi tiết danh mục**: Xem thông tin chi tiết của một danh mục
- ✅ **Tạo danh mục mới**: 
  - Tên danh mục
  - Mô tả
  - Thời hạn sử dụng (lifespan_months)
- ✅ **Chỉnh sửa danh mục**: Cập nhật thông tin danh mục
- ✅ **Xóa danh mục**: Xóa danh mục (chỉ Admin)

### 1.2. Import/Export
- ✅ **Import danh mục từ Excel**: Upload file Excel để import nhiều danh mục cùng lúc
- ✅ **Validation**: Kiểm tra dữ liệu khi import
- ✅ **Error handling**: Báo lỗi chi tiết cho từng dòng import

**API Endpoints:**
- `GET /ppe/categories` - Lấy danh sách
- `GET /ppe/categories/:id` - Lấy chi tiết
- `POST /ppe/categories` - Tạo mới
- `PUT /ppe/categories/:id` - Cập nhật
- `DELETE /ppe/categories/:id` - Xóa
- `POST /ppe/categories/import` - Import từ Excel

---

## 🛠️ 2. QUẢN LÝ THIẾT BỊ PPE (PPE Items)

### 2.1. CRUD Thiết bị
- ✅ **Xem danh sách thiết bị**: 
  - Lọc theo danh mục
  - Tìm kiếm theo tên, mã
  - Hiển thị tồn kho, đã phân phát
- ✅ **Xem chi tiết thiết bị**: 
  - Thông tin cơ bản
  - Thống kê sử dụng
  - Lịch sử phát hành
- ✅ **Tạo thiết bị mới**:
  - Mã thiết bị (item_code)
  - Tên thiết bị (item_name)
  - Danh mục (category_id)
  - Thương hiệu (brand)
  - Model
  - Mức cảnh báo hết hàng (reorder_level)
  - Số lượng tồn kho (quantity_available)
- ✅ **Chỉnh sửa thiết bị**: Cập nhật thông tin
- ✅ **Xóa thiết bị**: Xóa thiết bị (chỉ Admin)

### 2.2. Quản lý Tồn kho
- ✅ **Cập nhật số lượng**: 
  - quantity_available (tồn kho)
  - quantity_allocated (đã phân phát)
- ✅ **Theo dõi tồn kho**: 
  - Cảnh báo khi tồn kho thấp (dưới reorder_level)
  - Hiển thị trạng thái: low stock / good
- ✅ **Thống kê tồn kho**: 
  - Tổng số lượng
  - Số lượng còn lại
  - Số lượng đã phân phát

### 2.3. Import/Export
- ✅ **Import thiết bị từ Excel**: Upload file Excel để import nhiều thiết bị
- ✅ **Template Excel**: Cung cấp template để import

**API Endpoints:**
- `GET /ppe/items` - Lấy danh sách
- `GET /ppe/items/:id` - Lấy chi tiết
- `GET /ppe/items/:id/stats` - Thống kê thiết bị
- `POST /ppe/items` - Tạo mới
- `PUT /ppe/items/:id` - Cập nhật
- `PUT /ppe/items/:id/quantity` - Cập nhật số lượng
- `DELETE /ppe/items/:id` - Xóa
- `POST /ppe/items/import` - Import từ Excel

---

## 📤 3. PHÁT PPE (PPE Issuance)

### 3.1. Luồng Phát PPE (3 cấp)

#### A. Admin → Manager
- ✅ **Phát PPE cho Manager**:
  - Chọn Manager
  - Chọn thiết bị PPE
  - Nhập số lượng
  - Ngày phát và ngày trả dự kiến
  - Ghi chú
- ✅ **Tự động cập nhật tồn kho**
- ✅ **Thông báo realtime** cho Manager qua WebSocket

#### B. Manager → Employee
- ✅ **Manager phát PPE cho Employee**:
  - Chọn Employee trong phòng ban
  - Chọn PPE từ số lượng đã nhận
  - Nhập thông tin phát hành
- ✅ **Tự động cập nhật số lượng** của Manager
- ✅ **Thông báo realtime** cho Employee

#### C. Admin → Employee (trực tiếp)
- ✅ **Phát trực tiếp cho Employee** (tương tự Admin → Manager)

### 3.2. Quản lý Phát hành
- ✅ **Xem danh sách phát hành**:
  - Tất cả phát hành
  - Phát hành đang hoạt động (active)
  - Phát hành sắp hết hạn (expiring)
  - Phát hành quá hạn (overdue)
- ✅ **Xem chi tiết phát hành**: 
  - Thông tin người nhận
  - Thông tin thiết bị
  - Lịch sử trả về
  - Báo cáo sự cố
- ✅ **Cập nhật phát hành**: Chỉnh sửa thông tin
- ✅ **Xóa phát hành**: Xóa bản ghi (chỉ Admin/Manager)

### 3.3. Batch Issuance (Phát hành hàng loạt)
- ✅ **Tạo batch phát hành**: Phát PPE cho nhiều người cùng lúc
- ✅ **Theo dõi tiến trình**: Xem progress của batch
- ✅ **Xử lý lỗi**: Báo lỗi chi tiết cho từng item trong batch

**API Endpoints:**
- `GET /ppe/issuances` - Lấy danh sách
- `GET /ppe/issuances/my` - PPE của tôi
- `GET /ppe/issuances/:id` - Lấy chi tiết
- `GET /ppe/issuances/user/:userId` - PPE của user
- `GET /ppe/issuances/active` - PPE đang hoạt động
- `GET /ppe/issuances/expiring` - PPE sắp hết hạn
- `POST /ppe/issuances` - Tạo phát hành
- `POST /ppe/issuances/to-manager` - Phát cho Manager
- `POST /ppe/issuances/to-employee` - Phát cho Employee
- `PUT /ppe/issuances/:id` - Cập nhật
- `DELETE /ppe/issuances/:id` - Xóa

---

## 🔄 4. TRẢ PPE (PPE Return)

### 4.1. Luồng Trả PPE

#### A. Employee → Manager
- ✅ **Employee trả PPE**:
  - Chọn PPE cần trả
  - Nhập ngày trả thực tế
  - Chọn tình trạng: good / damaged / worn
  - Thêm ghi chú
- ✅ **Tự động cập nhật**: 
  - Status = 'returned'
  - Tăng remaining_in_hand của Manager
- ✅ **Thông báo realtime** cho Manager

#### B. Manager → Admin
- ✅ **Manager trả PPE về Admin**:
  - Chọn PPE cần trả
  - Nhập số lượng trả
  - Tình trạng và ghi chú
- ✅ **Tự động cập nhật tồn kho**:
  - Tăng quantity_available
  - Giảm quantity_allocated
- ✅ **Thông báo realtime** cho Admin

#### C. Admin Trả PPE (thủ công)
- ✅ **Admin cập nhật trạng thái trả** thủ công

### 4.2. Xác nhận Trả PPE
- ✅ **Manager xác nhận nhận PPE** từ Employee
- ✅ **Admin xác nhận nhận PPE** từ Manager

**API Endpoints:**
- `POST /ppe/issuances/:id/return` - Trả PPE (Admin/Manager)
- `POST /ppe/issuances/:id/return-employee` - Trả PPE (Employee)
- `POST /ppe/issuances/:id/return-to-manager` - Trả cho Manager
- `POST /ppe/issuances/:id/return-to-admin` - Trả cho Admin
- `POST /ppe/issuances/:id/confirm-employee-return` - Xác nhận nhận từ Employee

---

## 🚨 5. BÁO CÁO SỰ CỐ PPE

### 5.1. Báo cáo từ Employee
- ✅ **Báo cáo sự cố**:
  - Loại báo cáo: damage / replacement / lost
  - Mô tả chi tiết
  - Mức độ nghiêm trọng: low / medium / high
  - Ngày báo cáo
- ✅ **Tự động cập nhật status**:
  - 'damaged' nếu report_type = 'damage'
  - 'replacement_needed' nếu report_type = 'replacement' hoặc 'lost'
- ✅ **Thông báo realtime** cho Admin

### 5.2. Xử lý Báo cáo
- ✅ **Admin xem báo cáo**: Danh sách tất cả báo cáo
- ✅ **Cập nhật trạng thái**: Xử lý báo cáo
- ✅ **Lịch sử báo cáo**: Theo dõi lịch sử xử lý

**API Endpoints:**
- `POST /ppe/issuances/:id/report-employee` - Báo cáo sự cố

---

## 📊 6. THỐNG KÊ VÀ BÁO CÁO

### 6.1. Dashboard Statistics
- ✅ **Tổng quan**:
  - Tổng số thiết bị
  - Tổng số danh mục
  - Số thiết bị tồn kho thấp
  - Số PPE quá hạn
  - Tổng số phát hành
- ✅ **Biểu đồ trực quan**: Charts và graphs
- ✅ **Thống kê theo thời gian**: Theo ngày/tuần/tháng

### 6.2. Stock Status
- ✅ **Trạng thái tồn kho**:
  - Tổng số lượng
  - Số lượng còn lại
  - Số lượng đã phân phát
  - Số thiết bị tồn kho thấp
  - Số thiết bị hết hàng

### 6.3. Issuance Statistics
- ✅ **Thống kê phát hành**:
  - Tổng số phát hành
  - Phát hành đang hoạt động
  - Phát hành đã trả
  - Phát hành quá hạn
  - Phát hành sắp hết hạn

### 6.4. Quantity Statistics
- ✅ **Thống kê số lượng chi tiết**:
  - Theo từng thiết bị
  - Theo danh mục
  - Tổng quan toàn hệ thống

### 6.5. Reports
- ✅ **Báo cáo tồn kho** (Inventory Report)
- ✅ **Báo cáo phân phát** (Assignment Report)
- ✅ **Báo cáo bảo trì** (Maintenance Report)
- ✅ **Export PDF/Excel**: Xuất báo cáo

**API Endpoints:**
- `GET /ppe/dashboard` - Dashboard data
- `GET /ppe/dashboard-stats` - Dashboard statistics
- `GET /ppe/statistics/stock-status` - Trạng thái tồn kho
- `GET /ppe/statistics/overdue-issuances` - PPE quá hạn
- `GET /ppe/statistics/low-stock-items` - Thiết bị tồn kho thấp
- `GET /ppe/statistics/issuance-stats` - Thống kê phát hành
- `GET /ppe/statistics/quantity-stats` - Thống kê số lượng
- `GET /ppe/reports/inventory` - Báo cáo tồn kho
- `GET /ppe/reports/assignments` - Báo cáo phân phát
- `GET /ppe/reports/maintenance` - Báo cáo bảo trì

---

## 📦 7. QUẢN LÝ TỒN KHO (Inventory Management)

### 7.1. Inventory CRUD
- ✅ **Xem danh sách tồn kho**: Tất cả thiết bị trong kho
- ✅ **Xem chi tiết tồn kho**: Thông tin chi tiết từng item
- ✅ **Tạo bản ghi tồn kho**: Thêm mới vào kho
- ✅ **Cập nhật tồn kho**: Điều chỉnh số lượng
- ✅ **Xóa bản ghi**: Xóa khỏi kho

### 7.2. Inventory Statistics
- ✅ **Thống kê tồn kho**: Tổng quan số lượng trong kho

**API Endpoints:**
- `GET /ppe/inventory` - Lấy danh sách
- `GET /ppe/inventory/:id` - Lấy chi tiết
- `POST /ppe/inventory` - Tạo mới
- `PUT /ppe/inventory/:id` - Cập nhật
- `DELETE /ppe/inventory/:id` - Xóa
- `GET /ppe/inventory/stats` - Thống kê

---

## 🔧 8. QUẢN LÝ PHÂN CÔNG (Assignment Management)

### 8.1. Assignment CRUD
- ✅ **Xem danh sách phân công**: Tất cả phân công PPE
- ✅ **Xem chi tiết phân công**: Thông tin chi tiết
- ✅ **Tạo phân công mới**: Phân công PPE cho người dùng
- ✅ **Cập nhật phân công**: Chỉnh sửa thông tin
- ✅ **Xóa phân công**: Xóa bản ghi

### 8.2. User Assignments
- ✅ **Xem phân công của user**: PPE được phân công cho user cụ thể
- ✅ **Trả phân công**: Trả PPE từ phân công

**API Endpoints:**
- `GET /ppe/assignments` - Lấy danh sách
- `GET /ppe/assignments/:id` - Lấy chi tiết
- `GET /ppe/assignments/user/:userId` - Phân công của user
- `POST /ppe/assignments` - Tạo mới
- `PUT /ppe/assignments/:id` - Cập nhật
- `POST /ppe/assignments/:id/return` - Trả phân công
- `DELETE /ppe/assignments/:id` - Xóa

---

## 🔨 9. QUẢN LÝ BẢO TRÌ (Maintenance Management)

### 9.1. Maintenance CRUD
- ✅ **Xem danh sách bảo trì**: Tất cả bảo trì PPE
- ✅ **Xem chi tiết bảo trì**: Thông tin chi tiết
- ✅ **Tạo bảo trì mới**: Lên lịch bảo trì PPE
- ✅ **Cập nhật bảo trì**: Cập nhật trạng thái bảo trì
- ✅ **Xóa bảo trì**: Xóa bản ghi

### 9.2. Maintenance Statistics
- ✅ **Thống kê bảo trì**: Tổng quan bảo trì

**API Endpoints:**
- `GET /ppe/maintenance` - Lấy danh sách
- `GET /ppe/maintenance/:id` - Lấy chi tiết
- `POST /ppe/maintenance` - Tạo mới
- `PUT /ppe/maintenance/:id` - Cập nhật
- `DELETE /ppe/maintenance/:id` - Xóa
- `GET /ppe/maintenance/stats` - Thống kê

---

## 🔔 10. THÔNG BÁO REALTIME (WebSocket)

### 10.1. PPE Events
- ✅ **PPE được phát** (`ppe_issued`): Thông báo khi PPE được phát
- ✅ **PPE được trả** (`ppe_returned`): Thông báo khi PPE được trả
- ✅ **PPE sắp hết hạn** (`ppe_expiring`): Cảnh báo PPE sắp hết hạn
- ✅ **PPE hết hàng** (`ppe_low_stock`): Cảnh báo tồn kho thấp
- ✅ **Báo cáo sự cố** (`ppe_reported`): Thông báo khi có báo cáo

### 10.2. Advanced Events
- ✅ **Cập nhật số lượng** (`ppe_quantity_update`)
- ✅ **Cập nhật tình trạng** (`ppe_condition_update`)
- ✅ **Cảnh báo hết hạn** (`ppe_expiry_warning`)
- ✅ **PPE hết hạn** (`ppe_expired`)
- ✅ **PPE được thay thế** (`ppe_replaced`)
- ✅ **PPE được xử lý** (`ppe_disposed`)
- ✅ **Batch xử lý bắt đầu** (`batch_processing_started`)
- ✅ **Batch xử lý tiến trình** (`batch_processing_progress`)
- ✅ **Batch xử lý hoàn thành** (`batch_processing_complete`)

---

## 🚀 11. TÍNH NĂNG NÂNG CAO (Advanced Features)

### 11.1. Optimistic Locking
- ✅ **Version control**: Tránh conflict khi cập nhật đồng thời
- ✅ **Retry mechanism**: Tự động retry khi có conflict
- ✅ **Batch update**: Cập nhật nhiều item cùng lúc với locking

**API Endpoints:**
- `GET /api/ppe-advanced/items/:id/version` - Lấy item với version
- `PUT /api/ppe-advanced/items/:id/quantity` - Cập nhật với locking
- `POST /api/ppe-advanced/items/batch-update` - Batch update

### 11.2. Batch Operations
- ✅ **Batch Issuance**: Phát PPE cho nhiều người cùng lúc
- ✅ **Progress Tracking**: Theo dõi tiến trình batch
- ✅ **Error Handling**: Xử lý lỗi chi tiết

**API Endpoints:**
- `POST /api/ppe-advanced/batch-issuance` - Tạo batch
- `GET /api/ppe-advanced/batch-issuance` - Lấy danh sách batch
- `GET /api/ppe-advanced/batch-issuance/:id` - Lấy chi tiết batch
- `POST /api/ppe-advanced/batch-issuance/:id/process` - Xử lý batch
- `GET /api/ppe-advanced/batch-issuance/:id/status` - Trạng thái batch

### 11.3. Expiry Management
- ✅ **Theo dõi hết hạn**: Tracking PPE sắp hết hạn
- ✅ **Tự động cảnh báo**: Thông báo trước khi hết hạn
- ✅ **Thay thế PPE**: Thay thế PPE hết hạn
- ✅ **Xử lý PPE hết hạn**: Dispose PPE hết hạn
- ✅ **Báo cáo hết hạn**: Báo cáo chi tiết

**API Endpoints:**
- `POST /api/ppe-advanced/expiry-tracking` - Tạo tracking
- `POST /api/ppe-advanced/items/:id/auto-tracking` - Auto tracking
- `GET /api/ppe-advanced/expiry/check` - Kiểm tra hết hạn
- `PUT /api/ppe-advanced/expiry-tracking/:id/expired` - Đánh dấu hết hạn
- `PUT /api/ppe-advanced/expiry-tracking/:id/replace` - Thay thế
- `PUT /api/ppe-advanced/expiry-tracking/:id/dispose` - Xử lý
- `GET /api/ppe-advanced/expiry/report` - Báo cáo
- `POST /api/ppe-advanced/expiry/daily-check` - Kiểm tra hàng ngày

### 11.4. Health Check
- ✅ **Kiểm tra sức khỏe**: Health check cho advanced services

**API Endpoints:**
- `GET /api/ppe-advanced/health` - Health check

---

## 👥 12. PHÂN QUYỀN VÀ VAI TRÒ

### 12.1. Admin
- ✅ Toàn quyền quản lý PPE
- ✅ Phát PPE cho Manager và Employee
- ✅ Xem tất cả thống kê và báo cáo
- ✅ Quản lý danh mục và thiết bị
- ✅ Import/Export dữ liệu

### 12.2. Manager
- ✅ Xem PPE đã nhận từ Admin
- ✅ Phát PPE cho Employees trong phòng ban
- ✅ Xem PPE của Employees
- ✅ Trả PPE về Admin
- ✅ Xem thống kê phòng ban

### 12.3. Employee
- ✅ Xem PPE hiện tại
- ✅ Xem lịch sử PPE
- ✅ Trả PPE cho Manager
- ✅ Báo cáo sự cố PPE

### 12.4. Warehouse Staff
- ✅ Cập nhật tồn kho
- ✅ Quản lý inventory

### 12.5. Safety Officer
- ✅ Phát PPE
- ✅ Xem báo cáo sự cố

### 12.6. Maintenance Staff
- ✅ Quản lý bảo trì PPE

---

## 📱 13. GIAO DIỆN NGƯỜI DÙNG

### 13.1. Admin Interface (`/admin/ppe-management`)
- ✅ **Tab Danh mục**: Quản lý danh mục PPE
- ✅ **Tab Thiết bị**: Quản lý thiết bị PPE
- ✅ **Tab Lịch sử phát PPE**: Xem tất cả phát hành
- ✅ **Tab Người dùng**: Quản lý PPE của users
- ✅ **Tab Tồn kho**: Quản lý tồn kho
- ✅ **Tab Phân công**: Quản lý phân công
- ✅ **Tab Bảo trì**: Quản lý bảo trì
- ✅ **Tab Báo cáo**: Xem báo cáo
- ✅ **Dashboard**: Tổng quan thống kê

### 13.2. Manager Interface (`/manager/ppe`)
- ✅ **Tab Tổng quan**: Thống kê PPE của Manager
- ✅ **Tab PPE của tôi**: PPE đã nhận từ Admin
- ✅ **Tab PPE của nhân viên**: PPE của Employees trong phòng ban
- ✅ **Tab Lịch sử**: Lịch sử phát và trả PPE

### 13.3. Employee Interface (`/employee/ppe`)
- ✅ **Tab PPE hiện tại**: PPE đang sử dụng
- ✅ **Tab Lịch sử**: Lịch sử PPE đã trả
- ✅ **Chức năng trả PPE**: Trả PPE cho Manager
- ✅ **Chức năng báo cáo**: Báo cáo sự cố

---

## 🔍 14. TÌM KIẾM VÀ LỌC

### 14.1. Tìm kiếm
- ✅ Tìm kiếm theo tên thiết bị
- ✅ Tìm kiếm theo mã thiết bị
- ✅ Tìm kiếm theo danh mục
- ✅ Tìm kiếm theo người dùng

### 14.2. Lọc
- ✅ Lọc theo danh mục
- ✅ Lọc theo trạng thái
- ✅ Lọc theo ngày phát
- ✅ Lọc theo người dùng
- ✅ Lọc theo phòng ban

---

## 📄 15. XUẤT BÁO CÁO

### 15.1. PDF Reports
- ✅ Báo cáo tồn kho PDF
- ✅ Báo cáo phát hành PDF
- ✅ Báo cáo bảo trì PDF
- ✅ Preview PDF trước khi tải

### 15.2. Excel Export
- ✅ Xuất danh sách thiết bị Excel
- ✅ Xuất danh sách phát hành Excel
- ✅ Xuất thống kê Excel

---

## 🎨 16. UI/UX FEATURES

### 16.1. Components
- ✅ **Modals**: 
  - CategoryEditModal
  - CategoryDetailModal
  - ImportCategoriesModal
  - ImportItemsModal
  - AssignPPEModal
  - IssueToManagerModal
  - IssueToEmployeeModal
  - InventoryUpdateModal
  - PPEEditModal
  - PPEDetailModal
  - PPEReturnConfirmationModal
  - PPEAssignmentDetailsModal
  - CreateAssignmentModal
  - CreateMaintenanceModal
  - CreateReportModal
  - BatchIssuanceModal
  - ExpiryManagementModal
  - OptimisticLockingModal

### 16.2. Shared Components
- ✅ **SharedPPEManagement**: Component dùng chung cho Manager và Employee
- ✅ **PDFPreviewModal**: Preview PDF trước khi tải
- ✅ **PPEDebugPanel**: Debug panel cho development

### 16.3. Hooks
- ✅ **usePPEWebSocket**: Hook để kết nối WebSocket cho PPE

---

## 🔐 17. BẢO MẬT

### 17.1. Authentication
- ✅ Tất cả API đều yêu cầu authentication
- ✅ JWT token validation

### 17.2. Authorization
- ✅ Role-based access control (RBAC)
- ✅ Kiểm tra quyền trước khi thực hiện action

### 17.3. Validation
- ✅ Input validation ở cả frontend và backend
- ✅ Joi schema validation cho backend
- ✅ TypeScript types cho frontend

---

## 📈 18. PERFORMANCE

### 18.1. Optimization
- ✅ Pagination cho danh sách lớn
- ✅ Lazy loading
- ✅ Caching data
- ✅ Optimistic updates

### 18.2. Batch Operations
- ✅ Batch issuance để xử lý nhiều item cùng lúc
- ✅ Progress tracking cho batch operations

---

## 🧪 19. TESTING & DEBUGGING

### 19.1. Debug Tools
- ✅ **PPEDebugPanel**: Debug panel để kiểm tra data
- ✅ **SimplePPEDebug**: Simple debug component
- ✅ Console logging cho development

---

## 📚 20. DOCUMENTATION

### 20.1. Code Documentation
- ✅ README.md cho PPE Management
- ✅ JSDoc comments trong code
- ✅ TypeScript types và interfaces

### 20.2. User Documentation
- ✅ Hướng dẫn sử dụng trong README.md
- ✅ API documentation

---

## 🎯 TỔNG KẾT

Hệ thống PPE Management bao gồm:

- **20+ Module chính** với đầy đủ CRUD operations
- **50+ API Endpoints** cho tất cả các chức năng
- **15+ Modal Components** cho các thao tác
- **Realtime WebSocket** cho thông báo tức thời
- **Advanced Features**: Batch operations, Expiry management, Optimistic locking
- **Comprehensive Statistics**: Dashboard, Reports, Analytics
- **Role-based Access**: Phân quyền chi tiết cho từng vai trò
- **Import/Export**: Excel import/export
- **PDF Reports**: Xuất báo cáo PDF

Hệ thống được thiết kế để quản lý toàn diện PPE từ danh mục, tồn kho, phát hành, trả về, báo cáo và thống kê với giao diện thân thiện và hiệu năng cao.

