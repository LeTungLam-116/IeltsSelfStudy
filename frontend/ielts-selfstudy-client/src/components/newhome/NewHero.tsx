 
import LayoutContainer from '../common/LayoutContainer';
import { Button, Input } from '../ui';

export default function NewHero() {
  return (
    <section className="bg-gradient-to-br from-teal-50 to-white py-20">
      <LayoutContainer>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Chinh phục IELTS với <span className="text-teal-600">Khóa Học Tự Học Chuyên Nghiệp</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700 content-body mx-auto">Luyện tập Listening, Reading, Writing và Speaking với bài tập theo cấu trúc thật, kèm lời giải và feedback.</p>

          <div className="mt-6 max-w-2xl mx-auto">
            <div className="flex gap-3 justify-center">
              <Input placeholder="Tìm kiếm bài tập, khóa học..." className="flex-1" />
              <Button className="bg-teal-600 text-white px-4">Tìm kiếm</Button>
            </div>
            <div className="mt-6 flex gap-4 justify-center">
              <Button className="bg-teal-600 text-white px-6 py-3 rounded-md">Bắt đầu học ngay</Button>
              <Button variant="outline" className="px-6 py-3 rounded-md">Xem khóa học</Button>
            </div>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}


