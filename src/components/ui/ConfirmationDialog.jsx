import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X, CheckCircle, Info, AlertCircle, Shield, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default", // default, destructive, warning, success, info
  icon: Icon,
  loading = false,
  priority = "medium" // low, medium, high, critical
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      // Focus the appropriate button based on variant
      setTimeout(() => {
        if (variant === 'destructive' || priority === 'critical') {
          cancelButtonRef.current?.focus();
        } else {
          confirmButtonRef.current?.focus();
        }
      }, 100);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, variant, priority]);

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen, loading]);

  const getVariantConfig = () => {
    const priorityStyles = {
      critical: {
        backdrop: 'bg-red-900/10',
        glow: 'shadow-red-500/20 shadow-lg',
        pulse: ''
      },
      high: {
        backdrop: 'bg-orange-900/5',
        glow: 'shadow-orange-500/10 shadow-md',
        pulse: ''
      },
      medium: {
        backdrop: '',
        glow: 'shadow-slate-500/10 shadow-md',
        pulse: ''
      },
      low: {
        backdrop: '',
        glow: 'shadow-slate-500/5 shadow-sm',
        pulse: ''
      }
    };

    const basePriorityStyle = priorityStyles[priority] || priorityStyles.medium;

    switch (variant) {
      case 'destructive':
        return {
          icon: Icon || Trash2,
          iconBg: 'bg-red-50 border border-red-200/50',
          iconColor: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500/40',
          accent: 'border-l-red-500',
          headerBg: 'bg-gradient-to-r from-red-50/30 to-transparent',
          ...basePriorityStyle
        };
      case 'warning':
        return {
          icon: Icon || AlertTriangle,
          iconBg: 'bg-amber-50 border border-amber-200/50',
          iconColor: 'text-amber-600',
          button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/40',
          accent: 'border-l-amber-500',
          headerBg: 'bg-gradient-to-r from-amber-50/30 to-transparent',
          ...basePriorityStyle
        };
      case 'success':
        return {
          icon: Icon || CheckCircle,
          iconBg: 'bg-emerald-50 border border-emerald-200/50',
          iconColor: 'text-emerald-600',
          button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/40',
          accent: 'border-l-emerald-500',
          headerBg: 'bg-gradient-to-r from-emerald-50/30 to-transparent',
          ...basePriorityStyle
        };
      case 'info':
        return {
          icon: Icon || Info,
          iconBg: 'bg-blue-50 border border-blue-200/50',
          iconColor: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/40',
          accent: 'border-l-blue-500',
          headerBg: 'bg-gradient-to-r from-blue-50/30 to-transparent',
          ...basePriorityStyle
        };
      default:
        return {
          icon: Icon || Shield,
          iconBg: 'bg-slate-50 border border-slate-200/50',
          iconColor: 'text-slate-600',
          button: 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-500/40',
          accent: 'border-l-slate-500',
          headerBg: 'bg-gradient-to-r from-slate-50/30 to-transparent',
          ...basePriorityStyle
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "transition-all duration-300 ease-out",
        "bg-black/70 backdrop-blur-lg",
        config.backdrop,
        isAnimating ? "opacity-100" : "opacity-0"
      )}
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          "relative w-full max-w-sm transform transition-all duration-300 ease-out",
          "bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20",
          "shadow-xl",
          config.glow,
          config.accent,
          "border-l-3 overflow-hidden",
          config.pulse,
          isAnimating 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-95 opacity-0 translate-y-4"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {/* Header */}
        <div className={cn("relative px-5 py-4", config.headerBg)}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 
                id="dialog-title"
                className="text-lg font-semibold text-slate-900 leading-6"
              >
                {title}
              </h3>
              {priority === 'critical' && (
                <div className="flex items-center mt-1 text-xs text-red-600 font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  Critical
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className={cn(
                "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                "text-slate-400 hover:text-slate-600 hover:bg-white/60",
                "transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-slate-400/50",
                loading && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-4">
          <p 
            id="dialog-description"
            className="text-slate-600 leading-relaxed text-sm"
          >
            {message}
          </p>
          {priority === 'critical' && (
            <div className="mt-3 p-3 bg-red-50/80 rounded-lg border border-red-100/60">
              <p className="text-red-700 text-xs font-medium">
                ⚠️ This action cannot be undone
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-slate-50/60 to-white/60 backdrop-blur-sm border-t border-white/20">
          <div className="flex items-center justify-end space-x-3">
            <button
              ref={cancelButtonRef}
              onClick={handleCancel}
              disabled={loading}
              className={cn(
                "px-4 py-2 text-sm font-medium text-slate-700 bg-white/80",
                "border border-slate-200/60 rounded-lg hover:bg-white",
                "focus:outline-none focus:ring-1 focus:ring-slate-400/50",
                "transition-all duration-200 shadow-sm hover:shadow-md",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white rounded-lg",
                "focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all duration-200",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                config.button,
                loading && "animate-pulse"
              )}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 