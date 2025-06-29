import React, { useState } from 'react';
import { Trade, TagGroup } from '../types';
import { KellyCriterionAnalysis } from '../components/analysis/KellyCriterionAnalysis';

interface KellyPageProps {
  initialTrades: Trade[];
  initialTagGroups: TagGroup[];
}

const KellyPage: React.FC<KellyPageProps> = ({ initialTrades, initialTagGroups }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(initialTagGroups);

  // Add any Kelly-specific handlers here

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-8">Kelly Criterion</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <KellyCriterionAnalysis trades={trades} tagGroups={tagGroups} />
        </div>
      </div>
    </div>
  );
};

export default KellyPage; 