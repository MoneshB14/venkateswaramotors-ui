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
  BarChart3,
  Package,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { vmServiceOverview, inventoryAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useGlobal } from '../../hooks/useGlobal';
import ThreeBodyLoader from '../ui/ThreeBodyLoader';
import CompactCalendar from '../ui/CompactCalendar';
import BookingDetailsModal from './BookingDetailsModal';
import BookingsManagement from './BookingsManagement';
import CustomersManagement from './CustomersManagement';
import InventoryManagementRouter from './InventoryManagementRouter';
import UserManagement from './UserManagement';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const DashboardContent = ({ activeMenu, onMenuClick, bookingFilters }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState(null);

  // Debug effect to track inventoryStats changes
  useEffect(() => {
    console.log('Inventory stats changed:', inventoryStats);
  }, [inventoryStats]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { showGlobalLoading, hideGlobalLoading } = useGlobal();

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
      case 'todayAppointments': {
        // Show today's bookings
        const todayDate = new Date().toISOString().split('T')[0];
        filters = { dateFrom: todayDate, dateTo: todayDate };
        break;
      }
      case 'thisWeek': {
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
      }
      case 'thisMonth': {
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
      }
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
      showGlobalLoading('Loading dashboard data...');

      // Fetch dashboard statistics
      const statsResponse = await vmServiceOverview.getDashboardStats();
      if (statsResponse.success) {
        setDashboardStats(statsResponse.stats);
      }

      // Fetch inventory data for analytics
      try {
        console.log('Fetching inventory data...');
        // Get all inventory items for analytics
        const allItemsResponse = await inventoryAPI.getInventoryItems({ size: 1000 });
        const lowStockResponse = await inventoryAPI.getLowStockItems();
        const outOfStockResponse = await inventoryAPI.getOutOfStockItems();

        console.log('Inventory API responses:', {
          allItems: allItemsResponse,
          lowStock: lowStockResponse,
          outOfStock: outOfStockResponse
        });

        // Check if APIs returned data (handle both success property and direct data)
        const hasAllItems = allItemsResponse.success !== false && (allItemsResponse.items || allItemsResponse.content || allItemsResponse.data);
        const hasLowStock = lowStockResponse.success !== false && (lowStockResponse.items || lowStockResponse.content || lowStockResponse.data);
        const hasOutOfStock = outOfStockResponse.success !== false && (outOfStockResponse.items || outOfStockResponse.content || outOfStockResponse.data);

        if (hasAllItems && hasLowStock && hasOutOfStock) {
          // Handle different possible response structures
          const allItems = allItemsResponse.items || allItemsResponse.content || allItemsResponse.data || [];
          const lowStockItems = lowStockResponse.items || lowStockResponse.content || lowStockResponse.data || [];
          const outOfStockItems = outOfStockResponse.items || outOfStockResponse.content || outOfStockResponse.data || [];

          // Calculate analytics data
          const totalItems = allItems.length;
          const inStockItems = totalItems - lowStockItems.length - outOfStockItems.length;
          const lowStockCount = lowStockItems.length;
          const outOfStockCount = outOfStockItems.length;

          // Calculate total value
          const totalValue = allItems.reduce((sum, item) => {
            return sum + ((item.currentStock || 0) * (item.costPrice || 0));
          }, 0);

          // Group items by category for charts
          const categoryMap = {};
          const stockLevelsMap = {};

          allItems.forEach(item => {
            const category = item.category || 'Other';

            // Category distribution
            if (!categoryMap[category]) {
              categoryMap[category] = 0;
            }
            categoryMap[category]++;

            // Stock levels
            if (!stockLevelsMap[category]) {
              stockLevelsMap[category] = 0;
            }
            stockLevelsMap[category] += item.currentStock || 0;
          });

          // Convert to chart data format
          const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
            name,
            value
          }));

          const stockLevels = Object.entries(stockLevelsMap).map(([category, quantity]) => ({
            category,
            quantity
          }));

          const inventoryAnalytics = {
            totalItems,
            inStockItems,
            lowStockItems: lowStockCount,
            outOfStockItems: outOfStockCount,
            totalValue,
            categoryDistribution,
            stockLevels
          };

          console.log('Setting inventory stats:', inventoryAnalytics);
          setInventoryStats(inventoryAnalytics);
        } else {
          console.log('One or more inventory API calls failed');
          // Temporary fallback for testing - remove this in production
          console.log('Using fallback inventory data for testing');
          setInventoryStats({
            totalItems: 0,
            inStockItems: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
            totalValue: 0,
            categoryDistribution: [],
            stockLevels: []
          });
        }
      } catch (inventoryErr) {
        console.error('Error fetching inventory data:', inventoryErr);
        // Don't set inventory stats if there's an error - section won't show
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
      // toast.success('Dashboard Updated', 'Latest data has been loaded successfully.');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      hideGlobalLoading();
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

  // Handle calendar date click
  const handleCalendarDateClick = (date, appointments) => {
    if (appointments.length > 0) {
      // Show the first appointment in modal
      setSelectedBooking(appointments[0]);
      setIsModalOpen(true);
    }
  };

  // Handle appointment click (from calendar or appointment list)
  const handleAppointmentClick = (appointment) => {
    setSelectedBooking(appointment);
    setIsModalOpen(true);
  };

  // Handle schedule new appointment
  const handleScheduleNew = () => {
    onMenuClick('bookings');
  };

  const renderOverview = () => (
    <div className="space-y-8 w-full">
      {/* Enhanced Professional Dashboard Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600 font-medium">Service center overview & analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">Last updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Updating...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12 sm:py-16">
          <ThreeBodyLoader
            size="50px"
            color="#3b82f6"
            message="Loading dashboard data..."
            className="text-center"
          />
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
          {/* Enhanced Primary Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30" onClick={() => handleCardClick('totalBookings')} title="Click to view all bookings">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalBookings}</p>
                    <p className="text-sm text-gray-500 mt-1">All time records</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span>+12%</span>
                  </div>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-amber-50/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Services</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.pendingBookings}</p>
                    <p className="text-sm text-gray-500 mt-1">Awaiting completion</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-amber-600 font-medium">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Requires attention</span>
                  </div>
                  <span className="text-xs text-gray-500">Priority queue</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.completedBookings}</p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Successfully finished</span>
                  </div>
                  <span className="text-xs text-gray-500">Quality service</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Today</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.todayBookings}</p>
                    <p className="text-xs text-gray-500 mt-1">Appointments</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.thisWeekBookings}</p>
                    <p className="text-xs text-gray-500 mt-1">Scheduled</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.thisMonthBookings}</p>
                    <p className="text-xs text-gray-500 mt-1">Total services</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-red-50/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.cancelledBookings}</p>
                    <p className="text-xs text-gray-500 mt-1">No shows</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <XCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <div className="xl:col-span-2">
          <CompactCalendar
            todayBookings={todayBookings}
            allBookings={recentBookings}
            onDateClick={handleCalendarDateClick}
            onScheduleNew={handleScheduleNew}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-fit bg-gradient-to-br from-white to-blue-50/20">
            <CardHeader className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                  <CardDescription className="text-sm text-gray-600 font-medium">
                    Fast access to key features
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button
                onClick={() => onMenuClick('bookings')}
                className="w-full justify-start h-12 text-left bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-gray-700 border border-gray-200 hover:border-indigo-300 shadow-md hover:shadow-lg transition-all duration-300"
                variant="outline"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">New Booking</div>
                  <div className="text-xs text-gray-500">Schedule a service appointment</div>
                </div>
              </Button>

              <Button
                onClick={() => onMenuClick('customers')}
                className="w-full justify-start h-12 text-left bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 border border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300"
                variant="outline"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Manage Customers</div>
                  <div className="text-xs text-gray-500">View and edit customer records</div>
                </div>
              </Button>

              <Button
                onClick={() => onMenuClick('inventory')}
                className="w-full justify-start h-12 text-left bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 border border-gray-200 hover:border-purple-300 shadow-md hover:shadow-lg transition-all duration-300"
                variant="outline"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Package className="h-4 w-4 text-purple-600" />
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

      {/* Inventory Analytics */}
      {inventoryStats && (
        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Inventory Analytics</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Stock levels, categories, and value overview
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMenuClick('inventory')}
                  className="hidden sm:flex border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  View Inventory
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory Overview Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Items</p>
                        <p className="text-xl font-semibold text-gray-900">{inventoryStats?.totalItems || 0}</p>
                      </div>
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">In Stock</p>
                        <p className="text-xl font-semibold text-gray-900">{inventoryStats?.inStockItems || 0}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Low Stock</p>
                        <p className="text-xl font-semibold text-gray-900">{inventoryStats?.lowStockItems || 0}</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                        <p className="text-xl font-semibold text-gray-900">{inventoryStats?.outOfStockItems || 0}</p>
                      </div>
                      <XCircle className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Inventory Value Chart */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Total Inventory Value
                  </h4>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ₹{((inventoryStats?.totalValue || 0)).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Current market value of all items</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Category Distribution Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={inventoryStats?.categoryDistribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {inventoryStats?.categoryDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Stock Level Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Stock Levels</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={inventoryStats?.stockLevels || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Latest bookings and system updates
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMenuClick('bookings')}
              className="hidden sm:flex border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-500">Recent bookings and updates will appear here.</p>
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
    <InventoryManagementRouter />
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
