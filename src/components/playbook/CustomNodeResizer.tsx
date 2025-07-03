import React, { useState, useRef, useEffect } from 'react';

interface CustomNodeResizerProps {
  nodeId?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  color?: string;
  isVisible?: boolean;
  onResize?: (width: number, height: number) => void;
  width?: number;
  height?: number;
}

const CustomNodeResizer: React.FC<CustomNodeResizerProps> = ({
  nodeId,
  minWidth = 100,
  minHeight = 60,
  maxWidth = 500,
  maxHeight = 300,
  color = '#6366f1',
  isVisible = true,
  onResize,
  width = 120,
  height = 60,
}) => {
  const [currentSize, setCurrentSize] = useState({ width, height });
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });
  const isResizingRef = useRef(false);

  useEffect(() => {
    setCurrentSize({ width, height });
  }, [width, height]);

  if (!isVisible) {
    return null;
  }

  const startResize = (e: React.MouseEvent, direction: string) => {
    // Prevent React Flow from handling this event
    e.preventDefault();
    e.stopPropagation();
    
    // Disable React Flow's node dragging temporarily
    const reactFlowNode = e.currentTarget.closest('.react-flow__node') as HTMLElement;
    if (reactFlowNode) {
      reactFlowNode.style.pointerEvents = 'none';
    }
    
    console.log('Starting resize:', direction);
    
    isResizingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { width: currentSize.width, height: currentSize.height };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;

      // Prevent default to stop React Flow from interfering
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      const deltaX = moveEvent.clientX - startPosRef.current.x;
      const deltaY = moveEvent.clientY - startPosRef.current.y;

      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;

      // Calculate new dimensions based on resize direction
      if (direction.includes('right')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSizeRef.current.width + deltaX));
      }
      if (direction.includes('left')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSizeRef.current.width - deltaX));
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSizeRef.current.height + deltaY));
      }
      if (direction.includes('top')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSizeRef.current.height - deltaY));
      }

      setCurrentSize({ width: newWidth, height: newHeight });
      onResize?.(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      console.log('Resize ended');
      isResizingRef.current = false;
      
      // Re-enable React Flow's node dragging
      const reactFlowNode = document.querySelector('.react-flow__node[style*="pointer-events: none"]') as HTMLElement;
      if (reactFlowNode) {
        reactFlowNode.style.pointerEvents = 'auto';
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // Use capture phase to ensure our events are handled first
    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
  };

  const handleStyle = {
    position: 'absolute' as const,
    width: '16px',
    height: '16px',
    background: color,
    border: '3px solid #fff',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 9999,
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    pointerEvents: 'auto' as const,
  };

  return (
    <>
      {/* Corner handles */}
      <div
        style={{
          ...handleStyle,
          top: '-8px',
          left: '-8px',
          cursor: 'nw-resize',
        }}
        onMouseDown={(e) => startResize(e, 'top-left')}
        title="Resize top-left"
      />
      <div
        style={{
          ...handleStyle,
          top: '-8px',
          right: '-8px',
          cursor: 'ne-resize',
        }}
        onMouseDown={(e) => startResize(e, 'top-right')}
        title="Resize top-right"
      />
      <div
        style={{
          ...handleStyle,
          bottom: '-8px',
          left: '-8px',
          cursor: 'sw-resize',
        }}
        onMouseDown={(e) => startResize(e, 'bottom-left')}
        title="Resize bottom-left"
      />
      <div
        style={{
          ...handleStyle,
          bottom: '-8px',
          right: '-8px',
          cursor: 'se-resize',
        }}
        onMouseDown={(e) => startResize(e, 'bottom-right')}
        title="Resize bottom-right"
      />

      {/* Edge handles */}
      <div
        style={{
          ...handleStyle,
          top: '50%',
          left: '-8px',
          transform: 'translateY(-50%)',
          cursor: 'w-resize',
        }}
        onMouseDown={(e) => startResize(e, 'left')}
        title="Resize left"
      />
      <div
        style={{
          ...handleStyle,
          top: '50%',
          right: '-8px',
          transform: 'translateY(-50%)',
          cursor: 'e-resize',
        }}
        onMouseDown={(e) => startResize(e, 'right')}
        title="Resize right"
      />
      <div
        style={{
          ...handleStyle,
          left: '50%',
          top: '-8px',
          transform: 'translateX(-50%)',
          cursor: 'n-resize',
        }}
        onMouseDown={(e) => startResize(e, 'top')}
        title="Resize top"
      />
      <div
        style={{
          ...handleStyle,
          left: '50%',
          bottom: '-8px',
          transform: 'translateX(-50%)',
          cursor: 's-resize',
        }}
        onMouseDown={(e) => startResize(e, 'bottom')}
        title="Resize bottom"
      />
    </>
  );
};

export default CustomNodeResizer; 