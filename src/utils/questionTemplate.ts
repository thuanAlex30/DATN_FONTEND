import * as XLSX from 'xlsx';

export interface QuestionTemplateRow {
  question_text: string;
  question_type: string;
  options: string;
  correct_answer: string;
  explanation: string;
  difficulty_level: string;
  points: number;
}

export const createQuestionTemplate = (): Blob => {
  try {
    // Tạo dữ liệu mẫu cho template
    const sampleData: QuestionTemplateRow[] = [
      {
        question_text: "Câu hỏi mẫu: An toàn lao động là gì?",
        question_type: "MULTIPLE_CHOICE",
        options: "A. Bảo vệ sức khỏe và tính mạng người lao động|B. Tiết kiệm chi phí sản xuất|C. Tăng năng suất lao động|D. Tất cả các đáp án trên",
        correct_answer: "A. Bảo vệ sức khỏe và tính mạng người lao động",
        explanation: "An toàn lao động là việc bảo vệ sức khỏe và tính mạng người lao động trong quá trình lao động.",
        difficulty_level: "EASY",
        points: 1
      },
      {
        question_text: "Câu hỏi mẫu: Khi nào cần sử dụng thiết bị bảo hộ cá nhân?",
        question_type: "MULTIPLE_CHOICE", 
        options: "A. Chỉ khi có kiểm tra|B. Luôn luôn khi làm việc|C. Chỉ khi nguy hiểm|D. Không bao giờ",
        correct_answer: "B. Luôn luôn khi làm việc",
        explanation: "Thiết bị bảo hộ cá nhân cần được sử dụng luôn luôn khi làm việc để đảm bảo an toàn.",
        difficulty_level: "MEDIUM",
        points: 2
      }
    ];

    // Tạo workbook và worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Thiết lập độ rộng cột
    const columnWidths = [
      { wch: 50 }, // question_text
      { wch: 20 }, // question_type
      { wch: 80 }, // options
      { wch: 50 }, // correct_answer
      { wch: 60 }, // explanation
      { wch: 15 }, // difficulty_level
      { wch: 10 }  // points
    ];
    worksheet['!cols'] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

    // Tạo sheet hướng dẫn
    const instructionData = [
      { 
        field: "question_text", 
        description: "Nội dung câu hỏi", 
        required: "Bắt buộc",
        example: "An toàn lao động là gì?",
        note: "Câu hỏi phải rõ ràng, dễ hiểu"
      },
      { 
        field: "question_type", 
        description: "Loại câu hỏi", 
        required: "Bắt buộc",
        example: "MULTIPLE_CHOICE",
        note: "Chỉ hỗ trợ: MULTIPLE_CHOICE, TRUE_FALSE"
      },
      { 
        field: "options", 
        description: "Các lựa chọn (cách nhau bởi |)", 
        required: "Bắt buộc",
        example: "A. Đáp án 1|B. Đáp án 2|C. Đáp án 3|D. Đáp án 4",
        note: "Các lựa chọn cách nhau bởi dấu |"
      },
      { 
        field: "correct_answer", 
        description: "Đáp án đúng", 
        required: "Bắt buộc",
        example: "A. Đáp án 1",
        note: "Phải khớp với một trong các lựa chọn"
      },
      { 
        field: "explanation", 
        description: "Giải thích đáp án", 
        required: "Không bắt buộc",
        example: "Giải thích tại sao đáp án này đúng",
        note: "Có thể để trống"
      },
      { 
        field: "difficulty_level", 
        description: "Mức độ khó", 
        required: "Không bắt buộc",
        example: "EASY",
        note: "EASY, MEDIUM, HARD. Mặc định: MEDIUM"
      },
      { 
        field: "points", 
        description: "Điểm số", 
        required: "Không bắt buộc",
        example: "1",
        note: "Số nguyên dương. Mặc định: 1"
      }
    ];

    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [
      { wch: 20 }, // field
      { wch: 30 }, // description
      { wch: 15 }, // required
      { wch: 50 }, // example
      { wch: 40 }  // note
    ];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Hướng dẫn');

    // Chuyển đổi thành buffer với các tùy chọn đầy đủ
    const buffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true
    });
    
    // Tạo Blob từ buffer với MIME type chính xác
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    return blob;
  } catch (error) {
    console.error('Error creating Excel template:', error);
    throw error;
  }
};

export const downloadQuestionTemplate = (): void => {
  try {
    const blob = createQuestionTemplate();
    
    // Kiểm tra blob có hợp lệ không
    if (!blob || blob.size === 0) {
      console.error('Blob is empty or invalid');
      return;
    }
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'question_template.xlsx';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Error creating template:', error);
    // Fallback: tạo file CSV đơn giản
    createCSVTemplate();
  }
};

// Fallback function để tạo CSV nếu Excel không hoạt động
const createCSVTemplate = (): void => {
  const csvContent = `question_text,question_type,options,correct_answer,explanation,difficulty_level,points
"Câu hỏi mẫu: An toàn lao động là gì?","MULTIPLE_CHOICE","A. Bảo vệ sức khỏe và tính mạng người lao động|B. Tiết kiệm chi phí sản xuất|C. Tăng năng suất lao động|D. Tất cả các đáp án trên","A. Bảo vệ sức khỏe và tính mạng người lao động","An toàn lao động là việc bảo vệ sức khỏe và tính mạng người lao động trong quá trình lao động.","EASY",1
"Câu hỏi mẫu: Khi nào cần sử dụng thiết bị bảo hộ cá nhân?","MULTIPLE_CHOICE","A. Chỉ khi có kiểm tra|B. Luôn luôn khi làm việc|C. Chỉ khi nguy hiểm|D. Không bao giờ","B. Luôn luôn khi làm việc","Thiết bị bảo hộ cá nhân cần được sử dụng luôn luôn khi làm việc để đảm bảo an toàn.","MEDIUM",2`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'question_template.csv';
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
};
