import React from 'react'

const ProcessSection = ({ processSteps }) => {
  return (
    <section className="process-section" id="process">
      <div className="container">
        <h2 className="section-title" data-aos="fade-up">Quy trình làm đẹp tại Spa KimKang</h2>

        <div className="timeline">
          <div className="timeline-line" data-aos="progress-line"></div>

          {processSteps.map((step, index) => (
            <div key={index} className="timeline-step" data-aos="fade-right" data-aos-delay={index * 100}>
              <div className="step-number">{index + 1}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProcessSection
