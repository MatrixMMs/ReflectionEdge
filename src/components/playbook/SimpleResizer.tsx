import React, { useState } from 'react';

interface SimpleResizerProps {
  onResize: (width: number, height: number) => void;
  color?: string;
}

const SimpleResizer: React.FC<SimpleResizerProps> = ({ onResize, color = '#6366f1' }) => {
  const [size, setSize] = useState({ width: 120, height: 60 });

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) {
        newWidth = Math.max(100, startWidth + deltaX);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(100, startWidth - deltaX);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(60, startHeight + deltaY);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(60, startHeight - deltaY);
      }

      setSize({ width: newWidth, height: newHeight });
      onResize(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          width: size.width,
          height: size.height,
          background: '#fff',
          border: `2px solid ${color}`,
          borderRadius: 8,
          position: 'relative',
        }}
      >
        <div style={{ padding: 16, textAlign: 'center' }}>
          {size.width} x {size.height}
        </div>
      </div>
      
      {/* Simple corner handle */}
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          right: -8,
          width: 16,
          height: 16,
          background: color,
          border: '3px solid #fff',
          borderRadius: '50%',
          cursor: 'se-resize',
          zIndex: 1000,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
        title="Resize"
      />
    </div>
  );
};

export default SimpleResizer; 