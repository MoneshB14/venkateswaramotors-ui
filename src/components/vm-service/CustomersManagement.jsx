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
  Car,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useGlobal } from '../../contexts/GlobalContext';
import { customersAPI, vehiclesAPI, bookingsAPI } from '../../services/apiWithToast';

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    hasVehicles: '',
    hasBookings: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { confirmDelete } = useGlobal();

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    notes: ''
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customersAPI.getCustomers(filters);

      if (response.success) {
        setCustomers(response.customers || []);
      } else {
        setError(response.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
      toast.error('Error', 'Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load customers on component mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      hasVehicles: '',
      hasBookings: ''
    });
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId) => {
    confirmDelete({
      itemName: 'customer',
      onConfirm: async () => {
        try {
          await customersAPI.deleteCustomer(customerId);
          fetchCustomers(); // Refresh the list
        } catch (error) {
          console.error('Error deleting customer:', error);
        }
      }
    });
  };

  // Handle customer save (create or update)
  const handleCustomerSave = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      toast.error('Validation Error', 'Name and phone number are required.');
      return;
    }

    try {
      let response;
      if (editingCustomer) {
        // Update existing customer
        response = await customersAPI.updateCustomer(editingCustomer.id, customerForm);
      } else {
        // Create new customer
        response = await customersAPI.createCustomer(customerForm);
      }

      if (response.success) {
        toast.success(
          editingCustomer ? 'Customer Updated' : 'Customer Created',
          editingCustomer ? 'Customer has been updated successfully.' : 'New customer has been created successfully.'
        );
        setShowCustomerForm(false);
        setEditingCustomer(null);
        setCustomerForm({
          name: '',
          phone: '',
          email: '',
          address: '',
          emergencyContact: '',
          notes: ''
        });
        fetchCustomers(); // Refresh the list
      } else {
        toast.error('Error', response.message || 'Failed to save customer.');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Error', 'Failed to save customer. Please try again.');
    }
  };

  // Handle customer form cancel
  const handleCustomerCancel = () => {
    setShowCustomerForm(false);
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      notes: ''
    });
  };

  // Open customer form for editing
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      emergencyContact: customer.emergencyContact || '',
      notes: customer.notes || ''
    });
    setShowCustomerForm(true);
  };

  // Open customer details modal
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setCustomerForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get customer statistics
  const getCustomerStats = (customer) => {
    return {
      totalBookings: customer.totalBookings || 0,
      totalVehicles: customer.totalVehicles || 0,
      lastVisit: customer.lastVisit || 'Never',
      totalSpent: customer.totalSpent || 0
    };
  };

  if (showCustomerForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {editingCustomer ? 'Edit Customer' : 'New Customer'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {editingCustomer ? 'Update customer information' : 'Add a new customer to the system'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCustomerCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleCustomerSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={customerForm.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter emergency contact number"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={customerForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer's address"
                    rows="3"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={customerForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any additional notes about the customer"
                    rows="3"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCustomerCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Customers Management</h2>
          <p className="text-gray-600 mt-1">
            Manage customer information and service history
          </p>
        </div>
        <Button
          onClick={() => setShowCustomerForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCustomers}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        {/* Advanced Filters */}
        {showFilters && (
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Has Vehicles</label>
                <select
                  value={filters.hasVehicles}
                  onChange={(e) => handleFilterChange('hasVehicles', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Customers</option>
                  <option value="true">With Vehicles</option>
                  <option value="false">Without Vehicles</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Has Bookings</label>
                <select
                  value={filters.hasBookings}
                  onChange={(e) => handleFilterChange('hasBookings', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Customers</option>
                  <option value="true">With Bookings</option>
                  <option value="false">Without Bookings</option>
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading customers...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-900">Unable to load customers</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={fetchCustomers}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers List */}
      {!loading && !error && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  All Customers ({customers.length})
                </CardTitle>
                <CardDescription className="text-gray-600">
                  View and manage customer information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {customers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500 mb-4">
                  {Object.values(filters).some(f => f) 
                    ? 'Try adjusting your filters to see more results.' 
                    : 'Get started by adding your first customer.'}
                </p>
                {!Object.values(filters).some(f => f) && (
                  <Button
                    onClick={() => setShowCustomerForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Customer
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statistics
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => {
                      const stats = getCustomerStats(customer);
                      return (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {customer.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Customer ID: {customer.id}
                                </p>
                                {customer.address && (
                                  <p className="text-xs text-gray-400 truncate max-w-xs">
                                    <MapPin className="h-3 w-3 inline mr-1" />
                                    {customer.address}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm space-y-1">
                              <p className="text-gray-900 flex items-center">
                                <Phone className="h-3 w-3 mr-2" />
                                {customer.phone}
                              </p>
                              {customer.email && (
                                <p className="text-gray-500 flex items-center">
                                  <Mail className="h-3 w-3 mr-2" />
                                  {customer.email}
                                </p>
                              )}
                              {customer.emergencyContact && (
                                <p className="text-gray-500 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-2" />
                                  {customer.emergencyContact}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm space-y-1">
                              <p className="text-gray-900">
                                <Car className="h-3 w-3 inline mr-1" />
                                {stats.totalVehicles} vehicles
                              </p>
                              <p className="text-gray-500">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {stats.totalBookings} bookings
                              </p>
                              <p className="text-gray-500">
                                <span className="font-medium">₹{stats.totalSpent}</span> total spent
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">
                                {stats.lastVisit}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCustomer(customer)}
                                className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCustomer(customer)}
                                className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="h-8 w-8 p-0 border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedCustomer.phone}</p>
                </div>
                {selectedCustomer.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedCustomer.email}</p>
                  </div>
                )}
                {selectedCustomer.emergencyContact && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="text-gray-900">{selectedCustomer.emergencyContact}</p>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-gray-900">{selectedCustomer.address}</p>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Service History</h4>
                <p className="text-gray-500 text-sm">Service history will be displayed here.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement; 