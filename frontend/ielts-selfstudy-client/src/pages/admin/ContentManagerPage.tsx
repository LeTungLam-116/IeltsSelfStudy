import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseTable from '../../components/admin/CourseTable';
import CourseForm from '../../components/admin/CourseForm';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '../../services/courseService';
import type { Course, CourseFormData } from '../../types/course';

type TabType = 'courses' | 'exercises' | 'questions';

export default function ContentManagerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'courses' as TabType, label: 'Courses', count: courses.length },
    { id: 'exercises' as TabType, label: 'Exercises', count: 0 },
    { id: 'questions' as TabType, label: 'Questions', count: 0 },
  ];

  useEffect(() => {
    if (activeTab === 'courses') {
      loadCourses();
    }
  }, [activeTab]);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleViewCourse = (course: Course) => {
    navigate(`/admin/courses/${course.id}`);
  };

  const handleCourseSubmit = async (data: any) => {
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, data);
      } else {
        await createCourse(data);
      }
      setShowCourseForm(false);
      setEditingCourse(null);
      await loadCourses(); // Reload courses
    } catch (error) {
      console.error('Failed to save course:', error);
      throw error;
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await deleteCourse(courseId);
      await loadCourses(); // Reload courses
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw error;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Courses Management</h2>
                <p className="text-gray-600">Manage IELTS courses and their content</p>
              </div>
              <button
                onClick={handleCreateCourse}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>+</span>
                <span>Add Course</span>
              </button>
            </div>

            <CourseTable
              courses={courses}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              onView={handleViewCourse}
              loading={coursesLoading}
            />
          </div>
        );
      case 'exercises':
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">✏️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Exercises Management</h3>
            <p className="text-gray-500">Create and manage practice exercises</p>
          </div>
        );
      case 'questions':
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">❓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Questions Management</h3>
            <p className="text-gray-500">Organize questions for each exercise</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
            <p className="text-gray-600 mt-1">
              Manage courses, exercises, and questions for your IELTS platform
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search content..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Course Form Modal */}
      {showCourseForm && (
        <CourseForm
          course={editingCourse}
          onSubmit={handleCourseSubmit}
          onCancel={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
}
