import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface MenuItem {
  path: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },

  // Content Management Section
  {
    path: '/admin/content',
    label: 'Content Management',
    icon: '📝',
    children: [
      { path: '/admin/content', label: 'Content Manager', icon: '📝' },
      { path: '/admin/exercises', label: 'Exercises', icon: '✏️' },
      { path: '/admin/courses', label: 'Courses', icon: '📚' },
    ]
  },

  // Users Management
  { path: '/admin/users', label: 'Users', icon: '👥' },

  // Reports & Analytics
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: '📊',
    children: [
      { path: '/admin/reports/attempts-by-exercise', label: 'By Exercise', icon: '📈' },
      { path: '/admin/reports/attempts-by-user', label: 'By User', icon: '👤' },
    ]
  },

  // System Settings
  { path: '/admin/settings', label: 'System Settings', icon: '⚙️' },
];

interface MenuItemComponentProps {
  item: MenuItem;
  level?: number;
}

function MenuItemComponent({ item, level = 0 }: MenuItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = level * 16 + 16; // Base 16px + 16px per level

  if (hasChildren && item.children) {
    return (
      <div>
        {/* Parent Menu Item */}
        <div className="px-4 py-2 text-sm font-medium text-gray-400 uppercase tracking-wide">
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </div>

        {/* Child Items */}
        <div className="space-y-1">
          {item.children.map((child, index) => (
            <MenuItemComponent key={`${child.path}-${index}`} item={child} level={level + 1} />
          ))}
        </div>
      </div>
    );
  }

  // Regular menu item
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out transform ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-[1.02] border border-blue-500/50'
            : 'text-gray-300 hover:bg-gray-700/80 hover:text-white hover:scale-[1.01] hover:shadow-md'
        }`
      }
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <span className="mr-3 text-base transition-transform group-hover:scale-110">{item.icon}</span>
      <span className="font-medium">{item.label}</span>

      {/* Active indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
    </NavLink>
  );
}

export default function AdminSidebar() {
  const { user } = useAuthStore();

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col shadow-xl border-r border-gray-700">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-blue-400 tracking-tight">Admin Panel</h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">IELTS Self Study</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-white">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-gray-100">{user?.fullName || 'Admin'}</p>
            <p className="text-xs text-gray-400 font-medium">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <MenuItemComponent key={`${item.path}-${index}`} item={item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-sm">
        <p className="text-xs text-gray-500 text-center font-medium">
          © 2024 IELTS Self Study
        </p>
      </div>
    </div>
  );
}
