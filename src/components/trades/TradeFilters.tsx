import React, { useState } from 'react';
import { Trade, TagGroup, TradeDirectionFilterSelection } from '../../types';
import { Grade, ALL_GRADES } from '../../utils/grading';
import { Input } from '../ui/Input';
import { FilterIcon, ChevronDownIcon, ChevronUpIcon } from '../ui/Icons';

export interface TradeFilters {
  direction: TradeDirectionFilterSelection;
  grade: Grade | 'all';
  dateFrom: string;
  dateTo: string;
  symbol: string;
  minProfit: string;
  maxProfit: string;
  selectedTags: { [groupId: string]: string[] };
}

interface TradeFiltersProps {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
  tagGroups: TagGroup[];
  availableSymbols: string[];
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  tagComparisonMode: 'AND' | 'OR';
  setTagComparisonMode: (mode: 'AND' | 'OR') => void;
}

export const TradeFilters: React.FC<TradeFiltersProps> = ({
  filters,
  onFiltersChange,
  tagGroups,
  availableSymbols,
  isExpanded,
  setIsExpanded,
  tagComparisonMode,
  setTagComparisonMode
}) => {
  const updateFilter = (key: keyof TradeFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      direction: 'all',
      grade: 'all',
      dateFrom: '',
      dateTo: '',
      symbol: '',
      minProfit: '',
      maxProfit: '',
      selectedTags: {}
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.direction !== 'all' ||
      filters.grade !== 'all' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.symbol !== '' ||
      filters.minProfit !== '' ||
      filters.maxProfit !== '' ||
      Object.keys(filters.selectedTags).length > 0
    );
  };

  // Helper to check if any tags are actually selected
  const hasSelectedTags = () => {
    return Object.values(filters.selectedTags).some(arr => Array.isArray(arr) && arr.length > 0);
  };

  const [collapsedGroups, setCollapsedGroups] = useState<{ [groupId: string]: boolean }>({});
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      {isExpanded && (
        <div className="space-y-4">
          {/* Basic Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Direction Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Direction</label>
              <select
                value={filters.direction}
                onChange={e => updateFilter('direction', e.target.value as TradeDirectionFilterSelection)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2 text-sm"
              >
                <option value="all">All Trades</option>
                <option value="long">Long Only</option>
                <option value="short">Short Only</option>
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Grade</label>
              <select
                value={filters.grade}
                onChange={e => updateFilter('grade', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2 text-sm"
              >
                <option value="all">All Grades</option>
                {ALL_GRADES.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Symbol Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
              <select
                value={filters.symbol}
                onChange={e => updateFilter('symbol', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2 text-sm"
              >
                <option value="">All Symbols</option>
                {availableSymbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={e => updateFilter('dateFrom', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Date Range and Profit Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date To</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={e => updateFilter('dateTo', e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Min P&L</label>
              <Input
                type="number"
                step="0.01"
                value={filters.minProfit}
                onChange={e => updateFilter('minProfit', e.target.value)}
                placeholder="0.00"
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Max P&L</label>
              <Input
                type="number"
                step="0.01"
                value={filters.maxProfit}
                onChange={e => updateFilter('maxProfit', e.target.value)}
                placeholder="0.00"
                className="text-sm"
              />
            </div>

            {/* Tag logic dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tag logic</label>
              <select
                value={tagComparisonMode}
                onChange={e => setTagComparisonMode(e.target.value as 'AND' | 'OR')}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2 text-sm"
                style={{ minHeight: '40px' }}
              >
                <option value="OR">OR</option>
                <option value="AND">AND</option>
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            {/* Selected Tags Section (moved here) */}
            {Object.keys(filters.selectedTags).length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {Object.entries(filters.selectedTags).flatMap(([groupId, subTagIds]) =>
                    subTagIds.map(subTagId => {
                      const group = tagGroups.find(g => g.id === groupId);
                      const subTag = group?.subtags.find(st => st.id === subTagId);
                      if (!subTag) return null;
                      return (
                        <button
                          key={groupId + '-' + subTagId}
                          type="button"
                          onClick={() => {
                            const current = filters.selectedTags[groupId] || [];
                            const next = current.filter(id => id !== subTagId);
                            updateFilter('selectedTags', {
                              ...filters.selectedTags,
                              [groupId]: next
                            });
                          }}
                          className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-white mr-2 mb-2 transition-colors hover:bg-gray-600"
                        >
                          {subTag.name + ' ×'}
                        </button>
                      );
                    })
                  )}
                </div>
                {hasSelectedTags() && (
                  <button
                    onClick={clearAllFilters}
                    className="text-red-500"
                    style={{ background: 'none', border: 'none', padding: 0, minWidth: 0 }}
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
            {/* Tag selection UI */}
            <div className="space-y-3 mb-4">
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
                              onClick={() => {
                                const current = filters.selectedTags[group.id] || [];
                                const next = current.includes(subtag.id)
                                  ? current.filter(id => id !== subtag.id)
                                  : [...current, subtag.id];
                                updateFilter('selectedTags', {
                                  ...filters.selectedTags,
                                  [group.id]: next
                                });
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors mr-2 mb-2 border border-gray-600 focus:outline-none ${
                                filters.selectedTags[group.id]?.includes(subtag.id)
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
          </div>
        </div>
      )}
    </div>
  );
}; 