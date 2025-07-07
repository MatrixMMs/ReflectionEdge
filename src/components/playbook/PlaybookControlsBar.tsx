import React from 'react';

interface PlaybookControlsBarProps {
  strategyList: string[];
  selectedStrategy: string;
  onSaveStrategy: () => void;
  onChooseStrategy: (name: string) => void;
  selectedNodeType: string;
  onNodeTypeChange: (type: string) => void;
  onAddNode: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;

  canUndo: boolean;
  canRedo: boolean;
  nodeTypes: Array<{ type: string; label: string; icon: string; color: string }>;
}

const ControlButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ onClick, disabled = false, title, children, className = '', style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`react-flow__controls-button ${className}`}
    style={{
      width: 32,
      height: 32,
      border: 'none',
      borderRadius: 4,
      background: disabled ? '#444' : '#2a2a2a',
      color: '#fff',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      transition: 'all 0.2s ease',
      ...style
    }}
  >
    {children}
  </button>
);

const PlaybookControlsBar: React.FC<PlaybookControlsBarProps> = ({
  strategyList,
  selectedStrategy,
  onSaveStrategy,
  onChooseStrategy,
  selectedNodeType,
  onNodeTypeChange,
  onAddNode,
  onDeleteSelected,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onZoomIn,
  onZoomOut,
  onFitView,

  canUndo,
  canRedo,
  nodeTypes
}) => {
  const selectedType = nodeTypes.find(t => t.type === selectedNodeType);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        width: '100%',
        background: '#232136',
        borderBottom: '1px solid #333',
        padding: '8px 16px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap'
      }}>
        {/* Strategy select */}
        <select
          value={selectedStrategy}
          onChange={e => onChooseStrategy(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1.5px solid #6366f1',
            fontWeight: 'bold',
            fontSize: 15,
            background: '#18181b',
            color: '#fff',
            minWidth: 120,
          }}
        >
          <option value="">Choose Strategy</option>
          {strategyList.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={onSaveStrategy}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 16px',
            fontWeight: 'bold',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          Save Strategy
        </button>

        {/* Node Type Selector */}
        <select
          value={selectedNodeType}
          onChange={e => onNodeTypeChange(e.target.value)}
          style={{
            background: '#18181b',
            color: '#fff',
            border: '1.5px solid #6366f1',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 12,
            fontWeight: 'bold',
            cursor: 'pointer',
            minWidth: 120
          }}
        >
          {nodeTypes.map(type => (
            <option key={type.type} value={type.type}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>

        {/* Add Node Button */}
        <ControlButton
          onClick={onAddNode}
          title={`Add ${selectedType?.label || 'Node'}`}
          style={{
            background: selectedType?.color || '#6366f1',
            width: 32,
            height: 32,
            borderRadius: '50%',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          +
        </ControlButton>

        {/* Delete Selected */}
        <ControlButton
          onClick={onDeleteSelected}
          title="Delete Selected"
          style={{ background: '#ef4444' }}
        >
          🗑️
        </ControlButton>

        {/* Undo/Redo */}
        <ControlButton
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          style={{ background: canUndo ? '#8b5cf6' : '#444' }}
        >
          ↩️
        </ControlButton>

        <ControlButton
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
          style={{ background: canRedo ? '#8b5cf6' : '#444' }}
        >
          ↪️
        </ControlButton>

        {/* Export/Import */}
        <ControlButton
          onClick={onExport}
          title="Export"
          style={{ background: '#10b981' }}
        >
          📤
        </ControlButton>

        <ControlButton
          onClick={onImport}
          title="Import"
          style={{ background: '#f59e0b' }}
        >
          📥
        </ControlButton>



        {/* Spacer */}
        <div style={{ marginLeft: 'auto' }} />

        {/* Zoom Controls */}
        <ControlButton
          onClick={onZoomIn}
          title="Zoom In"
          style={{ background: '#18181b', border: '1px solid #444' }}
        >
          🔍+
        </ControlButton>

        <ControlButton
          onClick={onZoomOut}
          title="Zoom Out"
          style={{ background: '#18181b', border: '1px solid #444' }}
        >
          🔍-
        </ControlButton>

        <ControlButton
          onClick={onFitView}
          title="Fit View"
          style={{ background: '#18181b', border: '1px solid #444' }}
        >
          📐
        </ControlButton>
      </div>
    </div>
  );
};

export default PlaybookControlsBar; 