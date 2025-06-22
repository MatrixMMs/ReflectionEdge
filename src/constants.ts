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

// Default playbook strategies with detailed checklists
export const DEFAULT_PLAYBOOK_ENTRIES = [
  {
    id: 'mean_reversion_strategy',
    name: 'Mean Reversion Setup',
    description: 'Trade reversals when price moves too far from the mean, expecting a return to equilibrium.',
    tags: { setup: ['mean_reversion'] },
    checklist: [
      { id: 'mr_1', item: 'Price has moved 2+ standard deviations from VWAP/20 EMA' },
      { id: 'mr_2', item: 'RSI is oversold (>70) or oversold (<30)' },
      { id: 'mr_3', item: 'Volume is declining on the extreme move' },
      { id: 'mr_4', item: 'Waiting for first pullback/retracement candle' },
      { id: 'mr_5', item: 'Stop loss placed beyond the extreme level' },
      { id: 'mr_6', item: 'Position size is 1-2% of account' },
      { id: 'mr_7', item: 'Target is at least 1:2 risk/reward ratio' },
      { id: 'mr_8', item: 'Market is not in strong trending condition' }
    ],
    notes: 'Best in ranging markets. Avoid during strong trends or news events.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'momentum_strategy',
    name: 'Momentum Breakout',
    description: 'Trade breakouts with strong momentum, following the direction of the move.',
    tags: { setup: ['momentum'] },
    checklist: [
      { id: 'mom_1', item: 'Price has broken above/below key resistance/support level' },
      { id: 'mom_2', item: 'Volume is significantly higher than average' },
      { id: 'mom_3', item: 'RSI is between 40-60 (not overbought/oversold)' },
      { id: 'mom_4', item: 'Waiting for pullback to broken level for entry' },
      { id: 'mom_5', item: 'Stop loss placed below/above the breakout level' },
      { id: 'mom_6', item: 'Position size is 1-2% of account' },
      { id: 'mom_7', item: 'Target is at least 1:2 risk/reward ratio' },
      { id: 'mom_8', item: 'No major resistance/support levels nearby' }
    ],
    notes: 'Strongest during first 30 minutes of session. Avoid late in day.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'trend_following_strategy',
    name: 'Trend Following',
    description: 'Trade in the direction of the established trend using pullbacks for entries.',
    tags: { setup: ['trend'] },
    checklist: [
      { id: 'tf_1', item: 'Higher timeframe shows clear trend direction' },
      { id: 'tf_2', item: 'Price is above/below 20 EMA on multiple timeframes' },
      { id: 'tf_3', item: 'Waiting for pullback to 20 EMA or trendline' },
      { id: 'tf_4', item: 'Volume confirms trend direction' },
      { id: 'tf_5', item: 'Stop loss placed below/above recent swing low/high' },
      { id: 'tf_6', item: 'Position size is 1-2% of account' },
      { id: 'tf_7', item: 'Target is at least 1:2 risk/reward ratio' },
      { id: 'tf_8', item: 'No counter-trend signals on higher timeframes' }
    ],
    notes: 'Most reliable during trending market conditions. Use multiple timeframes.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stop_run_strategy',
    name: 'Stop Run Setup',
    description: 'Trade the reversal after stops are taken out, expecting a quick reversal.',
    tags: { setup: ['stop_runs'] },
    checklist: [
      { id: 'sr_1', item: 'Clear support/resistance level has been broken' },
      { id: 'sr_2', item: 'Volume spike on the break (stop hunt)' },
      { id: 'sr_3', item: 'Price quickly reverses back through the level' },
      { id: 'sr_4', item: 'Waiting for confirmation candle after reversal' },
      { id: 'sr_5', item: 'Stop loss placed beyond the extreme of the stop run' },
      { id: 'sr_6', item: 'Position size is 0.5-1% of account (higher risk)' },
      { id: 'sr_7', item: 'Target is at least 1:1.5 risk/reward ratio' },
      { id: 'sr_8', item: 'Market is not in strong trending condition' }
    ],
    notes: 'High risk, high reward. Best in ranging markets. Quick exits.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'failed_auction_strategy',
    name: 'Failed Auction (Orderflow)',
    description: 'Trade the rejection when price fails to hold above/below key auction levels, confirmed with orderflow.',
    tags: { setup: ['failed_auction'] },
    checklist: [
      { id: 'fa_of_1', item: 'Market Context: Is the market in a clear range or balanced state?' },
      { id: 'fa_of_2', item: 'Key Level Identified: Significant level (PDH/L, VAH/VAL, POC) is clear.' },
      { id: 'fa_of_3', item: 'Initial Break: Price moved decisively through the key level.' },
      { id: 'fa_of_4', item: 'Absorption Check: Volume spiked at the level, indicating absorption.' },
      { id: 'fa_of_5', item: 'Delta Divergence: Clear divergence between price and delta on the move.' },
      { id: 'fa_of_6', item: 'Failed Hold: Price was quickly rejected back through the level.' },
      { id: 'fa_of_7', item: 'Confirmation Entry: Waited for a confirmation candle (e.g., engulfing) back inside the range.' },
      { id: 'fa_of_8', item: 'Stop Placement: Stop loss is just beyond the extreme of the failed auction.' }
    ],
    notes: 'Requires orderflow tools (footprint, delta). Best during RTH. High conviction setup.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];