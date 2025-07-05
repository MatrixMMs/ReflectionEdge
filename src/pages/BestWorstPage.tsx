import React, { useState } from 'react';
import { Trade } from '../types';
import { BestWorstAnalysis } from '../components/analysis/BestWorstAnalysis';

interface BestWorstPageProps {
  initialTrades: Trade[];
}

const BestWorstPage: React.FC<BestWorstPageProps> = ({ initialTrades }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);

  // Add any best/worst-specific handlers here

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6" style={{ background: 'var(--background-main)', color: 'var(--text-white)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Best & Worst Analysis</h1>
          {/* Future: Filters, etc. */}
        </div>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6" style={{ background: 'var(--background-secondary)' }}>
          <BestWorstAnalysis trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default BestWorstPage; 