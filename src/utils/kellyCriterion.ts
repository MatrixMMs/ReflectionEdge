// Kelly Criterion Analysis for Position Sizing
import { Trade } from '../types';

export interface KellyCriterionResult {
  kellyPercentage: number;
  recommendedPositionSize: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  totalTrades: number;
  totalWins: number;
  totalLosses: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  riskOfRuin: number;
  confidence: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface KellyAnalysis {
  fullKelly: KellyCriterionResult;
  halfKelly: KellyCriterionResult;
  quarterKelly: KellyCriterionResult;
  conservativeKelly: KellyCriterionResult;
}

export const calculateKellyCriterion = (trades: Trade[]): KellyAnalysis => {
  if (trades.length === 0) {
    return createEmptyKellyAnalysis();
  }

  // Filter out trades with zero profit (breakeven trades)
  const validTrades = trades.filter(trade => trade.profit !== 0);
  
  if (validTrades.length === 0) {
    return createEmptyKellyAnalysis();
  }

  const wins = validTrades.filter(trade => trade.profit > 0);
  const losses = validTrades.filter(trade => trade.profit < 0);

  const totalTrades = validTrades.length;
  const totalWins = wins.length;
  const totalLosses = losses.length;

  const winRate = totalTrades > 0 ? totalWins / totalTrades : 0;
  const lossRate = totalTrades > 0 ? totalLosses / totalTrades : 0;

  const grossProfit = wins.reduce((sum, trade) => sum + trade.profit, 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + trade.profit, 0));

  const averageWin = totalWins > 0 ? grossProfit / totalWins : 0;
  const averageLoss = totalLosses > 0 ? grossLoss / totalLosses : 0;

  const netProfit = grossProfit - grossLoss;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

  // Kelly Criterion Formula: K% = (bp - q) / b
  // Where: b = odds received on winning bet, p = probability of winning, q = probability of losing
  // For trading: b = averageWin/averageLoss, p = winRate, q = lossRate
  
  const b = averageLoss > 0 ? averageWin / averageLoss : 0;
  const kellyPercentage = b > 0 ? (b * winRate - lossRate) / b : 0;

  // Calculate risk of ruin (simplified)
  const riskOfRuin = calculateRiskOfRuin(winRate, averageWin, averageLoss);

  // Determine confidence level based on sample size and consistency
  const confidence = determineConfidence(totalTrades, winRate, profitFactor);

  const baseResult: KellyCriterionResult = {
    kellyPercentage: Math.max(0, Math.min(1, kellyPercentage)), // Clamp between 0 and 1
    recommendedPositionSize: 0,
    winRate,
    averageWin,
    averageLoss,
    profitFactor,
    totalTrades,
    totalWins,
    totalLosses,
    grossProfit,
    grossLoss,
    netProfit,
    riskOfRuin,
    confidence,
    recommendation: generateRecommendation(kellyPercentage, confidence, riskOfRuin, totalTrades)
  };

  return {
    fullKelly: {
      ...baseResult,
      recommendedPositionSize: baseResult.kellyPercentage * 100,
    },
    halfKelly: {
      ...baseResult,
      recommendedPositionSize: (baseResult.kellyPercentage * 50),
    },
    quarterKelly: {
      ...baseResult,
      recommendedPositionSize: (baseResult.kellyPercentage * 25),
    },
    conservativeKelly: {
      ...baseResult,
      recommendedPositionSize: Math.min(baseResult.kellyPercentage * 25, 2), // Max 2% regardless
    }
  };
};

const calculateRiskOfRuin = (winRate: number, avgWin: number, avgLoss: number): number => {
  if (winRate <= 0 || winRate >= 1 || avgLoss <= 0) return 1;

  // Simplified risk of ruin calculation
  const winLossRatio = avgWin / avgLoss;
  const q = 1 - winRate;
  const p = winRate;

  if (p <= q) return 1; // High risk of ruin

  // Risk of ruin = (q/p)^n where n is the number of consecutive losses to ruin
  // For a 50% drawdown, n = 0.5 / (avgLoss as % of capital)
  const n = 0.5 / (avgLoss / 100); // Assuming avgLoss is in dollars, convert to percentage
  const riskOfRuin = Math.pow(q / p, n);

  return Math.min(1, Math.max(0, riskOfRuin));
};

const determineConfidence = (totalTrades: number, winRate: number, profitFactor: number): 'high' | 'medium' | 'low' => {
  if (totalTrades < 30) return 'low';
  if (totalTrades < 100) return 'medium';
  
  // High confidence requires good sample size and consistent results
  if (totalTrades >= 100 && winRate > 0.4 && winRate < 0.8 && profitFactor > 1.2) {
    return 'high';
  }
  
  return 'medium';
};

const generateRecommendation = (
  kellyPercentage: number, 
  confidence: 'high' | 'medium' | 'low', 
  riskOfRuin: number, 
  totalTrades: number
): string => {
  if (totalTrades < 30) {
    return "Insufficient data. Need at least 30 trades for reliable Kelly analysis.";
  }

  if (kellyPercentage <= 0) {
    return "Kelly Criterion suggests no position sizing (negative edge). Review strategy.";
  }

  if (riskOfRuin > 0.5) {
    return "High risk of ruin detected. Consider reducing position sizes significantly.";
  }

  if (confidence === 'low') {
    return "Low confidence in results. Use conservative position sizing.";
  }

  if (kellyPercentage > 0.5) {
    return "Very high Kelly percentage. Consider using fractional Kelly (25-50%) for safety.";
  }

  return "Kelly Criterion analysis complete. Use recommended position sizes based on risk tolerance.";
};

const createEmptyKellyAnalysis = (): KellyAnalysis => {
  const emptyResult: KellyCriterionResult = {
    kellyPercentage: 0,
    recommendedPositionSize: 0,
    winRate: 0,
    averageWin: 0,
    averageLoss: 0,
    profitFactor: 0,
    totalTrades: 0,
    totalWins: 0,
    totalLosses: 0,
    grossProfit: 0,
    grossLoss: 0,
    netProfit: 0,
    riskOfRuin: 1,
    confidence: 'low',
    recommendation: "No trading data available for Kelly Criterion analysis."
  };

  return {
    fullKelly: emptyResult,
    halfKelly: emptyResult,
    quarterKelly: emptyResult,
    conservativeKelly: emptyResult
  };
};

// Additional utility functions for Kelly analysis
export const calculateOptimalPositionSize = (
  accountSize: number, 
  riskPerTrade: number, 
  kellyPercentage: number
): number => {
  const kellyAmount = accountSize * (kellyPercentage / 100);
  const riskAmount = accountSize * (riskPerTrade / 100);
  
  return Math.min(kellyAmount, riskAmount);
};

export const calculateKellyByTimeframe = (trades: Trade[]): { [timeframe: string]: KellyAnalysis } => {
  const timeframes: { [key: string]: (trade: Trade) => boolean } = {
    'All Trades': () => true,
    'Long Trades': (trade) => trade.direction === 'long',
    'Short Trades': (trade) => trade.direction === 'short',
    'Quick Trades (< 5 min)': (trade) => trade.timeInTrade < 5,
    'Medium Trades (5-30 min)': (trade) => trade.timeInTrade >= 5 && trade.timeInTrade <= 30,
    'Longer Trades (> 30 min)': (trade) => trade.timeInTrade > 30,
  };

  const results: { [timeframe: string]: KellyAnalysis } = {};
  
  Object.entries(timeframes).forEach(([timeframe, filter]) => {
    const filteredTrades = trades.filter(filter);
    results[timeframe] = calculateKellyCriterion(filteredTrades);
  });

  return results;
};

export const calculateKellyBySymbol = (trades: Trade[]): { [symbol: string]: KellyAnalysis } => {
  const symbols = [...new Set(trades.map(trade => trade.symbol))];
  const results: { [symbol: string]: KellyAnalysis } = {};
  
  symbols.forEach(symbol => {
    const symbolTrades = trades.filter(trade => trade.symbol === symbol);
    results[symbol] = calculateKellyCriterion(symbolTrades);
  });

  return results;
}; 