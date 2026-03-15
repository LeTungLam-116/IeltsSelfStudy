import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [activeView, setActiveView] = useState<'login' | 'register'>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    targetBand: '5.0', // Default value as string for input
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savedIntent, setSavedIntent] = useState<any>(null);

  useEffect(() => {
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

  // Auto-switch to register view if specific errors occur (e.g. Email exists)
  useEffect(() => {
    if (error) {
      const lowerError = error.toLowerCase();
      // Keywords that suggest a registration failure
      if (
        lowerError.includes('tồn tại') ||
        lowerError.includes('exists') ||
        lowerError.includes('used') ||
        lowerError.includes('đăng ký')
      ) {
        if (activeView !== 'register') {
          setActiveView('register');
        }
      }
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) clearError();
    if (localError) setLocalError(null);
  };

  const switchView = (target: 'login' | 'register') => {
    if (activeView === target || isTransitioning) return;

    setLocalError(null);
    setSuccessMessage(null);
    clearError();

    setIsTransitioning(true);
    setTimeout(() => {
      setActiveView(target);
      setIsTransitioning(false);
    }, 300);
  };

  const executePostLoginIntent = (user: any) => {
    try {
      if (savedIntent?.path) {
        navigate(savedIntent.path);
      } else {
        if (user?.role?.toLowerCase() === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      }
      sessionStorage.removeItem('postLoginIntent');
    } catch (e) {
      navigate('/home');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(formData.email, formData.password);

      const currentUser = useAuthStore.getState().user;

      if (savedIntent) {
        executePostLoginIntent(currentUser);
      } else {
        if (currentUser?.role?.toLowerCase() === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Mật khẩu nhập lại không khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      await register(
        formData.email,
        formData.fullName,
        formData.password,
        'user',
        parseFloat(formData.targetBand) || 5.0
      );
      setSuccessMessage('Đăng ký thành công! Đang đăng nhập...');

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => {
          switchView('login');
        }, 2000);
      }

    } catch (err: any) {
      // Error is handled by store
    }
  };

  return (
    <div className="auth-font-wrapper fixed inset-0 h-screen w-full animated-gradient flex items-center justify-center overflow-auto p-4">
      <div className="form-container bg-white rounded-3xl shadow-2xl p-6 sm:p-10 md:p-12 w-full max-w-md slide-in my-auto">

        {/* Logo and Branding (Synchronized with Home Page) */}
        <div className="text-center mb-8">
          <div className="logo-bounce flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0071f9] to-[#00b4d8] flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3">
              I
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-slate-800 leading-none tracking-tight">IELTS</span>
              <span className="text-[#0071f9] text-sm font-semibold tracking-wide">Self Study</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-3 font-medium">Nền tảng luyện thi IELTS số 1 Việt Nam</p>
        </div>

        {/* Global Messages */}
        {(error || localError) && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center shadow-sm animate-fade-in-up">
            <svg className="h-5 w-5 mr-2 text-red-500 shrink-0" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{localError || error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center shadow-sm animate-fade-in-up">
            <svg className="h-5 w-5 mr-2 text-green-500 shrink-0" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <div className={activeView === 'login' ? (isTransitioning ? 'form-fade-out' : 'form-fade-in') : 'hidden'}>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Chào mừng trở lại</h2>

          {savedIntent && (
            <div className="mb-6 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl flex items-center shadow-sm">
              <span className="text-xl mr-3" role="img" aria-label="info">ℹ️</span>
              <div className="text-sm font-medium text-blue-800">
                {savedIntent.message || 'Bạn sẽ được chuyển hướng sau khi đăng nhập.'}
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} autoComplete="off">
            <div className="mb-5">
              <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ Email</label>
              <div className="relative">
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  required
                  autoComplete="off"
                  className="form-input w-full px-4 py-3.5 rounded-xl text-gray-900 font-medium"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  required
                  autoComplete="new-password"
                  className="form-input w-full px-4 py-3.5 rounded-xl text-gray-900 font-medium"
                  placeholder="Nhập mật khẩu của bạn"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-6 text-right">
              <a href="#" className="link-accent text-sm font-semibold">Quên mật khẩu?</a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary-gradient w-full py-3.5 rounded-xl font-bold text-white text-base shadow-lg flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Chưa có tài khoản?
              <button
                onClick={() => switchView('register')}
                className="link-accent font-bold ml-1 bg-transparent border-none p-0 cursor-pointer"
              >
                Tạo tài khoản ngay
              </button>
            </p>
          </div>
        </div>

        {/* Register Form */}
        <div className={activeView === 'register' ? (isTransitioning ? 'form-fade-out' : 'form-fade-in') : 'hidden'}>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Bắt đầu hành trình</h2>
          <form onSubmit={handleRegisterSubmit} autoComplete="off">
            <div className="mb-5">
              <label htmlFor="register-name" className="block text-sm font-semibold text-gray-700 mb-2">Họ và Tên</label>
              <div className="relative">
                <input
                  type="text"
                  id="register-name"
                  name="fullName"
                  required
                  autoComplete="off"
                  className="form-input w-full px-4 py-3.5 rounded-xl text-gray-900 font-medium"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-5">
              <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ Email</label>
              <div className="relative">
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  required
                  autoComplete="off"
                  className="form-input w-full px-4 py-3.5 rounded-xl text-gray-900 font-medium"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-5">
              <label htmlFor="register-band" className="block text-sm font-semibold text-gray-700 mb-2">Mục tiêu Band IELTS</label>
              <div className="relative">
                <select
                  id="register-band"
                  name="targetBand"
                  required
                  className="form-input w-full px-4 py-3.5 rounded-xl text-gray-900 font-medium appearance-none bg-white cursor-pointer"
                  value={formData.targetBand}
                  onChange={handleChange}
                >
                  <option value="3.0">Band 3.0 (Mất gốc)</option>
                  <option value="3.5">Band 3.5</option>
                  <option value="4.0">Band 4.0</option>
                  <option value="4.5">Band 4.5</option>
                  <option value="5.0">Band 5.0</option>
                  <option value="5.5">Band 5.5</option>
                  <option value="6.0">Band 6.0</option>
                  <option value="6.5">Band 6.5</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="form-input w-full px-4 py-3.5 rounded-xl text-gray-900 font-medium"
                  placeholder="Tạo mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Ít nhất 6 ký tự</p>
            </div>
            <div className="mb-6">
              <label htmlFor="register-confirm" className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  id="register-confirm"
                  name="confirmPassword"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="form-input w-full px-4 py-3.5 rounded-xl text-gray-900 font-medium"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary-gradient w-full py-3.5 rounded-xl font-bold text-white text-base shadow-lg flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?
              <button
                onClick={() => switchView('login')}
                className="link-accent font-bold ml-1 bg-transparent border-none p-0 cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}