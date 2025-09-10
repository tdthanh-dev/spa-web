// Export all services
export { leadsService } from './LeadsService';
export { customersService } from './CustomersService';
export { appointmentsService } from './AppointmentsService';
export { servicesService } from './ServicesService';
export { customerCaseService } from './CustomerCaseService';
export { invoiceService } from './InvoiceService';
export { paymentService } from './PaymentService';
export { tierService } from './TierService';

// Export base service for custom implementations
export { BaseService } from './BaseService';

// Export API client for direct usage
export { default as apiClient } from './apiClient';

// Legacy exports for backward compatibility
export { leadsService as leadsApi } from './LeadsService';
export { customersService as customersApi } from './CustomersService';
export { appointmentsService as appointmentsApi } from './AppointmentsService';
export { servicesService as servicesApi } from './ServicesService';
