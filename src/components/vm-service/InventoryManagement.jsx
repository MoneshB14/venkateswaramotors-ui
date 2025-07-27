import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Hash
} from 'lucide-react';
import { useGlobal } from '../../contexts/GlobalContext';
import { inventoryAPI } from '../../services/api';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockStatus: '',
    supplier: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { confirmDelete } = useGlobal();

  // Inventory item form state
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    category: '',
    partNumber: '',
    brand: '',
    supplier: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    minStockLevel: '',
    location: '',
    notes: ''
  });

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await inventoryAPI.getInventory(filters);

      if (response.success) {
        setInventory(response.inventory || []);
      } else {
        setError(response.message || 'Failed to fetch inventory');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory. Please try again.');
      toast.error('Error', 'Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load inventory on component mount and when filters change
  useEffect(() => {
    fetchInventory();
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
      category: '',
      stockStatus: '',
      supplier: ''
    });
  };

  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    confirmDelete({
      itemName: 'inventory item',
      onConfirm: async () => {
        try {
          await inventoryAPI.deleteInventoryItem(itemId);
          fetchInventory(); // Refresh the list
        } catch (error) {
          console.error('Error deleting inventory item:', error);
        }
      }
    });
  };

  // Handle stock quantity update
  const handleStockUpdate = async (itemId, newQuantity) => {
    try {
      const response = await inventoryAPI.updateStockQuantity(itemId, newQuantity);
      
      if (response.success) {
        toast.success('Stock Updated', 'Stock quantity has been updated successfully.');
        fetchInventory(); // Refresh the list
      } else {
        toast.error('Error', response.message || 'Failed to update stock.');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Error', 'Failed to update stock. Please try again.');
    }
  };

  // Handle item save (create or update)
  const handleItemSave = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!itemForm.name.trim() || !itemForm.quantity || !itemForm.costPrice) {
      toast.error('Validation Error', 'Name, quantity, and cost price are required.');
      return;
    }

    try {
      let response;
      if (editingItem) {
        // Update existing item
        response = await inventoryAPI.updateInventoryItem(editingItem.id, itemForm);
      } else {
        // Create new item
        response = await inventoryAPI.createInventoryItem(itemForm);
      }

      if (response.success) {
        toast.success(
          editingItem ? 'Item Updated' : 'Item Created',
          editingItem ? 'Inventory item has been updated successfully.' : 'New inventory item has been created successfully.'
        );
        setShowItemForm(false);
        setEditingItem(null);
        setItemForm({
          name: '',
          description: '',
          category: '',
          partNumber: '',
          brand: '',
          supplier: '',
          costPrice: '',
          sellingPrice: '',
          quantity: '',
          minStockLevel: '',
          location: '',
          notes: ''
        });
        fetchInventory(); // Refresh the list
      } else {
        toast.error('Error', response.message || 'Failed to save item.');
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast.error('Error', 'Failed to save item. Please try again.');
    }
  };

  // Handle item form cancel
  const handleItemCancel = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      category: '',
      partNumber: '',
      brand: '',
      supplier: '',
      costPrice: '',
      sellingPrice: '',
      quantity: '',
      minStockLevel: '',
      location: '',
      notes: ''
    });
  };

  // Open item form for editing
  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      partNumber: item.partNumber || '',
      brand: item.brand || '',
      supplier: item.supplier || '',
      costPrice: item.costPrice || '',
      sellingPrice: item.sellingPrice || '',
      quantity: item.quantity || '',
      minStockLevel: item.minStockLevel || '',
      location: item.location || '',
      notes: item.notes || ''
    });
    setShowItemForm(true);
  };

  // Open item details modal
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setItemForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get stock status
  const getStockStatus = (quantity, minStockLevel) => {
    const qty = parseInt(quantity) || 0;
    const min = parseInt(minStockLevel) || 0;
    
    if (qty === 0) return { status: 'out', color: 'red', text: 'Out of Stock' };
    if (qty <= min) return { status: 'low', color: 'amber', text: 'Low Stock' };
    return { status: 'good', color: 'green', text: 'In Stock' };
  };

  // Get stock status badge
  const getStockStatusBadge = (item) => {
    const status = getStockStatus(item.quantity, item.minStockLevel);
    
    const statusConfig = {
      out: {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: AlertTriangle,
        dotColor: 'bg-red-500'
      },
      low: {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle,
        dotColor: 'bg-amber-500'
      },
      good: {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
        dotColor: 'bg-emerald-500'
      }
    };

    const config = statusConfig[status.status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></div>
        <Icon className="w-3 h-3" />
        {status.text}
      </span>
    );
  };

  // Calculate total inventory value
  const calculateTotalValue = () => {
    return inventory.reduce((total, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const costPrice = parseFloat(item.costPrice) || 0;
      return total + (quantity * costPrice);
    }, 0);
  };

  // Get low stock items count
  const getLowStockCount = () => {
    return inventory.filter(item => {
      const status = getStockStatus(item.quantity, item.minStockLevel);
      return status.status === 'low' || status.status === 'out';
    }).length;
  };

  if (showItemForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Inventory Item' : 'New Inventory Item'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {editingItem ? 'Update inventory item details' : 'Add a new item to inventory'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleItemCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleItemSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter item name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="engine_parts">Engine Parts</option>
                    <option value="brake_parts">Brake Parts</option>
                    <option value="electrical_parts">Electrical Parts</option>
                    <option value="tire_wheels">Tires & Wheels</option>
                    <option value="body_parts">Body Parts</option>
                    <option value="accessories">Accessories</option>
                    <option value="lubricants">Lubricants</option>
                    <option value="tools">Tools</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Part Number
                  </label>
                  <input
                    type="text"
                    value={itemForm.partNumber}
                    onChange={(e) => handleInputChange('partNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter part number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={itemForm.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Cost Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={itemForm.costPrice}
                    onChange={(e) => handleInputChange('costPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter cost price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={itemForm.sellingPrice}
                    onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter selling price"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    value={itemForm.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current stock"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    value={itemForm.minStockLevel}
                    onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter minimum stock level"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={itemForm.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={itemForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter storage location"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter item description"
                    rows="3"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={itemForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any additional notes"
                    rows="3"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleItemCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingItem ? 'Update Item' : 'Create Item'}
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
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">
            Manage spare parts, stock levels, and inventory tracking
          </p>
        </div>
        <Button
          onClick={() => setShowItemForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-amber-600">{getLowStockCount()}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{calculateTotalValue().toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Search inventory..."
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
              onClick={fetchInventory}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="engine_parts">Engine Parts</option>
                  <option value="brake_parts">Brake Parts</option>
                  <option value="electrical_parts">Electrical Parts</option>
                  <option value="tire_wheels">Tires & Wheels</option>
                  <option value="body_parts">Body Parts</option>
                  <option value="accessories">Accessories</option>
                  <option value="lubricants">Lubricants</option>
                  <option value="tools">Tools</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stock Status</label>
                <select
                  value={filters.stockStatus}
                  onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="out">Out of Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="good">In Stock</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Supplier</label>
                <input
                  type="text"
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Filter by supplier"
                />
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
            <p className="text-lg font-medium text-gray-900">Loading inventory...</p>
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
                <h3 className="text-lg font-medium text-red-900">Unable to load inventory</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={fetchInventory}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory List */}
      {!loading && !error && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  All Inventory Items ({inventory.length})
                </CardTitle>
                <CardDescription className="text-gray-600">
                  View and manage inventory items
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {inventory.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                <p className="text-gray-500 mb-4">
                  {Object.values(filters).some(f => f) 
                    ? 'Try adjusting your filters to see more results.' 
                    : 'Get started by adding your first inventory item.'}
                </p>
                {!Object.values(filters).some(f => f) && (
                  <Button
                    onClick={() => setShowItemForm(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pricing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.brand && `${item.brand} • `}{item.category}
                              </p>
                              {item.partNumber && (
                                <p className="text-xs text-gray-400">
                                  Part #: {item.partNumber}
                                </p>
                              )}
                              {item.location && (
                                <p className="text-xs text-gray-400">
                                  Location: {item.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <p className="text-gray-900 font-medium">
                              {item.quantity} units
                            </p>
                            {item.minStockLevel && (
                              <p className="text-gray-500">
                                Min: {item.minStockLevel}
                              </p>
                            )}
                            {item.supplier && (
                              <p className="text-gray-500 text-xs">
                                Supplier: {item.supplier}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <p className="text-gray-900">
                              Cost: ₹{item.costPrice}
                            </p>
                            {item.sellingPrice && (
                              <p className="text-gray-500">
                                Sell: ₹{item.sellingPrice}
                              </p>
                            )}
                            <p className="text-gray-500 text-xs">
                              Value: ₹{(parseInt(item.quantity) * parseFloat(item.costPrice)).toFixed(2)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStockStatusBadge(item)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewItem(item)}
                              className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="h-8 w-8 p-0 border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
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
                  <p className="text-gray-900">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900">{selectedItem.category}</p>
                </div>
                {selectedItem.brand && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Brand</label>
                    <p className="text-gray-900">{selectedItem.brand}</p>
                  </div>
                )}
                {selectedItem.partNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Part Number</label>
                    <p className="text-gray-900">{selectedItem.partNumber}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Stock</label>
                  <p className="text-gray-900">{selectedItem.quantity} units</p>
                </div>
                {selectedItem.minStockLevel && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Minimum Stock Level</label>
                    <p className="text-gray-900">{selectedItem.minStockLevel} units</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Cost Price</label>
                  <p className="text-gray-900">₹{selectedItem.costPrice}</p>
                </div>
                {selectedItem.sellingPrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Selling Price</label>
                    <p className="text-gray-900">₹{selectedItem.sellingPrice}</p>
                  </div>
                )}
                {selectedItem.supplier && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Supplier</label>
                    <p className="text-gray-900">{selectedItem.supplier}</p>
                  </div>
                )}
                {selectedItem.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Storage Location</label>
                    <p className="text-gray-900">{selectedItem.location}</p>
                  </div>
                )}
                {selectedItem.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{selectedItem.description}</p>
                  </div>
                )}
                {selectedItem.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Stock Management</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Update Stock:</label>
                    <input
                      type="number"
                      min="0"
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="New quantity"
                    />
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement; 