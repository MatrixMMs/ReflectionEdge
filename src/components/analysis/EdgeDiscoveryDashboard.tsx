import React, { useState, useMemo } from 'react';
import { Trade, AdvancedTagGroup, TagCategory } from '../../types';
import { discoverEdges, EdgeDiscoveryResult, EdgeAnalysis, MarketCondition, BehavioralPattern } from '../../utils/edgeDiscovery';
import { TrendingUpIcon, ShieldCheckIcon, ExclamationTriangleIcon, LightBulbIcon, ClockIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon, BrainIcon } from '../ui/Icons';
import { filterTradesByDateAndTags } from '../../utils/chartDataProcessor';
import { ADVANCED_TAGS } from '../../constants/advancedTags';

interface EdgeDiscoveryDashboardProps {
  trades: Trade[];
  tagGroups: AdvancedTagGroup[];
}

export const EdgeDiscoveryDashboard: React.FC<EdgeDiscoveryDashboardProps> = ({ 
  trades, 
  tagGroups = ADVANCED_TAGS 
}) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<{[groupId: string]: string[]}>({});
  const [tagFilterLogic, setTagFilterLogic] = useState<'AND' | 'OR'>('OR');
  const [collapsedCategories, setCollapsedCategories] = React.useState<{ [category: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleTagChange = (groupId: string, subTagId: string) => {
    setSelectedTags(prev => {
      const currentGroupTags = prev[groupId] || [];
      const newGroupTags = currentGroupTags.includes(subTagId)
        ? currentGroupTags.filter(id => id !== subTagId)
        : [...currentGroupTags, subTagId];
      
      if (newGroupTags.length === 0) {
        const { [groupId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [groupId]: newGroupTags };
    });
  };

  const handleAdvancedTagSelect = (category: TagCategory, groupId: string, tagId: string) => {
    handleTagChange(groupId, tagId);
  };

  const isTagSelected = (category: TagCategory, groupId: string, tagId: string) => {
    return selectedTags[groupId]?.includes(tagId) || false;
  };

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredAdvancedTags = tagGroups.filter(group => {
    if (!searchQuery) return true;
    return group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           group.subtags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const filteredTrades = useMemo(() => {
    const dateRange = {
      start: startDate || '1970-01-01',
      end: endDate || new Date().toISOString().split('T')[0],
    };
    return filterTradesByDateAndTags(trades, dateRange, selectedTags, tagFilterLogic);
  }, [trades, startDate, endDate, selectedTags, tagFilterLogic]);

  const analysisResult = discoverEdges(filteredTrades);

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
      {/* Filter Controls */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center gap-2">
          <FilterIcon className="w-5 h-5" />
          Filter Analysis
          <span className="text-sm text-blue-400">(Advanced Tags)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="edge-start-date" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              id="edge-start-date"
              value={startDate || ''}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="edge-end-date" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              id="edge-end-date"
              value={endDate || ''}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-200 mb-2">Filter by Tags</h4>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm font-medium text-gray-300">Logic:</span>
            <button
              onClick={() => setTagFilterLogic('OR')}
              className={`px-3 py-1 text-sm rounded-md ${tagFilterLogic === 'OR' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              OR (any selected tag)
            </button>
            <button
              onClick={() => setTagFilterLogic('AND')}
              className={`px-3 py-1 text-sm rounded-md ${tagFilterLogic === 'AND' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              AND (all selected tags)
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
            />
          </div>

          {/* Advanced Tag System */}
          <div className="space-y-4">
            {/* Objective Tags */}
            <div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleCategoryCollapse('objective')}
                  className="flex items-center space-x-2 text-lg font-semibold text-blue-400 hover:text-blue-300"
                >
                  {collapsedCategories['objective'] ? (
                    <ChevronDownIcon className="w-5 h-5" />
                  ) : (
                    <ChevronUpIcon className="w-5 h-5" />
                  )}
                  <LightBulbIcon className="w-5 h-5" />
                  <span>Objective Tags (Market's Story)</span>
                </button>
              </div>

              {!collapsedCategories['objective'] && (
                <div className="ml-6 space-y-4 mt-3">
                  {filteredAdvancedTags
                    .filter(group => group.category === 'objective')
                    .map(group => (
                      <div key={group.id} className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-md font-medium text-blue-300">
                            {group.name}
                            <span className="ml-2 text-xs text-gray-400">({group.subcategory.replace('_', ' ')})</span>
                          </h4>
                          <span className="text-xs text-gray-400">{group.subtags.length} tags</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{group.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {group.subtags.map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => handleAdvancedTagSelect('objective', group.id, tag.id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isTagSelected('objective', group.id, tag.id)
                                  ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800'
                                  : 'hover:bg-gray-700'
                              }`}
                              style={{ backgroundColor: tag.color }}
                              title={tag.description}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Subjective Tags */}
            <div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleCategoryCollapse('subjective')}
                  className="flex items-center space-x-2 text-lg font-semibold text-orange-400 hover:text-orange-300"
                >
                  {collapsedCategories['subjective'] ? (
                    <ChevronDownIcon className="w-5 h-5" />
                  ) : (
                    <ChevronUpIcon className="w-5 h-5" />
                  )}
                  <BrainIcon className="w-5 h-5" />
                  <span>Subjective Tags (Trader's Story)</span>
                </button>
              </div>

              {!collapsedCategories['subjective'] && (
                <div className="ml-6 space-y-4 mt-3">
                  {filteredAdvancedTags
                    .filter(group => group.category === 'subjective')
                    .map(group => (
                      <div key={group.id} className="bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-md font-medium text-orange-300">
                            {group.name}
                            <span className="ml-2 text-xs text-gray-400">({group.subcategory.replace('_', ' ')})</span>
                          </h4>
                          <span className="text-xs text-gray-400">{group.subtags.length} tags</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{group.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {group.subtags.map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => handleAdvancedTagSelect('subjective', group.id, tag.id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isTagSelected('subjective', group.id, tag.id)
                                  ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-800'
                                  : 'hover:bg-gray-700'
                              }`}
                              style={{ backgroundColor: tag.color }}
                              title={tag.description}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setSelectedTags({});
            setSearchQuery('');
          }}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear All Filters
        </button>
      </div>

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
        <p className="text-xs text-gray-500 mt-2">
          (Based on {filteredTrades.length} trades)
        </p>
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
                    <p className="text-gray-400 text-sm">Not enough data for behavioral patterns with current filters.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 