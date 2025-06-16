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
    id: 'feeling',
    name: 'How do you feel?',
    subtags: [
      { id: 'calm', name: 'Calm', color: '#4ECDC4', groupId: 'feeling' },
      { id: 'anxious', name: 'Anxious', color: '#FF6B6B', groupId: 'feeling' },
      { id: 'focused', name: 'Focused', color: '#45B7D1', groupId: 'feeling' },
      { id: 'greedy', name: 'Greedy', color: '#FED766', groupId: 'feeling' },
      { id: 'angry', name: 'Angry', color: '#F2385A', groupId: 'feeling' },
      { id: 'scared', name: 'Scared', color: '#8A6FBF', groupId: 'feeling' },
    ]
  },
  {
    id: 'market',
    name: 'Was the market clear?',
    subtags: [
      { id: 'clear', name: 'Clear', color: '#52D681', groupId: 'market' },
      { id: 'confused', name: 'Confused', color: '#F79256', groupId: 'market' },
    ]
  }
];