import React from 'react';
import { Trade } from '../types';
import { PatternInsights } from '../components/patterns/PatternInsights';

interface InsightsPageProps {
  trades: Trade[];
}

const InsightsPage: React.FC<InsightsPageProps> = ({ trades }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Pattern Insights</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <PatternInsights trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default InsightsPage; 