import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/home/HomePage";
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

export function AppRoutes() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/listening" element={<ListeningHomePage />} /> */}
          <Route path="/reading" element={<ReadingHomePage />} />
          {/* <Route path="/writing" element={<WritingHomePage />} /> */}
          {/* <Route path="/speaking" element={<SpeakingHomePage />} /> */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          {/* Listening list */}
          <Route path="/listening" element={<ListeningListPage />} />

          {/* Listening practice */}
          <Route path="/listening/:id" element={<ListeningPracticePage />} />

          {/* Danh sách đề Writing */}
          <Route path="/writing" element={<WritingListPage />} />

          {/* Trang luyện Writing cho 1 đề */}
          <Route path="/writing/:id" element={<WritingPracticePage />} />

          <Route path="/writing/history" element={<WritingHistoryPage />} />

          <Route path="/attempts/:id" element={<AttemptDetailPage />} />

          <Route path="/speaking" element={<SpeakingListPage />} />
          <Route path="/speaking/:id" element={<SpeakingPracticePage />} />
          <Route path="/speaking/history" element={<SpeakingHistoryPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
