import { useState, useEffect } from 'react'
import './Layout.css'
import HotlineButton from '../HotlineButton'

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <div className="layout">
      <header className={`header ${isSticky ? 'sticky' : ''}`}>
        <nav className="nav">
          <a href="#home" className="logo">
            <span className="logo-text">Spa KimKang</span>
          </a>
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`}>
            <li>
              <a 
                href="#home" 
                onClick={() => scrollToSection('home')}
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                onClick={() => scrollToSection('about')}
              >
                Giới thiệu
              </a>
            </li>
            <li>
              <a 
                href="#services" 
                onClick={() => scrollToSection('services')}
              >
                Dịch vụ
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                onClick={() => scrollToSection('contact')}
              >
                Liên hệ
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="main-content">
        {children}
      </main>
      
      <HotlineButton />
    </div>
  )
}

export default Layout