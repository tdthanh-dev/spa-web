import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
import Footer from '@/components/Footer/Footer';
import './Layout.css';

const Layout = ({ children, onLogout, user, menuItems = [] }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header user={user} />
      <Sidebar 
        menuItems={menuItems}
        onToggle={handleSidebarToggle}
        onLogout={onLogout}
      />
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;