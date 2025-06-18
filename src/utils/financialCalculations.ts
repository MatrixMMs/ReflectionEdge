
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
