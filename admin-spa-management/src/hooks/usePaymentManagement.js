import { useState, useEffect } from 'react';
import { paymentsApi, invoicesApi } from '@/services';
import { useAuth } from '@/hooks/useAuth';

export const usePaymentManagement = () => {
  const { userRole } = useAuth();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'payments') {
        const paymentsResponse = await paymentsApi.getPayments({
          page: 0,
          size: 50,
          sortBy: 'paymentId',
          sortDir: 'desc'
        });
        const raw = paymentsResponse.content || [];
        // Normalize BE -> FE shape to avoid undefined fields causing 0 ₫ formatting
        const mapped = raw.map(p => ({
          id: p.paymentId,
          invoiceId: p.invoiceId,
          customerName: p.paidByStaffName || (p.invoiceId ? `Hóa đơn #${p.invoiceId}` : '—'),
          amount: p.amount ?? 0,
          paymentMethod: p.method || 'N/A',
          status: p.paidAt ? 'COMPLETED' : 'PENDING',
          createdAt: p.paidAt || p.createdAt,
          note: p.note,
        }));
        setPayments(mapped);
      } else {
        const invoicesResponse = await invoicesApi.getInvoices({
          page: 0,
          size: 50,
          sortBy: 'invoiceId',
          sortDir: 'desc'
        });
        setInvoices(invoicesResponse.content || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Có lỗi khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const statusData = {
        status: newStatus,
        reason: `Updated by ${userRole} at ${new Date().toISOString()}`
      };

      if (activeTab === 'payments') {
        await paymentsApi.updatePaymentStatus(id, statusData);
        setPayments(prev =>
          prev.map(payment =>
            payment.id === id ? { ...payment, status: newStatus } : payment
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Có lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'pending', label: 'Chờ xử lý', color: '#fbbf24', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      'COMPLETED': { class: 'completed', label: 'Hoàn thành', color: '#10b981', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      'PAID': { class: 'paid', label: 'Đã thanh toán', color: '#10b981', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      'FAILED': { class: 'failed', label: 'Thất bại', color: '#ef4444', bgColor: 'bg-red-100', textColor: 'text-red-800' },
      'REFUNDED': { class: 'refunded', label: 'Hoàn tiền', color: '#8b5cf6', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
      'CANCELLED': { class: 'cancelled', label: 'Đã hủy', color: '#6b7280', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
      'OVERDUE': { class: 'overdue', label: 'Quá hạn', color: '#f97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800' }
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm ||
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRetry = () => {
    loadData();
  };

  return {
    // State
    payments,
    invoices,
    loading,
    error,
    activeTab,
    searchTerm,
    statusFilter,
    selectedPayment,

    // Computed
    filteredPayments,
    filteredInvoices,

    // Actions
    setActiveTab,
    setSearchTerm,
    setStatusFilter,
    setSelectedPayment,
    handleStatusUpdate,
    getStatusBadge,
    handleRetry,

    // Permissions
    userRole,
    canCreate: userRole === 'ADMIN' || userRole === 'RECEPTIONIST'
  };
};