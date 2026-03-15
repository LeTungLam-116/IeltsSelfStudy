import React, { useState, memo } from 'react';
import { IconCheck, IconX } from '../../../../components/icons';
import { Button, Modal, Input, useToast } from '../../../../components/ui';
import { Textarea } from '../../../../components/ui/Textarea';
import { gradeAttempt } from '../../../../api/attemptsApi';
import { getQuestionsByExercise } from '../../../../api/questionsApi';
import type { AttemptDto, GradeAttemptRequestDto } from '../../../../types/attempts';

export interface GradeModalProps {
  attempt: AttemptDto | null;
  isOpen: boolean;
  onClose: () => void;
  onGraded: (updatedAttempt: AttemptDto) => void;
}

const GradeModal = memo(function GradeModal({
  attempt,
  isOpen,
  onClose,
  onGraded
}: GradeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const [formData, setFormData] = useState<GradeAttemptRequestDto>({
    score: 0,
    maxScore: 9,
    feedback: '',
    isPassed: false,
    internalNotes: ''
  });

  const [questions, setQuestions] = useState<any[]>([]);

  // Reset form when modal opens with new attempt
  React.useEffect(() => {
    if (attempt && isOpen) {
      setFormData({
        score: attempt.score || 0,
        maxScore: attempt.maxScore || 9,
        feedback: attempt.aiFeedback || '',
        isPassed: attempt.score && attempt.maxScore ? (attempt.score / attempt.maxScore) >= 0.5 : false,
        internalNotes: attempt.gradingNotes || ''
      });

      // Load questions to decode multiple-choice option IDs
      getQuestionsByExercise(attempt.exerciseId)
        .then(setQuestions)
        .catch(err => console.error("Failed to load questions", err));
    }
  }, [attempt, isOpen]);

  const optionMap = React.useMemo(() => {
    const map = new Map<string, string>();
    questions.forEach(q => {
      try {
        if (q.optionsJson) {
          const opts = JSON.parse(q.optionsJson);
          if (Array.isArray(opts)) {
            opts.forEach(o => {
              if (o.id && o.text) {
                map.set(String(o.id), o.text);
              }
            });
          }
        }
      } catch (e) { }
    });
    return map;
  }, [questions]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!attempt) return;

    // Validate score — dùng Toast thay vì alert()
    if (formData.score < 0 || formData.score > formData.maxScore) {
      showError('Điểm không hợp lệ', `Điểm phải nằm trong khoảng 0 đến ${formData.maxScore}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedAttempt = await gradeAttempt(attempt.id, formData);
      showSuccess('Thành công', 'Đã lưu điểm số thành công!');
      onGraded(updatedAttempt);
      onClose();
    } catch (error) {
      console.error('Failed to grade attempt:', error);
      showError('Lỗi', 'Không thể lưu điểm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, feedback: e.target.value }));
  };

  const handleInternalNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, internalNotes: e.target.value }));
  };

  // Tính isPassed tự động khi điểm hoặc điểm tối đa thay đổi
  const handleScoreChange = (score: number) => {
    const isPassed = formData.maxScore > 0 && (score / formData.maxScore) >= 0.5;
    setFormData(prev => ({ ...prev, score, isPassed }));
  };

  const handleMaxScoreChange = (maxScore: number) => {
    const isPassed = maxScore > 0 && (formData.score / maxScore) >= 0.5;
    setFormData(prev => ({ ...prev, maxScore, isPassed }));
  };

  // Render câu trả lời an toàn — chuyển JSON Object thành danh sách hiển thị
  const renderUserAnswer = (answerJson?: string) => {
    if (!answerJson) return 'Không có câu trả lời';
    try {
      const parsed = JSON.parse(answerJson);
      if (typeof parsed === 'string') return parsed;

      // Nếu là Object (ví dụ: {"21": "option_...", "22": "..."}), chuyển thành list để dễ đọc
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return Object.entries(parsed)
          .map(([key, value]) => {
            const rawVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
            const decodedVal = optionMap.get(rawVal);
            const displayVal = decodedVal ? `${decodedVal}` : rawVal;
            return `Câu ${key}: ${displayVal}`;
          })
          .join('\n');
      }

      return JSON.stringify(parsed, null, 2);
    } catch {
      return answerJson;
    }
  };

  if (!attempt) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chấm điểm bài làm - ${attempt.userName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Attempt Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Tóm tắt bài làm</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Người làm:</strong> {attempt.userName} ({attempt.userEmail})</p>
            <p><strong>Bài tập:</strong> {attempt.exerciseTitle} ({attempt.skill})</p>
            <p><strong>Ngày nộp:</strong> {new Date(attempt.createdAt).toLocaleString('vi-VN')}</p>
          </div>
        </div>

        {/* User Answer Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Câu trả lời của người dùng
          </label>
          <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {renderUserAnswer(attempt.userAnswerJson)}
            </pre>
          </div>
        </div>

        {/* Grading Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
              Điểm đạt được
            </label>
            <Input
              id="score"
              type="number"
              min="0"
              max={formData.maxScore}
              step="0.5"
              value={formData.score}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-1">
              Điểm tối đa
            </label>
            <Input
              id="maxScore"
              type="number"
              min="1"
              value={formData.maxScore}
              onChange={(e: any) => handleMaxScoreChange(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Pass/Fail Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái kết quả
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="isPassed"
                checked={formData.isPassed}
                onChange={() => setFormData(prev => ({ ...prev, isPassed: true }))}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <IconCheck className="w-4 h-4 text-green-600 mr-1" />
                Đạt (Passed)
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="isPassed"
                checked={!formData.isPassed}
                onChange={() => setFormData(prev => ({ ...prev, isPassed: false }))}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <IconX className="w-4 h-4 text-red-600 mr-1" />
                Không đạt (Failed)
              </span>
            </label>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Phản hồi (Học viên có thể xem)
          </label>
          <Textarea
            id="feedback"
            value={formData.feedback}
            onChange={handleFeedbackChange}
            placeholder="Cung cấp các phản hồi mang tính xây dựng để giúp học sinh cải thiện..."
            rows={4}
          />
        </div>

        {/* Internal Notes */}
        <div>
          <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú nội bộ (Chỉ Admin xem)
          </label>
          <Textarea
            id="internalNotes"
            value={formData.internalNotes}
            onChange={handleInternalNotesChange}
            placeholder="Ghi chú nội bộ cho các quản trị viên khác..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu điểm số'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

GradeModal.displayName = 'GradeModal';

export default GradeModal;
