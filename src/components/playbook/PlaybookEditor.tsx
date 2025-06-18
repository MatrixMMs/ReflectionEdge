import React, { useState } from 'react';
import { PlaybookEntry, TagGroup } from '../../types';

interface PlaybookEditorProps {
  entry?: PlaybookEntry;
  tagGroups: TagGroup[];
  onSave: (entry: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const PlaybookEditor: React.FC<PlaybookEditorProps> = ({ entry, tagGroups, onSave, onCancel }) => {
  const [name, setName] = useState(entry?.name || '');
  const [description, setDescription] = useState(entry?.description || '');
  const [tags, setTags] = useState<{ [groupId: string]: string[] }>(entry?.tags || {});
  const [checklist, setChecklist] = useState<string[]>(entry?.checklist || []);
  const [notes, setNotes] = useState(entry?.notes || '');
  const [newChecklistItem, setNewChecklistItem] = useState('');

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
      setChecklist(prev => [...prev, newChecklistItem.trim()]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklist(prev => prev.filter((_, i) => i !== idx));
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
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
        <div className="space-y-2">
          {tagGroups.map(group => (
            <div key={group.id}>
              <span className="font-semibold text-purple-300 text-xs">{group.name}</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {group.subtags.map(subtag => (
                  <button
                    key={subtag.id}
                    type="button"
                    onClick={() => handleTagToggle(group.id, subtag.id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-colors ${tags[group.id]?.includes(subtag.id) ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subtag.color }} />
                    <span>{subtag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
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
          {checklist.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-gray-200">
              <span>{item}</span>
              <button type="button" className="text-red-400 hover:text-red-600" onClick={() => handleRemoveChecklistItem(idx)}>Remove</button>
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