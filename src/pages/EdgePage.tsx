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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-8">Edge Discovery</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <EdgeDiscoveryDashboard trades={trades} tagGroups={tagGroups} />
        </div>
      </div>
    </div>
  );
};

export default EdgePage; 