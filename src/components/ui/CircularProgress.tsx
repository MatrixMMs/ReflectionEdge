import React from 'react';

interface CircularProgressProps {
  value: number; // The value to display (e.g. 75 for 75%)
  max?: number; // The max value (default 100)
  size?: number; // Diameter in px
  strokeWidth?: number;
  success?: boolean; // Use success color
  error?: boolean; // Use error color
  info?: boolean; // Use info color
  label?: string; // Optional label in the center
}

// Colors (should use CSS vars in real app)
const successColor = 'var(--success-main, #22c55e)';
const errorColor = 'var(--error-main, #ef4444)';
const infoColor = 'var(--accent-blue, #3b82f6)';
const bgColor = 'var(--background-tertiary, #e5e7eb)';

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 48,
  strokeWidth = 6,
  success,
  error,
  info,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(1, value / max));
  const offset = circumference * (1 - percent);
  let color = info ? infoColor : success ? successColor : error ? errorColor : successColor;

  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      {label && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.32}
          fontWeight={700}
          fill="var(--text-main, #22223b)"
        >
          {label}
        </text>
      )}
    </svg>
  );
};

export default CircularProgress; 