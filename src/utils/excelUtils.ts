import * as XLSX from 'xlsx';

export interface PPECategoryImportData {
  category_name: string;
  description: string;
  lifespan_months: number;
}

export interface PPEItemImportData {
  category_id: string;
  item_code: string;
  item_name: string;
  brand?: string;
  model?: string;
  reorder_level: number;
  quantity_available: number;
  quantity_allocated: number;
}

export interface ImportResult {
  success: boolean;
  data: any[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

/**
 * Tạo template Excel cho PPE Categories
 */
export const generatePPECategoryTemplate = (): void => {
  const templateData = [
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

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  
  // Đặt độ rộng cột
  worksheet['!cols'] = [
    { wch: 20 }, // Tên danh mục
    { wch: 50 }, // Mô tả
    { wch: 15 }  // Tuổi thọ
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'PPE Categories');
  
  // Tải file
  XLSX.writeFile(workbook, 'PPE_Categories_Template.xlsx');
};

/**
 * Đọc và parse file Excel PPE Categories
 */
export const parsePPECategoryExcel = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Chuyển đổi sheet thành JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: ''
        }) as any[][];

        if (jsonData.length < 2) {
          resolve({
            success: false,
            data: [],
            errors: ['File Excel không có dữ liệu hoặc chỉ có header'],
            totalRows: 0,
            validRows: 0
          });
          return;
        }

        // Lấy header (dòng đầu tiên)
        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);

        // Validate headers - hỗ trợ cả tiếng Việt và tiếng Anh
        const vietnameseHeaders = ['Tên danh mục', 'Mô tả', 'Tuổi thọ (tháng)'];
        const englishHeaders = ['category_name', 'description', 'lifespan_months'];
        
        const headerErrors: string[] = [];
        let isVietnameseFormat = false;
        let isEnglishFormat = false;
        
        // Kiểm tra định dạng tiếng Việt
        const vietnameseMatch = vietnameseHeaders.every(header => headers.includes(header));
        if (vietnameseMatch) {
          isVietnameseFormat = true;
        }
        
        // Kiểm tra định dạng tiếng Anh
        const englishMatch = englishHeaders.every(header => headers.includes(header));
        if (englishMatch) {
          isEnglishFormat = true;
        }
        
        if (!isVietnameseFormat && !isEnglishFormat) {
          headerErrors.push(`Định dạng header không đúng. Hỗ trợ:\n- Tiếng Việt: ${vietnameseHeaders.join(', ')}\n- Tiếng Anh: ${englishHeaders.join(', ')}`);
        }

        if (headerErrors.length > 0) {
          resolve({
            success: false,
            data: [],
            errors: headerErrors,
            totalRows: dataRows.length,
            validRows: 0
          });
          return;
        }

        // Parse data rows
        const parsedData: PPECategoryImportData[] = [];
        const errors: string[] = [];
        
        dataRows.forEach((row, index) => {
          const rowNumber = index + 2; // +2 vì bắt đầu từ dòng 2 (sau header)
          
          try {
            // Tìm index của các cột dựa trên định dạng
            let nameIndex, descIndex, lifespanIndex;
            
            if (isVietnameseFormat) {
              nameIndex = headers.indexOf('Tên danh mục');
              descIndex = headers.indexOf('Mô tả');
              lifespanIndex = headers.indexOf('Tuổi thọ (tháng)');
            } else if (isEnglishFormat) {
              nameIndex = headers.indexOf('category_name');
              descIndex = headers.indexOf('description');
              lifespanIndex = headers.indexOf('lifespan_months');
            } else {
              errors.push(`Dòng ${rowNumber}: Không xác định được định dạng header`);
              return;
            }

            const categoryName = String(row[nameIndex] || '').trim();
            const description = String(row[descIndex] || '').trim();
            const lifespanStr = String(row[lifespanIndex] || '').trim();

            // Validate dữ liệu
            if (!categoryName) {
              errors.push(`Dòng ${rowNumber}: Tên danh mục không được để trống`);
              return;
            }

            if (categoryName.length > 100) {
              errors.push(`Dòng ${rowNumber}: Tên danh mục không được quá 100 ký tự`);
              return;
            }

            if (description.length > 500) {
              errors.push(`Dòng ${rowNumber}: Mô tả không được quá 500 ký tự`);
              return;
            }

            let lifespanMonths = 0;
            if (lifespanStr) {
              const parsedLifespan = parseInt(lifespanStr);
              if (isNaN(parsedLifespan) || parsedLifespan < 0) {
                errors.push(`Dòng ${rowNumber}: Tuổi thọ phải là số nguyên dương`);
                return;
              }
              lifespanMonths = parsedLifespan;
            }

            parsedData.push({
              category_name: categoryName,
              description: description,
              lifespan_months: lifespanMonths
            });

          } catch (error) {
            errors.push(`Dòng ${rowNumber}: Lỗi khi xử lý dữ liệu - ${error}`);
          }
        });

        resolve({
          success: errors.length === 0,
          data: parsedData,
          errors: errors,
          totalRows: dataRows.length,
          validRows: parsedData.length
        });

      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [`Lỗi khi đọc file Excel: ${error}`],
          totalRows: 0,
          validRows: 0
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Lỗi khi đọc file'],
        totalRows: 0,
        validRows: 0
      });
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Validate dữ liệu PPE Category trước khi import
 */
export const validatePPECategoryData = (data: PPECategoryImportData[]): string[] => {
  const errors: string[] = [];
  const categoryNames = new Set<string>();

  data.forEach((item, index) => {
    const rowNumber = index + 1;

    // Check duplicate names
    if (categoryNames.has(item.category_name.toLowerCase())) {
      errors.push(`Dòng ${rowNumber}: Tên danh mục "${item.category_name}" bị trùng lặp`);
    } else {
      categoryNames.add(item.category_name.toLowerCase());
    }

    // Check name length
    if (item.category_name.length > 100) {
      errors.push(`Dòng ${rowNumber}: Tên danh mục không được quá 100 ký tự`);
    }

    // Check description length
    if (item.description.length > 500) {
      errors.push(`Dòng ${rowNumber}: Mô tả không được quá 500 ký tự`);
    }

    // Check lifespan
    if (item.lifespan_months < 0) {
      errors.push(`Dòng ${rowNumber}: Tuổi thọ phải là số dương`);
    }
  });

  return errors;
};

/**
 * Tạo template Excel cho PPE Items
 */
export const generatePPEItemTemplate = (): void => {
  const templateData = [
    {
      'Tên thiết bị': 'Mũ bảo hiểm cứng',
      'Mã thiết bị': 'HELMET-001',
      'Danh mục': 'Bảo vệ đầu',
      'Thương hiệu': '3M',
      'Model': 'H-700',
      'Mức tái đặt hàng': 10,
      'Số lượng có sẵn': 50,
      'Số lượng đã phân phối': 0
    },
    {
      'Tên thiết bị': 'Găng tay bảo hộ',
      'Mã thiết bị': 'GLOVE-001',
      'Danh mục': 'Bảo vệ chân tay',
      'Thương hiệu': 'Honeywell',
      'Model': 'Nitrile',
      'Mức tái đặt hàng': 20,
      'Số lượng có sẵn': 100,
      'Số lượng đã phân phối': 0
    },
    {
      'Tên thiết bị': 'Kính bảo hộ',
      'Mã thiết bị': 'GLASS-001',
      'Danh mục': 'Bảo vệ mắt',
      'Thương hiệu': 'MSA',
      'Model': 'Clear',
      'Mức tái đặt hàng': 15,
      'Số lượng có sẵn': 75,
      'Số lượng đã phân phối': 0
    },
    {
      'Tên thiết bị': 'Giày bảo hộ',
      'Mã thiết bị': 'SHOE-001',
      'Danh mục': 'Bảo vệ chân',
      'Thương hiệu': 'Red Wing',
      'Model': 'Steel Toe',
      'Mức tái đặt hàng': 5,
      'Số lượng có sẵn': 25,
      'Số lượng đã phân phối': 0
    },
    {
      'Tên thiết bị': 'Áo phản quang',
      'Mã thiết bị': 'VEST-001',
      'Danh mục': 'Bảo vệ cơ thể',
      'Thương hiệu': 'Generic',
      'Model': 'High Vis',
      'Mức tái đặt hàng': 8,
      'Số lượng có sẵn': 40,
      'Số lượng đã phân phối': 0
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // Tên thiết bị
    { wch: 15 }, // Mã thiết bị
    { wch: 15 }, // Danh mục
    { wch: 15 }, // Thương hiệu
    { wch: 15 }, // Model
    { wch: 18 }, // Mức tái đặt hàng
    { wch: 18 }, // Số lượng có sẵn
    { wch: 20 }  // Số lượng đã phân phối
  ];
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'PPE Items Template');
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `PPE_Items_Template_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, filename);
};

/**
 * Parse PPE Item Excel file
 */
export const parsePPEItemExcel = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!jsonData || jsonData.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['File Excel không có dữ liệu'],
            totalRows: 0,
            validRows: 0
          });
          return;
        }

        const result: ImportResult = {
          success: true,
          data: [],
          errors: [],
          totalRows: jsonData.length,
          validRows: 0
        };

        // Process each row
        jsonData.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // Excel row number (accounting for header)
          
          try {
            // Validate required fields
            if (!row['Tên thiết bị'] || !row['Mã thiết bị'] || !row['Danh mục']) {
              result.errors.push(`Dòng ${rowNumber}: Thiếu thông tin bắt buộc (Tên thiết bị, Mã thiết bị, Danh mục)`);
              return;
            }

            const itemData: PPEItemImportData = {
              category_id: row['Danh mục'].toString().trim(),
              item_code: row['Mã thiết bị'].toString().trim().toUpperCase(),
              item_name: row['Tên thiết bị'].toString().trim(),
              brand: row['Thương hiệu'] ? row['Thương hiệu'].toString().trim() : '',
              model: row['Model'] ? row['Model'].toString().trim() : '',
              reorder_level: parseInt(row['Mức tái đặt hàng']) || 10,
              quantity_available: parseInt(row['Số lượng có sẵn']) || 0,
              quantity_allocated: parseInt(row['Số lượng đã phân phối']) || 0
            };

            // Validate numeric fields
            if (isNaN(itemData.reorder_level) || itemData.reorder_level < 0) {
              result.errors.push(`Dòng ${rowNumber}: Mức tái đặt hàng phải là số >= 0`);
              return;
            }

            if (isNaN(itemData.quantity_available) || itemData.quantity_available < 0) {
              result.errors.push(`Dòng ${rowNumber}: Số lượng có sẵn phải là số >= 0`);
              return;
            }

            if (isNaN(itemData.quantity_allocated) || itemData.quantity_allocated < 0) {
              result.errors.push(`Dòng ${rowNumber}: Số lượng đã phân phối phải là số >= 0`);
              return;
            }

            result.data.push(itemData);
            result.validRows++;

          } catch (error) {
            result.errors.push(`Dòng ${rowNumber}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
          }
        });

        // Check if there are any valid rows
        if (result.validRows === 0) {
          result.success = false;
        }

        resolve(result);

      } catch (error) {
        reject(new Error(`Lỗi khi đọc file Excel: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Validate PPE Item data
 */
export const validatePPEItemData = (data: PPEItemImportData[]): string[] => {
  const errors: string[] = [];

  data.forEach((item, index) => {
    const rowNumber = index + 2; // Excel row number (accounting for header)

    if (!item.item_name || item.item_name.trim() === '') {
      errors.push(`Dòng ${rowNumber}: Tên thiết bị không được để trống`);
    }

    if (!item.item_code || item.item_code.trim() === '') {
      errors.push(`Dòng ${rowNumber}: Mã thiết bị không được để trống`);
    }

    if (!item.category_id || item.category_id.trim() === '') {
      errors.push(`Dòng ${rowNumber}: Danh mục không được để trống`);
    }

    if (item.item_name && item.item_name.length > 100) {
      errors.push(`Dòng ${rowNumber}: Tên thiết bị không được vượt quá 100 ký tự`);
    }

    if (item.item_code && item.item_code.length > 50) {
      errors.push(`Dòng ${rowNumber}: Mã thiết bị không được vượt quá 50 ký tự`);
    }

    if (item.brand && item.brand.length > 100) {
      errors.push(`Dòng ${rowNumber}: Thương hiệu không được vượt quá 100 ký tự`);
    }

    if (item.model && item.model.length > 100) {
      errors.push(`Dòng ${rowNumber}: Model không được vượt quá 100 ký tự`);
    }

    if (item.reorder_level < 0) {
      errors.push(`Dòng ${rowNumber}: Mức tái đặt hàng phải là số >= 0`);
    }

    if (item.quantity_available < 0) {
      errors.push(`Dòng ${rowNumber}: Số lượng có sẵn phải là số >= 0`);
    }

    if (item.quantity_allocated < 0) {
      errors.push(`Dòng ${rowNumber}: Số lượng đã phân phối phải là số >= 0`);
    }
  });

  return errors;
};
