import React from 'react';
import { message } from 'antd';
import ProjectBasicInfoForm, {
  type ProjectBasicInfo
} from './ProjectBasicInfoForm';
import projectService from '../../../../services/projectService';

interface SimpleProjectCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal tạo dự án đơn giản:
 * - Chỉ nhập thông tin cơ bản
 * - Gọi API tạo project
 * - Đóng modal và refresh danh sách
 */
const SimpleProjectCreateModal: React.FC<SimpleProjectCreateModalProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const handleCreateProject = async (data: ProjectBasicInfo) => {
    try {
      // Chuẩn hóa payload theo backend (site_id là optional)
      const payload: any = {
        project_name: data.project_name,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        project_type: data.project_type,
        priority: data.priority,
        leader_id: data.leader_id,
        project_location: data.project_location || ''
      };

      const res = await projectService.createProject(payload);

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Không thể tạo dự án');
      }

      message.success('Tạo dự án thành công');
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating project (simple modal):', error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          'Lỗi khi tạo dự án'
      );
    }
  };

  return (
    <ProjectBasicInfoForm
      visible={visible}
      onClose={onClose}
      onNext={handleCreateProject}
    />
  );
};

export default SimpleProjectCreateModal;


