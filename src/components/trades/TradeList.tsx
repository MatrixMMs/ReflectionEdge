import React, { useMemo, useState } from 'react';
import { Trade, TagGroup, PlaybookEntry } from '../../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Button } from '../ui/Button';
import { EyeIcon, PencilIcon, TrashIcon } from '../ui/Icons';
import { Grade } from '../../utils/grading';

interface TradeListProps {
  trades: Trade[];
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onViewDetails: (trade: Trade) => void;
}

const getGradeColor = (grade: Grade): string => {
  if (!grade) return 'bg-gray-500';
  if (grade.startsWith('A')) return 'bg-green-600';
  if (grade.startsWith('B')) return 'bg-blue-600';
  if (grade.startsWith('C')) return 'bg-yellow-600';
  if (grade.startsWith('D')) return 'bg-orange-600';
  if (grade.startsWith('F')) return 'bg-red-600';
  return 'bg-gray-500';
};

export const TradeList: React.FC<TradeListProps> = ({ trades, tagGroups, onEditTrade, onDeleteTrade, onViewDetails }) => {
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Symbol</Th>
            <Th>Direction</Th>
            <Th>P&L</Th>
            <Th>Tags</Th>
            <Th>Grade</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedTrades.map(trade => (
            <Tr key={trade.id}>
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
                <div className="flex flex-wrap gap-1">
                  {Object.entries(trade.tags).map(([groupId, subTagId]) => {
                    const group = tagGroups.find(g => g.id === groupId);
                    const subTag = group?.subtags.find(st => st.id === subTagId);
          if (!subTag) return null;
          return (
                      <span
                        key={subTag.id}
                        className="px-2 py-1 text-xs font-bold text-white rounded-full"
                        style={{ backgroundColor: subTag.color }}
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
  );
};
