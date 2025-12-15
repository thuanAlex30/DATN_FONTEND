import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Alert, Typography, Space, Tag, Upload, Button, message } from 'antd';
import { UserOutlined, TeamOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import projectService from '../../../../services/projectService';
import userService from '../../../../services/userService';
import type { RootState } from '../../../../store';

const { Title, Text } = Typography;

interface ProjectWorkersProps {
  projectId: string;
}

const ProjectWorkers: React.FC<ProjectWorkersProps> = ({ projectId }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const tenantFallbackName =
    useSelector((state: RootState) => state.auth.user?.tenant?.name) ||
    useSelector((state: RootState) => state.auth.user?.tenant?.tenant_name) ||
    useSelector((state: RootState) => state.auth.user?.tenant?.company_name) ||
    'N/A';

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectAssignments(projectId);
      if (response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setAssignments(list);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error loading project workers:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadAssignments();
    }
  }, [projectId, loadAssignments]);

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      await userService.importUsersFromExcel(file, projectId);
      message.success('Import công nhân thành công và đã gán vào dự án');
      await loadAssignments();
      return false; // ngăn antd tự upload
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Import thất bại');
      return false;
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    if (assignments.length === 0) {
      message.warning('Chưa có công nhân để export');
      return;
    }

    const rows = [
      ['user_id', 'company_name', 'full_name', 'gender_code'],
      ...assignments.map((assignment) => {
        const user = assignment.user_id || {};
        const genderCode =
          user.gender === 'male' ? 1 : user.gender === 'female' ? 2 : 1; // auto 1 nếu không có

        // user_id: ưu tiên trường user_id (số nguyên), fallback sang id/_id nếu cần
        const exportedUserId =
          user.user_id !== undefined && user.user_id !== null
            ? user.user_id
            : user.id || user._id || '';

        // Tên công ty: ưu tiên tenant_id.name / tenant_name / company_name
        const tenant = user.tenant_id || {};
        const companyName =
          tenant.name ||
          tenant.tenant_name ||
          tenant.company_name ||
          tenantFallbackName;

        return [
          exportedUserId,
          companyName,
          user.full_name || '',
          genderCode
        ];
      })
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-workers-${projectId}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Space>
          <TeamOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            Công nhân trong dự án
          </Title>
        </Space>
        <Space>
          <Upload.Dragger
            accept=".xlsx,.xls"
            multiple={false}
            maxCount={1}
            showUploadList={false}
            beforeUpload={(file) => handleImport(file)}
            disabled={importing}
          >
            <Button icon={<UploadOutlined />} loading={importing}>
              Import công nhân
            </Button>
          </Upload.Dragger>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            disabled={assignments.length === 0}
          >
            Export công nhân
          </Button>
        </Space>
      </div>

      <Card>
        {assignments.length === 0 ? (
          <Alert
            type="info"
            message="Chưa có công nhân nào trong dự án"
            description="Hãy sử dụng nút Import công nhân để thêm công nhân vào dự án."
            showIcon
          />
        ) : (
          <Table
            loading={loading}
            size="middle"
            rowKey={(record) =>
              record._id ||
              record.id ||
              record.user_id?._id ||
              record.user_id?.id ||
              Math.random().toString(36)
            }
            dataSource={assignments}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Họ tên',
                dataIndex: ['user_id', 'full_name'],
                key: 'full_name',
                render: (value: string) => (
                  <Space>
                    <UserOutlined />
                    <Text strong>{value || '-'}</Text>
                  </Space>
                ),
              },
              {
                title: 'Giới tính',
                dataIndex: ['user_id', 'gender'],
                key: 'gender',
                width: 120,
                render: (gender: string) => {
                  if (gender === 'male') return <Tag color="blue">Nam</Tag>;
                  if (gender === 'female') return <Tag color="magenta">Nữ</Tag>;
                  return <Text type="secondary">-</Text>;
                },
              },
              {
                title: 'Vai trò trong dự án',
                dataIndex: 'role_in_project',
                key: 'role_in_project',
                width: 180,
                render: (role: string) => (
                  <Tag color="geekblue">{role || 'WORKER'}</Tag>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default ProjectWorkers;


