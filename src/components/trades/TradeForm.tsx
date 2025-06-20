import React, { useState, useEffect } from 'react';
import { Trade, TagGroup, TradeDirection, PlaybookEntry } from '../../types';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { PlusCircleIcon, XMarkIcon } from '../ui/Icons';
import { validateTradeSymbol, validateNumericInput, validateDateString, validateTimeString, sanitizeString, SECURITY_CONFIG } from '../../utils/security';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'timeInTrade'>) => void;
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  tradeToEdit?: Trade;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, tagGroups, playbookEntries, tradeToEdit }) => {
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
    }
  }, [tradeToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      accountId: 'default' // Default account ID for now
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg">
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
        <label className="block text-sm font-medium text-gray-300 mb-1">Strategy</label>
        <select
          value={selectedStrategy}
          onChange={e => setSelectedStrategy(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded p-2"
        >
          <option value="">Select a strategy (optional)</option>
          {playbookEntries.map(entry => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </div>

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
                    className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-colors ${
                      selectedTags[group.id]?.includes(subtag.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subtag.color }} />
                    <span>{subtag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Journal</label>
        <Textarea
          value={journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Add your trade notes here..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={resetForm}>
          Reset
        </Button>
        <Button type="submit" variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
          {tradeToEdit ? 'Update Trade' : 'Add Trade'}
        </Button>
      </div>
    </form>
  );
};
