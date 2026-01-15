import type { UserDto } from '../AdminUsersPage';
import UserStatusBadge from './UserStatusBadge';

interface UserRowProps {
  user: UserDto;
  onEdit: (user: UserDto) => void;
  onToggleStatus: (userId: number) => void;
  onDelete: (user: UserDto) => void;
}

export default function UserRow({ user, onEdit, onToggleStatus, onDelete }: UserRowProps) {
  const handleEdit = () => {
    onEdit(user);
  };

  const handleToggleStatus = () => {
    onToggleStatus(user.id);
  };

  const handleDelete = () => {
    onDelete(user);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
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
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'admin'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <UserStatusBadge isActive={user.isActive} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button
          onClick={handleEdit}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
          title="Edit user"
        >
          Edit
        </button>
        <button
          onClick={handleToggleStatus}
          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
            user.isActive
              ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
              : 'text-green-700 bg-green-100 hover:bg-green-200'
          }`}
          title={user.isActive ? 'Deactivate user' : 'Activate user'}
        >
          {user.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
          title="Delete user"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
