// Base API URL
export const API_BASE_URL = 'http://localhost:8081/api';

// API endpoints - Updated to match backend exactly
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REQUEST_OTP: `${API_BASE_URL}/auth/otp/request`,
    VERIFY_OTP: `${API_BASE_URL}/auth/otp/verify`,
    ME: `${API_BASE_URL}/auth/me`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  LEADS: `${API_BASE_URL}/leads`,
  CUSTOMERS: `${API_BASE_URL}/customers`,
  SERVICES: `${API_BASE_URL}/services`,
  APPOINTMENTS: `${API_BASE_URL}/appointments`,
  CUSTOMER_CASES: `${API_BASE_URL}/customer-cases`,
  INVOICES: `${API_BASE_URL}/invoices`,
  PAYMENTS: `${API_BASE_URL}/payments`,
  TIERS: `${API_BASE_URL}/tiers`,
  ROLES: `${API_BASE_URL}/roles`,
  STAFF_USERS: `${API_BASE_URL}/staff-users`,
  PHOTOS: `${API_BASE_URL}/photos`,
  AUDIT: `${API_BASE_URL}/audit`,
};

// Lead Status mappings (matching backend LeadStatus enum)
export const LEAD_STATUS_MAP = {
  'NEW': { label: 'Mới', className: 'status-new', icon: '🆕', description: 'Lead mới được tạo' },
  'IN_PROGRESS': { label: 'Đang tư vấn', className: 'status-in-progress', icon: '⏳', description: 'Đang trong quá trình tư vấn' },
  'WON': { label: 'Thành công', className: 'status-success', icon: '✅', description: 'Đã chuyển đổi thành khách hàng' },
  'LOST': { label: 'Thất bại', className: 'status-cancelled', icon: '❌', description: 'Không thể chuyển đổi' }
};

// Backward compatibility - deprecated, use LEAD_STATUS_MAP instead
export const STATUS_MAP = {
  'NEW': { label: 'Mới', className: 'status-new' },
  'IN_PROGRESS': { label: 'Đang tư vấn', className: 'status-in-progress' },
  'WON': { label: 'Thành công', className: 'status-success' },
  'LOST': { label: 'Thất bại', className: 'status-cancelled' },
  // Backward compatibility
  'SUCCESS': { label: 'Thành công', className: 'status-success' },
  'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
};

// Customer type mappings (for source field)
export const CUSTOMER_TYPE_MAP = {
  'Web': 'Web',
  'Phone': 'Điện thoại',
  'Walk-in': 'Trực tiếp',
  'Social': 'Mạng xã hội'
};

// Customer type mappings (for customerType field)
export const CUSTOMER_TYPE_STATUS_MAP = {
  'NEW': 'Khách mới',
  'EXISTING': 'Khách cũ',
  'VIP': 'Khách VIP'
};

// Case Status mappings (matching backend CaseStatus enum)
export const CASE_STATUS_MAP = {
  'INTAKE': { label: 'Tiếp nhận', className: 'status-intake' },
  'IN_PROGRESS': { label: 'Đang điều trị', className: 'status-in-progress' },
  'COMPLETED': { label: 'Hoàn thành', className: 'status-completed' },
  'ON_HOLD': { label: 'Tạm dừng', className: 'status-on-hold' },
  'CANCELLED': { label: 'Hủy bỏ', className: 'status-cancelled' }
};

// Service Category mappings (matching backend ServiceCategory enum)
export const SERVICE_CATEGORY_MAP = {
  'LIP': { label: 'Phun môi', icon: '💋' },
  'BROW': { label: 'Phun mày', icon: '👀' },
  'OTHER': { label: 'Khác', icon: '✨' }
};

// Payment Method mappings (matching backend PaymentMethod enum)
export const PAYMENT_METHOD_MAP = {
  'CASH': { label: 'Tiền mặt', icon: '💵' },
  'CARD': { label: 'Thẻ', icon: '💳' },
  'BANK': { label: 'Chuyển khoản', icon: '🏦' },
  'EWALLET': { label: 'Ví điện tử', icon: '📱' }
};

// Invoice Status mappings (matching backend InvoiceStatus enum)
export const INVOICE_STATUS_MAP = {
  'DRAFT': { label: 'Nháp', className: 'status-draft' },
  'UNPAID': { label: 'Chưa thanh toán', className: 'status-unpaid' },
  'PAID': { label: 'Đã thanh toán', className: 'status-paid' },
  'OVERDUE': { label: 'Quá hạn', className: 'status-overdue' },
  'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
};

// Appointment Status mappings (matching backend AppointmentStatus enum)
export const APPOINTMENT_STATUS_MAP = {
  'SCHEDULED': { label: 'Đã đặt', className: 'status-scheduled' },
  'CONFIRMED': { label: 'Đã xác nhận', className: 'status-confirmed' },
  'NO_SHOW': { label: 'Không đến', className: 'status-no-show' },
  'DONE': { label: 'Hoàn thành', className: 'status-done' },
  'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
};

// App configuration
export const APP_CONFIG = {
  name: 'Spa Management',
  version: '1.0.0',
  logo: '/vite.svg',
  pagination: {
    defaultPageSize: 20,
    defaultPage: 0
  }
};