# 📚 HƯỚNG DẪN SỬ DỤNG LUỒNG TRAINING

## 🎯 TỔNG QUAN

Hệ thống Training cho phép:
- **Header Department**: Tạo và quản lý khóa học, buổi đào tạo, câu hỏi
- **Employee**: Đăng ký, tham gia và hoàn thành các khóa đào tạo

---

## 👨‍💼 PHẦN 1: QUẢN LÝ TRAINING (HEADER DEPARTMENT)

**Lưu ý:** Manager cũng có quyền quản lý training trong phạm vi department của mình, nhưng với quyền hạn hạn chế hơn (xem phần Manager bên dưới).

### **Bước 1: Truy cập trang Quản lý Đào tạo**

1. Đăng nhập với tài khoản **Department Header**
2. Từ sidebar, click vào **"Quản lý đào tạo"** hoặc truy cập: `/header-department/training-management`

### **Bước 2: Tạo Bộ khóa học (Course Set)**

**Mục đích**: Nhóm các khóa học liên quan lại với nhau

1. Click tab **"Bộ khóa học"** (nếu có) hoặc tạo trực tiếp khi tạo Course
2. Click nút **"Thêm bộ khóa học"**
3. Điền thông tin:
   - **Tên bộ khóa học**: Ví dụ "An toàn lao động", "Kỹ năng mềm"
   - **Mô tả**: Mô tả ngắn về bộ khóa học
4. Click **"Lưu"**

### **Bước 3: Tạo Khóa học (Course)**

1. Click tab **"Khóa học"**
2. Click nút **"Thêm khóa học"**
3. Điền thông tin:
   - **Bộ khóa học**: Chọn bộ khóa học đã tạo
   - **Tên khóa học**: Ví dụ "An toàn điện", "Sơ cứu cơ bản"
   - **Mô tả**: Mô tả chi tiết về khóa học
   - **Thời lượng (giờ)**: Số giờ học dự kiến
   - **Thời hạn hiệu lực (tháng)**: Khóa học có hiệu lực trong bao nhiêu tháng (tùy chọn)
   - **Bắt buộc**: Check nếu khóa học bắt buộc phải hoàn thành
4. Click **"Lưu"**

### **Bước 4: Tạo Ngân hàng câu hỏi (Question Bank)**

1. Click tab **"Ngân hàng câu hỏi"**
2. Click nút **"Thêm ngân hàng câu hỏi"**
3. Điền thông tin:
   - **Khóa học**: Chọn khóa học đã tạo
   - **Tên ngân hàng**: Ví dụ "Câu hỏi kiểm tra An toàn điện"
   - **Mô tả**: Mô tả về ngân hàng câu hỏi
4. Click **"Lưu"**

### **Bước 5: Thêm Câu hỏi vào Ngân hàng**

**Cách 1: Thêm thủ công**

1. Từ tab **"Ngân hàng câu hỏi"**, click **"Xem"** hoặc **"Sửa"** trên ngân hàng câu hỏi
2. Trong modal, click **"Thêm câu hỏi"**
3. Điền thông tin:
   - **Nội dung câu hỏi**: Câu hỏi cần đặt
   - **Đáp án A, B, C, D**: 4 lựa chọn
   - **Đáp án đúng**: Chọn A, B, C hoặc D
   - **Điểm số**: Điểm cho câu hỏi này
   - **Mức độ**: Dễ / Trung bình / Khó
   - **Giải thích**: Giải thích tại sao đáp án đúng (tùy chọn)
4. Click **"Lưu"**

**Cách 2: Import từ Excel (Khuyến nghị cho nhiều câu hỏi)**

1. Từ modal ngân hàng câu hỏi, click **"Tải template Excel"**
2. Điền thông tin câu hỏi vào file Excel theo format:
   ```
   | Content | Option A | Option B | Option C | Option D | Correct Answer | Points | Difficulty | Explanation |
   ```
3. Click **"Import từ Excel"** và chọn file đã điền
4. Hệ thống sẽ tự động import tất cả câu hỏi

### **Bước 6: Tạo Buổi đào tạo (Training Session)**

1. Click tab **"Buổi đào tạo"**
2. Click nút **"Thêm buổi đào tạo"**
3. Điền thông tin:
   - **Khóa học**: Chọn khóa học đã tạo
   - **Tên buổi đào tạo**: Ví dụ "Buổi 1 - An toàn điện cơ bản"
   - **Thời gian bắt đầu**: Chọn ngày và giờ bắt đầu
   - **Thời gian kết thúc**: Chọn ngày và giờ kết thúc
   - **Số lượng tối đa**: Số người tối đa có thể tham gia
   - **Địa điểm**: Địa điểm tổ chức (tùy chọn)
   - **Trạng thái**: 
     - `SCHEDULED`: Đã lên lịch (chưa bắt đầu)
     - `ONGOING`: Đang diễn ra
     - `COMPLETED`: Đã hoàn thành
     - `CANCELLED`: Đã hủy
4. Click **"Lưu"**

**Lưu ý**: Trạng thái session sẽ tự động cập nhật qua hệ thống:
- `SCHEDULED` → `ONGOING` (khi đến thời gian bắt đầu)
- `ONGOING` → `COMPLETED` (khi đến thời gian kết thúc)

### **Bước 7: Phân công/Gán nhân viên (Tùy chọn)**

1. Click tab **"Phân công"** hoặc **"Đăng ký"**
2. Click **"Thêm phân công"** hoặc **"Tạo đăng ký"**
3. Chọn:
   - **Khóa học**: Chọn khóa học
   - **Phòng ban**: Chọn phòng ban cần gán
   - **Ghi chú**: Ghi chú về phân công (tùy chọn)
4. Click **"Lưu"**

**Lưu ý**: Nhân viên cũng có thể tự đăng ký từ trang Employee Training.

---

## 👔 PHẦN 1.5: QUẢN LÝ TRAINING (MANAGER)

**Lưu ý:** Manager có quyền quản lý training trong phạm vi department của mình, nhưng **KHÔNG thể tạo** courses/sessions mới (chỉ Header Department mới có quyền này).

### **Bước 1: Truy cập trang Quản lý Đào tạo**

1. Đăng nhập với tài khoản **Manager**
2. Từ sidebar, click vào **"Quản lý đào tạo"** hoặc truy cập: `/manager/training`

### **Bước 2: Xem Overview Dashboard**

1. Tab **"Tổng quan"** hiển thị:
   - Tổng số nhân viên trong department
   - Tổng số khóa học
   - Số enrollments đã hoàn thành
   - Số enrollments đang tiến hành
   - Số enrollments thất bại
   - Tỷ lệ hoàn thành (completion rate)
   - Biểu đồ thống kê

### **Bước 3: Xem Courses trong Department**

1. Click tab **"Khóa học"**
2. Xem danh sách courses trong department:
   - Tên khóa học
   - Mô tả
   - Trạng thái deployment
   - Số lượng enrollments
3. **Deploy Course** (nếu có quyền):
   - Click nút **"Triển khai"** trên course
   - Course sẽ được deploy và có sẵn cho employees

### **Bước 4: Xem Employees và Enrollments**

1. Click tab **"Nhân viên"**
2. Xem danh sách employees trong department:
   - Tên nhân viên
   - Số courses đã đăng ký
   - Số courses đã hoàn thành
   - Số courses đang tiến hành
   - Tỷ lệ hoàn thành
3. Click vào employee để xem chi tiết:
   - Danh sách enrollments
   - Trạng thái từng enrollment
   - Điểm số (nếu có)

### **Bước 5: Assign Training cho Employees**

1. Từ tab **"Nhân viên"** hoặc **"Khóa học"**, click nút **"Phân công đào tạo"**
2. Chọn:
   - **Nhân viên**: Chọn employee cần assign
   - **Khóa học**: Chọn course
   - **Session**: Chọn session (nếu có nhiều sessions)
3. Click **"Xác nhận"**
4. Employee sẽ nhận thông báo và enrollment được tạo

**Lưu ý:**
- Manager chỉ có thể assign cho employees trong department của mình
- Hệ thống sẽ tự động kiểm tra prerequisites và capacity

### **Bước 6: Xem Reports**

1. Click tab **"Báo cáo"** hoặc nút **"Xem báo cáo"**
2. Xem các báo cáo:
   - **Completion Rate**: Tỷ lệ hoàn thành theo course
   - **Employee Performance**: Hiệu suất từng employee
   - **Training Timeline**: Timeline các buổi training
3. **Export Reports**: Click **"Xuất báo cáo"** để tải Excel/PDF

### **So sánh quyền hạn:**

| Chức năng | Header Department | Manager |
|-----------|-------------------|---------|
| Tạo Course Set | ✅ | ❌ |
| Tạo Course | ✅ | ❌ |
| Tạo Question Bank | ✅ | ❌ |
| Tạo Questions | ✅ | ❌ |
| Tạo Training Session | ✅ | ❌ |
| Xem Courses | ✅ | ✅ (trong department) |
| Assign Training | ✅ | ✅ (cho employees) |
| Xem Enrollments | ✅ | ✅ (trong department) |
| Update Enrollments | ✅ | ✅ (trong department) |
| Xem Reports | ✅ | ✅ (trong department) |

---

## 👤 PHẦN 2: THAM GIA TRAINING (EMPLOYEE)

### **Bước 1: Truy cập trang Training**

1. Đăng nhập với tài khoản **Employee**
2. Từ sidebar, click vào **"Đào tạo"** hoặc truy cập: `/employee/training` hoặc `/training`

### **Bước 2: Xem và Đăng ký khóa học**

1. Click tab **"Khóa học có sẵn"**
2. Xem danh sách các khóa học:
   - Khóa học có tag **"Bắt buộc"** màu đỏ là khóa học bắt buộc
   - Khóa học không có tag là khóa học tự chọn
3. Click nút **"Đăng ký"** trên khóa học muốn tham gia

**Hệ thống sẽ tự động:**
- Kiểm tra xem có buổi đào tạo nào đang mở đăng ký không
- Kiểm tra prerequisites (khóa học tiên quyết) nếu có
- Kiểm tra buổi đào tạo còn chỗ không
- Tạo enrollment và gán vào buổi đào tạo phù hợp

**Nếu đăng ký thành công:**
- Hiển thị thông báo: "Đăng ký thành công!"
- Khóa học sẽ chuyển sang tab **"Đã đăng ký"**

**Nếu có lỗi:**
- "Không có buổi đào tạo nào khả dụng" → Chờ Header Department tạo session mới
- "Bạn cần hoàn thành X khóa học tiên quyết trước" → Hoàn thành khóa học tiên quyết trước
- "Buổi đào tạo đã đầy" → Chờ buổi đào tạo khác hoặc liên hệ quản lý

### **Bước 3: Chờ buổi đào tạo bắt đầu**

1. Click tab **"Đã đăng ký"**
2. Xem danh sách khóa học đã đăng ký:
   - **Trạng thái "Đã đăng ký"** (màu xanh dương): Chưa đến thời gian bắt đầu
   - Chờ đến khi trạng thái session chuyển sang `ONGOING`

**Lưu ý**: Hệ thống sẽ tự động cập nhật trạng thái session khi đến thời gian.

### **Bước 4: Bắt đầu làm bài**

1. Khi session đã `ONGOING`, từ tab **"Đã đăng ký"**, click nút **"Vào học"**
2. Hệ thống sẽ:
   - Lấy câu hỏi từ Question Bank
   - Xáo trộn thứ tự câu hỏi (randomize)
   - Bắt đầu đếm thời gian
3. Bạn sẽ được chuyển đến trang làm bài

### **Bước 5: Làm bài thi**

**Giao diện làm bài:**
- **Câu hỏi**: Hiển thị từng câu hỏi một
- **Đáp án**: Radio buttons để chọn A, B, C hoặc D
- **Thanh tiến độ**: Hiển thị % số câu đã làm
- **Đồng hồ đếm ngược**: Hiển thị thời gian còn lại
- **Nút điều hướng**: Previous/Next để chuyển câu

**Cách làm bài:**
1. Đọc câu hỏi cẩn thận
2. Chọn đáp án bạn cho là đúng
3. Click **"Câu tiếp theo"** để chuyển sang câu khác
4. Có thể quay lại câu trước bằng nút **"Câu trước"**
5. Câu đã chọn đáp án sẽ được đánh dấu trong danh sách câu hỏi

**Lưu ý:**
- Câu trả lời được tự động lưu vào localStorage (nếu refresh trang, câu trả lời vẫn còn)
- Khi hết thời gian, bài sẽ tự động nộp
- Có thể nộp bài sớm bằng nút **"Nộp bài"**

### **Bước 6: Nộp bài**

1. Sau khi hoàn thành tất cả câu hỏi (hoặc muốn nộp sớm), click nút **"Nộp bài"**
2. Xác nhận: "Bạn có chắc muốn nộp bài?"
3. Click **"Xác nhận"**

**Sau khi nộp:**
- Hệ thống **TỰ ĐỘNG tính điểm** dựa trên đáp án đúng
- Hệ thống **TỰ ĐỘNG xác định** đậu/rớt (ngưỡng đậu: 70%)
- Trạng thái enrollment **TỰ ĐỘNG chuyển** sang:
  - **"Hoàn thành"** (màu xanh lá) + điểm số: Nếu đạt >= 70%
  - **"Chưa đạt"** (màu đỏ): Nếu < 70%
- Bạn sẽ được chuyển về trang Training
- **Kết quả hiển thị ngay** sau khi nộp (không cần chờ)

### **Bước 7: Xem kết quả**

1. Ngay sau khi nộp bài, kết quả sẽ hiển thị
2. Vào tab **"Đã đăng ký"** hoặc **"Đã hoàn thành"**
3. Xem kết quả:
   - **"Hoàn thành"** (màu xanh lá) + điểm số: Đã đậu (>= 70%)
   - **"Chưa đạt"** (màu đỏ): Chưa đạt yêu cầu (< 70%)

**Lưu ý:** 
- ✅ Kết quả có ngay sau khi nộp (tự động tính điểm)
- ✅ Không cần chờ admin chấm điểm
- ✅ Ngưỡng đậu: 70%

### **Bước 8: Làm lại bài (Nếu chưa đạt)**

1. Nếu trạng thái là **"Chưa đạt"**, sẽ có nút **"Làm lại bài"**
2. Click **"Làm lại bài"**
3. Xác nhận làm lại
4. Hệ thống sẽ reset enrollment và cho phép bạn làm lại từ đầu
5. Làm bài lại theo các bước từ Bước 4

---

## 📊 CÁC TRẠNG THÁI VÀ Ý NGHĨA

### **Trạng thái Session:**
- **SCHEDULED** (Đã lên lịch): Chưa đến thời gian bắt đầu
- **ONGOING** (Đang diễn ra): Đang trong thời gian học
- **COMPLETED** (Hoàn thành): Đã kết thúc
- **CANCELLED** (Đã hủy): Đã bị hủy

### **Trạng thái Enrollment:**
- **enrolled** (Đã đăng ký): Đã đăng ký, chưa làm bài hoặc đang làm
- **completed** (Hoàn thành): Đã nộp và đậu (>= 70%) - **Tự động sau khi submit**
- **failed** (Chưa đạt): Đã nộp nhưng rớt (< 70%) - **Tự động sau khi submit**
- **cancelled** (Đã hủy): Đã hủy đăng ký

**Lưu ý:** 
- ❌ **KHÔNG có status 'submitted'**
- ✅ Submit tự động chuyển sang 'completed' hoặc 'failed'
- ✅ Ngưỡng đậu: 70%

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **Cho Header Department:**
1. **Thứ tự tạo**: Nên tạo theo thứ tự: Course Set → Course → Question Bank → Questions → Session
2. **Câu hỏi**: Phải có ít nhất 1 câu hỏi trong Question Bank thì mới có thể làm bài
3. **Session Status**: Hệ thống tự động cập nhật, không cần thủ công
4. **Chấm điểm**: Hiện tại chức năng chấm điểm đã bị xóa khỏi UI, nhưng backend APIs vẫn có. Nếu cần, có thể thêm lại.

### **Cho Manager:**
1. **Phạm vi quản lý**: Chỉ quản lý trong department của mình
2. **Không thể tạo**: Manager không thể tạo courses/sessions mới, chỉ có thể xem và assign
3. **Assign Training**: Có thể assign training cho employees trong department
4. **Reports**: Có thể xem reports và statistics của department

### **Cho Employee:**
1. **Thời gian**: Làm bài trong thời gian quy định, hết thời gian sẽ tự động nộp
2. **Tự động tính điểm**: Sau khi nộp, hệ thống tự động tính điểm và xác định đậu/rớt
3. **Ngưỡng đậu**: 70% để đậu
4. **Kết quả ngay**: Kết quả hiển thị ngay sau khi nộp, không cần chờ admin
5. **Làm lại**: Chỉ có thể làm lại nếu trạng thái là "failed"
6. **Lưu tự động**: Câu trả lời được lưu tự động, nhưng nên nộp bài trước khi đóng trình duyệt

---

## 🔍 XỬ LÝ LỖI THƯỜNG GẶP

### **Lỗi: "Không có buổi đào tạo nào khả dụng"**
- **Nguyên nhân**: Chưa có session nào được tạo hoặc tất cả session đã đầy/đã kết thúc
- **Giải pháp**: Liên hệ Header Department để tạo session mới

### **Lỗi: "Bạn cần hoàn thành X khóa học tiên quyết trước"**
- **Nguyên nhân**: Khóa học này yêu cầu hoàn thành khóa học khác trước
- **Giải pháp**: Đăng ký và hoàn thành khóa học tiên quyết trước

### **Lỗi: "Buổi đào tạo đã đầy"**
- **Nguyên nhân**: Session đã đạt số lượng tối đa
- **Giải pháp**: Chờ session khác hoặc liên hệ Header Department

### **Lỗi: "Bạn đã đăng ký buổi đào tạo này rồi"**
- **Nguyên nhân**: Đã đăng ký session này trước đó
- **Giải pháp**: Kiểm tra trong tab "Đã đăng ký"

### **Lỗi khi làm bài: "Session không còn hiệu lực"**
- **Nguyên nhân**: Session đã kết thúc hoặc bị hủy
- **Giải pháp**: Liên hệ Header Department

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra lại các bước trên
2. Xem log lỗi trong console (F12)
3. Liên hệ Header Department hoặc quản trị viên hệ thống

---

## 🎯 TÓM TẮT QUY TRÌNH NHANH

### **Header Department:**
```
Tạo Course Set → Tạo Course → Tạo Question Bank → 
Thêm Questions → Tạo Session → (Tùy chọn) Phân công nhân viên
```

### **Manager:**
```
Xem Dashboard → Xem Courses → Xem Employees → 
Assign Training → Xem Reports
```

### **Employee:**
```
Xem khóa học → Đăng ký → Chờ session bắt đầu → 
Vào học → Làm bài → Nộp bài → Xem kết quả → (Nếu rớt) Làm lại
```

---

**Tài liệu này cung cấp hướng dẫn đầy đủ để sử dụng hệ thống Training. Nếu có câu hỏi, vui lòng tham khảo thêm `TRAINING_FLOW_COMPLETE.md` để biết chi tiết kỹ thuật.**

