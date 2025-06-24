import { Trade } from '../types';
import { TradeFilters } from '../components/trades/TradeFilters';

export const filterTrades = (trades: Trade[], filters: TradeFilters): Trade[] => {
  return trades.filter(trade => {
    // Direction filter
    if (filters.direction !== 'all' && trade.direction !== filters.direction) {
      return false;
    }

    // Grade filter
    if (filters.grade !== 'all' && trade.execution?.grade !== filters.grade) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom && trade.date < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && trade.date > filters.dateTo) {
      return false;
    }

    // Symbol filter
    if (filters.symbol && trade.symbol !== filters.symbol) {
      return false;
    }

    // Profit range filter
    if (filters.minProfit && trade.profit < parseFloat(filters.minProfit)) {
      return false;
    }
    if (filters.maxProfit && trade.profit > parseFloat(filters.maxProfit)) {
      return false;
    }

    // Tags filter
    if (Object.keys(filters.selectedTags).length > 0) {
      const hasMatchingTags = Object.entries(filters.selectedTags).some(([groupId, selectedSubtagIds]) => {
        if (selectedSubtagIds.length === 0) return true; // No tags selected for this group means include all
        
        const tradeSubtagId = trade.tags[groupId];
        return selectedSubtagIds.includes(tradeSubtagId);
      });
      
      if (!hasMatchingTags) {
        return false;
      }
    }

    return true;
  });
};

export const getAvailableSymbols = (trades: Trade[]): string[] => {
  const symbols = new Set<string>();
  trades.forEach(trade => {
    if (trade.symbol) {
      symbols.add(trade.symbol);
    }
  });
  return Array.from(symbols).sort();
}; 