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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Kelly Criterion</h1>
          {/* Future: Filters, etc. */}
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-400">Kelly Criterion</h1>
          
          {/* Advanced Tags Badge */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-900 border border-blue-700 rounded-lg" style={{ background: 'var(--background-secondary)' }}>
            <BrainIcon className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-200 font-medium">Advanced Tagging System</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6" style={{ background: 'var(--background-secondary)' }}>
          <div className="flex items-start space-x-3">
            <BrainIcon className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-200 font-semibold mb-1">Advanced Tagging System</h3>
              <p className="text-blue-300 text-sm">
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
  );
};

export default KellyPage; 