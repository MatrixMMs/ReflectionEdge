import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out inline-flex items-center justify-center';

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent-purple)',
          color: 'var(--text-white)',
          borderColor: 'var(--accent-purple)'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--background-tertiary)',
          color: 'var(--text-white)',
          borderColor: 'var(--border-main)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--accent-red)',
          color: 'var(--text-white)',
          borderColor: 'var(--accent-red)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-main)'
        };
      default:
        return {};
    }
  };

  const sizeStyles = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-base',
    icon: 'p-2'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={{
        ...getVariantStyles(variant),
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
    