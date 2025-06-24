import React, { useState, useRef } from 'react';
import { Insight } from './PatternInsights';
import { TrendingUpIcon, TrendingDownIcon, ExclamationTriangleIcon, LightBulbIcon, ChevronDownIcon, ChevronUpIcon } from '../ui/Icons';

interface InsightCardProps {
  insight: Insight;
}

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

const getBorderColor = (type: Insight['type']) => {
  switch (type) {
    case 'positive':
      return 'border-l-4 border-green-400';
    case 'negative':
      return 'border-l-4 border-red-400';
    case 'warning':
      return 'border-l-4 border-yellow-400';
    case 'opportunity':
      return 'border-l-4 border-blue-400';
    default:
      return 'border-l-4 border-gray-300';
  }
};

const getImpactBadge = (impact: Insight['impact']) => {
  const colors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[impact]}`}>
      {impact.toUpperCase()} IMPACT
    </span>
  );
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const [showPopover, setShowPopover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Position popover below or to the right of the card
  // (for simplicity, use absolute and left-0 top-full, but can be improved)

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col min-w-[220px] max-w-[340px] p-3 md:p-4 rounded-lg border shadow-sm bg-white text-gray-900 ${getBorderColor(insight.type)} transition-shadow hover:shadow-lg focus-within:shadow-lg cursor-pointer`}
      style={{ flexBasis: '300px' }}
      tabIndex={0}
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
      onFocus={() => setShowPopover(true)}
      onBlur={() => setShowPopover(false)}
      aria-describedby={`popover-${insight.id}`}
    >
      <div className="flex items-center gap-2 min-h-[28px]">
        {getInsightIcon(insight.type)}
        <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate" title={insight.title}>{insight.title}</h3>
      </div>
      {showPopover && (
        <div
          id={`popover-${insight.id}`}
          className="z-20 absolute left-1/2 top-full mt-2 w-[320px] -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-gray-900 animate-fade-in"
          style={{ minWidth: 220 }}
          role="tooltip"
        >
          <div className="mb-2">
            <div className="font-semibold text-gray-900 text-base mb-1 flex items-center gap-2">
              {getInsightIcon(insight.type)}
              {insight.title}
            </div>
            <p className="text-gray-800 text-sm mb-2">{insight.description}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-100 mb-2">
            <h4 className="font-medium text-gray-900 text-xs mb-1">Recommendation</h4>
            <p className="text-gray-800 text-xs">{insight.recommendation}</p>
          </div>
          {insight.data && (
            <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
              {insight.data.winRate !== undefined && (
                <div>
                  <span className="text-gray-500">Win Rate:</span>
                  <span className="ml-1 font-bold text-green-700">{insight.data.winRate.toFixed(1)}%</span>
                </div>
              )}
              {insight.data.totalTrades !== undefined && (
                <div>
                  <span className="text-gray-500">Trades:</span>
                  <span className="ml-1 font-bold text-blue-700">{insight.data.totalTrades}</span>
                </div>
              )}
              {insight.data.profitFactor !== undefined && (
                <div>
                  <span className="text-gray-500">Profit Factor:</span>
                  <span className="ml-1 font-bold text-purple-700">{insight.data.profitFactor.toFixed(2)}</span>
                </div>
              )}
              {insight.data.totalProfit !== undefined && (
                <div>
                  <span className="text-gray-500">Total Profit:</span>
                  <span className="ml-1 font-bold text-pink-700">${insight.data.totalProfit.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 