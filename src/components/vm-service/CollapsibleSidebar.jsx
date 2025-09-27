import React, { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
  SidebarNavLink
} from '../ui/sidebar';
import { Button } from '../ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { menuItems } from '../../config/menuConfig';
import { useAuth } from '../../hooks/useAuth';

const CollapsibleSidebar = ({
  activeMenu,
  onMenuClick,
  user,
  isOpen,
  onClose,
  isCollapsed: externalIsCollapsed
}) => {
  const { canAccessUsers } = useAuth();
  const [internalIsCollapsed] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  void user; // mark as used to satisfy linter when not needed here

  // Filter menu items based on user role
  const getFilteredMenuItems = () => {
    return menuItems.filter(item => {
      // If it's the users tab, check if user has access
      if (item.id === 'users') {
        return canAccessUsers();
      }
      // For all other menu items, allow access
      return true;
    });
  };

  // Group menu items by task-based categories
  const operationsItems = getFilteredMenuItems().filter(item => ['overview', 'bookings', 'customers', 'inventory'].includes(item.id));
  const adminItems = getFilteredMenuItems().filter(item => ['users'].includes(item.id));

  const menuGroups = [
    { title: 'Operations', items: operationsItems },
    { title: 'Administration', items: adminItems }
  ].filter(group => group.items.length > 0);

  // Collapsible state per group
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const toggleGroup = (title) => {
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      <Sidebar
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          fixed lg:static 
          inset-y-0 left-0 z-50 lg:z-40
          transition-all duration-300 ease-in-out 
          bg-white border-r border-gray-200 shadow-lg lg:shadow-sm
          ${isCollapsed ? 'w-16' : 'w-64 sm:w-48'}
          overflow-hidden
        `}
      >
        {/* Empty SidebarHeader since we now have unified header */}
        <SidebarHeader className="h-0 p-0"></SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto scrollbar-hide">
          <SidebarNav className="px-2 py-3">
            {menuGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {/* Collapsible Group Header */}
                {!isCollapsed && (
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[0.7rem] font-semibold text-gray-800 uppercase tracking-wider bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      aria-expanded={!collapsedGroups[group.title]}
                      aria-controls={`group-${groupIndex}`}
                    >
                      <span className="font-semibold">{group.title}</span>
                      {collapsedGroups[group.title] ? (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                    <div className="mx-2 mt-1 border-b border-gray-200/80"></div>
                  </div>
                )}

                {/* Menu Items */}
                {!collapsedGroups[group.title] && group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  const isUsers = item.id === 'users';
                  return (
                    <SidebarNavItem key={item.id}>
                      <SidebarNavLink
                        href="#"
                        active={isActive}
                        onClick={(e) => {
                          e.preventDefault();
                          onMenuClick(item.id);
                        }}
                        className={`
                          group rounded-lg transition-all duration-200 ease-in-out relative overflow-hidden mb-1
                          ${isCollapsed ? 'justify-center px-2 py-2.5' : 'pl-2 pr-3 py-2.5'}
                          ${isActive
                            ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-600 shadow-sm'
                            : 'hover:bg-gray-50 hover:text-gray-900 hover:border-l-2 hover:border-gray-300'
                          }
                        `}
                        title={isCollapsed ? item.title : undefined}
                        aria-label={item.title}
                      >
                        {/* Active accent strip for stronger highlight */}
                        {!isCollapsed && (
                          <span className={`absolute left-0 top-0 h-full ${isActive ? 'w-1 bg-gradient-to-b from-blue-600 to-blue-500' : 'w-0'} rounded-r`}></span>
                        )}
                        <Icon className={`${isActive ? 'h-5 w-5 text-blue-700' : 'h-4.5 w-4.5 text-gray-500 opacity-70 group-hover:opacity-90 group-hover:text-gray-700'} flex-shrink-0 transition-all duration-200 relative z-10`} />
                        {!isCollapsed && (
                          <span className={`${isActive
                            ? 'text-blue-800 font-semibold'
                            : isUsers
                              ? 'text-gray-500 group-hover:text-gray-700'
                              : 'text-gray-700 group-hover:text-gray-900'
                            } font-medium transition-all duration-200 relative z-10 ml-3 ${isUsers ? 'text-sm' : 'text-[0.95rem]'} }`}>
                            {item.title}
                          </span>
                        )}
                      </SidebarNavLink>
                    </SidebarNavItem>
                  );
                })}

                {/* Add separator between groups (except for last group) */}
                {groupIndex < menuGroups.length - 1 && !isCollapsed && (
                  <div className="my-3 mx-3 border-t border-gray-200"></div>
                )}
              </div>
            ))}
          </SidebarNav>
        </SidebarContent>

        <SidebarFooter className="px-2 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            {!isCollapsed && (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-b from-blue-600 to-blue-500"></span>
                <span className="text-xs text-gray-600 font-semibold tracking-wide">Venkateswara Motors</span>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default CollapsibleSidebar; 