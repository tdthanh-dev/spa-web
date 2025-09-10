import { useState } from 'react'

export const useFAQ = () => {
  const [activeAccordion, setActiveAccordion] = useState(null)

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index)
  }

  const openAccordion = (index) => {
    setActiveAccordion(index)
  }

  const closeAccordion = () => {
    setActiveAccordion(null)
  }

  const isAccordionOpen = (index) => {
    return activeAccordion === index
  }

  return {
    activeAccordion,
    toggleAccordion,
    openAccordion,
    closeAccordion,
    isAccordionOpen
  }
}
