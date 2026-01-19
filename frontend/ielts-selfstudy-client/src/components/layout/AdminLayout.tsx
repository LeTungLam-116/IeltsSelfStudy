import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { IconButton } from '../ui';
import { IconSearch } from '../icons';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { title: 'Dashboard', to: '/admin/dashboard' },
    { title: 'Users', to: '/admin/users' },
    { title: 'Courses', to: '/admin/courses' },
    { title: 'Exercises', to: '/admin/exercises' },
    { title: 'Questions', to: '/admin/questions' },
    { title: 'Attempts', to: '/admin/attempts' },
    { title: 'Reports', to: '/admin/reports' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  // dropdown state & refs
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  // Focus management for route changes
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Skip links for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#sidebar-nav" className="skip-link" style={{ top: '60px' }}>
        Skip to navigation
      </a>

      <div className="layout-wrapper">
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`} aria-label="Primary navigation" role="navigation" id="sidebar-nav">
        <div className="sidebar-top">
            <div className="brand">
            <div className="logo" style={{background: 'var(--sidebar-accent)'}}>IS</div>
            <div className="brand-name" style={{color:'var(--sidebar-text)'}}>IELTS Admin</div>
          </div>
          <button className="sidebar-toggle" onClick={() => setIsOpen((s) => !s)} aria-label="Toggle sidebar">
            ☰
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Primary">
          <ul>
            {navItems.map((it) => (
              <li key={it.to} className={location.pathname === it.to ? 'active' : undefined}>
                <Link to={it.to} aria-current={location.pathname === it.to ? 'page' : undefined}>{it.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user">
            <div className="avatar">{user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'AD'}</div>
            <div className="info">
              <div className="name">{user?.fullName}</div>
              <div className="role">{user?.role}</div>
            </div>
          </div>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <div className="main-area" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-toggle" onClick={() => setIsOpen((s) => !s)} aria-label="Toggle sidebar" aria-expanded={isOpen}>☰</button>
            <div className="page-title">Admin</div>
          </div>
          <div className="topbar-right">
            <div className="search" role="search">
              <label htmlFor="admin-search" className="sr-only">Search admin content</label>
              <div className="search-input-wrapper">
                <IconSearch className="search-icon" />
                <input
                  id="admin-search"
                  type="search"
                  placeholder="Search users, courses, exercises..."
                  aria-label="Search admin content"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="topbar-actions" style={{display: 'flex', gap: 12, alignItems: 'center'}}>
              <div className="notif-wrap" ref={notifRef} style={{position:'relative'}}>
                <IconButton
                  label="Notifications"
                  aria-haspopup="true"
                  aria-expanded={notifOpen}
                  onClick={() => setNotifOpen(v => !v)}
                  className="notification-btn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  {/* Notification badge */}
                  <span className="notification-badge">3</span>
                </IconButton>
                {notifOpen && (
                  <div
                    className="notif-dropdown"
                    style={{
                      position:'absolute',
                      right:0,
                      top:'100%',
                      marginTop:8,
                      width:360,
                      background:'white',
                      border:'1px solid #e5e7eb',
                      borderRadius:12,
                      boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                      zIndex:50
                    }}
                    role="menu"
                    aria-label="Notifications menu"
                  >
                    <div style={{padding:20, borderBottom:'1px solid #e5e7eb'}}>
                      <h3 style={{fontSize:16, fontWeight:600, color:'#111827', margin:0}}>Notifications</h3>
                      <p style={{fontSize:14, color:'#6b7280', margin:'4px 0 0 0'}}>You have 3 unread notifications</p>
                    </div>
                    <div style={{maxHeight:400, overflowY:'auto'}}>
                      {/* Sample notifications */}
                      <div style={{padding:16, borderBottom:'1px solid #f3f4f6'}} role="menuitem">
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
                          <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: 6}}></div>
                          <div style={{flex: 1}}>
                            <p style={{fontSize:14, fontWeight:500, color:'#111827', margin:0}}>New user registration</p>
                            <p style={{fontSize:13, color:'#6b7280', margin:'2px 0 0 0'}}>John Doe joined IELTS platform</p>
                            <p style={{fontSize:12, color:'#9ca3af', margin:'4px 0 0 0'}}>2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div style={{padding:16, borderBottom:'1px solid #f3f4f6'}} role="menuitem">
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
                          <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', marginTop: 6}}></div>
                          <div style={{flex: 1}}>
                            <p style={{fontSize:14, fontWeight:500, color:'#111827', margin:0}}>Course completed</p>
                            <p style={{fontSize:13, color:'#6b7280', margin:'2px 0 0 0'}}>Sarah completed Writing Task 1</p>
                            <p style={{fontSize:12, color:'#9ca3af', margin:'4px 0 0 0'}}>1 hour ago</p>
                          </div>
                        </div>
                      </div>
                      <div style={{padding:16}} role="menuitem">
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
                          <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', marginTop: 6}}></div>
                          <div style={{flex: 1}}>
                            <p style={{fontSize:14, fontWeight:500, color:'#111827', margin:0}}>System maintenance</p>
                            <p style={{fontSize:13, color:'#6b7280', margin:'2px 0 0 0'}}>Scheduled maintenance in 2 hours</p>
                            <p style={{fontSize:12, color:'#9ca3af', margin:'4px 0 0 0'}}>3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{padding:16, borderTop:'1px solid #e5e7eb', textAlign:'center'}}>
                      <button
                        style={{
                          fontSize:14,
                          color:'#3b82f6',
                          background:'transparent',
                          border:'none',
                          cursor:'pointer',
                          textDecoration:'underline'
                        }}
                        onClick={() => setNotifOpen(false)}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="user-wrap" ref={userRef} style={{position:'relative'}}>
                <IconButton label="User menu" aria-haspopup="true" aria-expanded={userMenuOpen} onClick={() => setUserMenuOpen(v => !v)}>
                  <span className="avatar-small" style={{display:'inline-flex',width:32,height:32,alignItems:'center',justifyContent:'center',borderRadius:'50%',background:'var(--sidebar-accent)',color:'#ffffff',fontWeight:700}}>
                    {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'AD'}
                  </span>
                </IconButton>
                {userMenuOpen && (
                  <div className="dropdown-menu" role="menu" aria-label="User menu" style={{position:'absolute', right:0, top:40, minWidth:160, background:'#fff', boxShadow:'0 6px 18px rgba(0,0,0,0.08)', borderRadius:8, padding:8, zIndex:60}}>
                    <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}>Profile</button>
                    <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}>Settings</button>
                    <div style={{height:1, background:'#eee', margin:'8px 0'}} />
                    <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="content" role="main" aria-label="Main content">
          <div className="content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
      </>
  );
}
