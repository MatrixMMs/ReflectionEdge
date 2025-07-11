import React, { useState } from 'react';
import { Trade, AdvancedTagGroup, AdvancedSubTag, AppDateRange, TradeDirectionFilterSelection, TagCategory } from '../../types';
import { calculateSharpeRatio } from '../../utils/financialCalculations';
import { AcademicCapIcon, ChevronUpIcon, ChevronDownIcon } from '../ui/Icons';
import { ADVANCED_TAGS } from '../../constants/advancedTags';
import { LineChartRenderer } from '../charts/LineChartRenderer';
import { ChartXAxisMetric, ChartYAxisMetric, ProcessedChartData } from '../../types';
import { startOfISOWeek, formatISO, parseISO } from 'date-fns';

interface TagPerformanceProps {
  trades: Trade[];
  tagGroups: AdvancedTagGroup[];
  chartDateRange: AppDateRange;
  directionFilter: TradeDirectionFilterSelection;
  onTagClick?: (tagId: string, tagName: string) => void; // For filtering trades
}

interface TagPerformanceData {
  subTag: AdvancedSubTag;
  totalPnl: number;
  tradeCount: number;
  sharpeRatio: number | null;
  category: TagCategory;
  groupName: string;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  avgHoldingTime: number;
  maxDrawdown: number;
  tradeFrequency: number;
}

type SortField = 'name' | 'totalPnl' | 'tradeCount' | 'winRate' | 'profitFactor' | 'avgWin' | 'avgLoss' | 'sharpeRatio' | 'avgHoldingTime' | 'maxDrawdown' | 'tradeFrequency';
type SortDirection = 'asc' | 'desc';

const formatSharpeRatioValue = (sharpe: number | null): string => {
  if (sharpe === null) return "N/A";
  if (sharpe === Infinity) return "High (∞)";
  if (sharpe === -Infinity) return "Low (-∞)";
  if (isNaN(sharpe)) return "N/A";
  return sharpe.toFixed(2);
};

const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const TagPerformance: React.FC<TagPerformanceProps> = ({ 
  trades, 
  tagGroups = ADVANCED_TAGS, 
  chartDateRange, 
  directionFilter,
  onTagClick
}) => {
  const [sortField, setSortField] = useState<SortField>('totalPnl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [performanceData, setPerformanceData] = useState<TagPerformanceData[]>([]);

  // Calculate performance data
  React.useEffect(() => {
    const tradesInDateRange = trades.filter(trade => {
      if (!chartDateRange.start && !chartDateRange.end) return true;
      
      const tradeDate = new Date(trade.date);
      tradeDate.setUTCHours(0,0,0,0);
      
      if (chartDateRange.start && !chartDateRange.end) {
        const startDate = new Date(chartDateRange.start);
        startDate.setUTCHours(0,0,0,0);
        return tradeDate >= startDate;
      }
      
      if (!chartDateRange.start && chartDateRange.end) {
        const endDate = new Date(chartDateRange.end);
        endDate.setUTCHours(0,0,0,0);
        return tradeDate <= endDate;
      }
      
      if (chartDateRange.start && chartDateRange.end) {
        const startDate = new Date(chartDateRange.start);
        const endDate = new Date(chartDateRange.end);
        startDate.setUTCHours(0,0,0,0);
        endDate.setUTCHours(0,0,0,0);
        return tradeDate >= startDate && tradeDate <= endDate;
      }
      
      return true;
    });

    const totalTrades = tradesInDateRange.length;
    const tagMap = new Map<string, TagPerformanceData>();

    tagGroups.forEach(group => {
      group.subtags.forEach(subTag => {
        let filteredTradesForTag = tradesInDateRange.filter(trade => {
          const objectiveTags = trade.objectiveTags || {};
          const subjectiveTags = trade.subjectiveTags || {};
          const allTagGroups = { ...objectiveTags, ...subjectiveTags };
          return Object.values(allTagGroups).flat().includes(subTag.id);
        });

        if (directionFilter !== 'all') {
          filteredTradesForTag = filteredTradesForTag.filter(trade => trade.direction === directionFilter);
        }

        if (filteredTradesForTag.length > 0) {
          // If we've already seen this tag, skip (or you could aggregate across groups if needed)
          if (tagMap.has(subTag.id)) return;
          const pnlValues = filteredTradesForTag.map(t => t.profit);
          const totalPnl = pnlValues.reduce((sum, pnl) => sum + pnl, 0);
          const sharpe = calculateSharpeRatio(pnlValues);
          
          // Calculate win rate
          const winningTrades = filteredTradesForTag.filter(t => t.profit > 0);
          const winRate = (winningTrades.length / filteredTradesForTag.length) * 100;
          
          // Calculate profit factor
          const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
          const losingTrades = filteredTradesForTag.filter(t => t.profit < 0);
          const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
          const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
          
          // Calculate average win/loss
          const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
          const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
          
          // Calculate average holding time
          const avgHoldingTime = filteredTradesForTag.reduce((sum, t) => sum + (t.timeInTrade || 0), 0) / filteredTradesForTag.length;
          
          // Calculate max drawdown
          let maxDrawdown = 0;
          let peak = 0;
          let runningTotal = 0;
          filteredTradesForTag.forEach(trade => {
            runningTotal += trade.profit;
            if (runningTotal > peak) peak = runningTotal;
            const drawdown = peak - runningTotal;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
          });
          
          // Calculate trade frequency
          const tradeFrequency = (filteredTradesForTag.length / totalTrades) * 100;
          
          tagMap.set(subTag.id, {
            subTag,
            totalPnl,
            tradeCount: filteredTradesForTag.length,
            sharpeRatio: sharpe,
            category: group.category,
            groupName: group.name,
            winRate,
            profitFactor,
            avgWin,
            avgLoss,
            avgHoldingTime,
            maxDrawdown,
            tradeFrequency,
          });
        }
      });
    });

    setPerformanceData(Array.from(tagMap.values()));
  }, [trades, tagGroups, chartDateRange, directionFilter]);

  // --- Tag Usage Trends Data Aggregation ---
  // Group trades by week and count tag usage
  const tagUsageByWeek: { [week: string]: { [subTagId: string]: number } } = {};
  const tagIdToSubTag: { [subTagId: string]: AdvancedSubTag } = {};
  tagGroups.forEach(group => {
    group.subtags.forEach(subTag => {
      tagIdToSubTag[subTag.id] = subTag;
    });
  });
  trades.forEach(trade => {
    // Only include trades in date range and direction
    const tradeDate = new Date(trade.date);
    if (chartDateRange.start && tradeDate < new Date(chartDateRange.start)) return;
    if (chartDateRange.end && tradeDate > new Date(chartDateRange.end)) return;
    if (directionFilter !== 'all' && trade.direction !== directionFilter) return;
    // Get all tag IDs for this trade
    const objectiveTags = trade.objectiveTags || {};
    const subjectiveTags = trade.subjectiveTags || {};
    const allTagIds = [
      ...Object.values(objectiveTags).flat(),
      ...Object.values(subjectiveTags).flat(),
    ];
    if (allTagIds.length === 0) return;
    // Group by week (ISO week start)
    const week = formatISO(startOfISOWeek(tradeDate), { representation: 'date' });
    if (!tagUsageByWeek[week]) tagUsageByWeek[week] = {};
    allTagIds.forEach(tagId => {
      if (!tagUsageByWeek[week][tagId]) tagUsageByWeek[week][tagId] = 0;
      tagUsageByWeek[week][tagId]++;
    });
  });
  // Build ProcessedChartData for LineChartRenderer
  const allWeeks = Object.keys(tagUsageByWeek).sort();
  const allTagIdsWithTrades = Array.from(
    new Set(
      Object.values(tagUsageByWeek).flatMap(weekObj => Object.keys(weekObj))
    )
  );
  const seriesKeys = allTagIdsWithTrades.map(tagId => ({
    key: tagId,
    color: tagIdToSubTag[tagId]?.color || '#888',
    name: tagIdToSubTag[tagId]?.name || tagId,
  }));
  const data: { xValue: string; [tagId: string]: number | string }[] = allWeeks.map(week => {
    const entry: { xValue: string; [tagId: string]: number | string } = { xValue: week };
    allTagIdsWithTrades.forEach(tagId => {
      entry[tagId] = tagUsageByWeek[week][tagId] || 0;
    });
    return entry;
  });
  const tagTrendsChartData: ProcessedChartData = { data, seriesKeys };
  // --- End Tag Usage Trends Aggregation ---

  // Sort data
  const sortedData = React.useMemo(() => {
    return [...performanceData].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;
      
      switch (sortField) {
        case 'name':
          aValue = a.subTag.name;
          bValue = b.subTag.name;
          break;
        case 'totalPnl':
          aValue = a.totalPnl;
          bValue = b.totalPnl;
          break;
        case 'tradeCount':
          aValue = a.tradeCount;
          bValue = b.tradeCount;
          break;
        case 'winRate':
          aValue = a.winRate;
          bValue = b.winRate;
          break;
        case 'profitFactor':
          aValue = a.profitFactor;
          bValue = b.profitFactor;
          break;
        case 'avgWin':
          aValue = a.avgWin;
          bValue = b.avgWin;
          break;
        case 'avgLoss':
          aValue = a.avgLoss;
          bValue = b.avgLoss;
          break;
        case 'sharpeRatio':
          aValue = a.sharpeRatio || 0;
          bValue = b.sharpeRatio || 0;
          break;
        case 'avgHoldingTime':
          aValue = a.avgHoldingTime;
          bValue = b.avgHoldingTime;
          break;
        case 'maxDrawdown':
          aValue = a.maxDrawdown;
          bValue = b.maxDrawdown;
          break;
        case 'tradeFrequency':
          aValue = a.tradeFrequency;
          bValue = b.tradeFrequency;
          break;
        default:
          aValue = a.totalPnl;
          bValue = b.totalPnl;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [performanceData, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTagClick = (tagId: string, tagName: string) => {
    if (onTagClick) {
      onTagClick(tagId, tagName);
    }
  };

  if (performanceData.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center">
          <AcademicCapIcon className="w-6 h-6 mr-2" /> 
          Tag Performance
          <span className="text-sm text-blue-400 ml-2">(Enhanced)</span>
        </h2>
        <p className="text-gray-500 text-sm">
          No trades with tags found {!chartDateRange.start && !chartDateRange.end ? '' : 'in the selected date range'} {directionFilter !== 'all' ? `(${directionFilter} only)`: ''}.
        </p>
      </div>
    );
  }

  const SortableHeader = ({ field, label, className = "" }: { field: SortField; label: string; className?: string }) => (
    <th 
      className={`px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center">
        <AcademicCapIcon className="w-6 h-6 mr-2" /> 
        Tag Performance
        <span className="text-sm text-blue-400 ml-2">(Enhanced)</span>
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <SortableHeader field="name" label="Tag" className="w-32" />
              <SortableHeader field="totalPnl" label="P&L" />
              <SortableHeader field="tradeCount" label="Trades" />
              <SortableHeader field="winRate" label="Win Rate" />
              <SortableHeader field="profitFactor" label="Profit Factor" />
              <SortableHeader field="avgWin" label="Avg Win" />
              <SortableHeader field="avgLoss" label="Avg Loss" />
              <SortableHeader field="avgHoldingTime" label="Avg Time" />
              <SortableHeader field="maxDrawdown" label="Max DD" />
              <SortableHeader field="tradeFrequency" label="Freq %" />
              <SortableHeader field="sharpeRatio" label="Sharpe" />
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedData.map(item => (
              <tr 
                key={item.subTag.id} 
                className="hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handleTagClick(item.subTag.id, item.subTag.name)}
              >
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span 
                      className="font-semibold text-xs px-3 py-1 rounded-full"
                      style={{ 
                        background: 'var(--background-tertiary)',
                        color: item.subTag.color,
                        border: `2px solid ${item.subTag.color}`,
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                        marginRight: 0,
                        boxShadow: 'none',
                        display: 'inline-block',
                        minWidth: 0
                      }}
                    >
                      {item.subTag.name}
                    </span>
                  </div>
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium ${item.totalPnl >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatCurrency(item.totalPnl)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">
                  {item.tradeCount}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium ${item.winRate >= 50 ? 'text-success' : 'text-error'}`}>
                  {formatPercentage(item.winRate)}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium ${item.profitFactor >= 1.5 ? 'text-success' : item.profitFactor >= 1 ? 'text-yellow-500' : 'text-error'}`}>
                  {item.profitFactor === Infinity ? '∞' : item.profitFactor.toFixed(2)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-success">
                  {formatCurrency(item.avgWin)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-error">
                  {formatCurrency(item.avgLoss)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">
                  {formatTime(item.avgHoldingTime)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-error">
                  {formatCurrency(item.maxDrawdown)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">
                  {formatPercentage(item.tradeFrequency)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">
                  {formatSharpeRatioValue(item.sharpeRatio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-gray-400 mt-4 text-center">
        {!chartDateRange.start && !chartDateRange.end ? 'For all trades' : 'For trades in selected date range'}{directionFilter !== 'all' ? ` (${directionFilter} only)` : ''}. 
        Click any tag to filter trades. Enhanced analytics with comprehensive metrics.
      </p>
    </div>
  );
};
