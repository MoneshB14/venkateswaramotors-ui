import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Phone,
  Car,
  User,
  DollarSign,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  FileText,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useGlobal } from '../../contexts/GlobalContext';
import { bookingsAPI, billGenerationAPI } from '../../services/api';
import { bookingStatuses, serviceTypes } from '../../config/menuConfig';
import { useToast } from '../../hooks/useToast';
import BookingForm from './BookingForm';
import BookingDetailsModal from './BookingDetailsModal';
import BillGenerationModal from './BillGenerationModal';

const BookingsManagement = ({ initialFilters = null }) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billBooking, setBillBooking] = useState(null);
  const [existingBill, setExistingBill] = useState(null);
  const [billMode, setBillMode] = useState('create'); // 'create' or 'edit'
  const [loadingBill, setLoadingBill] = useState(false);
  const [filters, setFilters] = useState({
    status: initialFilters?.status || '',
    serviceType: initialFilters?.serviceType || '',
    dateFrom: initialFilters?.dateFrom || '',
    dateTo: initialFilters?.dateTo || '',
    search: initialFilters?.search || ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('bookingDateTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const { confirmDelete } = useGlobal();
  const { toast } = useToast();

  // Helper function to validate date range
  const isValidDateRange = (fromDate, toDate) => {
    if (!fromDate || !toDate) return false;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return from <= to;
  };

  // Helper function to format date for API
  const formatDateForAPI = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Get count of active filters
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(f => f && f !== '').length;
  };

  // Get active filter summary
  const getActiveFilterSummary = () => {
    const activeFilters = [];

    if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.status) {
      const statusName = bookingStatuses.find(s => s.id === filters.status)?.name || filters.status;
      activeFilters.push(`Status: ${statusName}`);
    }
    if (filters.serviceType) {
      const serviceName = serviceTypes.find(s => s.id === filters.serviceType)?.name || filters.serviceType;
      activeFilters.push(`Service: ${serviceName}`);
    }
    if (filters.dateFrom && filters.dateTo) {
      activeFilters.push(`Date: ${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`);
    }

    return activeFilters;
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      console.log('fetchBookings called with filters:', filters, 'page:', currentPage);
      setLoading(true);
      setError(null);

      let response;

      // Determine which filters are active
      const activeFilters = {
        search: filters.search && filters.search.trim() !== '',
        serviceType: filters.serviceType && filters.serviceType !== '',
        dateRange: filters.dateFrom && filters.dateTo &&
          filters.dateFrom !== '' && filters.dateTo !== '' &&
          isValidDateRange(filters.dateFrom, filters.dateTo),
        status: filters.status && filters.status !== ''
      };

      // Build filter strategy based on active filters
      if (activeFilters.search) {
        // Search takes highest priority
        response = await bookingsAPI.searchBookings(filters.search);
      } else if (activeFilters.serviceType && activeFilters.dateRange) {
        // Combined service type and date range filters
        response = await handleCombinedFilters();
      } else if (activeFilters.serviceType) {
        // Service type filter only
        // Convert service type ID to name for API call
        const serviceTypeName = getServiceTypeName(filters.serviceType);
        console.log('Calling API with service type name:', serviceTypeName);
        response = await bookingsAPI.getBookingsByServiceType(serviceTypeName, currentPage, pageSize);
      } else if (activeFilters.dateRange) {
        // Date range filter only
        response = await bookingsAPI.getBookingsByDateRange(
          formatDateForAPI(filters.dateFrom),
          formatDateForAPI(filters.dateTo),
          currentPage,
          pageSize
        );
      } else if (activeFilters.status) {
        // Status filter only
        response = await bookingsAPI.getBookingsByStatus(filters.status, currentPage, pageSize);
      } else {
        // No filters - get all bookings
        response = await bookingsAPI.getBookings(currentPage, pageSize);
      }

      console.log('API response:', response);

      if (response.success) {
        setBookings(response.bookings || []);
        setTotalBookings(response.totalBookings || 0);

        // Debug: Log service type values to understand the data structure
        if (response.bookings && response.bookings.length > 0) {
          debugServiceTypes(response.bookings);
        }

        // Update stats
        const total = response.totalBookings || response.bookings?.length || 0;
        setStats({
          totalBookings: total,
          todayBookings: 0,
          thisWeekBookings: 0,
          thisMonthBookings: 0
        });
      } else {
        setError(response.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      toast.error('Error', 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle combined filters (service type + date range)
  const handleCombinedFilters = async () => {
    try {
      // Get all bookings to apply multiple filters
      const allBookingsResponse = await bookingsAPI.getBookings(0, 1000);

      if (!allBookingsResponse.success) {
        throw new Error('Failed to fetch bookings for combined filtering');
      }

      // Apply both filters on the client side
      const filteredBookings = allBookingsResponse.bookings.filter(booking => {
        // Service type filter - use service type name for matching
        const serviceTypeName = getServiceTypeName(filters.serviceType);
        const serviceTypeMatch = booking.serviceType === serviceTypeName;

        // Debug logging for service type matching
        console.log('Filtering booking:', {
          bookingServiceType: booking.serviceType,
          filterServiceTypeName: serviceTypeName,
          match: serviceTypeMatch
        });

        // Date range filter
        const bookingDate = new Date(booking.preferredDate);
        const fromDate = new Date(formatDateForAPI(filters.dateFrom));
        const toDate = new Date(formatDateForAPI(filters.dateTo));
        toDate.setHours(23, 59, 59); // Include the entire to date
        const dateMatch = bookingDate >= fromDate && bookingDate <= toDate;

        return serviceTypeMatch && dateMatch;
      });

      // Apply pagination
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

      return {
        success: true,
        bookings: paginatedBookings,
        totalBookings: filteredBookings.length
      };
    } catch (error) {
      console.error('Error with combined filters, falling back to service type only:', error);
      // Fallback to service type filter only
      return await bookingsAPI.getBookingsByServiceType(filters.serviceType, currentPage, pageSize);
    }
  };

  // Load bookings on component mount and when filters change
  useEffect(() => {
    fetchBookings();
  }, [filters, sortBy, sortOrder, currentPage, pageSize]);

  // Apply initial filters when component mounts or initialFilters change
  useEffect(() => {
    if (initialFilters && Object.values(initialFilters).some(value => value)) {
      setFilters({
        status: initialFilters.status || '',
        serviceType: initialFilters.serviceType || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
        search: initialFilters.search || ''
      });
      setShowFilters(true);

      // Show a toast notification about the applied filters
      const filterDescriptions = [];
      if (initialFilters.status) {
        const statusName = bookingStatuses.find(s => s.id === initialFilters.status)?.name || initialFilters.status;
        filterDescriptions.push(`Status: ${statusName}`);
      }
      if (initialFilters.dateFrom && initialFilters.dateTo) {
        filterDescriptions.push(`Date: ${formatDate(initialFilters.dateFrom)} - ${formatDate(initialFilters.dateTo)}`);
      }
      if (filterDescriptions.length > 0) {
        toast.success('Filters Applied', `Showing bookings with: ${filterDescriptions.join(', ')}`);
      }
    }
  }, [initialFilters, toast]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: value
      };

      // Validate date range if both dates are set
      if (field === 'dateFrom' || field === 'dateTo') {
        if (newFilters.dateFrom && newFilters.dateTo) {
          if (!isValidDateRange(newFilters.dateFrom, newFilters.dateTo)) {
            toast.error('Invalid Date Range', 'From date must be before or equal to To date.');
            return prev; // Don't update filters if date range is invalid
          }
        }
      }

      // Clear search when other filters are applied
      if (field !== 'search' && value && value !== '') {
        newFilters.search = '';
      }

      return newFilters;
    });
    setCurrentPage(0); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      serviceType: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setCurrentPage(0);
  };

  // Handle booking deletion
  const handleDeleteBooking = async (bookingId) => {
    confirmDelete({
      itemName: 'booking',
      onConfirm: async () => {
        try {
          const response = await bookingsAPI.deleteBooking(bookingId);
          if (response && response.success !== false) {
            toast.success('Booking Deleted', 'Booking has been deleted successfully.');
            fetchBookings(); // Refresh the list
          } else {
            toast.error('Delete Failed', response?.message || 'Failed to delete booking. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting booking:', error);
          toast.error(' Delete Error', 'Unable to delete booking. Please check your connection and try again.');
        }
      }
    });
  };

  // Handle booking status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));

    try {
      const response = await bookingsAPI.updateBooking(bookingId, {
        bookingStatus: newStatus
      });

      if (response.success) {
        toast.success('Status Updated', `Booking status changed to ${newStatus.replace('_', ' ')}.`);
        fetchBookings(); // Refresh the list
      } else {
        toast.error('Update Failed', response.message || 'Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Network Error', 'Unable to update status. Please check your connection and try again.');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Handle booking save (create or update)
  const handleBookingSave = (booking) => {
    console.log('handleBookingSave called with:', booking); // Debug log
    setShowBookingForm(false);
    setEditingBooking(null);
    console.log('About to call fetchBookings...'); // Debug log

    // Add a small delay to ensure the API has time to process the update
    setTimeout(() => {
      fetchBookings(); // Refresh the list
    }, 500);
  };

  // Handle booking form cancel
  const handleBookingCancel = () => {
    setShowBookingForm(false);
    setEditingBooking(null);
  };

  // Open booking form for editing
  const handleEditBooking = async (booking) => {
    try {
      setLoading(true);

      // Fetch the complete booking details
      const response = await bookingsAPI.getBookingById(booking.bookingId);

      if (response.success) {
        setEditingBooking(response);
        setShowBookingForm(true);
      } else {
        toast.error('Error', response.message || 'Failed to fetch booking details.');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Error', 'Failed to fetch booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open booking details modal
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
        dotColor: 'bg-amber-500'
      },
      CONFIRMED: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: AlertCircle,
        dotColor: 'bg-blue-500'
      },
      IN_PROGRESS: {
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: AlertCircle,
        dotColor: 'bg-orange-500'
      },
      COMPLETED: {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
        dotColor: 'bg-emerald-500'
      },
      DELIVERED: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
        dotColor: 'bg-green-500'
      },
      CANCELLED: {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
        dotColor: 'bg-red-500'
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></div>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    return timeString; // Already in HH:mm AM/PM format
  };

  // Get service type name
  const getServiceTypeName = (serviceTypeId) => {
    const serviceType = serviceTypes.find(service => service.id === serviceTypeId);
    return serviceType ? serviceType.name : serviceTypeId;
  };

  // Debug function to log service type values
  const debugServiceTypes = (bookings) => {
    const uniqueServiceTypes = [...new Set(bookings.map(booking => booking.serviceType))];
    console.log('Unique service types in bookings:', uniqueServiceTypes);
    console.log('Available service type IDs:', serviceTypes.map(st => st.id));
    console.log('Available service type names:', serviceTypes.map(st => st.name));
  };

  // Get next status options
  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['CANCELLED'],
      CANCELLED: []
    };

    return statusFlow[currentStatus] || [];
  };

  // Handle generate bill
  const handleGenerateBill = async (booking) => {
    try {
      setBillBooking(booking);

      // Check if bill already exists
      if (booking.billGenerated) {
        // Bill exists - fetch it for editing
        setBillMode('edit');
        setLoadingBill(true);
        setExistingBill(null); // Clear previous data
        setShowBillModal(true); // Show modal immediately with loader

        try {
          console.log('Fetching existing bill for booking:', booking.bookingId);
          const response = await billGenerationAPI.getBillByBookingId(booking.bookingId);
          console.log('Raw API response:', response);
          console.log('Response type:', typeof response);
          console.log('Is response array?', Array.isArray(response));

          let billData = null;

          // Handle different response formats
          if (Array.isArray(response) && response.length > 0) {
            // Response itself is an array (direct from API)
            billData = response[0];
            console.log('Response is array, extracted first item:', billData);
          } else if (response && response.success && Array.isArray(response.bill) && response.bill.length > 0) {
            // Standard API response with bill array
            billData = response.bill[0];
            console.log('Extracted bill from response.bill array:', billData);
          } else if (response && response.success && response.bill && !Array.isArray(response.bill)) {
            // Standard API response with single bill object
            billData = response.bill;
            console.log('Using response.bill directly:', billData);
          } else if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Response has data property with array
            billData = response.data[0];
            console.log('Extracted from response.data array:', billData);
          } else if (response && !response.success) {
            console.log('API returned error:', response.message);
            toast.error('Error', response.message || 'Failed to load existing bill.');
            setExistingBill(null);
            setLoadingBill(false);
            return;
          } else {
            console.log('Unexpected response format:', response);
          }

          if (billData) {
            console.log('Setting existing bill data:', billData);
            setExistingBill(billData);
            toast.success('Bill Found', 'Existing bill loaded for editing.');
          } else {
            toast.error('Error', 'Failed to load existing bill.');
            setExistingBill(null);
          }
        } catch (error) {
          console.error('Error fetching existing bill:', error);
          toast.error('Error', 'Failed to load existing bill.');
          setExistingBill(null);
        } finally {
          setLoadingBill(false);
        }
      } else {
        // No bill exists - create new
        setBillMode('create');
        setExistingBill(null);
        setLoadingBill(false);
        setShowBillModal(true);
        toast.info('New Bill', 'Creating a new bill for this booking.');
      }
    } catch (error) {
      console.error('Error handling bill generation:', error);
      toast.error('Error', 'Failed to handle bill generation.');
      setLoadingBill(false);
    }
  };

  // Handle bill save
  const handleBillSave = async (billInfo) => {
    try {
      let response;

      if (billMode === 'edit' && existingBill) {
        // Update existing bill
        console.log('Updating existing bill:', billInfo);
        response = await billGenerationAPI.updateBill(existingBill.id, billInfo);
        if (response.success) {
          toast.success('✅ Bill Updated Successfully', `Bill ${response.billNumber || existingBill.billNumber} has been updated.`);
          // Refresh bookings to update billGenerated status
          fetchBookings();
          return response; // Return success response
        } else {
          toast.error('❌ Update Failed', response.message || 'Failed to update bill. Please try again.');
          throw new Error(response.message || 'Failed to update bill');
        }
      } else {
        // Create new bill
        console.log('Creating new bill:', billInfo);
        response = await billGenerationAPI.saveBill(billInfo);
        if (response.success) {
          toast.success('✅ Bill Created Successfully', `Bill ${response.billNumber} has been generated and saved.`);
          // Refresh bookings to update billGenerated status
          fetchBookings();
          return response; // Return success response
        } else {
          toast.error('❌ Creation Failed', response.message || 'Failed to create bill. Please try again.');
          throw new Error(response.message || 'Failed to create bill');
        }
      }

    } catch (error) {
      console.error('Error saving bill:', error);
      // Show generic error toast if not already shown
      if (!error.message?.includes('Failed to')) {
        toast.error('❌ Network Error', 'Unable to save bill. Please check your connection and try again.');
      }
      throw error; // Re-throw so the modal can handle it
    }
  };

  // Handle bill modal close
  const handleBillModalClose = () => {
    setShowBillModal(false);
    setBillBooking(null);
    setExistingBill(null);
    setBillMode('create');
    setLoadingBill(false);
  };

  if (showBookingForm) {
    return (
      <BookingForm
        booking={editingBooking}
        onSave={handleBookingSave}
        onCancel={handleBookingCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Bookings Management</h2>
          <p className="text-gray-600 mt-1">
            Manage service bookings and appointments
          </p>
        </div>
        <Button
          onClick={() => setShowBookingForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayBookings || 0}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisWeek || 0}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisMonth || 0}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBookings}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>

        {/* Advanced Filters */}
        {showFilters && (
          <CardContent className="pt-0">
            <Separator className="mb-4" />

            {/* Active Filter Summary */}
            {getActiveFilterCount() > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {getActiveFilterSummary().map((filter, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  {bookingStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Service Type</label>
                <select
                  value={filters.serviceType}
                  onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Services</option>
                  {serviceTypes.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  max={filters.dateTo || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  min={filters.dateFrom || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading bookings...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-900">Unable to load bookings</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={fetchBookings}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      {!loading && !error && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  All Bookings ({totalBookings})
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and track all service bookings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500 mb-4">
                  {Object.values(filters).some(f => f)
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by creating your first booking.'}
                </p>
                {!Object.values(filters).some(f => f) && (
                  <Button
                    onClick={() => setShowBookingForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Booking
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer & Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr 
                        key={booking.bookingId} 
                        className={`transition-colors ${
                          booking.billGenerated 
                            ? 'bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {booking.customerName}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {booking.contactNumber || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Car className="h-3 w-3 mr-1" />
                                {booking.vehicleModel || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {booking.vehicleRegNo}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {getServiceTypeName(booking.serviceType)}
                            </p>
                            {booking.assignedTechnician && (
                              <p className="text-gray-500 text-xs mt-1">
                                Tech: {booking.assignedTechnician}
                              </p>
                            )}
                            {booking.estimatedCost && (
                              <p className="text-gray-500 text-xs">
                                {booking.estimatedCost}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900 font-medium">
                              {formatDate(booking.preferredDate)}
                            </p>
                            <p className="text-gray-500">
                              {formatTime(booking.preferredTime)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(booking.bookingStatus)}
                            {getNextStatusOptions(booking.bookingStatus).length > 0 && (
                              <div className="relative group">
                                <button
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={loading || updatingStatus[booking.bookingId]}
                                  title="Update Status"
                                >
                                  {updatingStatus[booking.bookingId] ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-gray-600" />
                                  )}
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                  <div className="py-1">
                                    {getNextStatusOptions(booking.bookingStatus).map((status) => (
                                      <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(booking.bookingId, status)}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                                        disabled={updatingStatus[booking.bookingId]}
                                      >
                                        {status.replace('_', ' ')}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {booking.bookingId}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBooking(booking)}
                              className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!booking.billGenerated && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditBooking(booking)}
                                className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                                title="Edit Booking"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateBill(booking)}
                              className={`h-8 w-8 p-0 ${booking.billGenerated
                                  ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                                  : "border-green-300 text-green-700 hover:bg-green-50"
                                }`}
                              title={booking.billGenerated ? "Edit Bill" : "Generate Bill"}
                            >
                              {booking.billGenerated ? (
                                <Receipt className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBooking(booking.bookingId)}
                              className="h-8 w-8 p-0 border-red-300 text-red-700 hover:bg-red-50"
                              title="Delete Booking"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {bookings.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(0); // Reset to first page when changing page size
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700">entries</span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    Showing {Math.min(currentPage * pageSize + 1, totalBookings)} to {Math.min((currentPage + 1) * pageSize, totalBookings)} of {totalBookings} bookings
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const totalPages = Math.ceil(totalBookings / pageSize);
                      const maxVisiblePages = 5;
                      let startPage = Math.max(0, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages));
                      let endPage = Math.min(startPage + maxVisiblePages, totalPages);

                      // Adjust if we're near the end
                      if (endPage - startPage < maxVisiblePages && startPage > 0) {
                        startPage = Math.max(0, endPage - maxVisiblePages);
                      }

                      const pages = [];
                      
                      // First page
                      if (startPage > 0) {
                        pages.push(
                          <Button
                            key="first"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(0)}
                            className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            1
                          </Button>
                        );
                        if (startPage > 1) {
                          pages.push(
                            <span key="dots1" className="px-2 text-gray-500">...</span>
                          );
                        }
                      }

                      // Visible pages
                      for (let i = startPage; i < endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(i)}
                            className={`h-8 w-8 p-0 ${
                              currentPage === i 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {i + 1}
                          </Button>
                        );
                      }

                      // Last page
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="dots2" className="px-2 text-gray-500">...</span>
                          );
                        }
                        pages.push(
                          <Button
                            key="last"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages - 1)}
                            className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            {totalPages}
                          </Button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(Math.ceil(totalBookings / pageSize) - 1, currentPage + 1))}
                    disabled={currentPage >= Math.ceil(totalBookings / pageSize) - 1}
                    className="h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }}
      />

      {/* Bill Generation Modal */}
      <BillGenerationModal
        isOpen={showBillModal}
        booking={billBooking}
        existingBill={existingBill}
        mode={billMode}
        loadingBill={loadingBill}
        onClose={handleBillModalClose}
        onSave={handleBillSave}
      />
    </div>
  );
};

export default BookingsManagement; 