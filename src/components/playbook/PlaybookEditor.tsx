import React, { useState, useEffect, useRef } from 'react';
import { PlaybookEntry } from '../../types';
import { ADVANCED_TAGS } from '../../constants/advancedTags';
import { generateSecureId } from '../../utils/security';
import { ChevronDownIcon, ChevronUpIcon } from '../ui/Icons';

interface PlaybookEditorProps {
  entry?: PlaybookEntry;
  onSave: (entry: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const PlaybookEditor: React.FC<PlaybookEditorProps> = ({ entry, onSave, onCancel }) => {
  const [name, setName] = useState(entry?.name || '');
  const [description, setDescription] = useState(entry?.description || '');
  const [tags, setTags] = useState<{ [groupId: string]: string[] }>(entry?.tags || {});
  const [checklist, setChecklist] = useState<{ id: string; item: string; }[]>(entry?.checklist || []);
  const [notes, setNotes] = useState(entry?.notes || '');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const [collapsedGroups, setCollapsedGroups] = React.useState<{ [groupId: string]: boolean }>({});
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  useEffect(() => {
    if (editingItemId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingItemId]);

  const handleTagToggle = (groupId: string, subTagId: string) => {
    setTags(prev => {
      const current = prev[groupId] || [];
      const next = current.includes(subTagId)
        ? current.filter(id => id !== subTagId)
        : [...current, subTagId];
      return { ...prev, [groupId]: next };
    });
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem = {
        id: generateSecureId(),
        item: newChecklistItem.trim()
      };
      setChecklist(prev => [...prev, newItem]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (idToRemove: string) => {
    setChecklist(prev => prev.filter(item => item.id !== idToRemove));
  };

  const handleStartEditing = (id: string, text: string) => {
    setEditingItemId(id);
    setEditingItemText(text);
  };

  const handleSaveEditing = () => {
    if (editingItemId && editingItemText.trim()) {
      setChecklist(prev =>
        prev.map(item =>
          item.id === editingItemId ? { ...item, item: editingItemText.trim() } : item
        )
      );
    }
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEditing();
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingItemText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, tags, checklist, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Strategy Name</label>
        <input
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-3">
        {ADVANCED_TAGS.map(group => {
          const isCollapsed = collapsedGroups[group.id] || false;
          return (
            <div key={group.id} className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-t-xl"
                onClick={() => toggleGroupCollapse(group.id)}
                aria-expanded={!isCollapsed}
                aria-controls={`tag-group-${group.id}`}
                style={{ border: 'none', boxShadow: 'none', background: 'none' }}
              >
                <span className="text-xs font-semibold text-gray-200 tracking-wide">{group.name}</span>
                {isCollapsed ? (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {!isCollapsed && (
                <>
                  <div className="border-t border-gray-700 mx-2" />
                  <div id={`tag-group-${group.id}`} className="flex flex-wrap gap-2 px-4 pb-3 pt-3">
                    {group.subtags.map(subtag => {
                      const isSelected = tags[group.id]?.includes(subtag.id);
                      return (
                        <button
                          key={subtag.id}
                          type="button"
                          onClick={() => handleTagToggle(group.id, subtag.id)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors focus:outline-none mr-2 mb-2 ${
                            isSelected ? 'ring-2 ring-purple-400' : 'hover:bg-gray-600'
                          }`}
                          style={{
                            background: isSelected ? subtag.color : '#374151',
                            color: isSelected ? '#fff' : '#9CA3AF'
                          }}
                        >
                          {subtag.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Checklist</label>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
            value={newChecklistItem}
            onChange={e => setNewChecklistItem(e.target.value)}
            placeholder="Add checklist item"
          />
          <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddChecklistItem}>Add</button>
        </div>
        <ul className="space-y-1">
          {checklist.map((checklistItem) => (
            <li key={checklistItem.id} className="flex items-center justify-between gap-2 text-gray-200 bg-gray-700 p-2 rounded">
              {editingItemId === checklistItem.id ? (
                <input
                  ref={editInputRef}
                  value={editingItemText}
                  onChange={(e) => setEditingItemText(e.target.value)}
                  onBlur={handleSaveEditing}
                  onKeyDown={handleInputKeyDown}
                  className="flex-1 bg-gray-600 border border-gray-500 text-gray-100 rounded p-1"
                />
              ) : (
                <span
                  className="flex-1 cursor-pointer"
                  onClick={() => handleStartEditing(checklistItem.id, checklistItem.item)}
                >
                  {checklistItem.item}
                </span>
              )}
              <button 
                type="button" 
                className="text-error hover:text-error font-bold" 
                onClick={() => handleRemoveChecklistItem(checklistItem.id)}
                aria-label="Remove checklist item"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
        <textarea
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded" onClick={onCancel}>Cancel</button>
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </form>
  );
}; 