import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeProps,
  Handle,
  Position,
} from 'react-flow-renderer';
import { initialNodes, initialEdges } from '../../data/initialPlaybookNodes';

// --- Node type schema ---
export type NodeType =
  | 'philosophy'
  | 'setup'
  | 'criteria'
  | 'risk'
  | 'review'
  | 'process';

export interface PlaybookNodeData {
  type: NodeType;
  name: string;
  description?: string;
  thesis?: string;
  context?: string;
  checklist?: string[];
  stop?: string;
  sizing?: string;
  targets?: string;
  reviewNotes?: string;
  question?: string;
  notes?: string;
}

const typeMeta: Record<NodeType, { label: string; color: string; icon: string }> = {
  philosophy: { label: 'Philosophy', color: '#f59e42', icon: '📜' },
  setup: { label: 'Setup', color: '#6366f1', icon: '⚡' },
  criteria: { label: 'Criteria', color: '#10b981', icon: '✅' },
  risk: { label: 'Risk/Target', color: '#ef4444', icon: '🛡️' },
  review: { label: 'Review', color: '#fbbf24', icon: '📝' },
  process: { label: 'Process', color: '#38bdf8', icon: '🔀' },
};

const PlaybookCardNode: React.FC<NodeProps<PlaybookNodeData>> = ({ data, id }) => (
  <div style={{
    background: typeMeta[data.type].color,
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
      <span>{typeMeta[data.type].icon}</span>
      {data.name || typeMeta[data.type].label}
    </div>
    {data.type === 'philosophy' && <div style={{ fontSize: 12 }}>{data.description}</div>}
    {data.type === 'setup' && <div style={{ fontSize: 12 }}>{data.thesis}</div>}
    {data.type === 'criteria' && (
      <ul style={{ fontSize: 12, margin: 0, padding: 0, listStyle: 'none' }}>
        {data.checklist?.map((item, i) => <li key={i}>• {item}</li>)}
      </ul>
    )}
    {data.type === 'risk' && <div style={{ fontSize: 12 }}>{data.stop || data.targets}</div>}
    {data.type === 'review' && <div style={{ fontSize: 12 }}>{data.reviewNotes}</div>}
    {data.type === 'process' && <div style={{ fontSize: 12 }}>{data.question}</div>}
  </div>
);

const nodeTypes = {
  playbookCard: PlaybookCardNode,
};

const LOCAL_STORAGE_KEY = 'playbook-mindmap';

const PlaybookSandbox: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<PlaybookNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [modalNode, setModalNode] = useState<Node<PlaybookNodeData> | null>(null);
  const [criteriaInput, setCriteriaInput] = useState('');
  const [addType, setAddType] = useState<NodeType>('setup');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
      setNodes(savedNodes);
      setEdges(savedEdges);
    }
    // eslint-disable-next-line
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  // Add new node of selected type
  const handleAddNode = () => {
    const id = (Date.now() + Math.random()).toString();
    let data: PlaybookNodeData;
    switch (addType) {
      case 'philosophy':
        data = { type: 'philosophy', name: 'Philosophy', description: '' };
        break;
      case 'setup':
        data = { type: 'setup', name: 'New Setup', thesis: '', context: '', notes: '' };
        break;
      case 'criteria':
        data = { type: 'criteria', name: 'Criteria', checklist: [], notes: '' };
        break;
      case 'risk':
        data = { type: 'risk', name: 'Risk/Target', stop: '', sizing: '', targets: '', notes: '' };
        break;
      case 'review':
        data = { type: 'review', name: 'Review', reviewNotes: '', notes: '' };
        break;
      case 'process':
        data = { type: 'process', name: 'Process', question: '', notes: '' };
        break;
      default:
        data = { type: 'setup', name: 'New Setup', thesis: '', context: '', notes: '' };
    }
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'playbookCard',
        data,
        position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      },
    ]);
  };

  // Toolbar actions
  const handleReset = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };
  const handleSave = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ nodes, edges }));
    alert('Mindmap saved!');
  };

  // Node click: open modal
  const onNodeClick = (_event: React.MouseEvent, node: Node<PlaybookNodeData>) => {
    setModalNode(node);
    setCriteriaInput('');
  };

  // Modal save
  const handleModalSave = (data: PlaybookNodeData) => {
    if (!modalNode) return;
    setNodes((nds) => nds.map((n) => n.id === modalNode.id ? { ...n, data } : n));
    setModalNode(null);
  };

  // Modal cancel
  const handleModalCancel = () => setModalNode(null);

  // Modal delete node
  const handleModalDelete = () => {
    if (!modalNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== modalNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== modalNode.id && e.target !== modalNode.id));
    setModalNode(null);
  };

  // Add criteria item
  const handleAddCriteria = () => {
    if (!criteriaInput.trim() || !modalNode) return;
    setModalNode({
      ...modalNode,
      data: {
        ...modalNode.data,
        checklist: [...(modalNode.data.checklist || []), criteriaInput.trim()],
      },
    });
    setCriteriaInput('');
  };

  // Remove criteria item
  const handleRemoveCriteria = (idx: number) => {
    if (!modalNode) return;
    setModalNode({
      ...modalNode,
      data: {
        ...modalNode.data,
        checklist: (modalNode.data.checklist || []).filter((_, i) => i !== idx),
      },
    });
  };

  // Render modal fields based on node type
  const renderModalFields = () => {
    if (!modalNode) return null;
    const { type } = modalNode.data;
    switch (type) {
      case 'philosophy':
        return <>
          <label style={{ color: '#fff', fontSize: 14 }}>Name</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.name}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, name: e.target.value } })}
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Description</label>
          <textarea
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.description || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, description: e.target.value } })}
            rows={2}
          />
        </>;
      case 'setup':
        return <>
          <label style={{ color: '#fff', fontSize: 14 }}>Name</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.name}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, name: e.target.value } })}
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Thesis</label>
          <textarea
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.thesis || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, thesis: e.target.value } })}
            rows={2}
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Market Context</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.context || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, context: e.target.value } })}
            placeholder="When is this setup valid?"
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Notes</label>
          <textarea
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.notes || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, notes: e.target.value } })}
            rows={2}
          />
        </>;
      case 'criteria':
        return <>
          <label style={{ color: '#fff', fontSize: 14 }}>Name</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.name}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, name: e.target.value } })}
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Checklist</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
              value={criteriaInput}
              onChange={e => setCriteriaInput(e.target.value)}
              placeholder="Add criteria..."
              onKeyDown={e => { if (e.key === 'Enter') handleAddCriteria(); }}
            />
            <button
              onClick={handleAddCriteria}
              style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
          <ul style={{ marginBottom: 12 }}>
            {(modalNode.data.checklist || []).map((item, idx) => (
              <li key={idx} style={{ color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span>• {item}</span>
                <button onClick={() => handleRemoveCriteria(idx)} style={{ background: 'none', color: '#ef4444', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>x</button>
              </li>
            ))}
          </ul>
          <label style={{ color: '#fff', fontSize: 14 }}>Notes</label>
          <textarea
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.notes || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, notes: e.target.value } })}
            rows={2}
          />
        </>;
      case 'risk':
        return <>
          <label style={{ color: '#fff', fontSize: 14 }}>Name</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.name}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, name: e.target.value } })}
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Stop-Loss Rule</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.stop || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, stop: e.target.value } })}
            placeholder="Where is the 'I'm wrong' point?"
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Position Sizing</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.sizing || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, sizing: e.target.value } })}
            placeholder="How much do you risk per trade?"
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Profit Targets</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.targets || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, targets: e.target.value } })}
            placeholder="Describe your targets, scaling, etc."
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Notes</label>
          <textarea
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.notes || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, notes: e.target.value } })}
            rows={2}
          />
        </>;
      case 'review':
        return <>
          <label style={{ color: '#fff', fontSize: 14 }}>Name</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.name}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, name: e.target.value } })}
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Review Notes</label>
          <textarea
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.reviewNotes || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, reviewNotes: e.target.value } })}
            rows={3}
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Notes</label>
          <textarea
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.notes || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, notes: e.target.value } })}
            rows={2}
          />
        </>;
      case 'process':
        return <>
          <label style={{ color: '#fff', fontSize: 14 }}>Name</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.name}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, name: e.target.value } })}
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Decision/Question</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.question || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, question: e.target.value } })}
            placeholder="e.g., Are all criteria met?"
          />
          <label style={{ color: '#fff', fontSize: 14 }}>Notes</label>
          <textarea
            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff' }}
            value={modalNode.data.notes || ''}
            onChange={e => setModalNode({ ...modalNode, data: { ...modalNode.data, notes: e.target.value } })}
            rows={2}
          />
        </>;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#18181b', borderRadius: 12, position: 'relative' }}>
      {/* Toolbar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        display: 'flex',
        gap: 12,
        background: '#232136',
        borderRadius: 8,
        padding: '8px 16px',
        boxShadow: '0 2px 8px #0004',
        alignItems: 'center',
      }}>
        <select
          value={addType}
          onChange={e => setAddType(e.target.value as NodeType)}
          style={{
            background: '#18181b',
            color: '#fff',
            border: '1.5px solid #6366f1',
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
          onClick={handleAddNode}
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
          onClick={handleSave}
          style={{
            background: '#10b981',
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
          onClick={handleReset}
          style={{
            background: '#ef4444',
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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        nodeTypes={nodeTypes}
      >
        <MiniMap />
        <Controls />
        <Background color="#222" gap={16} />
      </ReactFlow>
      {/* Modal for editing node details */}
      {modalNode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{ background: '#232136', padding: 32, borderRadius: 12, minWidth: 340, maxWidth: 420 }}>
            <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>Edit {typeMeta[modalNode.data.type].label}</h2>
            {renderModalFields()}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button onClick={handleModalDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px' }}>Delete</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleModalCancel} style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px' }}>Cancel</button>
                <button onClick={() => handleModalSave(modalNode.data)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookSandbox;
// If you see a type error for 'react-flow-renderer', ensure the package is installed and types are available. 