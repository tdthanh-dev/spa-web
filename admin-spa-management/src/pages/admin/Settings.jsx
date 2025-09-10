import React, { useState, useEffect } from 'react';
import { servicesAPI } from '@/services/api';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    businessInfo: {
      name: 'Spa Thẩm Mỹ ABC',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0123 456 789',
      email: 'contact@spaspa.com',
      website: 'www.spaspa.com'
    },
    businessHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false }
    },
    systemSettings: {
      autoBackup: true,
      backupFrequency: 'daily',
      maxAppointmentPerDay: 50,
      advanceBookingDays: 30,
      smsNotifications: true,
      emailNotifications: true,
      autoReminders: true
    },
    pricingSettings: {
      currency: 'VND',
      taxRate: 8,
      discountThreshold: 1000000,
      loyaltyPointsRate: 1
    }
  });

  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage('✅ Cài đặt đã được lưu thành công!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Có lỗi khi lưu cài đặt. Vui lòng thử lại.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessInfo = (field, value) => {
    setSettings(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    }));
  };

  const updateBusinessHours = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const updateSystemSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      systemSettings: {
        ...prev.systemSettings,
        [field]: value
      }
    }));
  };

  const updatePricingSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      pricingSettings: {
        ...prev.pricingSettings,
        [field]: value
      }
    }));
  };

  const renderBusinessTab = () => (
    <div className="settings-section">
      <h3>🏢 Thông tin doanh nghiệp</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>Tên spa:</label>
          <input
            type="text"
            value={settings.businessInfo.name}
            onChange={(e) => updateBusinessInfo('name', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ:</label>
          <input
            type="text"
            value={settings.businessInfo.address}
            onChange={(e) => updateBusinessInfo('address', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Số điện thoại:</label>
          <input
            type="tel"
            value={settings.businessInfo.phone}
            onChange={(e) => updateBusinessInfo('phone', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={settings.businessInfo.email}
            onChange={(e) => updateBusinessInfo('email', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Website:</label>
          <input
            type="url"
            value={settings.businessInfo.website}
            onChange={(e) => updateBusinessInfo('website', e.target.value)}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  const renderHoursTab = () => (
    <div className="settings-section">
      <h3>🕐 Giờ làm việc</h3>

      <div className="business-hours">
        {Object.entries(settings.businessHours).map(([day, hours]) => (
          <div key={day} className="day-hours">
            <div className="day-name">
              {day === 'monday' && 'Thứ Hai'}
              {day === 'tuesday' && 'Thứ Ba'}
              {day === 'wednesday' && 'Thứ Tư'}
              {day === 'thursday' && 'Thứ Năm'}
              {day === 'friday' && 'Thứ Sáu'}
              {day === 'saturday' && 'Thứ Bảy'}
              {day === 'sunday' && 'Chủ Nhật'}
            </div>

            <div className="hours-controls">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  onChange={(e) => updateBusinessHours(day, 'closed', !e.target.checked)}
                />
                Mở cửa
              </label>

              {!hours.closed && (
                <>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                    className="time-input"
                  />
                  <span>đến</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                    className="time-input"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="settings-section">
      <h3>⚙️ Cài đặt hệ thống</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>Sao lưu tự động:</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.systemSettings.autoBackup}
              onChange={(e) => updateSystemSettings('autoBackup', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="form-group">
          <label>Tần suất sao lưu:</label>
          <select
            value={settings.systemSettings.backupFrequency}
            onChange={(e) => updateSystemSettings('backupFrequency', e.target.value)}
            className="form-select"
          >
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
          </select>
        </div>

        <div className="form-group">
          <label>Lịch hẹn tối đa/ngày:</label>
          <input
            type="number"
            value={settings.systemSettings.maxAppointmentPerDay}
            onChange={(e) => updateSystemSettings('maxAppointmentPerDay', Number(e.target.value))}
            className="form-input"
            min="1"
            max="100"
          />
        </div>

        <div className="form-group">
          <label>Đặt lịch trước tối đa (ngày):</label>
          <input
            type="number"
            value={settings.systemSettings.advanceBookingDays}
            onChange={(e) => updateSystemSettings('advanceBookingDays', Number(e.target.value))}
            className="form-input"
            min="1"
            max="365"
          />
        </div>

        <div className="form-group">
          <label>Thông báo SMS:</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.systemSettings.smsNotifications}
              onChange={(e) => updateSystemSettings('smsNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="form-group">
          <label>Thông báo Email:</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.systemSettings.emailNotifications}
              onChange={(e) => updateSystemSettings('emailNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="form-group">
          <label>Nhắc nhở tự động:</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.systemSettings.autoReminders}
              onChange={(e) => updateSystemSettings('autoReminders', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="settings-section">
      <h3>💰 Cài đặt giá cả</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>Đơn vị tiền tệ:</label>
          <select
            value={settings.pricingSettings.currency}
            onChange={(e) => updatePricingSettings('currency', e.target.value)}
            className="form-select"
          >
            <option value="VND">VNĐ</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="form-group">
          <label>Thuế (%):</label>
          <input
            type="number"
            value={settings.pricingSettings.taxRate}
            onChange={(e) => updatePricingSettings('taxRate', Number(e.target.value))}
            className="form-input"
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div className="form-group">
          <label>Ngưỡng giảm giá (VNĐ):</label>
          <input
            type="number"
            value={settings.pricingSettings.discountThreshold}
            onChange={(e) => updatePricingSettings('discountThreshold', Number(e.target.value))}
            className="form-input"
            min="0"
            step="100000"
          />
        </div>

        <div className="form-group">
          <label>Tỷ lệ tích điểm (VNĐ = 1 điểm):</label>
          <input
            type="number"
            value={settings.pricingSettings.loyaltyPointsRate}
            onChange={(e) => updatePricingSettings('loyaltyPointsRate', Number(e.target.value))}
            className="form-input"
            min="0"
            step="0.1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>⚙️ Cài đặt hệ thống</h1>
        <p>Cấu hình và quản lý cài đặt của spa</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="settings-content">
        {/* Tab Navigation */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            🏢 Doanh nghiệp
          </button>
          <button
            className={`tab-btn ${activeTab === 'hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('hours')}
          >
            🕐 Giờ làm việc
          </button>
          <button
            className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            ⚙️ Hệ thống
          </button>
          <button
            className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            💰 Giá cả
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'business' && renderBusinessTab()}
          {activeTab === 'hours' && renderHoursTab()}
          {activeTab === 'system' && renderSystemTab()}
          {activeTab === 'pricing' && renderPricingTab()}
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            className="save-btn"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : '💾 Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
