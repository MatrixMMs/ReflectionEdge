import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';

interface MBSTradingPanelProps {
  isOpen: boolean;
  onEndSession: () => void;
  sessionGoal: string;
}

type TradeLog = {
  id: string;
  type: string;
  result: 'win' | 'lose';
  followedPlan: boolean;
  notes: string;
  mood: number;
  time: string;
  reflection?: string;
};

const tradeTypes = ['Long', 'Short'];

const quadrantOptions = [
  { result: 'win', followedPlan: true, label: 'Made Money & Followed Plan', good: true },
  { result: 'lose', followedPlan: true, label: 'Lost Money & Followed Plan', good: true },
  { result: 'win', followedPlan: false, label: 'Made Money & No Plan', good: false },
  { result: 'lose', followedPlan: false, label: 'Lost Money & No Plan', good: false },
];

const moodEmojis = [
  { value: 1, emoji: '😡', label: 'Very Frustrated' },
  { value: 2, emoji: '😞', label: 'Sad' },
  { value: 3, emoji: '🙁', label: 'Disappointed' },
  { value: 4, emoji: '😐', label: 'Neutral' },
  { value: 5, emoji: '🙂', label: 'Content' },
  { value: 6, emoji: '😃', label: 'Happy' },
  { value: 7, emoji: '🤩', label: 'Euphoric' },
];

// Helper for mood emoji
const moodToEmoji = (mood: number) => {
  const found = moodEmojis.find(e => e.value === mood);
  return found ? found.emoji : '😐';
};

export const MBSTradingPanel: React.FC<MBSTradingPanelProps> = ({ isOpen, onEndSession, sessionGoal }) => {
  const [tradeType, setTradeType] = useState(tradeTypes[0]);
  const [quadrant, setQuadrant] = useState<{ result: 'win' | 'lose'; followedPlan: boolean } | null>(null);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState(3);
  const [tradeHistory, setTradeHistory] = useState<TradeLog[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showGutCheck, setShowGutCheck] = useState(false);
  const [gutMood, setGutMood] = useState(3);
  const [gutNote, setGutNote] = useState('');
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [moodCheckValue, setMoodCheckValue] = useState(3);
  const [moodCheckNote, setMoodCheckNote] = useState('');
  const [showBreak, setShowBreak] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [showSmartPrompt, setShowSmartPrompt] = useState(false);
  const [smartPromptText, setSmartPromptText] = useState('');
  const [smartPromptInput, setSmartPromptInput] = useState('');
  const [showPatternAlert, setShowPatternAlert] = useState(false);
  const [patternAlertText, setPatternAlertText] = useState('');
  const [showAddDetails, setShowAddDetails] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [editTradeType, setEditTradeType] = useState<string>('Long');
  const [editQuadrant, setEditQuadrant] = useState<{ result: 'win' | 'lose'; followedPlan: boolean } | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editMood, setEditMood] = useState<number>(4);
  const [editReflection, setEditReflection] = useState('');

  // Start timer on open
  useEffect(() => {
    if (isOpen) {
      setSessionStart(new Date());
      setElapsed('00:00:00');
    }
  }, [isOpen]);

  // Update timer
  useEffect(() => {
    if (!sessionStart) {
      return undefined;
    }
    timerRef.current = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStart]);

  // Gut check every 5 minutes
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const gutInterval = setInterval(() => {
      setShowGutCheck(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(gutInterval);
  }, [isOpen]);

  // Compute session stats
  const totalTrades = tradeHistory.length;
  const wins = tradeHistory.filter(t => t.result === 'win').length;
  const losses = tradeHistory.filter(t => t.result === 'lose').length;
  const avgMood = totalTrades > 0 ? Math.round(tradeHistory.reduce((sum, t) => sum + t.mood, 0) / totalTrades) : 3;
  const moodTimeline = tradeHistory.map(t => moodToEmoji(t.mood)).join(' ');

  // Pattern alert: 2+ anxious (mood 1 or 2) trades in a row
  useEffect(() => {
    if (tradeHistory.length >= 2) {
      const lastTwo = tradeHistory.slice(0, 2);
      if (lastTwo.every(t => t.mood <= 2)) {
        setPatternAlertText('You seem anxious in your last two trades. Consider taking a break or reviewing your plan.');
        setShowPatternAlert(true);
      } else {
        setShowPatternAlert(false);
      }
    } else {
      setShowPatternAlert(false);
    }
  }, [tradeHistory]);

  if (!isOpen) return null;

  const handleLogTrade = () => {
    if (!quadrant) return;
    const newTrade: TradeLog = {
      id: Date.now().toString(),
      type: tradeType,
      result: quadrant.result,
      followedPlan: quadrant.followedPlan,
      notes,
      mood,
      time: new Date().toLocaleTimeString(),
    };
    setTradeHistory([newTrade, ...tradeHistory]);
    setQuadrant(null);
    setNotes('');
    setMood(3);
    setShowDetails(false);
    setShowAddDetails(true);
    // Smart prompt logic
    if (newTrade.result === 'lose' || newTrade.mood <= 2) {
      setSmartPromptText('What was your biggest challenge in this trade?');
      setShowSmartPrompt(true);
    } else if (newTrade.result === 'win' && newTrade.mood >= 4) {
      setSmartPromptText('What did you do well? Anything to repeat?');
      setShowSmartPrompt(true);
    } else {
      setShowSmartPrompt(false);
    }
  };

  const handleGutCheckSubmit = () => {
    setShowGutCheck(false);
    setGutMood(3);
    setGutNote('');
  };

  const handleMoodCheckSubmit = () => {
    setShowMoodCheck(false);
    setMoodCheckValue(3);
    setMoodCheckNote('');
  };

  const handleBreakEnd = () => {
    setShowBreak(false);
  };

  const handleSmartPromptSubmit = () => {
    setShowSmartPrompt(false);
    setSmartPromptInput('');
    // Attach reflection to the most recent trade
    setTradeHistory(prev => {
      if (prev.length === 0) return prev;
      const [latest, ...rest] = prev;
      return [{ ...latest, reflection: smartPromptInput }, ...rest];
    });
  };

  const handleEditTrade = (trade: TradeLog) => {
    setEditingTradeId(trade.id);
    setEditTradeType(trade.type);
    setEditQuadrant({ result: trade.result, followedPlan: trade.followedPlan });
    setEditNotes(trade.notes);
    setEditMood(trade.mood);
    setEditReflection(trade.reflection || '');
  };

  const handleSaveEditTrade = () => {
    setTradeHistory(prev => prev.map(t =>
      t.id === editingTradeId
        ? { ...t, type: editTradeType, result: editQuadrant!.result, followedPlan: editQuadrant!.followedPlan, notes: editNotes, mood: editMood, reflection: editReflection }
        : t
    ));
    setEditingTradeId(null);
  };

  const handleCancelEditTrade = () => {
    setEditingTradeId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-blue-500 bg-blue-900">
        <div className="flex items-center gap-3">
          <span role="img" aria-label="goal" className="text-2xl">🎯</span>
          <span className="font-semibold text-lg">Session Goal:</span>
          <span className="italic text-lg">"{sessionGoal}"</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 font-mono">Session Time: {elapsed}</span>
          <Button variant="secondary" onClick={onEndSession}>End Session</Button>
        </div>
      </div>
      {/* Session Stats & Mood Timeline */}
      <div className="flex flex-row items-center justify-between px-8 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-6 items-center">
          <span className="text-blue-200 font-semibold">Trades: {totalTrades}</span>
          <span className="text-green-400">Wins: {wins}</span>
          <span className="text-red-400">Losses: {losses}</span>
          <span className="text-yellow-300">Avg Mood: {moodToEmoji(avgMood)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Mood:</span>
          <span className="text-2xl">{moodTimeline}</span>
        </div>
      </div>
      {/* Pattern Alert */}
      {showPatternAlert && (
        <div className="bg-yellow-900 text-yellow-200 text-center py-2 font-semibold">{patternAlertText}</div>
      )}
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Quick Log Panel */}
        <div className="w-full max-w-md mx-auto my-10 bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col gap-6">
          <div className="text-xl font-bold text-blue-300 mb-2">Quick Log</div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-4 mt-2">
              <Button variant={tradeType === 'Long' ? 'primary' : 'secondary'} onClick={() => setTradeType('Long')}>Long</Button>
              <Button variant={tradeType === 'Short' ? 'primary' : 'secondary'} onClick={() => setTradeType('Short')}>Short</Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {quadrantOptions.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  className={`p-4 rounded-lg font-semibold text-lg border-2 transition-colors focus:outline-none
                    ${quadrant && quadrant.result === opt.result && quadrant.followedPlan === opt.followedPlan
                      ? opt.good
                        ? 'bg-green-700 border-green-400 text-white'
                        : 'bg-red-700 border-red-400 text-white'
                      : 'bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600'}
                  `}
                  onClick={() => setQuadrant({ result: opt.result, followedPlan: opt.followedPlan })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Quick notes (optional)" />
            <div>
              <label className="block text-gray-200 mb-1">Mood</label>
              <div className="flex gap-2 bg-gray-800 rounded-lg p-2 justify-between">
                {moodEmojis.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`text-2xl p-1 rounded-lg transition-colors focus:outline-none
                      ${mood === opt.value ? 'bg-blue-700 border-2 border-blue-400' : 'hover:bg-gray-700 border-2 border-transparent'}`}
                    onClick={() => setMood(opt.value)}
                    aria-label={opt.label}
                  >
                    {opt.emoji}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleLogTrade} className="mt-2" disabled={!quadrant}>Log Trade</Button>
            <button className="text-blue-400 underline text-sm mt-1" onClick={() => setShowAddDetails(d => !d)}>Add Details (coming soon)</button>
          </div>
          {/* Smart Prompt after trade */}
          {showSmartPrompt && (
            <div className="mt-4 bg-blue-900/80 border border-blue-500 rounded-lg p-4">
              <div className="font-semibold mb-2">{smartPromptText}</div>
              <Input type="text" value={smartPromptInput} onChange={e => setSmartPromptInput(e.target.value)} placeholder="Type your answer..." />
              <div className="flex justify-end mt-2">
                <Button onClick={handleSmartPromptSubmit}>Submit</Button>
              </div>
            </div>
          )}
          {/* Add Details progressive disclosure (stub) */}
          {showAddDetails && (
            <div className="mt-4 bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="font-semibold mb-2">Add Details (coming soon)</div>
              <div className="text-gray-400 text-sm">Strategy, setup, tags, voice note, etc.</div>
              <div className="flex justify-end mt-2">
                <Button onClick={() => setShowAddDetails(false)}>Close</Button>
              </div>
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="flex flex-col gap-4 justify-start items-end p-8 w-64">
          <Button variant="secondary" onClick={() => setShowBreak(true)}>Take a Break</Button>
          <Button variant="secondary" onClick={() => setShowMoodCheck(true)}>Mood Check-in</Button>
        </div>
        {/* Trade History */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="text-lg font-semibold text-blue-200 mb-4">Session Trade History</div>
          <div className="space-y-3">
            {tradeHistory.length === 0 && <div className="text-gray-400">No trades logged yet.</div>}
            {tradeHistory.map(trade => {
              const isGood = (trade.result === 'win' && trade.followedPlan) || (trade.result === 'lose' && trade.followedPlan);
              const isEditing = editingTradeId === trade.id;
              return (
                <div key={trade.id} className={`bg-gray-700 rounded p-4 flex flex-col gap-1 border-2 ${isGood ? 'border-green-400' : 'border-red-400'}`}>
                  {isEditing ? (
                    <>
                      <div className="flex gap-4 text-sm text-gray-300 items-center">
                        <div className="flex gap-2">
                          <Button variant={editTradeType === 'Long' ? 'primary' : 'secondary'} onClick={() => setEditTradeType('Long')}>Long</Button>
                          <Button variant={editTradeType === 'Short' ? 'primary' : 'secondary'} onClick={() => setEditTradeType('Short')}>Short</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {quadrantOptions.map(opt => (
                            <button
                              key={opt.label}
                              type="button"
                              className={`p-2 rounded-lg font-semibold text-sm border-2 transition-colors focus:outline-none
                                ${editQuadrant && editQuadrant.result === opt.result && editQuadrant.followedPlan === opt.followedPlan
                                  ? opt.good
                                    ? 'bg-green-700 border-green-400 text-white'
                                    : 'bg-red-700 border-red-400 text-white'
                                  : 'bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600'}
                              `}
                              onClick={() => setEditQuadrant({ result: opt.result, followedPlan: opt.followedPlan })}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Input type="text" value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Quick notes (optional)" />
                      <div className="flex gap-2 bg-gray-800 rounded-lg p-2 justify-between">
                        {moodEmojis.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`text-2xl p-1 rounded-lg transition-colors focus:outline-none
                              ${editMood === opt.value ? 'bg-blue-700 border-2 border-blue-400' : 'hover:bg-gray-700 border-2 border-transparent'}`}
                            onClick={() => setEditMood(opt.value)}
                            aria-label={opt.label}
                          >
                            {opt.emoji}
                          </button>
                        ))}
                      </div>
                      <Input type="text" value={editReflection} onChange={e => setEditReflection(e.target.value)} placeholder="Reflection (optional)" />
                      <div className="flex gap-2 mt-2">
                        <Button onClick={handleSaveEditTrade}>Save</Button>
                        <Button variant="secondary" onClick={handleCancelEditTrade}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-4 text-sm text-gray-300 items-center">
                        <span>{trade.time}</span>
                        <span>{trade.type}</span>
                        <span>{trade.result === 'win' ? '🏆 Win' : '❌ Lose'}</span>
                        <span>Plan: {trade.followedPlan ? 'Yes' : 'No'}</span>
                        <span>Mood: {moodToEmoji(trade.mood)}</span>
                        <Button variant="secondary" size="sm" onClick={() => handleEditTrade(trade)}>Edit</Button>
                      </div>
                      {trade.notes && <div className="text-xs text-gray-400 mt-1">Notes: {trade.notes}</div>}
                      {trade.reflection && (
                        <div className="text-xs text-blue-300 mt-1">Reflection: {trade.reflection}</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Gut Check Modal */}
      {showGutCheck && (
        <Modal onClose={() => setShowGutCheck(false)} title="Gut Check">
          <div className="space-y-4 p-4">
            <div className="text-lg font-semibold text-center">How are you feeling?</div>
            <input type="range" min={1} max={5} value={gutMood} onChange={e => setGutMood(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>😞</span><span>😐</span><span>😃</span>
            </div>
            <Input type="text" value={gutNote} onChange={e => setGutNote(e.target.value)} placeholder="Quick note (optional)" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowGutCheck(false)}>Snooze</Button>
              <Button onClick={handleGutCheckSubmit}>Submit</Button>
            </div>
          </div>
        </Modal>
      )}
      {/* Mood Check-in Modal */}
      {showMoodCheck && (
        <Modal onClose={() => setShowMoodCheck(false)} title="Mood Check-in">
          <div className="space-y-4 p-4">
            <div className="text-lg font-semibold text-center">How are you feeling?</div>
            <input type="range" min={1} max={5} value={moodCheckValue} onChange={e => setMoodCheckValue(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>😞</span><span>😐</span><span>😃</span>
            </div>
            <Input type="text" value={moodCheckNote} onChange={e => setMoodCheckNote(e.target.value)} placeholder="Quick note (optional)" />
            <div className="flex justify-end">
              <Button onClick={handleMoodCheckSubmit}>Submit</Button>
            </div>
          </div>
        </Modal>
      )}
      {/* Break Modal */}
      {showBreak && (
        <Modal onClose={handleBreakEnd} title="Take a Break">
          <div className="space-y-4 p-4">
            <div className="text-lg font-semibold text-center">Take a short break!</div>
            <div className="text-center text-gray-400">Step away from the screen, stretch, and reset your mind.</div>
            <div className="flex justify-end">
              <Button onClick={handleBreakEnd}>End Break</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}; 