import type { AdminUser } from '../../../types';
import { Badge } from '../../../components/ui';

interface UserRowProps {
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onDelete: (userId: number) => void;
}

export function UserRow({ user, onEdit, onDelete }: UserRowProps) {
  const handleEdit = () => {
    onEdit(user);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      try {
        await onDelete(user.id);
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  return (
    <div className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 border-b border-gray-200">
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
        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      </div>

      {/* Status */}
      <div className="col-span-2">
        <Badge variant={user.isActive ? 'success' : 'danger'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Created Date */}
      <div className="col-span-2 text-sm text-gray-900">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex space-x-2">
        <button
          onClick={handleEdit}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
          title="Edit user"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
          title="Delete user"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
