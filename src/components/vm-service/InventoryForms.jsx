import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { X, Save, Package, Building2, ArrowUpDown } from 'lucide-react';

// Inventory Item Form Component
export const InventoryItemForm = ({
  itemForm,
  setItemForm,
  editingItem,
  onSubmit,
  onCancel,
  loading = false,
  isOpen = false
}) => {
  const categories = [
    'ENGINE_PARTS', 'BRAKE_SYSTEM', 'ELECTRICAL', 'SUSPENSION', 'TRANSMISSION',
    'COOLING_SYSTEM', 'FUEL_SYSTEM', 'EXHAUST_SYSTEM', 'BODY_PARTS', 'INTERIOR_PARTS',
    'TOOLS', 'CONSUMABLES', 'LUBRICANTS', 'FILTERS', 'TIRES', 'BATTERIES', 'ACCESSORIES', 'OTHER'
  ];

  const units = ['PCS', 'KG', 'LITERS', 'METERS', 'BOXES', 'PAIRS', 'SETS'];

  const handleInputChange = (field, value) => {
    setItemForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
              onClick={onCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-orange-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Item Code *
                  </label>
                  <input
                    type="text"
                    value={itemForm.itemCode}
                    onChange={(e) => handleInputChange('itemCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ENG001"
                    required
                  />
                </div>

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
                    Category *
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
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
                    Model
                  </label>
                  <input
                    type="text"
                    value={itemForm.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter model"
                  />
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
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={itemForm.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter manufacturer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Unit *
                  </label>
                  <select
                    value={itemForm.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                                         {units.map(unit => (
                       <option key={unit} value={unit}>
                         {unit}
                       </option>
                     ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
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
            </div>

            <Separator />

            {/* Pricing Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={itemForm.mrp}
                    onChange={(e) => handleInputChange('mrp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter MRP"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Stock Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    value={itemForm.currentStock}
                    onChange={(e) => handleInputChange('currentStock', e.target.value)}
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
                    value={itemForm.minimumStock}
                    onChange={(e) => handleInputChange('minimumStock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter minimum stock level"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Maximum Stock Level
                  </label>
                  <input
                    type="number"
                    value={itemForm.maximumStock}
                    onChange={(e) => handleInputChange('maximumStock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter maximum stock level"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={itemForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Warehouse A"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Shelf Number
                  </label>
                  <input
                    type="text"
                    value={itemForm.shelfNumber}
                    onChange={(e) => handleInputChange('shelfNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., A1-B2"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Supplier Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={itemForm.supplierName}
                    onChange={(e) => handleInputChange('supplierName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Supplier Contact
                  </label>
                  <input
                    type="text"
                    value={itemForm.supplierContact}
                    onChange={(e) => handleInputChange('supplierContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter supplier contact"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Supplier Email
                  </label>
                  <input
                    type="email"
                    value={itemForm.supplierEmail}
                    onChange={(e) => handleInputChange('supplierEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter supplier email"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Warranty Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Warranty Period
                  </label>
                  <input
                    type="text"
                    value={itemForm.warrantyPeriod}
                    onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1 year"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Warranty Terms
                  </label>
                  <input
                    type="text"
                    value={itemForm.warrantyTerms}
                    onChange={(e) => handleInputChange('warrantyTerms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter warranty terms"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={itemForm.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter image URL"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={itemForm.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter barcode"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    QR Code
                  </label>
                  <input
                    type="text"
                    value={itemForm.qrCode}
                    onChange={(e) => handleInputChange('qrCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter QR code"
                  />
                </div>
              </div>

              <div className="mt-6">
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
                onClick={onCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

// Supplier Form Component
export const SupplierForm = ({
  supplierForm,
  setSupplierForm,
  editingSupplier,
  onSubmit,
  onCancel,
  loading = false,
  isOpen = false
}) => {
  const handleInputChange = (field, value) => {
    setSupplierForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {editingSupplier ? 'Update supplier information' : 'Add a new supplier'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Supplier Code *
                  </label>
                  <input
                    type="text"
                    value={supplierForm.supplierCode}
                    onChange={(e) => handleInputChange('supplierCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., SUP001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={supplierForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={supplierForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={supplierForm.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter alternate phone"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={supplierForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter complete address"
                    rows="3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={supplierForm.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={supplierForm.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter state"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={supplierForm.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter pincode"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    value={supplierForm.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={supplierForm.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={supplierForm.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter PAN number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={supplierForm.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Net 30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Credit Limit
                  </label>
                  <input
                    type="text"
                    value={supplierForm.creditLimit}
                    onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter credit limit"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <input
                    type="number"
                    value={supplierForm.rating}
                    onChange={(e) => handleInputChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter rating (1-5)"
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Specializations
                  </label>
                  <input
                    type="text"
                    value={supplierForm.specializations}
                    onChange={(e) => handleInputChange('specializations', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ENGINE_PARTS,FILTERS,LUBRICANTS"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Bank Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={supplierForm.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={supplierForm.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter account number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={supplierForm.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={supplierForm.notes}
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
                onClick={onCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (editingSupplier ? 'Update Supplier' : 'Create Supplier')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

// Stock Adjustment Form Component
export const StockAdjustmentForm = ({
  stockAdjustmentForm,
  setStockAdjustmentForm,
  selectedItem,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const adjustmentTypes = ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN', 'DAMAGE'];
  const referenceTypes = ['PURCHASE_ORDER', 'SALES_ORDER', 'RETURN', 'DAMAGE', 'ADJUSTMENT', 'TRANSFER'];

  const handleInputChange = (field, value) => {
    setStockAdjustmentForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2 text-blue-600" />
            Stock Adjustment - {selectedItem?.name}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                value={stockAdjustmentForm.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Adjustment Type *
              </label>
              <select
                value={stockAdjustmentForm.adjustmentType}
                onChange={(e) => handleInputChange('adjustmentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {adjustmentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reason *
              </label>
              <input
                type="text"
                value={stockAdjustmentForm.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter reason for adjustment"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reference Number
              </label>
              <input
                type="text"
                value={stockAdjustmentForm.referenceNumber}
                onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter reference number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reference Type
              </label>
              <select
                value={stockAdjustmentForm.referenceType}
                onChange={(e) => handleInputChange('referenceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {referenceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={stockAdjustmentForm.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter location"
              />
            </div>

            {(stockAdjustmentForm.adjustmentType === 'TRANSFER_IN' || stockAdjustmentForm.adjustmentType === 'TRANSFER_OUT') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Destination Location
                </label>
                <input
                  type="text"
                  value={stockAdjustmentForm.destinationLocation}
                  onChange={(e) => handleInputChange('destinationLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter destination location"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={stockAdjustmentForm.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any additional notes"
              rows="3"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {loading ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 