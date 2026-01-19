import { Card } from '../../components/ui';

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Advanced analytics and reporting tools. For dashboard overview, visit the{' '}
          <a href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 underline">
            Dashboard
          </a>
          .
        </p>
      </header>

      {/* Placeholder Content */}
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Reports Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          This section will contain advanced analytics, custom reports, export functionality,
          and detailed performance metrics.
        </p>
        <div className="text-sm text-gray-500">
          <p>Current features available in Dashboard:</p>
          <ul className="mt-2 space-y-1">
            <li>• Real-time KPI metrics</li>
            <li>• Interactive charts and trends</li>
            <li>• User growth analytics</li>
            <li>• Revenue tracking</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}