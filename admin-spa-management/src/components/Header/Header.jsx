import React from 'react';
import { APP_CONFIG } from '@/config/constants';
import './Header.css';

const Header = ({ user }) => {
  return (
    <header className="header">
      <div className="header-content">
        {/* Logo bên trái */}
        <div className="header-logo">
          <img src={APP_CONFIG.logo} alt="Spa Logo" className="logo-image" />
          <span className="logo-text">{APP_CONFIG.name}</span>
        </div>

        {/* Ô tìm kiếm ở giữa */}
        <div className="header-search">
          <input 
            type="text" 
            placeholder="Tìm kiếm khách hàng, lịch hẹn..." 
            className="search-input"
          />
          <button className="search-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Tên nhân viên đăng nhập bên phải */}
        <div className="header-user">
          <div className="user-avatar">
            <span>{user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{user?.fullName || 'User'}</span>
            <span className="user-role">{user?.position || 'Nhân viên'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;