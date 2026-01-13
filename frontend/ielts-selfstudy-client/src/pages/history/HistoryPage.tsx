import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface AttemptHistory {
  id: number;
  skill: string;
  exerciseTitle: string;
  score?: number;
  maxScore?: number;
  createdAt: string;
  status: 'completed' | 'in-progress';
}

const mockAttempts: AttemptHistory[] = [
  {
    id: 1,
    skill: 'Writing',
    exerciseTitle: 'Task 2: Environmental Problems',
    score: 7.5,
    maxScore: 9.0,
    createdAt: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: 2,
    skill: 'Speaking',
    exerciseTitle: 'Part 2: Describe a Place',
    score: 8.0,
    maxScore: 9.0,
    createdAt: '2024-01-14T14:20:00Z',
    status: 'completed'
  },
  {
    id: 3,
    skill: 'Reading',
    exerciseTitle: 'Academic Reading Test 1',
    score: 6.5,
    maxScore: 9.0,
    createdAt: '2024-01-13T09:15:00Z',
    status: 'completed'
  }
];

const getSkillColor = (skill: string) => {
  switch (skill.toLowerCase()) {
    case 'writing': return 'bg-blue-100 text-blue-800';
    case 'speaking': return 'bg-orange-100 text-orange-800';
    case 'listening': return 'bg-purple-100 text-purple-800';
    case 'reading': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 8.0) return 'text-green-600';
  if (score >= 6.5) return 'text-yellow-600';
  return 'text-red-600';
};

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAttempts(mockAttempts);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Attempt History</h1>
        <p className="text-gray-600 mt-1">
          Review your past attempts and feedback
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{attempts.length}</div>
          <div className="text-sm text-gray-600">Total Attempts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">
            {attempts.filter(a => a.score && a.score >= 7.0).length}
          </div>
          <div className="text-sm text-gray-600">High Scores (≥7.0)</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-purple-600">
            {attempts.filter(a => a.skill.toLowerCase() === 'writing').length}
          </div>
          <div className="text-sm text-gray-600">Writing Attempts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-orange-600">
            {attempts.filter(a => a.skill.toLowerCase() === 'speaking').length}
          </div>
          <div className="text-sm text-gray-600">Speaking Attempts</div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Attempts</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {attempts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attempts yet</h3>
              <p className="text-gray-600 mb-4">
                Start practicing to see your attempt history here.
              </p>
              <Link
                to="/practice"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
              >
                Start Practice
              </Link>
            </div>
          ) : (
            attempts.map((attempt) => (
              <div key={attempt.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillColor(attempt.skill)}`}>
                      {attempt.skill}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {attempt.exerciseTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {attempt.score && attempt.maxScore ? (
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(attempt.score)}`}>
                          {attempt.score}/{attempt.maxScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          {((attempt.score / attempt.maxScore) * 100).toFixed(0)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">In Progress</span>
                    )}

                    <Link
                      to={`/attempts/${attempt.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Improvement</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Review your mistakes in each attempt to improve faster</li>
          <li>• Focus on weaker skills based on your scores</li>
          <li>• Practice regularly to track your progress over time</li>
          <li>• Compare your scores with your target band</li>
        </ul>
      </div>
    </div>
  );
}
