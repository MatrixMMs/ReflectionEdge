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
    setIsAddingPlaybook(false);
    setIsEditingPlaybook(false);
    setSelectedPlaybookEntry(null);
  };

  return (
    <div className="min-h-screen text-gray-100" style={{ background: 'var(--background-main)' }}>
      {/* Header Card: full width, flush with top/left/right - positioned absolutely to break out of main content constraints */}
      <div 
        className="bg-gray-800 p-3 flex items-center justify-between absolute top-0 left-0 right-0 z-10" 
        style={{ 
          background: 'var(--background-secondary)',
          marginLeft: 'var(--sidebar-width)',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)', marginLeft: '1rem' }}>Playbook</h1>
        <div>
          {/* Future: Filters, etc. */}
        </div>
      </div>
      {/* Page Content: padded, not touching sidebar or page edges - with top margin to account for header */}
      <div className="p-6 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Content */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6" style={{ background: 'var(--background-secondary)' }}>
            {isAddingPlaybook || isEditingPlaybook || selectedPlaybookEntry ? (
              <PlaybookEditor
                entry={selectedPlaybookEntry || undefined}
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
    </div>
  );
};

export default PlaybookPage; 