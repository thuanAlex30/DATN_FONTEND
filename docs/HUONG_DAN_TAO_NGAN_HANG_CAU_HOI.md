# Hướng Dẫn Tạo Ngân Hàng Câu Hỏi và Import Excel

## Tổng Quan

Hệ thống Training Management cho phép bạn tạo ngân hàng câu hỏi cho các khóa học và import câu hỏi từ file Excel để tiết kiệm thời gian.

## PHẦN 1: TẠO NGÂN HÀNG CÂU HỎI

### Cách 1: Tạo từ Tab "Ngân hàng câu hỏi"

1. **Truy cập trang Training Management**
   - Đăng nhập với tài khoản **Department Header**
   - Vào menu **Quản lý đào tạo** → Tab **"Ngân hàng câu hỏi"**

2. **Tạo ngân hàng câu hỏi mới**
   - Click nút **"+ Tạo ngân hàng câu hỏi"** (góc trên bên phải)
   - Điền thông tin:
     - **Tên ngân hàng câu hỏi** (bắt buộc): Ví dụ: "Câu hỏi An toàn lao động cơ bản"
     - **Khóa học** (bắt buộc): Chọn khóa học mà ngân hàng câu hỏi này thuộc về
     - **Mô tả** (tùy chọn): Mô tả về nội dung ngân hàng câu hỏi
   - Click **"Tạo mới"**

3. **Kết quả**
   - Ngân hàng câu hỏi sẽ xuất hiện trong danh sách
   - Bạn có thể:
     - **Sửa**: Click icon ✏️ để chỉnh sửa
     - **Quản lý câu hỏi**: Click icon ❓ để thêm/sửa/xóa câu hỏi
     - **Xem trước**: Click icon 👁️ để xem tất cả câu hỏi
     - **Xóa**: Click icon 🗑️ để xóa ngân hàng câu hỏi

### Cách 2: Tạo từ Card Khóa học

1. **Từ tab "Khóa học"**
   - Tìm khóa học bạn muốn tạo ngân hàng câu hỏi
   - Click icon **❓ (Câu hỏi)** trên card khóa học
   - Modal **"Quản lý ngân hàng câu hỏi"** sẽ hiện ra

2. **Tạo ngân hàng câu hỏi trong modal**
   - Click nút **"+ Tạo ngân hàng câu hỏi mới"**
   - Điền:
     - **Tên ngân hàng câu hỏi** (bắt buộc)
     - **Mô tả** (tùy chọn)
   - Click **"Tạo"**
   - Khóa học sẽ tự động được gán (vì bạn đã chọn từ card khóa học)

## PHẦN 2: THÊM CÂU HỎI VÀO NGÂN HÀNG

### Cách 1: Thêm câu hỏi thủ công

1. **Từ tab "Ngân hàng câu hỏi"**
   - Tìm ngân hàng câu hỏi bạn muốn thêm câu hỏi
   - Click icon **❓ (Quản lý câu hỏi)**

2. **Thêm câu hỏi mới**
   - Click nút **"+ Thêm câu hỏi"**
   - Điền thông tin:
     - **Nội dung câu hỏi** (bắt buộc): Ví dụ: "An toàn lao động là gì?"
     - **Loại câu hỏi** (bắt buộc): 
       - `MULTIPLE_CHOICE`: Câu hỏi trắc nghiệm nhiều lựa chọn
       - `TRUE_FALSE`: Câu hỏi Đúng/Sai
     - **Các lựa chọn** (bắt buộc cho MULTIPLE_CHOICE):
       - Nhập các đáp án, cách nhau bởi dấu `|`
       - Ví dụ: `A. Đáp án 1|B. Đáp án 2|C. Đáp án 3|D. Đáp án 4`
     - **Đáp án đúng** (bắt buộc): Phải khớp với một trong các lựa chọn
     - **Giải thích** (tùy chọn): Giải thích tại sao đáp án này đúng
     - **Mức độ khó** (tùy chọn): `EASY`, `MEDIUM`, `HARD` (mặc định: `MEDIUM`)
     - **Điểm số** (tùy chọn): Số nguyên dương (mặc định: 1)
   - Click **"Thêm câu hỏi"**

### Cách 2: Import từ file Excel (Khuyến nghị cho nhiều câu hỏi)

#### Bước 1: Tải Template Excel

1. **Từ modal "Quản lý câu hỏi"**
   - Click nút **"📥 Tải template"** hoặc **"Download Template"**
   - File `question_template.xlsx` sẽ được tải về

2. **Mở file template**
   - File có 2 sheet:
     - **Sheet "Questions"**: Chứa dữ liệu mẫu và cấu trúc
     - **Sheet "Hướng dẫn"**: Hướng dẫn chi tiết về các trường

#### Bước 2: Điền dữ liệu vào Excel

**Cấu trúc file Excel:**

| Cột | Tên trường | Mô tả | Bắt buộc | Ví dụ |
|-----|------------|-------|----------|-------|
| A | question_text | Nội dung câu hỏi | ✅ | "An toàn lao động là gì?" |
| B | question_type | Loại câu hỏi | ✅ | `MULTIPLE_CHOICE` hoặc `TRUE_FALSE` |
| C | options | Các lựa chọn (cách nhau bởi \|) | ✅ | `A. Đáp án 1\|B. Đáp án 2\|C. Đáp án 3\|D. Đáp án 4` |
| D | correct_answer | Đáp án đúng | ✅ | `A. Đáp án 1` |
| E | explanation | Giải thích | ❌ | "Giải thích tại sao đáp án này đúng" |
| F | difficulty_level | Mức độ khó | ❌ | `EASY`, `MEDIUM`, `HARD` |
| G | points | Điểm số | ❌ | `1`, `2`, `3` |

**Lưu ý quan trọng:**
- ✅ **Bắt buộc**: question_text, question_type, options, correct_answer
- ❌ **Tùy chọn**: explanation, difficulty_level, points
- **options**: Các lựa chọn phải cách nhau bởi dấu `|` (pipe)
- **correct_answer**: Phải khớp chính xác với một trong các lựa chọn trong `options`
- **question_type**: Chỉ hỗ trợ `MULTIPLE_CHOICE` hoặc `TRUE_FALSE`
- **difficulty_level**: Chỉ chấp nhận `EASY`, `MEDIUM`, `HARD` (viết hoa)
- **points**: Phải là số nguyên dương

**Ví dụ dữ liệu:**

```
question_text | question_type      | options                                                      | correct_answer                                    | explanation | difficulty_level | points
--------------|-------------------|--------------------------------------------------------------|--------------------------------------------------|-------------|------------------|-------
An toàn lao động là gì? | MULTIPLE_CHOICE | A. Bảo vệ sức khỏe và tính mạng|B. Tiết kiệm chi phí|C. Tăng năng suất|D. Tất cả | A. Bảo vệ sức khỏe và tính mạng | An toàn lao động là việc bảo vệ sức khỏe... | EASY | 1
Khi nào cần dùng PPE? | MULTIPLE_CHOICE | A. Chỉ khi có kiểm tra|B. Luôn luôn khi làm việc|C. Chỉ khi nguy hiểm|D. Không bao giờ | B. Luôn luôn khi làm việc | PPE cần được sử dụng luôn luôn... | MEDIUM | 2
```

#### Bước 3: Import file Excel

1. **Từ modal "Quản lý câu hỏi"**
   - Click nút **"📊 Import Excel"** hoặc icon **📊**
   - Modal **"Import câu hỏi từ Excel"** sẽ hiện ra

2. **Chọn file Excel**
   - Click **"Chọn file Excel"**
   - Chọn file Excel đã điền dữ liệu (`.xlsx` hoặc `.xls`)
   - File sẽ hiển thị tên file đã chọn

3. **Import**
   - Kiểm tra lại:
     - Ngân hàng câu hỏi đúng chưa (hiển thị ở trên)
     - File Excel đã chọn chưa
   - Click **"Import câu hỏi"**
   - Hệ thống sẽ:
     - Đọc và validate dữ liệu
     - Import các câu hỏi hợp lệ
     - Hiển thị thông báo thành công hoặc lỗi

4. **Kết quả**
   - ✅ **Thành công**: Tất cả câu hỏi sẽ được thêm vào ngân hàng
   - ⚠️ **Có lỗi**: Hệ thống sẽ báo lỗi cụ thể (dòng nào, lỗi gì)
   - Sau khi import, bạn có thể xem lại trong modal "Quản lý câu hỏi"

## PHẦN 3: QUẢN LÝ CÂU HỎI

### Xem danh sách câu hỏi

1. **Từ tab "Ngân hàng câu hỏi"**
   - Click icon **❓ (Quản lý câu hỏi)** trên card ngân hàng câu hỏi
   - Hoặc click icon **👁️ (Xem trước)** để xem tất cả câu hỏi

2. **Danh sách câu hỏi**
   - Hiển thị tất cả câu hỏi trong ngân hàng
   - Có thể tìm kiếm, lọc theo loại, mức độ khó

### Chỉnh sửa câu hỏi

1. **Từ modal "Quản lý câu hỏi"**
   - Tìm câu hỏi cần sửa
   - Click icon **✏️ (Sửa)**
   - Chỉnh sửa thông tin
   - Click **"Cập nhật"**

### Xóa câu hỏi

1. **Từ modal "Quản lý câu hỏi"**
   - Tìm câu hỏi cần xóa
   - Click icon **🗑️ (Xóa)**
   - Xác nhận xóa

## PHẦN 4: LƯU Ý QUAN TRỌNG

### Về Ngân hàng câu hỏi

- ✅ Mỗi khóa học có thể có nhiều ngân hàng câu hỏi
- ✅ Mỗi ngân hàng câu hỏi chỉ thuộc về 1 khóa học
- ✅ Khi xóa ngân hàng câu hỏi, tất cả câu hỏi trong đó cũng bị xóa
- ⚠️ Không thể xóa ngân hàng câu hỏi đã được sử dụng trong session đã hoàn thành

### Về Import Excel

- ✅ File Excel phải đúng định dạng (theo template)
- ✅ Các trường bắt buộc không được để trống
- ✅ `correct_answer` phải khớp chính xác với một trong các `options`
- ✅ `question_type` chỉ chấp nhận: `MULTIPLE_CHOICE`, `TRUE_FALSE`
- ✅ `difficulty_level` chỉ chấp nhận: `EASY`, `MEDIUM`, `HARD`
- ⚠️ Nếu có lỗi ở một số dòng, các dòng hợp lệ vẫn sẽ được import
- ⚠️ Hệ thống sẽ báo lỗi chi tiết cho các dòng không hợp lệ

### Về Câu hỏi

- ✅ Câu hỏi có thể được sử dụng trong nhiều session khác nhau
- ✅ Khi sửa câu hỏi, tất cả session sử dụng câu hỏi đó sẽ được cập nhật
- ⚠️ Không thể xóa câu hỏi đã được sử dụng trong session đã hoàn thành

## PHẦN 5: XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi khi Import Excel

1. **"File không đúng định dạng"**
   - ✅ Kiểm tra file có đúng extension `.xlsx` hoặc `.xls` không
   - ✅ Tải lại template và điền lại dữ liệu

2. **"Thiếu trường bắt buộc"**
   - ✅ Kiểm tra các cột: question_text, question_type, options, correct_answer
   - ✅ Đảm bảo không có ô nào để trống ở các cột bắt buộc

3. **"Đáp án đúng không khớp với các lựa chọn"**
   - ✅ Kiểm tra `correct_answer` có khớp chính xác với một trong các lựa chọn trong `options` không
   - ✅ Lưu ý: Phải khớp chính xác, kể cả khoảng trắng và chữ hoa/thường

4. **"Loại câu hỏi không hợp lệ"**
   - ✅ Chỉ chấp nhận: `MULTIPLE_CHOICE` hoặc `TRUE_FALSE`
   - ✅ Kiểm tra viết hoa đúng chưa

5. **"Mức độ khó không hợp lệ"**
   - ✅ Chỉ chấp nhận: `EASY`, `MEDIUM`, `HARD` (viết hoa)
   - ✅ Hoặc để trống (sẽ dùng mặc định: `MEDIUM`)

### Lỗi khi Tạo Ngân hàng câu hỏi

1. **"Tên ngân hàng câu hỏi đã tồn tại"**
   - ✅ Đổi tên khác hoặc kiểm tra xem đã có ngân hàng câu hỏi với tên này chưa

2. **"Không thể tạo ngân hàng câu hỏi"**
   - ✅ Kiểm tra quyền truy cập (phải là Department Header)
   - ✅ Kiểm tra khóa học đã được chọn chưa

## PHẦN 6: BEST PRACTICES

### Tổ chức Ngân hàng câu hỏi

- ✅ Đặt tên ngân hàng câu hỏi rõ ràng, dễ hiểu
- ✅ Mỗi chủ đề nên có một ngân hàng câu hỏi riêng
- ✅ Sử dụng mô tả để giải thích nội dung ngân hàng câu hỏi

### Tạo Câu hỏi

- ✅ Câu hỏi phải rõ ràng, dễ hiểu
- ✅ Các lựa chọn phải hợp lý, không quá dễ hoặc quá khó
- ✅ Đáp án đúng phải chính xác, không gây nhầm lẫn
- ✅ Thêm giải thích để người học hiểu rõ hơn

### Import Excel

- ✅ Sử dụng template mẫu để đảm bảo đúng định dạng
- ✅ Kiểm tra dữ liệu trước khi import (đặc biệt là `correct_answer`)
- ✅ Import từng nhóm nhỏ để dễ kiểm tra lỗi
- ✅ Lưu file Excel gốc để có thể import lại nếu cần

## TÓM TẮT QUY TRÌNH

### Tạo Ngân hàng câu hỏi và Import Excel (Nhanh)

1. **Tạo ngân hàng câu hỏi**
   - Tab "Ngân hàng câu hỏi" → "+ Tạo ngân hàng câu hỏi"
   - Điền tên, chọn khóa học, mô tả → "Tạo mới"

2. **Tải template Excel**
   - Click "Quản lý câu hỏi" → "Tải template"
   - Mở file và điền dữ liệu theo mẫu

3. **Import Excel**
   - Click "Import Excel" → Chọn file → "Import câu hỏi"
   - Kiểm tra kết quả

4. **Hoàn tất**
   - Xem lại câu hỏi đã import
   - Có thể chỉnh sửa hoặc thêm câu hỏi thủ công nếu cần

---

**Lưu ý**: Tài liệu này dựa trên phiên bản hiện tại của hệ thống. Nếu có thay đổi, vui lòng cập nhật tài liệu này.

