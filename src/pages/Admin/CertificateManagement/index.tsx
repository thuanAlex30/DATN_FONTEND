import React, { useState } from 'react';
import './CertificateManagement.css';

// Types
interface CompanyCertPackage {
  package_id: number;
  package_name: string;
  description: string;
  price: number;
  duration_months: number;
}

interface CompanyCertEnrollment {
  enrollment_id: number;
  package_id: number;
  company_name: string;
  tax_code: string;
  contact_person: string;
  phone: string;
  email: string;
  enrolled_at: string;
  status: 'active' | 'expired' | 'pending';
}

interface RevenueData {
  totalRevenue: number;
  totalEnrollments: number;
  averageValue: number;
  topPackage: { name: string; count: number };
  packageRevenue: Record<string, { revenue: number; count: number; price: number }>;
  monthlyRevenue: Record<string, number>;
}

const CertificateManagement: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'packages' | 'enrollments' | 'revenue'>('packages');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [currentEditingPackage, setCurrentEditingPackage] = useState<CompanyCertPackage | null>(null);
  const [currentEditingEnrollment, setCurrentEditingEnrollment] = useState<CompanyCertEnrollment | null>(null);
  
  // Form states
  const [packageForm, setPackageForm] = useState({
    package_name: '',
    description: '',
    price: 0,
    duration_months: 12
  });
  
  const [statusForm, setStatusForm] = useState({
    newStatus: 'active' as 'active' | 'expired' | 'pending',
    statusNote: ''
  });
  
  // Filter states
  const [packageSearch, setPackageSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('2024');
  const [monthFilter, setMonthFilter] = useState('');

  // Sample data
  const [companyCertPackages, setCompanyCertPackages] = useState<CompanyCertPackage[]>([
    {
      package_id: 1,
      package_name: "Gói Cơ bản",
      description: "Chứng chỉ an toàn lao động cơ bản cho doanh nghiệp nhỏ. Bao gồm các khóa học cơ bản về ATVSLĐ, cấp chứng chỉ cho 20 nhân viên.",
      price: 5000000,
      duration_months: 12
    },
    {
      package_id: 2,
      package_name: "Gói Tiêu chuẩn",
      description: "Chứng chỉ an toàn lao động đầy đủ cho doanh nghiệp vừa và nhỏ. Bao gồm đào tạo chuyên sâu, cấp chứng chỉ cho 50 nhân viên.",
      price: 8000000,
      duration_months: 24
    },
    {
      package_id: 3,
      package_name: "Gói Chuyên nghiệp",
      description: "Chứng chỉ an toàn lao động toàn diện cho doanh nghiệp lớn. Bao gồm đào tạo chuyên gia, tư vấn on-site, cấp chứng chỉ không giới hạn.",
      price: 12000000,
      duration_months: 24
    },
    {
      package_id: 4,
      package_name: "Gói Doanh nghiệp",
      description: "Giải pháp chứng chỉ tích hợp cho tập đoàn và doanh nghiệp lớn. Đào tạo tùy chỉnh, quản lý tập trung, hỗ trợ 24/7.",
      price: 20000000,
      duration_months: 36
    }
  ]);

  const [companyCertEnrollments, setCompanyCertEnrollments] = useState<CompanyCertEnrollment[]>([
    {
      enrollment_id: 1,
      package_id: 2,
      company_name: "Công ty TNHH Xây dựng An Phát",
      tax_code: "0123456789",
      contact_person: "Nguyễn Văn An",
      phone: "0901234567",
      email: "contact@anphat.vn",
      enrolled_at: "2024-01-15T09:00:00",
      status: "active"
    },
    {
      enrollment_id: 2,
      package_id: 1,
      company_name: "Công ty CP Sản xuất Bình Minh",
      tax_code: "0987654321",
      contact_person: "Trần Thị Bình",
      phone: "0912345678",
      email: "info@binhminh.com",
      enrolled_at: "2024-02-20T14:30:00",
      status: "active"
    },
    {
      enrollment_id: 3,
      package_id: 3,
      company_name: "Tập đoàn Công nghiệp Cường Thịnh",
      tax_code: "0555666777",
      contact_person: "Lê Văn Cường",
      phone: "0923456789",
      email: "admin@cuongthinh.vn",
      enrolled_at: "2023-12-10T11:15:00",
      status: "expired"
    },
    {
      enrollment_id: 4,
      package_id: 4,
      company_name: "Công ty TNHH Đầu tư Phát Triển",
      tax_code: "0111222333",
      contact_person: "Phạm Thị Dung",
      phone: "0934567890",
      email: "contact@phattriendt.com",
      enrolled_at: "2024-03-05T16:45:00",
      status: "pending"
    },
    {
      enrollment_id: 5,
      package_id: 2,
      company_name: "Công ty CP Thương mại Em Việt",
      tax_code: "0444555666",
      contact_person: "Hoàng Văn Em",
      phone: "0945678901",
      email: "sales@emviet.vn",
      enrolled_at: "2024-02-28T10:20:00",
      status: "active"
    },
    {
      enrollment_id: 6,
      package_id: 1,
      company_name: "Công ty TNHH Sản xuất Hòa Bình",
      tax_code: "0777888999",
      contact_person: "Nguyễn Thị Hòa",
      phone: "0956789012",
      email: "info@hoabinh.com",
      enrolled_at: "2024-01-08T08:30:00",
      status: "active"
    },
    {
      enrollment_id: 7,
      package_id: 3,
      company_name: "Tổng Công ty Xây dựng Miền Nam",
      tax_code: "0333444555",
      contact_person: "Võ Văn Nam",
      phone: "0967890123",
      email: "contact@miennam.vn",
      enrolled_at: "2024-02-12T15:20:00",
      status: "active"
    },
    {
      enrollment_id: 8,
      package_id: 2,
      company_name: "Công ty CP Công nghiệp Thành Đạt",
      tax_code: "0666777888",
      contact_person: "Lý Thị Đạt",
      phone: "0978901234",
      email: "admin@thanhdat.com",
      enrolled_at: "2023-11-25T13:45:00",
      status: "expired"
    }
  ]);

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const getPackageName = (packageId: number): string => {
    const pkg = companyCertPackages.find(p => p.package_id === packageId);
    return pkg ? pkg.package_name : 'Không xác định';
  };

  const getPackagePrice = (packageId: number): number => {
    const pkg = companyCertPackages.find(p => p.package_id === packageId);
    return pkg ? pkg.price : 0;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'active': 'Đang hoạt động',
      'expired': 'Hết hạn',
      'pending': 'Chờ xử lý'
    };
    return labels[status] || status;
  };

  const calculateExpiryDate = (enrolledAt: string, durationMonths: number): Date => {
    const enrollDate = new Date(enrolledAt);
    const expiryDate = new Date(enrollDate);
    expiryDate.setMonth(enrollDate.getMonth() + durationMonths);
    return expiryDate;
  };

  const getEnrollmentCountByPackage = (packageId: number): number => {
    return companyCertEnrollments.filter(e => e.package_id === packageId).length;
  };

  const getActiveEnrollmentCountByPackage = (packageId: number): number => {
    return companyCertEnrollments.filter(e => e.package_id === packageId && e.status === 'active').length;
  };

  // Filter functions
  const getFilteredPackages = (): CompanyCertPackage[] => {
    return companyCertPackages.filter(pkg => {
      const matchesSearch = pkg.package_name.toLowerCase().includes(packageSearch.toLowerCase()) ||
                          pkg.description.toLowerCase().includes(packageSearch.toLowerCase());
      const matchesDuration = !durationFilter || pkg.duration_months.toString() === durationFilter;
      
      return matchesSearch && matchesDuration;
    });
  };

  const getFilteredEnrollments = (): CompanyCertEnrollment[] => {
    return companyCertEnrollments.filter(enrollment => {
      const matchesSearch = enrollment.company_name.toLowerCase().includes(enrollmentSearch.toLowerCase()) ||
                          enrollment.tax_code.includes(enrollmentSearch) ||
                          enrollment.contact_person.toLowerCase().includes(enrollmentSearch.toLowerCase());
      const matchesStatus = !statusFilter || enrollment.status === statusFilter;
      const matchesPackage = !packageFilter || enrollment.package_id.toString() === packageFilter;
      
      return matchesSearch && matchesStatus && matchesPackage;
    });
  };

  // Revenue calculation
  const calculateRevenue = (year: string, month: string): RevenueData => {
    let filteredData = companyCertEnrollments.filter(enrollment => {
      const enrollDate = new Date(enrollment.enrolled_at);
      const enrollYear = enrollDate.getFullYear();
      const enrollMonth = enrollDate.getMonth() + 1;
      
      if (year && enrollYear !== parseInt(year)) return false;
      if (month && enrollMonth !== parseInt(month)) return false;
      
      return true;
    });
    
    let totalRevenue = 0;
    let packageRevenue: Record<string, { revenue: number; count: number; price: number }> = {};
    let monthlyRevenue: Record<string, number> = {};
    
    filteredData.forEach(enrollment => {
      const pkg = companyCertPackages.find(p => p.package_id === enrollment.package_id);
      if (pkg) {
        totalRevenue += pkg.price;
        
        // Package revenue
        if (!packageRevenue[pkg.package_name]) {
          packageRevenue[pkg.package_name] = {
            revenue: 0,
            count: 0,
            price: pkg.price
          };
        }
        packageRevenue[pkg.package_name].revenue += pkg.price;
        packageRevenue[pkg.package_name].count += 1;
        
        // Monthly revenue
        const monthKey = new Date(enrollment.enrolled_at).toISOString().slice(0, 7);
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = 0;
        }
        monthlyRevenue[monthKey] += pkg.price;
      }
    });
    
    // Find top package
    let topPackage = { name: 'Không có', count: 0 };
    Object.keys(packageRevenue).forEach(packageName => {
      if (packageRevenue[packageName].count > topPackage.count) {
        topPackage = {
          name: packageName,
          count: packageRevenue[packageName].count
        };
      }
    });
    
    return {
      totalRevenue,
      totalEnrollments: filteredData.length,
      averageValue: filteredData.length > 0 ? totalRevenue / filteredData.length : 0,
      topPackage,
      packageRevenue,
      monthlyRevenue
    };
  };

  // Modal handlers
  const openModal = (modalId: string) => {
    setShowModal(modalId);
  };

  const closeModal = () => {
    setShowModal(null);
    setCurrentEditingPackage(null);
    setCurrentEditingEnrollment(null);
    setPackageForm({
      package_name: '',
      description: '',
      price: 0,
      duration_months: 12
    });
    setStatusForm({
      newStatus: 'active',
      statusNote: ''
    });
  };

  // Package management
  const editPackage = (packageId: number) => {
    const pkg = companyCertPackages.find(p => p.package_id === packageId);
    if (pkg) {
      setCurrentEditingPackage(pkg);
      setPackageForm({
        package_name: pkg.package_name,
        description: pkg.description,
        price: pkg.price,
        duration_months: pkg.duration_months
      });
      openModal('addPackageModal');
    }
  };

  const deletePackage = (packageId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gói chứng chỉ này?')) {
      const enrollmentCount = getEnrollmentCountByPackage(packageId);
      if (enrollmentCount > 0) {
        alert('Không thể xóa gói này vì đã có doanh nghiệp đăng ký!');
        return;
      }
      
      setCompanyCertPackages(prev => prev.filter(p => p.package_id !== packageId));
    }
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentEditingPackage) {
      // Update existing package
      setCompanyCertPackages(prev => prev.map(pkg => 
        pkg.package_id === currentEditingPackage.package_id 
          ? { ...pkg, ...packageForm }
          : pkg
      ));
    } else {
      // Create new package
      const newPackage: CompanyCertPackage = {
        package_id: Math.max(...companyCertPackages.map(p => p.package_id)) + 1,
        ...packageForm
      };
      setCompanyCertPackages(prev => [...prev, newPackage]);
    }
    
    closeModal();
  };

  // Enrollment management
  const viewEnrollmentDetails = (enrollmentId: number) => {
    const enrollment = companyCertEnrollments.find(e => e.enrollment_id === enrollmentId);
    if (enrollment) {
      setCurrentEditingEnrollment(enrollment);
      openModal('enrollmentModal');
    }
  };

  const updateEnrollmentStatus = (enrollmentId: number) => {
    const enrollment = companyCertEnrollments.find(e => e.enrollment_id === enrollmentId);
    if (enrollment) {
      setCurrentEditingEnrollment(enrollment);
      setStatusForm({
        newStatus: enrollment.status,
        statusNote: ''
      });
      openModal('updateStatusModal');
    }
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentEditingEnrollment) {
      setCompanyCertEnrollments(prev => prev.map(enrollment => 
        enrollment.enrollment_id === currentEditingEnrollment.enrollment_id
          ? { ...enrollment, status: statusForm.newStatus }
          : enrollment
      ));
      closeModal();
    }
  };

  const exportEnrollmentReport = () => {
    const filteredEnrollments = getFilteredEnrollments();
    const data = filteredEnrollments.map(enrollment => {
      const pkg = companyCertPackages.find(p => p.package_id === enrollment.package_id);
      const expiryDate = calculateExpiryDate(enrollment.enrolled_at, pkg?.duration_months || 0);
      
      return [
        enrollment.company_name,
        enrollment.tax_code,
        enrollment.contact_person,
        enrollment.phone,
        enrollment.email,
        pkg?.package_name || 'Không xác định',
        formatCurrency(pkg?.price || 0),
        formatDate(enrollment.enrolled_at),
        formatDate(expiryDate.toISOString()),
        getStatusLabel(enrollment.status)
      ];
    });
    
    const headers = [
      'Tên doanh nghiệp',
      'Mã số thuế',
      'Người liên hệ',
      'Số điện thoại',
      'Email',
      'Gói chứng chỉ',
      'Giá gói',
      'Ngày đăng ký',
      'Ngày hết hạn',
      'Trạng thái'
    ];
    
    // Convert to CSV
    const csvContent = [headers, ...data].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Download CSV
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_dang_ky_chung_chi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tab switching
  const switchTab = (tabName: 'packages' | 'enrollments' | 'revenue') => {
    setActiveTab(tabName);
  };

  const filteredPackages = getFilteredPackages();
  const filteredEnrollments = getFilteredEnrollments();
  const revenueData = calculateRevenue(yearFilter, monthFilter);

  return (
    <div className="certificate-management-container">
      {/* Header */}
      <div className="header">
        <div>
          <h1><i className="fas fa-certificate"></i> Quản lý chứng chỉ doanh nghiệp</h1>
          <div className="breadcrumb">
            <a href="/admin">Dashboard</a> / Chứng chỉ doanh nghiệp
          </div>
        </div>
        <a href="/admin" className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Quay lại
        </a>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className="tab-nav">
          <button 
            className={`tab-button ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => switchTab('packages')}
          >
            <i className="fas fa-box-open"></i> Gói chứng chỉ
          </button>
          <button 
            className={`tab-button ${activeTab === 'enrollments' ? 'active' : ''}`}
            onClick={() => switchTab('enrollments')}
          >
            <i className="fas fa-building"></i> Đăng ký doanh nghiệp
          </button>
          <button 
            className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => switchTab('revenue')}
          >
            <i className="fas fa-chart-line"></i> Doanh thu
          </button>
        </div>

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm gói chứng chỉ..." 
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                  />
                </div>
                
                <select 
                  className="filter-select" 
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                >
                  <option value="">Tất cả thời hạn</option>
                  <option value="12">12 tháng</option>
                  <option value="24">24 tháng</option>
                  <option value="36">36 tháng</option>
                </select>
              </div>
              
              <button className="btn btn-primary" onClick={() => openModal('addPackageModal')}>
                <i className="fas fa-plus"></i> Tạo gói mới
              </button>
            </div>

            <div className="data-grid">
              {filteredPackages.map(pkg => {
                const enrollmentCount = getEnrollmentCountByPackage(pkg.package_id);
                const activeCount = getActiveEnrollmentCountByPackage(pkg.package_id);
                
                return (
                  <div key={pkg.package_id} className="cert-card">
                    <div className="card-header">
                      <div className="cert-icon">
                        <i className="fas fa-certificate"></i>
                      </div>
                      <div className="card-title">{pkg.package_name}</div>
                      <div className="card-description">{pkg.description}</div>
                    </div>
                    <div className="card-body">
                      <div className="cert-info">
                        <div className="info-item">
                          <i className="fas fa-clock"></i>
                          <span>{pkg.duration_months} tháng</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-building"></i>
                          <span>{enrollmentCount} doanh nghiệp</span>
                        </div>
                      </div>
                      
                      <div className="price-display">
                        <div className="price-amount">{formatCurrency(pkg.price)}</div>
                        <div className="price-label">Giá gói</div>
                      </div>
                      
                      <div className="enrollment-stats">
                        <div className="stats-title">Thống kê đăng ký</div>
                        <div className="stats-row">
                          <span>Đang hoạt động:</span>
                          <strong>{activeCount}</strong>
                        </div>
                        <div className="stats-row">
                          <span>Tổng đăng ký:</span>
                          <strong>{enrollmentCount}</strong>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="btn btn-sm btn-primary" onClick={() => editPackage(pkg.package_id)}>
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => deletePackage(pkg.package_id)}>
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên doanh nghiệp..." 
                    value={enrollmentSearch}
                    onChange={(e) => setEnrollmentSearch(e.target.value)}
                  />
                </div>
                
                <select 
                  className="filter-select" 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="expired">Hết hạn</option>
                  <option value="pending">Chờ xử lý</option>
                </select>
                
                <select 
                  className="filter-select" 
                  value={packageFilter}
                  onChange={(e) => setPackageFilter(e.target.value)}
                >
                  <option value="">Tất cả gói</option>
                  {companyCertPackages.map(pkg => (
                    <option key={pkg.package_id} value={pkg.package_id}>{pkg.package_name}</option>
                  ))}
                </select>
              </div>
              
              <button className="btn btn-success" onClick={exportEnrollmentReport}>
                <i className="fas fa-download"></i> Xuất báo cáo
              </button>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Doanh nghiệp</th>
                    <th>Mã số thuế</th>
                    <th>Gói chứng chỉ</th>
                    <th>Liên hệ</th>
                    <th>Ngày đăng ký</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map(enrollment => {
                    const pkg = companyCertPackages.find(p => p.package_id === enrollment.package_id);
                    const expiryDate = calculateExpiryDate(enrollment.enrolled_at, pkg?.duration_months || 0);
                    
                    return (
                      <tr key={enrollment.enrollment_id}>
                        <td>
                          <strong>{enrollment.company_name}</strong><br />
                          <small>{enrollment.contact_person}</small>
                        </td>
                        <td>{enrollment.tax_code}</td>
                        <td>
                          <strong>{getPackageName(enrollment.package_id)}</strong><br />
                          <small>{formatCurrency(getPackagePrice(enrollment.package_id))}</small>
                        </td>
                        <td>
                          <i className="fas fa-phone"></i> {enrollment.phone}<br />
                          <i className="fas fa-envelope"></i> {enrollment.email}
                        </td>
                        <td>
                          <strong>{formatDate(enrollment.enrolled_at)}</strong><br />
                          <small>Hết hạn: {formatDate(expiryDate.toISOString())}</small>
                        </td>
                        <td>
                          <span className={`status-badge status-${enrollment.status}`}>
                            {getStatusLabel(enrollment.status)}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={() => viewEnrollmentDetails(enrollment.enrollment_id)}>
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-warning" onClick={() => updateEnrollmentStatus(enrollment.enrollment_id)}>
                            <i className="fas fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <select 
                  className="filter-select" 
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
                
                <select 
                  className="filter-select" 
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  <option value="">Cả năm</option>
                  <option value="1">Tháng 1</option>
                  <option value="2">Tháng 2</option>
                  <option value="3">Tháng 3</option>
                  <option value="4">Tháng 4</option>
                  <option value="5">Tháng 5</option>
                  <option value="6">Tháng 6</option>
                  <option value="7">Tháng 7</option>
                  <option value="8">Tháng 8</option>
                  <option value="9">Tháng 9</option>
                  <option value="10">Tháng 10</option>
                  <option value="11">Tháng 11</option>
                  <option value="12">Tháng 12</option>
                </select>
              </div>
            </div>

            <div className="revenue-summary">
              <div className="revenue-card">
                <div className="revenue-icon" style={{background: 'linear-gradient(135deg, #2ecc71, #27ae60)'}}>
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="revenue-amount">{formatCurrency(revenueData.totalRevenue)}</div>
                <div className="revenue-label">Tổng doanh thu</div>
              </div>
              
              <div className="revenue-card">
                <div className="revenue-icon" style={{background: 'linear-gradient(135deg, #3498db, #2980b9)'}}>
                  <i className="fas fa-building"></i>
                </div>
                <div className="revenue-amount">{revenueData.totalEnrollments}</div>
                <div className="revenue-label">Doanh nghiệp đăng ký</div>
              </div>
              
              <div className="revenue-card">
                <div className="revenue-icon" style={{background: 'linear-gradient(135deg, #f39c12, #e67e22)'}}>
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="revenue-amount">{formatCurrency(revenueData.averageValue)}</div>
                <div className="revenue-label">Giá trị trung bình</div>
              </div>
              
              <div className="revenue-card">
                <div className="revenue-icon" style={{background: 'linear-gradient(135deg, #9b59b6, #8e44ad)'}}>
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="revenue-amount">{revenueData.topPackage.name}</div>
                <div className="revenue-label">Gói phổ biến nhất</div>
              </div>
            </div>
            
            <div className="chart-container">
              <h3 style={{marginBottom: '1.5rem', color: '#2c3e50'}}>
                <i className="fas fa-chart-bar"></i> Doanh thu theo gói chứng chỉ
              </h3>
              <div style={{display: 'grid', gap: '1rem'}}>
                {Object.keys(revenueData.packageRevenue).map(packageName => {
                  const pkg = revenueData.packageRevenue[packageName];
                  const percentage = (pkg.revenue / revenueData.totalRevenue * 100).toFixed(1);
                  
                  return (
                    <div key={packageName} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(52, 152, 219, 0.05)', borderRadius: '10px'}}>
                      <div>
                        <strong>{packageName}</strong><br />
                        <small>{pkg.count} đăng ký</small>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <strong>{formatCurrency(pkg.revenue)}</strong><br />
                        <small>{percentage}%</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="chart-container">
              <h3 style={{marginBottom: '1.5rem', color: '#2c3e50'}}>
                <i className="fas fa-calendar-alt"></i> Doanh thu theo tháng
              </h3>
              <div style={{display: 'grid', gap: '1rem'}}>
                {Object.keys(revenueData.monthlyRevenue).sort().map(month => {
                  const revenue = revenueData.monthlyRevenue[month];
                  const monthName = new Date(month + '-01').toLocaleDateString('vi-VN', { 
                    year: 'numeric', 
                    month: 'long' 
                  });
                  
                  return (
                    <div key={month} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(46, 204, 113, 0.05)', borderRadius: '10px'}}>
                      <div>
                        <strong>{monthName}</strong>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <strong>{formatCurrency(revenue)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Package Modal */}
      {showModal === 'addPackageModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {currentEditingPackage ? 'Chỉnh sửa gói chứng chỉ' : 'Tạo gói chứng chỉ mới'}
              </h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form onSubmit={handlePackageSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên gói *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={packageForm.package_name}
                    onChange={(e) => setPackageForm(prev => ({ ...prev, package_name: e.target.value }))}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Giá (VNĐ) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={packageForm.price}
                    onChange={(e) => setPackageForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    required 
                    min="0" 
                    step="1000" 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Thời hạn (tháng) *</label>
                  <select 
                    className="form-input" 
                    value={packageForm.duration_months}
                    onChange={(e) => setPackageForm(prev => ({ ...prev, duration_months: parseInt(e.target.value) }))}
                    required
                  >
                    <option value="">Chọn thời hạn</option>
                    <option value="12">12 tháng</option>
                    <option value="24">24 tháng</option>
                    <option value="36">36 tháng</option>
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Mô tả gói</label>
                  <textarea 
                    className="form-input" 
                    rows={4} 
                    placeholder="Mô tả chi tiết về gói chứng chỉ..."
                    value={packageForm.description}
                    onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Lưu gói
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Enrollment Modal */}
      {showModal === 'enrollmentModal' && currentEditingEnrollment && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết đăng ký</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Tên doanh nghiệp</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057'}}>
                  {currentEditingEnrollment.company_name}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Mã số thuế</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057'}}>
                  {currentEditingEnrollment.tax_code}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Người liên hệ</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057'}}>
                  {currentEditingEnrollment.contact_person}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057'}}>
                  {currentEditingEnrollment.phone}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057'}}>
                  {currentEditingEnrollment.email}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Gói chứng chỉ</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057'}}>
                  {getPackageName(currentEditingEnrollment.package_id)} - {formatCurrency(getPackagePrice(currentEditingEnrollment.package_id))}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Ngày đăng ký</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057'}}>
                  {formatDateTime(currentEditingEnrollment.enrolled_at)}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Ngày hết hạn</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057'}}>
                  {(() => {
                    const pkg = companyCertPackages.find(p => p.package_id === currentEditingEnrollment.package_id);
                    const expiryDate = calculateExpiryDate(currentEditingEnrollment.enrolled_at, pkg?.duration_months || 0);
                    const remainingDays = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return `${formatDate(expiryDate.toISOString())} ${remainingDays > 0 ? `(còn ${remainingDays} ngày)` : '(đã hết hạn)'}`;
                  })()}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <div className="form-input" style={{background: '#f8f9fa'}}>
                  <span className={`status-badge status-${currentEditingEnrollment.status}`}>
                    {getStatusLabel(currentEditingEnrollment.status)}
                  </span>
                </div>
              </div>
              
              <div className="form-group full-width">
                <label className="form-label">Mô tả gói</label>
                <div className="form-input" style={{background: '#f8f9fa', color: '#495057', minHeight: '80px'}}>
                  {companyCertPackages.find(p => p.package_id === currentEditingEnrollment.package_id)?.description}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button className="btn btn-warning" onClick={() => updateEnrollmentStatus(currentEditingEnrollment.enrollment_id)}>
                <i className="fas fa-edit"></i> Cập nhật trạng thái
              </button>
              <button className="btn btn-secondary" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showModal === 'updateStatusModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Cập nhật trạng thái</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">Trạng thái mới *</label>
                <select 
                  className="form-input" 
                  value={statusForm.newStatus}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, newStatus: e.target.value as 'active' | 'expired' | 'pending' }))}
                  required
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="expired">Hết hạn</option>
                  <option value="pending">Chờ xử lý</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Lý do thay đổi trạng thái..."
                  value={statusForm.statusNote}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, statusNote: e.target.value }))}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateManagement;
