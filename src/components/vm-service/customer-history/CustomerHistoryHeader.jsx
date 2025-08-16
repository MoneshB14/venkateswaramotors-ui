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
    Calendar
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

    return (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            {/* Compact Info Bar */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Customer Essential Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            {customerRating > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Star className="w-2.5 h-2.5 text-yellow-800 fill-current" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">{customerName}</h1>
                                <div className="text-xs text-gray-500">
                                    Last updated: {lastFetched ? getRelativeTime(lastFetched) : 'Just now'}
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-md border border-gray-200">
                                    <Car className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">{data?.vehicleRegistration || registration}</span>
                                </div>

                                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-md border border-gray-200">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-sm text-gray-700">{customerPhone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Bar */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg px-2 sm:px-3 py-2 border border-gray-200 shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            disabled={loading}
                            className="h-8 px-2 sm:px-3 hover:bg-gray-100"
                            title="Refresh data"
                            aria-label="Refresh customer data"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden lg:inline ml-1">Refresh</span>
                        </Button>

                        {/* {onShowFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onShowFilters}
                        className={`h-8 px-2 sm:px-3 hover:bg-gray-100 ${hasActiveFilters ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : ''}`}
                        title="Filter data"
                        aria-label="Filter customer data"
                    >
                        <Settings className="h-4 w-4" />
                        <span className="hidden lg:inline ml-1">Filter</span>
                        {hasActiveFilters && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-1"></div>
                        )}
                    </Button>
                )} */}

                        {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExport}
                    className="h-8 px-2 sm:px-3 hover:bg-gray-100"
                    title="Export data"
                    aria-label="Export customer data"
                >
                    <Download className="h-4 w-4" />
                    <span className="hidden lg:inline ml-1">Export</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSetReminder}
                    className="h-8 px-2 sm:px-3 hover:bg-gray-100"
                    title="Set reminder"
                    aria-label="Set customer reminder"
                >
                    <Bell className="h-4 w-4" />
                    <span className="hidden lg:inline ml-1">Remind</span>
                </Button> */}

                        <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            title="Close modal"
                            aria-label="Close customer details"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Key Metrics Bar */}
            <div className="bg-white px-4 py-3 border-t border-gray-100">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{totalVisits}</div>
                        <div className="text-xs text-gray-500">Total Visits</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalBilled)}</div>
                        <div className="text-xs text-gray-500">Total Billed</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{getRelativeTime(lastVisit)}</div>
                        <div className="text-xs text-gray-500">Last Visit</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {data?.bookings?.length > 0 ?
                                new Date(data.bookings[data.bookings.length - 1].createdAt).getFullYear() :
                                '2025'
                            }
                        </div>
                        <div className="text-xs text-gray-500">Customer Since</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerHistoryHeader;
