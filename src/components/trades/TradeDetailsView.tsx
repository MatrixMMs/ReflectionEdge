import React from 'react';
import { Trade, PlaybookEntry } from '../../types';
import { CheckIcon, XCircleIcon } from '../ui/Icons'; // Assuming you have these icons

interface TradeDetailsViewProps {
  trade: Trade;
  playbookEntries: PlaybookEntry[];
}

export const TradeDetailsView: React.FC<TradeDetailsViewProps> = ({ trade, playbookEntries }) => {
  const strategy = playbookEntries.find(p => p.id === trade.strategyId);

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-gray-400';
    if (grade.startsWith('A')) return 'text-green-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    if (grade.startsWith('D')) return 'text-orange-400';
    if (grade.startsWith('F')) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className="p-4 bg-gray-800 text-gray-200 rounded-lg max-h-[80vh] overflow-y-auto">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{trade.symbol}</h2>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${trade.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {trade.direction.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-400">{new Date(trade.date).toLocaleDateString()}</p>
      </header>

      {/* Financials */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Financials</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Profit/Loss</p>
            <p className={`text-xl font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>${trade.profit.toFixed(2)}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Entry Price</p>
            <p className="text-xl font-bold">${trade.entry.toFixed(2)}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Exit Price</p>
            <p className="text-xl font-bold">${trade.exit.toFixed(2)}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Fees</p>
            <p className="text-xl font-bold">${(trade.fees || 0).toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Execution Analysis */}
      {trade.execution && strategy && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-orange-400 mb-3">Execution Review</h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-400">Strategy</p>
                <p className="font-semibold text-white">{strategy.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Execution Grade</p>
                <p className={`text-3xl font-bold ${getGradeColor(trade.execution.grade)}`}>{trade.execution.grade}</p>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-300 mb-2">Checklist Adherence</h4>
            <ul className="space-y-2">
              {strategy.checklist.map(item => (
                <li key={item.id} className={`flex items-center text-sm p-2 rounded-md ${trade.execution?.checklist[item.id] ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {trade.execution?.checklist[item.id] ? (
                    <CheckIcon className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" />
                  )}
                  <span className={trade.execution?.checklist[item.id] ? 'text-gray-300' : 'text-gray-400 line-through'}>
                    {item.item}
                  </span>
                </li>
              ))}
            </ul>
            {trade.execution.notes && (
                <div className="mt-4">
                    <h4 className="font-semibold text-gray-300 mb-1">Execution Notes</h4>
                    <p className="text-sm text-gray-400 bg-gray-600/50 p-2 rounded">{trade.execution.notes}</p>
                </div>
            )}
          </div>
        </section>
      )}

      {/* Journal */}
      <section>
        <h3 className="text-lg font-semibold text-blue-400 mb-2">Journal Entry</h3>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-300 whitespace-pre-wrap">{trade.journal || 'No journal entry for this trade.'}</p>
        </div>
      </section>
    </div>
  );
}; 