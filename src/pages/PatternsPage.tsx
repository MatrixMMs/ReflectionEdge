import React, { useState } from 'react';
import { PatternAnalysisDashboard } from '../components/patterns/PatternAnalysisDashboard';
import { PatternInsights } from '../components/patterns/PatternInsights';
import { Trade } from '../types';

interface PatternsPageProps {
  initialTrades: Trade[];
}

const PatternsPage: React.FC<PatternsPageProps> = ({ initialTrades }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);

  // Add any pattern-specific handlers here

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-8">Patterns</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-8">
          <PatternAnalysisDashboard trades={trades} />
        </div>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <PatternInsights trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default PatternsPage; 