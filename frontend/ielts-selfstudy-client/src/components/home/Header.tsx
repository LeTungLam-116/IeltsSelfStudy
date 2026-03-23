import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores';

export default function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [practiceOpen, setPracticeOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;
    const isPracticeActive = ['/listening', '/reading', '/writing', '/speaking'].some(path => location.pathname.startsWith(path));

    const getLinkStyle = (active: boolean) => ({
        padding: '0.5rem 1rem',
        color: active ? '#0071f9' : '#23242d',
        backgroundColor: active ? '#eff6ff' : 'transparent',
        fontWeight: 600,
        fontSize: '14px',
        textDecoration: 'none',
        borderRadius: '8px',
        transition: '0.2s'
    });

    return (
        <header
            style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #f3f4f6',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1000,
                height: '72px',
                width: '100%',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
        >
            <div
                style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                {/* Logo - Bên trái */}
                <Link
                    to="/home"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        flexShrink: 0
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #0071f9 0%, #00b4d8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.25rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        I
                    </div>
                    <div style={{ marginLeft: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#23242d', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                            IELTS
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0071f9', marginTop: '-2px' }}>
                            Self Study
                        </span>
                    </div>
                </Link>

                {/* Navigation - Giữa */}
                <nav
                    className="hidden lg:flex"
                    style={{
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'center',
                        flex: 1
                    }}
                >
                    <Link
                        to="/home"
                        style={getLinkStyle(isActive('/home') || isActive('/'))}
                        onMouseOver={(e) => {
                            if (!(isActive('/home') || isActive('/'))) e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                        onMouseOut={(e) => {
                            if (!(isActive('/home') || isActive('/'))) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        to="/courses"
                        style={getLinkStyle(isActive('/courses'))}
                        onMouseOver={(e) => {
                            if (!isActive('/courses')) e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                        onMouseOut={(e) => {
                            if (!isActive('/courses')) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Khóa học
                    </Link>
                    <Link
                        to="/placement-test"
                        style={getLinkStyle(isActive('/placement-test'))}
                        onMouseOver={(e) => {
                            if (!isActive('/placement-test')) e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                        onMouseOut={(e) => {
                            if (!isActive('/placement-test')) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Kiểm tra đầu vào
                    </Link>

                    {/* Dropdown Luyện tập */}
                    <div
                        className="relative"
                        onMouseEnter={() => setPracticeOpen(true)}
                        onMouseLeave={() => setPracticeOpen(false)}
                    >
                        <button
                            style={{
                                ...getLinkStyle(isPracticeActive),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                            onMouseOver={(e) => {
                                if (!isPracticeActive) e.currentTarget.style.backgroundColor = '#f1f5f9';
                            }}
                            onMouseOut={(e) => {
                                if (!isPracticeActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            Luyện tập
                            <svg
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    color: isPracticeActive ? '#0071f9' : '#9ca3af',
                                    transform: practiceOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu - Narrower and Sleeker */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '180px',
                                paddingTop: '12px', // Cầu nối vô hình giúp chuột không bị rời khỏi vùng hover
                                zIndex: 60,
                                opacity: practiceOpen ? 1 : 0,
                                visibility: practiceOpen ? 'visible' : 'hidden',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                border: '1px solid #f1f5f9',
                                padding: '8px'
                            }}>
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
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '10px 12px',
                                                textDecoration: 'none',
                                                color: isItemActive ? '#0071f9' : '#475569',
                                                backgroundColor: isItemActive ? '#eff6ff' : 'transparent',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                borderRadius: '10px',
                                                transition: '0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                if (!isItemActive) {
                                                    e.currentTarget.style.backgroundColor = '#eff6ff';
                                                    e.currentTarget.style.color = '#0071f9';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (!isItemActive) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#475569';
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Right Area */}
                <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    {/* Nút Bắt đầu học kiểu Prep - Luôn hiển thị hoặc nổi bật */}
                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/courses')}
                        style={{
                            backgroundColor: '#ff7d00', // Màu cam đặc trưng của Prep
                            color: 'white',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '14px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px 0 rgba(255, 125, 0, 0.3)',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e67000';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(255, 125, 0, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#ff7d00';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(255, 125, 0, 0.3)';
                        }}
                    >
                        <span>🚀</span>
                        {user ? 'Vào học ngay' : 'Bắt đầu học'}
                    </button>

                    {!user ? (
                        <Link
                            to="/login"
                            style={{
                                color: '#475569',
                                fontWeight: 600,
                                fontSize: '14px',
                                textDecoration: 'none',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                transition: '0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Đăng nhập
                        </Link>
                    ) : (
                        <div
                            className="relative"
                            onMouseEnter={() => setDropdownOpen(true)}
                            onMouseLeave={() => setDropdownOpen(false)}
                        >
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '50%',
                                    transition: '0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #0071f9 0%, #00b4d8 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        boxShadow: '0 2px 4px 0 rgba(0, 113, 249, 0.2)'
                                    }}
                                >
                                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </button>

                            {/* Dropdown tài khoản */}
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    width: '240px',
                                    paddingTop: '12px',
                                    zIndex: 100,
                                    display: dropdownOpen ? 'block' : 'none',
                                    opacity: dropdownOpen ? 1 : 0,
                                    transition: 'all 0.2s ease-in-out',
                                    visibility: dropdownOpen ? 'visible' : 'hidden'
                                }}
                            >
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                                    border: '1px solid #f1f5f9',
                                    padding: '8px'
                                }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{user.fullName}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                                    </div>

                                    <Link onClick={() => setDropdownOpen(false)} to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', textDecoration: 'none', color: '#475569', fontSize: '14px', fontWeight: 500, borderRadius: '8px' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <span style={{ fontSize: '16px' }}>👤</span> Hồ sơ cá nhân
                                    </Link>

                                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '8px' }}>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setDropdownOpen(false);
                                            }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                color: '#ef4444',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                borderRadius: '8px',
                                                textAlign: 'left'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span style={{ fontSize: '16px' }}>🚪</span> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button - Right Content on Mobile */}
                <div className="flex lg:hidden items-center gap-3">
                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/courses')}
                        style={{
                            backgroundColor: '#ff7d00',
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '13px',
                            border: 'none',
                        }}
                    >
                        🚀 {user ? 'Vào học' : 'Bắt đầu'}
                    </button>
                    
                    {user && (
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0071f9 0%, #00b4d8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}
                            onClick={() => navigate('/profile')}
                        >
                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}

                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[999] bg-black bg-opacity-50 flex flex-col justify-end transition-opacity duration-300">
                    <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl safe-area-bottom pb-8 transform transition-transform duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800">Menu Hệ Thống</h3>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <Link onClick={() => setMobileMenuOpen(false)} to="/home" className={`p-4 rounded-xl font-medium ${isActive('/home') || isActive('/') ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'}`}>🏠 Trang chủ</Link>
                            <Link onClick={() => setMobileMenuOpen(false)} to="/courses" className={`p-4 rounded-xl font-medium ${isActive('/courses') ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'}`}>📚 Khóa học</Link>
                            <Link onClick={() => setMobileMenuOpen(false)} to="/placement-test" className={`p-4 rounded-xl font-medium ${isActive('/placement-test') ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'}`}>🎯 Kiểm tra đầu vào</Link>
                            
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="font-semibold text-gray-500 text-sm mb-3">LUYỆN TẬP KỸ NĂNG</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link onClick={() => setMobileMenuOpen(false)} to="/listening" className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm font-medium text-gray-700 text-sm">🎧 Listening</Link>
                                    <Link onClick={() => setMobileMenuOpen(false)} to="/reading" className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm font-medium text-gray-700 text-sm">📖 Reading</Link>
                                    <Link onClick={() => setMobileMenuOpen(false)} to="/writing" className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm font-medium text-gray-700 text-sm">✍️ Writing</Link>
                                    <Link onClick={() => setMobileMenuOpen(false)} to="/speaking" className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm font-medium text-gray-700 text-sm">🗣️ Speaking</Link>
                                </div>
                            </div>
                        </div>

                        {!user ? (
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="mt-6 w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-center">Đăng nhập / Đăng ký</button>
                        ) : (
                            <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="mt-6 w-full py-4 rounded-xl bg-red-50 text-red-600 font-bold text-center flex items-center justify-center gap-2">🚪 Đăng xuất</button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
