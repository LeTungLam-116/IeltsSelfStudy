// React import not required
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <div className="col-span-5">Course</div>
            <div className="col-span-2">Skill</div>
            <div className="col-span-2">Level</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-5 flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="ml-4">
                  <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1">
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

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl"><IconBook /></span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-600">
            There are no courses to display.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Select all courses"
            />
          </div>
          <div className="col-span-5">Course</div>
          <div className="hidden sm:block col-span-2">Skill</div>
          <div className="hidden md:block col-span-2">Level</div>
          <div className="hidden lg:block col-span-1">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {courses.map((course) => (
          <div key={course.id} className="px-4 sm:px-6 py-4 grid grid-cols-12 gap-2 sm:gap-4 items-center hover:bg-gray-50 border-b border-gray-200">
            {/* Checkbox */}
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(course.id)}
                onChange={() => handleRowSelect(course.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                aria-label={`Select course ${course.name}`}
              />
            </div>

            {/* Course Info */}
            <div className="col-span-7 sm:col-span-5 flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-lg">
                  {getSkillIcon(course.skill)}
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                  {course.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                  {course.shortDescription || 'No description'}
                </div>
                {/* Mobile-only info */}
                <div className="sm:hidden mt-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">{course.skill}</span>
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                    course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Skill - Hidden on mobile */}
            <div className="hidden sm:block col-span-2 text-sm text-gray-900">
              {course.skill}
            </div>

            {/* Level - Hidden on mobile/tablet */}
            <div className="hidden md:block col-span-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>

            {/* Status - Hidden on mobile/tablet */}
            <div className="hidden lg:block col-span-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                course.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-3 sm:col-span-1 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => onEditCourse(course)}
                className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm font-medium text-left sm:text-center"
                aria-label={`Edit course ${course.name}`}
              >
                Edit
              </button>
              {onEditExercises && (
                <button
                  onClick={() => onEditExercises(course)}
                  className="text-green-600 hover:text-green-900 text-xs sm:text-sm font-medium text-left sm:text-center"
                  aria-label={`Edit exercises for ${course.name}`}
                >
                  Exercises
                </button>
              )}
              <button
                onClick={() => onDeleteCourse(course.id)}
                className="text-red-600 hover:text-red-900 text-xs sm:text-sm font-medium text-left sm:text-center"
                aria-label={`Delete course ${course.name}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
