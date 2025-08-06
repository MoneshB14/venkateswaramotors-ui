import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';

const GlobalContext = createContext();

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

export const GlobalProvider = ({ children }) => {
  const { toast } = useToast();
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    icon: null,
    loading: false,
    priority: 'medium',
    onConfirm: () => {},
  });

  // Enhanced toast functions with automatic API response handling
  const showToast = useCallback((type, title, description) => {
    toast[type](title, description);
  }, [toast]);

  const showSuccess = useCallback((title, description) => {
    showToast('success', title, description);
  }, [showToast]);

  const showError = useCallback((title, description) => {
    showToast('error', title, description);
  }, [showToast]);

  const showInfo = useCallback((title, description) => {
    showToast('info', title, description);
  }, [showToast]);

  const showWarning = useCallback((title, description) => {
    showToast('warning', title, description);
  }, [showToast]);

  // Confirmation dialog functions
  const showConfirmation = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed? This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    icon = null,
    priority = 'medium',
    onConfirm
  }) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      icon,
      priority,
      loading: false,
      onConfirm: async () => {
        if (onConfirm) {
          // Set loading state
          setConfirmationDialog(prev => ({ ...prev, loading: true }));
          try {
            await onConfirm();
          } catch (error) {
            console.error('Confirmation action failed:', error);
          } finally {
            // Reset loading state
            setConfirmationDialog(prev => ({ ...prev, loading: false }));
          }
        }
      },
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Predefined confirmation dialogs for common actions
  const confirmDelete = useCallback(({
    itemName = 'item',
    onConfirm,
    customMessage = null,
    priority = 'high'
  }) => {
    showConfirmation({
      title: 'Confirm Delete',
      message: customMessage || `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      icon: 'Trash2',
      priority,
      onConfirm,
    });
  }, [showConfirmation]);

  const confirmAction = useCallback(({
    title = 'Confirm Action',
    message,
    onConfirm,
    variant = 'default',
    icon = null
  }) => {
    showConfirmation({
      title,
      message,
      onConfirm,
      variant,
      icon,
    });
  }, [showConfirmation]);

  // Additional convenience functions for new variants
  const confirmSuccess = useCallback(({
    title = 'Confirm Success',
    message,
    onConfirm,
    confirmText = 'Continue'
  }) => {
    showConfirmation({
      title,
      message,
      confirmText,
      variant: 'success',
      onConfirm,
    });
  }, [showConfirmation]);

  const confirmInfo = useCallback(({
    title = 'Information',
    message,
    onConfirm,
    confirmText = 'OK'
  }) => {
    showConfirmation({
      title,
      message,
      confirmText,
      variant: 'info',
      onConfirm,
    });
  }, [showConfirmation]);

  const confirmWarning = useCallback(({
    title = 'Warning',
    message,
    onConfirm,
    confirmText = 'Proceed'
  }) => {
    showConfirmation({
      title,
      message,
      confirmText,
      variant: 'warning',
      priority: 'high',
      onConfirm,
    });
  }, [showConfirmation]);

  const confirmCritical = useCallback(({
    title = 'Critical Action',
    message,
    onConfirm,
    confirmText = 'I Understand, Proceed'
  }) => {
    showConfirmation({
      title,
      message,
      confirmText,
      variant: 'destructive',
      priority: 'critical',
      onConfirm,
    });
  }, [showConfirmation]);

  // API response handler
  const handleApiResponse = useCallback((response, successMessage, errorMessage) => {
    if (response && response.success !== false) {
      showSuccess(successMessage || 'Operation completed successfully');
      return true;
    } else {
      const error = response?.message || response?.error || errorMessage || 'An error occurred';
      showError('Error', error);
      return false;
    }
  }, [showSuccess, showError]);

  // API error handler
  const handleApiError = useCallback((error, customMessage = null) => {
    let errorMessage = customMessage;
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'You are not authorized to perform this action.';
          break;
        case 403:
          errorMessage = 'Access forbidden. You don\'t have permission for this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = data?.message || 'Conflict. This resource already exists.';
          break;
        case 422:
          errorMessage = data?.message || 'Validation error. Please check your input.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = data?.message || `Server error (${status}). Please try again.`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection and try again.';
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred.';
    }

    showError('Error', errorMessage);
  }, [showError]);



  const value = {
    // Toast functions
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    
    // Confirmation dialog functions
    showConfirmation,
    closeConfirmation,
    confirmDelete,
    confirmAction,
    confirmSuccess,
    confirmInfo,
    confirmWarning,
    confirmCritical,
    
    // API response handlers
    handleApiResponse,
    handleApiError,
    
    // Dialog state
    confirmationDialog,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmText={confirmationDialog.confirmText}
        cancelText={confirmationDialog.cancelText}
        variant={confirmationDialog.variant}
        icon={confirmationDialog.icon}
        loading={confirmationDialog.loading}
        priority={confirmationDialog.priority}
      />
    </GlobalContext.Provider>
  );
}; 