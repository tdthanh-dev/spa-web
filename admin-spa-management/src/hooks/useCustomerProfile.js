// filepath: src/hooks/useCustomerProfile.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import customersApi from '@/services/customersApi';
import appointmentsApi from '@/services/appointmentsApi';
import photosApi from '@/services/photosApi';

// ---- Helpers (đúng trạng thái cũ) ----
const VN = new Intl.NumberFormat('vi-VN');

export const formatCurrency = (v) => {
  try {
    const n = Number(v || 0);
    return `${VN.format(n)} ₫`;
  } catch {
    return `${v} ₫`;
  }
};

export const formatDateTimeVN = (isoLike) => {
  if (!isoLike) return '';
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN');
};

const STATUS_BADGE = {
  INVOICE: {
    PAID: { text: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
    UNPAID: { text: 'Chưa thanh toán', className: 'bg-red-100 text-red-800' },
    PENDING: { text: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
  },
  PAYMENT: {
    SUCCESS: { text: 'Thành công', className: 'bg-green-100 text-green-800' },
    FAILED: { text: 'Thất bại', className: 'bg-red-100 text-red-800' },
  },
};

export const getStatusBadge = (type, status) => {
  const map = STATUS_BADGE[type] || {};
  return map[status] || { text: status || '', className: 'bg-gray-100 text-gray-800' };
};

// ---- Hook chính (trạng thái cũ) ----
export function useCustomerProfile(userRole, customerIdFromRoute) {
  console.log('🔵 useCustomerProfile called with:', { userRole, customerIdFromRoute });

  const [customerId, setCustomerId] = useState(customerIdFromRoute);
  
  // Update customerId when route parameter changes
  useEffect(() => {
    if (customerIdFromRoute && customerIdFromRoute !== customerId) {
      console.log('🔄 Updating customerId from route:', customerIdFromRoute);
      setCustomerId(customerIdFromRoute);
    }
  }, [customerIdFromRoute, customerId]);
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState({
    treatments: false,
    appointments: false,
    financial: false,
    photos: false,
  });

  const [tabData, setTabData] = useState({
    treatments: [],
    appointments: [],
    financial: [],
    photos: [],
  });

  const [error, setError] = useState('');
  const [showCaseCreationModal, setShowCaseCreationModal] = useState(false);
  const [showInvoiceCreationModal, setShowInvoiceCreationModal] = useState(false);
  const [selectedCaseForInvoice, setSelectedCaseForInvoice] = useState(null);

  // ---- Loaders (đúng kiểu cũ) ----
  const loadCustomer = useCallback(async (cid) => {
    console.log('🔄 Loading customer data for ID:', cid);
    try {
      const data = await customersApi.getById(cid);
      console.log('✅ Customer data loaded:', data);
      setCustomer(data || null);
      return data;
    } catch (error) {
      console.error('❌ Failed to load customer data:', error);
      throw error;
    }
  }, []);

  const loadTreatments = useCallback(async (cid) => {
    setTabLoading((s) => ({ ...s, treatments: true }));
    try {
      const cases = await customersApi.getCases(cid); // trả về danh sách "case" theo customer
      // getCases returns pagination format, so we need to extract content
      setTabData((prev) => ({ ...prev, treatments: cases.content || [] }));
    } finally {
      setTabLoading((s) => ({ ...s, treatments: false }));
    }
  }, []);

  const loadAppointments = useCallback(async (cid) => {
    setTabLoading((s) => ({ ...s, appointments: true }));
    try {
      const appts = await appointmentsApi.getByCustomer(cid);
      // getByCustomer returns pagination format, so we need to extract content
      setTabData((prev) => ({ ...prev, appointments: appts.content || [] }));
    } finally {
      setTabLoading((s) => ({ ...s, appointments: false }));
    }
  }, []);

  const loadFinancial = useCallback(async (cid) => {
    setTabLoading((s) => ({ ...s, financial: true }));
    try {
      const data = await customersApi.getFinancial(cid, { sortBy: 'createdAt', sortDir: 'desc' });
      // getFinancial returns pagination format, so we need to extract content
      setTabData((prev) => ({ ...prev, financial: data.content || [] }));
    } finally {
      setTabLoading((s) => ({ ...s, financial: false }));
    }
  }, []);

  // Load photos - Note: photos are linked to cases, not customers directly
  const loadPhotos = useCallback(async (cid) => {
    setTabLoading((s) => ({ ...s, photos: true }));
    try {
      // TODO: Photos should be loaded by caseId, not customerId
      // For now, using getPhotosByCustomer as workaround (it will show warning)
      const photos = await photosApi.getPhotosByCustomer(cid);
      setTabData((prev) => ({ ...prev, photos: photos || [] }));
    } finally {
      setTabLoading((s) => ({ ...s, photos: false }));
    }
  }, []);

  const loadCustomerData = useCallback(async (cidParam) => {
    const cid = cidParam || customerId;
    if (!cid) return;

    console.log('🔄 Starting to load customer data for:', cid);
    setLoading(true);
    setError('');

    try {
      // Load customer data first
      console.log('🔄 Loading customer basic info...');
      await loadCustomer(cid);
      console.log('✅ Customer loaded, now loading related data...');

      // Load related data in parallel
      const promises = [
        loadTreatments(cid).catch(err => {
          console.warn('Failed to load treatments:', err);
          return Promise.resolve(); // Don't fail the whole operation
        }),
        loadAppointments(cid).catch(err => {
          console.warn('Failed to load appointments:', err);
          return Promise.resolve(); // Don't fail the whole operation
        }),
        loadFinancial(cid).catch(err => {
          console.warn('Failed to load financial data:', err);
          return Promise.resolve(); // Don't fail the whole operation
        }),
        loadPhotos(cid).catch(err => {
          console.warn('Failed to load photos:', err);
          return Promise.resolve(); // Don't fail the whole operation
        })
      ];

      await Promise.all(promises);
      console.log('✅ All customer data loaded successfully');
    } catch (e) {
      console.error('[CustomerProfile] Error loading customer:', e);
      setError('Không thể tải dữ liệu khách hàng.');
    } finally {
      setLoading(false);
    }
  }, [customerId, loadCustomer, loadTreatments, loadAppointments, loadFinancial, loadPhotos]);

  // ---- User actions (đúng kiểu cũ) ----
  const handleCreateCase = () => setShowCaseCreationModal(true);
  const handleCloseCaseCreationModal = () => setShowCaseCreationModal(false);
  const handleCaseCreated = async () => {
    setShowCaseCreationModal(false);
    await loadTreatments(customerId);
    setActiveTab('treatments');
  };

  const handleCreateInvoice = () => setShowInvoiceCreationModal(true);
  const handleCreateInvoiceForCase = (caseObj) => {
    setSelectedCaseForInvoice(caseObj);
    setShowInvoiceCreationModal(true);
  };
  const handleCloseInvoiceCreationModal = () => {
    setSelectedCaseForInvoice(null);
    setShowInvoiceCreationModal(false);
  };
  const handleInvoiceCreated = async () => {
    setShowInvoiceCreationModal(false);
    await loadFinancial(customerId);
    setActiveTab('financial');
  };

  const handleBackToList = () => {
    window.history.back();
  };

  // ---- Mount effect ----
  useEffect(() => {
    if (customerIdFromRoute && customerId !== customerIdFromRoute) {
      setCustomerId(customerIdFromRoute);
    }
  }, [customerIdFromRoute]);

  useEffect(() => {
    if (customerId) loadCustomerData(customerId);
  }, [customerId, loadCustomerData]);

  // ---- Expose ----
  return {
    // State
    customer,
    loading,
    error,
    activeTab,
    showCaseCreationModal,
    showInvoiceCreationModal,
    selectedCaseForInvoice,
    tabData,
    tabLoading,

    // Setters
    setActiveTab,
    setShowCaseCreationModal,
    setShowInvoiceCreationModal,
    setSelectedCaseForInvoice,

    // Handlers
    handleCreateCase,
    handleCreateInvoice,
    handleCreateInvoiceForCase,
    handleCloseCaseCreationModal,
    handleCloseInvoiceCreationModal,
    handleCaseCreated,
    handleInvoiceCreated,
    handleBackToList,

    // Utils
    formatCurrency,
    formatDateTimeVN,
    getStatusBadge,

    // API
    loadCustomerData,

    // Navigation
    customerId,
  };
}

export default useCustomerProfile;
