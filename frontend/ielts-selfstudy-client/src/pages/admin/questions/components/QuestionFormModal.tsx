import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconPlus, IconTrash, IconCheck, IconCheckCircle, IconXCircle } from '../../../../components/icons';
import { Modal, Button, Input, useToast, Combobox } from '../../../../components/ui';
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
  questionType: z.enum(['MultipleChoice', 'FillBlank', 'Essay', 'TrueFalse', 'TrueFalseNotGiven', 'ShortAnswer', 'Matching', 'FormCompletion', 'SentenceCompletion', 'SummaryCompletion']),
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
  const { exercises, fetchExercises, isLoading: isFetchingExercises } = exerciseStore;
  const isEditing = !!question;
  const { error: showError } = useToast();

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch exercises when modal opens to ensure we have fresh data (e.g. question counts)
  useEffect(() => {
    if (isOpen) {
      fetchExercises({ pageNumber: 1, pageSize: 20 });
    }
  }, [isOpen, fetchExercises]);

  const handleSearchExercises = useCallback((query: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      fetchExercises({ pageNumber: 1, pageSize: 20, search: query });
    }, 500);
  }, [fetchExercises]);

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

  const { fields, append, remove, replace } = useFieldArray({
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
    const accepts = ex.type === 'Listening' || ex.type === 'Reading';
    setIsExerciseAcceptsQuestions(accepts);

    if (!isEditing && accepts) {
      // Auto-increment question number based on current count
      setValue('questionNumber', (ex.questionCount || 0) + 1);
    }
  }, [watchedExerciseId, exercises, isEditing, setValue]);

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
      // Explicitly clear fields to be safe against reuse
      setTimeout(() => {
        replace([]);
        setValue('options', []);
        setValue('correctAnswer', '');
      }, 0);
    }
  }, [question, isOpen, reset, replace, setValue]);

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
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Các phương án lựa chọn *
              </label>
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const label = String.fromCharCode(65 + index); // A, B, C...
                  const isSelected = watch('correctAnswer') === watch(`options.${index}.text`) && watch('correctAnswer') !== '';

                  return (
                    <div key={field.id} className="flex items-center gap-3 group animate-in slide-in-from-left-2 duration-200">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-green-600' : 'text-slate-400'}`}>
                          {label}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const val = watch(`options.${index}.text`) as string;
                            setValue('correctAnswer', val || '', { shouldValidate: true });
                          }}
                          className={`p-2.5 rounded-xl border-2 transition-all flex-shrink-0 ${isSelected
                            ? 'bg-green-50 border-green-500 text-green-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-300 hover:border-green-200 hover:text-green-400'
                            }`}
                          title={`Chọn ${label} làm đáp án đúng`}
                        >
                          <IconCheck className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex-1 pt-4">
                        <Input
                          {...register(`options.${index}.text`)}
                          placeholder={`Nội dung phương án ${label}...`}
                          className={`w-full transition-all ${isSelected
                            ? 'border-green-500 ring-2 ring-green-500/10 font-bold'
                            : ''
                            }`}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const oldVal = watch(`options.${index}.text`);
                            if (watch('correctAnswer') === oldVal) {
                              setValue('correctAnswer', e.target.value);
                            }
                            const reg = register(`options.${index}.text`);
                            if (reg && reg.onChange) {
                              reg.onChange(e);
                            }
                          }}
                        />
                        {errors.options?.[index]?.text && (
                          <p className="mt-1 text-xs text-red-600 font-medium italic pl-1">
                            ⚠️ {errors.options[index]?.text?.message}
                          </p>
                        )}
                      </div>
                      <div className="pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                          title="Xóa phương án này"
                        >
                          <IconTrash className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-4 px-4 border-dashed border-2 hover:border-blue-500 transition-all rounded-xl"
              >
                <IconPlus className="w-4 h-4 mr-2" />
                Thêm phương án mới
              </Button>
            </div>
          </div>
        );

      case 'FillBlank':
        return (
          <div className="text-sm text-gray-600">
            Đối với câu hỏi điền vào chỗ trống, hãy sử dụng dấu gạch dưới (_) trong văn bản câu hỏi để chỉ định chỗ trống.
            Ví dụ: "Thủ đô của nước Pháp là ___."
          </div>
        );

      case 'Essay':
        return (
          <div className="text-sm text-gray-600">
            Câu hỏi tự luận cho phép phản hồi bằng văn bản tự do. Trường đáp án đúng nên chứa các tiêu chí mẫu hoặc các ý chính cần tìm kiếm.
          </div>
        );

      case 'TrueFalse':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">
              Chọn đáp án đúng *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setValue('correctAnswer', 'true', { shouldValidate: true })}
                className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-3 ${watch('correctAnswer') === 'true'
                  ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-slate-50'
                  }`}
              >
                <IconCheckCircle className={`w-6 h-6 ${watch('correctAnswer') === 'true' ? 'text-blue-500' : 'text-slate-300'}`} />
                <span className="text-base">Đúng (True)</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('correctAnswer', 'false', { shouldValidate: true })}
                className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-3 ${watch('correctAnswer') === 'false'
                  ? 'bg-red-50 border-red-500 text-red-600 shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:bg-slate-50'
                  }`}
              >
                <IconXCircle className={`w-6 h-6 ${watch('correctAnswer') === 'false' ? 'text-red-500' : 'text-slate-300'}`} />
                <span className="text-base">Sai (False)</span>
              </button>
            </div>
            {errors.correctAnswer && selectedType === 'TrueFalse' && (
              <p className="mt-1 text-sm text-red-600 font-bold italic">⚠️ Vui lòng chọn đáp án Đúng hoặc Sai</p>
            )}
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
      title={isEditing ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
      size="lg"
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '68vh', marginTop: '2.5rem' }}
      >
        <div className="flex-1 overflow-y-auto pr-3 space-y-6 pt-16 pb-2">
          {/* Exercise Selection */}
          <div>
            <label htmlFor="exerciseId" className="block text-sm font-bold text-slate-700 mb-1.5">
              Bài tập đi kèm *
            </label>
            <Combobox
              options={exercises
                .filter(e => e.type === 'Listening' || e.type === 'Reading')
                .map(e => ({
                  value: e.id,
                  label: e.title,
                  subLabel: `Kỹ năng: ${e.type === 'Listening' ? 'Nghe' : 'Đọc'} | Level: ${e.level}`
                }))}
              value={watch('exerciseId')}
              onChange={(val) => {
                setValue('exerciseId', Number(val), { shouldValidate: true });
              }}
              onSearch={handleSearchExercises}
              isLoading={isFetchingExercises}
              placeholder="Chọn bài tập..."
              searchPlaceholder="Nhập tên bài tập để tìm kiếm..."
              error={!!errors.exerciseId}
            />
            {errors.exerciseId && (
              <p className="mt-1 text-sm text-red-600 font-bold">{errors.exerciseId.message}</p>
            )}
            {!isExerciseAcceptsQuestions && (
              <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 font-medium">
                  ⚠️ Câu hỏi chỉ có thể thêm vào bài nghe (Listening) hoặc bài đọc (Reading).
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Number */}
            <div>
              <label htmlFor="questionNumber" className="block text-sm font-bold text-slate-700 mb-1.5">
                Câu thứ mấy? *
              </label>
              <Input
                id="questionNumber"
                type="number"
                min="1"
                {...register('questionNumber', { valueAsNumber: true })}
                placeholder="Ví dụ: 1"
                error={!!errors.questionNumber}
              />
              <p className="text-[10px] text-slate-500 mt-1">Phải là số duy nhất trong bài tập này.</p>
            </div>

            {/* Question Type */}
            <div>
              <label htmlFor="questionType" className="block text-sm font-bold text-slate-700 mb-1.5">
                Loại câu hỏi *
              </label>
              <select
                id="questionType"
                {...register('questionType')}
                onChange={(e) => {
                  setValue('questionType', e.target.value as QuestionType);
                  setSelectedType(e.target.value as QuestionType);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              >
                {allowedQuestionTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === 'MultipleChoice' ? 'Trắc nghiệm (Multiple Choice)' : t === 'FillBlank' ? 'Điền vào chỗ trống (Fill-in-the-blank)' : t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Text (Markdown) */}
          <div>
            <label htmlFor="questionText" className="block text-sm font-bold text-slate-700 mb-1.5">
              Nội dung câu hỏi * (Hỗ trợ Markdown)
            </label>
            <Textarea
              id="questionText"
              {...register('questionText')}
              rows={4}
              placeholder="Nhập nội dung câu hỏi. Bạn có thể dùng **chữ in đậm**, *chữ nghiêng*, v.v."
            />
            {errors.questionText && (
              <p className="mt-1 text-sm text-red-600 font-bold">{errors.questionText.message}</p>
            )}
          </div>

          {/* Type-specific fields */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            {renderTypeSpecificFields()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Correct Answer - Only show for FillBlank and Essay as they need manual text entry */}
            {(selectedType === 'FillBlank' || selectedType === 'Essay') && (
              <div className="md:col-span-1">
                <label htmlFor="correctAnswer" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Đáp án đúng *
                </label>
                <Input
                  id="correctAnswer"
                  {...register('correctAnswer')}
                  placeholder="Nhập đáp án mong đợi..."
                  error={!!errors.correctAnswer}
                />
              </div>
            )}

            {/* Points */}
            <div className={(selectedType !== 'FillBlank' && selectedType !== 'Essay') ? 'md:col-span-2' : ''}>
              <label htmlFor="points" className="block text-sm font-bold text-slate-700 mb-1.5">
                Điểm số
              </label>
              <Input
                id="points"
                type="number"
                step="0.5"
                min="0"
                {...register('points', { valueAsNumber: true })}
                placeholder="Ví dụ: 1.0"
              />
            </div>
          </div>

          {/* Active Status (Edit only) */}
          {isEditing && (
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Trạng thái hoạt động
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setValue('isActive', true)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: '2px solid',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: watch('isActive') === true ? '700' : '500',
                    backgroundColor: watch('isActive') === true ? '#eff6ff' : '#ffffff',
                    borderColor: watch('isActive') === true ? '#3b82f6' : '#e2e8f0',
                    color: watch('isActive') === true ? '#1d4ed8' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: watch('isActive') === true ? '#3b82f6' : '#94a3b8',
                    boxShadow: watch('isActive') === true ? '0 0 8px #3b82f6' : 'none'
                  }}></span>
                  Đang bật
                </button>
                <button
                  type="button"
                  onClick={() => setValue('isActive', false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: '2px solid',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: watch('isActive') === false ? '700' : '500',
                    backgroundColor: watch('isActive') === false ? '#fff1f2' : '#ffffff',
                    borderColor: watch('isActive') === false ? '#f43f5e' : '#e2e8f0',
                    color: watch('isActive') === false ? '#be123c' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: watch('isActive') === false ? '#f43f5e' : '#94a3b8'
                  }}></span>
                  Tạm tắt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions (Fixed Footer) */}
        <div
          className="flex justify-end items-center space-x-3 pt-4 mt-2 border-t border-slate-100 bg-white sticky bottom-0"
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '12px' }}
        >
          {serverError && (
            <div className="flex-1 text-left">
              <p className="text-xs text-rose-600 font-bold">⚠️ {serverError}</p>
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isExerciseAcceptsQuestions}
            loading={isSubmitting}
            className="px-8 rounded-xl shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật câu hỏi' : 'Tạo câu hỏi'}
          </Button>
        </div>
      </form>
    </Modal >
  );
}
