
import React, { useState, useRef, useEffect } from 'react';
import { Trade, TagGroup, SubTag } from '../../types';
import { Button } from '../ui/Button';
import { TrashIcon, PencilSquareIcon, MicrophoneIcon, StopCircleIcon } from '../ui/Icons';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Input';


interface TradeListProps {
  trades: Trade[];
  tagGroups: TagGroup[];
  onDeleteTrade: (id: string) => void;
  onEditTrade: (trade: Trade) => void;
  onTradeTagChange: (tradeId: string, groupId: string, subTagId: string | null) => void;
}

const TradeCard: React.FC<{
  trade: Trade;
  tagGroups: TagGroup[];
  onDelete: () => void;
  onEdit: () => void;
  onTagChange: (groupId: string, subTagId: string | null) => void;
  onJournalUpdate: (journal: string) => void;
}> = ({ trade, tagGroups, onDelete, onEdit, onTagChange, onJournalUpdate }) => {
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [currentJournal, setCurrentJournal] = useState(trade.journal);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechApiSupported, setSpeechApiSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null); // New state for speech errors
  const speechRecognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechApiSupported(false);
    }
    return () => {
      if (speechRecognitionRef.current && (isRecording || isProcessing)) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current.onstart = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current = null;
        setIsRecording(false);
        setIsProcessing(false);
      }
    };
  }, [isRecording, isProcessing]);


  const getSubTagById = (subTagId: string): SubTag | undefined => {
    for (const group of tagGroups) {
      const found = group.subtags.find(st => st.id === subTagId);
      if (found) return found;
    }
    return undefined;
  };
  
  const handleJournalSave = () => {
    onJournalUpdate(currentJournal);
    setIsJournalModalOpen(false);
    setSpeechError(null); // Clear error on save
  };

  const handleRecordButtonClick = () => {
    if (!speechApiSupported) return;
    setSpeechError(null); // Clear previous errors

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechApiSupported(false);
      setSpeechError("Speech Recognition API not supported by your browser.");
      return;
    }

    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      // States will be updated by onend/onerror
    } else {
      speechRecognitionRef.current = new SpeechRecognitionAPI();
      const recognition = speechRecognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsProcessing(false);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentJournal(prev => prev.trim() ? prev + ' ' + transcript : transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event.message);
        let errorMessage = "Speech recognition failed.";
        if (event.error === 'network') {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please try again.";
        } else if (event.error === 'audio-capture') {
          errorMessage = "Audio capture failed. Ensure microphone is connected and permissions are granted.";
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorMessage = "Microphone access denied. Please enable microphone permissions in your browser settings.";
        }
        setSpeechError(errorMessage);
        setIsRecording(false);
        setIsProcessing(false);
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.onstart = null;
            speechRecognitionRef.current.onresult = null;
            speechRecognitionRef.current.onerror = null;
            speechRecognitionRef.current.onend = null;
            speechRecognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsProcessing(false);
        if (speechRecognitionRef.current) { // Check if not already nulled by onerror
            speechRecognitionRef.current.onstart = null;
            speechRecognitionRef.current.onresult = null;
            speechRecognitionRef.current.onerror = null;
            speechRecognitionRef.current.onend = null;
            speechRecognitionRef.current = null;
        }
      };
      
      setIsProcessing(true);
      try {
        recognition.start();
      } catch (e: any) {
        console.error("Error starting speech recognition:", e);
        setSpeechError("Could not start speech recognition. " + (e.message || ""));
        setIsProcessing(false);
        setIsRecording(false);
         if (speechRecognitionRef.current) {
            speechRecognitionRef.current.onstart = null;
            speechRecognitionRef.current.onresult = null;
            speechRecognitionRef.current.onerror = null;
            speechRecognitionRef.current.onend = null;
            speechRecognitionRef.current = null;
        }
      }
    }
  };

  const tradePnlClass = trade.profit >= 0 ? 'text-green-400' : 'text-red-400';
  const formattedTimeIn = new Date(trade.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedTimeOut = new Date(trade.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


  return (
    <li className="bg-gray-700 p-4 rounded-lg shadow-lg space-y-3 transition-shadow hover:shadow-purple-500/30">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xl font-bold text-purple-300">{trade.symbol || 'N/A'}</p>
          <p className="text-sm text-gray-400">Date: {trade.date}</p>
           <p className={`text-xs font-semibold ${trade.direction === 'long' ? 'text-green-300' : 'text-red-300'}`}>
            Direction: {trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)}
          </p>
        </div>
        <div className="flex flex-col items-end">
            <p className={`text-2xl font-semibold ${tradePnlClass}`}>
                ${trade.profit.toFixed(2)}
            </p>
            <div className="flex space-x-2 mt-1">
                <Button onClick={onEdit} variant="ghost" size="sm" aria-label="Edit trade"><PencilSquareIcon className="w-5 h-5"/></Button>
                <Button onClick={onDelete} variant="ghost" size="sm" aria-label="Delete trade"><TrashIcon className="w-5 h-5 text-red-500"/></Button>
            </div>
        </div>
      </div>
      <div className="text-sm text-gray-300 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
        <p>Entry: ${trade.entry.toFixed(2)}</p>
        <p>Exit: ${trade.exit.toFixed(2)}</p>
        <p>Contracts: {trade.contracts?.toLocaleString() || 'N/A'}</p>
        <p>Time In: {formattedTimeIn}</p>
        <p>Time Out: {formattedTimeOut}</p>
        <p>Duration: {trade.timeInTrade.toFixed(0)} min</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-1">Tags:</h4>
        <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(trade.tags).map(([groupId, subTagId]) => {
                const subTag = getSubTagById(subTagId);
                const group = tagGroups.find(g => g.id === groupId);
                if (!subTag || !group) return null;
                return (
                    <span key={subTag.id} className="px-2 py-0.5 text-xs rounded-full text-white font-medium" style={{ backgroundColor: subTag.color }}>
                        {group.name}: {subTag.name}
                    </span>
                );
            })}
            {Object.keys(trade.tags).length === 0 && <span className="text-xs text-gray-500">No tags assigned</span>}
        </div>
        {tagGroups.map(group => (
          <div key={group.id} className="mb-1">
            <select
              value={trade.tags[group.id] || ''}
              onChange={e => onTagChange(group.id, e.target.value || null)}
              className="w-full bg-gray-600 border border-gray-500 text-gray-100 text-xs rounded-md focus:ring-purple-500 focus:border-purple-500 p-1.5"
              aria-label={`Select ${group.name}`}
            >
              <option value="">-- {group.name} --</option>
              {group.subtags.map(subtag => (
                <option key={subtag.id} value={subtag.id} style={{color: subtag.color}}>
                  {subtag.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      
      <div>
          <Button variant="ghost" size="sm" onClick={() => { setCurrentJournal(trade.journal); setSpeechError(null); setIsJournalModalOpen(true); }}>
            {trade.journal ? "View/Edit Journal" : "Add Journal"}
          </Button>
      </div>

      {isJournalModalOpen && (
        <Modal title={`Journal for Trade ${trade.symbol} on ${trade.date}`} onClose={() => { setIsJournalModalOpen(false); setSpeechError(null); } }>
            <Textarea 
                value={currentJournal}
                onChange={(e) => setCurrentJournal(e.target.value)}
                rows={6}
                className="min-h-[150px]"
                placeholder="Type or record your trade journal..."
            />
             {speechError && <p className="text-xs text-red-400 mt-2">{speechError}</p>}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                    {!speechApiSupported ? (
                        <p className="text-xs text-red-400">Speech input not supported by your browser.</p>
                    ) : (
                        <Button 
                            onClick={handleRecordButtonClick} 
                            variant="ghost" 
                            size="sm"
                            disabled={isProcessing || isRecording}
                            aria-label={isRecording ? "Stop recording" : "Start recording journal"}
                        >
                            {isRecording ? <StopCircleIcon className="w-5 h-5 text-red-500" /> : <MicrophoneIcon className="w-5 h-5" />}
                            <span className="ml-2">
                                {isRecording ? "Stop Recording" : isProcessing ? "Starting..." : "Record"}
                            </span>
                        </Button>
                    )}
                     {isRecording && !isProcessing && <p className="text-xs text-purple-400 animate-pulse">Recording...</p>}
                </div>
                <Button onClick={handleJournalSave} variant="primary">Save Journal</Button>
            </div>
        </Modal>
      )}
    </li>
  );
};


export const TradeList: React.FC<TradeListProps> = ({ trades, tagGroups, onDeleteTrade, onEditTrade, onTradeTagChange }) => {
  
  const handleJournalUpdate = (tradeId: string, journal: string) => {
    const tradeToUpdate = trades.find(t => t.id === tradeId);
    if (tradeToUpdate) {
      onEditTrade({ ...tradeToUpdate, journal });
    }
  };

  if (trades.length === 0) {
    return <p className="text-center text-gray-500 py-8">No trades logged yet. Click "Add Trade" to get started!</p>;
  }

  const sortedTrades = [...trades].sort((a, b) => {
    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    return new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime();
  });


  return (
    <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {sortedTrades.map(trade => (
        <TradeCard 
            key={trade.id}
            trade={trade}
            tagGroups={tagGroups}
            onDelete={() => onDeleteTrade(trade.id)}
            onEdit={() => onEditTrade(trade)}
            onTagChange={(groupId, subTagId) => onTradeTagChange(trade.id, groupId, subTagId)}
            onJournalUpdate={(journal) => handleJournalUpdate(trade.id, journal)}
        />
      ))}
    </ul>
  );
};
