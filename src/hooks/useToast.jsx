import { toast } from 'sonner';

export const useToast = () => {
  const showToast = {
    success: (title, description) => {
      toast.success(title, {
        description: description,
        duration: 3000,
      });
    },
    error: (title, description) => {
      toast.error(title, {
        description: description,
        duration: 3000,
      });
    },
    info: (title, description) => {
      toast.info(title, {
        description: description,
        duration: 3000,
      });
    },
    warning: (title, description) => {
      toast.warning(title, {
        description: description,
        duration: 3000,
      });
    },
    default: (title, description) => {
      toast(title, {
        description: description,
        duration: 3000,
      });
    },
  };

  return {
    toast: showToast,
    // For backward compatibility
    toasts: [],
    removeToast: () => { },
  };
}; 