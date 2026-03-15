import { Link, useNavigate } from 'react-router-dom';
import { type ReactNode, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

export default function MainLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { to: '/writing', label: 'Viết' },
    { to: '/speaking', label: 'Nói' },
    { to: '/listening', label: 'Nghe' },
    { to: '/reading', label: 'Đọc' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-teal-600 text-white px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/home"
              className="flex items-center space-x-2 text-xl font-bold text-teal-600 hover:text-teal-700 transition-colors"
              onClick={closeMobileMenu}
            >
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="hidden sm:block">IELTS Self Study</span>
            </Link>

            {/* Navigation (always visible; responsive layout handled inside) */}
            <nav className="flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <Link to="/home" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Trang chủ</Link>
                <Link to="/courses" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Khóa học</Link>

                <div className="relative group">
                  <button className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Luyện tập ▾</button>
                  <div className="absolute left-0 mt-2 w-44 bg-white border rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
                    <Link to="/listening" className="block px-4 py-2 hover:bg-gray-50">Listening</Link>
                    <Link to="/reading" className="block px-4 py-2 hover:bg-gray-50">Reading</Link>
                    <Link to="/writing" className="block px-4 py-2 hover:bg-gray-50">Writing</Link>
                    <Link to="/speaking" className="block px-4 py-2 hover:bg-gray-50">Speaking</Link>
                  </div>
                </div>

                {isAuthenticated && (
                  <Link to="/dashboard" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Bảng điều khiển</Link>
                )}
              </div>

              {/* Right side - auth */}
              <div className="flex items-center space-x-4">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Đăng nhập</Link>
                    <Link to="/register" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium transition-colors">Đăng ký</Link>
                  </>
                ) : (
                  <div className="flex items-center space-x-4 pl-6 border-l border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-semibold text-sm">{user?.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{user?.fullName}</span>
                    </div>
                    <button onClick={handleLogout} className="text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded-md transition-colors">Đăng xuất</button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-teal-600 hover:bg-gray-100 focus:text-teal-600 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-4 space-y-4">
                {isAuthenticated ? (
                  <>
                    {/* Mobile Navigation Links */}
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={closeMobileMenu}
                          className="block px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md font-medium transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* Mobile User Info */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-600 font-semibold">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user?.fullName}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md font-medium transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/home"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md font-medium transition-colors"
                    >
                      Trang chủ
                    </Link>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition-colors text-center"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Secondary visible nav to guarantee visibility */}
        <div className="w-full bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-6 py-2">
              <Link to="/home" className="text-gray-700 hover:text-teal-600 font-medium">Trang chủ</Link>
              <Link to="/courses" className="text-gray-700 hover:text-teal-600 font-medium">Khóa học</Link>
              <div className="relative group">
                <span className="text-gray-700 hover:text-teal-600 font-medium cursor-default">Luyện tập ▾</span>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-44 bg-white border rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-30">
                  <Link to="/listening" className="block px-4 py-2 hover:bg-gray-50">Listening</Link>
                  <Link to="/reading" className="block px-4 py-2 hover:bg-gray-50">Reading</Link>
                  <Link to="/writing" className="block px-4 py-2 hover:bg-gray-50">Writing</Link>
                  <Link to="/speaking" className="block px-4 py-2 hover:bg-gray-50">Speaking</Link>
                </div>
              </div>
              {isAuthenticated && <Link to="/dashboard" className="text-gray-700 hover:text-teal-600 font-medium">Bảng điều khiển</Link>}
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>
    </div>
  );
}