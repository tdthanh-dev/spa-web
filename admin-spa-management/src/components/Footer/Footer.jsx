import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Cột 1: Hệ thống quản lý khách hàng */}
        <div className="footer-column">
          <h3 className="footer-title">Hệ thống quản lý khách hàng</h3>
          <ul className="footer-links">
            <li><a href="#">Quản lý thông tin</a></li>
            <li><a href="#">Lịch sử dịch vụ</a></li>
            <li><a href="#">Chương trình khuyến mãi</a></li>
            <li><a href="#">Báo cáo thống kê</a></li>
          </ul>
        </div>

        {/* Cột 2: Liên hệ */}
        <div className="footer-column">
          <h3 className="footer-title">Liên hệ</h3>
          <ul className="footer-links">
            <li>
              <span className="contact-icon">📍</span>
              123 Đường ABC, Quận 1, TP.HCM
            </li>
            <li>
              <span className="contact-icon">📞</span>
              (028) 1234 5678
            </li>
            <li>
              <span className="contact-icon">✉️</span>
              info@spa.com
            </li>
            <li>
              <span className="contact-icon">🌐</span>
              www.spa.com
            </li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ */}
        <div className="footer-column">
          <h3 className="footer-title">Hỗ trợ</h3>
          <ul className="footer-links">
            <li><a href="#">Hướng dẫn sử dụng</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Hỗ trợ kỹ thuật</a></li>
            <li><a href="#">Góp ý phản hồi</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Spa Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;