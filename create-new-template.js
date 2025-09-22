import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo dữ liệu mẫu với định dạng tiếng Anh như trong hình
const sampleData = [
  {
    'category_name': 'Hard Hat',
    'description': 'Protective helmet for head safety',
    'lifespan_months': 12
  },
  {
    'category_name': 'Safety Gloves',
    'description': 'Protective gloves for hand safety',
    'lifespan_months': 6
  },
  {
    'category_name': 'Safety Glasses',
    'description': 'Protective eyewear for eye safety',
    'lifespan_months': 24
  },
  {
    'category_name': 'Safety Shoes',
    'description': 'Protective footwear for foot safety',
    'lifespan_months': 18
  },
  {
    'category_name': 'High Visibility Vest',
    'description': 'High visibility clothing for safety',
    'lifespan_months': 12
  }
];

// Tạo workbook
const workbook = XLSX.utils.book_new();

// Tạo worksheet từ dữ liệu
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Đặt độ rộng cột
worksheet['!cols'] = [
  { wch: 20 }, // category_name
  { wch: 50 }, // description
  { wch: 15 }  // lifespan_months
];

// Thêm worksheet vào workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'PPE Categories');

// Đường dẫn file output
const outputPath = path.join(__dirname, 'public', 'PPE_Categories_Template.xlsx');

// Ghi file Excel
XLSX.writeFile(workbook, outputPath);

console.log('✅ File Excel template mới đã được tạo tại:', outputPath);
console.log('📋 Template bao gồm các cột:');
console.log('   - category_name: Tên của danh mục PPE');
console.log('   - description: Mô tả chi tiết về danh mục');
console.log('   - lifespan_months: Thời gian sử dụng tính bằng tháng');
console.log('');
console.log('📝 Hướng dẫn sử dụng:');
console.log('   1. Mở file PPE_Categories_Template.xlsx');
console.log('   2. Điền thông tin danh mục PPE mới');
console.log('   3. Lưu file');
console.log('   4. Sử dụng chức năng Import Excel trong hệ thống');
console.log('');
console.log('🔄 Hệ thống hiện hỗ trợ cả định dạng tiếng Việt và tiếng Anh!');

