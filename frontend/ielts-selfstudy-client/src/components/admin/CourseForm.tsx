import { useState, useEffect } from 'react';
import { type CourseDto, type CreateCourseRequest, type UpdateCourseRequest } from '../../api/courseApi';

interface CourseFormProps {
  course?: CourseDto | null;
  onSubmit: (data: CreateCourseRequest | UpdateCourseRequest) => Promise<void>;
  onCancel: () => void;
}

const SKILL_OPTIONS = [
  { value: 'All', label: 'All Skills' },
  { value: 'Writing', label: 'Writing' },
  { value: 'Speaking', label: 'Speaking' },
  { value: 'Listening', label: 'Listening' },
  { value: 'Reading', label: 'Reading' },
];

const LEVEL_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

export default function CourseForm({ course, onSubmit, onCancel }: CourseFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    level: 'Beginner',
    skill: 'All',
    targetBand: '',
    price: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        shortDescription: course.shortDescription || '',
        level: course.level,
        skill: course.skill,
        targetBand: course.targetBand?.toString() || '',
        price: course.price?.toString() || '',
        isActive: course.isActive,
      });
    }
  }, [course]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (formData.name.length > 255) {
      newErrors.name = 'Course name must be less than 255 characters';
    }

    if (formData.shortDescription.length > 500) {
      newErrors.shortDescription = 'Description must be less than 500 characters';
    }

    if (formData.targetBand && (isNaN(Number(formData.targetBand)) || Number(formData.targetBand) < 0 || Number(formData.targetBand) > 9)) {
      newErrors.targetBand = 'Target band must be between 0 and 9';
    }

    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        level: formData.level,
        skill: formData.skill,
        targetBand: formData.targetBand ? Number(formData.targetBand) : null,
        price: formData.price ? Number(formData.price) : null,
        ...(course && { isActive: formData.isActive }),
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {course ? 'Edit Course' : 'Create New Course'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter course name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of the course"
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
              )}
            </div>

            {/* Level and Skill */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LEVEL_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill *
                </label>
                <select
                  value={formData.skill}
                  onChange={(e) => handleChange('skill', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SKILL_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Band and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Band
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={formData.targetBand}
                  onChange={(e) => handleChange('targetBand', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.targetBand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 6.5"
                />
                {errors.targetBand && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetBand}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Leave empty for free"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Active Status (only for editing) */}
            {course && (
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active course
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (course ? 'Update Course' : 'Create Course')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
