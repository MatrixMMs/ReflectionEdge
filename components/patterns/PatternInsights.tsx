import React, { useMemo } from 'react';
import { Trade } from '../../types';
import { analyzeTimePatterns, TimePattern } from '../../utils/patternRecognition';
import { TrendingUpIcon, TrendingDownIcon, ExclamationTriangleIcon, LightBulbIcon, ClockIcon, CalendarIcon } from '../ui/Icons';

interface PatternInsightsProps {
  trades: Trade[];
}

interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  data?: any;
}

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

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  };

  const insights = useMemo(() => generateInsights(), [patternAnalysis]);

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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-purple-400">Pattern Insights</h2>
        <p className="text-gray-300">AI-powered insights to optimize your trading strategy</p>
      </div>

      {/* Insights Grid */}
      <div className="flex flex-wrap gap-6">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`flex-1 min-w-[300px] max-w-[400px] p-6 rounded-lg border shadow bg-white text-gray-900 ${getInsightColor(insight.type)}`}
            style={{ flexBasis: '350px' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getInsightIcon(insight.type)}
                <h3 className="ml-2 text-lg font-semibold text-gray-900">{insight.title}</h3>
              </div>
              {getImpactBadge(insight.impact)}
            </div>
            
            <p className="text-gray-800 mb-4">{insight.description}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
              <p className="text-gray-800 text-sm">{insight.recommendation}</p>
            </div>

            {/* Additional Data */}
            {insight.data && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                {insight.data.winRate && (
                  <div>
                    <span className="text-gray-500">Win Rate:</span>
                    <span className="ml-2 font-medium">{insight.data.winRate.toFixed(1)}%</span>
                  </div>
                )}
                {insight.data.totalTrades && (
                  <div>
                    <span className="text-gray-500">Trades:</span>
                    <span className="ml-2 font-medium">{insight.data.totalTrades}</span>
                  </div>
                )}
                {insight.data.profitFactor && (
                  <div>
                    <span className="text-gray-500">Profit Factor:</span>
                    <span className="ml-2 font-medium">{insight.data.profitFactor.toFixed(2)}</span>
                  </div>
                )}
                {insight.data.totalProfit && (
                  <div>
                    <span className="text-gray-500">Total Profit:</span>
                    <span className="ml-2 font-medium">${insight.data.totalProfit.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Insights Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.type === 'positive').length}
            </div>
            <div className="text-sm text-gray-600">Positive Insights</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.type === 'opportunity').length}
            </div>
            <div className="text-sm text-gray-600">Opportunities</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {insights.filter(i => i.type === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.type === 'negative').length}
            </div>
            <div className="text-sm text-gray-600">Issues</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 