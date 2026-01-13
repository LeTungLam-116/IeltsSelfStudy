import { useState } from 'react';

type TabType = 'courses' | 'exercises' | 'questions';

export default function ContentManagerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('courses');

  const tabs = [
    { id: 'courses' as TabType, label: 'Courses', count: 0 },
    { id: 'exercises' as TabType, label: 'Exercises', count: 0 },
    { id: 'questions' as TabType, label: 'Questions', count: 0 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Courses Management</h3>
            <p className="text-gray-500">Manage IELTS courses and their content</p>
          </div>
        );
      case 'exercises':
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">✏️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Exercises Management</h3>
            <p className="text-gray-500">Create and manage practice exercises</p>
          </div>
        );
      case 'questions':
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">❓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Questions Management</h3>
            <p className="text-gray-500">Organize questions for each exercise</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
            <p className="text-gray-600 mt-1">
              Manage courses, exercises, and questions for your IELTS platform
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search content..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
