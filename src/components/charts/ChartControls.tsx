import React from 'react';
import { Input } from '../ui/Input';
import { ChartYAxisMetric, ChartXAxisMetric, TagGroup, AppDateRange, TradeDirectionFilterSelection } from '../../types';
import { ChevronDownIcon, ChevronUpIcon } from '../ui/Icons';

interface ChartControlsProps {
  yAxisMetric: ChartYAxisMetric;
  setYAxisMetric: (metric: ChartYAxisMetric) => void;
  xAxisMetric: ChartXAxisMetric;
  setXAxisMetric: (metric: ChartXAxisMetric) => void;
  dateRange: AppDateRange;
  setDateRange: (range: AppDateRange) => void;
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
  dateRange, setDateRange, compareDateRange, setCompareDateRange,
  tagGroups, selectedTags, setSelectedTags, tagComparisonMode, setTagComparisonMode,
  directionFilter, setDirectionFilter
}) => {
  const [collapsedGroups, setCollapsedGroups] = React.useState<{ [groupId: string]: boolean }>({});

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
      const startDate = new Date(dateRange.start);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() - 1);
      startDate.setDate(startDate.getDate() - 7);
      setCompareDateRange({
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      });
    }
  };

  // Helper to check if any tags are actually selected
  const hasSelectedTags = () => {
    return Object.values(selectedTags).some(arr => Array.isArray(arr) && arr.length > 0);
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="space-y-4 text-gray-300">
      {/* Date Range Selection */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Chart Start Date" type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
        <Input label="Chart End Date" type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
      </div>

      {/* Comparison Date Range */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={!!compareDateRange} 
            onChange={toggleCompareDateRange}
            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-500 rounded focus:ring-purple-500"
          />
          <span>Compare with another period</span>
        </label>
        {compareDateRange && (
          <div className="grid grid-cols-2 gap-4 mt-2 pl-7">
            <Input label="Compare Start" type="date" value={compareDateRange.start} onChange={e => setCompareDateRange({ ...compareDateRange, start: e.target.value })} />
            <Input label="Compare End" type="date" value={compareDateRange.end} onChange={e => setCompareDateRange({ ...compareDateRange, end: e.target.value })} />
          </div>
        )}
      </div>

      {/* Axis Metric Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="y-axis-metric" className="block text-sm font-medium mb-1">Y-Axis Metric:</label>
          <select
            id="y-axis-metric"
            value={yAxisMetric}
            onChange={e => setYAxisMetric(e.target.value as ChartYAxisMetric)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
          >
            {Object.values(ChartYAxisMetric).map(metric => <option key={metric} value={metric}>{metric}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="x-axis-metric" className="block text-sm font-medium mb-1">X-Axis Metric:</label>
          <select
            id="x-axis-metric"
            value={xAxisMetric}
            onChange={e => setXAxisMetric(e.target.value as ChartXAxisMetric)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
          >
            {Object.values(ChartXAxisMetric).map(metric => <option key={metric} value={metric}>{metric}</option>)}
          </select>
        </div>
      </div>
       {/* Direction Filter */}
      <div>
        <label htmlFor="direction-filter" className="block text-sm font-medium mb-1">Trade Direction:</label>
        <select
          id="direction-filter"
          value={directionFilter}
          onChange={e => setDirectionFilter(e.target.value as TradeDirectionFilterSelection)}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
        >
          <option value="all">All Directions (Separate Lines)</option>
          <option value="long">Long Only</option>
          <option value="short">Short Only</option>
        </select>
      </div>
      
      {/* Tag Selection for Chart */}
      <div>
        <h4 className="text-sm font-medium mb-1">Filter by Tags:</h4>
        {tagGroups.length === 0 && <p className="text-xs text-gray-500">No tags defined yet.</p>}
        {/* Selected Tags Section - spaced below label */}
        {hasSelectedTags() && (
          <div className="mb-4 mt-3">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {Object.entries(selectedTags).flatMap(([groupId, subTagIds]) =>
                subTagIds.map(subTagId => {
                  const group = tagGroups.find(g => g.id === groupId);
                  const subTag = group?.subtags.find(st => st.id === subTagId);
                  if (!subTag) return null;
                  return (
                    <button
                      key={groupId + '-' + subTagId}
                      type="button"
                      onClick={() => handleTagSelection(groupId, subTagId)}
                      className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-white mr-2 mb-2 transition-colors hover:bg-gray-600"
                    >
                      {subTag.name + ' ×'}
                    </button>
                  );
                })
              )}
            </div>
            <button
              onClick={() => setSelectedTags({})}
              className="text-red-500"
              style={{ background: 'none', border: 'none', padding: 0, minWidth: 0 }}
            >
              Clear All
            </button>
          </div>
        )}
        <div className="space-y-3">
          {tagGroups.map(group => {
            const isCollapsed = collapsedGroups[group.id] || false;
            return (
              <div key={group.id} className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-t-xl"
                  onClick={() => toggleGroupCollapse(group.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`tag-group-${group.id}`}
                  style={{ border: 'none', boxShadow: 'none', background: 'none' }}
                >
                  <span className="text-xs font-semibold text-gray-200 tracking-wide">{group.name}</span>
                  {isCollapsed ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {!isCollapsed && (
                  <>
                    <div className="border-t border-gray-700 mx-2" />
                    <div id={`tag-group-${group.id}`} className="flex flex-wrap gap-2 px-4 pb-3 pt-3">
                      {group.subtags.map(subtag => (
                        <button
                          key={subtag.id}
                          type="button"
                          onClick={() => handleTagSelection(group.id, subtag.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors mr-2 mb-2 border border-gray-600 focus:outline-none ${
                            selectedTags[group.id]?.includes(subtag.id)
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-600 text-white hover:bg-gray-500'
                          }`}
                        >
                          {subtag.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {Object.keys(selectedTags).length > 0 && (
          <div className="mt-2">
            <label htmlFor="tag-comparison-mode" className="block text-xs font-medium mb-1">Tag Logic (for trades with multiple tag group selections):</label>
            <select
              id="tag-comparison-mode"
              value={tagComparisonMode}
              onChange={e => setTagComparisonMode(e.target.value as 'AND' | 'OR')}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 p-1.5"
            >
              <option value="OR">Match ANY selected tag (OR logic)</option>
              <option value="AND">Match ALL selected tags per group (AND logic)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              OR: Shows lines for each selected tag individually.<br />
              AND: Filters trades that have ALL specified tags (across different groups if multiple groups selected).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};