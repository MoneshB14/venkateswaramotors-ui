import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import {
    X,
    User,
    Phone,
    Car,
    RefreshCw,
    Search,
    Download,
    Settings,
    Bell,
    Star,
    MapPin,
    Calendar,
    TrendingUp,
    Award
} from 'lucide-react';
import { formatCurrency, getRelativeTime } from '../../../utils/customerUtils';

const CustomerHistoryHeader = ({
    data,
    registration,
    onClose,
    onRefresh,
    onExport,
    onSetReminder,
    onShowFilters,
    loading = false,
    lastFetched,
    hasActiveFilters = false
}) => {
    const customerName = data?.customerName || 'Customer';
    const customerPhone = data?.contactNumber || '—';
    const totalVisits = data?.totalVisits ?? data?.bookings?.length ?? 0;
    const totalBilled = data?.totalBilledAmount ?? data?.bills?.reduce((sum, bill) => sum + (Number(bill.total) || 0), 0) ?? 0;
    const pendingAmount = data?.bills?.filter(b => b.paymentStatus?.toLowerCase() !== 'paid').reduce((sum, bill) => sum + (Number(bill.total) || 0), 0) ?? 0;
    const lastVisit = data?.bookings?.[0]?.createdAt || data?.lastVisit;

    // Customer rating calculation
    const completedBookings = data?.bookings?.filter(b => b.bookingStatus?.toLowerCase() === 'completed').length || 0;
    const totalBookings = data?.bookings?.length || 0;
    const customerRating = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 5) : 0;
    const paymentRate = data?.bills?.length > 0 ? Math.round((data.bills.filter(b => b.paymentStatus?.toLowerCase() === 'paid').length / data.bills.length) * 100) : 100;

    return (
        <div className="sticky top-0 z-10 border-b border-gray-200/80 backdrop-blur-xl bg-white/95">
            {/* Professional Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                    {/* Customer Identity */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 rounded-xl flex items-center justify-center ring-1 ring-gray-200">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            {customerRating >= 4 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-white">
                                    <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white fill-current" />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">{customerName}</h1>
                                {paymentRate === 100 && totalBookings > 0 && (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-xs flex-shrink-0">
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                                <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5">
                                    <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">{data?.vehicleRegistration || registration}</span>
                                </span>
                                <span className="text-gray-300 hidden xs:inline">•</span>
                                <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                    <span className="truncate">{customerPhone}</span>
                                </span>
                                <span className="text-gray-300 hidden sm:inline">•</span>
                                <span className="text-xs text-gray-400 hidden sm:inline">
                                    Updated {lastFetched ? getRelativeTime(lastFetched) : 'now'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            disabled={loading}
                            className="h-8 sm:h-9 px-2 sm:px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline ml-2 text-sm">Refresh</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Key Metrics - Professional Grid */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-0.5">
                        <div className="text-xs text-gray-500 font-medium">Total Visits</div>
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">{totalVisits}</div>
                    </div>

                    <div className="space-y-0.5">
                        <div className="text-xs text-gray-500 font-medium">Total Billed</div>
                        <div className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{formatCurrency(totalBilled)}</div>
                    </div>

                    <div className="space-y-0.5">
                        <div className="text-xs text-gray-500 font-medium">Last Visit</div>
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">{getRelativeTime(lastVisit)}</div>
                    </div>

                    <div className="space-y-0.5">
                        <div className="text-xs text-gray-500 font-medium">Customer Since</div>
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">
                            {data?.bookings?.length > 0 ?
                                new Date(data.bookings[data.bookings.length - 1].createdAt).getFullYear() :
                                '2025'
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerHistoryHeader;
