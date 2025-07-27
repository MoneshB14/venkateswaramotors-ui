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
  Edit
} from 'lucide-react';

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: AlertCircle,
        label: 'Pending'
      },
      COMPLETED: {
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: CheckCircle,
        label: 'Completed'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg flex items-center justify-center`}>
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
              <p className="text-xs text-gray-500">ID: {booking.bookingId}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status and Date */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
            {/* <span className="text-xs text-gray-500">
              Created: {formatDateTime(booking.createdAt)}
            </span> */}
          </div>

          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-sm font-semibold text-blue-700">
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="text-sm font-medium flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-blue-600" />
                    <span>{booking.contactNumber}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-sm font-semibold text-purple-700">
                  <Car className="w-4 h-4" />
                  <span>Vehicle</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Model</p>
                  <p className="text-sm font-medium">{booking.vehicleModel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Registration</p>
                  <p className="text-sm font-medium font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {booking.vehicleRegistration || booking.vehicleRegNo}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Information */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm font-semibold text-emerald-700">
                <Calendar className="w-4 h-4" />
                <span>Service Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Service Type</p>
                  <p className="text-sm font-medium capitalize">{booking.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium">{formatDate(booking.preferredDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-sm font-medium flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{booking.preferredTime}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Updated</p>
                  <p className="text-sm font-medium">{formatDateTime(booking.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Status */}
          {booking.emailSent && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-900">Email sent</p>
                <p className="text-xs text-green-700">{formatDateTime(booking.emailSentAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t bg-gray-50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {/* <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Update Status
            </Button> */}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 