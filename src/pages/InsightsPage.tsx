import React, { useState } from 'react';
import { Trade } from '../types';
import { PatternInsights } from '../components/patterns/PatternInsights';

interface InsightsPageProps {
  initialTrades: Trade[];
}

const InsightsPage: React.FC<InsightsPageProps> = ({ initialTrades }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);

  // Add any insights-specific handlers here

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6" style={{ background: 'var(--background-main)', color: 'var(--text-white)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Insights</h1>
          {/* Future: Filters, etc. */}
        </div>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6" style={{ background: 'var(--background-secondary)' }}>
          <PatternInsights trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default InsightsPage; 