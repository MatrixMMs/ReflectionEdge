import React from 'react';
import { TagGroup, TagCategory } from '../types';
import { TagManager } from '../components/tags/TagManager';

interface TagsPageProps {
  tagGroups: TagGroup[];
  onAddGroup: (name: string) => void;
  onAddSubTag: (groupId: string, subTagName: string) => void;
  onUpdateSubTagColor: (groupId: string, subTagId: string, color: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onDeleteSubTag: (groupId: string, subTagId: string) => void;
  onAdvancedTagSelect: (category: TagCategory, groupId: string, tagId: string) => void;
  selectedAdvancedTags: { [category: string]: { [groupId: string]: string[] } };
}

const TagsPage: React.FC<TagsPageProps> = ({
  tagGroups,
  onAddGroup,
  onAddSubTag,
  onUpdateSubTagColor,
  onDeleteGroup,
  onDeleteSubTag,
  onAdvancedTagSelect,
  selectedAdvancedTags
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-400">Tag Manager</h1>
          <p className="text-gray-400 mt-2">Organize your trades with custom tags and categories</p>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <TagManager
            tagGroups={tagGroups}
            onAddGroup={onAddGroup}
            onAddSubTag={onAddSubTag}
            onUpdateSubTagColor={onUpdateSubTagColor}
            onDeleteGroup={onDeleteGroup}
            onDeleteSubTag={onDeleteSubTag}
            onAdvancedTagSelect={onAdvancedTagSelect}
            selectedAdvancedTags={selectedAdvancedTags}
          />
        </div>
      </div>
    </div>
  );
};

export default TagsPage; 