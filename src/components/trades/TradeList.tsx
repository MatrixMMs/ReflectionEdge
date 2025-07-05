import React, { useMemo, useState, useEffect } from 'react';
import { Trade, TagGroup, PlaybookEntry } from '../../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Button } from '../ui/Button';
import { EyeIcon, PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, DotsVerticalIcon } from '../ui/Icons';
import { Grade, ALL_GRADES } from '../../utils/grading';
import { TradeFilters, TradeFilters as TradeFiltersType } from './TradeFilters';
import { filterTrades, getAvailableSymbols } from '../../utils/tradeFilters';

interface TradeListProps {
  trades: Trade[];
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onViewDetails: (trade: Trade) => void;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const getGradeColor = (grade: Grade): string => {
  switch (grade) {
    case 'A+': return '#1abc9c'; // Teal
    case 'A': return '#218c74'; // Green
    case 'A-': return '#43b581'; // Lighter green
    case 'B+': return '#3CB371'; // Medium green
    case 'B': return '#C6D93B'; // Yellow-green
    case 'B-': return '#E5E059'; // Yellow
    case 'C+': return '#F0C241'; // Gold
    case 'C': return '#E07B39'; // Orange
    case 'C-': return '#E4572E'; // Orange-red
    case 'D': return '#B22222'; // Red
    case 'F': return '#8B0000'; // Dark red
    default: return '#808080';
  }
};

export const TradeList: React.FC<TradeListProps> = ({ trades, tagGroups, onEditTrade, onDeleteTrade, onViewDetails, filtersOpen, setFiltersOpen }) => {
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
  const [tagComparisonMode, setTagComparisonMode] = useState<'AND' | 'OR'>('OR');
  const [sortBy, setSortBy] = useState<'date' | 'symbol' | 'direction' | 'profit' | 'grade'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const availableSymbols = useMemo(() => getAvailableSymbols(trades), [trades]);
  
  const filteredTrades = useMemo(() => {
    return filterTrades(trades, filters);
  }, [trades, filters]);

  const sortedTrades = useMemo(() => {
    const arr = [...filteredTrades];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'symbol') {
        cmp = (a.symbol || '').localeCompare(b.symbol || '', undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortBy === 'direction') {
        cmp = (a.direction || '').localeCompare(b.direction || '');
      } else if (sortBy === 'profit') {
        cmp = a.profit - b.profit;
      } else if (sortBy === 'grade') {
        const gradeA = a.execution?.grade;
        const gradeB = b.execution?.grade;
        const idxA = gradeA ? ALL_GRADES.indexOf(gradeA) : ALL_GRADES.length;
        const idxB = gradeB ? ALL_GRADES.indexOf(gradeB) : ALL_GRADES.length;
        cmp = idxA - idxB;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredTrades, sortBy, sortDir]);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const sortIndicator = (col: typeof sortBy) => sortBy === col ? (
    <span className="ml-2 inline-block align-middle text-xs">
      {sortDir === 'asc' ? <ChevronUpIcon className="w-3 h-3 text-white" /> : <ChevronDownIcon className="w-3 h-3 text-white" />}
    </span>
  ) : null;

  useEffect(() => {
    if (!menuOpenId) return;
    function handleClickOutside(event: MouseEvent) {
      // Check if the click is inside any menu
      const menus = document.querySelectorAll('.trade-menu-dropdown');
      let clickedInside = false;
      menus.forEach(menu => {
        if (menu.contains(event.target as Node)) {
          clickedInside = true;
        }
      });
      if (!clickedInside) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

  return (
    <div>
      <TradeFilters
        filters={filters}
        onFiltersChange={setFilters}
        tagGroups={tagGroups}
        availableSymbols={availableSymbols}
        isExpanded={filtersOpen}
        setIsExpanded={setFiltersOpen}
        tagComparisonMode={tagComparisonMode}
        setTagComparisonMode={setTagComparisonMode}
      />
      
      <div className="mb-4 text-sm text-gray-400">
        Showing {sortedTrades.length} of {trades.length} trades
      </div>

      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <Table>
          <Thead>
            <Tr>
              <Th><span onClick={() => handleSort('date')} className="cursor-pointer select-none flex items-center">Date{sortIndicator('date')}</span></Th>
              <Th><span onClick={() => handleSort('symbol')} className="cursor-pointer select-none flex items-center">Symbol{sortIndicator('symbol')}</span></Th>
              <Th>Entry</Th>
              <Th>Exit</Th>
              <Th><span onClick={() => handleSort('direction')} className="cursor-pointer select-none flex items-center">Direction{sortIndicator('direction')}</span></Th>
              <Th>Contracts</Th>
              <Th><span onClick={() => handleSort('profit')} className="cursor-pointer select-none flex items-center">Return (P&L){sortIndicator('profit')}</span></Th>
              <Th>&nbsp;</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedTrades.map(trade => (
              <Tr key={trade.id}>
                <Td>{trade.date}</Td>
                <Td>{trade.symbol || 'N/A'}</Td>
                <Td>{trade.entry != null ? trade.entry : '-'}</Td>
                <Td>{trade.exit != null ? trade.exit : '-'}</Td>
                <Td>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    trade.direction === 'long' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {trade.direction === 'long' ? 'Long' : 'Short'}
                  </span>
                </Td>
                <Td>{trade.contracts != null ? trade.contracts : '-'}</Td>
                <Td className={trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${trade.profit.toFixed(2)}
                </Td>
                <Td className="relative">
                  <div>
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === trade.id ? null : trade.id)}
                      className="p-2 rounded hover:bg-gray-700 focus:outline-none"
                      aria-label="Open menu"
                    >
                      <DotsVerticalIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    {menuOpenId === trade.id && (
                      <div className="trade-menu-dropdown absolute right-0 z-10 mt-2 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg">
                        <button
                          onClick={() => { onViewDetails(trade); setMenuOpenId(null); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => { onEditTrade(trade); setMenuOpenId(null); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { onDeleteTrade(trade.id); setMenuOpenId(null); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
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
