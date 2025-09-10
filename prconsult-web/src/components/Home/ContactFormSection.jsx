import React from 'react'

const ContactFormSection = ({ 
  formData, 
  isSubmitting, 
  submitMessage, 
  errors, 
  isFormValid, 
  handleInputChange, 
  handleSubmit 
}) => {
  return (
    <div className="contact-column" id="contact">
      <h2 className="section-title" data-aos="fade-up">Đặt lịch tư vấn miễn phí</h2>

      <div className="form-container" data-aos="fade-in">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h3 className="form-title">Tư vấn cùng chuyên gia</h3>

          <div className="form-group">
            <label htmlFor="name">Họ và tên</label>
            <input
              type="text"
              id="name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="Nhập họ và tên của bạn"
              className="form-input"
            />
            {errors.fullName && <p className="error-message">{errors.fullName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại (Zalo/WhatsApp)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="VD: 0912345678 hoặc 0123456789"
              pattern="[0-9]{10,11}"
              maxLength="11"
              className="form-input"
            />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="message">Lời nhắn</label>
            <textarea
              id="message"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows="3"
              placeholder="Nhập lời nhắn hoặc yêu cầu của bạn..."
              className="form-textarea"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi'}
            </button>
          </div>
          {submitMessage && <p className={`form-message ${submitMessage.includes('✅') ? 'success' : 'error'}`}>{submitMessage}</p>}
        </form>
      </div>
    </div>
  )
}

export default ContactFormSection
