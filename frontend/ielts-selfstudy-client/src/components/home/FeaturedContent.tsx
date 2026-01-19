import React from 'react';
import LayoutContainer from '../common/LayoutContainer';
import { Button } from '../ui';

export const FeaturedContent: React.FC = () => {
  const cards = [
    { id: 1, title: 'Bộ đề mô phỏng thật', desc: 'Full test mô phỏng, transcript, lời giải', cta: 'Bắt đầu' },
    { id: 2, title: 'Bộ đề theo kỹ năng', desc: 'Sets theo Listening / Reading / Writing / Speaking', cta: 'Khám phá' },
    { id: 3, title: 'Bộ đề cải thiện band', desc: 'Bài tập nâng band với feedback chuyên sâu', cta: 'Xem thêm' },
  ];

  return (
    <section className="section-80 bg-white">
      <LayoutContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Bài Tập Nổi Bật</h2>
          <p className="text-gray-600 mt-2 content-body">Các bộ đề tuyển chọn giúp bạn luyện tập hiệu quả, sát với cấu trúc đề thật.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.id} className="h-full">
              <div className="card-hover-lift h-full">
                <div className="bg-white rounded-xl p-6 shadow-md h-full flex flex-col">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 mb-4">{card.desc}</p>
                  <div className="mt-auto">
                    <Button className="bg-teal-600 text-white px-4 py-2 rounded-lg">{card.cta}</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
};

export default FeaturedContent;


