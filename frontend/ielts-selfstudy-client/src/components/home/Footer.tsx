import React from 'react';
import LayoutContainer from '../common/LayoutContainer';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <LayoutContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-white font-bold mb-3">IELTS Self Study</h4>
            <p className="text-sm">Học mọi lúc, mọi nơi. Chuẩn bị cho bài thi IELTS một cách hiệu quả.</p>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-3">Tài nguyên</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Practice Tests</a></li>
              <li><a href="#" className="hover:underline">Study Materials</a></li>
              <li><a href="#" className="hover:underline">IELTS Tips</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-3">Đăng ký nhận tin</h5>
            <form className="flex gap-2">
              <input type="email" placeholder="Email của bạn" className="px-3 py-2 rounded-md w-full" />
              <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md">Gửi</button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} IELTS Self Study. Bảo lưu mọi quyền.
        </div>
      </LayoutContainer>
    </footer>
  );
};

export default Footer;


