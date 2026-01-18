import React, { createContext, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }) {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      autoClose: options.autoClose || 3000,
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      autoClose: options.autoClose || 5000,
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      autoClose: options.autoClose || 3000,
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    toast.info(message, {
      autoClose: options.autoClose || 3000,
      ...options,
    });
  };

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </NotificationContext.Provider>
  );
}

// ✅ IMPORTANT: Export default too
export default NotificationProvider;


