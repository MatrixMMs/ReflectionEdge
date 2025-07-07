import React from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
// This file defines the PlaybookCardNode for the mindmap. To add new node types, create a new file in this folder and add it to the nodeTypes registry in PlaybookSandbox.

const typeMeta = {
  philosophy: { label: 'Philosophy', color: '#f59e42', icon: '📜' },
  setup: { label: 'Setup', color: '#6366f1', icon: '⚡' },
  criteria: { label: 'Criteria', color: '#10b981', icon: '✅' },
  risk: { label: 'Risk/Target', color: '#ef4444', icon: '🛡️' },
  review: { label: 'Review', color: '#fbbf24', icon: '📝' },
  process: { label: 'Process', color: '#38bdf8', icon: '🔀' },
};

const PlaybookCardNode: React.FC<NodeProps<any>> = ({ data, id }) => (
  <div style={{
    background: typeMeta[data.type]?.color || '#6366f1',
    color: '#fff',
    borderRadius: 8,
    padding: 16,
    minWidth: 200,
    boxShadow: '0 2px 8px #0002',
    border: '2px solid #232136',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    position: 'relative',
  }}>
    {/* Top handles */}
    <Handle id="top-source" type="source" position={Position.Top} style={{ background: '#fff', width: 12, height: 12, borderRadius: '50%', border: '2px solid #232136', top: -10, left: '50%', transform: 'translateX(-50%)' }} />
    <Handle id="top-target" type="target" position={Position.Top} style={{ background: '#fff', width: 12, height: 12, borderRadius: '50%', border: '2px solid #232136', top: -10, left: '50%', transform: 'translateX(-50%)' }} />
    {/* Left handles */}
    <Handle id="left-source" type="source" position={Position.Left} style={{ background: '#fff', width: 12, height: 12, borderRadius: '50%', border: '2px solid #232136', left: -10, top: '50%', transform: 'translateY(-50%)' }} />
    <Handle id="left-target" type="target" position={Position.Left} style={{ background: '#fff', width: 12, height: 12, borderRadius: '50%', border: '2px solid #232136', left: -10, top: '50%', transform: 'translateY(-50%)' }} />
    {/* Right handles */}
    <Handle id="right-source" type="source" position={Position.Right} style={{ background: '#fff', width: 12, height: 12, borderRadius: '50%', border: '2px solid #232136', right: -10, top: '50%', transform: 'translateY(-50%)' }} />
    <Handle id="right-target" type="target" position={Position.Right} style={{ background: '#fff', width: 12, height: 12, borderRadius: '50%', border: '2px solid #232136', right: -10, top: '50%', transform: 'translateY(-50%)' }} />
    {/* Bottom handles */}
    <Handle id="bottom-source" type="source" position={Position.Bottom} style={{ background: '#fff', width: 12, height: 12, borderRadius: '50%', border: '2px solid #232136', bottom: -10, left: '50%', transform: 'translateX(-50%)' }} />
    <Handle id="bottom-target" type="target" position={Position.Bottom} style={{ background: '#fff', width: 12, height: 12, borderRadius: '50%', border: '2px solid #232136', bottom: -10, left: '50%', transform: 'translateX(-50%)' }} />
    <div style={{ fontWeight: 'bold', fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{typeMeta[data.type]?.icon || '⚡'}</span>
      {data.name || typeMeta[data.type]?.label || 'Playbook Card'}
    </div>
    {data.type === 'philosophy' && <div style={{ fontSize: 12 }}>{data.description}</div>}
    {data.type === 'setup' && <div style={{ fontSize: 12 }}>{data.thesis}</div>}
    {data.type === 'criteria' && (
      <ul style={{ fontSize: 12, margin: 0, padding: 0, listStyle: 'none' }}>
        {data.checklist?.map((item: string, i: number) => <li key={i}>• {item}</li>)}
      </ul>
    )}
    {data.type === 'risk' && <div style={{ fontSize: 12 }}>{data.stop || data.targets}</div>}
    {data.type === 'review' && <div style={{ fontSize: 12 }}>{data.reviewNotes}</div>}
    {data.type === 'process' && <div style={{ fontSize: 12 }}>{data.question}</div>}
  </div>
);

export default PlaybookCardNode; 