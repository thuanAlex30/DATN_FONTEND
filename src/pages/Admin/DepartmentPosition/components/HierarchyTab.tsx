import React, { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Space,
  Button,
  Typography,
  Row,
  Col,
  Spin,
  Empty,
  Tag,
  Avatar,
  Tooltip,
  Badge,
  Switch,
  message
} from 'antd';
import {
  BankOutlined,
  UserOutlined,
  TeamOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { APIDepartment, APIPosition } from '../../../../types';
import type { HierarchyNode } from '../types';

const { Title, Text } = Typography;
const { TreeNode } = Tree;

interface HierarchyTabProps {
  departments: APIDepartment[];
  positions: APIPosition[];
  departmentEmployeeCounts: Record<string, number>;
  onRefresh: () => void;
}

const HierarchyTab: React.FC<HierarchyTabProps> = ({
  departments,
  positions,
  departmentEmployeeCounts,
  onRefresh
}) => {
  const [treeData, setTreeData] = useState<HierarchyNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [showPositions, setShowPositions] = useState(true);

  useEffect(() => {
    buildHierarchy();
  }, [departments, positions, showPositions]);

  const buildHierarchy = () => {
    setLoading(true);
    
    try {
      // Build department hierarchy
      const departmentMap = new Map<string, APIDepartment>();
      departments.forEach(dept => {
        departmentMap.set(dept.id, dept);
      });

      // Find root departments (no parent)
      const rootDepartments = departments.filter(dept => !dept.parent_department_id);
      
      const buildDepartmentNode = (dept: APIDepartment): HierarchyNode => {
        const children: HierarchyNode[] = [];
        
        // Add sub-departments
        const subDepartments = departments.filter(subDept => subDept.parent_department_id === dept.id);
        subDepartments.forEach(subDept => {
          children.push(buildDepartmentNode(subDept));
        });

        // Add positions if enabled
        if (showPositions) {
          const deptPositions = positions.filter(pos => pos.department_id === dept.id);
          deptPositions.forEach(pos => {
            children.push({
              id: `pos-${pos.id}`,
              name: pos.position_name,
              type: 'position',
              level: pos.level,
              children: [],
              data: pos,
              employeeCount: 0 // Positions don't have direct employee count
            });
          });
        }

        return {
          id: `dept-${dept.id}`,
          name: dept.department_name,
          type: 'department',
          level: 0,
          children,
          data: dept,
          employeeCount: departmentEmployeeCounts[dept.id] || 0,
          isExpanded: true
        };
      };

      const hierarchy = rootDepartments.map(dept => buildDepartmentNode(dept));
      setTreeData(hierarchy);
      
      // Auto-expand first level
      const firstLevelKeys = hierarchy.map(node => node.id);
      setExpandedKeys(firstLevelKeys);
      
    } catch (error) {
      console.error('Error building hierarchy:', error);
      message.error('Lỗi khi xây dựng cấu trúc tổ chức!');
    } finally {
      setLoading(false);
    }
  };

  const onExpand = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const getNodeIcon = (type: string, level?: number) => {
    switch (type) {
      case 'department':
        return <BankOutlined style={{ color: '#1890ff' }} />;
      case 'position':
        return <UserOutlined style={{ color: '#52c41a' }} />;
      default:
        return <TeamOutlined />;
    }
  };

  const getNodeColor = (type: string, level?: number) => {
    if (type === 'position' && level) {
      if (level <= 2) return '#52c41a';
      if (level <= 5) return '#1890ff';
      if (level <= 7) return '#faad14';
      return '#722ed1';
    }
    return '#1890ff';
  };

  const renderTreeNode = (node: HierarchyNode): React.ReactNode => {
    const isExpanded = expandedKeys.includes(node.id);
    
    return (
      <TreeNode
        key={node.id}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getNodeIcon(node.type, node.level)}
            <span style={{ fontWeight: node.type === 'department' ? 'bold' : 'normal' }}>
              {node.name}
            </span>
            {node.type === 'position' && node.level && (
              <Tag color={getNodeColor(node.type, node.level)} size="small">
                Cấp {node.level}
              </Tag>
            )}
            {node.type === 'department' && node.employeeCount !== undefined && (
              <Badge 
                count={node.employeeCount} 
                showZero 
                color="#52c41a"
                style={{ marginLeft: '8px' }}
              />
            )}
          </div>
        }
        icon={null}
      >
        {node.children.map(child => renderTreeNode(child))}
      </TreeNode>
    );
  };

  const expandAll = () => {
    const getAllKeys = (nodes: HierarchyNode[]): string[] => {
      let keys: string[] = [];
      nodes.forEach(node => {
        keys.push(node.id);
        keys = keys.concat(getAllKeys(node.children));
      });
      return keys;
    };
    setExpandedKeys(getAllKeys(treeData));
  };

  const collapseAll = () => {
    setExpandedKeys([]);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">Đang xây dựng cấu trúc tổ chức...</Text>
        </div>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Chưa có dữ liệu cấu trúc tổ chức"
        style={{ padding: '50px 0' }}
      >
        <Button type="primary" icon={<ReloadOutlined />} onClick={onRefresh}>
          Tải lại dữ liệu
        </Button>
      </Empty>
    );
  }

  return (
    <div>
      {/* Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                <BankOutlined /> Cấu trúc tổ chức
              </Title>
              <Text type="secondary">
                {departments.length} phòng ban, {positions.length} vị trí
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Switch
                checked={showPositions}
                onChange={setShowPositions}
                checkedChildren="Hiện vị trí"
                unCheckedChildren="Ẩn vị trí"
              />
              <Button.Group>
                <Button 
                  icon={<ExpandAltOutlined />} 
                  onClick={expandAll}
                  title="Mở rộng tất cả"
                >
                  Mở rộng
                </Button>
                <Button 
                  icon={<ShrinkOutlined />} 
                  onClick={collapseAll}
                  title="Thu gọn tất cả"
                >
                  Thu gọn
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={onRefresh}
                  title="Làm mới"
                >
                  Làm mới
                </Button>
              </Button.Group>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Hierarchy Tree */}
      <Card>
        <Tree
          showLine={{ showLeafIcon: false }}
          showIcon={false}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onExpand={onExpand}
          style={{ background: 'transparent' }}
        >
          {treeData.map(node => renderTreeNode(node))}
        </Tree>
      </Card>

      {/* Legend */}
      <Card style={{ marginTop: '16px' }}>
        <Title level={5}>Chú thích</Title>
        <Row gutter={[16, 8]}>
          <Col>
            <Space>
              <BankOutlined style={{ color: '#1890ff' }} />
              <Text>Phòng ban</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <UserOutlined style={{ color: '#52c41a' }} />
              <Text>Vị trí công việc</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Badge count={0} showZero color="#52c41a" />
              <Text>Số nhân viên</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tag color="#52c41a" size="small">Cấp 1-2</Tag>
              <Text>Thực tập/Nhân viên</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tag color="#1890ff" size="small">Cấp 3-5</Tag>
              <Text>Chuyên viên/Quản lý</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tag color="#faad14" size="small">Cấp 6-7</Tag>
              <Text>Giám đốc</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tag color="#722ed1" size="small">Cấp 8-10</Tag>
              <Text>Lãnh đạo cấp cao</Text>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HierarchyTab;
