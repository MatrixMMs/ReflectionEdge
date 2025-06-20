// Edge Discovery Analysis for Professional Scalpers
import { Trade } from '../types';

export interface EdgeAnalysis {
  edgeType: 'time-based' | 'pattern-based' | 'market-condition' | 'behavioral' | 'risk-reward';
  confidence: number;
  description: string;
  metrics: {
    winRate: number;
    profitFactor: number;
    averageWin: number;
    averageLoss: number;
    totalTrades: number;
    edgeStrength: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MarketCondition {
  timeOfDay: string;
  dayOfWeek: string;
  volatility: 'low' | 'medium' | 'high';
  volume: 'low' | 'medium' | 'high';
  trend: 'bullish' | 'bearish' | 'sideways';
}

export interface BehavioralPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  avgProfit: number;
  avgLoss: number;
  consistency: number;
}

export interface EdgeDiscoveryResult {
  overallEdge: number;
  topEdges: EdgeAnalysis[];
  marketConditions: MarketCondition[];
  behavioralPatterns: BehavioralPattern[];
  recommendations: string[];
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    specificRisks: string[];
    mitigationStrategies: string[];
  };
}

export const discoverEdges = (trades: Trade[]): EdgeDiscoveryResult => {
  if (trades.length < 20) {
    return createEmptyEdgeDiscoveryResult();
  }

  const edges: EdgeAnalysis[] = [];
  
  // Time-based edge analysis
  const timeEdges = analyzeTimeBasedEdges(trades);
  edges.push(...timeEdges);

  // Pattern-based edge analysis
  const patternEdges = analyzePatternBasedEdges(trades);
  edges.push(...patternEdges);

  // Market condition analysis
  const marketConditions = analyzeMarketConditions(trades);

  // Behavioral pattern analysis
  const behavioralPatterns = analyzeBehavioralPatterns(trades);

  // Risk assessment
  const riskAssessment = assessRisk(trades, edges);

  // Calculate overall edge
  const overallEdge = calculateOverallEdge(edges);

  // Generate recommendations
  const recommendations = generateRecommendations(edges, marketConditions, behavioralPatterns);

  return {
    overallEdge,
    topEdges: edges.sort((a, b) => b.confidence - a.confidence).slice(0, 5),
    marketConditions,
    behavioralPatterns,
    recommendations,
    riskAssessment
  };
};

const analyzeTimeBasedEdges = (trades: Trade[]): EdgeAnalysis[] => {
  const edges: EdgeAnalysis[] = [];
  
  // Analyze by hour of day
  const hourlyAnalysis = analyzeByHour(trades);
  if (hourlyAnalysis.length > 0) {
    edges.push(...hourlyAnalysis);
  }

  // Analyze by day of week
  const dailyAnalysis = analyzeByDayOfWeek(trades);
  if (dailyAnalysis.length > 0) {
    edges.push(...dailyAnalysis);
  }

  // Analyze by session (pre-market, regular, after-hours)
  const sessionAnalysis = analyzeBySession(trades);
  if (sessionAnalysis.length > 0) {
    edges.push(...sessionAnalysis);
  }

  return edges;
};

const analyzeByHour = (trades: Trade[]): EdgeAnalysis[] => {
  const hourlyData: { [hour: number]: Trade[] } = {};
  
  trades.forEach(trade => {
    const hour = new Date(trade.timeIn).getHours();
    if (!hourlyData[hour]) hourlyData[hour] = [];
    hourlyData[hour].push(trade);
  });

  const edges: EdgeAnalysis[] = [];
  
  Object.entries(hourlyData).forEach(([hour, hourTrades]) => {
    if (hourTrades.length < 5) return; // Need minimum sample size
    
    const analysis = calculateEdgeMetrics(hourTrades);
    if (analysis.winRate > 0.6 || analysis.profitFactor > 1.5) {
      edges.push({
        edgeType: 'time-based',
        confidence: Math.min(analysis.winRate * analysis.profitFactor * 0.5, 1),
        description: `Strong performance during ${hour}:00 hour`,
        metrics: analysis,
        recommendations: [
          `Focus on trading during ${hour}:00 hour`,
          `Consider increasing position sizes during this time`,
          `Monitor market conditions specific to this hour`
        ],
        riskLevel: analysis.winRate > 0.7 ? 'low' : analysis.winRate > 0.6 ? 'medium' : 'high'
      });
    }
  });

  return edges;
};

const analyzeByDayOfWeek = (trades: Trade[]): EdgeAnalysis[] => {
  const dailyData: { [day: string]: Trade[] } = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  trades.forEach(trade => {
    const day = days[new Date(trade.timeIn).getDay()];
    if (!dailyData[day]) dailyData[day] = [];
    dailyData[day].push(trade);
  });

  const edges: EdgeAnalysis[] = [];
  
  Object.entries(dailyData).forEach(([day, dayTrades]) => {
    if (dayTrades.length < 3) return; // Need minimum sample size
    
    const analysis = calculateEdgeMetrics(dayTrades);
    if (analysis.winRate > 0.65 || analysis.profitFactor > 1.4) {
      edges.push({
        edgeType: 'time-based',
        confidence: Math.min(analysis.winRate * analysis.profitFactor * 0.4, 1),
        description: `Consistent performance on ${day}s`,
        metrics: analysis,
        recommendations: [
          `Prioritize trading on ${day}s`,
          `Plan your week around ${day} trading sessions`,
          `Review ${day}-specific market conditions`
        ],
        riskLevel: analysis.winRate > 0.7 ? 'low' : analysis.winRate > 0.65 ? 'medium' : 'high'
      });
    }
  });

  return edges;
};

const analyzeBySession = (trades: Trade[]): EdgeAnalysis[] => {
  const sessionData: { [session: string]: Trade[] } = {
    'pre-market': [],
    'regular': [],
    'after-hours': []
  };
  
  trades.forEach(trade => {
    const hour = new Date(trade.timeIn).getHours();
    if (hour < 9) sessionData['pre-market'].push(trade);
    else if (hour >= 9 && hour < 16) sessionData['regular'].push(trade);
    else sessionData['after-hours'].push(trade);
  });

  const edges: EdgeAnalysis[] = [];
  
  Object.entries(sessionData).forEach(([session, sessionTrades]) => {
    if (sessionTrades.length < 5) return;
    
    const analysis = calculateEdgeMetrics(sessionTrades);
    if (analysis.winRate > 0.6 || analysis.profitFactor > 1.3) {
      edges.push({
        edgeType: 'time-based',
        confidence: Math.min(analysis.winRate * analysis.profitFactor * 0.45, 1),
        description: `Effective trading during ${session} session`,
        metrics: analysis,
        recommendations: [
          `Focus on ${session} trading`,
          `Adjust strategy for ${session} market conditions`,
          `Consider session-specific risk management`
        ],
        riskLevel: analysis.winRate > 0.7 ? 'low' : analysis.winRate > 0.6 ? 'medium' : 'high'
      });
    }
  });

  return edges;
};

const analyzePatternBasedEdges = (trades: Trade[]): EdgeAnalysis[] => {
  const edges: EdgeAnalysis[] = [];
  
  // Analyze consecutive wins/losses
  const consecutiveAnalysis = analyzeConsecutivePatterns(trades);
  if (consecutiveAnalysis) edges.push(consecutiveAnalysis);

  // Analyze profit/loss streaks
  const streakAnalysis = analyzeProfitLossStreaks(trades);
  if (streakAnalysis) edges.push(streakAnalysis);

  // Analyze trade duration patterns
  const durationAnalysis = analyzeDurationPatterns(trades);
  if (durationAnalysis) edges.push(durationAnalysis);

  return edges;
};

const analyzeConsecutivePatterns = (trades: Trade[]): EdgeAnalysis | null => {
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWins = 0;
  let currentLosses = 0;

  trades.forEach(trade => {
    if (trade.profit > 0) {
      currentWins++;
      currentLosses = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
    } else {
      currentLosses++;
      currentWins = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
    }
  });

  if (maxConsecutiveWins >= 5) {
    return {
      edgeType: 'pattern-based',
      confidence: Math.min(maxConsecutiveWins / 10, 1),
      description: `Can achieve ${maxConsecutiveWins} consecutive wins`,
      metrics: calculateEdgeMetrics(trades),
      recommendations: [
        'Consider increasing position size after 2-3 consecutive wins',
        'Monitor for win streak continuation patterns',
        'Set profit targets based on historical streak lengths'
      ],
      riskLevel: maxConsecutiveWins > 7 ? 'low' : maxConsecutiveWins > 5 ? 'medium' : 'high'
    };
  }

  return null;
};

const analyzeProfitLossStreaks = (trades: Trade[]): EdgeAnalysis | null => {
  const profits = trades.filter(t => t.profit > 0).map(t => t.profit);
  const losses = trades.filter(t => t.profit < 0).map(t => Math.abs(t.profit));
  
  const avgProfit = profits.length > 0 ? profits.reduce((a, b) => a + b, 0) / profits.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  
  if (avgProfit > avgLoss * 1.5) {
    return {
      edgeType: 'pattern-based',
      confidence: Math.min(avgProfit / (avgLoss * 2), 1),
      description: `Strong profit-to-loss ratio (${(avgProfit / avgLoss).toFixed(2)}:1)`,
      metrics: calculateEdgeMetrics(trades),
      recommendations: [
        'Consider wider stops to let profits run',
        'Focus on high-probability setups',
        'Use trailing stops to maximize profit capture'
      ],
      riskLevel: avgProfit / avgLoss > 2 ? 'low' : avgProfit / avgLoss > 1.5 ? 'medium' : 'high'
    };
  }

  return null;
};

const analyzeDurationPatterns = (trades: Trade[]): EdgeAnalysis | null => {
  const quickTrades = trades.filter(t => t.timeInTrade < 5);
  const mediumTrades = trades.filter(t => t.timeInTrade >= 5 && t.timeInTrade <= 30);
  const longTrades = trades.filter(t => t.timeInTrade > 30);

  let bestDuration: Trade[] = [];
  let bestMetric = 0;

  [quickTrades, mediumTrades, longTrades].forEach(durationTrades => {
    if (durationTrades.length < 3) return;
    const analysis = calculateEdgeMetrics(durationTrades);
    const metric = analysis.winRate * analysis.profitFactor;
    if (metric > bestMetric) {
      bestMetric = metric;
      bestDuration = durationTrades;
    }
  });

  if (bestDuration.length > 0) {
    const analysis = calculateEdgeMetrics(bestDuration);
    const avgDuration = bestDuration.reduce((sum, t) => sum + t.timeInTrade, 0) / bestDuration.length;
    
    return {
      edgeType: 'pattern-based',
      confidence: Math.min(bestMetric * 0.6, 1),
      description: `Optimal trade duration: ${avgDuration.toFixed(1)} minutes`,
      metrics: analysis,
      recommendations: [
        `Target ${avgDuration.toFixed(0)}-minute trade durations`,
        'Set time-based exit rules',
        'Monitor for duration-specific market conditions'
      ],
      riskLevel: analysis.winRate > 0.7 ? 'low' : analysis.winRate > 0.6 ? 'medium' : 'high'
    };
  }

  return null;
};

const analyzeMarketConditions = (trades: Trade[]): MarketCondition[] => {
  const conditions: MarketCondition[] = [];
  
  // Analyze by time of day
  const hourlyPerformance = new Array(24).fill(0).map(() => ({ wins: 0, total: 0, profit: 0 }));
  
  trades.forEach(trade => {
    const hour = new Date(trade.timeIn).getHours();
    hourlyPerformance[hour].total++;
    hourlyPerformance[hour].profit += trade.profit;
    if (trade.profit > 0) hourlyPerformance[hour].wins++;
  });

  hourlyPerformance.forEach((data, hour) => {
    if (data.total >= 3) {
      const winRate = data.wins / data.total;
      const avgProfit = data.profit / data.total;
      
      conditions.push({
        timeOfDay: `${hour}:00`,
        dayOfWeek: 'All',
        volatility: avgProfit > 50 ? 'high' : avgProfit > 20 ? 'medium' : 'low',
        volume: data.total > 10 ? 'high' : data.total > 5 ? 'medium' : 'low',
        trend: winRate > 0.6 ? 'bullish' : winRate < 0.4 ? 'bearish' : 'sideways'
      });
    }
  });

  return conditions;
};

const analyzeBehavioralPatterns = (trades: Trade[]): BehavioralPattern[] => {
  const patterns: BehavioralPattern[] = [];
  
  // Analyze trade frequency patterns
  const tradeFrequency = analyzeTradeFrequency(trades);
  if (tradeFrequency) patterns.push(tradeFrequency);

  // Analyze profit-taking behavior
  const profitTaking = analyzeProfitTakingBehavior(trades);
  if (profitTaking) patterns.push(profitTaking);

  // Analyze loss-cutting behavior
  const lossCutting = analyzeLossCuttingBehavior(trades);
  if (lossCutting) patterns.push(lossCutting);

  return patterns;
};

const analyzeTradeFrequency = (trades: Trade[]): BehavioralPattern | null => {
  if (trades.length < 10) return null;

  const tradesByDay: { [date: string]: Trade[] } = {};
  trades.forEach(trade => {
    const date = trade.date;
    if (!tradesByDay[date]) tradesByDay[date] = [];
    tradesByDay[date].push(trade);
  });

  const dailyTradeCounts = Object.values(tradesByDay).map(dayTrades => dayTrades.length);
  const avgTradesPerDay = dailyTradeCounts.reduce((a, b) => a + b, 0) / dailyTradeCounts.length;
  const highFrequencyDays = dailyTradeCounts.filter(count => count > avgTradesPerDay * 1.5);
  
  if (highFrequencyDays.length > 0) {
    const highFreqTrades = trades.filter(trade => {
      const dayTrades = tradesByDay[trade.date];
      return dayTrades.length > avgTradesPerDay * 1.5;
    });

    const analysis = calculateEdgeMetrics(highFreqTrades);
    
    return {
      pattern: 'High Frequency Trading Days',
      frequency: highFrequencyDays.length / dailyTradeCounts.length,
      successRate: analysis.winRate,
      avgProfit: analysis.averageWin,
      avgLoss: analysis.averageLoss,
      consistency: analysis.profitFactor
    };
  }

  return null;
};

const analyzeProfitTakingBehavior = (trades: Trade[]): BehavioralPattern | null => {
  const winningTrades = trades.filter(t => t.profit > 0);
  if (winningTrades.length < 5) return null;

  const profitRanges = {
    small: winningTrades.filter(t => t.profit <= 50).length,
    medium: winningTrades.filter(t => t.profit > 50 && t.profit <= 200).length,
    large: winningTrades.filter(t => t.profit > 200).length
  };

  const totalWins = winningTrades.length;
  const mostCommonRange = Object.entries(profitRanges).reduce((a, b) => a[1] > b[1] ? a : b);
  
  return {
    pattern: `Profit Taking at ${mostCommonRange[0]} level`,
    frequency: mostCommonRange[1] / totalWins,
    successRate: mostCommonRange[1] / totalWins,
    avgProfit: winningTrades.reduce((sum, t) => sum + t.profit, 0) / totalWins,
    avgLoss: 0,
    consistency: mostCommonRange[1] / totalWins
  };
};

const analyzeLossCuttingBehavior = (trades: Trade[]): BehavioralPattern | null => {
  const losingTrades = trades.filter(t => t.profit < 0);
  if (losingTrades.length < 5) return null;

  const lossRanges = {
    small: losingTrades.filter(t => Math.abs(t.profit) <= 50).length,
    medium: losingTrades.filter(t => Math.abs(t.profit) > 50 && Math.abs(t.profit) <= 200).length,
    large: losingTrades.filter(t => Math.abs(t.profit) > 200).length
  };

  const totalLosses = losingTrades.length;
  const mostCommonRange = Object.entries(lossRanges).reduce((a, b) => a[1] > b[1] ? a : b);
  
  return {
    pattern: `Loss Cutting at ${mostCommonRange[0]} level`,
    frequency: mostCommonRange[1] / totalLosses,
    successRate: 0,
    avgProfit: 0,
    avgLoss: losingTrades.reduce((sum, t) => sum + Math.abs(t.profit), 0) / totalLosses,
    consistency: mostCommonRange[1] / totalLosses
  };
};

const calculateEdgeMetrics = (trades: Trade[]): any => {
  const wins = trades.filter(t => t.profit > 0);
  const losses = trades.filter(t => t.profit < 0);
  
  const winRate = trades.length > 0 ? wins.length / trades.length : 0;
  const averageWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.profit, 0) / wins.length : 0;
  const averageLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.profit, 0) / losses.length) : 0;
  const profitFactor = averageLoss > 0 ? (averageWin * wins.length) / (averageLoss * losses.length) : 0;
  const edgeStrength = winRate * profitFactor;

  return {
    winRate,
    profitFactor,
    averageWin,
    averageLoss,
    totalTrades: trades.length,
    edgeStrength
  };
};

const calculateOverallEdge = (edges: EdgeAnalysis[]): number => {
  if (edges.length === 0) return 0;
  
  const totalConfidence = edges.reduce((sum, edge) => sum + edge.confidence, 0);
  const avgEdgeStrength = edges.reduce((sum, edge) => sum + edge.metrics.edgeStrength, 0) / edges.length;
  
  return Math.min((totalConfidence + avgEdgeStrength) / 2, 1);
};

const assessRisk = (trades: Trade[], edges: EdgeAnalysis[]): any => {
  const totalTrades = trades.length;
  const losingTrades = trades.filter(t => t.profit < 0);
  const maxDrawdown = calculateMaxDrawdown(trades);
  
  let overallRisk: 'low' | 'medium' | 'high' = 'medium';
  const specificRisks: string[] = [];
  const mitigationStrategies: string[] = [];

  // Assess based on win rate
  const winRate = (totalTrades - losingTrades.length) / totalTrades;
  if (winRate < 0.4) {
    overallRisk = 'high';
    specificRisks.push('Low win rate indicates poor edge');
    mitigationStrategies.push('Review and refine entry criteria');
  } else if (winRate > 0.6) {
    overallRisk = 'low';
  }

  // Assess based on drawdown
  if (maxDrawdown > 0.3) {
    overallRisk = 'high';
    specificRisks.push('High maximum drawdown');
    mitigationStrategies.push('Implement stricter risk management');
  }

  // Assess based on edge consistency
  const consistentEdges = edges.filter(e => e.confidence > 0.7);
  if (consistentEdges.length === 0) {
    specificRisks.push('No strong, consistent edges identified');
    mitigationStrategies.push('Focus on developing and testing specific edges');
  }

  return {
    overallRisk,
    specificRisks,
    mitigationStrategies
  };
};

const calculateMaxDrawdown = (trades: Trade[]): number => {
  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;

  trades.forEach(trade => {
    runningTotal += trade.profit;
    if (runningTotal > peak) {
      peak = runningTotal;
    }
    const drawdown = (peak - runningTotal) / Math.max(peak, 1);
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
};

const generateRecommendations = (
  edges: EdgeAnalysis[], 
  marketConditions: MarketCondition[], 
  behavioralPatterns: BehavioralPattern[]
): string[] => {
  const recommendations: string[] = [];

  // Edge-based recommendations
  edges.forEach(edge => {
    if (edge.confidence > 0.7) {
      recommendations.push(`Focus on ${edge.description.toLowerCase()}`);
    }
  });

  // Market condition recommendations
  const bullishConditions = marketConditions.filter(c => c.trend === 'bullish');
  if (bullishConditions.length > 0) {
    recommendations.push('Consider increasing position sizes during bullish market conditions');
  }

  // Behavioral recommendations
  behavioralPatterns.forEach(pattern => {
    if (pattern.consistency > 0.7) {
      recommendations.push(`Leverage ${pattern.pattern.toLowerCase()} behavior`);
    }
  });

  // General recommendations
  if (edges.length === 0) {
    recommendations.push('Focus on developing and testing specific trading edges');
    recommendations.push('Consider reducing position sizes until edges are identified');
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
};

const createEmptyEdgeDiscoveryResult = (): EdgeDiscoveryResult => {
  return {
    overallEdge: 0,
    topEdges: [],
    marketConditions: [],
    behavioralPatterns: [],
    recommendations: ['Need more trading data for edge discovery analysis'],
    riskAssessment: {
      overallRisk: 'high',
      specificRisks: ['Insufficient data for analysis'],
      mitigationStrategies: ['Continue trading and collecting data']
    }
  };
}; 