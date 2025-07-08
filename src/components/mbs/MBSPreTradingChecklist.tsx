import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface MBSPreTradingChecklistProps {
  isOpen: boolean;
  onBack: () => void;
  onBeginTrading: () => void;
  onClose: () => void;
  sessionGoal: string;
}

const requiredItems = [
  'Do you have a trading plan for the day?',
  'Have you reviewed your risk management rules?',
  'Have you set your maximum loss limit for the day?',
  'Is your trading environment free from distractions?',
  'Are you well-rested and in a good mental state?',
];

const optionalItems = [
  'Have you reviewed your previous trading session?',
];

export const MBSPreTradingChecklist: React.FC<MBSPreTradingChecklistProps> = ({ isOpen, onBack, onBeginTrading, onClose, sessionGoal }) => {
  const [checkedRequired, setCheckedRequired] = useState<boolean[]>(Array(requiredItems.length).fill(false));
  const [checkedOptional, setCheckedOptional] = useState<boolean[]>(Array(optionalItems.length).fill(false));

  const handleCheckRequired = (idx: number) => {
    setCheckedRequired(arr => arr.map((v, i) => (i === idx ? !v : v)));
  };
  const handleCheckOptional = (idx: number) => {
    setCheckedOptional(arr => arr.map((v, i) => (i === idx ? !v : v)));
  };

  const canBegin = checkedRequired.every(Boolean);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Step 3 of 5: Pre-Trading Checklist">
      <div className="space-y-6 p-4">
        <div className="bg-blue-900/80 border border-blue-500 rounded-lg p-3 text-center text-blue-200 font-semibold text-lg flex items-center justify-center gap-2">
          <span role="img" aria-label="goal">🎯</span> Session Goal: <span className="italic">"{sessionGoal}"</span>
        </div>
        <div>
          <div className="mb-2 font-medium text-gray-200">Required Items</div>
          <div className="space-y-2">
            {requiredItems.map((item, idx) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checkedRequired[idx]}
                  onChange={() => handleCheckRequired(idx)}
                  className="accent-blue-500"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 font-medium text-gray-400">Optional Items</div>
          <div className="space-y-2">
            {optionalItems.map((item, idx) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checkedOptional[idx]}
                  onChange={() => handleCheckOptional(idx)}
                  className="accent-gray-400"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-6 gap-2">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onBeginTrading} disabled={!canBegin}>
            Begin Trading
          </Button>
        </div>
        {!canBegin && (
          <div className="text-xs text-red-400 text-center mt-2">
            Please complete all required items before starting your trading session.
          </div>
        )}
      </div>
    </Modal>
  );
}; 