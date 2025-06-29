import React from 'react';
import { Trade } from '../types';
import { BestWorstAnalysis } from '../components/analysis/BestWorstAnalysis';

interface BestWorstPageProps {
  trades: Trade[];
  onUpdateTrade: (trade: Trade) => void;
}

const BestWorstPage: React.FC<BestWorstPageProps> = ({ trades, onUpdateTrade }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Best & Worst Analysis</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <BestWorstAnalysis trades={trades} onUpdateTrade={onUpdateTrade} />
        </div>
      </div>
    </div>
  );
};

export default BestWorstPage; 