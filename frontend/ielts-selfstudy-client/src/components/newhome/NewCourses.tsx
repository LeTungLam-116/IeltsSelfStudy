 
import LayoutContainer from '../common/LayoutContainer';
import { Button } from '../ui';

const courses = [
  { id: 1, title: 'IELTS Fundamentals', band: '4.0–6.0', benefit: 'Phù hợp người mới bắt đầu', price: '0đ' },
  { id: 2, title: 'Academic IELTS Mastery', band: '6.0–7.5', benefit: 'Lộ trình chi tiết theo kỹ năng', price: '199.000đ' },
  { id: 3, title: 'Band 8+ Intensive', band: '7.5–9.0', benefit: 'Phù hợp ôn luyện nâng band', price: '499.000đ' },
];

export default function NewCourses() {
  return (
    <section className="section-80 bg-gray-50">
      <LayoutContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Khóa học phổ biến</h2>
          <p className="text-gray-600 mt-2 content-body">Các khóa học nổi bật, phù hợp cho các mục tiêu khác nhau.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => (
            <div key={c.id} className="bg-white rounded-xl p-6 shadow-md h-full flex flex-col card-hover-lift">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="text-teal-600 font-semibold">Khóa học</div>
                  <div className="text-gray-500">{c.band}</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-gray-600 mb-4">{c.benefit}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-gray-700 font-semibold">{c.price}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Xem chi tiết</Button>
                  <Button className="bg-teal-600 text-white">Bắt đầu</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
}


