import React from 'react';
// This file defines the PlaybookToolbar. To add new actions, add buttons and props as needed.

interface PlaybookToolbarProps {
  addType: string;
  setAddType: (type: string) => void;
  typeMeta: Record<string, { label: string; color: string; icon: string }>;
  onAddNode: () => void;
  onSave: () => void;
  onReset: () => void;
}

const PlaybookToolbar: React.FC<PlaybookToolbarProps> = ({ addType, setAddType, typeMeta, onAddNode, onSave, onReset }) => (
  <div style={{
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    display: 'flex',
    gap: 12,
    background: 'var(--background-secondary)',
    borderRadius: 8,
    padding: '8px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    alignItems: 'center',
  }}>
    <select
      value={addType}
      onChange={e => setAddType(e.target.value)}
      style={{
        background: 'var(--background-main)',
        color: 'var(--text-main)',
        border: '1.5px solid var(--accent-blue)',
        borderRadius: 6,
        padding: '6px 12px',
        fontWeight: 'bold',
        fontSize: 15,
        cursor: 'pointer',
      }}
    >
      {Object.entries(typeMeta).map(([type, meta]) => (
        <option key={type} value={type}>{meta.icon} {meta.label}</option>
      ))}
    </select>
    <button
      onClick={onAddNode}
      style={{
        background: typeMeta[addType].color,
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 36,
        height: 36,
        fontSize: 22,
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={`Add ${typeMeta[addType].label}`}
    >
      +
    </button>
    <button
      onClick={onSave}
      style={{
        background: 'var(--accent-green)',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '8px 16px',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      Save
    </button>
    <button
      onClick={onReset}
      style={{
        background: 'var(--accent-red)',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '8px 16px',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      Reset
    </button>
  </div>
);

export default PlaybookToolbar; 