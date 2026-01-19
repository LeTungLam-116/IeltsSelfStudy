// React import not required
import type { AdminUser } from '../../../types';

interface UserTableProps {
  users: AdminUser[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (selectAll: boolean) => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (id: number) => void;
  isLoading?: boolean;
}

export function UserTable({
  users,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEditUser,
  onDeleteUser,
  isLoading = false
}: UserTableProps) {
  const allSelected = users.length > 0 && selectedIds.length === users.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  const handleRowSelect = (id: number) => {
    onToggleSelect(id);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-4 flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="ml-4">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1 flex space-x-2">
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">
            There are no users to display.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="hidden md:grid md:grid-cols-12 md:gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Select all users"
            />
          </div>
          <div className="col-span-4">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-1">Actions</div>
        </div>
        {/* Mobile header - just show select all */}
        <div className="md:hidden flex items-center justify-between">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            aria-label="Select all users"
          />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {users.length} users
          </span>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="px-6 py-4 hover:bg-gray-50 border-b border-gray-200">
            {/* Desktop view */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
            {/* Checkbox */}
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(user.id)}
                onChange={() => handleRowSelect(user.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                aria-label={`Select user ${user.fullName}`}
              />
            </div>

            {/* User Info */}
            <div className="col-span-4 flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {user.fullName}
                </div>
                <div className="text-sm text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="col-span-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === 'Admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Created Date */}
            <div className="col-span-2 text-sm text-gray-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>

            {/* Actions */}
            <div className="col-span-1 flex space-x-2">
              <button
                onClick={() => onEditUser(user)}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                aria-label={`Edit user ${user.fullName}`}
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteUser(user.id)}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
                aria-label={`Delete user ${user.fullName}`}
              >
                Delete
              </button>
            </div>
            </div>

            {/* Mobile view - card layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => handleRowSelect(user.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    aria-label={`Select user ${user.fullName}`}
                  />
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-xs">
                        {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditUser(user)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium px-2 py-1 rounded"
                    aria-label={`Edit user ${user.fullName}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium px-2 py-1 rounded"
                    aria-label={`Delete user ${user.fullName}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'Admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
