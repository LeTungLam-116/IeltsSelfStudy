import { Outlet } from 'react-router-dom';
import UserNavbar from './UserNavbar';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <UserNavbar />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 IELTS Self Study. Practice makes perfect.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
