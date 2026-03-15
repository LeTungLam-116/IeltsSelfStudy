import { useState, useEffect } from 'react';
import { IconBook, IconDocument, IconEdit, IconPlus, IconChart, IconUsers, IconClock } from '../../components/icons';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in minutes
  enrolledStudents: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const coursesPerPage = 10;

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: 1,
        title: 'IELTS Writing Task 1: Academic',
        description: 'Master the art of describing graphs, charts, and processes in IELTS Writing Task 1.',
        category: 'Writing',
        difficulty: 'Intermediate',
        duration: 120,
        enrolledStudents: 245,
        isPublished: true,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
      },
      {
        id: 2,
        title: 'IELTS Speaking Part 1: Personal Topics',
        description: 'Practice common personal questions and improve your fluency in IELTS Speaking.',
        category: 'Speaking',
        difficulty: 'Beginner',
        duration: 90,
        enrolledStudents: 189,
        isPublished: true,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-15',
      },
      {
        id: 3,
        title: 'IELTS Listening: Section 3 & 4 Mastery',
        description: 'Advanced techniques for academic lectures and discussions.',
        category: 'Listening',
        difficulty: 'Advanced',
        duration: 150,
        enrolledStudents: 156,
        isPublished: true,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-12',
      },
      {
        id: 4,
        title: 'IELTS Reading: Time Management Strategies',
        description: 'Learn to manage your time effectively in IELTS Reading section.',
        category: 'Reading',
        difficulty: 'Intermediate',
        duration: 100,
        enrolledStudents: 98,
        isPublished: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
      },
    ];
    setCourses(mockCourses);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && course.isPublished) ||
      (statusFilter === 'draft' && !course.isPublished);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  const categories = ['Writing', 'Speaking', 'Listening', 'Reading'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleTogglePublish = (courseId: number) => {
    setCourses(courses.map(course =>
      course.id === courseId ? { ...course, isPublished: !course.isPublished } : course
    ));
  };

  const handleDeleteCourse = (courseId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này không?')) {
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Writing': return <IconEdit />;
      case 'Speaking': return <IconDocument />;
      case 'Listening': return <IconBook />;
      case 'Reading': return <IconBook />;
      default: return <IconBook />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý các khóa học IELTS</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {viewMode === 'table' ? <><IconBook className="mr-2" /> Dạng thẻ</> : <><IconChart className="mr-2" /> Dạng bảng</>}
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <IconPlus className="mr-2" />
            Thêm khóa học mới
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              placeholder="Tìm theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Kỹ năng
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả kỹ năng</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Độ khó
            </label>
            <select
              id="difficulty-filter"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trình độ</option>
              <option value="Beginner">Cơ bản (Beginner)</option>
              <option value="Intermediate">Trung cấp (Intermediate)</option>
              <option value="Advanced">Nâng cao (Advanced)</option>
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setDifficultyFilter('all');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      {/* Courses Display */}
      {viewMode === 'table' ? (
        // Table View
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khóa học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kỹ năng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Độ khó
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-lg">
                            {getCategoryIcon(course.category)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {course.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty === 'Beginner' ? 'Cơ bản' : course.difficulty === 'Intermediate' ? 'Trung cấp' : 'Nâng cao'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.enrolledStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleTogglePublish(course.id)}
                        className={`${course.isPublished ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                      >
                        {course.isPublished ? 'Gỡ bài' : 'Xuất bản'}
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Cards View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">{getCategoryIcon(course.category)}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty === 'Beginner' ? 'Cơ bản' : course.difficulty === 'Intermediate' ? 'Trung cấp' : 'Nâng cao'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="inline-flex items-center"><IconUsers className="mr-2" />{course.enrolledStudents} học viên</span>
                  <span className="inline-flex items-center"><IconClock className="mr-2" />{course.duration} phút</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleTogglePublish(course.id)}
                      className={`text-sm font-medium ${course.isPublished ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                        }`}
                    >
                      {course.isPublished ? 'Gỡ bài' : 'Xuất bản'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * coursesPerPage) + 1} đến {Math.min(currentPage * coursesPerPage, filteredCourses.length)} trong số {filteredCourses.length} khóa học
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded text-sm ${page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal - Placeholder */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa khóa học</h3>
              <p className="text-sm text-gray-600 mb-4">
                Chức năng chỉnh sửa cho "{selectedCourse.title}" sẽ được triển khai tại đây.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
