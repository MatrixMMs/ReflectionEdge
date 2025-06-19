import React from 'react';
import { XMarkIcon } from './Icons';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isOpen?: boolean; // Prop to control externally if needed, though App.tsx controls it now
  wide?: boolean; // New prop for wide modals
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose, wide }) => {
  // Optional: Add transition effects using Tailwind classes
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className={`bg-gray-800 rounded-xl shadow-2xl w-full ${wide ? 'max-w-5xl' : 'max-w-lg'} max-h-[90vh] flex flex-col overflow-hidden border border-gray-700`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-2xl font-semibold text-purple-400">{title}</h3>
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
    