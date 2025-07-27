import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Users,
  Wrench,
  Car,
  Calendar,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  ChevronRight,
  Star,
  DollarSign,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { vmServiceOverview } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import BookingDetailsModal from './BookingDetailsModal';
import BookingsManagement from './BookingsManagement';
import CustomersManagement from './CustomersManagement';
import InventoryManagement from './InventoryManagement';
import UserManagement from './UserManagement';

const DashboardContent = ({ activeMenu, onMenuClick, bookingFilters }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Handle dashboard card clicks
  const handleCardClick = (cardType) => {
    let filters = {};

    switch (cardType) {
      case 'totalBookings':
        // Show all bookings
        filters = {};
        break;
      case 'pendingServices':
        // Show pending bookings
        filters = { status: 'PENDING' };
        break;
      case 'completedServices':
        // Show completed bookings
        filters = { status: 'COMPLETED' };
        break;
      case 'todayAppointments':
        // Show today's bookings
        const today = new Date().toISOString().split('T')[0];
        filters = { dateFrom: today, dateTo: today };
        break;
      case 'thisWeek':
        // Show this week's bookings
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
        filters = {
          dateFrom: startOfWeek.toISOString().split('T')[0],
          dateTo: endOfWeek.toISOString().split('T')[0]
        };
        break;
      case 'thisMonth':
        // Show this month's bookings
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
        filters = {
          dateFrom: startOfMonth.toISOString().split('T')[0],
          dateTo: endOfMonth.toISOString().split('T')[0]
        };
        break;
      case 'cancelled':
        // Show cancelled bookings
        filters = { status: 'CANCELLED' };
        break;
      default:
        filters = {};
    }

    onMenuClick('bookings', filters);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const statsResponse = await vmServiceOverview.getDashboardStats();
      if (statsResponse.success) {
        setDashboardStats(statsResponse.stats);
      }

      // Fetch today's bookings
      const todayResponse = await vmServiceOverview.getTodayBookedServices();
      if (todayResponse.success) {
        setTodayBookings(todayResponse.bookedServices || []);
      }

      // Fetch recent bookings (all booked services)
      const recentResponse = await vmServiceOverview.getAllBookedServices();
      if (recentResponse.success) {
        setRecentBookings(recentResponse.bookedServices || []);
      }

      // Show success message
      toast.success('Dashboard Updated', 'Latest data has been loaded successfully.');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'overview') {
      fetchDashboardData();
    }
  }, [activeMenu]);

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

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
        dotColor: 'bg-amber-500'
      },
      COMPLETED: {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
        dotColor: 'bg-emerald-500'
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
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <div className={`w-1 h-1 rounded-full ${config.dotColor}`}></div>
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{status}</span>
      </span>
    );
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Handle booking click
  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const renderOverview = () => (
    <div className="space-y-6 w-full">
      {/* Dashboard Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Real-time analytics and insights</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={loading}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Dashboard'}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12 sm:py-16">
          <div className="text-center">
            <Loader2 className="h-10 sm:h-12 w-10 sm:w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading dashboard data...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the latest information</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
            <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2">Unable to load dashboard data</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100 w-full sm:w-auto"
                onClick={fetchDashboardData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <>
          {/* Primary Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 max-w-6xl mx-auto">
            <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group min-h-[100px] sm:min-h-[120px] flex flex-col cursor-pointer relative overflow-hidden" onClick={() => handleCardClick('totalBookings')}>
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs sm:text-sm font-bold text-gray-800 truncate">Total Bookings</CardTitle>
                    <ArrowUpRight className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{dashboardStats.totalBookings}</div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">All time bookings</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group min-h-[100px] sm:min-h-[120px] flex flex-col cursor-pointer relative overflow-hidden" onClick={() => handleCardClick('pendingServices')}>
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs sm:text-sm font-bold text-gray-800 truncate">Pending Services</CardTitle>
                    <ArrowUpRight className="h-5 w-5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors flex-shrink-0">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{dashboardStats.pendingBookings}</div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">Awaiting completion</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group min-h-[100px] sm:min-h-[120px] flex flex-col cursor-pointer relative overflow-hidden" onClick={() => handleCardClick('completedServices')}>
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs sm:text-sm font-bold text-gray-800 truncate">Completed Services</CardTitle>
                    <ArrowUpRight className="h-5 w-5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{dashboardStats.completedBookings}</div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">Successfully completed</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group min-h-[100px] sm:min-h-[120px] flex flex-col cursor-pointer relative overflow-hidden" onClick={() => handleCardClick('todayAppointments')}>
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs sm:text-sm font-bold text-gray-800 truncate">Today's Appointments</CardTitle>
                    <ArrowUpRight className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{dashboardStats.todayBookings}</div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">Scheduled for today</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group min-h-[80px] sm:min-h-[100px] flex flex-col cursor-pointer relative overflow-hidden" onClick={() => handleCardClick('thisWeek')}>
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs sm:text-sm font-bold text-gray-800 truncate">This Week</CardTitle>
                    <ArrowUpRight className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{dashboardStats.thisWeekBookings}</div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">Bookings this week</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group min-h-[80px] sm:min-h-[100px] flex flex-col cursor-pointer relative overflow-hidden" onClick={() => handleCardClick('thisMonth')}>
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs sm:text-sm font-bold text-gray-800 truncate">This Month</CardTitle>
                    <ArrowUpRight className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{dashboardStats.thisMonthBookings}</div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">Bookings this month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group min-h-[80px] sm:min-h-[100px] flex flex-col cursor-pointer relative overflow-hidden" onClick={() => handleCardClick('cancelled')}>
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs sm:text-sm font-bold text-gray-800 truncate">Cancelled</CardTitle>
                    <ArrowUpRight className="h-5 w-5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{dashboardStats.cancelledBookings}</div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">Cancelled bookings</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
        {/* Today's Bookings */}
        <div className="xl:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50 px-4 sm:px-6 py-4">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Today's Bookings</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Appointments scheduled for today
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {todayBookings.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-3xl">🎉</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">You're all caught up!</h3>
                  <p className="text-gray-600 mb-2">No bookings scheduled for today.</p>
                  <p className="text-sm text-gray-500">Enjoy your time and stay productive!</p>
                  <div className="mt-4 sm:mt-6">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule New Appointment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {todayBookings.slice(0, 6).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Car className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate mb-1">{booking.customerName}</p>
                            <p className="text-sm text-gray-500 truncate mb-1">{booking.vehicleModel} • {booking.vehicleRegistration}</p>
                            <p className="text-xs text-gray-400 capitalize">{booking.serviceType}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-semibold text-gray-900">{formatTime(booking.preferredTime)}</p>
                            <p className="text-xs text-gray-500">{formatDate(booking.preferredDate)}</p>
                          </div>
                          {getStatusBadge(booking.bookingStatus)}
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {todayBookings.length > 6 && (
                <div className="p-4 border-t bg-gray-50">
                  <Button variant="outline" size="sm" className="w-full">
                    View All ({todayBookings.length} bookings)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <Card className="border-0 shadow-sm h-fit">
            <CardHeader className="border-b bg-gray-50 px-4 sm:px-6 py-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <Button className="w-full justify-start h-12 sm:h-14 text-left bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl" variant="outline">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <Plus className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-sm">New Appointment</div>
                  <div className="text-xs text-gray-500">Schedule a new service</div>
                </div>
              </Button>
              <Button className="w-full justify-start h-12 sm:h-14 text-left bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl" variant="outline">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <Users className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-sm">Add Customer</div>
                  <div className="text-xs text-gray-500">Register new customer</div>
                </div>
              </Button>
              <Button className="w-full justify-start h-12 sm:h-14 text-left bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl" variant="outline">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <Car className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-sm">Register Vehicle</div>
                  <div className="text-xs text-gray-500">Add vehicle details</div>
                </div>
              </Button>
              <Button className="w-full justify-start h-12 sm:h-14 text-left bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl" variant="outline">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <FileText className="h-4 sm:h-5 w-4 sm:w-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-bold text-sm">Generate Report</div>
                  <div className="text-xs text-gray-500">Create service reports</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm max-w-7xl mx-auto">
        <CardHeader className="border-b bg-gray-50 px-4 sm:px-6 py-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Latest service activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Activity className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">No recent activity</h3>
              <p className="text-gray-600 mb-2">Activity will appear here as bookings are processed.</p>
              <p className="text-sm text-gray-500">Start by creating your first appointment!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentBookings.slice(0, 8).map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => handleBookingClick(booking)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      {booking.bookingStatus === 'COMPLETED' && (
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                      )}
                      {booking.bookingStatus === 'PENDING' && (
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                      )}
                      {booking.bookingStatus === 'CANCELLED' && (
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {booking.serviceType} for {booking.vehicleModel}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        {booking.customerName} • {booking.vehicleRegistration}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(booking.preferredDate)} at {formatTime(booking.preferredTime)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      {getStatusBadge(booking.bookingStatus)}
                      <div className="text-xs text-gray-400">
                        {getTimeAgo(booking.createdAt)}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderBookings = () => (
    <BookingsManagement initialFilters={bookingFilters} />
  );

  const renderCustomers = () => (
    <CustomersManagement />
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">
            Manage service types and ongoing service requests
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Management</CardTitle>
          <CardDescription>
            Track and manage all service activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Service management interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventory = () => (
    <InventoryManagement />
  );

  const renderVehicles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
          <p className="text-muted-foreground">
            Manage vehicle information and service history
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Database</CardTitle>
          <CardDescription>
            View and manage all registered vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vehicle management interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            Schedule and manage customer appointments
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
          <CardDescription>
            View and manage scheduled appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Appointment scheduling interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Analytics and business insights
          </p>
        </div>
        <Button>
          <BarChart3 className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            View business metrics and performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Analytics and reporting interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Manage service records and documentation
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>
            Store and organize service records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Document management interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            System alerts and notifications
          </p>
        </div>
        <Button variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          Mark All Read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
          <CardDescription>
            View and manage system notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Notification management interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure system preferences and options
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Manage application settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings configuration interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => <UserManagement />;

  const contentMap = {
    overview: renderOverview,
    bookings: renderBookings,
    customers: renderCustomers,
    services: renderServices,
    inventory: renderInventory,
    vehicles: renderVehicles,
    appointments: renderAppointments,
    reports: renderReports,
    documents: renderDocuments,
    notifications: renderNotifications,
    settings: renderSettings,
    users: renderUsers
  };

  const renderContent = contentMap[activeMenu] || renderOverview;

  return (
    <div className="flex-1 space-y-6">
      {renderContent()}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default DashboardContent; 