import { useState } from 'react'
import { submitCustomerRequest } from '@services/api'
import { useFormValidation, validationRules } from '@hooks/useFormValidation'
import './BookingForm.css'

const BookingForm = ({ onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const initialValues = {
    name: '',
    phoneNumber: '',
    serviceType: '',
    preferredDate: '',
    customerNote: ''
  }

  const validation = {
    name: [validationRules.required('Vui lòng nhập họ tên')],
    phoneNumber: [
      validationRules.required('Vui lòng nhập số điện thoại'),
      validationRules.phone('Số điện thoại không hợp lệ')
    ],
    serviceType: [validationRules.required('Vui lòng chọn dịch vụ')],
    preferredDate: [validationRules.required('Vui lòng chọn ngày mong muốn')]
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

  const serviceOptions = [
    { value: 'lip-tattoo', label: 'Xăm Môi Tự Nhiên' },
    { value: 'eyebrow-6d', label: 'Xăm Chân Mày 6D' },
    { value: 'lip-ombre', label: 'Phun Môi Ombre' },
    { value: 'consultation', label: 'Tư Vấn Miễn Phí' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setSubmitMessage('Vui lòng kiểm tra lại thông tin')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const formData = {
        name: values.name,
        phoneNumber: values.phoneNumber,
        customerNote: `Dịch vụ: ${values.serviceType}. Ngày mong muốn: ${values.preferredDate}. ${values.customerNote || ''}`
      }

      const result = await submitCustomerRequest(formData)
      
      if (result.success) {
        setSubmitMessage('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.')
        reset()
        if (onSuccess) onSuccess(result.data)
      } else {
        setSubmitMessage(result.error || 'Có lỗi xảy ra, vui lòng thử lại')
      }
    } catch {
      setSubmitMessage('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="booking-form-container">
      <h3>Đặt Lịch Hẹn</h3>
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="name">Họ và tên *</label>
          <input
            type="text"
            id="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={errors.name && touched.name ? 'error' : ''}
            placeholder="Nhập họ và tên"
          />
          {errors.name && touched.name && (
            <span className="error-message">{errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Số điện thoại *</label>
          <input
            type="tel"
            id="phoneNumber"
            value={values.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            onBlur={() => handleBlur('phoneNumber')}
            className={errors.phoneNumber && touched.phoneNumber ? 'error' : ''}
            placeholder="Nhập số điện thoại"
          />
          {errors.phoneNumber && touched.phoneNumber && (
            <span className="error-message">{errors.phoneNumber}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="serviceType">Dịch vụ quan tâm *</label>
          <select
            id="serviceType"
            value={values.serviceType}
            onChange={(e) => handleChange('serviceType', e.target.value)}
            onBlur={() => handleBlur('serviceType')}
            className={errors.serviceType && touched.serviceType ? 'error' : ''}
          >
            <option value="">Chọn dịch vụ</option>
            {serviceOptions.map(option => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.serviceType && touched.serviceType && (
            <span className="error-message">{errors.serviceType}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="preferredDate">Ngày mong muốn *</label>
          <input
            type="date"
            id="preferredDate"
            value={values.preferredDate}
            onChange={(e) => handleChange('preferredDate', e.target.value)}
            onBlur={() => handleBlur('preferredDate')}
            className={errors.preferredDate && touched.preferredDate ? 'error' : ''}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.preferredDate && touched.preferredDate && (
            <span className="error-message">{errors.preferredDate}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="customerNote">Ghi chú thêm</label>
          <textarea
            id="customerNote"
            value={values.customerNote}
            onChange={(e) => handleChange('customerNote', e.target.value)}
            placeholder="Ghi chú thêm về yêu cầu của bạn..."
            rows="3"
          />
        </div>

        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('thành công') ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        )}

        <div className="form-buttons">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? 'Đang gửi...' : 'Đặt Lịch'}
          </button>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default BookingForm