import { useState, useEffect } from 'react';
import {
  addExerciseToCourse,
  removeExerciseFromCourse,
  updateExerciseOrder,
  type CourseExerciseDto,
  type AddExerciseToCourseRequest
} from '../../api/courseApi';
import { getWritingExercises, type WritingExerciseDto } from '../../api/writingExerciseApi';
import { getSpeakingExercises, type SpeakingExerciseDto } from '../../api/speakingExerciseApi';
import { getListeningExercises, type ListeningExerciseDto } from '../../api/listeningExerciseApi';
import { getReadingExercises, type ReadingExerciseDto } from '../../api/readingExerciseApi';

interface CourseExerciseManagerProps {
  courseId: number;
  exercises: CourseExerciseDto[];
  onExercisesUpdated: () => void;
}

type ExerciseType = 'writing' | 'speaking' | 'listening' | 'reading';
type ExerciseDto = WritingExerciseDto | SpeakingExerciseDto | ListeningExerciseDto | ReadingExerciseDto;

export default function CourseExerciseManager({
  courseId,
  exercises,
  onExercisesUpdated
}: CourseExerciseManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<ExerciseDto[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<ExerciseType>('writing');
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const skillOptions = [
    { value: 'writing' as ExerciseType, label: 'Writing' },
    { value: 'speaking' as ExerciseType, label: 'Speaking' },
    { value: 'listening' as ExerciseType, label: 'Listening' },
    { value: 'reading' as ExerciseType, label: 'Reading' },
  ];

  useEffect(() => {
    if (showAddModal) {
      loadExercises();
    }
  }, [showAddModal, selectedSkill]);

  const loadExercises = async () => {
    setLoadingExercises(true);
    try {
      let data: ExerciseDto[] = [];
      switch (selectedSkill) {
        case 'writing':
          data = await getWritingExercises();
          break;
        case 'speaking':
          data = await getSpeakingExercises();
          break;
        case 'listening':
          data = await getListeningExercises();
          break;
        case 'reading':
          data = await getReadingExercises();
          break;
      }

      // Filter out exercises already in the course
      const existingExerciseIds = new Set(exercises.map(e => e.exerciseId));
      const filtered = data.filter(ex => !existingExerciseIds.has(ex.id));

      setAvailableExercises(filtered);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleAddExercise = async () => {
    if (!selectedExerciseId) return;

    setAdding(true);
    try {
      const nextOrder = exercises.length > 0 ? Math.max(...exercises.map(e => e.order)) + 1 : 1;

      const request: AddExerciseToCourseRequest = {
        skill: selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1),
        exerciseId: selectedExerciseId,
        order: nextOrder,
        lessonNumber: nextOrder,
      };

      await addExerciseToCourse(courseId, request);

      setShowAddModal(false);
      setSelectedExerciseId(null);
      onExercisesUpdated();
    } catch (error) {
      console.error('Failed to add exercise:', error);
      alert('Failed to add exercise to course');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveExercise = async (courseExerciseId: number) => {
    if (!confirm('Are you sure you want to remove this exercise from the course?')) {
      return;
    }

    try {
      await removeExerciseFromCourse(courseId, courseExerciseId);
      onExercisesUpdated();
    } catch (error) {
      console.error('Failed to remove exercise:', error);
      alert('Failed to remove exercise from course');
    }
  };

  const handleMoveUp = async (courseExercise: CourseExerciseDto) => {
    if (courseExercise.order === 1) return;

    try {
      await updateExerciseOrder(courseId, courseExercise.id, courseExercise.order - 1);
      onExercisesUpdated();
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update exercise order');
    }
  };

  const handleMoveDown = async (courseExercise: CourseExerciseDto) => {
    const maxOrder = Math.max(...exercises.map(e => e.order));
    if (courseExercise.order === maxOrder) return;

    try {
      await updateExerciseOrder(courseId, courseExercise.id, courseExercise.order + 1);
      onExercisesUpdated();
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update exercise order');
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Course Exercises ({exercises.length})
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Exercise
          </button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="p-6">
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises in this course</h3>
            <p className="text-gray-600 mb-4">
              Add exercises to build your course content.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Add First Exercise
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises
              .sort((a, b) => a.order - b.order)
              .map((courseExercise) => (
                <div
                  key={courseExercise.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => handleMoveUp(courseExercise)}
                        disabled={courseExercise.order === 1}
                        className="text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveDown(courseExercise)}
                        disabled={courseExercise.order === Math.max(...exercises.map(e => e.order))}
                        className="text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          Exercise #{courseExercise.order}
                        </span>
                        {courseExercise.lessonNumber && (
                          <span className="text-xs text-gray-500">
                            Lesson #{courseExercise.lessonNumber}
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillColor(courseExercise.skill)}`}>
                        {courseExercise.skill}
                      </span>

                      <span className="text-sm text-gray-600">
                        Exercise ID: {courseExercise.exerciseId}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveExercise(courseExercise.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Exercise to Course</h3>

              <div className="space-y-4">
                {/* Skill Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Skill
                  </label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => {
                      setSelectedSkill(e.target.value as ExerciseType);
                      setSelectedExerciseId(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {skillOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exercise Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Exercise
                  </label>
                  {loadingExercises ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <select
                      value={selectedExerciseId || ''}
                      onChange={(e) => setSelectedExerciseId(Number(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose an exercise...</option>
                      {availableExercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.title} (ID: {exercise.id})
                        </option>
                      ))}
                    </select>
                  )}
                  {availableExercises.length === 0 && !loadingExercises && (
                    <p className="text-sm text-gray-500 mt-1">
                      No available exercises of this skill type.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedExerciseId(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExercise}
                    disabled={!selectedExerciseId || adding}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adding ? 'Adding...' : 'Add Exercise'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
