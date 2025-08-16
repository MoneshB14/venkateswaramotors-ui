import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888/vm/api';
// const API_BASE_URL = 'http://13.60.223.91:8888/vm/api';
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies to be sent with requests
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error);

    if (error.response?.status === 401) {
      // Redirect to login on authentication error
      window.location.href = '/service/login';
    }

    // Enhance error object with better error message extraction
    if (error.response?.data) {
      // Try to extract the most meaningful error message
      let errorMessage = 'An error occurred';

      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.details) {
        errorMessage = error.response.data.details;
      }

      // Create a more user-friendly error object
      error.userMessage = errorMessage;
    }

    return Promise.reject(error);
  }
);

// VM Service Authentication API
export const vmServiceAuth = {
  // Check authentication status
  checkAuthStatus: async () => {
    const response = await api.get('/service-center/auth/status');
    return response.data;
  },

  // Signup
  signup: async (userData) => {
    const response = await api.post('/service-center/auth/signup', userData);
    return response.data;
  },

  // Login (send OTP)
  login: async (email) => {
    const response = await api.post('/service-center/auth/login', { email });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    const response = await api.post('/service-center/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post('/service-center/auth/resend-otp', { email });
    return response.data;
  },
};

// VM Service Overview API
export const vmServiceOverview = {
  // Get all booked services
  getAllBookedServices: async () => {
    const response = await api.get('/service-center/overview/booked-services');
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/service-center/overview/dashboard-stats');
    return response.data;
  },

  // Get today's booked services
  getTodayBookedServices: async () => {
    const response = await api.get('/service-center/overview/booked-services/today');
    return response.data;
  },

  // Get pending bookings
  getPendingBookings: async () => {
    const response = await api.get('/service-center/overview/pending');
    return response.data;
  },

  // Get completed bookings
  getCompletedBookings: async () => {
    const response = await api.get('/service-center/overview/completed');
    return response.data;
  },

  // Get cancelled bookings
  getCancelledBookings: async () => {
    const response = await api.get('/service-center/overview/cancelled');
    return response.data;
  },

  // Get booked services by status
  getBookedServicesByStatus: async (status) => {
    const response = await api.get(`/service-center/overview/booked-services/status/${status}`);
    return response.data;
  },

  // Get booked services by date
  getBookedServicesByDate: async (date) => {
    const response = await api.get(`/service-center/overview/booked-services/date/${date}`);
    return response.data;
  },
};

// Bookings Management API
export const bookingsAPI = {
  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/service-center/bookings', bookingData);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/service-center/bookings/${bookingId}`);
    return response.data;
  },

  // Update booking
  updateBooking: async (bookingId, bookingData) => {
    const response = await api.put(`/service-center/bookings/${bookingId}`, bookingData);
    return response.data;
  },

  // Delete booking
  deleteBooking: async (bookingId) => {
    const response = await api.delete(`/service-center/bookings/${bookingId}`);
    return response.data;
  },

  // Get all bookings with pagination
  getBookings: async (page = 0, size = 10) => {
    const response = await api.get('/service-center/bookings', {
      params: {
        page,
        size,
        _t: Date.now() // Add timestamp to prevent caching
      }
    });
    return response.data;
  },

  // Get bookings by status
  getBookingsByStatus: async (status, page = 0, size = 10) => {
    const response = await api.get(`/service-center/bookings/status/${status}`, {
      params: {
        page,
        size,
        _t: Date.now() // Add timestamp to prevent caching
      }
    });
    return response.data;
  },

  // Search bookings
  searchBookings: async (searchTerm) => {
    const response = await api.get('/service-center/bookings/search', {
      params: {
        q: searchTerm,
        _t: Date.now() // Add timestamp to prevent caching
      }
    });
    return response.data;
  },

  // Get available timings for a date
  getAvailableTimings: async (date) => {
    const response = await api.get('/service-center/bookings/available-timings', {
      params: { date }
    });
    return response.data;
  },

  // Get bookings by technician
  getBookingsByTechnician: async (technician) => {
    const response = await api.get(`/service-center/bookings/technician/${encodeURIComponent(technician)}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`/service-center/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  // Get bookings by customer
  getBookingsByCustomer: async (customerId) => {
    const response = await api.get(`/service-center/bookings/customer/${customerId}`);
    return response.data;
  },

  // Get bookings by vehicle
  getBookingsByVehicle: async (vehicleId) => {
    const response = await api.get(`/service-center/bookings/vehicle/${vehicleId}`);
    return response.data;
  },

  // Get bookings by service type
  getBookingsByServiceType: async (serviceType, page = 0, size = 10) => {
    const response = await api.get('/service-center/bookings/get-bookings-by-service-type', {
      params: {
        serviceType,
        page,
        size,
        _t: Date.now() // Add timestamp to prevent caching
      }
    });
    return response.data;
  },

  // Get bookings by date range
  getBookingsByDateRange: async (fromDate, toDate, page = 0, size = 10) => {
    const response = await api.get('/service-center/bookings/get-bookings-by-from-date-to-date', {
      params: {
        fromDate,
        toDate,
        page,
        size,
        _t: Date.now() // Add timestamp to prevent caching
      }
    });
    return response.data;
  },
};

// Customers Management API
export const customersAPI = {
  // Legacy - Get all customers with filters (may be ignored by backend)
  getCustomers: async (filters = {}) => {
    const response = await api.get('/service-center/customers', { params: filters });
    return response.data;
  },

  // List customers with pagination and optional search
  getCustomerList: async (page = 0, size = 10, search = '') => {
    const response = await api.get('/service-center/customers', {
      params: {
        page,
        size,
        ...(search ? { search } : {}),
        _t: Date.now()
      }
    });
    return response.data; // Expected to match CustomerListResponse
  },

  // Get full customer history by vehicle registration (request param)
  getCustomerHistory: async (registration) => {
    const response = await api.get('/service-center/customers/history', {
      params: { registration }
    });
    return response.data; // Expected to match CustomerHistoryResponse
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    const response = await api.get(`/service-center/customers/${id}`);
    return response.data;
  },

  // Create new customer
  createCustomer: async (customerData) => {
    const response = await api.post('/service-center/customers', customerData);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/service-center/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id) => {
    const response = await api.delete(`/service-center/customers/${id}`);
    return response.data;
  },

  // Search customers
  searchCustomers: async (query) => {
    const response = await api.get('/service-center/customers/search', { params: { q: query } });
    return response.data;
  },
};

// Vehicles Management API
export const vehiclesAPI = {
  // Get all vehicles with filters
  getVehicles: async (filters = {}) => {
    const response = await api.get('/service-center/vehicles', { params: filters });
    return response.data;
  },

  // Get vehicle by ID
  getVehicleById: async (id) => {
    const response = await api.get(`/service-center/vehicles/${id}`);
    return response.data;
  },

  // Create new vehicle
  createVehicle: async (vehicleData) => {
    const response = await api.post('/service-center/vehicles', vehicleData);
    return response.data;
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/service-center/vehicles/${id}`, vehicleData);
    return response.data;
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    const response = await api.delete(`/service-center/vehicles/${id}`);
    return response.data;
  },

  // Get vehicles by customer
  getVehiclesByCustomer: async (customerId) => {
    const response = await api.get(`/service-center/vehicles/customer/${customerId}`);
    return response.data;
  },

  // Search vehicles
  searchVehicles: async (query) => {
    const response = await api.get('/service-center/vehicles/search', { params: { q: query } });
    return response.data;
  },
};

// Services Management API
export const servicesAPI = {
  // Get all service types
  getServiceTypes: async () => {
    const response = await api.get('/service-center/services/types');
    return response.data;
  },

  // Get service type by ID
  getServiceTypeById: async (id) => {
    const response = await api.get(`/service-center/services/types/${id}`);
    return response.data;
  },

  // Create new service type
  createServiceType: async (serviceData) => {
    const response = await api.post('/service-center/services/types', serviceData);
    return response.data;
  },

  // Update service type
  updateServiceType: async (id, serviceData) => {
    const response = await api.put(`/service-center/services/types/${id}`, serviceData);
    return response.data;
  },

  // Delete service type
  deleteServiceType: async (id) => {
    const response = await api.delete(`/service-center/services/types/${id}`);
    return response.data;
  },

  // Get ongoing services
  getOngoingServices: async () => {
    const response = await api.get('/service-center/services/ongoing');
    return response.data;
  },
};

// Inventory Management API
export const inventoryAPI = {
  // Get all inventory items with pagination and filters
  getInventoryItems: async (params = {}) => {
    const response = await api.get('/service-center/inventory/items', { params });
    return response.data;
  },

  // Get inventory item by ID
  getInventoryItemById: async (itemId) => {
    const response = await api.get(`/service-center/inventory/items/${itemId}`);
    return response.data;
  },

  // Get inventory item by code
  getInventoryItemByCode: async (itemCode) => {
    const response = await api.get(`/service-center/inventory/items/code/${itemCode}`);
    return response.data;
  },

  // Create new inventory item
  createInventoryItem: async (itemData) => {
    const response = await api.post('/service-center/inventory/items', itemData);
    return response.data;
  },

  // Update inventory item
  updateInventoryItem: async (itemId, itemData) => {
    const response = await api.put(`/service-center/inventory/items/${itemId}`, itemData);
    return response.data;
  },

  // Delete inventory item
  deleteInventoryItem: async (itemId) => {
    const response = await api.delete(`/service-center/inventory/items/${itemId}`);
    return response.data;
  },

  // Adjust stock
  adjustStock: async (stockData) => {
    const response = await api.post('/service-center/inventory/items/stock-adjustment', stockData);
    return response.data;
  },

  // Get low stock items
  getLowStockItems: async () => {
    const response = await api.get('/service-center/inventory/items/low-stock');
    return response.data;
  },

  // Get out of stock items
  getOutOfStockItems: async () => {
    const response = await api.get('/service-center/inventory/items/out-of-stock');
    return response.data;
  },

  // Get items by category
  getItemsByCategory: async (category) => {
    const response = await api.get(`/service-center/inventory/items/category/${category}`);
    return response.data;
  },

  // Get items by status
  getItemsByStatus: async (status) => {
    const response = await api.get(`/service-center/inventory/items/status/${status}`);
    return response.data;
  },

  // Get item transaction history
  getItemTransactionHistory: async (itemId, params = {}) => {
    const response = await api.get(`/service-center/inventory/items/${itemId}/transactions`, { params });
    return response.data;
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    const response = await api.get('/service-center/inventory/stats');
    return response.data;
  },
};

// Suppliers Management API
export const suppliersAPI = {
  // Get all suppliers with pagination and filters
  getSuppliers: async (params = {}) => {
    const response = await api.get('/service-center/inventory/suppliers', { params });
    return response.data;
  },

  // Get supplier by ID
  getSupplierById: async (supplierId) => {
    const response = await api.get(`/service-center/inventory/suppliers/${supplierId}`);
    return response.data;
  },

  // Get supplier by code
  getSupplierByCode: async (supplierCode) => {
    const response = await api.get(`/service-center/inventory/suppliers/code/${supplierCode}`);
    return response.data;
  },

  // Create new supplier
  createSupplier: async (supplierData) => {
    const response = await api.post('/service-center/inventory/suppliers', supplierData);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (supplierId, supplierData) => {
    const response = await api.put(`/service-center/inventory/suppliers/${supplierId}`, supplierData);
    return response.data;
  },

  // Delete supplier
  deleteSupplier: async (supplierId) => {
    const response = await api.delete(`/service-center/inventory/suppliers/${supplierId}`);
    return response.data;
  },

  // Toggle supplier status
  toggleSupplierStatus: async (supplierId, isActive) => {
    const response = await api.patch(`/service-center/inventory/suppliers/${supplierId}/status`, null, {
      params: { isActive }
    });
    return response.data;
  },

  // Get suppliers by city
  getSuppliersByCity: async (city) => {
    const response = await api.get(`/service-center/inventory/suppliers/city/${city}`);
    return response.data;
  },

  // Get suppliers by state
  getSuppliersByState: async (state) => {
    const response = await api.get(`/service-center/inventory/suppliers/state/${state}`);
    return response.data;
  },

  // Get suppliers by specialization
  getSuppliersBySpecialization: async (specialization) => {
    const response = await api.get(`/service-center/inventory/suppliers/specialization/${specialization}`);
    return response.data;
  },

  // Get supplier statistics
  getSupplierStats: async () => {
    const response = await api.get('/service-center/inventory/suppliers/stats');
    return response.data;
  },
};

// Payments Management API
export const paymentsAPI = {
  // Get all payments
  getPayments: async (filters = {}) => {
    const response = await api.get('/service-center/payments', { params: filters });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    const response = await api.get(`/service-center/payments/${id}`);
    return response.data;
  },

  // Create new payment
  createPayment: async (paymentData) => {
    const response = await api.post('/service-center/payments', paymentData);
    return response.data;
  },

  // Update payment
  updatePayment: async (id, paymentData) => {
    const response = await api.put(`/service-center/payments/${id}`, paymentData);
    return response.data;
  },

  // Delete payment
  deletePayment: async (id) => {
    const response = await api.delete(`/service-center/payments/${id}`);
    return response.data;
  },

  // Get payments by booking
  getPaymentsByBooking: async (bookingId) => {
    const response = await api.get(`/service-center/payments/booking/${bookingId}`);
    return response.data;
  },

  // Generate invoice
  generateInvoice: async (bookingId) => {
    const response = await api.post(`/service-center/payments/invoice/${bookingId}`);
    return response.data;
  },
};

// Users Management API (Admin only)
export const usersAPI = {
  // Get all users
  getUsers: async () => {
    const response = await api.get('/service-center/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/service-center/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/service-center/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/service-center/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/service-center/users/${id}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/service-center/users/${id}/role`, { role });
    return response.data;
  },

  // Activate/deactivate user
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/service-center/users/${id}/toggle-status`);
    return response.data;
  },
};

// Reports and Analytics API
export const reportsAPI = {
  // Get revenue analytics
  getRevenueAnalytics: async (period = 'month') => {
    const response = await api.get('/service-center/reports/revenue', { params: { period } });
    return response.data;
  },

  // Get booking analytics
  getBookingAnalytics: async (period = 'month') => {
    const response = await api.get('/service-center/reports/bookings', { params: { period } });
    return response.data;
  },

  // Get service type analytics
  getServiceTypeAnalytics: async (period = 'month') => {
    const response = await api.get('/service-center/reports/service-types', { params: { period } });
    return response.data;
  },

  // Get customer analytics
  getCustomerAnalytics: async (period = 'month') => {
    const response = await api.get('/service-center/reports/customers', { params: { period } });
    return response.data;
  },

  // Generate custom report
  generateCustomReport: async (reportData) => {
    const response = await api.post('/service-center/reports/generate', reportData);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  // Get all notifications
  getNotifications: async () => {
    const response = await api.get('/service-center/notifications');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await api.patch(`/service-center/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch('/service-center/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/service-center/notifications/${id}`);
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  // Get system settings
  getSettings: async () => {
    const response = await api.get('/service-center/settings');
    return response.data;
  },

  // Update system settings
  updateSettings: async (settingsData) => {
    const response = await api.put('/service-center/settings', settingsData);
    return response.data;
  },

  // Get working hours
  getWorkingHours: async () => {
    const response = await api.get('/service-center/settings/working-hours');
    return response.data;
  },

  // Update working hours
  updateWorkingHours: async (workingHours) => {
    const response = await api.put('/service-center/settings/working-hours', workingHours);
    return response.data;
  },
};

// User Management API
export const userManagementAPI = {
  // Get all users with pagination and filtering
  getUsers: async (filters = {}) => {
    const response = await api.get('/service-center/user-management/users', { params: filters });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/service-center/user-management/users/${userId}`);
    return response.data;
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const response = await api.get(`/service-center/user-management/users/email/${email}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/service-center/user-management/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/service-center/user-management/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/service-center/user-management/users/${userId}`);
    return response.data;
  },

  // Toggle user status (enable/disable)
  toggleUserStatus: async (userId, enabled) => {
    const response = await api.patch(`/service-center/user-management/users/${userId}/status`, null, {
      params: { enabled }
    });
    return response.data;
  },

  // Toggle user lock (lock/unlock)
  toggleUserLock: async (userId, locked) => {
    const response = await api.patch(`/service-center/user-management/users/${userId}/lock`, null, {
      params: { locked }
    });
    return response.data;
  },

  // Change user role
  changeUserRole: async (userId, role) => {
    const response = await api.patch(`/service-center/user-management/users/${userId}/role`, null, {
      params: { role }
    });
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role) => {
    const response = await api.get(`/service-center/user-management/users/role/${role}`);
    return response.data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/service-center/user-management/stats');
    return response.data;
  },
};

// Bill Generation API
export const billGenerationAPI = {
  // Save/Create bill
  saveBill: async (billData) => {
    const response = await api.post('/service-center/bookings/bills/save', billData);
    return response.data;
  },

  // Get bill by booking ID
  getBillByBookingId: async (bookingId) => {
    const response = await api.get(`/service-center/bookings/bills/booking/${bookingId}`);
    return response.data;
  },

  // Get bill by bill ID
  getBillById: async (billId) => {
    const response = await api.get(`/service-center/bookings/bills/${billId}`);
    return response.data;
  },

  // Update bill
  updateBill: async (billId, billData) => {
    const response = await api.put(`/service-center/bookings/bills/${billId}`, billData);
    return response.data;
  },

  // Generate PDF for bill
  generatePdf: async (pdfData) => {
    const response = await api.post('/service-center/bookings/bills/generate-pdf', pdfData, {
      responseType: 'blob' // Important for handling binary PDF data
    });
    return response; // Return the full response object to access blob and headers
  }
};

export default api; 