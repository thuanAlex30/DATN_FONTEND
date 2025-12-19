# Mối Quan Hệ Giữa Ngân Hàng Câu Hỏi và Khóa Học

## Tổng Quan

Ngân hàng câu hỏi (Question Bank) và Khóa học (Course) có mối quan hệ **một-nhiều (One-to-Many)** trong hệ thống Training Management.

## MỐI QUAN HỆ CƠ BẢN

### Cấu Trúc Database

```
Course (Khóa học)
  └── (1) có thể có (N) QuestionBank (Ngân hàng câu hỏi)
        └── (1) có thể có (N) Question (Câu hỏi)
```

### Schema Relationships

**Course Model:**
```javascript
{
  _id: ObjectId,
  course_name: String,
  description: String,
  // ... các field khác
  // KHÔNG có field trực tiếp tham chiếu đến QuestionBank
}
```

**QuestionBank Model:**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,  // ✅ REQUIRED - Tham chiếu đến Course
  name: String,
  description: String,
  // ... các field khác
}
```

**Question Model:**
```javascript
{
  _id: ObjectId,
  bank_id: ObjectId,  // ✅ REQUIRED - Tham chiếu đến QuestionBank
  content: String,
  options: [String],
  correct_answer: String,
  // ... các field khác
}
```

## QUAN HỆ CHI TIẾT

### 1. Một Khóa Học Có Thể Có Nhiều Ngân Hàng Câu Hỏi

**Ví dụ:**
- **Khóa học**: "An toàn lao động cơ bản"
  - **Ngân hàng câu hỏi 1**: "Câu hỏi lý thuyết - Chương 1"
  - **Ngân hàng câu hỏi 2**: "Câu hỏi lý thuyết - Chương 2"
  - **Ngân hàng câu hỏi 3**: "Câu hỏi thực hành"
  - **Ngân hàng câu hỏi 4**: "Câu hỏi tổng hợp"

**Lợi ích:**
- ✅ Tổ chức câu hỏi theo chủ đề/chương
- ✅ Dễ quản lý và tìm kiếm
- ✅ Có thể tái sử dụng ngân hàng câu hỏi cho các khóa học khác (nếu cần)

### 2. Mỗi Ngân Hàng Câu Hỏi Chỉ Thuộc Về Một Khóa Học

**Ràng buộc:**
- ✅ `course_id` là **bắt buộc** (required) khi tạo QuestionBank
- ✅ Không thể tạo QuestionBank mà không có Course
- ✅ Một QuestionBank không thể thuộc về nhiều Course cùng lúc

**Ví dụ:**
```
QuestionBank "Câu hỏi An toàn điện"
  └── course_id: "An toàn lao động cơ bản" ✅
  └── KHÔNG THỂ thuộc về "An toàn hóa chất" cùng lúc ❌
```

### 3. Câu Hỏi Thuộc Về Ngân Hàng Câu Hỏi

**Cấu trúc:**
```
Course
  └── QuestionBank 1
        └── Question 1
        └── Question 2
        └── Question 3
  └── QuestionBank 2
        └── Question 4
        └── Question 5
```

## CÁCH HỆ THỐNG SỬ DỤNG MỐI QUAN HỆ NÀY

### 1. Khi Employee Làm Bài (Start Training)

**Luồng xử lý:**
```
1. Employee chọn Training Session
   └── Session có course_id

2. Hệ thống tìm QuestionBank theo course_id
   └── getQuestionBankByCourseId(course_id)

3. Lấy tất cả Questions từ QuestionBank đó
   └── getQuestionsByBankId(bank_id)

4. Hiển thị Questions cho Employee làm bài
```

**Code tham khảo:**
```javascript
// services/trainingService.js - startTraining()
const questionBank = await trainingRepository.getQuestionBankByCourseId(session.course_id);
const questions = await trainingRepository.getQuestionsByBankId(questionBank._id);
```

### 2. Khi Employee Nộp Bài (Submit Training)

**Luồng xử lý:**
```
1. Employee nộp bài với answers
   └── Session có course_id

2. Hệ thống tìm QuestionBank theo course_id
   └── getQuestionBankByCourseId(course_id)

3. Lấy Questions từ QuestionBank
   └── getQuestionsByBankId(bank_id)

4. So sánh answers với correct_answer
   └── Tính điểm tự động

5. Cập nhật Enrollment status (completed/failed)
```

**Code tham khảo:**
```javascript
// services/trainingService.js - submitTraining()
const questionBank = await trainingRepository.getQuestionBankByCourseId(session.course_id);
const questions = await trainingRepository.getQuestionsByBankId(questionBank._id);
// Tính điểm dựa trên questions và answers
```

### 3. Khi Quản Lý Ngân Hàng Câu Hỏi

**Từ UI:**
- **Tab "Ngân hàng câu hỏi"**: Xem tất cả QuestionBank, có thể filter theo Course
- **Card Course**: Click icon ❓ để quản lý QuestionBank của Course đó
- **Modal QuestionBank**: Hiển thị Course mà QuestionBank thuộc về

## CÁC TÌNH HUỐNG SỬ DỤNG

### Tình Huống 1: Một Khóa Học, Một Ngân Hàng Câu Hỏi

**Khi nào sử dụng:**
- Khóa học đơn giản, ít câu hỏi
- Không cần phân chia theo chủ đề

**Ví dụ:**
```
Course: "An toàn khi sử dụng máy móc"
  └── QuestionBank: "Câu hỏi An toàn máy móc"
        └── 20 câu hỏi
```

### Tình Huống 2: Một Khóa Học, Nhiều Ngân Hàng Câu Hỏi

**Khi nào sử dụng:**
- Khóa học phức tạp, nhiều chủ đề
- Cần tổ chức câu hỏi theo chương/mục
- Có thể chọn ngẫu nhiên từ nhiều ngân hàng

**Ví dụ:**
```
Course: "An toàn lao động toàn diện"
  └── QuestionBank 1: "Chương 1: An toàn điện"
        └── 15 câu hỏi
  └── QuestionBank 2: "Chương 2: An toàn hóa chất"
        └── 20 câu hỏi
  └── QuestionBank 3: "Chương 3: An toàn máy móc"
        └── 18 câu hỏi
  └── QuestionBank 4: "Tổng hợp"
        └── 25 câu hỏi
```

**Lưu ý:** Hiện tại hệ thống chỉ lấy **một QuestionBank** đầu tiên tìm thấy theo `course_id`. Nếu có nhiều QuestionBank, cần cải thiện logic để:
- Chọn ngẫu nhiên từ nhiều QuestionBank
- Hoặc cho phép chọn QuestionBank cụ thể khi tạo Session

## RÀNG BUỘC VÀ QUY TẮC

### Ràng Buộc Database

1. ✅ **QuestionBank phải có course_id**
   - Không thể tạo QuestionBank mà không có Course
   - `course_id` là required field

2. ✅ **Question phải có bank_id**
   - Không thể tạo Question mà không có QuestionBank
   - `bank_id` là required field

3. ✅ **Cascade Delete (nếu có)**
   - Khi xóa Course → Cần xử lý QuestionBank (có thể xóa hoặc giữ lại)
   - Khi xóa QuestionBank → Cần xử lý Questions (có thể xóa hoặc chuyển sang QuestionBank khác)

### Quy Tắc Nghiệp Vụ

1. ✅ **Một Course phải có ít nhất một QuestionBank**
   - Để Employee có thể làm bài và được chấm điểm
   - Nếu không có QuestionBank, không thể start training

2. ✅ **QuestionBank phải có ít nhất một Question**
   - Để có thể tạo bài kiểm tra
   - Nếu không có Question, không thể làm bài

3. ⚠️ **Hiện tại: Hệ thống chỉ lấy QuestionBank đầu tiên**
   - Nếu có nhiều QuestionBank cho một Course
   - Hệ thống sẽ lấy QuestionBank đầu tiên tìm thấy
   - **Cần cải thiện:** Cho phép chọn QuestionBank cụ thể

## API ENDPOINTS LIÊN QUAN

### 1. Lấy QuestionBank theo Course

**Endpoint:**
```
GET /api/training/question-banks/course/:courseId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "bank_id_1",
      "name": "Câu hỏi Chương 1",
      "course_id": {
        "_id": "course_id",
        "course_name": "An toàn lao động"
      }
    },
    {
      "_id": "bank_id_2",
      "name": "Câu hỏi Chương 2",
      "course_id": {
        "_id": "course_id",
        "course_name": "An toàn lao động"
      }
    }
  ]
}
```

### 2. Tạo QuestionBank

**Endpoint:**
```
POST /api/training/question-banks
```

**Request Body:**
```json
{
  "name": "Câu hỏi An toàn điện",
  "description": "Ngân hàng câu hỏi về an toàn điện",
  "course_id": "course_id_here"  // ✅ REQUIRED
}
```

### 3. Lấy QuestionBank khi làm bài

**Internal API (trong service):**
```javascript
// Tự động được gọi khi startTraining()
const questionBank = await trainingRepository.getQuestionBankByCourseId(courseId);
```

## UI/UX LIÊN QUAN

### 1. Từ Card Course

**Hiển thị:**
- Icon ❓ (Câu hỏi) trên card Course
- Click vào → Mở modal "Quản lý ngân hàng câu hỏi"
- Hiển thị tất cả QuestionBank của Course đó

### 2. Từ Tab "Ngân hàng câu hỏi"

**Hiển thị:**
- Danh sách tất cả QuestionBank
- Filter theo Course (dropdown)
- Mỗi card hiển thị:
  - Tên QuestionBank
  - Course mà nó thuộc về
  - Số lượng câu hỏi

### 3. Khi Tạo QuestionBank

**Form yêu cầu:**
- ✅ Tên QuestionBank (bắt buộc)
- ✅ Chọn Course (bắt buộc) - dropdown danh sách Course
- ❌ Mô tả (tùy chọn)

## LƯU Ý QUAN TRỌNG

### 1. Khi Xóa Course

**Cần xử lý:**
- ⚠️ QuestionBank thuộc về Course đó sẽ mất liên kết
- **Giải pháp:**
  - Xóa tất cả QuestionBank và Questions (cascade delete)
  - Hoặc chuyển QuestionBank sang Course khác
  - Hoặc cảnh báo người dùng trước khi xóa

### 2. Khi Xóa QuestionBank

**Cần xử lý:**
- ⚠️ Tất cả Questions trong QuestionBank sẽ mất liên kết
- **Giải pháp:**
  - Xóa tất cả Questions (cascade delete)
  - Hoặc chuyển Questions sang QuestionBank khác
  - Hoặc cảnh báo người dùng trước khi xóa

### 3. Khi Có Nhiều QuestionBank Cho Một Course

**Vấn đề hiện tại:**
- Hệ thống chỉ lấy QuestionBank đầu tiên tìm thấy
- Không có cách chọn QuestionBank cụ thể

**Giải pháp đề xuất:**
- Thêm field `question_bank_id` vào TrainingSession
- Cho phép chọn QuestionBank khi tạo Session
- Hoặc chọn ngẫu nhiên từ nhiều QuestionBank

## TÓM TẮT

### Mối Quan Hệ

```
Course (1) ──< (N) QuestionBank (1) ──< (N) Question
```

### Đặc Điểm

- ✅ **Một Course có thể có nhiều QuestionBank**
- ✅ **Một QuestionBank chỉ thuộc về một Course**
- ✅ **Một QuestionBank có nhiều Questions**
- ✅ **Một Question chỉ thuộc về một QuestionBank**

### Sử Dụng Trong Hệ Thống

- ✅ Khi Employee làm bài: Lấy QuestionBank theo `course_id` từ Session
- ✅ Khi chấm điểm: So sánh answers với Questions từ QuestionBank
- ✅ Khi quản lý: Có thể tạo nhiều QuestionBank cho một Course để tổ chức tốt hơn

### Best Practices

- ✅ Tạo QuestionBank theo chủ đề/chương để dễ quản lý
- ✅ Đặt tên QuestionBank rõ ràng, dễ hiểu
- ✅ Đảm bảo mỗi Course có ít nhất một QuestionBank
- ✅ Đảm bảo mỗi QuestionBank có đủ Questions để tạo bài kiểm tra

---

**Lưu ý:** Tài liệu này dựa trên phiên bản hiện tại của hệ thống. Nếu có thay đổi về cấu trúc hoặc logic, vui lòng cập nhật tài liệu này.

