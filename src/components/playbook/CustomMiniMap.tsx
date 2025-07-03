import React, { useMemo } from 'react';
import { Node, Edge } from 'react-flow-renderer';

const NODE_TYPES = [
  { type: 'setup', label: 'Setup', icon: '⚡', color: '#6366f1' },
  { type: 'criteria', label: 'Criteria', icon: '✅', color: '#10b981' },
  { type: 'risk', label: 'Risk', icon: '🛡️', color: '#f59e0b' },
  { type: 'review', label: 'Review', icon: '📝', color: '#8b5cf6' },
  { type: 'process', label: 'Process', icon: '🔀', color: '#06b6d4' },
];

interface CustomMiniMapProps {
  nodes: Node[];
  edges: Edge[];
  width?: number;
  height?: number;
  bgColor?: string;
  maskColor?: string;
  onNodeClick?: (nodeId: string) => void;
}

const CustomMiniMap: React.FC<CustomMiniMapProps> = ({
  nodes,
  edges,
  width = 200,
  height = 150,
  bgColor = '#232136',
  maskColor = 'rgba(0, 0, 0, 0.3)',
  onNodeClick,
}) => {
  const bounds = useMemo(() => {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 120); // Assuming node width
      maxY = Math.max(maxY, node.position.y + 60);  // Assuming node height
    });

    return {
      x: minX - 50,
      y: minY - 50,
      width: maxX - minX + 100,
      height: maxY - minY + 100,
    };
  }, [nodes]);

  const scale = Math.min(width / bounds.width, height / bounds.height, 1);
  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  const getNodeColor = (nodeType: string) => {
    const type = NODE_TYPES.find(t => t.type === nodeType);
    return type?.color || '#6366f1';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width,
        height,
        background: bgColor,
        border: '2px solid #444',
        borderRadius: 8,
        overflow: 'hidden',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ background: bgColor }}
      >
        {/* Background */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={bgColor}
        />

        {/* Nodes */}
        {nodes.map((node) => {
          const nodeType = (node.data as any)?.type || 'setup';
          const nodeColor = getNodeColor(nodeType);
          const scaledX = (node.position.x - bounds.x) * scale + offsetX;
          const scaledY = (node.position.y - bounds.y) * scale + offsetY;
          const nodeWidth = 120 * scale;
          const nodeHeight = 60 * scale;

          return (
            <rect
              key={node.id}
              x={scaledX}
              y={scaledY}
              width={nodeWidth}
              height={nodeHeight}
              rx={8 * scale}
              ry={8 * scale}
              fill={nodeColor}
              stroke="#fff"
              strokeWidth={2 * scale}
              style={{ cursor: 'pointer' }}
              onClick={() => onNodeClick?.(node.id)}
            />
          );
        })}

        {/* Edges */}
        {edges.map((edge) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;

          const sourceX = (sourceNode.position.x - bounds.x + 60) * scale + offsetX;
          const sourceY = (sourceNode.position.y - bounds.y + 30) * scale + offsetY;
          const targetX = (targetNode.position.x - bounds.x + 60) * scale + offsetX;
          const targetY = (targetNode.position.y - bounds.y + 30) * scale + offsetY;

          return (
            <line
              key={edge.id}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke="#fff"
              strokeWidth={2 * scale}
              opacity={0.6}
            />
          );
        })}

        {/* Viewport indicator (simplified) */}
        <rect
          x={width * 0.1}
          y={height * 0.1}
          width={width * 0.8}
          height={height * 0.8}
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeDasharray="5,5"
          opacity={0.5}
        />
      </svg>
    </div>
  );
};

export default CustomMiniMap; 