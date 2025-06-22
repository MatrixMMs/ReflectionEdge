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

const TICK_SIZE = 0.25;
const TICK_VALUE = 12.50;

/**
 * Generates a random time within the 8:30 AM - 3:00 PM CST window.
 * @param {Date} date The date for which to generate the time.
 * @returns {object} An object containing timeIn, timeOut, and durationInMinutes.
 */
function generateRandomTime(date) {
  // Trading hours: 8:30 AM to 3:00 PM CST.
  const startHour = 8;
  const startMinute = 30;
  const endHour = 15;

  const tradeDate = new Date(date);
  
  // Create start and end times in local timezone equivalent to CST
  // This is a simplification; for production, a library like moment-timezone would be better.
  const startTime = new Date(tradeDate.setHours(startHour, startMinute, 0, 0));
  const endTime = new Date(tradeDate.setHours(endHour, 0, 0, 0));

  const tradeableMilliseconds = endTime.getTime() - startTime.getTime();

  // Random start time within the window
  const randomStartOffset = Math.random() * tradeableMilliseconds;
  const timeIn = new Date(startTime.getTime() + randomStartOffset);

  // Random duration (5 to 45 mins)
  const durationInMinutes = Math.floor(Math.random() * 40) + 5;
  const timeOut = new Date(timeIn.getTime() + durationInMinutes * 60 * 1000);

  // Ensure trade doesn't go past market close
  if (timeOut > endTime) {
    timeOut.setTime(endTime.getTime());
  }

  return { timeIn, timeOut, durationInMinutes };
}

function generateTrade(id, date, basePrice) {
  const setupTag = setupTags[id % setupTags.length];
  const marketTag = marketConditionTags[id % marketConditionTags.length];
  const direction = Math.random() > 0.5 ? 'long' : 'short';
  
  // Generate entry price and snap to tick size
  const rawEntryPrice = basePrice + (Math.random() - 0.5) * 20;
  const entryPrice = Math.round(rawEntryPrice / TICK_SIZE) * TICK_SIZE;

  // Determine if trade is a win or loss and the number of ticks
  const isWin = Math.random() < 0.7;
  const tickMove = isWin 
    ? (Math.floor(Math.random() * 40) + 10) // Winning trade moves 10-50 ticks
    : -(Math.floor(Math.random() * 12) + 4); // Losing trade moves 4-16 ticks

  const exitPrice = entryPrice + (tickMove * TICK_SIZE * (direction === 'long' ? 1 : -1));
  
  const profit = tickMove * TICK_VALUE;
  
  const journal = journalEntries[setupTag][id % journalEntries[setupTag].length];
  const { timeIn, timeOut, durationInMinutes } = generateRandomTime(date);
  
  return {
    id: `es_${id.toString().padStart(4, '0')}`,
    date: date,
    symbol: '/ES',
    contracts: 1,
    entry: entryPrice,
    exit: exitPrice,
    timeIn: timeIn.toISOString(),
    timeOut: timeOut.toISOString(),
    timeInTrade: durationInMinutes,
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
  const startDate = new Date('2024-01-01');
  let currentDate = new Date(startDate);
  
  while (trades.length < 1000) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (Sunday=0, Saturday=6)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const tradesPerDay = Math.floor(Math.random() * 10) + 8; // Generate 8-18 trades per day
      for (let i = 0; i < tradesPerDay && trades.length < 1000; i++) {
        trades.push(generateTrade(tradeId, dateStr, basePrice));
        tradeId++;
      }
    }
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
    
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
console.log(`Generated ${trades.length} /ES futures trades in src/test_data/es_futures_trades.json`); 