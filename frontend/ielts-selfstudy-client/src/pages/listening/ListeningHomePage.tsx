import { Link } from 'react-router-dom';
import { IconHeadphones, IconChart } from '../../components/icons';

export default function ListeningHomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Luyện tập IELTS Listening</h1>
          <p className="text-lg text-gray-600">
            Cải thiện kỹ năng nghe với các bài tập chuyên sâu và chi tiết
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4 text-purple-600"><IconHeadphones /></div>
            <h3 className="text-xl font-semibold mb-2">Bài Tập Thực Hành</h3>
            <p className="text-gray-600 mb-4">
              Truy cập các bài nghe và câu hỏi giúp cải thiện kỹ năng nghe hiểu chi tiết của bạn.
            </p>
            <Link
              to="/listening/list"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Bắt đầu luyện nghe →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4 text-green-600"><IconChart /></div>
            <h3 className="text-xl font-semibold mb-2">Theo Dõi Tiến Độ</h3>
            <p className="text-gray-600 mb-4">
              Theo dõi điểm số và độ chính xác của bạn theo thời gian để thấy sự tiến bộ.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Xem tiến độ →
            </Link>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-purple-900">Cấu Trúc Bài Thi Listening</h3>
          <p className="text-gray-700 mb-4">
            Bài thi IELTS Listening gồm 4 phần với 40 câu hỏi, diễn ra trong khoảng 30 phút, cộng thêm 10 phút chuyển đáp án (đối với thi giấy).
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Phần 1:</strong> Cuộc hội thoại giữa hai người trong bối cảnh xã hội thường ngày (ví dụ: thuê nhà, đăng ký dịch vụ).</li>
            <li><strong>Phần 2:</strong> Bài độc thoại trong bối cảnh xã hội thường ngày (ví dụ: bài phát biểu về tiện ích địa phương).</li>
            <li><strong>Phần 3:</strong> Cuộc thảo luận giữa tối đa 4 người trong bối cảnh giáo dục hoặc đào tạo (ví dụ: thảo luận bài tập).</li>
            <li><strong>Phần 4:</strong> Bài độc thoại về chủ đề học thuật (ví dụ: bài giảng đại học).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
