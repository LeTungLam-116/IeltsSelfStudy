import React from 'react';
import type { Exercise } from '../../types';
import { Card, Button, Badge } from '../ui';
import { IconDocument, IconBook, IconEdit, IconBell } from '../icons';
import StartButtonWrapper from './StartButtonWrapper';

interface ExerciseCardProps {
  exercise: Exercise;
  showStartButton?: boolean;
  onStart?: (exerciseId: number) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  showStartButton = true,
  onStart
}) => {
  const getSkillIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'listening':
        return <IconDocument />;
      case 'reading':
        return <IconBook />;
      case 'writing':
        return <IconEdit />;
      case 'speaking':
        return <IconBell />;
      default:
        return <IconDocument />;
    }
  };

  const getSkillColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'listening':
        return 'bg-blue-100 text-blue-800';
      case 'reading':
        return 'bg-green-100 text-green-800';
      case 'writing':
        return 'bg-purple-100 text-purple-800';
      case 'speaking':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <Card hover className="h-full group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-teal-100/50 hover:-translate-y-1 border border-gray-100 hover:border-teal-200">
      {/* Header with icon and badges */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getSkillColor(exercise.type).replace('text-', 'bg-').replace('-800', '-100').replace('-100', '-50')} transition-colors group-hover:scale-110`}>
            <span className="text-xl">{getSkillIcon(exercise.type)}</span>
          </div>
          <Badge className={`${getSkillColor(exercise.type)} font-medium`}>
            {exercise.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {exercise.level && (
            <Badge variant="outline" className="text-xs">
              {exercise.level}
            </Badge>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            exercise.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {exercise.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-700 transition-colors leading-tight">
        {exercise.title}
      </h3>

      {/* Description */}
      {exercise.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {exercise.description}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-2">
              <IconDocument className="w-4 h-4" />
              <span className="font-medium">
                {exercise.type === 'Writing' && 'Writing Task'}
                {exercise.type === 'Speaking' && 'Speaking Part'}
                {(exercise.type === 'Listening' || exercise.type === 'Reading') &&
                  `${exercise.questionCount || 0} questions`}
              </span>
            </span>
            {exercise.durationSeconds && (
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 7v6l4 2"/>
                </svg>
                <span className="font-medium">{formatDuration(exercise.durationSeconds)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress indicator for visual appeal */}
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-teal-500 h-1.5 rounded-full transition-all duration-500 group-hover:bg-teal-600" style={{width: '0%'}}></div>
        </div>
      </div>

      {/* Start Button */}
      {showStartButton && (
        <div className="mt-auto pt-2">
          {onStart ? (
            <Button
              onClick={() => onStart(exercise.id)}
              fullWidth
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                Start Exercise
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Button>
          ) : (
            <StartButtonWrapper exercise={exercise}>
              <Button
                fullWidth
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Exercise
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Button>
            </StartButtonWrapper>
          )}
        </div>
      )}
    </Card>
  );
};

export default ExerciseCard;
