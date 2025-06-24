import React, { useMemo, useState } from 'react';
import { Trade } from '../../types';
import { analyzeTimePatterns, TimePattern } from '../../utils/patternRecognition';
import { TrendingUpIcon, TrendingDownIcon, ExclamationTriangleIcon, LightBulbIcon, ClockIcon, CalendarIcon } from '../ui/Icons';
import { InsightCard } from './InsightCard';
import { discoverEdges } from '../../utils/edgeDiscovery';

interface PatternInsightsProps {
  trades: Trade[];
}

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  data?: any;
}

type SectionName = 'Trading Hours Performance' | 'Tags/Strategies' | 'Behavioral/Edge' | 'Risk/Distribution' | 'Other';

export const PatternInsights: React.FC<PatternInsightsProps> = ({ trades }) => {
  const patternAnalysis = useMemo(() => analyzeTimePatterns(trades), [trades]);

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Analyze hourly patterns
    if (patternAnalysis.hourlyPatterns.length > 0) {
      const bestHour = patternAnalysis.bestPerformingHours[0];
      const worstHour = patternAnalysis.worstPerformingHours[0];

      if (bestHour && bestHour.totalTrades >= 5 && bestHour.winRate >= 70) {
        insights.push({
          id: 'best_hour',
          type: 'positive',
          title: 'Strong Hour Performance',
          description: `Your best performing hour is ${bestHour.value}:00 with a ${bestHour.winRate.toFixed(1)}% win rate`,
          impact: 'high',
          recommendation: `Consider focusing your trading activity around ${bestHour.value}:00. This time slot shows consistent profitability.`,
          data: bestHour
        });
      }

      if (worstHour && worstHour.totalTrades >= 5 && worstHour.winRate <= 30) {
        insights.push({
          id: 'worst_hour',
          type: 'warning',
          title: 'Poor Hour Performance',
          description: `Your worst performing hour is ${worstHour.value}:00 with a ${worstHour.winRate.toFixed(1)}% win rate`,
          impact: 'high',
          recommendation: `Avoid trading during ${worstHour.value}:00 or analyze what's different about this time period.`,
          data: worstHour
        });
      }
    }

    // Analyze day patterns
    if (patternAnalysis.dayOfWeekPatterns.length > 0) {
      const bestDay = patternAnalysis.bestPerformingDays[0];
      const worstDay = patternAnalysis.worstPerformingDays[0];

      if (bestDay && bestDay.totalTrades >= 3 && bestDay.winRate >= 65) {
        insights.push({
          id: 'best_day',
          type: 'opportunity',
          title: 'Best Trading Day',
          description: `${bestDay.value} shows your highest win rate at ${bestDay.winRate.toFixed(1)}%`,
          impact: 'medium',
          recommendation: `Plan your most important trades for ${bestDay.value}. Consider increasing position sizes on this day.`,
          data: bestDay
        });
      }

      if (worstDay && worstDay.totalTrades >= 3 && worstDay.winRate <= 40) {
        insights.push({
          id: 'worst_day',
          type: 'warning',
          title: 'Challenging Trading Day',
          description: `${worstDay.value} shows your lowest win rate at ${worstDay.winRate.toFixed(1)}%`,
          impact: 'medium',
          recommendation: `Be extra cautious on ${worstDay.value}. Consider reducing position sizes or focusing on higher-probability setups.`,
          data: worstDay
        });
      }
    }

    // Analyze session patterns
    const { preMarket, regular, afterHours } = patternAnalysis.sessionAnalysis;
    
    if (preMarket.totalTrades >= 3) {
      if (preMarket.winRate >= 70) {
        insights.push({
          id: 'premarket_strong',
          type: 'positive',
          title: 'Pre-Market Success',
          description: `Pre-market trading shows a ${preMarket.winRate.toFixed(1)}% win rate`,
          impact: 'medium',
          recommendation: 'Consider expanding your pre-market trading activity. This session shows strong performance.',
          data: preMarket
        });
      } else if (preMarket.winRate <= 30) {
        insights.push({
          id: 'premarket_weak',
          type: 'warning',
          title: 'Pre-Market Challenges',
          description: `Pre-market trading shows a ${preMarket.winRate.toFixed(1)}% win rate`,
          impact: 'medium',
          recommendation: 'Consider avoiding pre-market trading or analyze what\'s causing poor performance.',
          data: preMarket
        });
      }
    }

    if (regular.totalTrades >= 5) {
      if (regular.winRate >= 60) {
        insights.push({
          id: 'regular_strong',
          type: 'positive',
          title: 'Regular Hours Strength',
          description: `Regular trading hours show a ${regular.winRate.toFixed(1)}% win rate`,
          impact: 'high',
          recommendation: 'Your regular hours performance is solid. Focus on maintaining consistency.',
          data: regular
        });
      } else if (regular.winRate <= 40) {
        insights.push({
          id: 'regular_weak',
          type: 'negative',
          title: 'Regular Hours Issues',
          description: `Regular trading hours show a ${regular.winRate.toFixed(1)}% win rate`,
          impact: 'high',
          recommendation: 'Review your regular hours strategy. This is your main trading session and needs improvement.',
          data: regular
        });
      }
    }

    // Analyze profit factor patterns
    const highProfitFactorPatterns = patternAnalysis.hourlyPatterns.filter(p => p.profitFactor >= 2 && p.totalTrades >= 3);
    if (highProfitFactorPatterns.length > 0) {
      const slotLabels = highProfitFactorPatterns.map(p => `${p.value.toString().padStart(2, '0')}:00`).join(', ');
      insights.push({
        id: 'high_profit_factor',
        type: 'opportunity',
        title: 'High Profit Factor Patterns',
        description: `${highProfitFactorPatterns.length} time slots show profit factors above 2.0: ${slotLabels}`,
        impact: 'high',
        recommendation: 'These time slots are highly profitable. Consider increasing position sizes during these periods.',
        data: highProfitFactorPatterns
      });
    }

    // Analyze trade frequency patterns
    const highFrequencyHours = patternAnalysis.hourlyPatterns
      .filter(p => p.totalTrades >= 10)
      .sort((a, b) => b.totalTrades - a.totalTrades)
      .slice(0, 3);

    if (highFrequencyHours.length > 0) {
      const avgWinRate = highFrequencyHours.reduce((sum, p) => sum + p.winRate, 0) / highFrequencyHours.length;
      
      if (avgWinRate >= 60) {
        insights.push({
          id: 'high_frequency_success',
          type: 'positive',
          title: 'High Frequency Success',
          description: `Your most active hours show an average ${avgWinRate.toFixed(1)}% win rate`,
          impact: 'medium',
          recommendation: 'Your high-frequency trading periods are profitable. Consider expanding these time slots.',
          data: highFrequencyHours
        });
      } else if (avgWinRate <= 40) {
        insights.push({
          id: 'high_frequency_issues',
          type: 'warning',
          title: 'High Frequency Issues',
          description: `Your most active hours show an average ${avgWinRate.toFixed(1)}% win rate`,
          impact: 'high',
          recommendation: 'You\'re trading frequently during low-performing hours. Consider reducing activity or improving strategy.',
          data: highFrequencyHours
        });
      }
    }

    // Analyze consistency patterns
    const consistentHours = patternAnalysis.hourlyPatterns.filter(p => 
      p.totalTrades >= 5 && p.winRate >= 50 && p.winRate <= 70
    );

    if (consistentHours.length >= 3) {
      insights.push({
        id: 'consistent_performance',
        type: 'positive',
        title: 'Consistent Performance',
        description: `${consistentHours.length} time slots show consistent win rates between 50-70%`,
        impact: 'medium',
        recommendation: 'You have consistent performance across multiple time slots. Focus on scaling these patterns.',
        data: consistentHours
      });
    }

    // Consistent Winner Patterns (Hours)
    const consistentWinnerHours = patternAnalysis.hourlyPatterns.filter(p => p.totalTrades >= 5 && p.winRate > 70);
    if (consistentWinnerHours.length > 0) {
      const hourLabels = consistentWinnerHours.map(p => `${p.value.toString().padStart(2, '0')}:00`).join(', ');
      insights.push({
        id: 'consistent_winner_hours',
        type: 'positive',
        title: 'Consistent Winner Hours',
        description: `These hours have a win rate above 70%: ${hourLabels}`,
        impact: 'high',
        recommendation: 'Focus your trading during these hours to maximize your edge.',
        data: consistentWinnerHours
      });
    }

    // Consistent Loser Patterns (Hours)
    const consistentLoserHours = patternAnalysis.hourlyPatterns.filter(p => p.totalTrades >= 5 && p.winRate < 30);
    if (consistentLoserHours.length > 0) {
      const hourLabels = consistentLoserHours.map(p => `${p.value.toString().padStart(2, '0')}:00`).join(', ');
      insights.push({
        id: 'consistent_loser_hours',
        type: 'warning',
        title: 'Consistent Loser Hours',
        description: `These hours have a win rate below 30%: ${hourLabels}`,
        impact: 'high',
        recommendation: 'Consider avoiding or reviewing your strategy during these hours.',
        data: consistentLoserHours
      });
    }

    // Consistent Winner Patterns (Days)
    const consistentWinnerDays = patternAnalysis.dayOfWeekPatterns.filter(p => p.totalTrades >= 3 && p.winRate > 70);
    if (consistentWinnerDays.length > 0) {
      const dayLabels = consistentWinnerDays.map(p => p.value).join(', ');
      insights.push({
        id: 'consistent_winner_days',
        type: 'positive',
        title: 'Consistent Winner Days',
        description: `These days have a win rate above 70%: ${dayLabels}`,
        impact: 'medium',
        recommendation: 'Plan your important trades for these days.',
        data: consistentWinnerDays
      });
    }

    // Consistent Loser Patterns (Days)
    const consistentLoserDays = patternAnalysis.dayOfWeekPatterns.filter(p => p.totalTrades >= 3 && p.winRate < 30);
    if (consistentLoserDays.length > 0) {
      const dayLabels = consistentLoserDays.map(p => p.value).join(', ');
      insights.push({
        id: 'consistent_loser_days',
        type: 'warning',
        title: 'Consistent Loser Days',
        description: `These days have a win rate below 30%: ${dayLabels}`,
        impact: 'medium',
        recommendation: 'Be cautious or reduce trading on these days.',
        data: consistentLoserDays
      });
    }

    // Consistent Winner/Loser Patterns (Sessions)
    const sessionWinners = [];
    const sessionLosers = [];
    if (patternAnalysis.sessionAnalysis.preMarket.totalTrades >= 3) {
      if (patternAnalysis.sessionAnalysis.preMarket.winRate > 70) sessionWinners.push('Pre-Market');
      if (patternAnalysis.sessionAnalysis.preMarket.winRate < 30) sessionLosers.push('Pre-Market');
    }
    if (patternAnalysis.sessionAnalysis.regular.totalTrades >= 3) {
      if (patternAnalysis.sessionAnalysis.regular.winRate > 70) sessionWinners.push('Regular');
      if (patternAnalysis.sessionAnalysis.regular.winRate < 30) sessionLosers.push('Regular');
    }
    if (patternAnalysis.sessionAnalysis.afterHours.totalTrades >= 3) {
      if (patternAnalysis.sessionAnalysis.afterHours.winRate > 70) sessionWinners.push('After Hours');
      if (patternAnalysis.sessionAnalysis.afterHours.winRate < 30) sessionLosers.push('After Hours');
    }
    if (sessionWinners.length > 0) {
      insights.push({
        id: 'consistent_winner_sessions',
        type: 'positive',
        title: 'Consistent Winner Sessions',
        description: `These sessions have a win rate above 70%: ${sessionWinners.join(', ')}`,
        impact: 'medium',
        recommendation: 'Consider focusing on these sessions for better results.',
        data: sessionWinners
      });
    }
    if (sessionLosers.length > 0) {
      insights.push({
        id: 'consistent_loser_sessions',
        type: 'warning',
        title: 'Consistent Loser Sessions',
        description: `These sessions have a win rate below 30%: ${sessionLosers.join(', ')}`,
        impact: 'medium',
        recommendation: 'Review or avoid trading in these sessions.',
        data: sessionLosers
      });
    }

    // High Volume/Activity Periods (Hours)
    const topActiveHours = [...patternAnalysis.hourlyPatterns]
      .filter(p => p.totalTrades > 0)
      .sort((a, b) => b.totalTrades - a.totalTrades)
      .slice(0, 3);
    if (topActiveHours.length > 0) {
      const hourLabels = topActiveHours.map(p => `${p.value.toString().padStart(2, '0')}:00 (${p.totalTrades} trades, ${p.winRate.toFixed(1)}% win)`).join('; ');
      insights.push({
        id: 'top_active_hours',
        type: 'opportunity',
        title: 'Most Active Hours',
        description: `Top trading hours: ${hourLabels}`,
        impact: 'medium',
        recommendation: 'Review your performance during these high-activity hours to optimize your trading schedule.',
        data: topActiveHours
      });
    }

    // High Volume/Activity Periods (Days)
    const topActiveDays = [...patternAnalysis.dayOfWeekPatterns]
      .filter(p => p.totalTrades > 0)
      .sort((a, b) => b.totalTrades - a.totalTrades)
      .slice(0, 3);
    if (topActiveDays.length > 0) {
      const dayLabels = topActiveDays.map(p => `${p.value} (${p.totalTrades} trades, ${p.winRate.toFixed(1)}% win)`).join('; ');
      insights.push({
        id: 'top_active_days',
        type: 'opportunity',
        title: 'Most Active Days',
        description: `Top trading days: ${dayLabels}`,
        impact: 'medium',
        recommendation: 'Analyze your trading on these days to identify patterns and opportunities.',
        data: topActiveDays
      });
    }

    // High Volume/Activity Periods (Sessions)
    const sessionStats = [
      { name: 'Pre-Market', ...patternAnalysis.sessionAnalysis.preMarket },
      { name: 'Regular', ...patternAnalysis.sessionAnalysis.regular },
      { name: 'After Hours', ...patternAnalysis.sessionAnalysis.afterHours }
    ];
    const topActiveSessions = sessionStats
      .filter(s => s.totalTrades > 0)
      .sort((a, b) => b.totalTrades - a.totalTrades)
      .slice(0, 2);
    if (topActiveSessions.length > 0) {
      const sessionLabels = topActiveSessions.map(s => `${s.name} (${s.totalTrades} trades, ${s.winRate.toFixed(1)}% win)`).join('; ');
      insights.push({
        id: 'top_active_sessions',
        type: 'opportunity',
        title: 'Most Active Sessions',
        description: `Top trading sessions: ${sessionLabels}`,
        impact: 'medium',
        recommendation: 'Consider focusing on these sessions or reviewing your strategy for high-activity periods.',
        data: topActiveSessions
      });
    }

    // Drawdown Hotspots (Hours)
    const topDrawdownHours = [...patternAnalysis.hourlyPatterns]
      .filter(p => p.totalTrades > 0)
      .sort((a, b) => b.maxDrawdown - a.maxDrawdown)
      .slice(0, 3);
    if (topDrawdownHours.length > 0 && topDrawdownHours[0].maxDrawdown > 0) {
      const hourLabels = topDrawdownHours.map(p => `${p.value.toString().padStart(2, '0')}:00 (Max DD: $${p.maxDrawdown.toFixed(2)})`).join('; ');
      insights.push({
        id: 'drawdown_hotspot_hours',
        type: 'warning',
        title: 'Drawdown Hotspot Hours',
        description: `Highest drawdowns occurred during: ${hourLabels}`,
        impact: 'high',
        recommendation: 'Exercise extra caution or adjust risk management during these hours.',
        data: topDrawdownHours
      });
    }

    // Drawdown Hotspots (Days)
    const topDrawdownDays = [...patternAnalysis.dayOfWeekPatterns]
      .filter(p => p.totalTrades > 0)
      .sort((a, b) => b.maxDrawdown - a.maxDrawdown)
      .slice(0, 3);
    if (topDrawdownDays.length > 0 && topDrawdownDays[0].maxDrawdown > 0) {
      const dayLabels = topDrawdownDays.map(p => `${p.value} (Max DD: $${p.maxDrawdown.toFixed(2)})`).join('; ');
      insights.push({
        id: 'drawdown_hotspot_days',
        type: 'warning',
        title: 'Drawdown Hotspot Days',
        description: `Highest drawdowns occurred on: ${dayLabels}`,
        impact: 'medium',
        recommendation: 'Review your trades and risk controls for these days.',
        data: topDrawdownDays
      });
    }

    // Drawdown Hotspots (Sessions)
    const topDrawdownSessions = [
      { name: 'Pre-Market', ...patternAnalysis.sessionAnalysis.preMarket },
      { name: 'Regular', ...patternAnalysis.sessionAnalysis.regular },
      { name: 'After Hours', ...patternAnalysis.sessionAnalysis.afterHours }
    ]
      .filter(s => s.totalTrades > 0)
      .sort((a, b) => b.maxDrawdown - a.maxDrawdown)
      .slice(0, 2);
    if (topDrawdownSessions.length > 0 && topDrawdownSessions[0].maxDrawdown > 0) {
      const sessionLabels = topDrawdownSessions.map(s => `${s.name} (Max DD: $${s.maxDrawdown.toFixed(2)})`).join('; ');
      insights.push({
        id: 'drawdown_hotspot_sessions',
        type: 'warning',
        title: 'Drawdown Hotspot Sessions',
        description: `Highest drawdowns occurred in: ${sessionLabels}`,
        impact: 'medium',
        recommendation: 'Be vigilant and consider stricter risk controls in these sessions.',
        data: topDrawdownSessions
      });
    }

    // Tag-Based Performance
    const tagStats: { [tagKey: string]: { tagGroup: string; tagValue: string; trades: Trade[]; winRate: number; totalTrades: number; profitFactor: number; totalProfit: number; } } = {};
    trades.forEach(trade => {
      Object.entries(trade.tags).forEach(([group, value]) => {
        const key = `${group}:${value}`;
        if (!tagStats[key]) tagStats[key] = { tagGroup: group, tagValue: value, trades: [], winRate: 0, totalTrades: 0, profitFactor: 0, totalProfit: 0 };
        tagStats[key].trades.push(trade);
      });
    });
    Object.values(tagStats).forEach(stat => {
      const wins = stat.trades.filter(t => t.profit > 0).length;
      const losses = stat.trades.filter(t => t.profit < 0).length;
      const totalProfit = stat.trades.reduce((sum, t) => sum + t.profit, 0);
      const totalWinningProfit = stat.trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
      const totalLosingProfit = Math.abs(stat.trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
      stat.totalTrades = stat.trades.length;
      stat.winRate = stat.trades.length > 0 ? (wins / stat.trades.length) * 100 : 0;
      stat.profitFactor = totalLosingProfit > 0 ? totalWinningProfit / totalLosingProfit : 0;
      stat.totalProfit = totalProfit;
    });
    const tagStatsArr = Object.values(tagStats).filter(stat => stat.totalTrades >= 3);
    const bestTags = [...tagStatsArr].sort((a, b) => b.winRate - a.winRate).slice(0, 3);
    const worstTags = [...tagStatsArr].sort((a, b) => a.winRate - b.winRate).slice(0, 3);
    if (bestTags.length > 0) {
      const tagLabels = bestTags.map(stat => `${stat.tagGroup}: ${stat.tagValue} (${stat.winRate.toFixed(1)}% win, ${stat.totalTrades} trades)`).join('; ');
      insights.push({
        id: 'best_tags',
        type: 'positive',
        title: 'Best Performing Tags',
        description: `Top tags by win rate: ${tagLabels}`,
        impact: 'high',
        recommendation: 'Focus on these tags/strategies to maximize your edge.',
        data: bestTags
      });
    }
    if (worstTags.length > 0) {
      const tagLabels = worstTags.map(stat => `${stat.tagGroup}: ${stat.tagValue} (${stat.winRate.toFixed(1)}% win, ${stat.totalTrades} trades)`).join('; ');
      insights.push({
        id: 'worst_tags',
        type: 'warning',
        title: 'Worst Performing Tags',
        description: `Lowest performing tags by win rate: ${tagLabels}`,
        impact: 'high',
        recommendation: 'Review or avoid these tags/strategies to improve results.',
        data: worstTags
      });
    }

    // Profit/Loss Distribution
    if (trades.length > 0) {
      const profits = trades.map(t => t.profit).sort((a, b) => a - b);
      const mean = profits.reduce((sum, p) => sum + p, 0) / profits.length;
      const median = profits.length % 2 === 0
        ? (profits[profits.length / 2 - 1] + profits[profits.length / 2]) / 2
        : profits[Math.floor(profits.length / 2)];
      const stdDev = Math.sqrt(profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / profits.length);
      const skewness = profits.reduce((sum, p) => sum + Math.pow((p - mean) / stdDev, 3), 0) / profits.length;
      const outliers = profits.filter(p => Math.abs(p - mean) > 2 * stdDev);
      let description = `Mean: $${mean.toFixed(2)}, Median: $${median.toFixed(2)}, Std Dev: $${stdDev.toFixed(2)}, Skewness: ${skewness.toFixed(2)}.`;
      if (outliers.length > 0) {
        description += ` There are ${outliers.length} outlier trades (>|2σ| from mean).`;
      }
      insights.push({
        id: 'pnl_distribution',
        type: 'opportunity',
        title: 'Profit/Loss Distribution',
        description,
        impact: 'medium',
        recommendation: outliers.length > 0
          ? 'Review outlier trades for risk management or strategy adjustment.'
          : 'Your trade results are consistent. Maintain your current risk management.',
        data: { mean, median, stdDev, skewness, outliers }
      });
    }

    // Holding Time Patterns (Seconds Granularity)
    const holdingBuckets = [
      { label: 'Ultra-Short (<30s)', filter: (t: Trade) => t.timeInTrade * 60 < 30 },
      { label: 'Short (30s-5min)', filter: (t: Trade) => t.timeInTrade * 60 >= 30 && t.timeInTrade <= 5 },
      { label: 'Medium (5-15min)', filter: (t: Trade) => t.timeInTrade > 5 && t.timeInTrade <= 15 },
      { label: 'Long (>30min)', filter: (t: Trade) => t.timeInTrade > 30 }
    ];
    const holdingStats = holdingBuckets.map(bucket => {
      const tradesInBucket = trades.filter(bucket.filter);
      const wins = tradesInBucket.filter(t => t.profit > 0).length;
      const losses = tradesInBucket.filter(t => t.profit < 0).length;
      const totalProfit = tradesInBucket.reduce((sum, t) => sum + t.profit, 0);
      const totalWinningProfit = tradesInBucket.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
      const totalLosingProfit = Math.abs(tradesInBucket.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
      const winRate = tradesInBucket.length > 0 ? (wins / tradesInBucket.length) * 100 : 0;
      const profitFactor = totalLosingProfit > 0 ? totalWinningProfit / totalLosingProfit : 0;
      return {
        label: bucket.label,
        totalTrades: tradesInBucket.length,
        winRate,
        profitFactor,
        totalProfit
      };
    }).filter(stat => stat.totalTrades > 0);
    if (holdingStats.length > 0) {
      const best = holdingStats.reduce((a, b) => (b.winRate > a.winRate ? b : a));
      const worst = holdingStats.reduce((a, b) => (b.winRate < a.winRate ? b : a));
      insights.push({
        id: 'best_holding_time',
        type: 'positive',
        title: 'Best Holding Time',
        description: `${best.label} has the highest win rate (${best.winRate.toFixed(1)}%, ${best.totalTrades} trades).`,
        impact: 'medium',
        recommendation: 'Consider focusing on this holding time for better results.',
        data: best
      });
      insights.push({
        id: 'worst_holding_time',
        type: 'warning',
        title: 'Worst Holding Time',
        description: `${worst.label} has the lowest win rate (${worst.winRate.toFixed(1)}%, ${worst.totalTrades} trades).`,
        impact: 'medium',
        recommendation: 'Review your strategy for this holding time or consider reducing exposure.',
        data: worst
      });
    }

    // --- Advanced/Behavioral Insights ---
    const edgeResult = discoverEdges(trades);
    // Streaks and pattern-based edges
    edgeResult.topEdges.forEach(edge => {
      insights.push({
        id: `edge_${edge.description.replace(/\s+/g, '_').toLowerCase()}`,
        type: edge.riskLevel === 'low' ? 'positive' : edge.riskLevel === 'medium' ? 'opportunity' : 'warning',
        title: edge.description,
        description: `Edge confidence: ${(edge.confidence * 100).toFixed(0)}%. ${edge.recommendations[0] || ''}`,
        impact: edge.riskLevel === 'low' ? 'high' : edge.riskLevel === 'medium' ? 'medium' : 'high',
        recommendation: edge.recommendations.join(' '),
        data: edge.metrics
      });
    });
    // Behavioral patterns
    edgeResult.behavioralPatterns.forEach(pattern => {
      insights.push({
        id: `behavior_${pattern.pattern.replace(/\s+/g, '_').toLowerCase()}`,
        type: pattern.successRate > 0.6 ? 'positive' : pattern.successRate > 0.4 ? 'opportunity' : 'warning',
        title: `Behavioral: ${pattern.pattern}`,
        description: `Frequency: ${(pattern.frequency * 100).toFixed(1)}%. Consistency: ${(pattern.consistency * 100).toFixed(1)}%.`,
        impact: pattern.successRate > 0.6 ? 'medium' : 'low',
        recommendation: `Avg Profit: $${pattern.avgProfit.toFixed(2)}, Avg Loss: $${pattern.avgLoss.toFixed(2)}`,
        data: pattern
      });
    });
    // Risk assessment
    if (edgeResult.riskAssessment) {
      insights.push({
        id: 'risk_assessment',
        type: edgeResult.riskAssessment.overallRisk === 'low' ? 'positive' : edgeResult.riskAssessment.overallRisk === 'medium' ? 'warning' : 'negative',
        title: 'Risk Assessment',
        description: `Overall risk: ${edgeResult.riskAssessment.overallRisk}. ${edgeResult.riskAssessment.specificRisks.join(' ')}`,
        impact: edgeResult.riskAssessment.overallRisk === 'low' ? 'medium' : 'high',
        recommendation: edgeResult.riskAssessment.mitigationStrategies.join(' '),
        data: edgeResult.riskAssessment
      });
    }

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  };

  const insights = useMemo(() => generateInsights(), [patternAnalysis]);

  // Helper to categorize insights
  const categorizeInsight = (insight: Insight): SectionName => {
    const id = insight.id.toLowerCase();
    const title = insight.title.toLowerCase();
    if (
      id.includes('hour') || id.includes('day') || id.includes('session') ||
      title.includes('hour') || title.includes('day') || title.includes('session') ||
      id.includes('frequency') || id.includes('drawdown')
    ) {
      return 'Trading Hours Performance';
    }
    if (id.includes('tag')) {
      return 'Tags/Strategies';
    }
    if (id.includes('edge_') || id.includes('behavior_') || id.includes('streak') || title.includes('streak') || title.includes('behavioral')) {
      return 'Behavioral/Edge';
    }
    if (id.includes('risk') || id.includes('distribution') || id.includes('drawdown')) {
      return 'Risk/Distribution';
    }
    return 'Other';
  };

  // Group insights by category
  const groupedInsights = useMemo(() => {
    const groups: Record<SectionName, Insight[]> = {
      'Trading Hours Performance': [],
      'Tags/Strategies': [],
      'Behavioral/Edge': [],
      'Risk/Distribution': [],
      'Other': []
    };
    insights.forEach((insight: Insight) => {
      const cat = categorizeInsight(insight);
      groups[cat].push(insight);
    });
    return groups;
  }, [insights]);

  // Collapsible state for each section
  const [openSections, setOpenSections] = useState<Record<SectionName, boolean>>({
    'Trading Hours Performance': true,
    'Tags/Strategies': true,
    'Behavioral/Edge': true,
    'Risk/Distribution': true,
    'Other': true
  });
  const toggleSection = (section: SectionName) => setOpenSections(s => ({ ...s, [section]: !s[section] }));

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUpIcon className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <TrendingDownIcon className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'opportunity':
        return <LightBulbIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <LightBulbIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'opportunity':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactBadge = (impact: Insight['impact']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[impact]}`}>
        {impact.toUpperCase()} IMPACT
      </span>
    );
  };

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <LightBulbIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
        <p className="text-gray-500">Add some trades to generate pattern insights.</p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">More Data Needed</h3>
        <p className="text-gray-500">Add more trades to generate meaningful pattern insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-900 text-gray-100 p-2 md:p-6 rounded-xl">
      {/* Sticky Summary Bar */}
      <div className="sticky top-0 z-10 bg-white text-gray-900 p-4 rounded-lg shadow-sm border mb-4 flex flex-wrap gap-4 justify-center">
        <div className="text-center p-2 bg-green-50 rounded-lg min-w-[100px]">
          <div className="text-xl font-bold text-green-600">
            {insights.filter(i => i.type === 'positive').length}
          </div>
          <div className="text-xs text-gray-600">Positive</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg min-w-[100px]">
          <div className="text-xl font-bold text-blue-600">
            {insights.filter(i => i.type === 'opportunity').length}
          </div>
          <div className="text-xs text-gray-600">Opportunities</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded-lg min-w-[100px]">
          <div className="text-xl font-bold text-yellow-600">
            {insights.filter(i => i.type === 'warning').length}
          </div>
          <div className="text-xs text-gray-600">Warnings</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-lg min-w-[100px]">
          <div className="text-xl font-bold text-red-600">
            {insights.filter(i => i.type === 'negative').length}
          </div>
          <div className="text-xs text-gray-600">Issues</div>
        </div>
      </div>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-purple-400">Pattern Insights</h2>
        <p className="text-gray-300">AI-powered insights to optimize your trading strategy</p>
      </div>
      {/* Grouped Sections */}
      {Object.entries(groupedInsights).map(([section, sectionInsights]) => (
        (sectionInsights as Insight[]).length > 0 && (
          <div key={section} className="mb-6">
            <button
              className="w-full flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg text-lg font-bold text-purple-200 focus:outline-none"
              onClick={() => toggleSection(section as SectionName)}
            >
              <span>{section}</span>
              <span>{openSections[section as SectionName] ? '−' : '+'}</span>
            </button>
            {openSections[section as SectionName] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 justify-items-center bg-gray-800 rounded-b-lg p-4">
                {(sectionInsights as Insight[]).map((insight: Insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        )
      ))}
    </div>
  );
}; 