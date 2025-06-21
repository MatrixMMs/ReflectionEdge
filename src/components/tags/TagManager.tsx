import React, { useState } from 'react';
import { TagGroup } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { PlusCircleIcon, TrashIcon } from '../ui/Icons';

interface TagManagerProps {
  tagGroups: TagGroup[];
  onAddGroup: (name: string) => void;
  onAddSubTag: (groupId: string, subTagName: string) => void;
  onUpdateSubTagColor: (groupId: string, subTagId: string, color: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ tagGroups, onAddGroup, onAddSubTag, onUpdateSubTagColor, onDeleteGroup }) => {
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

  const isDefaultGroup = (groupId: string) => {
    // Only lock 'feeling' and 'market' groups
    return groupId === 'feeling' || groupId === 'market';
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
            placeholder="e.g., Strategy, Time of Day"
            className="flex-grow"
          />
          <Button onClick={handleAddGroup} variant="primary" size="md" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Add Group</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-purple-400">Existing Tag Groups</h3>
        {tagGroups.length === 0 && <p className="text-sm text-gray-400">No tag groups yet. Add one above to get started!</p>}
        {tagGroups.map(group => (
          <div key={group.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium text-purple-300">
                {group.name}
                {isDefaultGroup(group.id) && (
                  <span className="ml-2 text-xs text-gray-400">(Default)</span>
                )}
              </h4>
              {!isDefaultGroup(group.id) && (
                <Button 
                  onClick={() => onDeleteGroup(group.id)} 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-400"
                >
                  <TrashIcon className="w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {group.subtags.map(subtag => (
                <div key={subtag.id} className="flex items-center space-x-2">
                  <ColorPicker
                    initialColor={subtag.color}
                    onChange={(color) => onUpdateSubTagColor(group.id, subtag.id, color)}
                  />
                  <span className="text-sm">{subtag.name}</span>
                </div>
              ))}
              {!isDefaultGroup(group.id) && (
                <div className="flex space-x-2 mt-2">
                  <Input
                    type="text"
                    value={newSubTagName[group.id] || ''}
                    onChange={e => setNewSubTagName(prev => ({ ...prev, [group.id]: e.target.value }))}
                    placeholder="New subtag name"
                    className="flex-grow"
                  />
                  <Button 
                    onClick={() => handleAddSubTag(group.id)} 
                    variant="secondary" 
                    size="sm"
                    leftIcon={<PlusCircleIcon className="w-4 h-4"/>}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
    