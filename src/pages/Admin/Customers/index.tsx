import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Input, Space, Button, message, Tooltip } from 'antd';
import { TeamOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../../../config/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

interface Customer {
  _id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  planType: string;
  amount: number;
  paymentDate: string;
  tenantCode: string;
  tenantStatus: string;
  subscriptionPlan: string;
  subscriptionExpiresAt: string | null;
  orderId: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');

  const loadCustomers = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pagination.pageSize,
        sort_by: 'paymentDate',
        sort_order: 'desc'
      };

      if (search) {
        params.search = search;
      }

      const response = await api.get('/tenants/customers/participating', { params });
      
      if (response.data.success) {
        setCustomers(response.data.data.customers);
        setPagination(prev => ({
          ...prev,
          current: response.data.data.pagination.page,
          total: response.data.data.pagination.total
        }));
      } else {
        message.error('Không thể tải danh sách khách hàng');
      }
    } catch (error: any) {
      console.error('Error loading customers:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(1, searchText);
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadCustomers(1, value);
  };

  const handleTableChange = (newPagination: any) => {
    loadCustomers(newPagination.current, searchText);
  };

  const formatPlanType = (planType: string) => {
    const planMap: { [key: string]: string } = {
      monthly: 'Tháng',
      quarterly: 'Quý',
      yearly: 'Năm'
    };
    return planMap[planType] || planType;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      active: 'green',
      inactive: 'default',
      suspended: 'red',
      ACTIVE: 'green',
      INACTIVE: 'default',
      SUSPENDED: 'red'
    };
    return statusMap[status] || 'default';
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      }
    },
    {
      title: 'Tên công ty',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 250,
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: 'Người đại diện',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 150
    },
    {
      title: 'Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 120
    },
    {
      title: 'Gói dịch vụ',
      dataIndex: 'planType',
      key: 'planType',
      width: 100,
      render: (planType: string) => (
        <Tag color="blue">{formatPlanType(planType)}</Tag>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <Text strong>{formatCurrency(amount)}</Text>
      )
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'tenantStatus',
      key: 'tenantStatus',
      width: 120,
      render: (status: string) => {
        if (status === 'Chưa tạo' || status === 'Đang xử lý...') {
          return <Tag color="orange">{status}</Tag>;
        }
        return (
          <Tag color={getStatusColor(status)}>
            {status === 'active' || status === 'ACTIVE' ? 'Hoạt động' : 
             status === 'inactive' || status === 'INACTIVE' ? 'Không hoạt động' :
             status === 'suspended' || status === 'SUSPENDED' ? 'Tạm dừng' : status}
          </Tag>
        );
      }
    },
    {
      title: 'Hết hạn',
      dataIndex: 'subscriptionExpiresAt',
      key: 'subscriptionExpiresAt',
      width: 150,
      render: (date: string | null) => {
        if (!date) return <Text type="secondary">-</Text>;
        const expiryDate = dayjs(date);
        const isExpired = expiryDate.isBefore(dayjs());
        return (
          <Text type={isExpired ? 'danger' : 'success'}>
            {expiryDate.format('DD/MM/YYYY')}
          </Text>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              <TeamOutlined /> Khách hàng tham gia
            </Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadCustomers(pagination.current, searchText)}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>

          {/* Search */}
          <Search
            placeholder="Tìm kiếm theo tên công ty, người đại diện, email..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ maxWidth: 500 }}
          />

          {/* Table */}
          {customers.length === 0 && !loading ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Chưa có khách hàng nào đã thanh toán và được cấp account.
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '14px', marginTop: '10px', display: 'block' }}>
                  Danh sách sẽ hiển thị các công ty đã thanh toán gói dịch vụ và được tạo tài khoản trong hệ thống.
                </Text>
              </div>
            </Card>
          ) : (
            <Table
              columns={columns}
              dataSource={customers}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng: ${total} khách hàng`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Customers;

