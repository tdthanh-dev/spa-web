import React from 'react'

const FAQSection = ({ faqData, activeAccordion, toggleAccordion }) => {
  return (
    <div className="faq-column">
      <h2 className="section-title" data-aos="fade-up">Câu hỏi thường gặp</h2>

      <div className="faq-container">
        {faqData.map((faq, index) => (
          <div key={index} className="faq-item" data-aos="fade-up" data-aos-delay={index * 100}>
            <button
              className={`faq-question ${activeAccordion === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <span>{faq.question}</span>
              <span className="arrow-icon">▼</span>
            </button>
            <div className={`faq-answer ${activeAccordion === index ? 'active' : ''}`}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQSection
