import { Trade } from './types';

export const sampleTrades: Trade[] = [
  {
    id: '1',
    date: '2024-01-15',
    symbol: 'ES',
    contracts: 2,
    entry: 4850.50,
    exit: 4855.75,
    timeIn: '2024-01-15T09:30:00.000Z',
    timeOut: '2024-01-15T09:45:00.000Z',
    timeInTrade: 15,
    profit: 1050,
    journal: 'Mean reversion setup worked perfectly. Price was 2.5 std devs from VWAP and RSI was at 25. Clean reversal.',
    direction: 'long',
    tags: { setup: 'mean_reversion' },
    strategyId: 'mean_reversion_strategy',
    accountId: 'default',
    execution: {
      checklist: {
        'mr_1': true,
        'mr_2': true,
        'mr_3': true,
        'mr_4': true,
        'mr_5': true,
        'mr_6': true,
        'mr_7': true,
        'mr_8': true
      },
      grade: 'A+',
      notes: 'Perfect execution - followed all checklist items'
    }
  },
  {
    id: '2',
    date: '2024-01-16',
    symbol: 'ES',
    contracts: 1,
    entry: 4865.25,
    exit: 4860.50,
    timeIn: '2024-01-16T09:15:00.000Z',
    timeOut: '2024-01-16T09:25:00.000Z',
    timeInTrade: 10,
    profit: -475,
    journal: 'Momentum breakout failed. Volume wasn\'t strong enough and price reversed quickly.',
    direction: 'long',
    tags: { setup: 'momentum' },
    strategyId: 'momentum_strategy',
    accountId: 'default',
    execution: {
      checklist: {
        'mom_1': true,
        'mom_2': false,
        'mom_3': true,
        'mom_4': true,
        'mom_5': true,
        'mom_6': true,
        'mom_7': false,
        'mom_8': true
      },
      grade: 'B-',
      notes: 'Good execution but missed volume confirmation and risk/reward'
    }
  },
  {
    id: '3',
    date: '2024-01-17',
    symbol: 'ES',
    contracts: 3,
    entry: 4875.00,
    exit: 4885.50,
    timeIn: '2024-01-17T10:00:00.000Z',
    timeOut: '2024-01-17T10:30:00.000Z',
    timeInTrade: 30,
    profit: 3150,
    journal: 'Trend following setup. Clear uptrend on 5min and 15min charts. Pullback to 20 EMA provided perfect entry.',
    direction: 'long',
    tags: { setup: 'trend' },
    strategyId: 'trend_following_strategy',
    accountId: 'default',
    execution: {
      checklist: {
        'tf_1': true,
        'tf_2': true,
        'tf_3': true,
        'tf_4': true,
        'tf_5': true,
        'tf_6': true,
        'tf_7': true,
        'tf_8': true
      },
      grade: 'A+',
      notes: 'Excellent trend following execution'
    }
  },
  {
    id: '4',
    date: '2024-01-18',
    symbol: 'ES',
    contracts: 1,
    entry: 4880.75,
    exit: 4875.25,
    timeIn: '2024-01-18T09:45:00.000Z',
    timeOut: '2024-01-18T09:50:00.000Z',
    timeInTrade: 5,
    profit: -550,
    journal: 'Stop run setup. Price broke support but didn\'t reverse as expected. Market was too strong.',
    direction: 'long',
    tags: { setup: 'stop_runs' },
    strategyId: 'stop_run_strategy',
    accountId: 'default',
    execution: {
      checklist: {
        'sr_1': true,
        'sr_2': true,
        'sr_3': false,
        'sr_4': false,
        'sr_5': true,
        'sr_6': true,
        'sr_7': false,
        'sr_8': false
      },
      grade: 'C-',
      notes: 'Poor execution - didn\'t wait for proper reversal confirmation'
    }
  },
  {
    id: '5',
    date: '2024-01-19',
    symbol: 'ES',
    contracts: 2,
    entry: 4890.00,
    exit: 4885.75,
    timeIn: '2024-01-19T09:30:00.000Z',
    timeOut: '2024-01-19T09:40:00.000Z',
    timeInTrade: 10,
    profit: -850,
    journal: 'Failed auction setup. Price failed to hold above VAH but my entry was too early.',
    direction: 'short',
    tags: { setup: 'failed_auction' },
    strategyId: 'failed_auction_strategy',
    accountId: 'default',
    execution: {
      checklist: {
        'fa_1': true,
        'fa_2': true,
        'fa_3': true,
        'fa_4': false,
        'fa_5': true,
        'fa_6': true,
        'fa_7': true,
        'fa_8': true
      },
      grade: 'B-',
      notes: 'Good setup but entered before proper confirmation'
    }
  },
  {
    id: '6',
    date: '2024-01-22',
    symbol: 'ES',
    contracts: 1,
    entry: 4875.50,
    exit: 4880.25,
    timeIn: '2024-01-22T09:20:00.000Z',
    timeOut: '2024-01-22T09:35:00.000Z',
    timeInTrade: 15,
    profit: 475,
    journal: 'Mean reversion trade. RSI was at 75 and price was extended from VWAP. Clean reversal.',
    direction: 'short',
    tags: { setup: 'mean_reversion' },
    strategyId: 'mean_reversion_strategy',
    accountId: 'default',
    execution: {
      checklist: {
        'mr_1': true,
        'mr_2': true,
        'mr_3': true,
        'mr_4': true,
        'mr_5': true,
        'mr_6': true,
        'mr_7': true,
        'mr_8': true
      },
      grade: 'A+',
      notes: 'Perfect mean reversion execution'
    }
  },
  {
    id: '7',
    date: '2024-01-23',
    symbol: 'ES',
    contracts: 2,
    entry: 4885.00,
    exit: 4895.50,
    timeIn: '2024-01-23T09:30:00.000Z',
    timeOut: '2024-01-23T09:50:00.000Z',
    timeInTrade: 20,
    profit: 2100,
    journal: 'Momentum breakout with strong volume. Price broke resistance and never looked back.',
    direction: 'long',
    tags: { setup: 'momentum' },
    strategyId: 'momentum_strategy',
    accountId: 'default',
    execution: {
      checklist: {
        'mom_1': true,
        'mom_2': true,
        'mom_3': true,
        'mom_4': true,
        'mom_5': true,
        'mom_6': true,
        'mom_7': true,
        'mom_8': true
      },
      grade: 'A+',
      notes: 'Excellent momentum breakout execution'
    }
  },
  {
    id: '8',
    date: '2024-01-24',
    symbol: 'ES',
    contracts: 1,
    entry: 4890.25,
    exit: 4885.00,
    timeIn: '2024-01-24T09:45:00.000Z',
    timeOut: '2024-01-24T09:55:00.000Z',
    timeInTrade: 10,
    profit: -525,
    journal: 'Stop run setup. Entered too early without proper confirmation. Need more patience.',
    direction: 'long',
    tags: { setup: 'stop_runs' },
    strategyId: 'stop_run_strategy',
    accountId: 'default',
    execution: {
      checklist: {
        'sr_1': true,
        'sr_2': true,
        'sr_3': false,
        'sr_4': false,
        'sr_5': true,
        'sr_6': true,
        'sr_7': false,
        'sr_8': true
      },
      grade: 'C-',
      notes: 'Poor execution - didn\'t wait for proper reversal confirmation'
    }
  }
]; 