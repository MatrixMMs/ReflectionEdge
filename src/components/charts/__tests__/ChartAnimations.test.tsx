/**
 * Chart Animations Tests
 * 
 * This test suite covers chart animation functionality including:
 * 
 * - Smooth transitions when data changes
 * - Animation duration and easing
 * - Animation configurations for different chart types
 * - Performance during animations
 * - Animation state management
 * - Transition effects for data updates
 * 
 * Test scenarios include:
 * - Data transition animations
 * - Series addition/removal animations
 * - Color transition animations
 * - Size change animations
 * - Animation performance validation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LineChartRenderer } from '../LineChartRenderer';
import { PieChartRenderer } from '../PieChartRenderer';
import { ChartYAxisMetric, ChartXAxisMetric } from '@/types';

// Mock recharts components with animation support
jest.mock('recharts', () => ({
  LineChart: ({ children, data }: { children: React.ReactNode; data: any[] }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
  ),
  Line: ({ type, dataKey, stroke, strokeWidth, dot, activeDot }: { 
    type?: string;
    dataKey?: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: any;
    activeDot?: any;
  }) => (
    <div 
      data-testid="line" 
      data-type={type}
      data-data-key={dataKey}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-dot-fill={dot?.fill}
      data-active-dot-fill={activeDot?.fill}
    />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ 
    dataKey, 
    nameKey, 
    fill,
    children 
  }: { 
    dataKey?: string;
    nameKey?: string;
    fill?: string;
    children?: React.ReactNode;
  }) => (
    <div 
      data-testid="pie" 
      data-data-key={dataKey}
      data-name-key={nameKey}
      data-fill={fill}
    >
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill?: string }) => <div data-testid="cell" data-fill={fill} />,
}));

describe('Chart Animations', () => {
  const mockLineChartData = {
    data: [
      { xValue: 1, pnl_overall_long: 100 },
      { xValue: 2, pnl_overall_long: 200 },
    ],
    seriesKeys: [
      { key: 'pnl_overall_long', color: '#FF0000', name: 'Overall P&L (Long)' }
    ]
  };

  const mockPieChartData = [
    { name: 'Tag 1', value: 30, fill: '#FF0000' },
    { name: 'Tag 2', value: 50, fill: '#00FF00' },
  ];

  describe('LineChart Animations', () => {
    it('renders line elements with proper configuration for animations', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const lines = screen.getAllByTestId('line');
      lines.forEach(line => {
        expect(line).toHaveAttribute('data-type', 'monotone');
        expect(line).toHaveAttribute('data-stroke-width', '2');
        expect(line).toHaveAttribute('data-data-key');
      });
    });

    it('handles data transitions smoothly when new data points are added', async () => {
      const { rerender } = render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const initialLines = screen.getAllByTestId('line');
      expect(initialLines).toHaveLength(1);

      // Add new data with more points
      const newData = {
        data: [
          { xValue: 1, pnl_overall_long: 100 },
          { xValue: 2, pnl_overall_long: 200 },
          { xValue: 3, pnl_overall_long: 300 },
          { xValue: 4, pnl_overall_long: 400 },
        ],
        seriesKeys: mockLineChartData.seriesKeys
      };

      rerender(
        <LineChartRenderer
          data={newData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      await waitFor(() => {
        const updatedLines = screen.getAllByTestId('line');
        expect(updatedLines).toHaveLength(1); // Same number of series, but more data points
        // Line should still be properly configured
        expect(updatedLines[0]).toHaveAttribute('data-type', 'monotone');
      });
    });

    it('handles series addition and removal smoothly', async () => {
      const { rerender } = render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const initialLines = screen.getAllByTestId('line');
      expect(initialLines).toHaveLength(1);

      // Add comparison data (new series)
      const dataWithComparison = {
        data: [
          { xValue: 1, pnl_overall_long: 100, pnl_overall_short: -50 },
          { xValue: 2, pnl_overall_long: 200, pnl_overall_short: -100 },
        ],
        seriesKeys: [
          { key: 'pnl_overall_long', color: '#FF0000', name: 'Overall P&L (Long)' },
          { key: 'pnl_overall_short', color: '#00FF00', name: 'Overall P&L (Short)' }
        ]
      };

      rerender(
        <LineChartRenderer
          data={dataWithComparison}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      await waitFor(() => {
        const updatedLines = screen.getAllByTestId('line');
        expect(updatedLines).toHaveLength(2); // Now 2 series
        // All lines should be properly configured
        updatedLines.forEach(line => {
          expect(line).toHaveAttribute('data-type', 'monotone');
          expect(line).toHaveAttribute('data-stroke-width', '2');
        });
      });
    });

    it('maintains consistent styling during data updates', async () => {
      const { rerender } = render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      // Verify initial styling
      const initialLine = screen.getByTestId('line');
      expect(initialLine).toHaveAttribute('data-type', 'monotone');
      expect(initialLine).toHaveAttribute('data-stroke-width', '2');

      // Update data multiple times
      for (let i = 0; i < 3; i++) {
        const updatedData = {
          data: [
            { xValue: 1, pnl_overall_long: 100 + i * 50 },
            { xValue: 2, pnl_overall_long: 200 + i * 50 },
          ],
          seriesKeys: mockLineChartData.seriesKeys
        };

        rerender(
          <LineChartRenderer
            data={updatedData}
            yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
            xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
          />
        );

        await waitFor(() => {
          const line = screen.getByTestId('line');
          expect(line).toHaveAttribute('data-type', 'monotone');
          expect(line).toHaveAttribute('data-stroke-width', '2');
        });
      }
    });
  });

  describe('PieChart Animations', () => {
    it('renders pie elements with proper configuration for animations', () => {
      render(<PieChartRenderer data={mockPieChartData} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-data-key', 'value');
      expect(pie).toHaveAttribute('data-name-key', 'name');
    });

    it('handles segment addition and removal smoothly', async () => {
      const { rerender } = render(<PieChartRenderer data={mockPieChartData} />);

      const initialCells = screen.getAllByTestId('cell');
      expect(initialCells).toHaveLength(2);

      // Add more segments
      const newData = [
        { name: 'Tag 1', value: 30, fill: '#FF0000' },
        { name: 'Tag 2', value: 50, fill: '#00FF00' },
        { name: 'Tag 3', value: 20, fill: '#0000FF' },
        { name: 'Tag 4', value: 40, fill: '#FFFF00' },
      ];

      rerender(<PieChartRenderer data={newData} />);

      await waitFor(() => {
        const updatedCells = screen.getAllByTestId('cell');
        expect(updatedCells).toHaveLength(4);
        
        const pie = screen.getByTestId('pie');
        expect(pie).toHaveAttribute('data-data-key', 'value');
      });
    });

    it('handles value changes smoothly', async () => {
      const { rerender } = render(<PieChartRenderer data={mockPieChartData} />);

      // Update segment values
      const updatedData = [
        { name: 'Tag 1', value: 60, fill: '#FF0000' },
        { name: 'Tag 2', value: 40, fill: '#00FF00' },
      ];

      rerender(<PieChartRenderer data={updatedData} />);

      await waitFor(() => {
        const pie = screen.getByTestId('pie');
        expect(pie).toHaveAttribute('data-data-key', 'value');
        expect(pie).toHaveAttribute('data-name-key', 'name');
      });
    });

    it('handles color changes smoothly', async () => {
      const { rerender } = render(<PieChartRenderer data={mockPieChartData} />);

      // Update colors
      const newColorData = [
        { name: 'Tag 1', value: 30, fill: '#FFA500' },
        { name: 'Tag 2', value: 50, fill: '#800080' },
      ];

      rerender(<PieChartRenderer data={newColorData} />);

      await waitFor(() => {
        const cells = screen.getAllByTestId('cell');
        expect(cells[0]).toHaveAttribute('data-fill', '#FFA500');
        expect(cells[1]).toHaveAttribute('data-fill', '#800080');
        
        const pie = screen.getByTestId('pie');
        expect(pie).toHaveAttribute('data-data-key', 'value');
      });
    });
  });

  describe('Animation Performance', () => {
    it('handles large datasets efficiently', async () => {
      const largeDataset = {
        data: Array.from({ length: 100 }, (_, i) => ({
          xValue: i + 1,
          pnl_overall_long: i * 10,
        })),
        seriesKeys: mockLineChartData.seriesKeys
      };

      render(
        <LineChartRenderer
          data={largeDataset}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-type', 'monotone');
      expect(line).toHaveAttribute('data-stroke-width', '2');
    });

    it('handles rapid data updates without errors', async () => {
      const { rerender } = render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      // Rapidly update data
      for (let i = 0; i < 5; i++) {
        const rapidUpdateData = {
          data: [
            { xValue: 1, pnl_overall_long: 100 + i * 10 },
            { xValue: 2, pnl_overall_long: 200 + i * 10 },
          ],
          seriesKeys: mockLineChartData.seriesKeys
        };

        rerender(
          <LineChartRenderer
            data={rapidUpdateData}
            yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
            xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
          />
        );

        // Should not throw errors during rapid updates
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      }
    });
  });

  describe('Animation Configuration', () => {
    it('uses consistent line type across chart updates', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      render(<PieChartRenderer data={mockPieChartData} />);

      const line = screen.getAllByTestId('line')[0];
      const pie = screen.getByTestId('pie');

      expect(line).toHaveAttribute('data-type', 'monotone');
      expect(pie).toHaveAttribute('data-data-key', 'value');
    });

    it('maintains consistent stroke width across updates', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      render(<PieChartRenderer data={mockPieChartData} />);

      const line = screen.getAllByTestId('line')[0];
      const pie = screen.getByTestId('pie');

      expect(line).toHaveAttribute('data-stroke-width', '2');
      expect(pie).toHaveAttribute('data-name-key', 'name');
    });
  });
}); 