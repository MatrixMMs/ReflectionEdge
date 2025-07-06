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
    <div className="min-h-screen text-gray-100" style={{ background: 'var(--background-main)' }}>
      {/* Header Card: full width, flush with top/left/right - positioned absolutely to break out of main content constraints */}
      <div 
        className="bg-gray-800 p-3 flex items-center justify-between absolute top-0 left-0 right-0 z-10" 
        style={{ 
          background: 'var(--background-secondary)',
          marginLeft: 'var(--sidebar-width)',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)', marginLeft: '1rem' }}>Tags</h1>
        <div>
          {/* Future: Filters, etc. */}
        </div>
      </div>
      {/* Page Content: padded, not touching sidebar or page edges - with top margin to account for header */}
      <div className="p-6 pt-20">
        <div className="max-w-4xl mx-auto">
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
    </div>
  );
};

export default TagsPage; 