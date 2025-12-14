import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Typography, Space } from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  CloseOutlined, 
  DeleteOutlined,
  RobotOutlined,
  UserOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import chatbotService, { type ChatMessage, type NavigationAction } from '../../services/chatbotService';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import './Chatbot.css';

const { TextArea } = Input;
const { Text } = Typography;

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const previousUserRef = useRef<{ userId?: string; tenantId?: string } | null>(null);
  const isCreatingSessionRef = useRef<boolean>(false);

  // Hàm tạo UUID đơn giản (fallback nếu crypto.randomUUID không có)
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: tạo UUID v4 đơn giản
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Detect khi user mới đăng nhập và clear lịch sử
  useEffect(() => {
    if (isAuthenticated && user) {
      const currentUserId = user.id || (user as any)?._id || undefined;
      const currentTenantId = user.tenant_id;
      const previousUser = previousUserRef.current;

      // Kiểm tra nếu user hoặc tenant thay đổi (user mới đăng nhập)
      // Hoặc nếu đây là lần đầu tiên user đăng nhập (previousUser = null)
      if (!previousUser || 
          previousUser.userId !== currentUserId || 
          previousUser.tenantId !== currentTenantId) {
        // User mới đăng nhập hoặc user/tenant thay đổi - clear lịch sử và tạo session mới
        console.log('🔄 User đăng nhập, xóa lịch sử Chatbot để tạo sự độc lập giữa các account');
        setMessages([]);
        
        // Clear lịch sử trên server nếu có sessionId cũ (sử dụng sessionId hiện tại trước khi clear)
        const oldSessionId = sessionId;
        if (oldSessionId && previousUser?.userId) {
          chatbotService.clearChatHistory(oldSessionId).catch(err => {
            console.log('Không thể clear lịch sử cũ (có thể session đã hết hạn):', err);
          });
        }
        
        // Reset sessionId để trigger tạo session mới
        setSessionId(null);
      }

      // Lưu thông tin user hiện tại (luôn cập nhật)
      previousUserRef.current = {
        userId: currentUserId,
        tenantId: currentTenantId
      };
    } else if (!isAuthenticated) {
      // User đã logout - clear lịch sử
      setMessages([]);
      setSessionId(null);
      previousUserRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, (user as any)?._id, user?.tenant_id]);

  // Tạo session mới khi component mount hoặc khi sessionId bị clear
  useEffect(() => {
    // Chỉ tạo session mới nếu chưa có sessionId và chưa đang trong quá trình tạo
    if (sessionId || isCreatingSessionRef.current) {
      return; // Đã có sessionId hoặc đang tạo, không cần tạo mới
    }

    let isCancelled = false; // Flag để tránh setState sau khi component unmount
    isCreatingSessionRef.current = true; // Đánh dấu đang tạo session

    const createSession = async () => {
      // Tạo sessionId ngay lập tức (local) để input có thể hoạt động
      const localSessionId = generateUUID();
      if (!isCancelled) {
        setSessionId(localSessionId);
      }
      
      // Thử tạo session trên server (không bắt buộc)
      // Chatbot có thể hoạt động mà không cần đăng nhập
      try {
        const response = await chatbotService.createSession();
        if (response.data.success && !isCancelled) {
          // Nếu server trả về sessionId, dùng sessionId từ server
          setSessionId(response.data.data.sessionId);
        }
      } catch (error: any) {
        // Lỗi không quan trọng, vẫn dùng localSessionId
        // Chatbot có thể hoạt động mà không cần server session
        // Chỉ log lỗi nếu không phải 429 (Too Many Requests) để tránh spam console
        if (error?.response?.status !== 429) {
          console.log('Session creation on server failed (optional, chatbot still works):', error?.message || error);
        }
      } finally {
        // Reset flag sau khi hoàn thành (thành công hoặc thất bại)
        if (!isCancelled) {
          isCreatingSessionRef.current = false;
        }
      }
    };
    
    createSession();

    // Cleanup function
    return () => {
      isCancelled = true;
      isCreatingSessionRef.current = false;
    };
  }, [sessionId]);

  // Load lịch sử chat khi mở chatbot (chỉ khi đã đăng nhập)
  useEffect(() => {
    if (isOpen && sessionId && isAuthenticated) {
      loadChatHistory();
    }
  }, [isOpen, sessionId, isAuthenticated]);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Hàm detect và tạo navigation actions dựa trên nội dung message
  const detectNavigationActions = (message: string, response: string): NavigationAction[] => {
    const actions: NavigationAction[] = [];
    
    // Kiểm tra an toàn
    if (!message || !response) {
      return actions;
    }
    
    const lowerMessage = message.toLowerCase();
    const lowerResponse = response.toLowerCase();

    // Detect đăng ký/pricing/bảng giá
    if (lowerMessage.includes('đăng ký') || 
        lowerMessage.includes('pricing') || 
        lowerMessage.includes('bảng giá') || 
        lowerMessage.includes('giá') ||
        lowerMessage.includes('gói dịch vụ') ||
        lowerMessage.includes('dịch vụ') ||
        lowerResponse.includes('pricing') ||
        lowerResponse.includes('bảng giá') ||
        lowerResponse.includes('đăng ký')) {
      actions.push({
        label: 'Xem bảng giá',
        path: '/pricing',
        icon: 'DollarOutlined'
      });
    }

    // Detect báo cáo sự cố
    if (lowerMessage.includes('báo cáo sự cố') || 
        lowerMessage.includes('sự cố') ||
        lowerMessage.includes('incident') ||
        lowerResponse.includes('báo cáo sự cố')) {
      if (isAuthenticated && user) {
        // Kiểm tra role để điều hướng đúng
        try {
          const userRole = user?.role?.role_code || (user?.role?.role_name ? user.role.role_name.toLowerCase() : '');
          if (userRole === 'manager' || userRole === 'employee') {
            actions.push({
              label: 'Báo cáo sự cố',
              path: '/manager/incidents/report',
              icon: 'ExclamationCircleOutlined'
            });
          }
        } catch (error) {
          // Nếu có lỗi khi kiểm tra role, bỏ qua
          console.error('Error checking user role:', error);
        }
      } else {
        actions.push({
          label: 'Đăng nhập để báo cáo',
          path: '/login',
          icon: 'ExclamationCircleOutlined'
        });
      }
    }

    // Detect PPE
    if (lowerMessage.includes('ppe') || 
        lowerMessage.includes('thiết bị bảo hộ') ||
        lowerMessage.includes('bảo hộ lao động') ||
        lowerResponse.includes('ppe')) {
      if (isAuthenticated) {
        actions.push({
          label: 'Quản lý PPE',
          path: '/manager/ppe',
          icon: 'SafetyOutlined'
        });
      }
    }

    // Detect đào tạo
    if (lowerMessage.includes('đào tạo') || 
        lowerMessage.includes('training') ||
        lowerResponse.includes('đào tạo')) {
      if (isAuthenticated) {
        actions.push({
          label: 'Quản lý đào tạo',
          path: '/manager/training',
          icon: 'BookOutlined'
        });
      }
    }

    // Detect dự án
    if (lowerMessage.includes('dự án') || 
        lowerMessage.includes('project') ||
        lowerResponse.includes('dự án')) {
      if (isAuthenticated) {
        actions.push({
          label: 'Quản lý dự án',
          path: '/manager/project-management',
          icon: 'ProjectOutlined'
        });
      }
    }

    return actions;
  };

  // Hàm render icon dựa trên icon name
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'DollarOutlined':
        return <DollarOutlined />;
      case 'ShoppingCartOutlined':
        return <ShoppingCartOutlined />;
      case 'FileTextOutlined':
        return <FileTextOutlined />;
      case 'SafetyOutlined':
        return <SafetyOutlined />;
      case 'ExclamationCircleOutlined':
        return <ExclamationCircleOutlined />;
      case 'BookOutlined':
        return <BookOutlined />;
      case 'ProjectOutlined':
        return <ProjectOutlined />;
      default:
        return null;
    }
  };

  // Hàm xử lý click vào nút điều hướng
  const handleNavigationClick = (path: string) => {
    try {
      if (navigate && path) {
        navigate(path);
        // Đóng chatbot sau khi điều hướng
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error navigating:', error);
      // Fallback: sử dụng window.location nếu navigate không hoạt động
      if (path) {
        window.location.href = path;
      }
    }
  };

  const loadChatHistory = async () => {
    if (!sessionId || !isAuthenticated) return;
    
    try {
      const response = await chatbotService.getChatHistory(sessionId);
      if (response.data.success) {
        const historyMessages = response.data.data.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Không hiển thị lỗi nếu chưa đăng nhập (đây là hành vi bình thường)
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Thêm tin nhắn user vào UI ngay lập tức
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        message: userMessage.content,
        sessionId: sessionId
      });

      if (response.data.success) {
        const responseContent = response.data.data.response;
        // Detect và thêm navigation actions
        let actions: NavigationAction[] = [];
        try {
          actions = detectNavigationActions(userMessage.content, responseContent);
        } catch (error) {
          console.error('Error detecting navigation actions:', error);
          // Nếu có lỗi, tiếp tục mà không có actions
        }
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          actions: actions.length > 0 ? actions : undefined
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Xử lý lỗi chi tiết hơn
      let errorContent = 'Xin lỗi, có lỗi xảy ra khi kết nối đến server.';
      
      if (error.response) {
        // Server trả về response nhưng có lỗi
        const status = error.response.status;
        if (status === 500) {
          errorContent = 'Xin lỗi, server đang gặp sự cố. Vui lòng thử lại sau.';
        } else if (status === 429) {
          errorContent = 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi một chút rồi thử lại.';
        } else if (status >= 400 && status < 500) {
          errorContent = error.response.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
        }
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        errorContent = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.';
      } else {
        // Lỗi khi setup request
        errorContent = 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.';
      }
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!sessionId || !isAuthenticated) return;
    
    try {
      await chatbotService.clearChatHistory(sessionId);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    // Focus vào input sau khi set
    setTimeout(() => {
      const textArea = document.querySelector('.chatbot-input-area textarea') as HTMLTextAreaElement;
      textArea?.focus();
    }, 0);
  };

  const suggestions = [
    'PPE là gì?',
    'Cách báo cáo sự cố?',
    'Các gói dịch vụ có giá bao nhiêu?',
    'Hướng dẫn sử dụng hệ thống',
    'Quy trình đăng ký tài khoản'
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="chatbot-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={false}
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        {isOpen ? <CloseOutlined /> : <MessageOutlined />}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-container"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="chatbot-card"
              title={
                <Space>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16
                  }}>
                    <RobotOutlined />
                  </div>
                  <div>
                    <Text strong style={{ color: 'white', fontSize: 14 }}>CHMS AI</Text>
                    <div style={{ fontSize: 10, opacity: 0.9, lineHeight: 1.2 }}>Trợ lý ảo thông minh</div>
                  </div>
                </Space>
              }
              extra={
                <Space>
                  {isAuthenticated && (
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={handleClearHistory}
                      size="small"
                      title="Xóa lịch sử"
                    />
                  )}
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => setIsOpen(false)}
                    size="small"
                  />
                </Space>
              }
              style={{ width: 340, height: 500 }}
              bodyStyle={{ 
                padding: 0, 
                display: 'flex', 
                flexDirection: 'column',
                height: 'calc(100% - 57px)'
              }}
            >
              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="chatbot-messages"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {messages.length === 0 ? (
                  <div className="chatbot-empty-state">
                    <div className="empty-icon">
                      <RobotOutlined />
                    </div>
                    <Text strong style={{ fontSize: 16, color: '#2d3748', display: 'block', marginBottom: 8 }}>
                      Xin chào! 👋
                    </Text>
                    <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24, lineHeight: 1.6 }}>
                      Tôi là trợ lý AI của hệ thống. Tôi có thể giúp bạn:
                    </Text>
                    <ul style={{ 
                      textAlign: 'left', 
                      margin: '0 auto 24px',
                      paddingLeft: '24px',
                      maxWidth: '300px',
                      color: '#4a5568',
                      lineHeight: 1.8
                    }}>
                      <li>Tìm hiểu về các tính năng của hệ thống</li>
                      <li>Tư vấn về an toàn lao động và PPE</li>
                      <li>Hướng dẫn sử dụng các chức năng</li>
                      <li>Tư vấn về gói dịch vụ và bảng giá</li>
                    </ul>
                    <div className="chatbot-suggestions">
                      <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                        <ThunderboltOutlined /> Câu hỏi đề xuất:
                      </Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="chatbot-suggestion-chip"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={index}
                      className={`chatbot-message ${message.role}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="chatbot-message-avatar">
                        {message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      </div>
                      <div className="chatbot-message-wrapper">
                        <div className="chatbot-message-content">
                          {message.content.split('\n').map((line, i) => {
                            // Simple markdown parsing for **bold**
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <React.Fragment key={i}>
                                {parts.map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                                  }
                                  return <span key={j}>{part}</span>;
                                })}
                                {i < message.content.split('\n').length - 1 && <br />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div className="chatbot-message-time">
                          {message.timestamp?.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {/* Navigation Actions */}
                        {message.role === 'assistant' && message.actions && Array.isArray(message.actions) && message.actions.length > 0 && (
                          <div className="chatbot-message-actions">
                            {message.actions.map((action, actionIndex) => {
                              if (!action || !action.path || !action.label) return null;
                              return (
                                <Button
                                  key={actionIndex}
                                  type="primary"
                                  size="small"
                                  icon={renderIcon(action.icon)}
                                  onClick={() => handleNavigationClick(action.path)}
                                >
                                  {action.label}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                {loading && (
                  <motion.div
                    className="chatbot-message assistant"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="chatbot-message-avatar">
                      <RobotOutlined />
                    </div>
                    <div className="chatbot-loading">
                      <div className="chatbot-loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>
                        Đang suy nghĩ...
                      </Text>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="chatbot-input-area">
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập câu hỏi của bạn..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={loading || !sessionId}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={loading}
                    disabled={!inputMessage.trim() || !sessionId}
                  >
                    Gửi
                  </Button>
                </Space.Compact>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;

