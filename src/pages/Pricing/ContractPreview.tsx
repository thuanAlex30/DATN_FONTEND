import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Card,
  Button,
  Typography,
  Checkbox,
  Space,
  message,
  Spin,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import pricingService, { type CompanyInfo, type ContactPerson } from '../../services/pricingService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import landingStyles from '../Landing/Landing.module.css';

const { Title, Text } = Typography;

interface LocationState {
  planType: 'monthly' | 'quarterly' | 'yearly';
  companyInfo: CompanyInfo;
  contactPerson: ContactPerson;
}

const ContractPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state || !state.planType || !state.companyInfo || !state.contactPerson) {
      message.error('Thông tin không hợp lệ. Vui lòng quay lại và điền lại form.');
      navigate('/pricing');
      return;
    }

    generatePreview();

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);


  const loadPdfAsBlob = async (pdfUrl: string) => {
    try {
      console.log('🔄 [ContractPreview] Loading PDF as blob from:', pdfUrl);
      const response = await fetch(pdfUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('✅ [ContractPreview] PDF loaded as blob, blob URL created');
      setPdfBlobUrl(blobUrl);
      setPdfLoadError(false);
    } catch (error: any) {
      console.error('❌ [ContractPreview] Error loading PDF as blob:', error);
      setPdfLoadError(true);
      setPdfBlobUrl(null);
    }
  };

  const generatePreview = async () => {
    try {
      setLoading(true);
      console.log('🔄 [ContractPreview] Generating preview with data:', {
        planType: state.planType,
        companyName: state.companyInfo?.name,
        contactName: state.contactPerson?.name
      });

      const result = await pricingService.generateContractPreview({
        planType: state.planType,
        companyInfo: state.companyInfo,
        contactPerson: state.contactPerson
      });
      
      console.log('✅ [ContractPreview] Preview generated:', result);
      console.log('📄 [ContractPreview] PDF URL:', result.previewPdfUrl);
      
      if (!result.previewPdfUrl) {
        throw new Error('Không nhận được URL PDF từ server');
      }

      const pdfUrl = result.previewPdfUrl;
      
      if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
        console.warn('⚠️ [ContractPreview] PDF URL không có protocol, thêm http://');
        const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        const fullUrl = pdfUrl.startsWith('/') ? `${backendUrl}${pdfUrl}` : `${backendUrl}/${pdfUrl}`;
        setPreviewPdfUrl(fullUrl);
        await loadPdfAsBlob(fullUrl);
      } else {
        setPreviewPdfUrl(pdfUrl);
        await loadPdfAsBlob(pdfUrl);
      }
      
      message.success('Đã tạo preview hợp đồng thành công');
    } catch (error: any) {
      console.error('❌ [ContractPreview] Error generating preview:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Có lỗi xảy ra khi tạo preview hợp đồng';
      
      message.error(errorMessage);
      
      if (error.response?.status === 404) {
        message.error('API endpoint không tìm thấy. Vui lòng kiểm tra lại server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/pricing/order', {
      state: {
        planType: state.planType,
        companyInfo: state.companyInfo,
        contactPerson: state.contactPerson
      }
    });
  };

  const handleConfirmAndPay = async () => {
    if (!agreed) {
      message.warning('Vui lòng xác nhận đã đọc kỹ hợp đồng');
      return;
    }

    try {
      setCreatingOrder(true);

      const orderData = {
        planType: state.planType,
        userId: user?.id,
        companyInfo: state.companyInfo,
        contactPerson: state.contactPerson
      };

      const result = await pricingService.createOrder(orderData);
      
      if (result.orderId) {
        localStorage.setItem('pending_order_id', result.orderId);
      }
      
      message.success('Đơn hàng đã được tạo thành công! Đang chuyển đến trang thanh toán...');
      
      setTimeout(() => {
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          message.error('Không thể lấy link thanh toán');
          setCreatingOrder(false);
        }
      }, 2000);
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Có lỗi xảy ra khi tạo đơn hàng';
      message.error(errorMessage);
      setCreatingOrder(false);
    }
  };

  const getPlanName = () => {
    switch (state.planType) {
      case 'monthly': return 'Gói Tháng';
      case 'quarterly': return 'Gói Quý';
      case 'yearly': return 'Gói Năm';
      default: return 'Gói Dịch vụ';
    }
  };

  return (
    <Layout className={landingStyles.layout}>
      <Layout.Content style={{ background: '#f0f2f5', padding: '40px 20px', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginBottom: 20 }}
            >
              Quay lại
            </Button>
            <Title level={2}>Xem trước hợp đồng</Title>
            <Text type="secondary">
              Vui lòng xem kỹ hợp đồng trước khi tiếp tục thanh toán
            </Text>
          </div>

          <Card>
            <Alert
              message="Hợp đồng dịch vụ"
              description={`Bạn đang đăng ký ${getPlanName()}. Vui lòng xem kỹ nội dung hợp đồng bên dưới.`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                <div style={{ marginTop: 20 }}>
                  <Text>Đang tạo preview hợp đồng...</Text>
                </div>
              </div>
            ) : previewPdfUrl ? (
              <div>
                {pdfLoadError ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    background: '#fff3cd',
                    borderRadius: '4px',
                    marginBottom: 24
                  }}>
                    <FilePdfOutlined style={{ fontSize: 48, color: '#ff9800' }} />
                    <div style={{ marginTop: 20 }}>
                      <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 10 }}>
                        Không thể hiển thị PDF trong trình duyệt
                      </Text>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                        Vui lòng tải về để xem hợp đồng
                      </Text>
                      <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={() => window.open(previewPdfUrl, '_blank')}
                        size="large"
                      >
                        Mở PDF trong tab mới
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ 
                      width: '100%', 
                      height: '800px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f5',
                      position: 'relative'
                    }}>
                      {pdfBlobUrl ? (
                        <>
                          <object
                            data={pdfBlobUrl}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                            style={{
                              display: 'block',
                              border: 'none'
                            }}
                          >
                            <embed
                              src={pdfBlobUrl}
                              type="application/pdf"
                              width="100%"
                              height="100%"
                              style={{
                                border: 'none'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              textAlign: 'center',
                              padding: '20px'
                            }}>
                              <FilePdfOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 10 }} />
                              <Text strong style={{ display: 'block', marginBottom: 10 }}>
                                Trình duyệt không hỗ trợ hiển thị PDF
                              </Text>
                              <Button
                                type="primary"
                                icon={<FilePdfOutlined />}
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = pdfBlobUrl;
                                  link.download = 'hop-dong.pdf';
                                  link.click();
                                }}
                              >
                                Tải về PDF
                              </Button>
                            </div>
                          </object>
                        </>
                      ) : previewPdfUrl ? (
                        <>
                          <iframe
                            key={previewPdfUrl}
                            src={previewPdfUrl}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                            title="Contract Preview"
                            onError={() => {
                              console.error('❌ [ContractPreview] Iframe error event');
                              setPdfLoadError(true);
                            }}
                            onLoad={() => {
                              console.log('✅ [ContractPreview] Iframe load event fired');
                              setPdfLoadError(false);
                            }}
                          />
                        </>
                      ) : null}
                      
                      {pdfLoadError && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'rgba(255, 255, 255, 0.95)',
                          padding: '20px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: 10,
                          textAlign: 'center'
                        }}>
                          <FilePdfOutlined style={{ fontSize: 48, color: '#ff9800', display: 'block', marginBottom: 10 }} />
                          <Text strong style={{ display: 'block', marginBottom: 10 }}>
                            Không thể tải PDF
                          </Text>
                          <Text type="secondary" style={{ display: 'block', marginBottom: 15, fontSize: '12px' }}>
                            Đảm bảo backend server đang chạy
                          </Text>
                          <Button
                            type="primary"
                            icon={<FilePdfOutlined />}
                            onClick={() => previewPdfUrl && window.open(previewPdfUrl, '_blank')}
                            size="large"
                          >
                            Thử mở trong tab mới
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ 
                  padding: '20px', 
                  background: '#f9f9f9', 
                  borderRadius: '4px',
                  marginBottom: 24
                }}>
                  <Checkbox
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ fontSize: '16px' }}
                  >
                    <Text strong>Tôi đã đọc kỹ hợp đồng và đồng ý với các điều khoản</Text>
                  </Checkbox>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Space size="large">
                    <Button
                      type="default"
                      size="large"
                      onClick={handleBack}
                      disabled={creatingOrder}
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={creatingOrder ? <LoadingOutlined /> : <CheckCircleOutlined />}
                      onClick={handleConfirmAndPay}
                      loading={creatingOrder}
                      disabled={!agreed || creatingOrder}
                    >
                      {creatingOrder ? 'Đang tạo đơn hàng...' : 'Tôi đã đọc kỹ hợp đồng - Tiếp tục thanh toán'}
                    </Button>
                  </Space>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                <div style={{ marginTop: 20 }}>
                  <Text type="danger">Không thể tạo preview hợp đồng</Text>
                </div>
                <Button
                  type="primary"
                  style={{ marginTop: 20 }}
                  onClick={generatePreview}
                  loading={loading}
                >
                  Thử lại
                </Button>
              </div>
            )}
          </Card>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default ContractPreviewPage;

