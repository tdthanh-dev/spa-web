import React, { useState, useEffect, useRef } from 'react';
import '@assets/styles/hotline-button.css';
import '@assets/styles/contact-form.css';
import { validateVietnamesePhone } from '@utils/phoneValidation';
import { leadsApi } from '@services/leadsApi';

const HotlineButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messages = [
    "📞 Gọi ngay",
    "📱 Hotline 24/7",
    "💬 Tư vấn miễn phí"
  ];

  const messageRef = useRef(null);

  // Auto-show message on load and rotate text
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 1000);

    const textTimer = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(textTimer);
    };
  }, [messages.length]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên của bạn';
    }

    const phoneValidation = validateVietnamesePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      await leadsApi.submitLead({
        fullName: formData.name,
        phone: formData.phone,
        note: formData.message
      });

      setShowSuccess(true);
      setFormData({ name: '', phone: '', message: '' });
      setShowModal(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setErrors({});
  };

  // Close modal when clicking outside
  const handleModalClick = (e) => {
    if (e.target.classList.contains('hotline-modal')) {
      closeModal();
    }
  };

  return (
    <>
      {/* Hotline Button */}
      <div
        className="hotline-button"
        onClick={() => {
          console.log('Hotline button clicked');
          setShowModal(true);
        }}
      >
        <i className="fas fa-phone-alt phone-icon"></i>
      </div>

      {/* Message Popup */}
      <div
        ref={messageRef}
        className={`hotline-message ${showMessage ? 'show' : ''}`}
      >
        {messages[currentTextIndex]}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div
          className="hotline-modal show"
          onClick={handleModalClick}
        >
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              ❌
            </button>

            <div className="form-container">
              <form className="contact-form" onSubmit={handleSubmit}>
                <h3 className="form-title">Tư vấn cùng chuyên gia</h3>

                <div className="form-group">
                  <label htmlFor="name">Họ và tên</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên của bạn"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại (Zalo/WhatsApp)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="VD: 0912345678 hoặc 0123456789"
                    pattern="[0-9]{10,11}"
                    maxLength="11"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Lời nhắn</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Nhập lời nhắn hoặc yêu cầu của bạn..."
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-cancel" onClick={closeModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="success-popup show">
          ✅ Yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ ngay.
        </div>
      )}
    </>
  );
};

export default HotlineButton;
