import React, { useEffect, useState } from 'react';
import type { Exercise } from '../../types';
import { Card, Button, Loading } from '../ui';

interface Question {
  id: number;
  text: string;
  options?: string[];
  type?: string;
}

interface ExercisePlayerProps {
  exercise: Exercise;
  questions: Question[];
  answers: Record<number, string>;
  timeRemaining: number;
  isLoading?: boolean;
  onAnswerChange: (questionId: number, answer: string) => void;
  onSubmit: () => void;
  onTimeUp: () => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exercise,
  questions,
  answers,
  timeRemaining,
  isLoading = false,
  onAnswerChange,
  onSubmit,
  onTimeUp
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      if (timeRemaining <= 1) {
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmit();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="p-8">
            <Loading size="lg" text="Loading exercise..." />
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-600">No questions available for this exercise.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
              <p className="text-gray-600 mt-1">{exercise.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-blue-600">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-500">Time Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </Card>

      {/* Question Card */}
      <Card>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Question {currentQuestionIndex + 1}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {currentQuestion.text}
            </p>
          </div>

          {/* Answer Options */}
          {currentQuestion.options && currentQuestion.options.length > 0 && (
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
                const isSelected = answers[currentQuestion.id] === optionLetter;

                return (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={optionLetter}
                      checked={isSelected}
                      onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium mr-3 text-gray-600">{optionLetter}.</span>
                    <span className="flex-1">{option}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Text Input for open-ended questions */}
          {!currentQuestion.options && (
            <div className="mb-6">
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="flex space-x-3">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitted}
                  variant="primary"
                >
                  {isSubmitted ? 'Submitting...' : 'Submit Exercise'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Question Navigation */}
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Question Navigation</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const isAnswered = answers[questions[index].id];
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`aspect-square rounded border-2 text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : isAnswered
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExercisePlayer;
