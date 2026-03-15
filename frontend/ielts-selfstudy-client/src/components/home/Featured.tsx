import LayoutContainer from '../common/LayoutContainer';

const items = [
  { id: 1, title: 'Bộ đề mô phỏng thật', desc: 'Hệ thống Full test mô phỏng y hệt thi thật, có transcript và lời giải chi tiết từng câu.', icon: '🎯' },
  { id: 2, title: 'Luyện tập theo kỹ năng', desc: 'Kho bài tập phân loại theo từng dạng bài trong Listening, Reading, Writing và Speaking.', icon: '🧩' },
  { id: 3, title: 'Lộ trình bứt phá band', desc: 'Các bài tập trọng tâm được thiết kế riêng để giúp bạn nâng band điểm thần tốc.', icon: '🔥' },
];

export default function Featured() {
  return (
    <section
      style={{
        padding: '60px 0',
        backgroundColor: '#ffffff'
      }}
    >
      <LayoutContainer>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {items.map(it => (
            <div
              key={it.id}
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '24px',
                padding: '32px',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                transition: 'all 0.3s ease',
                border: '1px solid transparent'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#0071f930';
                e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(0, 113, 249, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: '32px',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                lineHeight: 1
              }}>
                {it.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '8px'
                }}>
                  {it.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
}
