import React, { useState } from 'react';
import { Trade, AdvancedTagGroup } from '../types';
import { KellyCriterionAnalysis } from '../components/analysis/KellyCriterionAnalysis';
import { ADVANCED_TAGS } from '../constants/advancedTags';
import { BrainIcon } from '../components/ui/Icons';

interface KellyPageProps {
  initialTrades: Trade[];
  initialTagGroups: AdvancedTagGroup[];
}

const KellyPage: React.FC<KellyPageProps> = ({ initialTrades, initialTagGroups = ADVANCED_TAGS }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [tagGroups, setTagGroups] = useState<AdvancedTagGroup[]>(initialTagGroups);

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
        <h1 className="text-3xl font-[550]" style={{ color: 'var(--text-main)', marginLeft: '1rem', fontWeight: 550 }}>Kelly Criterion</h1>
        <div>
          {/* Future: Filters, etc. */}
        </div>
      </div>
      {/* Page Content: padded, not touching sidebar or page edges - with top margin to account for header */}
      <div className="p-6 pt-20">
        <div className="max-w-7xl mx-auto">

        {/* Advanced Tags Badge */}
        <div className="flex items-center space-x-2 px-3 py-1 mb-8" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border-main)', borderRadius: '0.5rem' }}>
          <BrainIcon className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Advanced Tagging System</span>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg p-4 mb-6" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border-main)' }}>
          <div className="flex items-start space-x-3">
            <BrainIcon className="w-5 h-5 mt-0.5 text-accent" />
            <div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-main)' }}>Advanced Tagging System</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Analyze your trading performance using objective tags (market conditions) and subjective tags (your psychological state). 
                This provides deeper insights into both what happened in the market and how you reacted to it.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl p-6" style={{ background: 'var(--background-secondary)' }}>
          <KellyCriterionAnalysis 
            trades={trades} 
            tagGroups={tagGroups}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default KellyPage; 