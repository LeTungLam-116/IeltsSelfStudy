import { memo } from 'react';
import { IconEye, IconEdit, IconClock, IconUser, IconBook } from '../../../../components/icons';
import { TableWrapper, Badge } from '../../../../components/ui';
import type { AttemptDto } from '../../../../types/attempts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface AttemptTableProps {
  attempts: AttemptDto[];
  onViewDetails: (attempt: AttemptDto) => void;
  onGrade: (attempt: AttemptDto) => void;
}

const AttemptTable = ({
  attempts,
  onViewDetails,
  onGrade
}: AttemptTableProps) => {
  const getStatusBadge = (attempt: AttemptDto) => {
    if (attempt.isGraded) {
      return attempt.isPassed
        ? <Badge variant="success" className="font-bold">Đã chốt (Đạt)</Badge>
        : <Badge variant="danger" className="font-bold">Đã chốt (Không đạt)</Badge>;
    }

    if (attempt.score !== undefined && attempt.score !== null) {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-bold animate-pulse">
          Đã chấm (Sơ bộ)
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 font-bold">
        Chờ chấm điểm
      </Badge>
    );
  };

  const getSkillBadgeColor = (skill: string) => {
    switch (skill) {
      case 'Listening': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Reading': return 'bg-green-100 text-green-700 border-green-200';
      case 'Writing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Speaking': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (attempts.length === 0) {
    return (
      <div className="text-center py-20 bg-white">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconClock className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">Không tìm thấy lượt làm bài nào.</p>
      </div>
    );
  }

  return (
    <TableWrapper>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Người làm bài
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Bài tập / Khóa học
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Kỹ năng
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Điểm số
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Trạng thái
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Ngày làm
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attempts.map((attempt) => (
            <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <IconUser className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-none mb-1">
                      {attempt.userName}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {attempt.userEmail}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold text-slate-800 max-w-xs truncate flex items-center gap-1.5" title={attempt.exerciseTitle}>
                    <IconBook className="w-3.5 h-3.5 text-slate-400" />
                    {attempt.exerciseTitle}
                  </div>
                  {attempt.courseTitle && (
                    <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block self-start">
                      {attempt.courseTitle}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <Badge variant="secondary" className={`${getSkillBadgeColor(attempt.skill)} font-bold`}>
                  {attempt.skill === 'Listening' ? 'Nghe' : attempt.skill === 'Reading' ? 'Đọc' : attempt.skill === 'Writing' ? 'Viết' : 'Nói'}
                </Badge>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                {attempt.score !== undefined && attempt.maxScore !== undefined && attempt.maxScore > 0 ? (
                  <div className="flex flex-col">
                    <span className={`text-sm font-black ${attempt.isGraded
                        ? attempt.isPassed ? 'text-green-700' : 'text-red-700'
                        : 'text-slate-900'
                      }`}>
                      {attempt.score}/{attempt.maxScore}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${attempt.isGraded
                            ? attempt.isPassed ? 'bg-green-500' : 'bg-red-400'
                            : 'bg-blue-400'  /* Xanh dương = đã chấm sơ bộ nhưng chưa chốt */
                          }`}
                        style={{ width: `${Math.min((attempt.score / attempt.maxScore) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 italic">Chưa chấm</span>
                )}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm">
                {getStatusBadge(attempt)}
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-2 text-slate-500">
                  <IconClock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium">
                    {format(new Date(attempt.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onViewDetails(attempt)}
                    className="h-9 w-9 p-0 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors"
                    title="Xem chi tiết"
                  >
                    <IconEye className="w-6 h-6" width={24} height={24} />
                  </button>
                  {!attempt.isGraded && (
                    <button
                      onClick={() => onGrade(attempt)}
                      className="h-9 w-9 p-0 rounded-lg text-green-600 hover:bg-green-50 animate-pulse flex items-center justify-center transition-colors"
                      title="Chấm điểm"
                    >
                      <IconEdit className="w-6 h-6" width={24} height={24} />
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
};

export default memo(AttemptTable);
