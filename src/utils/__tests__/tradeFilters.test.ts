import { filterTrades, getAvailableSymbols } from '../tradeFilters';
import { TradeFilters } from '../../components/trades/TradeFilters';
import { Trade } from '../../types';

const mockTrades: Trade[] = [
  {
    id: '1',
    date: '2024-01-01',
    symbol: 'ES',
    contracts: 1,
    entry: 100,
    exit: 101,
    timeIn: '09:30',
    timeOut: '10:30',
    timeInTrade: 60,
    profit: 100,
    tags: { 'group1': 'tag1' },
    journal: 'Test trade 1',
    direction: 'long',
    accountId: 'account1',
    execution: { checklist: {}, grade: 'A', notes: 'Good execution' }
  },
  {
    id: '2',
    date: '2024-01-02',
    symbol: 'NQ',
    contracts: 1,
    entry: 200,
    exit: 198,
    timeIn: '14:00',
    timeOut: '15:00',
    timeInTrade: 60,
    profit: -200,
    tags: { 'group1': 'tag2' },
    journal: 'Test trade 2',
    direction: 'short',
    accountId: 'account1',
    execution: { checklist: {}, grade: 'C', notes: 'Poor execution' }
  },
  {
    id: '3',
    date: '2024-01-03',
    symbol: 'ES',
    contracts: 2,
    entry: 150,
    exit: 155,
    timeIn: '11:00',
    timeOut: '12:00',
    timeInTrade: 60,
    profit: 500,
    tags: { 'group1': 'tag1', 'group2': 'tag3' },
    journal: 'Test trade 3',
    direction: 'long',
    accountId: 'account1',
    execution: { checklist: {}, grade: 'A+', notes: 'Excellent execution' }
  }
];

describe('tradeFilters', () => {
  describe('filterTrades', () => {
    it('should return all trades when no filters are applied', () => {
      const filters: TradeFilters = {
        direction: 'all',
        grade: 'all',
        dateFrom: '',
        dateTo: '',
        symbol: '',
        minProfit: '',
        maxProfit: '',
        selectedTags: {}
      };

      const result = filterTrades(mockTrades, filters);
      expect(result).toHaveLength(3);
    });

    it('should filter by direction', () => {
      const filters: TradeFilters = {
        direction: 'long',
        grade: 'all',
        dateFrom: '',
        dateTo: '',
        symbol: '',
        minProfit: '',
        maxProfit: '',
        selectedTags: {}
      };

      const result = filterTrades(mockTrades, filters);
      expect(result).toHaveLength(2);
      expect(result.every(trade => trade.direction === 'long')).toBe(true);
    });

    it('should filter by grade', () => {
      const filters: TradeFilters = {
        direction: 'all',
        grade: 'A',
        dateFrom: '',
        dateTo: '',
        symbol: '',
        minProfit: '',
        maxProfit: '',
        selectedTags: {}
      };

      const result = filterTrades(mockTrades, filters);
      expect(result).toHaveLength(1);
      expect(result[0].execution?.grade).toBe('A');
    });

    it('should filter by date range', () => {
      const filters: TradeFilters = {
        direction: 'all',
        grade: 'all',
        dateFrom: '2024-01-02',
        dateTo: '2024-01-02',
        symbol: '',
        minProfit: '',
        maxProfit: '',
        selectedTags: {}
      };

      const result = filterTrades(mockTrades, filters);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-01-02');
    });

    it('should filter by symbol', () => {
      const filters: TradeFilters = {
        direction: 'all',
        grade: 'all',
        dateFrom: '',
        dateTo: '',
        symbol: 'ES',
        minProfit: '',
        maxProfit: '',
        selectedTags: {}
      };

      const result = filterTrades(mockTrades, filters);
      expect(result).toHaveLength(2);
      expect(result.every(trade => trade.symbol === 'ES')).toBe(true);
    });

    it('should filter by profit range', () => {
      const filters: TradeFilters = {
        direction: 'all',
        grade: 'all',
        dateFrom: '',
        dateTo: '',
        symbol: '',
        minProfit: '200',
        maxProfit: '',
        selectedTags: {}
      };

      const result = filterTrades(mockTrades, filters);
      expect(result).toHaveLength(1);
      expect(result[0].profit).toBe(500);
    });

    it('should filter by tags', () => {
      const filters: TradeFilters = {
        direction: 'all',
        grade: 'all',
        dateFrom: '',
        dateTo: '',
        symbol: '',
        minProfit: '',
        maxProfit: '',
        selectedTags: { 'group1': ['tag1'] }
      };

      const result = filterTrades(mockTrades, filters);
      expect(result).toHaveLength(2);
      expect(result.every(trade => trade.tags['group1'] === 'tag1')).toBe(true);
    });

    it('should combine multiple filters', () => {
      const filters: TradeFilters = {
        direction: 'long',
        grade: 'A',
        dateFrom: '',
        dateTo: '',
        symbol: 'ES',
        minProfit: '',
        maxProfit: '',
        selectedTags: {}
      };

      const result = filterTrades(mockTrades, filters);
      expect(result).toHaveLength(1);
      expect(result[0].direction).toBe('long');
      expect(result[0].execution?.grade).toBe('A');
      expect(result[0].symbol).toBe('ES');
    });
  });

  describe('getAvailableSymbols', () => {
    it('should return unique symbols sorted alphabetically', () => {
      const result = getAvailableSymbols(mockTrades);
      expect(result).toEqual(['ES', 'NQ']);
    });

    it('should handle trades without symbols', () => {
      const tradesWithEmptySymbols = [
        ...mockTrades,
        { ...mockTrades[0], id: '4', symbol: '' }
      ];
      const result = getAvailableSymbols(tradesWithEmptySymbols);
      expect(result).toEqual(['ES', 'NQ']);
    });
  });
}); 