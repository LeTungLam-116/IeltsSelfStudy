import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminExerciseDto, CreateExerciseFormData, UpdateExerciseFormData, ExerciseType } from '../../../../types/exercise';
import { Modal, Button, Input } from '../../../../components/ui';
import { EXERCISE_TYPES, EXERCISE_LEVELS, createExerciseSchema } from '../../../../types/exercise';
import { uploadAudioFile } from '../../../../api/exercisesApi';

interface ExerciseFormModalProps {
  isOpen: boolean;
  exercise?: AdminExerciseDto | null;
  onClose: () => void;
  onSubmit: (data: CreateExerciseFormData | UpdateExerciseFormData) => Promise<void>;
}

export function ExerciseFormModal({ isOpen, exercise, onClose, onSubmit }: ExerciseFormModalProps) {
  const isEditing = !!exercise;
  const [selectedType, setSelectedType] = useState<string>('Listening');
  const [isUploading, setIsUploading] = useState(false);
  const [, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      type: 'Listening' as ExerciseType,
      title: '',
      description: '',
      level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
      questionCount: 1,
      isActive: true,
      audioUrl: '',
      transcript: '',
      durationSeconds: undefined,
      passageText: '',
      taskType: 'Task2',
      topic: '',
      minWordCount: 250,
      sampleAnswer: '',
      part: 'Part1',
      question: '',
      tips: '',
    },
  });

  // Watch the type field to show/hide conditional fields
  const watchedType = watch('type');

  // Update selectedType when form type changes
  useEffect(() => {
    if (watchedType) {
      setSelectedType(watchedType);
    }
  }, [watchedType]);

  // Reset form when modal opens/closes or exercise changes
  useEffect(() => {
    if (isOpen) {
      if (exercise) {
        // Edit mode - populate form with exercise data
        const formData = {
          type: exercise.type as ExerciseType,
          title: exercise.title,
          description: exercise.description || '',
          level: (exercise.level || 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
          questionCount: exercise.questionCount || 1,
          isActive: exercise.isActive,
          audioUrl: exercise.audioUrl || '',
          transcript: exercise.transcript || '',
          durationSeconds: exercise.durationSeconds || undefined,
          passageText: exercise.passageText || '',
          taskType: exercise.taskType || 'Task2',
          topic: exercise.topic || '',
          minWordCount: exercise.minWordCount || 250,
          sampleAnswer: exercise.sampleAnswer || '',
          part: exercise.part || 'Part1',
          question: exercise.question || '',
          tips: exercise.tips || '',
        };
        reset(formData);
        setValue('type', exercise.type as ExerciseType);
        setSelectedType(exercise.type);
      } else {
        // Create mode - reset to default values
        reset({
          type: 'Listening' as ExerciseType,
          title: '',
          description: '',
          level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
          questionCount: 1,
          isActive: true,
          audioUrl: '',
          transcript: '',
          durationSeconds: undefined,
          passageText: '',
          taskType: 'Task2',
          topic: '',
          minWordCount: 250,
          sampleAnswer: '',
          part: 'Part1',
          question: '',
          tips: '',
        });
        setValue('type', 'Listening' as ExerciseType);
        setSelectedType('Listening');
      }
    }
  }, [isOpen, exercise, reset]);

  const handleFormSubmit = async (data: CreateExerciseFormData) => {
    try {
      console.log('ExerciseFormModal - submitting data:', data);
      const result = await onSubmit(data);
      console.log('ExerciseFormModal - onSubmit result:', result);
      onClose();
    } catch (error) {
      console.error('ExerciseFormModal - Form submission error:', error);
      // Provide visual feedback in form if possible
      // Error handling is primarily handled by parent; for now log and rethrow to bubble up
      throw error;
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

  const handleTypeChange = (newType: ExerciseType) => {
    setValue('type', newType);
    setSelectedType(newType);

    // Reset type-specific fields when type changes
    if (newType === 'Listening') {
      setValue('audioUrl', '');
      setValue('transcript', '');
      setValue('durationSeconds', undefined);
    } else if (newType === 'Reading') {
      setValue('passageText', '');
    } else if (newType === 'Writing') {
      setValue('taskType', 'Task2');
      setValue('topic', '');
      setValue('minWordCount', 250);
      setValue('sampleAnswer', '');
    } else if (newType === 'Speaking') {
      setValue('part', 'Part1');
      setValue('question', '');
      setValue('tips', '');
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadedFileName(file.name);

      // Call API to upload
      const result = await uploadAudioFile(file);
      // Set the returned URL and optionally duration
      if (result?.url) {
        setValue('audioUrl', result.url);
      }
      if (result?.durationSeconds) {
        setValue('durationSeconds', result.durationSeconds);
      }
    } catch (err) {
      console.error('Audio upload failed', err);
      alert('Audio upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Exercise' : 'Create New Exercise'}
      size="xl"
      trapFocus={true}
      initialFocus="type"
    >
      <form
        onSubmit={handleSubmit(
          handleFormSubmit,
          (formErrors) => {
            // Log validation errors so user/developer can see why submit was blocked
            console.warn('ExerciseFormModal - validation errors:', formErrors);
            const firstField = Object.keys(formErrors)[0];
            if (firstField) {
              const el = document.getElementById(firstField);
              el?.focus();
            }
          }
        )}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exercise Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Exercise Type *
            </label>
            <select
              id="type"
              {...register('type')}
              value={watch('type')}
              onChange={(e) => {
                const newType = e.target.value as ExerciseType;
                setValue('type', newType);
                handleTypeChange(newType);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {EXERCISE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Level *
            </label>
            <select
              id="level"
              {...register('level')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {EXERCISE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <Input
            id="title"
            {...register('title')}
            placeholder="e.g., IELTS Listening Test 1 - Section 1"
            error={!!errors.title}
            helperText={errors.title?.message}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Input
            as="textarea"
            id="description"
            {...register('description')}
            placeholder="Enter exercise description (optional)"
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </div>

        {/* Question Count & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question Count - auto-managed; show read-only when editing Listening/Reading */}
          {['Listening', 'Reading'].includes(selectedType) && isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <div className="mt-1 text-sm text-gray-700">
                {exercise?.questionCount ?? 0}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Question count is auto-managed by the system and updated when questions are added or removed.
              </p>
            </div>
          )}

          {/* Placeholder div for grid alignment when questionCount is hidden */}
          {!['Listening', 'Reading'].includes(selectedType) && <div></div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isActive"
                  checked={watch('isActive') === true}
                  onChange={() => setValue('isActive', true)}
                  className="mr-2"
                />
                Active
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isActive"
                  checked={watch('isActive') === false}
                  onChange={() => setValue('isActive', false)}
                  className="mr-2"
                />
                Inactive
              </label>
            </div>
            {errors.isActive && (
              <p className="mt-1 text-sm text-red-600">{errors.isActive.message}</p>
            )}
          </div>
        </div>

        {/* Type-Specific Fields */}
        {selectedType === 'Listening' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Listening Exercise Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="audioUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Audio URL
                </label>
                <Input
                  id="audioUrl"
                  {...register('audioUrl')}
                  placeholder="https://example.com/audio.mp3"
                  error={!!errors.audioUrl}
                  helperText={errors.audioUrl?.message}
                />
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or upload audio file</label>
                  <input type="file" accept="audio/*" onChange={handleAudioFileChange} />
                  {isUploading && <p className="text-sm text-gray-600 mt-1">Uploading audio...</p>}
                  {uploadedFileName && !isUploading && <p className="text-sm text-gray-600 mt-1">Uploaded: {uploadedFileName}</p>}
                  {watch('audioUrl') && (
                    <div className="mt-2">
                      <audio controls src={watch('audioUrl')} className="w-full" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="durationSeconds" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (seconds)
                </label>
                <Input
                  id="durationSeconds"
                  type="number"
                  min="1"
                  {...register('durationSeconds', {
                    valueAsNumber: true,
                    setValueAs: (v) => {
                      // convert empty string to undefined to avoid NaN
                      if (v === '' || v === null || v === undefined) return undefined;
                      const n = Number(v);
                      return Number.isNaN(n) ? undefined : n;
                    },
                  })}
                  placeholder="180"
                  error={!!errors.durationSeconds}
                  helperText={errors.durationSeconds?.message}
                />
              </div>
            </div>
            <div>
              <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-1">
                Transcript
              </label>
              <Input
                as="textarea"
                id="transcript"
                {...register('transcript')}
                placeholder="Enter audio transcript"
                rows={4}
                error={!!errors.transcript}
                helperText={errors.transcript?.message}
              />
            </div>
          </div>
        )}

        {selectedType === 'Reading' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Reading Exercise Details</h3>
            <div>
              <label htmlFor="passageText" className="block text-sm font-medium text-gray-700 mb-1">
                Passage Text *
              </label>
              <Input
                as="textarea"
                id="passageText"
                {...register('passageText')}
                placeholder="Enter the reading passage text"
                rows={8}
                error={!!errors.passageText}
                helperText={errors.passageText?.message}
              />
            </div>
          </div>
        )}

        {selectedType === 'Writing' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Writing Exercise Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type *
                </label>
                <select
                  id="taskType"
                  {...register('taskType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Task1">Task 1</option>
                  <option value="Task2">Task 2</option>
                </select>
                {errors.taskType && (
                  <p className="mt-1 text-sm text-red-600">{errors.taskType.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="minWordCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Word Count
                </label>
                <Input
                  id="minWordCount"
                  type="number"
                  min="1"
                  {...register('minWordCount', { valueAsNumber: true })}
                  placeholder="250"
                  error={!!errors.minWordCount}
                  helperText={errors.minWordCount?.message}
                />
              </div>
            </div>
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <Input
                id="topic"
                {...register('topic')}
                placeholder="Enter writing topic"
                error={!!errors.topic}
                helperText={errors.topic?.message}
              />
            </div>
            <div>
              <label htmlFor="sampleAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                Sample Answer
              </label>
              <Input
                as="textarea"
                id="sampleAnswer"
                {...register('sampleAnswer')}
                placeholder="Enter sample answer for reference"
                rows={6}
                error={!!errors.sampleAnswer}
                helperText={errors.sampleAnswer?.message}
              />
            </div>
          </div>
        )}

        {selectedType === 'Speaking' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Speaking Exercise Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="part" className="block text-sm font-medium text-gray-700 mb-1">
                  Part *
                </label>
                <select
                  id="part"
                  {...register('part')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Part1">Part 1</option>
                  <option value="Part2">Part 2</option>
                  <option value="Part3">Part 3</option>
                </select>
                {errors.part && (
                  <p className="mt-1 text-sm text-red-600">{errors.part.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Question/Prompt *
              </label>
              <Input
                as="textarea"
                id="question"
                {...register('question')}
                placeholder="Enter speaking question or prompt"
                rows={3}
                error={!!errors.question}
                helperText={errors.question?.message}
              />
            </div>
            <div>
              <label htmlFor="tips" className="block text-sm font-medium text-gray-700 mb-1">
                Tips & Guidance
              </label>
              <Input
                as="textarea"
                id="tips"
                {...register('tips')}
                placeholder="Enter tips for candidates"
                rows={3}
                error={!!errors.tips}
                helperText={errors.tips?.message}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}