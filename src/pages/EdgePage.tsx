import React, { useState } from 'react';
import { Trade, AdvancedTagGroup } from '../types';
import { EdgeDiscoveryDashboard } from '../components/analysis/EdgeDiscoveryDashboard';

interface EdgePageProps {
  initialTrades: Trade[];
  initialTagGroups: AdvancedTagGroup[];
}

const EdgePage: React.FC<EdgePageProps> = ({ initialTrades, initialTagGroups }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [tagGroups, setTagGroups] = useState<AdvancedTagGroup[]>(initialTagGroups);

  // Add any edge-specific handlers here

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
        <h1 className="text-3xl font-[550]" style={{ color: 'var(--text-main)', marginLeft: '1rem', fontWeight: 550 }}>Edge Discovery</h1>
        <div>
          {/* Future: Filters, etc. */}
        </div>
      </div>
      {/* Page Content: padded, not touching sidebar or page edges - with top margin to account for header */}
      <div className="p-6 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6" style={{ background: 'var(--background-secondary)' }}>
            <EdgeDiscoveryDashboard trades={trades} tagGroups={tagGroups} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdgePage; 