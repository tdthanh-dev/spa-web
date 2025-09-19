import React from 'react'

const HeroSection = () => {
  const scrollToContact = () => {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="home" aria-label="Trang chủ - Giới thiệu dịch vụ xăm thẩm mỹ KimKang">
      <video 
        className="hero-video" 
        autoPlay 
        muted 
        loop 
        playsInline
        aria-label="Video giới thiệu dịch vụ xăm thẩm mỹ"
        poster="/images/hero-poster.jpg"
      >
        <source src="/videos/video_hero.mp4" type="video/mp4" />
        <p>Trình duyệt của bạn không hỗ trợ video. Hãy cập nhật trình duyệt để có trải nghiệm tốt nhất.</p>
      </video>

      <div className="hero-overlay" aria-hidden="true"></div>

      <div className="hero-content">
        <p className="hero-slogan" role="banner">Đẹp tự nhiên – Chuẩn phong thủy</p>

        <div className="hero-main">
          <h1 className="hero-title">Xăm chân mày – Xăm môi <span className="dr-oha">KimKang</span></h1>
          <p className="hero-subtitle">
            <strong>Chuyên gia hàng đầu</strong> về xăm chân mày tự nhiên và xăm môi hồng tươi với công nghệ Hairstroke siêu mảnh, 
            mang đến vẻ đẹp tự nhiên hoàn hảo cho mọi khách hàng
          </p>
          <div className="hero-features" role="list" aria-label="Điểm nổi bật của dịch vụ">
            <div className="feature-tag" role="listitem">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span><strong>Công nghệ Hairstroke</strong> 99% tự nhiên</span>
            </div>
            <div className="feature-tag" role="listitem">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span><strong>Xăm môi lip blushing</strong> bền màu 3-5 năm</span>
            </div>
            <div className="feature-tag" role="listitem">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C20.08 12.63 22 10.55 22 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z" />
              </svg>
              <span><strong>Đội ngũ chuyên gia</strong> 10+ năm kinh nghiệm</span>
            </div>
            <div className="feature-tag" role="listitem">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Không gian spa vô khuẩn</strong>, an toàn tuyệt đối</span>
            </div>
          </div>
          <button 
            className="cta-button" 
            onClick={scrollToContact}
            aria-label="Đặt lịch tư vấn xăm thẩm mỹ miễn phí"
          >
            Đặt lịch ngay
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
