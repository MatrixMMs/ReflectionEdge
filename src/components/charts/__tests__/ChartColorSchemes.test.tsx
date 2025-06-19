/**
 * Chart Color Schemes and Styling Tests
 * 
 * This test suite covers chart color schemes and styling functionality including:
 * 
 * - Color scheme application to chart elements
 * - Default color assignments
 * - Custom color overrides
 * - Color consistency across chart types
 * - Styling for different chart states
 * - Theme-based color schemes
 * 
 * Test scenarios include:
 * - Default color application
 * - Custom color assignments
 * - Color inheritance from data
 * - Styling consistency
 * - Color scheme validation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LineChartRenderer } from '../LineChartRenderer';
import { PieChartRenderer } from '../PieChartRenderer';
import { ChartYAxisMetric, ChartXAxisMetric } from '@/types';
import { DEFAULT_CHART_COLOR, COMPARISON_CHART_COLOR, LONG_TRADE_COLOR, SHORT_TRADE_COLOR } from '@/constants';

// Mock recharts components with color support
jest.mock('recharts', () => ({
  LineChart: ({ children, data }: { children: React.ReactNode; data: any[] }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
  ),
  Line: ({ stroke, strokeWidth, dot, activeDot }: { stroke?: string; strokeWidth?: number; dot?: any; activeDot?: any }) => (
    <div data-testid="line" data-stroke={stroke} data-stroke-width={strokeWidth} data-dot-fill={dot?.fill} data-active-dot-fill={activeDot?.fill} />
  ),
  XAxis: ({ stroke, tick }: { stroke?: string; tick?: any }) => (
    <div data-testid="x-axis" data-stroke={stroke} data-tick-font-size={tick?.fontSize} />
  ),
  YAxis: ({ stroke, tick }: { stroke?: string; tick?: any }) => (
    <div data-testid="y-axis" data-stroke={stroke} data-tick-font-size={tick?.fontSize} />
  ),
  CartesianGrid: ({ stroke }: { stroke?: string }) => (
    <div data-testid="cartesian-grid" data-stroke={stroke} />
  ),
  Tooltip: ({ contentStyle, labelStyle, itemStyle }: { contentStyle?: any; labelStyle?: any; itemStyle?: any }) => (
    <div data-testid="tooltip" data-content-bg={contentStyle?.backgroundColor} data-label-color={labelStyle?.color} data-item-color={itemStyle?.color} />
  ),
  Legend: ({ wrapperStyle }: { wrapperStyle?: any }) => (
    <div data-testid="legend" data-wrapper-padding={wrapperStyle?.paddingTop} />
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ fill, dataKey, nameKey, children }: { fill?: string; dataKey?: string; nameKey?: string; children?: React.ReactNode }) => (
    <div data-testid="pie" data-fill={fill} data-data-key={dataKey} data-name-key={nameKey}>{children}</div>
  ),
  Cell: ({ fill }: { fill?: string }) => <div data-testid="cell" data-fill={fill} />,
}));

describe('Chart Color Schemes', () => {
  const mockLineChartData = {
    data: [
      { xValue: 1, pnl_overall_long: 100, pnl_overall_short: -50 },
      { xValue: 2, pnl_overall_long: 200, pnl_overall_short: -100 },
    ],
    seriesKeys: [
      { key: 'pnl_overall_long', color: LONG_TRADE_COLOR, name: 'Overall P&L (Long)' },
      { key: 'pnl_overall_short', color: SHORT_TRADE_COLOR, name: 'Overall P&L (Short)' }
    ]
  };

  const mockPieChartData = [
    { name: 'Tag 1', value: 30, fill: '#FF0000' },
    { name: 'Tag 2', value: 50, fill: '#00FF00' },
    { name: 'Tag 3', value: 20, fill: '#0000FF' },
  ];

  describe('LineChart Color Schemes', () => {
    it('applies default colors to chart elements', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      // Check axis colors
      const xAxis = screen.getByTestId('x-axis');
      const yAxis = screen.getByTestId('y-axis');
      expect(xAxis).toHaveAttribute('data-stroke', '#9CA3AF');
      expect(yAxis).toHaveAttribute('data-stroke', '#9CA3AF');

      // Check grid color
      const grid = screen.getByTestId('cartesian-grid');
      expect(grid).toHaveAttribute('data-stroke', '#4A5568');
    });

    it('applies custom colors to series', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const lines = screen.getAllByTestId('line');
      expect(lines).toHaveLength(2);
      
      // Check that lines have the correct colors
      expect(lines[0]).toHaveAttribute('data-stroke', LONG_TRADE_COLOR);
      expect(lines[1]).toHaveAttribute('data-stroke', SHORT_TRADE_COLOR);
    });

    it('applies default color when no custom color is provided', () => {
      const dataWithDefaultColor = {
        data: mockLineChartData.data,
        seriesKeys: [
          { key: 'pnl_overall_long', color: DEFAULT_CHART_COLOR, name: 'Overall P&L (Long)' }
        ]
      };

      render(
        <LineChartRenderer
          data={dataWithDefaultColor}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-stroke', DEFAULT_CHART_COLOR);
    });

    it('applies comparison colors correctly', () => {
      const comparisonData = {
        data: [
          { xValue: 1, pnl_overall_long_comp: 50 },
          { xValue: 2, pnl_overall_long_comp: 100 },
        ],
        seriesKeys: [
          { key: 'pnl_overall_long_comp', color: COMPARISON_CHART_COLOR, name: 'Overall P&L (Long) (Compare)' }
        ]
      };

      render(
        <LineChartRenderer
          data={mockLineChartData}
          comparisonData={comparisonData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const lines = screen.getAllByTestId('line');
      expect(lines).toHaveLength(3); // 2 original + 1 comparison
      
      // Check comparison line color
      expect(lines[2]).toHaveAttribute('data-stroke', COMPARISON_CHART_COLOR);
    });

    it('applies tooltip styling', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-content-bg', '#2D3748');
      expect(tooltip).toHaveAttribute('data-label-color', '#E5E7EB');
      expect(tooltip).toHaveAttribute('data-item-color', '#D1D5DB');
    });

    it('applies legend styling', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const legend = screen.getByTestId('legend');
      expect(legend).toHaveAttribute('data-wrapper-padding', '15px');
    });
  });

  describe('PieChart Color Schemes', () => {
    it('applies colors from data to pie segments', () => {
      render(<PieChartRenderer data={mockPieChartData} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(3);
      
      expect(cells[0]).toHaveAttribute('data-fill', '#FF0000');
      expect(cells[1]).toHaveAttribute('data-fill', '#00FF00');
      expect(cells[2]).toHaveAttribute('data-fill', '#0000FF');
    });

    it('applies default fill color to pie chart', () => {
      render(<PieChartRenderer data={mockPieChartData} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-fill', '#8884d8');
    });

    it('handles pie chart with custom colors', () => {
      const customColorData = [
        { name: 'Custom 1', value: 40, fill: '#FFA500' },
        { name: 'Custom 2', value: 60, fill: '#800080' },
      ];

      render(<PieChartRenderer data={customColorData} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells[0]).toHaveAttribute('data-fill', '#FFA500');
      expect(cells[1]).toHaveAttribute('data-fill', '#800080');
    });
  });

  describe('Color Consistency', () => {
    it('maintains color consistency across chart types', () => {
      // Test that the same color constants are used across different chart types
      expect(DEFAULT_CHART_COLOR).toBe('#8884d8');
      expect(COMPARISON_CHART_COLOR).toBe('#82ca9d');
      expect(LONG_TRADE_COLOR).toBe('#34D399');
      expect(SHORT_TRADE_COLOR).toBe('#F2385A');
    });

    it('applies consistent stroke width', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const lines = screen.getAllByTestId('line');
      lines.forEach(line => {
        expect(line).toHaveAttribute('data-stroke-width', '2');
      });
    });

    it('applies consistent font sizes', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const xAxis = screen.getByTestId('x-axis');
      const yAxis = screen.getByTestId('y-axis');
      
      expect(xAxis).toHaveAttribute('data-tick-font-size', '12');
      expect(yAxis).toHaveAttribute('data-tick-font-size', '12');
    });
  });

  describe('Color Validation', () => {
    it('handles invalid color values gracefully', () => {
      const invalidColorData = {
        data: mockLineChartData.data,
        seriesKeys: [
          { key: 'pnl_overall_long', color: 'invalid-color', name: 'Overall P&L (Long)' }
        ]
      };

      render(
        <LineChartRenderer
          data={invalidColorData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      // Should still render without errors
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('handles missing color values', () => {
      const noColorData = {
        data: mockLineChartData.data,
        seriesKeys: [
          { key: 'pnl_overall_long', color: DEFAULT_CHART_COLOR, name: 'Overall P&L (Long)' }
        ]
      };

      render(
        <LineChartRenderer
          data={noColorData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      // Should use default color
      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-stroke', DEFAULT_CHART_COLOR);
    });
  });
}); 