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
const ReadingHomePage = lazy(() => import("../pages/reading/ReadingHomePage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const UsersPage = lazy(() => import("../pages/users/UsersPage"));
const UserProfilePage = lazy(() => import("../pages/profile/UserProfilePage"));
const CoursesPage = lazy(() => import("../pages/courses/CoursesPage"));
const PlacementTestPage = lazy(() => import("../pages/placement/PlacementTestPage"));
const TestResultPage = lazy(() => import("../pages/placement/TestResultPage"));
const ListeningListPage = lazy(() => import("../pages/listening/ListeningListPage"));
const ListeningPracticePage = lazy(() => import("../pages/listening/ListeningPracticePage"));
const WritingPracticePage = lazy(() => import("../pages/writing/WritingPracticePage"));
const WritingListPage = lazy(() => import("../pages/writing/WritingListPage"));
const WritingHistoryPage = lazy(() => import("../pages/attempts/WritingHistoryPage"));
const AttemptDetailPage = lazy(() => import("../pages/attempts/AttemptDetailPage"));
const SpeakingListPage = lazy(() => import("../pages/speaking/SpeakingListPage"));
const SpeakingPracticePage = lazy(() => import("../pages/speaking/SpeakingPracticePage"));
const SpeakingHistoryPage = lazy(() => import("../pages/attempts/SpeakingHistoryPage"));
const ReadingListPage = lazy(() => import("../pages/reading/ReadingListPage"));
const ReadingPracticePage = lazy(() => import("../pages/reading/ReadingPracticePage"));
const CourseDetailPage = lazy(() => import("../pages/courses/CourseDetailPage"));
const PaymentReturnPage = lazy(() => import("../pages/payments/PaymentReturnPage"));

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
const AdminPlacementTestsPage = lazy(() => import('../pages/admin/placement/AdminPlacementTestsPage'));
const PlacementHistoryPage = lazy(() => import('../pages/placement/PlacementHistoryPage'));
const PlacementTestReviewPage = lazy(() => import('../pages/placement/PlacementTestReviewPage'));
const SettingsPage = lazy(() => import("../pages/admin/SettingsPage"));

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

          {/* Admin routes - nested routing with role check */}
          <Route path="/admin" element={
            <ProtectedRoute requireAuth={true} allowedRoles={['Admin']}>
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
            <Route path="placement-tests" element={<AdminPlacementTestsPage />} />
            <Route path="placement-test/history" element={<PlacementHistoryPage />} />
            <Route path="placement-test/history" element={<PlacementHistoryPage />} />
            <Route path="placement-test/history/:id" element={<PlacementTestReviewPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* User routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <DashboardPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <UserProfilePage />
              </UserLayout>
            </ProtectedRoute>
          } />

          {/* Placement Test */}
          <Route path="/placement-test" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <PlacementTestPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/placement/result" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <TestResultPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/placement-test/history" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <PlacementHistoryPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/placement-test/history/:id" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <PlacementTestReviewPage />
              </UserLayout>
            </ProtectedRoute>
          } />

          <Route path="/reading" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <ReadingHomePage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <UsersPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses" element={
            <UserLayout>
              <CoursesPage />
            </UserLayout>
          } />

          {/* Listening routes */}
          <Route path="/listening" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <ListeningListPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/listening/list" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <ListeningListPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/listening/:id" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <ListeningPracticePage />
            </ProtectedRoute>
          } />

          {/* Writing routes */}
          <Route path="/writing" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <WritingListPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/writing/list" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <WritingListPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/writing/:id" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <WritingPracticePage />
            </ProtectedRoute>
          } />
          <Route path="/writing/history" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <WritingHistoryPage />
              </UserLayout>
            </ProtectedRoute>
          } />

          {/* Speaking routes */}
          <Route path="/speaking" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <SpeakingListPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/speaking/list" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <SpeakingListPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/speaking/:id" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <SpeakingPracticePage />
            </ProtectedRoute>
          } />
          <Route path="/speaking/history" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <SpeakingHistoryPage />
              </UserLayout>
            </ProtectedRoute>
          } />

          {/* Reading routes */}
          <Route path="/reading/list" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <ReadingListPage />
              </UserLayout>
            </ProtectedRoute>
          } />
          <Route path="/reading/:id" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <ReadingPracticePage />
            </ProtectedRoute>
          } />

          <Route path="/courses/:id" element={
            <UserLayout>
              <CourseDetailPage />
            </UserLayout>
          } />

          <Route path="/payment-return" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
              <UserLayout>
                <PaymentReturnPage />
              </UserLayout>
            </ProtectedRoute>
          } />

          <Route path="/attempts/:id" element={
            <ProtectedRoute allowedRoles={['User', 'Student', 'Admin']}>
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
