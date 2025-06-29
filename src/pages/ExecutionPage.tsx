import React from 'react';
import { Trade, PlaybookEntry } from '../types';
import { ExecutionDashboard } from '../components/analysis/ExecutionDashboard';

interface ExecutionPageProps {
  trades: Trade[];
  playbookEntries: PlaybookEntry[];
}

const ExecutionPage: React.FC<ExecutionPageProps> = ({ trades, playbookEntries }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Execution Dashboard</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <ExecutionDashboard trades={trades} playbookEntries={playbookEntries} />
        </div>
      </div>
    </div>
  );
};

export default ExecutionPage; 