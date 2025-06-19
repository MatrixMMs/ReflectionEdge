import { Trade, ChartXAxisMetric, ChartYAxisMetric, ProcessedChartData, TagGroup, SubTag, AppDateRange, TradeDirectionFilterSelection, TradeDirection } from '../types';
import { DEFAULT_CHART_COLOR, LONG_TRADE_COLOR, SHORT_TRADE_COLOR } from '../constants';

const getSubTag = (tagGroups: TagGroup[], subTagId: string): SubTag | undefined => {
  for (const group of tagGroups) {
    const found = group.subtags.find(st => st.id === subTagId);
    if (found) return found;
  }
  return undefined;
};

export const filterTradesByDateAndTags = (
  trades: Trade[],
  dateRange: AppDateRange,
  selectedTags: { [groupId: string]: string[] }, 
  tagComparisonMode: 'AND' | 'OR'
): Trade[] => {
  
  const tradesInDateRange = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    tradeDate.setUTCHours(0,0,0,0);
    startDate.setUTCHours(0,0,0,0);
    endDate.setUTCHours(0,0,0,0);
    return tradeDate >= startDate && tradeDate <= endDate;
  });

  const activeTagGroupIds = Object.keys(selectedTags).filter(groupId => selectedTags[groupId]?.length > 0);

  if (activeTagGroupIds.length === 0) {
    return tradesInDateRange; 
  }

  return tradesInDateRange.filter(trade => {
    if (tagComparisonMode === 'AND') {
      return activeTagGroupIds.every(groupId => {
        const tradeSubTagIdForGroup = trade.tags[groupId];
        return tradeSubTagIdForGroup && selectedTags[groupId].includes(tradeSubTagIdForGroup);
      });
    } else { 
      return activeTagGroupIds.some(groupId => {
        const tradeSubTagIdForGroup = trade.tags[groupId];
        return tradeSubTagIdForGroup && selectedTags[groupId].includes(tradeSubTagIdForGroup);
      });
    }
  });
};


export const processChartData = (
  inputTrades: Trade[], // Already filtered by date and user-selected tags
  xAxisMetric: ChartXAxisMetric,
  yAxisMetric: ChartYAxisMetric,
  tagGroups: TagGroup[],
  selectedTagsForChart: { [groupId: string]: string[] },
  directionFilter: TradeDirectionFilterSelection,
  isComparison: boolean = false
): ProcessedChartData => {
  
  const seriesKeysGlobal: ProcessedChartData['seriesKeys'] = [];
  const chartDataPoints: any[] = [];

  // Determine base series configurations from selected tags
  let baseSeriesConfigs: Array<{ name: string; color: string; keySuffix: string; tagFilterFn: (trade: Trade) => boolean }> = [];
  const activeSelectedSubTagIds: string[] = Object.values(selectedTagsForChart).flat();

  if (activeSelectedSubTagIds.length === 0) { // No specific user tags selected
    baseSeriesConfigs.push({ 
        name: 'P&L', // Base name, will be suffixed with (Long)/(Short)
        color: DEFAULT_CHART_COLOR, // Fallback, will be overridden by LONG/SHORT_TRADE_COLOR
        keySuffix: 'overall',
        tagFilterFn: () => true // All inputTrades pass this tag filter
    });
  } else {
    // Create a base series for each selected subtag (respecting OR logic; AND logic already applied to inputTrades)
    activeSelectedSubTagIds.forEach(subTagId => {
        const subTag = getSubTag(tagGroups, subTagId);
        if (subTag) {
            baseSeriesConfigs.push({
                name: subTag.name,
                color: subTag.color,
                keySuffix: subTag.id,
                tagFilterFn: (trade: Trade) => Object.values(trade.tags).includes(subTagId)
            });
        }
    });
    if (baseSeriesConfigs.length === 0 && inputTrades.length > 0) { 
        baseSeriesConfigs.push({ name: 'Filtered P&L', color: DEFAULT_CHART_COLOR, keySuffix: 'filtered', tagFilterFn: () => true });
    }
  }

  if (inputTrades.length === 0 && baseSeriesConfigs.length === 0) return { data: [], seriesKeys: [] };
  if (inputTrades.length > 0 && baseSeriesConfigs.length === 0 ) {
      // This case might happen if selectedTagsForChart has entries but they don't match any known subtag.
      // Fallback to a single "Overall P&L" for the inputTrades (which are already date/tag filtered).
      baseSeriesConfigs.push({ 
        name: 'P&L', 
        color: DEFAULT_CHART_COLOR, 
        keySuffix: 'overall_filtered', 
        tagFilterFn: () => true 
    });
  }


  // For each base series, create actual chart lines based on direction filter
  baseSeriesConfigs.forEach(baseConfig => {
    const directionsToProcess: TradeDirection[] = [];
    if (directionFilter === 'all') {
      directionsToProcess.push('long', 'short');
    } else {
      directionsToProcess.push(directionFilter);
    }

    directionsToProcess.forEach(direction => {
      const seriesName = `${baseConfig.name}${baseSeriesConfigs.length > 1 || activeSelectedSubTagIds.length > 0 ? "" : " Trades"} (${direction.charAt(0).toUpperCase() + direction.slice(1)})`;
      const seriesKeySuffix = `${baseConfig.keySuffix}_${direction}`;
      const seriesKey = `pnl_${seriesKeySuffix}${isComparison ? '_comp' : ''}`;
      
      let seriesColor = baseConfig.color;
      if (baseConfig.keySuffix === 'overall' || baseConfig.keySuffix === 'overall_filtered' ) { // If it's the generic P&L line
        seriesColor = direction === 'long' ? LONG_TRADE_COLOR : SHORT_TRADE_COLOR;
      }

      seriesKeysGlobal.push({ 
        key: seriesKey, 
        color: seriesColor, 
        name: `${seriesName}${isComparison ? ' (Compare)' : ''}` 
      });

      let cumulativePnl = 0;
      let winCount = 0;
      let tradeCountForStats = 0; // Renamed to avoid conflict with outer scope tradeCount
      let cumulativeProfitForAvg = 0;

      // Filter trades for this specific series (base tag filter + direction)
      // Sort trades by date and then timeIn for consistent sequencing *within this series*
        const tradesForThisSpecificSeries = inputTrades
        .filter(baseConfig.tagFilterFn)
        .filter(trade => trade.direction === direction)
        .sort((a, b) => {
            const dateA = new Date(a.date + 'T' + new Date(a.timeIn).toTimeString().split(' ')[0]);
            const dateB = new Date(b.date + 'T' + new Date(b.timeIn).toTimeString().split(' ')[0]);
            return dateA.getTime() - dateB.getTime();
        });


      tradesForThisSpecificSeries.forEach((trade, index) => {
        tradeCountForStats++;
        if (trade.profit > 0) winCount++;
        cumulativePnl += trade.profit;
        cumulativeProfitForAvg += trade.profit;

        let xValue: string | number;
        if (xAxisMetric === ChartXAxisMetric.TRADE_SEQUENCE) {
          xValue = index + 1;
        } else { 
          xValue = trade.date; 
        }

        let yValue: number;
        switch (yAxisMetric) {
          case ChartYAxisMetric.CUMULATIVE_PNL: yValue = cumulativePnl; break;
          case ChartYAxisMetric.INDIVIDUAL_PNL: yValue = trade.profit; break;
          case ChartYAxisMetric.WIN_PERCENTAGE: yValue = tradeCountForStats > 0 ? (winCount / tradeCountForStats) * 100 : 0; break;
          case ChartYAxisMetric.AVG_PROFIT: yValue = tradeCountForStats > 0 ? cumulativeProfitForAvg / tradeCountForStats : 0; break;
          default: yValue = cumulativePnl;
        }
        
        let dataPoint = chartDataPoints.find(dp => dp.xValue === xValue);
        if (!dataPoint) {
          dataPoint = { xValue };
          chartDataPoints.push(dataPoint);
        }
        dataPoint[seriesKey] = yValue;
      });
    });
  });

  if (xAxisMetric === ChartXAxisMetric.TIME) {
    chartDataPoints.sort((a, b) => new Date(a.xValue as string).getTime() - new Date(b.xValue as string).getTime());
  } else {
    chartDataPoints.sort((a,b) => (a.xValue as number) - (b.xValue as number));
  }

  return { data: chartDataPoints, seriesKeys: seriesKeysGlobal };
};
