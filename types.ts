export type TradeDirection = 'long' | 'short';
export type TradeDirectionFilterSelection = 'all' | 'long' | 'short';

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  symbol: string; // e.g., AAPL, BTC/USD
  contracts: number; // Number of contracts or shares
  entry: number;
  exit: number;
  timeIn: string; // ISO string or HH:mm
  timeOut: string; // ISO string or HH:mm
  timeInTrade: number; // in minutes
  profit: number;
  tags: { [tagGroupId: string]: string }; // { tagGroupId: subTagId }
  journal: string;
  direction: TradeDirection;
  strategyId?: string;
  accountId: string; // New field for multi-account support
}

export interface SubTag {
  id: string;
  name: string;
  color: string;
  groupId: string;
}

export interface TagGroup {
  id: string;
  name: string;
  subtags: SubTag[];
}

export enum ChartYAxisMetric {
  CUMULATIVE_PNL = 'Cumulative P&L',
  INDIVIDUAL_PNL = 'Individual Trade P&L',
  WIN_PERCENTAGE = 'Win Percentage',
  AVG_PROFIT = 'Average Profit',
}

export enum ChartXAxisMetric {
  TRADE_SEQUENCE = 'Trade Sequence',
  TIME = 'Time', // This would require trades to have precise timestamps
}

export interface ChartDataPoint {
  xValue: string | number; // Trade number or date/time string
  [seriesKey: string]: number | string; // yValue for different series (e.g. PNL_series1, PNL_series2)
}

export interface ProcessedChartData {
  data: ChartDataPoint[];
  seriesKeys: { key: string; color: string; name: string }[];
}

export interface AppDateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  tags: { [groupId: string]: string[] };
  checklist?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  broker?: string;
  currency?: string;
}
