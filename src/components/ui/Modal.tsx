import React from 'react';
import { XMarkIcon } from './Icons';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose, size = 'medium' }) => {
  const sizeStyles = {
    small: 'max-w-md',
    medium: 'max-w-xl',
    large: 'max-w-4xl',
    full: 'max-w-7xl w-full'
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      <div
        className={`bg-gray-800 rounded-xl shadow-2xl w-full ${sizeStyles[size]} max-h-[90vh] flex flex-col overflow-hidden border border-gray-700`}
        style={{ background: 'var(--background-secondary)', borderColor: 'var(--border-main)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center py-3 px-6 border-b border-gray-700">
          <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-main)', marginTop: '10px' }}>{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
    