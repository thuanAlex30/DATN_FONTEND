# 🔍 CÁC ĐIỂM CẦN CHỈNH SỬA TRONG TÀI LIỆU TRAINING

Sau khi so sánh với code backend, phát hiện các điểm cần chỉnh sửa:

## ❌ ĐIỂM SAI QUAN TRỌNG

### 1. **Submit Training - TỰ ĐỘNG TÍNH ĐIỂM**

**Tài liệu hiện tại nói:**
- Submit chỉ lưu answers, chờ admin chấm điểm
- Status enrollment vẫn là 'enrolled' sau khi submit
- Cần admin chấm điểm mới update status

**Code backend thực tế:**
```javascript
// trainingService.js line 616-685
async submitTraining(sessionId, userId, answers, score, completionTime) {
    // ...
    // Calculate actual score based on correct answers
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

    // Update enrollment with results
    const updatedEnrollment = await trainingRepository.updateTrainingEnrollment(enrollment._id, {
        status: passed ? 'completed' : 'failed',  // ✅ TỰ ĐỘNG UPDATE STATUS
        score: actualScore,
        passed: passed,
        completion_date: completionTime
    });
}
```

**Cần sửa:**
- Submit training TỰ ĐỘNG tính điểm
- TỰ ĐỘNG update enrollment status: 'completed' (nếu >= 70%) hoặc 'failed'
- KHÔNG có TrainingSubmission model
- KHÔNG cần admin chấm điểm

---

### 2. **TrainingSubmission Model KHÔNG TỒN TẠI**

**Tài liệu nói:**
- Có TrainingSubmission model
- Submit tạo TrainingSubmission với status 'submitted'
- Admin chấm điểm mới update

**Code backend thực tế:**
- ❌ KHÔNG có TrainingSubmission model
- ✅ Chỉ có TrainingEnrollment model
- ✅ Submit trực tiếp update enrollment

**Cần sửa:**
- Xóa tất cả references đến TrainingSubmission
- Chỉ dùng TrainingEnrollment

---

### 3. **Enrollment Status Flow**

**Tài liệu nói:**
```
enrolled → submitted → completed (nếu passed)
                      → failed (nếu không passed)
```

**Code backend thực tế:**
```
enrolled → completed (nếu passed >= 70%)
        → failed (nếu không passed < 70%)
```

**Không có status 'submitted'!**

**Cần sửa:**
- Xóa status 'submitted' khỏi flow
- Enrollment status chỉ có: 'enrolled', 'completed', 'failed', 'cancelled'

---

### 4. **Prerequisites Check**

**Tài liệu nói:**
- Có logic check prerequisites khi enroll

**Code backend thực tế:**
- ❌ KHÔNG thấy logic check prerequisites trong `createTrainingEnrollment`
- Chỉ có validation: session exists, user not enrolled, session not full

**Cần kiểm tra thêm:**
- Có thể prerequisites được check ở frontend
- Hoặc chưa implement

---

### 5. **Session Capacity Check**

**Tài liệu nói:**
- Check capacity trong service

**Code backend thực tế:**
- Service chỉ catch error từ repository
- Repository có unique index `{ session_id: 1, user_id: 1 }` để prevent duplicate
- Nhưng KHÔNG thấy logic check `max_participants`

**Cần kiểm tra:**
- Có thể check ở middleware hoặc validation layer
- Hoặc chưa implement đầy đủ

---

## ✅ CÁC ĐIỂM ĐÚNG

1. ✅ Start training: Đúng logic
2. ✅ Retake training: Đúng logic
3. ✅ Session status auto-update: Đúng
4. ✅ Questions không gửi correct_answer: Đúng
5. ✅ Manager permissions: Đúng
6. ✅ Routes và roles: Đúng

---

## 📝 CẦN CẬP NHẬT

### File: `CACH_HOAT_DONG_TRAINING.md`

1. **Section "Bước 3: Nộp bài"** - Cần sửa hoàn toàn:
   - Xóa phần về TrainingSubmission
   - Sửa thành: Submit tự động tính điểm và update enrollment
   - Pass threshold: 70%

2. **Section "Luồng chấm điểm"** - Cần xóa hoặc ghi chú:
   - Backend KHÔNG có chấm điểm manual
   - Tất cả tự động

3. **Section "State Transitions"** - Sửa:
   - Xóa 'submitted' status
   - Flow: enrolled → completed/failed

4. **Section "Cấu trúc dữ liệu"** - Xóa:
   - TrainingSubmission schema

### File: `HUONG_DAN_SU_DUNG_TRAINING.md`

1. **Section "Bước 6: Nộp bài"** - Sửa:
   - Sau khi nộp, kết quả hiển thị ngay
   - Không cần chờ chấm điểm

2. **Section "Bước 7: Xem kết quả"** - Sửa:
   - Kết quả có ngay sau khi nộp
   - Không cần chờ admin

3. **Section "Trạng thái Enrollment"** - Xóa:
   - 'submitted' status

---

## 🔧 CẦN KIỂM TRA THÊM

1. **Prerequisites check**: Có implement không?
2. **Session capacity check**: Có check `max_participants` không?
3. **TrainingAssignment model**: Có dùng không? (thấy trong getAvailableTrainingSessionsForEmployee)

