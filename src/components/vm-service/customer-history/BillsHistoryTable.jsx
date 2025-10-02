import React, { useMemo } from 'react';
import { DataTable } from '../../ui/data-table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  Receipt,
  Download,
  Eye,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusBadgeVariant } from '../../../utils/customerUtils';

const BillsHistoryTable = ({ bills = [], onViewBill, onDownloadBill, onMarkPaid }) => {

  // Mobile Card View Component
  const MobileBillCard = ({ bill }) => {
    const status = bill.paymentStatus?.toLowerCase();
    const isOverdue = status !== 'paid' && new Date(bill.billDate) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{bill.billNumber}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Booking: {bill.bookingId}
            </div>
          </div>
          <Badge variant={isOverdue ? 'error' : getStatusBadgeVariant(bill.paymentStatus)} className="flex-shrink-0 ml-2">
            {isOverdue ? 'Overdue' : (bill.paymentStatus || 'Unknown')}
          </Badge>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Total Amount</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(bill.total)}</span>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(bill.subtotal)}</span>
          </div>
          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-emerald-600">-{formatCurrency(bill.discountAmount)}</span>
            </div>
          )}
          {bill.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">+{formatCurrency(bill.taxAmount)}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">{formatDateTime(bill.billDate)}</div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9"
              onClick={() => onViewBill?.(bill)}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9"
              onClick={() => onDownloadBill?.(bill)}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
            {bill.paymentStatus?.toLowerCase() !== 'paid' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9"
                onClick={() => onMarkPaid?.(bill)}
              >
                <CreditCard className="h-4 w-4 mr-1.5" />
                Pay
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    {
      key: 'billNumber',
      header: 'Bill Details',
      render: (value, row) => (
        <div className="space-y-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{value}</div>
          <div className="text-xs text-gray-500">
            Booking: {row.bookingId}
          </div>
          <div className="text-xs text-gray-500">
            {formatDateTime(row.billDate)}
          </div>
        </div>
      )
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      align: 'right',
      render: (value, row) => (
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{formatCurrency(value)}</div>
          {row.discountAmount > 0 && (
            <div className="text-xs text-emerald-600">
              -{formatCurrency(row.discountAmount)} ({row.discount}%)
            </div>
          )}
          {row.taxAmount > 0 && (
            <div className="text-xs text-gray-500">
              +{formatCurrency(row.taxAmount)} tax
            </div>
          )}
        </div>
      )
    },
    {
      key: 'total',
      header: 'Total Amount',
      align: 'right',
      render: (value, row) => (
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(value)}
          </div>
          {row.discountAmount > 0 && (
            <div className="text-xs text-emerald-600">
              Saved {formatCurrency(row.discountAmount)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      render: (value, row) => {
        const status = value?.toLowerCase();
        const isOverdue = status !== 'paid' && new Date(row.billDate) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        return (
          <div className="space-y-1">
            <Badge variant={isOverdue ? 'error' : getStatusBadgeVariant(value)} className="inline-flex items-center gap-1">
              {status === 'paid' && <CheckCircle className="h-3 w-3" />}
              {status === 'pending' && <Clock className="h-3 w-3" />}
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              {isOverdue ? 'Overdue' : (value || 'Unknown')}
            </Badge>
            {row.paymentDate && (
              <div className="text-xs text-gray-500">
                Paid: {formatDateTime(row.paymentDate)}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onViewBill?.(row);
            }}
            title="View bill"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadBill?.(row);
            }}
            title="Download bill"
          >
            <Download className="h-4 w-4" />
          </Button>
          {row.paymentStatus?.toLowerCase() !== 'paid' && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMarkPaid?.(row);
              }}
              title="Mark as paid"
            >
              <CreditCard className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => new Date(b.billDate) - new Date(a.billDate));
  }, [bills]);

  const totalAmount = bills.reduce((sum, bill) => sum + (Number(bill.total) || 0), 0);
  const paidAmount = bills
    .filter(bill => bill.paymentStatus?.toLowerCase() === 'paid')
    .reduce((sum, bill) => sum + (Number(bill.total) || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-4">
      {/* Professional Summary Cards */}
      {bills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500">Total Billed</div>
              <div className="text-xs text-gray-400">{bills.length} bills</div>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3 truncate">{formatCurrency(totalAmount)}</div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500">Amount Paid</div>
              <div className="text-xs text-gray-400">
                {bills.filter(b => b.paymentStatus?.toLowerCase() === 'paid').length} paid
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-emerald-600 mb-2 sm:mb-3 truncate">{formatCurrency(paidAmount)}</div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-300" 
                style={{ width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className={`bg-white border rounded-lg p-4 sm:p-6 hover:border-gray-300 transition-colors ${
            pendingAmount > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500">Pending Amount</div>
              {pendingAmount > 0 && (
                <div className="text-xs text-amber-600">
                  {bills.filter(b => b.paymentStatus?.toLowerCase() !== 'paid').length} pending
                </div>
              )}
            </div>
            <div className={`text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 truncate ${
              pendingAmount > 0 ? 'text-amber-600' : 'text-gray-400'
            }`}>
              {formatCurrency(pendingAmount)}
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  pendingAmount > 0 ? 'bg-amber-500' : 'bg-gray-300'
                }`}
                style={{ width: `${totalAmount > 0 ? (pendingAmount / totalAmount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile View - Card Layout */}
      <div className="block lg:hidden space-y-3">
        {sortedBills.map((bill) => (
          <MobileBillCard key={bill.billNumber} bill={bill} />
        ))}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden lg:block">
        <DataTable
          data={sortedBills}
          columns={columns}
          searchable={true}
          sortable={true}
          pagination={true}
          pageSize={10}
          onExport={(data) => {
            const csv = [
              ['Bill Number', 'Booking ID', 'Date', 'Subtotal', 'Discount', 'Tax', 'Total', 'Status'],
              ...data.map(bill => [
                bill.billNumber || '',
                bill.bookingId || '',
                formatDateTime(bill.billDate),
                bill.subtotal || 0,
                bill.discountAmount || 0,
                bill.taxAmount || 0,
                bill.total || 0,
                bill.paymentStatus || ''
              ])
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bills_history.csv';
            a.click();
            window.URL.revokeObjectURL(url);
          }}
          emptyMessage="No bills found for this customer."
          className="bg-white"
        />
      </div>

      {bills.length === 0 && (
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Receipt className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Bills Yet</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">No bills have been generated for this customer yet.</p>
        </div>
      )}
    </div>
  );
};

export default BillsHistoryTable;
