import React, { useState, useEffect } from 'react';
import { TradingSession, EmotionEntry, CustomEmotion } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import useLocalStorage from '../../hooks/useLocalStorage';

interface MonkeyBrainSuppressorProps {
  onClose: () => void;
}

interface ChecklistItem {
  id: string;
  question: string;
  isRequired: boolean;
  checked: boolean;
}

export const MonkeyBrainSuppressor: React.FC<MonkeyBrainSuppressorProps> = ({ onClose }) => {
  const [customEmotions, setCustomEmotions] = useLocalStorage<CustomEmotion[]>('custom-emotions', [
    { id: '1', name: 'FOMO', color: '#FF4B4B' },
    { id: '2', name: 'Revenge Trading', color: '#FF9F40' },
    { id: '3', name: 'Overconfident', color: '#FFD700' },
    { id: '4', name: 'Anxious', color: '#9B59B6' },
    { id: '5', name: 'Focused', color: '#2ECC71' }
  ]);

  const [tradingSessions, setTradingSessions] = useLocalStorage<TradingSession[]>('trading-sessions', []);
  const [currentSession, setCurrentSession] = useState<TradingSession | null>(null);
  const [newEmotion, setNewEmotion] = useState('');
  const [emotionColor, setEmotionColor] = useState('#FF4B4B');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [emotionIntensity, setEmotionIntensity] = useState<number>(3);
  const [showPlanConfirmation, setShowPlanConfirmation] = useState(false);
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState<'initial' | 'checklist' | 'trading'>('initial');

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      question: 'Do you have a trading plan for the day?',
      isRequired: true,
      checked: false
    },
    {
      id: '2',
      question: 'Have you reviewed your risk management rules?',
      isRequired: true,
      checked: false
    },
    {
      id: '3',
      question: 'Have you set your maximum loss limit for the day?',
      isRequired: true,
      checked: false
    },
    {
      id: '4',
      question: 'Have you reviewed market conditions and key news?',
      isRequired: true,
      checked: false
    },
    {
      id: '5',
      question: 'Is your trading environment free from distractions?',
      isRequired: true,
      checked: false
    },
    {
      id: '6',
      question: 'Are you well-rested and in a good mental state?',
      isRequired: true,
      checked: false
    },
    {
      id: '7',
      question: 'Have you set specific entry/exit criteria for today?',
      isRequired: true,
      checked: false
    },
    {
      id: '8',
      question: 'Have you reviewed your previous trading session?',
      isRequired: false,
      checked: false
    }
  ]);

  const startTrading = () => {
    setCurrentStep('checklist');
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
  };

  const handleChecklistItem = (itemId: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const canStartTrading = () => {
    return checklist.every(item => !item.isRequired || item.checked);
  };

  const handleStartTrading = () => {
    if (canStartTrading()) {
      const session: TradingSession = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        tradeCount: 0,
        emotions: []
      };
      setCurrentSession(session);
      setCurrentStep('trading');
    }
  };

  const endTrading = () => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: new Date().toISOString()
      };
      setTradingSessions([...tradingSessions, endedSession]);
      setCurrentSession(null);
    }
  };

  const incrementTradeCount = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        tradeCount: currentSession.tradeCount + 1
      });
    }
  };

  const addEmotion = () => {
    if (newEmotion.trim()) {
      const emotion: CustomEmotion = {
        id: Date.now().toString(),
        name: newEmotion.trim(),
        color: emotionColor
      };
      setCustomEmotions([...customEmotions, emotion]);
      setNewEmotion('');
      setEmotionColor('#FF4B4B');
    }
  };

  const recordEmotion = () => {
    if (currentSession && selectedEmotion) {
      const emotionEntry: EmotionEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        emotion: selectedEmotion,
        intensity: emotionIntensity,
        tradeNumber: currentSession.tradeCount
      };
      setCurrentSession({
        ...currentSession,
        emotions: [...currentSession.emotions, emotionEntry]
      });
      setSelectedEmotion(null);
      setEmotionIntensity(3);
    }
  };

  const getEmotionStats = (session: TradingSession) => {
    const stats = session.emotions.reduce((acc, entry) => {
      if (!acc[entry.emotion]) {
        acc[entry.emotion] = {
          count: 0,
          totalIntensity: 0,
          color: customEmotions.find(e => e.name === entry.emotion)?.color || '#808080'
        };
      }
      acc[entry.emotion].count++;
      acc[entry.emotion].totalIntensity += entry.intensity;
      return acc;
    }, {} as { [key: string]: { count: number; totalIntensity: number; color: string } });

    return Object.entries(stats).map(([emotion, data]) => ({
      emotion,
      count: data.count,
      averageIntensity: data.totalIntensity / data.count,
      color: data.color
    }));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Monkey Brain Suppressor</h2>
        <Button onClick={onClose} variant="ghost">×</Button>
      </div>

      {currentStep === 'checklist' ? (
        <div className="space-y-6">
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-6">Pre-Trading Checklist</h3>
            
            {/* Required Questions */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-red-400 mb-4">Required Items</h4>
              <div className="space-y-4">
                {checklist.filter(item => item.isRequired).map(item => (
                  <div 
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded ${
                      item.checked ? 'bg-gray-600/30' : 'bg-gray-800/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleChecklistItem(item.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gray-100">{item.question}</p>
                      <p className="text-sm text-red-400">Required</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Questions */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-400 mb-4">Optional Items</h4>
              <div className="space-y-4">
                {checklist.filter(item => !item.isRequired).map(item => (
                  <div 
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded ${
                      item.checked ? 'bg-gray-600/30' : 'bg-gray-800/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleChecklistItem(item.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gray-100">{item.question}</p>
                      <p className="text-sm text-gray-400">Optional</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4 justify-end">
              <Button
                onClick={() => setCurrentStep('initial')}
                variant="secondary"
              >
                Back
              </Button>
              <Button
                onClick={handleStartTrading}
                variant="primary"
                disabled={!canStartTrading()}
              >
                Start Trading
              </Button>
            </div>
            {!canStartTrading() && (
              <p className="mt-4 text-red-400 text-center">
                Please complete all required items before starting your trading session.
              </p>
            )}
          </div>
        </div>
      ) : currentStep === 'initial' ? (
        <div className="space-y-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Custom Emotions</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              {customEmotions.map((emotion: CustomEmotion) => (
                <div 
                  key={emotion.id}
                  className="flex items-center justify-between p-2 rounded"
                  style={{ backgroundColor: emotion.color + '20' }}
                >
                  <span>{emotion.name}</span>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: emotion.color }}></div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newEmotion}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmotion(e.target.value)}
                placeholder="New emotion name"
                className="flex-1"
              />
              <Input
                type="color"
                value={emotionColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmotionColor(e.target.value)}
                className="w-20"
              />
              <Button onClick={addEmotion} variant="secondary">Add</Button>
            </div>
          </div>

          {tradingSessions.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Past Trading Sessions</h3>
              <div className="space-y-4">
                {tradingSessions.map((session) => {
                  const startDate = new Date(session.startTime);
                  const endDate = session.endTime ? new Date(session.endTime) : null;
                  const duration = endDate 
                    ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
                    : 0;

                  return (
                    <div key={session.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-400">
                            {startDate.toLocaleDateString()} {startDate.toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            Duration: {duration} minutes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Trades: {session.tradeCount}</p>
                          <p className="text-sm text-gray-400">
                            Emotions: {session.emotions.length}
                          </p>
                        </div>
                      </div>

                      {session.emotions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Emotion Stats</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {getEmotionStats(session).map(stat => (
                              <div 
                                key={stat.emotion}
                                className="flex justify-between items-center p-2 rounded text-sm"
                                style={{ backgroundColor: stat.color + '20' }}
                              >
                                <span>{stat.emotion}</span>
                                <div className="text-right">
                                  <div>Count: {stat.count}</div>
                                  <div>Avg: {stat.averageIntensity.toFixed(1)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button onClick={startTrading} variant="primary" className="w-full">
            Start Trading
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400">Trades: {currentSession?.tradeCount ?? 0}</p>
              <p className="text-gray-400">
                Time: {currentSession ? new Date(currentSession.startTime).toLocaleTimeString() : ''}
              </p>
            </div>
            <Button onClick={incrementTradeCount} variant="primary">
              Complete Trade
            </Button>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Record Emotion</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {customEmotions.map((emotion: CustomEmotion) => (
                <button
                  key={emotion.id}
                  onClick={() => setSelectedEmotion(emotion.name)}
                  className={`p-2 rounded transition-colors ${
                    selectedEmotion === emotion.name 
                      ? 'ring-2 ring-blue-500' 
                      : 'hover:bg-gray-600'
                  }`}
                  style={{ backgroundColor: emotion.color + '20' }}
                >
                  {emotion.name}
                </button>
              ))}
            </div>
            {selectedEmotion && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Intensity (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={emotionIntensity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmotionIntensity(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                <Button onClick={recordEmotion} variant="secondary" className="w-full">
                  Record Emotion
                </Button>
              </div>
            )}
          </div>

          {currentSession && currentSession.emotions.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Current Session Stats</h3>
              <div className="space-y-2">
                {getEmotionStats(currentSession).map(stat => (
                  <div 
                    key={stat.emotion}
                    className="flex justify-between items-center p-2 rounded"
                    style={{ backgroundColor: stat.color + '20' }}
                  >
                    <span>{stat.emotion}</span>
                    <div className="text-right">
                      <div>Count: {stat.count}</div>
                      <div>Avg Intensity: {stat.averageIntensity.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={endTrading} variant="secondary" className="w-full">
            End Trading
          </Button>
        </div>
      )}
    </div>
  );
}; 