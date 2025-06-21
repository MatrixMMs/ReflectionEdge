import { Trade } from '../types';

export interface Financials {
  totalTrades: number;
  netPnl: number;
  grossPnl: number;
  winRate: number;
  lossRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  totalFees: number;
  expectancy: number;
  avgWinLossRatio: number;
  sharpeRatio: number | null;
  maxWin: number;
  maxLoss: number;
}

export const calculateFinancials = (trades: Trade[]): Financials => {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0, netPnl: 0, grossPnl: 0, winRate: 0, lossRate: 0,
      avgWin: 0, avgLoss: 0, profitFactor: 0, totalFees: 0, expectancy: 0, avgWinLossRatio: 0, sharpeRatio: null, maxWin: 0, maxLoss: 0
    };
  }

  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);

  const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
  const totalFees = trades.reduce((sum, t) => sum + (t.fees || 0), 0);

  const netPnl = grossProfit - grossLoss;
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const lossRate = totalTrades > 0 ? (losingTrades.length / totalTrades) * 100 : 0;
  
  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
  
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

  const expectancy = ((winRate / 100) * avgWin) - ((lossRate / 100) * avgLoss);
  const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : Infinity;

  const pnlValues = trades.map(t => t.profit);
  const sharpeRatio = calculateSharpeRatio(pnlValues);

  const maxWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit)) : 0;
  const maxLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profit)) : 0;

  return {
    totalTrades,
    netPnl,
    grossPnl: grossProfit,
    winRate,
    lossRate,
    avgWin,
    avgLoss,
    profitFactor,
    totalFees,
    expectancy,
    avgWinLossRatio,
    sharpeRatio,
    maxWin,
    maxLoss,
  };
};

export const calculateCumulativePnl = (trades: Trade[]) => {
  // ... existing code ...
};

export function calculateSharpeRatio(pnlValues: number[], riskFreeRate: number = 0): number | null {
  const n = pnlValues.length;

  if (n === 0) { // No trades, no Sharpe Ratio
    return null;
  }
  
  // Calculate excess returns
  const excessReturns = pnlValues.map(pnl => pnl - riskFreeRate);
  
  // Calculate mean of excess returns
  const meanExcessReturn = excessReturns.reduce((sum, er) => sum + er, 0) / n;

  if (n < 2) { 
    // For a single trade, if its excess return is positive, it's 'infinitely good' in a simple sense.
    // If negative, 'infinitely bad'. If zero, then 0.
    // Standard deviation of a single point is 0 or undefined for sample.
    // Let's return based on the meanExcessReturn.
    if (meanExcessReturn > 0) return Infinity;
    if (meanExcessReturn < 0) return -Infinity;
    return 0; // Or null, single trade with zero excess return.
  }

  // Calculate sample standard deviation of excess returns
  // (Sum of squared differences from the mean) / (n-1)
  const varianceExcessReturn = excessReturns.reduce((sumSqDiff, er) => sumSqDiff + Math.pow(er - meanExcessReturn, 2), 0) / (n - 1);
  const stdDevExcessReturn = Math.sqrt(varianceExcessReturn);

  if (stdDevExcessReturn === 0) {
    // All excess returns are the same (and equal to meanExcessReturn)
    if (meanExcessReturn > 0) return Infinity;
    if (meanExcessReturn < 0) return -Infinity; 
    return 0; // All excess returns are 0 (e.g. all P&Ls == riskFreeRate)
  }

  return meanExcessReturn / stdDevExcessReturn;
}
