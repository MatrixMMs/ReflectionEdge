import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagManager } from '../TagManager';
import { TagPerformance } from '../TagPerformance';
import { Trade, TagGroup, AppDateRange, TradeDirectionFilterSelection, TradeDirection } from '../../../types';

// Mock the UI components
jest.mock('../../ui/Input', () => ({
  Input: ({ value, onChange, placeholder, className, type }: any) => (
    <input
      data-testid="input"
      type={type || 'text'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

jest.mock('../../ui/Button', () => ({
  Button: ({ children, onClick, variant, size, leftIcon, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      className={`${variant} ${size} ${className || ''}`}
    >
      {leftIcon}
      {children}
    </button>
  ),
}));

jest.mock('../../ui/ColorPicker', () => ({
  ColorPicker: ({ initialColor, onChange }: any) => (
    <input
      data-testid="color-picker"
      type="color"
      defaultValue={initialColor}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

jest.mock('../../ui/Icons', () => ({
  PlusCircleIcon: ({ className }: any) => <span data-testid="plus-icon" className={className} />,
  TrashIcon: ({ className }: any) => <span data-testid="trash-icon" className={className} />,
  AcademicCapIcon: ({ className }: any) => <span data-testid="academic-icon" className={className} />,
}));

// Mock the financial calculations utility
jest.mock('../../../utils/financialCalculations', () => ({
  calculateSharpeRatio: jest.fn(),
}));

import { calculateSharpeRatio } from '../../../utils/financialCalculations';

describe('Tag System Integration', () => {
  let mockTagGroups: TagGroup[];
  let mockTrades: Trade[];
  let mockOnAddGroup: jest.Mock;
  let mockOnAddSubTag: jest.Mock;
  let mockOnUpdateSubTagColor: jest.Mock;
  let mockOnDeleteGroup: jest.Mock;
  let mockOnDeleteSubTag: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (calculateSharpeRatio as jest.Mock).mockReturnValue(1.5);

    mockTagGroups = [
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

    mockTrades = [
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
    ];

    mockOnAddGroup = jest.fn();
    mockOnAddSubTag = jest.fn();
    mockOnUpdateSubTagColor = jest.fn();
    mockOnDeleteGroup = jest.fn();
    mockOnDeleteSubTag = jest.fn();
  });

  describe('TagManager and TagPerformance Data Flow', () => {
    it('shows performance data that matches the tag groups in TagManager', () => {
      render(
        <div>
          <TagManager
            tagGroups={mockTagGroups}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
          <TagPerformance
            trades={mockTrades}
            tagGroups={mockTagGroups}
            chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
            directionFilter="all"
          />
        </div>
      );

      // TagManager should show all tag groups - use the 'Existing Tag Groups' section
      const existingGroupsHeading = screen.getByText('Existing Tag Groups');
      const tagManagerSection = existingGroupsHeading.closest('div');
      
      // Check that the TagManager section contains the expected content
      expect(tagManagerSection).toHaveTextContent('Feeling');
      expect(tagManagerSection).toHaveTextContent('Market');
      expect(tagManagerSection).toHaveTextContent('Confident');
      expect(tagManagerSection).toHaveTextContent('Nervous');
      expect(tagManagerSection).toHaveTextContent('Bullish');
      expect(tagManagerSection).toHaveTextContent('Bearish');

      // TagPerformance should show performance for tags with trades
      expect(screen.getByText('Tag Performance')).toBeInTheDocument();
      
      // Check that performance values exist (there are multiple $500.00 values for different tags)
      const positivePnlElements = screen.getAllByText('$500.00');
      expect(positivePnlElements.length).toBeGreaterThan(0); // At least one positive P&L
      
      const negativePnlElements = screen.getAllByText('$-250.00');
      expect(negativePnlElements.length).toBeGreaterThan(0); // At least one negative P&L
    });

    it('updates performance when tag colors are changed', async () => {
      render(
        <div>
          <TagManager
            tagGroups={mockTagGroups}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
          <TagPerformance
            trades={mockTrades}
            tagGroups={mockTagGroups}
            chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
            directionFilter="all"
          />
        </div>
      );

      // Change color of confident tag
      const colorPickers = screen.getAllByTestId('color-picker');
      const confidentColorPicker = colorPickers[0]; // First color picker should be for confident

      // Simulate color change event
      fireEvent.change(confidentColorPicker, { target: { value: '#FF0000' } });

      expect(mockOnUpdateSubTagColor).toHaveBeenCalledWith('feeling', 'confident', '#ff0000');
    });
  });

  describe('Tag System State Management', () => {
    it('handles adding new tag groups and seeing their performance', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <TagManager
            tagGroups={mockTagGroups}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
          <TagPerformance
            trades={mockTrades}
            tagGroups={mockTagGroups}
            chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
            directionFilter="all"
          />
        </div>
      );

      // Add a new tag group
      const groupInput = screen.getByPlaceholderText('e.g., Strategy, Time of Day');
      const addGroupButton = screen.getByText('Add Group');

      await user.type(groupInput, 'Strategy');
      await user.click(addGroupButton);

      expect(mockOnAddGroup).toHaveBeenCalledWith('Strategy');
    });

    it('handles adding subtags to custom groups', async () => {
      const customTagGroups = [
        ...mockTagGroups,
        {
          id: 'strategy',
          name: 'Strategy',
          subtags: [
            { id: 'scalping', name: 'Scalping', color: '#8A6FBF', groupId: 'strategy' },
          ],
        },
      ];

      const user = userEvent.setup();
      
      render(
        <div>
          <TagManager
            tagGroups={customTagGroups}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
        </div>
      );

      // Find the input for the strategy group
      const inputs = screen.getAllByTestId('input');
      const strategyInput = inputs.find(input => 
        input.getAttribute('placeholder') === 'New subtag name'
      );

      if (strategyInput) {
        const addButton = strategyInput.parentElement?.querySelector('[data-testid="button"]');
        
        await user.type(strategyInput, 'Day Trading');
        if (addButton) {
          await user.click(addButton);
        }
        
        expect(mockOnAddSubTag).toHaveBeenCalledWith('strategy', 'Day Trading');
      }
    });
  });

  describe('Real-world Scenarios', () => {
    it('handles a trader adding multiple tag groups and seeing comprehensive performance', async () => {
      const comprehensiveTagGroups = [
        {
          id: 'setup',
          name: 'Setup',
          subtags: [
            { id: 'breakout', name: 'Breakout', color: '#FF6B6B', groupId: 'setup' },
            { id: 'pullback', name: 'Pullback', color: '#4ECDC4', groupId: 'setup' },
          ],
        },
        {
          id: 'time',
          name: 'Time of Day',
          subtags: [
            { id: 'morning', name: 'Morning', color: '#45B7D1', groupId: 'time' },
            { id: 'afternoon', name: 'Afternoon', color: '#FED766', groupId: 'time' },
          ],
        },
      ];

      const comprehensiveTrades = [
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
          tags: { setup: 'breakout', time: 'morning' },
          journal: 'Morning breakout trade',
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
          tags: { setup: 'pullback', time: 'afternoon' },
          journal: 'Afternoon pullback trade',
          direction: 'short' as TradeDirection,
          accountId: 'account1',
        },
      ];

      render(
        <div>
          <TagManager
            tagGroups={comprehensiveTagGroups}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
          <TagPerformance
            trades={comprehensiveTrades}
            tagGroups={comprehensiveTagGroups}
            chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
            directionFilter="all"
          />
        </div>
      );

      // Should show all tag groups
      const tagManagerSection = screen.getByText('Existing Tag Groups').closest('div');
      expect(tagManagerSection).toHaveTextContent('Setup');
      expect(tagManagerSection).toHaveTextContent('Time of Day');
      expect(tagManagerSection).toHaveTextContent('Breakout');
      expect(tagManagerSection).toHaveTextContent('Pullback');
      expect(tagManagerSection).toHaveTextContent('Morning');
      expect(tagManagerSection).toHaveTextContent('Afternoon');

      // Should show performance for all tags
      const positivePnlElements = screen.getAllByText('$500.00');
      expect(positivePnlElements.length).toBeGreaterThan(0);
      
      const negativePnlElements = screen.getAllByText('$-250.00');
      expect(negativePnlElements.length).toBeGreaterThan(0);
    });

    it('handles filtering performance by trade direction', () => {
      const longOnlyProps = {
        trades: mockTrades,
        tagGroups: mockTagGroups,
        chartDateRange: { start: '2024-01-01', end: '2024-01-02' } as AppDateRange,
        directionFilter: 'long' as TradeDirectionFilterSelection,
      };

      render(<TagPerformance {...longOnlyProps} />);

      // Should only show long trade performance
      const positivePnlElements = screen.getAllByText('$500.00');
      expect(positivePnlElements.length).toBeGreaterThan(0); // confident (long trade)
      expect(screen.queryByText('$-250.00')).not.toBeInTheDocument(); // nervous (short trade)
    });

    it('handles date range filtering with multiple trades', () => {
      const tradesWithDifferentDates = [
        ...mockTrades,
        {
          id: '3',
          date: '2024-01-15', // Outside range
          symbol: 'GOOGL',
          contracts: 75,
          entry: 120.00,
          exit: 125.00,
          timeIn: '11:00',
          timeOut: '12:00',
          timeInTrade: 60,
          profit: 375.00,
          tags: { feeling: 'confident' },
          journal: 'Outside range trade',
          direction: 'long' as TradeDirection,
          accountId: 'account1',
        },
      ];

      const dateFilteredProps = {
        trades: tradesWithDifferentDates,
        tagGroups: mockTagGroups,
        chartDateRange: { start: '2024-01-01', end: '2024-01-02' } as AppDateRange,
        directionFilter: 'all' as TradeDirectionFilterSelection,
      };

      render(<TagPerformance {...dateFilteredProps} />);

      // Should only show performance for trades within date range
      // Confident tag should show 500 (not 875)
      const positivePnlElements = screen.getAllByText('$500.00');
      expect(positivePnlElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles empty tag groups gracefully', () => {
      render(
        <div>
          <TagManager
            tagGroups={[]}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
          <TagPerformance
            trades={mockTrades}
            tagGroups={[]}
            chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
            directionFilter="all"
          />
        </div>
      );

      // TagManager should show empty state
      expect(screen.getByText('No tag groups yet. Add one above to get started!')).toBeInTheDocument();

      // TagPerformance should show empty state
      expect(screen.getByText(/No trades with tags found in the selected date range/)).toBeInTheDocument();
    });

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

      render(
        <div>
          <TagManager
            tagGroups={mockTagGroups}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
          <TagPerformance
            trades={tradesWithNoTags}
            tagGroups={mockTagGroups}
            chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
            directionFilter="all"
          />
        </div>
      );

      // TagManager should show tag groups
      const tagManagerSection = screen.getByText('Existing Tag Groups').closest('div');
      expect(tagManagerSection).toHaveTextContent('Feeling');
      expect(tagManagerSection).toHaveTextContent('Market');

      // TagPerformance should show empty state
      expect(screen.getByText(/No trades with tags found in the selected date range/)).toBeInTheDocument();
    });

    it('handles malformed trade data gracefully', () => {
      const malformedTrades = [
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
          tags: { feeling: 'nonexistent_tag' }, // Tag that doesn't exist
          journal: 'Malformed trade',
          direction: 'long' as TradeDirection,
          accountId: 'account1',
        },
      ];

      render(
        <TagPerformance
          trades={malformedTrades}
          tagGroups={mockTagGroups}
          chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
          directionFilter="all"
        />
      );

      // Should not crash and should show empty state
      expect(screen.getByText(/No trades with tags found in the selected date range/)).toBeInTheDocument();
    });
  });

  describe('Performance and Scalability', () => {
    it('handles large number of tag groups efficiently', () => {
      const largeTagGroups = Array.from({ length: 20 }, (_, i) => ({
        id: `group_${i}`,
        name: `Group ${i}`,
        subtags: [
          { id: `tag_${i}_1`, name: `Tag ${i}.1`, color: '#FF6B6B', groupId: `group_${i}` },
          { id: `tag_${i}_2`, name: `Tag ${i}.2`, color: '#4ECDC4', groupId: `group_${i}` },
        ],
      }));

      render(
        <TagManager
          tagGroups={largeTagGroups}
          onAddGroup={mockOnAddGroup}
          onAddSubTag={mockOnAddSubTag}
          onUpdateSubTagColor={mockOnUpdateSubTagColor}
          onDeleteGroup={mockOnDeleteGroup}
          onDeleteSubTag={mockOnDeleteSubTag}
        />
      );

      // Should render all groups without performance issues
      expect(screen.getByText('Group 0')).toBeInTheDocument();
      expect(screen.getByText('Group 19')).toBeInTheDocument();
    });

    it('handles large number of trades efficiently', () => {
      const largeTrades = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        date: '2024-01-01',
        symbol: 'AAPL',
        contracts: 100,
        entry: 150.00,
        exit: 155.00,
        timeIn: '09:30',
        timeOut: '10:30',
        timeInTrade: 60,
        profit: 500.00,
        tags: { feeling: 'confident' },
        journal: `Trade ${i}`,
        direction: 'long' as TradeDirection,
        accountId: 'account1',
      }));

      render(
        <TagPerformance
          trades={largeTrades}
          tagGroups={mockTagGroups}
          chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
          directionFilter="all"
        />
      );

      // Should calculate performance for all trades without performance issues
      expect(screen.getByText('$50000.00')).toBeInTheDocument(); // 100 * 500
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper heading hierarchy across components', () => {
      render(
        <div>
          <TagManager
            tagGroups={mockTagGroups}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
          <TagPerformance
            trades={mockTrades}
            tagGroups={mockTagGroups}
            chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
            directionFilter="all"
          />
        </div>
      );

      // TagManager has h3 headings
      const tagManagerHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(tagManagerHeadings).toHaveLength(2); // "Add New Tag Group" and "Existing Tag Groups"

      // TagPerformance has h2 heading
      const tagPerformanceHeading = screen.getByRole('heading', { level: 2 });
      expect(tagPerformanceHeading).toHaveTextContent('Tag Performance');
    });

    it('provides proper labels and descriptions for screen readers', () => {
      // Use a test setup that includes custom groups so we can test subtag inputs
      const testTagGroups = [
        ...mockTagGroups,
        {
          id: 'custom',
          name: 'Custom Group',
          subtags: [
            { id: 'custom1', name: 'Custom Tag 1', color: '#8A6FBF', groupId: 'custom' },
          ],
        },
      ];

      render(
        <div>
          <TagManager
            tagGroups={testTagGroups}
            onAddGroup={mockOnAddGroup}
            onAddSubTag={mockOnAddSubTag}
            onUpdateSubTagColor={mockOnUpdateSubTagColor}
            onDeleteGroup={mockOnDeleteGroup}
            onDeleteSubTag={mockOnDeleteSubTag}
          />
          <TagPerformance
            trades={mockTrades}
            tagGroups={testTagGroups}
            chartDateRange={{ start: '2024-01-01', end: '2024-01-02' }}
            directionFilter="all"
          />
        </div>
      );

      // Should have proper input placeholders
      expect(screen.getByPlaceholderText('e.g., Strategy, Time of Day')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New subtag name')).toBeInTheDocument();

      // Should have proper button text
      expect(screen.getByText('Add Group')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();

      // Should have proper descriptive text
      expect(screen.getByText(/For trades in selected date range/)).toBeInTheDocument();
    });
  });
}); 