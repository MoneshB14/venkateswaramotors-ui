import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Plus,
  Search,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  X,
  Shield,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock,
  Users,
  UserCheck,
  UserX,
  Crown
} from 'lucide-react';
import { useGlobal } from '../../hooks/useGlobal';
import { userManagementAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
    role: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    enabledUsers: 0,
    lockedUsers: 0
  });
  const { confirmDelete, showSuccess, showError } = useGlobal();
  const { canDelete } = useAuth();

  // User form state
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    role: 'USER'
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementAPI.getUsers(filters);

      if (response.users) {
        setUsers(response.users);
        setPagination({
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          currentPage: response.currentPage || 0,
          pageSize: response.pageSize || 10
        });
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      showError('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await userManagementAPI.getStats();
      if (response) {
        setStats(response);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Load users and stats on component mount and when filters change
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 0 // Reset to first page when other filters change
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      page: 0,
      size: 10,
      role: '',
      search: ''
    });
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    confirmDelete({
      itemName: 'user',
      onConfirm: async () => {
        try {
          await userManagementAPI.deleteUser(userId);
          showSuccess('Success', 'User deleted successfully');
          fetchUsers();
          fetchStats();
        } catch (err) {
          console.error('Error deleting user:', err);
          const errorMessage = err.response?.data?.message || 'Failed to delete user. Please try again.';
          showError('Error', errorMessage);
        }
      }
    });
  };

  // Handle user form submission
  const handleUserSave = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (editingUser) {
        response = await userManagementAPI.updateUser(editingUser.id, userForm);
        showSuccess('Success', 'User updated successfully');
      } else {
        response = await userManagementAPI.createUser(userForm);
        showSuccess('Success', 'User created successfully');
      }
      
      if (response) {
        setShowUserForm(false);
        setEditingUser(null);
        resetUserForm();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save user. Please try again.';
      showError('Error', errorMessage);
    }
  };

  // Handle user form cancellation
  const handleUserCancel = () => {
    setShowUserForm(false);
    setEditingUser(null);
    resetUserForm();
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      role: user.role || 'USER'
    });
    setShowUserForm(true);
  };

  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset user form
  const resetUserForm = () => {
    setUserForm({
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      role: 'USER'
    });
  };

  // Handle user status toggle
  const handleToggleStatus = async (userId, enabled) => {
    try {
      const response = await userManagementAPI.toggleUserStatus(userId, enabled);
      if (response) {
        showSuccess('Success', `User ${enabled ? 'enabled' : 'disabled'} successfully`);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      showError('Error', 'Failed to update user status. Please try again.');
    }
  };

  // Handle user lock toggle
  const handleToggleLock = async (userId, locked) => {
    try {
      const response = await userManagementAPI.toggleUserLock(userId, locked);
      if (response) {
        showSuccess('Success', `User ${locked ? 'locked' : 'unlocked'} successfully`);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error('Error toggling user lock:', err);
      showError('Error', 'Failed to update user lock status. Please try again.');
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, role) => {
    try {
      const response = await userManagementAPI.changeUserRole(userId, role);
      if (response) {
        showSuccess('Success', `User role changed to ${role} successfully`);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error('Error changing user role:', err);
      showError('Error', 'Failed to change user role. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (user) => {
    if (!user.enabled) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ShieldX className="w-3 h-3 mr-1" />
          Disabled
        </span>
      );
    }
    
    if (!user.accountNonLocked) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <ShieldCheck className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  // Get role badge
  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <User className="w-3 h-3 mr-1" />
        User
      </span>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowUserForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{stats.adminUsers}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular Users</p>
                <p className="text-2xl font-bold text-blue-600">{stats.regularUsers}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enabled</p>
                <p className="text-2xl font-bold text-green-600">{stats.enabledUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locked</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lockedUsers}</p>
              </div>
              <UserX className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              {Object.values(filters).some(value => value !== '' && value !== 0) && (
                <Button variant="ghost" onClick={clearFilters} className="text-red-600 hover:text-red-700 text-sm">
                  Clear Filters
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={fetchUsers} className="flex items-center gap-2 w-full sm:w-auto">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange('size', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Showing {users.length} of {pagination.totalElements} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="w-6 h-6 mr-2" />
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user)}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                          <div className="flex items-center truncate">
                            <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1 flex-shrink-0" />
                            {user.phoneNumber}
                          </div>
                          {user.city && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              {user.city}, {user.state}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          Created: {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="flex items-center gap-1 flex-1 sm:flex-initial"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="flex items-center gap-1 flex-1 sm:flex-initial"
                      >
                        <Edit className="w-3 h-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id, !user.enabled)}
                        className={`flex items-center gap-1 flex-1 sm:flex-initial ${
                          user.enabled ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {user.enabled ? <ShieldX className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        <span className="hidden sm:inline">{user.enabled ? 'Disable' : 'Enable'}</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleLock(user.id, user.accountNonLocked)}
                        className={`flex items-center gap-1 flex-1 sm:flex-initial ${
                          user.accountNonLocked ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {user.accountNonLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span className="hidden sm:inline">{user.accountNonLocked ? 'Lock' : 'Unlock'}</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleChange(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                        className="flex items-center gap-1 flex-1 sm:flex-initial"
                      >
                        <Crown className="w-3 h-3" />
                        <span className="hidden sm:inline">{user.role === 'ADMIN' ? 'Make User' : 'Make Admin'}</span>
                      </Button>
                      
                      {canDelete() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 flex-1 sm:flex-initial"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {pagination.currentPage * pagination.pageSize + 1} to{' '}
                {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
                {pagination.totalElements} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, pagination.totalPages) }, (_, i) => {
                    const maxPages = window.innerWidth < 640 ? 3 : 5;
                    const pageNum = Math.max(0, Math.min(pagination.totalPages - maxPages, pagination.currentPage - Math.floor(maxPages / 2))) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('page', pageNum)}
                        className="w-8 h-8 p-0 text-xs sm:text-sm"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages - 1}
                  className="text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <Button variant="ghost" onClick={handleUserCancel} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleUserSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={userForm.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    required
                    value={userForm.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={userForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={userForm.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={userForm.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    pattern="[0-9]{6}"
                    value={userForm.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleUserCancel} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">User Details</h2>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser)}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-sm text-gray-900">{selectedUser.phoneNumber}</p>
                </div>
                
                {selectedUser.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-sm text-gray-900">{selectedUser.address}</p>
                  </div>
                )}
                
                {selectedUser.city && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <p className="text-sm text-gray-900">{selectedUser.city}</p>
                  </div>
                )}
                
                {selectedUser.state && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <p className="text-sm text-gray-900">{selectedUser.state}</p>
                  </div>
                )}
                
                {selectedUser.pincode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <p className="text-sm text-gray-900">{selectedUser.pincode}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="w-full sm:w-auto">
                  Close
                </Button>
                <Button onClick={() => {
                  setShowDetailsModal(false);
                  handleEditUser(selectedUser);
                }} className="w-full sm:w-auto">
                  Edit User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 