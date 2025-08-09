import React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  error: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  primary: "bg-blue-600 text-white border-blue-600",
  outline: "bg-white text-gray-700 border-gray-300"
};

const Badge = ({ className, variant = "default", ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
};

export { Badge, badgeVariants };
