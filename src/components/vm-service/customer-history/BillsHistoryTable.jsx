import React, { useState, useMemo } from 'react';
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
  const [selectedBill, setSelectedBill] = useState(null);

  const columns = [
    {
      key: 'billNumber',
      header: 'Bill Details',
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{value}</div>
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
      header: 'Amount Breakdown',
      render: (value, row) => (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(value)}</span>
          </div>
          {row.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount ({row.discount}%):</span>
              <span>-{formatCurrency(row.discountAmount)}</span>
            </div>
          )}
          {row.taxAmount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({row.taxRate}%):</span>
              <span>+{formatCurrency(row.taxAmount)}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'total',
      header: 'Total Amount',
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
          <div className="space-y-2">
            <Badge variant={isOverdue ? 'error' : getStatusBadgeVariant(value)}>
              <div className="flex items-center gap-1">
                {status === 'paid' && <CheckCircle className="h-3 w-3" />}
                {status === 'pending' && <Clock className="h-3 w-3" />}
                {isOverdue && <AlertCircle className="h-3 w-3" />}
                {isOverdue ? 'Overdue' : (value || 'Unknown')}
              </div>
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
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onViewBill?.(row);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadBill?.(row);
            }}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          {row.paymentStatus?.toLowerCase() !== 'paid' && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMarkPaid?.(row);
              }}
            >
              <CreditCard className="h-3.5 w-3.5" />
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
      {/* Summary Cards */}
      {bills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total Billed</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</div>
            <div className="text-xs text-blue-600">{bills.length} bills</div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Amount Paid</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900">{formatCurrency(paidAmount)}</div>
            <div className="text-xs text-emerald-600">
              {bills.filter(b => b.paymentStatus?.toLowerCase() === 'paid').length} paid bills
            </div>
          </div>
          
          <div className={`${pendingAmount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-5 w-5 ${pendingAmount > 0 ? 'text-amber-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${pendingAmount > 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                Pending Amount
              </span>
            </div>
            <div className={`text-2xl font-bold ${pendingAmount > 0 ? 'text-amber-900' : 'text-gray-900'}`}>
              {formatCurrency(pendingAmount)}
            </div>
            <div className={`text-xs ${pendingAmount > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
              {bills.filter(b => b.paymentStatus?.toLowerCase() !== 'paid').length} pending bills
            </div>
          </div>
        </div>
      )}

      <DataTable
        data={sortedBills}
        columns={columns}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        onRowClick={(row) => setSelectedBill(row)}
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

      {bills.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bills Yet</h3>
          <p className="text-gray-500">No bills have been generated for this customer yet.</p>
        </div>
      )}
    </div>
  );
};

export default BillsHistoryTable;
