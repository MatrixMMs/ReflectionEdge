import React, { useState } from 'react';
import { Trade, PlaybookEntry } from '../../types';
import { CheckIcon, XCircleIcon } from '../ui/Icons'; // Assuming you have these icons
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TradeDetailsViewProps {
  trade: Trade;
  playbookEntries: PlaybookEntry[];
  onUpdateTrade?: (updatedTrade: Trade) => void;
}

export const TradeDetailsView: React.FC<TradeDetailsViewProps> = ({ trade, playbookEntries, onUpdateTrade }) => {
  const strategy = playbookEntries.find(p => p.id === trade.strategyId);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJournal, setEditedJournal] = useState(trade.journal);
  const [reflectionJournal, setReflectionJournal] = useState(trade.extendedReflection?.lessons || '');

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-gray-400';
    if (grade.startsWith('A')) return 'text-green-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    if (grade.startsWith('D')) return 'text-orange-400';
    if (grade.startsWith('F')) return 'text-red-500';
    return 'text-gray-400';
  };

  const handleSave = () => {
    if (onUpdateTrade) {
      const updatedTrade = {
        ...trade,
        journal: editedJournal,
        extendedReflection: {
          ...trade.extendedReflection,
          lessons: reflectionJournal,
        },
      };
      onUpdateTrade(updatedTrade);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedJournal(trade.journal);
    setReflectionJournal(trade.extendedReflection?.lessons || '');
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-gray-800 text-gray-200 rounded-lg max-h-[80vh] overflow-y-auto">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-main">{trade.symbol}</h2>
          <div className="flex items-center gap-2">
            {trade.isBestTrade && (
              <span className="text-2xl" title="Best Trade">⭐</span>
            )}
            {trade.isWorstTrade && (
              <span className="text-2xl" title="Worst Trade">👎</span>
            )}
            <span className={`inline-flex items-center text-left text-sm font-semibold border font-mono w-16 h-7 ${
              trade.direction === 'long' 
                ? 'text-blue-400 border-blue-400' 
                : 'text-orange-400 border-orange-400'
            }`} style={{ borderRadius: 0, background: 'none', justifyContent: 'flex-start' }}>
              {trade.direction === 'long' ? 'LONG' : 'SHORT'}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400">{new Date(trade.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</p>
      </header>

      {/* Trade Analysis */}
      {(trade.isBestTrade || trade.isWorstTrade) && trade.extendedReflection && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">
            {trade.isBestTrade ? '⭐ Best Trade Analysis' : '👎 Worst Trade Analysis'}
          </h3>
          <div className="bg-gray-700 p-4 rounded-lg space-y-4">
            {trade.extendedReflection.mindset && (
              <div>
                <h4 className="font-semibold text-gray-300 mb-1">Mindset</h4>
                <p className="text-sm text-gray-400 bg-gray-600/50 p-2 rounded">{trade.extendedReflection.mindset}</p>
              </div>
            )}
            {trade.extendedReflection.setup && (
              <div>
                <h4 className="font-semibold text-gray-300 mb-1">Setup</h4>
                <p className="text-sm text-gray-400 bg-gray-600/50 p-2 rounded">{trade.extendedReflection.setup}</p>
              </div>
            )}
            {trade.extendedReflection.riskManagement && (
              <div>
                <h4 className="font-semibold text-gray-300 mb-1">Risk Management</h4>
                <p className="text-sm text-gray-400 bg-gray-600/50 p-2 rounded">{trade.extendedReflection.riskManagement}</p>
              </div>
            )}
            {trade.extendedReflection.lessons && (
              <div>
                <h4 className="font-semibold text-gray-300 mb-1">Lessons Learned</h4>
                <p className="text-sm text-gray-400 bg-gray-600/50 p-2 rounded">{trade.extendedReflection.lessons}</p>
              </div>
            )}
            {trade.extendedReflection.marketContext && (
              <div>
                <h4 className="font-semibold text-gray-300 mb-1">Market Context</h4>
                <p className="text-sm text-gray-400 bg-gray-600/50 p-2 rounded">{trade.extendedReflection.marketContext}</p>
              </div>
            )}
          </div>
        </section>
      )}

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

      {/* Journal Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blue-400">Trade Journal</h3>
          {!isEditing ? (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <textarea
            value={editedJournal}
            onChange={(e) => setEditedJournal(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
            rows={4}
            placeholder="Enter your trade journal..."
          />
        ) : (
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-300 whitespace-pre-wrap">{trade.journal || 'No journal entry for this trade.'}</p>
          </div>
        )}
      </section>

      {/* Reflection Journal Section */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-green-400">Reflection Journal</h3>
          {!isEditing ? (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <textarea
            value={reflectionJournal}
            onChange={(e) => setReflectionJournal(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
            rows={4}
            placeholder="Add your reflection notes, lessons learned, or additional insights..."
          />
        ) : (
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-300 whitespace-pre-wrap">{reflectionJournal || 'No reflection notes for this trade.'}</p>
          </div>
        )}
      </section>
    </div>
  );
}; 