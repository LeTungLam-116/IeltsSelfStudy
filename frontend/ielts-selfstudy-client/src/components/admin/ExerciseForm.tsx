import { useState, useEffect } from 'react';
import type { WritingExerciseDto, CreateWritingExerciseRequest, UpdateWritingExerciseRequest } from '../../api/writingExerciseApi';
import type { SpeakingExerciseDto, CreateSpeakingExerciseRequest, UpdateSpeakingExerciseRequest } from '../../api/speakingExerciseApi';
import type { ListeningExerciseDto, CreateListeningExerciseRequest, UpdateListeningExerciseRequest } from '../../api/listeningExerciseApi';
import type { ReadingExerciseDto, CreateReadingExerciseRequest, UpdateReadingExerciseRequest } from '../../api/readingExerciseApi';

type ExerciseType = 'writing' | 'speaking' | 'listening' | 'reading';
type ExerciseDto = WritingExerciseDto | SpeakingExerciseDto | ListeningExerciseDto | ReadingExerciseDto;

interface ExerciseFormProps {
  exerciseType: ExerciseType;
  exercise?: ExerciseDto | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const WRITING_TASK_TYPES = ['Task1', 'Task2'];
const SPEAKING_PARTS = ['Part1', 'Part2', 'Part3'];

export default function ExerciseForm({ exerciseType, exercise, onSubmit, onCancel }: ExerciseFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize form data based on exercise type and existing exercise
    if (exercise) {
      // Editing existing exercise
      const baseData = {
        title: exercise.title,
        description: (exercise as any).description || '',
        level: (exercise as any).level || 'Beginner',
        isActive: (exercise as any).isActive !== false, // Default to true
      };

      switch (exerciseType) {
        case 'writing':
          const writingEx = exercise as WritingExerciseDto;
          setFormData({
            ...baseData,
            taskType: writingEx.taskType,
            question: writingEx.question,
            topic: writingEx.topic || '',
            minWordCount: writingEx.minWordCount,
            sampleAnswer: writingEx.sampleAnswer || '',
          });
          break;
        case 'speaking':
          const speakingEx = exercise as SpeakingExerciseDto;
          setFormData({
            ...baseData,
            part: speakingEx.part,
            question: speakingEx.question,
            topic: speakingEx.topic || '',
            tips: speakingEx.tips || '',
          });
          break;
        case 'listening':
          const listeningEx = exercise as ListeningExerciseDto;
          setFormData({
            ...baseData,
            audioUrl: listeningEx.audioUrl,
            transcript: listeningEx.transcript || '',
            questionCount: listeningEx.questionCount,
            durationSeconds: listeningEx.durationSeconds || '',
          });
          break;
        case 'reading':
          const readingEx = exercise as ReadingExerciseDto;
          setFormData({
            ...baseData,
            passageText: readingEx.passageText,
            questionCount: readingEx.questionCount,
          });
          break;
      }
    } else {
      // Creating new exercise
      const baseData = {
        title: '',
        description: '',
        level: 'Beginner',
        isActive: true,
      };

      switch (exerciseType) {
        case 'writing':
          setFormData({
            ...baseData,
            taskType: 'Task2',
            question: '',
            topic: '',
            minWordCount: 250,
            sampleAnswer: '',
          });
          break;
        case 'speaking':
          setFormData({
            ...baseData,
            part: 'Part1',
            question: '',
            topic: '',
            tips: '',
          });
          break;
        case 'listening':
          setFormData({
            ...baseData,
            audioUrl: '',
            transcript: '',
            questionCount: 0,
            durationSeconds: '',
          });
          break;
        case 'reading':
          setFormData({
            ...baseData,
            passageText: '',
            questionCount: 0,
          });
          break;
      }
    }
  }, [exercise, exerciseType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert form data to the correct request type
      let submitData: any;

      switch (exerciseType) {
        case 'writing':
          submitData = {
            title: formData.title,
            description: formData.description || undefined,
            taskType: formData.taskType,
            question: formData.question,
            topic: formData.topic || undefined,
            level: formData.level,
            minWordCount: parseInt(formData.minWordCount),
            sampleAnswer: formData.sampleAnswer || undefined,
            ...(exercise && { isActive: formData.isActive }),
          };
          break;
        case 'speaking':
          submitData = {
            title: formData.title,
            description: formData.description || undefined,
            part: formData.part,
            question: formData.question,
            topic: formData.topic || undefined,
            level: formData.level,
            tips: formData.tips || undefined,
            ...(exercise && { isActive: formData.isActive }),
          };
          break;
        case 'listening':
          submitData = {
            title: formData.title,
            description: formData.description || undefined,
            audioUrl: formData.audioUrl,
            transcript: formData.transcript || undefined,
            level: formData.level,
            questionCount: parseInt(formData.questionCount),
            durationSeconds: formData.durationSeconds ? parseInt(formData.durationSeconds) : undefined,
            ...(exercise && { isActive: formData.isActive }),
          };
          break;
        case 'reading':
          submitData = {
            title: formData.title,
            description: formData.description || undefined,
            passageText: formData.passageText,
            level: formData.level,
            questionCount: parseInt(formData.questionCount),
            ...(exercise && { isActive: formData.isActive }),
          };
          break;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const renderWritingFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Task Type</label>
          <select
            name="taskType"
            value={formData.taskType}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {WRITING_TASK_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Min Word Count</label>
          <input
            type="number"
            name="minWordCount"
            value={formData.minWordCount}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Question</label>
        <textarea
          name="question"
          value={formData.question}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Topic (Optional)</label>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Sample Answer (Optional)</label>
        <textarea
          name="sampleAnswer"
          value={formData.sampleAnswer}
          onChange={handleChange}
          rows={6}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </>
  );

  const renderSpeakingFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Part</label>
          <select
            name="part"
            value={formData.part}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {SPEAKING_PARTS.map(part => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        </div>
        <div></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Question</label>
        <textarea
          name="question"
          value={formData.question}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Topic (Optional)</label>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tips (Optional)</label>
        <textarea
          name="tips"
          value={formData.tips}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </>
  );

  const renderListeningFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Audio URL</label>
        <input
          type="url"
          name="audioUrl"
          value={formData.audioUrl}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Count</label>
          <input
            type="number"
            name="questionCount"
            value={formData.questionCount}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
          <input
            type="number"
            name="durationSeconds"
            value={formData.durationSeconds}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Transcript (Optional)</label>
        <textarea
          name="transcript"
          value={formData.transcript}
          onChange={handleChange}
          rows={6}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </>
  );

  const renderReadingFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Count</label>
          <input
            type="number"
            name="questionCount"
            value={formData.questionCount}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Passage Text</label>
        <textarea
          name="passageText"
          value={formData.passageText}
          onChange={handleChange}
          rows={8}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {exercise ? 'Edit' : 'Create'} {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Exercise
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type-specific fields */}
          {exerciseType === 'writing' && renderWritingFields()}
          {exerciseType === 'speaking' && renderSpeakingFields()}
          {exerciseType === 'listening' && renderListeningFields()}
          {exerciseType === 'reading' && renderReadingFields()}

          {/* Active status (only for editing) */}
          {exercise && (
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active (visible to students)
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (exercise ? 'Update' : 'Create')} Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
