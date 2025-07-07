import React from 'react';
import { Trade, AdvancedTagGroup, AdvancedSubTag, AppDateRange, TradeDirectionFilterSelection, TagCategory } from '../../types';
import { calculateSharpeRatio } from '../../utils/financialCalculations';
import { AcademicCapIcon } from '../ui/Icons';
import { ADVANCED_TAGS } from '../../constants/advancedTags';

interface TagPerformanceProps {
  trades: Trade[];
  tagGroups: AdvancedTagGroup[];
  chartDateRange: AppDateRange;
  directionFilter: TradeDirectionFilterSelection;
}

interface TagPerformanceData {
  subTag: AdvancedSubTag;
  totalPnl: number;
  tradeCount: number;
  sharpeRatio: number | null;
  category: TagCategory;
  groupName: string;
}

const formatSharpeRatioValue = (sharpe: number | null): string => {
  if (sharpe === null) return "N/A";
  if (sharpe === Infinity) return "High (∞)";
  if (sharpe === -Infinity) return "Low (-∞)";
  if (isNaN(sharpe)) return "N/A";
  return sharpe.toFixed(2);
};

export const TagPerformance: React.FC<TagPerformanceProps> = ({ 
  trades, 
  tagGroups = ADVANCED_TAGS, 
  chartDateRange, 
  directionFilter
}) => {
  const performanceData: TagPerformanceData[] = [];

  const tradesInDateRange = trades.filter(trade => {
    // If no date range is selected (empty start/end), include all trades
    if (!chartDateRange.start && !chartDateRange.end) {
      return true;
    }
    
    const tradeDate = new Date(trade.date);
    tradeDate.setUTCHours(0,0,0,0);
    
    // If only start date is provided, filter from start date onwards
    if (chartDateRange.start && !chartDateRange.end) {
      const startDate = new Date(chartDateRange.start);
      startDate.setUTCHours(0,0,0,0);
      return tradeDate >= startDate;
    }
    
    // If only end date is provided, filter up to end date
    if (!chartDateRange.start && chartDateRange.end) {
      const endDate = new Date(chartDateRange.end);
      endDate.setUTCHours(0,0,0,0);
      return tradeDate <= endDate;
    }
    
    // If both dates are provided, filter within range
    if (chartDateRange.start && chartDateRange.end) {
      const startDate = new Date(chartDateRange.start);
      const endDate = new Date(chartDateRange.end);
      startDate.setUTCHours(0,0,0,0);
      endDate.setUTCHours(0,0,0,0);
      return tradeDate >= startDate && tradeDate <= endDate;
    }
    
    return true; // Fallback: include all trades
  });

  tagGroups.forEach(group => {
    group.subtags.forEach(subTag => {
      // For advanced tags, check both objective and subjective tags
      let filteredTradesForTag = tradesInDateRange.filter(trade => {
        const objectiveTags = trade.objectiveTags || {};
        const subjectiveTags = trade.subjectiveTags || {};
        
        // Check if this tag is in any of the objective or subjective tag groups
        const allTagGroups = { ...objectiveTags, ...subjectiveTags };
        return Object.values(allTagGroups).flat().includes(subTag.id);
      });

      if (directionFilter !== 'all') {
        filteredTradesForTag = filteredTradesForTag.filter(trade => trade.direction === directionFilter);
      }

      if (filteredTradesForTag.length > 0) {
        const pnlValues = filteredTradesForTag.map(t => t.profit);
        const totalPnl = pnlValues.reduce((sum, pnl) => sum + pnl, 0);
        const sharpe = calculateSharpeRatio(pnlValues);
        
        performanceData.push({
          subTag,
          totalPnl,
          tradeCount: filteredTradesForTag.length,
          sharpeRatio: sharpe,
          category: group.category,
          groupName: group.name,
        });
      }
    });
  });

  if (performanceData.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center">
          <AcademicCapIcon className="w-6 h-6 mr-2" /> 
          Tag Performance
          <span className="text-sm text-blue-400 ml-2">(Advanced)</span>
        </h2>
        <p className="text-gray-500 text-sm">
          No trades with tags found {!chartDateRange.start && !chartDateRange.end ? '' : 'in the selected date range'} {directionFilter !== 'all' ? `(${directionFilter} only)`: ''}.
        </p>
      </div>
    );
  }
  
  // Sort by category first, then by name
  performanceData.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.subTag.name.localeCompare(b.subTag.name);
  });

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center">
        <AcademicCapIcon className="w-6 h-6 mr-2" /> 
        Tag Performance
        <span className="text-sm text-blue-400 ml-2">(Advanced)</span>
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {performanceData.map(item => (
          <div key={item.subTag.id} className="p-3 bg-gray-700 rounded-lg shadow">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-2">
                <span 
                  className="font-semibold text-md px-3 py-1 rounded-full"
                  style={{ background: 'var(--background-secondary)', color: item.subTag.color, border: `1.5px solid ${item.subTag.color}` }}
                >
                  {item.subTag.name}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.category === 'objective' 
                    ? 'bg-blue-900 text-blue-200' 
                    : 'bg-orange-900 text-orange-200'
                }`}>
                  {item.category}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {item.groupName}
              </span>
            </div>
            <div className="text-xs grid grid-cols-3 gap-2 text-gray-300">
              <div>
                <span className="block text-gray-400">Trades:</span>
                <span className="font-medium">{item.tradeCount}</span>
              </div>
              <div>
                <span className="block text-gray-400">Total P&L:</span>
                <span className={`font-medium ${item.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${item.totalPnl.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="block text-gray-400">Sharpe Ratio:</span>
                <span className="font-medium">{formatSharpeRatioValue(item.sharpeRatio)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
       <p className="text-xs text-gray-400 mt-2 text-center">
        {!chartDateRange.start && !chartDateRange.end ? 'For all trades' : 'For trades in selected date range'}{directionFilter !== 'all' ? ` (${directionFilter} only)` : ''}. Sharpe Ratio based on P&Ls. Advanced tagging system active.
       </p>
    </div>
  );
};
