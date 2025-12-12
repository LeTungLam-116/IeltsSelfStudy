import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/home/HomePage";
import ListeningHomePage from "../pages/listening/ListeningHomePage";
import ReadingHomePage from "../pages/reading/ReadingHomePage.tsx";
import WritingHomePage from "../pages/writing/WritingHomePage";
import SpeakingHomePage from "../pages/speaking/SpeakingHomePage";
import UsersPage from "../pages/users/UsersPage";
import CoursesPage from "../pages/courses/CoursesPage.tsx";


export function AppRoutes() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listening" element={<ListeningHomePage />} />
          <Route path="/reading" element={<ReadingHomePage />} />
          <Route path="/writing" element={<WritingHomePage />} />
          <Route path="/speaking" element={<SpeakingHomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/courses" element={<CoursesPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
