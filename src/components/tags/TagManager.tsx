import React, { useState } from 'react';
import { TagGroup, AdvancedTagGroup, TagCategory } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { PlusCircleIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, LightBulbIcon, BrainIcon } from '../ui/Icons';
import { ADVANCED_TAGS } from '../../constants/advancedTags';

interface TagManagerProps {
  tagGroups: TagGroup[];
  onAddGroup: (name: string) => void;
  onAddSubTag: (groupId: string, subTagName: string) => void;
  onUpdateSubTagColor: (groupId: string, subTagId: string, color: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onDeleteSubTag: (groupId: string, subTagId: string) => void;
  // Advanced system props
  onAdvancedTagSelect?: (category: TagCategory, groupId: string, tagId: string) => void;
  selectedAdvancedTags?: { [category: string]: { [groupId: string]: string[] } };
}

export const TagManager: React.FC<TagManagerProps> = ({ 
  tagGroups, 
  onAddGroup, 
  onAddSubTag, 
  onUpdateSubTagColor, 
  onDeleteGroup, 
  onDeleteSubTag,
  onAdvancedTagSelect,
  selectedAdvancedTags = {}
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [newSubTagName, setNewSubTagName] = useState<{ [groupId: string]: string }>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['objective']));
  const [searchQuery, setSearchQuery] = useState('');

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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleAdvancedTagSelect = (category: TagCategory, groupId: string, tagId: string) => {
    if (onAdvancedTagSelect) {
      onAdvancedTagSelect(category, groupId, tagId);
    }
  };

  const isTagSelected = (category: TagCategory, groupId: string, tagId: string) => {
    return selectedAdvancedTags[category]?.[groupId]?.includes(tagId) || false;
  };

  const filteredAdvancedTags = ADVANCED_TAGS.filter(group => {
    if (!searchQuery) return true;
    return group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           group.subtags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-6 text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Advanced Tag System</h2>
        <div className="text-sm text-gray-400">
          {Object.keys(selectedAdvancedTags).length > 0 && (
            <span>
              {Object.values(selectedAdvancedTags).reduce((total, groups) => 
                total + Object.values(groups).reduce((sum, tags) => sum + tags.length, 0), 0
              )} tags selected
            </span>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <Input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full"
        />
      </div>

      {/* Objective Tags */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleCategory('objective')}
            className="flex items-center space-x-2 text-lg font-semibold text-blue-400 hover:text-blue-300"
          >
            {expandedCategories.has('objective') ? (
              <ChevronDownIcon className="w-5 h-5" />
            ) : (
              <ChevronUpIcon className="w-5 h-5" />
            )}
            <LightBulbIcon className="w-5 h-5" />
            <span>Objective Tags (Market's Story)</span>
          </button>
        </div>

        {expandedCategories.has('objective') && (
          <div className="ml-6 space-y-4">
            {filteredAdvancedTags
              .filter(group => group.category === 'objective')
              .map(group => (
                <div key={group.id} className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-blue-300">
                      {group.name}
                      <span className="ml-2 text-xs text-gray-400">({group.subcategory.replace('_', ' ')})</span>
                    </h4>
                    <span className="text-xs text-gray-400">{group.subtags.length} tags</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{group.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.subtags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleAdvancedTagSelect('objective', group.id, tag.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isTagSelected('objective', group.id, tag.id)
                            ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800'
                            : 'hover:bg-gray-700'
                        }`}
                        style={{ backgroundColor: tag.color }}
                        title={tag.description}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Subjective Tags */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleCategory('subjective')}
            className="flex items-center space-x-2 text-lg font-semibold text-orange-400 hover:text-orange-300"
          >
            {expandedCategories.has('subjective') ? (
              <ChevronDownIcon className="w-5 h-5" />
            ) : (
              <ChevronUpIcon className="w-5 h-5" />
            )}
            <BrainIcon className="w-5 h-5" />
            <span>Subjective Tags (Trader's Story)</span>
          </button>
        </div>

        {expandedCategories.has('subjective') && (
          <div className="ml-6 space-y-4">
            {filteredAdvancedTags
              .filter(group => group.category === 'subjective')
              .map(group => (
                <div key={group.id} className="bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-orange-300">
                      {group.name}
                      <span className="ml-2 text-xs text-gray-400">({group.subcategory.replace('_', ' ')})</span>
                    </h4>
                    <span className="text-xs text-gray-400">{group.subtags.length} tags</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{group.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.subtags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleAdvancedTagSelect('subjective', group.id, tag.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isTagSelected('subjective', group.id, tag.id)
                            ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-800'
                            : 'hover:bg-gray-700'
                        }`}
                        style={{ backgroundColor: tag.color }}
                        title={tag.description}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Selected Tags Summary */}
      {Object.keys(selectedAdvancedTags).length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg border border-purple-500">
          <h4 className="text-md font-medium text-purple-300 mb-3">Selected Tags</h4>
          <div className="space-y-2">
            {Object.entries(selectedAdvancedTags).map(([category, groups]) => (
              <div key={category}>
                <h5 className="text-sm font-medium text-gray-300 capitalize">{category}</h5>
                <div className="ml-4 space-y-1">
                  {Object.entries(groups).map(([groupId, tagIds]) => {
                    const group = ADVANCED_TAGS.find(g => g.id === groupId);
                    return (
                      <div key={groupId} className="text-xs text-gray-400">
                        <span className="font-medium">{group?.name}:</span>
                        <div className="ml-2 flex flex-wrap gap-1">
                          {tagIds.map(tagId => {
                            const tag = group?.subtags.find(t => t.id === tagId);
                            return (
                              <span
                                key={tagId}
                                className="px-2 py-1 rounded text-xs"
                                style={{ backgroundColor: tag?.color }}
                              >
                                {tag?.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legacy Tag Management (for backward compatibility with existing data) */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Legacy Tag Management</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-gray-300 mb-2">Add New Tag Group</h4>
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
            <h4 className="text-md font-medium text-gray-300">Existing Tag Groups</h4>
            {tagGroups.length === 0 && <p className="text-sm text-gray-400">No tag groups yet. Add one above to get started!</p>}
            {tagGroups.map(group => (
              <div key={group.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium text-gray-300">
                    {group.name}
                    {isDefaultGroup(group.id) && (
                      <span className="ml-2 text-xs text-gray-400">(Default)</span>
                    )}
                  </h5>
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
                    <div key={subtag.id} className="flex items-center justify-between space-x-2">
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: subtag.color }}
                      >
                        {subtag.name}
                      </span>
                      {!isDefaultGroup(group.id) && (
                        <Button 
                          onClick={() => onDeleteSubTag(group.id, subtag.id)} 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-400"
                          aria-label="Delete subtag"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
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
      </div>
    </div>
  );
};
    