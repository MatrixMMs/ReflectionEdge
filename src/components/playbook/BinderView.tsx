import React, { useState } from 'react';
import { Node } from 'react-flow-renderer';
import { PlaybookNodeData } from './PlaybookSandbox';

interface BinderViewProps {
  nodes: Node<PlaybookNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<PlaybookNodeData>[]>>;
  onEdit: (node: Node<PlaybookNodeData>) => void;
}

const BinderView: React.FC<BinderViewProps> = ({ nodes, setNodes, onEdit }) => {
  const [search, setSearch] = useState('');
  const filtered = nodes.filter(n => n.data.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this card?')) {
      setNodes(nds => nds.filter(n => n.id !== id));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 16 }}>Playbook Binder</h1>
      <input
        type="text"
        placeholder="Search cards..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 24, padding: 8, borderRadius: 6, border: '1px solid #444', width: 300 }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {filtered.map(node => (
          <div key={node.id} style={{ background: '#232136', borderRadius: 10, padding: 18, color: '#fff', boxShadow: '0 2px 8px #0002', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 'bold', fontSize: 18 }}>{node.data.name}</div>
            <div style={{ fontSize: 14, color: '#aaa' }}>{node.data.type}</div>
            {node.data.thesis && <div><b>Thesis:</b> {node.data.thesis}</div>}
            {node.data.criteria && <div><b>Criteria:</b> {node.data.criteria}</div>}
            {node.data.checklist && node.data.checklist.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {node.data.checklist.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}
            {node.data.stop && <div><b>Risk/Target:</b> {node.data.stop}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => onEdit(node)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(node.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BinderView; 