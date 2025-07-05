import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { ChartYAxisMetric, ChartXAxisMetric, TagGroup, AppDateRange, TradeDirectionFilterSelection } from '../../types';
import { ChevronDownIcon, ChevronUpIcon } from '../ui/Icons';
import { ADVANCED_TAGS } from '../../constants/advancedTags';
import { AdvancedTagGroup } from '../../types';

interface ChartControlsProps {
  yAxisMetric: ChartYAxisMetric;
  setYAxisMetric: (metric: ChartYAxisMetric) => void;
  xAxisMetric: ChartXAxisMetric;
  setXAxisMetric: (metric: ChartXAxisMetric) => void;
  compareDateRange: AppDateRange | null;
  setCompareDateRange: (range: AppDateRange | null) => void;
  tagGroups: TagGroup[];
  selectedTags: { [groupId: string]: string[] };
  setSelectedTags: React.Dispatch<React.SetStateAction<{ [groupId: string]: string[] }>>;
  tagComparisonMode: 'AND' | 'OR';
  setTagComparisonMode: (mode: 'AND' | 'OR') => void;
  directionFilter: TradeDirectionFilterSelection;
  setDirectionFilter: (filter: TradeDirectionFilterSelection) => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  yAxisMetric, setYAxisMetric, xAxisMetric, setXAxisMetric,
  compareDateRange, setCompareDateRange,
  tagGroups, selectedTags, setSelectedTags, tagComparisonMode, setTagComparisonMode,
  directionFilter, setDirectionFilter
}) => {
  const [collapsedGroups, setCollapsedGroups] = React.useState<{ [groupId: string]: boolean }>({});
  const [tagSearch, setTagSearch] = useState('');

  const handleTagSelection = (groupId: string, subTagId: string) => {
    setSelectedTags(prev => {
      const currentGroupTags = prev[groupId] || [];
      const newGroupTags = currentGroupTags.includes(subTagId)
        ? currentGroupTags.filter(id => id !== subTagId)
        : [...currentGroupTags, subTagId];
      
      if (newGroupTags.length === 0) {
        const { [groupId]: _, ...rest } = prev; 
        return rest;
      }
      return { ...prev, [groupId]: newGroupTags };
    });
  };
  
  const toggleCompareDateRange = () => {
    if (compareDateRange) {
      setCompareDateRange(null);
    } else {
      setCompareDateRange({ start: '', end: '' });
    }
  };

  // Helper to check if any tags are actually selected
  const hasSelectedTags = () => {
    return Object.values(selectedTags).some(arr => Array.isArray(arr) && arr.length > 0);
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Replace tagGroups with advanced tag groups
  const objectiveTagGroups = ADVANCED_TAGS.filter(g => g.category === 'objective');
  const subjectiveTagGroups = ADVANCED_TAGS.filter(g => g.category === 'subjective');

  // Filter groups and subtags by search
  const filterGroups = (groups: AdvancedTagGroup[]) => {
    if (!tagSearch.trim()) return groups;
    const q = tagSearch.trim().toLowerCase();
    return groups
      .map(group => {
        // Check if group name matches
        const groupMatch = group.name.toLowerCase().includes(q);
        // Filter subtags by name
        const filteredSubtags = group.subtags.filter(subtag => subtag.name.toLowerCase().includes(q));
        if (groupMatch || filteredSubtags.length > 0) {
          return { ...group, subtags: groupMatch ? group.subtags : filteredSubtags };
        }
        return null;
      })
      .filter(Boolean) as AdvancedTagGroup[];
  };

  // Helper to highlight search match in tag name
  const highlightMatch = (name: string) => {
    if (!tagSearch.trim()) return name;
    const q = tagSearch.trim();
    const i = name.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return name;
    return <>{name.slice(0, i)}<span className="bg-yellow-300 text-gray-900 rounded px-1">{name.slice(i, i + q.length)}</span>{name.slice(i + q.length)}</>;
  };

  return (
    <div className="space-y-2 text-gray-300 text-xs">
      {/* Comparison Date Range */}
      <div>
        <label className="flex items-center space-x-1 cursor-pointer text-xs">
          <input 
            type="checkbox" 
            checked={!!compareDateRange} 
            onChange={toggleCompareDateRange}
            className="form-checkbox h-4 w-4 text-purple-600 bg-gray-700 border-gray-500 rounded focus:ring-purple-500"
          />
          <span>Compare with another period</span>
        </label>
        {compareDateRange && (
          <div className="grid grid-cols-2 gap-2 mt-1 pl-4">
            <Input label="Compare Start" type="date" value={compareDateRange.start} onChange={e => setCompareDateRange({ ...compareDateRange, start: e.target.value })} className="h-7 text-xs p-1" />
            <Input label="Compare End" type="date" value={compareDateRange.end} onChange={e => setCompareDateRange({ ...compareDateRange, end: e.target.value })} className="h-7 text-xs p-1" />
          </div>
        )}
      </div>

      {/* Axis Metric Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label htmlFor="y-axis-metric" className="block text-xs font-medium mb-0.5">Y-Axis Metric:</label>
          <select
            id="y-axis-metric"
            value={yAxisMetric}
            onChange={e => setYAxisMetric(e.target.value as ChartYAxisMetric)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 p-1 h-7"
          >
            {Object.values(ChartYAxisMetric).map(metric => <option key={metric} value={metric}>{metric}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="x-axis-metric" className="block text-xs font-medium mb-0.5">X-Axis Metric:</label>
          <select
            id="x-axis-metric"
            value={xAxisMetric}
            onChange={e => setXAxisMetric(e.target.value as ChartXAxisMetric)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 p-1 h-7"
          >
            {Object.values(ChartXAxisMetric).map(metric => <option key={metric} value={metric}>{metric}</option>)}
          </select>
        </div>
      </div>
       {/* Direction Filter */}
      <div>
        <label htmlFor="direction-filter" className="block text-xs font-medium mb-0.5">Trade Direction:</label>
        <select
          id="direction-filter"
          value={directionFilter}
          onChange={e => setDirectionFilter(e.target.value as TradeDirectionFilterSelection)}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 p-1 h-7"
        >
          <option value="all">All Directions (Separate Lines)</option>
          <option value="long">Long Only</option>
          <option value="short">Short Only</option>
        </select>
      </div>
      {/* Tag Search Bar */}
      <div>
        <Input
          label="Search Tags"
          type="text"
          value={tagSearch}
          onChange={e => setTagSearch(e.target.value)}
          placeholder="Type to search tags..."
          className="h-7 text-xs p-1"
        />
      </div>
      {/* Tag Filter Sections */}
      <div>
        <h4 className="text-xs font-medium mb-1">Filter by Tags:</h4>
        {/* Objective Tags */}
        <div className="mb-2">
          <div className="text-xs font-bold text-blue-400 mb-1">Objective Tags (Market's Story)</div>
          {filterGroups(objectiveTagGroups).map(group => {
            const isCollapsed = collapsedGroups[group.id] || false;
            return (
              <div key={group.id} className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm mb-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-xl"
                  onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                  aria-expanded={!isCollapsed}
                  aria-controls={`tag-group-${group.id}`}
                  style={{ border: 'none', boxShadow: 'none', background: 'none' }}
                >
                  <span className="text-xs font-semibold text-gray-200 tracking-wide">{highlightMatch(group.name)}</span>
                  {isCollapsed ? (
                    <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronUpIcon className="w-3 h-3 text-gray-400" />
                  )}
                </button>
                {!isCollapsed && (
                  <>
                    <div className="border-t border-gray-700 mx-1" />
                    <div id={`tag-group-${group.id}`} className="flex flex-wrap gap-1 px-2 pb-2 pt-2">
                      {group.subtags.map(subtag => {
                        const isSelected = selectedTags[group.id]?.includes(subtag.id);
                        return (
                          <button
                            key={subtag.id}
                            type="button"
                            onClick={() => handleTagSelection(group.id, subtag.id)}
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors mr-1 mb-1 ${
                              isSelected ? 'ring-2 ring-blue-400' : 'hover:bg-gray-600'
                            }`}
                            style={{
                              background: isSelected ? subtag.color : '#374151',
                              color: isSelected ? '#fff' : '#9CA3AF'
                            }}
                          >
                            {highlightMatch(subtag.name)}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {/* Subjective Tags */}
        <div>
          <div className="text-xs font-bold text-yellow-400 mb-1">Subjective Tags (Trader's Story)</div>
          {filterGroups(subjectiveTagGroups).map(group => {
            const isCollapsed = collapsedGroups[group.id] || false;
            return (
              <div key={group.id} className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm mb-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-t-xl"
                  onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                  aria-expanded={!isCollapsed}
                  aria-controls={`tag-group-${group.id}`}
                  style={{ border: 'none', boxShadow: 'none', background: 'none' }}
                >
                  <span className="text-xs font-semibold text-gray-200 tracking-wide">{highlightMatch(group.name)}</span>
                  {isCollapsed ? (
                    <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronUpIcon className="w-3 h-3 text-gray-400" />
                  )}
                </button>
                {!isCollapsed && (
                  <>
                    <div className="border-t border-gray-700 mx-1" />
                    <div id={`tag-group-${group.id}`} className="flex flex-wrap gap-1 px-2 pb-2 pt-2">
                      {group.subtags.map(subtag => {
                        const isSelected = selectedTags[group.id]?.includes(subtag.id);
                        return (
                          <button
                            key={subtag.id}
                            type="button"
                            onClick={() => handleTagSelection(group.id, subtag.id)}
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors mr-1 mb-1 ${
                              isSelected ? 'ring-2 ring-yellow-400' : 'hover:bg-gray-600'
                            }`}
                            style={{
                              background: isSelected ? subtag.color : '#374151',
                              color: isSelected ? '#fff' : '#9CA3AF'
                            }}
                          >
                            {highlightMatch(subtag.name)}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {Object.keys(selectedTags).length > 0 && (
          <div className="mt-1">
            <label htmlFor="tag-comparison-mode" className="block text-xs font-medium mb-0.5">Tag Logic (for trades with multiple tag group selections):</label>
            <select
              id="tag-comparison-mode"
              value={tagComparisonMode}
              onChange={e => setTagComparisonMode(e.target.value as 'AND' | 'OR')}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 p-1 h-7"
            >
              <option value="OR">Match ANY selected tag (OR logic)</option>
              <option value="AND">Match ALL selected tags per group (AND logic)</option>
            </select>
            <p className="text-xs text-gray-500 mt-0.5">
              OR: Shows lines for each selected tag individually.<br />
              AND: Filters trades that have ALL specified tags (across different groups if multiple groups selected).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};