import LayoutContainer from '../common/LayoutContainer';
import { Button } from '../ui';

const items = [
  { id: 1, title: 'Bộ đề mô phỏng thật', desc: 'Full test mô phỏng, transcript, lời giải' },
  { id: 2, title: 'Bộ đề theo kỹ năng', desc: 'Sets theo Listening / Reading / Writing / Speaking' },
  { id: 3, title: 'Bộ đề cải thiện band', desc: 'Bài tập nâng band với feedback chuyên sâu' },
];

export default function NewFeatured() {
  return (
    <section className="section-80 bg-white">
      <LayoutContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Bài Tập Nổi Bật</h2>
          <p className="text-gray-600 mt-2 content-body">Chọn bộ đề phù hợp để luyện theo mục tiêu.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(it => (
            <div key={it.id} className="bg-white rounded-xl p-6 shadow-md h-full flex flex-col card-hover-lift">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{it.title}</h3>
              <p className="text-gray-600 mb-4">{it.desc}</p>
              <div className="mt-auto">
                <Button className="bg-teal-600 text-white px-4 py-2 rounded-lg">Bắt đầu</Button>
              </div>
            </div>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
}


