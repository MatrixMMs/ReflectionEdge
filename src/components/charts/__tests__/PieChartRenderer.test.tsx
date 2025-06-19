import React from 'react';
import { render, screen } from '@testing-library/react';
import { PieChartRenderer } from '../PieChartRenderer';

// Mock recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}));

describe('PieChartRenderer', () => {
  const mockData = [
    { name: 'Tag 1', value: 30, fill: '#FF0000' },
    { name: 'Tag 2', value: 50, fill: '#00FF00' },
    { name: 'Tag 3', value: 20, fill: '#0000FF' },
  ];

  it('renders no data message when data array is empty', () => {
    render(<PieChartRenderer data={[]} />);
    expect(screen.getByText('No tag data to display for pie chart.')).toBeInTheDocument();
  });

  it('renders chart with valid data', () => {
    render(<PieChartRenderer data={mockData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders correct number of cells for data points', () => {
    render(<PieChartRenderer data={mockData} />);
    expect(screen.getAllByTestId('cell')).toHaveLength(mockData.length);
  });

  it('renders chart with single data point', () => {
    const singleData = [{ name: 'Single Tag', value: 100, fill: '#FF0000' }];
    render(<PieChartRenderer data={singleData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('cell')).toHaveLength(1);
  });

  it('renders chart with zero values', () => {
    const zeroData = [
      { name: 'Tag 1', value: 0, fill: '#FF0000' },
      { name: 'Tag 2', value: 0, fill: '#00FF00' },
    ];
    render(<PieChartRenderer data={zeroData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('cell')).toHaveLength(2);
  });

  it('renders chart with negative values', () => {
    const negativeData = [
      { name: 'Tag 1', value: -30, fill: '#FF0000' },
      { name: 'Tag 2', value: -50, fill: '#00FF00' },
    ];
    render(<PieChartRenderer data={negativeData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('cell')).toHaveLength(2);
  });

  it('renders chart with large values', () => {
    const largeData = [
      { name: 'Tag 1', value: 1000000, fill: '#FF0000' },
      { name: 'Tag 2', value: 2000000, fill: '#00FF00' },
    ];
    render(<PieChartRenderer data={largeData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('cell')).toHaveLength(2);
  });

  it('renders chart with long tag names', () => {
    const longNameData = [
      { name: 'Very Long Tag Name That Might Cause Layout Issues', value: 30, fill: '#FF0000' },
      { name: 'Another Very Long Tag Name', value: 70, fill: '#00FF00' },
    ];
    render(<PieChartRenderer data={longNameData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('cell')).toHaveLength(2);
  });
}); 