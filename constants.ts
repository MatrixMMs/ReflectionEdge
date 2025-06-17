export const INITIAL_TAG_COLORS: string[] = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FED766', // Yellow
  '#2AB7CA', // Light Blue
  '#F0B67F', // Orange
  '#8A6FBF', // Purple
  '#52D681', // Green
  '#F79256', // Peach
  '#726A95', // Lavender
  '#F2385A', // Bright Red
  '#34D399', // Emerald
];

export const DEFAULT_CHART_COLOR = '#8884d8';
export const COMPARISON_CHART_COLOR = '#82ca9d';
export const LONG_TRADE_COLOR = '#34D399'; // Emerald Green
export const SHORT_TRADE_COLOR = '#F2385A'; // Bright Red

// Default tag groups and their subtags
export const DEFAULT_TAG_GROUPS = [
  {
    id: 'setup',
    name: 'Setup',
    subtags: [
      { id: 'failed_auction', name: 'Failed Auction', color: '#FF6B6B', groupId: 'setup' },
      { id: 'momentum', name: 'Momentum', color: '#4ECDC4', groupId: 'setup' },
      { id: 'stop_runs', name: 'Stop Runs', color: '#45B7D1', groupId: 'setup' },
      { id: 'trend', name: 'Trend', color: '#FED766', groupId: 'setup' },
      { id: 'mean_reversion', name: 'Mean Reversion', color: '#FF00FF', groupId: 'setup' }
    ]
  },
  {
    id: 'market_condition',
    name: 'Market Condition',
    subtags: [
      { id: 'wide_balance', name: 'Wide Balance', color: '#52D681', groupId: 'market_condition' },
      { id: 'trend', name: 'Trend', color: '#F79256', groupId: 'market_condition' },
      { id: 'tight_range', name: 'Tight Range', color: '#8A6FBF', groupId: 'market_condition' },
      { id: 'erratic', name: 'Erratic', color: '#F2385A', groupId: 'market_condition' },
      { id: 'low_volume', name: 'Low Volume', color: '#34D399', groupId: 'market_condition' },
      { id: 'high_volume', name: 'High Volume', color: '#726A95', groupId: 'market_condition' }
    ]
  }
];