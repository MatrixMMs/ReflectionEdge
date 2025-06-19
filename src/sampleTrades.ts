import { Trade } from './types';

export const sampleTrades: Omit<Trade, 'id' | 'timeInTrade'>[] = [
  // Morning trades (9-11 AM) - Good performance
  {
    date: '2024-01-15',
    symbol: 'AAPL',
    contracts: 100,
    entry: 150.00,
    exit: 152.50,
    timeIn: '2024-01-15T09:30:00',
    timeOut: '2024-01-15T10:15:00',
    profit: 250,
    tags: { setup: 'momentum', market_condition: 'trend' },
    journal: 'Strong momentum trade, followed the trend well',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-16',
    symbol: 'TSLA',
    contracts: 50,
    entry: 240.00,
    exit: 245.00,
    timeIn: '2024-01-16T09:45:00',
    timeOut: '2024-01-16T10:30:00',
    profit: 250,
    tags: { setup: 'momentum', market_condition: 'high_volume' },
    journal: 'High volume breakout, good execution',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-17',
    symbol: 'NVDA',
    contracts: 75,
    entry: 480.00,
    exit: 485.00,
    timeIn: '2024-01-17T10:00:00',
    timeOut: '2024-01-17T10:45:00',
    profit: 375,
    tags: { setup: 'trend', market_condition: 'trend' },
    journal: 'Trend following trade, worked as expected',
    direction: 'long',
    accountId: 'acc1'
  },

  // Mid-day trades (11 AM - 2 PM) - Mixed performance
  {
    date: '2024-01-15',
    symbol: 'MSFT',
    contracts: 80,
    entry: 380.00,
    exit: 378.00,
    timeIn: '2024-01-15T11:30:00',
    timeOut: '2024-01-15T12:15:00',
    profit: -160,
    tags: { setup: 'failed_auction', market_condition: 'tight_range' },
    journal: 'Failed auction setup, should have waited for better confirmation',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-16',
    symbol: 'GOOGL',
    contracts: 60,
    entry: 140.00,
    exit: 142.00,
    timeIn: '2024-01-16T12:00:00',
    timeOut: '2024-01-16T12:45:00',
    profit: 120,
    tags: { setup: 'mean_reversion', market_condition: 'wide_balance' },
    journal: 'Mean reversion trade, good risk management',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-17',
    symbol: 'META',
    contracts: 90,
    entry: 320.00,
    exit: 318.00,
    timeIn: '2024-01-17T13:00:00',
    timeOut: '2024-01-17T13:30:00',
    profit: -180,
    tags: { setup: 'stop_runs', market_condition: 'erratic' },
    journal: 'Stop run, market was too erratic',
    direction: 'long',
    accountId: 'acc1'
  },

  // Afternoon trades (2-4 PM) - Poor performance
  {
    date: '2024-01-15',
    symbol: 'AMZN',
    contracts: 70,
    entry: 150.00,
    exit: 148.00,
    timeIn: '2024-01-15T14:30:00',
    timeOut: '2024-01-15T15:15:00',
    profit: -140,
    tags: { setup: 'failed_auction', market_condition: 'low_volume' },
    journal: 'Low volume afternoon trade, poor execution',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-16',
    symbol: 'NFLX',
    contracts: 55,
    entry: 480.00,
    exit: 475.00,
    timeIn: '2024-01-16T15:00:00',
    timeOut: '2024-01-16T15:45:00',
    profit: -275,
    tags: { setup: 'stop_runs', market_condition: 'erratic' },
    journal: 'Afternoon volatility killed the trade',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-17',
    symbol: 'AMD',
    contracts: 85,
    entry: 120.00,
    exit: 118.00,
    timeIn: '2024-01-17T14:00:00',
    timeOut: '2024-01-17T14:30:00',
    profit: -170,
    tags: { setup: 'failed_auction', market_condition: 'low_volume' },
    journal: 'Another poor afternoon trade',
    direction: 'long',
    accountId: 'acc1'
  },

  // Pre-market trades (6-9 AM) - Good performance
  {
    date: '2024-01-18',
    symbol: 'SPY',
    contracts: 200,
    entry: 450.00,
    exit: 452.00,
    timeIn: '2024-01-18T06:30:00',
    timeOut: '2024-01-18T07:15:00',
    profit: 400,
    tags: { setup: 'momentum', market_condition: 'high_volume' },
    journal: 'Pre-market momentum trade, excellent execution',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-19',
    symbol: 'QQQ',
    contracts: 150,
    entry: 380.00,
    exit: 382.00,
    timeIn: '2024-01-19T07:00:00',
    timeOut: '2024-01-19T07:45:00',
    profit: 300,
    tags: { setup: 'trend', market_condition: 'trend' },
    journal: 'Pre-market trend trade, worked well',
    direction: 'long',
    accountId: 'acc1'
  },

  // After hours trades (4-6 PM) - Mixed performance
  {
    date: '2024-01-18',
    symbol: 'IWM',
    contracts: 100,
    entry: 180.00,
    exit: 181.00,
    timeIn: '2024-01-18T16:30:00',
    timeOut: '2024-01-18T17:15:00',
    profit: 100,
    tags: { setup: 'mean_reversion', market_condition: 'wide_balance' },
    journal: 'After hours mean reversion, good setup',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-19',
    symbol: 'DIA',
    contracts: 80,
    entry: 350.00,
    exit: 349.00,
    timeIn: '2024-01-19T16:00:00',
    timeOut: '2024-01-19T16:45:00',
    profit: -80,
    tags: { setup: 'stop_runs', market_condition: 'erratic' },
    journal: 'After hours volatility',
    direction: 'long',
    accountId: 'acc1'
  },

  // Different days of the week
  {
    date: '2024-01-22', // Monday
    symbol: 'AAPL',
    contracts: 100,
    entry: 155.00,
    exit: 157.00,
    timeIn: '2024-01-22T09:30:00',
    timeOut: '2024-01-22T10:15:00',
    profit: 200,
    tags: { setup: 'momentum', market_condition: 'trend' },
    journal: 'Monday momentum trade',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-23', // Tuesday
    symbol: 'TSLA',
    contracts: 50,
    entry: 245.00,
    exit: 248.00,
    timeIn: '2024-01-23T09:45:00',
    timeOut: '2024-01-23T10:30:00',
    profit: 150,
    tags: { setup: 'trend', market_condition: 'high_volume' },
    journal: 'Tuesday trend trade',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-24', // Wednesday
    symbol: 'NVDA',
    contracts: 75,
    entry: 485.00,
    exit: 482.00,
    timeIn: '2024-01-24T10:00:00',
    timeOut: '2024-01-24T10:45:00',
    profit: -225,
    tags: { setup: 'failed_auction', market_condition: 'erratic' },
    journal: 'Wednesday failed trade',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-25', // Thursday
    symbol: 'MSFT',
    contracts: 80,
    entry: 385.00,
    exit: 388.00,
    timeIn: '2024-01-25T09:30:00',
    timeOut: '2024-01-25T10:15:00',
    profit: 240,
    tags: { setup: 'momentum', market_condition: 'trend' },
    journal: 'Thursday momentum trade',
    direction: 'long',
    accountId: 'acc1'
  },
  {
    date: '2024-01-26', // Friday
    symbol: 'GOOGL',
    contracts: 60,
    entry: 145.00,
    exit: 143.00,
    timeIn: '2024-01-26T10:00:00',
    timeOut: '2024-01-26T10:45:00',
    profit: -120,
    tags: { setup: 'stop_runs', market_condition: 'low_volume' },
    journal: 'Friday poor trade',
    direction: 'long',
    accountId: 'acc1'
  },

  // Short trades for variety
  {
    date: '2024-01-20',
    symbol: 'SPY',
    contracts: 100,
    entry: 455.00,
    exit: 453.00,
    timeIn: '2024-01-20T09:30:00',
    timeOut: '2024-01-20T10:15:00',
    profit: 200,
    tags: { setup: 'mean_reversion', market_condition: 'wide_balance' },
    journal: 'Short mean reversion trade',
    direction: 'short',
    accountId: 'acc1'
  },
  {
    date: '2024-01-21',
    symbol: 'QQQ',
    contracts: 75,
    entry: 385.00,
    exit: 387.00,
    timeIn: '2024-01-21T11:00:00',
    timeOut: '2024-01-21T11:45:00',
    profit: -150,
    tags: { setup: 'failed_auction', market_condition: 'tight_range' },
    journal: 'Short trade gone wrong',
    direction: 'short',
    accountId: 'acc1'
  }
]; 