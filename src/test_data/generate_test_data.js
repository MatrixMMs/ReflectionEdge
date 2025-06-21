import fs from 'fs';

// This is a simplified version of your constants file for the generator
const DEFAULT_TAG_GROUPS = [
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

const setupTags = DEFAULT_TAG_GROUPS.find(g => g.id === 'setup')?.subtags.map(st => st.id) || [];
const marketConditionTags = DEFAULT_TAG_GROUPS.find(g => g.id === 'market_condition')?.subtags.map(st => st.id) || [];

// Time slots for trading
const timeSlots = [
  { start: '09:30', end: '09:45', description: 'Opening momentum' },
  { start: '10:15', end: '10:25', description: 'Morning session' },
  { start: '11:00', end: '11:20', description: 'Mid-morning' },
  { start: '12:30', end: '12:45', description: 'Lunch time' },
  { start: '13:15', end: '13:30', description: 'Afternoon session' },
  { start: '14:00', end: '14:10', description: 'Mid-afternoon' },
  { start: '14:45', end: '15:00', description: 'End of day' },
  { start: '15:15', end: '15:25', description: 'After hours' },
  { start: '16:00', end: '16:15', description: 'Late session' },
  { start: '16:30', end: '16:40', description: 'Final session' }
];

// Journal entries for different scenarios
const journalEntries = {
  momentum: [
    'Strong opening momentum, followed the trend perfectly',
    'High volume breakout, good execution',
    'Momentum trade worked as expected',
    'Excellent momentum setup'
  ],
  failed_auction: [
    'Failed auction setup, should have waited for better confirmation',
    'Auction failure, poor entry timing',
    'Should have avoided this failed auction',
    'Failed auction pattern, need better confirmation'
  ],
  stop_runs: [
    'Stop run, market was too erratic',
    'Got stopped out by volatility',
    'Stop run pattern, need tighter stops',
    'Market volatility killed the trade'
  ],
  trend: [
    'Trend following trade, worked as expected',
    'Strong trend continuation',
    'Trend trade executed perfectly',
    'Followed the trend successfully'
  ],
  mean_reversion: [
    'Mean reversion trade, good risk management',
    'Reversion to mean worked well',
    'Good mean reversion setup',
    'Mean reversion pattern successful'
  ]
};

function generateTrade(id, date, basePrice) {
  const timeSlot = timeSlots[id % timeSlots.length];
  const setupTag = setupTags[id % setupTags.length];
  const marketTag = marketConditionTags[id % marketConditionTags.length];
  const direction = Math.random() > 0.5 ? 'long' : 'short';
  
  // Generate entry price around base price
  const entryPrice = basePrice + (Math.random() - 0.5) * 20;
  
  // Determine if trade is a win or loss (70% win rate for testing)
  const isWin = Math.random() < 0.7;
  const profit = isWin ? 500 : -150; // 10 points profit or 3 points loss
  
  const exitPrice = direction === 'long' 
    ? entryPrice + (profit / 50) // 50 dollars per point
    : entryPrice - (profit / 50);
  
  const journal = journalEntries[setupTag][id % journalEntries[setupTag].length];
  
  return {
    id: `es_${id.toString().padStart(3, '0')}`,
    date: date,
    symbol: '/ES',
    contracts: 1,
    entry: Math.round(entryPrice * 100) / 100,
    exit: Math.round(exitPrice * 100) / 100,
    timeIn: `${date}T${timeSlot.start}:00`,
    timeOut: `${date}T${timeSlot.end}:00`,
    timeInTrade: parseInt(timeSlot.end.split(':')[1]) - parseInt(timeSlot.start.split(':')[1]) + 
                 (parseInt(timeSlot.end.split(':')[0]) - parseInt(timeSlot.start.split(':')[0])) * 60,
    profit: profit,
    fees: 4.50,
    tags: {
      setup: setupTag,
      market_condition: marketTag
    },
    journal: journal,
    direction: direction,
    accountId: 'futures_acc'
  };
}

function generateAllTrades() {
  const trades = [];
  let basePrice = 4850;
  let tradeId = 1;
  
  // Generate 20 days of trading
  for (let day = 0; day < 20; day++) {
    const date = new Date('2024-01-15');
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate 10 trades per day
    for (let trade = 0; trade < 10; trade++) {
      trades.push(generateTrade(tradeId, dateStr, basePrice));
      tradeId++;
    }
    
    // Slightly adjust base price for next day
    basePrice += (Math.random() - 0.5) * 10;
  }
  
  return trades;
}

const trades = generateAllTrades();

const testData = {
  trades: trades,
  tagGroups: DEFAULT_TAG_GROUPS,
  playbookEntries: [] // Add empty playbook entries for compatibility
};

fs.writeFileSync('src/test_data/es_futures_trades.json', JSON.stringify(testData, null, 2));
console.log('Generated 200 /ES futures trades in src/test_data/es_futures_trades.json'); 