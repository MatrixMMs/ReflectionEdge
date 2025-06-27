import React, { useMemo, useState } from 'react';
import { Trade, TagGroup, PlaybookEntry } from '../../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Button } from '../ui/Button';
import { EyeIcon, PencilIcon, TrashIcon } from '../ui/Icons';
import { Grade } from '../../utils/grading';
import { TradeFilters, TradeFilters as TradeFiltersType } from './TradeFilters';
import { filterTrades, getAvailableSymbols } from '../../utils/tradeFilters';

interface TradeListProps {
  trades: Trade[];
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onViewDetails: (trade: Trade) => void;
}

const getGradeColor = (grade: Grade): string => {
  switch (grade) {
    case 'A+': return 'bg-[#1abc9c]'; // Teal
    case 'A': return 'bg-[#218c74]'; // Green
    case 'A-': return 'bg-[#43b581]'; // Lighter green
    case 'B+': return 'bg-[#3CB371]'; // Medium green
    case 'B': return 'bg-[#C6D93B]'; // Yellow-green
    case 'B-': return 'bg-[#E5E059]'; // Yellow
    case 'C+': return 'bg-[#F0C241]'; // Gold
    case 'C': return 'bg-[#E07B39]'; // Orange
    case 'C-': return 'bg-[#E4572E]'; // Orange-red
    case 'D': return 'bg-[#B22222]'; // Red
    case 'F': return 'bg-[#8B0000]'; // Dark red
    default: return 'bg-gray-500';
  }
};

export const TradeList: React.FC<TradeListProps> = ({ trades, tagGroups, onEditTrade, onDeleteTrade, onViewDetails }) => {
  const [filters, setFilters] = useState<TradeFiltersType>({
    direction: 'all',
    grade: 'all',
    dateFrom: '',
    dateTo: '',
    symbol: '',
    minProfit: '',
    maxProfit: '',
    selectedTags: {}
  });

  const availableSymbols = useMemo(() => getAvailableSymbols(trades), [trades]);
  
  const filteredTrades = useMemo(() => {
    return filterTrades(trades, filters);
  }, [trades, filters]);

  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTrades]);

  return (
    <div>
      <TradeFilters
        filters={filters}
        onFiltersChange={setFilters}
        tagGroups={tagGroups}
        availableSymbols={availableSymbols}
      />
      
      <div className="mb-4 text-sm text-gray-400">
        Showing {sortedTrades.length} of {trades.length} trades
      </div>

      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Symbol</Th>
              <Th>Direction</Th>
              <Th>P&L</Th>
              <Th>Analysis</Th>
              <Th>Tags</Th>
              <Th>Grade</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedTrades.map(trade => (
              <Tr key={trade.id} className={`${trade.isBestTrade ? 'ring-2 ring-yellow-400' : ''} ${trade.isWorstTrade ? 'ring-2 ring-red-400' : ''}`}>
                <Td>{trade.date}</Td>
                <Td>{trade.symbol || 'N/A'}</Td>
                <Td>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    trade.direction === 'long' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {trade.direction === 'long' ? 'Long' : 'Short'}
                  </span>
                </Td>
                <Td className={trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${trade.profit.toFixed(2)}
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {trade.isBestTrade && (
                      <span className="text-yellow-400 text-lg" title="Best Trade">⭐</span>
                    )}
                    {trade.isWorstTrade && (
                      <span className="text-red-400 text-lg" title="Worst Trade">👎</span>
                    )}
                    {trade.extendedReflection && (trade.extendedReflection.mindset || trade.extendedReflection.setup) && (
                      <span className="text-blue-400 text-sm" title="Has Extended Journal">📝</span>
                    )}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(trade.tags).map(([groupId, subTagId]) => {
                      const group = tagGroups.find(g => g.id === groupId);
                      const subTag = group?.subtags.find(st => st.id === subTagId);
                      if (!subTag) return null;
                      return (
                        <span
                          key={subTag.id}
                          className="px-3 py-1 text-xs font-bold text-white rounded-full bg-gray-600"
                        >
                          {subTag.name}
                        </span>
                      );
                    })}
                  </div>
                </Td>
                <Td>
                  {trade.execution?.grade && (
                    <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${getGradeColor(trade.execution.grade)}`}>
                      {trade.execution.grade}
                    </span>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center space-x-1">
                    <Button onClick={() => onViewDetails(trade)} variant="ghost" size="icon" aria-label="View details">
                      <EyeIcon className="w-5 h-5" />
                    </Button>
                    <Button onClick={() => onEditTrade(trade)} variant="ghost" size="icon" aria-label="Edit trade">
                      <PencilIcon className="w-5 h-5" />
                    </Button>
                    <Button onClick={() => onDeleteTrade(trade.id)} variant="ghost" size="icon" aria-label="Delete trade">
                      <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-400" />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
};
