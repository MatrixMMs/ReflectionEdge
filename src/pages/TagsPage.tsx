import React, { useState } from 'react';
import { AdvancedTagGroup, Trade, AppDateRange, TradeDirectionFilterSelection } from '../types';
import { TagManager } from '../components/tags/TagManager';
import { TagPerformance } from '../components/tags/TagPerformance';
import { TagTemplate } from '../components/tags/TagTemplate';
import { TagTrends } from '../components/tags/TagTrends';
import { TradeList } from '../components/trades/TradeList';
import { Button } from '../components/ui/Button';

interface TagsPageProps {
  trades: Trade[];
  tagGroups: AdvancedTagGroup[];
}

const TagsPage: React.FC<TagsPageProps> = ({ trades, tagGroups }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);

  // Dummy handlers for required props
  const handleAddGroup = () => {};
  const handleAddSubTag = () => {};
  const handleUpdateSubTagColor = () => {};
  const handleDeleteGroup = () => {};
  const handleDeleteSubTag = () => {};

  // For now, use empty date range and direction for analytics
  const chartDateRange: AppDateRange = { start: '', end: '' };
  const directionFilter: TradeDirectionFilterSelection = 'all';

  // Convert AdvancedTagGroup[] to TagGroup[] for TradeList (they are structurally compatible for this use)
  const tagGroupsForTradeList = tagGroups as any;

  return (
    <div className="min-h-screen text-gray-100" style={{ background: 'var(--background-main)' }}>
      {/* Header Card */}
      <div 
        className="bg-gray-800 p-3 flex items-center justify-between absolute top-0 left-0 right-0 z-10" 
        style={{ 
          background: 'var(--background-secondary)',
          marginLeft: 'var(--sidebar-width)',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <h1 className="text-3xl font-[550]" style={{ color: 'var(--text-main)', marginLeft: '1rem', fontWeight: 550 }}>Tags</h1>
        <div>{/* Future: Filters, etc. */}</div>
      </div>
      {/* Main Dashboard Grid */}
      <div className="p-6 pt-20 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          {/* Left Column: Analytics/Statistics */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 p-6 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4" style={{ color: 'var(--text-main)' }}>Tag Analytics</h2>
              {/* TagPerformance analytics */}
              <TagPerformance 
                trades={trades} 
                tagGroups={tagGroups} 
                chartDateRange={chartDateRange} 
                directionFilter={directionFilter} 
                onTagClick={(tagId, tagName) => { setSelectedTagId(tagId); setSelectedTagName(tagName); }}
              />
              {/* Placeholders for more analytics (trends, most/least used, etc.) */}
              <div className="mt-4 text-gray-400 text-sm">[Trends, Most/Least Used, etc. coming soon]</div>
            </div>
            {selectedTagId && (
              <div className="bg-gray-800 p-6 rounded-xl mt-4" style={{ background: 'var(--background-secondary)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                    Trades with tag: <span style={{ color: '#00e676' }}>{selectedTagName}</span>
                  </h3>
                  <Button size="sm" variant="secondary" onClick={() => { setSelectedTagId(null); setSelectedTagName(null); }}>Clear Filter</Button>
                </div>
                <TradeList
                  trades={trades}
                  tagGroups={tagGroupsForTradeList}
                  playbookEntries={[]}
                  onEditTrade={() => {}}
                  onDeleteTrade={() => {}}
                  onViewDetails={() => {}}
                  filtersOpen={false}
                  setFiltersOpen={() => {}}
                  filterTagId={selectedTagId}
                  onClearTagFilter={() => { setSelectedTagId(null); setSelectedTagName(null); }}
                />
              </div>
            )}
          </div>
          {/* Center Column: Insights */}
          <div className="flex flex-col gap-6">
            <TagTrends 
              trades={trades} 
              tagGroups={tagGroups} 
              chartDateRange={chartDateRange} 
              directionFilter={directionFilter} 
            />
            <div className="bg-gray-800 p-6 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4" style={{ color: 'var(--text-main)' }}>Tag Insights</h2>
              <div className="text-gray-400 text-sm">[Correlation, Performance by Tag, Tag Impact, etc. coming soon]</div>
            </div>
          </div>
          {/* Right Column: Management/Templates/Summary */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 p-6 rounded-xl flex flex-col gap-4" style={{ background: 'var(--background-secondary)' }}>
              <Button onClick={() => setShowAllTags(v => !v)} variant="primary">
                {showAllTags ? 'Hide All Tags' : 'View All Tags'}
              </Button>
              {showAllTags && (
                <div className="mt-4">
                  <TagManager
                    tagGroups={tagGroups}
                    onAddGroup={handleAddGroup}
                    onAddSubTag={handleAddSubTag}
                    onUpdateSubTagColor={handleUpdateSubTagColor}
                    onDeleteGroup={handleDeleteGroup}
                    onDeleteSubTag={handleDeleteSubTag}
                  />
                </div>
              )}
            </div>
            {/* Tag Templates */}
            <TagTemplate />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage; 