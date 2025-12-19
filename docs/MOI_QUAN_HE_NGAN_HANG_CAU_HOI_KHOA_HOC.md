# Mối Quan Hệ Giữa Ngân Hàng Câu Hỏi và Khóa Học

## Tổng Quan

Trong hệ thống Training Management, **Ngân hàng câu hỏi (Question Bank)** và **Khóa học (Course)** có mối quan hệ chặt chẽ với nhau. Tài liệu này giải thích chi tiết mối quan hệ này.

## MỐI QUAN HỆ CƠ BẢN

### Cấu Trúc Dữ Liệu

```
Course (Khóa học)
  └── QuestionBank (Ngân hàng câu hỏi) [1-N]
        └── Question (Câu hỏi) [1-N]
```

### Mối Quan Hệ Chi Tiết

1. **Course (1) → QuestionBank (N)**: **Một khóa học có thể có nhiều ngân hàng câu hỏi**
   - Mỗi ngân hàng câu hỏi **phải** thuộc về một khóa học (bắt buộc)
   - Một khóa học có thể có nhiều ngân hàng câu hỏi khác nhau
   - Ví dụ: Khóa học "An toàn lao động" có thể có:
     - Ngân hàng câu hỏi "An toàn cơ bản"
     - Ngân hàng câu hỏi "An toàn nâng cao"
     - Ngân hàng câu hỏi "Thiết bị bảo hộ"

2. **QuestionBank (1) → Question (N)**: **Một ngân hàng câu hỏi có nhiều câu hỏi**
   - Mỗi câu hỏi **phải** thuộc về một ngân hàng câu hỏi (bắt buộc)
   - Một ngân hàng câu hỏi có thể chứa nhiều câu hỏi

## CẤU TRÚC DATABASE

### QuestionBank Schema

```javascript
{
  course_id: ObjectId,      // Tham chiếu đến Course (BẮT BUỘC)
  name: String,             // Tên ngân hàng câu hỏi
  description: String       // Mô tả
}
```

### Question Schema

```javascript
{
  bank_id: ObjectId,        // Tham chiếu đến QuestionBank (BẮT BUỘC)
  content: String,          // Nội dung câu hỏi
  options: [String],       // Các lựa chọn
  correct_answer: String,   // Đáp án đúng
  points: Number,          // Điểm số
  explanation: String,     // Giải thích
  difficulty_level: String // Mức độ khó
}
```

### Course Schema

```javascript
{
  course_name: String,      // Tên khóa học
  description: String,      // Mô tả
  duration_hours: Number,   // Thời lượng
  // ... các field khác
  // KHÔNG có field trực tiếp tham chiếu đến QuestionBank
}
```

## TẠI SAO CẦN NGÂN HÀNG CÂU HỎI?

### 1. Tổ Chức Câu Hỏi Theo Chủ Đề

- **Một khóa học** có thể bao gồm nhiều chủ đề khác nhau
- **Mỗi chủ đề** có thể có một ngân hàng câu hỏi riêng
- Giúp quản lý và tìm kiếm câu hỏi dễ dàng hơn

**Ví dụ:**
```
Khóa học: "An toàn lao động tổng hợp"
├── Ngân hàng câu hỏi: "An toàn cơ bản" (20 câu)
├── Ngân hàng câu hỏi: "Thiết bị bảo hộ" (15 câu)
├── Ngân hàng câu hỏi: "Xử lý sự cố" (10 câu)
└── Ngân hàng câu hỏi: "Quy định pháp luật" (25 câu)
```

### 2. Tái Sử Dụng Câu Hỏi

- Các câu hỏi trong ngân hàng có thể được sử dụng cho nhiều **Training Session** khác nhau
- Không cần tạo lại câu hỏi mỗi khi tạo session mới
- Có thể tạo nhiều bài kiểm tra khác nhau từ cùng một ngân hàng câu hỏi

### 3. Quản Lý Linh Hoạt

- Có thể thêm/sửa/xóa câu hỏi trong ngân hàng mà không ảnh hưởng đến khóa học
- Có thể tạo ngân hàng câu hỏi trước khi tạo khóa học hoặc sau
- Dễ dàng import/export câu hỏi theo từng ngân hàng

## LUỒNG SỬ DỤNG TRONG HỆ THỐNG

### Bước 1: Tạo Khóa Học

```
1. Tạo Course (Khóa học)
   - Tên: "An toàn lao động"
   - Mô tả: "Khóa học về an toàn lao động"
   - Thời lượng: 8 giờ
```

### Bước 2: Tạo Ngân Hàng Câu Hỏi

```
2. Tạo QuestionBank (Ngân hàng câu hỏi)
   - Tên: "Câu hỏi An toàn cơ bản"
   - Khóa học: Chọn "An toàn lao động" (course_id)
   - Mô tả: "Các câu hỏi về kiến thức an toàn cơ bản"
```

### Bước 3: Thêm Câu Hỏi

```
3. Thêm Questions vào QuestionBank
   - Câu hỏi 1: "An toàn lao động là gì?"
   - Câu hỏi 2: "Khi nào cần sử dụng PPE?"
   - Câu hỏi 3: "Quy trình xử lý sự cố?"
   - ... (có thể import từ Excel)
```

### Bước 4: Sử Dụng Trong Training Session

```
4. Khi Employee làm bài kiểm tra
   - Hệ thống lấy câu hỏi từ QuestionBank của Course đó
   - Tạo bài kiểm tra từ các câu hỏi trong ngân hàng
   - Chấm điểm tự động
```

## QUY TẮC VÀ RÀNG BUỘC

### Ràng Buộc Bắt Buộc

1. ✅ **QuestionBank phải có course_id**
   - Không thể tạo ngân hàng câu hỏi mà không chọn khóa học
   - Mỗi ngân hàng câu hỏi chỉ thuộc về 1 khóa học

2. ✅ **Question phải có bank_id**
   - Không thể tạo câu hỏi mà không chọn ngân hàng câu hỏi
   - Mỗi câu hỏi chỉ thuộc về 1 ngân hàng câu hỏi

### Quy Tắc Nghiệp Vụ

1. **Một khóa học có thể có nhiều ngân hàng câu hỏi**
   - Cho phép tổ chức câu hỏi theo chủ đề
   - Dễ quản lý khi khóa học có nhiều nội dung

2. **Một ngân hàng câu hỏi chỉ thuộc về 1 khóa học**
   - Đảm bảo tính nhất quán
   - Tránh nhầm lẫn khi sử dụng

3. **Khi xóa khóa học**
   - ⚠️ Cần xử lý các ngân hàng câu hỏi liên quan
   - Có thể xóa cùng lúc hoặc chuyển sang khóa học khác

4. **Khi xóa ngân hàng câu hỏi**
   - ⚠️ Tất cả câu hỏi trong ngân hàng cũng bị xóa
   - ⚠️ Không thể xóa nếu đã được sử dụng trong session đã hoàn thành

## VÍ DỤ THỰC TẾ

### Ví Dụ 1: Khóa Học Đơn Giản

```
Khóa học: "An toàn điện"
└── Ngân hàng câu hỏi: "Câu hỏi An toàn điện"
    ├── Câu hỏi 1: "Điện áp an toàn là bao nhiêu?"
    ├── Câu hỏi 2: "Cách xử lý khi bị điện giật?"
    └── Câu hỏi 3: "Thiết bị bảo vệ điện là gì?"
```

### Ví Dụ 2: Khóa Học Phức Tạp

```
Khóa học: "An toàn lao động tổng hợp"
├── Ngân hàng câu hỏi: "An toàn cơ bản"
│   ├── Câu hỏi 1: "An toàn lao động là gì?"
│   ├── Câu hỏi 2: "Quyền lợi của người lao động?"
│   └── Câu hỏi 3: "Trách nhiệm của người lao động?"
│
├── Ngân hàng câu hỏi: "Thiết bị bảo hộ"
│   ├── Câu hỏi 1: "PPE là gì?"
│   ├── Câu hỏi 2: "Khi nào cần dùng mũ bảo hiểm?"
│   └── Câu hỏi 3: "Cách bảo quản thiết bị bảo hộ?"
│
└── Ngân hàng câu hỏi: "Xử lý sự cố"
    ├── Câu hỏi 1: "Quy trình xử lý khi có tai nạn?"
    ├── Câu hỏi 2: "Cách sơ cứu người bị thương?"
    └── Câu hỏi 3: "Báo cáo sự cố như thế nào?"
```

## LỢI ÍCH CỦA CẤU TRÚC NÀY

### 1. Tính Linh Hoạt

- ✅ Có thể tạo nhiều ngân hàng câu hỏi cho một khóa học
- ✅ Có thể tổ chức câu hỏi theo chủ đề, mức độ khó, v.v.
- ✅ Dễ dàng thêm/sửa/xóa câu hỏi mà không ảnh hưởng đến khóa học

### 2. Tái Sử Dụng

- ✅ Câu hỏi trong ngân hàng có thể được sử dụng cho nhiều session
- ✅ Không cần tạo lại câu hỏi mỗi lần
- ✅ Có thể tạo nhiều bài kiểm tra khác nhau từ cùng một ngân hàng

### 3. Quản Lý Dễ Dàng

- ✅ Tìm kiếm câu hỏi theo khóa học hoặc ngân hàng
- ✅ Import/export câu hỏi theo từng ngân hàng
- ✅ Thống kê số lượng câu hỏi theo khóa học

### 4. Mở Rộng

- ✅ Dễ dàng thêm ngân hàng câu hỏi mới cho khóa học
- ✅ Có thể chia sẻ ngân hàng câu hỏi giữa các khóa học (nếu cần)
- ✅ Hỗ trợ nhiều loại câu hỏi khác nhau

## SO SÁNH VỚI CÁC CẤU TRÚC KHÁC

### Cấu Trúc Hiện Tại (Được Sử Dụng)

```
Course → QuestionBank → Question
```

**Ưu điểm:**
- ✅ Linh hoạt, có thể có nhiều ngân hàng cho một khóa học
- ✅ Tổ chức câu hỏi rõ ràng
- ✅ Dễ quản lý và mở rộng

**Nhược điểm:**
- ⚠️ Cần tạo ngân hàng câu hỏi trước khi thêm câu hỏi
- ⚠️ Có thêm một lớp trung gian

### Cấu Trúc Thay Thế (Không Được Sử Dụng)

```
Course → Question (trực tiếp)
```

**Ưu điểm:**
- ✅ Đơn giản hơn, ít lớp hơn

**Nhược điểm:**
- ❌ Khó tổ chức khi có nhiều câu hỏi
- ❌ Khó tái sử dụng câu hỏi
- ❌ Khó quản lý theo chủ đề

## KẾT LUẬN

**Mối quan hệ giữa Ngân hàng câu hỏi và Khóa học:**

1. **Một khóa học có thể có nhiều ngân hàng câu hỏi** (1-N)
2. **Một ngân hàng câu hỏi chỉ thuộc về một khóa học** (N-1)
3. **Một ngân hàng câu hỏi có nhiều câu hỏi** (1-N)

**Lợi ích:**
- Tổ chức câu hỏi theo chủ đề
- Tái sử dụng câu hỏi
- Quản lý linh hoạt
- Dễ mở rộng

**Quy trình sử dụng:**
1. Tạo Khóa học
2. Tạo Ngân hàng câu hỏi (gắn với khóa học)
3. Thêm Câu hỏi vào ngân hàng
4. Sử dụng trong Training Session

---

**Lưu ý**: Tài liệu này dựa trên cấu trúc database và logic nghiệp vụ hiện tại của hệ thống. Nếu có thay đổi, vui lòng cập nhật tài liệu này.

