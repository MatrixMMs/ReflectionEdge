import React, { useState } from 'react';
import { PlaybookEntry, TagGroup } from '../types';
import { PlaybookList } from '../components/playbook/PlaybookList';
import { PlaybookEditor } from '../components/playbook/PlaybookEditor';
import { Button } from '../components/ui/Button';
import { PlusCircleIcon } from '../components/ui/Icons';

interface PlaybookPageProps {
  tagGroups: TagGroup[];
  initialPlaybookEntries: PlaybookEntry[];
}

const PlaybookPage: React.FC<PlaybookPageProps> = ({ tagGroups, initialPlaybookEntries }) => {
  const [playbookEntries, setPlaybookEntries] = useState<PlaybookEntry[]>(initialPlaybookEntries);
  const [selectedPlaybookEntry, setSelectedPlaybookEntry] = useState<PlaybookEntry | null>(null);
  const [isAddingPlaybook, setIsAddingPlaybook] = useState(false);
  const [isEditingPlaybook, setIsEditingPlaybook] = useState(false);

  const handleAddPlaybookEntry = (entry: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: PlaybookEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setPlaybookEntries(prev => [...prev, newEntry]);
    setIsAddingPlaybook(false);
  };

  const handleUpdatePlaybookEntry = (entry: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedPlaybookEntry) return;
    setPlaybookEntries(prev => prev.map(e => 
      e.id === selectedPlaybookEntry.id ? { 
        ...entry,
        id: selectedPlaybookEntry.id,
        createdAt: selectedPlaybookEntry.createdAt,
        updatedAt: new Date().toISOString()
      } : e
    ));
    setIsEditingPlaybook(false);
    setSelectedPlaybookEntry(null);
  };

  const handleEditPlaybookEntry = (entry: PlaybookEntry) => {
    setSelectedPlaybookEntry(entry);
    setIsAddingPlaybook(false);
    setIsEditingPlaybook(true);
  };

  const handleSave = (data: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedPlaybookEntry) {
      handleUpdatePlaybookEntry(data);
    } else {
      handleAddPlaybookEntry(data);
    }
    setIsAddingPlaybook(false);
    setIsEditingPlaybook(false);
    setSelectedPlaybookEntry(null);
  };

  const handleCancel = () => {
    setIsAddingPlaybook(false);
    setIsEditingPlaybook(false);
    setSelectedPlaybookEntry(null);
  };

  const handleAdd = () => {
    setIsAddingPlaybook(true);
    setIsEditingPlaybook(false);
    setSelectedPlaybookEntry(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Playbook</h1>
            <p className="text-gray-400 mt-2">Manage your trading strategies and setups</p>
          </div>
          <Button
            onClick={handleAdd}
            variant="primary"
            leftIcon={<PlusCircleIcon className="w-5 h-5" />}
          >
            Add Strategy
          </Button>
        </div>
        {/* Content */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          {isAddingPlaybook || isEditingPlaybook || selectedPlaybookEntry ? (
            <PlaybookEditor
              entry={selectedPlaybookEntry || undefined}
              tagGroups={tagGroups}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <PlaybookList
              entries={playbookEntries}
              onSelect={(entry) => setSelectedPlaybookEntry(entry)}
              onAdd={handleAdd}
              onEdit={handleEditPlaybookEntry}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaybookPage; 