import React, { useState, useMemo } from 'react';
import { Trade, AdvancedTagGroup, TagCategory } from '../../types';
import { KellyAnalysis, calculateKellyCriterion, calculateKellyByTimeframe, calculateKellyBySymbol, calculateKellyByTag, getTagMetadata } from '../../utils/kellyCriterion';
import { filterTradesByDateAndTags } from '../../utils/chartDataProcessor';
import { Button } from '../ui/Button';
import { CalculatorIcon, TrendingUpIcon, ShieldCheckIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, LightBulbIcon, BrainIcon } from '../ui/Icons';
import { ADVANCED_TAGS } from '../../constants/advancedTags';

interface KellyCriterionAnalysisProps {
  trades: Trade[];
  tagGroups: AdvancedTagGroup[];
}

export const KellyCriterionAnalysis: React.FC<KellyCriterionAnalysisProps> = ({ 
  trades, 
  tagGroups = ADVANCED_TAGS
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('All Trades');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('All Symbols');
  const [selectedTags, setSelectedTags] = useState<{[groupId: string]: string[]}>({});
  const [tagComparisonMode, setTagComparisonMode] = useState<'AND' | 'OR'>('OR');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = React.useState<{ [category: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrades = useMemo(() => {
    const hasSelectedTags = Object.values(selectedTags).some(tags => tags.length > 0);
    if (!hasSelectedTags) {
        return trades;
    }
    const wideDateRange = { start: '1900-01-01', end: '2100-01-01' };
    return filterTradesByDateAndTags(trades, wideDateRange, selectedTags, tagComparisonMode);
  }, [trades, selectedTags, tagComparisonMode]);

  const timeframeAnalysis = calculateKellyByTimeframe(filteredTrades);
  const symbolAnalysis = calculateKellyBySymbol(filteredTrades);
  const tagAnalysis = calculateKellyByTag(filteredTrades, tagGroups);
  const tagMetadata = getTagMetadata(tagGroups);

  const symbols = [...new Set(filteredTrades.map(trade => trade.symbol))];
  const timeframes = Object.keys(timeframeAnalysis);

  // Sort tags by Kelly percentage for comparison
  const sortedTags = Object.entries(tagAnalysis)
    .map(([tagId, analysis]) => ({
      tagId,
      analysis,
      metadata: tagMetadata[tagId]
    }))
    .filter(item => item.metadata && item.analysis.fullKelly.totalTrades >= 1) // Only show tags with at least 1 trade
    .sort((a, b) => b.analysis.fullKelly.kellyPercentage - a.analysis.fullKelly.kellyPercentage);

  const timeframeFilters: { [key: string]: (trade: Trade) => boolean } = {
    'All Trades': () => true,
    'Long Trades': (trade) => trade.direction === 'long',
    'Short Trades': (trade) => trade.direction === 'short',
    'Quick Trades (< 5 min)': (trade) => trade.timeInTrade < 5,
    'Medium Trades (5-30 min)': (trade) => trade.timeInTrade >= 5 && trade.timeInTrade <= 30,
    'Longer Trades (> 30 min)': (trade) => trade.timeInTrade > 30,
  };

  const currentAnalysis = useMemo(() => {
    let tradesForMainDisplay = filteredTrades;

    if (selectedSymbol !== 'All Symbols') {
      tradesForMainDisplay = tradesForMainDisplay.filter(t => t.symbol === selectedSymbol);
    }
    
    if (selectedTimeframe !== 'All Trades') {
      tradesForMainDisplay = tradesForMainDisplay.filter(timeframeFilters[selectedTimeframe]);
    }

    return calculateKellyCriterion(tradesForMainDisplay);
  }, [filteredTrades, selectedSymbol, selectedTimeframe, timeframeFilters]);

  const handleTagChange = (groupId: string, subTagId: string) => {
    setSelectedTags(prev => {
      const currentTags = prev[groupId] || [];
      const newTags = currentTags.includes(subTagId) 
        ? currentTags.filter(id => id !== subTagId)
        : [...currentTags, subTagId];
      return { ...prev, [groupId]: newTags };
    });
  };

  const handleAdvancedTagSelect = (category: TagCategory, groupId: string, tagId: string) => {
    handleTagChange(groupId, tagId);
  };

  const isTagSelected = (category: TagCategory, groupId: string, tagId: string) => {
    return selectedTags[groupId]?.includes(tagId) || false;
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
          case 'high': return 'text-success';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-error';
      default: return 'text-gray-400';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <ShieldCheckIcon className="w-4 h-4" />;
      case 'medium': return <TrendingUpIcon className="w-4 h-4" />;
      case 'low': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <CalculatorIcon className="w-4 h-4" />;
    }
  };

  const getRiskOfRuinColor = (risk: number) => {
    if (risk < 0.1) return 'text-success';
    if (risk < 0.3) return 'text-yellow-400';
    return 'text-error';
  };

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredAdvancedTags = tagGroups.filter(group => {
    if (!searchQuery) return true;
    return group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           group.subtags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <CalculatorIcon className="w-6 h-6" />
            Kelly Criterion Analysis
            <span className="text-sm text-blue-400">(Advanced Tags)</span>
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="secondary"
              size="sm"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4">
          Use the filters below to analyze different segments of your trading data. This can help you find which specific strategies, symbols, or timeframes have a statistical edge.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe} value={timeframe}>{timeframe}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
            <select
              value={selectedSymbol}
              onChange={(e) => {
                setSelectedSymbol(e.target.value);
              }}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
            >
              <option value="All Symbols">All Symbols</option>
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Tags Section */}
        {Object.keys(selectedTags).length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {Object.entries(selectedTags).flatMap(([groupId, subTagIds]) =>
              subTagIds.map(subTagId => {
                const group = tagGroups.find(g => g.id === groupId);
                const subTag = group?.subtags.find(st => st.id === subTagId);
                if (!subTag) return null;
                return (
                  <button
                    key={groupId + '-' + subTagId}
                    type="button"
                    onClick={() => handleTagChange(groupId, subTagId)}
                    className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-white mr-2 mb-2 transition-colors hover:bg-gray-600"
                  >
                    {subTag.name + ' ×'}
                  </button>
                );
              })
            )}
            <button
              type="button"
              onClick={() => setSelectedTags({})}
              className="text-error"
              style={{ background: 'none', border: 'none', padding: 0, minWidth: 0 }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Advanced Tag System */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
            />
          </div>

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

      {/* Main Kelly Results */}
      {filteredTrades.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Position Sizing Recommendations */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Position Sizing Recommendations</h3>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-success">Full Kelly</span>
                <span className="text-2xl font-bold text-success">
                      {currentAnalysis.fullKelly.recommendedPositionSize.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Maximum growth potential (highest risk)</p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-yellow-400">Half Kelly</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {currentAnalysis.halfKelly.recommendedPositionSize.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Balanced approach (recommended)</p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-orange-400">Quarter Kelly</span>
                    <span className="text-2xl font-bold text-orange-400">
                      {currentAnalysis.quarterKelly.recommendedPositionSize.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Conservative approach</p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-error">Conservative</span>
                <span className="text-2xl font-bold text-error">
                      {currentAnalysis.conservativeKelly.recommendedPositionSize.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Maximum safety (max 2%)</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {(currentAnalysis.fullKelly.winRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {currentAnalysis.fullKelly.profitFactor.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Profit Factor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    ${currentAnalysis.fullKelly.averageWin.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Avg Win</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-error">
                    ${Math.abs(currentAnalysis.fullKelly.averageLoss).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Avg Loss</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Trades:</span>
                  <span className="font-semibold">{currentAnalysis.fullKelly.totalTrades}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Net Profit:</span>
                  <span className={`font-semibold ${currentAnalysis.fullKelly.netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                    ${currentAnalysis.fullKelly.netProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Confidence:</span>
                  <span className={`font-semibold flex items-center gap-1 ${getConfidenceColor(currentAnalysis.fullKelly.confidence)}`}>
                    {getConfidenceIcon(currentAnalysis.fullKelly.confidence)}
                    {currentAnalysis.fullKelly.confidence.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Risk of Ruin:</span>
                  <span className={`font-semibold ${getRiskOfRuinColor(currentAnalysis.fullKelly.riskOfRuin)}`}>
                    {(currentAnalysis.fullKelly.riskOfRuin * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">Recommendation</h3>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-100">{currentAnalysis.fullKelly.recommendation}</p>
            </div>
          </div>

          {/* Tag Comparison - Always Visible */}
          {sortedTags.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-teal-400">Strategy Performance Comparison</h3>
              <p className="text-gray-300 mb-4">Compare Kelly performance across your trading strategies to identify which ones have the best edge.</p>
              
              {/* Top Performers Summary */}
              {sortedTags.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-100 mb-3">Top Performing Strategies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sortedTags.slice(0, 3).map(({ tagId, analysis, metadata }, index) => (
                      <div key={tagId} className="text-center">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">#{index + 1}</div>
                        <div className="font-semibold text-gray-100 mb-1">{metadata.name}</div>
                        <div className="text-lg font-bold text-success">
                          {(analysis.fullKelly.kellyPercentage * 100).toFixed(1)}% Kelly
                        </div>
                        <div className="text-sm text-gray-400">
                          {analysis.fullKelly.totalTrades} trades • {(analysis.fullKelly.winRate * 100).toFixed(1)}% win rate
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTags.map(({ tagId, analysis, metadata }) => (
                  <div key={tagId} className="bg-gray-700 p-4 rounded-lg border-l-4" style={{ borderLeftColor: metadata.color }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-100">{metadata.name}</h4>
                      <span className="text-xs text-gray-400">{metadata.groupName}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Kelly %:</span>
                        <span className={`font-semibold ${analysis.fullKelly.kellyPercentage > 0.1 ? 'text-success' : analysis.fullKelly.kellyPercentage > 0.05 ? 'text-yellow-400' : 'text-error'}`}>
                          {(analysis.fullKelly.kellyPercentage * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="font-semibold">{(analysis.fullKelly.winRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit Factor:</span>
                        <span className="font-semibold">{analysis.fullKelly.profitFactor.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trades:</span>
                        <span className="font-semibold">{analysis.fullKelly.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Net Profit:</span>
                        <span className={`font-semibold ${analysis.fullKelly.netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                          ${analysis.fullKelly.netProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Analysis */}
          {showAdvanced && (
            <div className="space-y-6">
              {/* Timeframe Comparison */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">Timeframe Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(timeframeAnalysis).map(([timeframe, analysis]) => (
                    <div key={timeframe} className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">{timeframe}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Kelly %:</span>
                          <span className="font-semibold">{(analysis.fullKelly.kellyPercentage * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate:</span>
                          <span className="font-semibold">{(analysis.fullKelly.winRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trades:</span>
                          <span className="font-semibold">{analysis.fullKelly.totalTrades}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Symbol Comparison */}
              {symbols.length > 1 && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">Symbol Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(symbolAnalysis).map(([symbol, analysis]) => (
                      <div key={symbol} className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">{symbol}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Kelly %:</span>
                            <span className="font-semibold">{(analysis.fullKelly.kellyPercentage * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Win Rate:</span>
                            <span className="font-semibold">{(analysis.fullKelly.winRate * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Trades:</span>
                            <span className="font-semibold">{analysis.fullKelly.totalTrades}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
          <p>No trades match the selected filters.</p>
          <p className="text-sm mt-2">Try adjusting your filters to see an analysis.</p>
        </div>
      )}
    </div>
  );
}; 