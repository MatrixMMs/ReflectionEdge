import fs from 'fs';

// Constants for data generation
const TOTAL_TRADES = 1000;
const TRADES_PER_DAY = 20;
const START_DATE = '2025-01-01';
const INITIAL_PRICE = 5100;
const MAX_LOSS = -500;
const MAX_PROFIT = 2000;
const WIN_RATE = 0.52; // <-- Set to 52%
const SYMBOL = '/ES';
const ACCOUNT_ID = 'futures_acc_large_test';
const OUTPUT_FILENAME = 'src/test_data/ES_futures_1000_trades_test.json';

// Re-using the same tag structure for consistency
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

// Simplified time slots for randomness
const timeSlots = [
  { start: '09:30', duration: 15 }, { start: '10:00', duration: 25 }, { start: '10:30', duration: 10 },
  { start: '11:00', duration: 30 }, { start: '11:45', duration: 15 }, { start: '12:30', duration: 20 },
  { start: '13:00', duration: 45 }, { start: '14:00', duration: 10 }, { start: '14:30', duration: 30 },
  { start: '15:00', duration: 15 }, { start: '15:30', duration: 5 },  { start: '15:45', duration: 10 }
];

// Helper to get a random item from an array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function generateTrade(id, date, basePrice) {
  const timeSlot = getRandomItem(timeSlots);
  const setupTag = getRandomItem(setupTags);
  const marketTag = getRandomItem(marketConditionTags);
  const direction = Math.random() > 0.5 ? 'long' : 'short';
  
  const entryPrice = basePrice + (Math.random() - 0.5) * 30;

  // Updated profit logic to respect the 52% win rate
  const isWin = Math.random() < WIN_RATE;
  const profit = isWin
    ? Math.random() * MAX_PROFIT  // Random profit between 0 and 2000
    : Math.random() * MAX_LOSS;   // Random loss between -500 and 0

  const exitPrice = direction === 'long' 
    ? entryPrice + (profit / 50) // $50 per point for /ES
    : entryPrice - (profit / 50);
  
  const timeIn = new Date(`${date}T${timeSlot.start}:00Z`);
  const timeOut = new Date(timeIn.getTime() + timeSlot.duration * 60000);

  return {
    id: `es_lg_${id.toString().padStart(4, '0')}`,
    date: date,
    symbol: SYMBOL,
    contracts: Math.floor(Math.random() * 5) + 1, // Random contracts from 1 to 5
    entry: Math.round(entryPrice * 100) / 100,
    exit: Math.round(exitPrice * 100) / 100,
    timeIn: timeIn.toISOString(),
    timeOut: timeOut.toISOString(),
    timeInTrade: timeSlot.duration,
    profit: Math.round(profit * 100) / 100,
    fees: 4.50 * (Math.floor(Math.random() * 5) + 1),
    tags: { setup: setupTag, market_condition: marketTag },
    journal: `Randomly generated trade. Setup: ${setupTag}, Market: ${marketTag}.`,
    direction: direction,
    accountId: ACCOUNT_ID
  };
}

function generateAllTrades() {
  const trades = [];
  let basePrice = INITIAL_PRICE;
  let tradeId = 1;
  let currentDate = new Date(`${START_DATE}T12:00:00Z`);

  while (trades.length < TOTAL_TRADES) {
    const dayOfWeek = currentDate.getUTCDay();
    // Skip weekends (Saturday=6, Sunday=0)
    if (dayOfWeek !== 6 && dayOfWeek !== 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const tradesForThisDay = Math.min(TRADES_PER_DAY, TOTAL_TRADES - trades.length);

      for (let i = 0; i < tradesForThisDay; i++) {
        trades.push(generateTrade(tradeId, dateStr, basePrice));
        tradeId++;
      }
      
      basePrice += (Math.random() - 0.5) * 25; // Adjust price for next day
    }
    
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  return trades;
}

const trades = generateAllTrades();
const testData = {
  trades: trades,
  tagGroups: DEFAULT_TAG_GROUPS,
  playbookEntries: []
};

fs.writeFileSync(OUTPUT_FILENAME, JSON.stringify(testData, null, 2));
console.log(`Generated ${TOTAL_TRADES} /ES futures trades in ${OUTPUT_FILENAME}`); 