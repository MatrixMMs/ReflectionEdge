import React from 'react';
import { Trade } from '../types';
import { PatternAnalysisDashboard } from '../components/patterns/PatternAnalysisDashboard';

interface PatternsPageProps {
  trades: Trade[];
}

const PatternsPage: React.FC<PatternsPageProps> = ({ trades }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Pattern Analysis</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <PatternAnalysisDashboard trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default PatternsPage; 