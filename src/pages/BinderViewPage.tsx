import React, { useEffect, useState } from 'react';
import BinderView from '../components/playbook/BinderView';
import { Node } from 'react-flow-renderer';
import { PlaybookNodeData } from '../components/playbook/PlaybookSandbox';

const LOCAL_STORAGE_KEY = 'playbook-mindmap';

const BinderViewPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node<PlaybookNodeData>[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const { nodes: savedNodes } = JSON.parse(saved);
      setNodes(savedNodes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ nodes, edges: [] }));
  }, [nodes]);

  // For now, just alert on edit
  const handleEdit = (node: Node<PlaybookNodeData>) => {
    alert('Edit modal coming soon!');
  };

  return <BinderView nodes={nodes} setNodes={setNodes} onEdit={handleEdit} />;
};

export default BinderViewPage; 