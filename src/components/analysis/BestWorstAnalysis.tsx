import React, { useState, useMemo } from 'react';
import { Trade } from '../../types';
import { Button } from '../ui/Button';
import { TradeDetailsView } from '../trades/TradeDetailsView';

interface BestWorstAnalysisProps {
  trades: Trade[];
  onUpdateTrade?: (updatedTrade: Trade) => void;
}

type ViewMode = 'split' | 'best' | 'worst';

export const BestWorstAnalysis: React.FC<BestWorstAnalysisProps> = ({ trades, onUpdateTrade }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const bestTrades = useMemo(() => 
    trades.filter(trade => trade.isBestTrade).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [trades]
  );

  const worstTrades = useMemo(() => 
    trades.filter(trade => trade.isWorstTrade).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [trades]
  );

  const handleTradeSelect = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const handleBackToList = () => {
    setSelectedTrade(null);
  };

  const handleTradeUpdate = (updatedTrade: Trade) => {
    if (onUpdateTrade) {
      onUpdateTrade(updatedTrade);
    }
    setSelectedTrade(updatedTrade);
  };

  const TradeCard = ({ trade, type }: { trade: Trade; type: 'best' | 'worst' }) => (
    <div 
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
        type === 'best' 
          ? 'bg-green-900/30 border-green-500 hover:bg-green-900/50' 
          : 'bg-red-900/30 border-red-500 hover:bg-red-900/50'
      }`}
      onClick={() => handleTradeSelect(trade)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{type === 'best' ? '⭐' : '👎'}</span>
                          <span className="font-semibold text-lg text-main">{trade.symbol}</span>
        </div>
        <span className={`inline-flex items-center text-left text-xs font-semibold border font-mono w-16 h-7 ${
          trade.direction === 'long' 
            ? 'text-blue-400 border-blue-400' 
            : 'text-orange-400 border-orange-400'
        }`} style={{ borderRadius: 0, background: 'none', justifyContent: 'flex-start' }}>
          {trade.direction === 'long' ? 'LONG' : 'SHORT'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-400">P&L:</span>
                          <span className={`ml-1 font-semibold ${trade.profit >= 0 ? 'text-success' : 'text-error'}`}>
            ${trade.profit.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Date:</span>
                      <span className="ml-1">{new Date(trade.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>

      {trade.extendedReflection && (
        <div className="text-xs text-gray-300 space-y-1">
          {trade.extendedReflection.setup && (
            <div><strong>Setup:</strong> {trade.extendedReflection.setup.substring(0, 100)}...</div>
          )}
          {trade.extendedReflection.lessons && (
            <div><strong>Lesson:</strong> {trade.extendedReflection.lessons.substring(0, 100)}...</div>
          )}
        </div>
      )}
    </div>
  );

  const TradeList = ({ trades, type, title }: { trades: Trade[]; type: 'best' | 'worst'; title: string }) => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">{type === 'best' ? '⭐' : '👎'}</span>
          {title} ({trades.length})
        </h2>
        {viewMode === 'split' && (
          <Button 
            variant="secondary" 
            onClick={() => setViewMode(type)}
            className="text-sm"
          >
            Expand View
          </Button>
        )}
      </div>
      
      {trades.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">{type === 'best' ? '⭐' : '👎'}</div>
            <div>No {type} trades found</div>
            <div className="text-sm">Flag trades as {type} to see them here</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {trades.map(trade => (
            <TradeCard key={trade.id} trade={trade} type={type} />
          ))}
        </div>
      )}
    </div>
  );

  if (selectedTrade) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Button variant="secondary" onClick={handleBackToList}>
            ← Back to List
          </Button>
          <h2 className="text-xl font-bold">
            {selectedTrade.isBestTrade ? '⭐' : '👎'} <span className="text-main">{selectedTrade.symbol}</span> - {new Date(selectedTrade.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TradeDetailsView trade={selectedTrade} playbookEntries={[]} onUpdateTrade={handleTradeUpdate} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Best & Worst Trade Analysis</h1>
        {viewMode !== 'split' && (
          <Button variant="secondary" onClick={() => setViewMode('split')}>
            ← Back to Split View
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-6">
        {/* Best Trades */}
        <div className={`transition-all duration-300 ${
          viewMode === 'split' ? 'w-1/2' : 
          viewMode === 'best' ? 'w-full' : 'w-0 overflow-hidden'
        }`}>
          <TradeList trades={bestTrades} type="best" title="Best Trades" />
        </div>

        {/* Worst Trades */}
        <div className={`transition-all duration-300 ${
          viewMode === 'split' ? 'w-1/2' : 
          viewMode === 'worst' ? 'w-full' : 'w-0 overflow-hidden'
        }`}>
          <TradeList trades={worstTrades} type="worst" title="Worst Trades" />
        </div>
      </div>

      {/* Insights Panel (when in split view) */}
      {viewMode === 'split' && (bestTrades.length > 0 || worstTrades.length > 0) && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-success">Best Trade Patterns:</strong>
              <ul className="mt-1 space-y-1 text-gray-300">
                {bestTrades.length > 0 && (
                  <>
                    <li>• Avg P&L: ${(bestTrades.reduce((sum, t) => sum + t.profit, 0) / bestTrades.length).toFixed(2)}</li>
                    <li>• Most common: {bestTrades.reduce((acc, t) => {
                      acc[t.direction] = (acc[t.direction] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>).long > (bestTrades.reduce((acc, t) => {
                      acc[t.direction] = (acc[t.direction] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>).short || 0) ? 'Long' : 'Short'}</li>
                    <li>• Total trades: {bestTrades.length} flagged</li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <strong className="text-error">Worst Trade Patterns:</strong>
              <ul className="mt-1 space-y-1 text-gray-300">
                {worstTrades.length > 0 && (
                  <>
                    <li>• Avg P&L: ${(worstTrades.reduce((sum, t) => sum + t.profit, 0) / worstTrades.length).toFixed(2)}</li>
                    <li>• Most common: {worstTrades.reduce((acc, t) => {
                      acc[t.direction] = (acc[t.direction] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>).long > (worstTrades.reduce((acc, t) => {
                      acc[t.direction] = (acc[t.direction] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>).short || 0) ? 'Long' : 'Short'}</li>
                    <li>• Total trades: {worstTrades.length} flagged</li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <strong className="text-blue-400">Key Takeaways:</strong>
              <ul className="mt-1 space-y-1 text-gray-300">
                {bestTrades.length > 0 && worstTrades.length > 0 && (
                  <>
                    <li>• Best trades: {bestTrades.length} flagged</li>
                    <li>• Worst trades: {worstTrades.length} flagged</li>
                    <li>• Best avg P&L: ${(bestTrades.reduce((sum, t) => sum + t.profit, 0) / bestTrades.length).toFixed(2)}</li>
                    <li>• Worst avg P&L: ${(worstTrades.reduce((sum, t) => sum + t.profit, 0) / worstTrades.length).toFixed(2)}</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 