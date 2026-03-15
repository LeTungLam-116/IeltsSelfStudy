import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminExerciseDto, CreateExerciseFormData, UpdateExerciseFormData, ExerciseType } from '../../../../types/exercise';
import { Modal, Button, Input } from '../../../../components/ui';
import { EXERCISE_TYPES, EXERCISE_LEVELS, createExerciseSchema } from '../../../../types/exercise';
import { uploadAudioFile, uploadImageFile } from '../../../../api/exercisesApi';

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageFileName, setUploadedImageFileName] = useState<string | null>(null);
  // Friendly Cue Card state (Part 2)
  const [cueCardTopic, setCueCardTopic] = useState('');
  const [cueCardBullets, setCueCardBullets] = useState<string[]>(['', '', '']);

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
      chartType: '',
      essayType: '',
      topic: '',
      minWordCount: 250,
      sampleAnswer: '',
      part: 'Part1',
      question: '',
      cueCardJson: '',
      tips: '',
      imageUrl: '',
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
          chartType: exercise.chartType || '',
          essayType: exercise.essayType || '',
          topic: exercise.topic || '',
          minWordCount: exercise.minWordCount || 250,
          sampleAnswer: exercise.sampleAnswer || '',
          part: exercise.part || 'Part1',
          question: exercise.question || '',
          cueCardJson: exercise.cueCardJson || '',
          // Parse cueCardJson into friendly state
          ...((() => {
            if (exercise.cueCardJson) {
              try {
                const card = JSON.parse(exercise.cueCardJson);
                setCueCardTopic(card.topic || '');
                setCueCardBullets(card.bullets?.length ? card.bullets : ['', '', '']);
              } catch { setCueCardTopic(''); setCueCardBullets(['', '', '']); }
            } else {
              setCueCardTopic(''); setCueCardBullets(['', '', '']);
            }
            return {};
          })()),
          tips: exercise.tips || '',
          imageUrl: exercise.imageUrl || '',
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
          chartType: '',
          essayType: '',
          topic: '',
          minWordCount: 250,
          sampleAnswer: '',
          part: 'Part1',
          question: '',
          cueCardJson: '',
          // Reset cue card friendly state
          ...((() => { setCueCardTopic(''); setCueCardBullets(['', '', '']); return {}; })()),
          tips: '',
          imageUrl: '',
        });
        setValue('type', 'Listening' as ExerciseType);
        setSelectedType('Listening');
      }
    }
  }, [isOpen, exercise, reset]);

  const handleFormSubmit = async (data: CreateExerciseFormData) => {
    try {
      // Auto-build cueCardJson from friendly UI state before submitting
      if (data.type === 'Speaking' && data.part === 'Part2') {
        const bullets = cueCardBullets.filter(b => b.trim() !== '');
        if (cueCardTopic.trim() || bullets.length > 0) {
          data.cueCardJson = JSON.stringify({ topic: cueCardTopic.trim(), bullets });
        } else {
          data.cueCardJson = '';
        }
        // For Part 2, use cueCardTopic as the question field (required by backend)
        if (!data.question?.trim() && cueCardTopic.trim()) {
          data.question = cueCardTopic.trim();
        }
      }
      console.log('ExerciseFormModal - submitting data:', data);
      const result = await onSubmit(data);
      console.log('ExerciseFormModal - onSubmit result:', result);
      onClose();
    } catch (error) {
      console.error('ExerciseFormModal - Form submission error:', error);
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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, etc.).');
      return;
    }

    try {
      setIsUploadingImage(true);
      setUploadedImageFileName(file.name);

      // Call API to upload
      const result = await uploadImageFile(file);
      if (result?.url) {
        setValue('imageUrl', result.url);
      }
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
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
      title={isEditing ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
      size="xl"
      trapFocus={true}
      initialFocus="type"
    >
      <form
        onSubmit={handleSubmit(
          handleFormSubmit,
          (formErrors) => {
            console.warn('ExerciseFormModal - validation errors:', formErrors);
            const firstField = Object.keys(formErrors)[0];
            if (firstField) {
              const el = document.getElementById(firstField);
              el?.focus();
            }
          }
        )}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '68vh', marginTop: '2.5rem' }}
      >
        <div className="flex-1 overflow-y-auto pr-3 space-y-6 pt-16 pb-2">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-bold text-slate-700 mb-1.5">
                Loại bài tập *
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
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
              <label htmlFor="level" className="block text-sm font-bold text-slate-700 mb-1.5">
                Cấp độ *
              </label>
              <select
                id="level"
                {...register('level')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
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
            <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-1.5">
              Tiêu đề bài tập *
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ví dụ: IELTS Listening Test 1 - Section 1"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-1.5">
              Mô tả
            </label>
            <Input
              as="textarea"
              id="description"
              {...register('description')}
              placeholder="Nhập mô tả bài tập (không bắt buộc)"
              rows={2}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </div>

          {/* Question Count & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            {['Listening', 'Reading'].includes(selectedType) && isEditing ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Số lượng câu hỏi
                </label>
                <div className="text-xl font-bold text-blue-600">
                  {exercise?.questionCount ?? 0} câu
                </div>
                <p className="mt-1 text-[11px] text-slate-500 italic">
                  Tự động cập nhật khi thêm/xóa câu hỏi.
                </p>
              </div>
            ) : (
              <div className="flex flex-col justify-center">
                <p className="text-sm font-medium text-slate-500 italic">Thông tin bổ trợ</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Trạng thái hiển thị *
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
                  Đang hoạt động
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
                  Tạm dừng
                </button>
              </div>
            </div>
          </div>

          {/* Type-Specific Fields */}
          {selectedType === 'Listening' && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mr-3 text-sm">🎧</span>
                Chi tiết bài nghe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tệp âm thanh *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 transition-all relative ${isUploading ? 'bg-slate-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      {!watch('audioUrl') && !isUploading && (
                        <div className="space-y-2">
                          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl font-bold">
                            +
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Nhấp để tải tệp nghe lên</p>
                            <p className="text-xs text-slate-500 mt-1">MP3, WAV, M4A (Tối đa 20MB)</p>
                          </div>
                        </div>
                      )}

                      {isUploading && (
                        <div className="space-y-3 w-full max-w-xs">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                          <p className="text-sm text-slate-600 font-bold">Đang tải tệp lên...</p>
                        </div>
                      )}

                      {watch('audioUrl') && !isUploading && (
                        <div className="w-full space-y-4">
                          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="flex items-center truncate">
                              <span className="text-emerald-500 mr-2 text-lg">✅</span>
                              <span className="text-sm font-bold text-emerald-700 truncate">
                                {uploadedFileName || 'Tệp đã sẵn sàng'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setValue('audioUrl', '');
                                setUploadedFileName(null);
                              }}
                              className="text-xs text-rose-600 hover:underline font-bold"
                            >
                              Thay đổi
                            </button>
                          </div>
                          <audio controls src={watch('audioUrl')} className="w-full h-10" />
                        </div>
                      )}

                      <input
                        type="file"
                        id="audio-upload"
                        accept="audio/*"
                        onChange={handleAudioFileChange}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                          width: '100%',
                          height: '100%',
                          zIndex: 10
                        }}
                        title=""
                      />
                    </div>
                  </div>
                  {errors.audioUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.audioUrl.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="durationSeconds" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Thời lượng (giây)
                  </label>
                  <Input
                    id="durationSeconds"
                    type="number"
                    min="1"
                    {...register('durationSeconds', {
                      valueAsNumber: true,
                      setValueAs: (v) => {
                        if (v === '' || v === null || v === undefined) return undefined;
                        const n = Number(v);
                        return Number.isNaN(n) ? undefined : n;
                      },
                    })}
                    placeholder="Ví dụ: 180"
                    error={!!errors.durationSeconds}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="transcript" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Transcript (Bản ghi âm)
                </label>
                <Input
                  as="textarea"
                  id="transcript"
                  {...register('transcript')}
                  placeholder="Nhập nội dung transcript..."
                  rows={4}
                  error={!!errors.transcript}
                />
              </div>
            </div>
          )}

          {selectedType === 'Reading' && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mr-3 text-sm">📖</span>
                Chi tiết bài đọc
              </h3>
              <div>
                <label htmlFor="passageText" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Nội dung bài đọc (Passage) *
                </label>
                <Input
                  as="textarea"
                  id="passageText"
                  {...register('passageText')}
                  placeholder="Nhập nội dung văn bản bài đọc..."
                  rows={8}
                  error={!!errors.passageText}
                />
              </div>
            </div>
          )}

          {selectedType === 'Writing' && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mr-3 text-sm">✍️</span>
                Chi tiết bài viết
              </h3>
              <div>
                <label htmlFor="taskType" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Loại Task *
                </label>
                <select
                  id="taskType"
                  {...register('taskType')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                >
                  <option value="Task1">Task 1</option>
                  <option value="Task2">Task 2</option>
                </select>
              </div>

              {/* Chart Type - chỉ hiện khi Task 1 */}
              {watch('taskType') === 'Task1' && (
                <div>
                  <label htmlFor="chartType" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Loại biểu đồ (Chart Type)
                  </label>
                  <select
                    id="chartType"
                    {...register('chartType')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="">-- Chọn loại --</option>
                    <option value="LineGraph">Line Graph</option>
                    <option value="BarChart">Bar Chart</option>
                    <option value="PieChart">Pie Chart</option>
                    <option value="Table">Table</option>
                    <option value="Map">Map</option>
                    <option value="Process">Process Diagram</option>
                  </select>
                </div>
              )}

              {/* Essay Type - chỉ hiện khi Task 2 */}
              {watch('taskType') === 'Task2' && (
                <div>
                  <label htmlFor="essayType" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Loại bài luận (Essay Type)
                  </label>
                  <select
                    id="essayType"
                    {...register('essayType')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="">-- Chọn loại --</option>
                    <option value="Opinion">Opinion (Agree/Disagree)</option>
                    <option value="Discussion">Discussion (Both views)</option>
                    <option value="ProblemSolution">Problem-Solution</option>
                    <option value="TwoPart">Two-part Question</option>
                    <option value="Advantages">Advantages-Disadvantages</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minWordCount" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Số từ tối thiểu
                  </label>
                  <Input
                    id="minWordCount"
                    type="number"
                    min="1"
                    {...register('minWordCount', { valueAsNumber: true })}
                    placeholder="Ví dụ: 250"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="topic" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Chủ đề (Topic)
                </label>
                <Input
                  id="topic"
                  {...register('topic')}
                  placeholder="Nhập chủ đề..."
                />
              </div>
              <div>
                <label htmlFor="sampleAnswer" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Bài mẫu (Sample Answer)
                </label>
                <Input
                  as="textarea"
                  id="sampleAnswer"
                  {...register('sampleAnswer')}
                  placeholder="Nhập bài mẫu tham khảo..."
                  rows={6}
                />
              </div>

              {/* Image Upload for Task 1 */}
              {watch('taskType') === 'Task1' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Hình ảnh biểu đồ (Task 1)
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 transition-all relative ${isUploadingImage ? 'bg-slate-50 border-purple-200' : 'bg-white border-slate-200 hover:border-purple-400 hover:bg-purple-50/30'
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      {!watch('imageUrl') && !isUploadingImage && (
                        <div className="space-y-2">
                          <div className="mx-auto w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-xl font-bold">
                            📊
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Nhấp để tải hình ảnh lên</p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP (Tối đa 5MB)</p>
                          </div>
                        </div>
                      )}

                      {isUploadingImage && (
                        <div className="space-y-3 w-full max-w-xs">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          </div>
                          <p className="text-sm text-slate-600 font-bold">Đang tải hình ảnh...</p>
                        </div>
                      )}

                      {watch('imageUrl') && !isUploadingImage && (
                        <div className="w-full space-y-4">
                          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="flex items-center truncate">
                              <span className="text-emerald-500 mr-2 text-lg">✅</span>
                              <span className="text-sm font-bold text-emerald-700 truncate">
                                {uploadedImageFileName || 'Hình ảnh đã sẵn sàng'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setValue('imageUrl', '');
                                setUploadedImageFileName(null);
                              }}
                              className="text-xs text-rose-600 hover:underline font-bold"
                            >
                              Thay đổi
                            </button>
                          </div>
                          <img src={watch('imageUrl')} alt="Task 1 Preview" className="w-full h-auto max-h-48 object-contain rounded-lg border" />
                        </div>
                      )}

                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                          width: '100%',
                          height: '100%',
                          zIndex: 10
                        }}
                        title=""
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedType === 'Speaking' && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mr-3 text-sm">🗣️</span>
                Chi tiết bài nói
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="part" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Phần (Part) *
                  </label>
                  <select
                    id="part"
                    {...register('part')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="Part1">Part 1</option>
                    <option value="Part2">Part 2</option>
                    <option value="Part3">Part 3</option>
                  </select>
                </div>
              </div>
              {watch('part') !== 'Part2' && (
                <div>
                  <label htmlFor="question" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Câu hỏi / Yêu cầu *
                  </label>
                  <Input
                    as="textarea"
                    id="question"
                    {...register('question')}
                    placeholder="Nhập câu hỏi..."
                    rows={3}
                    error={!!errors.question}
                  />
                </div>
              )}

              {watch('part') === 'Part2' && (
                <div className="space-y-3 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                    <span>🃏</span> Nội dung Cue Card (Part 2)
                  </h4>
                  {/* Topic */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Chủ đề chính (Topic)</label>
                    <input
                      type="text"
                      value={cueCardTopic}
                      onChange={e => setCueCardTopic(e.target.value)}
                      placeholder="Ví dụ: Describe your favorite food"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                    />
                  </div>
                  {/* Bullets */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Gợi ý (You should say...)</label>
                    <div className="space-y-2">
                      {cueCardBullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold text-sm w-5 text-center">{idx + 1}.</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={e => {
                              const next = [...cueCardBullets];
                              next[idx] = e.target.value;
                              setCueCardBullets(next);
                            }}
                            placeholder={`Gợi ý ${idx + 1}...`}
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                          />
                          {cueCardBullets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setCueCardBullets(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCueCardBullets(prev => [...prev, ''])}
                      className="mt-2 text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                      Thêm gợi ý
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="tips" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Mẹo & Hướng dẫn
                </label>
                <Input
                  as="textarea"
                  id="tips"
                  {...register('tips')}
                  placeholder="Nhập hướng dẫn làm bài..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Hidden inputs to ensure files are submitted */}
        <input type="hidden" {...register('imageUrl')} />
        <input type="hidden" {...register('audioUrl')} />

        {/* Form Actions (Fixed Footer) */}
        <div
          className="flex justify-end space-x-3 pt-4 mt-2 border-t border-slate-100 bg-white sticky bottom-0"
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '12px' }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="px-8 rounded-xl shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}