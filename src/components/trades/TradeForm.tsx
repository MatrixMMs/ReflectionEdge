import React, { useState, useEffect } from 'react';
import { Trade, TagGroup, TradeDirection, PlaybookEntry } from '../../types';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { PlusCircleIcon, XMarkIcon } from '../ui/Icons';
import { validateTradeSymbol, validateNumericInput, validateDateString, validateTimeString, sanitizeString, SECURITY_CONFIG } from '../../utils/security';
import { Modal } from '../ui/Modal';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'timeInTrade'>) => void;
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  tradeToEdit?: Trade;
  loading?: boolean;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, tagGroups, playbookEntries, tradeToEdit, loading = false }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [symbol, setSymbol] = useState('');
  const [contracts, setContracts] = useState('');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [profit, setProfit] = useState('');
  const [journal, setJournal] = useState('');
  const [selectedTags, setSelectedTags] = useState<{ [groupId: string]: string[] }>({});
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [executionChecklist, setExecutionChecklist] = useState<{ [checklistItemId: string]: boolean }>({});
  const [isBestTrade, setIsBestTrade] = useState(false);
  const [isWorstTrade, setIsWorstTrade] = useState(false);
  const [showExtendedJournal, setShowExtendedJournal] = useState(false);
  const [extendedReflection, setExtendedReflection] = useState({
    mindset: '',
    setup: '',
    riskManagement: '',
    lessons: '',
    marketContext: '',
  });

  const activePlaybookEntry = playbookEntries.find(p => p.id === selectedStrategy);

  useEffect(() => {
    if (tradeToEdit) {
      setDate(tradeToEdit.date);
      setDirection(tradeToEdit.direction);
      setSymbol(tradeToEdit.symbol);
      setContracts(tradeToEdit.contracts.toString());
      setEntry(tradeToEdit.entry.toString());
      setExit(tradeToEdit.exit.toString());
      setTimeIn(tradeToEdit.timeIn ? new Date(tradeToEdit.timeIn).toISOString().substr(11, 5) : '');
      setTimeOut(tradeToEdit.timeOut ? new Date(tradeToEdit.timeOut).toISOString().substr(11, 5) : '');
      setProfit(tradeToEdit.profit.toString());
      setJournal(tradeToEdit.journal);
      setSelectedStrategy(tradeToEdit.strategyId || '');
      setExecutionChecklist(tradeToEdit.execution?.checklist || {});
      setIsBestTrade(tradeToEdit.isBestTrade || false);
      setIsWorstTrade(tradeToEdit.isWorstTrade || false);
      setExtendedReflection({
        mindset: tradeToEdit.extendedReflection?.mindset || '',
        setup: tradeToEdit.extendedReflection?.setup || '',
        riskManagement: tradeToEdit.extendedReflection?.riskManagement || '',
        lessons: tradeToEdit.extendedReflection?.lessons || '',
        marketContext: tradeToEdit.extendedReflection?.marketContext || '',
      });
      // Convert the tags object to our internal format
      const convertedTags = Object.entries(tradeToEdit.tags).reduce((acc, [groupId, subtagId]) => ({
        ...acc,
        [groupId]: [subtagId]
      }), {} as { [groupId: string]: string[] });
      setSelectedTags(convertedTags);
    } else {
      // Reset form for new trade
      setDate(new Date().toISOString().split('T')[0]);
      setDirection('long');
      setSymbol('');
      setContracts('');
      setEntry('');
      setExit('');
      setTimeIn('');
      setTimeOut('');
      setProfit('');
      setJournal('');
      setSelectedTags({});
      setSelectedStrategy('');
      setExecutionChecklist({});
      setIsBestTrade(false);
      setIsWorstTrade(false);
      setExtendedReflection({
        mindset: '',
        setup: '',
        riskManagement: '',
        lessons: '',
        marketContext: '',
      });
    }
  }, [tradeToEdit]);

  const handleExecutionChecklistChange = (checklistItemId: string, isChecked: boolean) => {
    setExecutionChecklist(prev => ({
      ...prev,
      [checklistItemId]: isChecked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Input validation
    const errors: string[] = [];

    // Validate symbol
    if (!validateTradeSymbol(symbol)) {
      errors.push('Symbol must be 1-10 characters long and contain only letters, numbers, dots, hyphens, and underscores.');
    }

    // Validate numeric inputs
    if (!validateNumericInput(contracts, 1, 10000)) {
      errors.push('Contracts must be a positive number between 1 and 10,000.');
    }

    if (!validateNumericInput(entry, 0.01, 1000000)) {
      errors.push('Entry price must be a positive number.');
    }

    if (!validateNumericInput(exit, 0.01, 1000000)) {
      errors.push('Exit price must be a positive number.');
    }

    if (!validateNumericInput(profit, -1000000, 1000000)) {
      errors.push('Profit must be a valid number.');
    }

    // Validate date
    if (!validateDateString(date)) {
      errors.push('Please enter a valid date.');
    }

    // Validate times
    if (timeIn && !validateTimeString(timeIn)) {
      errors.push('Please enter a valid time in format HH:MM.');
    }

    if (timeOut && !validateTimeString(timeOut)) {
      errors.push('Please enter a valid time in format HH:MM.');
    }

    // Check for errors
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    const fullTimeIn = `${date}T${timeIn}:00.000Z`;
    const fullTimeOut = `${date}T${timeOut}:00.000Z`;

    // Convert our internal tag format to the expected format
    const convertedTags = Object.entries(selectedTags).reduce((acc, [groupId, subtagIds]) => {
      // Take the first selected subtag for each group
      if (subtagIds.length > 0) {
        acc[groupId] = subtagIds[0];
      }
      return acc;
    }, {} as { [groupId: string]: string });

    onSubmit({
      date,
      direction,
      symbol: sanitizeString(symbol),
      contracts: parseInt(contracts),
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      timeIn: fullTimeIn,
      timeOut: fullTimeOut,
      profit: parseFloat(profit),
      journal: sanitizeString(journal),
      tags: convertedTags,
      strategyId: selectedStrategy || undefined,
      execution: {
        checklist: executionChecklist,
        grade: null, // Grading will be handled later
        notes: '' // Placeholder for execution notes
      },
      accountId: 'default', // Default account ID for now
      isBestTrade,
      isWorstTrade,
      extendedReflection: (isBestTrade || isWorstTrade) ? extendedReflection : undefined,
    });
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setDirection('long');
    setSymbol('');
    setContracts('');
    setEntry('');
    setExit('');
    setTimeIn('');
    setTimeOut('');
    setProfit('');
    setJournal('');
    setSelectedTags({});
    setSelectedStrategy('');
    setExecutionChecklist({});
    setIsBestTrade(false);
    setIsWorstTrade(false);
    setExtendedReflection({
      mindset: '',
      setup: '',
      riskManagement: '',
      lessons: '',
      marketContext: '',
    });
  };

  const handleTagSelection = (groupId: string, subtagId: string) => {
    setSelectedTags(prev => {
      const currentTags = prev[groupId] || [];
      const newTags = currentTags.includes(subtagId)
        ? currentTags.filter(id => id !== subtagId)
        : [...currentTags, subtagId];
      
      return {
        ...prev,
        [groupId]: newTags
      };
    });
  };

  const handleFlagChange = (flagType: 'best' | 'worst') => {
    if (flagType === 'best') {
      setIsBestTrade(!isBestTrade);
    } else {
      setIsWorstTrade(!isWorstTrade);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Direction</label>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value as TradeDirection)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
              required
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
            <Input
              type="text"
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              placeholder="e.g., ES"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contracts</label>
            <Input
              type="number"
              value={contracts}
              onChange={e => setContracts(e.target.value)}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Entry Price</label>
            <Input
              type="number"
              step="0.01"
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Exit Price</label>
            <Input
              type="number"
              step="0.01"
              value={exit}
              onChange={e => setExit(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Time In</label>
            <Input
              type="time"
              value={timeIn}
              onChange={e => setTimeIn(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Time Out</label>
            <Input
              type="time"
              value={timeOut}
              onChange={e => setTimeOut(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">P&L</label>
          <Input
            type="number"
            step="0.01"
            value={profit}
            onChange={e => setProfit(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Strategy / Playbook</label>
          <select
            value={selectedStrategy}
            onChange={e => setSelectedStrategy(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
          >
            <option value="">None</option>
            {playbookEntries.map(entry => (
              <option key={entry.id} value={entry.id}>{entry.name}</option>
            ))}
          </select>
        </div>

        {activePlaybookEntry && activePlaybookEntry.checklist.length > 0 && (
          <div className="space-y-3 p-4 bg-gray-900/50 rounded-lg">
            <h4 className="font-semibold text-purple-300">Execution Checklist for "{activePlaybookEntry.name}"</h4>
            {activePlaybookEntry.checklist.map(item => (
              <label key={item.id} className="flex items-center gap-3 text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                  checked={executionChecklist[item.id] || false}
                  onChange={e => handleExecutionChecklistChange(item.id, e.target.checked)}
                />
                <span>{item.item}</span>
              </label>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
          <div className="space-y-2">
            {tagGroups.map(group => (
              <div key={group.id}>
                <span className="font-semibold text-purple-300 text-xs">{group.name}</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {group.subtags.map(subtag => (
                    <button
                      key={subtag.id}
                      type="button"
                      onClick={() => {
                        setSelectedTags(prev => {
                          const current = prev[group.id] || [];
                          const next = current.includes(subtag.id)
                            ? current.filter(id => id !== subtag.id)
                            : [...current, subtag.id];
                          return { ...prev, [group.id]: next };
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors mr-2 mb-2 ${
                        selectedTags[group.id]?.includes(subtag.id)
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-600 text-white hover:bg-gray-500'
                      }`}
                    >
                      {subtag.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Journal / Notes</label>
          <Textarea
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="Add your trade notes here..."
            rows={3}
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">Trade Analysis</label>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => handleFlagChange('best')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                isBestTrade 
                  ? 'bg-yellow-900/30 border-yellow-400 text-yellow-300' 
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">{isBestTrade ? '⭐' : '☆'}</span>
              <span>Best Trade</span>
            </button>
            <button
              type="button"
              onClick={() => handleFlagChange('worst')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                isWorstTrade 
                  ? 'bg-red-900/30 border-red-400 text-red-300' 
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">{isWorstTrade ? '👎' : '👍'}</span>
              <span>Worst Trade</span>
            </button>
            {(isBestTrade || isWorstTrade) && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowExtendedJournal(true)}
              >
                📝 {extendedReflection.mindset || extendedReflection.setup ? 'Edit' : 'Add'} Detailed Journal
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={resetForm}>
            Reset
          </Button>
          <Button type="submit" disabled={loading} variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
            {loading ? 'Saving...' : (tradeToEdit ? 'Update Trade' : 'Add Trade')}
          </Button>
        </div>
      </form>

      {showExtendedJournal && (
        <Modal onClose={() => setShowExtendedJournal(false)} title="Extended Trade Journal">
          <div className="space-y-4 p-4 max-w-2xl">
            <div className="text-sm text-gray-400 mb-4">
              Provide detailed analysis for this {isBestTrade ? 'best' : 'worst'} trade
            </div>
            
            <div>
              <label className="block text-gray-200 mb-1">What was your mindset before this trade?</label>
              <textarea
                value={extendedReflection.mindset}
                onChange={e => setExtendedReflection(prev => ({ ...prev, mindset: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
                rows={2}
                placeholder="Describe your emotional state, confidence level, and mental preparation..."
              />
            </div>
            
            <div>
              <label className="block text-gray-200 mb-1">What specific setup triggered your entry?</label>
              <textarea
                value={extendedReflection.setup}
                onChange={e => setExtendedReflection(prev => ({ ...prev, setup: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
                rows={2}
                placeholder="Describe the chart pattern, indicator signals, or market conditions..."
              />
            </div>
            
            <div>
              <label className="block text-gray-200 mb-1">How did you manage risk in this trade?</label>
              <textarea
                value={extendedReflection.riskManagement}
                onChange={e => setExtendedReflection(prev => ({ ...prev, riskManagement: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
                rows={2}
                placeholder="Position sizing, stop loss placement, profit targets..."
              />
            </div>
            
            <div>
              <label className="block text-gray-200 mb-1">What would you do differently next time?</label>
              <textarea
                value={extendedReflection.lessons}
                onChange={e => setExtendedReflection(prev => ({ ...prev, lessons: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
                rows={2}
                placeholder="Key lessons learned and specific improvements..."
              />
            </div>
            
            <div>
              <label className="block text-gray-200 mb-1">What was happening in the broader market?</label>
              <textarea
                value={extendedReflection.marketContext}
                onChange={e => setExtendedReflection(prev => ({ ...prev, marketContext: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
                rows={2}
                placeholder="Market trend, volatility, news events, sector rotation..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowExtendedJournal(false)}>Cancel</Button>
              <Button onClick={() => setShowExtendedJournal(false)}>Save Journal</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
