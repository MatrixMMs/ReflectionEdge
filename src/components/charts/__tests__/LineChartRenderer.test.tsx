/**
 * LineChartRenderer Component Tests
 * 
 * This test suite covers the LineChartRenderer component functionality including:
 * 
 * - Rendering behavior with null/empty data (displays "no data" message)
 * - Rendering with valid chart data and comparison data
 * - Proper axis label generation based on Y-axis and X-axis metrics
 * - Chart component structure verification (axes, grid, tooltip, legend)
 * - Data merging and processing for comparison charts
 * - Multiple series handling and rendering
 * - Chart responsiveness and container structure
 * 
 * Test scenarios include:
 * - No data available (null data)
 * - Basic chart rendering with single series
 * - Chart with comparison data (multiple series)
 * - Different axis metric combinations (Trade Sequence, Time, Cumulative P&L, etc.)
 * - Chart element presence and structure validation
 * 
 * Mocked dependencies:
 * - Recharts components (LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer)
 * - Chart data structures and metrics from types
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LineChartRenderer } from '../LineChartRenderer';
import { ChartYAxisMetric, ChartXAxisMetric } from '@/types';

// Mock recharts components
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
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('LineChartRenderer', () => {
  const mockData = {
    data: [
      { xValue: 1, 'Overall P&L': 100 },
      { xValue: 2, 'Overall P&L': 200 },
      { xValue: 3, 'Overall P&L': 300 },
    ],
    seriesKeys: [
      { key: 'Overall P&L', name: 'Overall P&L', color: '#000000' }
    ]
  };

  const mockComparisonData = {
    data: [
      { xValue: 1, 'Overall P&L_comp': 150 },
      { xValue: 2, 'Overall P&L_comp': 250 },
      { xValue: 3, 'Overall P&L_comp': 350 },
    ],
    seriesKeys: [
      { key: 'Overall P&L_comp', name: 'Overall P&L (Compare)', color: '#666666' }
    ]
  };

  it('renders no data message when data is null', () => {
    render(
      <LineChartRenderer
        data={null}
        yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
        xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
      />
    );
    expect(screen.getByText('No data available for the selected criteria. Adjust filters or add trades.')).toBeInTheDocument();
  });

  it('renders no data message when data array is empty', () => {
    render(
      <LineChartRenderer
        data={{ data: [], seriesKeys: [] }}
        yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
        xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
      />
    );
    expect(screen.getByText('No data available for the selected criteria. Adjust filters or add trades.')).toBeInTheDocument();
  });

  it('renders chart with basic data', () => {
    render(
      <LineChartRenderer
        data={mockData}
        yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
        xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
      />
    );
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders chart with comparison data', () => {
    render(
      <LineChartRenderer
        data={mockData}
        comparisonData={mockComparisonData}
        yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
        xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
      />
    );
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    // Should have two lines - one for main data and one for comparison
    expect(screen.getAllByTestId('line')).toHaveLength(2);
  });

  it('renders correct axis labels for trade sequence', () => {
    render(
      <LineChartRenderer
        data={mockData}
        yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
        xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
      />
    );
    const xAxis = screen.getByTestId('x-axis');
    const yAxis = screen.getByTestId('y-axis');
    expect(xAxis).toHaveAttribute('data-label', 'Trade Sequence');
    expect(yAxis).toHaveAttribute('data-label', ChartYAxisMetric.CUMULATIVE_PNL);
  });

  it('renders correct axis labels for time metric', () => {
    render(
      <LineChartRenderer
        data={mockData}
        yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
        xAxisMetric={ChartXAxisMetric.TIME}
      />
    );
    const xAxis = screen.getByTestId('x-axis');
    expect(xAxis).toHaveAttribute('data-label', 'Time');
  });

  it('handles multiple series correctly', () => {
    const multiSeriesData = {
      data: [
        { xValue: 1, 'Series1': 100, 'Series2': 150 },
        { xValue: 2, 'Series1': 200, 'Series2': 250 },
      ],
      seriesKeys: [
        { key: 'Series1', name: 'Series 1', color: '#000000' },
        { key: 'Series2', name: 'Series 2', color: '#666666' }
      ]
    };

    render(
      <LineChartRenderer
        data={multiSeriesData}
        yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
        xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
      />
    );
    expect(screen.getAllByTestId('line')).toHaveLength(2);
  });

  it('merges comparison data correctly', () => {
    render(
      <LineChartRenderer
        data={mockData}
        comparisonData={mockComparisonData}
        yAxisMetric={ChartYAxisMetric.CUMULATIVE_PNL}
        xAxisMetric={ChartXAxisMetric.TRADE_SEQUENCE}
      />
    );
    const chart = screen.getByTestId('line-chart');
    // Verify that the chart data includes both original and comparison data
    expect(chart).toHaveAttribute('data-chart-data', expect.stringContaining('Overall P&L'));
    expect(chart).toHaveAttribute('data-chart-data', expect.stringContaining('Overall P&L_comp'));
  });
}); 