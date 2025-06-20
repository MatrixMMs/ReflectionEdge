import React from 'react';
import { Trade } from '../../types';
import { discoverEdges, EdgeDiscoveryResult, EdgeAnalysis, MarketCondition, BehavioralPattern } from '../../utils/edgeDiscovery';
import { TrendingUpIcon, ShieldCheckIcon, ExclamationTriangleIcon, LightBulbIcon, ClockIcon } from '../ui/Icons';

interface EdgeDiscoveryDashboardProps {
  trades: Trade[];
}

export const EdgeDiscoveryDashboard: React.FC<EdgeDiscoveryDashboardProps> = ({ trades }) => {
  const analysisResult = discoverEdges(trades);

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return 'text-green-400';
    if (confidence > 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
    }
  };

  const EdgeCard: React.FC<{ edge: EdgeAnalysis }> = ({ edge }) => (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-400">{edge.description}</h4>
      <p className="text-xs text-gray-400 mb-2">Type: {edge.edgeType}</p>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold">Confidence:</span>
        <span className={`font-bold text-lg ${getConfidenceColor(edge.confidence)}`}>
          {(edge.confidence * 100).toFixed(1)}%
        </span>
      </div>
      <div className="text-xs space-y-1">
        <p>Win Rate: {(edge.metrics.winRate * 100).toFixed(1)}%</p>
        <p>Profit Factor: {edge.metrics.profitFactor.toFixed(2)}</p>
        <p>Trades: {edge.metrics.totalTrades}</p>
      </div>
      <div className="mt-2">
        <p className="text-xs font-semibold">Recommendations:</p>
        <ul className="list-disc list-inside text-xs text-gray-300">
          {edge.recommendations.slice(0, 2).map((rec, i) => <li key={i}>{rec}</li>)}
        </ul>
      </div>
    </div>
  );

  const BehavioralPatternCard: React.FC<{ pattern: BehavioralPattern }> = ({ pattern }) => (
    <div className="bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-400">{pattern.pattern}</h4>
        <div className="mt-2 text-xs space-y-1">
            <p>Success Rate: <span className="font-bold">{(pattern.successRate * 100).toFixed(1)}%</span></p>
            <p>Avg Profit: <span className="font-bold text-green-400">${pattern.avgProfit.toFixed(2)}</span></p>
            <p>Avg Loss: <span className="font-bold text-red-400">${pattern.avgLoss.toFixed(2)}</span></p>
            <p>Consistency: <span className="font-bold">{pattern.consistency.toFixed(2)}</span></p>
        </div>
    </div>
  );

  if (trades.length < 20) {
    return (
      <div className="text-center text-gray-400 p-8">
        <p>
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          Need at least 20 trades for a meaningful edge discovery analysis.
        </p>
        <p className="text-sm mt-2">Keep trading and logging to unlock these insights!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2">
      {/* Overall Edge Summary */}
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center justify-center gap-2">
          <TrendingUpIcon className="w-6 h-6" />
          Overall Edge Assessment
        </h2>
        <div className={`text-6xl font-bold my-4 ${getConfidenceColor(analysisResult.overallEdge)}`}>
          {(analysisResult.overallEdge * 100).toFixed(1)}%
        </div>
        <p className="text-gray-300">This score represents the overall statistical advantage identified in your trading data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Edges & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Top Identified Edges</h3>
            {analysisResult.topEdges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.topEdges.map((edge, i) => <EdgeCard key={i} edge={edge} />)}
              </div>
            ) : (
              <p className="text-gray-400">No significant edges identified yet. Keep logging trades!</p>
            )}
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">Actionable Recommendations</h3>
            <ul className="space-y-2">
              {analysisResult.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start">
                  <LightBulbIcon className="w-5 h-5 mr-2 mt-1 text-yellow-400 flex-shrink-0" />
                  <span className="text-gray-200">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Risk & Behavioral */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-red-400">Risk Assessment</h3>
            <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">Overall Risk:</span>
                <span className={`font-bold text-lg flex items-center gap-1 ${getRiskColor(analysisResult.riskAssessment.overallRisk)}`}>
                    <ShieldCheckIcon className="w-5 h-5" />
                    {analysisResult.riskAssessment.overallRisk.toUpperCase()}
                </span>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Specific Risks:</p>
              <ul className="list-disc list-inside text-sm text-gray-300">
                {analysisResult.riskAssessment.specificRisks.map((risk, i) => <li key={i}>{risk}</li>)}
              </ul>
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold mb-1">Mitigation Strategies:</p>
              <ul className="list-disc list-inside text-sm text-gray-300">
                {analysisResult.riskAssessment.mitigationStrategies.map((strat, i) => <li key={i}>{strat}</li>)}
              </ul>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Behavioral Patterns</h3>
            <div className="space-y-4">
                {analysisResult.behavioralPatterns.length > 0 ? (
                    analysisResult.behavioralPatterns.map((pattern, i) => <BehavioralPatternCard key={i} pattern={pattern} />)
                ) : (
                    <p className="text-gray-400 text-sm">Not enough data to identify behavioral patterns.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 