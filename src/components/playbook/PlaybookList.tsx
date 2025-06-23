import React from 'react';
import { PlaybookEntry } from '../../types';
import { PencilIcon } from '@heroicons/react/24/outline';

interface PlaybookListProps {
  entries: PlaybookEntry[];
  onSelect: (entry: PlaybookEntry) => void;
  onAdd: () => void;
  onEdit: (entry: PlaybookEntry) => void;
}

export const PlaybookList: React.FC<PlaybookListProps> = ({ entries, onSelect, onAdd, onEdit }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-400">Playbook</h2>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          onClick={onAdd}
        >
          + Add Strategy
        </button>
      </div>
      <ul className="space-y-2">
        {entries.length === 0 && <li className="text-gray-400">No strategies yet.</li>}
        {entries.map(entry => (
          <li
            key={entry.id}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-700 group"
          >
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onSelect(entry)}
            >
              <span className="font-medium text-purple-300">{entry.name}</span>
              <span className="ml-2 text-xs text-gray-400">{Object.values(entry.tags).flat().join(', ')}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entry);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white p-1 rounded ml-2"
              title="Edit Strategy"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 