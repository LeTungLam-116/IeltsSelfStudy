import type { AdminExerciseDto } from '../../../../types/exercise';
import { TableWrapper } from '../../../../components/ui';
import { IconNote, IconEye, IconEdit, IconTrash } from '../../../../components/icons';

interface ExerciseTableProps {
  exercises: AdminExerciseDto[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (selectAll: boolean) => void;
  onEditExercise: (exercise: AdminExerciseDto) => void;
  onDeleteExercise: (id: number) => void;
  onViewDetails: (exercise: AdminExerciseDto) => void;
  isLoading?: boolean;
}

export function ExerciseTable({
  exercises,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEditExercise,
  onDeleteExercise,
  onViewDetails,
  isLoading = false
}: ExerciseTableProps) {
  const allSelected = exercises.length > 0 && selectedIds.length === exercises.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < exercises.length;

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  const handleRowSelect = (id: number) => {
    onToggleSelect(id);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Listening': return 'bg-blue-100 text-blue-800';
      case 'Reading': return 'bg-green-100 text-green-800';
      case 'Writing': return 'bg-purple-100 text-purple-800';
      case 'Speaking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return level || 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-span-4">Bài tập</div>
            <div className="col-span-2">Kỹ năng</div>
            <div className="col-span-1">Độ khó</div>
            <div className="col-span-1">Câu hỏi</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-1">Hành động</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-4 flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="ml-4">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1">
                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1 flex space-x-2">
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl"><IconNote /></span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài tập nào</h3>
          <p className="text-gray-600">
            Hiện không có bài tập nào để hiển thị.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TableWrapper className="bg-white rounded-lg shadow overflow-hidden" >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                aria-label="Chọn tất cả bài tập"
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bài tập
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kỹ năng
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Độ khó
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Câu hỏi
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '15%', minWidth: '140px' }}>
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {exercises.map((exercise) => (
            <tr key={exercise.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(exercise.id)}
                  onChange={() => handleRowSelect(exercise.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  aria-label={`Chọn bài tập ${exercise.title || 'Không có tiêu đề'}`}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      {exercise.type.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={exercise.title || ''}>
                      {exercise.title || 'Bài tập chưa có tiêu đề'}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs" title={exercise.description || ''}>
                      {exercise.description || 'Không có mô tả'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(exercise.type)}`}>
                  {exercise.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(exercise.level || '')}`}>
                  {getLevelLabel(exercise.level || '')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {exercise.type === 'Writing' && (exercise.taskType || 'Task')}
                {exercise.type === 'Speaking' && (exercise.part || 'Part')}
                {(exercise.type === 'Listening' || exercise.type === 'Reading') &&
                  (exercise.questionCount || 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${exercise.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {exercise.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onViewDetails(exercise)}
                    className="text-blue-600 hover:text-blue-800 duration-200 p-2 rounded-lg hover:bg-blue-50 flex-shrink-0"
                    aria-label={`Xem chi tiết bài tập ${exercise.title || 'Không có tiêu đề'}`}
                    title="Xem chi tiết"
                  >
                    <IconEye className="w-6 h-6 flex-shrink-0" width={24} height={24} />
                  </button>
                  <button
                    onClick={() => onEditExercise(exercise)}
                    className="text-blue-600 hover:text-blue-800 duration-200 p-2 rounded-lg hover:bg-blue-50 flex-shrink-0"
                    aria-label={`Sửa bài tập ${exercise.title || 'Không có tiêu đề'}`}
                    title="Sửa"
                  >
                    <IconEdit className="w-6 h-6 flex-shrink-0" width={24} height={24} />
                  </button>
                  <button
                    onClick={() => onDeleteExercise(exercise.id)}
                    className="text-rose-600 hover:text-rose-800 duration-200 p-2 rounded-lg hover:bg-rose-50 flex-shrink-0"
                    aria-label={`Xóa bài tập ${exercise.title || 'Không có tiêu đề'}`}
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
}