import React from 'react';
import LayoutContainer from '../common/LayoutContainer';
import { Button } from '../ui';
import CoursePreviewModal from './CoursePreviewModal';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const demoCourses = [
  { id: 1, title: 'IELTS Fundamentals', description: 'Giới thiệu cơ bản cho tất cả 4 kỹ năng', price: '0đ', skill: 'General', targetBand: '4.0–6.0', benefit: 'Phù hợp người mới bắt đầu' },
  { id: 2, title: 'Academic IELTS Mastery', description: 'Chuẩn bị toàn diện cho Academic', price: '199.000đ', skill: 'Academic', targetBand: '6.0–7.5', benefit: 'Lộ trình chi tiết theo kỹ năng' },
  { id: 3, title: 'Band 8+ Intensive', description: 'Lộ trình tăng band nhanh', price: '499.000đ', skill: 'Advanced', targetBand: '7.5–9.0', benefit: 'Phù hợp ôn luyện nâng band' },
];

export const CoursesGrid: React.FC = () => {
  const [previewCourse, setPreviewCourse] = React.useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { ensureAuth } = useAuthGuard();

  const openPreview = (course: any) => {
    setPreviewCourse(course);
    setIsModalOpen(true);
  };

  return (
    <section className="section-80 bg-gray-50">
      <LayoutContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Khóa học phổ biến</h2>
          <p className="text-gray-600 mt-2 content-body">Khóa học được thiết kế theo trình độ, có preview và dễ bắt đầu</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoCourses.map(course => (
            <div key={course.id} className="h-full">
              <div className="card-hover-lift h-full">
                <div className="bg-white rounded-xl p-6 shadow-md h-full flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-teal-600 font-semibold">{course.skill}</div>
                      <div className="text-sm text-gray-500">{course.targetBand}</div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4">{course.benefit}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-gray-700 font-semibold">{course.price}</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => openPreview(course)}>Xem chi tiết</Button>
                      <Button onClick={() => ensureAuth({ type: 'page', path: `/courses/${course.id}`, payload: { courseId: course.id } })} className="bg-teal-600 text-white">Bắt đầu</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </LayoutContainer>
      
      <CoursePreviewModal open={isModalOpen} onClose={() => setIsModalOpen(false)} course={previewCourse} />
    </section>
  );
};

export default CoursesGrid;


