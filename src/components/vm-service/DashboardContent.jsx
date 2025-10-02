import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { vmServiceOverview } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useGlobal } from '../../hooks/useGlobal';
import ThreeBodyLoader from '../ui/ThreeBodyLoader';
import CompactCalendar from '../ui/CompactCalendar';
import BookingDetailsModal from './BookingDetailsModal';
import BookingsManagement from './BookingsManagement';
import CustomersManagement from './CustomersManagement';
import InventoryManagementRouter from './InventoryManagementRouter';
import UserManagement from './UserManagement';
import Settings from './Settings';
import Notifications from './Notifications';
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
  const [inventoryStats, setInventoryStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Debug effect to track inventoryStats changes
  useEffect(() => {
    console.log('Inventory stats changed:', inventoryStats);
  }, [inventoryStats]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dataLoadedRef = useRef(false);
  const fetchDataRef = useRef(null);
  const { toast } = useToast();
  const { showGlobalLoading, hideGlobalLoading } = useGlobal();


  // Handle dashboard card clicks (keeping for potential future use)
  // const handleCardClick = (cardType) => {
  //   let filters = {};
  //   // ... card click logic
  // };

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      showGlobalLoading('Loading dashboard data...');

      // Fetch dashboard data from API
      const response = await vmServiceOverview.getDashboardData();
      console.log('Dashboard API Response:', response);
      
      if (response) {
        const data = response;

        // Set analytics data
        const analytics = {
          todayIncome: data.kpiCards?.todaysIncome || 0,
          todayServices: data.kpiCards?.todaysCompletedServices || 0,
          pendingBookings: data.kpiCards?.totalPendingBookings || 0,
          completedBookings: data.kpiCards?.totalCompletedBookings || 0,
          dailyIncomeData: (data.dailyIncomeChart || []).map(item => ({
            day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
            date: item.date,
            income: item.income || 0,
            services: item.serviceCount || 0
          })),
          serviceTypesData: (data.serviceTypeChart || []).map(item => ({
            name: item.serviceType || 'Unknown',
            value: item.count || 0,
            percentage: (item.percentage || 0).toFixed(1)
          }))
        };
        console.log('Processed Analytics Data:', analytics);
        setAnalyticsData(analytics);

        // Set recent bookings
        const recentBookings = (data.recentActivity || []).map(booking => ({
          id: booking.bookingId || '',
          serviceType: booking.serviceType || 'Unknown Service',
          vehicleModel: booking.vehicleRegistration || 'Unknown Vehicle', // Using registration as model for now
          customerName: booking.customerName || 'Unknown Customer',
          vehicleRegistration: booking.vehicleRegistration || '',
          preferredDate: booking.preferredDate || '',
          preferredTime: booking.preferredTime || '',
          bookingStatus: booking.bookingStatus || 'UNKNOWN',
          createdAt: booking.createdAt || new Date().toISOString(),
          totalAmount: parseFloat(booking.estimatedCost) || 0,
          assignedTechnician: booking.assignedTechnician || 'Not Assigned'
        }));
        setRecentBookings(recentBookings);

        // Set inventory stats
        const inventoryAnalytics = data.inventoryAnalytics || {};
        const stockBreakdowns = inventoryAnalytics.stockLevelBreakdowns || [];
        const categoryDistributions = inventoryAnalytics.categoryDistributions || [];
        
        const inventoryStats = {
          totalItems: inventoryAnalytics.totalItemsCount || 0,
          inStockItems: stockBreakdowns.find(level => level.level === 'In Stock')?.count || 0,
          lowStockItems: stockBreakdowns.find(level => level.level === 'Low Stock')?.count || 0,
          outOfStockItems: stockBreakdowns.find(level => level.level === 'Out of Stock')?.count || 0,
          totalValue: inventoryAnalytics.totalInventoryValue || 0,
          categoryDistribution: categoryDistributions.map(cat => ({
            name: (cat.category || 'Unknown').replace(/_/g, ' '),
            value: cat.count || 0
          })),
          stockLevels: categoryDistributions.map(cat => ({
            category: (cat.category || 'Unknown').replace(/_/g, ' '),
            quantity: cat.count || 0
          }))
        };
        setInventoryStats(inventoryStats);

        // Show success message
        toast.success('Dashboard Updated', 'Latest data has been loaded successfully.');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      hideGlobalLoading();
    }
  }, [showGlobalLoading, hideGlobalLoading, toast]);

  // Store the function in a ref to avoid dependency issues
  fetchDataRef.current = fetchDashboardData;

  useEffect(() => {
    if (activeMenu === 'overview') {
      if (!dataLoadedRef.current) {
        dataLoadedRef.current = true;
        fetchDataRef.current();
      }
    } else {
      // Reset the flag when switching away from overview
      dataLoadedRef.current = false;
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

  // Handle calendar date click (keeping for potential future use)
  // const handleCalendarDateClick = (date, appointments) => {
  //   if (appointments.length > 0) {
  //     setSelectedBooking(appointments[0]);
  //     setIsModalOpen(true);
  //   }
  // };

  // Handle appointment click (keeping for potential future use)
  // const handleAppointmentClick = (appointment) => {
  //   setSelectedBooking(appointment);
  //   setIsModalOpen(true);
  // };

  // Handle schedule new appointment (keeping for potential future use)
  // const handleScheduleNew = () => {
  //   onMenuClick('bookings');
  // };

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
                  <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-600 font-medium">Service center performance & insights</p>
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
                  onClick={() => {
                    dataLoadedRef.current = false;
                    fetchDataRef.current();
                  }}
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
                onClick={() => {
                  dataLoadedRef.current = false;
                  fetchDataRef.current();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {analyticsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Income */}
          <Card className="border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Today's Income</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₹{analyticsData.todayIncome.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Completed services</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span>Revenue</span>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Services Done Today */}
          <Card className="border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Services Done Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.todayServices}</p>
                  <p className="text-sm text-gray-500 mt-1">Completed today</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-blue-600 font-medium">
                  <Activity className="h-4 w-4 mr-2" />
                  <span>Performance</span>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Bookings */}
          <Card className="border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-amber-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.pendingBookings}</p>
                  <p className="text-sm text-gray-500 mt-1">Awaiting completion</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-amber-600 font-medium">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>In Queue</span>
                </div>
                <span className="text-xs text-gray-500">All time</span>
              </div>
            </CardContent>
          </Card>

          {/* Completed Services */}
          <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed Services</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.completedBookings}</p>
                  <p className="text-sm text-gray-500 mt-1">Successfully finished</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-purple-600 font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Total</span>
                </div>
                <span className="text-xs text-gray-500">All time</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Charts Section */}
      {analyticsData && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Daily Income Chart */}
          <div className="xl:col-span-2">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Daily Income Trend</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Revenue over the past 7 days
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.dailyIncomeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="day"
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Income']}
                      labelFormatter={(label) => `Day: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Service Types Distribution */}
          <div className="xl:col-span-1">
            <Card className="border border-gray-200 shadow-sm h-full">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Service Types</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Distribution of completed services
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {analyticsData.serviceTypesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analyticsData.serviceTypesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        labelLine={false}
                        style={{
                          fontSize: '10px',
                          fontWeight: '500'
                        }}
                      >
                        {analyticsData.serviceTypesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value, 'Services']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No service data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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

        {/* Recent Activity Feed */}
        <div className="xl:col-span-2">
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
                      Latest updates and bookings
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
                  {recentBookings.slice(0, 3).map((booking) => (
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

  const renderSettings = () => <Settings />;

  const renderNotifications = () => <Notifications />;

  const contentMap = {
    overview: renderOverview,
    bookings: renderBookings,
    customers: renderCustomers,
    inventory: renderInventory,
    users: renderUsers,
    settings: renderSettings,
    notifications: renderNotifications
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
