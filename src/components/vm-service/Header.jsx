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
  showLogout = true,
  showSearch = false,
  
  // Action props
  onMenuToggle,
  onCollapseToggle,
  onLogout,
  onClose,
  
  // User data
  user,
  
  // Styling
  className = '',
  logoText = 'VM',
  companyName = 'Venkateswara Motors',
  companySubtitle = 'Service Center'
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsProfileDropdownOpen(false);
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
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors duration-200 opacity-50"
    >
      <Bell className="h-4 w-4 text-gray-600" />
      {/* Hide notification dot for now */}
      {/* <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span> */}
    </Button>
  );

  const renderSettings = () => (
    <Button 
      variant="ghost" 
      size="icon"
      className="h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors duration-200"
    >
      <Settings className="h-4 w-4 text-gray-600" />
    </Button>
  );

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