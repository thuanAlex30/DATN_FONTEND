# 📚 TOÀN BỘ LUỒNG TRAINING ĐÃ XÂY DỰNG

## 🎯 TỔNG QUAN

Hệ thống Training được chia thành 2 luồng chính:
1. **Luồng Quản lý (Admin)**: Tạo và quản lý khóa học, câu hỏi, buổi đào tạo
2. **Luồng Tham gia (Employee)**: Đăng ký, làm bài, nộp bài, xem kết quả

---

## 📋 PHẦN 1: LUỒNG QUẢN LÝ (ADMIN)

### **Vị trí truy cập:**
- **Route**: `/admin/training-management`
- **File**: `DATN_FONTEND/src/pages/Admin/TrainingManagement/index.tsx`
- **Layout**: Admin Layout (có Header với menu Training Management)

### **Các Tab quản lý:**

#### **1. Tab "Khóa học" (Courses)**
**Chức năng:**
- ✅ Xem danh sách tất cả khóa học
- ✅ Tạo khóa học mới
- ✅ Sửa khóa học
- ✅ Xóa khóa học
- ✅ Xem chi tiết khóa học
- ✅ Lọc theo Course Set, Bắt buộc/Tự chọn, Tìm kiếm

**Form tạo/sửa:**
```
- Course Set ID (dropdown)
- Course Name
- Description
- Duration Hours
- Is Mandatory (checkbox)
- Validity Months
```

**API sử dụng:**
- `GET /training/courses` - Lấy danh sách
- `POST /training/courses` - Tạo mới
- `PUT /training/courses/:id` - Sửa
- `DELETE /training/courses/:id` - Xóa

---

#### **2. Tab "Buổi đào tạo" (Sessions)**
**Chức năng:**
- ✅ Xem danh sách buổi đào tạo
- ✅ Tạo buổi đào tạo mới
- ✅ Sửa buổi đào tạo
- ✅ Xóa buổi đào tạo
- ✅ Xem chi tiết buổi đào tạo
- ✅ Lọc theo Course, Status, Thời gian

**Form tạo/sửa:**
```
- Course ID (dropdown)
- Session Name
- Start Time (DatePicker)
- End Time (DatePicker)
- Max Participants
- Location
- Status Code (SCHEDULED/ONGOING/COMPLETED/CANCELLED)
```

**API sử dụng:**
- `GET /training/sessions` - Lấy danh sách
- `POST /training/sessions` - Tạo mới
- `PUT /training/sessions/:id` - Sửa
- `DELETE /training/sessions/:id` - Xóa

**Lưu ý:**
- Status tự động cập nhật qua Cron Job (SCHEDULED → ONGOING → COMPLETED)
- Validation: End time phải sau Start time

---

#### **3. Tab "Đăng ký" (Enrollments)**
**Chức năng:**
- ✅ Xem danh sách đăng ký của tất cả nhân viên
- ✅ Tạo đăng ký mới (gán nhân viên vào session)
- ✅ Sửa trạng thái đăng ký
- ✅ Xóa đăng ký
- ✅ Lọc theo Session, Employee, Status

**Form tạo:**
```
- Session ID (dropdown)
- User ID (dropdown - chọn nhân viên)
```

**Trạng thái Enrollment:**
- `enrolled`: Đã đăng ký, chưa làm bài
- `submitted`: Đã nộp bài, chờ chấm điểm
- `completed`: Đã hoàn thành (đã chấm, đậu)
- `failed`: Không đạt (đã chấm, rớt)
- `cancelled`: Đã hủy

**API sử dụng:**
- `GET /training/enrollments` - Lấy danh sách
- `POST /training/enrollments` - Tạo mới
- `PUT /training/enrollments/:id` - Sửa
- `DELETE /training/enrollments/:id` - Xóa

---

#### **4. Tab "Ngân hàng câu hỏi" (Question Banks)**
**Chức năng:**
- ✅ Xem danh sách ngân hàng câu hỏi
- ✅ Tạo ngân hàng câu hỏi mới
- ✅ Sửa ngân hàng câu hỏi
- ✅ Xóa ngân hàng câu hỏi
- ✅ Xem chi tiết + danh sách câu hỏi trong bank
- ✅ Lọc theo Course

**Form tạo/sửa:**
```
- Course ID (dropdown)
- Name
- Description
```

**API sử dụng:**
- `GET /training/question-banks` - Lấy danh sách
- `POST /training/question-banks` - Tạo mới
- `PUT /training/question-banks/:id` - Sửa
- `DELETE /training/question-banks/:id` - Xóa

**Trong Modal chi tiết Question Bank:**
- Hiển thị danh sách Questions
- Tạo câu hỏi mới
- Sửa câu hỏi
- Xóa câu hỏi
- Import từ Excel
- Download template Excel

**Form tạo/sửa Question:**
```
- Bank ID
- Content (câu hỏi)
- Options (mảng 4 đáp án: A, B, C, D)
- Correct Answer (chọn 1 trong 4 đáp án)
- Points (điểm số)
- Difficulty Level (EASY/MEDIUM/HARD)
- Explanation (giải thích đáp án)
```

**API Questions:**
- `GET /training/questions?bankId=xxx` - Lấy danh sách
- `POST /training/questions` - Tạo mới
- `PUT /training/questions/:id` - Sửa
- `DELETE /training/questions/:id` - Xóa
- `POST /training/questions/import-excel` - Import từ Excel

---

### **Các tính năng bổ sung:**
- ✅ Filter/Search cho tất cả các tab
- ✅ Pagination
- ✅ Validation form
- ✅ Error handling
- ✅ Success/Error messages

---

## 👤 PHẦN 2: LUỒNG THAM GIA (EMPLOYEE)

### **Vị trí truy cập:**
- **Route**: `/employee/training` hoặc `/training`
- **File**: `DATN_FONTEND/src/pages/Employee/Training/index.tsx`
- **Layout**: Employee Layout (có Sidebar với menu "Đào tạo")

### **Các Tab:**

#### **1. Tab "Khóa học có sẵn" (Available Courses)**
**Hiển thị:**
- Danh sách khóa học chưa đăng ký
- Thông tin: Tên, Mô tả, Thời lượng, Thời hạn, Course Set
- Tag "Bắt buộc" nếu `is_mandatory = true`

**Actions:**
- ✅ Nút "Đăng ký" → Gọi API đăng ký

**Luồng đăng ký:**
```
1. Employee click "Đăng ký"
   ↓
2. Frontend gọi: GET /training/courses/:courseId/available-sessions
   - Tìm sessions có status = SCHEDULED hoặc ONGOING
   - Chưa đầy (enrollments < max_participants)
   - User chưa enroll
   ↓
3. Nếu không có session → Hiển thị warning
   ↓
4. Nếu có → Chọn session đầu tiên (hoặc để user chọn)
   ↓
5. Gọi: POST /training/enrollments
   Body: {
     session_id: "...",
     user_id: "..."
   }
   ↓
6. Backend validation:
   - Kiểm tra session tồn tại
   - Kiểm tra user chưa enroll
   - Kiểm tra session còn chỗ
   - Kiểm tra prerequisites (nếu có)
   ↓
7. Tạo Enrollment:
   - status: "enrolled"
   - enrolled_at: now
   ↓
8. Success → Reload page → Chuyển sang tab "Đã đăng ký"
```

**Validation khi đăng ký:**
- ✅ Kiểm tra prerequisites (nếu course có `prerequisite_course_ids`)
- ✅ Kiểm tra session còn chỗ không
- ✅ Kiểm tra user chưa enroll session này
- ✅ Kiểm tra session status (không được COMPLETED/CANCELLED)

**Error messages:**
- "Bạn cần hoàn thành X khóa học tiên quyết trước"
- "Buổi đào tạo đã đầy, vui lòng chọn buổi khác"
- "Bạn đã đăng ký buổi đào tạo này rồi"

---

#### **2. Tab "Đã đăng ký" (Enrolled Courses)**
**Hiển thị:**
- Danh sách khóa học đã đăng ký
- Trạng thái: Badge màu (blue: enrolled, orange: submitted, green: completed, red: failed)
- Điểm số (nếu đã chấm)

**Trạng thái Enrollment:**
- `enrolled`: Đã đăng ký, chưa làm bài → Nút "Vào học"
- `submitted`: Đã nộp, chờ chấm → Nút disabled "Đã nộp, chờ chấm điểm"
- `completed`: Đã hoàn thành → Hiển thị điểm
- `failed`: Không đạt → Nút "Làm lại bài"

**Actions:**
- ✅ Nút "Vào học" → Bắt đầu làm bài
- ✅ Nút "Làm lại bài" → Retake training

---

#### **3. Tab "Đã hoàn thành" (Completed Courses)**
**Hiển thị:**
- Danh sách khóa học đã hoàn thành (status = `completed`)
- Điểm số
- Thông tin khóa học

---

### **Luồng làm bài (Training Session)**

**Route**: `/training/session`
**File**: `DATN_FONTEND/src/pages/Employee/TrainingSession/index.tsx`

#### **Bước 1: Bắt đầu làm bài**
```
1. Employee click "Vào học" từ tab "Đã đăng ký"
   ↓
2. Frontend gọi: POST /training/sessions/:sessionId/start
   ↓
3. Backend validation:
   - Kiểm tra user đã enroll
   - Kiểm tra enrollment status = "enrolled"
   - Kiểm tra session status = "ONGOING"
   - Kiểm tra chưa hết thời gian (now < end_time)
   ↓
4. Lấy Question Bank từ Course
   ↓
5. Randomize questions (shuffle)
   ↓
6. Trả về:
   - Session info
   - Course info
   - Questions (KHÔNG có correct_answer)
   - Time limit
   ↓
7. Frontend lưu vào state và localStorage
   ↓
8. Navigate đến /training/session với state data
```

**API Response:**
```json
{
  "success": true,
  "data": {
    "session": { "_id": "...", "session_name": "...", ... },
    "course": { "_id": "...", "course_name": "...", ... },
    "enrollment": { "_id": "...", "status": "enrolled", ... },
    "questionBank": { "_id": "...", "bank_name": "...", ... },
    "questions": [
      {
        "_id": "...",
        "content": "Câu hỏi...",
        "options": ["A", "B", "C", "D"],
        "points": 1,
        "difficulty_level": "EASY"
        // KHÔNG có correct_answer
      }
    ]
  }
}
```

---

#### **Bước 2: Làm bài**
**UI Features:**
- ✅ Hiển thị từng câu hỏi
- ✅ Radio buttons cho các đáp án
- ✅ Navigation: Previous/Next
- ✅ Progress bar (% câu đã làm)
- ✅ Timer đếm ngược
- ✅ Lưu answers vào state
- ✅ Auto-save vào localStorage

**State management:**
```javascript
{
  currentQuestionIndex: 0,
  answers: { questionId: "selectedAnswer" },
  timeLeft: seconds,
  isSubmitted: false
}
```

---

#### **Bước 3: Nộp bài**
```
1. Employee click "Nộp bài"
   ↓
2. Confirm dialog: "Bạn có chắc muốn nộp bài?"
   ↓
3. Frontend gọi: POST /training/sessions/:sessionId/submit
   Body: {
     answers: { questionId1: "answer1", questionId2: "answer2" },
     completionTime: "2024-01-15T10:30:00Z"
   }
   ↓
4. Backend validation:
   - Kiểm tra user đã enroll
   - Kiểm tra enrollment status = "enrolled"
   - Kiểm tra chưa submit (không có submission)
   ↓
5. Tạo TrainingSubmission:
   - enrollment_id
   - session_id
   - user_id
   - answers (object)
   - submitted_at
   - status: "submitted"
   ↓
6. Enrollment status: VẪN GIỮ "enrolled" (chưa có điểm)
   ↓
7. Response: "Bài làm đã được gửi. Vui lòng chờ admin chấm điểm."
   ↓
8. Frontend:
   - Hiển thị success message
   - Xóa localStorage
   - Navigate về /training
   ↓
9. Trong tab "Đã đăng ký":
   - Status badge chuyển sang màu cam: "Đã nộp, chờ chấm"
   - Nút disabled: "Đã nộp, chờ chấm điểm"
```

**API:** `POST /training/sessions/:sessionId/submit`

**Lưu ý:**
- Backend KHÔNG tính điểm tự động
- Chỉ lưu answers, chờ admin chấm
- Status submission = "submitted"

---

#### **Bước 4: Làm lại bài (Retake)**
```
1. Employee có enrollment status = "failed"
   ↓
2. Click "Làm lại bài"
   ↓
3. Confirm dialog với thông tin điểm cũ
   ↓
4. Frontend gọi: POST /training/sessions/:sessionId/retake
   ↓
5. Backend:
   - Reset enrollment status về "enrolled"
   - Xóa submission cũ (hoặc tạo mới)
   - Cho phép làm lại
   ↓
6. Navigate đến /training/session với isRetake: true
```

**API:** `POST /training/sessions/:sessionId/retake`

---

## 🔄 LUỒNG CHẤM ĐIỂM (ĐÃ XÓA KHỎI ADMIN UI)

**Lưu ý:** Phần chấm điểm đã bị xóa khỏi Admin Training Management, nhưng backend vẫn có APIs.

### **Backend APIs (vẫn tồn tại):**
- `GET /training/submissions/grading` - Lấy danh sách bài cần chấm
- `GET /training/submissions/:id/grading` - Lấy chi tiết bài làm để chấm
- `POST /training/submissions/:id/grade` - Chấm điểm

### **Luồng chấm điểm (nếu muốn thêm lại):**
```
1. Admin xem danh sách submissions với status = "submitted"
   ↓
2. Click "Chấm điểm" trên một submission
   ↓
3. Backend trả về:
   - Submission details
   - Questions với correct_answer
   - User answers
   ↓
4. Admin xem bài làm:
   - Câu hỏi
   - Đáp án đúng (highlight xanh)
   - Đáp án user chọn (highlight đỏ nếu sai)
   - Explanation
   ↓
5. Admin nhập:
   - Điểm số (0-100)
   - Passed (checkbox)
   - Nhận xét (optional)
   ↓
6. Click "Xác nhận chấm điểm"
   ↓
7. Backend:
   - Update TrainingSubmission: status = "graded"
   - Update Enrollment:
     * status: "completed" (nếu passed) hoặc "failed"
     * score: điểm số
     * passed: true/false
     * completion_date: now
   - Gửi WebSocket notification cho user
   ↓
8. User nhận thông báo kết quả
   ↓
9. Trong tab "Đã đăng ký":
   - Status badge chuyển sang màu xanh: "Hoàn thành" (nếu passed)
   - Hoặc màu đỏ: "Chưa đạt" (nếu failed)
   - Hiển thị điểm số
```

---

## 📊 CẤU TRÚC DỮ LIỆU

### **Course Set**
```javascript
{
  _id: string,
  name: string,
  description: string,
  created_at: string,
  updated_at: string
}
```

### **Course**
```javascript
{
  _id: string,
  course_set_id: { _id: string, name: string },
  course_name: string,
  description: string,
  duration_hours: number,
  is_mandatory: boolean,
  validity_months?: number,
  prerequisite_course_ids?: string[], // (nếu có)
  created_at: string,
  updated_at: string
}
```

### **Training Session**
```javascript
{
  _id: string,
  course_id: { _id: string, course_name: string },
  session_name: string,
  start_time: string,
  end_time: string,
  max_participants: number,
  location?: string,
  status_code: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED',
  created_at: string,
  updated_at: string
}
```

### **Training Enrollment**
```javascript
{
  _id: string,
  session_id: { _id: string, session_name: string, ... },
  user_id: { _id: string, full_name: string, email: string },
  enrolled_at: string,
  status: 'enrolled' | 'completed' | 'failed' | 'cancelled',
  score?: number,
  passed?: boolean,
  completion_date?: string,
  created_at: string,
  updated_at: string
}
```

### **Question Bank**
```javascript
{
  _id: string,
  course_id: { _id: string, course_name: string },
  name: string,
  description: string,
  created_at: string,
  updated_at: string
}
```

### **Question**
```javascript
{
  _id: string,
  bank_id: string,
  content: string,
  options: string[], // ["A", "B", "C", "D"]
  correct_answer: string,
  points: number,
  difficulty_level: 'EASY' | 'MEDIUM' | 'HARD',
  explanation?: string,
  created_at: string,
  updated_at: string
}
```

### **Training Submission**
```javascript
{
  _id: string,
  enrollment_id: string,
  session_id: { _id: string, session_name: string, course_id: {...} },
  user_id: { _id: string, full_name: string, email: string },
  answers: { questionId: "answer" }, // Object
  submitted_at: string,
  status: 'submitted' | 'graded',
  graded_at?: string,
  graded_by?: { _id: string, full_name: string },
  admin_comments?: string,
  questions?: Question[] // (khi admin xem để chấm)
}
```

---

## 🔄 STATUS FLOW

### **Session Status (tự động cập nhật qua Cron):**
```
SCHEDULED → ONGOING → COMPLETED
              ↓
          CANCELLED (nếu admin hủy)
```

### **Enrollment Status:**
```
enrolled → submitted → completed (nếu passed)
                      → failed (nếu không passed)
         ↓
    cancelled (nếu hủy)
         ↓
    failed → enrolled (nếu retake)
```

### **Submission Status:**
```
submitted → graded
```

---

## 🎯 TÓM TẮT LUỒNG HOÀN CHỈNH

### **Admin:**
1. Tạo Course Set
2. Tạo Course trong Course Set
3. Tạo Question Bank cho Course
4. Tạo Questions trong Question Bank (hoặc Import Excel)
5. Tạo Training Session cho Course
6. (Optional) Gán nhân viên vào Session

### **Employee:**
1. Xem danh sách khóa học có sẵn
2. Đăng ký khóa học (kiểm tra prerequisites, session còn chỗ)
3. Chờ đến thời gian bắt đầu (Session status = ONGOING)
4. Click "Vào học" → Bắt đầu làm bài
5. Làm bài (chọn đáp án, timer, progress)
6. Nộp bài → Status: "submitted", chờ admin chấm
7. (Nếu failed) Làm lại bài
8. Xem kết quả (sau khi admin chấm)

### **Admin chấm điểm (đã xóa UI, nhưng backend có):**
1. Xem danh sách submissions status = "submitted"
2. Click "Chấm điểm"
3. Xem bài làm (câu hỏi, đáp án đúng, đáp án user)
4. Nhập điểm, passed, nhận xét
5. Xác nhận → Update enrollment, gửi notification

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Chấm điểm đã bị xóa khỏi Admin UI** nhưng backend APIs vẫn tồn tại
2. **Prerequisites**: Chỉ hoạt động nếu Course có field `prerequisite_course_ids`
3. **Session Status**: Tự động cập nhật qua Cron Job (không cần admin thủ công)
4. **Questions**: Không gửi `correct_answer` về frontend khi employee làm bài
5. **Submission**: Chỉ lưu answers, không tính điểm tự động
6. **Enrollment Status**: 
   - `enrolled` = chưa làm bài hoặc đang làm
   - `submitted` = đã nộp, chờ chấm (detect bằng: status = enrolled && score = null)
   - `completed` = đã chấm, đậu
   - `failed` = đã chấm, rớt

---

## 🚀 CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH

✅ Quản lý Course Set, Course, Session, Enrollment, Question Bank, Question
✅ Đăng ký khóa học với validation prerequisites
✅ Bắt đầu làm bài với shuffle questions
✅ Làm bài với timer, progress, navigation
✅ Nộp bài và lưu submission
✅ Làm lại bài (retake)
✅ Filter/Search cho tất cả các tab
✅ Import Questions từ Excel
✅ Validation form đầy đủ
✅ Error handling và messages
✅ Responsive UI

---

## ❌ CÁC TÍNH NĂNG ĐÃ XÓA

❌ Tab "Chấm điểm" trong Admin Training Management
❌ Modal chấm điểm
❌ Danh sách submissions cần chấm trong Admin UI
❌ Auto-grading (tính điểm tự động khi submit)

---

## 🔮 CÓ THỂ PHÁT TRIỂN THÊM

- Thêm lại tab chấm điểm cho Admin (nếu cần)
- Auto-grading (tính điểm tự động nếu muốn)
- Download certificate sau khi hoàn thành
- Thống kê chi tiết cho Admin
- Reminder notifications (24h trước, 1h trước)
- WebSocket real-time notifications
- Review bài làm sau khi hoàn thành
- Export báo cáo

---

**Tài liệu này mô tả toàn bộ luồng Training đã được xây dựng trong hệ thống.**




