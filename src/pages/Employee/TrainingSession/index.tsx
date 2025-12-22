import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Progress,
  Space,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { api } from '../../../services/api';

const { Title, Text } = Typography;

interface Question {
  _id: string;
  content: string;
  question_type: string;
  options: string[];
  difficulty_level: string;
  points: number;
}

interface TrainingData {
  course: {
    _id: string;
    course_name: string;
    description: string;
    duration_hours: number;
  };
  enrollment: {
    _id: string;
    status: string;
    enrolled_at: string;
    started_at?: string;
  };
  questionBank: {
    _id: string;
    bank_name: string;
    total_questions: number;
  };
  questions: Question[];
}

const TrainingSession: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to clear invalid data and redirect
  const clearAndRedirect = (reason: string) => {
    console.log(`Clearing invalid data: ${reason}`);
    localStorage.removeItem('currentTrainingData');
    message.error(`Phiên học không hợp lệ: ${reason}. Vui lòng thử lại từ trang đào tạo.`);
    navigate('/training');
  };
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  
  // Debug: Track trainingData changes
  useEffect(() => {
    console.log('TrainingData changed:', trainingData);
    if (trainingData) {
      console.log('Course ID in trainingData:', trainingData.course?._id);
    }
  }, [trainingData]);
  
  // Use ref to store trainingData to prevent it from being reset
  const trainingDataRef = useRef<TrainingData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Clear old localStorage data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('currentTrainingData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Check if the course ID is the old invalid one (if needed)
        if (parsedData.course?._id === '68d405b3f69efa8873b5c836') {
          console.log('Found old invalid session data, clearing localStorage');
          localStorage.removeItem('currentTrainingData');
        }
      } catch (error) {
        console.log('Error parsing localStorage data, clearing it');
        localStorage.removeItem('currentTrainingData');
      }
    }
  }, []);

  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Location state changed, current trainingData:', trainingData);
    
    // Try to get training data from location state first
    let data = location.state?.trainingData;
    
    // If no data in state, try to get from localStorage (for page refresh)
    if (!data) {
      const savedData = localStorage.getItem('currentTrainingData');
      if (savedData) {
        try {
          data = JSON.parse(savedData);
          console.log('Training data loaded from localStorage:', data);
        } catch (error) {
          console.error('Error parsing saved training data:', error);
          localStorage.removeItem('currentTrainingData');
        }
      }
    } else {
      // Save to localStorage for page refresh
      localStorage.setItem('currentTrainingData', JSON.stringify(data));
    }
    
    // Accept course-based quiz payload (no session)
    if (data && data.course?._id) {
      console.log('Training data received:', data);
      console.log('Course ID from data:', data.course?._id);
      
      // Validate course data before using it
      if (!data.course || !data.course._id) {
        console.error('Invalid course data:', data);
        clearAndRedirect('Dữ liệu khóa học không hợp lệ');
        return;
      }
      
      // Only set trainingData if it's not already set or if it's different
      setTrainingData(prevData => {
        if (!prevData || prevData.course?._id !== data.course._id) {
          console.log('Setting new training data');
          return data;
        }
        console.log('Training data already set, keeping existing');
        return prevData;
      });
      
      // Also store in ref for reliable access
      trainingDataRef.current = data;
      setLoading(false);
      setIsInitialized(true);
      
      // Check if this is a retake
      if (location.state?.isRetake) {
        console.log('This is a retake session');
        // Show retake notification
        setTimeout(() => {
          message.info('Đây là lần làm lại bài. Kết quả trước đó đã được reset. Chúc bạn làm bài tốt!');
        }, 500);
      }
      
      // Calculate time left: use course duration_hours as seconds, fallback 2h
      const durationSeconds = data.course?.duration_hours
        ? Math.max(1, data.course.duration_hours) * 3600
        : 2 * 60 * 60;
      setTimeLeft(durationSeconds);
    } else {
      console.log('No valid training data found, redirecting to training page');
      clearAndRedirect('Không tìm thấy dữ liệu phiên học');
    }
  }, [location.state, navigate]);

  // Cleanup localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if training is completed or user navigates away
      if (isSubmitted) {
        localStorage.removeItem('currentTrainingData');
      }
    };
  }, [isSubmitted]);

  useEffect(() => {
    // Only start timer after component is initialized
    if (!isInitialized) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      // Only auto-submit if user has answered at least one question
      const answeredQuestions = Object.keys(answers).length;
      if (answeredQuestions > 0) {
        console.log('Time expired, auto-submitting with', answeredQuestions, 'answered questions');
        handleSubmit();
      } else {
        console.log('Time expired but no answers provided, not auto-submitting');
        message.warning('Thời gian đã hết và bạn chưa trả lời câu hỏi nào. Phiên học sẽ được đóng.');
        navigate('/training');
      }
    }
  }, [timeLeft, isSubmitted, answers, isInitialized]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (trainingData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    
    // Use ref as fallback if state is null
    const currentTrainingData = trainingData || trainingDataRef.current;
    
    // Debug: Check if trainingData and session._id exist
    // Submit debug completed
    console.log('TrainingData (state):', trainingData);
    console.log('TrainingData (ref):', trainingDataRef.current);
    console.log('Current TrainingData:', currentTrainingData);
    console.log('TrainingData type:', typeof currentTrainingData);
    console.log('TrainingData is null:', currentTrainingData === null);
    console.log('TrainingData is undefined:', currentTrainingData === undefined);
    console.log('Course ID:', currentTrainingData?.course?._id);
    console.log('Course:', currentTrainingData?.course);
    console.log('Answers:', answers);
    console.log('Number of answered questions:', Object.keys(answers).length);
    console.log('===================');
    
    if (!currentTrainingData?.course?._id) {
      message.error('Không tìm thấy thông tin khóa học. Vui lòng thử lại.');
      return;
    }

    // Check if user has answered at least one question
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions === 0) {
      message.warning('Bạn chưa trả lời câu hỏi nào. Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài.');
      return;
    }

    // Ask for confirmation before submitting
    const confirmSubmit = window.confirm(
      `Bạn đã trả lời ${answeredQuestions}/${currentTrainingData.questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài không?`
    );
    
    if (!confirmSubmit) {
      return;
    }
    
    setIsSubmitted(true);
    
    try {
      // Submit answers to backend - backend will automatically calculate score
      const courseId = currentTrainingData.course._id;
      const response = await api.post(`/training/courses/${courseId}/submit`, {
        answers: answers
      });

      if (response.data.success) {
        // Backend automatically calculates score and updates status
        const results = response.data.data.results;
        const passed = results.passed;
        
        if (passed) {
          message.success(
            `Chúc mừng! Bạn đã hoàn thành khóa học với điểm số ${results.percentage}% (${results.score}/${results.totalPossibleScore} điểm).`,
            5
          );
        } else {
          message.warning(
            `Bạn đã hoàn thành bài kiểm tra với điểm số ${results.percentage}% (${results.score}/${results.totalPossibleScore} điểm). Điểm đạt yêu cầu là ${results.passThreshold}%. Bạn có thể làm lại bài.`,
            5
          );
        }
        
        localStorage.removeItem('currentTrainingData');
        
        // Add a small delay to ensure the success message is shown
        setTimeout(() => {
          // Force page reload to refresh all data
          window.location.href = '/employee/training';
        }, 2000);
      } else {
        message.error(`Lỗi: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error('Error submitting training:', error);
      message.error('Có lỗi xảy ra khi nộp bài');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!trainingData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Card style={{ textAlign: 'center', maxWidth: '400px' }}>
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff6b6b', marginBottom: '16px' }} />
          <Title level={3}>Không tìm thấy dữ liệu khóa học</Title>
          <Button type="primary" onClick={() => navigate('/training')}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = trainingData.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (trainingData.questions?.length || 1)) * 100;

  // Show loading if currentQuestion is not available
  if (!currentQuestion) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Đang tải câu hỏi...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f4f8ff 0%, #eef6ff 100%)',
      padding: '28px 18px',
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
    }}>
      <style>{`
        :root {
          --brand-500: #0a66ff;
          --brand-700: #0b3d91;
          --muted-400: #6b7280;
        }
        .quiz-container { max-width: 1100px; margin: 0 auto; }
        .card-surface { border-radius: 12px; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06); background: #fff; overflow: hidden; }
        .option-card { cursor: pointer; transition: all 160ms ease; }
        .option-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(12, 32, 80, 0.06); }
      `}</style>

      <div className="quiz-container">
        <Row gutter={24}>
          <Col xs={24} lg={24}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
              <Card className="card-surface" style={{ marginBottom: 20, padding: '20px 24px' }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space align="center">
                      <Button type="text" onClick={() => navigate('/training')} icon={<ArrowLeftOutlined />} />
                      <div>
                        <Title level={2} style={{ margin: 0, color: 'var(--brand-700)' }}>{trainingData.course?.course_name}</Title>
                        <Text style={{ color: 'rgba(11,61,145,0.72)' }}>{trainingData.questionBank?.bank_name} • {trainingData.questions?.length} câu</Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Space size="large" align="center">
                      <div style={{ textAlign: 'right' }}>
                        <Text style={{ color: 'var(--brand-700)', display: 'block', fontWeight: 700 }}>Thời gian còn lại</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                          <Progress type="circle" percent={Math.round((timeLeft / (trainingData.course?.duration_hours ? trainingData.course.duration_hours * 3600 : 7200)) * 100)} width={64} strokeColor={timeLeft < 300 ? '#ff6b6b' : 'var(--brand-500)'} />
                          <div>
                            <Text style={{ color: 'var(--brand-700)', fontWeight: 700 }}>{formatTime(timeLeft)}</Text>
                            <div style={{ color: 'rgba(11,61,145,0.56)' }}>{trainingData.course?.duration_hours || 2} giờ</div>
                          </div>
                        </div>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay: 0.06 }}>
              <Card className="card-surface" style={{ marginBottom: 20, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <Text style={{ color: '#888', fontWeight: 600 }}>Câu hỏi</Text>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <Button shape="round" type="primary">Câu {currentQuestionIndex + 1}</Button>
                      <Button shape="round">{currentQuestion.points} điểm</Button>
                      <Button shape="round" style={{ background: currentQuestion.difficulty_level === 'EASY' ? '#52c41a' : currentQuestion.difficulty_level === 'MEDIUM' ? '#faad14' : '#ff4d4f', color: '#fff', border: 'none' }}>
                        {currentQuestion.difficulty_level === 'EASY' ? 'Dễ' : currentQuestion.difficulty_level === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                      </Button>
                    </div>
                  </div>
                  <div style={{ minWidth: 220 }}>
                    <Progress percent={progress} showInfo={false} strokeColor={{ '0%': '#6b7df2', '100%': '#8b5cf6' }} />
                    <Text style={{ display: 'block', color: '#666', marginTop: 6, textAlign: 'right' }}>Câu {currentQuestionIndex + 1} / {trainingData.questions?.length}</Text>
                  </div>
                </div>

                <Divider />

                <Title level={4} style={{ marginBottom: 18, color: 'var(--brand-700)' }}>{currentQuestion.content}</Title>

                <div>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentQuestion._id] === option;
                      return (
                        <motion.div key={index} className="option-card" whileHover={{ scale: 1.01 }} onClick={() => handleAnswerChange(currentQuestion._id, option)}>
                          <div style={{
                            display: 'flex',
                            gap: 14,
                            alignItems: 'center',
                            padding: '12px 14px',
                            borderRadius: 8,
                            background: isSelected ? '#f4f8ff' : '#fff',
                            border: isSelected ? '1px solid #dbe9ff' : '1px solid #f3f6f9',
                            cursor: 'pointer'
                          }}>
                            <div style={{
                              minWidth: 34,
                              height: 34,
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isSelected ? 'var(--brand-500)' : '#f5f7fb',
                              color: isSelected ? '#fff' : '#2b2f33',
                              fontWeight: 700
                            }}>{String.fromCharCode(65 + index)}</div>
                            <div style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, color: isSelected ? 'var(--brand-700)' : '#2b2f33' }}>{option}</Text>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </Space>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
              <Card className="card-surface" style={{ marginBottom: 20 }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} icon={<ArrowLeftOutlined />}>Câu trước</Button>
                  </Col>
                  <Col flex="auto" style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                      {trainingData.questions?.map((_, index) => {
                        const answered = !!answers[trainingData.questions?.[index]?._id];
                        const selected = index === currentQuestionIndex;
                        return (
                          <Button key={index} onClick={() => setCurrentQuestionIndex(index)} type={selected ? 'primary' : 'default'} style={{
                            width: 42,
                            height: 42,
                            borderRadius: 8,
                            background: answered && !selected ? '#f0fff4' : undefined,
                            borderColor: answered && !selected ? '#b7eb8f' : undefined
                          }}>{index + 1}</Button>
                        );
                      })}
                    </div>
                  </Col>
                  <Col>
                    <Button onClick={handleNext} disabled={currentQuestionIndex === (trainingData.questions?.length || 1) - 1}>Câu sau</Button>
                  </Col>
                </Row>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <div style={{ textAlign: 'center' }}>
                <Button type="primary" size="large" icon={<CheckOutlined />} onClick={handleSubmit} disabled={isSubmitted} style={{ borderRadius: 8, height: 48, padding: '0 36px', background: 'var(--brand-500)', borderColor: 'var(--brand-500)' }}>
                  Nộp bài
                </Button>
              </div>
            </motion.div>
          </Col>

          
        </Row>
      </div>
    </div>
  );
};

export default TrainingSession;
