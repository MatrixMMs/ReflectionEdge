
import React, { useState } from 'react';
import { TagGroup, SubTag } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { PlusCircleIcon } from '../ui/Icons';

interface TagManagerProps {
  tagGroups: TagGroup[];
  onAddGroup: (name: string) => void;
  onAddSubTag: (groupId: string, subTagName: string) => void;
  onUpdateSubTagColor: (groupId: string, subTagId: string, color: string) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ tagGroups, onAddGroup, onAddSubTag, onUpdateSubTagColor }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [newSubTagName, setNewSubTagName] = useState<{ [groupId: string]: string }>({});

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleAddSubTag = (groupId: string) => {
    const name = newSubTagName[groupId]?.trim();
    if (name) {
      onAddSubTag(groupId, name);
      setNewSubTagName(prev => ({ ...prev, [groupId]: '' }));
    }
  };

  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-purple-400">Add New Tag Group</h3>
        <div className="flex space-x-2">
          <Input 
            type="text" 
            value={newGroupName} 
            onChange={e => setNewGroupName(e.target.value)} 
            placeholder="e.g., How I Feel, Trade Setup"
            className="flex-grow"
          />
          <Button onClick={handleAddGroup} variant="primary" size="md" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Add Group</Button>
        </div>
      </div>

      {tagGroups.length === 0 && <p className="text-sm text-gray-400">No tag groups yet. Add one above to get started!</p>}
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {tagGroups.map(group => (
          <div key={group.id} className="bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-md font-semibold mb-3 text-pink-400">{group.name}</h4>
            <ul className="space-y-2 mb-3">
              {group.subtags.map(subtag => (
                <li key={subtag.id} className="flex items-center justify-between text-sm bg-gray-600 p-2 rounded">
                  <span style={{ color: subtag.color }} className="font-medium">{subtag.name}</span>
                  <ColorPicker 
                    initialColor={subtag.color} 
                    onChange={color => onUpdateSubTagColor(group.id, subtag.id, color)}
                  />
                </li>
              ))}
              {group.subtags.length === 0 && <p className="text-xs text-gray-500 italic">No sub-tags yet in this group.</p>}
            </ul>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={newSubTagName[group.id] || ''}
                onChange={e => setNewSubTagName(prev => ({ ...prev, [group.id]: e.target.value }))}
                placeholder="New sub-tag name"
                className="flex-grow text-sm"
              />
              <Button onClick={() => handleAddSubTag(group.id)} variant="secondary" size="sm" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Add Sub-tag</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
    