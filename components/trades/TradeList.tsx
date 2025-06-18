import React, { useState, useRef, useEffect } from 'react';
import { Trade, TagGroup, SubTag, PlaybookEntry } from '../../types';
import { Button } from '../ui/Button';
import { TrashIcon, PencilSquareIcon, MicrophoneIcon, StopCircleIcon } from '../ui/Icons';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Input';

interface TradeListProps {
  trades: Trade[];
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  onDeleteTrade: (id: string) => void;
  onEditTrade: (trade: Trade) => void;
  onTradeTagChange: (tradeId: string, groupId: string, subTagId: string | null) => void;
}

const TradeCard: React.FC<{
  trade: Trade;
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  onDelete: () => void;
  onEdit: () => void;
  onTagChange: (groupId: string, subTagId: string | null) => void;
  onJournalUpdate: (journal: string) => void;
}> = ({ trade, tagGroups, playbookEntries, onDelete, onEdit, onTagChange, onJournalUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const text = await transcribeAudio(audioBlob);
        onJournalUpdate(text);
        setIsJournalModalOpen(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // This is a placeholder for actual transcription logic
    // In a real app, you would send the audio to a transcription service
    return "Transcription placeholder";
  };

  const tradePnlClass = trade.profit >= 0 ? 'text-green-400' : 'text-red-400';
  const formattedTimeIn = new Date(trade.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedTimeOut = new Date(trade.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const strategy = trade.strategyId ? playbookEntries.find(entry => entry.id === trade.strategyId) : null;

  return (
    <li className="bg-gray-700 p-4 rounded-lg shadow-lg space-y-3 transition-shadow hover:shadow-purple-500/30">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xl font-bold text-purple-300">{trade.symbol || 'N/A'}</p>
          <p className="text-sm text-gray-400">Date: {trade.date}</p>
          <p className={`text-xs font-semibold ${trade.direction === 'long' ? 'text-green-300' : 'text-red-300'}`}>
            Direction: {trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)}
          </p>
          {strategy && (
            <p className="text-xs text-blue-300 mt-1">
              Strategy: {strategy.name}
            </p>
          )}
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
      <div className="flex flex-wrap gap-2">
        {tagGroups.map(group => {
          const subTagId = trade.tags[group.id];
          if (!subTagId) return null;
          const subTag = group.subtags.find(st => st.id === subTagId);
          if (!subTag) return null;
          return (
            <button
              key={group.id}
              onClick={() => onTagChange(group.id, null)}
              className="px-2 py-1 rounded-full text-xs flex items-center space-x-1 bg-gray-600 text-gray-300 hover:bg-gray-500"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subTag.color }} />
              <span>{subTag.name}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <p className="text-sm text-gray-400">Journal:</p>
          <p className="text-sm text-gray-300 mt-1">{trade.journal || 'No notes'}</p>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant="ghost"
            size="sm"
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? <StopCircleIcon className="w-5 h-5 text-red-500" /> : <MicrophoneIcon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {isJournalModalOpen && (
        <Modal title="Voice Journal" onClose={() => setIsJournalModalOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Your voice recording has been transcribed. You can edit the text below before saving.
            </p>
            <Textarea
              value={trade.journal}
              onChange={e => onJournalUpdate(e.target.value)}
              placeholder="Edit your transcribed notes..."
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsJournalModalOpen(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={() => setIsJournalModalOpen(false)} variant="primary">
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </li>
  );
};

export const TradeList: React.FC<TradeListProps> = ({ trades, tagGroups, playbookEntries, onDeleteTrade, onEditTrade, onTradeTagChange }) => {
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
          playbookEntries={playbookEntries}
          onDelete={() => onDeleteTrade(trade.id)}
          onEdit={() => onEditTrade(trade)}
          onTagChange={(groupId, subTagId) => onTradeTagChange(trade.id, groupId, subTagId)}
          onJournalUpdate={(journal) => handleJournalUpdate(trade.id, journal)}
        />
      ))}
    </ul>
  );
};
