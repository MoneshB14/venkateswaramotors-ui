import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
    FileText,
    Download,
    Printer,
    Calculator,
    Save,
    X,
    Plus,
    Trash2,
    Wrench,
    Droplets,
    Loader2
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { serviceTypes } from '../../config/menuConfig';

const BillGenerationModal = ({
    isOpen,
    booking,
    existingBill = null,
    mode = 'create', // 'create' or 'edit'
    loadingBill = false,
    onClose,
    onSave
}) => {
    // Debug: Log all props when component renders
    console.log('BillGenerationModal props:', {
        isOpen,
        booking,
        existingBill,
        mode,
        loadingBill
    });
    const [billData, setBillData] = useState({
        serviceCharges: 0,
        laborCharges: 0,
        additionalCharges: 0,
        discount: 0,
        taxRate: 18, // GST 18%
        notes: '',
        paymentStatus: 'PENDING',
        // Additional services
        waterWash: false,
        waterWashCharges: 200,
        // Parts and consumables
        parts: [],
        // Service details
        workDescription: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    // Add new part to the list
    const addPart = () => {
        setBillData(prev => ({
            ...prev,
            parts: [...prev.parts, {
                id: Date.now(),
                name: '',
                quantity: 1,
                unitPrice: 0,
                total: 0
            }]
        }));
    };

    // Remove part from the list
    const removePart = (partId) => {
        setBillData(prev => ({
            ...prev,
            parts: prev.parts.filter(part => part.id !== partId)
        }));
    };

    // Update part details
    const updatePart = (partId, field, value) => {
        setBillData(prev => ({
            ...prev,
            parts: prev.parts.map(part => {
                if (part.id === partId) {
                    const updatedPart = { ...part, [field]: value };
                    // Calculate total when quantity or unitPrice changes
                    if (field === 'quantity' || field === 'unitPrice') {
                        updatedPart.total = (updatedPart.quantity || 0) * (updatedPart.unitPrice || 0);
                    }
                    return updatedPart;
                }
                return part;
            })
        }));
    };

    // Calculate total parts cost
    const calculatePartsTotal = () => {
        return billData.parts.reduce((total, part) => total + (part.total || 0), 0);
    };

    const { toast } = useToast();

    // Debug: Log current billData state
    useEffect(() => {
        console.log('Current billData state:', billData);
    }, [billData]);

    // Initialize bill data when booking or existing bill changes
    useEffect(() => {
        console.log('BillModal useEffect triggered:', {
            booking: !!booking,
            mode,
            existingBill: !!existingBill,
            loadingBill,
            existingBillData: existingBill
        });

        if (booking) {
            if (mode === 'edit' && existingBill && !loadingBill) {
                // Load existing bill data for editing (only when not loading)
                console.log('Loading existing bill data into form:', existingBill);
                console.log('Existing bill serviceCharges:', existingBill.serviceCharges);
                console.log('Existing bill parts:', existingBill.parts);

                const newBillData = {
                    serviceCharges: existingBill.serviceCharges || 0,
                    laborCharges: existingBill.laborCharges || 0,
                    additionalCharges: existingBill.additionalCharges || 0,
                    discount: existingBill.discount || 0,
                    taxRate: existingBill.taxRate || 18,
                    notes: existingBill.notes || '',
                    paymentStatus: existingBill.paymentStatus || 'PENDING',
                    // Additional services
                    waterWash: existingBill.waterWash || false,
                    waterWashCharges: existingBill.waterWashCharges || 200,
                    // Parts and consumables
                    parts: existingBill.parts || [],
                    // Service details
                    workDescription: existingBill.workDescription || `${getServiceTypeName(booking.serviceType)} service performed`
                };

                console.log('Setting bill data to:', newBillData);
                setBillData(newBillData);
            } else if (mode === 'create') {
                console.log('Creating new bill data for booking:', booking.bookingId);
                // Initialize new bill data
                setBillData({
                    serviceCharges: parseFloat(booking.estimatedCost?.replace(/[^\d.]/g, '') || 0),
                    laborCharges: 0,
                    additionalCharges: 0,
                    discount: 0,
                    taxRate: 18,
                    notes: '',
                    paymentStatus: 'PENDING',
                    // Additional services
                    waterWash: false,
                    waterWashCharges: 200,
                    // Parts and consumables
                    parts: [],
                    // Service details
                    workDescription: `${getServiceTypeName(booking.serviceType)} service performed`
                });
            } else {
                console.log('Conditions not met for bill data initialization:', {
                    mode,
                    hasExistingBill: !!existingBill,
                    loadingBill
                });
            }
            // If loadingBill is true, don't update billData yet - wait for existingBill
        }
    }, [booking, existingBill, mode, loadingBill]);

    // Calculate bill totals
    const calculateBillTotals = () => {
        const { serviceCharges, laborCharges, additionalCharges, discount, taxRate, waterWash, waterWashCharges } = billData;
        const partsTotal = calculatePartsTotal();
        const waterWashTotal = waterWash ? waterWashCharges : 0;

        const subtotal = serviceCharges + partsTotal + laborCharges + additionalCharges + waterWashTotal;
        const discountAmount = (subtotal * discount) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * taxRate) / 100;
        const total = afterDiscount + taxAmount;

        return {
            subtotal,
            partsTotal,
            waterWashTotal,
            discountAmount,
            afterDiscount,
            taxAmount,
            total
        };
    };

    // Handle bill data changes
    const handleBillDataChange = (field, value) => {
        setBillData(prev => ({
            ...prev,
            [field]: field === 'notes' || field === 'paymentStatus' ? value : (value === '' ? 0 : parseFloat(value) || 0)
        }));
    };

    // Handle number input changes with proper formatting
    const handleNumberInputChange = (field, value) => {
        // Remove leading zeros and non-numeric characters except decimal point
        const cleanValue = value.replace(/^0+/, '') || '0';
        const numericValue = cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;

        setBillData(prev => ({
            ...prev,
            [field]: numericValue
        }));
    };

    // Handle bill save
    const handleBillSave = async () => {
        if (isSaving) return; // Prevent multiple submissions

        try {
            setIsSaving(true);
            const totals = calculateBillTotals();

            // Validate required fields
            if (!booking.bookingId) {
                toast.error('Validation Error', 'Booking ID is required to generate bill.');
                setIsSaving(false);
                return;
            }

            if (totals.total <= 0) {
                toast.error('Validation Error', 'Total amount must be greater than zero.');
                setIsSaving(false);
                return;
            }

            // Prepare bill data according to API specification
            const billPayload = {
                billNumber: `VM-${booking.bookingId}-${Date.now().toString().slice(-6)}`,
                bookingId: booking.bookingId,
                billDate: new Date().toISOString(),
                serviceCharges: billData.serviceCharges || 0,
                laborCharges: billData.laborCharges || 0,
                partsTotal: totals.partsTotal || 0,
                waterWash: billData.waterWash || false,
                waterWashCharges: billData.waterWashCharges || 0,
                waterWashTotal: totals.waterWashTotal || 0,
                additionalCharges: billData.additionalCharges || 0,
                subtotal: totals.subtotal,
                discount: billData.discount || 0,
                discountAmount: totals.discountAmount || 0,
                afterDiscount: totals.afterDiscount,
                taxRate: billData.taxRate || 18,
                taxAmount: totals.taxAmount,
                total: totals.total,
                paymentStatus: billData.paymentStatus || 'PENDING',
                workDescription: billData.workDescription || '',
                notes: billData.notes || '',
                parts: billData.parts || []
            };

            console.log('Sending bill data to parent handler:', billPayload);

            // Let parent handle the API call to avoid duplicate calls
            await onSave(billPayload);
            onClose();
        } catch (error) {
            console.error('Error preparing bill data:', error);
            toast.error('Error', error.message || 'Failed to save bill. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle bill print
    const handleBillPrint = () => {
        // Set document title for print
        const originalTitle = document.title;
        document.title = `Bill-${booking.bookingId}-${booking.customerName}`;

        // Print and restore title
        window.print();
        document.title = originalTitle;
    };

    // Get service type name
    const getServiceTypeName = (serviceTypeId) => {
        const serviceType = serviceTypes.find(service => service.id === serviceTypeId);
        return serviceType ? serviceType.name : serviceTypeId;
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (timeString) => {
        return timeString; // Already in HH:mm AM/PM format
    };

    if (!isOpen || !booking) return null;

    return (
        <>
            <style jsx>{`
        @media print {
          .fixed {
            position: static !important;
          }
          .bg-black {
            background: transparent !important;
          }
          .max-w-3xl {
            max-width: none !important;
          }
          .rounded-lg {
            border-radius: 0 !important;
          }
          .shadow-xl {
            box-shadow: none !important;
          }
        }
      `}</style>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto print:shadow-none print:max-h-none print:overflow-visible print:max-w-none print:w-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 print:hidden">
                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === 'edit'
                                    ? 'bg-blue-100'
                                    : 'bg-green-100'
                                }`}>
                                <FileText className={`h-4 w-4 ${mode === 'edit'
                                        ? 'text-blue-600'
                                        : 'text-green-600'
                                    }`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {mode === 'edit' ? 'Edit Bill' : 'Generate Bill'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Booking ID: {booking.bookingId}
                                    {mode === 'edit' && existingBill && (
                                        <span className="ml-2 text-blue-600">
                                            • Bill #{existingBill.billNumber}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 border-gray-300"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Bill Content */}
                    <div className="relative p-4 space-y-4">
                        {/* Loading Overlay */}
                        {loadingBill && (
                            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Loading existing bill data...</p>
                                </div>
                            </div>
                        )}
                        {/* Company Header */}
                        <div className="border-b-2 border-blue-200 pb-4">
                            <div className="text-center mb-3">
                                <h1 className="text-2xl font-bold text-blue-700">VENKATESWARA MOTORS</h1>
                                <p className="text-gray-700 font-medium">Professional Vehicle Service Center</p>
                                <div className="text-xs text-gray-600 mt-1">
                                    <p>Address: 123 Service Road, Automotive Hub, City - 560001</p>
                                    <p>Phone: +91-9876543210 | Email: service@venkateswaramotors.com</p>
                                    <p className="font-medium">GST Registration: 29ABCDE1234F1Z5</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200">
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-800">
                                        Invoice No: VM-{new Date().getFullYear()}-{booking.bookingId.toString().padStart(4, '0')}
                                    </p>
                                    <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString('en-IN')}</p>
                                    <p className="text-xs text-gray-600">Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-lg font-bold text-gray-900 bg-blue-100 px-3 py-1 rounded">SERVICE INVOICE</h2>
                                    <p className="text-xs text-green-600 font-medium mt-1">✓ Authorized Service Center</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer & Service Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Details */}
                            <div className="border border-gray-200 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Details</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{booking.customerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{booking.contactNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Vehicle:</span>
                                        <span className="font-medium">{booking.vehicleModel}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reg. No:</span>
                                        <span className="font-medium">{booking.vehicleRegNo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="border border-gray-200 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Service Details</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service:</span>
                                        <span className="font-medium">{getServiceTypeName(booking.serviceType)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-medium">{formatDate(booking.preferredDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-medium">{formatTime(booking.preferredTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-medium">{booking.bookingStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Work Description */}
                        <div className="border border-gray-300 rounded-lg p-3 bg-blue-50">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                <Wrench className="h-4 w-4 mr-2 text-blue-600" />
                                Service Work Description
                            </h3>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Work Performed</label>
                                <textarea
                                    value={billData.workDescription}
                                    onChange={(e) => setBillData(prev => ({ ...prev, workDescription: e.target.value }))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Describe the work performed..."
                                />
                            </div>
                        </div>

                        {/* Parts Replaced Section */}
                        <div className="border border-gray-300 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                    <Wrench className="h-4 w-4 mr-2 text-orange-600" />
                                    Parts Replaced / Consumables Used
                                </h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addPart}
                                    className="bg-green-600 hover:bg-green-700 text-white h-6 px-2"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Part
                                </Button>
                            </div>

                            {billData.parts.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700 border-b pb-1">
                                        <div className="col-span-4">Part Name</div>
                                        <div className="col-span-2">Qty</div>
                                        <div className="col-span-2">Unit Price (₹)</div>
                                        <div className="col-span-2">Total (₹)</div>
                                        <div className="col-span-2">Action</div>
                                    </div>
                                    {billData.parts.map((part) => (
                                        <div key={part.id} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    value={part.name}
                                                    onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Part name"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    value={part.quantity || ''}
                                                    onChange={(e) => {
                                                        const cleanValue = e.target.value.replace(/^0+/, '') || '0';
                                                        const numericValue = cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;
                                                        updatePart(part.id, 'quantity', numericValue);
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                    step="1"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    value={part.unitPrice || ''}
                                                    onChange={(e) => {
                                                        const cleanValue = e.target.value.replace(/^0+/, '') || '0';
                                                        const numericValue = cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;
                                                        updatePart(part.id, 'unitPrice', numericValue);
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-xs font-medium">₹{part.total.toFixed(2)}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => removePart(part.id)}
                                                    className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 text-right">
                                        <span className="text-sm font-semibold">Parts Total: ₹{calculatePartsTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-4">No parts added. Click "Add Part" to add parts.</p>
                            )}
                        </div>

                        {/* Service Charges & Additional Services */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Service Charges */}
                            <div className="border border-gray-300 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <Calculator className="h-4 w-4 mr-2 text-blue-600" />
                                    Service Charges
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Service Charges (₹)</label>
                                        <input
                                            type="number"
                                            value={billData.serviceCharges || ''}
                                            onChange={(e) => handleNumberInputChange('serviceCharges', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Labor Charges (₹)</label>
                                        <input
                                            type="number"
                                            value={billData.laborCharges || ''}
                                            onChange={(e) => handleNumberInputChange('laborCharges', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Additional Charges (₹)</label>
                                        <input
                                            type="number"
                                            value={billData.additionalCharges || ''}
                                            onChange={(e) => handleNumberInputChange('additionalCharges', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Services */}
                            <div className="border border-gray-300 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <Droplets className="h-4 w-4 mr-2 text-blue-600" />
                                    Additional Services
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={billData.waterWash}
                                                onChange={(e) => setBillData(prev => ({ ...prev, waterWash: e.target.checked }))}
                                                className="mr-2"
                                            />
                                            <span className="text-sm font-medium">Vehicle Wash & Clean</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs">₹</span>
                                            <input
                                                type="number"
                                                value={billData.waterWashCharges || ''}
                                                onChange={(e) => handleNumberInputChange('waterWashCharges', e.target.value)}
                                                className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                                step="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
                                            <input
                                                type="number"
                                                value={billData.discount || ''}
                                                onChange={(e) => handleNumberInputChange('discount', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">GST Rate (%)</label>
                                            <input
                                                type="number"
                                                value={billData.taxRate || ''}
                                                onChange={(e) => handleNumberInputChange('taxRate', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                                        <select
                                            value={billData.paymentStatus}
                                            onChange={(e) => setBillData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PARTIAL">Partial Paid</option>
                                            <option value="PAID">Fully Paid</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Bill Summary */}
                        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                            <h3 className="text-base font-bold text-gray-900 mb-3 text-center">BILL SUMMARY</h3>
                            {(() => {
                                const totals = calculateBillTotals();
                                return (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Service Charges:</span>
                                                    <span>₹{billData.serviceCharges.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Labor Charges:</span>
                                                    <span>₹{billData.laborCharges.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Parts & Consumables:</span>
                                                    <span>₹{totals.partsTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Additional Charges:</span>
                                                    <span>₹{billData.additionalCharges.toFixed(2)}</span>
                                                </div>
                                                {billData.waterWash && (
                                                    <div className="flex justify-between">
                                                        <span>Vehicle Wash:</span>
                                                        <span>₹{totals.waterWashTotal.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between font-medium">
                                                <span>Subtotal:</span>
                                                <span>₹{totals.subtotal.toFixed(2)}</span>
                                            </div>
                                            {billData.discount > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>Discount ({billData.discount}%):</span>
                                                    <span>-₹{totals.discountAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>After Discount:</span>
                                                <span>₹{totals.afterDiscount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>GST ({billData.taxRate}%):</span>
                                                <span>₹{totals.taxAmount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <Separator className="my-3" />

                                        <div className="flex justify-between text-lg font-bold bg-white p-3 rounded border">
                                            <span>TOTAL AMOUNT:</span>
                                            <span className="text-green-700">₹{totals.total.toFixed(2)}</span>
                                        </div>

                                        <div className="text-center mt-2">
                                            <p className="text-xs text-gray-600">
                                                Amount in words: <span className="font-medium capitalize">
                                                    {/* You can add a number-to-words converter here */}
                                                    Rupees {Math.floor(totals.total)} and {Math.round((totals.total % 1) * 100)} Paise Only
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Notes Section */}
                        <div className="border border-gray-300 rounded-lg p-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes / Comments</label>
                            <textarea
                                value={billData.notes}
                                onChange={(e) => setBillData(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                                placeholder="Add any warranty information, special instructions, or additional notes for the customer..."
                            />
                        </div>

                        {/* Professional Terms and Conditions */}
                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 text-center">TERMS & CONDITIONS</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                                <div>
                                    <h5 className="font-semibold mb-1">Service Warranty:</h5>
                                    <ul className="space-y-0.5 ml-2">
                                        <li>• All services guaranteed for 30 days or 1000 km, whichever comes first</li>
                                        <li>• Parts warranty as per manufacturer's terms</li>
                                        <li>• Free re-service if issue persists within warranty period</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-1">Payment & Delivery:</h5>
                                    <ul className="space-y-0.5 ml-2">
                                        <li>• Payment due upon completion of service</li>
                                        <li>• Vehicle will be released only after full payment</li>
                                        <li>• Additional charges may apply for extra work requested</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-1">Liability:</h5>
                                    <ul className="space-y-0.5 ml-2">
                                        <li>• Company not responsible for items left in vehicle</li>
                                        <li>• Customer advised to remove valuables before service</li>
                                        <li>• Vehicle parked at owner's risk</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-1">General:</h5>
                                    <ul className="space-y-0.5 ml-2">
                                        <li>• All disputes subject to local jurisdiction only</li>
                                        <li>• Service advisor contact for any queries</li>
                                        <li>• Regular service recommended for optimal performance</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Professional Footer - Print Optimized */}
                        <div className="mt-6 print:mt-8">
                            {/* Service Completion Certificate */}
                            <div className="border-2 border-blue-300 rounded-lg p-3 bg-blue-50 text-center">
                                <h4 className="text-sm font-bold text-blue-800 mb-1">SERVICE COMPLETION CERTIFICATE</h4>
                                <p className="text-xs text-blue-700">
                                    This is to certify that the above mentioned vehicle has been serviced as per the
                                    customer's requirement and is ready for delivery in good condition.
                                </p>
                            </div>

                            {/* Signature Section */}
                            <div className="mt-4 grid grid-cols-3 gap-8 print:mt-8">
                                <div className="text-center">
                                    <div className="w-full h-16 border-b-2 border-gray-400 mb-2 print:mb-4"></div>
                                    <div className="text-xs">
                                        <p className="font-semibold">Customer Signature</p>
                                        <p className="text-gray-600">Date: ___________</p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="w-full h-16 border-b-2 border-gray-400 mb-2 print:mb-4"></div>
                                    <div className="text-xs">
                                        <p className="font-semibold">Service Advisor</p>
                                        <p className="text-gray-600">Name: _____________</p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="w-full h-16 border-b-2 border-gray-400 mb-2 print:mb-4"></div>
                                    <div className="text-xs">
                                        <p className="font-semibold">Authorized Signature</p>
                                        <p className="text-gray-600">Manager / Supervisor</p>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Footer */}
                            <div className="mt-6 pt-4 border-t-2 border-gray-300 text-center print:mt-8">
                                <div className="bg-blue-700 text-white p-3 rounded-lg print:bg-gray-800">
                                    <h4 className="font-bold mb-1">Thank You for Choosing Venkateswara Motors!</h4>
                                    <p className="text-xs">
                                        Your satisfaction is our priority. For any service-related queries,
                                        please contact us at +91-9876543210 or visit our service center.
                                    </p>
                                    <p className="text-xs mt-1 font-medium">
                                        Next Service Due: {(() => {
                                            const nextDate = new Date(booking.preferredDate);
                                            nextDate.setMonth(nextDate.getMonth() + 6);
                                            return nextDate.toLocaleDateString('en-IN');
                                        })()} | Follow us on social media for service reminders
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end space-x-2 p-3 border-t border-gray-200 bg-gray-50 print:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBillPrint}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                            <Printer className="h-3 w-3 mr-1" />
                            Print
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Convert to PDF functionality can be added here
                                toast.info('PDF Download', 'PDF download functionality coming soon!');
                            }}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleBillSave}
                            disabled={isSaving || loadingBill}
                            className={`text-white disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'edit'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    {mode === 'edit' ? 'Updating...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 mr-1" />
                                    {mode === 'edit' ? 'Update Bill' : 'Save Bill'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BillGenerationModal;