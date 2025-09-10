import React from 'react'

const WhyChooseSection = ({ reasons }) => {
  return (
    <section className="why-choose-section">
      <div className="container">
        <h2 className="section-title" data-aos="fade-up">Lý do khách hàng chọn Spa Dr Oha</h2>

        <div className="reasons-grid">
          {reasons.map((reason, index) => (
            <div key={index} className="reason-item" data-aos="zoom-in" data-aos-delay={index * 200}>
              <div className="reason-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="reason-title">{reason.title}</h3>
              <p className="reason-description">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseSection
