import { Link, useNavigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';

export default function MainLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              IELTS Self Study
            </Link>
            
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/writing" className="text-gray-600 hover:text-blue-600">Writing</Link>
                  <Link to="/speaking" className="text-gray-600 hover:text-blue-600">Speaking</Link>
                  <Link to="/listening" className="text-gray-600 hover:text-blue-600">Listening</Link>
                  <Link to="/reading" className="text-gray-600 hover:text-blue-600">Reading</Link>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Welcome, {user?.fullName}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="text-blue-600 hover:text-blue-800">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}