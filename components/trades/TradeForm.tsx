
import React, { useState, useEffect } from 'react';
import { Trade, TagGroup, TradeDirection } from '../../types';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'timeInTrade'> | Trade) => void;
  tagGroups: TagGroup[];
  tradeToEdit?: Trade | null;
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
  const [tags, setTags] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (tradeToEdit) {
      setDate(tradeToEdit.date);
      setDirection(tradeToEdit.direction || 'long');
      setSymbol(tradeToEdit.symbol || '');
      setContracts(tradeToEdit.contracts?.toString() || '');
      setEntry(tradeToEdit.entry.toString());
      setExit(tradeToEdit.exit.toString());
      setTimeIn(tradeToEdit.timeIn.split('T')[1]?.substring(0,5) || ''); // HH:mm from ISO
      setTimeOut(tradeToEdit.timeOut.split('T')[1]?.substring(0,5) || ''); // HH:mm from ISO
      setProfit(tradeToEdit.profit.toString());
      setJournal(tradeToEdit.journal);
      setTags(tradeToEdit.tags || {});
    } else {
      // Reset form for new trade
      setDate(new Date().toISOString().split('T')[0]);
      setDirection('long');
      setSymbol('');
      setContracts('');
      setEntry('');
      setExit('');
      const now = new Date();
      const defaultTimeIn = now.toTimeString().substring(0,5); // HH:MM
      now.setMinutes(now.getMinutes() + 15);
      const defaultTimeOut = now.toTimeString().substring(0,5); // HH:MM
      setTimeIn(defaultTimeIn);
      setTimeOut(defaultTimeOut);
      setProfit('');
      setJournal('');
      setTags({});
    }
  }, [tradeToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !contracts || parseFloat(contracts) <= 0 || !entry || !exit || !profit || !timeIn || !timeOut || !date) {
      alert("Please fill in all required fields. Ensure Symbol is not empty and Contracts/Shares is a positive number.\nRequired: Date, Direction, Symbol, Contracts/Shares, Entry, Exit, Time In, Time Out, Profit.");
      return;
    }
    
    const fullTimeIn = `${date}T${timeIn}:00.000Z`;
    const fullTimeOut = `${date}T${timeOut}:00.000Z`;

    const tradeData = {
      date,
      direction,
      symbol: symbol.trim(),
      contracts: parseFloat(contracts),
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      timeIn: fullTimeIn,
      timeOut: fullTimeOut,
      profit: parseFloat(profit),
      journal,
      tags,
    };

    if (tradeToEdit) {
      onSubmit({ ...tradeToEdit, ...tradeData });
    } else {
      onSubmit(tradeData as Omit<Trade, 'id' | 'timeInTrade'>);
    }
  };

  const handleTagChange = (groupId: string, subTagId: string) => {
    setTags(prev => ({ ...prev, [groupId]: subTagId }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <div>
          <label htmlFor="trade-direction" className="block text-sm font-medium text-gray-300 mb-1">Direction</label>
          <select
            id="trade-direction"
            value={direction}
            onChange={e => setDirection(e.target.value as TradeDirection)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
            required
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        <Input label="Symbol / Ticker" type="text" placeholder="e.g., AAPL, BTC/USD" value={symbol} onChange={e => setSymbol(e.target.value)} required />
        <Input label="Contracts / Shares" type="number" placeholder="e.g., 100, 1.5" value={contracts} onChange={e => setContracts(e.target.value)} required step="any" min="0.00000001" />
        <Input label="Entry Price" type="number" placeholder="e.g., 120.50" value={entry} onChange={e => setEntry(e.target.value)} required step="any" />
        <Input label="Exit Price" type="number" placeholder="e.g., 122.00" value={exit} onChange={e => setExit(e.target.value)} required step="any" />
        <Input label="Time In" type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)} required />
        <Input label="Time Out" type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)} required />
        <Input label="Profit/Loss" type="number" placeholder="e.g., 150.75 or -50.20" value={profit} onChange={e => setProfit(e.target.value)} required step="any" className="md:col-span-2"/>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2 text-purple-400">Tags</h3>
        {tagGroups.length === 0 && <p className="text-sm text-gray-400">No tag groups created yet. Go to "Manage Tags" to add some.</p>}
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {tagGroups.map(group => (
            <div key={group.id}>
              <label className="block text-sm font-medium text-gray-300 mb-1">{group.name}</label>
              <select
                value={tags[group.id] || ''}
                onChange={e => handleTagChange(group.id, e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
              >
                <option value="">Select {group.name}...</option>
                {group.subtags.map(subtag => (
                  <option key={subtag.id} value={subtag.id} style={{backgroundColor: subtag.color, color: '#FFFFFF'}} className="text-white">
                    {subtag.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <Textarea label="Journal / Notes" placeholder="Thoughts on this trade..." value={journal} onChange={e => setJournal(e.target.value)} />
      
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary">
          {tradeToEdit ? 'Update Trade' : 'Add Trade'}
        </Button>
      </div>
    </form>
  );
};
