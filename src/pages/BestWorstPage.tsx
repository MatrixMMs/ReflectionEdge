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
    <div className="min-h-screen text-gray-100" style={{ background: 'var(--background-main)' }}>
      {/* Header Card: full width, flush with top/left/right - positioned absolutely to break out of main content constraints */}
      <div 
        className="bg-gray-800 p-3 flex items-center justify-between absolute top-0 left-0 right-0 z-10" 
        style={{ 
          background: 'var(--background-secondary)',
          marginLeft: 'var(--sidebar-width)',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)', marginLeft: '1rem' }}>Best & Worst Analysis</h1>
        <div>
          {/* Future: Filters, etc. */}
        </div>
      </div>
      {/* Page Content: padded, not touching sidebar or page edges - with top margin to account for header */}
      <div className="p-6 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6" style={{ background: 'var(--background-secondary)' }}>
            <BestWorstAnalysis trades={trades} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestWorstPage; 