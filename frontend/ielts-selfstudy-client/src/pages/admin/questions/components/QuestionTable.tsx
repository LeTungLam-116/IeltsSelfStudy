import { memo } from 'react';
import { Link } from 'react-router-dom';
import { TableWrapper, Badge } from '../../../../components/ui';
import { IconEye, IconEdit, IconTrash } from '../../../../components/icons';
import type { QuestionDto } from '../../../../types/questions';
import { format } from 'date-fns';

interface QuestionTableProps {
  questions: QuestionDto[];
  onEdit: (question: QuestionDto) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export const QuestionTable = memo(function QuestionTable({
  questions,
  onEdit,
  onDelete,
  isLoading
}: QuestionTableProps) {
  if (isLoading) {
    return (
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['#', 'Câu hỏi', 'Loại', 'Kỹ năng', 'Đáp án', 'Điểm', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48 mb-1" /><div className="h-3 bg-gray-100 rounded w-32" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-24" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24 mx-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-3">
        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-semibold text-gray-700">Không tìm thấy câu hỏi nào</p>
        <p className="text-sm text-gray-500">Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc.</p>
      </div>
    );
  }

  const getQuestionTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'MultipleChoice': return 'bg-blue-100 text-blue-800';
      case 'FillBlank': return 'bg-green-100 text-green-800';
      case 'Essay': return 'bg-purple-100 text-purple-800';
      case 'TrueFalse': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeDisplay = (type: string) => {
    switch (type) {
      case 'MultipleChoice': return 'Trắc nghiệm';
      case 'FillBlank': return 'Điền vào chỗ trống';
      case 'Essay': return 'Tự luận';
      case 'TrueFalse': return 'Đúng/Sai';
      default: return type.replace(/([A-Z])/g, ' $1').trim();
    }
  };

  const getSkillBadgeColor = (skill: string) => {
    switch (skill) {
      case 'Listening': return 'bg-blue-100 text-blue-800';
      case 'Reading': return 'bg-green-100 text-green-800';
      case 'Writing': return 'bg-purple-100 text-purple-800';
      case 'Speaking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <TableWrapper>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Câu hỏi
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kỹ năng
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Đáp án
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Điểm
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '15%', minWidth: '140px' }}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {questions.map((question) => (
            <tr key={question.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {question.questionNumber}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="max-w-xs">
                  <div className="truncate font-medium">
                    {truncateText(question.questionText.replace(/[*_`]/g, '').replace(/\n/g, ' '), 60)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {question.exerciseTitle ? (
                      <Link
                        to={`/admin/exercises/${question.exerciseId}`}
                        className="text-blue-600 hover:underline font-medium"
                        title="Xem chi tiết bài tập"
                      >
                        📖 {question.exerciseTitle}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Bài tập #{question.exerciseId}</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Badge variant="secondary" className={getQuestionTypeBadgeColor(question.questionType)}>
                  {getQuestionTypeDisplay(question.questionType)}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Badge variant="secondary" className={getSkillBadgeColor(question.skill)}>
                  {question.skill}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="max-w-xs truncate">
                  {question.correctAnswer}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {question.points}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={question.isActive ? 'success' : 'danger'}>
                  {question.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(question.createdAt), 'dd/MM/yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex items-center justify-center space-x-2">
                  <Link
                    to={`/admin/questions/${question.id}`}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
                    aria-label={`Xem chi tiết câu hỏi ${question.id}`}
                    title="Xem chi tiết"
                  >
                    <IconEye className="w-6 h-6 flex-shrink-0" width={24} height={24} />
                  </Link>
                  <button
                    onClick={() => onEdit(question)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
                    aria-label={`Sửa câu hỏi ${question.id}`}
                    title="Sửa"
                  >
                    <IconEdit className="w-6 h-6 flex-shrink-0" width={24} height={24} />
                  </button>
                  <button
                    onClick={() => onDelete(question.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-all flex-shrink-0"
                    aria-label={`Xóa câu hỏi ${question.id}`}
                    title="Xóa"
                  >
                    <IconTrash className="w-6 h-6 flex-shrink-0" width={24} height={24} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
});

