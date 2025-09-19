import { useState } from 'react'
import { validateVietnamesePhone } from '@utils/phoneValidation'
import { leadsApi } from '@services/leadsApi'

export const useHomeLogic = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    note: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error khi user bắt đầu nhập lại
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên'
    }

    const phoneValidation = validateVietnamesePhone(formData.phone)
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const result = await leadsApi.submitLead(formData)
      // Thành công
      setSubmitMessage('✅ Yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ sớm nhất.')
      setFormData({ fullName: '', phone: '', note: '' })
      setErrors({})
      return result
    } catch (error) {
      console.error('Error submitting form:', error)

      // Lấy thông báo lỗi từ server nếu có
      const serverMessage =
        error?.response?.data?.error || // trường "error" trong ví dụ bạn gửi
        error?.response?.data?.message || // fallback nếu server dùng "message"
        error?.message // cuối cùng dùng message từ axios error

      if (serverMessage) {
        setSubmitMessage(`❌ ${serverMessage}`)
      } else {
        setSubmitMessage('❌ Có lỗi xảy ra. Vui lòng thử lại sau.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Dùng để styling nút (enable nếu có nhập tên hoặc số điện thoại)
  const isFormValid = formData.fullName.trim() || formData.phone.trim()

  return {
    formData,
    isSubmitting,
    submitMessage,
    errors,
    isFormValid,
    handleInputChange,
    handleSubmit
  }
}
