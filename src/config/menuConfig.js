import {
  Gauge,
  Users,
  Calendar,
  UserPlus,
  Package,
  MessageSquare
} from 'lucide-react';

export const menuItems = [
  {
    id: 'overview',
    title: 'Overview',
    icon: Gauge,
    href: '/dashboard',
    description: 'Dashboard overview and analytics'
  },
  {
    id: 'bookings',
    title: 'Bookings',
    icon: Calendar,
    href: '/dashboard/bookings',
    description: 'Manage service bookings and appointments'
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: Users,
    href: '/dashboard/customers',
    description: 'Manage customer information and history'
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: Package,
    href: '/dashboard/inventory',
    description: 'Manage spare parts and stock'
  },
  {
    id: 'users',
    title: 'Users',
    icon: UserPlus,
    href: '/dashboard/users',
    description: 'Manage staff and admin users',
    adminOnly: true
  }
];

export const bottomMenuItems = [
  {
    id: 'help',
    title: 'Help & Support',
    icon: MessageSquare,
    href: '/help',
    description: 'Get help and support'
  }
];

// Service types for the bike service center
export const serviceTypes = [
  {
    id: 'general_service',
    name: 'General Service',
    description: 'Regular maintenance and inspection',
    estimatedTime: '2-3 hours',
    basePrice: 500
  },
  {
    id: 'engine_repair',
    name: 'Engine Repair',
    description: 'Engine diagnostics and repair',
    estimatedTime: '4-6 hours',
    basePrice: 1500
  },
  {
    id: 'oil_change',
    name: 'Oil Change',
    description: 'Engine oil and filter replacement',
    estimatedTime: '1 hour',
    basePrice: 300
  },
  {
    id: 'brake_service',
    name: 'Brake Service',
    description: 'Brake inspection and repair',
    estimatedTime: '2-3 hours',
    basePrice: 800
  },
  {
    id: 'tire_service',
    name: 'Tire Service',
    description: 'Tire replacement and balancing',
    estimatedTime: '1-2 hours',
    basePrice: 600
  },
  {
    id: 'electrical_repair',
    name: 'Electrical Repair',
    description: 'Electrical system diagnostics and repair',
    estimatedTime: '3-4 hours',
    basePrice: 1200
  },
  {
    id: 'battery_service',
    name: 'Battery Service',
    description: 'Battery testing and replacement',
    estimatedTime: '1 hour',
    basePrice: 400
  },
  {
    id: 'chassis_service',
    name: 'Chassis Service',
    description: 'Chassis inspection and repair',
    estimatedTime: '2-4 hours',
    basePrice: 1000
  },
  {
    id: 'custom_repair',
    name: 'Custom Repair',
    description: 'Specialized repair work',
    estimatedTime: 'Varies',
    basePrice: 1000
  }
];

// Booking status options
export const bookingStatuses = [
  {
    id: 'PENDING',
    name: 'Pending',
    color: 'amber',
    description: 'Booking confirmed, awaiting service'
  },
  {
    id: 'IN_PROGRESS',
    name: 'In Progress',
    color: 'blue',
    description: 'Service work in progress'
  },
  {
    id: 'COMPLETED',
    name: 'Completed',
    color: 'green',
    description: 'Service completed successfully'
  },
  {
    id: 'DELIVERED',
    name: 'Delivered',
    color: 'emerald',
    description: 'Vehicle delivered to customer'
  },
  {
    id: 'CANCELLED',
    name: 'Cancelled',
    color: 'red',
    description: 'Booking cancelled'
  }
];

// User roles
export const userRoles = [
  {
    id: 'ADMIN',
    name: 'Admin',
    description: 'Full system access and user management',
    permissions: ['all']
  },
  {
    id: 'STAFF',
    name: 'Staff',
    description: 'Limited access for daily operations',
    permissions: ['bookings', 'customers', 'vehicles', 'services', 'inventory', 'payments']
  }
]; 