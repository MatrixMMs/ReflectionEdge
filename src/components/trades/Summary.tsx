import React from 'react';
import { Trade } from '../../types';
import { calculateSharpeRatio } from '../../utils/financialCalculations';

interface SummaryProps {
  trades: Trade[]; 
}

const formatSharpeRatioValue = (sharpe: number | null): string => {
  if (sharpe === null) return "N/A";
  if (sharpe === Infinity) return "High (∞)";
  if (sharpe === -Infinity) return "Low (-∞)";
  if (isNaN(sharpe)) return "N/A";
  return sharpe.toFixed(2);
};

export const Summary: React.FC<SummaryProps> = ({ trades }) => {
  if (trades.length === 0) {
    return <p className="text-gray-500 text-sm">No trades for the selected date range.</p>;
  }

  const cummPnl = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const winningTrades = trades.filter(trade => trade.profit > 0);
  const losingTrades = trades.filter(trade => trade.profit < 0);

  const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const grossLoss = losingTrades.reduce((sum, trade) => sum + trade.profit, 0); // This is negative

  const profitFactor = grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : Infinity;

  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0; // This is negative

  const avgWinLossRatio = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : Infinity;

  const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0;
  const lossRate = trades.length > 0 ? losingTrades.length / trades.length : 0;
  const expectancy = (winRate * avgWin) - (lossRate * Math.abs(avgLoss));
  
  const maxWinningTradePnl = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit)) : 0;
  const maxLosingTradePnl = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profit)) : 0; // Will be negative

  const pnlValues = trades.map(t => t.profit);
  const sharpeRatio = calculateSharpeRatio(pnlValues);


  const summaryItems = [
    { label: 'Total Trades', value: trades.length },
    { label: 'Cumulative P&L', value: `$${cummPnl.toFixed(2)}`, color: cummPnl >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Win %', value: `${(winRate * 100).toFixed(1)}%` },
    { label: 'Profit Factor', value: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2) },
    { label: 'Expectancy', value: `$${expectancy.toFixed(2)}` },
    { label: 'Avg Win / Loss', value: avgWinLossRatio === Infinity ? '∞' : avgWinLossRatio.toFixed(2) },
    { label: 'Avg Winning Trade', value: `$${avgWin.toFixed(2)}`, color: 'text-green-400' },
    { label: 'Avg Losing Trade', value: `$${avgLoss.toFixed(2)}`, color: 'text-red-400' },
    { label: 'Max Winning Trade', value: `$${maxWinningTradePnl.toFixed(2)}`, color: 'text-green-400' },
    { label: 'Max Losing Trade', value: `$${maxLosingTradePnl.toFixed(2)}`, color: 'text-red-400' },
    { label: 'Sharpe Ratio', value: formatSharpeRatioValue(sharpeRatio) },
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