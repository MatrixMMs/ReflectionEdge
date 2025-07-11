import React from 'react';
import { TagManager } from '../components/tags/TagManager';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { TagGroup, AdvancedTagGroup } from '../types';

interface AllTagsPageProps {
  tagGroups: AdvancedTagGroup[];
}

const AllTagsPage: React.FC<AllTagsPageProps> = ({ tagGroups }) => {
  const navigate = useNavigate();
  // Dummy handlers for required props
  const handleAddGroup = () => {};
  const handleAddSubTag = () => {};
  const handleUpdateSubTagColor = () => {};
  const handleDeleteGroup = () => {};
  const handleDeleteSubTag = () => {};

  return (
    <div className="min-h-screen text-gray-100" style={{ background: 'var(--background-main)' }}>
      <div className="bg-gray-800 p-3 flex items-center justify-between absolute top-0 left-0 right-0 z-10" style={{ background: 'var(--background-secondary)', marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        <h1 className="text-3xl font-[550]" style={{ color: 'var(--text-main)', marginLeft: '1rem', fontWeight: 550 }}>All Tags</h1>
        <Button onClick={() => navigate('/tags')} variant="secondary">Back to Tag Dashboard</Button>
      </div>
      <div className="p-6 pt-20 w-full">
        <TagManager
          tagGroups={tagGroups as TagGroup[]}
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

export default AllTagsPage; 