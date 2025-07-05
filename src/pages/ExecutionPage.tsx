import React, { useState } from 'react';
import { Trade, PlaybookEntry } from '../types';
import { ExecutionDashboard } from '../components/analysis/ExecutionDashboard';

interface ExecutionPageProps {
  initialTrades: Trade[];
  initialPlaybookEntries: PlaybookEntry[];
}

const ExecutionPage: React.FC<ExecutionPageProps> = ({ initialTrades, initialPlaybookEntries }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [playbookEntries, setPlaybookEntries] = useState<PlaybookEntry[]>(initialPlaybookEntries);

  // Add any execution-specific handlers here

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6" style={{ background: 'var(--background-main)', color: 'var(--text-white)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Execution Analysis</h1>
          {/* Future: Filters, etc. */}
        </div>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6" style={{ background: 'var(--background-secondary)' }}>
          <ExecutionDashboard trades={trades} playbookEntries={playbookEntries} />
        </div>
      </div>
    </div>
  );
};

export default ExecutionPage; 