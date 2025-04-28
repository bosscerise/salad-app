import { useState } from 'react';
import { createPortal } from 'react-dom';

interface ToastOptions {
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>>([]);

  const show = (message: string, type: 'success' | 'error' | 'info', options?: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, options?.duration || 3000);
  };

  const success = (message: string, options?: ToastOptions) => show(message, 'success', options);
  const error = (message: string, options?: ToastOptions) => show(message, 'error', options);
  const info = (message: string, options?: ToastOptions) => show(message, 'info', options);

  const ToastContainer = () => {
    return createPortal(
      <div className="fixed z-50 flex flex-col gap-2 top-4 right-4">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-white ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>,
      document.body
    );
  };

  return { toast: { success, error, info }, ToastContainer };
}