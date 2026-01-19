
import LayoutContainer from '../common/LayoutContainer';

const skills = [
  { id: 'listening', name: 'Listening', desc: 'Luyện tập với bản ghi âm và câu hỏi hiểu biết', emoji: '🎧' },
  { id: 'reading', name: 'Reading', desc: 'Cải thiện tốc độ đọc và kỹ năng hiểu biết', emoji: '📚' },
  { id: 'writing', name: 'Writing', desc: 'Luyện tập viết học thuật với hướng dẫn', emoji: '✍️' },
  { id: 'speaking', name: 'Speaking', desc: 'Xây dựng sự tự tin khi nói', emoji: '🗣️' },
];

export default function NewSkills() {
  return (
    <section className="section-80 bg-white">
      <LayoutContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Chọn Kỹ Năng</h2>
          <p className="text-gray-600 mt-2 content-body">Tập trung vào kỹ năng bạn cần cải thiện.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map(s => (
            <div key={s.id} role="button" tabIndex={0} onClick={() => window.location.href = `/${s.id}`} className="bg-white rounded-xl p-6 text-center cursor-pointer card-hover-lift hover:bg-teal-50">
              <div className="text-4xl mb-3">{s.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.name}</h3>
              <p className="text-gray-600 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
}


