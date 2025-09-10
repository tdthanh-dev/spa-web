import React from 'react'

const AboutSection = () => {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="about-content">
          <div className="about-image" data-aos="slide-in-left">
            <img src="/images/p7.jpg" alt="Không gian Spa Dr Oha sang trọng" className="about-img" />
          </div>

          <div className="about-text" data-aos="slide-in-right">
            <h2>Spa Dr Oha – Điểm đến của sự tự tin</h2>
            <p className="about-description">
              Với hơn 10 năm kinh nghiệm trong lĩnh vực xăm phun thẩm mỹ,
              <strong>Spa Dr Oha</strong> tự hào là địa chỉ uy tín hàng đầu về
              <strong>xăm chân mày tự nhiên</strong> và <strong>xăm môi hồng tươi</strong>.
            </p>
            <p>
              Chúng tôi sử dụng công nghệ xăm môi và xăm chân mày tiên tiến nhất,
              kết hợp với tay nghề chuyên môn cao để mang đến kết quả hoàn hảo.
            </p>

            <div className="advantages-list">
              <div className="advantage-item" data-aos="fade-in" data-aos-delay="200">
                <span className="advantage-icon">🎨</span>
                <div>
                  <h4>Công nghệ Hairstroke siêu mảnh</h4>
                  <p>99% tự nhiên, không ai biết bạn có xăm</p>
                </div>
              </div>

              <div className="advantage-item" data-aos="fade-in" data-aos-delay="400">
                <span className="advantage-icon">💋</span>
                <div>
                  <h4>Xăm môi lip blushing</h4>
                  <p>Màu hồng tươi, giữ màu bền 3-5 năm</p>
                </div>
              </div>

              <div className="advantage-item" data-aos="fade-in" data-aos-delay="600">
                <span className="advantage-icon">🏥</span>
                <div>
                  <h4>Không gian chuẩn spa</h4>
                  <p>Vô khuẩn, an toàn, sang trọng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
