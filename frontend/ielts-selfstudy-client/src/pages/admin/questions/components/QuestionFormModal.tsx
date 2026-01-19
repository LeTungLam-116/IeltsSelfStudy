import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconPlus, IconTrash } from '../../../../components/icons';
import { Modal, Button, Input, useToast } from '../../../../components/ui';
import { Textarea } from '../../../../components/ui/Textarea';
import type {
  QuestionDto,
  QuestionType,
  QuestionOption,
  CreateQuestionRequest,
  UpdateQuestionRequest
} from '../../../../types/questions';
import { useExerciseStore } from '../../../../stores';

const questionSchema = z.object({
  exerciseId: z.number().min(1, 'Exercise is required'),
  questionNumber: z.number().min(1, 'Question number must be at least 1'),
  questionText: z.string().min(1, 'Question text is required'),
  questionType: z.enum(['MultipleChoice', 'FillBlank', 'Essay', 'TrueFalse']),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  points: z.number().min(0, 'Points must be non-negative'),
  options: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Option text is required'),
  })).optional(),
  isActive: z.boolean(),
});

type QuestionFormInputs = z.infer<typeof questionSchema>;

interface QuestionFormModalProps {
  isOpen: boolean;
  question?: QuestionDto | null;
  onClose: () => void;
  onSubmit: (data: CreateQuestionRequest | UpdateQuestionRequest) => Promise<void>;
}

export function QuestionFormModal({ isOpen, question, onClose, onSubmit }: QuestionFormModalProps) {
  const exerciseStore = useExerciseStore();
  const { exercises } = exerciseStore;
  const isEditing = !!question;
  const { error: showError } = useToast();

  const [selectedType, setSelectedType] = useState<QuestionType>('MultipleChoice');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormInputs>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      exerciseId: 0,
      questionNumber: 1,
      questionText: '',
      questionType: 'MultipleChoice',
      correctAnswer: '',
      points: 1,
      options: [],
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const watchedType = watch('questionType');

  // Update selectedType when form changes
  useEffect(() => {
    if (watchedType) {
      setSelectedType(watchedType);
    }
  }, [watchedType]);

  // Disable create/update when selected exercise is Writing/Speaking
  const watchedExerciseId = watch('exerciseId');
  const [isExerciseAcceptsQuestions, setIsExerciseAcceptsQuestions] = useState<boolean>(true);

  useEffect(() => {
    if (!watchedExerciseId || watchedExerciseId === 0) {
      setIsExerciseAcceptsQuestions(true); // no exercise selected yet
      return;
    }
    const ex = exercises?.find((e) => e.id === watchedExerciseId);
    if (!ex) {
      setIsExerciseAcceptsQuestions(true);
      return;
    }
    setIsExerciseAcceptsQuestions(ex.type === 'Listening' || ex.type === 'Reading');
  }, [watchedExerciseId, exercises]);

  // Allowed question types per exercise type
  const allowedTypesBySkill: Record<string, QuestionType[]> = {
    Listening: ['MultipleChoice', 'FillBlank', 'TrueFalse'],
    Reading: ['MultipleChoice', 'FillBlank', 'TrueFalse'],
    Writing: [],
    Speaking: []
  };
  const selectedExercise = exercises?.find(e => e.id === watchedExerciseId);
  const allowedQuestionTypes = selectedExercise ? allowedTypesBySkill[selectedExercise.type] ?? [] : ['MultipleChoice', 'FillBlank', 'Essay', 'TrueFalse'];

  // Load question data when editing
  useEffect(() => {
    if (question && isOpen) {
      const options: QuestionOption[] = question.optionsJson
        ? JSON.parse(question.optionsJson)
        : [];

      reset({
        exerciseId: question.exerciseId,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        questionType: question.questionType as QuestionType,
        correctAnswer: question.correctAnswer,
        points: question.points,
        options,
        isActive: question.isActive,
      });

      setSelectedType(question.questionType as QuestionType);
    } else if (!question && isOpen) {
      // Reset form for new question
      reset({
        exerciseId: 0,
        questionNumber: 1,
        questionText: '',
        questionType: 'MultipleChoice',
        correctAnswer: '',
        points: 1,
        options: [],
        isActive: true,
      });
      setSelectedType('MultipleChoice');
    }
  }, [question, isOpen, reset]);

  const addOption = () => {
    const newId = `option_${Date.now()}`;
    append({ id: newId, text: '' });
  };

  const removeOption = (index: number) => {
    remove(index);
  };

  const onFormSubmit = async (data: QuestionFormInputs) => {
    try {
      const optionsJson = data.options && data.options.length > 0
        ? JSON.stringify(data.options)
        : null;

      const requestData = {
        exerciseId: data.exerciseId,
        questionNumber: data.questionNumber,
        questionText: data.questionText,
        questionType: data.questionType,
        correctAnswer: data.correctAnswer,
        points: data.points,
        optionsJson: optionsJson || undefined,
        ...(isEditing && { isActive: data.isActive }),
      };

      setServerError(null);
      await onSubmit(requestData);
      onClose();
    } catch (error) {
      console.error('Failed to submit question:', error);
      const msg = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to submit question';
      setServerError(msg);
      showError('Error', msg);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'MultipleChoice':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        {...register(`options.${index}.text`)}
                        placeholder={`Option ${index + 1}`}
                        className="w-full"
                      />
                      {errors.options?.[index]?.text && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.options[index]?.text?.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <IconTrash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                <IconPlus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        );

      case 'FillBlank':
        return (
          <div className="text-sm text-gray-600">
            For fill-in-the-blank questions, use underscores (_) in the question text to indicate blanks.
            Example: "The capital of France is ___."
          </div>
        );

      case 'Essay':
        return (
          <div className="text-sm text-gray-600">
            Essay questions allow free-form text responses. The correct answer field should contain
            sample criteria or key points to look for.
          </div>
        );

      case 'TrueFalse':
        return (
          <div className="text-sm text-gray-600">
            True/False questions should have "true" or "false" (case-insensitive) as the correct answer.
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Question' : 'Create New Question'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Exercise Selection */}
        <div>
          <label htmlFor="exerciseId" className="block text-sm font-medium text-gray-700">
            Exercise *
          </label>
          <select
            id="exerciseId"
            {...register('exerciseId', { valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>Select an exercise...</option>
          {exercises && exercises
            .filter(e => e.type === 'Listening' || e.type === 'Reading')
            .map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.title} ({exercise.type})
              </option>
            ))}
          </select>
          {errors.exerciseId && (
            <p className="mt-1 text-sm text-red-600">{errors.exerciseId.message}</p>
          )}
        {!isExerciseAcceptsQuestions && (
          <p className="mt-2 text-sm text-yellow-700">
            Questions cannot be added to Writing or Speaking exercises. Please select a Listening or Reading exercise.
          </p>
        )}
        </div>

        {/* Question Number */}
        <div>
          <label htmlFor="questionNumber" className="block text-sm font-medium text-gray-700">
            Question Number *
          </label>
          <Input
            id="questionNumber"
            type="number"
            min="1"
            {...register('questionNumber', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.questionNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.questionNumber.message}</p>
          )}
        </div>

        {/* Question Type */}
        <div>
          <label htmlFor="questionType" className="block text-sm font-medium text-gray-700">
            Question Type *
          </label>
          <select
            id="questionType"
            {...register('questionType')}
            onChange={(e) => {
              setValue('questionType', e.target.value as QuestionType);
              setSelectedType(e.target.value as QuestionType);
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {allowedQuestionTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'MultipleChoice' ? 'Multiple Choice' : t === 'FillBlank' ? 'Fill in the Blank' : t}
              </option>
            ))}
          </select>
          {errors.questionType && (
            <p className="mt-1 text-sm text-red-600">{errors.questionType.message}</p>
          )}
        </div>

        {/* Question Text (Markdown) */}
        <div>
          <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
            Question Text * (Markdown supported)
          </label>
          <Textarea
            id="questionText"
            {...register('questionText')}
            rows={4}
            placeholder="Enter the question text. Use **bold**, *italic*, etc. for formatting."
            className="mt-1"
          />
          {errors.questionText && (
            <p className="mt-1 text-sm text-red-600">{errors.questionText.message}</p>
          )}
        </div>

        {/* Type-specific fields */}
        {renderTypeSpecificFields()}

        {/* Correct Answer */}
        <div>
          <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700">
            Correct Answer *
          </label>
          <Input
            id="correctAnswer"
            {...register('correctAnswer')}
            className="mt-1"
            placeholder={
              selectedType === 'TrueFalse'
                ? 'true or false'
                : selectedType === 'MultipleChoice'
                ? 'Option text or index (e.g., "A" or "0")'
                : 'Expected answer'
            }
          />
          {errors.correctAnswer && (
            <p className="mt-1 text-sm text-red-600">{errors.correctAnswer.message}</p>
          )}
        </div>

        {/* Points */}
        <div>
          <label htmlFor="points" className="block text-sm font-medium text-gray-700">
            Points
          </label>
          <Input
            id="points"
            type="number"
            step="0.5"
            min="0"
            {...register('points', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.points && (
            <p className="mt-1 text-sm text-red-600">{errors.points.message}</p>
          )}
        </div>

        {/* Active Status (Edit only) */}
        {isEditing && (
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          {serverError && (
            <div className="flex-1 text-left">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !isExerciseAcceptsQuestions}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Question' : 'Create Question'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
