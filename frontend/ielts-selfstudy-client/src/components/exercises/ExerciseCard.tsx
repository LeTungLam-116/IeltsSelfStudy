import React from 'react';
import { Link } from 'react-router-dom';
import type { Exercise } from '../../types';
import { Card, Button, Badge } from '../ui';

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
        return '🎧';
      case 'reading':
        return '📖';
      case 'writing':
        return '✍️';
      case 'speaking':
        return '🎤';
      default:
        return '📝';
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
    <Card hover className="h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getSkillIcon(exercise.type)}</span>
          <Badge className={getSkillColor(exercise.type)}>
            {exercise.type}
          </Badge>
        </div>
        {exercise.level && (
          <Badge variant="outline">
            {exercise.level}
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {exercise.title}
      </h3>

      {exercise.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {exercise.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span>📋</span>
            <span>{exercise.questionCount} questions</span>
          </span>
          {exercise.durationSeconds && (
            <span className="flex items-center space-x-1">
              <span>⏱️</span>
              <span>{formatDuration(exercise.durationSeconds)}</span>
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          exercise.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {exercise.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {showStartButton && (
        <div className="mt-auto">
          {onStart ? (
            <Button
              onClick={() => onStart(exercise.id)}
              fullWidth
              size="sm"
            >
              Start Exercise
            </Button>
          ) : (
            <Link to={`/${exercise.type.toLowerCase()}/${exercise.id}`}>
              <Button fullWidth size="sm">
                Start Exercise
              </Button>
            </Link>
          )}
        </div>
      )}
    </Card>
  );
};

export default ExerciseCard;
