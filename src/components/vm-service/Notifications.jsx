import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  CreditCard,
  Package,
  User,
  Settings,
  TrendingUp,
  DollarSign,
  Wrench,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Archive,
  BellOff,
  Zap,
  MessageSquare,
  FileText,
  AlertTriangle,
  Truck,
  UserCheck,
  ShoppingCart,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useGlobal } from '../../hooks/useGlobal';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/api';

// Map API notification types to UI components
const getNotificationIcon = (type) => {
  const iconMap = {
    'BOOKING_CREATED': { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100' },
    'BOOKING_UPDATED': { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100' },
    'BOOKING_CANCELLED': { icon: X, color: 'text-red-500', bg: 'bg-red-100' },
    'BOOKING_COMPLETED': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    'BILL_GENERATED': { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100' },
    'BILL_UPDATED': { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-100' },
    'LOGIN': { icon: LogIn, color: 'text-purple-500', bg: 'bg-purple-100' },
    'SIGNUP': { icon: UserPlus, color: 'text-teal-500', bg: 'bg-teal-100' },
    'USER_CREATED': { icon: UserCheck, color: 'text-teal-500', bg: 'bg-teal-100' },
    'INFO': { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100' },
    'WARNING': { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    'ERROR': { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
    'SUCCESS': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' }
  };
  return iconMap[type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' };
};

// Map API notification type to filter category
const getNotificationCategory = (type) => {
  if (type.startsWith('BOOKING_')) return 'booking';
  if (type.startsWith('BILL_')) return 'payment';
  if (type === 'USER_CREATED') return 'user';
  if (type === 'LOGIN' || type === 'SIGNUP') return 'system';
  return type.toLowerCase();
};

// Map API priority to component priority
const mapPriority = (priority) => {
  const priorityMap = {
    'URGENT': 'urgent',
    'HIGH': 'high',
    'MEDIUM': 'normal',
    'LOW': 'low'
  };
  return priorityMap[priority] || 'normal';
};

// Transform API notification to component format
const transformNotification = (apiNotif) => {
  const iconConfig = getNotificationIcon(apiNotif.type);
  return {
    id: apiNotif.notificationId,
    type: getNotificationCategory(apiNotif.type),
    title: apiNotif.title,
    message: apiNotif.notificationMessage,
    timestamp: new Date(apiNotif.createdAt),
    read: apiNotif.read, // Use the correct field from API
    priority: mapPriority(apiNotif.priority),
    icon: iconConfig.icon,
    iconColor: iconConfig.color,
    iconBg: iconConfig.bg,
    actionUrl: apiNotif.actionUrl,
    actionLabel: apiNotif.actionLabel,
    referenceId: apiNotif.referenceId,
    referenceType: apiNotif.referenceType
  };
};

const Notifications = () => {
  const { showSuccess, showError, confirmDelete, handleApiError } = useGlobal();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(25);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 0) => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const response = await notificationService.getAllNotifications(user.email, page, pageSize);
      
      if (response.success) {
        const transformed = response.notifications.map(transformNotification);
        setNotifications(transformed);
        setTotalCount(response.totalNotifications || transformed.length);
        setUnreadCount(response.unreadCount || transformed.filter(n => !n.read).length);
        setTotalPages(response.totalPages || Math.ceil((response.totalNotifications || transformed.length) / pageSize));
        setCurrentPage(page);
      } else {
        showError('Error', response.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      handleApiError(error, 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.email, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (!user?.email) return;

    try {
      setRefreshing(true);
      const response = await notificationService.getAllNotifications(user.email, currentPage, pageSize);
      
      if (response.success) {
        const transformed = response.notifications.map(transformNotification);
        setNotifications(transformed);
        setTotalCount(response.totalNotifications || transformed.length);
        setUnreadCount(response.unreadCount || transformed.filter(n => !n.read).length);
        setTotalPages(response.totalPages || Math.ceil((response.totalNotifications || transformed.length) / pageSize));
        showSuccess('Success', 'Notifications refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
      handleApiError(error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.email, currentPage, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load notifications on mount
  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]); // Only run when user email changes

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!user?.email) return;

    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        // Fetch silently without showing loading state
        notificationService.getAllNotifications(user.email, currentPage, pageSize)
          .then(response => {
            if (response.success) {
              const transformed = response.notifications.map(transformNotification);
              setNotifications(transformed);
              setTotalCount(response.totalNotifications || transformed.length);
              setUnreadCount(response.unreadCount || transformed.filter(n => !n.read).length);
              setTotalPages(response.totalPages || Math.ceil((response.totalNotifications || transformed.length) / pageSize));
            }
          })
          .catch(error => {
            console.error('Background refresh failed:', error);
          });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.email, loading, refreshing, currentPage, pageSize]);

  const filterTypes = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'booking', label: 'Bookings', icon: Calendar },
    { id: 'payment', label: 'Payments', icon: DollarSign },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'user', label: 'Users', icon: UserCheck },
    { id: 'info', label: 'Info', icon: Info },
    { id: 'warning', label: 'Warnings', icon: AlertTriangle },
    { id: 'error', label: 'Errors', icon: AlertCircle },
    { id: 'success', label: 'Success', icon: CheckCircle }
  ];

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: {
        className: 'bg-red-50 text-red-700 border border-red-200 text-xs font-medium px-2 py-0.5',
        label: 'Urgent'
      },
      high: {
        className: 'bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium px-2 py-0.5',
        label: 'High'
      },
      normal: {
        className: 'bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-2 py-0.5',
        label: 'Normal'
      },
      low: {
        className: 'bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium px-2 py-0.5',
        label: 'Low'
      }
    };
    const badge = badges[priority] || badges.normal;
    return (
      <span className={`inline-flex items-center rounded-md ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const filteredNotifications = notifications
    .filter(notif => filter === 'all' || notif.type === filter)
    .filter(notif =>
      searchQuery === '' ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      const response = await notificationService.markAsRead(id);

      if (!response.success) {
        // Revert on failure
        setNotifications(prev => prev.map(n =>
          n.id === id ? { ...n, read: false } : n
        ));
        setUnreadCount(prev => prev + 1);
        showError('Error', response.message || 'Failed to mark notification as read');
      } else {
        showSuccess('Success', 'Notification marked as read');
      }
    } catch (error) {
      // Revert on error
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, read: false } : n
      ));
      setUnreadCount(prev => prev + 1);
      handleApiError(error, 'Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.email) return;

    try {
      // Optimistic update
      const previousNotifications = [...notifications];
      const previousUnreadCount = unreadCount;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      const response = await notificationService.markAllAsRead(user.email);

      if (!response.success) {
        // Revert on failure
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        showError('Error', response.message || 'Failed to mark all notifications as read');
      } else {
        showSuccess('Success', 'All notifications marked as read');
      }
    } catch (error) {
      // Revert and refresh to ensure consistency
      fetchNotifications();
      handleApiError(error, 'Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = (id) => {
    confirmDelete({
      itemName: 'notification',
      onConfirm: async () => {
        try {
          const notification = notifications.find(n => n.id === id);
          const wasUnread = notification && !notification.read;

          // Optimistic update
          setNotifications(prev => prev.filter(n => n.id !== id));
          setTotalCount(prev => prev - 1);
          if (wasUnread) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }

          const response = await notificationService.deleteNotification(id);

          if (!response.success) {
            // Revert on failure
            fetchNotifications();
            showError('Error', response.message || 'Failed to delete notification');
          } else {
            showSuccess('Success', 'Notification deleted');
          }
        } catch (error) {
          // Revert on error
          fetchNotifications();
          handleApiError(error, 'Failed to delete notification');
        }
      }
    });
  };

  // Clear all notifications (delete all read notifications)
  const clearAll = () => {
    if (!user?.email) return;

    confirmDelete({
      itemName: 'all read notifications',
      onConfirm: async () => {
        try {
          const response = await notificationService.deleteAllRead(user.email);

          if (response.success) {
            // Keep only unread notifications
            setNotifications(prev => prev.filter(n => !n.read));
            setTotalCount(unreadCount);
            showSuccess('Success', response.message || 'All read notifications cleared');
          } else {
            showError('Error', response.message || 'Failed to clear notifications');
          }
        } catch (error) {
          handleApiError(error, 'Failed to clear notifications');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold text-gray-900">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Stay updated with your service center activities
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={refreshNotifications}
                disabled={refreshing}
                className="flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark all as read
                </Button>
              )}
              <Button
                variant="outline"
                onClick={clearAll}
                disabled={notifications.filter(n => n.read).length === 0}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Archive className="w-4 h-4" />
                Clear all read
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin mr-3" />
            <p className="text-sm text-gray-600">Loading notifications...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Notifications */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCount}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Unread Notifications */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Unread</p>
                  <p className="text-2xl font-semibold text-blue-600">{unreadCount}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BellOff className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Urgent Notifications */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-red-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Urgent</p>
                  <p className="text-2xl font-semibold text-red-600">{urgentCount}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            {/* Read Notifications */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Read</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCount - unreadCount}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        {!loading && (
          <div className="bg-white rounded-lg border border-gray-200 mb-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 w-full py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="p-4 bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {filterTypes.map(type => {
                    const count = notifications.filter(n => n.type === type.id).length;
                    const isActive = filter === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFilter(type.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <type.icon className="w-3.5 h-3.5" />
                        <span>{type.label}</span>
                        {type.id !== 'all' && (
                          <span className={`px-1.5 py-0.5 rounded text-xs ${isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filter === 'all' ? 'All Notifications' : filterTypes.find(f => f.id === filter)?.label}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Page {currentPage + 1} of {totalPages} • {filteredNotifications.length} of {totalCount} notifications
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications found</h3>
                  <p className="text-xs text-gray-500">
                    {notifications.length === 0
                      ? "You're all caught up!"
                      : "Try adjusting your filters."}
                  </p>
                </div>
              ) : (
                <>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 ${notification.iconBg} rounded-lg flex items-center justify-center`}>
                          <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} results
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                      className="text-sm"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (currentPage < 3) {
                          pageNum = i;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                      className="text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

