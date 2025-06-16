import { Trade } from './types';

export const sampleTrades: Omit<Trade, 'id' | 'timeInTrade'>[] = [
  {
    date: '2025-06-20',
    symbol: '/ES',
    direction: 'long',
    contracts: 2,
    entry: 6075.25,
    exit: 6090.75,
    timeIn: '2025-06-20T09:30:00.000Z',
    timeOut: '2025-06-20T10:15:00.000Z',
    profit: 1550.00, // 15.5 points * $50 * 2 contracts
    journal: 'Long on failed auction at support. Clean entry with volume confirmation.',
    tags: {
      'setup': 'failed_auction',
      'market_condition': 'wide_balance'
    }
  },
  {
    date: '2025-06-20',
    symbol: '/ES',
    direction: 'short',
    contracts: 1,
    entry: 6100.50,
    exit: 6080.25,
    timeIn: '2025-06-20T11:30:00.000Z',
    timeOut: '2025-06-20T12:45:00.000Z',
    profit: 1012.50, // 20.25 points * $50 * 1 contract
    journal: 'Short at resistance with stop runs above. Took profit at support level.',
    tags: {
      'setup': 'stop_runs',
      'market_condition': 'high_volume'
    }
  },
  {
    date: '2025-06-21',
    symbol: '/ES',
    direction: 'long',
    contracts: 3,
    entry: 6085.00,
    exit: 6070.50,
    timeIn: '2025-06-21T09:45:00.000Z',
    timeOut: '2025-06-21T10:30:00.000Z',
    profit: -2175.00, // -14.5 points * $50 * 3 contracts
    journal: 'Failed momentum trade. Market reversed on unexpected news.',
    tags: {
      'setup': 'momentum',
      'market_condition': 'erratic'
    }
  },
  {
    date: '2025-06-21',
    symbol: '/ES',
    direction: 'short',
    contracts: 2,
    entry: 6075.75,
    exit: 6055.25,
    timeIn: '2025-06-21T13:15:00.000Z',
    timeOut: '2025-06-21T14:30:00.000Z',
    profit: 2050.00, // 20.5 points * $50 * 2 contracts
    journal: 'Short in tight range with stop runs below. Clean exit at daily support.',
    tags: {
      'setup': 'stop_runs',
      'market_condition': 'tight_range'
    }
  },
  {
    date: '2025-06-22',
    symbol: '/ES',
    direction: 'long',
    contracts: 4,
    entry: 6060.00,
    exit: 6090.25,
    timeIn: '2025-06-22T10:00:00.000Z',
    timeOut: '2025-06-22T11:45:00.000Z',
    profit: 6050.00, // 30.25 points * $50 * 4 contracts
    journal: 'Long on strong trend continuation with high volume. Multiple stop runs above.',
    tags: {
      'setup': 'trend',
      'market_condition': 'high_volume'
    }
  },
  {
    date: '2025-06-22',
    symbol: '/ES',
    direction: 'short',
    contracts: 1,
    entry: 6095.50,
    exit: 6105.25,
    timeIn: '2025-06-22T13:30:00.000Z',
    timeOut: '2025-06-22T14:15:00.000Z',
    profit: -487.50, // -9.75 points * $50 * 1 contract
    journal: 'Short in tight range but market broke out. Cut loss quickly.',
    tags: {
      'setup': 'failed_auction',
      'market_condition': 'low_volume'
    }
  },
  {
    date: '2025-06-23',
    symbol: '/ES',
    direction: 'long',
    contracts: 5,
    entry: 6110.00,
    exit: 6130.75,
    timeIn: '2025-06-23T09:30:00.000Z',
    timeOut: '2025-06-23T10:45:00.000Z',
    profit: 5187.50, // 20.75 points * $50 * 5 contracts
    journal: 'Long on strong momentum with multiple stop runs above. High volume confirmation.',
    tags: {
      'setup': 'momentum',
      'market_condition': 'high_volume'
    }
  },
  {
    date: '2025-06-23',
    symbol: '/ES',
    direction: 'short',
    contracts: 2,
    entry: 6135.25,
    exit: 6120.50,
    timeIn: '2025-06-23T11:30:00.000Z',
    timeOut: '2025-06-23T12:30:00.000Z',
    profit: 1475.00, // 14.75 points * $50 * 2 contracts
    journal: 'Short in wide balance with stop runs below. Clean exit at support.',
    tags: {
      'setup': 'stop_runs',
      'market_condition': 'wide_balance'
    }
  }
]; 