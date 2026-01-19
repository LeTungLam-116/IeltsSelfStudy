import type { AdminExerciseDto } from '../../../../types/exercise';
import { TableWrapper } from '../../../../components/ui';
import { IconNote } from '../../../../components/icons';

interface ExerciseTableProps {
  exercises: AdminExerciseDto[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (selectAll: boolean) => void;
  onEditExercise: (exercise: AdminExerciseDto) => void;
  onDeleteExercise: (id: number) => void;
  onViewDetails: (exercise: AdminExerciseDto) => void;
  isLoading?: boolean;
}

export function ExerciseTable({
  exercises,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEditExercise,
  onDeleteExercise,
  onViewDetails,
  isLoading = false
}: ExerciseTableProps) {
  const allSelected = exercises.length > 0 && selectedIds.length === exercises.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < exercises.length;

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  const handleRowSelect = (id: number) => {
    onToggleSelect(id);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Listening': return 'bg-blue-100 text-blue-800';
      case 'Reading': return 'bg-green-100 text-green-800';
      case 'Writing': return 'bg-purple-100 text-purple-800';
      case 'Speaking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-span-4">Exercise</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1">Level</div>
            <div className="col-span-1">Questions</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-4 flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="ml-4">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1">
                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1 flex space-x-2">
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl"><IconNote /></span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Exercises Found</h3>
          <p className="text-gray-600">
            There are no exercises to display.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TableWrapper className="bg-white rounded-lg shadow overflow-hidden" >
      {/* Table Header */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200" role="rowgroup" aria-label="Table header">
        <div className="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="row">
          <div className="col-span-1" role="columnheader">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Select all exercises"
            />
          </div>
          <div className="col-span-4">Exercise</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-1">Level</div>
          <div className="col-span-1">Questions</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200" role="rowgroup" aria-label="Table body">
        {exercises.map((exercise) => (
          <div key={exercise.id} role="row" className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 border-b border-gray-200">
            {/* Checkbox */}
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(exercise.id)}
                onChange={() => handleRowSelect(exercise.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                aria-label={`Select exercise ${exercise.title || 'Untitled'}`}
              />
            </div>

            {/* Exercise Info */}
            <div className="col-span-4 flex items-center" role="cell">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                  {exercise.type.charAt(0)}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {exercise.title || 'Untitled Exercise'}
                </div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {exercise.description || 'No description'}
                </div>
              </div>
            </div>

            {/* Type */}
            <div className="col-span-2" role="cell">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(exercise.type)}`}>
                {exercise.type}
              </span>
            </div>

            {/* Level */}
            <div className="col-span-1" role="cell">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(exercise.level || '')}`}>
                {exercise.level || 'N/A'}
              </span>
            </div>

            {/* Questions Count */}
            <div className="col-span-1 text-sm text-gray-900" role="cell">
              {exercise.type === 'Writing' && (exercise.taskType || 'Task')}
              {exercise.type === 'Speaking' && (exercise.part || 'Part')}
              {(exercise.type === 'Listening' || exercise.type === 'Reading') &&
                (exercise.questionCount || 0)}
            </div>

            {/* Status */}
            <div className="col-span-2" role="cell">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                exercise.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {exercise.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex space-x-1" role="cell">
              <button
                onClick={() => onViewDetails(exercise)}
                className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 rounded hover:bg-blue-50"
                aria-label={`View details for ${exercise.title || 'Untitled'}`}
                title="View Details"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3" strokeWidth="2"/></svg>
              </button>
              <button
                onClick={() => onEditExercise(exercise)}
                className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 rounded hover:bg-blue-50"
                aria-label={`Edit exercise ${exercise.title || 'Untitled'}`}
                title="Edit"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h6l2 2v6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15l-9 9-9-9 9-9 9 9z"/></svg>
              </button>
              <button
                onClick={() => onDeleteExercise(exercise.id)}
                className="text-red-600 hover:text-red-900 text-xs px-2 py-1 rounded hover:bg-red-50"
                aria-label={`Delete exercise ${exercise.title || 'Untitled'}`}
                title="Delete"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </TableWrapper>
  );
}