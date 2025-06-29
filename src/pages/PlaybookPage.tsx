import React, { useState } from 'react';
import { PlaybookEntry, TagGroup } from '../types';
import { PlaybookList } from '../components/playbook/PlaybookList';
import { PlaybookEditor } from '../components/playbook/PlaybookEditor';
import { Button } from '../components/ui/Button';
import { PlusCircleIcon } from '../components/ui/Icons';

interface PlaybookPageProps {
  playbookEntries: PlaybookEntry[];
  tagGroups: TagGroup[];
  onAddPlaybookEntry: (entry: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePlaybookEntry: (entry: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditPlaybookEntry: (entry: PlaybookEntry) => void;
}

const PlaybookPage: React.FC<PlaybookPageProps> = ({
  playbookEntries,
  tagGroups,
  onAddPlaybookEntry,
  onUpdatePlaybookEntry,
  onEditPlaybookEntry
}) => {
  const [selectedPlaybookEntry, setSelectedPlaybookEntry] = useState<PlaybookEntry | null>(null);
  const [isAddingPlaybook, setIsAddingPlaybook] = useState(false);
  const [isEditingPlaybook, setIsEditingPlaybook] = useState(false);

  const handleSave = (data: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedPlaybookEntry) {
      onUpdatePlaybookEntry(data);
    } else {
      onAddPlaybookEntry(data);
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

  const handleEdit = (entry: PlaybookEntry) => {
    setSelectedPlaybookEntry(entry);
    setIsAddingPlaybook(false);
    setIsEditingPlaybook(true);
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
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaybookPage; 