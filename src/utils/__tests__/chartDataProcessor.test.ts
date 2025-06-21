/**
 * Chart Data Processor Utility Tests
 * 
 * This test suite covers the chart data processing functionality including:
 * 
 * - Trade data processing for different chart types
 * - Data filtering by date range, tags, and trade direction
 * - Cumulative PnL calculations
 * - Win rate calculations
 * - Average profit calculations
 * - Series key generation and color assignment
 * - Data point creation and aggregation
 * - Comparison data processing
 * 
 * Test scenarios include:
 * - Empty trade data handling
 * - Single trade processing
 * - Multiple trades with different metrics
 * - Tag-based filtering and series creation
 * - Direction-based filtering (long/short/all)
 * - X-axis metric variations (trade sequence vs time)
 * - Y-axis metric variations (cumulative, individual, win rate, average)
 * - Comparison data processing
 */

import { processChartData } from '../chartDataProcessor';
import { Trade, ChartXAxisMetric, ChartYAxisMetric, TagGroup } from '../../types';

describe('Chart Data Processor', () => {
  const mockTrades: Trade[] = [
    {
      id: '1',
      date: '2024-01-01',
      symbol: 'AAPL',
      contracts: 100,
      entry: 150,
      exit: 155,
      timeIn: '09:30:00',
      timeOut: '10:30:00',
      timeInTrade: 60,
      profit: 500,
      tags: { 'group1': 'tag1' },
      journal: 'Good trade',
      direction: 'long',
      accountId: 'account1'
    },
    {
      id: '2',
      date: '2024-01-02',
      symbol: 'TSLA',
      contracts: 50,
      entry: 200,
      exit: 195,
      timeIn: '14:00:00',
      timeOut: '15:00:00',
      timeInTrade: 60,
      profit: -250,
      tags: { 'group1': 'tag2' },
      journal: 'Bad trade',
      direction: 'short',
      accountId: 'account1'
    },
    {
      id: '3',
      date: '2024-01-03',
      symbol: 'MSFT',
      contracts: 75,
      entry: 300,
      exit: 310,
      timeIn: '11:00:00',
      timeOut: '12:00:00',
      timeInTrade: 60,
      profit: 750,
      tags: { 'group1': 'tag1' },
      journal: 'Great trade',
      direction: 'long',
      accountId: 'account1'
    }
  ];

  const mockTagGroups: TagGroup[] = [
    {
      id: 'group1',
      name: 'Strategy',
      subtags: [
        { id: 'tag1', name: 'Momentum', color: '#FF0000', groupId: 'group1' },
        { id: 'tag2', name: 'Mean Reversion', color: '#00FF00', groupId: 'group1' }
      ]
    }
  ];

  describe('Basic Data Processing', () => {
    it('handles empty trade data', () => {
      const result = processChartData(
        [],
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'all'
      );

      expect(result.data).toEqual([]);
      expect(result.seriesKeys).toHaveLength(2); // long and short series
    });

    it('processes single trade with cumulative PnL', () => {
      const result = processChartData(
        [mockTrades[0]],
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'all'
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].xValue).toBe(1);
      expect(result.data[0].pnl_overall_long).toBe(500);
      expect(result.seriesKeys).toHaveLength(2); // long and short series
    });

    it('processes multiple trades with individual PnL', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.INDIVIDUAL_PNL,
        mockTagGroups,
        {},
        'all'
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0].pnl_overall_long).toBe(500);
      expect(result.data[0].pnl_overall_short).toBe(-250);
      expect(result.data[1].pnl_overall_long).toBe(750);
    });
  });

  describe('X-Axis Metrics', () => {
    it('uses trade sequence for X-axis', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'all'
      );

      expect(result.data[0].xValue).toBe(1);
      expect(result.data[1].xValue).toBe(2);
      // Only 2 data points because trades are aggregated by xValue
    });

    it('uses date for X-axis', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TIME,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'all'
      );

      expect(result.data[0].xValue).toBe('2024-01-01');
      expect(result.data[1].xValue).toBe('2024-01-02');
      expect(result.data[2].xValue).toBe('2024-01-03');
    });
  });

  describe('Y-Axis Metrics', () => {
    it('calculates cumulative PnL correctly', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'long'
      );

      expect(result.data[0].pnl_overall_long).toBe(500);
      expect(result.data[1].pnl_overall_long).toBe(1250); // 500 + 750
    });

    it('calculates win percentage correctly', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.WIN_PERCENTAGE,
        mockTagGroups,
        {},
        'long'
      );

      // Two long trades, both profitable (500, 750)
      expect(result.data[0].pnl_overall_long).toBe(100); // 1/1 = 100%
      expect(result.data[1].pnl_overall_long).toBe(100); // 2/2 = 100%
    });

    it('calculates average profit correctly', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.AVG_PROFIT,
        mockTagGroups,
        {},
        'long'
      );

      expect(result.data[0].pnl_overall_long).toBe(500); // 500/1
      expect(result.data[1].pnl_overall_long).toBe(625); // (500+750)/2
    });
  });

  describe('Direction Filtering', () => {
    it('filters by long trades only', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'long'
      );

      expect(result.seriesKeys).toHaveLength(1);
      expect(result.seriesKeys[0].key).toBe('pnl_overall_long');
    });

    it('filters by short trades only', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'short'
      );

      expect(result.seriesKeys).toHaveLength(1);
      expect(result.seriesKeys[0].key).toBe('pnl_overall_short');
    });

    it('includes both long and short trades', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'all'
      );

      expect(result.seriesKeys).toHaveLength(2);
      expect(result.seriesKeys.map(sk => sk.key)).toContain('pnl_overall_long');
      expect(result.seriesKeys.map(sk => sk.key)).toContain('pnl_overall_short');
    });
  });

  describe('Tag-Based Filtering', () => {
    it('creates series for selected tags', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        { 'group1': ['tag1'] },
        'all'
      );

      expect(result.seriesKeys).toHaveLength(2); // long and short for tag1
      expect(result.seriesKeys[0].key).toBe('pnl_tag1_long');
      expect(result.seriesKeys[1].key).toBe('pnl_tag1_short');
      expect(result.seriesKeys[0].color).toBe('#FF0000'); // tag1 color
    });

    it('handles multiple selected tags', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        { 'group1': ['tag1', 'tag2'] },
        'all'
      );

      expect(result.seriesKeys).toHaveLength(4); // long and short for tag1 and tag2
      expect(result.seriesKeys.map(sk => sk.key)).toContain('pnl_tag1_long');
      expect(result.seriesKeys.map(sk => sk.key)).toContain('pnl_tag2_short');
    });
  });

  describe('Comparison Data', () => {
    it('processes comparison data with _comp suffix', () => {
      const result = processChartData(
        mockTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'all',
        true // isComparison
      );

      expect(result.seriesKeys[0].key).toContain('_comp');
      expect(result.seriesKeys[0].name).toContain('(Compare)');
    });
  });

  describe('Data Sorting', () => {
    it('sorts by trade sequence correctly', () => {
      const unsortedTrades = [mockTrades[2], mockTrades[0], mockTrades[1]];
      const result = processChartData(
        unsortedTrades,
        ChartXAxisMetric.TRADE_SEQUENCE,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'all'
      );

      expect(result.data[0].xValue).toBe(1);
      expect(result.data[1].xValue).toBe(2);
      // Only 2 data points because trades are aggregated by xValue
    });

    it('sorts by date correctly', () => {
      const unsortedTrades = [mockTrades[2], mockTrades[0], mockTrades[1]];
      const result = processChartData(
        unsortedTrades,
        ChartXAxisMetric.TIME,
        ChartYAxisMetric.CUMULATIVE_PNL,
        mockTagGroups,
        {},
        'all'
      );

      expect(result.data[0].xValue).toBe('2024-01-01');
      expect(result.data[1].xValue).toBe('2024-01-02');
      expect(result.data[2].xValue).toBe('2024-01-03');
    });
  });
}); 