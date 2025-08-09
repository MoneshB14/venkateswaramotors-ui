import React, { useState, useMemo } from 'react';
import { DataTable } from '../../ui/data-table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  Calendar,
  Clock,
  User,
  Eye,
  FileText,
  Phone,
  MapPin
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '../../../utils/customerUtils';

const BookingsHistoryTable = ({ bookings = [], onViewDetails, onGenerateBill }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);

  const columns = [
    {
      key: 'bookingId',
      header: 'Booking ID',
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">
            Created: {formatDateTime(row.createdAt)}
          </div>
        </div>
      )
    },
    {
      key: 'serviceType',
      header: 'Service Type',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-gray-900">{value || '—'}</span>
        </div>
      )
    },
    {
      key: 'preferredDate',
      header: 'Scheduled',
      render: (value, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 text-gray-500" />
            <span>{formatDate(value)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span>{row.preferredTime || '—'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'bookingStatus',
      header: 'Status',
      render: (value) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value || 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'assignedTechnician',
      header: 'Technician',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-sm">{value || 'Not assigned'}</span>
        </div>
      )
    },
    {
      key: 'contactNumber',
      header: 'Contact',
      render: (value, row) => (
        <div className="space-y-1">
          {value && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-gray-500" />
              <span>{value}</span>
            </div>
          )}
          {row.address && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3 w-3 text-gray-500" />
              <span className="truncate max-w-32">{row.address}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(row);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {row.bookingStatus?.toLowerCase() === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onGenerateBill?.(row);
              }}
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookings]);

  return (
    <div className="space-y-4">
      <DataTable
        data={sortedBookings}
        columns={columns}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        onRowClick={(row) => setSelectedBooking(row)}
        onExport={(data) => {
          const csv = [
            ['Booking ID', 'Service Type', 'Date', 'Time', 'Status', 'Technician', 'Contact'],
            ...data.map(booking => [
              booking.bookingId || '',
              booking.serviceType || '',
              formatDate(booking.preferredDate),
              booking.preferredTime || '',
              booking.bookingStatus || '',
              booking.assignedTechnician || '',
              booking.contactNumber || ''
            ])
          ].map(row => row.join(',')).join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'bookings_history.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        }}
        emptyMessage="No bookings found for this customer."
        className="bg-white"
      />

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
          <p className="text-gray-500">This customer hasn't made any bookings yet.</p>
        </div>
      )}
    </div>
  );
};

export default BookingsHistoryTable;
