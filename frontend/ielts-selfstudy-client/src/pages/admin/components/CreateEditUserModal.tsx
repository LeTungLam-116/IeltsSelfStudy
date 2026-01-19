import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AdminUser } from '../../../types';
import { Modal, Button, Input } from '../../../components/ui';

// Zod schema for form validation
const userFormSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  fullName: z.string().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(['Student', 'Admin']),
  targetBand: z.number().optional(),
  isActive: z.boolean(),
}).refine((data) => {
  // Password confirmation validation (only for create mode)
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userFormSchema>;

interface CreateEditUserModalProps {
  isOpen: boolean;
  user?: AdminUser | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export function CreateEditUserModal({ isOpen, user, onClose, onSubmit }: CreateEditUserModalProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      role: 'Student',
      targetBand: undefined,
      isActive: true,
    },
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Edit mode - populate form with user data
        reset({
          email: user.email,
          fullName: user.fullName,
          role: user.role as 'Student' | 'Admin',
          targetBand: user.targetBand || undefined,
          isActive: user.isActive,
          password: '', // Don't populate password for security
          confirmPassword: '',
        });
      } else {
        // Create mode - reset to defaults
        reset({
          email: '',
          fullName: '',
          password: '',
          confirmPassword: '',
          role: 'Student',
          targetBand: undefined,
          isActive: true,
        });
      }
    }
  }, [isOpen, user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...submitData } = data;

      // Handle targetBand conversion (NaN from empty number input)
      const processedData = {
        ...submitData,
        targetBand: isNaN(submitData.targetBand!) ? undefined : submitData.targetBand,
      };

      // For create mode, password is required
      if (!isEditing && !processedData.password) {
        throw new Error('Password is required for new users');
      }

      // For edit mode, remove password if empty (don't update password)
      if (isEditing && !processedData.password) {
        const { password, ...editData } = processedData;
        await onSubmit(editData);
      } else {
        await onSubmit(processedData);
      }

      onClose();
    } catch (error) {
      // Error is handled by the parent component/store
      console.error('Form submission error:', error);
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
      title={isEditing ? 'Edit User' : 'Create New User'}
      trapFocus={true}
      initialFocus="email"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="user@example.com"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="John Doe"
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
          />
        </div>

        {/* Password (only for create or when changing password in edit) */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {isEditing ? 'New Password (leave empty to keep current)' : 'Password *'}
          </label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder={isEditing ? 'Enter new password' : 'Enter password'}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        </div>

        {/* Confirm Password (only shown when password is entered) */}
        {watch('password') && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </div>
        )}

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            id="role"
            {...register('role')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Student">Student</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Target Band */}
        <div>
          <label htmlFor="targetBand" className="block text-sm font-medium text-gray-700 mb-1">
            Target Band (optional)
          </label>
          <Input
            id="targetBand"
            type="number"
            min="0"
            max="9"
            step="0.5"
            {...register('targetBand', { valueAsNumber: true })}
            placeholder="e.g. 6.5"
            error={!!errors.targetBand}
            helperText={errors.targetBand?.message}
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive', {
              setValueAs: (value: any) => Boolean(value)
            })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active user
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
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
