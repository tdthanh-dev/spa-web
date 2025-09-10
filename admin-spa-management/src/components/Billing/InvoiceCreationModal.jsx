import React, { useState, useEffect } from 'react';
import { invoiceService, servicesService } from '@/services';
import { INVOICE_STATUS_MAP } from '@/config/constants';
import './InvoiceCreationModal.css';

const InvoiceCreationModal = ({ 
  isOpen, 
  onClose, 
  onInvoiceCreated,
  customerId,
  customerName = '',
  caseId = null // Optional - create invoice from case
}) => {
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    totalAmount: 0,
    status: 'DRAFT',
    notes: '',
    dueDate: '',
    items: []
  });

  const [validation, setValidation] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Invoice item form
  const [newItem, setNewItem] = useState({
    serviceId: '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        customerId: customerId || ''
      }));
      fetchServices();
      
      // Set default due date (30 days from now)
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        dueDate: defaultDueDate.toISOString().split('T')[0]
      }));
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
      
      case 'totalAmount':
        if (!value || value <= 0) {
          errors.totalAmount = 'Tổng tiền phải lớn hơn 0';
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

  const handleNewItemChange = (field, value) => {
    setNewItem(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update unit price when service is selected
      if (field === 'serviceId' && value) {
        const selectedService = services.find(s => s.serviceId.toString() === value);
        if (selectedService) {
          updated.unitPrice = selectedService.price;
        }
      }
      
      return updated;
    });
  };

  const addInvoiceItem = () => {
    if (!newItem.serviceId || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      setError('Vui lòng điền đầy đủ thông tin item');
      return;
    }

    const selectedService = services.find(s => s.serviceId.toString() === newItem.serviceId);
    if (!selectedService) {
      setError('Dịch vụ không hợp lệ');
      return;
    }

    const item = {
      serviceId: parseInt(newItem.serviceId),
      serviceName: selectedService.name,
      quantity: parseInt(newItem.quantity),
      unitPrice: parseFloat(newItem.unitPrice),
      totalPrice: parseInt(newItem.quantity) * parseFloat(newItem.unitPrice)
    };

    const updatedItems = [...formData.items, item];
    const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount: newTotalAmount
    }));

    // Reset new item form
    setNewItem({
      serviceId: '',
      quantity: 1,
      unitPrice: 0
    });

    setError(null);
  };

  const removeInvoiceItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount: newTotalAmount
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Basic validation
    Object.keys(formData).forEach(field => {
      if (field !== 'items') {
        const fieldErrors = validateField(field, formData[field]);
        Object.assign(errors, fieldErrors);
      }
    });

    // Items validation
    if (formData.items.length === 0) {
      errors.items = 'Phải có ít nhất một item trong hóa đơn';
    }

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

      console.log('Creating invoice with data:', formData);

      // Format data for API (simplified to match backend expectations)
      const apiData = {
        customerId: parseInt(formData.customerId),
        totalAmount: parseFloat(formData.totalAmount),
        status: formData.status,
        notes: formData.notes?.trim() || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };

      const response = await invoiceService.create(apiData);
      
      console.log('Invoice created successfully:', response);

      if (onInvoiceCreated) {
        onInvoiceCreated(response);
      }

      // Reset form
      setFormData({
        customerId: customerId || '',
        totalAmount: 0,
        status: 'DRAFT',
        notes: '',
        dueDate: '',
        items: []
      });

      onClose();

    } catch (err) {
      console.error('Error creating invoice:', err);
      
      let errorMessage = 'Không thể tạo hóa đơn';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
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
        totalAmount: 0,
        status: 'DRAFT',
        notes: '',
        dueDate: '',
        items: []
      });
      setNewItem({
        serviceId: '',
        quantity: 1,
        unitPrice: 0
      });
      setValidation({});
      setError(null);
      onClose();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay invoice-creation-modal" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Tạo hóa đơn mới</h2>
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
            {/* Invoice Details */}
            <div className="form-section">
              <h3>📋 Chi tiết hóa đơn</h3>
              

              <div className="form-group">
                <label htmlFor="status">
                  Trạng thái
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={loading}
                >
                  {Object.keys(INVOICE_STATUS_MAP).map(status => (
                    <option key={status} value={status}>
                      {INVOICE_STATUS_MAP[status].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">
                  📅 Hạn thanh toán
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">
                  📝 Ghi chú
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Nhập ghi chú về hóa đơn..."
                  rows="3"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div className="form-section">
              <h3>🛍️ Dịch vụ</h3>
              
              {/* Add Item Form */}
              <div className="add-item-form">
                <div className="form-group">
                  <label>Chọn dịch vụ</label>
                  {servicesLoading ? (
                    <div className="loading-select">Đang tải dịch vụ...</div>
                  ) : (
                    <select
                      value={newItem.serviceId}
                      onChange={(e) => handleNewItemChange('serviceId', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">-- Chọn dịch vụ --</option>
                      {services.map(service => (
                        <option key={service.serviceId} value={service.serviceId}>
                          {service.name} - {formatCurrency(service.price)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => handleNewItemChange('quantity', e.target.value)}
                      min="1"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Đơn giá</label>
                    <input
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => handleNewItemChange('unitPrice', e.target.value)}
                      min="0"
                      step="1000"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={addInvoiceItem}
                  disabled={loading || !newItem.serviceId}
                >
                  ➕ Thêm dịch vụ
                </button>
              </div>

              {/* Items List */}
              <div className="items-list">
                {formData.items.length === 0 ? (
                  <div className="no-items">
                    <p>Chưa có dịch vụ nào được thêm</p>
                  </div>
                ) : (
                  formData.items.map((item, index) => (
                    <div key={index} className="item-card">
                      <div className="item-info">
                        <h4>{item.serviceName}</h4>
                        <p>Số lượng: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <div className="item-actions">
                        <span className="item-total">{formatCurrency(item.totalPrice)}</span>
                        <button 
                          type="button"
                          className="remove-btn"
                          onClick={() => removeInvoiceItem(index)}
                          disabled={loading}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              <div className="invoice-total">
                <strong>Tổng cộng: {formatCurrency(formData.totalAmount)}</strong>
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
            disabled={loading || !formData.customerId || formData.items.length === 0}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang tạo...
              </>
            ) : (
              <>
                💰 Tạo hóa đơn
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreationModal;
