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
      {/* Summary Cards */}
      {bills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-900">Total Billed</span>
                  <div className="text-xs text-blue-700">{bills.length} bills</div>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-emerald-900">Amount Paid</span>
                  <div className="text-xs text-emerald-700">
                    {bills.filter(b => b.paymentStatus?.toLowerCase() === 'paid').length} paid bills
                  </div>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-900">{formatCurrency(paidAmount)}</div>
          </div>
          
          <div className={`rounded-xl p-5 shadow-sm border ${
            pendingAmount > 0 
              ? 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200' 
              : 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  pendingAmount > 0 ? 'bg-amber-500' : 'bg-gray-500'
                }`}>
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className={`text-sm font-semibold ${
                    pendingAmount > 0 ? 'text-amber-900' : 'text-gray-900'
                  }`}>
                    Pending Amount
                  </span>
                  <div className={`text-xs ${
                    pendingAmount > 0 ? 'text-amber-700' : 'text-gray-700'
                  }`}>
                    {bills.filter(b => b.paymentStatus?.toLowerCase() !== 'paid').length} pending bills
                  </div>
                </div>
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              pendingAmount > 0 ? 'text-amber-900' : 'text-gray-900'
            }`}>
              {formatCurrency(pendingAmount)}
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
