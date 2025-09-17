import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersApi } from '@/services';

/**
 * Custom hook for customer list logic
 * @param {string} userRole - User role for permissions
 * @returns {Object} Hook state and handlers
 */
export const useCustomerList = (userRole) => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    customers: [],
    totalElements: 0,
    loading: true,
    error: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Retry mechanism state
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;

  const fetchCustomers = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const params = {
        page: currentPage,
        size: 20,
        sortBy: 'customerId',
        sortDir: 'desc'
      };

      console.log('🔍 Fetching customers with params:', params, 'searchTerm:', searchTerm);

      // Use customersApi with proper BE endpoint
      const response = searchTerm
        ? await customersApi.searchCustomers(searchTerm, params)
        : await customersApi.getCustomers(params);

      console.log('📋 Raw API Response:', response);

      // Handle different response formats properly
      let customers = [];
      let totalElements = 0;

      if (response) {
        // Check if response is Spring Page format
        if (response.content && Array.isArray(response.content)) {
          customers = response.content;
          totalElements = response.totalElements || response.content.length;
          console.log('📄 Spring Page format detected:', { customers: customers.length, totalElements });
        }
        // Check if response is direct array
        else if (Array.isArray(response)) {
          customers = response;
          totalElements = response.length;
          console.log('📋 Array format detected:', { customers: customers.length });
        }
        // Check if response has data wrapper
        else if (response.data) {
          if (Array.isArray(response.data)) {
            customers = response.data;
            totalElements = response.data.length;
          } else if (response.data.content && Array.isArray(response.data.content)) {
            customers = response.data.content;
            totalElements = response.data.totalElements || response.data.content.length;
          } else {
            customers = [response.data];
            totalElements = 1;
          }
          console.log('📦 Data wrapper format detected:', { customers: customers.length, totalElements });
        }
        // Fallback: treat as single customer object
        else if (response.customerId || response.fullName) {
          customers = [response];
          totalElements = 1;
          console.log('👤 Single customer format detected');
        }
        // Unknown format
        else {
          console.warn('⚠️ Unknown response format:', response);
          customers = [];
          totalElements = 0;
        }
      }

      console.log('✅ Processed customers data:', {
        customersCount: customers.length,
        totalElements,
        hasData: customers.length > 0
      });

      setData({
        customers: customers || [],
        totalElements: totalElements || 0,
        loading: false,
        error: null
      });

      // Reset retry count on successful fetch
      setRetryCount(0);
      setIsRetrying(false);

    } catch (error) {
      console.error('❌ Error fetching customers:', error);

      let errorMessage = 'Không thể tải danh sách khách hàng. Vui lòng thử lại.';

      // Handle different error formats
      if (error.response?.data) {
        const errorData = error.response.data;

        // ApiResponse error format
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        // Array of errors
        else if (Array.isArray(errorData) && errorData.length > 0) {
          errorMessage = errorData[0].message || errorData[0].error || 'Có lỗi xảy ra';
        }
      }
      // HTTP status based messages
      else if (error.response?.status) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
            break;
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            break;
          case 403:
            errorMessage = 'Bạn không có quyền truy cập chức năng này.';
            break;
          case 404:
            errorMessage = 'Không tìm thấy dữ liệu khách hàng.';
            break;
          case 500:
            errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
            break;
          default:
            errorMessage = `Lỗi HTTP ${error.response.status}: ${error.message}`;
        }
      }
      // Network or other errors
      else if (error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Quá thời gian chờ phản hồi. Vui lòng thử lại.';
        } else {
          errorMessage = error.message;
        }
      }

      console.error('🚨 Final error message:', errorMessage);

      // Check if we should retry for network errors
      const shouldRetry = (
        (error.message?.includes('Network Error') ||
         error.message?.includes('timeout') ||
         error.response?.status >= 500) &&
        retryCount < maxRetries
      );

      if (shouldRetry && !isRetrying) {
        console.log(`🔄 Retrying customer fetch (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        setIsRetrying(true);

        // Retry after delay
        setTimeout(() => {
          setIsRetrying(false);
          fetchCustomers();
        }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s

        // Show retry message
        setData(prev => ({
          ...prev,
          loading: true,
          error: `Đang thử lại... (${retryCount + 1}/${maxRetries})`
        }));

        return;
      }

      // Final error state
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        customers: [], // Clear customers on error
        totalElements: 0
      }));

      // Reset retry count on final error
      setRetryCount(0);
      setIsRetrying(false);

    }
  }, [currentPage, searchTerm, retryCount, isRetrying, maxRetries]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page
    setRetryCount(0); // Reset retry count
    fetchCustomers();
  };

  // Manual refresh function
  const refreshCustomers = () => {
    console.log('🔄 Manual refresh requested');
    setRetryCount(0);
    setCurrentPage(0);
    fetchCustomers();
  };

  const handleCustomerClick = async (customerId) => {
    try {
      console.log('👤 Fetching customer details for ID:', customerId);

      const customer = await customersApi.getCustomerById(customerId);

      console.log('👤 Customer details response:', customer);

      // Handle different response formats
      let customerData = null;

      if (customer) {
        // Direct customer object
        if (customer.customerId) {
          customerData = customer;
        }
        // Wrapped in data property
        else if (customer.data && customer.data.customerId) {
          customerData = customer.data;
        }
        // Array with single customer
        else if (Array.isArray(customer) && customer.length > 0 && customer[0].customerId) {
          customerData = customer[0];
        }
      }

      if (customerData && customerData.customerId) {
        console.log('✅ Customer data processed:', {
          id: customerData.customerId,
          name: customerData.fullName,
          phone: customerData.phone
        });
        setSelectedCustomer(customerData);
        setSelectedCustomerId(customerId);
        setShowDetailModal(true);
      } else {
        console.warn('⚠️ Invalid customer data format:', customer);
        alert('Không thể tải thông tin khách hàng. Dữ liệu không hợp lệ.');
      }
    } catch (error) {
      console.error('❌ Error fetching customer details:', error);

      let errorMessage = 'Không thể tải thông tin khách hàng.';

      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy thông tin khách hàng này.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xem thông tin khách hàng này.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn.';
      }

      alert(errorMessage);
    }
  };

  const handleViewProfile = (customerId) => {
    // Navigate to customer profile page based on current role
    const rolePath = userRole.toLowerCase();
    const targetPath = `/${rolePath}/customers/${customerId}`;
    console.log('🔄 Navigating to customer profile:', { customerId, userRole, targetPath });
    navigate(targetPath);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCustomerCreated = async (newCustomer) => {
    console.log('New customer created:', newCustomer);
    try {
      // Optionally refresh the customer tier if needed
      if (newCustomer.customerId) {
        await customersApi.refreshCustomerTier(newCustomer.customerId);
      }
    } catch (error) {
      console.warn('Failed to refresh customer tier:', error);
    }
    // Refresh the customer list
    fetchCustomers();
    setShowCreateModal(false);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCustomerId(null);
  };

  const handleEditCustomer = (customer) => {
    // TODO: Implement customer editing functionality
    console.log('Edit customer:', customer);
    // For now, just close the detail modal and open edit modal
    setShowDetailModal(false);
    // Would open edit modal here
  };

  const getCustomerTypeLabel = (customer) => {
    if (customer.isVip) return 'VIP';
    if ((customer.totalSpent || 0) > 0) return 'Khách cũ';
    return 'Khách mới';
  };

  const getCustomerRowClass = (customer) => {
    if (customer.isVip) return 'vip';
    if ((customer.totalSpent || 0) > 0) return 'returning';
    return 'new';
  };

  const getTierBadge = (tierName) => {
    if (!tierName) return { class: 'bronze', label: 'Bronze' };
    const tier = tierName.toLowerCase();
    if (tier.includes('diamond')) return { class: 'diamond', label: 'Diamond' };
    if (tier.includes('platinum')) return { class: 'platinum', label: 'Platinum' };
    if (tier.includes('gold')) return { class: 'gold', label: 'Gold' };
    if (tier.includes('silver')) return { class: 'silver', label: 'Silver' };
    return { class: 'bronze', label: 'Bronze' };
  };

  return {
    // State
    data,
    searchTerm,
    currentPage,
    selectedCustomer,
    showCreateModal,
    showDetailModal,
    selectedCustomerId,

    // Retry state
    retryCount,
    isRetrying,
    maxRetries,

    // Setters
    setSearchTerm,
    setCurrentPage,
    setSelectedCustomer,
    setShowCreateModal,
    setShowDetailModal,
    setSelectedCustomerId,

    // Handlers
    handleSearch,
    handleCustomerClick,
    handleViewProfile,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCustomerCreated,
    handleCloseDetailModal,
    handleEditCustomer,

    // Utilities
    getCustomerTypeLabel,
    getCustomerRowClass,
    getTierBadge,

    // API
    fetchCustomers,
    refreshCustomers
  };
};