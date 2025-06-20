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

interface TradeResult {
  id: string;
  timestamp: string;
  result: 'win' | 'lose';
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

  // Win/Lose tracking
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([]);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [timeoutEndTime, setTimeoutEndTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showSessionResults, setShowSessionResults] = useState<boolean>(false);

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

  // Timer effect for timeout countdown
  useEffect(() => {
    if (isTimedOut && timeoutEndTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeLeft = timeoutEndTime.getTime() - now.getTime();
        
        if (timeLeft <= 0) {
          setIsTimedOut(false);
          setTimeoutEndTime(null);
          setConsecutiveLosses(0);
          setTimeRemaining('');
        } else {
          const minutes = Math.floor(timeLeft / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTimedOut, timeoutEndTime]);

  const startTrading = () => {
    setCurrentStep('checklist');
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
    setTradeResults([]);
    setConsecutiveLosses(0);
    setIsTimedOut(false);
    setTimeoutEndTime(null);
    setTimeRemaining('');
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
      setShowSessionResults(true);
    }
  };

  const confirmEndTrading = () => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: new Date().toISOString()
      };
      setTradingSessions([...tradingSessions, endedSession]);
      setCurrentSession(null);
      setShowSessionResults(false);
      setTradeResults([]);
      setConsecutiveLosses(0);
      setIsTimedOut(false);
      setTimeoutEndTime(null);
      setTimeRemaining('');
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

  const handleTradeResult = (result: 'win' | 'lose') => {
    if (isTimedOut) {
      alert('You are currently in timeout. Please wait before making another trade.');
      return;
    }

    const newTradeResult: TradeResult = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      result
    };

    setTradeResults(prev => [...prev, newTradeResult]);

    if (result === 'lose') {
      const newConsecutiveLosses = consecutiveLosses + 1;
      setConsecutiveLosses(newConsecutiveLosses);

      if (newConsecutiveLosses >= 3) {
        // Start 5-minute timeout
        setIsTimedOut(true);
        const endTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        setTimeoutEndTime(endTime);
        alert('3 consecutive losses detected. You are now in a 5-minute timeout to prevent emotional trading.');
      }
    } else {
      // Reset consecutive losses on win
      setConsecutiveLosses(0);
    }

    // Increment trade count
    incrementTradeCount();
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

  const getTradeStats = () => {
    const totalTrades = tradeResults.length;
    const wins = tradeResults.filter(t => t.result === 'win').length;
    const losses = tradeResults.filter(t => t.result === 'lose').length;
    const winRate = totalTrades > 0 ? (wins / totalTrades * 100).toFixed(1) : '0';
    
    return { totalTrades, wins, losses, winRate };
  };

  const getSessionStats = () => {
    if (!currentSession) return null;

    const startTime = new Date(currentSession.startTime);
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

    const totalTrades = tradeResults.length;
    const wins = tradeResults.filter(t => t.result === 'win').length;
    const losses = tradeResults.filter(t => t.result === 'lose').length;
    const winRate = totalTrades > 0 ? (wins / totalTrades * 100).toFixed(1) : '0';

    // Calculate consecutive losses
    let maxConsecutiveLosses = 0;
    let currentStreak = 0;
    tradeResults.forEach(trade => {
      if (trade.result === 'lose') {
        currentStreak++;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    // Calculate average time between trades
    const avgTimeBetweenTrades = totalTrades > 1 ? 
      Math.round(duration / totalTrades) : 0;

    // Emotion analysis
    const emotionStats = getEmotionStats(currentSession);
    const mostFrequentEmotion = emotionStats.length > 0 ? 
      emotionStats.reduce((prev, current) => 
        prev.count > current.count ? prev : current
      ) : null;

    return {
      duration,
      totalTrades,
      wins,
      losses,
      winRate,
      maxConsecutiveLosses,
      avgTimeBetweenTrades,
      emotionStats,
      mostFrequentEmotion,
      startTime: startTime.toLocaleString(),
      endTime: endTime.toLocaleString()
    };
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
          {/* Timeout Warning */}
          {isTimedOut && (
            <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Trading Timeout</h3>
                  <p className="text-red-300">3 consecutive losses detected. Take a break to prevent emotional trading.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">{timeRemaining}</div>
                  <div className="text-sm text-red-300">Time remaining</div>
                </div>
              </div>
            </div>
          )}

          {/* Trade Statistics */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Trade Statistics</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{getTradeStats().wins}</div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{getTradeStats().losses}</div>
                <div className="text-sm text-gray-400">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{getTradeStats().winRate}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{consecutiveLosses}</div>
                <div className="text-sm text-gray-400">Consecutive Losses</div>
              </div>
            </div>
          </div>

          {/* Win/Lose Buttons */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Record Trade Result</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleTradeResult('win')}
                variant="primary"
                className="bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                disabled={isTimedOut}
              >
                🎯 WIN
              </Button>
              <Button
                onClick={() => handleTradeResult('lose')}
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
                disabled={isTimedOut}
              >
                ❌ LOSE
              </Button>
            </div>
            {isTimedOut && (
              <p className="mt-2 text-center text-red-400 text-sm">
                Trading is temporarily disabled during timeout
              </p>
            )}
          </div>

          {/* Session Info */}
          <div className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
            <div>
              <p className="text-gray-400">Total Trades: {currentSession?.tradeCount ?? 0}</p>
              <p className="text-gray-400">
                Session Start: {currentSession ? new Date(currentSession.startTime).toLocaleTimeString() : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Trades Today: {getTradeStats().totalTrades}</p>
              <p className="text-gray-400">Win Rate: {getTradeStats().winRate}%</p>
            </div>
          </div>

          {/* Recent Trade History */}
          {tradeResults.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tradeResults.slice(-5).reverse().map((trade) => (
                  <div 
                    key={trade.id}
                    className={`flex justify-between items-center p-2 rounded ${
                      trade.result === 'win' ? 'bg-green-900/30' : 'bg-red-900/30'
                    }`}
                  >
                    <span className={`font-semibold ${
                      trade.result === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.result === 'win' ? '🎯 WIN' : '❌ LOSE'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            End Trading Session
          </Button>
        </div>
      )}

      {/* Session Results Modal */}
      {showSessionResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-100">Trading Session Results</h2>
              <Button onClick={() => setShowSessionResults(false)} variant="ghost">×</Button>
            </div>

            {(() => {
              const stats = getSessionStats();
              if (!stats) return null;

              return (
                <div className="space-y-6">
                  {/* Session Overview */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">Session Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Duration</p>
                        <p className="text-xl font-bold">{stats.duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Trades</p>
                        <p className="text-xl font-bold">{stats.totalTrades}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Start Time</p>
                        <p className="text-sm">{stats.startTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">End Time</p>
                        <p className="text-sm">{stats.endTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-green-400">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{stats.wins}</div>
                        <div className="text-sm text-gray-400">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
                        <div className="text-sm text-gray-400">Losses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">{stats.winRate}%</div>
                        <div className="text-sm text-gray-400">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">{stats.maxConsecutiveLosses}</div>
                        <div className="text-sm text-gray-400">Max Consecutive Losses</div>
                      </div>
                    </div>
                    {stats.avgTimeBetweenTrades > 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-gray-400 text-sm">Average Time Between Trades</p>
                        <p className="text-lg font-semibold">{stats.avgTimeBetweenTrades} minutes</p>
                      </div>
                    )}
                  </div>

                  {/* Emotion Analysis */}
                  {stats.emotionStats.length > 0 && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-purple-400">Emotion Analysis</h3>
                      <div className="space-y-3">
                        {stats.emotionStats.map(stat => (
                          <div 
                            key={stat.emotion}
                            className="flex justify-between items-center p-3 rounded"
                            style={{ backgroundColor: stat.color + '20' }}
                          >
                            <div>
                              <span className="font-semibold">{stat.emotion}</span>
                              {stats.mostFrequentEmotion?.emotion === stat.emotion && (
                                <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded">Most Frequent</span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">Count: {stat.count}</div>
                              <div className="text-sm text-gray-400">Avg Intensity: {stat.averageIntensity.toFixed(1)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trade Timeline */}
                  {tradeResults.length > 0 && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-300">Trade Timeline</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tradeResults.map((trade, index) => (
                          <div 
                            key={trade.id}
                            className={`flex justify-between items-center p-2 rounded ${
                              trade.result === 'win' ? 'bg-green-900/30' : 'bg-red-900/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-400">#{index + 1}</span>
                              <span className={`font-semibold ${
                                trade.result === 'win' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {trade.result === 'win' ? '🎯 WIN' : '❌ LOSE'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">
                              {new Date(trade.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Insights */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-orange-400">Performance Insights</h3>
                    <div className="space-y-3">
                      {parseFloat(stats.winRate) >= 60 && (
                        <div className="flex items-center gap-2 text-green-400">
                          <span>✅</span>
                          <span>Excellent win rate! Keep up the good work.</span>
                        </div>
                      )}
                      {parseFloat(stats.winRate) < 40 && (
                        <div className="flex items-center gap-2 text-red-400">
                          <span>⚠️</span>
                          <span>Consider reviewing your strategy and risk management.</span>
                        </div>
                      )}
                      {stats.maxConsecutiveLosses >= 3 && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <span>⚠️</span>
                          <span>Multiple consecutive losses detected. Consider taking breaks.</span>
                        </div>
                      )}
                      {stats.avgTimeBetweenTrades < 5 && stats.totalTrades > 3 && (
                        <div className="flex items-center gap-2 text-blue-400">
                          <span>💡</span>
                          <span>Fast trading pace. Consider slowing down for better analysis.</span>
                        </div>
                      )}
                      {stats.emotionStats.length > 0 && stats.mostFrequentEmotion && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <span>🧠</span>
                          <span>Most frequent emotion: <strong>{stats.mostFrequentEmotion.emotion}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setShowSessionResults(false)} 
                      variant="secondary" 
                      className="flex-1"
                    >
                      Continue Session
                    </Button>
                    <Button 
                      onClick={confirmEndTrading} 
                      variant="primary" 
                      className="flex-1"
                    >
                      End Session
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}; 