import React, { useMemo } from 'react';
import { DataTable } from '../../ui/data-table';
import { Badge } from '../../ui/badge';
import {
  Calendar,
  Clock
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '../../../utils/customerUtils';

const BookingsHistoryTable = ({ bookings = [] }) => {

  // Mobile Card View Component
  const MobileBookingCard = ({ booking }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{booking.bookingId}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm text-gray-700 truncate">{booking.serviceType || '—'}</span>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(booking.bookingStatus)} className="flex-shrink-0 ml-2">
          {booking.bookingStatus || 'Unknown'}
        </Badge>
      </div>

      <div className="pt-2 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-900">{formatDate(booking.preferredDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-700">{booking.preferredTime || 'Not specified'}</span>
        </div>
      </div>
    </div>
  );

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
      {/* Mobile View - Card Layout */}
      <div className="block lg:hidden space-y-3">
        {sortedBookings.map((booking) => (
          <MobileBookingCard key={booking.bookingId} booking={booking} />
        ))}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden lg:block">
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
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">This customer hasn't made any bookings yet.</p>
        </div>
      )}
    </div>
  );
};

export default BookingsHistoryTable;
