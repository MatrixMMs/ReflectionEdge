import React from 'react';
import { CustomDeleteIcon } from '../ui/Icons';

interface MbsDeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  'aria-label'?: string;
}

const MbsDeleteButton: React.FC<MbsDeleteButtonProps> = ({ className = '', 'aria-label': ariaLabel, ...props }) => (
  <button
    type="button"
    aria-label={ariaLabel}
    className={`rounded-lg p-2 flex items-center justify-center transition-colors duration-150 ${className}`}
    style={{
      backgroundColor: 'var(--error)',
      color: 'var(--text-white)',
      border: 'none',
      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.10)',
      outline: 'none',
      cursor: 'pointer',
    }}
    {...props}
  >
    <CustomDeleteIcon className="w-4 h-4" style={{ color: 'var(--text-white)' }} />
  </button>
);

export default MbsDeleteButton; 