import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TagGroup, Trade } from '../../types';
import { TagIcon } from '../ui/Icons';

interface TagDistributionProps {
  trades: Trade[];
  tagGroups: TagGroup[];
  chartDateRange: { start: string; end: string };
  directionFilter: 'all' | 'long' | 'short';
}

export const TagDistribution: React.FC<TagDistributionProps> = ({
  trades,
  tagGroups,
  chartDateRange,
  directionFilter
}) => {
  // Filter trades by date range and direction
  const tradesInDateRange = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    const startDate = new Date(chartDateRange.start);
    const endDate = new Date(chartDateRange.end);
    tradeDate.setUTCHours(0,0,0,0);
    startDate.setUTCHours(0,0,0,0);
    endDate.setUTCHours(0,0,0,0);
    return tradeDate >= startDate && tradeDate <= endDate;
  }).filter(trade => directionFilter === 'all' || trade.direction === directionFilter);

  // Calculate distribution for each tag group
  const tagGroupDistributions = tagGroups.map(group => {
    const tagCounts: { [subTagId: string]: number } = {};
    let totalTrades = 0;

    tradesInDateRange.forEach(trade => {
      const subTagId = trade.tags[group.id];
      if (subTagId) {
        tagCounts[subTagId] = (tagCounts[subTagId] || 0) + 1;
        totalTrades++;
      }
    });

    const data = group.subtags
      .filter(subTag => tagCounts[subTag.id] > 0)
      .map(subTag => ({
        name: subTag.name,
        value: tagCounts[subTag.id],
        fill: subTag.color,
      }));

    return {
      group,
      data,
      totalTrades
    };
  }).filter(dist => dist.data.length > 0);

  if (tagGroupDistributions.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-red-400 flex items-center">
          <TagIcon className="w-6 h-6 mr-2" /> Tag Distribution
        </h2>
        <p className="text-gray-500 text-sm">
          No trades with tags found in the selected date range {directionFilter !== 'all' ? `(${directionFilter} only)` : ''}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-semibold mb-4 text-red-400 flex items-center">
        <TagIcon className="w-6 h-6 mr-2" /> Tag Distribution
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tagGroupDistributions.map(({ group, data, totalTrades }) => (
          <div key={group.id} className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
              <h3 className="text-lg font-semibold text-purple-300">{group.name}</h3>
              <span className="text-sm text-gray-400">Total: {totalTrades} trades</span>
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="h-[200px] w-full flex items-center justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} trades`, 'Count']}
                      contentStyle={{
                        backgroundColor: '#2d3748',
                        border: '1px solid #4A5568',
                        borderRadius: '0.5rem',
                        color: '#F7FAFC',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        fontSize: '1rem',
                        padding: '0.5rem 1rem',
                      }}
                      itemStyle={{ color: '#F7FAFC', fontWeight: 500 }}
                      labelStyle={{ color: '#F7FAFC', fontWeight: 700 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-4 flex flex-col items-center">
                {data.length > 0 && (
                  <ul className="flex flex-col space-y-1 w-full max-w-[180px]">
                    {data.map((entry, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></span>
                        <span className="text-sm text-gray-200">{entry.name}</span>
                        <span className="ml-auto text-xs text-gray-400">{entry.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">
        For trades in selected date range{directionFilter !== 'all' ? ` (${directionFilter} only)` : ''}.
      </p>
    </div>
  );
}; 