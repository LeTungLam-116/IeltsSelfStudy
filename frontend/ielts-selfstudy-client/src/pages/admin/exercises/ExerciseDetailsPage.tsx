import { useEffect, useState, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExerciseStore } from '../../../stores';
import { Button } from '../../../components/ui';
import { IconDocument, IconEye, IconChart, IconBook, IconEdit } from '../../../components/icons';

// Memoize the component to prevent unnecessary re-renders
const ExerciseDetailsPage = memo(function ExerciseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exerciseStore = useExerciseStore();

  const {
    currentExercise,
    exercisePreview,
    exerciseAnalytics,
    exerciseVersions,
    isLoading,
    fetchExerciseById,
    fetchExercisePreview,
    fetchExerciseAnalytics,
    fetchExerciseVersions,
  } = exerciseStore;

  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'analytics' | 'versions'>('overview');

  useEffect(() => {
    if (id) {
      const exerciseId = parseInt(id);
      fetchExerciseById(exerciseId);
      fetchExercisePreview(exerciseId);
      fetchExerciseAnalytics(exerciseId);
      fetchExerciseVersions(exerciseId);
    }
  }, [id, fetchExerciseById, fetchExercisePreview, fetchExerciseAnalytics, fetchExerciseVersions]);

  const handleBack = () => {
    navigate('/admin/exercises');
  };

  const handleEdit = () => {
    navigate(`/admin/exercises/${id}/edit`);
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

  if (isLoading && !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4"><IconDocument /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exercise Not Found</h2>
          <p className="text-gray-600 mb-4">The exercise you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={handleBack}>Back to Exercises</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
          >
            ← Back to Exercises
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{currentExercise.title || 'Untitled Exercise'}</h1>
          <p className="text-gray-600 mt-1">{currentExercise.description}</p>
        </div>
                <Button onClick={handleEdit} disabled={!currentExercise}>
                  <span className="mr-2"><IconEdit /></span>
                  Edit Exercise
                </Button>
      </div>

      {/* Exercise Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3"><IconDocument /></div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getTypeBadgeColor(currentExercise.type)}`}>
                {currentExercise.type}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3"><IconChart /></div>
            <div>
              <p className="text-sm text-gray-600">Level</p>
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getLevelBadgeColor(currentExercise.level || '')}`}>
                {currentExercise.level}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3"><IconDocument /></div>
            <div>
              <p className="text-sm text-gray-600">
                {currentExercise.type === 'Writing' && 'Task Type'}
                {currentExercise.type === 'Speaking' && 'Part'}
                {(currentExercise.type === 'Listening' || currentExercise.type === 'Reading') && 'Questions'}
              </p>
              <p className="text-lg font-semibold">
                {currentExercise.type === 'Writing' && (currentExercise.taskType || 'N/A')}
                {currentExercise.type === 'Speaking' && (currentExercise.part || 'N/A')}
                {(currentExercise.type === 'Listening' || currentExercise.type === 'Reading') &&
                  (currentExercise.questionCount || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3"><IconChart /></div>
            <div>
              <p className="text-sm text-gray-600">Attempts</p>
              <p className="text-lg font-semibold">{currentExercise.totalAttempts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: <IconDocument /> },
              { id: 'preview', label: 'Preview', icon: <IconEye /> },
              { id: 'analytics', label: 'Analytics', icon: <IconChart /> },
              { id: 'versions', label: 'Versions', icon: <IconBook /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full mt-1 ${
                      currentExercise.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {currentExercise.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(currentExercise.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Modified</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {currentExercise.lastModifiedAt ? new Date(currentExercise.lastModifiedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Modified By</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {currentExercise.lastModifiedBy || 'System'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Type-specific information */}
              {currentExercise.type === 'Listening' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Listening Details</h3>
                  <div className="space-y-3">
                    {currentExercise.audioUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Audio URL</label>
                        <a href={currentExercise.audioUrl} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 text-sm">
                          {currentExercise.audioUrl}
                        </a>
                      </div>
                    )}
                    {currentExercise.durationSeconds && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <p className="text-sm text-gray-900">{currentExercise.durationSeconds} seconds</p>
                      </div>
                    )}
                    {currentExercise.transcript && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Transcript</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.transcript}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentExercise.type === 'Reading' && currentExercise.passageText && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Reading Passage</h3>
                  <div className="p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.passageText}</p>
                  </div>
                </div>
              )}

              {currentExercise.type === 'Writing' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Writing Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Task Type</label>
                      <p className="text-sm text-gray-900">{currentExercise.taskType || 'Task 2'}</p>
                    </div>
                    {currentExercise.minWordCount && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Word Count</label>
                        <p className="text-sm text-gray-900">{currentExercise.minWordCount} words</p>
                      </div>
                    )}
                    {currentExercise.topic && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Topic</label>
                        <p className="text-sm text-gray-900">{currentExercise.topic}</p>
                      </div>
                    )}
                    {currentExercise.question && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Question</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.question}</p>
                        </div>
                      </div>
                    )}
                    {currentExercise.sampleAnswer && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sample Answer</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.sampleAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentExercise.type === 'Speaking' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Speaking Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Part</label>
                      <p className="text-sm text-gray-900">{currentExercise.part || 'Part 1'}</p>
                    </div>
                    {currentExercise.question && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Question/Prompt</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.question}</p>
                        </div>
                      </div>
                    )}
                    {currentExercise.tips && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tips & Guidance</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.tips}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div>
              {exercisePreview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Exercise Preview</h3>
                    <span className="text-sm text-gray-500">
                      Estimated duration: {exercisePreview.estimatedDuration} seconds
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentExercise.type === 'Listening' && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-green-800">Has Audio</span>
                        </div>
                      </div>
                    )}
                    {currentExercise.type === 'Reading' && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-blue-800">Has Text</span>
                        </div>
                      </div>
                    )}
                    {(currentExercise.type === 'Listening' || currentExercise.type === 'Reading') && (
                      <div className="bg-purple-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-purple-800">Has Questions</span>
                        </div>
                      </div>
                    )}
                    {currentExercise.type === 'Writing' && (
                      <div className="bg-orange-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-orange-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-orange-800">Writing Task</span>
                        </div>
                      </div>
                    )}
                    {currentExercise.type === 'Speaking' && (
                      <div className="bg-teal-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-teal-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-teal-800">Speaking Part</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">Preview Data</h4>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {JSON.stringify(exercisePreview.previewData, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                      <div className="text-4xl mb-4"><IconEye /></div>
                  <p className="text-gray-600">Preview not available for this exercise type.</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              {exerciseAnalytics ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{exerciseAnalytics.totalAttempts}</div>
                      <div className="text-sm text-gray-600">Total Attempts</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{exerciseAnalytics.averageScore?.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">{exerciseAnalytics.passRate?.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Pass Rate</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Score Distribution</h4>
                    <div className="space-y-2">
                      {exerciseAnalytics.popularScoreRanges?.map((range, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 w-16">{range.range}</span>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(range.count / exerciseAnalytics.totalAttempts) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{range.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <p className="text-sm text-gray-600">
                      Last attempt: {exerciseAnalytics.lastAttemptAt ? new Date(exerciseAnalytics.lastAttemptAt).toLocaleDateString() : 'Never'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Average time spent: {Math.round((exerciseAnalytics.averageTimeSpent || 0) / 60)} minutes
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4"><IconChart /></div>
                  <p className="text-gray-600">Analytics data not available yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Analytics will appear once students start attempting this exercise.</p>
                </div>
              )}
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Version History</h3>
              {exerciseVersions && exerciseVersions.length > 0 ? (
                <div className="space-y-4">
                  {exerciseVersions.map((version) => (
                    <div key={version.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            v{version.version}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            version.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {version.isActive ? 'Current' : 'Archived'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {version.changeNotes && (
                        <p className="text-sm text-gray-600 mt-2">{version.changeNotes}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Modified by: {version.createdBy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4"><IconBook /></div>
                  <p className="text-gray-600">No version history available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ExerciseDetailsPage.displayName = 'ExerciseDetailsPage';

export default ExerciseDetailsPage;