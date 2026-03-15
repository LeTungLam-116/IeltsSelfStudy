import LayoutContainer from '../common/LayoutContainer';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      padding: '80px 0 30px 0',
      borderTop: '1px solid #1e293b'
    }}>
      <LayoutContainer>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '60px'
        }}>
          {/* Brand Column */}
          <div style={{ flex: '2 1 300px' }}>
            <h3 style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 800,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                backgroundColor: '#0071f9',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '18px'
              }}>I</span>
              IELTS Self Study
            </h3>
            <p style={{
              lineHeight: 1.6,
              fontSize: '15px',
              marginBottom: '24px'
            }}>
              Nền tảng học tập IELTS trực tuyến hiện đại nhất, giúp hàng ngàn học viên bứt phá band điểm thông qua phương pháp học chủ động và dữ liệu thực tế.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['facebook', 'youtube', 'instagram', 'twitter'].map(social => (
                <div
                  key={social}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: '0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#0071f9';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#1e293b';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '14px', color: 'white' }}>{social[0].toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resources Column */}
          <div>
            <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Tài Nguyên</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Khóa học Reading', 'Khóa học Listening', 'Tài liệu VIP', 'Hệ thống thi thử', 'Blog kinh nghiệm'].map(item => (
                <li key={item} style={{ marginBottom: '12px' }}>
                  <a href="#" style={{
                    textDecoration: 'none',
                    color: '#94a3b8',
                    fontSize: '15px',
                    transition: '0.2s'
                  }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0071f9'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Liên Kết</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Về chúng tôi', 'Điều khoản sử dụng', 'Chính sách bảo mật', 'Liên hệ hỗ trợ', 'Tuyển dụng'].map(item => (
                <li key={item} style={{ marginBottom: '12px' }}>
                  <a href="#" style={{
                    textDecoration: 'none',
                    color: '#94a3b8',
                    fontSize: '15px',
                    transition: '0.2s'
                  }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0071f9'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Đăng Ký</h4>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>Nhận lộ trình học tập và tài liệu IELTS mới nhất hàng tháng.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Email của bạn"
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: 'white',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none'
                }}
              />
              <button style={{
                backgroundColor: '#0071f9',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ fontSize: '14px' }}>
            © {currentYear} <strong>IELTS Self Study</strong>.
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <span style={{ cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}>Hotline: 0812566204</span>
            <span style={{ cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}>Email: tuglam1164@gmail.com</span>
          </div>
        </div>
      </LayoutContainer>
    </footer>
  );
}
