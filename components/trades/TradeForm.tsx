import React, { useState, useEffect } from 'react';
import { Trade, TagGroup, TradeDirection } from '../../types';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { PlusCircleIcon, XMarkIcon } from '../ui/Icons';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'timeInTrade'>) => void;
  tagGroups: TagGroup[];
  tradeToEdit?: Trade;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, tagGroups, tradeToEdit }) => {
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

  useEffect(() => {
    if (tradeToEdit) {
      setDate(tradeToEdit.date);
      setDirection(tradeToEdit.direction);
      setSymbol(tradeToEdit.symbol);
      setContracts(tradeToEdit.contracts.toString());
      setEntry(tradeToEdit.entry.toString());
      setExit(tradeToEdit.exit.toString());
      setTimeIn(tradeToEdit.timeIn);
      setTimeOut(tradeToEdit.timeOut);
      setProfit(tradeToEdit.profit.toString());
      setJournal(tradeToEdit.journal);
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
    }
  }, [tradeToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    const tradeData: Omit<Trade, 'id' | 'timeInTrade'> = {
      date,
      direction,
      symbol: symbol.toUpperCase(),
      contracts: parseInt(contracts),
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      timeIn: fullTimeIn,
      timeOut: fullTimeOut,
      profit: parseFloat(profit),
      journal,
      tags: convertedTags
    };

    onSubmit(tradeData);
    resetForm();
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
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={direction === 'long' ? 'primary' : 'secondary'}
              onClick={() => setDirection('long')}
              className="flex-1"
            >
              Long
            </Button>
            <Button
              type="button"
              variant={direction === 'short' ? 'primary' : 'secondary'}
              onClick={() => setDirection('short')}
              className="flex-1"
            >
              Short
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
          <Input
            type="text"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            placeholder="e.g., AAPL"
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
        <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {tagGroups.map(group => (
            <div key={group.id} className="bg-gray-700 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-purple-300 mb-2">{group.name}</h4>
              <div className="flex flex-wrap gap-2">
                {group.subtags.map(subtag => (
                  <button
                    key={subtag.id}
                    type="button"
                    onClick={() => handleTagSelection(group.id, subtag.id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-colors ${
                      selectedTags[group.id]?.includes(subtag.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: subtag.color }}
                    />
                    <span>{subtag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Profit/Loss</label>
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
        <label className="block text-sm font-medium text-gray-300 mb-1">Journal</label>
        <Textarea
          value={journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Add any additional notes about the trade..."
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
