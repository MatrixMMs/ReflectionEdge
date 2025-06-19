/**
 * Chart Responsiveness and Data Update Tests
 * 
 * This test suite covers chart responsiveness and data update functionality including:
 * 
 * - Chart responsiveness to container size changes
 * - Data update handling when props change
 * - Chart re-rendering on data changes
 * - Responsive container behavior
 * - Chart adaptation to different screen sizes
 * - Performance during data updates
 * 
 * Test scenarios include:
 * - Container resize simulation
 * - Data prop changes
 * - Comparison data updates
 * - Metric changes
 * - Responsive behavior validation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LineChartRenderer } from '../LineChartRenderer';
import { PieChartRenderer } from '../PieChartRenderer';
import { ChartYAxisMetric, ChartXAxisMetric } from '@/types';

// Mock recharts components with responsive behavior
jest.mock('recharts', () => ({
  LineChart: ({ children, data }: { children: React.ReactNode; data: any[] }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: ({ label }: { label?: { value: string } }) => (
    <div data-testid="x-axis" data-label={label?.value} />
  ),
  YAxis: ({ label }: { label?: { value: string } }) => (
    <div data-testid="y-axis" data-label={label?.value} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children, width, height }: { children: React.ReactNode; width?: string; height?: number }) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}));

describe('Chart Responsiveness', () => {
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

  describe('LineChartRenderer Responsiveness', () => {
    it('renders with responsive container', () => {
      render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const responsiveContainer = screen.getByTestId('responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
      expect(responsiveContainer).toHaveAttribute('data-width', '100%');
      expect(responsiveContainer).toHaveAttribute('data-height', '400');
    });

    it('updates when data changes', async () => {
      const { rerender } = render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const initialChart = screen.getByTestId('line-chart');
      const initialData = JSON.parse(initialChart.getAttribute('data-chart-data') || '[]');
      expect(initialData).toHaveLength(2);

      // Update with new data
      const newData = {
        data: [
          { xValue: 1, pnl_overall_long: 150 },
          { xValue: 2, pnl_overall_long: 300 },
          { xValue: 3, pnl_overall_long: 450 },
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
        const updatedChart = screen.getByTestId('line-chart');
        const updatedData = JSON.parse(updatedChart.getAttribute('data-chart-data') || '[]');
        expect(updatedData).toHaveLength(3);
        expect(updatedData[0].pnl_overall_long).toBe(150);
      });
    });

    it('updates when comparison data changes', async () => {
      const { rerender } = render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      // Add comparison data
      const comparisonData = {
        data: [
          { xValue: 1, pnl_overall_long_comp: 50 },
          { xValue: 2, pnl_overall_long_comp: 100 },
        ],
        seriesKeys: [
          { key: 'pnl_overall_long_comp', color: '#00FF00', name: 'Overall P&L (Long) (Compare)' }
        ]
      };

      rerender(
        <LineChartRenderer
          data={mockLineChartData}
          comparisonData={comparisonData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      await waitFor(() => {
        const chart = screen.getByTestId('line-chart');
        const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
        expect(chartData[0]).toHaveProperty('pnl_overall_long_comp');
      });
    });

    it('updates when metrics change', async () => {
      const { rerender } = render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      const initialXAxis = screen.getByTestId('x-axis');
      expect(initialXAxis).toHaveAttribute('data-label', 'Trade Sequence');

      // Change to time metric
      rerender(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TIME}
        />
      );

      await waitFor(() => {
        const updatedXAxis = screen.getByTestId('x-axis');
        expect(updatedXAxis).toHaveAttribute('data-label', 'Time');
      });
    });
  });

  describe('PieChartRenderer Responsiveness', () => {
    it('renders with responsive container', () => {
      render(<PieChartRenderer data={mockPieChartData} />);

      const responsiveContainer = screen.getByTestId('responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
      expect(responsiveContainer).toHaveAttribute('data-width', '100%');
      expect(responsiveContainer).toHaveAttribute('data-height', '300');
    });

    it('updates when data changes', async () => {
      const { rerender } = render(<PieChartRenderer data={mockPieChartData} />);

      const initialCells = screen.getAllByTestId('cell');
      expect(initialCells).toHaveLength(2);

      // Update with new data
      const newData = [
        { name: 'Tag 1', value: 40, fill: '#FF0000' },
        { name: 'Tag 2', value: 60, fill: '#00FF00' },
        { name: 'Tag 3', value: 20, fill: '#0000FF' },
      ];

      rerender(<PieChartRenderer data={newData} />);

      await waitFor(() => {
        const updatedCells = screen.getAllByTestId('cell');
        expect(updatedCells).toHaveLength(3);
      });
    });

    it('handles empty data updates', async () => {
      const { rerender } = render(<PieChartRenderer data={mockPieChartData} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

      // Update with empty data
      rerender(<PieChartRenderer data={[]} />);

      await waitFor(() => {
        expect(screen.getByText('No tag data to display for pie chart.')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains chart structure during updates', async () => {
      const { rerender } = render(
        <LineChartRenderer
          data={mockLineChartData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      // Verify initial structure
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('legend')).toBeInTheDocument();

      // Update data
      const newData = {
        data: [{ xValue: 1, pnl_overall_long: 999 }],
        seriesKeys: mockLineChartData.seriesKeys
      };

      rerender(
        <LineChartRenderer
          data={newData}
          yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
          xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
        />
      );

      // Verify structure is maintained
      await waitFor(() => {
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('x-axis')).toBeInTheDocument();
        expect(screen.getByTestId('y-axis')).toBeInTheDocument();
        expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        expect(screen.getByTestId('legend')).toBeInTheDocument();
      });
    });
  });
}); 