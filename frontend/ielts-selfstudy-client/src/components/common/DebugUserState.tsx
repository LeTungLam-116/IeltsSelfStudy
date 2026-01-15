import { useAuthStore } from '../../stores/authStore';

export default function DebugUserState() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="mb-2 font-bold">🔧 Debug User State</div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Loading: {isLoading ? '⏳' : '✅'}</div>
      <div>User: {user ? '✅' : '❌'}</div>
      {user && (
        <div className="mt-1">
          <div>ID: {user.id}</div>
          <div>Email: {user.email}</div>
          <div>Role: {user.role}</div>
          <div>Name: {user.fullName}</div>
        </div>
      )}
    </div>
  );
}
