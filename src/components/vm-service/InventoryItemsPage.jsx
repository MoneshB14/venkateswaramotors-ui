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
  DollarSign,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { useGlobal } from '../../contexts/GlobalContext';
import { useAuth } from '../../hooks/useAuth';
import { inventoryAPI } from '../../services/api';
import { InventoryItemForm, StockAdjustmentForm } from './InventoryForms';

const InventoryItemsPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    supplier: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStockAdjustmentModal, setShowStockAdjustmentModal] = useState(false);
  const { confirmDelete, toast } = useGlobal();
  const { canDelete } = useAuth();

  // Form states
  const [itemForm, setItemForm] = useState({
    itemCode: '',
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    partNumber: '',
    manufacturer: '',
    costPrice: '',
    sellingPrice: '',
    mrp: '',
    currentStock: '',
    minimumStock: '',
    maximumStock: '',
    unit: 'PCS',
    location: '',
    shelfNumber: '',
    supplierName: '',
    supplierContact: '',
    supplierEmail: '',
    warrantyPeriod: '',
    warrantyTerms: '',
    imageUrl: '',
    barcode: '',
    qrCode: '',
    notes: ''
  });

  const [stockAdjustmentForm, setStockAdjustmentForm] = useState({
    quantity: '',
    adjustmentType: 'IN',
    reason: '',
    referenceNumber: '',
    referenceType: 'PURCHASE_ORDER',
    notes: '',
    location: '',
    destinationLocation: ''
  });

  // Categories and statuses
  const categories = [
    'ENGINE_PARTS', 'BRAKE_SYSTEM', 'ELECTRICAL', 'SUSPENSION', 'TRANSMISSION',
    'COOLING_SYSTEM', 'FUEL_SYSTEM', 'EXHAUST_SYSTEM', 'BODY_PARTS', 'INTERIOR_PARTS',
    'TOOLS', 'CONSUMABLES', 'LUBRICANTS', 'FILTERS', 'TIRES', 'BATTERIES', 'ACCESSORIES', 'OTHER'
  ];

  const statuses = ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED', 'ON_ORDER'];
  const adjustmentTypes = ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN', 'DAMAGE'];
  const referenceTypes = ['PURCHASE_ORDER', 'SALES_ORDER', 'RETURN', 'DAMAGE', 'ADJUSTMENT', 'TRANSFER'];

  // Fetch data functions
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...filters
      };
      const response = await inventoryAPI.getInventoryItems(params);
      console.log('Inventory API Response:', response);
      
      // Check for direct response format first (response.items), then fallback to wrapped format (response.success)
      if (response.items) {
        console.log('Setting inventory with items:', response.items);
        setInventory(response.items || []);
        setPagination({
          page: response.currentPage || 0,
          size: response.pageSize || 10,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0
        });
      } else if (response.success) {
        console.log('Setting inventory with wrapped response:', response.items);
        setInventory(response.items || []);
        setPagination({
          page: response.currentPage || 0,
          size: response.pageSize || 10,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0
        });
      } else {
        console.error('No items found in response:', response);
        setError(response.message || 'Failed to fetch inventory');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await inventoryAPI.getInventoryStats();
      // Check for direct response format first (response.data), then fallback to wrapped format (response.success)
      if (response.data) {
        setStats(response.data || {});
      } else if (response.success) {
        setStats(response.data || {});
      } else {
        // If stats API is not available, calculate from inventory data
        const totalItems = inventory.length;
        const lowStockItems = inventory.filter(item => item.lowStock).length;
        const outOfStockItems = inventory.filter(item => item.outOfStock).length;
        const totalValue = inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);

        setStats({
          totalItems,
          lowStockItems,
          outOfStockItems,
          totalValue
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Fallback calculation
      const totalItems = inventory.length;
      const lowStockItems = inventory.filter(item => item.lowStock).length;
      const outOfStockItems = inventory.filter(item => item.outOfStock).length;
      const totalValue = inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);

      setStats({
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchInventory();
  }, [pagination.page, pagination.size, filters]);

  // Update stats when inventory changes
  useEffect(() => {
    if (inventory.length > 0) {
      console.log('Inventory changed, calculating stats:', inventory);
      const totalItems = inventory.length;
      const lowStockItems = inventory.filter(item => item.lowStock).length;
      const outOfStockItems = inventory.filter(item => item.outOfStock).length;
      const totalValue = inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);

      const newStats = {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue
      };
      console.log('Setting stats:', newStats);
      setStats(newStats);
    }
  }, [inventory]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      supplier: ''
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Handle item save
  const handleItemSave = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!itemForm.name.trim() || !itemForm.itemCode.trim() || !itemForm.category) {
      toast.error('Validation Error', 'Name, Item Code, and Category are required.');
      return;
    }

    if (!itemForm.costPrice || parseFloat(itemForm.costPrice) <= 0) {
      toast.error('Validation Error', 'Cost Price must be greater than 0.');
      return;
    }

    if (!itemForm.currentStock || parseInt(itemForm.currentStock) < 0) {
      toast.error('Validation Error', 'Current Stock must be 0 or greater.');
      return;
    }

    try {
      // Prepare data for API - convert empty strings to null for optional fields
      const apiData = {
        ...itemForm,
        partNumber: itemForm.partNumber || null,
        manufacturer: itemForm.manufacturer || null,
        mrp: itemForm.mrp ? parseFloat(itemForm.mrp) : null,
        shelfNumber: itemForm.shelfNumber || null,
        supplierName: itemForm.supplierName || null,
        supplierContact: itemForm.supplierContact || null,
        supplierEmail: itemForm.supplierEmail || null,
        warrantyPeriod: itemForm.warrantyPeriod || null,
        warrantyTerms: itemForm.warrantyTerms || null,
        imageUrl: itemForm.imageUrl || null,
        barcode: itemForm.barcode || null,
        qrCode: itemForm.qrCode || null,
        notes: itemForm.notes || null,
        costPrice: parseFloat(itemForm.costPrice),
        sellingPrice: itemForm.sellingPrice ? parseFloat(itemForm.sellingPrice) : null,
        currentStock: parseInt(itemForm.currentStock),
        minimumStock: itemForm.minimumStock ? parseInt(itemForm.minimumStock) : null,
        maximumStock: itemForm.maximumStock ? parseInt(itemForm.maximumStock) : null
      };

      let response;
      if (editingItem) {
        response = await inventoryAPI.updateInventoryItem(editingItem.id, apiData);
      } else {
        response = await inventoryAPI.createInventoryItem(apiData);
      }

      if (response.success || response.id) {
        toast.success(
          editingItem ? 'Item Updated' : 'Item Created',
          response.message || (editingItem ? 'Item updated successfully' : 'Item created successfully')
        );
        setShowItemForm(false);
        setEditingItem(null);
        resetItemForm();
        fetchInventory();
      } else {
        toast.error('Error', response.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Error', 'Failed to save item. Please try again.');
    }
  };

  // Handle stock adjustment
  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      const response = await inventoryAPI.adjustStock({
        itemId: selectedItem.id,
        ...stockAdjustmentForm
      });

      if (response.success || response.id) {
        toast.success('Stock Adjusted', response.message || 'Stock adjusted successfully');
        setShowStockAdjustmentModal(false);
        resetStockAdjustmentForm();
        fetchInventory();
      } else {
        toast.error('Error', response.message || 'Failed to adjust stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Error', 'Failed to adjust stock. Please try again.');
    }
  };

  // Reset forms
  const resetItemForm = () => {
    setItemForm({
      itemCode: '',
      name: '',
      description: '',
      category: '',
      brand: '',
      model: '',
      partNumber: '',
      manufacturer: '',
      costPrice: '',
      sellingPrice: '',
      mrp: '',
      currentStock: '',
      minimumStock: '',
      maximumStock: '',
      unit: 'PCS',
      location: '',
      shelfNumber: '',
      supplierName: '',
      supplierContact: '',
      supplierEmail: '',
      warrantyPeriod: '',
      warrantyTerms: '',
      imageUrl: '',
      barcode: '',
      qrCode: '',
      notes: ''
    });
  };

  const resetStockAdjustmentForm = () => {
    setStockAdjustmentForm({
      quantity: '',
      adjustmentType: 'IN',
      reason: '',
      referenceNumber: '',
      referenceType: 'PURCHASE_ORDER',
      notes: '',
      location: '',
      destinationLocation: ''
    });
  };

  // Get stock status
  const getStockStatus = (item) => {
    if (item.outOfStock) return { status: 'out', color: 'red', text: 'Out of Stock' };
    if (item.lowStock) return { status: 'low', color: 'amber', text: 'Low Stock' };
    return { status: 'good', color: 'green', text: 'In Stock' };
  };

  // Get stock status badge
  const getStockStatusBadge = (item) => {
    const status = getStockStatus(item);

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

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    confirmDelete({
      itemName: 'inventory item',
      onConfirm: async () => {
        try {
          const response = await inventoryAPI.deleteInventoryItem(itemId);
          if (response.success || response.message) {
            fetchInventory();
            toast.success('Item Deleted', 'Inventory item has been deleted successfully.');
          } else {
            toast.error('Error', response.message || 'Failed to delete item');
          }
        } catch (error) {
          console.error('Error deleting item:', error);
          toast.error('Error', 'Failed to delete item. Please try again.');
        }
      }
    });
  };

  // Open forms for editing
  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      itemCode: item.itemCode || '',
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      brand: item.brand || '',
      model: item.model || '',
      partNumber: item.partNumber || '',
      manufacturer: item.manufacturer || '',
      costPrice: item.costPrice || '',
      sellingPrice: item.sellingPrice || '',
      mrp: item.mrp || '',
      currentStock: item.currentStock || '',
      minimumStock: item.minimumStock || '',
      maximumStock: item.maximumStock || '',
      unit: item.unit || 'PCS',
      location: item.location || '',
      shelfNumber: item.shelfNumber || '',
      supplierName: item.supplierName || '',
      supplierContact: item.supplierContact || '',
      supplierEmail: item.supplierEmail || '',
      warrantyPeriod: item.warrantyPeriod || '',
      warrantyTerms: item.warrantyTerms || '',
      imageUrl: item.imageUrl || '',
      barcode: item.barcode || '',
      qrCode: item.qrCode || '',
      notes: item.notes || ''
    });
    setShowItemForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Inventory Items</h2>
          <p className="text-gray-600 mt-1">
            Manage spare parts and stock levels
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowItemForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems || 0}</p>
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
                <p className="text-2xl font-bold text-amber-600">{stats.lowStockItems || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{(stats.totalValue || 0).toLocaleString()}</p>
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
                  placeholder="Search items..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
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
                  All Inventory Items ({pagination.totalElements})
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
                                {item.brand && `${item.brand} • `}{item.category?.replace(/_/g, ' ')}
                              </p>
                              {item.itemCode && (
                                <p className="text-xs text-gray-400">
                                  Code: {item.itemCode}
                                </p>
                              )}
                              {item.partNumber && (
                                <p className="text-xs text-gray-400">
                                  Part #: {item.partNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <p className="text-gray-900 font-medium">
                              {item.currentStock} {item.unit?.toLowerCase()}
                            </p>
                            {item.minimumStock && (
                              <p className="text-gray-500">
                                Min: {item.minimumStock} {item.unit?.toLowerCase()}
                              </p>
                            )}
                            {item.maximumStock && (
                              <p className="text-gray-500">
                                Max: {item.maximumStock} {item.unit?.toLowerCase()}
                              </p>
                            )}
                            {item.location && (
                              <p className="text-gray-500 text-xs">
                                Location: {item.location}
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
                            {item.mrp && (
                              <p className="text-gray-500">
                                MRP: ₹{item.mrp}
                              </p>
                            )}
                            <p className="text-gray-500 text-xs">
                              Value: ₹{item.totalValue?.toFixed(2) || (item.currentStock * item.costPrice).toFixed(2)}
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
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDetailsModal(true);
                              }}
                              className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowStockAdjustmentModal(true);
                              }}
                              className="h-8 w-8 p-0 border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {canDelete() && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="h-8 w-8 p-0 border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {pagination.page * pagination.size + 1} to{' '}
            {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
            {pagination.totalElements} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {pagination.page + 1} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Forms and Modals */}
      <InventoryItemForm
        itemForm={itemForm}
        setItemForm={setItemForm}
        editingItem={editingItem}
        onSubmit={handleItemSave}
        onCancel={() => {
          setShowItemForm(false);
          setEditingItem(null);
          resetItemForm();
        }}
        loading={loading}
        isOpen={showItemForm}
      />

      {showStockAdjustmentModal && selectedItem && (
        <StockAdjustmentForm
          stockAdjustmentForm={stockAdjustmentForm}
          setStockAdjustmentForm={setStockAdjustmentForm}
          selectedItem={selectedItem}
          onSubmit={handleStockAdjustment}
          onCancel={() => {
            setShowStockAdjustmentModal(false);
            setSelectedItem(null);
            resetStockAdjustmentForm();
          }}
          loading={loading}
        />
      )}

      {/* Item Details Modal */}
      {selectedItem && showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedItem(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Item Code</label>
                  <p className="text-gray-900">{selectedItem.itemCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900">{selectedItem.category?.replace(/_/g, ' ')}</p>
                </div>
                {selectedItem.brand && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Brand</label>
                    <p className="text-gray-900">{selectedItem.brand}</p>
                  </div>
                )}
                {selectedItem.model && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Model</label>
                    <p className="text-gray-900">{selectedItem.model}</p>
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
                  <p className="text-gray-900">{selectedItem.currentStock} {selectedItem.unit?.toLowerCase()}</p>
                </div>
                {selectedItem.minimumStock && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Minimum Stock Level</label>
                    <p className="text-gray-900">{selectedItem.minimumStock} {selectedItem.unit?.toLowerCase()}</p>
                  </div>
                )}
                {selectedItem.maximumStock && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Maximum Stock Level</label>
                    <p className="text-gray-900">{selectedItem.maximumStock} {selectedItem.unit?.toLowerCase()}</p>
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
                {selectedItem.mrp && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">MRP</label>
                    <p className="text-gray-900">₹{selectedItem.mrp}</p>
                  </div>
                )}
                {selectedItem.supplierName && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Supplier</label>
                    <p className="text-gray-900">{selectedItem.supplierName}</p>
                  </div>
                )}
                {selectedItem.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Storage Location</label>
                    <p className="text-gray-900">{selectedItem.location}</p>
                  </div>
                )}
                {selectedItem.shelfNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Shelf Number</label>
                    <p className="text-gray-900">{selectedItem.shelfNumber}</p>
                  </div>
                )}
                {selectedItem.warrantyPeriod && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Warranty Period</label>
                    <p className="text-gray-900">{selectedItem.warrantyPeriod}</p>
                  </div>
                )}
                {selectedItem.barcode && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Barcode</label>
                    <p className="text-gray-900">{selectedItem.barcode}</p>
                  </div>
                )}
                {selectedItem.qrCode && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">QR Code</label>
                    <p className="text-gray-900">{selectedItem.qrCode}</p>
                  </div>
                )}
                {selectedItem.description && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{selectedItem.description}</p>
                  </div>
                )}
                {selectedItem.notes && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900">{selectedItem.notes}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedItem(null);
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedItem(null);
                    handleEditItem(selectedItem);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryItemsPage; 