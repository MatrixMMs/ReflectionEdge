import React from "react";

function darkenColor(hex: string, amount = 0.35): string {
  // Convert hex to RGB
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xFF;
  let g = (num >> 8) & 0xFF;
  let b = num & 0xFF;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));
  return `rgb(${r}, ${g}, ${b})`;
}

interface TagPillProps {
  label: string;
  bgColor: string;
  textColor?: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  style?: React.CSSProperties;
}

export const TagPill: React.FC<TagPillProps> = ({
  label,
  bgColor,
  textColor,
  className = "",
  onClick,
  selected = false,
  style = {},
}) => {
  // If textColor is not provided, use a darkened version of bgColor
  const computedTextColor = textColor || darkenColor(bgColor, 0.45);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${className}`}
      style={{
        background: bgColor,
        color: computedTextColor,
        opacity: selected ? 1 : 0.85,
        border: selected ? "2px solid #888" : "none",
        fontFamily: 'Inter, Arial, sans-serif',
        lineHeight: 1.1,
        ...style,
      }}
      onClick={onClick}
    >
      {label}
    </span>
  );
}; 