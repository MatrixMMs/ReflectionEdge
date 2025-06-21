import React from 'react';
import { Trade } from '../../types';
import { calculateFinancials } from '../../utils/financialCalculations';

interface SummaryProps {
  trades: Trade[];
}

export const Summary: React.FC<SummaryProps> = ({ trades }) => {
  const financials = calculateFinancials(trades);

  const {
    totalTrades,
    netPnl,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    totalFees,
  } = financials;

  if (totalTrades === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        No trades for the selected period.
      </div>
    );
  }

  const pnlColor = netPnl >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-300">Total Trades:</span>
        <span className="font-mono text-gray-100">{totalTrades}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-300">Net P&L:</span>
        <span className={`font-mono font-bold ${pnlColor}`}>
          {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
        </span>
      </div>
       <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-300">Win Rate:</span>
        <span className="font-mono text-gray-100">{winRate.toFixed(1)}%</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-300">Profit Factor:</span>
        <span className="font-mono text-gray-100">{profitFactor.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-300">Avg Win / Loss:</span>
        <span className="font-mono">
          <span className="text-green-400">${avgWin.toFixed(2)}</span> / <span className="text-red-400">${avgLoss.toFixed(2)}</span>
        </span>
      </div>
       {totalFees > 0 && (
        <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2">
          <span className="font-semibold text-gray-400">Total Fees:</span>
          <span className="font-mono text-gray-300">-${totalFees.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}; 