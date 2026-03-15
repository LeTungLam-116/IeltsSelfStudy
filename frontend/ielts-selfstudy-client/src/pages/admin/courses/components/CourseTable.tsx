import type { Course } from '../../../../types';
import { IconEdit, IconBook, IconDocument, IconUsers } from '../../../../components/icons';

export const getSkillIcon = (skill: string) => {
  switch (skill) {
    case 'Writing': return <IconEdit />;
    case 'Speaking': return <IconUsers />;
    case 'Listening': return <IconDocument />;
    case 'Reading': return <IconBook />;
    case 'All': return <IconBook />;
    default: return <IconBook />;
  }
};

interface CourseTableProps {
  courses: Course[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (selectAll: boolean) => void;
  onEditCourse: (course: Course) => void;
  onEditExercises?: (course: Course) => void;
  onDeleteCourse: (id: number) => void;
  isLoading?: boolean;
}

export function CourseTable({
  courses,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEditCourse,
  onEditExercises,
  onDeleteCourse,
  isLoading = false
}: CourseTableProps) {
  const allSelected = courses.length > 0 && selectedIds.length === courses.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < courses.length;

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  const handleRowSelect = (id: number) => {
    onToggleSelect(id);
  };

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Intermediate': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Advanced': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-slate-50 border-b border-slate-200" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 border-b border-slate-100 flex items-center px-6 space-x-4">
              <div className="w-4 h-4 bg-slate-200 rounded" />
              <div className="w-12 h-12 bg-slate-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
          <IconBook />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Chưa có khóa học nào</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Danh sách khóa học của bạn đang trống. Hãy bắt đầu bằng cách tạo khóa học mới.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4" style={{ width: '60px' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider" style={{ width: '40%' }}>Khóa học</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Kỹ năng</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Cấp độ</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center" style={{ width: '160px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(course.id)}
                    onChange={() => handleRowSelect(course.id)}
                    className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center" style={{ overflow: 'hidden' }}>
                    <div
                      className="flex-shrink-0 rounded-lg bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center"
                      style={{ width: '48px', height: '48px', minWidth: '48px' }}
                    >
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="text-blue-500 text-xl">{getSkillIcon(course.skill)}</div>
                      )}
                    </div>
                    <div className="ml-4" style={{ minWidth: 0, flex: 1 }}>
                      <div className="text-sm font-bold text-slate-900 line-clamp-1" title={course.name}>{course.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{course.shortDescription || 'Không có mô tả'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center text-sm text-slate-600">
                    <span className="mr-2 opacity-60 text-base">{getSkillIcon(course.skill)}</span>
                    {course.skill}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${getLevelStyles(course.level)}`}>
                    {course.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${course.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${course.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {course.isActive ? 'Đang bật' : 'Đang tắt'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => onEditCourse(course)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                      title="Sửa thông tin"
                    >
                      <IconEdit className="w-6 h-6" width={24} height={24} />
                    </button>
                    {onEditExercises && (
                      <button
                        onClick={() => onEditExercises(course)}
                        className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Quản lý bài tập"
                      >
                        <IconDocument className="w-6 h-6" width={24} height={24} />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-all"
                      title="Xóa khóa học"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
