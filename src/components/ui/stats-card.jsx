import React from 'react';
import { Card, CardContent } from './card';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  className,
  variant = "default",
  loading = false 
}) => {
  const variants = {
    default: "bg-white border-gray-200",
    primary: "bg-blue-50 border-blue-200",
    success: "bg-emerald-50 border-emerald-200",
    warning: "bg-amber-50 border-amber-200",
    error: "bg-red-50 border-red-200"
  };

  const iconColors = {
    default: "text-gray-600 bg-gray-100",
    primary: "text-blue-600 bg-blue-100",
    success: "text-emerald-600 bg-emerald-100",
    warning: "text-amber-600 bg-amber-100",
    error: "text-red-600 bg-red-100"
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className={cn(variants[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            )}
            {subtitle && (
              <div className="flex items-center gap-1">
                {trendValue && (
                  <span className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
                    {getTrendIcon()}
                    {trendValue}
                  </span>
                )}
                <p className="text-xs text-gray-500">{subtitle}</p>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg", iconColors[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { StatsCard };
