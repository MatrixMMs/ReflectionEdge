import React, { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon } from './Icons';

interface NotificationPopupProps {
  title: string;
  message: string;
  details?: string;
  onClose: () => void;
  duration?: number;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  title,
  message,
  details,
  onClose,
  duration = 5000, // Default 5 seconds
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div 
      className="fixed top-5 right-5 w-auto max-w-sm bg-gray-800 border border-purple-500 text-gray-100 p-4 rounded-lg shadow-2xl z-[100] animate-fadeInDown"
      style={{ 
        background: 'var(--background-secondary)', 
        borderColor: 'var(--accent-purple)', 
        color: 'var(--text-white)' 
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
        <div className="flex-grow">
          <p className="font-semibold text-purple-400">{title}</p>
          <p className="text-sm">{message}</p>
          {details && <p className="text-xs text-gray-400 mt-1">{details}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-1 text-gray-400 hover:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Close notification"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
