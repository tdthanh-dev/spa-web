import { Helmet } from 'react-helmet-async'
import './About.css'

const About = () => {
  return (
    <>
      <Helmet>
        <title>🏆 Về Beauty Spa TPHCM - Chuyên Gia Xăm Môi Chân Mày #1 | 8+ Năm Uy Tín</title>
        <meta 
          name="description" 
          content="⭐ Beauty Spa - Thương hiệu #1 TPHCM với 8+ năm kinh nghiệm ✓ 1000+ khách hài lòng ✓ KTV đào tạo Hàn Quốc ✓ Chứng nhận quốc tế ✓ An toàn 100% ✓ Bảo hành 2 năm ✓ Quận 1, TPHCM" 
        />
        <meta name="keywords" content="spa xăm môi uy tín TPHCM, chuyên gia xăm chân mày Hàn Quốc, beauty spa quận 1, spa xăm thẩm mỹ chất lượng, KTV kinh nghiệm, chứng nhận quốc tế, spa an toàn" />
        <meta name="geo.region" content="VN-SG" />
        <meta name="geo.placename" content="Ho Chi Minh City" />
      </Helmet>

      <div className="about">
        {/* Hero Section */}
        <section className="about-hero">
          <video 
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/videos/video_hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="container">
            <div className="about-hero-content text-on-dark">
              <h1>🏆 Spa Xăm Môi Chân Mày #1 TPHCM</h1>
              <p className="about-hero-subtitle">
                ⭐ 8+ năm kinh nghiệm ⭐ 1000+ khách tin tưởng ⭐ KTV đào tạo Hàn Quốc ⭐ Chứng nhận quốc tế
              </p>
              <div className="trust-badges">
                <span className="trust-badge">🇠🇷 Hàn Quốc</span>
                <span className="trust-badge">🛡️ An toàn 100%</span>
                <span className="trust-badge">🏆 #1 TPHCM</span>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="story">
          <div className="container">
            <div className="story-content">
              <div className="story-text">
                <h2>🌟 Thương Hiệu Được 1000+ Khách Hàng Tin Tưởng</h2>
                <p>
                  <strong>Beauty Spa</strong> được thành lập năm 2016 bởi <strong>Master Linh</strong> - Chuyên gia xăm thẩm mỹ 
                  hàng đầu với <strong>8+ năm kinh nghiệm</strong>. Từ một studio nhỏ, chúng tôi đã phát triển thành 
                  <strong>thương hiệu #1 TPHCM</strong> với hơn <strong>1000+ khách hàng hài lòng</strong>.
                </p>
                <p>
                  <strong>🇰🇷 Đào tạo tại Hàn Quốc:</strong> Toàn bộ KTV được đào tạo chuyên sâu tại Seoul Beauty Academy, 
                  Korea PMU Institute. Chúng tôi là <strong>đối tác độc quyền</strong> của các thương hiệu hàng đầu Hàn Quốc 
                  tại Việt Nam, mang về <strong>kỹ thuật 6D tiên tiến nhất</strong>.
                </p>
                <div className="credentials">
                  <div className="credential-item">
                    <span className="credential-icon">🏆</span>
                    <p><strong>Seoul Beauty Academy</strong><br/>Chứng nhận Master KTV</p>
                  </div>
                  <div className="credential-item">
                    <span className="credential-icon">🇰🇷</span>
                    <p><strong>Korea PMU Institute</strong><br/>Kỹ thuật 6D chính thức</p>
                  </div>
                  <div className="credential-item">
                    <span className="credential-icon">⭐</span>
                    <p><strong>1000+ Reviews</strong><br/>Rating 4.9/5.0</p>
                  </div>
                </div>
              </div>
              <div className="story-image">
                <div className="image-placeholder">
                  <span>🏢</span>
                  <p>Spa của chúng tôi</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission">
          <div className="container">
            <h2>Sứ Mệnh & Tầm Nhìn</h2>
            <div className="mission-grid">
              <div className="mission-card">
                <div className="mission-icon">🎯</div>
                <h3>Sứ Mệnh</h3>
                <p>
                  Mang đến cho phụ nữ Việt những dịch vụ làm đẹp chất lượng cao, 
                  an toàn và hiệu quả, giúp tôn vinh vẻ đẹp tự nhiên của từng người.
                </p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">👁️</div>
                <h3>Tầm Nhìn</h3>
                <p>
                  Trở thành thương hiệu spa hàng đầu tại Việt Nam, được khách hàng 
                  tin tưởng và lựa chọn cho các dịch vụ xăm thẩm mỹ chuyên nghiệp.
                </p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">💎</div>
                <h3>Giá Trị Cốt Lõi</h3>
                <p>
                  Chất lượng - Uy tín - An toàn - Chuyên nghiệp. 
                  Luôn đặt sự hài lòng và an toàn của khách hàng lên hàng đầu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team">
          <div className="container">
            <h2>Đội Ngũ Chuyên Gia</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-image">
                  <span>👩‍⚕️</span>
                </div>
                <h3>Ms. Linh</h3>
                <p className="member-title">Founder & Master KTV</p>
                <p className="member-description">
                  8+ năm kinh nghiệm, được đào tạo chuyên sâu tại Hàn Quốc. 
                  Chuyên gia hàng đầu về kỹ thuật xăm 6D.
                </p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <span>👩‍🎨</span>
                </div>
                <h3>Ms. Hương</h3>
                <p className="member-title">Senior KTV</p>
                <p className="member-description">
                  5+ năm kinh nghiệm, chuyên về phun môi collagen và 
                  thiết kế chân mày theo khuôn mặt.
                </p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <span>👩‍💼</span>
                </div>
                <h3>Ms. Mai</h3>
                <p className="member-title">KTV & Tư vấn viên</p>
                <p className="member-description">
                  3+ năm kinh nghiệm, chuyên tư vấn và chăm sóc khách hàng 
                  với sự tận tình, chu đáo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="achievements">
          <div className="container">
            <h2>Thành Tựu & Chứng Nhận</h2>
            <div className="achievements-grid">
              <div className="achievement-item">
                <div className="achievement-number">1000+</div>
                <p>Khách hàng hài lòng</p>
              </div>
              <div className="achievement-item">
                <div className="achievement-number">5+</div>
                <p>Năm kinh nghiệm</p>
              </div>
              <div className="achievement-item">
                <div className="achievement-number">10+</div>
                <p>Chứng chỉ quốc tế</p>
              </div>
              <div className="achievement-item">
                <div className="achievement-number">98%</div>
                <p>Tỷ lệ khách quay lại</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Section */}
        <section className="quality">
          <div className="container">
            <h2>Cam Kết Chất Lượng</h2>
            <div className="quality-grid">
              <div className="quality-item">
                <div className="quality-icon">🔬</div>
                <h3>Công Nghệ Hiện Đại</h3>
                <p>Trang thiết bị nhập khẩu từ Hàn Quốc, Nhật Bản. Áp dụng các kỹ thuật tiên tiến nhất.</p>
              </div>
              <div className="quality-item">
                <div className="quality-icon">🛡️</div>
                <h3>An Toàn Tuyệt Đối</h3>
                <p>Kim xăm 1 lần sử dụng, quy trình vô trùng nghiêm ngặt theo tiêu chuẩn y tế.</p>
              </div>
              <div className="quality-item">
                <div className="quality-icon">🎨</div>
                <h3>Nghệ Thuật & Thẩm Mỹ</h3>
                <p>Thiết kế cá nhân hóa, phù hợp với từng khuôn mặt và phong cách riêng.</p>
              </div>
              <div className="quality-item">
                <div className="quality-icon">💝</div>
                <h3>Chăm Sóc Tận Tâm</h3>
                <p>Hỗ trợ chăm sóc sau xăm, bảo hành dài hạn và tư vấn 24/7.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default About