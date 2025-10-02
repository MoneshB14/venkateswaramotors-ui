import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  ChevronDown
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { notificationService } from '../../services/api';

const Header = ({
  // Layout props
  variant = 'desktop', // 'desktop', 'mobile', 'sidebar', 'unified'
  isCollapsed = false,
  isOpen = false,

  // Content props
  title = 'Dashboard',
  subtitle = 'Welcome to your dashboard',
  showLogo = true,
  showUserInfo = true,
  showNotifications = true,
  showSettings = true,

  // Action props
  onMenuToggle,
  onCollapseToggle,
  onLogout,
  onNotificationClick,
  onSettingsClick,

  // User data
  user,

  // Styling
  className = '',
  logoText = 'VM',
  companyName = 'Venkateswara Motors',
  companySubtitle = 'Service Center'
}) => {
  const { unreadCount } = useNotifications();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen || isNotificationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, isNotificationDropdownOpen]);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    const fetchRecentNotifications = async () => {
      if (!isNotificationDropdownOpen || !user?.email) return;

      setLoadingNotifications(true);
      try {
        const response = await notificationService.getAllNotifications(user.email, 0, 5);
        if (response.success) {
          const notifications = response.notifications || [];
          // Only update state if notifications actually changed
          setRecentNotifications(prevNotifications => {
            if (JSON.stringify(prevNotifications) !== JSON.stringify(notifications)) {
              return notifications;
            }
            return prevNotifications;
          });
        }
      } catch (error) {
        console.error('Failed to fetch recent notifications:', error);
        setRecentNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchRecentNotifications();
  }, [isNotificationDropdownOpen, user?.email]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsProfileDropdownOpen(false);
  };

  // Format notification timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diff = now - notifDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return notifDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Close dropdown
    setIsNotificationDropdownOpen(false);

    // Navigate to notifications page
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  // Handle view all notifications
  const handleViewAllNotifications = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNotificationDropdownOpen(false);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const renderLogo = () => (
    <div className="relative group">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ring-1 ring-blue-200/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full"></div>
        <span className="text-white font-bold text-sm relative z-10">{logoText}</span>
      </div>
    </div>
  );

  const renderCompanyInfo = () => (
    <div className="flex-1 min-w-0 ml-3">
      <h2 className="text-sm font-semibold text-gray-900 leading-tight tracking-tight">
        {companyName}
      </h2>
      <p className="text-xs font-medium text-gray-600 mt-0.5 tracking-wide">{companySubtitle}</p>
    </div>
  );

  const renderProfileDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        className="flex items-center space-x-2 h-9 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
      >
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
          <User className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isProfileDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
                <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="py-1">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start h-10 px-4 text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="relative" ref={notificationDropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
        }}
        className="relative h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        title="Notifications"
      >
        <Bell className="h-4 w-4 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isNotificationDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500">{unreadCount} unread</span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[350px] overflow-y-auto">
            {loadingNotifications ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.notificationId}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium ${!notif.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{notif.notificationMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              type="button"
              onClick={handleViewAllNotifications}
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-sm"
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => {
    const handleSettingsClickInternal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onSettingsClick) {
        onSettingsClick();
      }
    };

    return (
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={handleSettingsClickInternal}
        className="h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        title="Settings"
      >
        <Settings className="h-4 w-4 text-gray-600" />
      </Button>
    );
  };

  const renderCollapseButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onCollapseToggle}
      className="h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      title={isCollapsed ? 'Expand' : 'Collapse'}
    >
      <ChevronLeft className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
    </Button>
  );

  const renderMobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onMenuToggle}
      className="lg:hidden h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors duration-200"
    >
      {isOpen ? <X className="h-4 w-4 text-gray-600" /> : <Menu className="h-4 w-4 text-gray-600" />}
    </Button>
  );

  // Unified Header Variant (new)
  if (variant === 'unified') {
    return (
      <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Left Section: Logo, Company Name, and Page Info */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Mobile Menu Button */}
            {renderMobileMenuButton()}

            {/* Logo and Company Name */}
            <div className="flex items-center">
              {showLogo && renderLogo()}
              <div className="hidden sm:block">
                {renderCompanyInfo()}
              </div>
            </div>

            {/* Collapse Button (Desktop) */}
            {onCollapseToggle && (
              <div className="hidden lg:block">
                {renderCollapseButton()}
              </div>
            )}

            {/* Page Title and Subtitle */}
            <div className="hidden lg:block relative">
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                {title}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {subtitle}
              </p>
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-600 rounded-full"></div>
            </div>
          </div>

          {/* Right Section: Notifications, Settings, and User Profile */}
          <div className="flex items-center space-x-1 ml-auto">
            {showNotifications && renderNotifications()}
            {showSettings && (
              <div className="hidden sm:block">
                {renderSettings()}
              </div>
            )}
            <Separator orientation="vertical" className="h-6 bg-gray-200 mx-2 sm:mx-3 hidden sm:block" />
            {showUserInfo && renderProfileDropdown()}
          </div>
        </div>
      </header>
    );
  }

  // Sidebar Header Variant
  if (variant === 'sidebar') {
    return (
      <div className={`border-b border-gray-200 bg-white h-20 relative ${className}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-4 py-5 h-full`}>
          {showLogo && renderLogo()}
          {!isCollapsed && showLogo && renderCompanyInfo()}
        </div>
      </div>
    );
  }

  // Mobile Header Variant
  if (variant === 'mobile') {
    return (
      <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-3">
            {renderMobileMenuButton()}
            <div className="flex items-center space-x-3">
              {showLogo && (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-blue-200/50">
                  <span className="text-white font-bold text-sm">{logoText}</span>
                </div>
              )}
              {!isOpen && (
                <div>
                  <h1 className="text-base font-semibold text-gray-900 leading-tight whitespace-nowrap">
                    {companyName}
                  </h1>
                  <p className="text-xs font-medium text-gray-600">{companySubtitle}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showNotifications && renderNotifications()}
            {showUserInfo && renderProfileDropdown()}
          </div>
        </div>
      </header>
    );
  }

  // Desktop Header Variant (default)
  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center space-x-4">
          {onCollapseToggle && renderCollapseButton()}
          <div className="relative">
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">
              {title}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {subtitle}
            </p>
            <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-600 rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-auto">
          {showNotifications && renderNotifications()}
          {showSettings && renderSettings()}
          <Separator orientation="vertical" className="h-8 bg-gray-200 mx-3" />
          {showUserInfo && renderProfileDropdown()}
        </div>
      </div>
    </header>
  );
};

export default Header; 