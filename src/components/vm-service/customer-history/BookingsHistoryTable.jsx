import React, { useMemo } from 'react';
import { DataTable } from '../../ui/data-table';
import { Badge } from '../../ui/badge';
import {
  Calendar,
  Clock
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '../../../utils/customerUtils';

const BookingsHistoryTable = ({ bookings = [] }) => {

  const columns = [
    {
      key: 'bookingId',
      header: 'Booking ID',
      render: (value) => (
        <div className="font-semibold text-gray-900">{value}</div>
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
      header: 'Schedule',
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

        onExport={(data) => {
          const csv = [
            ['Booking ID', 'Service Type', 'Date', 'Time', 'Status'],
            ...data.map(booking => [
              booking.bookingId || '',
              booking.serviceType || '',
              formatDate(booking.preferredDate),
              booking.preferredTime || '',
              booking.bookingStatus || ''
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
