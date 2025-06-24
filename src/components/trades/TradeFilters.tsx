import React, { useState } from 'react';
import { Trade, TagGroup, TradeDirectionFilterSelection } from '../../types';
import { Grade, ALL_GRADES } from '../../utils/grading';
import { Input } from '../ui/Input';

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
}

export const TradeFilters: React.FC<TradeFiltersProps> = ({
  filters,
  onFiltersChange,
  tagGroups,
  availableSymbols
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Trade Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

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

            <div className="flex items-end">
              <div className="text-xs text-gray-400">
                {hasActiveFilters() ? 'Filters Active' : 'No filters applied'}
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="space-y-2">
              {tagGroups.map(group => (
                <div key={group.id}>
                  <span className="font-semibold text-purple-300 text-xs">{group.name}</span>
                  <div className="flex flex-wrap gap-2 mt-1">
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
                        className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-colors ${
                          filters.selectedTags[group.id]?.includes(subtag.id)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subtag.color }} />
                        <span>{subtag.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 