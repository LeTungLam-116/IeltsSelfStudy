import { Link } from 'react-router-dom';
import { IconPen, IconChart } from '../../components/icons';

export default function WritingHomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Luyện tập IELTS Writing</h1>
          <p className="text-lg text-gray-600">
            Chinh phục bài thi Writing (Học thuật & Tổng quát) với hướng dẫn thực hành và phản hồi AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4 text-blue-600"><IconPen /></div>
            <h3 className="text-xl font-semibold mb-2">Bài Tập Thực Hành</h3>
            <p className="text-gray-600 mb-4">
              Truy cập thư viện đề bài Task 1 và Task 2 phong phú. Nhận chấm điểm và sửa lỗi chi tiết ngay lập tức từ AI.
            </p>
            <Link
              to="/writing/list"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bắt đầu luyện viết →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4 text-green-600"><IconChart /></div>
            <h3 className="text-xl font-semibold mb-2">Theo Dõi Sự Tiến Bộ</h3>
            <p className="text-gray-600 mb-4">
              Theo dõi điểm số về từ vựng, ngữ pháp và sự mạch lạc theo thời gian để đảm bảo bạn sẵn sàng cho kỳ thi.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Xem tiến độ →
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Cấu Trúc Bài Thi Writing</h3>
          <p className="text-gray-700 mb-4">
            Bài thi IELTS Writing gồm 2 phần cần hoàn thành trong 60 phút.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Task 1 (20 phút):</strong> Bạn được yêu cầu mô tả thông tin hình ảnh (biểu đồ/bảng) bằng lời văn của mình (Học thuật) hoặc viết một lá thư (Tổng quát). Viết ít nhất 150 từ.</li>
            <li><strong>Task 2 (40 phút):</strong> Bạn được yêu cầu viết một bài luận phản hồi về một quan điểm, lập luận hoặc vấn đề. Viết ít nhất 250 từ. Task 2 chiếm tỷ trọng điểm gấp đôi Task 1.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
