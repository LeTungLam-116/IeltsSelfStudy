import { useState, useEffect } from 'react';
import { type QuestionDto, type CreateQuestionRequest, type UpdateQuestionRequest } from '../../api/questionsApi';

interface QuestionFormProps {
  question?: QuestionDto | null;
  exerciseId: number;
  skill: string;
  onSubmit: (data: CreateQuestionRequest | UpdateQuestionRequest) => Promise<void>;
  onCancel: () => void;
}

const QUESTION_TYPES = [
  { value: 'MultipleChoice', label: 'Multiple Choice' },
  { value: 'TrueFalse', label: 'True/False' },
  { value: 'ShortAnswer', label: 'Short Answer' },
  { value: 'Essay', label: 'Essay' },
];

export default function QuestionForm({
  question,
  exerciseId,
  skill,
  onSubmit,
  onCancel
}: QuestionFormProps) {
  const [formData, setFormData] = useState({
    skill: skill,
    exerciseId: exerciseId,
    questionNumber: 1,
    questionText: '',
    questionType: 'MultipleChoice',
    correctAnswer: '',
    points: 1.0,
    optionsJson: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (question) {
      // Editing existing question
      setFormData({
        skill: question.skill,
        exerciseId: question.exerciseId,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        questionType: question.questionType,
        correctAnswer: question.correctAnswer,
        points: question.points,
        optionsJson: question.optionsJson || '',
        isActive: question.isActive,
      });
    } else {
      // Creating new question - find next question number
      setFormData(prev => ({
        ...prev,
        questionNumber: Math.max(1, ...[]), // TODO: Get max question number from API
      }));
    }
  }, [question, skill, exerciseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        skill: formData.skill,
        exerciseId: formData.exerciseId,
        questionNumber: formData.questionNumber,
        questionText: formData.questionText,
        questionType: formData.questionType,
        correctAnswer: formData.correctAnswer,
        points: formData.points,
        optionsJson: formData.optionsJson || undefined,
        ...(question && { isActive: formData.isActive }),
      };

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
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
             type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const getPlaceholderForAnswer = () => {
    switch (formData.questionType) {
      case 'MultipleChoice':
        return 'Enter the correct option (e.g., A, B, C, D)';
      case 'TrueFalse':
        return 'Enter "True" or "False"';
      case 'ShortAnswer':
        return 'Enter the expected answer';
      case 'Essay':
        return 'Enter sample answer or leave empty for manual grading';
      default:
        return 'Enter the correct answer';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {skill.charAt(0).toUpperCase() + skill.slice(1)} Exercise • Question #{formData.questionNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Question Number</label>
              <input
                type="number"
                name="questionNumber"
                value={formData.questionNumber}
                onChange={handleChange}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Question Type</label>
              <select
                name="questionType"
                value={formData.questionType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {QUESTION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Text</label>
            <textarea
              name="questionText"
              value={formData.questionText}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the question text..."
              required
            />
          </div>

          {/* Answer and Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
              <input
                type="text"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={getPlaceholderForAnswer()}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Points</label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Options JSON (for multiple choice) */}
          {formData.questionType === 'MultipleChoice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Options JSON
                <span className="text-xs text-gray-500 ml-2">
                  (Format: ["Option A", "Option B", "Option C", "Option D"])
                </span>
              </label>
              <textarea
                name="optionsJson"
                value={formData.optionsJson}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder='["Option A", "Option B", "Option C", "Option D"]'
              />
            </div>
          )}

          {/* Active status (only for editing) */}
          {question && (
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
                Question is active
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
              {loading ? 'Saving...' : (question ? 'Update Question' : 'Create Question')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
