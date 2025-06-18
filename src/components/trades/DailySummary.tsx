
import React from 'react';
import { Trade } from '../../types';
import { calculateSharpeRatio } from '../../utils/financialCalculations'; // New import

interface DailySummaryProps {
  trades: Trade[]; // Trades for a single selected day
}

const formatSharpeRatioValue = (sharpe: number | null): string => {
  if (sharpe === null) return "N/A";
  if (sharpe === Infinity) return "High (∞)";
  if (sharpe === -Infinity) return "Low (-∞)";
  if (isNaN(sharpe)) return "N/A";
  return sharpe.toFixed(2);
};

export const DailySummary: React.FC<DailySummaryProps> = ({ trades }) => {
  if (trades.length === 0) {
    return <p className="text-gray-500 text-sm">No trades for the selected date.</p>;
  }

  const cummPnl = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const winningTrades = trades.filter(trade => trade.profit > 0);
  const losingTrades = trades.filter(trade => trade.profit < 0);

  const maxWinningTradePnl = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit)) : 0;
  const maxLosingTradePnl = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profit)) : 0; // Will be negative

  const totalTimeInTrade = trades.reduce((sum, trade) => sum + trade.timeInTrade, 0);
  const avgTimeInTrade = trades.length > 0 ? totalTimeInTrade / trades.length : 0;

  const timesInTrade = trades.map(t => t.timeInTrade);
  const maxTimeInTrade = trades.length > 0 ? Math.max(...timesInTrade) : 0;
  const minTimeInTrade = trades.length > 0 ? Math.min(...timesInTrade) : 0;

  const winPercentage = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  const pnlValues = trades.map(t => t.profit);
  const sharpeRatio = calculateSharpeRatio(pnlValues);


  const summaryItems = [
    { label: 'Total Trades', value: trades.length },
    { label: 'Cumulative P&L', value: `$${cummPnl.toFixed(2)}`, color: cummPnl >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Win %', value: `${winPercentage.toFixed(1)}%` },
    { label: 'Sharpe Ratio', value: formatSharpeRatioValue(sharpeRatio) },
    { label: 'Max Winning Trade', value: `$${maxWinningTradePnl.toFixed(2)}`, color: 'text-green-400' },
    { label: 'Max Losing Trade', value: `$${maxLosingTradePnl.toFixed(2)}`, color: 'text-red-400' },
    { label: 'Avg. Time in Trade', value: `${avgTimeInTrade.toFixed(0)} min` },
    { label: 'Max Time in Trade', value: `${maxTimeInTrade.toFixed(0)} min` },
    { label: 'Min Time in Trade', value: `${minTimeInTrade.toFixed(0)} min` },
  ];

  return (
    <div className="space-y-3">
      {summaryItems.map(item => (
        <div key={item.label} className="flex justify-between items-center text-sm border-b border-gray-700 pb-1 last:border-b-0">
          <span className="text-gray-300">{item.label}:</span>
          <span className={`font-semibold ${item.color || 'text-gray-100'}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};
