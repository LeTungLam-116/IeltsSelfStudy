import React from 'react';
import LayoutContainer from '../common/LayoutContainer';
import { IconDocument, IconBook, IconEdit, IconBell } from '../icons';

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  exerciseCount: number;
  path: string;
}

export const CategoriesGrid: React.FC = () => {
  const categories: Category[] = [
    {
      id: 'listening',
      title: 'Listening',
      description: 'Luyện tập với bản ghi âm và câu hỏi hiểu biết',
      icon: <IconDocument />,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      exerciseCount: 45,
      path: '/listening'
    },
    {
      id: 'reading',
      title: 'Reading',
      description: 'Cải thiện tốc độ đọc và kỹ năng hiểu biết',
      icon: <IconBook />,
      color: 'bg-green-50 text-green-600 border-green-200',
      exerciseCount: 38,
      path: '/reading'
    },
    {
      id: 'writing',
      title: 'Writing',
      description: 'Luyện tập viết học thuật với hướng dẫn chi tiết',
      icon: <IconEdit />,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      exerciseCount: 29,
      path: '/writing'
    },
    {
      id: 'speaking',
      title: 'Speaking',
      description: 'Xây dựng sự tự tin với bài tập nói và phản hồi',
      icon: <IconBell />,
      color: 'bg-pink-50 text-pink-600 border-pink-200',
      exerciseCount: 24,
      path: '/speaking'
    }
  ];

  return (
    <section className="section-80 bg-white">
      <LayoutContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Chọn Kỹ Năng</h2>
          <p className="text-gray-600 mt-2 content-body">Tập trung vào những lĩnh vực bạn cần nhất. Mỗi kỹ năng có bài tập chuyên biệt giúp bạn tiến bộ nhanh.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => window.location.href = category.path}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.location.href = category.path;
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Navigate to ${category.title} exercises`}
              className={`bg-white rounded-xl p-6 text-center cursor-pointer card-hover-lift flex flex-col justify-center min-h-[200px] hover:bg-teal-50`}
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-xl ${category.color} mb-4 mx-auto text-3xl`}>
                {category.icon}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4">{category.description}</p>

              <div className="text-sm text-gray-500 mt-auto">
                <span className="hidden sm:inline">{category.exerciseCount} exercises</span>
              </div>
            </div>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
};
