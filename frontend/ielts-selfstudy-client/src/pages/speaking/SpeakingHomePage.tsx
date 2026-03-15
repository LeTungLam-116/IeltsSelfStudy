import { Link } from 'react-router-dom';
import { IconMicrophone, IconChart } from '../../components/icons';

export default function SpeakingHomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Luyện tập IELTS Speaking</h1>
          <p className="text-lg text-gray-600">
            Cải thiện sự trôi chảy và tự tin với trình mô phỏng thi Speaking AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4 text-orange-600"><IconMicrophone /></div>
            <h3 className="text-xl font-semibold mb-2">Phỏng Vấn Thử</h3>
            <p className="text-gray-600 mb-4">
              Mô phỏng bài thi thật với giám khảo AI. Nhận phản hồi tức thì về độ trôi chảy, phát âm và từ vựng.
            </p>
            <Link
              to="/speaking/list"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Bắt đầu bài thi nói →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4 text-green-600"><IconChart /></div>
            <h3 className="text-xl font-semibold mb-2">Theo Dõi Hiệu Suất</h3>
            <p className="text-gray-600 mb-4">
              Xem lại bản ghi âm, nội dung và phản hồi từ AI để theo dõi sự cải thiện điểm số band của bạn.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Xem tiến độ →
            </Link>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-orange-900">Cấu Trúc Bài Thi Speaking</h3>
          <p className="text-gray-700 mb-4">
            Bài thi IELTS Speaking là cuộc phỏng vấn trực tiếp với giám khảo, kéo dài 11-14 phút.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Phần 1: Giới thiệu (4-5 phút):</strong> Giám khảo hỏi các câu hỏi chung về bản thân, gia đình, công việc, học tập và sở thích.</li>
            <li><strong>Phần 2: Bài nói ngắn (3-4 phút):</strong> Bạn nhận một chủ đề và có 1 phút chuẩn bị, sau đó nói trong 1-2 phút về chủ đề đó.</li>
            <li><strong>Phần 3: Thảo luận (4-5 phút):</strong> Thảo luận sâu hơn với giám khảo về các vấn đề trừu tượng và khái niệm liên quan đến chủ đề ở Phần 2.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
