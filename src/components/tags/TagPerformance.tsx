
import React from 'react';
import { Trade, TagGroup, SubTag, AppDateRange, TradeDirectionFilterSelection } from '../../types';
import { calculateSharpeRatio } from '../../utils/financialCalculations';
import { AcademicCapIcon } from '../ui/Icons'; // Using TagIcon or another existing one

interface TagPerformanceProps {
  trades: Trade[];
  tagGroups: TagGroup[];
  chartDateRange: AppDateRange;
  directionFilter: TradeDirectionFilterSelection;
}

interface TagPerformanceData {
  subTag: SubTag;
  totalPnl: number;
  tradeCount: number;
  sharpeRatio: number | null;
}

const formatSharpeRatioValue = (sharpe: number | null): string => {
  if (sharpe === null) return "N/A";
  if (sharpe === Infinity) return "High (∞)";
  if (sharpe === -Infinity) return "Low (-∞)";
  if (isNaN(sharpe)) return "N/A"; // Should not happen with current calc logic if null handles NaN path
  return sharpe.toFixed(2);
};


export const TagPerformance: React.FC<TagPerformanceProps> = ({ trades, tagGroups, chartDateRange, directionFilter }) => {
  const performanceData: TagPerformanceData[] = [];

  const tradesInDateRange = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    const startDate = new Date(chartDateRange.start);
    const endDate = new Date(chartDateRange.end);
    tradeDate.setUTCHours(0,0,0,0);
    startDate.setUTCHours(0,0,0,0);
    endDate.setUTCHours(0,0,0,0);
    return tradeDate >= startDate && tradeDate <= endDate;
  });

  tagGroups.forEach(group => {
    group.subtags.forEach(subTag => {
      let filteredTradesForTag = tradesInDateRange.filter(trade => 
        Object.values(trade.tags).includes(subTag.id)
      );

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
        });
      }
    });
  });

  if (performanceData.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center">
          <AcademicCapIcon className="w-6 h-6 mr-2" /> Tag Performance
        </h2>
        <p className="text-gray-500 text-sm">
          No trades with tags found in the selected date range {directionFilter !== 'all' ? `(${directionFilter} only)`: ''}.
        </p>
      </div>
    );
  }
  
  // Sort by subtag name for consistent display
  performanceData.sort((a,b) => a.subTag.name.localeCompare(b.subTag.name));

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center">
        <AcademicCapIcon className="w-6 h-6 mr-2" /> Tag Performance
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {performanceData.map(item => (
          <div key={item.subTag.id} className="p-3 bg-gray-700 rounded-lg shadow">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-md" style={{ color: item.subTag.color }}>
                {item.subTag.name}
              </span>
              <span className="text-xs text-gray-400">
                {tagGroups.find(tg => tg.id === item.subTag.groupId)?.name}
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
        For trades in selected date range{directionFilter !== 'all' ? ` (${directionFilter} only)` : ''}. Sharpe Ratio based on P&Ls.
       </p>
    </div>
  );
};
