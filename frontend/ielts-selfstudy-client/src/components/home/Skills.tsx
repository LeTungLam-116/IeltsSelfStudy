import { useNavigate } from 'react-router-dom';
import LayoutContainer from '../common/LayoutContainer';

const skills = [
    { id: 'listening', name: 'Listening', desc: 'Luyện tập với bản ghi âm và câu hỏi hiểu biết', emoji: '🎧', color: '#0071f9' },
    { id: 'reading', name: 'Reading', desc: 'Cải thiện tốc độ đọc và kỹ năng hiểu biết', emoji: '📚', color: '#10b981' },
    { id: 'writing', name: 'Writing', desc: 'Luyện tập viết học thuật với hướng dẫn', emoji: '✍️', color: '#f59e0b' },
    { id: 'speaking', name: 'Speaking', desc: 'Xây dựng sự tự tin khi nói', emoji: '🗣️', color: '#8b5cf6' },
];

export default function Skills() {
    const navigate = useNavigate();

    return (
        <section
            style={{
                padding: '80px 0',
                backgroundColor: '#ffffff'
            }}
        >
            <LayoutContainer>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: 800,
                        color: '#1e293b',
                        marginBottom: '16px',
                        letterSpacing: '-0.02em'
                    }}>
                        Luyện tập <span style={{ color: '#0071f9' }}>Toàn Diện</span>
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#64748b',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        Tập trung nâng cao từng kỹ năng với kho bài tập bám sát đề thi thật và hệ thống chấm điểm tự động.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px'
                }}>
                    {skills.map(s => (
                        <div
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/${s.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    navigate(`/${s.id}`);
                                }
                            }}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '24px',
                                padding: '40px 24px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            className="card-hover-lift"
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = s.color;
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = `0 20px 25px -5px ${s.color}15`;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#f1f5f9';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            {/* Background Icon Accent */}
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                fontSize: '80px',
                                opacity: 0.03,
                                zIndex: 0,
                                transform: 'rotate(15deg)'
                            }}>
                                {s.emoji}
                            </div>

                            <div style={{
                                width: '72px',
                                height: '72px',
                                backgroundColor: `${s.color}10`,
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px auto',
                                fontSize: '32px',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {s.emoji}
                            </div>

                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#1e293b',
                                marginBottom: '12px',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {s.name}
                            </h3>

                            <p style={{
                                fontSize: '14px',
                                color: '#64748b',
                                lineHeight: 1.5,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {s.desc}
                            </p>

                            <div style={{
                                marginTop: '24px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: s.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}>
                                Bắt đầu ngay <span>→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </LayoutContainer>
        </section>
    );
}
