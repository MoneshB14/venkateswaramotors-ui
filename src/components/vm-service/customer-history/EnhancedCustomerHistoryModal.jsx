import React, { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import {
  Loader2,
  AlertCircle,
  BarChart3,
  Calendar,
  Receipt,
  Settings,
  TrendingUp
} from 'lucide-react';

import CustomerHistoryHeader from './CustomerHistoryHeader';
import CustomerStatsOverview from './CustomerStatsOverview';
import BookingsHistoryTable from './BookingsHistoryTable';
import BillsHistoryTable from './BillsHistoryTable';
import ReminderDialog from './ReminderDialog';
import AdvancedFilters from './AdvancedFilters';

import { useCustomerHistory } from '../../../hooks/useCustomerHistory';
import { useToast } from '../../../hooks/useToast';
import { exportToCSV, searchInCustomerData } from '../../../utils/customerUtils';

const EnhancedCustomerHistoryModal = ({
  isOpen,
  registration,
  onClose,
  shouldFetch = true,
  prefetchedData = null,
  externalLoading = false,
  onViewBookingDetails,
  onGenerateBill,
  onViewBill,
  onDownloadBill,
  onMarkPaid,
  onSetReminder
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const {
    data,
    loading,
    error,
    lastFetched,
    refresh,
    clearCache
  } = useCustomerHistory(registration, {
    shouldFetch: shouldFetch && isOpen,
    prefetchedData,
    enableCache: true,
    autoRefresh: false
  });

  const handleExport = useCallback(() => {
    if (!data) return;

    try {
      exportToCSV(data, `customer_history_${registration}_${new Date().toISOString().split('T')[0]}`);
      toast.success('Export successful', 'Customer history exported successfully');
    } catch (error) {
      toast.error('Export failed', 'Failed to export customer history');
    }
  }, [data, registration, toast]);

  const handleSetReminder = useCallback((reminderData) => {
    if (onSetReminder) {
      onSetReminder(reminderData);
    } else {
      // Default implementation - you can integrate with your backend here
      console.log('Setting reminder:', reminderData);
      toast.success('Reminder Set', 'Customer reminder has been scheduled successfully');
    }
  }, [onSetReminder, toast]);

  const handleShowReminderDialog = useCallback(() => {
    setShowReminderDialog(true);
  }, []);

  const handleApplyFilters = useCallback((filters) => {
    setAppliedFilters(filters);
    toast.success('Filters Applied', 'Data has been filtered according to your criteria');
  }, [toast]);

  const handleResetFilters = useCallback(() => {
    setAppliedFilters({});
    toast.info('Filters Reset', 'All filters have been cleared');
  }, [toast]);

  const handleViewBookingDetails = useCallback((booking) => {
    if (onViewBookingDetails) {
      onViewBookingDetails(booking);
    } else {
      toast.info('Feature coming soon', 'Booking details view will be available soon');
    }
  }, [onViewBookingDetails, toast]);

  const handleGenerateBill = useCallback((booking) => {
    if (onGenerateBill) {
      onGenerateBill(booking);
    } else {
      toast.info('Feature coming soon', 'Bill generation will be available soon');
    }
  }, [onGenerateBill, toast]);

  const handleViewBill = useCallback((bill) => {
    if (onViewBill) {
      onViewBill(bill);
    } else {
      toast.info('Feature coming soon', 'Bill view will be available soon');
    }
  }, [onViewBill, toast]);

  const handleDownloadBill = useCallback((bill) => {
    if (onDownloadBill) {
      onDownloadBill(bill);
    } else {
      toast.info('Feature coming soon', 'Bill download will be available soon');
    }
  }, [onDownloadBill, toast]);

  const handleMarkPaid = useCallback((bill) => {
    if (onMarkPaid) {
      onMarkPaid(bill);
    } else {
      toast.info('Feature coming soon', 'Payment marking will be available soon');
    }
  }, [onMarkPaid, toast]);

  if (!isOpen) return null;

  const isLoading = loading || externalLoading;

  // Apply filters to data
  const filteredData = data ? (() => {
    let filtered = { ...data };

    // Apply date filters
    if (appliedFilters.dateRange?.start || appliedFilters.dateRange?.end) {
      const startDate = appliedFilters.dateRange.start ? new Date(appliedFilters.dateRange.start) : new Date(0);
      const endDate = appliedFilters.dateRange.end ? new Date(appliedFilters.dateRange.end) : new Date();

      filtered.bookings = filtered.bookings?.filter(booking => {
        const bookingDate = new Date(booking.createdAt || booking.preferredDate);
        return bookingDate >= startDate && bookingDate <= endDate;
      });

      filtered.bills = filtered.bills?.filter(bill => {
        const billDate = new Date(bill.billDate);
        return billDate >= startDate && billDate <= endDate;
      });
    }

    // Apply amount filters
    if (appliedFilters.amountRange?.min || appliedFilters.amountRange?.max) {
      const minAmount = appliedFilters.amountRange.min ? Number(appliedFilters.amountRange.min) : 0;
      const maxAmount = appliedFilters.amountRange.max ? Number(appliedFilters.amountRange.max) : Infinity;

      filtered.bills = filtered.bills?.filter(bill => {
        const amount = Number(bill.total) || 0;
        return amount >= minAmount && amount <= maxAmount;
      });
    }

    // Apply service type filters
    if (appliedFilters.serviceTypes?.length > 0) {
      filtered.bookings = filtered.bookings?.filter(booking =>
        appliedFilters.serviceTypes.includes(booking.serviceType)
      );
    }

    // Apply booking status filters
    if (appliedFilters.bookingStatuses?.length > 0) {
      filtered.bookings = filtered.bookings?.filter(booking =>
        appliedFilters.bookingStatuses.includes(booking.bookingStatus)
      );
    }

    // Apply payment status filters
    if (appliedFilters.paymentStatuses?.length > 0) {
      filtered.bills = filtered.bills?.filter(bill =>
        appliedFilters.paymentStatuses.includes(bill.paymentStatus)
      );
    }

    // Apply technician filters
    if (appliedFilters.technicians?.length > 0) {
      filtered.bookings = filtered.bookings?.filter(booking =>
        appliedFilters.technicians.includes(booking.assignedTechnician)
      );
    }

    return filtered;
  })() : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl max-w-7xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Header */}
        <CustomerHistoryHeader
          data={data}
          registration={registration}
          onClose={onClose}
          onRefresh={refresh}
          onExport={handleExport}
          onSetReminder={handleShowReminderDialog}
          onShowFilters={() => setShowAdvancedFilters(true)}
          loading={isLoading}
          lastFetched={lastFetched}
          hasActiveFilters={Object.keys(appliedFilters).some(key =>
            appliedFilters[key] &&
            (Array.isArray(appliedFilters[key]) ? appliedFilters[key].length > 0 :
              typeof appliedFilters[key] === 'object' ? Object.values(appliedFilters[key]).some(v => v) :
                appliedFilters[key])
          )}
        />

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Error State */}
          {error && !isLoading && (
            <div className="p-6">
              <Card className="border-red-200 bg-red-50">
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Customer History</h3>
                      <p className="text-sm text-red-700 mb-4">{error}</p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refresh}
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Try Again
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearCache}
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Clear Cache
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !data && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Customer History</h3>
                <p className="text-gray-600">Please wait while we fetch the customer's data...</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!isLoading && !error && data && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Modern Tab Navigation */}
              <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-3 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'overview'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    aria-label="View overview tab"
                  >
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-semibold text-sm sm:text-base">Overview</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'bookings'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    aria-label="View bookings tab"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-semibold text-sm sm:text-base">Bookings</span>
                    <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                      {data.bookings?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('bills')}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'bills'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    aria-label="View bills tab"
                  >
                    <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-semibold text-sm sm:text-base">Bills</span>
                    <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                      {data.bills?.length || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                {activeTab === 'overview' && (
                  <div className="p-3 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                      <CustomerStatsOverview data={filteredData || data} />
                    </div>
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="p-3 sm:p-6">
                    <BookingsHistoryTable
                      bookings={filteredData?.bookings || data?.bookings || []}
                    />
                  </div>
                )}

                {activeTab === 'bills' && (
                  <div className="p-3 sm:p-6">
                    <BillsHistoryTable
                      bills={filteredData?.bills || data?.bills || []}
                      onViewBill={handleViewBill}
                      onDownloadBill={handleDownloadBill}
                      onMarkPaid={handleMarkPaid}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!isLoading && !error && !data && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600 mb-4">No customer history found for registration: {registration}</p>
                <Button onClick={refresh} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dialogs */}
        <ReminderDialog
          isOpen={showReminderDialog}
          customerData={data}
          onClose={() => setShowReminderDialog(false)}
          onSetReminder={handleSetReminder}
        />

        <AdvancedFilters
          isOpen={showAdvancedFilters}
          data={data}
          currentFilters={appliedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </div>
    </div>
  );
};

export default EnhancedCustomerHistoryModal;
