import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutContainer from '../common/LayoutContainer';
import { getCourses, type CourseDto } from '../../api/courseApi';
import { useAuthStore } from '../../stores/authStore';

export default function Courses() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Fallback images if API/Assets fail
    const fallbackIcons = ['📚', '🎓', '🏆'];

    useEffect(() => {
        getCourses()
            .then(data => {
                let filtered = [...data];
                if (user && user.targetBand) {
                    // Sắp xếp các khóa học theo độ phù hợp với targetBand của user
                    filtered.sort((a, b) => {
                        const diffA = Math.abs((a.targetBand || 0) - user.targetBand!);
                        const diffB = Math.abs((b.targetBand || 0) - user.targetBand!);
                        return diffA - diffB;
                    });
                } else {
                    // Lấy các khóa mới nhất (mặc định cho khách)
                    filtered.reverse();
                }
                setCourses(filtered.slice(0, 3));
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy khóa học:", err);
                setLoading(false);
            });
    }, [user]);

    if (loading && courses.length === 0) {
        return (
            <section style={{ padding: '80px 0', textAlign: 'center' }}>
                <p style={{ color: '#64748b' }}>Đang tải khóa học...</p>
            </section>
        );
    }

    return (
        <section
            style={{
                padding: '80px 0',
                backgroundColor: '#f8fafc',
                backgroundImage: 'radial-gradient(#e2e8f0 0.5px, transparent 0.5px)',
                backgroundSize: '24px 24px'
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
                        {user ? (
                            <>Khóa Học <span style={{ color: '#0071f9' }}>Đề Xuất</span></>
                        ) : (
                            <>Khóa Học <span style={{ color: '#0071f9' }}>Nổi Bật</span></>
                        )}
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#64748b',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        {user ? 'Lộ trình được tinh chỉnh riêng nhằm giúp bạn đạt được band điểm mục tiêu nhanh nhất.' : 'Khám phá lộ trình học IELTS từ chuyên gia, tối ưu hóa thời gian và bứt phá band điểm với dự liệu thực tế.'}
                    </p>
                </div>

                {!loading && courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '18px' }}>
                        Hiện tại chưa có khóa học nào phù hợp.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '30px',
                        padding: '10px'
                    }}>
                        {courses.map((c, index) => (
                            <div
                                key={c.id}
                                className="card-hover-lift"
                                onClick={() => navigate(`/courses/${c.id}`)}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid #f1f5f9',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* Thumbnail Container */}
                                <div style={{
                                    position: 'relative',
                                    height: '200px',
                                    backgroundColor: '#eff6ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                                }}>
                                    {c.thumbnailUrl ? (
                                        <img
                                            src={c.thumbnailUrl}
                                            alt={c.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '72px' }}>
                                            {fallbackIcons[index % 3]}
                                        </div>
                                    )}

                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        left: '16px',
                                        backgroundColor: 'rgba(0, 113, 249, 0.9)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '99px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        {c.skill || 'IELTS'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0071f9' }}>BAND: {c.targetBand || '4.0+'}</span>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>📝 {c.level}</span>
                                    </div>

                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        marginBottom: '12px',
                                        lineHeight: 1.3
                                    }}>
                                        {c.name}
                                    </h3>

                                    <p style={{
                                        fontSize: '14px',
                                        color: '#64748b',
                                        lineHeight: 1.5,
                                        marginBottom: '20px',
                                        flexGrow: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {c.shortDescription || "Khóa học lộ trình chuẩn Cambridge giúp bạn chinh phục mục tiêu IELTS một cách khoa học và hiệu quả."}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        paddingTop: '20px',
                                        borderTop: '1px solid #f1f5f9'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Học phí</div>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                                                {c.price ? `${c.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/courses/${c.id}`)}
                                            style={{
                                                backgroundColor: '#0071f9',
                                                color: 'white',
                                                padding: '10px 20px',
                                                borderRadius: '14px',
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 12px rgba(0, 113, 249, 0.25)',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#0062d9';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = '#0071f9';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            Học ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                    <button
                        onClick={() => navigate('/courses')}
                        style={{
                            background: 'none',
                            border: '2px solid #0071f9',
                            color: '#0071f9',
                            padding: '12px 32px',
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f7ff';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Xem tất cả khóa học →
                    </button>
                </div>
            </LayoutContainer>
        </section>
    );
}
