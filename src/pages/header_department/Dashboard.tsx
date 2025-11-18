import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import HeaderDepartmentLayout from '../../components/HeaderDepartment/HeaderDepartmentLayout';

const { Title, Paragraph } = Typography;

const HeaderDepartmentDashboard: React.FC = () => {
  return (
    <HeaderDepartmentLayout title="Dashboard trưởng bộ phận" icon={<TeamOutlined />}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={4}>Tổng quan an toàn & đào tạo</Title>
            <Paragraph type="secondary">
              Tổng quan nhanh về tình hình đào tạo, chứng chỉ, PPE và sự cố trong bộ phận.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Khóa đào tạo đang mở"
              value={8}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Nhân viên đủ chứng chỉ"
              value={42}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="PPE sắp hết hạn"
              value={5}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Sự cố trong tháng"
              value={2}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </HeaderDepartmentLayout>
  );
};

export default HeaderDepartmentDashboard;


