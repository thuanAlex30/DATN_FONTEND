import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Typography, Space } from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  CloseOutlined, 
  DeleteOutlined,
  RobotOutlined,
  UserOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import chatbotService, { type ChatMessage } from '../../services/chatbotService';
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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

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

  // Tạo session mới khi component mount
  useEffect(() => {
    const createSession = async () => {
      // Tạo sessionId ngay lập tức (local) để input có thể hoạt động
      const localSessionId = generateUUID();
      setSessionId(localSessionId);
      
      // Thử tạo session trên server (không bắt buộc)
      // Chatbot có thể hoạt động mà không cần đăng nhập
      try {
        const response = await chatbotService.createSession();
        if (response.data.success) {
          // Nếu server trả về sessionId, dùng sessionId từ server
          setSessionId(response.data.data.sessionId);
        }
      } catch (error: any) {
        // Lỗi không quan trọng, vẫn dùng localSessionId
        // Chatbot có thể hoạt động mà không cần server session
        console.log('Session creation on server failed (optional, chatbot still works):', error?.message || error);
      }
    };
    createSession();
  }, []);

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
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.data.response,
          timestamp: new Date()
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
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18
                  }}>
                    <RobotOutlined />
                  </div>
                  <div>
                    <Text strong style={{ color: 'white', fontSize: 15 }}>CHMS AI</Text>
                    <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.2 }}>Trợ lý ảo thông minh</div>
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
              style={{ width: 400, height: 600 }}
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

