import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { IconDocument, IconBook, IconBell, IconEdit } from '../../components/icons';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Target Band: <span className="font-semibold text-blue-600">{user?.targetBand}</span> |
          Role: <span className="font-semibold text-green-600">{user?.role}</span>
        </p>
        <p className="text-gray-500 mt-2">
          Ready to improve your IELTS skills? Choose a practice area below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/writing"
          className="bg-white p-6 rounded-md border shadow-sm transition-colors duration-150 border-gray-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-3"><IconDocument /></div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              Writing Practice
            </h3>
            <p className="text-blue-600 text-sm">
              Practice IELTS Writing tasks with AI feedback
            </p>
          </div>
        </Link>

        <Link
          to="/reading"
          className="bg-white p-6 rounded-md border shadow-sm transition-colors duration-150 border-gray-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-3"><IconBook /></div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Reading Practice
            </h3>
            <p className="text-green-600 text-sm">
              Improve your reading comprehension skills
            </p>
          </div>
        </Link>

        <Link
          to="/listening"
          className="bg-white p-6 rounded-md border shadow-sm transition-colors duration-150 border-gray-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-3"><IconBell /></div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">
              Listening Practice
            </h3>
            <p className="text-purple-600 text-sm">
              Enhance listening comprehension with audio exercises
            </p>
          </div>
        </Link>

        <Link
          to="/speaking"
          className="bg-white p-6 rounded-md border shadow-sm transition-colors duration-150 border-gray-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-3"><IconEdit /></div>
            <h3 className="text-xl font-semibold text-orange-800 mb-2">
              Speaking Practice
            </h3>
            <p className="text-orange-600 text-sm">
              Practice speaking fluency with AI evaluation
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Stats/Progress Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-gray-600">Writing Attempts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-gray-600">Reading Attempts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-gray-600">Average Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
