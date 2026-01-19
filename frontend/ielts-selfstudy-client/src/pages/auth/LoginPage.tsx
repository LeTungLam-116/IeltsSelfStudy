import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input } from '../../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [savedIntent, setSavedIntent] = useState<any>(null);

  useEffect(() => {
    // Check for saved post-login intent
    const intentStr = sessionStorage.getItem('postLoginIntent');
    if (intentStr) {
      try {
        const intent = JSON.parse(intentStr);
        setSavedIntent(intent);
      } catch (e) {
        console.error('Failed to parse post-login intent:', e);
        sessionStorage.removeItem('postLoginIntent');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) clearError();
  };

  const executePostLoginIntent = (user: any) => {
    if (!savedIntent) return;

    try {
      if (savedIntent.type === 'page' && savedIntent.path) {
        // Navigate to the intended page
        navigate(savedIntent.path);
      } else if (savedIntent.type === 'action') {
        // Handle action intents (could be extended for other actions)
        if (savedIntent.path) {
          navigate(savedIntent.path);
        }
      }

      // Clear the saved intent after execution
      sessionStorage.removeItem('postLoginIntent');
    } catch (e) {
      console.error('Failed to execute post-login intent:', e);
      // Fallback to default dashboard
      if (user?.role?.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);

      // Get the current user state after login
      const currentUser = useAuthStore.getState().user;

      // Execute saved intent or navigate to default dashboard
      if (savedIntent) {
        executePostLoginIntent(currentUser);
      } else {
        // Default navigation based on role
        if (currentUser?.role?.toLowerCase() === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/home" className="inline-flex items-center space-x-2 text-2xl font-bold text-teal-600 hover:text-teal-700 transition-colors mb-2">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <span>IELTS Self Study</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại
          </h2>
          <p className="text-gray-600">
            Đăng nhập để tiếp tục hành trình IELTS của bạn
          </p>
          {savedIntent && (
            <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-sm text-teal-700">
                Bạn sẽ được chuyển hướng để tiếp tục công việc sau khi đăng nhập.
              </p>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Nhập mật khẩu của bạn"
                value={formData.password}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              loading={isLoading}
              fullWidth
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-gray-600">Chưa có tài khoản? </span>
            <Link
              to="/register"
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Tạo tài khoản ngay
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 IELTS Self Study. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}