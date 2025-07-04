import React, { useState } from 'react';
import { Trade, AdvancedTagGroup } from '../types';
import { EdgeDiscoveryDashboard } from '../components/analysis/EdgeDiscoveryDashboard';

interface EdgePageProps {
  initialTrades: Trade[];
  initialTagGroups: AdvancedTagGroup[];
}

const EdgePage: React.FC<EdgePageProps> = ({ initialTrades, initialTagGroups }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [tagGroups, setTagGroups] = useState<AdvancedTagGroup[]>(initialTagGroups);

  // Add any edge-specific handlers here

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6" style={{ background: 'var(--background-main)', color: 'var(--text-white)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-8" style={{ color: 'var(--text-accent)' }}>Edge Discovery</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6" style={{ background: 'var(--background-secondary)' }}>
          <EdgeDiscoveryDashboard trades={trades} tagGroups={tagGroups} />
        </div>
      </div>
    </div>
  );
};

export default EdgePage; 