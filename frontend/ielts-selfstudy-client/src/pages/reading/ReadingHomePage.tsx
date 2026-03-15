import { Link } from 'react-router-dom';
import { IconBook, IconChart } from '../../components/icons';

export default function ReadingHomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Luyện tập IELTS Reading</h1>
          <p className="text-lg text-gray-600">
            Cải thiện kỹ năng đọc của bạn với các bài tập IELTS Reading toàn diện
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4"><IconBook /></div>
            <h3 className="text-xl font-semibold mb-2">Bài Tập Thực Hành</h3>
            <p className="text-gray-600 mb-4">
              Truy cập kho bài đọc và câu hỏi đa dạng được thiết kế để nâng cao kỹ năng Reading của bạn.
            </p>
            <Link
              to="/reading/list"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bắt đầu luyện tập →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4"><IconChart /></div>
            <h3 className="text-xl font-semibold mb-2">Theo Dõi Tiến Độ</h3>
            <p className="text-gray-600 mb-4">
              Theo dõi lịch sử làm bài và xem sự sự tiến bộ của bạn theo thời gian.
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
          <h3 className="text-lg font-semibold mb-2">Cấu Trúc Bài Thi Reading</h3>
          <p className="text-gray-700 mb-4">
            Bài thi IELTS Reading gồm 3 phần với 40 câu hỏi cần hoàn thành trong 60 phút. Mỗi phần chứa một bài đọc dài kèm câu hỏi.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Phần 1:</strong> Các văn bản liên quan đến đời sống hàng ngày tại các nước nói tiếng Anh</li>
            <li><strong>Phần 2:</strong> Các văn bản liên quan đến đào tạo hoặc việc làm</li>
            <li><strong>Phần 3:</strong> Các văn bản học thuật chuyên sâu về giáo dục hoặc nghiên cứu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
