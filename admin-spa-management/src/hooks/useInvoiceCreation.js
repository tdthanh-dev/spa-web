import { useState, useEffect } from 'react';
import { invoiceService, customerCaseService } from '@/services';
import { INVOICE_STATUS_MAP } from '@/config/constants';

/**
 * Custom         userId: currentUser?.staffId || currentUser?.userId || currentUser?.id || '',ook for Invoice Creation Modal logic
 * Handles form state, validation, API calls, and business logic
 */
export const useInvoiceCreation = ({ customerId, isOpen, onClose, onInvoiceCreated, currentUser, selectedCase }) => {
  // Form state
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    caseId: '',
    userId: '',
    totalAmount: 0,
    status: 'DRAFT',
    notes: '',
    dueDate: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerCases, setCustomerCases] = useState([]); // New state for customer cases
  const [casesLoading, setCasesLoading] = useState(false); // New state for cases loading

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Current user in invoice creation:', currentUser);
      console.log('Setting userId to:', currentUser?.staffId || currentUser?.userId || currentUser?.id || '');
      setFormData(prev => ({
        ...prev,
        customerId: customerId || '',
        caseId: selectedCase ? selectedCase.caseId : '',
        userId: String(currentUser?.staffId || currentUser?.userId || currentUser?.id || ''),
        totalAmount: selectedCase ? (selectedCase.remainingAmount || selectedCase.totalAmount || selectedCase.totalCost || 0) : 0 // Auto-set from case
      }));
      fetchCustomerCases(); // Load customer cases

      // Set default due date (30 days from now)
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        dueDate: defaultDueDate.toISOString().split('T')[0]
      }));
    }
  }, [isOpen, customerId, selectedCase, currentUser]);

  // API functions
  const fetchCustomerCases = async () => {
    if (!customerId) return;

    try {
      setCasesLoading(true);
      const response = await customerCaseService.getByCustomerId(customerId);
      console.log('Loaded customer cases:', response?.content || []);
      setCustomerCases(response?.content || []);
    } catch (err) {
      console.error('Error fetching customer cases:', err);
      setError('Không thể tải danh sách hồ sơ điều trị');
    } finally {
      setCasesLoading(false);
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'customerId':
        if (!value) {
          errors.customerId = 'Customer ID là bắt buộc';
        }
        break;

      case 'caseId':
        if (!value) {
          errors.caseId = 'Case ID là bắt buộc';
        } else {
          // Check if case exists in loaded cases
          const caseExists = customerCases.some(c => c.caseId.toString() === value.toString());
          if (!caseExists) {
            errors.caseId = 'Case không tồn tại';
          }
        }
        break;

      case 'totalAmount':
        // Only require totalAmount if no case is selected
        if (!selectedCase && (!value || value <= 0)) {
          errors.totalAmount = 'Tổng tiền phải lớn hơn 0';
        }
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const errors = {};

    // Basic validation
    Object.keys(formData).forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      Object.assign(errors, fieldErrors);
    });

    return Object.keys(errors).length === 0;
  };

  // Event handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        caseId: formData.caseId ? parseInt(formData.caseId) : null, // Add caseId
        userId: formData.userId && String(formData.userId).trim() && String(formData.userId).trim() !== '0' ? parseInt(formData.userId) : null, // Only send userId if not empty or zero
        totalAmount: parseFloat(formData.totalAmount),
        status: formData.status,
        notes: formData.notes?.trim() || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate + 'T23:59:59').toISOString() : null, // Send as full datetime at end of day
      };

      console.log('Sending API data:', apiData);

      const response = await invoiceService.create(apiData);

      console.log('Invoice created successfully:', response);

      if (onInvoiceCreated) {
        onInvoiceCreated(response);
      }

      // Reset form
      resetForm();
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
    resetForm();
    onClose();
  };

  // Utility functions
  const resetForm = () => {
    setFormData({
      customerId: customerId || '',
      caseId: selectedCase ? selectedCase.caseId : '',
      userId: currentUser?.staffId || currentUser?.userId || '',
      totalAmount: selectedCase ? (selectedCase.remainingAmount || selectedCase.totalAmount || selectedCase.totalCost || 0) : 0,
      status: 'DRAFT',
      notes: '',
      dueDate: ''
    });
    setError(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Return all state and functions needed by the UI component
  return {
    // State
    formData,
    loading,
    error,
    customerCases, // Add customer cases
    casesLoading, // Add cases loading state

    // Event handlers
    handleInputChange,
    handleSubmit,
    handleClose,

    // Utility functions
    formatCurrency,
    validateForm
  };
};