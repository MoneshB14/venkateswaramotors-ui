import toast from 'react-hot-toast';

export const useToast = () => {
  const showToast = {
    success: (title, description) => {
      toast.success(
        <div>
          <div className="font-semibold">{title}</div>
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>,
        {
          duration: 5000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
        }
      );
    },
    error: (title, description) => {
      toast.error(
        <div>
          <div className="font-semibold">{title}</div>
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>,
        {
          duration: 5000,
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
        }
      );
    },
    info: (title, description) => {
      toast(
        <div>
          <div className="font-semibold">{title}</div>
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>,
        {
          duration: 5000,
          style: {
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
          },
        }
      );
    },
    warning: (title, description) => {
      toast(
        <div>
          <div className="font-semibold">{title}</div>
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>,
        {
          duration: 5000,
          style: {
            background: '#fffbeb',
            color: '#d97706',
            border: '1px solid #fde68a',
          },
        }
      );
    },
    default: (title, description) => {
      toast(
        <div>
          <div className="font-semibold">{title}</div>
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>,
        {
          duration: 5000,
        }
      );
    },
  };

  return {
    toast: showToast,
    // For backward compatibility
    toasts: [],
    removeToast: () => {},
  };
}; 