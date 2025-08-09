// Date formatting utilities
export const formatDate = (iso, options = {}) => {
  if (!iso) return '—';
  
  const {
    includeTime = false,
    locale = 'en-IN',
    timeZone = 'Asia/Kolkata'
  } = options;
  
  const date = new Date(iso);
  
  if (includeTime) {
    return date.toLocaleString(locale, {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString(locale, {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (iso) => formatDate(iso, { includeTime: true });

export const formatTime = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
};

// Currency formatting
export const formatCurrency = (amount, options = {}) => {
  const {
    currency = 'INR',
    locale = 'en-IN',
    showSymbol = true,
    precision = 0
  } = options;
  
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  
  const number = Number(amount);
  
  if (showSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(number);
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(number);
};

// Status formatting
export const getStatusBadgeVariant = (status) => {
  const statusMap = {
    'completed': 'success',
    'confirmed': 'success',
    'paid': 'success',
    'pending': 'warning',
    'in_progress': 'info',
    'cancelled': 'error',
    'unpaid': 'error',
    'overdue': 'error',
    'partial': 'warning'
  };
  
  return statusMap[status?.toLowerCase()] || 'default';
};

// Data aggregation utilities
export const calculateCustomerStats = (data) => {
  if (!data) return {};
  
  const bookings = data.bookings || [];
  const bills = data.bills || [];
  
  // Booking statistics
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.bookingStatus?.toLowerCase() === 'completed').length;
  const pendingBookings = bookings.filter(b => b.bookingStatus?.toLowerCase() === 'pending').length;
  const cancelledBookings = bookings.filter(b => b.bookingStatus?.toLowerCase() === 'cancelled').length;
  
  // Financial statistics
  const totalBilled = bills.reduce((sum, bill) => sum + (Number(bill.total) || 0), 0);
  const paidAmount = bills
    .filter(bill => bill.paymentStatus?.toLowerCase() === 'paid')
    .reduce((sum, bill) => sum + (Number(bill.total) || 0), 0);
  const pendingAmount = bills
    .filter(bill => bill.paymentStatus?.toLowerCase() !== 'paid')
    .reduce((sum, bill) => sum + (Number(bill.total) || 0), 0);
  
  // Service type distribution
  const serviceTypes = {};
  bookings.forEach(booking => {
    const service = booking.serviceType || 'Unknown';
    serviceTypes[service] = (serviceTypes[service] || 0) + 1;
  });
  
  // Most frequent service
  const mostFrequentService = Object.entries(serviceTypes)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
  
  // Average time between visits
  const sortedBookings = bookings
    .filter(b => b.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  let averageDaysBetweenVisits = 0;
  if (sortedBookings.length > 1) {
    const intervals = [];
    for (let i = 1; i < sortedBookings.length; i++) {
      const current = new Date(sortedBookings[i].createdAt);
      const previous = new Date(sortedBookings[i - 1].createdAt);
      intervals.push((current - previous) / (1000 * 60 * 60 * 24));
    }
    averageDaysBetweenVisits = Math.round(
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    );
  }
  
  // Last visit
  const lastVisit = sortedBookings[sortedBookings.length - 1]?.createdAt;
  
  return {
    totalBookings,
    completedBookings,
    pendingBookings,
    cancelledBookings,
    completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0,
    totalBilled,
    paidAmount,
    pendingAmount,
    paymentRate: totalBilled > 0 ? (paidAmount / totalBilled * 100).toFixed(1) : 0,
    serviceTypes,
    mostFrequentService,
    averageDaysBetweenVisits,
    lastVisit
  };
};

// Search and filter utilities
export const searchInCustomerData = (data, searchTerm) => {
  if (!searchTerm || !data) return data;
  
  const term = searchTerm.toLowerCase();
  
  const filteredBookings = data.bookings?.filter(booking =>
    booking.bookingId?.toLowerCase().includes(term) ||
    booking.serviceType?.toLowerCase().includes(term) ||
    booking.bookingStatus?.toLowerCase().includes(term) ||
    booking.assignedTechnician?.toLowerCase().includes(term)
  ) || [];
  
  const filteredBills = data.bills?.filter(bill =>
    bill.billNumber?.toLowerCase().includes(term) ||
    bill.bookingId?.toLowerCase().includes(term) ||
    bill.paymentStatus?.toLowerCase().includes(term)
  ) || [];
  
  return {
    ...data,
    bookings: filteredBookings,
    bills: filteredBills
  };
};

// Export utilities
export const exportToCSV = (data, filename = 'customer_history') => {
  if (!data) return;
  
  const bookingsCSV = [
    ['Booking ID', 'Service Type', 'Date', 'Time', 'Status', 'Technician'],
    ...(data.bookings || []).map(booking => [
      booking.bookingId || '',
      booking.serviceType || '',
      formatDate(booking.preferredDate),
      booking.preferredTime || '',
      booking.bookingStatus || '',
      booking.assignedTechnician || ''
    ])
  ].map(row => row.join(',')).join('\n');
  
  const billsCSV = [
    ['Bill Number', 'Booking ID', 'Date', 'Subtotal', 'Discount', 'Tax', 'Total', 'Status'],
    ...(data.bills || []).map(bill => [
      bill.billNumber || '',
      bill.bookingId || '',
      formatDateTime(bill.billDate),
      bill.subtotal || 0,
      bill.discountAmount || 0,
      bill.taxAmount || 0,
      bill.total || 0,
      bill.paymentStatus || ''
    ])
  ].map(row => row.join(',')).join('\n');
  
  const combinedCSV = `Bookings\n${bookingsCSV}\n\nBills\n${billsCSV}`;
  
  const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Time-based utilities
export const getRelativeTime = (date) => {
  if (!date) return '—';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};
