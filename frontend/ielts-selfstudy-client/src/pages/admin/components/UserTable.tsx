import { memo } from 'react';
import type { AdminUser } from '../../../types';
import { TableWrapper, Badge, IconButton } from '../../../components/ui';
import { IconEdit, IconTrash, IconUser } from '../../../components/icons';

interface UserTableProps {
  users: AdminUser[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (selectAll: boolean) => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (id: number) => void;
  isLoading?: boolean;
}

export const UserTable = memo(function UserTable({
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
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <IconUser className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
        <p className="text-gray-600">Hiện tại không có người dùng nào để hiển thị.</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Student': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <TableWrapper>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                aria-label="Chọn tất cả người dùng"
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Người dùng
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Vai trò
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => handleRowSelect(user.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  aria-label={`Chọn người dùng ${user.fullName}`}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-bold text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={`${getRoleBadgeColor(user.role)} font-bold`}>
                  {user.role === 'Admin' ? 'Quản trị viên' : 'Học viên'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.isActive ? 'success' : 'danger'} className="font-bold">
                  {user.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <IconButton
                    onClick={() => onEditUser(user)}
                    className="text-blue-600 hover:bg-blue-50"
                    title="Chỉnh sửa"
                    label={`Sửa người dùng ${user.fullName}`}
                  >
                    <IconEdit className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    onClick={() => onDeleteUser(user.id)}
                    className="text-red-600 hover:bg-red-50"
                    title="Xóa người dùng"
                    label={`Xóa người dùng ${user.fullName}`}
                  >
                    <IconTrash className="w-4 h-4" />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
});
