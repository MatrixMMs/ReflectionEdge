import React from 'react';
import { Button } from '../components/ui/Button';

interface SettingsPageProps {
  handleExportData: () => void;
  handleExportFilteredData: () => void;
  triggerFileInput: () => void;
  handleDeleteAllData: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  handleExportData,
  handleExportFilteredData,
  triggerFileInput,
  handleDeleteAllData
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Settings</h1>
        <div className="space-y-6 bg-gray-800 rounded-xl shadow-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-200">Data Management</h4>
          <div className="flex space-x-2">
            <Button onClick={handleExportData} variant="secondary">
              Export All Data
            </Button>
            <Button onClick={handleExportFilteredData} variant="secondary">
              Export Filtered Data
            </Button>
          </div>
          <p className="text-sm text-gray-400">Export your trade data to a JSON file.</p>

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-lg font-semibold text-gray-200">Import Data</h4>
            <p className="text-sm text-gray-400 mt-1">
              Import trades from a JSON backup, or from a CSV export from your broker.
            </p>
            <div className="mt-2">
              <Button onClick={triggerFileInput} variant="secondary">
                Import from File
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-lg font-semibold text-red-400">Danger Zone</h4>
            <Button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                  handleDeleteAllData();
                }
              }}
              variant="danger"
            >
              Delete All Data
            </Button>
            <p className="text-sm text-gray-400 mt-1">This will permanently delete all trades, tags, and settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 