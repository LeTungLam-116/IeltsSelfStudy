// React import not required
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../../../stores';
import { Button } from '../../../components/ui';
import { getSkillIcon } from './components/CourseTable';
import { IconEdit, IconBook, IconUsers, IconChart } from '../../../components/icons';

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseStore = useCourseStore();

  const [course, setCourse] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCourse(Number(id));
    }
  }, [id]);

  const loadCourse = async (courseId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const courseData = await courseStore.fetchCourseById(courseId);
      setCourse(courseData);

      // Load exercises for this course
      const courseExercises = await courseStore.fetchCourseExercises(courseId);
      setExercises(courseExercises);
    } catch (err) {
      console.error('Failed to load course:', err);
      setError('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = () => {
    navigate(`/admin/courses/${id}/edit`);
  };

  const handleEditExercises = () => {
    navigate(`/admin/courses/${id}/exercises`);
  };

  const handleBackToList = () => {
    navigate('/admin/courses');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested course could not be found.'}</p>
          <Button onClick={handleBackToList}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const sortedExercises = exercises.sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBackToList}>
              ← Back to Courses
            </Button>
            <div className="h-8 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleEditExercises}>
              Edit Exercises
            </Button>
            <Button onClick={handleEditCourse}>
              Edit Course
            </Button>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">{getSkillIcon(course.skill)}</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.skill}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {course.level}
                  </span>
                  {course.targetBand && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Target: {course.targetBand}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {course.shortDescription && (
                  <p className="text-gray-600">{course.shortDescription}</p>
                )}
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{sortedExercises.length}</div>
                <div className="text-sm text-gray-600">Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {course.price ? `$${course.price}` : 'Free'}
                </div>
                <div className="text-sm text-gray-600">Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Date(course.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {/* TODO: Add enrolled students count */}
                  0
                </div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleEditCourse}>
              <span className="mr-2" aria-hidden="true"><IconEdit /></span>
              Edit Course Details
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleEditExercises}>
              <span className="mr-2" aria-hidden="true"><IconBook /></span>
              Manage Exercises
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <span className="mr-2" aria-hidden="true"><IconUsers /></span>
              View Enrolled Students
              <span className="ml-auto text-xs text-gray-400">(Coming Soon)</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <span className="mr-2" aria-hidden="true"><IconChart /></span>
              View Analytics
              <span className="ml-auto text-xs text-gray-400">(Coming Soon)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Course Exercises ({sortedExercises.length})
            </h3>
            <Button onClick={handleEditExercises}>
              Manage Exercises
            </Button>
          </div>
        </div>

        {sortedExercises.length === 0 ? (
          <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-4">
              <span className="text-4xl"><IconBook /></span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Exercises Added</h4>
            <p className="text-gray-600 mb-6">
              This course doesn't have any exercises yet. Add exercises to help students learn.
            </p>
            <Button onClick={handleEditExercises}>Add Exercises</Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedExercises.map((exercise) => (
              <div key={exercise.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-800">
                        {exercise.order}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getSkillIcon(exercise.skill)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {exercise.exercise?.title || `Exercise ${exercise.exerciseId}`}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Type: {exercise.exercise?.type || 'Unknown'}</span>
                        <span>Level: {exercise.exercise?.level || 'Unknown'}</span>
                        {exercise.exercise?.type === 'Writing' && (
                          <span>Task: {exercise.exercise?.taskType || 'Writing'}</span>
                        )}
                        {exercise.exercise?.type === 'Speaking' && (
                          <span>Part: {exercise.exercise?.part || 'Speaking'}</span>
                        )}
                        {(exercise.exercise?.type === 'Listening' || exercise.exercise?.type === 'Reading') && (
                          <span>Questions: {exercise.exercise?.questionCount || 0}</span>
                        )}
                        {exercise.lessonNumber && (
                          <span>Lesson {exercise.lessonNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {exercise.skill}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
