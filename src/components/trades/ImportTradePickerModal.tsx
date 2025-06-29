import React, { useState } from 'react';
import { Trade } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ImportTradePickerModalProps {
  trades: Trade[];
  onConfirm: (selected: Trade[]) => void;
  onCancel: () => void;
}

const ImportTradePickerModal: React.FC<ImportTradePickerModalProps> = ({ trades, onConfirm, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(trades.map(t => t.id)));

  const toggleTrade = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(trades.filter(t => selectedIds.has(t.id)));
  };

  return (
    <Modal title="Select Trades to Import" onClose={onCancel} size="large">
      <div className="space-y-4">
        <div className="text-gray-300 text-sm mb-2">{trades.length} trades found in import. Select which to add to your journal.</div>
        <div className="max-h-96 overflow-y-auto border border-gray-700 rounded-lg divide-y divide-gray-800 bg-gray-900">
          {trades.map(trade => (
            <label key={trade.id} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-800">
              <input
                type="checkbox"
                checked={selectedIds.has(trade.id)}
                onChange={() => toggleTrade(trade.id)}
                className="accent-purple-500"
              />
              <span className="flex-1 text-gray-200 text-sm">
                {trade.date} | {trade.symbol} | {trade.direction} | {trade.profit}
              </span>
              {trade.journal && <span className="text-xs text-gray-400 italic">{trade.journal.slice(0, 30)}</span>}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>Import Selected</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportTradePickerModal; 