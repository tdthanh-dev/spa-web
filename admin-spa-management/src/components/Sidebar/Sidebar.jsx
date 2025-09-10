import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ menuItems = [], onToggle, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (item) => {
    return location.pathname === item.path;
  };

  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        {/* Toggle button */}
        <button 
          className="sidebar-toggle"
          onClick={handleToggle}
        >
          <i className={`fas fa-chevron-left toggle-icon ${isCollapsed ? 'rotated' : ''}`}></i>
        </button>

        {/* Menu items */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleMenuClick(item)}
              title={isCollapsed ? item.label : ''}
            >
              <i className={`nav-icon ${item.iconClass || 'fas fa-circle'}`}></i>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout button */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            <i className="nav-icon fas fa-sign-out-alt"></i>
            {!isCollapsed && <span className="nav-label">Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;