import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface MBSStartSessionProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (mood: number, note: string) => void;
}

const moodOptions = [
  { value: 5, emoji: '😃', label: 'Great' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 2, emoji: '🙁', label: 'Low' },
  { value: 1, emoji: '😞', label: 'Down' },
];

export const MBSStartSession: React.FC<MBSStartSessionProps> = ({ isOpen, onClose, onContinue }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const handleContinue = () => {
    if (selectedMood) {
      onContinue(selectedMood, note);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Step 1 of 5: Mental State Check">
      <div className="space-y-6 p-4">
        <div className="text-lg font-semibold mb-2 text-center">
          How are you feeling as you start this session?
        </div>
        <div className="flex justify-center gap-4 mb-4">
          {moodOptions.map(option => (
            <button
              key={option.value}
              className={`text-3xl p-2 rounded-full border-2 transition-colors ${selectedMood === option.value ? 'border-blue-400 bg-gray-700' : 'border-transparent hover:bg-gray-800'}`}
              onClick={() => setSelectedMood(option.value)}
              aria-label={option.label}
              type="button"
            >
              {option.emoji}
            </button>
          ))}
        </div>
        <Input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a quick note (optional)"
        />
        <div className="flex justify-end mt-6">
          <Button onClick={handleContinue} disabled={selectedMood === null}>
            Continue
          </Button>
        </div>
        <div className="text-xs text-gray-400 text-center mt-2">
          There's no right or wrong answer. Just check in with yourself.
        </div>
      </div>
    </Modal>
  );
}; 