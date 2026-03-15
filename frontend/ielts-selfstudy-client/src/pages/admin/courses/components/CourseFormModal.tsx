import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Course, CourseFormDataValidated } from '../../../../types/course';
import { Modal, Button, Input } from '../../../../components/ui';
import { COURSE_LEVELS, COURSE_SKILLS, courseFormSchema } from '../../../../types/course';
import { uploadThumbnail } from '../../../../api/coursesApi';

interface CourseFormModalProps {
  isOpen: boolean;
  course?: Course | null;
  onClose: () => void;
  onSubmit: (data: CourseFormDataValidated) => Promise<void>;
}

export function CourseFormModal({ isOpen, course, onClose, onSubmit }: CourseFormModalProps) {
  const isEditing = !!course;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      thumbnailUrl: '',
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
          thumbnailUrl: course.thumbnailUrl || '',
          isActive: course.isActive,
        });
        setPreviewUrl(course.thumbnailUrl || null);
      } else {
        // Create mode - reset to default values
        reset({
          name: '',
          shortDescription: '',
          level: 'Beginner',
          skill: 'All',
          targetBand: undefined,
          price: undefined,
          thumbnailUrl: '',
          isActive: true,
        });
        setPreviewUrl(null);
      }
      setSelectedFile(null);
    }
  }, [isOpen, course, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFormSubmit = async (data: CourseFormDataValidated) => {
    console.log('CourseFormModal - handleFormSubmit called with:', data);
    try {
      let finalThumbnailUrl = data.thumbnailUrl;

      // 1. Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadThumbnail(selectedFile);
          finalThumbnailUrl = uploadedUrl;
        } catch (uploadError) {
          console.error('Failed to upload thumbnail:', uploadError);
          // You might want to show a toast error here
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // 2. Submit course data with final URL
      await onSubmit({
        ...data,
        thumbnailUrl: finalThumbnailUrl
      });

      console.log('CourseFormModal - form submission successful');
      handleClose();
    } catch (error) {
      console.error('CourseFormModal - Form submission error:', error);
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
    setSelectedFile(null);
    setPreviewUrl(null);
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
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '70vh', marginTop: '1.5rem' }}
      >
        <div className="flex-1 overflow-y-auto pr-2 space-y-5 pt-12 pb-2">
          {/* Course Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1.5">
              Tên khóa học *
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nhập tên khóa học..."
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </div>

          {/* Short Description */}
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-bold text-slate-700 mb-1.5">
              Mô tả ngắn
            </label>
            <textarea
              id="shortDescription"
              {...register('shortDescription')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              placeholder="Nhập mô tả tóm tắt về khóa học..."
            />
            {errors.shortDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
            )}
          </div>

          {/* Level and Skill */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-bold text-slate-700 mb-1.5">
                Cấp độ *
              </label>
              <select
                id="level"
                {...register('level')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
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
              <label htmlFor="skill" className="block text-sm font-bold text-slate-700 mb-1.5">
                Kỹ năng *
              </label>
              <select
                id="skill"
                {...register('skill')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
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
              <label htmlFor="targetBand" className="block text-sm font-bold text-slate-700 mb-1.5">
                Target Band
              </label>
              <Input
                id="targetBand"
                type="number"
                step="0.5"
                min="0"
                max="9"
                {...register('targetBand', { valueAsNumber: true })}
                placeholder="Ví dụ: 6.5"
                error={!!errors.targetBand}
                helperText={errors.targetBand?.message}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-bold text-slate-700 mb-1.5">
                Học phí ($)
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
                placeholder="Để trống nếu miễn phí"
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Ảnh khóa học
            </label>
            <div className="flex items-start space-x-4">
              <div
                className="w-32 h-24 flex-shrink-0 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <span className="text-2xl opacity-40 group-hover:opacity-100 transition-opacity">📷</span>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Tải ảnh</p>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors flex items-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <>
                      <span className="mr-2 text-lg">📄</span>
                      <span className="truncate flex-1">
                        Tệp đã chọn: <span className="font-bold text-blue-600">{selectedFile.name}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2 text-lg">📁</span>
                      <span>Chưa có tệp mới. Nhấp để chọn ảnh.</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Khuyên dùng: 800x500px, định dạng PNG/JPG. Tối đa 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500/20 border-slate-300 rounded-md cursor-pointer"
            />
            <label htmlFor="isActive" className="ml-3 block text-sm font-bold text-slate-700 cursor-pointer">
              Kích hoạt khóa học này
            </label>
          </div>
        </div>

        {/* Form Actions (Fixed Footer) */}
        <div
          className="flex justify-end space-x-3 pt-4 mt-2 border-t border-slate-100 bg-white sticky bottom-0"
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '12px' }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
            className="px-6 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || isUploading}
            disabled={isSubmitting || isUploading}
            className="px-8 rounded-xl shadow-lg shadow-blue-500/20"
          >
            {isUploading ? 'Đang tải ảnh...' : isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật khóa học' : 'Tạo khóa học mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
