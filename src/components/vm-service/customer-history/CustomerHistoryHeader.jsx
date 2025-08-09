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
    const [searchTerm, setSearchTerm] = useState('');

    const customerName = data?.customerName || 'Customer';
    const customerPhone = data?.contactNumber || '—';
    const totalVisits = data?.totalVisits ?? data?.bookings?.length ?? 0;
    const totalBilled = data?.totalBilledAmount ?? data?.bills?.reduce((sum, bill) => sum + (Number(bill.total) || 0), 0) ?? 0;
    const lastVisit = data?.bookings?.[0]?.createdAt || data?.lastVisit;

    // Customer rating calculation
    const completedBookings = data?.bookings?.filter(b => b.bookingStatus?.toLowerCase() === 'completed').length || 0;
    const totalBookings = data?.bookings?.length || 0;
    const customerRating = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 5) : 0;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="p-4 sm:p-6">
                {/* Top Row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            {customerRating > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Star className="w-3 h-3 text-yellow-800 fill-current" />
                                </div>
                            )}
                        </div>

                        {/* Customer Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{customerName}</h1>
                                {customerRating > 0 && (
                                    <Badge variant="success" className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        {customerRating.toFixed(1)}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <Car className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-gray-700">{data?.vehicleRegistration || registration}</span>
                                </div>

                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <Phone className="w-4 h-4 text-emerald-600" />
                                    <span className="text-gray-700">{customerPhone}</span>
                                </div>

                                {data?.address && (
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                        <span className="text-gray-700 truncate max-w-32">{data.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 border-gray-300"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>

                        {onShowFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onShowFilters}
                                className={`flex items-center gap-2 ${hasActiveFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
                            >
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Filter</span>
                                {hasActiveFilters && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onExport}
                            className="flex items-center gap-2 border-gray-300"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSetReminder}
                            className="flex items-center gap-2 border-gray-300"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Remind</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="h-9 w-9 p-0 border-gray-300"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Total Visits</div>
                        <div className="text-lg font-bold text-gray-900">{totalVisits}</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Total Billed</div>
                        <div className="text-lg font-bold text-emerald-600">{formatCurrency(totalBilled)}</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Last Visit</div>
                        <div className="text-sm font-medium text-gray-900">{getRelativeTime(lastVisit)}</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Customer Since</div>
                        <div className="text-sm font-medium text-gray-900">
                            {data?.bookings?.length > 0 ?
                                new Date(data.bookings[data.bookings.length - 1].createdAt).getFullYear() :
                                '—'
                            }
                        </div>
                    </div>
                </div>

                {/* Last Updated Info */}
                {lastFetched && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Last updated: {getRelativeTime(lastFetched)}
                        </div>
                        {loading && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                Updating...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerHistoryHeader;
