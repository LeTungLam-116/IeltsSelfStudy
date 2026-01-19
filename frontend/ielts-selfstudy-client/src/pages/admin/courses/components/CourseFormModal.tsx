import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Course, CourseFormDataValidated } from '../../../../types/course';
import { Modal, Button, Input } from '../../../../components/ui';
import { COURSE_LEVELS, COURSE_SKILLS, courseFormSchema } from '../../../../types/course';

interface CourseFormModalProps {
  isOpen: boolean;
  course?: Course | null;
  onClose: () => void;
  onSubmit: (data: CourseFormDataValidated) => Promise<void>;
}

interface CourseFormModalProps {
  isOpen: boolean;
  course?: Course | null;
  onClose: () => void;
  onSubmit: (data: CourseFormDataValidated) => Promise<void>;
}

export function CourseFormModal({ isOpen, course, onClose, onSubmit }: CourseFormModalProps) {
  const isEditing = !!course;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      level: 'Beginner' as const,
      skill: 'All' as const,
      targetBand: undefined,
      price: undefined,
      isActive: true,
    },
  });

  // Reset form when modal opens/closes or course changes
  useEffect(() => {
    if (isOpen) {
      if (course) {
        // Edit mode - populate form with course data
        reset({
          name: course.name,
          shortDescription: course.shortDescription || '',
          level: course.level as any,
          skill: course.skill as any,
          targetBand: course.targetBand || undefined,
          price: course.price || undefined,
          isActive: course.isActive,
        });
      } else {
        // Create mode - reset to default values
        reset({
          name: '',
          shortDescription: '',
          level: 'Beginner',
          skill: 'All',
          targetBand: undefined,
          price: undefined,
          isActive: true,
        });
      }
    }
  }, [isOpen, course, reset]);

  const handleFormSubmit = async (data: CourseFormDataValidated) => {
    console.log('CourseFormModal - handleFormSubmit called with:', data);
    try {
      await onSubmit(data);
      console.log('CourseFormModal - form submission successful');
      onClose();
    } catch (error) {
      console.error('CourseFormModal - Form submission error:', error);
      // Error is handled by the parent component/store
    }
  };

  // Focus on first invalid field when validation fails
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      element?.focus();
    }
  }, [errors]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Course' : 'Create New Course'}
      trapFocus={true}
      initialFocus="name"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Course Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Course Name *
          </label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter course name"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <textarea
            id="shortDescription"
            {...register('shortDescription')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the course"
          />
          {errors.shortDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
          )}
        </div>

        {/* Level and Skill */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Level *
            </label>
            <select
              id="level"
              {...register('level')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {COURSE_LEVELS.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1">
              Skill *
            </label>
            <select
              id="skill"
              {...register('skill')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {COURSE_SKILLS.map(skill => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
            {errors.skill && (
              <p className="mt-1 text-sm text-red-600">{errors.skill.message}</p>
            )}
          </div>
        </div>

        {/* Target Band and Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="targetBand" className="block text-sm font-medium text-gray-700 mb-1">
              Target Band
            </label>
            <Input
              id="targetBand"
              type="number"
              step="0.5"
              min="0"
              max="9"
              {...register('targetBand', { valueAsNumber: true })}
              placeholder="e.g. 6.5"
              error={!!errors.targetBand}
              helperText={errors.targetBand?.message}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register('price', { valueAsNumber: true })}
              placeholder="Leave empty for free"
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </div>
        </div>

        {/* Is Active */}
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active course
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
