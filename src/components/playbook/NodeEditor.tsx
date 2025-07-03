import React, { useState, useEffect } from 'react';
import { ADVANCED_TAGS } from '../../constants/advancedTags';

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
  riskWrong?: string;
  riskStop?: string;
  journal?: string;
  advancedTags?: Record<string, string[]>; // groupId -> subtag ids
}

interface NodeType {
  type: string;
  label: string;
  icon: string;
  color: string;
}

interface NodeEditorProps {
  node: {
    id: string;
    data: PlaybookNodeData;
  };
  nodeTypes: NodeType[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, updatedData: PlaybookNodeData) => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  nodeTypes,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PlaybookNodeData>({
    label: '',
    type: '',
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
  });
  const [newTag, setNewTag] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && node) {
      setFormData({
        label: node.data.label || '',
        type: node.data.type || '',
        description: node.data.description || '',
        notes: node.data.notes || '',
        priority: node.data.priority || 'medium',
        status: node.data.status || 'pending',
        tags: node.data.tags || [],
        dueDate: node.data.dueDate || '',
        assignee: node.data.assignee || '',
        riskWrong: node.data.riskWrong || '',
        riskStop: node.data.riskStop || '',
        journal: node.data.journal || '',
        advancedTags: node.data.advancedTags || {},
      });
    }
  }, [isOpen, node]);

  const handleSave = () => {
    onSave(node.id, formData);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev: PlaybookNodeData) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev: PlaybookNodeData) => ({
      ...prev,
      tags: prev.tags?.filter((tag: string) => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSubtagToggle = (groupId: string, subtagId: string) => {
    setFormData(prev => {
      const groupTags = prev.advancedTags?.[groupId] || [];
      const isSelected = groupTags.includes(subtagId);
      return {
        ...prev,
        advancedTags: {
          ...prev.advancedTags,
          [groupId]: isSelected
            ? groupTags.filter(id => id !== subtagId)
            : [...groupTags, subtagId],
        },
      };
    });
  };

  if (!isOpen) return null;

  const nodeType = nodeTypes.find(t => t.type === formData.type);

  let dynamicFields = null;
  if (formData.type === 'setup') {
    dynamicFields = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>Advanced Tags</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ADVANCED_TAGS.filter(group => group.category === 'objective').map(group => (
            <div key={group.id} style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setExpandedGroup(group.id)}
                  style={{
                    background: '#232136',
                    color: '#fff',
                    border: `2px solid ${group.subtags[0]?.color || '#6366f1'}`,
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    outline: expandedGroup === group.id ? `2px solid #fff` : 'none',
                  }}
                >
                  {group.name}
                </button>
                {/* Show selected subtags summary */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(formData.advancedTags?.[group.id] || []).map(subId => {
                    const sub = group.subtags.find(s => s.id === subId);
                    return sub ? (
                      <span key={sub.id} style={{ background: sub.color, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>{sub.name}</span>
                    ) : null;
                  })}
                </div>
              </div>
              {/* Expanded group: show subtags */}
              {expandedGroup === group.id && (
                <div style={{
                  background: '#18181b',
                  border: `1.5px solid ${group.subtags[0]?.color || '#6366f1'}`,
                  borderRadius: 8,
                  marginTop: 8,
                  marginBottom: 8,
                  padding: 12,
                  position: 'relative',
                }}>
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(null)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 12,
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: 20,
                      cursor: 'pointer',
                    }}
                    title="Close"
                  >
                    ×
                  </button>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {group.subtags.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubtagToggle(group.id, sub.id)}
                        style={{
                          background: formData.advancedTags?.[group.id]?.includes(sub.id) ? sub.color : '#232136',
                          color: '#fff',
                          border: `2px solid ${sub.color}`,
                          borderRadius: 6,
                          padding: '6px 14px',
                          fontWeight: 500,
                          fontSize: 13,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  } else if (formData.type === 'risk') {
    dynamicFields = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>When are you wrong?</label>
          <textarea
            value={formData.riskWrong}
            onChange={e => setFormData(prev => ({ ...prev, riskWrong: e.target.value }))}
            style={{ width: '100%', minHeight: 50, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff', fontSize: 14, padding: 8 }}
            placeholder="Describe the conditions that would invalidate your trade thesis."
          />
        </div>
        <div>
          <label style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>How are you going to determine your stop?</label>
          <textarea
            value={formData.riskStop}
            onChange={e => setFormData(prev => ({ ...prev, riskStop: e.target.value }))}
            style={{ width: '100%', minHeight: 50, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff', fontSize: 14, padding: 8 }}
            placeholder="Describe your stop loss logic or placement."
          />
        </div>
      </div>
    );
  } else if (formData.type === 'review') {
    dynamicFields = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>Journal</label>
        <textarea
          value={formData.journal}
          onChange={e => setFormData(prev => ({ ...prev, journal: e.target.value }))}
          style={{ width: '100%', minHeight: 120, borderRadius: 6, border: '1px solid #444', background: '#18181b', color: '#fff', fontSize: 14, padding: 8 }}
          placeholder="Write your post-trade review, thoughts, and lessons here."
        />
      </div>
    );
  } else if (formData.type === 'criteria') {
    dynamicFields = null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#232136',
          borderRadius: 12,
          padding: 20,
          width: 400,
          maxWidth: '90vw',
          minWidth: 320,
          maxHeight: '80vh',
          margin: 'auto',
          overflowY: 'auto',
          border: `2px solid ${nodeType?.color || '#6366f1'}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyPress}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>{nodeType?.icon}</span>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 18 }}>
            Edit {nodeType?.label || 'Node'}
          </h2>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Node label/title always editable */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#fff', display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>
            Title *
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData((prev: PlaybookNodeData) => ({ ...prev, label: e.target.value }))}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 6,
              border: '1px solid #444',
              background: '#18181b',
              color: '#fff',
              fontSize: 13,
            }}
            placeholder="Enter node title"
          />
        </div>

        {/* Dynamic fields for meta nodes */}
        {dynamicFields}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#444',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.label.trim()}
            style={{
              padding: '8px 16px',
              background: formData.label.trim() ? '#6366f1' : '#666',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: formData.label.trim() ? 'pointer' : 'not-allowed',
              fontSize: 13,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor; 