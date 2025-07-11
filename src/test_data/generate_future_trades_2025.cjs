const fs = require('fs');

const symbols = ['AAPL', 'MSFT', 'ES', 'NQ', 'TSLA', 'AMZN', 'GOOG', 'META', 'NFLX', 'NVDA'];
const strategies = ['strat1', 'strat2', 'strat3', 'strat4'];
const directions = ['long', 'short'];
const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', null];
const checklistIds = ['chk1', 'chk2', 'chk3'];

// Hardcoded real tag groups and tag IDs from the app
const objTagGroups = [
  { id: 'macro_environment', tags: ['pre_fomc_drift', 'post_fomc_volatility', 'major_data_release', 'fed_speak', 'geopolitical_event', 'fomc', 'nfp', 'gdp', 'eom_rebalance', 'cpi'] },
  { id: 'time_session', tags: ['globex_session', 'london_open_crossover', 'pre_market', 'rth_open_drive', 'rth_mid_day_chop', 'rth_closing_hour', 'opening_range_breakout', 'first_hour_high_low', 'morning_reversal', 'midday_fade', 'vwap_test_morning', 'vwap_test_afternoon', 'lunchtime_chop', 'afternoon_trend', 'closing_ramp', 'end_of_day_reversal', 'pre_news_pause', 'post_news_volatility', 'opex', 'vixex', 'mopex'] },
  { id: 'market_structure', tags: ['inside_value', 'outside_value', 'value_area_migration', 'p_shaped_profile', 'b_shaped_profile', 'balance', 'multi_day_balance', 'trend_day_open_drive', 'failed_breakout', 'gap_rules', 'ib_break', 'poc_acceptance_rejection', 'opening_range_breakout'] }
];
const subjTagGroups = [
  { id: 'mental_state', tags: ['focused', 'distracted', 'confident', 'hesitant', 'overtrading', 'in_flow', 'fatigued'] },
  { id: 'emotional_state', tags: ['calm', 'anxious', 'excited', 'fearful', 'frustrated', 'greedy', 'disciplined'] },
  { id: 'execution_quality', tags: ['perfect_execution', 'late_entry', 'early_exit', 'missed_trade', 'chased', 'hesitated', 'followed_plan'] }
];

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date;
}

function pad(n) { return n < 10 ? '0' + n : n; }

function pickRandom(arr, n = 1) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function randomTrade(i) {
  const dateObj = randomDate(new Date('2025-01-01'), new Date('2025-06-30'));
  const date = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const contracts = Math.floor(Math.random() * 10) + 1;
  const entry = +(Math.random() * 500 + 10).toFixed(2);
  const exit = +(entry + (Math.random() - 0.5) * 10).toFixed(2);
  const timeIn = `${date}T${pad(Math.floor(Math.random() * 8) + 9)}:${pad(Math.floor(Math.random() * 60))}:00.000Z`;
  const timeOut = `${date}T${pad(Math.floor(Math.random() * 8) + 10)}:${pad(Math.floor(Math.random() * 60))}:00.000Z`;
  const timeInTrade = Math.floor((new Date(timeOut).getTime() - new Date(timeIn).getTime()) / (1000 * 60));
  const profit = +((exit - entry) * contracts).toFixed(2);
  const fees = +(Math.random() * 5).toFixed(2);
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const strategyId = strategies[Math.floor(Math.random() * strategies.length)];
  const accountId = 'default';
  const execution = {
    checklist: Object.fromEntries(checklistIds.map(id => [id, Math.random() > 0.5])),
    grade: grades[Math.floor(Math.random() * grades.length)],
    notes: 'Auto-generated trade.'
  };
  const isBestTrade = Math.random() < 0.1;
  const isWorstTrade = !isBestTrade && Math.random() < 0.1;
  const extendedReflection = (isBestTrade || isWorstTrade) ? {
    mindset: 'Auto-generated mindset',
    setup: 'Auto-generated setup',
    riskManagement: 'Auto-generated risk',
    lessons: 'Auto-generated lesson',
    marketContext: 'Auto-generated context'
  } : undefined;
  // Assign 1-2 random tags from each group
  const objectiveTags = Object.fromEntries(objTagGroups.map(g => [g.id, pickRandom(g.tags, Math.random() < 0.5 ? 1 : 2)]));
  const subjectiveTags = Object.fromEntries(subjTagGroups.map(g => [g.id, pickRandom(g.tags, Math.random() < 0.5 ? 1 : 2)]));
  return {
    id: `trade-${i}-${dateObj.getTime()}`,
    date,
    symbol,
    contracts,
    entry,
    exit,
    timeIn,
    timeOut,
    timeInTrade,
    profit,
    fees,
    objectiveTags,
    subjectiveTags,
    journal: 'Auto-generated journal entry.',
    direction,
    strategyId,
    accountId,
    execution,
    ...(isBestTrade ? { isBestTrade: true } : {}),
    ...(isWorstTrade ? { isWorstTrade: true } : {}),
    ...(extendedReflection ? { extendedReflection } : {})
  };
}

const trades = Array.from({ length: 100 }, (_, i) => randomTrade(i + 1));
fs.writeFileSync('future_trades_2025.json', JSON.stringify(trades, null, 2), 'utf-8');
console.log('Generated 100 future trades to future_trades_2025.json'); 