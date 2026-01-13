import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCourseById,
  getCourseExercises,
  type CourseDto,
  type CourseExerciseDto
} from '../../api/courseApi';
import CourseExerciseManager from '../../components/admin/CourseExerciseManager';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [exercises, setExercises] = useState<CourseExerciseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCourse();
      loadExercises();
    }
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;

    try {
      const courseData = await getCourseById(Number(id));
      setCourse(courseData);
    } catch (error) {
      console.error('Failed to load course:', error);
    }
  };

  const loadExercises = async () => {
    if (!id) return;

    try {
      const exercisesData = await getCourseExercises(Number(id));
      setExercises(exercisesData);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExercisesUpdated = () => {
    loadExercises();
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

  if (loading || !course) {
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
        <button
          onClick={() => navigate('/admin/courses')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Courses
        </button>
      </div>

      {/* Course Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h1>
            {course.shortDescription && (
              <p className="text-gray-600 mb-4">{course.shortDescription}</p>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {course.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Skill:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillColor(course.skill)}`}>
              {course.skill}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Level:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
              {course.level}
            </span>
          </div>
          {course.targetBand && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Target Band:</span>
              <span className="text-sm font-medium text-gray-900">{course.targetBand}</span>
            </div>
          )}
          {course.price && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Price:</span>
              <span className="text-sm font-medium text-gray-900">${course.price}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Created: {new Date(course.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Exercises Management */}
      <CourseExerciseManager
        courseId={course.id}
        exercises={exercises}
        onExercisesUpdated={handleExercisesUpdated}
      />
    </div>
  );
}
