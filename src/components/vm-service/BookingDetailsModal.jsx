import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  X,
  User,
  Phone,
  Car,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Mail,
  Settings
} from 'lucide-react';

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: AlertCircle,
        label: 'Pending'
      },
      COMPLETED: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        label: 'Completed'
      },
      DELIVERED: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        label: 'Delivered'
      },
      CANCELLED: {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: XCircle,
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(booking.bookingStatus);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 ${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Service Booking Details</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-gray-600">ID: {booking.bookingId}</p>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color} border`}>
                    <StatusIcon className="w-3 h-3" />
                    {booking.bookingStatus}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Booking created on {formatDateTime(booking.createdAt || booking.updatedAt)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Main Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <User className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Customer Information</h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{booking.customerName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Number</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-base font-semibold text-gray-900">{booking.contactNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Car className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Vehicle Information</h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle Model</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{booking.vehicleModel}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registration Number</label>
                    <div className="mt-2">
                      <span className="inline-block bg-white px-3 py-2 rounded border border-gray-300 font-mono text-sm font-semibold text-gray-900">
                        {booking.vehicleRegistration || booking.vehicleRegNo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                <Settings className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Service Details</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Service Type</label>
                    <p className="text-base font-semibold text-gray-900 mt-1 capitalize">{booking.serviceType}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preferred Date</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-base font-semibold text-gray-900">{formatDate(booking.preferredDate)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preferred Time</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-base font-semibold text-gray-900">{booking.preferredTime}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
                    <p className="text-sm font-medium text-gray-700 mt-1">{formatDateTime(booking.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Status */}
            {booking.emailSent && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900">Confirmation Email Sent</h4>
                    <p className="text-xs text-green-700">Delivered on {formatDateTime(booking.emailSentAt)}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default BookingDetailsModal; 