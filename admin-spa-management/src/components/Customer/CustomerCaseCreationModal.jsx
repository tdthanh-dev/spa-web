import React, { useState, useEffect } from 'react';
import { customerCaseService, servicesService } from '@/services';
import { CASE_STATUS_MAP } from '@/config/constants';
import './CustomerCaseCreationModal.css';

const CustomerCaseCreationModal = ({ 
  isOpen, 
  onClose, 
  onCaseCreated,
  customerId,
  customerName = ''
}) => {
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    serviceId: '',
    status: 'INTAKE', // Default status
    startDate: new Date().toISOString().split('T')[0], // Today
    endDate: '',
    notes: ''
  });

  const [validation, setValidation] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Function to get status descriptions
  const getStatusDescription = (status) => {
    const descriptions = {
      'INTAKE': 'Hồ sơ mới được tạo',
      'IN_PROGRESS': 'Quá trình điều trị đang diễn ra',
      'COMPLETED': 'Đã hoàn thành điều trị',
      'ON_HOLD': 'Tạm dừng điều trị',
      'CANCELLED': 'Hủy bỏ điều trị'
    };
    return descriptions[status] || '';
  };

  // Status options for case management - Using backend enum values
  const statusOptions = Object.keys(CASE_STATUS_MAP).map(key => ({
    value: key,
    label: CASE_STATUS_MAP[key].label,
    description: getStatusDescription(key)
  }));

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        customerId: customerId || ''
      }));
      fetchServices();
    }
  }, [isOpen, customerId]);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await servicesService.getActive();
      setServices(response?.content || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Không thể tải danh sách dịch vụ');
    } finally {
      setServicesLoading(false);
    }
  };

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'customerId':
        if (!value) {
          errors.customerId = 'Customer ID là bắt buộc';
        }
        break;
      
      case 'serviceId':
        if (!value) {
          errors.serviceId = 'Dịch vụ là bắt buộc';
        }
        break;
      
      case 'status':
        if (!value) {
          errors.status = 'Trạng thái là bắt buộc';
        }
        break;
      
      case 'startDate':
        if (!value) {
          errors.startDate = 'Ngày bắt đầu là bắt buộc';
        }
        break;
      
      case 'endDate':
        if (value && formData.startDate && new Date(value) < new Date(formData.startDate)) {
          errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }
        break;
      
      case 'notes':
        if (value && value.length > 1000) {
          errors.notes = 'Ghi chú không được vượt quá 1000 ký tự';
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

    // Special validation for end date when start date changes
    if (field === 'startDate' && formData.endDate) {
      const endDateErrors = validateField('endDate', formData.endDate);
      setValidation(prev => ({
        ...prev,
        ...endDateErrors
      }));
    }
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

      console.log('Creating customer case with data:', formData);

      // Format data for API
      const apiData = {
        customerId: parseInt(formData.customerId),
        serviceId: parseInt(formData.serviceId),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        notes: formData.notes?.trim() || null
      };

      const response = await customerCaseService.create(apiData);
      
      console.log('Customer case created successfully:', response);

      if (onCaseCreated) {
        onCaseCreated(response);
      }

      // Reset form
      setFormData({
        customerId: customerId || '',
        serviceId: '',
        status: 'INTAKE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: ''
      });

      onClose();

    } catch (err) {
      console.error('Error creating customer case:', err);
      
      let errorMessage = 'Không thể tạo hồ sơ điều trị';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Hồ sơ điều trị này đã tồn tại';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        customerId: customerId || '',
        serviceId: '',
        status: 'INTAKE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: ''
      });
      setValidation({});
      setError(null);
      onClose();
    }
  };

  const getSelectedService = () => {
    return services.find(service => service.serviceId.toString() === formData.serviceId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!isOpen) return null;

  const selectedService = getSelectedService();

  return (
    <div className="modal-overlay customer-case-creation-modal" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🩺 Tạo hồ sơ điều trị</h2>
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

          {/* Customer Info */}
          <div className="customer-info-section">
            <h3>👤 Thông tin khách hàng</h3>
            <div className="customer-display">
              <span className="customer-name">{customerName || `Customer #${customerId}`}</span>
              <span className="customer-id">ID: {customerId}</span>
            </div>
          </div>

          <div className="form-grid">
            {/* Service Selection */}
            <div className="form-section">
              <h3>🛍️ Dịch vụ điều trị</h3>
              
              <div className="form-group">
                <label htmlFor="serviceId" className="required">
                  Chọn dịch vụ
                </label>
                {servicesLoading ? (
                  <div className="loading-select">Đang tải dịch vụ...</div>
                ) : (
                  <select
                    id="serviceId"
                    value={formData.serviceId}
                    onChange={(e) => handleInputChange('serviceId', e.target.value)}
                    className={validation.serviceId ? 'error' : ''}
                    disabled={loading}
                    required
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    {services.map(service => (
                      <option key={service.serviceId} value={service.serviceId}>
                        {service.name} - {formatCurrency(service.price)}
                        {service.durationMinutes && ` (${service.durationMinutes} phút)`}
                      </option>
                    ))}
                  </select>
                )}
                {validation.serviceId && (
                  <span className="field-error">{validation.serviceId}</span>
                )}
              </div>

              {selectedService && (
                <div className="service-details">
                  <h4>Chi tiết dịch vụ</h4>
                  <div className="service-info">
                    <p><strong>Mã:</strong> {selectedService.code}</p>
                    <p><strong>Loại:</strong> {selectedService.category}</p>
                    <p><strong>Giá:</strong> {formatCurrency(selectedService.price)}</p>
                    {selectedService.durationMinutes && (
                      <p><strong>Thời gian:</strong> {selectedService.durationMinutes} phút</p>
                    )}
                    {selectedService.description && (
                      <p><strong>Mô tả:</strong> {selectedService.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Case Details */}
            <div className="form-section">
              <h3>📋 Chi tiết hồ sơ</h3>
              
              <div className="form-group">
                <label htmlFor="status" className="required">
                  Trạng thái
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={validation.status ? 'error' : ''}
                  disabled={loading}
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validation.status && (
                  <span className="field-error">{validation.status}</span>
                )}
                {formData.status && (
                  <div className="status-description">
                    {statusOptions.find(opt => opt.value === formData.status)?.description}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate" className="required">
                    📅 Ngày bắt đầu
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={validation.startDate ? 'error' : ''}
                    disabled={loading}
                    required
                  />
                  {validation.startDate && (
                    <span className="field-error">{validation.startDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">
                    📅 Ngày kết thúc dự kiến
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={validation.endDate ? 'error' : ''}
                    disabled={loading}
                    min={formData.startDate}
                  />
                  {validation.endDate && (
                    <span className="field-error">{validation.endDate}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-section full-width">
              <h3>📝 Ghi chú</h3>
              
              <div className="form-group">
                <label htmlFor="notes">
                  Ghi chú điều trị
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Nhập ghi chú về quá trình điều trị..."
                  rows="4"
                  className={validation.notes ? 'error' : ''}
                  disabled={loading}
                  maxLength="1000"
                />
                {validation.notes && (
                  <span className="field-error">{validation.notes}</span>
                )}
                <div className="character-count">
                  {formData.notes.length}/1000 ký tự
                </div>
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
            disabled={loading || !formData.customerId || !formData.serviceId}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang tạo...
              </>
            ) : (
              <>
                🩺 Tạo hồ sơ điều trị
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCaseCreationModal;
