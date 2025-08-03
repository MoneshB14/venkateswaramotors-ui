import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Users,
  Car,
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronRight,
  Activity,
  ArrowUpRight,
  TrendingUp,
  BarChart3
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
        const todayDate = new Date().toISOString().split('T')[0];
        filters = { dateFrom: todayDate, dateTo: todayDate };
        break;
      case 'thisWeek':
        // Show this week's bookings (Monday to Sunday)
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
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
    <div className="space-y-8 w-full">
      {/* Modern SaaS Dashboard Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Service Dashboard</h1>
            <p className="text-blue-100 text-base font-medium">Monitor and manage your automotive service center</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={fetchDashboardData}
              disabled={loading}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Updating...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <Card className="group cursor-pointer border border-blue-200 shadow-lg bg-white hover:shadow-xl hover:border-blue-300 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 transition-all duration-300 overflow-hidden" onClick={() => handleCardClick('totalBookings')} title="Click to view all bookings">
              <CardHeader className="pb-3 px-6 pt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Total Bookings</CardTitle>
                      <p className="text-sm text-blue-600 font-semibold">All time</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 bg-white">
                <div className="text-3xl font-bold text-gray-900 mb-2">{dashboardStats.totalBookings}</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs text-emerald-700 font-semibold">+12%</span>
                  </div>
                  <span className="text-sm text-gray-600">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer border border-amber-200 shadow-lg bg-white hover:shadow-xl hover:border-amber-300 hover:bg-gradient-to-br hover:from-white hover:to-amber-50 transition-all duration-300 overflow-hidden" onClick={() => handleCardClick('pendingServices')} title="Click to view pending bookings">
              <CardHeader className="pb-3 px-6 pt-6 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Pending Services</CardTitle>
                      <p className="text-sm text-amber-600 font-semibold">In queue</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 bg-white">
                <div className="text-3xl font-bold text-gray-900 mb-2">{dashboardStats.pendingBookings}</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span className="text-xs text-amber-700 font-semibold">Urgent</span>
                  </div>
                  <span className="text-sm text-gray-600">requires attention</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer border border-emerald-200 shadow-lg bg-white hover:shadow-xl hover:border-emerald-300 hover:bg-gradient-to-br hover:from-white hover:to-emerald-50 transition-all duration-300 overflow-hidden" onClick={() => handleCardClick('completedServices')} title="Click to view completed bookings">
              <CardHeader className="pb-3 px-6 pt-6 bg-gradient-to-r from-emerald-50 to-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Completed</CardTitle>
                      <p className="text-sm text-emerald-600 font-semibold">This month</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 bg-white">
                <div className="text-3xl font-bold text-gray-900 mb-2">{dashboardStats.completedBookings}</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs text-emerald-700 font-semibold">Done</span>
                  </div>
                  <span className="text-sm text-gray-600">successfully finished</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-5 shadow-md border border-indigo-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.todayBookings}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100 hover:shadow-lg hover:border-purple-200 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">This Week</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.thisWeekBookings}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">This Month</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.thisMonthBookings}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-md border border-red-100 hover:shadow-lg hover:border-red-200 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.cancelledBookings}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Today's Bookings */}
        <div className="xl:col-span-2">
          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Today's Schedule</CardTitle>
                    <CardDescription className="text-gray-600 mt-1 font-medium">
                      {todayBookings.length} appointment{todayBookings.length !== 1 ? 's' : ''} scheduled
                    </CardDescription>
                  </div>
                </div>
                {todayBookings.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-white">Active</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {todayBookings.length === 0 ? (
                <div className="text-center py-16 sm:py-20">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                    <Calendar className="h-10 w-10 text-indigo-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Schedule is clear</h3>
                  <p className="text-gray-600 mb-2 text-base">No appointments scheduled for today.</p>
                  <p className="text-sm text-gray-500 mb-6">Perfect time to focus on other important tasks.</p>
                  <Button 
                    variant="outline" 
                    size="default" 
                    onClick={() => onMenuClick('bookings')}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Appointment
                  </Button>
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
          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 h-fit overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-600 mt-1 font-medium">
                    Fast access to key features
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button 
                onClick={() => onMenuClick('bookings')}
                className="w-full justify-start h-16 text-left bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white/30 transition-colors">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-base">New Booking</div>
                  <div className="text-sm text-indigo-100">Schedule a service appointment</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => onMenuClick('customers')}
                className="w-full justify-start h-14 text-left bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 border border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl group"
                variant="outline"
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center mr-3 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Manage Customers</div>
                  <div className="text-xs text-gray-500">View and edit customer records</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => onMenuClick('inventory')}
                className="w-full justify-start h-14 text-left bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 border border-gray-200 hover:border-purple-300 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl group"
                variant="outline"
              >
                <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center mr-3 transition-colors">
                  <Car className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Check Inventory</div>
                  <div className="text-xs text-gray-500">Monitor parts and supplies</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 max-w-7xl mx-auto overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600 mt-1 font-medium">
                  Latest bookings and system updates
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onMenuClick('bookings')}
              className="hidden sm:flex border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-md hover:shadow-lg transition-all duration-200"
            >
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                <Activity className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No recent activity</h3>
              <p className="text-gray-600 mb-2 text-base">Recent bookings and updates will appear here.</p>
              <p className="text-sm text-gray-500">Start by creating your first service appointment.</p>
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

  // Keep only the essential, working render functions
  const renderInventory = () => (
    <InventoryManagement />
  );

  const renderUsers = () => <UserManagement />;

  const contentMap = {
    overview: renderOverview,
    bookings: renderBookings,
    customers: renderCustomers,
    inventory: renderInventory,
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