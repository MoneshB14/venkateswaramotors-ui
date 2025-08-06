import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  User,
  Phone,
  Car,
  Wrench,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  MapPin,
  Tag,
  UserCheck,
  DollarSign,
  FileText,
  Building2,
  Shield
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { serviceTypes } from '../../config/menuConfig';
import { bookingsAPI } from '../../services/api';

const BookingForm = ({ booking = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    contact: '',
    name: '',
    preferredDate: '',
    preferredTime: '',
    regNo: '',
    serviceType: '',
    vehicleModel: '',
    assignedTechnician: '',
    estimatedCost: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableTimings, setAvailableTimings] = useState([]);
  const [loadingTimings, setLoadingTimings] = useState(false);
  const { toast } = useToast();

  // Initialize form with booking data if editing
  useEffect(() => {
    if (booking) {
      console.log('Booking data received:', booking); // Debug log

      // Direct mapping for common API service type strings
      const serviceTypeMapping = {
        'general': 'General Service',
        'engine': 'Engine Repair',
        'oil': 'Oil Change',
        'brake': 'Brake Service',
        'tire': 'Tire Service',
        'electrical': 'Electrical Repair',
        'battery': 'Battery Service',
        'custom': 'Custom Repair',
        'chassis': 'Chassis Service'
      };

      // Find the service type by name or id
      let serviceTypeValue = booking.serviceType || '';
      console.log('Original service type from API:', serviceTypeValue); // Debug log

      if (serviceTypeValue) {
        // First try direct mapping
        if (serviceTypeMapping[serviceTypeValue.toLowerCase()]) {
          serviceTypeValue = serviceTypeMapping[serviceTypeValue.toLowerCase()];
          console.log('Mapped via direct mapping to:', serviceTypeValue);
        } else {
          // Try to find by name first, then by id
          const serviceType = serviceTypes.find(service => {
            const nameMatch = service.name.toLowerCase() === serviceTypeValue.toLowerCase();
            const idMatch = service.id === serviceTypeValue;
            const partialNameMatch = service.name.toLowerCase().includes(serviceTypeValue.toLowerCase()) ||
              serviceTypeValue.toLowerCase().includes(service.name.toLowerCase().split(' ')[0]);

            console.log(`Checking service: ${service.name} (${service.id}) against "${serviceTypeValue}"`);
            console.log(`  nameMatch: ${nameMatch}, idMatch: ${idMatch}, partialNameMatch: ${partialNameMatch}`);

            return nameMatch || idMatch || partialNameMatch;
          });

          if (serviceType) {
            serviceTypeValue = serviceType.name;
            console.log('Found matching service type:', serviceType.name);
          } else {
            console.log('No matching service type found, using original value:', serviceTypeValue);
          }
        }
      }

      const formDataToSet = {
        contact: booking.contact || booking.contactNumber || '',
        name: booking.customerName || booking.name || '',
        preferredDate: booking.preferredDate || '',
        preferredTime: booking.preferredTime || '',
        regNo: booking.vehicleRegNo || booking.vehicleRegistration || booking.regNo || '',
        serviceType: serviceTypeValue,
        vehicleModel: booking.vehicleModel || '',
        assignedTechnician: booking.assignedTechnician || '',
        estimatedCost: booking.estimatedCost || '',
        notes: booking.notes || ''
      };

      console.log('Setting form data:', formDataToSet); // Debug log
      setFormData(formDataToSet);
    }
  }, [booking]);

  // Fetch available timings when date changes
  useEffect(() => {
    if (formData.preferredDate) {
      fetchAvailableTimings(formData.preferredDate);
    }
  }, [formData.preferredDate]);

  // Fetch available timings for a specific date
  const fetchAvailableTimings = async (date) => {
    setLoadingTimings(true);
    try {
      const response = await bookingsAPI.getAvailableTimings(date);
      if (response.success) {
        setAvailableTimings(response.availableTimings || []);
      } else {
        console.error('Failed to fetch available timings:', response.message);
        setAvailableTimings([]);
      }
    } catch (error) {
      console.error('Error fetching available timings:', error);
      setAvailableTimings([]);
    } finally {
      setLoadingTimings(false);
    }
  };

  // Validate form according to ServiceBookingRequest requirements
  const validateForm = () => {
    const newErrors = {};

    // Contact number validation: ^[6-9]\d{9}$ (only required for new bookings)
    if (!booking) { // Only validate contact for new bookings
      const contactRegex = /^[6-9]\d{9}$/;
      if (!formData.contact.trim()) {
        newErrors.contact = 'Contact number is required';
      } else if (!contactRegex.test(formData.contact)) {
        newErrors.contact = 'Invalid phone number format. Must be 10 digits starting with 6-9';
      }
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Preferred date validation: ^\d{4}-\d{2}-\d{2}$
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required';
    } else if (!dateRegex.test(formData.preferredDate)) {
      newErrors.preferredDate = 'Invalid date format. Use YYYY-MM-DD';
    }

    // Preferred time validation: ^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/;
    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Preferred time is required';
    } else if (!timeRegex.test(formData.preferredTime)) {
      newErrors.preferredTime = 'Invalid time format. Use HH:MM AM/PM';
    }

    // Vehicle registration validation: ^[A-Z]{2}\s\d{1,2}\s[A-Z]{1,2}\s\d{4}$
    const regNoRegex = /^[A-Z]{2}\s\d{1,2}\s[A-Z]{1,2}\s\d{4}$/;
    if (!formData.regNo.trim()) {
      newErrors.regNo = 'Vehicle registration number is required';
    } else if (!regNoRegex.test(formData.regNo)) {
      newErrors.regNo = 'Invalid vehicle registration number format. Use format: XX XX XX XXXX';
    }

    // Service type validation
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }

    // Vehicle model validation (only required for new bookings)
    if (!booking && !formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (booking) {
        // Update existing booking - use bookingId from the API response
        const bookingId = booking.bookingId || booking.id;
        response = await bookingsAPI.updateBooking(bookingId, formData);
      } else {
        // Create new booking
        response = await bookingsAPI.createBooking(formData);
      }

      if (response.success) {
        toast.success(
          booking ? 'Booking Updated' : 'Booking Created',
          response.message || (booking ? 'Booking has been updated successfully.' : 'New booking has been created successfully.')
        );
        onSave(response);
      } else {
        toast.error('Error', response.message || 'Failed to save booking.');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      toast.error('Error', 'Failed to save booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Format registration number as user types
  const handleRegNoChange = (value) => {
    // Remove all non-alphanumeric characters
    let cleaned = value.replace(/[^A-Z0-9]/gi, '');

    // Convert to uppercase
    cleaned = cleaned.toUpperCase();

    // Format as XX XX XX XXXX
    if (cleaned.length <= 2) {
      cleaned = cleaned;
    } else if (cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
    } else if (cleaned.length <= 6) {
      cleaned = cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 4) + ' ' + cleaned.slice(4);
    } else if (cleaned.length <= 10) {
      cleaned = cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 4) + ' ' + cleaned.slice(4, 6) + ' ' + cleaned.slice(6, 10);
    } else {
      cleaned = cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 4) + ' ' + cleaned.slice(4, 6) + ' ' + cleaned.slice(6, 10);
    }

    handleInputChange('regNo', cleaned);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Compact Header - Top Left */}
        <div className="text-left mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {booking ? 'Edit Service Booking' : 'Schedule Service Appointment'}
          </h1>
          <p className="text-gray-600 text-sm">
            {booking ? 'Update your service booking details' : 'Book your vehicle service with our expert technicians'}
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">
                  {booking ? 'Edit Booking Details' : 'Service Booking Form'}
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm">
                  {booking ? 'Update your existing booking information' : 'Fill in the details below to schedule your service'}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 w-8 p-0 text-blue-100 hover:text-white hover:bg-blue-600/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Main Form Grid - 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">Customer Information</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 pl-9 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                            placeholder="Enter your full name"
                          />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.name && (
                          <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Contact Number {!booking && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={formData.contact}
                            onChange={(e) => handleInputChange('contact', e.target.value)}
                            className={`w-full px-3 py-2 pl-9 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ${errors.contact ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                            placeholder={booking ? "Contact not available" : "Enter 10-digit phone number"}
                            maxLength="10"
                            disabled={booking && !formData.contact}
                          />
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {booking && !formData.contact && (
                          <p className="text-xs text-gray-500 mt-1">
                            Contact information not available in booking data
                          </p>
                        )}
                        {errors.contact && (
                          <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.contact}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                        <Car className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">Vehicle Details</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Vehicle Model {!booking && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.vehicleModel}
                            onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                            className={`w-full px-3 py-2 pl-9 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ${errors.vehicleModel ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                            placeholder={booking ? "Vehicle model not available" : "e.g., Honda Activa, Bajaj Pulsar"}
                            disabled={booking && !formData.vehicleModel}
                          />
                          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {booking && !formData.vehicleModel && (
                          <p className="text-xs text-gray-500 mt-1">
                            Vehicle model information not available in booking data
                          </p>
                        )}
                        {errors.vehicleModel && (
                          <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.vehicleModel}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Registration Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.regNo}
                            onChange={(e) => handleRegNoChange(e.target.value)}
                            className={`w-full px-3 py-2 pl-9 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono transition-all duration-200 ${errors.regNo ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                            placeholder="e.g., TN 20 DA 1818"
                            maxLength="13"
                          />
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.regNo && (
                          <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.regNo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Service Information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mr-3">
                        <Wrench className="h-4 w-4 text-orange-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">Service Details</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Service Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.serviceType}
                            onChange={(e) => handleInputChange('serviceType', e.target.value)}
                            className={`w-full px-3 py-2 pl-9 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ${errors.serviceType ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                          >
                            <option value="">Select service type</option>
                            {serviceTypes.map((service) => (
                              <option key={service.id} value={service.name}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                          <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.serviceType && (
                          <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.serviceType}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1 block">
                            Assigned Technician
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.assignedTechnician}
                              onChange={(e) => handleInputChange('assignedTechnician', e.target.value)}
                              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-gray-400"
                              placeholder="e.g., Rajesh Kumar"
                            />
                            <UserCheck className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1 block">
                            Estimated Cost
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.estimatedCost}
                              onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-gray-400"
                              placeholder="e.g., ₹1500"
                            />
                            <DollarSign className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Schedule */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">Appointment Schedule</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={formData.preferredDate}
                            onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                            className={`w-full px-3 py-2 pl-8 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ${errors.preferredDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.preferredDate && (
                          <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.preferredDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Time <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.preferredTime}
                            onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                            className={`w-full px-3 py-2 pl-8 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ${errors.preferredTime ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                            disabled={loadingTimings}
                          >
                            <option value="">
                              {loadingTimings ? 'Loading...' : 'Select time'}
                            </option>
                            {availableTimings.length > 0 ? (
                              <>
                                {booking && formData.preferredTime && !availableTimings.includes(formData.preferredTime) && (
                                  <option value={formData.preferredTime}>
                                    {formData.preferredTime} (current)
                                  </option>
                                )}
                                {availableTimings.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </>
                            ) : (
                              <>
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="01:00 PM">01:00 PM</option>
                                <option value="02:00 PM">02:00 PM</option>
                                <option value="03:00 PM">03:00 PM</option>
                                <option value="04:00 PM">04:00 PM</option>
                                <option value="05:00 PM">05:00 PM</option>
                                <option value="06:00 PM">06:00 PM</option>
                              </>
                            )}
                          </select>
                          <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.preferredTime && (
                          <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.preferredTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information - Full Width */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg mr-3">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Additional Information</h3>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Notes & Special Instructions
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-gray-400 resize-none"
                      placeholder="Any additional notes, special instructions, or specific issues to address..."
                      rows="3"
                    />
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Security Notice - Compact */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-blue-900 mb-1">Secure Booking</h4>
                    <p className="text-xs text-blue-700">
                      Your information is secure and will only be used for service booking purposes.
                      We respect your privacy and follow strict data protection guidelines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-sm py-2 px-4 font-medium transition-all duration-200"
                >
                  Cancel Booking
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm py-2 px-4 font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {booking ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {booking ? 'Update Booking' : 'Schedule Appointment'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingForm; 