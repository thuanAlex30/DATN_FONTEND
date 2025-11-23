import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import ReportPDFTemplate from '../components/ReportPDFTemplate';

interface GeneratePDFOptions {
  reportData: any;
  reportType: string;
  filename?: string;
}

export const generatePDF = async ({ reportData, reportType, filename }: GeneratePDFOptions): Promise<void> => {
  try {
    // Tạo element tạm thời để render component
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm';
    tempDiv.style.height = '297mm';
    document.body.appendChild(tempDiv);

    // Render component vào element tạm thời
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    
    const root = ReactDOM.createRoot(tempDiv);
    root.render(React.createElement(ReportPDFTemplate, { reportData, reportType }));

    // Đợi một chút để component render xong
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Chụp ảnh element
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123 // A4 height in pixels at 96 DPI
    });

    // Tạo PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Thêm ảnh đầu tiên
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Thêm các trang tiếp theo nếu cần
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Tạo tên file
    const defaultFilename = `bao_cao_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
    const finalFilename = filename || defaultFilename;

    // Tải file
    pdf.save(finalFilename);

    // Cleanup
    root.unmount();
    document.body.removeChild(tempDiv);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Không thể tạo file PDF');
  }
};

export const generatePDFFromElement = async (elementId: string, filename: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Không tìm thấy element để tạo PDF');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF from element:', error);
    throw new Error('Không thể tạo file PDF');
  }
};
