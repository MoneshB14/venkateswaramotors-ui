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
  Activity,
  CheckCircle
} from 'lucide-react';
import { calculateCustomerStats, formatCurrency, formatDate, getRelativeTime } from '../../../utils/customerUtils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

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
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue</div>
              <div className="text-4xl font-semibold text-gray-900">{formatCurrency(stats.totalBilled)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Payment Rate</div>
              <div className="text-2xl font-semibold text-gray-700">{stats.paymentRate}%</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <div className="text-xs text-gray-500 mb-1">Paid</div>
              <div className="text-lg font-semibold text-emerald-600">{formatCurrency(stats.paidAmount)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Pending</div>
              <div className={`text-lg font-semibold ${stats.pendingAmount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                {formatCurrency(stats.pendingAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className={`border rounded-lg p-6 ${
          stats.pendingAmount > 0 
            ? 'bg-amber-50/50 border-amber-200' 
            : 'bg-emerald-50/50 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                {stats.pendingAmount > 0 ? 'Outstanding Balance' : 'Payment Status'}
              </div>
              <div className={`text-4xl font-semibold ${
                stats.pendingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {stats.pendingAmount > 0 ? formatCurrency(stats.pendingAmount) : '₹0'}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              stats.pendingAmount > 0 ? 'bg-amber-100' : 'bg-emerald-100'
            }`}>
              {stats.pendingAmount > 0 ? (
                <Clock className="h-6 w-6 text-amber-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              )}
            </div>
          </div>
          
          <div className={`text-sm ${stats.pendingAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {stats.pendingAmount > 0 
              ? `${data.bills?.filter(b => b.paymentStatus !== 'paid').length || 0} unpaid bills require attention`
              : 'All payments completed'}
          </div>
        </div>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Bookings</div>
          <div className="text-3xl font-semibold text-gray-900 mb-3">{stats.totalBookings}</div>
          <div className="text-xs text-gray-600">{stats.completionRate}% completion rate</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500 mb-2">Visit Frequency</div>
          <div className="text-3xl font-semibold text-gray-900 mb-3">
            {stats.averageDaysBetweenVisits > 0 ? `${stats.averageDaysBetweenVisits}d` : '—'}
          </div>
          <div className="text-xs text-gray-600">Average between visits</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500 mb-2">Payment Rate</div>
          <div className="text-3xl font-semibold text-gray-900 mb-3">{stats.paymentRate}%</div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-900 rounded-full transition-all duration-300"
              style={{ width: `${stats.paymentRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500 mb-2">Top Service</div>
          <div className="text-lg font-semibold text-gray-900 mb-3 truncate">{stats.mostFrequentService}</div>
          <div className="text-xs text-gray-600">Most requested</div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Distribution Chart */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Service Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.serviceTypes).length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.serviceTypes)
                        .sort(([,a], [,b]) => b - a)
                        .map(([service, count]) => ({
                          name: service,
                          value: count,
                          percentage: ((count / stats.totalBookings) * 100).toFixed(1)
                        }))
                      }
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(stats.serviceTypes).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index % 5]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} visits (${((value / stats.totalBookings) * 100).toFixed(1)}%)`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Simple Legend */}
                <div className="space-y-2">
                  {Object.entries(stats.serviceTypes)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([service, count], index) => (
                      <div key={service} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index] }}
                          />
                          <span className="text-sm text-gray-700">{service}</span>
                        </div>
                        <span className="text-sm text-gray-600">{count} visits</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No service data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Overview Chart */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Payment Rate Chart */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Paid', value: stats.paidAmount },
                          { name: 'Pending', value: stats.pendingAmount }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{stats.paymentRate}%</div>
                      <div className="text-xs text-gray-500">Paid</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-emerald-800">Amount Paid</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-900">{formatCurrency(stats.paidAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-amber-800">Pending Amount</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-900">{formatCurrency(stats.pendingAmount)}</span>
                </div>
              </div>

              {/* Visit Timeline */}
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Last Visit</div>
                    <div className="text-sm font-semibold text-gray-900">{getRelativeTime(stats.lastVisit)}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">First Visit</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {data.bookings?.length > 0 ?
                        new Date(data.bookings[data.bookings.length - 1].createdAt).getFullYear() :
                        '—'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerStatsOverview;
