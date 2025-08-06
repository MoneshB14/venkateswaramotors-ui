import React from 'react';
import { useToast } from '../../hooks/useToast';
import SimpleToast from './SimpleToast';

export const Toaster = () => {
  const { toasts, removeToast } = useToast();
  
  console.log('Toaster rendering with toasts:', toasts);

  return (
    <>
      {toasts.map((toast, index) => (
        <SimpleToast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
          index={index}
        />
      ))}
    </>
  );
}; 