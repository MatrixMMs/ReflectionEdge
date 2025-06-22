import React, { useState } from 'react';
import { Trade } from '../../types';
import { calculateFinancials } from '../../utils/financialCalculations';
import { ChevronDownIcon, ChevronUpIcon } from '../../components/ui/Icons';
import { Button } from '../../components/ui/Button';

interface SummaryProps {
  trades: Trade[];
}

const formatSharpeRatioValue = (sharpe: number | null): string => {
  if (sharpe === null) return "N/A";
  if (sharpe === Infinity) return "High (∞)";
  if (sharpe === -Infinity) return "Low (-∞)";
  if (isNaN(sharpe)) return "N/A";
  return sharpe.toFixed(2);
};

export const Summary: React.FC<SummaryProps> = ({ trades }) => {
  const [showMore, setShowMore] = useState(false);
  const financials = calculateFinancials(trades);

  const {
    totalTrades,
    netPnl,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    totalFees,
    expectancy,
    avgWinLossRatio,
    sharpeRatio,
    maxWin,
    maxLoss,
  } = financials;

  if (totalTrades === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        No trades for the selected period.
      </div>
    );
  }

  const pnlColor = netPnl >= 0 ? 'text-green-400' : 'text-red-400';

  const summaryItems = [
    { label: 'Total Trades', value: totalTrades },
    { label: 'Net P&L', value: `${netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}`, color: pnlColor, isBold: true },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%` },
    { label: 'Profit Factor', value: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2) },
    { label: 'Avg Win / Loss', value: `$${avgWin.toFixed(2)} / $${avgLoss.toFixed(2)}`, color: 'text-green-400/text-red-400' },
  ];

  const advancedSummaryItems = [
    { label: 'Expectancy', value: `$${expectancy.toFixed(2)}` },
    { label: 'Avg W/L Ratio', value: avgWinLossRatio === Infinity ? '∞' : avgWinLossRatio.toFixed(2) },
    { label: 'Sharpe Ratio', value: formatSharpeRatioValue(sharpeRatio) },
    { label: 'Max Win', value: `$${maxWin.toFixed(2)}`, color: 'text-green-400' },
    { label: 'Max Loss', value: `$${maxLoss.toFixed(2)}`, color: 'text-red-400' },
    { label: 'Total Fees', value: `-$${totalFees.toFixed(2)}`, condition: totalFees > 0 },
  ];

  return (
    <div className="text-sm">
      <div className="space-y-3">
        {summaryItems.map(item => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="font-semibold text-gray-300">{item.label}:</span>
            <span className={`font-mono ${item.color?.includes('/') 
                ? '' 
                : item.color || 'text-gray-100'
            } ${item.isBold ? 'font-bold' : ''}`}>
              {item.color?.includes('/') ? (
                <>
                  <span className={item.color.split('/')[0]}>${avgWin.toFixed(2)}</span> / <span className={item.color.split('/')[1]}>${avgLoss.toFixed(2)}</span>
                </>
              ) : (
                item.value
              )}
            </span>
          </div>
        ))}
      </div>
      
      {showMore && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
          {advancedSummaryItems.map(item => (
            (item.condition === undefined || item.condition) && (
              <div key={item.label} className="flex justify-between items-center">
                <span className="font-semibold text-gray-400">{item.label}:</span>
                <span className={`font-mono ${item.color || 'text-gray-200'}`}>{item.value}</span>
              </div>
            )
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <Button 
          onClick={() => setShowMore(!showMore)}
          variant="ghost"
          size="sm"
          className="text-purple-400 hover:text-purple-300"
          rightIcon={showMore 
            ? <ChevronUpIcon className="w-4 h-4" /> 
            : <ChevronDownIcon className="w-4 h-4" />}
        >
          {showMore ? 'Show Less' : 'Show More'}
        </Button>
      </div>
    </div>
  );
}; 