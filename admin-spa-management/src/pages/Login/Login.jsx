import React, { useState } from 'react';
import AuthForm from '@/components/AuthForm/AuthForm';
import './Login.css';

const Login = ({ onLogin }) => {
  const [selectedCountry, setSelectedCountry] = useState('VN');
  const [selectedLanguage, setSelectedLanguage] = useState('vi');

  const countries = [
    { code: 'VN', name: 'Việt Nam', flag: '🇻🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' }
  ];

  const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ];

  return (
    <div className="login-page">
      {/* Background Image with Blur Overlay */}
      <div className="login-background">
        <div className="blur-overlay"></div>
      </div>

      {/* Header */}
      <header className="login-header">
        <div className="login-header-content">
          {/* Logo */}
          <div className="login-logo">
            <span className="logo-text">Trung tâm quản lý SPA</span>
          </div>

          {/* Navigation */}
          <div className="login-nav">
            {/* Country Dropdown */}
            <div className="dropdown-container">
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="country-select"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="dropdown-container">
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="language-select"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Login Button */}
            <button className="login-btn">
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-content">
          {/* Left side - Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">Chào mừng đến với</h1>
            <h2 className="spa-title">Hệ thống quản lý SPA</h2>
            <p className="welcome-description">
              Trải nghiệm dịch vụ spa đẳng cấp với công nghệ quản lý hiện đại
            </p>
          </div>

          {/* Right side - Auth Form */}
          <div className="auth-section">
            <AuthForm onLogin={onLogin} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;