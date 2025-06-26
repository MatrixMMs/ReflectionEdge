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
  },
  {
    id: 'management',
    name: 'Management',
    subtags: [
      { id: 'fixated_on_idea', name: 'Fixated on idea', color: '#726A95', groupId: 'management' },
      { id: 'retry_2', name: 'Retry 2', color: '#4ECDC4', groupId: 'management' },
      { id: 'retry_3_inf', name: 'Retry 3 ∞', color: '#FED766', groupId: 'management' },
      { id: 'giving_up', name: 'Giving Up', color: '#F2385A', groupId: 'management' },
      { id: 'impulsive', name: 'Impulsive', color: '#F79256', groupId: 'management' },
      { id: 'flip_hit', name: 'Flip Hit', color: '#52D681', groupId: 'management' },
      { id: 'mistake', name: 'Mistake', color: '#FF6B6B', groupId: 'management' },
      { id: 'didnt_see_pattern', name: "Didn't see a pattern", color: '#888888', groupId: 'management' }
    ]
  },
  {
    id: 'read_on_pa',
    name: 'My read on PA',
    subtags: [
      { id: 'clear', name: 'Clear', color: '#A3FF7A', groupId: 'read_on_pa' },
      { id: 'inbetweener', name: 'Inbetweener', color: '#CCCCCC', groupId: 'read_on_pa' },
      { id: 'confused', name: 'Confused', color: '#888888', groupId: 'read_on_pa' }
    ]
  },
  {
    id: 'getting_upset',
    name: 'Are you getting upset?',
    subtags: [
      { id: 'no', name: 'No', color: '#A3FF7A', groupId: 'getting_upset' },
      { id: 'slightly', name: 'Slightly', color: '#FED766', groupId: 'getting_upset' },
      { id: 'pissed_off', name: 'Pissed off', color: '#F2385A', groupId: 'getting_upset' }
    ]
  },
  {
    id: 'ok_with_pnl',
    name: 'Are you ok with your PNL?',
    subtags: [
      { id: 'yes', name: 'Yes', color: '#A3FF7A', groupId: 'ok_with_pnl' },
      { id: 'bothering_me', name: "It's bothering me", color: '#FED766', groupId: 'ok_with_pnl' },
      { id: 'not_okay_with_pnl', name: "I'm not okay with PNL", color: '#F2385A', groupId: 'ok_with_pnl' }
    ]
  },
  {
    id: 'wanting_to_trade_now',
    name: 'Are you wanting to trade NOW?',
    subtags: [
      { id: 'no_desire_to_trade', name: 'No desire to trade', color: '#A3FF7A', groupId: 'wanting_to_trade_now' },
      { id: 'slight_urge_to_trade', name: 'Slight urge to trade', color: '#FED766', groupId: 'wanting_to_trade_now' },
      { id: 'want_to_trade_now', name: 'I want to trade NOW', color: '#F2385A', groupId: 'wanting_to_trade_now' }
    ]
  },
  {
    id: 'entries',
    name: 'Entries',
    subtags: [
      { id: 'perfect_entry', name: 'Perfect Entry', color: '#A3FF7A', groupId: 'entries' },
      { id: 'entry_early', name: 'Entry Early', color: '#FED766', groupId: 'entries' },
      { id: 'entry_late', name: 'Entry Late', color: '#888888', groupId: 'entries' },
      { id: 'entry_should_not_happened', name: 'Entry Should of not happened', color: '#F2385A', groupId: 'entries' }
    ]
  },
  {
    id: 'exits',
    name: 'Exits',
    subtags: [
      { id: 'perfect_exit', name: 'Perfect Exit', color: '#A3FF7A', groupId: 'exits' },
      { id: 'hold_more', name: 'Hold More', color: '#FED766', groupId: 'exits' },
      { id: 'held_2_long', name: 'Held 2 Long', color: '#F2385A', groupId: 'exits' }
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
  },
  {
    id: 'breach_based_strategy',
    name: 'Range to Momo',
    description: 'Trade mean reversion on first breach of support/resistance, then momentum on second breach. Zone-based approach for /ES 10s charts.',
    tags: { setup: ['mean_reversion', 'momentum'] },
    checklist: [
      { id: 'bb_1', item: 'Zone Setup: Clear support and resistance levels identified (5-20 point range)' },
      { id: 'bb_2', item: 'Zone Validation: Zone has held for minimum 10-15 minutes without major breaches' },
      { id: 'bb_3', item: 'Breach Counter: Track number of times each level has been breached (1st vs 2nd)' },
      { id: 'bb_4', item: 'First Breach Entry: Enter mean reversion trade when level is breached for first time' },
      { id: 'bb_5', item: 'Mean Reversion Target: Exit at opposite level (full zone size)' },
      { id: 'bb_6', item: 'Second Breach Entry: Enter momentum trade when same level is breached second time' },
      { id: 'bb_7', item: 'Momentum Target: Exit 2-5 points beyond zone (1.2-1.5x zone size)' },
      { id: 'bb_8', item: 'Stop Loss: Place 5-8 points beyond breached level (0.5-0.8x zone size)' },
      { id: 'bb_9', item: 'Position Sizing: 1-2% risk per trade, adjust for zone size' },
      { id: 'bb_10', item: 'Breach Confirmation: Wait for 2-3 consecutive closes beyond level' },
      { id: 'bb_11', item: 'Volume Check: Higher volume on breach increases conviction' },
      { id: 'bb_12', item: 'Time Filter: Best during 8:30 AM - 3:00 PM CST session hours' },
      { id: 'bb_13', item: 'Reset Conditions: Reset breach count after major news or market structure change' },
      { id: 'bb_14', item: 'Max Trades: Maximum 2-3 trades per zone before reset' }
    ],
    notes: 'Perfect for /ES 10s charts. First breach = mean reversion (expect bounce), second breach = momentum (expect continuation). Zone size determines position sizing and targets. Reset breach counters after major market events.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];