import { render, screen } from '@testing-library/react';
import { TagPerformance } from '../TagPerformance';
import { Trade, TagGroup, AppDateRange, TradeDirectionFilterSelection, TradeDirection } from '../../../types';

// Mock the Icons component
jest.mock('../../ui/Icons', () => ({
  AcademicCapIcon: ({ className }: any) => <span data-testid="academic-icon" className={className} />,
}));

// Mock the financial calculations utility
jest.mock('../../../utils/financialCalculations', () => ({
  calculateSharpeRatio: jest.fn(),
}));

import { calculateSharpeRatio } from '../../../utils/financialCalculations';

describe('TagPerformance', () => {
  const mockTagGroups: TagGroup[] = [
    {
      id: 'feeling',
      name: 'Feeling',
      subtags: [
        { id: 'confident', name: 'Confident', color: '#34D399', groupId: 'feeling' },
        { id: 'nervous', name: 'Nervous', color: '#F2385A', groupId: 'feeling' },
      ],
    },
    {
      id: 'market',
      name: 'Market',
      subtags: [
        { id: 'bullish', name: 'Bullish', color: '#52D681', groupId: 'market' },
        { id: 'bearish', name: 'Bearish', color: '#F79256', groupId: 'market' },
      ],
    },
  ];

  const mockTrades: Trade[] = [
    {
      id: '1',
      date: '2024-01-01',
      symbol: 'AAPL',
      contracts: 100,
      entry: 150.00,
      exit: 155.00,
      timeIn: '09:30',
      timeOut: '10:30',
      timeInTrade: 60,
      profit: 500.00,
      tags: { feeling: 'confident', market: 'bullish' },
      journal: 'Good trade',
      direction: 'long' as TradeDirection,
      accountId: 'account1',
    },
    {
      id: '2',
      date: '2024-01-02',
      symbol: 'TSLA',
      contracts: 50,
      entry: 200.00,
      exit: 195.00,
      timeIn: '14:00',
      timeOut: '15:00',
      timeInTrade: 60,
      profit: -250.00,
      tags: { feeling: 'nervous', market: 'bearish' },
      journal: 'Bad trade',
      direction: 'short' as TradeDirection,
      accountId: 'account1',
    },
    {
      id: '3',
      date: '2024-01-03',
      symbol: 'GOOGL',
      contracts: 75,
      entry: 120.00,
      exit: 125.00,
      timeIn: '11:00',
      timeOut: '12:00',
      timeInTrade: 60,
      profit: 375.00,
      tags: { feeling: 'confident' },
      journal: 'Another good trade',
      direction: 'long' as TradeDirection,
      accountId: 'account1',
    },
  ];

  const defaultProps = {
    trades: mockTrades,
    tagGroups: mockTagGroups,
    chartDateRange: { start: '2024-01-01', end: '2024-01-03' } as AppDateRange,
    directionFilter: 'all' as TradeDirectionFilterSelection,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (calculateSharpeRatio as jest.Mock).mockReturnValue(1.5);
  });

  describe('Rendering', () => {
    it('renders the component with correct title', () => {
      render(<TagPerformance {...defaultProps} />);
      
      expect(screen.getByText('Tag Performance')).toBeInTheDocument();
      expect(screen.getByTestId('academic-icon')).toBeInTheDocument();
    });

    it('displays performance data for tags with trades', () => {
      render(<TagPerformance {...defaultProps} />);
      
      // Should show confident tag performance
      expect(screen.getByText('Confident')).toBeInTheDocument();
      const feelingElements = screen.getAllByText('Feeling');
      expect(feelingElements.length).toBeGreaterThan(0);
      
      // Should show nervous tag performance
      expect(screen.getByText('Nervous')).toBeInTheDocument();
      
      // Should show bullish tag performance
      expect(screen.getByText('Bullish')).toBeInTheDocument();
      const marketElements = screen.getAllByText('Market');
      expect(marketElements.length).toBeGreaterThan(0);
      
      // Should show bearish tag performance
      expect(screen.getByText('Bearish')).toBeInTheDocument();
    });

    it('shows empty state when no trades with tags in date range', () => {
      const emptyProps = {
        ...defaultProps,
        chartDateRange: { start: '2024-02-01', end: '2024-02-03' } as AppDateRange,
      };
      
      render(<TagPerformance {...emptyProps} />);
      
      expect(screen.getByText(/No trades with tags found in the selected date range/)).toBeInTheDocument();
    });

    it('shows direction filter in empty state message', () => {
      const longOnlyProps = {
        ...defaultProps,
        directionFilter: 'long' as TradeDirectionFilterSelection,
        chartDateRange: { start: '2024-02-01', end: '2024-02-03' } as AppDateRange,
      };
      
      render(<TagPerformance {...longOnlyProps} />);
      
      expect(screen.getByText(/No trades with tags found in the selected date range \(long only\)/)).toBeInTheDocument();
    });
  });

  describe('Performance Calculations', () => {
    it('calculates correct total P&L for each tag', () => {
      render(<TagPerformance {...defaultProps} />);
      
      // Confident tag: trades 1 and 3 = 500 + 375 = 875
      expect(screen.getByText('$875.00')).toBeInTheDocument();
      
      // Nervous tag: trade 2 = -250
      // Bearish tag: trade 2 = -250
      const negativePnlElements = screen.getAllByText('$-250.00');
      expect(negativePnlElements).toHaveLength(2); // Both Nervous and Bearish tags
      
      // Bullish tag: trade 1 = 500
      expect(screen.getByText('$500.00')).toBeInTheDocument();
    });

    it('calculates correct trade count for each tag', () => {
      render(<TagPerformance {...defaultProps} />);
      
      // Confident tag: 2 trades
      const confidentSection = screen.getByText('Confident').closest('.bg-gray-700');
      expect(confidentSection).toHaveTextContent('Trades:2');
      
      // Nervous tag: 1 trade
      const nervousSection = screen.getByText('Nervous').closest('.bg-gray-700');
      expect(nervousSection).toHaveTextContent('Trades:1');
      
      // Bullish tag: 1 trade
      const bullishSection = screen.getByText('Bullish').closest('.bg-gray-700');
      expect(bullishSection).toHaveTextContent('Trades:1');
      
      // Bearish tag: 1 trade
      const bearishSection = screen.getByText('Bearish').closest('.bg-gray-700');
      expect(bearishSection).toHaveTextContent('Trades:1');
    });

    it('calls calculateSharpeRatio with correct P&L values', () => {
      render(<TagPerformance {...defaultProps} />);
      
      // Should be called for each tag with trades
      expect(calculateSharpeRatio).toHaveBeenCalledWith([500, 375]); // confident
      expect(calculateSharpeRatio).toHaveBeenCalledWith([-250]); // nervous
      expect(calculateSharpeRatio).toHaveBeenCalledWith([500]); // bullish
      expect(calculateSharpeRatio).toHaveBeenCalledWith([-250]); // bearish
    });

    it('displays Sharpe ratio correctly', () => {
      (calculateSharpeRatio as jest.Mock).mockReturnValue(2.45);
      
      render(<TagPerformance {...defaultProps} />);
      
      expect(screen.getAllByText('2.45')).toHaveLength(4); // One for each tag
    });
  });

  describe('Date Range Filtering', () => {
    it('filters trades by date range correctly', () => {
      const tradesWithDifferentDates = [
        ...mockTrades,
        {
          id: '4',
          date: '2024-02-01', // Outside range
          symbol: 'MSFT',
          contracts: 100,
          entry: 300.00,
          exit: 310.00,
          timeIn: '09:30',
          timeOut: '10:30',
          timeInTrade: 60,
          profit: 1000.00,
          tags: { feeling: 'confident' },
          journal: 'Outside range trade',
          direction: 'long' as TradeDirection,
          accountId: 'account1',
        },
      ];
      
      render(<TagPerformance {...defaultProps} trades={tradesWithDifferentDates} />);
      
      // Should only show performance for trades within date range
      // Confident tag should still show 875 (not 1875)
      expect(screen.getByText('$875.00')).toBeInTheDocument();
    });

    it('handles edge case dates correctly', () => {
      const edgeCaseTrades = [
        {
          id: '1',
          date: '2024-01-01', // Start date
          symbol: 'AAPL',
          contracts: 100,
          entry: 150.00,
          exit: 155.00,
          timeIn: '09:30',
          timeOut: '10:30',
          timeInTrade: 60,
          profit: 500.00,
          tags: { feeling: 'confident' },
          journal: 'Start date trade',
          direction: 'long' as TradeDirection,
          accountId: 'account1',
        },
        {
          id: '2',
          date: '2024-01-03', // End date
          symbol: 'TSLA',
          contracts: 50,
          entry: 200.00,
          exit: 195.00,
          timeIn: '14:00',
          timeOut: '15:00',
          timeInTrade: 60,
          profit: -250.00,
          tags: { feeling: 'nervous' },
          journal: 'End date trade',
          direction: 'short' as TradeDirection,
          accountId: 'account1',
        },
      ];
      
      render(<TagPerformance {...defaultProps} trades={edgeCaseTrades} />);
      
      // Both trades should be included
      expect(screen.getByText('$500.00')).toBeInTheDocument(); // confident
      expect(screen.getByText('$-250.00')).toBeInTheDocument(); // nervous
    });
  });

  describe('Direction Filtering', () => {
    it('filters by long trades only', () => {
      const longOnlyProps = {
        ...defaultProps,
        directionFilter: 'long' as TradeDirectionFilterSelection,
      };
      
      render(<TagPerformance {...longOnlyProps} />);
      
      // Should only show long trades
      // Confident tag: trades 1 and 3 (both long) = 875
      expect(screen.getByText('$875.00')).toBeInTheDocument();
      
      // Nervous tag: trade 2 (short) should not be included
      expect(screen.queryByText('$-250.00')).not.toBeInTheDocument();
      
      // Bullish tag: trade 1 (long) = 500
      expect(screen.getByText('$500.00')).toBeInTheDocument();
      
      // Bearish tag: trade 2 (short) should not be included
      expect(screen.queryByText('$-250.00')).not.toBeInTheDocument();
    });

    it('filters by short trades only', () => {
      const shortOnlyProps = {
        ...defaultProps,
        directionFilter: 'short' as TradeDirectionFilterSelection,
      };
      
      render(<TagPerformance {...shortOnlyProps} />);
      
      // Should only show short trades
      // Confident tag: no short trades
      expect(screen.queryByText('$875.00')).not.toBeInTheDocument();
      
      // Nervous tag: trade 2 (short) = -250
      // Bearish tag: trade 2 (short) = -250
      const negativePnlElements = screen.getAllByText('$-250.00');
      expect(negativePnlElements).toHaveLength(2); // Both Nervous and Bearish tags
      
      // Bullish tag: no short trades
      expect(screen.queryByText('$500.00')).not.toBeInTheDocument();
    });

    it('shows direction filter in footer text', () => {
      const longOnlyProps = {
        ...defaultProps,
        directionFilter: 'long' as TradeDirectionFilterSelection,
      };
      
      render(<TagPerformance {...longOnlyProps} />);
      
      expect(screen.getByText(/For trades in selected date range \(long only\)/)).toBeInTheDocument();
    });
  });

  describe('Sharpe Ratio Formatting', () => {
    it('formats normal Sharpe ratio values', () => {
      (calculateSharpeRatio as jest.Mock).mockReturnValue(1.234);
      
      render(<TagPerformance {...defaultProps} />);
      
      expect(screen.getAllByText('1.23')).toHaveLength(4); // Rounded to 2 decimal places
    });

    it('handles null Sharpe ratio', () => {
      (calculateSharpeRatio as jest.Mock).mockReturnValue(null);
      
      render(<TagPerformance {...defaultProps} />);
      
      expect(screen.getAllByText('N/A')).toHaveLength(4);
    });

    it('handles Infinity Sharpe ratio', () => {
      (calculateSharpeRatio as jest.Mock).mockReturnValue(Infinity);
      
      render(<TagPerformance {...defaultProps} />);
      
      expect(screen.getAllByText('High (∞)')).toHaveLength(4);
    });

    it('handles negative Infinity Sharpe ratio', () => {
      (calculateSharpeRatio as jest.Mock).mockReturnValue(-Infinity);
      
      render(<TagPerformance {...defaultProps} />);
      
      expect(screen.getAllByText('Low (-∞)')).toHaveLength(4);
    });

    it('handles NaN Sharpe ratio', () => {
      (calculateSharpeRatio as jest.Mock).mockReturnValue(NaN);
      
      render(<TagPerformance {...defaultProps} />);
      
      expect(screen.getAllByText('N/A')).toHaveLength(4);
    });
  });

  describe('P&L Color Coding', () => {
    it('displays positive P&L in green', () => {
      render(<TagPerformance {...defaultProps} />);
      
      const positivePnl = screen.getByText('$875.00');
      expect(positivePnl).toHaveClass('text-green-400');
    });

    it('displays negative P&L in red', () => {
      render(<TagPerformance {...defaultProps} />);
      
      const negativePnlElements = screen.getAllByText('$-250.00');
      expect(negativePnlElements.length).toBeGreaterThan(0);
      expect(negativePnlElements[0]).toHaveClass('text-red-400');
    });
  });

  describe('Sorting', () => {
    it('sorts performance data by subtag name', () => {
      render(<TagPerformance {...defaultProps} />);
      
      const performanceItems = screen.getAllByText(/Confident|Nervous|Bullish|Bearish/);
      
      // Should be sorted alphabetically: Bearish, Bullish, Confident, Nervous
      expect(performanceItems[0]).toHaveTextContent('Bearish');
      expect(performanceItems[1]).toHaveTextContent('Bullish');
      expect(performanceItems[2]).toHaveTextContent('Confident');
      expect(performanceItems[3]).toHaveTextContent('Nervous');
    });
  });

  describe('Edge Cases', () => {
    it('handles trades with no tags', () => {
      const tradesWithNoTags = [
        {
          id: '1',
          date: '2024-01-01',
          symbol: 'AAPL',
          contracts: 100,
          entry: 150.00,
          exit: 155.00,
          timeIn: '09:30',
          timeOut: '10:30',
          timeInTrade: 60,
          profit: 500.00,
          tags: {},
          journal: 'No tags trade',
          direction: 'long' as TradeDirection,
          accountId: 'account1',
        },
      ];
      
      render(<TagPerformance {...defaultProps} trades={tradesWithNoTags} />);
      
      // Should show empty state
      expect(screen.getByText(/No trades with tags found in the selected date range/)).toBeInTheDocument();
    });

    it('handles trades with partial tags', () => {
      const tradesWithPartialTags = [
        {
          id: '1',
          date: '2024-01-01',
          symbol: 'AAPL',
          contracts: 100,
          entry: 150.00,
          exit: 155.00,
          timeIn: '09:30',
          timeOut: '10:30',
          timeInTrade: 60,
          profit: 500.00,
          tags: { feeling: 'confident' }, // Only feeling tag
          journal: 'Partial tags trade',
          direction: 'long' as TradeDirection,
          accountId: 'account1',
        },
      ];
      
      render(<TagPerformance {...defaultProps} trades={tradesWithPartialTags} />);
      
      // Should only show confident tag performance
      expect(screen.getByText('Confident')).toBeInTheDocument();
      expect(screen.queryByText('Bullish')).not.toBeInTheDocument();
    });

    it('handles empty tag groups', () => {
      const emptyTagGroups: TagGroup[] = [];
      
      render(<TagPerformance {...defaultProps} tagGroups={emptyTagGroups} />);
      
      // Should show empty state
      expect(screen.getByText(/No trades with tags found in the selected date range/)).toBeInTheDocument();
    });

    it('handles tag groups with no subtags', () => {
      const tagGroupsWithNoSubtags: TagGroup[] = [
        {
          id: 'empty',
          name: 'Empty Group',
          subtags: [],
        },
      ];
      
      render(<TagPerformance {...defaultProps} tagGroups={tagGroupsWithNoSubtags} />);
      
      // Should show empty state
      expect(screen.getByText(/No trades with tags found in the selected date range/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<TagPerformance {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Tag Performance');
    });

    it('has proper text content for screen readers', () => {
      render(<TagPerformance {...defaultProps} />);
      
      expect(screen.getByText(/For trades in selected date range/)).toBeInTheDocument();
    });
  });
}); 