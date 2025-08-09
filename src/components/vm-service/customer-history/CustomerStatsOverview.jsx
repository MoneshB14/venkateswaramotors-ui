import React from 'react';
import { StatsCard } from '../../ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Calendar,
  Receipt,
  TrendingUp,
  Clock,
  Wrench,
  CreditCard,
  Target,
  Activity
} from 'lucide-react';
import { calculateCustomerStats, formatCurrency, formatDate, getRelativeTime } from '../../../utils/customerUtils';

const CustomerStatsOverview = ({ data }) => {
  if (!data) return null;

  const stats = calculateCustomerStats(data);

  const statsCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      subtitle: `${stats.completionRate}% completion rate`,
      icon: Calendar,
      variant: 'primary',
      trend: stats.completionRate > 75 ? 'up' : stats.completionRate < 50 ? 'down' : 'neutral',
      trendValue: `${stats.completedBookings} completed`
    },
    {
      title: 'Total Billed',
      value: formatCurrency(stats.totalBilled),
      subtitle: `${stats.paymentRate}% payment rate`,
      icon: Receipt,
      variant: 'success',
      trend: stats.paymentRate > 80 ? 'up' : stats.paymentRate < 60 ? 'down' : 'neutral',
      trendValue: formatCurrency(stats.paidAmount)
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(stats.pendingAmount),
      subtitle: `${data.bills?.filter(b => b.paymentStatus !== 'paid').length || 0} unpaid bills`,
      icon: CreditCard,
      variant: stats.pendingAmount > 0 ? 'warning' : 'success',
      trend: stats.pendingAmount > 0 ? 'down' : 'up'
    },
    {
      title: 'Visit Frequency',
      value: stats.averageDaysBetweenVisits > 0 ? `${stats.averageDaysBetweenVisits} days` : 'First visit',
      subtitle: 'Average between visits',
      icon: Activity,
      variant: 'default',
      trend: stats.averageDaysBetweenVisits < 30 ? 'up' : stats.averageDaysBetweenVisits > 90 ? 'down' : 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Detailed Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Service Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Most Frequent Service</span>
              <Badge variant="primary">{stats.mostFrequentService}</Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Service Distribution</span>
              <div className="space-y-2">
                {Object.entries(stats.serviceTypes)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([service, count]) => (
                    <div key={service} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{service}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(count / stats.totalBookings) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Visit Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Visit</span>
              <span className="text-sm font-medium">{getRelativeTime(stats.lastVisit)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">First Visit</span>
              <span className="text-sm font-medium">
                {formatDate(data.bookings?.[data.bookings?.length - 1]?.createdAt)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Visits</span>
              <Badge variant="success">{stats.totalBookings}</Badge>
            </div>
            
            {stats.averageDaysBetweenVisits > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.averageDaysBetweenVisits}</div>
                  <div className="text-xs text-gray-500">days average between visits</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Rate</span>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{stats.paymentRate}%</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(stats.paidAmount)} / {formatCurrency(stats.totalBilled)}
                  </div>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${stats.paymentRate}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Paid: {formatCurrency(stats.paidAmount)}</span>
                <span>Pending: {formatCurrency(stats.pendingAmount)}</span>
              </div>
            </div>

            {stats.pendingAmount > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-amber-700">Outstanding payment required</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerStatsOverview;
