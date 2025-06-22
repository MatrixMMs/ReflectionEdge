import { Trade } from './types';

export const sampleTrades: Trade[] = [
  {
    "id": "es_001",
    "date": "2024-01-15",
    "symbol": "/ES",
    "contracts": 1,
    "entry": 4842.25,
    "exit": 4843.5,
    "timeIn": "2024-01-15T10:15:00",
    "timeOut": "2024-01-15T10:25:00",
    "timeInTrade": 10,
    "profit": -62.5,
    "fees": 4.5,
    "tags": {
      "setup": "momentum",
      "market_condition": "trend"
    },
    "journal": "High volume breakout, good execution",
    "direction": "short",
    "accountId": "futures_acc"
  },
  {
    "id": "es_002",
    "date": "2024-01-15",
    "symbol": "/ES",
    "contracts": 1,
    "entry": 4857.5,
    "exit": 4854,
    "timeIn": "2024-01-15T11:00:00",
    "timeOut": "2024-01-15T11:20:00",
    "timeInTrade": 20,
    "profit": 175,
    "fees": 4.5,
    "tags": {
      "setup": "stop_runs",
      "market_condition": "tight_range"
    },
    "journal": "Stop run pattern, need tighter stops",
    "direction": "short",
    "accountId": "futures_acc"
  },
  {
    "id": "es_003",
    "date": "2024-01-15",
    "symbol": "/ES",
    "contracts": 1,
    "entry": 4845,
    "exit": 4848.75,
    "timeIn": "2024-01-15T12:30:00",
    "timeOut": "2024-01-15T12:45:00",
    "timeInTrade": 15,
    "profit": -187.5,
    "fees": 4.5,
    "tags": {
      "setup": "trend",
      "market_condition": "erratic"
    },
    "journal": "Followed the trend successfully",
    "direction": "short",
    "accountId": "futures_acc"
  },
  {
    "id": "es_004",
    "date": "2024-01-15",
    "symbol": "/ES",
    "contracts": 1,
    "entry": 4852.25,
    "exit": 4861.75,
    "timeIn": "2024-01-15T13:15:00",
    "timeOut": "2024-01-15T13:30:00",
    "timeInTrade": 15,
    "profit": 475,
    "fees": 4.5,
    "tags": {
      "setup": "mean_reversion",
      "market_condition": "low_volume"
    },
    "journal": "Mean reversion trade, good risk management",
    "direction": "long",
    "accountId": "futures_acc"
  },
  {
    "id": "es_005",
    "date": "2024-01-15",
    "symbol": "/ES",
    "contracts": 1,
    "entry": 4856,
    "exit": 4868,
    "timeIn": "2024-01-15T14:00:00",
    "timeOut": "2024-01-15T14:10:00",
    "timeInTrade": 10,
    "profit": 600,
    "fees": 4.5,
    "tags": {
      "setup": "failed_auction",
      "market_condition": "high_volume"
    },
    "journal": "Auction failure, poor entry timing",
    "direction": "long",
    "accountId": "futures_acc"
  }
]; 