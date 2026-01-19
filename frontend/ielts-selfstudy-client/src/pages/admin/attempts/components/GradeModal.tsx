import React, { useState, memo } from 'react';
import { IconCheck, IconX } from '../../../../components/icons';
import { Button, Modal, Input } from '../../../../components/ui';
import { Textarea } from '../../../../components/ui/Textarea';
import { gradeAttempt } from '../../../../api/attemptsApi';
import type { AttemptDto, GradeAttemptRequestDto } from '../../../../types/attempts';

export interface GradeModalProps {
  attempt: AttemptDto | null;
  isOpen: boolean;
  onClose: () => void;
  onGraded: (updatedAttempt: AttemptDto) => void;
}

const GradeModal = memo(function GradeModal({
  attempt,
  isOpen,
  onClose,
  onGraded
}: GradeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<GradeAttemptRequestDto>({
    score: 0,
    maxScore: 9,
    feedback: '',
    isPassed: false,
    internalNotes: ''
  });

  // Reset form when modal opens with new attempt
  React.useEffect(() => {
    if (attempt && isOpen) {
      setFormData({
        score: attempt.score || 0,
        maxScore: attempt.maxScore || 9,
        feedback: attempt.aiFeedback || '',
        isPassed: attempt.score && attempt.maxScore ? (attempt.score / attempt.maxScore) >= 0.5 : false,
        internalNotes: attempt.gradingNotes || ''
      });
    }
  }, [attempt, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!attempt) return;

    try {
      setIsSubmitting(true);

      // Validate score
      if (formData.score < 0 || formData.score > formData.maxScore) {
        alert(`Score must be between 0 and ${formData.maxScore}`);
        return;
      }

      const updatedAttempt = await gradeAttempt(attempt.id, formData);
      onGraded(updatedAttempt);
      onClose();
    } catch (error) {
      console.error('Failed to grade attempt:', error);
      alert('Failed to grade attempt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, feedback: e.target.value }));
  };

  const handleInternalNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, internalNotes: e.target.value }));
  };

  const handleMaxScoreChange = (maxScore: number) => {
    const isPassed = maxScore > 0 && (formData.score / maxScore) >= 0.5;
    setFormData(prev => ({ ...prev, maxScore, isPassed }));
  };

  if (!attempt) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Grade Attempt - ${attempt.userName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Attempt Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Attempt Summary</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>User:</strong> {attempt.userName} ({attempt.userEmail})</p>
            <p><strong>Exercise:</strong> {attempt.exerciseTitle} ({attempt.skill})</p>
            <p><strong>Submitted:</strong> {new Date(attempt.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* User Answer Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Answer
          </label>
          <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {attempt.userAnswerJson ? JSON.parse(attempt.userAnswerJson) : 'No answer provided'}
            </p>
          </div>
        </div>

        {/* Grading Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
              Score
            </label>
            <Input
              id="score"
              type="number"
              min="0"
              max={formData.maxScore}
              value={formData.score}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, score: Number(e.target.value) }))}
              required
            />
          </div>

          <div>
            <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-1">
              Max Score
            </label>
            <Input
              id="maxScore"
              type="number"
              min="1"
              value={formData.maxScore}
              onChange={handleMaxScoreChange}
              required
            />
          </div>
        </div>

        {/* Pass/Fail Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="isPassed"
                checked={formData.isPassed}
                onChange={() => setFormData(prev => ({ ...prev, isPassed: true }))}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <IconCheck className="w-4 h-4 text-green-600 mr-1" />
                Passed
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="isPassed"
                checked={!formData.isPassed}
                onChange={() => setFormData(prev => ({ ...prev, isPassed: false }))}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <IconX className="w-4 h-4 text-red-600 mr-1" />
                Failed
              </span>
            </label>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Feedback (visible to user)
          </label>
          <Textarea
            id="feedback"
            value={formData.feedback}
            onChange={handleFeedbackChange}
            placeholder="Provide constructive feedback to help the student improve..."
            rows={4}
          />
        </div>

        {/* Internal Notes */}
        <div>
          <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Internal Notes (admin only)
          </label>
          <Textarea
            id="internalNotes"
            value={formData.internalNotes}
            onChange={handleInternalNotesChange}
            placeholder="Internal notes for other administrators..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Grading...' : 'Submit Grade'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

GradeModal.displayName = 'GradeModal';

export default GradeModal;
