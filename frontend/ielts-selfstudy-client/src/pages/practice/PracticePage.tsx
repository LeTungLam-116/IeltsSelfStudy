import { Link } from 'react-router-dom';

interface PracticeItem {
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  count?: number;
}

const practiceItems: PracticeItem[] = [
  {
    title: 'Writing Practice',
    description: 'Practice IELTS Writing tasks with AI feedback',
    path: '/writing',
    icon: '📝',
    color: 'bg-blue-500',
    difficulty: 'Intermediate',
    count: 0
  },
  {
    title: 'Reading Practice',
    description: 'Improve reading comprehension skills',
    path: '/reading',
    icon: '📖',
    color: 'bg-green-500',
    difficulty: 'Intermediate',
    count: 0
  },
  {
    title: 'Listening Practice',
    description: 'Enhance listening comprehension with audio exercises',
    path: '/listening',
    icon: '🎧',
    color: 'bg-purple-500',
    difficulty: 'Intermediate',
    count: 0
  },
  {
    title: 'Speaking Practice',
    description: 'Practice speaking fluency with AI evaluation',
    path: '/speaking',
    icon: '🎤',
    color: 'bg-orange-500',
    difficulty: 'Advanced',
    count: 0
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'bg-green-100 text-green-800';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function PracticePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Practice Areas</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose a practice area to improve your IELTS skills. Each module offers different exercises
          tailored to help you achieve your target band score.
        </p>
      </div>

      {/* Practice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {practiceItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200 hover:border-gray-300"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${item.color} text-white text-2xl`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Start Practice</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Writing Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Reading Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Listening Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">Speaking Sessions</div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Practice Tips</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Start with your weakest skill area</li>
          <li>• Practice regularly for best results</li>
          <li>• Review your mistakes to improve faster</li>
          <li>• Take practice tests under timed conditions</li>
        </ul>
      </div>
    </div>
  );
}
