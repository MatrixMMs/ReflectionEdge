import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  const baseClasses = "block w-full rounded-lg shadow-sm sm:text-sm p-2.5";
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <input
        id={id}
        className={`${baseClasses} ${error ? errorClasses : ''} ${className || ''}`}
        style={{
          backgroundColor: 'var(--background-tertiary)',
          borderColor: error ? 'var(--text-error)' : 'var(--border-main)',
          color: 'var(--text-white)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
        {...props}
      />
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--text-error)' }}>{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, error, className, ...props }) => {
  const baseClasses = "block w-full rounded-lg shadow-sm sm:text-sm p-2.5";
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <textarea
        id={id}
        className={`${baseClasses} ${error ? errorClasses : ''} ${className || ''}`}
        style={{
          backgroundColor: 'var(--background-tertiary)',
          borderColor: error ? 'var(--text-error)' : 'var(--border-main)',
          color: 'var(--text-white)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--text-error)' }}>{error}</p>}
    </div>
  );
};
    