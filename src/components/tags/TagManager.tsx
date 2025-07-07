import React, { useState } from 'react';
import { TagGroup, AdvancedTagGroup, TagCategory } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { PlusCircleIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, BarChartIcon, BrainIcon, SubjectiveIcon } from '../ui/Icons';
import { ADVANCED_TAGS } from '../../constants/advancedTags';
import { TagTemplate } from '../../types/advancedTags';

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
  const [templates, setTemplates] = useState<TagTemplate[]>(() => {
    const saved = localStorage.getItem('tagTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TagTemplate | null>(null);

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

  const saveTemplates = (newTemplates: TagTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('tagTemplates', JSON.stringify(newTemplates));
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateModal(true);
  };
  const handleEditTemplate = (template: TagTemplate) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };
  const handleDeleteTemplate = (id: string) => {
    const newTemplates = templates.filter(t => t.id !== id);
    saveTemplates(newTemplates);
  };
  const handleSaveTemplate = (template: TagTemplate) => {
    let newTemplates;
    if (editingTemplate) {
      newTemplates = templates.map(t => t.id === template.id ? template : t);
    } else {
      newTemplates = [...templates, { ...template, id: Date.now().toString() }];
    }
    saveTemplates(newTemplates);
    setShowTemplateModal(false);
  };
  const handleApplyTemplate = (template: TagTemplate) => {
    // This should trigger tag selection in the parent, but for now just log
    alert('Apply template: ' + template.name);
  };

  // Helper to get a faded gradient for a group, starting from top right, using the group color
  const getGroupGradient = (color: string) =>
    `radial-gradient(circle at 90% 0%, ${color} 0%, ${color}33 40%, transparent 60%)`;

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
            <BarChartIcon className="w-5 h-5" />
            <span>Objective Tags (Market's Story)</span>
          </button>
        </div>

        {expandedCategories.has('objective') && (
          <div className="ml-6 space-y-4">
            {filteredAdvancedTags
              .filter(group => group.category === 'objective')
              .map(group => (
                <div key={group.id} className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500" style={{ background: getGroupGradient(group.subtags[0]?.color || 'var(--text-main)'), borderLeft: `8px solid ${group.subtags[0]?.color || 'var(--text-main)'}` }}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-blue-300" style={{ color: group.subtags[0]?.color || 'var(--text-main)' }}>
                      {group.name}
                    </h4>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{group.subtags.length} tags</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-main)', opacity: 0.85, fontWeight: 500 }}>{group.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.subtags.filter(tag => !tag.isDeprecated).map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleAdvancedTagSelect('objective', group.id, tag.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isTagSelected('objective', group.id, tag.id)
                            ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800'
                            : 'hover:bg-gray-700'
                        }`}
                        style={{ background: 'var(--background-tertiary)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '9999px', fontWeight: 500 }}
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
            <SubjectiveIcon className="w-5 h-5" />
            <span>Subjective Tags (Trader's Story)</span>
          </button>
        </div>

        {expandedCategories.has('subjective') && (
          <div className="ml-6 space-y-4">
            {filteredAdvancedTags
              .filter(group => group.category === 'subjective')
              .map(group => (
                <div key={group.id} className="bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500" style={{ background: getGroupGradient(group.subtags[0]?.color || 'var(--text-main)'), borderLeft: `8px solid ${group.subtags[0]?.color || 'var(--text-main)'}` }}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-orange-300" style={{ color: group.subtags[0]?.color || 'var(--text-main)' }}>
                      {group.name}
                    </h4>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{group.subtags.length} tags</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-main)', opacity: 0.85, fontWeight: 500 }}>{group.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.subtags.filter(tag => !tag.isDeprecated).map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleAdvancedTagSelect('subjective', group.id, tag.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isTagSelected('subjective', group.id, tag.id)
                            ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-800'
                            : 'hover:bg-gray-700'
                        }`}
                        style={{ background: 'var(--background-tertiary)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '9999px', fontWeight: 500 }}
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

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Tag Templates</h3>
          <Button onClick={handleCreateTemplate} variant="primary" size="sm">Create New Template</Button>
        </div>
        {templates.length === 0 ? (
          <div className="text-gray-400 text-sm">No templates yet.</div>
        ) : (
          <div className="space-y-2">
            {templates.map(template => (
              <div key={template.id} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-100">{template.name}</div>
                  <div className="text-xs text-gray-400">Tags: {template.objectiveTagIds.length}</div>
                  {template.strategyId && <div className="text-xs text-blue-400">Strategy: {template.strategyId}</div>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApplyTemplate(template)} size="sm">Apply</Button>
                  <Button onClick={() => handleEditTemplate(template)} size="sm">Edit</Button>
                  <Button onClick={() => handleDeleteTemplate(template.id)} size="sm" variant="danger">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => setShowTemplateModal(false)}
          objectiveTagGroups={ADVANCED_TAGS.filter(g => g.category === 'objective')}
        />
      )}
    </div>
  );
};

interface TemplateModalProps {
  template: TagTemplate | null;
  onSave: (template: TagTemplate) => void;
  onCancel: () => void;
  objectiveTagGroups: AdvancedTagGroup[];
}

function TemplateModal({ template, onSave, onCancel, objectiveTagGroups }: TemplateModalProps) {
  const [name, setName] = useState(template?.name || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(template?.objectiveTagIds || []);
  const [strategyId, setStrategyId] = useState(template?.strategyId || '');

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(ids => ids.includes(tagId) ? ids.filter(id => id !== tagId) : [...ids, tagId]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-lg">
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-bold mb-4">{template ? 'Edit Template' : 'Create Template'}</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Template Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="w-full" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Select Objective Tags</label>
            <div className="space-y-3">
              {objectiveTagGroups.map((group: AdvancedTagGroup) => (
                <div key={group.id} className="mb-2">
                  <div className="font-semibold text-blue-300 mb-1">{group.name}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {group.subtags.map((tag: AdvancedSubTag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${selectedTagIds.includes(tag.id) ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                        style={{ backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : undefined }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Strategy/Playbook (optional)</label>
            <Input value={strategyId} onChange={e => setStrategyId(e.target.value)} className="w-full" placeholder="Enter strategy or playbook name" />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-800 bg-gray-900 sticky bottom-0 z-10">
          <Button onClick={onCancel} variant="secondary">Cancel</Button>
          <Button onClick={() => onSave({ id: template?.id || '', name, objectiveTagIds: selectedTagIds, strategyId })} variant="primary">Save</Button>
        </div>
      </div>
    </div>
  );
}
    