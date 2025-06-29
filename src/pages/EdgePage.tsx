import React from 'react';
import { Trade, TagGroup } from '../types';
import { EdgeDiscoveryDashboard } from '../components/analysis/EdgeDiscoveryDashboard';

interface EdgePageProps {
  trades: Trade[];
  tagGroups: TagGroup[];
}

const EdgePage: React.FC<EdgePageProps> = ({ trades, tagGroups }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Edge Discovery</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <EdgeDiscoveryDashboard trades={trades} tagGroups={tagGroups} />
        </div>
      </div>
    </div>
  );
};

export default EdgePage; 