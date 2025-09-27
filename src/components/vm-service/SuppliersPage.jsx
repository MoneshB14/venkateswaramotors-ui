import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Plus,
  Building2,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin,
  Star,
  FileText
} from 'lucide-react';
import { useGlobal } from '../../hooks/useGlobal';
import { useAuth } from '../../hooks/useAuth';
import { suppliersAPI } from '../../services/api';
import { SupplierForm } from './InventoryForms';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const { confirmDelete, toast } = useGlobal();
  const { canDelete } = useAuth();

  // Form states
  const [supplierForm, setSupplierForm] = useState({
    supplierCode: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    gstNumber: '',
    panNumber: '',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    paymentTerms: '',
    creditLimit: '',
    rating: '',
    specializations: '',
    notes: ''
  });

  // Fetch data functions
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await suppliersAPI.getSuppliers();
      console.log('Suppliers API Response:', response);
      
      // Check for direct response format first (response.content), then fallback to wrapped format (response.success)
      if (response.content) {
        console.log('Setting suppliers with content:', response.content);
        setSuppliers(response.content || []);
      } else if (response.success) {
        console.log('Setting suppliers with wrapped response:', response.suppliers);
        setSuppliers(response.suppliers || []);
      } else {
        console.error('No suppliers found in response:', response);
        setError(response.message || 'Failed to fetch suppliers');
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle supplier save
  const handleSupplierSave = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingSupplier) {
        response = await suppliersAPI.updateSupplier(editingSupplier.id, supplierForm);
      } else {
        response = await suppliersAPI.createSupplier(supplierForm);
      }

      if (response.success || response.id) {
        toast.success(
          editingSupplier ? 'Supplier Updated' : 'Supplier Created',
          response.message || (editingSupplier ? 'Supplier updated successfully' : 'Supplier created successfully')
        );
        setShowSupplierForm(false);
        setEditingSupplier(null);
        resetSupplierForm();
        fetchSuppliers();
      } else {
        toast.error('Error', response.message || 'Failed to save supplier');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error('Error', 'Failed to save supplier. Please try again.');
    }
  };

  // Reset forms
  const resetSupplierForm = () => {
    setSupplierForm({
      supplierCode: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      gstNumber: '',
      panNumber: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      paymentTerms: '',
      creditLimit: '',
      rating: '',
      specializations: '',
      notes: ''
    });
  };

  // Handle supplier deletion
  const handleDeleteSupplier = async (supplierId) => {
    confirmDelete({
      itemName: 'supplier',
      onConfirm: async () => {
        try {
          const response = await suppliersAPI.deleteSupplier(supplierId);
          if (response.success || response.message) {
            fetchSuppliers();
            toast.success('Supplier Deleted', 'Supplier has been deleted successfully.');
          } else {
            toast.error('Error', response.message || 'Failed to delete supplier');
          }
        } catch (error) {
          console.error('Error deleting supplier:', error);
          toast.error('Error', 'Failed to delete supplier. Please try again.');
        }
      }
    });
  };

  // Open forms for editing
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      supplierCode: supplier.supplierCode || '',
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      alternatePhone: supplier.alternatePhone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      pincode: supplier.pincode || '',
      country: supplier.country || 'India',
      gstNumber: supplier.gstNumber || '',
      panNumber: supplier.panNumber || '',
      bankName: supplier.bankName || '',
      bankAccountNumber: supplier.bankAccountNumber || '',
      ifscCode: supplier.ifscCode || '',
      paymentTerms: supplier.paymentTerms || '',
      creditLimit: supplier.creditLimit || '',
      rating: supplier.rating || '',
      specializations: supplier.specializations || '',
      notes: supplier.notes || ''
    });
    setShowSupplierForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Suppliers</h2>
          <p className="text-gray-600 mt-1">
            Manage supplier information and relationships
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
            onClick={() => setShowSupplierForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-900">Loading suppliers...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-900">Unable to load suppliers</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={fetchSuppliers}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suppliers List */}
      {!loading && !error && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  All Suppliers ({suppliers.length})
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage supplier information and relationships
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {suppliers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first supplier.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {suppliers.map((supplier) => (
                  <Card key={supplier.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSupplier(supplier)}
                            className="h-8 w-8 p-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {canDelete() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="h-8 w-8 p-0 border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                          <p className="text-sm text-gray-500">{supplier.supplierCode}</p>
                        </div>

                        {supplier.contactPerson && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {supplier.contactPerson}
                          </div>
                        )}

                        {supplier.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {supplier.email}
                          </div>
                        )}

                        {supplier.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {supplier.phone}
                          </div>
                        )}

                        {supplier.city && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {supplier.city}, {supplier.state}
                          </div>
                        )}

                        {supplier.rating && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="h-4 w-4 mr-2 text-yellow-500" />
                            {supplier.rating}/5
                          </div>
                        )}

                        {supplier.specializations && (
                          <div className="flex flex-wrap gap-1">
                            {supplier.specializations.split(',').map((spec, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {spec.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supplier Form Modal */}
      <SupplierForm
        supplierForm={supplierForm}
        setSupplierForm={setSupplierForm}
        editingSupplier={editingSupplier}
        onSubmit={handleSupplierSave}
        onCancel={() => {
          setShowSupplierForm(false);
          setEditingSupplier(null);
          resetSupplierForm();
        }}
        loading={loading}
        isOpen={showSupplierForm}
      />
    </div>
  );
};

export default SuppliersPage; 