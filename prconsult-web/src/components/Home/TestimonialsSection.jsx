import React from 'react'

const TestimonialsSection = ({ testimonials }) => {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <h2 className="section-title">Khách hàng nói gì về Spa Dr Oha</h2>
        <p className="section-subtitle">
          Hơn 10,000+ khách hàng tin tưởng và hài lòng với dịch vụ của chúng tôi
        </p>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-message"
            >
              {/* Customer Info */}
              <div className="customer-info">
                <img
                  src={testimonial.after}
                  alt={`Khách hàng ${testimonial.name}`}
                  className="customer-avatar"
                />
                <div className="customer-details">
                  <h4 className="customer-name">{testimonial.name}</h4>
                  <p className="customer-service">{testimonial.service}</p>
                </div>
                <div className="rating-stars" aria-label="Đánh giá 5 sao">
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                </div>
              </div>

              {/* Message Content */}
              <p className="message-content">"{testimonial.review}"</p>

              {/* Before/After Images */}
              <div className="result-images">
                <div className="result-image">
                  <img src={testimonial.before} alt="Kết quả trước khi làm" />
                  <span className="image-label before-label">Trước</span>
                </div>
                <div className="result-image">
                  <img src={testimonial.after} alt="Kết quả sau khi làm" />
                  <span className="image-label after-label">Sau</span>
                </div>
              </div>

              {/* Verified Status */}
              <div className="verified-status">
                <span className="verified-icon">✓</span>
                <span>Khách hàng đã xác thực</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
