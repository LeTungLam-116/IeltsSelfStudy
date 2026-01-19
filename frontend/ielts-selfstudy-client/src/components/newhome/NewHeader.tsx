 
import { Link } from 'react-router-dom';
import LayoutContainer from '../common/LayoutContainer';

export default function NewHeader() {
  return (
    <header className="bg-white border-b shadow-sm">
      <LayoutContainer>
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">I</div>
            <span className="font-semibold text-lg">IELTS Self Study</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/listening" className="text-gray-700 hover:text-teal-600">Listening</Link>
            <Link to="/reading" className="text-gray-700 hover:text-teal-600">Reading</Link>
            <Link to="/writing" className="text-gray-700 hover:text-teal-600">Writing</Link>
            <Link to="/speaking" className="text-gray-700 hover:text-teal-600">Speaking</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline text-gray-700 hover:text-teal-600">Đăng nhập</Link>
            <Link to="/register" className="bg-teal-600 text-white px-4 py-2 rounded-md">Đăng ký</Link>
          </div>
        </div>
      </LayoutContainer>
    </header>
  );
}


