import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconUser, IconBook, IconCheckCircle, IconXCircle } from '../../../components/icons';
import { Button, Loading, Card } from '../../../components/ui';
import { getAttemptById } from '../../../api/attemptsApi';
import type { AttemptDto } from '../../../types/attempts';

const AttemptDetailsPage = memo(function AttemptDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<AttemptDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await getAttemptById(parseInt(id));
        setAttempt(data);
      } catch (err) {
        console.error('Failed to fetch attempt:', err);
        setError('Failed to load attempt details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempt();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/attempts');
  };

  const handleGrade = () => {
    if (attempt) {
      navigate(`/admin/attempts/${attempt.id}/grade`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderUserAnswer = (answerJson?: string) => {
    if (!answerJson) {
      return <p className="text-gray-500 italic">No answer provided</p>;
    }

    try {
      const answer = JSON.parse(answerJson);

      // Handle different answer formats based on exercise type
      if (typeof answer === 'string') {
        return <p className="whitespace-pre-wrap">{answer}</p>;
      }

      if (Array.isArray(answer)) {
        return (
          <ul className="list-disc list-inside space-y-1">
            {answer.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
      }

      if (typeof answer === 'object') {
        return (
          <div className="space-y-2">
            {Object.entries(answer).map(([key, value]) => (
              <div key={key}>
                <strong className="text-gray-700">{key}:</strong> {String(value)}
              </div>
            ))}
          </div>
        );
      }

      return <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(answer, null, 2)}</pre>;
    } catch (e) {
      return <p className="whitespace-pre-wrap">{answerJson}</p>;
    }
  };

  if (isLoading) {
    return (
      <main className="space-y-8">
        <Loading text="Loading attempt details..." />
      </main>
    );
  }

  if (error || !attempt) {
    return (
      <main className="space-y-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Attempt Details</h1>
          <p className="text-red-600 mb-4">{error || 'Attempt not found'}</p>
          <Button onClick={handleBack}>Back to Attempts</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attempt Details</h1>
            <p className="text-gray-600">ID: {attempt.id}</p>
          </div>
        </div>

        {!attempt.isGraded && (
          <Button onClick={handleGrade} className="bg-green-600 hover:bg-green-700">
            Grade Attempt
          </Button>
        )}
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg ${
        attempt.isGraded
          ? attempt.isPassed
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center">
          {attempt.isGraded ? (
            attempt.isPassed ? (
              <IconCheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <IconXCircle className="w-5 h-5 text-red-600 mr-2" />
            )
          ) : (
            <div className="w-5 h-5 bg-yellow-500 rounded-full mr-2"></div>
          )}
          <div>
            <p className={`font-medium ${
              attempt.isGraded
                ? attempt.isPassed
                  ? 'text-green-800'
                  : 'text-red-800'
                : 'text-yellow-800'
            }`}>
              {attempt.isGraded
                ? attempt.isPassed
                  ? 'Passed'
                  : 'Failed'
                : 'Pending Grading'
              }
            </p>
            {attempt.isGraded && attempt.score && attempt.maxScore && (
              <p className="text-sm text-gray-600">
                Score: {attempt.score}/{attempt.maxScore} ({Math.round((attempt.score / attempt.maxScore) * 100)}%)
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attempt Information */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Attempt Information</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <div className="flex items-center mt-1">
                  <IconUser className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attempt.userName}</p>
                    <p className="text-sm text-gray-500">{attempt.userEmail}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Exercise</label>
                <div className="flex items-center mt-1">
                  <IconBook className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attempt.exerciseTitle}</p>
                    <p className="text-sm text-gray-500">{attempt.skill}</p>
                  </div>
                </div>
              </div>

              {attempt.courseTitle && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Course</label>
                  <p className="text-sm text-gray-900 mt-1">{attempt.courseTitle}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Submitted</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(attempt.createdAt)}</p>
              </div>

              {attempt.gradedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Graded</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(attempt.gradedAt)}</p>
                  {attempt.gradedBy && (
                    <p className="text-sm text-gray-500">by {attempt.gradedBy}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* User Answer */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Answer</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {renderUserAnswer(attempt.userAnswerJson)}
            </div>
          </Card>

          {/* AI Feedback (if available) */}
          {attempt.aiFeedback && (
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Feedback</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 whitespace-pre-wrap">{attempt.aiFeedback}</p>
              </div>
            </Card>
          )}

          {/* Grading Notes (if available) */}
          {attempt.gradingNotes && (
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Grading Notes</h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800 whitespace-pre-wrap">{attempt.gradingNotes}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
});

AttemptDetailsPage.displayName = 'AttemptDetailsPage';

export default AttemptDetailsPage;
