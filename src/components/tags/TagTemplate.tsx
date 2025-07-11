import React, { useState, useEffect } from 'react';
import { AdvancedTagGroup, AdvancedSubTag, TagCategory } from '../../types';
import { ADVANCED_TAGS } from '../../constants/advancedTags';
import { TagIcon, PlusCircleIcon, TrashIcon, CheckIcon } from '../ui/Icons';

interface TagTemplate {
  id: string;
  name: string;
  description: string;
  tags: { [groupId: string]: string[] };
  category: TagCategory;
  usageCount: number;
  createdAt: string;
}

interface TagTemplateProps {
  onApplyTemplate?: (template: TagTemplate) => void;
  onSaveTemplate?: (template: Omit<TagTemplate, 'id' | 'usageCount' | 'createdAt'>) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

export const TagTemplate: React.FC<TagTemplateProps> = ({
  onApplyTemplate,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  const [templates, setTemplates] = useState<TagTemplate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<{ [groupId: string]: string[] }>({});
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<TagCategory>('objective');

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('tagTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save templates to localStorage
  const saveTemplatesToStorage = (newTemplates: TagTemplate[]) => {
    localStorage.setItem('tagTemplates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleTagToggle = (groupId: string, subTagId: string) => {
    setSelectedTags(prev => {
      const current = prev[groupId] || [];
      const newTags = current.includes(subTagId)
        ? current.filter(id => id !== subTagId)
        : [...current, subTagId];
      
      return {
        ...prev,
        [groupId]: newTags
      };
    });
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim()) return;

    const newTemplate: Omit<TagTemplate, 'id' | 'usageCount' | 'createdAt'> = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      tags: selectedTags,
      category: templateCategory
    };

    if (onSaveTemplate) {
      onSaveTemplate(newTemplate);
    } else {
      // Default implementation
      const template: TagTemplate = {
        ...newTemplate,
        id: Date.now().toString(),
        usageCount: 0,
        createdAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...templates, template];
      saveTemplatesToStorage(updatedTemplates);
    }

    // Reset form
    setTemplateName('');
    setTemplateDescription('');
    setSelectedTags({});
    setTemplateCategory('objective');
    setShowCreateForm(false);
  };

  const handleApplyTemplate = (template: TagTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
    
    // Update usage count
    const updatedTemplates = templates.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    );
    saveTemplatesToStorage(updatedTemplates);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (onDeleteTemplate) {
      onDeleteTemplate(templateId);
    } else {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      saveTemplatesToStorage(updatedTemplates);
    }
  };

  const getTagName = (tagId: string): string => {
    for (const group of ADVANCED_TAGS) {
      const subTag = group.subtags.find(st => st.id === tagId);
      if (subTag) return subTag.name;
    }
    return tagId;
  };

  const getTagColor = (tagId: string): string => {
    for (const group of ADVANCED_TAGS) {
      const subTag = group.subtags.find(st => st.id === tagId);
      if (subTag) return subTag.color;
    }
    return '#888';
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-yellow-400 flex items-center">
          <TagIcon className="w-6 h-6 mr-2" />
          Tag Templates
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <PlusCircleIcon className="w-4 h-4 mr-2" />
          {showCreateForm ? 'Cancel' : 'Create Template'}
        </button>
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-main mb-4">Create New Template</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Bull Market Setup"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value as TagCategory)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="objective">Objective</option>
                <option value="subjective">Subjective</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe when to use this template..."
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Tags</label>
            <div className="max-h-48 overflow-y-auto bg-gray-600 rounded-md p-3">
              {ADVANCED_TAGS.map(group => (
                <div key={group.id} className="mb-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">{group.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.subtags.map(subTag => (
                      <button
                        key={subTag.id}
                        onClick={() => handleTagToggle(group.id, subTag.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          (selectedTags[group.id] || []).includes(subTag.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-500 text-gray-300 hover:bg-gray-400'
                        }`}
                        style={{
                          border: `2px solid ${subTag.color}`,
                          color: (selectedTags[group.id] || []).includes(subTag.id) ? 'white' : subTag.color
                        }}
                      >
                        {subTag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTemplate}
              disabled={!templateName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Template
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No templates created yet. Create your first template to speed up tagging!
          </p>
        ) : (
          templates.map(template => (
            <div key={template.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-main">{template.name}</h3>
                  <p className="text-sm text-gray-400">{template.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Category: {template.category}</span>
                    <span>Used: {template.usageCount} times</span>
                    <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApplyTemplate(template)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                  >
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Apply
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(template.tags).map(([groupId, subTagIds]) =>
                  subTagIds.map(subTagId => (
                    <span
                      key={subTagId}
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        background: 'var(--background-tertiary)',
                        color: getTagColor(subTagId),
                        border: `1px solid ${getTagColor(subTagId)}`
                      }}
                    >
                      {getTagName(subTagId)}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 