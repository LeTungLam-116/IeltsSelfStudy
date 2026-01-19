import { Link } from 'react-router-dom';
import { IconBook, IconChart } from '../../components/icons';

export default function ReadingHomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">IELTS Reading Practice</h1>
          <p className="text-lg text-gray-600">
            Improve your reading skills with our comprehensive IELTS reading exercises
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl mb-4"><IconBook /></div>
            <h3 className="text-xl font-semibold mb-2">Practice Exercises</h3>
            <p className="text-gray-600 mb-4">
              Access a variety of reading passages and questions designed to improve your IELTS reading skills.
            </p>
            <Link
              to="/reading/list"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Reading Practice →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4"><IconChart /></div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600 mb-4">
              Monitor your reading progress and see how you improve over time.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Progress →
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Reading Test Structure</h3>
          <p className="text-gray-700 mb-4">
            The IELTS Reading test consists of 3 sections with 40 questions to be completed in 60 minutes.
            Each section contains one long text with questions.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Section 1:</strong> Contains texts relevant to everyday life in an English-speaking country</li>
            <li><strong>Section 2:</strong> Contains texts relevant to training or employment</li>
            <li><strong>Section 3:</strong> Contains texts relevant to education or training</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
