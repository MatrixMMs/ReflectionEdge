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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-8">Best &amp; Worst Trades</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <BestWorstAnalysis trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default BestWorstPage; 