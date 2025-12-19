# 🔄 CÁCH HOẠT ĐỘNG CỦA LUỒNG TRAINING

## 📋 MỤC LỤC

1. [Tổng quan luồng](#tổng-quan-luồng)
2. [Luồng quản lý (Header Department)](#luồng-quản-lý-header-department)
3. [Luồng quản lý (Manager)](#luồng-quản-lý-manager)
4. [Luồng đăng ký (Employee)](#luồng-đăng-ký-employee)
5. [Luồng làm bài và nộp bài](#luồng-làm-bài-và-nộp-bài)
6. [Luồng chấm điểm](#luồng-chấm-điểm)
7. [Cơ chế tự động](#cơ-chế-tự-động)
8. [Database Operations](#database-operations)
9. [Validation Logic](#validation-logic)
10. [Error Handling](#error-handling)

---

## 🎯 TỔNG QUAN LUỒNG

```
┌─────────────────────────────────────────────────────────────────┐
│                    LUỒNG TRAINING TỔNG THỂ                      │
└─────────────────────────────────────────────────────────────────┘

HEADER DEPARTMENT          MANAGER              EMPLOYEE
     │                       │                     │
     ├─ 1. Tạo Course Set     │                     │
     ├─ 2. Tạo Course         │                     │
     ├─ 3. Tạo Question Bank  │                     │
     ├─ 4. Thêm Questions     │                     │
     ├─ 5. Tạo Training Session│                    │
     │                       │                     │
     │                       ├─ 6. Xem courses     │
     │                       ├─ 7. Xem employees  │
     │                       ├─ 8. Assign training│
     │                       ├─ 9. Xem reports    │
     │                       │                     │
     │                       │                     ├─ 10. Xem khóa học
     │                       │                     ├─ 11. Đăng ký
     │                       │                     ├─ 12. Chờ session bắt đầu
     │                       │                     ├─ 13. Bắt đầu làm bài
     │                       │                     ├─ 14. Làm bài
     │                       │                     ├─ 15. Nộp bài
     │                       │                     │
     ├─ 16. Chấm điểm (nếu cần)│                    ├─ 17. Xem kết quả
     │                       │                     │
     │                       │                     └─ 18. Làm lại (nếu rớt)
```

---

## 👨‍💼 LUỒNG QUẢN LÝ (HEADER DEPARTMENT)

### **1. Tạo Course Set**

**API Call:**
```
POST /api/training/course-sets
Headers: { Authorization: Bearer <token> }
Body: {
  name: "An toàn lao động",
  description: "Bộ khóa học về an toàn lao động"
}
```

**Backend Flow:**
```
Controller → Service → Repository → Database
```

**Chi tiết:**
1. **Controller** (`TrainingController.createCourseSet`):
   - Nhận request từ client
   - Lấy `tenant_id` từ `req.user.tenant_id`
   - Gọi `trainingService.createCourseSet(courseSetData, tenantId)`

2. **Service** (`TrainingService.createCourseSet`):
   - Validate dữ liệu
   - Gọi `trainingRepository.createCourseSet(courseSetData, tenantId)`

3. **Repository** (`TrainingRepository.createCourseSet`):
   - Tạo document mới: `new CourseSet({ ...courseSetData, tenant_id })`
   - Lưu vào database: `await courseSet.save()`
   - Return course set đã tạo

4. **Database Operation:**
   ```javascript
   INSERT INTO course_sets (tenant_id, name, description, created_at, updated_at)
   VALUES (tenantId, name, description, NOW(), NOW())
   ```

**Response:**
```json
{
  "success": true,
  "message": "Course set created successfully",
  "data": {
    "_id": "...",
    "name": "An toàn lao động",
    "description": "...",
    "tenant_id": "...",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### **2. Tạo Course**

**API Call:**
```
POST /api/training/courses
Body: {
  course_set_id: "...",
  course_name: "An toàn điện",
  description: "...",
  duration_hours: 8,
  is_mandatory: true,
  validity_months: 12
}
```

**Backend Flow:**
1. **Validation:**
   - Kiểm tra `course_set_id` tồn tại
   - Validate `duration_hours > 0`
   - Validate `validity_months` (nếu có)

2. **Repository:**
   ```javascript
   const course = new Course({
     tenant_id: tenantId,
     course_set_id: courseSetId,
     course_name: courseName,
     description: description,
     duration_hours: durationHours,
     is_mandatory: isMandatory,
     validity_months: validityMonths
   });
   await course.save();
   ```

3. **Database:**
   ```sql
   INSERT INTO courses (tenant_id, course_set_id, course_name, ...)
   VALUES (...)
   ```

---

### **3. Tạo Question Bank**

**API Call:**
```
POST /api/training/question-banks
Body: {
  course_id: "...",
  name: "Câu hỏi kiểm tra An toàn điện",
  description: "..."
}
```

**Backend Flow:**
1. Validate `course_id` tồn tại
2. Tạo Question Bank với `course_id` reference
3. Lưu vào database

---

### **4. Thêm Questions**

**Cách 1: Thêm thủ công**

**API Call:**
```
POST /api/training/questions
Body: {
  bank_id: "...",
  content: "Câu hỏi...",
  options: ["A", "B", "C", "D"],
  correct_answer: "A",
  points: 1,
  difficulty_level: "EASY",
  explanation: "..."
}
```

**Backend Flow:**
1. Validate `bank_id` tồn tại
2. Validate `options` có 4 phần tử
3. Validate `correct_answer` nằm trong `options`
4. Tạo Question và lưu

**Cách 2: Import từ Excel**

**API Call:**
```
POST /api/training/questions/import-excel
Content-Type: multipart/form-data
Body: {
  bank_id: "...",
  file: <excel_file>
}
```

**Backend Flow:**
1. Đọc file Excel bằng `xlsx` library
2. Parse từng row thành Question object
3. Validate từng question
4. Bulk insert vào database
5. Return số lượng questions đã import

---

### **5. Tạo Training Session**

**API Call:**
```
POST /api/training/sessions
Body: {
  course_id: "...",
  session_name: "Buổi 1 - An toàn điện cơ bản",
  start_time: "2024-01-20T09:00:00Z",
  end_time: "2024-01-20T17:00:00Z",
  max_participants: 50,
  location: "Phòng A101",
  status_code: "SCHEDULED"
}
```

**Backend Flow:**

1. **Validation:**
   ```javascript
   // Validate required fields
   if (!session_name || !course_id || !start_time || !end_time) {
     return error("Missing required fields");
   }
   
   // Validate course exists
   const course = await getCourseById(course_id);
   if (!course) {
     return error("Course not found");
   }
   
   // Validate dates
   if (new Date(start_time) >= new Date(end_time)) {
     return error("End time must be after start time");
   }
   
   // Validate max_participants
   if (max_participants < 1) {
     return error("max_participants must be >= 1");
   }
   ```

2. **Create Session:**
   ```javascript
   const session = new TrainingSession({
     tenant_id: tenantId,
     course_id: courseId,
     session_name: sessionName,
     start_time: startTime,
     end_time: endTime,
     max_participants: maxParticipants,
     location: location,
     status_code: "SCHEDULED"
   });
   await session.save();
   ```

3. **Event Emission:**
   - Emit `TRAINING_SESSION_CREATED` event qua Kafka
   - WebSocket broadcast cho các clients

---

## 👔 LUỒNG QUẢN LÝ (MANAGER)

**Vị trí truy cập:**
- **Route**: `/manager/training`
- **File**: `DATN_FONTEND/src/pages/Manager/Training/index.tsx`
- **Layout**: Manager Layout
- **Role**: Manager (role_level: 70)

**Quyền hạn của Manager:**
- ✅ `TRAINING_READ`: Xem courses, sessions, enrollments
- ✅ `TRAINING_UPDATE`: Cập nhật training (sessions, enrollments)
- ✅ `TRAINING_LIST`: Xem danh sách training
- ✅ `TRAINING_ENROLL`: Đăng ký employees vào training
- ✅ `TRAINING_ENROLLMENT_READ`: Xem enrollments
- ✅ `TRAINER_SESSION_READ`: Xem sessions
- ✅ `TRAINER_SESSION_UPDATE`: Cập nhật sessions
- ✅ `TRAINER_ASSIGNMENT_READ`: Xem assignments
- ✅ `TRAINER_ASSIGNMENT_UPDATE`: Cập nhật assignments
- ❌ `TRAINING_CREATE`: **KHÔNG có** quyền tạo courses/sessions (chỉ Header Department)
- ❌ `TRAINING_DELETE`: **KHÔNG có** quyền xóa courses/sessions

### **1. Xem Overview Dashboard**

**API Call:**
```
GET /api/training/department/:departmentId/dashboard
```

**Backend Flow:**
1. Lấy thông tin department
2. Lấy courses trong department
3. Lấy enrollments của employees trong department
4. Tính toán statistics:
   - Total employees
   - Total courses
   - Completed enrollments
   - In-progress enrollments
   - Failed enrollments
   - Completion rate

**Response:**
```json
{
  "success": true,
  "data": {
    "department": {
      "totalEmployees": 50,
      "totalCourses": 10
    },
    "statistics": {
      "completedEnrollments": 120,
      "inProgressEnrollments": 30,
      "failedEnrollments": 5,
      "completionRate": 75.5
    },
    "enrollments": [...]
  }
}
```

---

### **2. Xem Courses trong Department**

**API Call:**
```
GET /api/training/courses/department/:departmentId
```

**Backend Flow:**
1. Lấy courses trong phạm vi department (theo department scope)
2. Filter theo tenant_id
3. Populate course_set_id, question_bank info
4. Return courses với thông tin deployment status

**Manager có thể:**
- Xem danh sách courses
- Xem chi tiết course
- **Deploy course** (nếu có quyền) - làm cho course có sẵn cho employees

---

### **3. Xem Employees và Enrollments**

**API Call:**
```
GET /api/training/enrollments?departmentId=...
```

**Backend Flow:**
1. Lấy enrollments trong department
2. Filter theo department_id của manager
3. Populate user_id, session_id, course_id
4. Group by employee để hiển thị

**Manager có thể:**
- Xem danh sách employees trong department
- Xem enrollments của từng employee
- Xem progress và status của mỗi enrollment
- Click vào employee để xem chi tiết

---

### **4. Assign Training cho Employees**

**API Call:**
```
POST /api/training/enrollments
Body: {
  session_id: "...",
  user_id: "..." // Employee ID
}
```

**Backend Flow:**
1. **Validation:**
   - Kiểm tra manager có quyền assign trong department không
   - Kiểm tra employee thuộc department của manager
   - Kiểm tra session còn chỗ
   - Kiểm tra prerequisites (nếu có)

2. **Create Enrollment:**
   ```javascript
   const enrollment = new TrainingEnrollment({
     tenant_id: tenantId,
     session_id: sessionId,
     user_id: userId, // Employee được assign
     status: 'enrolled',
     enrolled_at: new Date(),
     assigned_by: managerId // Manager assign
   });
   await enrollment.save();
   ```

3. **Event:**
   - Emit `TRAINING_ENROLLMENT_CREATED` event
   - WebSocket notification cho employee

**Manager có thể:**
- Chọn employee từ danh sách
- Chọn course/session
- Assign training cho employee
- Xem danh sách employees đã được assign

---

### **5. Xem Reports và Statistics**

**API Call:**
```
GET /api/training/department/:departmentId/reports
```

**Manager có thể xem:**
- **Completion Rate**: % employees hoàn thành training
- **Progress by Course**: Tiến độ theo từng course
- **Employee Performance**: Hiệu suất của từng employee
- **Training Timeline**: Timeline các buổi training
- **Export Reports**: Xuất báo cáo Excel/PDF

---

### **6. Deploy Course (Nếu có quyền)**

**API Call:**
```
POST /api/training/courses/:courseId/deploy
```

**Backend Flow:**
1. Kiểm tra quyền deploy
2. Update course: `is_deployed = true`
3. Tạo sessions nếu cần
4. Notify employees

**Lưu ý:** Không phải tất cả manager đều có quyền deploy, tùy vào cấu hình.

---

### **So sánh Manager vs Header Department:**

| Chức năng | Header Department | Manager |
|-----------|-------------------|---------|
| Tạo Course Set | ✅ | ❌ |
| Tạo Course | ✅ | ❌ |
| Tạo Question Bank | ✅ | ❌ |
| Tạo Questions | ✅ | ❌ |
| Tạo Training Session | ✅ | ❌ |
| Xem Courses | ✅ | ✅ (trong department) |
| Xem Sessions | ✅ | ✅ (trong department) |
| Assign Training | ✅ | ✅ (cho employees) |
| Xem Enrollments | ✅ | ✅ (trong department) |
| Update Enrollments | ✅ | ✅ (trong department) |
| Xem Reports | ✅ | ✅ (trong department) |
| Deploy Course | ✅ | ⚠️ (tùy quyền) |

---

## 👤 LUỒNG ĐĂNG KÝ (EMPLOYEE)

### **Bước 1: Xem khóa học có sẵn**

**API Call:**
```
GET /api/training/courses/available?userId=...
```

**Backend Flow:**

1. **Repository Logic:**
   ```javascript
   async getAvailableCoursesForEmployee(userId, filters, tenantId) {
     // Lấy tất cả courses trong tenant
     const allCourses = await Course.find({ tenant_id: tenantId });
     
     // Lấy enrollments của user
     const userEnrollments = await TrainingEnrollment.find({ 
       user_id: userId,
       tenant_id: tenantId 
     }).populate('session_id');
     
     // Lấy course IDs đã enroll
     const enrolledCourseIds = userEnrollments.map(e => 
       e.session_id.course_id
     );
     
     // Filter: chỉ lấy courses chưa enroll
     const availableCourses = allCourses.filter(course => 
       !enrolledCourseIds.includes(course._id.toString())
     );
     
     // Check prerequisites
     const coursesWithPrereqCheck = await Promise.all(
       availableCourses.map(async (course) => {
         if (course.prerequisite_course_ids && course.prerequisite_course_ids.length > 0) {
           // Check if user completed all prerequisites
           const completedPrereqs = await checkPrerequisites(
             userId, 
             course.prerequisite_course_ids
           );
           return {
             ...course,
             can_enroll: completedPrereqs.allCompleted
           };
         }
         return { ...course, can_enroll: true };
       })
     );
     
     return coursesWithPrereqCheck.filter(c => c.can_enroll);
   }
   ```

2. **Response:**
   ```json
   {
     "success": true,
     "data": [
       {
         "_id": "...",
         "course_name": "An toàn điện",
         "description": "...",
         "is_mandatory": true,
         "duration_hours": 8
       }
     ]
   }
   ```

---

### **Bước 2: Đăng ký khóa học**

**API Call:**
```
POST /api/training/enrollments
Body: {
  session_id: "...",
  user_id: "..." // Tự động lấy từ token nếu là employee
}
```

**Backend Flow:**

1. **Controller:**
   ```javascript
   // Nếu user là employee, tự động set user_id
   if (userRole === 'employee') {
     enrollmentData.user_id = req.user.id;
   }
   ```

2. **Service Validation:**
   ```javascript
   async createTrainingEnrollment(enrollmentData, tenantId) {
     // 1. Validate session exists
     const session = await getTrainingSessionById(enrollmentData.session_id);
     if (!session) {
       throw new Error('Training session not found');
     }
     
     // 2. Check if user already enrolled
     const existingEnrollment = await getEnrollmentByUserAndSession(
       enrollmentData.user_id,
       enrollmentData.session_id
     );
     if (existingEnrollment) {
       throw new Error('User is already enrolled in this session');
     }
     
     // 3. Check session capacity
     const currentEnrollments = await TrainingEnrollment.countDocuments({
       session_id: enrollmentData.session_id
     });
     if (currentEnrollments >= session.max_participants) {
       throw new Error('Session is full');
     }
     
     // 4. Check prerequisites
     const course = await getCourseById(session.course_id);
     if (course.prerequisite_course_ids && course.prerequisite_course_ids.length > 0) {
       const prerequisitesMet = await checkPrerequisites(
         enrollmentData.user_id,
         course.prerequisite_course_ids
       );
       if (!prerequisitesMet.allCompleted) {
         throw new Error('Prerequisites not met');
       }
     }
     
     // 5. Check session status
     if (session.status_code === 'COMPLETED' || session.status_code === 'CANCELLED') {
       throw new Error('Cannot enroll in completed or cancelled session');
     }
     
     // 6. Create enrollment
     const enrollment = await createEnrollment({
       tenant_id: tenantId,
       session_id: enrollmentData.session_id,
       user_id: enrollmentData.user_id,
       status: 'enrolled',
       enrolled_at: new Date()
     });
     
     return enrollment;
   }
   ```

3. **Repository:**
   ```javascript
   async createEnrollment(enrollmentData, tenantId) {
     const enrollment = new TrainingEnrollment({
       tenant_id: tenantId,
       session_id: enrollmentData.session_id,
       user_id: enrollmentData.user_id,
       status: 'enrolled',
       enrolled_at: new Date()
     });
     
     // Unique index sẽ throw error nếu duplicate
     await enrollment.save();
     return enrollment;
   }
   ```

4. **Database:**
   ```sql
   INSERT INTO training_enrollments 
   (tenant_id, session_id, user_id, status, enrolled_at, created_at)
   VALUES (tenantId, sessionId, userId, 'enrolled', NOW(), NOW())
   ```

5. **Event:**
   - Emit `TRAINING_ENROLLMENT_CREATED` event
   - WebSocket notification cho user

**Response:**
```json
{
  "success": true,
  "message": "Training enrollment created successfully",
  "data": {
    "_id": "...",
    "session_id": {...},
    "user_id": {...},
    "status": "enrolled",
    "enrolled_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## 📝 LUỒNG LÀM BÀI VÀ NỘP BÀI

### **Bước 1: Bắt đầu làm bài**

**API Call:**
```
POST /api/training/sessions/:sessionId/start
Headers: { Authorization: Bearer <token> }
```

**Backend Flow:**

1. **Service Logic:**
   ```javascript
   async startTraining(sessionId, userId) {
     // 1. Get session
     const session = await getTrainingSessionById(sessionId);
     if (!session) {
       return error(404, 'Training session not found');
     }
     
     // 2. Update session status (auto-update based on time)
     await updateSessionStatus(session);
     const updatedSession = await getTrainingSessionById(sessionId);
     
     // 3. Check session is ONGOING
     if (updatedSession.status_code !== 'ONGOING') {
       return error(400, 'Training session is not currently active');
     }
     
     // 4. Check enrollment
     const enrollment = await getEnrollmentByUserAndSession(userId, sessionId);
     if (!enrollment) {
       return error(403, 'You are not enrolled in this training session');
     }
     
     // 5. Check enrollment status
     if (enrollment.status !== 'enrolled') {
       return error(400, `Cannot start training. Current status: ${enrollment.status}`);
     }
     
     // 6. Get course and question bank
     const course = await getCourseById(session.course_id);
     const questionBank = await getQuestionBankByCourseId(session.course_id);
     if (!questionBank) {
       return error(404, 'No question bank found for this course');
     }
     
     // 7. Get questions (KHÔNG gửi correct_answer)
     const questions = await getQuestionsByBankId(questionBank._id);
     const questionsForUser = questions.map(q => ({
       _id: q._id,
       content: q.content,
       options: q.options,
       points: q.points,
       difficulty_level: q.difficulty_level
       // KHÔNG có correct_answer
     }));
     
     // 8. Shuffle questions (randomize)
     const shuffledQuestions = shuffleArray(questionsForUser);
     
     return {
       session: {...},
       course: {...},
       enrollment: {...},
       questionBank: {...},
       questions: shuffledQuestions
     };
   }
   ```

2. **Frontend:**
   - Lưu questions vào state
   - Lưu vào localStorage (backup)
   - Bắt đầu timer
   - Hiển thị câu hỏi đầu tiên

---

### **Bước 2: Làm bài**

**Frontend Logic:**
```javascript
// State management
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [answers, setAnswers] = useState({});
const [timeLeft, setTimeLeft] = useState(sessionDuration);

// Auto-save to localStorage
useEffect(() => {
  localStorage.setItem('training_answers', JSON.stringify(answers));
  localStorage.setItem('training_progress', currentQuestionIndex);
}, [answers, currentQuestionIndex]);

// Timer countdown
useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        handleAutoSubmit(); // Tự động nộp khi hết thời gian
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

---

### **Bước 3: Nộp bài**

**API Call:**
```
POST /api/training/sessions/:sessionId/submit
Body: {
  answers: {
    "questionId1": "A",
    "questionId2": "B",
    ...
  },
  completionTime: "2024-01-15T10:30:00Z"
}
```

**Backend Flow:**

1. **Service Logic:**
   ```javascript
   async submitTraining(sessionId, userId, answers, completionTime) {
     // 1. Get session and enrollment
     const session = await getTrainingSessionById(sessionId);
     const enrollment = await getEnrollmentByUserAndSession(userId, sessionId);
     
     if (!enrollment) {
       return error(403, 'You are not enrolled in this training session');
     }
     
     // 2. Check enrollment status
     if (enrollment.status !== 'enrolled') {
       return error(400, 'Cannot submit. Current status: ' + enrollment.status);
     }
     
     // 3. Get question bank and questions
     const questionBank = await getQuestionBankByCourseId(session.course_id);
     const questions = await getQuestionsByBankId(questionBank._id);
     
     // 4. TỰ ĐỘNG TÍNH ĐIỂM
     let actualScore = 0;
     let correctAnswers = 0;
     
     questions.forEach(question => {
       const userAnswer = answers[question._id];
       if (userAnswer === question.correct_answer) {
         actualScore += question.points;
         correctAnswers++;
       }
     });
     
     const totalPossibleScore = questions.reduce((sum, q) => sum + q.points, 0);
     const passThreshold = 70; // 70% to pass
     const passed = (actualScore / totalPossibleScore) * 100 >= passThreshold;
     
     // 5. TỰ ĐỘNG UPDATE ENROLLMENT với kết quả
     const updatedEnrollment = await updateTrainingEnrollment(enrollment._id, {
       status: passed ? 'completed' : 'failed', // ✅ TỰ ĐỘNG UPDATE
       score: actualScore,
       passed: passed,
       completion_date: completionTime
     });
     
     return {
       enrollment: updatedEnrollment,
       results: {
         totalQuestions: questions.length,
         correctAnswers: correctAnswers,
         score: actualScore,
         totalPossibleScore: totalPossibleScore,
         percentage: Math.round((actualScore / totalPossibleScore) * 100),
         passed: passed,
         passThreshold: passThreshold
       }
     };
   }
   ```

2. **Database:**
   ```sql
   -- Update enrollment trực tiếp (KHÔNG có TrainingSubmission table)
   UPDATE training_enrollments 
   SET status = 'completed' (hoặc 'failed'),
       score = actualScore,
       passed = true/false,
       completion_date = NOW()
   WHERE _id = enrollmentId
   ```

3. **Event:**
   - Emit `TRAINING_SUBMITTED` event (nếu có)
   - WebSocket notification cho user với kết quả

**Response:**
```json
{
  "success": true,
  "message": "Training submitted successfully",
  "data": {
    "enrollment": {
      "_id": "...",
      "status": "completed", // hoặc "failed"
      "score": 85,
      "passed": true,
      "completion_date": "2024-01-15T10:30:00Z"
    },
    "results": {
      "totalQuestions": 20,
      "correctAnswers": 17,
      "score": 85,
      "totalPossibleScore": 100,
      "percentage": 85,
      "passed": true,
      "passThreshold": 70
    }
  }
}
```

**Lưu ý quan trọng:**
- ✅ **TỰ ĐỘNG tính điểm** ngay khi submit
- ✅ **TỰ ĐỘNG update enrollment status** (completed/failed)
- ✅ **Pass threshold: 70%** (có thể config)
- ❌ **KHÔNG có TrainingSubmission model**
- ❌ **KHÔNG cần admin chấm điểm**

---

## ✅ LUỒNG CHẤM ĐIỂM

**⚠️ LƯU Ý QUAN TRỌNG:** 

Hệ thống **KHÔNG có chấm điểm thủ công**. Khi employee submit bài, hệ thống sẽ:

1. ✅ **TỰ ĐỘNG tính điểm** dựa trên đáp án đúng
2. ✅ **TỰ ĐỘNG xác định passed/failed** (threshold: 70%)
3. ✅ **TỰ ĐỘNG update enrollment status** (completed/failed)

**Không cần admin chấm điểm!**

**Pass/Fail Logic:**
```javascript
const passThreshold = 70; // 70% to pass
const passed = (actualScore / totalPossibleScore) * 100 >= passThreshold;

// Update enrollment
enrollment.status = passed ? 'completed' : 'failed';
enrollment.score = actualScore;
enrollment.passed = passed;
```

**Nếu muốn thêm chấm điểm thủ công trong tương lai:**
- Cần tạo TrainingSubmission model
- Cần thêm APIs cho admin chấm điểm
- Cần update flow để không tự động tính điểm

---

## ⚙️ CƠ CHẾ TỰ ĐỘNG

### **1. Auto-update Session Status**

**Cron Job hoặc Background Task:**
```javascript
// Chạy mỗi phút
async function updateSessionStatuses() {
  const now = new Date();
  
  // Update SCHEDULED → ONGOING
  await TrainingSession.updateMany(
    {
      status_code: 'SCHEDULED',
      start_time: { $lte: now }
    },
    {
      $set: { status_code: 'ONGOING' }
    }
  );
  
  // Update ONGOING → COMPLETED
  await TrainingSession.updateMany(
    {
      status_code: 'ONGOING',
      end_time: { $lte: now }
    },
    {
      $set: { status_code: 'COMPLETED' }
    }
  );
}
```

**Hoặc trong Service:**
```javascript
async updateSessionStatus(session) {
  const now = new Date();
  
  if (session.status_code === 'SCHEDULED' && session.start_time <= now) {
    session.status_code = 'ONGOING';
    await session.save();
  }
  
  if (session.status_code === 'ONGOING' && session.end_time <= now) {
    session.status_code = 'COMPLETED';
    await session.save();
  }
  
  return session;
}
```

---

### **2. Prerequisites Check**

**Logic:**
```javascript
async checkPrerequisites(userId, prerequisiteCourseIds) {
  // Lấy tất cả enrollments completed của user
  const completedEnrollments = await TrainingEnrollment.find({
    user_id: userId,
    status: 'completed',
    passed: true
  }).populate({
    path: 'session_id',
    populate: { path: 'course_id' }
  });
  
  const completedCourseIds = completedEnrollments.map(e => 
    e.session_id.course_id._id.toString()
  );
  
  // Check từng prerequisite
  const missingPrereqs = prerequisiteCourseIds.filter(prereqId => 
    !completedCourseIds.includes(prereqId.toString())
  );
  
  return {
    allCompleted: missingPrereqs.length === 0,
    missingPrerequisites: missingPrereqs,
    completedPrerequisites: prerequisiteCourseIds.filter(id => 
      completedCourseIds.includes(id.toString())
    )
  };
}
```

---

## 💾 DATABASE OPERATIONS

### **Schema Relationships:**

```
CourseSet (1) ──→ (N) Course (1) ──→ (N) QuestionBank (1) ──→ (N) Question
                                                                    │
Course (1) ──→ (N) TrainingSession (1) ──→ (N) TrainingEnrollment
                                                      │
                                                      └──→ (1) TrainingSubmission
```

### **Indexes:**

```javascript
// TrainingEnrollment
{ session_id: 1, user_id: 1 } // Unique compound index
{ tenant_id: 1 }
{ user_id: 1 }
{ status: 1 }

// TrainingSession
{ course_id: 1 }
{ status_code: 1 }
{ start_time: 1 }
{ tenant_id: 1 }

// Question
{ bank_id: 1 }
```

---

## ✅ VALIDATION LOGIC

### **Enrollment Validation:**

1. **Session exists:** ✓
2. **User not already enrolled:** ✓ (Unique index)
3. **Session not full:** `count(enrollments) < max_participants`
4. **Session status valid:** `status_code IN ('SCHEDULED', 'ONGOING')`
5. **Prerequisites met:** All prerequisite courses completed

### **Start Training Validation:**

1. **Session exists:** ✓
2. **User enrolled:** ✓
3. **Enrollment status = 'enrolled':** ✓
4. **Session status = 'ONGOING':** ✓
5. **Question bank exists:** ✓
6. **Questions exist:** `count(questions) > 0`

### **Submit Validation:**

1. **Enrollment exists:** ✓
2. **Enrollment status = 'enrolled':** ✓
3. **Session exists:** ✓
4. **Question bank exists:** ✓
5. **Answers format valid:** Object with questionId: answer

**Lưu ý:** 
- Submit sẽ tự động tính điểm và update enrollment
- Không cần check "already submitted" vì status sẽ thay đổi ngay

---

## 🚨 ERROR HANDLING

### **Common Errors:**

1. **"Training session not found"** (404)
   - Session ID không tồn tại
   - Session đã bị xóa

2. **"User is already enrolled in this session"** (400)
   - Unique index violation
   - User đã đăng ký rồi

3. **"Session is full"** (400)
   - `count(enrollments) >= max_participants`

4. **"Prerequisites not met"** (400)
   - User chưa hoàn thành khóa học tiên quyết

5. **"Training session is not currently active"** (400)
   - Session chưa đến thời gian bắt đầu
   - Session đã kết thúc

6. **"Cannot start training. Current status: X"** (400)
   - Enrollment status không phải 'enrolled'
   - Đã submit hoặc completed rồi

7. **"No question bank found for this course"** (404)
   - Course chưa có question bank

---

## 🔄 STATE TRANSITIONS

### **Session Status:**
```
SCHEDULED → ONGOING → COMPLETED
     ↓
  CANCELLED (manual)
```

### **Enrollment Status:**
```
enrolled → completed (nếu passed >= 70%)
        → failed (nếu không passed < 70%)
     ↓
  cancelled (manual)
     ↓
  failed → enrolled (retake)
```

**Lưu ý:** 
- ❌ **KHÔNG có status 'submitted'**
- ✅ Submit tự động chuyển sang 'completed' hoặc 'failed'
- ✅ Pass threshold: 70%

---

## 📊 SEQUENCE DIAGRAM

### **Enrollment Flow:**
```
Employee          Frontend          Backend           Database
   │                  │                 │                 │
   ├─ Click "Đăng ký" │                 │                 │
   │                  ├─ POST /enrollments                │
   │                  │                 ├─ Validate        │
   │                  │                 ├─ Check session   │
   │                  │                 ├─ Check capacity  │
   │                  │                 ├─ Check prereqs   │
   │                  │                 ├─ INSERT         │
   │                  │                 │                 │
   │                  │←────────────────┼─────────────────┤
   │                  │  Success        │                 │
   │←─────────────────┤                 │                 │
   │  Reload page     │                 │                 │
```

### **Start Training Flow:**
```
Employee          Frontend          Backend           Database
   │                  │                 │                 │
   ├─ Click "Vào học" │                 │                 │
   │                  ├─ POST /sessions/:id/start         │
   │                  │                 ├─ Get session    │
   │                  │                 ├─ Update status  │
   │                  │                 ├─ Check enrollment│
   │                  │                 ├─ Get questions  │
   │                  │                 ├─ Shuffle        │
   │                  │                 │                 │
   │                  │←────────────────┼─────────────────┤
   │                  │  Questions      │                 │
   │←─────────────────┤                 │                 │
   │  Show questions  │                 │                 │
```

### **Submit Flow:**
```
Employee          Frontend          Backend           Database
   │                  │                 │                 │
   ├─ Click "Nộp bài" │                 │                 │
   │                  ├─ POST /sessions/:id/submit        │
   │                  │                 ├─ Validate       │
   │                  │                 ├─ INSERT submission│
   │                  │                 │                 │
   │                  │←────────────────┼─────────────────┤
   │                  │  Success        │                 │
   │←─────────────────┤                 │                 │
   │  Show message    │                 │                 │
```

---

## 🎯 TÓM TẮT

### **Luồng hoạt động chính:**

1. **Setup:** Header Department tạo Course Set → Course → Question Bank → Questions → Session
2. **Enrollment:** Employee xem courses → Đăng ký → Validation (prerequisites, capacity)
3. **Start:** Employee click "Vào học" → Backend validate → Return questions (shuffled, no answers)
4. **Submit:** Employee làm bài → Nộp → Backend lưu submission (status: 'submitted')
5. **Grade:** Admin chấm điểm → Update submission và enrollment → Notify user

### **Điểm quan trọng:**

- ✅ **Security:** `correct_answer` KHÔNG được gửi về frontend khi làm bài
- ✅ **Auto-grading:** Submit tự động tính điểm và update enrollment (pass threshold: 70%)
- ✅ **Validation:** Nhiều lớp validation (Controller → Service → Repository → Database)
- ✅ **Auto-update:** Session status tự động cập nhật
- ⚠️ **Prerequisites:** Cần kiểm tra xem có implement không
- ⚠️ **Capacity:** Cần kiểm tra logic check `max_participants`
- ✅ **Events:** Kafka events và WebSocket notifications
- ✅ **Error Handling:** Comprehensive error messages
- ❌ **TrainingSubmission:** KHÔNG có model này, chỉ dùng TrainingEnrollment

---

**Tài liệu này mô tả chi tiết cách hoạt động của luồng Training từ frontend đến backend và database.**

