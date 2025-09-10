import React, { useState } from 'react';
import { customersService } from '@/services';
import './CustomerCreationModal.css';

const CustomerCreationModal = ({ 
  isOpen, 
  onClose, 
  onCustomerCreated,
  leadData = null // Pre-fill data from lead if provided
}) => {
  const [formData, setFormData] = useState({
    fullName: leadData?.fullName || '',
    phone: leadData?.phone || '',
    email: leadData?.email || '',
    address: '',
    dob: '',
    gender: 'FEMALE',
    notes: leadData?.note || '',
    isVip: false
  });

  const [validation, setValidation] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'fullName':
        if (!value || value.trim().length < 2) {
          errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        } else if (value.length > 200) {
          errors.fullName = 'Họ tên không được quá 200 ký tự';
        }
        break;
      
      case 'phone':
        if (!value) {
          errors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(value)) {
          errors.phone = 'Số điện thoại phải có 10-11 chữ số';
        }
        break;
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Email không hợp lệ';
        }
        break;
      
      case 'dob':
        if (value && new Date(value) >= new Date()) {
          errors.dob = 'Ngày sinh phải là ngày trong quá khứ';
        }
        break;
      
      case 'address':
        if (value && value.length > 500) {
          errors.address = 'Địa chỉ không được quá 500 ký tự';
        }
        break;
    }
    
    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate field
    const fieldErrors = validateField(field, value);
    setValidation(prev => ({
      ...prev,
      ...fieldErrors,
      [field]: fieldErrors[field] ? fieldErrors[field] : undefined
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    Object.keys(formData).forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      Object.assign(errors, fieldErrors);
    });

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Vui lòng sửa các lỗi trong form');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Creating customer with data:', formData);

      // Format data for API (convert empty strings to null for optional fields)
      const apiData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        dob: formData.dob || null,
        gender: formData.gender,
        notes: formData.notes?.trim() || null,
        isVip: formData.isVip
      };

      const response = await customersService.create(apiData);
      
      console.log('Customer created successfully:', response);

      if (onCustomerCreated) {
        onCustomerCreated(response);
      }

      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        dob: '',
        gender: 'FEMALE',
        notes: '',
        isVip: false
      });

      onClose();

    } catch (err) {
      console.error('Error creating customer:', err);
      
      let errorMessage = 'Không thể tạo khách hàng';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Số điện thoại đã tồn tại trong hệ thống';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        fullName: leadData?.fullName || '',
        phone: leadData?.phone || '',
        email: leadData?.email || '',
        address: '',
        dob: '',
        gender: 'FEMALE',
        notes: leadData?.note || '',
        isVip: false
      });
      setValidation({});
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay customer-creation-modal" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🆕 Tạo khách hàng mới</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Thông tin cơ bản</h3>
              
              <div className="form-group">
                <label htmlFor="fullName" className="required">
                  👤 Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Nhập họ và tên"
                  className={validation.fullName ? 'error' : ''}
                  disabled={loading}
                  required
                />
                {validation.fullName && (
                  <span className="field-error">{validation.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="required">
                  📞 Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="0987654321"
                  className={validation.phone ? 'error' : ''}
                  disabled={loading}
                  required
                />
                {validation.phone && (
                  <span className="field-error">{validation.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  📧 Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  className={validation.email ? 'error' : ''}
                  disabled={loading}
                />
                {validation.email && (
                  <span className="field-error">{validation.email}</span>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="form-section">
              <h3>Thông tin cá nhân</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dob">
                    🎂 Ngày sinh
                  </label>
                  <input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className={validation.dob ? 'error' : ''}
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {validation.dob && (
                    <span className="field-error">{validation.dob}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">
                    ⚧ Giới tính
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={loading}
                  >
                    <option value="FEMALE">Nữ</option>
                    <option value="MALE">Nam</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  🏠 Địa chỉ
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className={validation.address ? 'error' : ''}
                  disabled={loading}
                />
                {validation.address && (
                  <span className="field-error">{validation.address}</span>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section full-width">
              <h3>Thông tin bổ sung</h3>
              
              <div className="form-group">
                <label htmlFor="notes">
                  📝 Ghi chú
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Nhập ghi chú về khách hàng..."
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={(e) => handleInputChange('isVip', e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-custom"></span>
                  👑 Khách hàng VIP
                </label>
              </div>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !formData.fullName || !formData.phone}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang tạo...
              </>
            ) : (
              <>
                ✅ Tạo khách hàng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreationModal;
