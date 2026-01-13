# Role-Based Authentication Components

This directory contains authentication and authorization components for role-based access control.

## Components

### AdminRoute
Protects routes that require admin privileges.

```tsx
import AdminRoute from '../components/auth/AdminRoute';

<Route path="/admin/*" element={
  <AdminRoute>
    <AdminLayout />
  </AdminRoute>
} />
```

**Features:**
- Redirects non-authenticated users to `/login`
- Redirects non-admin users to `/unauthorized`
- Preserves return URL in login redirect

### UserRoute
Protects routes for regular users (non-admin).

```tsx
import UserRoute from '../components/auth/UserRoute';

<Route path="/*" element={
  <UserRoute>
    <UserLayout />
  </UserRoute>
} />
```

**Features:**
- Redirects non-authenticated users to `/login`
- Redirects admin users to `/admin/dashboard`
- Preserves return URL in login redirect

### RequireAdmin (Alternative)
Alternative syntax for admin route protection.

```tsx
import RequireAdmin from '../components/auth/RequireAdmin';

<RequireAdmin>
  <AdminComponent />
</RequireAdmin>
```

### ProtectedRoute (Legacy)
Original route protection component with flexible role checking.

```tsx
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Admin only
<ProtectedRoute allowedRoles={['Admin']}>
  <AdminContent />
</ProtectedRoute>

// User only
<ProtectedRoute userOnly={true}>
  <UserContent />
</ProtectedRoute>

// Public route that redirects authenticated users
<ProtectedRoute requireAuth={false}>
  <LoginPage />
</ProtectedRoute>
```

## Route Configuration

### Current Setup

```tsx
// Public routes
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/unauthorized" element={<UnauthorizedPage />} />

// User routes (students only)
<Route path="/*" element={
  <UserRoute>
    <UserLayout />
  </UserRoute>
}>
  <Route path="" element={<DashboardPage />} />
  <Route path="practice" element={<PracticePage />} />
  {/* ... other user routes */}
</Route>

// Admin routes (admin only)
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminLayout />
  </AdminRoute>
}>
  <Route path="dashboard" element={<AdminDashboardPage />} />
  {/* ... other admin routes */}
</Route>
```

## Role-Based Behavior

### Admin User Flow
1. Login → Check role === "Admin"
2. Redirect to `/admin/dashboard`
3. Access to all `/admin/*` routes
4. Blocked from user routes (redirect to admin dashboard)

### Student User Flow
1. Login → Check role !== "Admin"
2. Redirect to `/dashboard`
3. Access to all user routes
4. Blocked from admin routes (redirect to unauthorized)

### Unauthenticated User Flow
1. Access protected route → Redirect to `/login`
2. After login → Redirect to appropriate dashboard based on role

## Usage Examples

### Adding New Admin Route
```tsx
// In routes/index.tsx
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminLayout />
  </AdminRoute>
}>
  <Route path="dashboard" element={<AdminDashboardPage />} />
  <Route path="users" element={<UserManagementPage />} />  {/* New route */}
  <Route path="reports" element={<ReportsPage />} />        {/* New route */}
</Route>
```

### Adding New User Route
```tsx
// In routes/index.tsx
<Route path="/*" element={
  <UserRoute>
    <UserLayout />
  </UserRoute>
}>
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="courses" element={<CoursesPage />} />
  <Route path="certificates" element={<CertificatesPage />} />  {/* New route */}
</Route>
```

## Security Notes

- Always use these components to protect sensitive routes
- Role checking happens on every route access
- Components automatically handle redirects
- Consider implementing route-level permissions for fine-grained control
