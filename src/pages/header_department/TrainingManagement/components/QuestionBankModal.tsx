import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';

interface Course {
  _id: string;
  course_name: string;
  description: string;
  duration_hours: number;
  course_set_id: {
    _id: string;
    course_set_name: string;
  };
}

interface QuestionBank {
  _id: string;
  name: string;
  description: string;
  course_id: string;
  questions: any[];
  created_at: string;
}

interface QuestionBankModalProps {
  course: Course | null;
  onClose: () => void;
}

const QuestionBankModal: React.FC<QuestionBankModalProps> = ({ course, onClose }) => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankDescription, setNewBankDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (course) {
      fetchQuestionBanks();
    }
  }, [course]);

  const fetchQuestionBanks = async () => {
    if (!course) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/training/question-banks/course/${course._id}`);
      // Ensure we always have an array
      const data = response.data?.data || response.data || [];
      setQuestionBanks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching question banks:', error);
      setQuestionBanks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !newBankName.trim()) return;

    try {
      await api.post('/training/question-banks', {
        name: newBankName,
        description: newBankDescription,
        course_id: course._id,
      });

      setNewBankName('');
      setNewBankDescription('');
      setShowCreateForm(false);
      fetchQuestionBanks();
    } catch (error) {
      console.error('Error creating question bank:', error);
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ngân hàng câu hỏi này?')) return;

    try {
      await api.delete(`/training/question-banks/${bankId}`);
      fetchQuestionBanks();
    } catch (error) {
      console.error('Error deleting question bank:', error);
    }
  };

  if (!course) {
    return null;
  }

  return (
    <div className="modal active">
      <div className="modal-content large">
        <div className="modal-header">
          <h2 className="modal-title">Ngân hàng câu hỏi - {course.course_name}</h2>
          <span className="close-modal" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          <div className="question-bank-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <i className="fas fa-plus"></i> Tạo ngân hàng câu hỏi mới
            </button>
          </div>

          {showCreateForm && (
            <div className="create-bank-form">
              <h3>Tạo ngân hàng câu hỏi mới</h3>
              <form onSubmit={handleCreateBank}>
                <div className="form-group">
                  <label>Tên ngân hàng câu hỏi:</label>
                  <input
                    type="text"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả:</label>
                  <textarea
                    value={newBankDescription}
                    onChange={(e) => setNewBankDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Tạo
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="question-banks-list">
            <h3>Danh sách ngân hàng câu hỏi</h3>
            {loading ? (
              <p>Đang tải...</p>
            ) : !Array.isArray(questionBanks) || questionBanks.length === 0 ? (
              <p>Chưa có ngân hàng câu hỏi nào.</p>
            ) : (
              <div className="banks-grid">
                {questionBanks.map((bank) => (
                  <div key={bank._id} className="bank-card">
                    <div className="bank-header">
                      <h4>{bank.name}</h4>
                      <div className="bank-actions">
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => {
                            // Preview bank functionality - show questions in modal
                            console.log('Preview bank:', bank);
                            alert(`Xem trước ngân hàng câu hỏi: ${bank.name}\nSố câu hỏi: ${bank.questions?.length || 0}`);
                          }}
                        >
                          <i className="fas fa-eye"></i> Xem trước
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteBank(bank._id)}
                        >
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </div>
                    </div>
                    <div className="bank-content">
                      <p>{bank.description}</p>
                      <div className="bank-stats">
                        <span>Số câu hỏi: {bank.questions?.length || 0}</span>
                        <span>Tạo ngày: {new Date(bank.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionBankModal;
