
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  const baseClasses = "block w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5";
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <input
        id={id}
        className={`${baseClasses} ${error ? errorClasses : ''} ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, error, className, ...props }) => {
  const baseClasses = "block w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5";
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <textarea
        id={id}
        className={`${baseClasses} ${error ? errorClasses : ''} ${className || ''}`}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};
    