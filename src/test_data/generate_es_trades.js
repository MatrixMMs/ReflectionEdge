import fs from 'fs';

// ES Futures trading parameters
const TICK_SIZE = 0.25;
const TICK_VALUE = 12.5;
const BASE_PRICE = 4725.00; // Starting price around current ES levels
const TRADING_HOURS = {
  start: 8, // 8:30 AM CST
  end: 15,  // 3:00 PM CST
  timezone: 'CST'
};

// Advanced tag system structure
const ADVANCED_OBJECTIVE_TAGS = {
  'time_session': [
    'rth_open_drive', 'rth_midday_chop', 'rth_close_drive', 
    'pre_market_setup', 'after_hours_activity'
  ],
  'market_structure': [
    'trend_day_open_drive', 'balance_multi_day', 'failed_breakout',
    'gap_rules', 'ib_break', 'poc_acceptance_rejection'
  ],
  'order_flow': [
    'hvn_test', 'lvn_traversal', 'stop_cascade', 'absorption',
    'distribution', 'inside_value'
  ],
  'macro_environment': [
    'pre_fomc_drift', 'post_fomc_volatility', 'major_data_release',
    'fed_speak', 'geopolitical_event'
  ],
  'intermarket_volatility': [
    'vix_spike_collapse', 'low_volatility_grind', 'volatility_expansion'
  ]
};

const ADVANCED_SUBJECTIVE_TAGS = {
  'mental_state': [
    'in_the_zone', 'read_was_clear', 'read_was_unclear', 'confirmation_bias',
    'analysis_paralysis', 'overthinking', 'mental_fatigue'
  ],
  'emotional_response': [
    'calm_collected', 'anxiety_pnl_watching', 'fomo_chase', 'revenge_trading',
    'euphoria', 'fear_missing_out', 'impatience'
  ],
  'execution_process': [
    'followed_plan', 'deviated_from_plan', 'perfect_entry', 'impulsive_entry_no_plan',
    'perfect_exit', 'early_exit', 'held_too_long'
  ]
};

// Legacy tag system for backward compatibility
const LEGACY_TAGS = {
  'setup': ['failed_auction', 'momentum', 'stop_runs', 'trend', 'mean_reversion'],
  'market_condition': ['wide_balance', 'trend', 'tight_range', 'erratic', 'low_volume', 'high_volume'],
  'management': ['fixated_on_idea', 'retry_2', 'retry_3_inf', 'giving_up', 'impulsive', 'flip_hit', 'mistake', 'didnt_see_pattern'],
  'read_on_pa': ['clear', 'inbetweener', 'confused'],
  'getting_upset': ['no', 'slightly', 'pissed_off'],
  'ok_with_pnl': ['yes', 'bothering_me', 'not_okay_with_pnl'],
  'wanting_to_trade_now': ['no_desire_to_trade', 'slight_urge_to_trade', 'want_to_trade_now'],
  'entries': ['perfect_entry', 'entry_early', 'entry_late', 'entry_should_not_happened'],
  'exits': ['perfect_exit', 'hold_more', 'held_2_long']
};

// Strategies
const STRATEGIES = [
  'momentum_strategy', 'mean_reversion_strategy', 'trend_following_strategy',
  'stop_run_strategy', 'failed_auction_strategy'
];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function roundToTick(price) {
  return Math.round(price / TICK_SIZE) * TICK_SIZE;
}

function generateTradeTime(date, isFirstTrade = false) {
  const hour = isFirstTrade ? 
    getRandomInt(8, 9) : 
    getRandomInt(8, 14);
  const minute = getRandomInt(0, 59);
  const second = getRandomInt(0, 59);
  
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, second);
}

function generateTradeDuration() {
  // 5-120 minutes, weighted towards shorter trades
  const weights = [0.4, 0.3, 0.2, 0.1]; // 5-15, 15-30, 30-60, 60-120
  const ranges = [[5, 15], [15, 30], [30, 60], [60, 120]];
  
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return getRandomInt(ranges[i][0], ranges[i][1]);
    }
  }
  return getRandomInt(5, 15);
}

function generatePriceMovement(basePrice, direction, riskRewardRatio = 3) {
  // Generate realistic price movement
  const minTicks = 2; // Minimum 2 ticks movement
  const maxTicks = 20; // Maximum 20 ticks movement
  
  const ticks = getRandomInt(minTicks, maxTicks);
  const tickMovement = ticks * TICK_SIZE;
  
  if (direction === 'long') {
    const exit = basePrice + tickMovement;
    const stop = basePrice - (tickMovement / riskRewardRatio);
    return { entry: basePrice, exit, stop };
  } else {
    const exit = basePrice - tickMovement;
    const stop = basePrice + (tickMovement / riskRewardRatio);
    return { entry: basePrice, exit, stop };
  }
}

function generateTags(winRate, tradeQuality) {
  // Generate legacy tags
  const legacyTags = {};
  Object.keys(LEGACY_TAGS).forEach(group => {
    legacyTags[group] = getRandomElement(LEGACY_TAGS[group]);
  });
  
  // Generate advanced objective tags (2-4 tags)
  const objectiveTags = {};
  const objectiveGroups = getRandomElements(Object.keys(ADVANCED_OBJECTIVE_TAGS), getRandomInt(2, 4));
  objectiveGroups.forEach(group => {
    const tags = getRandomElements(ADVANCED_OBJECTIVE_TAGS[group], getRandomInt(1, 2));
    objectiveTags[group] = tags;
  });
  
  // Generate advanced subjective tags (2-3 tags)
  const subjectiveTags = {};
  const subjectiveGroups = getRandomElements(Object.keys(ADVANCED_SUBJECTIVE_TAGS), getRandomInt(2, 3));
  subjectiveGroups.forEach(group => {
    const tags = getRandomElements(ADVANCED_SUBJECTIVE_TAGS[group], getRandomInt(1, 2));
    subjectiveTags[group] = tags;
  });
  
  return { legacyTags, objectiveTags, subjectiveTags };
}

function generateJournal(direction, profit, tags, strategy) {
  const journals = {
    long: {
      profitable: [
        "Strong momentum trade. Volume confirmed the move and held for full target.",
        "Perfect entry on the pullback. Market structure was clear and followed the plan.",
        "Great setup with clear risk/reward. Executed flawlessly.",
        "Trend following trade with proper position sizing. All checklist items completed."
      ],
      losing: [
        "Got stopped out. Market reversed quickly after entry.",
        "Entered too early without proper confirmation. Need to be more patient.",
        "Poor entry timing. Should have waited for better setup.",
        "Market was choppy and I should have stayed out."
      ]
    },
    short: {
      profitable: [
        "Short setup was clear. Resistance held and price dropped as expected.",
        "Perfect short entry on the rejection. Risk management was spot on.",
        "Bearish momentum confirmed. Held for full target.",
        "Clear distribution pattern. Short worked perfectly."
      ],
      losing: [
        "Short got squeezed. Market continued higher.",
        "Entered short too early. Should have waited for confirmation.",
        "Poor timing on the short. Market was stronger than expected.",
        "Got caught in a short squeeze. Need better entry timing."
      ]
    }
  };
  
  const isProfitable = profit > 0;
  const journalArray = journals[direction][isProfitable ? 'profitable' : 'losing'];
  return getRandomElement(journalArray);
}

function generateExecutionGrade(profit, tags) {
  const isProfitable = profit > 0;
  const hasGoodTags = tags.legacyTags.entries === 'perfect_entry' && tags.legacyTags.exits === 'perfect_exit';
  
  if (isProfitable && hasGoodTags) return 'A+';
  if (isProfitable) return getRandomElement(['A', 'A-', 'B+']);
  if (hasGoodTags) return getRandomElement(['B', 'B-', 'C+']);
  return getRandomElement(['C', 'C-', 'D', 'F']);
}

function generateTrades() {
  const trades = [];
  let currentPrice = BASE_PRICE;
  let tradeId = 1;
  
  // Generate trades for each trading day in 2025
  const startDate = new Date('2025-01-06'); // First Monday of 2025
  const endDate = new Date('2025-12-19'); // Last Friday of 2025
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate 5-20 trades per day
    const tradesPerDay = getRandomInt(5, 20);
    
    for (let i = 0; i < tradesPerDay; i++) {
      const direction = getRandomElement(['long', 'short']);
      const strategy = getRandomElement(STRATEGIES);
      
      // Generate price movement
      const priceData = generatePriceMovement(currentPrice, direction);
      const { entry, exit, stop } = priceData;
      
      // Calculate profit/loss
      const contracts = 1;
      const priceDiff = direction === 'long' ? exit - entry : entry - exit;
      const profit = priceDiff * contracts * (1 / TICK_SIZE) * TICK_VALUE;
      const fees = 4.5; // Standard ES commission
      const netProfit = profit - fees;
      
      // Generate trade time
      const timeIn = generateTradeTime(date, i === 0);
      const duration = generateTradeDuration();
      const timeOut = new Date(timeIn.getTime() + duration * 60000);
      
      // Generate tags based on profit and quality
      const winRate = Math.random();
      const tradeQuality = Math.random();
      const tags = generateTags(winRate, tradeQuality);
      
      // Generate journal entry
      const journal = generateJournal(direction, netProfit, tags, strategy);
      
      // Generate execution grade
      const grade = generateExecutionGrade(netProfit, tags);
      
      // Create trade object
      const trade = {
        id: `es_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}_${String(tradeId).padStart(3, '0')}`,
        date: date.toISOString().split('T')[0],
        symbol: 'ES',
        contracts,
        entry: roundToTick(entry),
        exit: roundToTick(exit),
        timeIn: timeIn.toISOString(),
        timeOut: timeOut.toISOString(),
        timeInTrade: duration,
        profit: netProfit,
        fees,
        direction,
        strategyId: strategy,
        accountId: 'main_account',
        tags: tags.legacyTags,
        objectiveTags: tags.objectiveTags,
        subjectiveTags: tags.subjectiveTags,
        journal,
        execution: {
          checklist: {
            // Generate random checklist completion
            'check_1': Math.random() > 0.3,
            'check_2': Math.random() > 0.3,
            'check_3': Math.random() > 0.3,
            'check_4': Math.random() > 0.3,
            'check_5': Math.random() > 0.3
          },
          grade,
          notes: `Trade executed with ${grade} grade. ${netProfit > 0 ? 'Profitable trade.' : 'Losing trade.'}`
        },
        isBestTrade: false,
        isWorstTrade: false,
        extendedReflection: {
          mindset: netProfit > 0 ? 'Focused and patient' : 'Rushed and impatient',
          setup: direction === 'long' ? 'Long setup with momentum' : 'Short setup with resistance',
          riskManagement: 'Proper position sizing and stop placement',
          lessons: netProfit > 0 ? 'Good execution leads to good results' : 'Need to improve entry timing',
          marketContext: 'Standard market conditions'
        }
      };
      
      trades.push(trade);
      currentPrice = exit; // Update current price for next trade
      tradeId++;
      
      // Stop if we've reached 2000 trades
      if (trades.length >= 2000) break;
    }
    
    if (trades.length >= 2000) break;
  }
  
  return trades;
}

// Generate the trades
console.log('Generating 2000 ES futures trades...');
const trades = generateTrades();

// Write to file - output only the array, not wrapped in an object
fs.writeFileSync('es_futures_trades_2000.json', JSON.stringify(trades, null, 2));
console.log(`Generated ${trades.length} trades and saved to es_futures_trades_2000.json`);

// Print some statistics
const profitableTrades = trades.filter(t => t.profit > 0).length;
const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
const avgProfit = totalProfit / trades.length;
const winRate = profitableTrades / trades.length;

console.log('\nTrade Statistics:');
console.log(`Total Trades: ${trades.length}`);
console.log(`Profitable Trades: ${profitableTrades}`);
console.log(`Win Rate: ${(winRate * 100).toFixed(1)}%`);
console.log(`Total P&L: $${totalProfit.toFixed(2)}`);
console.log(`Average P&L per Trade: $${avgProfit.toFixed(2)}`); 