import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface MBSSessionGoalProps {
  isOpen: boolean;
  onBack: () => void;
  onContinue: (goal: string) => void;
  onClose: () => void;
  initialGoal?: string;
}

const suggestions = [
  'Follow my plan',
  'Focus on discipline',
  'Limit losses to $100',
  'Take only A+ setups',
  'Stick to risk management',
];

export const MBSSessionGoal: React.FC<MBSSessionGoalProps> = ({ isOpen, onBack, onContinue, onClose, initialGoal = '' }) => {
  const [goal, setGoal] = useState(initialGoal);

  const handleSuggestion = (suggestion: string) => {
    setGoal(suggestion);
  };

  const handleContinue = () => {
    if (goal.trim()) {
      onContinue(goal.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Step 2 of 5: Set Session Goal">
      <div className="space-y-6 p-4">
        <div className="text-lg font-semibold mb-2 text-center">
          What's your main focus or goal for this session?
        </div>
        <Input
          type="text"
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="Type your goal here"
        />
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              className="px-3 py-1 rounded-full bg-gray-700 hover:bg-blue-700 text-sm text-gray-200 border border-gray-600 transition-colors"
              onClick={() => handleSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-6 gap-2">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!goal.trim()}>
            Continue
          </Button>
        </div>
        <div className="text-xs text-gray-400 text-center mt-2">
          Setting a clear goal helps you stay focused and disciplined.
        </div>
      </div>
    </Modal>
  );
}; 