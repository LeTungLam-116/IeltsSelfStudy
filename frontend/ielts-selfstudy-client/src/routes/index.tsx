import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import UserLayout from "../components/layout/UserLayout";
import AdminLayout from "../components/layout/AdminLayout";
// Auth components
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminRoute from "../components/auth/AdminRoute";
import UserRoute from "../components/auth/UserRoute";
// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
// import ListeningHomePage from "../pages/listening/ListeningHomePage";
import ReadingHomePage from "../pages/reading/ReadingHomePage.tsx";
// import WritingHomePage from "../pages/writing/WritingHomePage";
// import SpeakingHomePage from "../pages/speaking/SpeakingHomePage";
import UsersPage from "../pages/users/UsersPage";
import CoursesPage from "../pages/courses/CoursesPage.tsx";
import ListeningListPage from "../pages/listening/ListeningListPage.tsx";
import ListeningPracticePage from "../pages/listening/ListeningPracticePage.tsx";
import WritingPracticePage from "../pages/writing/WritingPracticePage.tsx";
import WritingListPage from "../pages/writing/WritingListPage.tsx";
import WritingHistoryPage from "../pages/attempts/WritingHistoryPage";
import AttemptDetailPage from "../pages/attempts/AttemptDetailPage";
import SpeakingListPage from "../pages/speaking/SpeakingListPage";
import SpeakingPracticePage from "../pages/speaking/SpeakingPracticePage";
import SpeakingHistoryPage from "../pages/attempts/SpeakingHistoryPage";
import ProfilePage from "../pages/profile/ProfilePage";
import PracticePage from "../pages/practice/PracticePage";
import HistoryPage from "../pages/history/HistoryPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ExercisesManagementPage from "../pages/admin/ExercisesManagementPage";
import ExerciseDetailPage from "../pages/admin/ExerciseDetailPage";
import CoursesManagementPage from "../pages/admin/CoursesManagementPage";
import CourseDetailPage from "../pages/admin/CourseDetailPage";
import UserDetailPage from "../pages/users/UserDetailPage";
import { useAuthStore } from "../stores/authStore";

export function AppRoutes() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
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

        {/* User-only routes (Students only) */}
        <Route path="/*" element={
          <UserRoute>
            <UserLayout />
          </UserRoute>
        }>
          <Route path="" element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="reading" element={<ReadingHomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="listening" element={<ListeningListPage />} />
          <Route path="listening/:id" element={<ListeningPracticePage />} />
          <Route path="writing" element={<WritingListPage />} />
          <Route path="writing/:id" element={<WritingPracticePage />} />
          <Route path="writing/history" element={<WritingHistoryPage />} />
          <Route path="speaking" element={<SpeakingListPage />} />
          <Route path="speaking/:id" element={<SpeakingPracticePage />} />
          <Route path="speaking/history" element={<SpeakingHistoryPage />} />
          <Route path="attempts/:id" element={<AttemptDetailPage />} />
        </Route>

        {/* Admin routes - Only for Admin role */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route path="" element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />

          {/* Content Management */}
          <Route path="exercises/*" element={<ExercisesManagementPage />} />
          <Route path="exercises/:type/:id" element={<ExerciseDetailPage />} />

          {/* Courses Management */}
          <Route path="courses" element={<CoursesManagementPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />

          {/* Users Management */}
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />

          {/* Reports & Analytics */}
          <Route path="reports/attempts-by-exercise" element={<div>Attempts by Exercise Report</div>} />
          <Route path="reports/attempts-by-user" element={<div>Attempts by User Report</div>} />

          {/* System Settings */}
          <Route path="settings" element={<div>System Settings - OpenAI API Status</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
