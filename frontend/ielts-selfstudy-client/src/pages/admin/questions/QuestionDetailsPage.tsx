import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Loading, useToast } from '../../../components/ui';
import { QuestionFormModal } from './components/QuestionFormModal';
import { getQuestionById, updateQuestion } from '../../../api/questionsApi';
import type { QuestionDto, CreateQuestionRequest, UpdateQuestionRequest } from '../../../types/questions';
import { IconArrowLeft, IconEdit, IconCheckCircle, IconXCircle } from '../../../components/icons';
import { format } from 'date-fns';

// Simple markdown renderer (basic implementation)
const renderMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};

const QuestionDetailsPage = memo(function QuestionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const questionId = Number(id);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getQuestionById(questionId);
        setQuestion(data);
      } catch (err) {
        console.error('Failed to fetch question details:', err);
        showError('Lỗi', 'Không thể tải chi tiết câu hỏi. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [id, questionId, showError]);

  const handleUpdateQuestion = async (data: CreateQuestionRequest | UpdateQuestionRequest) => {
    if (!question) return;

    try {
      const updateData = data as UpdateQuestionRequest;
      const updatedQuestion = await updateQuestion(question.id, updateData);
      setQuestion(updatedQuestion);
      setShowEditModal(false);
      showSuccess('Thành công', 'Đã cập nhật câu hỏi!');
    } catch (err) {
      console.error('Failed to update question:', err);
      showError('Lỗi', 'Không thể cập nhật câu hỏi. Vui lòng thử lại.');
      throw err;
    }
  };

  const renderOptions = (optionsJson: string | null) => {
    if (!optionsJson) return null;

    try {
      const options = JSON.parse(optionsJson);
      return (
        <div className="space-y-2">
          {options.map((option: any, index: number) => (
            <div key={option.id || index} className="flex items-center space-x-2">
              <span className="font-medium text-gray-700 w-8">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-gray-900">{option.text}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <div className="text-red-600">Định dạng tùy chọn không hợp lệ</div>;
    }
  };

  const getQuestionTypeDisplay = (type: string) => {
    switch (type) {
      case 'MultipleChoice': return 'Trắc nghiệm';
      case 'FillBlank': return 'Điền vào chỗ trống';
      case 'Essay': return 'Tự luận';
      case 'TrueFalse': return 'Đúng/Sai';
      default: return type;
    }
  };

  if (isLoading) {
    return <Loading text="Đang tải chi tiết câu hỏi..." />;
  }

  if (!question) {
    return (
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <IconArrowLeft className="w-5 h-5" /> Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết câu hỏi</h1>
        </header>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Không tìm thấy câu hỏi</h2>
          <p className="text-gray-600 mb-6">Câu hỏi bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => navigate('/admin/questions')}>
            Quay lại danh sách câu hỏi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <IconArrowLeft className="w-5 h-5" /> Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Chi tiết câu hỏi #{question.questionNumber}</h1>
        <Button onClick={() => setShowEditModal(true)} className="flex items-center gap-2">
          <IconEdit className="w-5 h-5" /> Chỉnh sửa câu hỏi
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nội dung chi tiết</h2>

          {/* Question Text with Markdown Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Văn bản câu hỏi</h3>
            <div
              className="bg-gray-50 p-4 rounded-md border border-gray-200 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(question.questionText) }}
            />
          </div>

          {/* Options (for Multiple Choice) */}
          {question.questionType === 'MultipleChoice' && question.optionsJson && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Các lựa chọn</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                {renderOptions(question.optionsJson)}
              </div>
            </div>
          )}

          {/* Correct Answer */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Đáp án đúng</h3>
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="flex items-center">
                <IconCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">{question.correctAnswer}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-1 space-y-8">
          {/* Question Metadata */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin bổ sung</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Loại câu hỏi:</span>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${question.questionType === 'MultipleChoice' ? 'bg-blue-100 text-blue-800' :
                    question.questionType === 'FillBlank' ? 'bg-green-100 text-green-800' :
                      question.questionType === 'Essay' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                    }`}>
                    {getQuestionTypeDisplay(question.questionType)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Kỹ năng:</span>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${question.skill === 'Listening' ? 'bg-blue-100 text-blue-800' :
                    question.skill === 'Reading' ? 'bg-green-100 text-green-800' :
                      question.skill === 'Writing' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                    }`}>
                    {question.skill}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Điểm số:</span>
                <p className="mt-1 text-lg font-semibold text-gray-900">{question.points}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                <div className="mt-1 flex items-center">
                  {question.isActive ? (
                    <>
                      <IconCheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-green-800">Đang hoạt động</span>
                    </>
                  ) : (
                    <>
                      <IconXCircle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-red-800">Ngưng hoạt động</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Ngày tạo:</span>
                <p className="mt-1 text-sm text-gray-600">
                  {format(new Date(question.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Bài tập liên quan:</span>
                <div className="mt-1">
                  <button
                    onClick={() => navigate(`/admin/exercises/${question.exerciseId}`)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Bài tập #{question.exerciseId}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/admin/exercises/${question.exerciseId}`)}
              >
                Xem bài tập
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/admin/questions')}
              >
                Quay lại danh sách
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <QuestionFormModal
        isOpen={showEditModal}
        question={question}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateQuestion}
      />
    </div>
  );
});

QuestionDetailsPage.displayName = 'QuestionDetailsPage';

export default QuestionDetailsPage;
