import React, { useState } from 'react';
import { TagGroup } from '../types';
import { TagManager } from '../components/tags/TagManager';

interface TagsPageProps {
  initialTagGroups: TagGroup[];
}

const TagsPage: React.FC<TagsPageProps> = ({ initialTagGroups }) => {
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(initialTagGroups);

  const handleAddGroup = (name: string) => {
    const newGroup: TagGroup = {
      id: Date.now().toString(),
      name,
      subtags: [],
    };
    setTagGroups(prev => [...prev, newGroup]);
  };

  const handleDeleteGroup = (groupId: string) => {
    setTagGroups(prev => prev.filter(g => g.id !== groupId));
  };

  // Dummy handlers for required props
  const handleAddSubTag = () => {};
  const handleUpdateSubTagColor = () => {};
  const handleDeleteSubTag = () => {};

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6" style={{ background: 'var(--background-main)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Tags</h1>
          {/* Future: Filters, etc. */}
        </div>
        <TagManager
          tagGroups={tagGroups}
          onAddGroup={handleAddGroup}
          onAddSubTag={handleAddSubTag}
          onUpdateSubTagColor={handleUpdateSubTagColor}
          onDeleteGroup={handleDeleteGroup}
          onDeleteSubTag={handleDeleteSubTag}
        />
      </div>
    </div>
  );
};

export default TagsPage; 