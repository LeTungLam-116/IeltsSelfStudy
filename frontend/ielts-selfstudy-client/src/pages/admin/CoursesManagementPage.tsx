import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type CourseDto,
  type CreateCourseRequest,
  type UpdateCourseRequest
} from '../../api/courseApi';
import CourseForm from '../../components/admin/CourseForm';

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEdit = (course: CourseDto) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = async (course: CourseDto) => {
    if (!confirm(`Are you sure you want to delete "${course.name}"?`)) {
      return;
    }

    try {
      await deleteCourse(course.id);
      await loadCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course');
    }
  };

  const handleFormSubmit = async (data: CreateCourseRequest | UpdateCourseRequest) => {
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, data as UpdateCourseRequest);
      } else {
        await createCourse(data as CreateCourseRequest);
      }

      setShowForm(false);
      setEditingCourse(null);
      await loadCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save course');
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'writing': return 'bg-blue-100 text-blue-800';
      case 'speaking': return 'bg-orange-100 text-orange-800';
      case 'listening': return 'bg-purple-100 text-purple-800';
      case 'reading': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Add Course
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.name}
                </h3>
                {course.shortDescription && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.shortDescription}
                  </p>
                )}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Skill:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillColor(course.skill)}`}>
                  {course.skill}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Level:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>
              {course.targetBand && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Target Band:</span>
                  <span className="text-sm font-medium text-gray-900">{course.targetBand}</span>
                </div>
              )}
              {course.price && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Price:</span>
                  <span className="text-sm font-medium text-gray-900">${course.price}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Link
                to={`/admin/courses/${course.id}`}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center transition-colors"
              >
                Manage
              </Link>
              <button
                onClick={() => handleEdit(course)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(course)}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first course to get started.
          </p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Create First Course
          </button>
        </div>
      )}

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          course={editingCourse}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
}
