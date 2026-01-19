import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import UserLayout from "../components/layout/UserLayout";
import AdminLayout from "../components/layout/AdminLayout";
// Auth components
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { useAuthStore } from "../stores/authStore";
// import { RoutePreloader } from "../components/common/RoutePreloader"; // Temporarily disabled

// Lazy load pages for better performance
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const UnauthorizedPage = lazy(() => import("../pages/auth/UnauthorizedPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const ReadingHomePage = lazy(() => import("../pages/reading/ReadingHomePage.tsx"));
const HomePage = lazy(() => import("../pages/HomePage"));
const UsersPage = lazy(() => import("../pages/users/UsersPage"));
const CoursesPage = lazy(() => import("../pages/courses/CoursesPage.tsx"));
const ListeningListPage = lazy(() => import("../pages/listening/ListeningListPage.tsx"));
const ListeningPracticePage = lazy(() => import("../pages/listening/ListeningPracticePage.tsx"));
const WritingPracticePage = lazy(() => import("../pages/writing/WritingPracticePage.tsx"));
const WritingListPage = lazy(() => import("../pages/writing/WritingListPage.tsx"));
const WritingHistoryPage = lazy(() => import("../pages/attempts/WritingHistoryPage"));
const AttemptDetailPage = lazy(() => import("../pages/attempts/AttemptDetailPage"));
const SpeakingListPage = lazy(() => import("../pages/speaking/SpeakingListPage"));
const SpeakingPracticePage = lazy(() => import("../pages/speaking/SpeakingPracticePage"));
const SpeakingHistoryPage = lazy(() => import("../pages/attempts/SpeakingHistoryPage"));
const ReadingListPage = lazy(() => import("../pages/reading/ReadingListPage"));
const ReadingPracticePage = lazy(() => import("../pages/reading/ReadingPracticePage"));

// Admin pages (lazy loaded)
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const CoursesListPage = lazy(() => import("../pages/admin/courses/CoursesListPage"));
const CourseDetailsPage = lazy(() => import("../pages/admin/courses/CourseDetailsPage"));
const ExercisesListPage = lazy(() => import("../pages/admin/exercises/ExercisesListPage"));
const ExerciseDetailsPage = lazy(() => import("../pages/admin/exercises/ExerciseDetailsPage"));
const QuestionsListPage = lazy(() => import("../pages/admin/questions/QuestionsListPage"));
const QuestionDetailsPage = lazy(() => import("../pages/admin/questions/QuestionDetailsPage"));
const AttemptsListPage = lazy(() => import("../pages/admin/attempts/AttemptsListPage"));
const AttemptDetailsPage = lazy(() => import("../pages/admin/attempts/AttemptDetailsPage"));
const AttemptGradingPage = lazy(() => import("../pages/admin/attempts/AttemptGradingPage"));
const AdminReportsPage = lazy(() => import("../pages/admin/AdminReportsPage"));

export function AppRoutes() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []); // Remove initializeAuth from dependencies to prevent re-initialization

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute requireAuth={false}>
            <RegisterPage />
          </ProtectedRoute>
        } />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Root -> Home (public) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Admin routes - nested routing */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="courses" element={<CoursesListPage />} />
          <Route path="courses/:id" element={<CourseDetailsPage />} />
          <Route path="exercises" element={<ExercisesListPage />} />
          <Route path="exercises/:id" element={<ExerciseDetailsPage />} />
          <Route path="questions" element={<QuestionsListPage />} />
          <Route path="questions/:id" element={<QuestionDetailsPage />} />
          <Route path="attempts" element={<AttemptsListPage />} />
          <Route path="attempts/:id" element={<AttemptDetailsPage />} />
          <Route path="attempts/:id/grade" element={<AttemptGradingPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>

        {/* User routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <DashboardPage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/reading" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <ReadingHomePage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <UsersPage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <CoursesPage />
            </UserLayout>
          </ProtectedRoute>
        } />

        {/* Listening routes */}
        <Route path="/listening" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <ListeningListPage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/listening/:id" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <ListeningPracticePage />
            </UserLayout>
          </ProtectedRoute>
        } />

        {/* Writing routes */}
        <Route path="/writing" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <WritingListPage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/writing/:id" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <WritingPracticePage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/writing/history" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <WritingHistoryPage />
            </UserLayout>
          </ProtectedRoute>
        } />

        {/* Speaking routes */}
        <Route path="/speaking" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <SpeakingListPage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/speaking/:id" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <SpeakingPracticePage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/speaking/history" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <SpeakingHistoryPage />
            </UserLayout>
          </ProtectedRoute>
        } />

        {/* Reading routes */}
        <Route path="/reading/list" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <ReadingListPage />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/reading/:id" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <ReadingPracticePage />
            </UserLayout>
          </ProtectedRoute>
        } />

        {/* Attempt routes */}
        <Route path="/attempts/:id" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout>
              <AttemptDetailPage />
            </UserLayout>
          </ProtectedRoute>
        } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
