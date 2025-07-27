import React from 'react';
import { useToast } from '../../hooks/useToast';
import { Toast, ToastTitle, ToastDescription, ToastClose } from './toast';

export const Toaster = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          onOpenChange={() => removeToast(toast.id)}
        >
          <div className="flex flex-col gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
    </>
  );
}; 