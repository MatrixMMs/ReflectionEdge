import React, { useState, useMemo } from 'react';
import { Trade, TagGroup, PlaybookEntry, ChartYAxisMetric, ChartXAxisMetric, AppDateRange, TradeDirectionFilterSelection } from '../types';
import { TradeForm } from '../components/trades/TradeForm';
import { TradeList } from '../components/trades/TradeList';
import { Summary } from '../components/trades/Summary';
import { TagPerformance } from '../components/tags/TagPerformance';
import { LineChartRenderer } from '../components/charts/LineChartRenderer';
import { PieChartRenderer } from '../components/charts/PieChartRenderer';
import { ChartControls } from '../components/charts/ChartControls';
import { Modal } from '../components/ui/Modal';
import { TradeDetailsView } from '../components/trades/TradeDetailsView';
import { processChartData, filterTradesByDateAndTags } from '../utils/chartDataProcessor';
import { ChartBarIcon, TableCellsIcon, FilterIcon } from '../components/ui/Icons';

interface DashboardPageProps {
  trades: Trade[];
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  onAddTrade: (trade: Omit<Trade, 'id' | 'timeInTrade'>) => void;
  onUpdateTrade: (updatedTrade: Omit<Trade, 'id' | 'timeInTrade'>) => void;
  onDeleteTrade: (tradeId: string) => void;
  onEditTrade: (trade: Trade) => void;
  onViewTradeDetails: (trade: Trade) => void;
  onCloseTradeDetails: () => void;
  viewingTrade: Trade | null;
  editingTrade: Trade | null;
  isTradeFormModalOpen: boolean;
  setIsTradeFormModalOpen: (open: boolean) => void;
  setEditingTrade: (trade: Trade | null) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  trades,
  tagGroups,
  playbookEntries,
  onAddTrade,
  onUpdateTrade,
  onDeleteTrade,
  onEditTrade,
  onViewTradeDetails,
  onCloseTradeDetails,
  viewingTrade,
  editingTrade,
  isTradeFormModalOpen,
  setIsTradeFormModalOpen,
  setEditingTrade
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summaryDateMode, setSummaryDateMode] = useState<'daily' | 'range'>('daily');
  const [summaryDateRange, setSummaryDateRange] = useState<AppDateRange>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [chartDateRange, setChartDateRange] = useState<AppDateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [compareDateRange, setCompareDateRange] = useState<AppDateRange | null>(null);

  const [yAxisMetric, setYAxisMetric] = useState<ChartYAxisMetric>(ChartYAxisMetric.CUMULATIVE_PNL);
  const [xAxisMetric, setXAxisMetric] = useState<ChartXAxisMetric>(ChartXAxisMetric.TRADE_SEQUENCE);
  
  const [selectedTagsForChart, setSelectedTagsForChart] = useState<{[groupId: string]: string[]}>({});
  const [tagComparisonMode, setTagComparisonMode] = useState<'AND' | 'OR'>('OR');
  const [directionFilter, setDirectionFilter] = useState<TradeDirectionFilterSelection>('all');

  const [tradeFiltersOpen, setTradeFiltersOpen] = useState(false);

  const baseTradesForChart = useMemo(() => {
    return filterTradesByDateAndTags(trades, chartDateRange, selectedTagsForChart, tagComparisonMode);
  }, [trades, chartDateRange, selectedTagsForChart, tagComparisonMode]);

  const chartData = useMemo(() => {
    return processChartData(baseTradesForChart, xAxisMetric, yAxisMetric, tagGroups, selectedTagsForChart, directionFilter, false);
  }, [baseTradesForChart, xAxisMetric, yAxisMetric, tagGroups, selectedTagsForChart, directionFilter]);

  const comparisonChartData = useMemo(() => {
    if (!compareDateRange) return null;
    const baseCompareTrades = filterTradesByDateAndTags(trades, compareDateRange, selectedTagsForChart, tagComparisonMode);
    return processChartData(baseCompareTrades, xAxisMetric, yAxisMetric, tagGroups, selectedTagsForChart, directionFilter, true);
  }, [trades, compareDateRange, selectedTagsForChart, tagComparisonMode, xAxisMetric, yAxisMetric, tagGroups, directionFilter]);

  const tradesForSummary = useMemo(() => {
    let filteredTrades: Trade[];

    if (summaryDateMode === 'daily') {
      filteredTrades = trades.filter(trade => trade.date === summaryDateRange.start);
    } else {
      const startDate = new Date(summaryDateRange.start);
      const endDate = new Date(summaryDateRange.end);
      filteredTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
    }

    if (directionFilter !== 'all') {
      return filteredTrades.filter(trade => trade.direction === directionFilter);
    }
    return filteredTrades;
  }, [trades, summaryDateMode, summaryDateRange, directionFilter]);

  const pieChartDataByGroup = useMemo(() => {
    let tradesInDateRange = trades.filter(trade => 
      new Date(trade.date) >= new Date(chartDateRange.start) && new Date(trade.date) <= new Date(chartDateRange.end)
    );
    if (directionFilter !== 'all') {
      tradesInDateRange = tradesInDateRange.filter(trade => trade.direction === directionFilter);
    }

    // For each group, count subtags
    const result: { [groupId: string]: { groupName: string, data: { name: string, value: number, fill: string }[] } } = {};
    tagGroups.forEach(group => {
      const tagCounts: { [subTagId: string]: number } = {};
      tradesInDateRange.forEach(trade => {
        const subTagId = trade.tags[group.id];
        if (subTagId) tagCounts[subTagId] = (tagCounts[subTagId] || 0) + 1;
      });
      const data = group.subtags
        .filter(subTag => tagCounts[subTag.id] > 0)
        .map(subTag => ({
          name: subTag.name,
          value: tagCounts[subTag.id],
          fill: subTag.color,
        }));
      if (data.length > 0) {
        result[group.id] = { groupName: group.name, data };
      }
    });
    return result;
  }, [trades, chartDateRange, tagGroups, directionFilter]);

  const openTradeForm = () => {
    setEditingTrade(null);
    setIsTradeFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-7xl mx-auto">
        {isTradeFormModalOpen && (
          <Modal
            title={editingTrade ? 'Edit Trade' : 'Add New Trade'}
            onClose={() => {
              setIsTradeFormModalOpen(false);
              setEditingTrade(null);
            }}
            size="large"
          >
            <TradeForm 
              onSubmit={editingTrade ? onUpdateTrade : onAddTrade}
              tagGroups={tagGroups} 
              playbookEntries={playbookEntries}
              tradeToEdit={editingTrade || undefined} 
            />
          </Modal>
        )}

        {viewingTrade && (
          <Modal title="Trade Details" onClose={onCloseTradeDetails} size="large">
            <TradeDetailsView trade={viewingTrade} playbookEntries={playbookEntries} />
          </Modal>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 flex items-center">
                <span className="mr-2">📊</span>Controls
              </h2>
              <ChartControls
                yAxisMetric={yAxisMetric}
                setYAxisMetric={setYAxisMetric}
                xAxisMetric={xAxisMetric}
                setXAxisMetric={setXAxisMetric}
                dateRange={chartDateRange}
                setDateRange={setChartDateRange}
                compareDateRange={compareDateRange}
                setCompareDateRange={setCompareDateRange}
                tagGroups={tagGroups}
                selectedTags={selectedTagsForChart}
                setSelectedTags={setSelectedTagsForChart}
                tagComparisonMode={tagComparisonMode}
                setTagComparisonMode={setTagComparisonMode}
                directionFilter={directionFilter}
                setDirectionFilter={setDirectionFilter}
              />
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-pink-400 flex items-center">
                <TableCellsIcon className="w-6 h-6 mr-2" />Summary
              </h2>
              
              <div className="flex items-center space-x-2 mb-4">
                  <button 
                    onClick={() => setSummaryDateMode('daily')} 
                    className={`px-3 py-1 rounded text-sm ${summaryDateMode === 'daily' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    Daily
                  </button>
                  <button 
                    onClick={() => setSummaryDateMode('range')} 
                    className={`px-3 py-1 rounded text-sm ${summaryDateMode === 'range' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    Range
                  </button>
              </div>
              
              <div className="mb-4">
                {summaryDateMode === 'daily' ? (
                  <div>
                    <label htmlFor="summary-date" className="block text-sm font-medium text-gray-300 mb-1">Select Date:</label>
                    <input
                      type="date"
                      id="summary-date"
                      value={summaryDateRange.start}
                      onChange={(e) => setSummaryDateRange({ start: e.target.value, end: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div>
                      <label htmlFor="summary-start-date" className="block text-sm font-medium text-gray-300 mb-1">Start Date:</label>
                      <input
                        type="date"
                        id="summary-start-date"
                        value={summaryDateRange.start}
                        onChange={(e) => setSummaryDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                      />
                    </div>
                    <div>
                      <label htmlFor="summary-end-date" className="block text-sm font-medium text-gray-300 mb-1">End Date:</label>
                      <input
                        type="date"
                        id="summary-end-date"
                        value={summaryDateRange.end}
                        onChange={(e) => setSummaryDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                      />
                    </div>
                  </div>
                )}
              </div>
              <Summary trades={tradesForSummary} />
              {directionFilter !== 'all' && <p className="text-xs text-gray-400 mt-2">Showing summary for {directionFilter} trades only.</p>}
            </div>
            
            <TagPerformance 
              trades={trades} 
              tagGroups={tagGroups} 
              chartDateRange={chartDateRange} 
              directionFilter={directionFilter} 
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
              <div id="performance-chart-container" className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[400px]">
               <h2 className="text-2xl font-semibold mb-4 text-green-400 flex items-center">
                 <ChartBarIcon className="w-6 h-6 mr-2" />Performance Chart
               </h2>
              <LineChartRenderer 
                data={chartData} 
                comparisonData={comparisonChartData} 
                yAxisMetric={yAxisMetric} 
                xAxisMetric={xAxisMetric} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(pieChartDataByGroup).map(groupData => (
                <div key={groupData.groupName} className="bg-gray-800 p-4 rounded-xl shadow-2xl">
                  <h3 className="text-lg font-semibold mb-2 text-center text-pink-400">
                    {groupData.groupName}
                  </h3>
                  <PieChartRenderer 
                    data={groupData.data} 
                    height={200}
                    outerRadius={60}
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    For trades in selected date range{directionFilter !== 'all' ? ` (${directionFilter} only)` : ''}.
                  </p>
                </div>
              ))}
            </div>

              <div id="tradelog-container" className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-purple-400 flex items-center">
                  Trade Log
                </h2>
                <button
                  onClick={() => setTradeFiltersOpen((prev: boolean) => !prev)}
                  aria-label={tradeFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  <FilterIcon className="w-5 h-5" />
                </button>
              </div>
              <TradeList
                trades={trades}
                tagGroups={tagGroups}
                playbookEntries={playbookEntries}
                onDeleteTrade={onDeleteTrade}
                onEditTrade={onEditTrade}
                onViewDetails={onViewTradeDetails}
                filtersOpen={tradeFiltersOpen}
                setFiltersOpen={setTradeFiltersOpen}
              />
            </div>
          </div>
        </main>

        {/* Floating Add Trade Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={openTradeForm}
            className="bg-[#218c74] hover:bg-[#218c74] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-transform duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#218c74]/40"
            aria-label="Add Trade"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 