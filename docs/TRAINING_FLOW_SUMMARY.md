# 📚 TÓM TẮT LUỒNG TRAINING

## 🎯 LUỒNG NHANH

### **ADMIN (Quản lý)**
```
Route: /admin/training-management

1. Tạo Course Set
2. Tạo Course → Gán vào Course Set
3. Tạo Question Bank → Gán vào Course
4. Tạo Questions → Thêm vào Question Bank (hoặc Import Excel)
5. Tạo Training Session → Gán vào Course
6. (Optional) Gán nhân viên vào Session
```

**4 Tab quản lý:**
- ✅ **Khóa học**: CRUD courses
- ✅ **Buổi đào tạo**: CRUD sessions
- ✅ **Đăng ký**: Xem/quản lý enrollments
- ✅ **Ngân hàng câu hỏi**: CRUD question banks + questions

---

### **EMPLOYEE (Tham gia)**
```
Route: /employee/training hoặc /training

1. Xem danh sách khóa học (Tab "Khóa học có sẵn")
2. Click "Đăng ký" → Validation prerequisites → Tạo enrollment
3. Chờ session bắt đầu (status = ONGOING)
4. Click "Vào học" → Bắt đầu làm bài
5. Làm bài (chọn đáp án, timer, progress)
6. Click "Nộp bài" → Lưu submission, status = "submitted"
7. Chờ admin chấm điểm
8. Xem kết quả (sau khi admin chấm)
```

**3 Tab:**
- ✅ **Khóa học có sẵn**: Chưa đăng ký → Nút "Đăng ký"
- ✅ **Đã đăng ký**: Đã enroll → Nút "Vào học" / "Đã nộp, chờ chấm" / "Làm lại"
- ✅ **Đã hoàn thành**: Status = completed → Hiển thị điểm

---

## 🔄 STATUS FLOW

### **Enrollment Status:**
```
enrolled → submitted → completed (đậu)
                      → failed (rớt)
         ↓
    failed → enrolled (retake)
```

### **Session Status (tự động):**
```
SCHEDULED → ONGOING → COMPLETED
```

---

## 📍 VỊ TRÍ FILES

### **Frontend:**
- **Admin**: `DATN_FONTEND/src/pages/Admin/TrainingManagement/index.tsx`
- **Employee**: `DATN_FONTEND/src/pages/Employee/Training/index.tsx`
- **Training Session**: `DATN_FONTEND/src/pages/Employee/TrainingSession/index.tsx`
- **API Services**: `DATN_FONTEND/src/services/trainingApi.ts`

### **Backend:**
- **Controller**: `DATN_BACKEND/controllers/TrainingController.js`
- **Service**: `DATN_BACKEND/services/trainingService.js`
- **Models**: `DATN_BACKEND/models/`

---

## ⚠️ LƯU Ý

1. **Chấm điểm đã bị xóa khỏi Admin UI** (nhưng backend APIs vẫn có)
2. **Prerequisites**: Chỉ hoạt động nếu Course có `prerequisite_course_ids`
3. **Questions**: Không gửi `correct_answer` về frontend khi làm bài
4. **Submission**: Chỉ lưu answers, không tính điểm tự động

---

## 📊 CẤU TRÚC DỮ LIỆU CHÍNH

- **Course Set** → **Course** → **Question Bank** → **Questions**
- **Course** → **Training Session**
- **Session** + **User** → **Enrollment**
- **Enrollment** → **Training Submission** (khi nộp bài)

---

**Xem chi tiết đầy đủ tại:** `TRAINING_FLOW_COMPLETE.md`



