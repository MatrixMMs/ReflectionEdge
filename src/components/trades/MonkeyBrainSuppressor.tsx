import React, { useState, useEffect } from 'react';
import { TradingSession, EmotionEntry, CustomEmotion } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import useLocalStorage from '../../hooks/useLocalStorage';

interface MonkeyBrainSuppressorProps {
  onClose: () => void;
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

  const startTrading = () => {
    const session: TradingSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      tradeCount: 0,
      emotions: []
    };
    setCurrentSession(session);
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

  const getEmotionStats = () => {
    if (!currentSession) return null;

    const stats = currentSession.emotions.reduce((acc, entry) => {
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

      {!currentSession ? (
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
                onChange={e => setEmotionColor(e.target.value)}
                className="w-20"
              />
              <Button onClick={addEmotion} variant="secondary">Add</Button>
            </div>
          </div>
          <Button onClick={startTrading} variant="primary" className="w-full">
            Start Trading
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400">Trades: {currentSession.tradeCount}</p>
              <p className="text-gray-400">
                Time: {new Date(currentSession.startTime).toLocaleTimeString()}
              </p>
            </div>
            <Button onClick={incrementTradeCount} variant="primary">
              Complete Trade
            </Button>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Record Emotion</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {customEmotions.map(emotion => (
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
                    onChange={e => setEmotionIntensity(Number(e.target.value))}
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

          {currentSession.emotions.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Emotion Stats</h3>
              <div className="space-y-2">
                {getEmotionStats()?.map(stat => (
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