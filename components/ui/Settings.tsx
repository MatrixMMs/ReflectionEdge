import React, { useRef, useState } from 'react';
import { Button } from './Button';
import { DownloadIcon, UploadIcon, SunIcon, MoonIcon, TrashIcon, PencilIcon } from './Icons';

interface Shortcut {
  action: string;
  key: string;
  description: string;
}

interface SettingsProps {
  onExport: () => void;
  onImport: (data: string) => boolean;
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentTheme: 'light' | 'dark';
  onClearData: () => void;
  shortcuts: Shortcut[];
  onShortcutChange: (action: string, newKey: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  onExport,
  onImport,
  onThemeChange,
  currentTheme,
  onClearData,
  shortcuts,
  onShortcutChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          const success = onImport(data);
          if (success) {
            alert('Data imported successfully!');
          }
        } catch (error) {
          alert('Error importing data: ' + (error as Error).message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: string) => {
    e.preventDefault();
    const key = e.key.toLowerCase();
    if (key !== 'escape') {
      onShortcutChange(action, key);
    }
    setEditingShortcut(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Management</h3>
        <div className="flex space-x-4">
          <Button onClick={onExport} className="flex items-center space-x-2">
            <DownloadIcon className="w-5 h-5" />
            <span>Export Data</span>
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2"
          >
            <UploadIcon className="w-5 h-5" />
            <span>Import Data</span>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme</h3>
        <div className="flex space-x-4">
          <Button
            onClick={() => onThemeChange('light')}
            className={`flex items-center space-x-2 ${
              currentTheme === 'light' ? 'bg-blue-500' : ''
            }`}
          >
            <SunIcon className="w-5 h-5" />
            <span>Light</span>
          </Button>
          <Button
            onClick={() => onThemeChange('dark')}
            className={`flex items-center space-x-2 ${
              currentTheme === 'dark' ? 'bg-blue-500' : ''
            }`}
          >
            <MoonIcon className="w-5 h-5" />
            <span>Dark</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.action} className="flex items-center justify-between">
              <span>{shortcut.description}</span>
              <div className="flex items-center space-x-2">
                {editingShortcut === shortcut.action ? (
                  <div
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer"
                    onKeyDown={(e) => handleKeyPress(e, shortcut.action)}
                    tabIndex={0}
                    autoFocus
                  >
                    Press any key...
                  </div>
                ) : (
                  <>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                      {shortcut.key}
                    </kbd>
                    <Button
                      onClick={() => setEditingShortcut(shortcut.action)}
                      className="p-1"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Danger Zone</h3>
        <Button
          onClick={onClearData}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600"
        >
          <TrashIcon className="w-5 h-5" />
          <span>Clear All Data</span>
        </Button>
      </div>
    </div>
  );
}; 