import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, customersApi, appointmentsApi } from '@/services';

/**
 * Custom hook for Receptionist Dashboard logic
 * Manages dashboard data, customer search, and appointment status utilities
 */
export const useReceptionistDashboard = () => {
  // Dashboard data state
  const [data, setData] = useState({
    todayAppointments: [],
    pendingRequests: [],
    recentCustomers: [],
    stats: null,
    appointmentStatusChart: [],
    appointmentTrendChart: [],
    servicePopularityChart: [],
    customerTiersChart: [],
    loading: true,
    error: null
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all data using dashboard API
      const [
        appointmentsRes,
        statsRes,
        appointmentStatusRes,
        appointmentTrendRes,
        servicePopularityRes,
        customerTiersRes
      ] = await Promise.allSettled([
        appointmentsApi.getTodayAppointments(),
        dashboardApi.getReceptionistStats(),
        dashboardApi.getAppointmentStatusChart(),
        dashboardApi.getAppointmentTrendChart(),
        dashboardApi.getServicePopularityChart(),
        dashboardApi.getCustomerTiersChart()
      ]);

      // Debug responses
      console.log('🔍 Appointments Response:', appointmentsRes);
      console.log('🔍 Stats Response:', statsRes);

      // Check for any failed requests and log them
      const failedRequests = [];
      if (appointmentsRes.status === 'rejected') failedRequests.push('Appointments API');
      if (statsRes.status === 'rejected') failedRequests.push('Stats API');
      if (appointmentStatusRes.status === 'rejected') failedRequests.push('Appointment Status Chart');
      if (appointmentTrendRes.status === 'rejected') failedRequests.push('Appointment Trend Chart');
      if (servicePopularityRes.status === 'rejected') failedRequests.push('Service Popularity Chart');
      if (customerTiersRes.status === 'rejected') failedRequests.push('Customer Tiers Chart');

      if (failedRequests.length > 0) {
        console.warn(`⚠️ Failed requests: ${failedRequests.join(', ')}`);
      }

      // Handle different response formats properly
      // appointmentsApi returns paginated response with .content property
      const appointments = appointmentsRes.status === 'fulfilled' ? 
        (appointmentsRes.value?.content || appointmentsRes.value || []) : [];
      
      // dashboardApi methods use extractApiResponse, so data is already extracted
      const stats = statsRes.status === 'fulfilled' ? statsRes.value : null;
      const appointmentStatusChart = appointmentStatusRes.status === 'fulfilled' ? 
        (appointmentStatusRes.value || []) : [];
      const appointmentTrendChart = appointmentTrendRes.status === 'fulfilled' ? 
        (appointmentTrendRes.value || []) : [];
      const servicePopularityChart = servicePopularityRes.status === 'fulfilled' ? 
        (servicePopularityRes.value || []) : [];
      const customerTiersChart = customerTiersRes.status === 'fulfilled' ? 
        (customerTiersRes.value || []) : [];

      // Set data with safety checks
      setData({
        todayAppointments: Array.isArray(appointments) ? appointments : [],
        pendingRequests: Array.isArray(data.pendingRequests) ? data.pendingRequests : [], // Will be populated when leads API is ready
        recentCustomers: Array.isArray(data.recentCustomers) ? data.recentCustomers : [], // Will be populated when customers API is ready
        stats: stats,
        appointmentStatusChart: appointmentStatusChart,
        appointmentTrendChart: appointmentTrendChart,
        servicePopularityChart: servicePopularityChart,
        customerTiersChart: customerTiersChart,
        loading: false,
        error: null
      });

      console.log('📊 Processed data:', {
        appointments: appointments.length,
        stats: stats ? 'loaded' : 'empty',
        charts: 'loaded'
      });

    } catch (error) {
      console.error('❌ Error fetching receptionist dashboard data:', error);
      setData(prev => ({
        ...prev,
        todayAppointments: [],
        pendingRequests: [],
        recentCustomers: [],
        stats: null,
        appointmentStatusChart: [],
        appointmentTrendChart: [],
        servicePopularityChart: [],
        customerTiersChart: [],
        loading: false,
        error: 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.'
      }));
    }
  }, []);

  // Customer search handler
  const handleCustomerSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const response = await customersApi.searchCustomers(searchTerm);
      setSearchResults(response.content || []);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  }, [searchTerm]);

  // Appointment status styling utility
  const getAppointmentStatusStyle = useCallback((status) => {
    const styles = {
      SCHEDULED: { background: '#dbeafe', color: '#1e40af' },
      CONFIRMED: { background: '#dcfce7', color: '#166534' },
      CHECKED_IN: { background: '#fef3c7', color: '#92400e' },
      IN_PROGRESS: { background: '#e0e7ff', color: '#5b21b6' }
    };
    return styles[status] || styles.SCHEDULED;
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    // State
    data,
    searchTerm,
    searchResults,

    // Actions
    setSearchTerm,
    fetchDashboardData,
    handleCustomerSearch,
    getAppointmentStatusStyle
  };
};