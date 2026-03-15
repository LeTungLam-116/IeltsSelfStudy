import { useNavigate } from 'react-router-dom';
import LayoutContainer from '../common/LayoutContainer';
import { useAuthStore } from '../../stores/authStore';

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  return (
    <section
      className="hero-section"
      style={{
        width: '100%',
        padding: '80px 0',
        background: 'linear-gradient(to right, #eef2ff, #f0f9ff)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(17, 23, 31, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      {/* Vẫn giữ container (LayoutContainer) ở bên trong section để căn giữa nội dung */}
      <LayoutContainer>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Nội dung từ Nền tảng luyện thi đến các nút button */}
          <div style={{ flex: '1 1 500px', textAlign: 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              backgroundColor: '#eff6ff',
              color: '#0071f9',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '24px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              🚀 Nền tảng luyện thi IELTS số 1 Việt Nam
            </div>

            <h1 style={{
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontWeight: 900,
              color: '#1e293b',
              lineHeight: 1.1,
              marginBottom: '24px',
              letterSpacing: '-0.03em'
            }}>
              Bứt Phá Band Điểm <br />
              <span style={{
                background: 'linear-gradient(90deg, #0071f9 0%, #00b4d8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Với Lộ Trình AI Cá Nhân Hóa
              </span>
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '40px',
              maxWidth: '550px'
            }}>
              Trải nghiệm phương pháp học IELTS thông minh, giúp bạn tiết kiệm 50% thời gian ôn luyện và đạt chứng chỉ mơ ước nhanh chóng.
            </p>

            {/* Nút Bắt đầu CTA */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  if (user) {
                    navigate('/dashboard'); // Nếu đã đăng nhập thì vào thẳng bảng điều khiển / lộ trình học
                  } else {
                    navigate('/placement-test'); // Chưa đăng nhập thì mồi đi làm test đầu vào
                  }
                }}
                style={{
                  backgroundColor: '#0071f9',
                  color: 'white',
                  padding: '16px 36px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(0, 113, 249, 0.3)',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {user ? 'Vào học ngay' : 'Bắt đầu ngay hôm nay'}
              </button>
              <button
                onClick={() => {
                  const roadmapSection = document.getElementById('roadmap') || document.getElementById('features');
                  if (roadmapSection) {
                    roadmapSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }
                }}
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
                Khám phá lộ trình
              </button>
            </div>

            {/* Feature Highlights */}
            <div style={{
              marginTop: '56px',
              display: 'flex',
              gap: '48px',
              alignItems: 'center',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '32px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>🤖</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Chấm điểm AI</div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Phản hồi tức thì & chuẩn xác</div>
              </div>
              <div style={{ width: '1px', height: '40px', backgroundColor: '#e2e8f0' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>📈</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Lộ trình riêng</div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Tối ưu cho từng band điểm</div>
              </div>
            </div>
          </div>

          {/* Right Image Area */}
          <div style={{
            flex: '1 1 400px',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Background Accent */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0071f9 0%, transparent 100%)',
              opacity: 0.03,
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              transform: 'scale(1.2) rotate(-10deg)',
              zIndex: -1
            }} />

            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
              alt="IELTS Hero"
              style={{
                width: '100%',
                maxWidth: '550px',
                height: 'auto',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
                borderRadius: '32px'
              }}
            />

            {/* Floating Badges */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '-20px',
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#0071f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>🏆</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Dành cho người band thấp</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Chắc chắn cải thiện</div>
              </div>
            </div>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
