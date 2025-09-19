import React from 'react'

const ServicesSection = ({ services }) => {
  return (
    <section className="services-section" id="services">
      <div className="container">
        <h2 className="section-title" data-aos="fade-up">Dịch vụ nổi bật tại Spa KimKang</h2>
        <p className="section-subtitle" data-aos="fade-up" data-aos-delay="200">
          Chuyên cung cấp các dịch vụ xăm chân mày và xăm môi tự nhiên với công nghệ hiện đại
        </p>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={service.id} className="service-card" data-aos="fade-up" data-aos-delay={index * 200}>
              <img src={service.image} alt={service.alt} className="service-image" />
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection