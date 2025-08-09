import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import {
  Filter,
  X,
  Calendar,
  DollarSign,
  Tag,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const AdvancedFilters = ({ 
  isOpen, 
  onClose, 
  onApply, 
  onReset,
  data,
  currentFilters = {} 
}) => {
  const [filters, setFilters] = useState({
    dateRange: {
      start: currentFilters.dateRange?.start || '',
      end: currentFilters.dateRange?.end || ''
    },
    amountRange: {
      min: currentFilters.amountRange?.min || '',
      max: currentFilters.amountRange?.max || ''
    },
    serviceTypes: currentFilters.serviceTypes || [],
    bookingStatuses: currentFilters.bookingStatuses || [],
    paymentStatuses: currentFilters.paymentStatuses || [],
    technicians: currentFilters.technicians || []
  });

  // Get unique values from data
  const getUniqueValues = (array, key) => {
    return [...new Set(array?.map(item => item[key]).filter(Boolean))];
  };

  const serviceTypes = getUniqueValues(data?.bookings, 'serviceType');
  const bookingStatuses = getUniqueValues(data?.bookings, 'bookingStatus');
  const paymentStatuses = getUniqueValues(data?.bills, 'paymentStatus');
  const technicians = getUniqueValues(data?.bookings, 'assignedTechnician');

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleMultiSelectChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      serviceTypes: [],
      bookingStatuses: [],
      paymentStatuses: [],
      technicians: []
    };
    setFilters(resetFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.amountRange.min || filters.amountRange.max) count++;
    count += filters.serviceTypes.length;
    count += filters.bookingStatuses.length;
    count += filters.paymentStatuses.length;
    count += filters.technicians.length;
    return count;
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'paid') return CheckCircle;
    if (statusLower === 'pending') return Clock;
    if (statusLower === 'cancelled' || statusLower === 'overdue') return AlertCircle;
    return Tag;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'paid') return 'success';
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'cancelled' || statusLower === 'overdue') return 'error';
    return 'default';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <Card className="border-0 shadow-none">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Advanced Filters</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Filter customer history data
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="primary" className="ml-2">
                        {getActiveFiltersCount()} active
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Date Range */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Date Range
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">From</label>
                    <Input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        start: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">To</label>
                    <Input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        end: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Amount Range */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Amount Range (₹)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Minimum</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.amountRange.min}
                      onChange={(e) => handleFilterChange('amountRange', {
                        ...filters.amountRange,
                        min: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Maximum</label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={filters.amountRange.max}
                      onChange={(e) => handleFilterChange('amountRange', {
                        ...filters.amountRange,
                        max: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service Types */}
              {serviceTypes.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    Service Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {serviceTypes.map((service) => (
                      <button
                        key={service}
                        onClick={() => handleMultiSelectChange('serviceTypes', service)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          filters.serviceTypes.includes(service)
                            ? 'bg-purple-100 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Statuses */}
              {bookingStatuses.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Booking Statuses
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {bookingStatuses.map((status) => {
                      const StatusIcon = getStatusIcon(status);
                      return (
                        <button
                          key={status}
                          onClick={() => handleMultiSelectChange('bookingStatuses', status)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                            filters.bookingStatuses.includes(status)
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Statuses */}
              {paymentStatuses.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Payment Statuses
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {paymentStatuses.map((status) => {
                      const StatusIcon = getStatusIcon(status);
                      return (
                        <button
                          key={status}
                          onClick={() => handleMultiSelectChange('paymentStatuses', status)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                            filters.paymentStatuses.includes(status)
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technicians */}
              {technicians.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-600" />
                    Technicians
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {technicians.map((technician) => (
                      <button
                        key={technician}
                        onClick={() => handleMultiSelectChange('technicians', technician)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                          filters.technicians.includes(technician)
                            ? 'bg-orange-100 border-orange-300 text-orange-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <User className="w-3 h-3" />
                        {technician}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Actions */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset All
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleApply} className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Apply Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="outline" className="bg-white text-blue-600">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedFilters;
