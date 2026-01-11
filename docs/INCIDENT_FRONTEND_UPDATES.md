# 📋 Cập Nhật Frontend cho Incident - Tóm Tắt

## 🎯 Mục Tiêu
Cập nhật frontend để phù hợp với các thay đổi backend:
- Hỗ trợ `estimatedCompletionTime` khi phân công
- Xử lý và hiển thị location conflict error
- Hiển thị thông tin thời gian mới (actualStartTime, estimatedCompletionTime, actualCompletionTime)
- Cải thiện quản lý evidence/images

---

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. **Cập Nhật Types** (`src/types/incident.ts`)

#### Thêm các field thời gian vào `Incident` interface:
```typescript
estimatedCompletionTime?: string | Date; // Thời gian dự kiến hoàn thành
actualStartTime?: string | Date; // Thời gian bắt đầu xử lý thực tế
actualCompletionTime?: string | Date; // Thời gian hoàn thành thực tế
```

#### Cải thiện `IncidentHistory` interface:
```typescript
evidenceImages?: string[]; // Hình ảnh minh chứng (tổng quát)
findingsImages?: string[]; // Backward compatible
evidenceType?: 'photo' | 'document' | 'video' | 'other';
evidenceDescription?: string;
```

#### Thêm interface cho conflict error:
```typescript
export interface LocationConflictError {
  hasConflict: boolean;
  conflictingIncidents?: Array<{
    _id: string;
    incidentId: string;
    title: string;
    location: string;
    status: string;
    createdAt: string;
  }>;
}
```

---

### 2. **Cập Nhật Service** (`src/services/incidentService.ts`)

#### Cập nhật `assignIncident` method:
```typescript
assignIncident: (id: string, data: { 
  assignedTo: string;
  estimatedCompletionTime?: string | Date; // Optional
}) => api.put(`/incidents/assign/${id}`, data)
```

---

### 3. **Cập Nhật AssignIncident Component** (`src/pages/header_department/IncidentManagement/AssignIncident.tsx`)

#### Thêm DatePicker cho estimatedCompletionTime:
- ✅ DatePicker với validation:
  - Chỉ cho phép chọn thời gian trong tương lai
  - Disable các giờ/phút đã qua nếu chọn cùng ngày
  - Format: `DD/MM/YYYY HH:mm`

#### Xử lý conflict error với chi tiết:
- ✅ Hiển thị danh sách conflicting incidents
- ✅ Thông tin chi tiết: mã sự cố, tiêu đề, địa điểm, trạng thái
- ✅ Gợi ý giải quyết conflict

**Ví dụ hiển thị conflict:**
```
❌ Người này đang xử lý sự cố tại địa điểm khác (Địa điểm A, Địa điểm B). 
   Một người không thể xử lý các sự cố tại các nơi khác nhau cùng lúc.

⚠️ Các sự cố đang conflict:
  • #INC12345 - Sự cố A
    Địa điểm: Địa điểm A | Trạng thái: Đang xử lý
  
💡 Gợi ý: Vui lòng hoàn thành hoặc hủy phân công các sự cố trên 
   trước khi phân công sự cố mới cho người này.
```

#### Cập nhật state management:
```typescript
const [conflictData, setConflictData] = useState<LocationConflictError | null>(null);
```

#### Cập nhật handleSubmit:
```typescript
// Prepare assign data với estimatedCompletionTime
const assignData: { assignedTo: string; estimatedCompletionTime?: string } = {
  assignedTo: values.assignedTo
};

if (values.estimatedCompletionTime) {
  assignData.estimatedCompletionTime = values.estimatedCompletionTime.format('YYYY-MM-DDTHH:mm:ss[Z]');
}
```

---

## 📝 Cách Sử Dụng

### Phân Công với Thời Gian Dự Kiến

**UI Flow:**
1. Chọn người phụ trách từ dropdown
2. (Optional) Chọn thời gian dự kiến hoàn thành bằng DatePicker
3. Nhập ghi chú (optional)
4. Click "Phân công"

**Validation:**
- Thời gian dự kiến phải sau thời điểm hiện tại
- Nếu có conflict location → Hiển thị error với chi tiết

### Xử Lý Conflict Error

**Khi có conflict:**
- Alert error được hiển thị với icon ⚠️
- Danh sách các sự cố đang conflict được liệt kê
- Thông tin chi tiết: Mã sự cố, tiêu đề, địa điểm, trạng thái
- Gợi ý giải quyết: Hoàn thành hoặc hủy phân công các sự cố conflict trước

---

## 🔄 Các Component Cần Cập Nhật Tiếp

### 1. **InvestigateIncident.tsx**
Cần cập nhật để hiển thị:
- `actualStartTime`: Thời gian bắt đầu xử lý
- `estimatedCompletionTime`: Thời gian dự kiến hoàn thành
- `actualCompletionTime`: Thời gian hoàn thành thực tế (nếu có)

**Gợi ý thêm vào Descriptions:**
```typescript
{incident.actualStartTime && (
  <Descriptions.Item label="Thời gian bắt đầu">
    {dayjs(incident.actualStartTime).format('DD/MM/YYYY HH:mm')}
  </Descriptions.Item>
)}

{incident.estimatedCompletionTime && (
  <Descriptions.Item label="Dự kiến hoàn thành">
    {dayjs(incident.estimatedCompletionTime).format('DD/MM/YYYY HH:mm')}
  </Descriptions.Item>
)}
```

### 2. **IncidentList.tsx**
Có thể thêm column hiển thị:
- Thời gian bắt đầu xử lý
- Thời gian dự kiến hoàn thành
- Số ngày xử lý (calculated từ actualStartTime)

### 3. **ProgressHistory.tsx**
Có thể cập nhật để hiển thị:
- Evidence images từ history entries
- Evidence type và description

---

## 🎨 UI/UX Improvements

### DatePicker Styling
- ✅ Border radius: 8px
- ✅ Size: large
- ✅ Validation: Disable past dates/times
- ✅ Format: `DD/MM/YYYY HH:mm`

### Conflict Error Display
- ✅ Alert với icon WarningOutlined
- ✅ Danh sách incidents với styling rõ ràng
- ✅ Tags cho trạng thái và mã sự cố
- ✅ Gợi ý giải quyết với icon 💡

---

## 📦 Dependencies

Cần đảm bảo các package sau được cài đặt:
```json
{
  "antd": "^5.x",
  "dayjs": "^1.x"
}
```

**Import cần thiết:**
```typescript
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, List, Tag } from 'antd';
import { ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
```

---

## 🧪 Testing Checklist

### Test Case 1: Phân công với estimatedCompletionTime
- [ ] Chọn người phụ trách
- [ ] Chọn thời gian dự kiến trong tương lai → ✅ Success
- [ ] Chọn thời gian trong quá khứ → ❌ Validation error
- [ ] Submit → Kiểm tra API call có gửi estimatedCompletionTime

### Test Case 2: Location Conflict
- [ ] Tạo incident A tại "Địa điểm X"
- [ ] Assign user "John" cho incident A → ✅ Success
- [ ] Tạo incident B tại "Địa điểm Y"
- [ ] Assign user "John" cho incident B → ❌ Error với conflict details
- [ ] Kiểm tra UI hiển thị danh sách conflicting incidents

### Test Case 3: Same Location OK
- [ ] Tạo incident A tại "Địa điểm X"
- [ ] Assign user "John" cho incident A → ✅ Success
- [ ] Tạo incident B tại "Địa điểm X" (cùng địa điểm)
- [ ] Assign user "John" cho incident B → ✅ Success

---

## 📚 Files Đã Thay Đổi

1. ✅ `src/types/incident.ts` - Cập nhật interfaces
2. ✅ `src/services/incidentService.ts` - Cập nhật assignIncident method
3. ✅ `src/pages/header_department/IncidentManagement/AssignIncident.tsx` - Thêm DatePicker và conflict error handling

---

## 🚀 Next Steps

1. **Cập nhật InvestigateIncident.tsx** để hiển thị thông tin thời gian
2. **Cập nhật IncidentList.tsx** để hiển thị timeline information
3. **Cập nhật ProgressHistory.tsx** để hiển thị evidence tốt hơn
4. **Thêm tính năng filter/sort** theo thời gian dự kiến hoàn thành
5. **Thêm notification** khi estimatedCompletionTime sắp đến

---

**Cập nhật lần cuối:** 2024-12-06

