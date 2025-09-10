import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { submitCustomerRequest } from '@services/api'
import { useFormValidation, validationRules } from '@hooks/useFormValidation'
import './Contact.css'

const Contact = () => {
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    submitted: false,
    error: null
  })

  const initialValues = {
    name: '',
    phoneNumber: '',
    customerNote: ''
  }

  const validation = {
    name: [validationRules.required('Vui lòng nhập tên của bạn')],
    phoneNumber: [
      validationRules.required('Vui lòng nhập số điện thoại'),
      validationRules.phone('Số điện thoại không hợp lệ')
    ]
  }

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    reset
  } = useFormValidation(initialValues, validation)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      setFormStatus({
        isSubmitting: false,
        submitted: false,
        error: 'Vui lòng kiểm tra lại thông tin'
      })
      return
    }
    
    // Set submitting state
    setFormStatus({
      isSubmitting: true,
      submitted: false,
      error: null
    })
    
    try {
      // Submit form data
      const result = await submitCustomerRequest(values)
      
      if (result.success) {
        setFormStatus({
          isSubmitting: false,
          submitted: true,
          error: null
        })
        
        // Reset form
        reset()
      } else {
        setFormStatus({
          isSubmitting: false,
          submitted: false,
          error: result.error
        })
      }
    } catch {
      setFormStatus({
        isSubmitting: false,
        submitted: false,
        error: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
      })
    }
  }

  const resetForm = () => {
    setFormStatus({
      isSubmitting: false,
      submitted: false,
      error: null
    })
    reset()
  }

  return (
    <>
      <Helmet>
        <title>📞 Liên Hệ Beauty Spa TPHCM | Hotline: 0123-456-789 - Giảm 20% Khách Mới</title>
        <meta 
          name="description" 
          content="📞 Hotline Beauty Spa: 0123-456-789 - Tư vấn xăm môi chân mày miễn phí 24/7 ⚡ Đặt lịch online nhanh ⚡ Giảm 20% khách mới ⚡ Địa chỉ: 123 Đường ABC, Quận 1, TPHCM ⚡ Mở cửa 8h-20h hàng ngày" 
        />
        <meta name="keywords" content="hotline beauty spa TPHCM, số điện thoại spa xăm môi, đặt lịch beauty spa quận 1, liên hệ spa xăm chân mày, địa chỉ beauty spa TPHCM, tư vấn xăm môi miễn phí, giờ mở cửa spa" />
        <meta name="geo.region" content="VN-SG" />
        <meta name="geo.placename" content="Ho Chi Minh City" />
      </Helmet>

      <div className="contact">
        {/* Hero Section */}
        <section className="contact-hero">
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
            <div className="contact-hero-content text-on-dark">
              <h1>📞 Đặt Lịch Tư Vấn Miễn Phí</h1>
              <p className="contact-hero-subtitle">
                🎆 Hotline: <strong>0123-456-789</strong> - Tư vấn 24/7 ⭐ Giảm 20% khách mới ⭐ Bảo hành 2 năm
              </p>
              <div className="contact-highlights">
                <span className="contact-highlight">🔥 Giảm 20% hôm nay</span>
                <span className="contact-highlight">⏰ Tư vấn 24/7</span>
                <span className="contact-highlight">📍 Quận 1, TPHCM</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Main */}
        <section className="contact-main">
          <div className="container">
            <div className="contact-content">
              {/* Contact Info */}
              <div className="contact-info">
                <h2>📋 Thông Tin Liên Hệ</h2>
                
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <h3>Hotline</h3>
                    <p>0123-456-789</p>
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">📧</div>
                  <div>
                    <h3>Email</h3>
                    <p>info@beautyspa.vn</p>
                    <span>Phản hồi trong 2 giờ</span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <h3>Địa Chỉ</h3>
                    <p>123 Đường ABC, Quận 1</p>
                    <p>TP. Hồ Chí Minh</p>
                    <span>Mở cửa: 8:00 - 20:00 hàng ngày</span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">🕒</div>
                  <div>
                    <h3>Giờ Hoạt Động</h3>
                    <p>Thứ 2 - Chủ nhật: 8:00 - 20:00</p>
                    <span>Nghỉ lễ: 9:00 - 18:00</span>
                  </div>
                </div>

                <div className="social-media">
                  <h3>Theo Dõi Chúng Tôi</h3>
                  <div className="social-links">
                    <a href="#" className="social-link facebook">📘 Facebook</a>
                    <a href="#" className="social-link instagram">📷 Instagram</a>
                    <a href="#" className="social-link zalo">💬 Zalo</a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form">
                <h2>🎯 Đăng Ký Tư Vấn Miễn Phí</h2>
                <p className="form-description">
                  💬 Để lại thông tin, chúng tôi sẽ <strong>gọi lại trong 15 phút</strong> để tư vấn miễn phí. <strong>Khách mới giảm 20%!</strong>
                </p>

                {formStatus.submitted ? (
                  <div className="form-success">
                    <div className="success-icon">✅</div>
                    <h3>Đăng Ký Thành Công!</h3>
                    <p>
                      Cảm ơn bạn đã quan tâm đến Beauty Spa. 
                      Chúng tôi sẽ liên hệ với bạn trong vòng 15 phút.
                    </p>
                    <button 
                      onClick={resetForm}
                      className="btn btn-secondary"
                    >
                      Đăng Ký Khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="consultation-form">
                    <h3 className="form-title">Tư vấn cùng chuyên gia</h3>
                    
                    <div className="form-group">
                      <label htmlFor="name">
                        Họ và Tên <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="Nhập họ và tên của bạn"
                        className={`form-input ${errors.name && touched.name ? 'error' : ''}`}
                        disabled={formStatus.isSubmitting}
                      />
                      {errors.name && touched.name && (
                        <span className="error-message">{errors.name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phoneNumber">
                        Số Điện Thoại (Zalo/WhatsApp) <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={values.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        onBlur={() => handleBlur('phoneNumber')}
                        placeholder="Nhập số điện thoại (VD: 0912345678)"
                        className={`form-input ${errors.phoneNumber && touched.phoneNumber ? 'error' : ''}`}
                        disabled={formStatus.isSubmitting}
                      />
                      {errors.phoneNumber && touched.phoneNumber && (
                        <span className="error-message">{errors.phoneNumber}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="customerNote">
                        Lời nhắn (Tùy chọn)
                      </label>
                      <textarea
                        id="customerNote"
                        name="customerNote"
                        value={values.customerNote}
                        onChange={(e) => handleChange('customerNote', e.target.value)}
                        onBlur={() => handleBlur('customerNote')}
                        placeholder="Nhập lời nhắn hoặc yêu cầu của bạn..."
                        rows="4"
                        className="form-textarea"
                        disabled={formStatus.isSubmitting}
                      />
                    </div>

                    {formStatus.error && (
                      <div className="form-error">
                        <span className="error-icon">⚠️</span>
                        {formStatus.error}
                      </div>
                    )}

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-cancel"
                        onClick={resetForm}
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit" 
                        className={`btn btn-submit ${formStatus.isSubmitting ? 'loading' : ''}`}
                        disabled={formStatus.isSubmitting || !isValid}
                      >
                        {formStatus.isSubmitting ? (
                          <>
                            <span className="spinner"></span>
                            Đang Gửi...
                          </>
                        ) : (
                          'Gửi'
                        )}
                      </button>
                    </div>

                    <p className="form-note">
                      * Thông tin của bạn sẽ được bảo mật tuyệt đối
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <div className="container">
            <h2>Vị Trí Trên Bản Đồ</h2>
            <div className="map-container">
              <div className="map-placeholder">
                <div className="map-content">
                  <span>🗺️</span>
                  <p>Bản đồ tương tác</p>
                  <small>123 Đường ABC, Quận 1, TP.HCM</small>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Contact