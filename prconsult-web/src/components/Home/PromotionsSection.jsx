import React, { useEffect, useState } from 'react'

const PromotionsSection = () => {
  return (
    <section className="promotions-section" id="promotions">
      <div className="container">
        <div className="flash-sale-container" data-aos="fade-up">
          {/* Left Section - Badge + Title */}
          <div className="flash-sale-left">
            <div className="hot-sale-badge">HOT SALE</div>
            <h2 className="flash-sale-title">Flash Sale Hôm Nay</h2>
          </div>
          
          {/* Center Section - Countdown */}
          <div className="flash-sale-center">
            <CountdownTimer />
            <p className="sale-description">
              Giảm đến 50% tất cả dịch vụ
            </p>
          </div>
          
          {/* Right Section - CTA */}
          <div className="flash-sale-right">
            <button 
              className="flash-sale-cta"
              onClick={() => {
                const contactForm = document.getElementById('contact-form')
                if (contactForm) {
                  contactForm.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              Đặt lịch ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const { hours, minutes, seconds } = timeLeft

  return (
    <div className="countdown-container">
      <span className="countdown-label">Kết thúc trong:</span>
      <div className="countdown-timer">
        <div className="countdown-box">
          <div className="countdown-number">{pad(hours)}</div>
          <div className="countdown-unit">Giờ</div>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-box">
          <div className="countdown-number">{pad(minutes)}</div>
          <div className="countdown-unit">Phút</div>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-box">
          <div className="countdown-number">{pad(seconds)}</div>
          <div className="countdown-unit">Giây</div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getTimeUntilMidnight() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const diffMs = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
  
  return { hours, minutes, seconds }
}

function pad(num) {
  return num.toString().padStart(2, '0')
}

export default PromotionsSection