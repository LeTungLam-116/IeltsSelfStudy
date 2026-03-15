
import { useLocation, useNavigate } from 'react-router-dom';
import type { PlacementTestResultDto } from '../../api/placementTestApi';
import { Button, Card } from '../../components/ui';

// ── Score Bar ────────────────────────────────────────────────────────────────

const SKILL_LABELS: Record<string, { vi: string; emoji: string; color: string }> = {
    Grammar: { vi: 'Ngữ pháp', emoji: '🧠', color: '#3b82f6' },
    Listening: { vi: 'Nghe', emoji: '🎧', color: '#8b5cf6' },
    Speaking: { vi: 'Nói', emoji: '🎤', color: '#f59e0b' },
    Writing: { vi: 'Viết', emoji: '✍️', color: '#10b981' },
};

function ScoreBar({ label, score }: { label: string; score: number }) {
    const meta = SKILL_LABELS[label] ?? { vi: label, emoji: '📊', color: '#64748b' };
    const notTested = score === 0;
    const pct = (score / 9) * 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {meta.emoji} {meta.vi}
                </span>
                {notTested ? (
                    <span style={{
                        fontSize: '12px', fontWeight: 600, color: '#94a3b8',
                        backgroundColor: '#f1f5f9', padding: '2px 10px', borderRadius: '99px',
                        border: '1px solid #e2e8f0'
                    }}>
                        Chưa thi
                    </span>
                ) : (
                    <span style={{
                        fontWeight: 800, fontSize: '16px', color: meta.color,
                        backgroundColor: `${meta.color}15`, padding: '2px 10px', borderRadius: '99px'
                    }}>
                        {score}
                    </span>
                )}
            </div>
            {!notTested && (
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: '99px',
                        backgroundColor: meta.color, transition: 'width 0.8s ease'
                    }} />
                </div>
            )}
        </div>
    );
}

// ── Band Level Label ─────────────────────────────────────────────────────────

function getBandLabel(band: number): string {
    if (band >= 8.5) return 'Xuất sắc — Expert';
    if (band >= 7.5) return 'Giỏi — Very Good';
    if (band >= 6.5) return 'Khá — Competent';
    if (band >= 5.5) return 'Trung bình khá — Modest';
    if (band >= 4.5) return 'Trung bình — Limited';
    if (band >= 3.5) return 'Yếu — Extremely Limited';
    return 'Mới bắt đầu — Beginner';
}

function getBandColor(band: number): string {
    if (band >= 7.5) return '#22c55e';
    if (band >= 6.0) return '#3b82f6';
    if (band >= 4.5) return '#f59e0b';
    return '#ef4444';
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TestResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result as PlacementTestResultDto;

    if (!result) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Không tìm thấy kết quả. Bạn chưa làm bài hoặc đã tải lại trang.</p>
                <Button onClick={() => navigate('/dashboard')}>Về trang chủ</Button>
            </div>
        );
    }

    let roadmap: any = { analysis: '', roadmap: [], recommendations: [], encouragement: '', suggestedCourses: [] };
    try { roadmap = JSON.parse(result.roadmapJson); } catch { /* ignore */ }

    const bandColor = getBandColor(result.overallBand);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '48px 16px' }}>
            <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                {/* ── Header ── */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                        Năng lực IELTS của bạn đã được đánh giá!
                    </h1>
                    <p style={{ color: '#64748b' }}>Dựa trên bài kiểm tra đầu vào vừa hoàn thành</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

                    {/* ── Cột Trái: Điểm số ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Overall Band */}
                        <Card className="p-8 text-center" style={{ borderTop: `4px solid ${bandColor}` }}>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                                Band tổng thể
                            </p>
                            <div style={{
                                width: '128px', height: '128px', margin: '0 auto 16px',
                                borderRadius: '50%', border: `8px solid ${bandColor}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '40px', fontWeight: 900, color: bandColor,
                                backgroundColor: `${bandColor}15`
                            }}>
                                {result.overallBand}
                            </div>
                            <p style={{ fontWeight: 700, color: bandColor, fontSize: '15px', marginBottom: '20px' }}>
                                {getBandLabel(result.overallBand)}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <ScoreBar label="Grammar" score={result.grammarScore} />
                                <ScoreBar label="Listening" score={result.listeningScore} />
                                <ScoreBar label="Speaking" score={result.speakingScore} />
                                <ScoreBar label="Writing" score={result.writingScore} />
                            </div>
                        </Card>

                        {/* Lời khuyên */}
                        {roadmap.recommendations?.length > 0 && (
                            <Card className="p-6" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>⭐ Lời khuyên từ AI</h3>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {roadmap.recommendations.map((rec: string, i: number) => (
                                        <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#c7d2fe' }}>
                                            <span>•</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    {/* ── Cột Phải: Phân tích & Lộ trình ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Phân tích AI */}
                        {roadmap.analysis && (
                            <Card className="p-6" style={{ borderLeft: '4px solid #22c55e' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    🤖 Phân tích từ AI Tutor
                                </h3>
                                <p style={{ color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                    {roadmap.analysis}
                                </p>
                                {roadmap.encouragement && (
                                    <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: 500, color: '#16a34a', fontStyle: 'italic' }}>
                                        "{roadmap.encouragement}"
                                    </p>
                                )}
                            </Card>
                        )}

                        {/* Lộ trình học */}
                        {roadmap.roadmap?.length > 0 && (
                            <Card className="p-8">
                                <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#1e293b', marginBottom: '24px' }}>
                                    📅 Lộ trình học đề xuất
                                </h3>
                                <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                    {roadmap.roadmap.map((phase: any, i: number) => (
                                        <div key={i} style={{ paddingLeft: '28px', position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute', left: '-9px', top: '4px',
                                                width: '16px', height: '16px', borderRadius: '50%',
                                                backgroundColor: '#3b82f6', border: '3px solid white',
                                                boxShadow: '0 0 0 2px #3b82f6'
                                            }} />
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                                                <h4 style={{ fontWeight: 700, color: '#3b82f6', fontSize: '15px', margin: 0 }}>
                                                    {phase.phase}
                                                </h4>
                                                {phase.duration && (
                                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                                                        ({phase.duration})
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ color: '#64748b', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '14px' }}>
                                                {phase.focus}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <Button variant="outline" onClick={() => navigate('/placement-test/history')}>
                                        Xem lịch sử thi
                                    </Button>
                                    <Button onClick={() => navigate('/dashboard')} className="bg-gray-900 text-white px-8">
                                        Bắt đầu học ngay →
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Khóa học đề xuất */}
                        {roadmap.suggestedCourses?.length > 0 && (
                            <Card className="p-8" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#92400e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    🎓 Khóa học phù hợp với bạn
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                                    {roadmap.suggestedCourses.map((course: any, i: number) => (
                                        <div key={i} style={{
                                            backgroundColor: 'white', padding: '18px', borderRadius: '14px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #fde68a',
                                            display: 'flex', flexDirection: 'column', gap: '8px'
                                        }}>
                                            <h5 style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{course.courseName}</h5>
                                            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, flex: 1 }}>{course.reason}</p>
                                            <Button
                                                style={{ width: '100%', backgroundColor: '#f59e0b', color: 'white', fontSize: '13px', padding: '8px' }}
                                                onClick={() => {
                                                    if (course.courseId) navigate(`/courses/${course.courseId}`);
                                                    else navigate('/courses');
                                                }}
                                            >
                                                Xem khóa học →
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
