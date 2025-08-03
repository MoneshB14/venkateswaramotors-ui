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
import { menuItems } from '../../config/menuConfig';

const CollapsibleSidebar = ({
  activeMenu,
  onMenuClick,
  user,
  isOpen,
  onClose,
  isCollapsed: externalIsCollapsed,
  onCollapseToggle: externalOnCollapseToggle
}) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const toggleCollapse = externalOnCollapseToggle || (() => setInternalIsCollapsed(!internalIsCollapsed));

  // Group menu items by category
  const menuGroups = [
    {
      title: 'Core',
      items: menuItems.filter(item => ['overview', 'bookings', 'customers'].includes(item.id))
    },
    {
      title: 'Management',
      items: menuItems.filter(item => ['inventory'].includes(item.id))
    },
    {
      title: 'System',
      items: menuItems.filter(item => ['users'].includes(item.id))
    }
  ];

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
          ${isCollapsed ? 'w-16' : 'w-48'}
          relative overflow-hidden
        `}
      >
        {/* Empty SidebarHeader since we now have unified header */}
        <SidebarHeader className="h-0 p-0"></SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto scrollbar-hide">
          <SidebarNav className="px-2 py-3">
            {menuGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {/* Section Header */}
                {!isCollapsed && (
                  <div className="px-3 py-2 mb-2">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-md">
                      {group.title}
                    </h3>
                  </div>
                )}
                
                {/* Menu Items */}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
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
                          ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                          ${isActive
                            ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                            : 'hover:bg-gray-50 hover:text-gray-900 hover:border-l-2 hover:border-gray-300'
                          }
                        `}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 relative z-10 ${
                          isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                        }`} />
                        {!isCollapsed && (
                          <span className={`font-medium text-sm transition-all duration-200 relative z-10 ml-3 ${
                            isActive ? 'text-blue-700 font-semibold' : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
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
              <div className="text-xs text-gray-500 font-medium">
                Venkateswara Motors
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