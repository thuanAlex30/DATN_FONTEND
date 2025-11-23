import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Typography,
  Space,
  Avatar,
  Tag,
  Button,
  Tooltip,
  Statistic,
  Divider
} from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ProgressTrackerProps {
  employees: any[];
  enrollments: any[];
  onViewDetails: (employee: any) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  employees,
  enrollments,
  onViewDetails
}) => {
  const [employeeProgress, setEmployeeProgress] = useState<any[]>([]);

  useEffect(() => {
    calculateProgress();
  }, [employees, enrollments]);

  const calculateProgress = () => {
    const progressData = employees.map(employee => {
      const employeeEnrollments = enrollments.filter(
        e => e.user_id && e.user_id._id === employee._id
      );
      
      const total = employeeEnrollments.length;
      const completed = employeeEnrollments.filter(e => e.status === 'completed').length;
      const inProgress = employeeEnrollments.filter(e => e.status === 'enrolled').length;
      const failed = employeeEnrollments.filter(e => e.status === 'failed').length;
      
      const progress = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        ...employee,
        total,
        completed,
        inProgress,
        failed,
        progress,
        enrollments: employeeEnrollments
      };
    });

    setEmployeeProgress(progressData.sort((a, b) => b.progress - a.progress));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 60) return '#fa8c16';
    return '#ff4d4f';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 80) return 'Xuất sắc';
    if (progress >= 60) return 'Tốt';
    if (progress >= 40) return 'Trung bình';
    return 'Cần cải thiện';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'enrolled': return 'blue';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled': return 'Đang học';
      case 'completed': return 'Hoàn thành';
      case 'failed': return 'Chưa đạt';
      default: return status;
    }
  };

  const totalEmployees = employeeProgress.length;
  const avgProgress = totalEmployees > 0 ? employeeProgress.reduce((sum, emp) => sum + (emp.progress || 0), 0) / totalEmployees : 0;
  const excellentEmployees = employeeProgress.filter(emp => (emp.progress || 0) >= 80).length;
  const needImprovement = employeeProgress.filter(emp => (emp.progress || 0) < 40).length;

  return (
    <div>
      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={totalEmployees}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiến độ trung bình"
              value={avgProgress}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={avgProgress} 
              size="small" 
              style={{ marginTop: '8px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Xuất sắc"
              value={excellentEmployees}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cần cải thiện"
              value={needImprovement}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Individual Progress */}
      <Card title="Tiến độ từng nhân viên">
        <Row gutter={[16, 16]}>
          {employeeProgress.map(employee => (
            <Col xs={24} sm={12} lg={8} key={employee._id}>
              <Card
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Tooltip title="Xem chi tiết">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />}
                      onClick={() => onViewDetails(employee)}
                    />
                  </Tooltip>
                ]}
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <div>
                        <Text strong style={{ fontSize: '14px' }}>
                          {employee.full_name || 'Tên không xác định'}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {employee.email || 'Email không xác định'}
                        </Text>
                      </div>
                    </Space>
                    <Tag color={getProgressColor(employee.progress)}>
                      {getProgressStatus(employee.progress)}
                    </Tag>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Tiến độ: {employee.completed}/{employee.total}
                      </Text>
                      <Text strong style={{ color: getProgressColor(employee.progress || 0) }}>
                        {(employee.progress || 0).toFixed(1)}%
                      </Text>
                    </div>
                    <Progress 
                      percent={employee.progress || 0} 
                      size="small"
                      strokeColor={getProgressColor(employee.progress || 0)}
                    />
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  <Row gutter={[8, 8]}>
                    <Col span={8}>
                      <div style={{ textAlign: 'center' }}>
                        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                          {employee.completed}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          Hoàn thành
                        </Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center' }}>
                        <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                          {employee.inProgress}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          Đang học
                        </Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center' }}>
                        <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                          {employee.failed}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          Chưa đạt
                        </Text>
                      </div>
                    </Col>
                  </Row>

                  {employee.enrollments.length > 0 && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Khóa học gần nhất:
                      </Text>
                      <div style={{ marginTop: '4px' }}>
                        {employee.enrollments.slice(0, 2).map((enrollment: any, index: number) => (
                          <div key={index} style={{ marginBottom: '2px' }}>
                            <Tag 
                              size="small" 
                              color={getStatusColor(enrollment.status)}
                            >
                              {getStatusText(enrollment.status)}
                            </Tag>
                            <Text style={{ fontSize: '11px', marginLeft: '4px' }}>
                              {enrollment.session_id?.course_id?.course_name || 'Khóa học không xác định'}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default ProgressTracker;
