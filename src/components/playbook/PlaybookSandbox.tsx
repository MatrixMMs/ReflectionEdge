import React, { useRef, useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Connection,
  Edge,
  ReactFlowInstance,
  getBezierPath,
} from 'react-flow-renderer';
import CustomMiniMap from './CustomMiniMap';
import PlaybookControlsBar from './PlaybookControlsBar';
import NodeEditor from './NodeEditor';

interface PlaybookNodeData {
  label: string;
  type: string;
  description?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-progress' | 'completed';
  tags?: string[];
  dueDate?: string;
  assignee?: string;
}

interface NodeType {
  type: string;
  label: string;
  icon: string;
  color: string;
}

const NODE_TYPES: NodeType[] = [
  { type: 'setup', label: 'Setup', icon: '⚡', color: '#6366f1' },
  { type: 'criteria', label: 'Criteria', icon: '✅', color: '#10b981' },
  { type: 'risk', label: 'Risk', icon: '🛡️', color: '#f59e0b' },
  { type: 'review', label: 'Review', icon: '📝', color: '#8b5cf6' },
  { type: 'process', label: 'Process', icon: '🔀', color: '#06b6d4' },
];

const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Setup Node', 
      type: 'setup',
      description: 'Initial setup and preparation',
      notes: 'Make sure all tools are ready',
      priority: 'high',
      status: 'pending',
      tags: ['important', 'setup'],
      dueDate: '',
      assignee: '',
      riskWrong: '',
      riskStop: '',
      journal: '',
      advancedTags: {},
    },
    style: { width: 120, height: 60 },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 400, y: 100 },
    data: { 
      label: 'Criteria Node', 
      type: 'criteria',
      description: 'Define success criteria',
      notes: 'Clear measurable outcomes needed',
      priority: 'medium',
      status: 'in-progress',
      tags: ['criteria', 'success'],
      dueDate: '',
      assignee: '',
      riskWrong: '',
      riskStop: '',
      journal: '',
      advancedTags: {},
    },
    style: { width: 120, height: 60 },
  },
];
const initialEdges: Edge[] = [];

const CustomNode = ({ data, id, selected }: { data: any; id: string; selected?: boolean }) => {
  const [nodeSize, setNodeSize] = useState({ width: 120, height: 60 });
  const [showEditor, setShowEditor] = useState(false);
  const [hovered, setHovered] = useState(false);
  const nodeType = NODE_TYPES.find(t => t.type === data.type) || NODE_TYPES[0];

  // Add child node handler (calls a prop if provided)
  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && (window as any).addChildNode) {
      (window as any).addChildNode(id);
    }
  };

  const handleDoubleClick = () => {
    setShowEditor(true);
  };

  const handleResize = (width: number, height: number) => {
    setNodeSize({ width, height });
  };

  const handleSaveNode = (nodeId: string, updatedData: any) => {
    // Use the global function to update the node
    if (typeof window !== 'undefined' && (window as any).updateNodeData) {
      (window as any).updateNodeData(nodeId, updatedData);
    }
  };

  return (
    <>
      <div
        style={{
          background: '#fff',
    borderRadius: 8,
    padding: 16,
          minWidth: nodeSize.width,
          minHeight: nodeSize.height,
          textAlign: 'center',
          fontWeight: 500,
          fontSize: 18,
    boxShadow: '0 2px 8px #0002',
          border: `2px solid ${nodeType.color}`,
          position: 'relative',
          width: nodeSize.width,
          height: nodeSize.height,
          overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: '#888',
            width: 16,
            height: 16,
            border: '2px solid #222',
            borderRadius: '50%',
            top: -8,
            left: '50%',
            transform: 'translate(-50%, 0)',
            boxShadow: '0 2px 6px #0003',
            transition: 'box-shadow 0.08s',
            zIndex: 10,
            cursor: 'pointer',
            pointerEvents: 'all',
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = `0 0 0 6px #8888`}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 6px #0003'}
        />
        <span style={{ color: '#111', fontWeight: 600, fontSize: 16, textAlign: 'center', width: '100%' }}>
          {data.label}
        </span>
        {/* Plus button for adding child node (only on hover) */}
        {hovered && (
          <button
            onClick={handleAddChild}
            style={{
              position: 'absolute',
              right: 6,
              bottom: 6,
              left: 'auto',
              transform: 'none',
              background: '#111',
              border: `2px solid ${nodeType.color}`,
              borderRadius: '50%',
              width: 14,
              height: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#fff',
              boxShadow: '0 2px 8px #0002',
              cursor: 'pointer',
              zIndex: 20,
              transition: 'background 0.15s, border 0.15s',
            }}
            title="Add child node"
          >
            +
          </button>
        )}
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: '#888',
            width: 16,
            height: 16,
            border: '2px solid #222',
            borderRadius: '50%',
            bottom: -8,
            left: '50%',
            transform: 'translate(-50%, 0)',
            boxShadow: '0 2px 6px #0003',
            transition: 'box-shadow 0.08s',
            zIndex: 10,
            cursor: 'pointer',
            pointerEvents: 'all',
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = `0 0 0 6px #8888`}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 6px #0003'}
        />
  </div>
      <NodeEditor
        node={{ id, data }}
        nodeTypes={NODE_TYPES}
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSaveNode}
      />
    </>
  );
};

const nodeTypes = { custom: CustomNode };

const PlaybookSandbox: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState(NODE_TYPES[0].type);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [history, setHistory] = useState<{ nodes: any[]; edges: any[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [strategyList, setStrategyList] = useState<string[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');

  // Load strategy list from localStorage
  useEffect(() => {
    const saved = Object.keys(localStorage).filter(k => k.startsWith('strategy_')).map(k => k.replace('strategy_', ''));
    setStrategyList(saved);
  }, []);

  // Save strategy
  const handleSaveStrategy = () => {
    const name = prompt('Enter a name for this strategy:');
    if (!name) return;
    localStorage.setItem('strategy_' + name, JSON.stringify({ nodes, edges }));
    setStrategyList(list => list.includes(name) ? list : [...list, name]);
    alert('Strategy saved!');
  };

  // Load strategy
  const handleChooseStrategy = (name: string) => {
    const data = localStorage.getItem('strategy_' + name);
    if (data) {
      try {
        const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(data);
        setNodes(loadedNodes || []);
        setEdges(loadedEdges || []);
        setSelectedStrategy(name);
      } catch {
        alert('Failed to load strategy.');
      }
    }
  };

  const saveToHistory = useCallback(() => {
    const currentState = { nodes: [...nodes], edges: [...edges] };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, currentState];
    });
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, historyIndex]);

  const onConnect = (params: Edge | Connection) => {
    const newEdge = { 
      ...params, 
      type: 'default',
      label: '',
      id: `edge-${Date.now()}-${Math.random()}`
    };
    setEdges(eds => addEdge(newEdge, eds));
    saveToHistory();
  };

  const handleAddNode = () => {
    const id = (Date.now() + Math.random()).toString();
    const nodeType = NODE_TYPES.find(t => t.type === selectedNodeType) || NODE_TYPES[0];
    
    setNodes(nds => [
      ...nds,
      {
        id,
        type: 'custom',
        position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
        data: { 
          label: nodeType.label, 
          type: selectedNodeType,
          description: '',
          notes: '',
          priority: 'medium',
          status: 'pending',
          tags: [],
          dueDate: '',
          assignee: '',
          riskWrong: '',
          riskStop: '',
          journal: '',
          advancedTags: {},
        },
        style: { width: 120, height: 60 },
      },
    ]);
    saveToHistory();
  };

  const handleDeleteSelected = () => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    
    if (selectedNodes.length > 0) {
      setNodes(nds => nds.filter(node => !node.selected));
    }
    if (selectedEdges.length > 0) {
      setEdges(eds => eds.filter(edge => !edge.selected));
    }
    saveToHistory();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(newIndex);
    }
  };

  const handleExport = () => {
    const data = { nodes, edges };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            setNodes(data.nodes || []);
            setEdges(data.edges || []);
            saveToHistory();
          } catch (error) {
            alert('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleFitView = () => reactFlowInstance?.fitView({ duration: 150 });
  const handleZoomIn = () => reactFlowInstance?.zoomIn();
  const handleZoomOut = () => reactFlowInstance?.zoomOut();

  const handleMiniMapNodeClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && reactFlowInstance) {
      reactFlowInstance.setCenter(node.position.x + 60, node.position.y + 30, { duration: 150 });
    }
  };



  // Style edges for thickness, color, and arrow (default edge type)
  const styledEdges = edges.map(e => ({
    ...e,
    style: { stroke: '#6366f1', strokeWidth: 3 },
    markerEnd: 'url(#arrowhead)',
  }));

  // Add child node below parent and connect
  (window as any).addChildNode = (parentId: string) => {
    setNodes(nds => {
      const parent = nds.find(n => n.id === parentId);
      if (!parent) return nds;
      const id = (Date.now() + Math.random()).toString();
      const parentHeight = typeof parent.style?.height === 'number' ? parent.style.height : 60;
      const newNode = {
        id,
        type: 'custom',
        position: {
          x: parent.position.x,
          y: parent.position.y + parentHeight + 80,
        },
      data: {
          label: 'New Node',
          type: parent.data.type,
          description: '',
          notes: '',
          priority: 'medium',
          status: 'pending',
          tags: [],
          dueDate: '',
          assignee: '',
          riskWrong: '',
          riskStop: '',
          journal: '',
          advancedTags: {},
        },
        style: { width: 120, height: 60 },
      };
      setEdges(eds => ([...eds, { id: `e${parentId}-${id}`, source: parentId, target: id }]));
      return [...nds, newNode];
    });
  };

  // Update node data from NodeEditor
  (window as any).updateNodeData = (nodeId: string, updatedData: any) => {
    setNodes(nds => nds.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updatedData } }
        : node
    ));
    // Save to history for undo/redo
    setTimeout(() => saveToHistory(), 0);
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#18181b', position: 'relative' }}>
      <PlaybookControlsBar
        strategyList={strategyList}
        selectedStrategy={selectedStrategy}
        onSaveStrategy={handleSaveStrategy}
        onChooseStrategy={handleChooseStrategy}
        selectedNodeType={selectedNodeType}
        onNodeTypeChange={setSelectedNodeType}
        onAddNode={handleAddNode}
        onDeleteSelected={handleDeleteSelected}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onImport={handleImport}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        nodeTypes={NODE_TYPES}
      />
      
      <div style={{ width: '100%', height: '100%', paddingTop: 60 }}>
        <ReactFlow
          onInit={setReactFlowInstance}
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <svg style={{ height: 0 }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="18"
                markerHeight="18"
                refX="10"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill="#6366f1" />
              </marker>
            </defs>
          </svg>
          <Controls />
          <Background color="#222" gap={16} />
        </ReactFlow>
      </div>

      {/* Custom MiniMap - positioned outside ReactFlow */}
      <CustomMiniMap
        nodes={nodes}
        edges={edges}
        onNodeClick={handleMiniMapNodeClick}
      />


    </div>
  );
};

export default PlaybookSandbox;