import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores';

export default function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [practiceOpen, setPracticeOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile menu state

    const isActive = (path: string) => location.pathname === path;
    const isPracticeActive = ['/listening', '/reading', '/writing', '/speaking'].some(path => location.pathname.startsWith(path));

    // Tailwind common classes for links
    const baseLinkClass = "px-4 py-2 font-semibold text-sm rounded-lg transition-colors duration-200 outline-none";
    const activeLinkClass = "text-blue-600 bg-blue-50";
    const inactiveLinkClass = "text-gray-800 hover:bg-slate-100 bg-transparent";

    return (
        <header className="bg-white border-b border-gray-100 fixed top-0 left-0 z-[1000] h-[72px] w-full shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">

                {/* 1. Logo - Left */}
                <Link to="/home" className="flex items-center no-underline shrink-0 h-full py-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        I
                    </div>
                    <div className="ml-3 flex flex-col">
                        <span className="font-bold text-[1.125rem] text-slate-900 leading-tight tracking-tight">IELTS</span>
                        <span className="text-xs font-medium text-blue-600 -mt-0.5">Self Study</span>
                    </div>
                </Link>

                {/* 2. Navigation - Center (Desktop Only) */}
                <nav className="hidden md:flex items-center gap-2 justify-center flex-1 mx-4 h-full">
                    <Link
                        to="/home"
                        className={`${baseLinkClass} ${(isActive('/home') || isActive('/')) ? activeLinkClass : inactiveLinkClass}`}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        to="/courses"
                        className={`${baseLinkClass} ${isActive('/courses') ? activeLinkClass : inactiveLinkClass}`}
                    >
                        Khóa học
                    </Link>
                    <Link
                        to="/placement-test"
                        className={`${baseLinkClass} ${isActive('/placement-test') ? activeLinkClass : inactiveLinkClass}`}
                    >
                        Kiểm tra đầu vào
                    </Link>

                    {/* Dropdown Luyện tập (Desktop) */}
                    <div
                        className="relative h-full flex items-center"
                        onMouseEnter={() => setPracticeOpen(true)}
                        onMouseLeave={() => setPracticeOpen(false)}
                    >
                        <button
                            className={`${baseLinkClass} flex items-center gap-1 border-none cursor-pointer ${isPracticeActive ? activeLinkClass : inactiveLinkClass}`}
                        >
                            Luyện tập
                            <svg className={`w-4 h-4 transition-transform duration-200 ${isPracticeActive ? 'text-blue-600' : 'text-gray-400'} ${practiceOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[180px] pt-1 z-50 transition-all duration-200 ${practiceOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2">
                                {[
                                    { name: 'Listening', icon: '🎧', path: '/listening' },
                                    { name: 'Reading', icon: '📚', path: '/reading' },
                                    { name: 'Writing', icon: '✍️', path: '/writing' },
                                    { name: 'Speaking', icon: '🗣️', path: '/speaking' }
                                ].map((item) => {
                                    const isItemActive = location.pathname.startsWith(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setPracticeOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isItemActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* 3. Right Area (Buttons & Hamburger) */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 h-full">

                    {/* Bắt đầu học Button (Visible on all screens but smaller padding on mobile) */}
                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/courses')}
                        className="bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <span className="hidden sm:inline">🚀</span>
                        {user ? 'Vào học ngay' : 'Bắt đầu học'}
                    </button>

                    {/* Auth Section (Desktop) / Dropdown */}
                    <div className="hidden md:flex h-full items-center">
                        {!user ? (
                            <Link
                                to="/login"
                                className="text-slate-600 hover:bg-slate-50 border border-slate-200 font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
                            >
                                Đăng nhập
                            </Link>
                        ) : (
                            <div
                                className="relative h-full flex items-center"
                                onMouseEnter={() => setDropdownOpen(true)}
                                onMouseLeave={() => setDropdownOpen(false)}
                            >
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow outline-none">
                                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </button>

                                {/* Dropdown Tài Khoản */}
                                <div className={`absolute right-0 top-full w-60 pt-1 z-[100] transition-all duration-200 ${dropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2">
                                        <div className="px-4 py-3 border-b border-slate-100 mb-2">
                                            <p className="text-sm font-bold text-slate-800 m-0 truncate">{user.fullName}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
                                        </div>

                                        <Link onClick={() => setDropdownOpen(false)} to="/profile" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                            <span className="text-base">👤</span> Hồ sơ cá nhân
                                        </Link>

                                        <div className="border-t border-slate-100 pt-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
                                            >
                                                <span className="text-base">🚪</span> Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hamburger Button (Mobile Only) */}
                    <button
                        className="md:hidden flex items-center justify-center p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* 4. Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-[72px] left-0 w-full bg-white border-b border-slate-100 shadow-lg z-[999] overflow-y-auto max-h-[calc(100vh-72px)] pb-6 px-4 pt-4 flex flex-col gap-2">

                    <Link to="/home" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-3 rounded-xl font-medium ${(isActive('/home') || isActive('/')) ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                        Trang chủ
                    </Link>
                    <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-3 rounded-xl font-medium ${isActive('/courses') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                        Khóa học
                    </Link>
                    <Link to="/placement-test" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-3 rounded-xl font-medium ${isActive('/placement-test') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                        Kiểm tra đầu vào
                    </Link>

                    {/* Mobile Practice Links */}
                    <div className="px-4 py-2 mt-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Luyện tập</p>
                        <div className="flex flex-col gap-1">
                            {[
                                { name: 'Listening', icon: '🎧', path: '/listening' },
                                { name: 'Reading', icon: '📚', path: '/reading' },
                                { name: 'Writing', icon: '✍️', path: '/writing' },
                                { name: 'Speaking', icon: '🗣️', path: '/speaking' }
                            ].map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 py-2 font-medium text-slate-600 hover:text-blue-600"
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-2"></div>

                    {/* Mobile Auth */}
                    {!user ? (
                        <Link
                            to="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-center mt-2 mx-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    ) : (
                        <div className="px-4">
                            <div className="flex items-center gap-3 py-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow">
                                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-slate-800 m-0 truncate">{user.fullName}</p>
                                    <p className="text-xs text-slate-500 m-0 truncate">{user.email}</p>
                                </div>
                            </div>
                            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-3 font-medium text-slate-600 hover:text-blue-600">
                                👤 Hồ sơ cá nhân
                            </Link>
                            <button
                                onClick={() => {
                                    logout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full text-left py-3 font-medium text-red-500"
                            >
                                🚪 Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
