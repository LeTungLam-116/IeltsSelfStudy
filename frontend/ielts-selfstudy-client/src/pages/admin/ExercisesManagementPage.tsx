import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWritingExercises, type WritingExerciseDto, createWritingExercise, updateWritingExercise, deleteWritingExercise, type CreateWritingExerciseRequest, type UpdateWritingExerciseRequest } from '../../api/writingExerciseApi';
import { getSpeakingExercises, type SpeakingExerciseDto, createSpeakingExercise, updateSpeakingExercise, deleteSpeakingExercise, type CreateSpeakingExerciseRequest, type UpdateSpeakingExerciseRequest } from '../../api/speakingExerciseApi';
import { getListeningExercises, type ListeningExerciseDto, createListeningExercise, updateListeningExercise, deleteListeningExercise, type CreateListeningExerciseRequest, type UpdateListeningExerciseRequest } from '../../api/listeningExerciseApi';
import { getReadingExercises, type ReadingExerciseDto, createReadingExercise, updateReadingExercise, deleteReadingExercise, type CreateReadingExerciseRequest, type UpdateReadingExerciseRequest } from '../../api/readingExerciseApi';
import ExerciseForm from '../../components/admin/ExerciseForm';

type ExerciseType = 'writing' | 'speaking' | 'listening' | 'reading';
type ExerciseDto = WritingExerciseDto | SpeakingExerciseDto | ListeningExerciseDto | ReadingExerciseDto;

export default function ExercisesManagementPage() {
  const [activeTab, setActiveTab] = useState<ExerciseType>('writing');
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseDto | null>(null);

  const tabs = [
    { id: 'writing' as ExerciseType, label: 'Writing Exercises', icon: '✏️' },
    { id: 'speaking' as ExerciseType, label: 'Speaking Exercises', icon: '🎤' },
    { id: 'listening' as ExerciseType, label: 'Listening Exercises', icon: '🎧' },
    { id: 'reading' as ExerciseType, label: 'Reading Exercises', icon: '📖' },
  ];

  useEffect(() => {
    loadExercises();
  }, [activeTab]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      let data: ExerciseDto[];
      switch (activeTab) {
        case 'writing':
          data = await getWritingExercises();
          break;
        case 'speaking':
          data = await getSpeakingExercises();
          break;
        case 'listening':
          data = await getListeningExercises();
          break;
        case 'reading':
          data = await getReadingExercises();
          break;
        default:
          data = [];
      }
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExercise(null);
    setShowForm(true);
  };

  const handleEdit = (exercise: ExerciseDto) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleDelete = async (exercise: ExerciseDto) => {
    if (!confirm(`Are you sure you want to delete "${exercise.title}"?`)) {
      return;
    }

    try {
      switch (activeTab) {
        case 'writing':
          await deleteWritingExercise(exercise.id);
          break;
        case 'speaking':
          await deleteSpeakingExercise(exercise.id);
          break;
        case 'listening':
          await deleteListeningExercise(exercise.id);
          break;
        case 'reading':
          await deleteReadingExercise(exercise.id);
          break;
      }
      await loadExercises();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      alert('Failed to delete exercise');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingExercise) {
        // Update
        switch (activeTab) {
          case 'writing':
            await updateWritingExercise(editingExercise.id, data as UpdateWritingExerciseRequest);
            break;
          case 'speaking':
            await updateSpeakingExercise(editingExercise.id, data as UpdateSpeakingExerciseRequest);
            break;
          case 'listening':
            await updateListeningExercise(editingExercise.id, data as UpdateListeningExerciseRequest);
            break;
          case 'reading':
            await updateReadingExercise(editingExercise.id, data as UpdateReadingExerciseRequest);
            break;
        }
      } else {
        // Create
        switch (activeTab) {
          case 'writing':
            await createWritingExercise(data as CreateWritingExerciseRequest);
            break;
          case 'speaking':
            await createSpeakingExercise(data as CreateSpeakingExerciseRequest);
            break;
          case 'listening':
            await createListeningExercise(data as CreateListeningExerciseRequest);
            break;
          case 'reading':
            await createReadingExercise(data as CreateReadingExerciseRequest);
            break;
        }
      }

      setShowForm(false);
      setEditingExercise(null);
      await loadExercises();
    } catch (error) {
      console.error('Failed to save exercise:', error);
      alert('Failed to save exercise');
    }
  };

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'writing':
        return ['Title', 'Task Type', 'Level', 'Min Words', 'Status', 'Created', 'Actions'];
      case 'speaking':
        return ['Title', 'Part', 'Level', 'Status', 'Created', 'Actions'];
      case 'listening':
        return ['Title', 'Level', 'Questions', 'Duration', 'Status', 'Created', 'Actions'];
      case 'reading':
        return ['Title', 'Level', 'Questions', 'Status', 'Created', 'Actions'];
      default:
        return [];
    }
  };

  const renderTableRow = (exercise: ExerciseDto) => {
    const baseRow = [
      exercise.title,
      (exercise as any).level || '',
      (exercise as any).isActive ? 'Active' : 'Inactive',
      new Date(exercise.createdAt).toLocaleDateString(),
    ];

    switch (activeTab) {
      case 'writing':
        const writingEx = exercise as WritingExerciseDto;
        return [
          writingEx.title,
          writingEx.taskType,
          writingEx.level,
          writingEx.minWordCount.toString(),
          writingEx.isActive ? 'Active' : 'Inactive',
          new Date(writingEx.createdAt).toLocaleDateString(),
        ];
      case 'speaking':
        const speakingEx = exercise as SpeakingExerciseDto;
        return [
          speakingEx.title,
          speakingEx.part,
          speakingEx.level,
          speakingEx.isActive ? 'Active' : 'Inactive',
          new Date(speakingEx.createdAt).toLocaleDateString(),
        ];
      case 'listening':
        const listeningEx = exercise as ListeningExerciseDto;
        return [
          listeningEx.title,
          listeningEx.level,
          listeningEx.questionCount.toString(),
          listeningEx.durationSeconds ? `${listeningEx.durationSeconds}s` : 'N/A',
          listeningEx.isActive ? 'Active' : 'Inactive',
          new Date(listeningEx.createdAt).toLocaleDateString(),
        ];
      case 'reading':
        const readingEx = exercise as ReadingExerciseDto;
        return [
          readingEx.title,
          readingEx.level,
          readingEx.questionCount.toString(),
          readingEx.isActive ? 'Active' : 'Inactive',
          new Date(readingEx.createdAt).toLocaleDateString(),
        ];
      default:
        return baseRow;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Exercises Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Add Exercise
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {getTableHeaders().map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exercises.map((exercise) => (
                  <tr key={exercise.id} className="hover:bg-gray-50">
                    {renderTableRow(exercise).map((cell, index) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cell}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/exercises/${activeTab}/${exercise.id}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        Questions
                      </Link>
                      <button
                        onClick={() => handleEdit(exercise)}
                        className="text-blue-600 hover:text-blue-900 ml-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exercise)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {exercises.length === 0 && (
                  <tr>
                    <td
                      colSpan={getTableHeaders().length}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No exercises found. Click "Add Exercise" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ExerciseForm
          exerciseType={activeTab}
          exercise={editingExercise}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingExercise(null);
          }}
        />
      )}
    </div>
  );
}
