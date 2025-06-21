
import React from 'react';
import { Input } from '../ui/Input';
import { ChartYAxisMetric, ChartXAxisMetric, TagGroup, AppDateRange, TradeDirectionFilterSelection } from '../../types';

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
        <label htmlFor="direction-filter" className="block text-sm font-medium mb-1">Trade Direction (Chart Lines):</label>
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
        <h4 className="text-sm font-medium mb-1">Filter by Tags (for chart lines):</h4>
        {tagGroups.length === 0 && <p className="text-xs text-gray-500">No tags defined yet.</p>}
        {tagGroups.map(group => (
          <div key={group.id} className="mb-2">
            <p className="text-xs font-semibold text-gray-400">{group.name}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {group.subtags.map(subtag => (
                <label key={subtag.id} className="flex items-center space-x-1.5 cursor-pointer p-1.5 rounded-md hover:bg-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedTags[group.id]?.includes(subtag.id) || false}
                    onChange={() => handleTagSelection(group.id, subtag.id)}
                    className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-500 text-purple-500 focus:ring-purple-400"
                    style={{ accentColor: subtag.color }}
                  />
                  <span className="text-xs" style={{ color: subtag.color }}>{subtag.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
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
                    OR: Shows lines for each selected tag individually.
                    <br/>
                    AND: Filters trades that have ALL specified tags (across different groups if multiple groups selected).
                </p>
            </div>
        )}
      </div>
    </div>
  );
};