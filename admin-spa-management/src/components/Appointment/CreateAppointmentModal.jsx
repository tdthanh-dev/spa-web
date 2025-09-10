import React, { useState, useEffect } from 'react';
import { appointmentsService } from '@/services';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import './CreateAppointmentModal.css';

const CreateAppointmentModal = ({ 
  isOpen, 
  onClose, 
  onAppointmentCreated,
  lead = null,
  services = [],
  customers = []
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialValues = {
    customerId: lead?.customerId || '',
    serviceId: '',
    startAt: '',
    endAt: '',
    status: 'SCHEDULED',
    notes: lead?.note || ''
  };

  const validation = {
    customerId: [validationRules.required('Vui lòng chọn khách hàng')],
    serviceId: [validationRules.required('Vui lòng chọn dịch vụ')],
    startAt: [validationRules.required('Vui lòng chọn thời gian bắt đầu')],
    endAt: [validationRules.required('Vui lòng chọn thời gian kết thúc')],
    status: [validationRules.required('Vui lòng chọn trạng thái')]
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    reset,
    setValues
  } = useFormValidation(initialValues, validation);

  useEffect(() => {
    if (isOpen && lead) {
      // Auto-fill form with lead data
      setValues({
        customerId: lead.customerId || '',
        serviceId: '',
        startAt: '',
        endAt: '',
        status: 'SCHEDULED',
        notes: lead.note || ''
      });
    }
  }, [isOpen, lead, setValues]);

  const handleServiceChange = (serviceId) => {
    const selectedService = services.find(s => s.serviceId === parseInt(serviceId));
    if (selectedService && values.startAt) {
      const startTime = new Date(values.startAt);
      const endTime = new Date(startTime.getTime() + selectedService.durationMin * 60000);
      
      setValues(prev => ({
        ...prev,
        serviceId,
        endAt: endTime.toISOString().slice(0, 16)
      }));
    } else {
      handleChange('serviceId', serviceId);
    }
  };

  const handleStartTimeChange = (startAt) => {
    const selectedService = services.find(s => s.serviceId === parseInt(values.serviceId));
    if (selectedService) {
      const startTime = new Date(startAt);
      const endTime = new Date(startTime.getTime() + selectedService.durationMin * 60000);
      
      setValues(prev => ({
        ...prev,
        startAt,
        endAt: endTime.toISOString().slice(0, 16)
      }));
    } else {
      handleChange('startAt', startAt);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const appointmentData = {
        customerId: parseInt(values.customerId),
        serviceId: parseInt(values.serviceId),
        startAt: new Date(values.startAt).toISOString(),
        endAt: new Date(values.endAt).toISOString(),
        status: values.status,
        notes: values.notes
      };

      await appointmentsService.create(appointmentData);
      
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
      
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Không thể tạo lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content create-appointment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tạo lịch hẹn mới</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customerId">
                Khách hàng <span className="required">*</span>
              </label>
              <select
                id="customerId"
                value={values.customerId}
                onChange={(e) => handleChange('customerId', e.target.value)}
                onBlur={() => handleBlur('customerId')}
                className={errors.customerId && touched.customerId ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Chọn khách hàng</option>
                {customers.map(customer => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.fullName} - {customer.phone}
                  </option>
                ))}
              </select>
              {errors.customerId && touched.customerId && (
                <span className="field-error">{errors.customerId}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="serviceId">
                Dịch vụ <span className="required">*</span>
              </label>
              <select
                id="serviceId"
                value={values.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                onBlur={() => handleBlur('serviceId')}
                className={errors.serviceId && touched.serviceId ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Chọn dịch vụ</option>
                {services.map(service => (
                  <option key={service.serviceId} value={service.serviceId}>
                    {service.name} - {service.durationMin} phút
                  </option>
                ))}
              </select>
              {errors.serviceId && touched.serviceId && (
                <span className="field-error">{errors.serviceId}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="startAt">
                Thời gian bắt đầu <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="startAt"
                value={values.startAt}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                onBlur={() => handleBlur('startAt')}
                className={errors.startAt && touched.startAt ? 'error' : ''}
                disabled={loading}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.startAt && touched.startAt && (
                <span className="field-error">{errors.startAt}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endAt">
                Thời gian kết thúc <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="endAt"
                value={values.endAt}
                onChange={(e) => handleChange('endAt', e.target.value)}
                onBlur={() => handleBlur('endAt')}
                className={errors.endAt && touched.endAt ? 'error' : ''}
                disabled={loading}
                min={values.startAt || new Date().toISOString().slice(0, 16)}
              />
              {errors.endAt && touched.endAt && (
                <span className="field-error">{errors.endAt}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status">
                Trạng thái <span className="required">*</span>
              </label>
              <select
                id="status"
                value={values.status}
                onChange={(e) => handleChange('status', e.target.value)}
                onBlur={() => handleBlur('status')}
                className={errors.status && touched.status ? 'error' : ''}
                disabled={loading}
              >
                <option value="SCHEDULED">Đã đặt</option>
                <option value="CONFIRMED">Đã xác nhận</option>
              </select>
              {errors.status && touched.status && (
                <span className="field-error">{errors.status}</span>
              )}
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Ghi chú</label>
            <textarea
              id="notes"
              value={values.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Nhập ghi chú cho lịch hẹn..."
              rows="3"
              disabled={loading}
            />
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
            disabled={loading || !isValid}
          >
            {loading ? 'Đang tạo...' : 'Tạo lịch hẹn'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
