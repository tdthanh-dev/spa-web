import { useState, useEffect } from 'react'

export const useTestimonials = (testimonials, autoRotateInterval = 3000) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    // Auto-rotate testimonials every 3 seconds
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [testimonials.length, autoRotateInterval])

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index)
  }

  const goToNext = () => {
    setCurrentTestimonial((currentTestimonial + 1) % testimonials.length)
  }

  const goToPrevious = () => {
    setCurrentTestimonial(currentTestimonial === 0 ? testimonials.length - 1 : currentTestimonial - 1)
  }

  return {
    currentTestimonial,
    goToTestimonial,
    goToNext,
    goToPrevious,
    totalTestimonials: testimonials.length
  }
}
