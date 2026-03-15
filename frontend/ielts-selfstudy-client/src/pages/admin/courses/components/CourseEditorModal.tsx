// React import not required
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Course, CourseExercise, ExerciseAssignmentValidated } from '../../../../types';
import { Modal, Button, Input } from '../../../../components/ui';
import { useExerciseStore, useCourseStore } from '../../../../stores';
import { exerciseAssignmentSchema } from '../../../../types';

interface CourseEditorModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSave: (courseId: number, exercises: CourseExercise[]) => Promise<void>;
}

export function CourseEditorModal({ isOpen, course, onClose, onSave }: CourseEditorModalProps) {
  const [courseExercises, setCourseExercises] = useState<CourseExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { exercises: allExercises, fetchExercises } = useExerciseStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(exerciseAssignmentSchema),
    defaultValues: {
      exerciseId: 0,
      order: 1,
      lessonNumber: undefined,
    },
  });

  // Load course exercises and available exercises when modal opens
  useEffect(() => {
    if (isOpen && course) {
      loadCourseData();
    }
  }, [isOpen, course]);

  const loadCourseData = async () => {
    if (!course) return;

    setIsLoading(true);
    try {
      // Load all exercises for selection
      await fetchExercises();

      // Load current course exercises from backend (store)
      const courseExercisesFromApi = await useCourseStore.getState().fetchCourseExercises(course.id);
      const sortedResult = (courseExercisesFromApi || []).sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return (a.lessonNumber || 0) - (b.lessonNumber || 0);
      });
      setCourseExercises(sortedResult);

      // Update form default order to be the next one
      reset({
        exerciseId: 0,
        order: sortedResult.length + 1,
        lessonNumber: undefined
      });
    } catch (error) {
      console.error('Failed to load course data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get exercises that are not yet assigned to this course
  const getAvailableExercises = () => {
    const assignedIds = new Set(courseExercises.map(ce => ce.exerciseId));
    return allExercises.filter(ex => !assignedIds.has(ex.id));
  };

  const handleAddExercise = (data: ExerciseAssignmentValidated) => {
    const exercise = allExercises.find(ex => ex.id === data.exerciseId);
    if (!exercise) return;

    // Persist to backend via store
    (async () => {
      try {
        setIsLoading(true);
        const created = await useCourseStore.getState().addExerciseToCourse(course!.id, {
          exerciseId: data.exerciseId,
          order: data.order,
          lessonNumber: data.lessonNumber ?? undefined,
        });

        // Manually attach the exercise details so the UI can show title/type/level immediately
        created.exercise = exercise;

        // Append returned object (backend authoritative)
        const updatedList = [...courseExercises, created].sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return (a.lessonNumber || 0) - (b.lessonNumber || 0);
        });
        setCourseExercises(updatedList);

        // Reset form with next order
        reset({
          exerciseId: 0,
          order: updatedList.length + 1,
          lessonNumber: undefined
        });
      } catch (err) {
        console.error('Failed to add exercise to course:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleRemoveExercise = (courseExerciseId: number) => {
    (async () => {
      try {
        setIsLoading(true);
        await useCourseStore.getState().removeExerciseFromCourse(course!.id, courseExerciseId);
        setCourseExercises(prev => prev.filter(ce => ce.id !== courseExerciseId));
      } catch (err) {
        console.error('Failed to remove exercise from course:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleMoveExercise = (courseExerciseId: number, direction: 'up' | 'down') => {
    setCourseExercises(prev => {
      const exercises = [...prev];
      const index = exercises.findIndex(ce => ce.id === courseExerciseId);
      if (index === -1) return exercises;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= exercises.length) return exercises;

      // Swap exercises
      [exercises[index], exercises[newIndex]] = [exercises[newIndex], exercises[index]];

      // Update order numbers locally
      exercises.forEach((ex, idx) => {
        ex.order = idx + 1;
      });

      // Persist moved item order to backend for the moved exercise
      (async () => {
        try {
          setIsLoading(true);
          const moved = exercises.find(ex => ex.id === courseExerciseId);
          if (moved) {
            await useCourseStore.getState().updateExerciseOrder(course!.id, courseExerciseId, moved.order);
          }
        } catch (err) {
          console.error('Failed to update exercise order:', err);
        } finally {
          setIsLoading(false);
        }
      })();

      return exercises;
    });
  };

  const handleSave = async () => {
    if (!course) return;

    try {
      await onSave(course.id, courseExercises);
      onClose();
    } catch (error) {
      console.error('Failed to save course exercises:', error);
    }
  };

  const handleClose = () => {
    setCourseExercises([]);
    reset();
    onClose();
  };

  const availableExercisesList = getAvailableExercises();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Course: ${course?.name || ''}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Current Exercises */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Current Exercises ({courseExercises.length})
          </h3>

          {courseExercises.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No exercises assigned to this course yet.
            </p>
          ) : (
            <div className="space-y-2">
              {courseExercises
                .sort((a, b) => {
                  if (a.order !== b.order) return a.order - b.order;
                  return (a.lessonNumber || 0) - (b.lessonNumber || 0);
                })
                .map((courseExercise, index) => (
                  <div key={courseExercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        {courseExercise.order}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {courseExercise.exercise?.title || `Exercise ${courseExercise.exerciseId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Type: {courseExercise.exercise?.type || 'Unknown'} |
                          Level: {courseExercise.exercise?.level || 'Unknown'}
                          {courseExercise.lessonNumber && ` | Lesson ${courseExercise.lessonNumber}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveExercise(courseExercise.id, 'up')}
                        disabled={index === 0}
                        aria-label="Move exercise up"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveExercise(courseExercise.id, 'down')}
                        disabled={index === courseExercises.length - 1}
                        aria-label="Move exercise down"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveExercise(courseExercise.id)}
                        aria-label="Remove exercise from course"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Add Exercise Form */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Exercise</h3>

          <form onSubmit={handleSubmit(handleAddExercise)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise *
                </label>
                <select
                  id="exercise-select"
                  {...register('exerciseId', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an exercise...</option>
                  {availableExercisesList.map(exercise => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.title} ({exercise.type}, {exercise.level})
                    </option>
                  ))}
                </select>
                {errors.exerciseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.exerciseId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Order *
                </label>
                <Input
                  id="order"
                  type="number"
                  {...register('order', { valueAsNumber: true })}
                  placeholder="1"
                  error={!!errors.order}
                  helperText={errors.order?.message}
                />
              </div>

              <div>
                <label htmlFor="lessonNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Number
                </label>
                <Input
                  id="lessonNumber"
                  type="number"
                  {...register('lessonNumber', { valueAsNumber: true })}
                  placeholder="Optional"
                  error={!!errors.lessonNumber}
                  helperText={errors.lessonNumber?.message}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || availableExercisesList.length === 0}
              loading={isSubmitting}
            >
              Add Exercise
            </Button>
          </form>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={isLoading}
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
