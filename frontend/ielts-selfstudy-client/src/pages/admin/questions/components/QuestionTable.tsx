import { memo } from 'react';
import { Link } from 'react-router-dom';
import { TableWrapper, Button, Badge } from '../../../../components/ui';
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
    return <div className="text-center py-8">Loading questions...</div>;
  }

  if (!questions || questions.length === 0) {
    return <div className="text-center py-8 text-gray-500">No questions found.</div>;
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
              Question
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skill
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Answer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Points
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
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
                    {(question as any).exerciseTitle ? (
                      <a
                        href={`/admin/exercises/${question.exerciseId}/edit`}
                        className="text-blue-600 hover:underline"
                        onClick={(ev) => { ev.preventDefault(); window.location.href = `/admin/exercises/${question.exerciseId}/edit`; }}
                      >
                        {(question as any).exerciseTitle} ({question.skill})
                      </a>
                    ) : (
                      `Exercise #${question.exerciseId}`
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Badge variant="secondary" className={getQuestionTypeBadgeColor(question.questionType)}>
                  {question.questionType.replace(/([A-Z])/g, ' $1').trim()}
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
                  {question.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(question.createdAt), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Link
                    to={`/admin/questions/${question.id}`}
                    className="text-blue-600 hover:text-blue-900"
                    aria-label={`View question ${question.id}`}
                  >
                    <IconEye className="w-5 h-5" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(question)}
                    aria-label={`Edit question ${question.id}`}
                  >
                    <IconEdit className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(question.id)}
                    aria-label={`Delete question ${question.id}`}
                  >
                    <IconTrash className="w-5 h-5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
});
