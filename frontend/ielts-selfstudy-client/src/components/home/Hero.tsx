import React from 'react';
import { Button, Input } from '../ui';
import { useAuthGuard } from '../../hooks/useAuthGuard';

export const Hero: React.FC = () => {
  const { ensureAuth } = useAuthGuard();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleStartPractice = () => {
    ensureAuth({
      type: 'page',
      path: '/dashboard',
      payload: null
    });
  };

  const handleBrowseCourses = () => {
    // Navigate to courses page - public action
    window.location.href = '/courses';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to courses with search query
      window.location.href = `/courses?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="hero-compact relative bg-gradient-to-br from-teal-50 via-white to-teal-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-site mx-auto text-center">
        <div className="content-body">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Chinh phục IELTS với <br />
            <span className="text-teal-600">Khóa Học Tự Học Chuyên Nghiệp</span>
          </h1>

          <p className="text-lg text-gray-700 mb-6">
            Luyện tập Listening, Reading, Writing và Speaking với bài tập theo cấu trúc thật, kèm lời giải và feedback.
          </p>

        {/* Search in hero */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6" role="search">
          <div className="flex items-center gap-3 justify-center">
            <Input
              type="text"
              placeholder="Tìm kiếm bài tập, khóa học..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1"
              aria-label="Tìm kiếm bài tập"
            />
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg">Tìm kiếm</Button>
          </div>
        </form>

        <div className="flex justify-center gap-4">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold" onClick={handleStartPractice}>Bắt đầu học ngay</Button>
          <Button variant="outline" className="px-6 py-3 rounded-lg" onClick={handleBrowseCourses}>Xem khóa học</Button>
        </div>
      </div>
      </div>
    </section>
  );
};
