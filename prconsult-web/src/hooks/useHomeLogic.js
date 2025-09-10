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
    // Clear error when user starts typing
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
    console.log('Form submitted with data:', formData)

    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      console.log('Submitting lead to API...')
      const result = await leadsApi.submitLead(formData)
      console.log('API response:', result)
      setSubmitMessage('✅ Yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ sớm nhất.')
      setFormData({ fullName: '', phone: '', note: '' })
      setErrors({})
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitMessage('❌ Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if form is valid for button styling (enable button if at least one field is filled)
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
