import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { menuItems } from '../../config/menuConfig';
import DashboardContent from './DashboardContent';
import CollapsibleSidebar from './CollapsibleSidebar';
import Header from './Header';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookingFilters, setBookingFilters] = useState(null);

  const handleLogout = () => {
    logout();
  };

  const handleMenuClick = (menuId, filters = null) => {
    if (menuId === 'logout') {
      handleLogout();
    } else {
      setActiveMenu(menuId);
      // Only set booking filters if we're going to the bookings tab
      if (menuId === 'bookings') {
        setBookingFilters(filters);
      } else {
        // Clear booking filters when navigating to other tabs
        setBookingFilters(null);
      }
      setSidebarOpen(false); // Close sidebar on mobile after menu selection
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header - Full Width */}
      <Header
        variant="unified"
        title={menuItems.find(item => item.id === activeMenu)?.title || 'Dashboard'}
        subtitle={menuItems.find(item => item.id === activeMenu)?.description || 'Welcome to your dashboard'}
        onLogout={handleLogout}
        onCollapseToggle={toggleSidebarCollapse}
        isCollapsed={sidebarCollapsed}
        user={user}
        showLogo={true}
        showUserInfo={true}
        showNotifications={true}
        showSettings={true}
        showLogout={false}
        showSearch={false}
        onMenuToggle={toggleSidebar}
        isOpen={sidebarOpen}
        className="w-full"
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex h-[calc(100vh-56px)] lg:h-[calc(100vh-56px)]">
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onCollapseToggle={toggleSidebarCollapse}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-3 sm:p-4 lg:p-6 min-h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-7xl">
              <DashboardContent 
                activeMenu={activeMenu} 
                onMenuClick={handleMenuClick}
                bookingFilters={bookingFilters}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 