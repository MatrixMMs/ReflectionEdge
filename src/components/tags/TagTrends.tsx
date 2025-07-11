import React from 'react';
import { Trade, AdvancedTagGroup, AppDateRange, TradeDirectionFilterSelection } from '../../types';
import { LineChartRenderer } from '../charts/LineChartRenderer';
import { ChartXAxisMetric, ChartYAxisMetric, ProcessedChartData } from '../../types';
import { startOfISOWeek, formatISO } from 'date-fns';
import { TrendingUpIcon } from '../ui/Icons';

interface TagTrendsProps {
  trades: Trade[];
  tagGroups: AdvancedTagGroup[];
  chartDateRange: AppDateRange;
  directionFilter: TradeDirectionFilterSelection;
}

export const TagTrends: React.FC<TagTrendsProps> = ({
  trades,
  tagGroups,
  chartDateRange,
  directionFilter
}) => {
  // --- Tag Usage Trends Data Aggregation ---
  // Group trades by week and count tag usage
  const tagUsageByWeek: { [week: string]: { [subTagId: string]: number } } = {};
  const tagIdToSubTag: { [subTagId: string]: any } = {};
  
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

  if (allWeeks.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center">
          <TrendingUpIcon className="w-6 h-6 mr-2" />
          Tag Usage Trends
        </h2>
        <p className="text-gray-500 text-sm">
          No tag usage data available {!chartDateRange.start && !chartDateRange.end ? '' : 'in the selected date range'} {directionFilter !== 'all' ? `(${directionFilter} only)`: ''}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center">
        <TrendingUpIcon className="w-6 h-6 mr-2" />
        Tag Usage Trends
      </h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-main mb-2">Usage Over Time (by Week)</h3>
        <LineChartRenderer
          data={tagTrendsChartData}
          yAxisMetric={ChartYAxisMetric.INDIVIDUAL_PNL}
          xAxisMetric={ChartXAxisMetric.TIME}
        />
        <p className="text-xs text-gray-400 mt-2 text-center">
          Shows how often each tag was used in trades per week. Colors match tag chips in analytics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Most Active Tags</h4>
          <div className="space-y-2">
            {seriesKeys
              .sort((a, b) => {
                const aTotal = data.reduce((sum, week) => sum + (week[a.key] as number || 0), 0);
                const bTotal = data.reduce((sum, week) => sum + (week[b.key] as number || 0), 0);
                return bTotal - aTotal;
              })
              .slice(0, 5)
              .map(series => {
                const total = data.reduce((sum, week) => sum + (week[series.key] as number || 0), 0);
                return (
                  <div key={series.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: series.color }}
                      />
                      {series.name}
                    </span>
                    <span className="text-gray-400">{total} uses</span>
                  </div>
                );
              })}
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Time Period</h4>
          <div className="text-sm text-gray-400">
            <div>Weeks: {allWeeks.length}</div>
            <div>Date Range: {allWeeks[0]} to {allWeeks[allWeeks.length - 1]}</div>
            <div>Tags Tracked: {seriesKeys.length}</div>
            <div>Total Data Points: {data.length * seriesKeys.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 