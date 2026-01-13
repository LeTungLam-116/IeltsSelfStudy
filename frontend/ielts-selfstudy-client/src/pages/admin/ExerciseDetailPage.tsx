import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWritingExercises, type WritingExerciseDto } from '../../api/writingExerciseApi';
import { getSpeakingExercises, type SpeakingExerciseDto } from '../../api/speakingExerciseApi';
import { getListeningExercises, type ListeningExerciseDto } from '../../api/listeningExerciseApi';
import { getReadingExercises, type ReadingExerciseDto } from '../../api/readingExerciseApi';
import QuestionsList from '../../components/admin/QuestionsList';

type ExerciseType = 'writing' | 'speaking' | 'listening' | 'reading';
type ExerciseDto = WritingExerciseDto | SpeakingExerciseDto | ListeningExerciseDto | ReadingExerciseDto;

export default function ExerciseDetailPage() {
  const { type, id } = useParams<{ type: ExerciseType; id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<ExerciseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!type || !id) {
      setError('Invalid exercise type or ID');
      setLoading(false);
      return;
    }

    loadExercise();
  }, [type, id]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      setError(null);

      let exerciseData: ExerciseDto;
      const exerciseId = parseInt(id!);

      switch (type) {
        case 'writing':
          const writingExercises = await getWritingExercises();
          exerciseData = writingExercises.find(e => e.id === exerciseId);
          break;
        case 'speaking':
          const speakingExercises = await getSpeakingExercises();
          exerciseData = speakingExercises.find(e => e.id === exerciseId);
          break;
        case 'listening':
          const listeningExercises = await getListeningExercises();
          exerciseData = listeningExercises.find(e => e.id === exerciseId);
          break;
        case 'reading':
          const readingExercises = await getReadingExercises();
          exerciseData = readingExercises.find(e => e.id === exerciseId);
          break;
        default:
          throw new Error('Invalid exercise type');
      }

      if (!exerciseData) {
        throw new Error('Exercise not found');
      }

      setExercise(exerciseData);
    } catch (err) {
      console.error('Failed to load exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/exercises');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Exercise</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
        >
          Back to Exercises
        </button>
      </div>
    );
  }

  const renderExerciseDetails = () => {
    switch (type) {
      case 'writing':
        const writingEx = exercise as WritingExerciseDto;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Task Type</dt>
                  <dd className="text-sm text-gray-900 mt-1">{writingEx.taskType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Level</dt>
                  <dd className="text-sm text-gray-900 mt-1">{writingEx.level}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Min Word Count</dt>
                  <dd className="text-sm text-gray-900 mt-1">{writingEx.minWordCount}</dd>
                </div>
                {writingEx.topic && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Topic</dt>
                    <dd className="text-sm text-gray-900 mt-1">{writingEx.topic}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{writingEx.question}</p>
              </div>
              {writingEx.sampleAnswer && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Answer</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-900 whitespace-pre-wrap text-sm">{writingEx.sampleAnswer}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'speaking':
        const speakingEx = exercise as SpeakingExerciseDto;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Part</dt>
                  <dd className="text-sm text-gray-900 mt-1">{speakingEx.part}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Level</dt>
                  <dd className="text-sm text-gray-900 mt-1">{speakingEx.level}</dd>
                </div>
                {speakingEx.topic && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Topic</dt>
                    <dd className="text-sm text-gray-900 mt-1">{speakingEx.topic}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{speakingEx.question}</p>
              </div>
              {speakingEx.tips && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tips</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-green-900 whitespace-pre-wrap text-sm">{speakingEx.tips}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'listening':
        const listeningEx = exercise as ListeningExerciseDto;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Level</dt>
                  <dd className="text-sm text-gray-900 mt-1">{listeningEx.level}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Question Count</dt>
                  <dd className="text-sm text-gray-900 mt-1">{listeningEx.questionCount}</dd>
                </div>
                {listeningEx.durationSeconds && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="text-sm text-gray-900 mt-1">{listeningEx.durationSeconds} seconds</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Audio URL</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    <a href={listeningEx.audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {listeningEx.audioUrl}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              {listeningEx.transcript && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap text-sm">{listeningEx.transcript}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'reading':
        const readingEx = exercise as ReadingExerciseDto;
        return (
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Details</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Level</dt>
                  <dd className="text-sm text-gray-900 mt-1">{readingEx.level}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Question Count</dt>
                  <dd className="text-sm text-gray-900 mt-1">{readingEx.questionCount}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Passage Text</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{readingEx.passageText}</p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown exercise type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exercises
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
          <p className="text-gray-600">
            {type?.charAt(0).toUpperCase() + type?.slice(1)} Exercise • {exercise.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            exercise.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {exercise.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Exercise Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {renderExerciseDetails()}
      </div>

      {/* Questions Management */}
      <QuestionsList exerciseId={exercise.id} skill={type!} />
    </div>
  );
}
