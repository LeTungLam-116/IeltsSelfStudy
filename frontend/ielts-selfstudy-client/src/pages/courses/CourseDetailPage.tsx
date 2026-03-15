import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutContainer from '../../components/common/LayoutContainer';
import { getCourseById, type CourseDto } from '../../api/courseApi';
import { createPaymentUrl } from '../../api/paymentsApi';
import Footer from "../../components/home/Footer";
import { useAuthStore } from '../../stores/authStore';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [course, setCourse] = useState<CourseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        getCourseById(Number(id))
            .then(data => {
                setCourse(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy chi tiết khóa học:", err);
                setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
                setLoading(false);
            });
    }, [id, isAuthenticated]); // Re-fetch when auth changes so isEnrolled is up-to-date


    const handleBuyCourse = async () => {
        if (!isAuthenticated) {
            sessionStorage.setItem('postLoginIntent', JSON.stringify({
                path: `/courses/${id}`,
                message: 'Vui lòng đăng nhập để tiến hành thanh toán khóa học.'
            }));
            navigate('/login');
            return;
        }

        if (!course || !course.price) return;

        // Pre-check: re-fetch with fresh auth token to get latest isEnrolled
        try {
            const freshCourse = await getCourseById(course.id);
            if (freshCourse.isEnrolled) {
                // Already enrolled — go directly to first lesson
                const firstEx = freshCourse.exercises?.sort((a, b) => a.order - b.order)[0];
                if (firstEx) {
                    navigate(`/${firstEx.skill.toLowerCase()}/${firstEx.exerciseId}`);
                } else {
                    alert('Bạn đã đăng ký khóa học này. Nội dung đang được cập nhật.');
                }
                return;
            }
        } catch {
            // Pre-check failed — proceed to payment anyway
        }

        try {
            const url = await createPaymentUrl({
                courseId: course.id,
                amount: course.price,
                orderInfo: `Mua khoa hoc ${course.name}`
            });
            window.location.href = url;
        } catch (err: any) {
            console.error("Payment Error:", err);
            console.error("Server Response:", err?.response?.status, err?.response?.data);
            const serverMessage: string = err?.response?.data?.message || '';
            if (serverMessage.toLowerCase().includes('already owns')) {
                window.location.reload();
            } else {
                alert(`Lỗi thanh toán: ${serverMessage || 'Không thể khởi tạo thanh toán. Vui lòng thử lại.'}`);
            }
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh' }}>
                <div className="animate-spin" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #0071f9',
                    borderRadius: '50%',
                    margin: '0 auto 20px auto'
                }}></div>
                <p style={{ color: '#64748b', fontWeight: 500 }}>Đang tải thông tin khóa học...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <LayoutContainer>
                <div style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh' }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
                        {error || "Không tìm thấy khóa học"}
                    </h2>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            backgroundColor: '#0071f9',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Quay lại Trang chủ
                    </button>
                </div>
            </LayoutContainer>
        );
    }

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{
                padding: '60px 0',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #f1f5f9',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Decorative */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(0, 113, 249, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0
                }} />

                <LayoutContainer>
                    <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                        {/* Left: Thumbnail */}
                        <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
                            <div style={{
                                borderRadius: '32px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                backgroundColor: 'white',
                                lineHeight: 0
                            }}>
                                {course.thumbnailUrl ? (
                                    <img
                                        src={course.thumbnailUrl}
                                        alt={course.name}
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                    />
                                ) : (
                                    <div style={{
                                        height: '300px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, #0071f9 0%, #00b4d8 100%)',
                                        fontSize: '100px'
                                    }}>
                                        🎓
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Intro Info */}
                        <div style={{ flex: '2 1 500px' }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                <span style={{
                                    backgroundColor: '#0071f915',
                                    color: '#0071f9',
                                    padding: '6px 14px',
                                    borderRadius: '99px',
                                    fontSize: '13px',
                                    fontWeight: 700
                                }}>
                                    {course.skill}
                                </span>
                                <span style={{
                                    backgroundColor: '#10b98115',
                                    color: '#10b981',
                                    padding: '6px 14px',
                                    borderRadius: '99px',
                                    fontSize: '13px',
                                    fontWeight: 700
                                }}>
                                    {course.level}
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(32px, 4vw, 48px)',
                                fontWeight: 900,
                                color: '#1e293b',
                                marginBottom: '20px',
                                lineHeight: 1.2
                            }}>
                                {course.name}
                            </h1>

                            <p style={{
                                fontSize: '18px',
                                color: '#64748b',
                                lineHeight: 1.6,
                                marginBottom: '32px',
                                maxWidth: '700px'
                            }}>
                                {course.shortDescription || "Cung cấp lộ trình học bài bản và hệ thống bài tập phong phú giúp người học nắm vững kiến thức và bứt phá điểm số."}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '40px' }}>
                                <div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>Mục tiêu</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Band {course.targetBand || '4.0+'}</div>
                                </div>
                                <div style={{ width: '1px', height: '40px', backgroundColor: '#e2e8f0' }} />
                                <div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>Học phí</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0071f9' }}>
                                        {course.price ? `${course.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {course.isEnrolled ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            backgroundColor: '#f0fdf4',
                                            color: '#15803d',
                                            padding: '8px 16px',
                                            borderRadius: '99px',
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            border: '1px solid #bbf7d0',
                                            width: 'fit-content'
                                        }}>
                                            ✅ Bạn đã sở hữu khóa học này
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (course.exercises && course.exercises.length > 0) {
                                                    const firstEx = course.exercises.sort((a, b) => a.order - b.order)[0];
                                                    navigate(`/${firstEx.skill.toLowerCase()}/${firstEx.exerciseId}`);
                                                } else {
                                                    navigate('/dashboard');
                                                }
                                            }}
                                            style={{
                                                backgroundColor: course.exercises && course.exercises.length > 0 ? '#10b981' : '#94a3b8',
                                                color: 'white',
                                                padding: '16px 40px',
                                                borderRadius: '16px',
                                                fontWeight: 800,
                                                fontSize: '16px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: course.exercises && course.exercises.length > 0
                                                    ? '0 10px 20px rgba(16, 185, 129, 0.2)'
                                                    : 'none',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            {course.exercises && course.exercises.length > 0
                                                ? '🚀 Vào học ngay'
                                                : '📋 Về trang Dashboard'}
                                        </button>
                                        {(!course.exercises || course.exercises.length === 0) && (
                                            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                                Giáo trình đang được cập nhật. Bạn sẽ nhận thông báo khi sẵn sàng.
                                            </p>
                                        )}
                                    </div>
                                ) : course.price && course.price > 0 ? (
                                    <button
                                        onClick={handleBuyCourse}
                                        style={{
                                            backgroundColor: '#0071f9',
                                            color: 'white',
                                            padding: '16px 40px',
                                            borderRadius: '16px',
                                            fontWeight: 800,
                                            fontSize: '16px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            boxShadow: '0 10px 20px rgba(0, 113, 249, 0.2)',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        💳 Mua khóa học ngay
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                sessionStorage.setItem('postLoginIntent', JSON.stringify({
                                                    path: `/courses/${id}`,
                                                    message: 'Vui lòng đăng nhập để tham gia khóa học miễn phí.'
                                                }));
                                                navigate('/login');
                                                return;
                                            }

                                            if (course.exercises && course.exercises.length > 0) {
                                                const firstEx = course.exercises.sort((a, b) => a.order - b.order)[0];
                                                navigate(`/${firstEx.skill.toLowerCase()}/${firstEx.exerciseId}`);
                                            }
                                        }}
                                        style={{
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            padding: '16px 40px',
                                            borderRadius: '16px',
                                            fontWeight: 800,
                                            fontSize: '16px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        🚀 Vào học ngay (Miễn phí)
                                    </button>
                                )}
                                <button
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#1e293b',
                                        padding: '16px 32px',
                                        borderRadius: '16px',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        border: '1px solid #e2e8f0',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    📄 Xem giáo trình
                                </button>
                            </div>
                        </div>
                    </div>
                </LayoutContainer>
            </section>

            {/* Syllabus Section */}
            <section style={{ padding: '80px 0' }}>
                <LayoutContainer>
                    <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                        {/* Left: Syllabus List */}
                        <div style={{ flex: '2 1 600px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                    Giáo trình khóa học
                                </h2>
                                {course.isCompleted && (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        color: 'white',
                                        padding: '8px 18px',
                                        borderRadius: '99px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        boxShadow: '0 4px 12px rgba(34,197,94,0.35)'
                                    }}>
                                        🎉 Đã hoàn thành khóa học!
                                    </div>
                                )}
                            </div>

                            {/* Progress bar — only shown when enrolled and there are exercises */}
                            {course.isEnrolled && course.totalExercises != null && course.totalExercises > 0 && (
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '20px',
                                    padding: '20px 24px',
                                    marginBottom: '28px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                                            Tiến độ của bạn
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                                            <span style={{ color: course.isCompleted ? '#22c55e' : '#0071f9', fontWeight: 800, fontSize: '16px' }}>
                                                {course.completedExercises ?? 0}
                                            </span>
                                            /{course.totalExercises} bài hoàn thành
                                            <span style={{ marginLeft: '8px', color: '#94a3b8' }}>
                                                ({course.progressPercent ?? 0}%)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Track */}
                                    <div style={{
                                        width: '100%',
                                        height: '12px',
                                        backgroundColor: '#e2e8f0',
                                        borderRadius: '99px',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Fill */}
                                        <div style={{
                                            height: '100%',
                                            width: `${course.progressPercent ?? 0}%`,
                                            borderRadius: '99px',
                                            background: course.isCompleted
                                                ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                                : 'linear-gradient(90deg, #0071f9 0%, #00b4d8 100%)',
                                            transition: 'width 0.8s ease',
                                            boxShadow: course.isCompleted
                                                ? '0 0 8px rgba(34,197,94,0.5)'
                                                : '0 0 8px rgba(0,113,249,0.4)'
                                        }} />
                                    </div>

                                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#94a3b8' }}>
                                        💡 Hoàn thành bài tập cần đạt <strong style={{ color: '#f59e0b' }}>2 cúp trở lên</strong> (≥80% điểm số)
                                    </div>
                                </div>
                            )}

                            {!course.exercises || course.exercises.length === 0 ? (
                                <div style={{
                                    padding: '40px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '24px',
                                    textAlign: 'center',
                                    border: '2px dashed #e2e8f0'
                                }}>
                                    <p style={{ color: '#64748b' }}>Khóa học này hiện chưa có bài tập nào được công khai.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {course.exercises.sort((a, b) => a.order - b.order).map((item, idx) => {
                                        const isTest = item.skill.toLowerCase() === 'test' || item.exercise?.title?.toLowerCase().includes('test');
                                        const canAccess = !!course.isEnrolled;

                                        const handleLessonClick = () => {
                                            if (!canAccess) {
                                                // Scroll up to purchase button
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                return;
                                            }
                                            navigate(`/${item.skill.toLowerCase()}/${item.exerciseId}`);
                                        };

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={handleLessonClick}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '20px 24px',
                                                    backgroundColor: canAccess ? 'white' : '#f8fafc',
                                                    borderRadius: '24px',
                                                    border: `1px solid ${canAccess ? '#f1f5f9' : '#e2e8f0'}`,
                                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
                                                    transition: 'all 0.2s ease-in-out',
                                                    cursor: canAccess ? 'pointer' : 'not-allowed',
                                                    opacity: canAccess ? 1 : 0.75,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}
                                                onMouseOver={(e) => {
                                                    if (canAccess) {
                                                        e.currentTarget.style.borderColor = '#22c55e';
                                                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(34,197,94,0.15)';
                                                    } else {
                                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.borderColor = canAccess ? '#f1f5f9' : '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)';
                                                }}
                                            >
                                                {/* Green Badge with lock for unenrolled */}
                                                <div style={{
                                                    width: '56px',
                                                    height: '64px',
                                                    backgroundColor: canAccess ? '#22c55e' : '#94a3b8',
                                                    clipPath: 'polygon(50% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    marginRight: '20px',
                                                    flexShrink: 0,
                                                    paddingTop: '6px'
                                                }}>
                                                    {canAccess ? (
                                                        <>
                                                            <div style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>{item.lessonNumber || idx + 1}</div>
                                                            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em', borderTop: '1px solid rgba(255,255,255,0.3)', width: '100%', textAlign: 'center', paddingTop: '2px' }}>
                                                                {isTest ? 'TEST' : 'LESSON'}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 10px 0' }}>
                                                        {item.exercise?.title || `Unit ${item.lessonNumber || idx + 1}: ${item.skill} Practice`}
                                                    </h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
                                                        <span>1/1 {isTest ? 'Test' : 'Skill'}</span>
                                                        {canAccess ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ color: '#fbbf24', fontSize: '18px' }}>⭐</span>
                                                                {item.trophyCount ?? 0}/3
                                                                {/* Writing/Speaking: hiện Band score */}
                                                                {item.highestBandScore != null && (
                                                                    <span style={{
                                                                        fontSize: '13px', color: '#10b981', fontWeight: 700,
                                                                        backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '99px',
                                                                        border: '1px solid #bbf7d0'
                                                                    }}>
                                                                        Band {item.highestBandScore}
                                                                        {course.targetBand && (
                                                                            <span style={{ color: '#94a3b8', fontWeight: 500 }}>
                                                                                {' '}/ {course.targetBand}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                )}
                                                                {/* Listening/Reading/Grammar/Vocab: hiện % */}
                                                                {item.highestScorePercent != null && item.highestBandScore == null && (
                                                                    <span style={{
                                                                        fontSize: '13px', color: '#10b981', fontWeight: 700,
                                                                        backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '99px',
                                                                        border: '1px solid #bbf7d0'
                                                                    }}>
                                                                        {item.highestScorePercent}%
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                fontSize: '12px', color: '#94a3b8', fontWeight: 600,
                                                                backgroundColor: '#f1f5f9', padding: '2px 10px', borderRadius: '99px',
                                                                border: '1px solid #e2e8f0'
                                                            }}>
                                                                🔒 Chưa mua
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>


                                                {/* Cups - only show real data when enrolled */}
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', paddingRight: '8px' }}>
                                                    {[1, 2, 3].map((cupIdx) => {
                                                        const isGolden = canAccess && (item.trophyCount ?? 0) >= cupIdx;
                                                        return (
                                                            <svg
                                                                key={cupIdx}
                                                                width="28"
                                                                height="28"
                                                                viewBox="0 0 24 24"
                                                                fill={isGolden ? '#f59e0b' : '#e2e8f0'}
                                                                style={{
                                                                    filter: isGolden ? 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' : 'none',
                                                                    transition: 'fill 0.3s'
                                                                }}
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path d="M19 5h-2V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2H5a2 2 0 0 0-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.02 5.02 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1c1.79-.34 3.2-1.75 3.61-3.54C19.08 12.63 21 10.55 21 8V7a2 2 0 0 0-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-1.99 2.82V7h2v1z" />
                                                            </svg>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: Sticky Sidebar */}
                        <div style={{ flex: '1 1 300px' }}>
                            <div style={{
                                position: 'sticky',
                                top: '100px',
                                backgroundColor: '#ffffff',
                                borderRadius: '24px',
                                padding: '32px',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
                            }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>
                                    Thông tin bổ sung
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '20px' }}>📁</span>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Cấp độ</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{course.level}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '20px' }}>📝</span>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Số bài tập</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                                                {course.exercises?.length || 0} bài tập
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '20px' }}>📅</span>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Ngày cập nhật</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                                                {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '32px',
                                    padding: '16px',
                                    backgroundColor: '#fff7ed',
                                    borderRadius: '16px',
                                    border: '1px solid #ffedd5'
                                }}>
                                    <p style={{ fontSize: '13px', color: '#9a3412', margin: 0, lineHeight: 1.5 }}>
                                        🎯 Cam kết đầu ra nếu bạn hoàn thành 100% giáo trình của khóa học này.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </LayoutContainer>
            </section>
            <Footer />
        </div>
    );
}
