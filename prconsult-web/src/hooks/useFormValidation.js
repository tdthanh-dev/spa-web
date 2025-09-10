import { useState, useMemo, useCallback } from 'react'
import { validateVietnamesePhone } from '@utils/phoneValidation'

/**
 * Custom hook for form validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} - Form state and validation methods
 */
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name]
    if (!rules) return ''

    for (const rule of rules) {
      const error = rule(value, values)
      if (error) return error
    }
    return ''
  }, [validationRules, values])

  // Validate all fields
  const validateForm = () => {
    const newErrors = {}
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name])
      if (error) newErrors[name] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input change
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field if it was touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  // Handle input blur
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  // Reset form
  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(validationRules).every(name => {
      const error = validateField(name, values[name])
      return !error
    })
  }, [values, validationRules, validateField])

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    reset,
    setValues,
    setErrors
  }
}

// Common validation rules
export const validationRules = {
  required: (message = 'Trường này là bắt buộc') => (value) => {
    return value && value.toString().trim() ? '' : message
  },
  
  email: (message = 'Email không hợp lệ') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !value || emailRegex.test(value) ? '' : message
  },
  
  phone: () => (value) => {
    if (!value) return ''
    
    const phoneValidation = validateVietnamesePhone(value)
    if (!phoneValidation.isValid) {
      return phoneValidation.error
    }
    
    return ''
  },
  
  minLength: (min, message) => (value) => {
    const errorMessage = message || `Tối thiểu ${min} ký tự`
    return !value || value.length >= min ? '' : errorMessage
  },
  
  maxLength: (max, message) => (value) => {
    const errorMessage = message || `Tối đa ${max} ký tự`
    return !value || value.length <= max ? '' : errorMessage
  }
}

export default useFormValidation