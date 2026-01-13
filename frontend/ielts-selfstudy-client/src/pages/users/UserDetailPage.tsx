import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, type UserDto } from '../../api/userApi';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const userData = await getUserById(Number(id));
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Error</div>
        <p className="text-gray-600">{error || 'User not found'}</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/users')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Users
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-2xl font-medium text-gray-700">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900">{user.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="text-sm text-gray-900">{user.role}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">IELTS Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Target Band Score</dt>
                    <dd className="text-sm text-gray-900">
                      {user.targetBand ? user.targetBand : 'Not set'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd className="text-sm text-gray-900">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">-</div>
            <div className="text-sm text-gray-500">Total Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">-</div>
            <div className="text-sm text-gray-500">Completed Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">-</div>
            <div className="text-sm text-gray-500">Average Score</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Statistics will be available once attempt tracking is implemented
        </p>
      </div>
    </div>
  );
}
