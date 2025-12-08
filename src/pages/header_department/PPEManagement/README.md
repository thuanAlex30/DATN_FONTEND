# PPE Management System - Hướng dẫn sử dụng

## Tổng quan
Hệ thống quản lý PPE (Personal Protective Equipment) được thiết kế để quản lý việc phát, sử dụng và trả các thiết bị bảo hộ cá nhân trong công ty.

## Tính năng chính

### 1. Admin PPE Management
- **Quản lý danh mục PPE**: Tạo, chỉnh sửa, xóa các danh mục thiết bị
- **Quản lý thiết bị PPE**: Thêm, cập nhật, xóa các thiết bị PPE
- **Phát PPE**: Phát thiết bị PPE cho nhân viên với thông tin chi tiết
- **Theo dõi PPE**: Xem danh sách PPE đã phát, trạng thái sử dụng
- **Thông báo realtime**: Nhận thông báo khi có PPE quá hạn, hết hàng

### 2. Employee PPE Interface
- **Xem PPE hiện tại**: Danh sách PPE đang sử dụng
- **Lịch sử PPE**: Xem lịch sử PPE đã trả
- **Trả PPE**: Trả thiết bị PPE với thông tin tình trạng
- **Báo cáo sự cố**: Báo cáo khi PPE bị hư hỏng hoặc mất

## Luồng nghiệp vụ

### Phát PPE (Admin)
1. Admin chọn nhân viên cần phát PPE
2. Chọn thiết bị PPE và số lượng
3. Nhập ngày phát và ngày trả dự kiến
4. Hệ thống tự động cập nhật tồn kho
5. Gửi thông báo realtime cho nhân viên

### Trả PPE (Employee)
1. Nhân viên chọn PPE cần trả
2. Nhập ngày trả thực tế
3. Chọn tình trạng thiết bị (tốt/hư hỏng/mòn)
4. Thêm ghi chú (nếu có)
5. Hệ thống cập nhật trạng thái và tồn kho

### Báo cáo sự cố (Employee)
1. Nhân viên chọn PPE có sự cố
2. Chọn loại báo cáo (hư hỏng/cần thay thế/mất)
3. Mô tả chi tiết sự cố
4. Chọn mức độ nghiêm trọng
5. Gửi báo cáo cho admin

## WebSocket Realtime Features

### Thông báo tự động
- **PPE được phát**: Thông báo cho nhân viên khi nhận PPE mới
- **PPE được trả**: Thông báo cho admin khi nhân viên trả PPE
- **PPE quá hạn**: Cảnh báo khi PPE sắp hết hạn sử dụng
- **PPE hết hàng**: Cảnh báo khi tồn kho PPE thấp
- **Báo cáo sự cố**: Thông báo khi có sự cố với PPE

### Kết nối WebSocket
- Admin: Kết nối vào room admin để nhận tất cả thông báo
- Manager: Kết nối vào room phòng ban để nhận thông báo của phòng ban
- Employee: Kết nối vào room cá nhân để nhận thông báo riêng

## API Endpoints

### PPE Categories
- `GET /api/ppe/categories` - Lấy danh sách danh mục
- `POST /api/ppe/categories` - Tạo danh mục mới
- `PUT /api/ppe/categories/:id` - Cập nhật danh mục
- `DELETE /api/ppe/categories/:id` - Xóa danh mục

### PPE Items
- `GET /api/ppe/items` - Lấy danh sách thiết bị
- `POST /api/ppe/items` - Tạo thiết bị mới
- `PUT /api/ppe/items/:id` - Cập nhật thiết bị
- `DELETE /api/ppe/items/:id` - Xóa thiết bị

### PPE Issuances
- `GET /api/ppe/issuances` - Lấy danh sách PPE đã phát
- `POST /api/ppe/issuances` - Phát PPE mới
- `PUT /api/ppe/issuances/:id` - Cập nhật PPE đã phát
- `POST /api/ppe/issuances/:id/return` - Trả PPE (Admin)
- `POST /api/ppe/issuances/:id/return-employee` - Trả PPE (Employee)
- `POST /api/ppe/issuances/:id/report-employee` - Báo cáo sự cố

## Cấu trúc dữ liệu

### PPECategory
```typescript
interface PPECategory {
  id: string;
  category_name: string;
  description: string;
  lifespan_months?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### PPEItem
```typescript
interface PPEItem {
  id: string;
  category_id: string | PPECategory;
  item_code: string;
  item_name: string;
  brand?: string;
  model?: string;
  reorder_level: number;
  quantity_available: number;
  quantity_allocated: number;
  createdAt: string;
  updatedAt: string;
}
```

### PPEIssuance
```typescript
interface PPEIssuance {
  id: string;
  user_id: string | User;
  item_id: string | PPEItem;
  quantity: number;
  issued_date: string;
  expected_return_date: string;
  issued_by: string | User;
  status: 'issued' | 'returned' | 'overdue' | 'damaged' | 'replacement_needed';
  actual_return_date?: string;
  return_condition?: 'good' | 'damaged' | 'worn';
  return_notes?: string;
  report_type?: 'damage' | 'replacement' | 'lost';
  report_description?: string;
  report_severity?: 'low' | 'medium' | 'high';
  reported_date?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Cài đặt và sử dụng

### Frontend
1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình API/WebSocket URL trong `.env.local`:
```
VITE_API_BASE_URL=https://datn-backend-t3uq.onrender.com/api
VITE_WS_BASE_URL=https://datn-backend-t3uq.onrender.com
```

3. Chạy ứng dụng:
```bash
npm start
```

### Backend
1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình database và WebSocket trong `.env`

3. Chạy server:
```bash
npm start
```

## Lưu ý quan trọng

1. **Bảo mật**: Tất cả API đều yêu cầu authentication
2. **Phân quyền**: Admin có quyền phát PPE, Employee chỉ có quyền trả và báo cáo
3. **Realtime**: WebSocket cần được cấu hình đúng để nhận thông báo
4. **Validation**: Tất cả input đều được validate ở cả frontend và backend
5. **Error Handling**: Hệ thống có xử lý lỗi toàn diện

## Troubleshooting

### WebSocket không kết nối
- Kiểm tra URL WebSocket trong `.env`
- Kiểm tra token authentication
- Kiểm tra firewall và network

### PPE không hiển thị
- Kiểm tra API response
- Kiểm tra authentication token
- Kiểm tra console logs

### Thông báo không hiện
- Kiểm tra WebSocket connection status
- Kiểm tra room subscription
- Kiểm tra event listeners
