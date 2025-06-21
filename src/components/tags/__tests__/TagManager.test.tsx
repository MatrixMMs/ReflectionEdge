import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagManager } from '../TagManager';
import { TagGroup } from '../../../types';

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
}));

describe('TagManager', () => {
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
    {
      id: 'custom',
      name: 'Custom Group',
      subtags: [
        { id: 'custom1', name: 'Custom Tag 1', color: '#8A6FBF', groupId: 'custom' },
      ],
    },
  ];

  const defaultProps = {
    tagGroups: mockTagGroups,
    onAddGroup: jest.fn(),
    onAddSubTag: jest.fn(),
    onUpdateSubTagColor: jest.fn(),
    onDeleteGroup: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with correct structure', () => {
      render(<TagManager {...defaultProps} />);
      
      expect(screen.getByText('Add New Tag Group')).toBeInTheDocument();
      expect(screen.getByText('Existing Tag Groups')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Strategy, Time of Day')).toBeInTheDocument();
    });

    it('displays all tag groups', () => {
      render(<TagManager {...defaultProps} />);
      
      expect(screen.getByText('Feeling')).toBeInTheDocument();
      expect(screen.getByText('Market')).toBeInTheDocument();
      expect(screen.getByText('Custom Group')).toBeInTheDocument();
    });

    it('shows default indicator for default groups', () => {
      render(<TagManager {...defaultProps} />);
      
      // Should appear twice (for feeling and market groups)
      const defaultIndicators = screen.getAllByText('(Default)');
      expect(defaultIndicators).toHaveLength(2);
    });

    it('displays all subtags with their colors', () => {
      render(<TagManager {...defaultProps} />);
      
      expect(screen.getByText('Confident')).toBeInTheDocument();
      expect(screen.getByText('Nervous')).toBeInTheDocument();
      expect(screen.getByText('Bullish')).toBeInTheDocument();
      expect(screen.getByText('Bearish')).toBeInTheDocument();
      expect(screen.getByText('Custom Tag 1')).toBeInTheDocument();
    });

    it('shows empty state when no tag groups exist', () => {
      render(<TagManager {...defaultProps} tagGroups={[]} />);
      
      expect(screen.getByText('No tag groups yet. Add one above to get started!')).toBeInTheDocument();
    });
  });

  describe('Adding Tag Groups', () => {
    it('calls onAddGroup when Add Group button is clicked with valid input', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('e.g., Strategy, Time of Day');
      const addButton = screen.getByText('Add Group');
      
      await user.type(input, 'New Strategy');
      await user.click(addButton);
      
      expect(defaultProps.onAddGroup).toHaveBeenCalledWith('New Strategy');
    });

    it('clears input after adding a group', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('e.g., Strategy, Time of Day');
      const addButton = screen.getByText('Add Group');
      
      await user.type(input, 'New Strategy');
      await user.click(addButton);
      
      expect(input).toHaveValue('');
    });

    it('does not call onAddGroup with empty or whitespace input', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      const addButton = screen.getByText('Add Group');
      
      // Try with empty input
      await user.click(addButton);
      expect(defaultProps.onAddGroup).not.toHaveBeenCalled();
      
      // Try with whitespace
      const input = screen.getByPlaceholderText('e.g., Strategy, Time of Day');
      await user.type(input, '   ');
      await user.click(addButton);
      expect(defaultProps.onAddGroup).not.toHaveBeenCalled();
    });

    it('trims whitespace from group name', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('e.g., Strategy, Time of Day');
      const addButton = screen.getByText('Add Group');
      
      await user.type(input, '  New Strategy  ');
      await user.click(addButton);
      
      expect(defaultProps.onAddGroup).toHaveBeenCalledWith('New Strategy');
    });
  });

  describe('Adding SubTags', () => {
    it('calls onAddSubTag when Add button is clicked for custom group', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      // Find the input for the custom group
      const inputs = screen.getAllByTestId('input');
      const customGroupInput = inputs.find(input => 
        input.getAttribute('placeholder') === 'New subtag name'
      );
      
      if (customGroupInput) {
        const addButton = customGroupInput.parentElement?.querySelector('[data-testid="button"]');
        
        await user.type(customGroupInput, 'New SubTag');
        if (addButton) {
          await user.click(addButton);
        }
        
        expect(defaultProps.onAddSubTag).toHaveBeenCalledWith('custom', 'New SubTag');
      }
    });

    it('clears subtag input after adding', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      const inputs = screen.getAllByTestId('input');
      const customGroupInput = inputs.find(input => 
        input.getAttribute('placeholder') === 'New subtag name'
      );
      
      if (customGroupInput) {
        const addButton = customGroupInput.parentElement?.querySelector('[data-testid="button"]');
        
        await user.type(customGroupInput, 'New SubTag');
        if (addButton) {
          await user.click(addButton);
        }
        
        expect(customGroupInput).toHaveValue('');
      }
    });

    it('does not show add subtag input for default groups', () => {
      render(<TagManager {...defaultProps} />);
      
      // Should not find inputs for default groups (feeling, market)
      const inputs = screen.getAllByTestId('input');
      const subtagInputs = inputs.filter(input => 
        input.getAttribute('placeholder') === 'New subtag name'
      );
      
      // Should only have one subtag input (for the custom group)
      expect(subtagInputs).toHaveLength(1);
    });
  });

  describe('Updating SubTag Colors', () => {
    it('calls onUpdateSubTagColor when color picker is changed', async () => {
      render(<TagManager {...defaultProps} />);
      
      const colorPickers = screen.getAllByTestId('color-picker');
      const firstColorPicker = colorPickers[0];
      
      // Simulate color change event
      fireEvent.change(firstColorPicker, { target: { value: '#FF0000' } });
      
      expect(defaultProps.onUpdateSubTagColor).toHaveBeenCalledWith('feeling', 'confident', '#ff0000');
    });
  });

  describe('Deleting Tag Groups', () => {
    it('shows delete button only for non-default groups', () => {
      render(<TagManager {...defaultProps} />);
      
      const deleteButtons = screen.getAllByTestId('trash-icon');
      // Should only have one delete button (for the custom group)
      expect(deleteButtons).toHaveLength(1);
    });

    it('calls onDeleteGroup when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      const deleteButton = screen.getByTestId('trash-icon');
      await user.click(deleteButton);
      
      expect(defaultProps.onDeleteGroup).toHaveBeenCalledWith('custom');
    });

    it('does not show delete button for default groups', () => {
      render(<TagManager {...defaultProps} />);
      
      // Check that feeling and market groups don't have delete buttons
      const feelingGroup = screen.getByText('Feeling').closest('.bg-gray-800');
      const marketGroup = screen.getByText('Market').closest('.bg-gray-800');
      
      expect(feelingGroup).not.toContainElement(screen.queryByTestId('trash-icon'));
      expect(marketGroup).not.toContainElement(screen.queryByTestId('trash-icon'));
    });
  });

  describe('Input Validation', () => {
    it('handles empty subtag names', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      const inputs = screen.getAllByTestId('input');
      const customGroupInput = inputs.find(input => 
        input.getAttribute('placeholder') === 'New subtag name'
      );
      
      if (customGroupInput) {
        const addButton = customGroupInput.parentElement?.querySelector('[data-testid="button"]');
        
        // Try with empty input
        if (addButton) {
          await user.click(addButton);
        }
        expect(defaultProps.onAddSubTag).not.toHaveBeenCalled();
        
        // Try with whitespace
        await user.type(customGroupInput, '   ');
        if (addButton) {
          await user.click(addButton);
        }
        expect(defaultProps.onAddSubTag).not.toHaveBeenCalled();
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper input labels and placeholders', () => {
      render(<TagManager {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('e.g., Strategy, Time of Day')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New subtag name')).toBeInTheDocument();
    });

    it('has proper button text', () => {
      render(<TagManager {...defaultProps} />);
      
      expect(screen.getByText('Add Group')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles groups with no subtags', () => {
      const emptyGroup: TagGroup = {
        id: 'empty',
        name: 'Empty Group',
        subtags: [],
      };
      
      render(<TagManager {...defaultProps} tagGroups={[emptyGroup]} />);
      
      expect(screen.getByText('Empty Group')).toBeInTheDocument();
    });

    it('handles special characters in group and subtag names', async () => {
      const user = userEvent.setup();
      render(<TagManager {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('e.g., Strategy, Time of Day');
      const addButton = screen.getByText('Add Group');
      
      await user.type(input, 'Special & Characters!@#');
      await user.click(addButton);
      
      expect(defaultProps.onAddGroup).toHaveBeenCalledWith('Special & Characters!@#');
    });
  });
}); 