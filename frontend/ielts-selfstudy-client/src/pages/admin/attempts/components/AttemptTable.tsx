import { memo } from 'react';
import { IconEye, IconEdit } from '../../../../components/icons';
import { TableWrapper } from '../../../../components/ui';
import type { AttemptDto } from '../../../../types/attempts';

export interface AttemptTableProps {
  attempts: AttemptDto[];
  onViewDetails: (attempt: AttemptDto) => void;
  onGrade: (attempt: AttemptDto) => void;
}

const AttemptTable = memo(function AttemptTable({
  attempts,
  onViewDetails,
  onGrade
}: AttemptTableProps) {
  const getStatusBadge = (attempt: AttemptDto) => {
    if (!attempt.isGraded) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
    return attempt.isPassed
      ? <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Passed</span>
      : <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Failed</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (attempts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No attempts found.</p>
      </div>
    );
  }

  return (
    <TableWrapper>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Exercise
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skill
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attempts.map((attempt) => (
            <tr key={attempt.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {attempt.userName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {attempt.userEmail}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 max-w-xs truncate" title={attempt.exerciseTitle}>
                  {attempt.exerciseTitle}
                </div>
                {attempt.courseTitle && (
                  <div className="text-sm text-gray-500">
                    {attempt.courseTitle}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {attempt.skill}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {attempt.score !== undefined && attempt.maxScore !== undefined
                  ? `${attempt.score}/${attempt.maxScore}`
                  : 'Not graded'
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(attempt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(attempt.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetails(attempt)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="View details"
                  >
                    <IconEye className="w-4 h-4" />
                  </button>
                  {!attempt.isGraded && (
                    <button
                      onClick={() => onGrade(attempt)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Grade attempt"
                    >
                      <IconEdit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
});

AttemptTable.displayName = 'AttemptTable';

export default AttemptTable;
