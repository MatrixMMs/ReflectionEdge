import React, { useState, useMemo, useRef } from 'react';
import { Trade, TagGroup, PlaybookEntry, ChartYAxisMetric, ChartXAxisMetric, AppDateRange, TradeDirectionFilterSelection } from '../types';
import { TradeForm } from '../components/trades/TradeForm';
import { TradeList } from '../components/trades/TradeList';
import { Summary } from '../components/trades/Summary';
import { TagPerformance } from '../components/tags/TagPerformance';
import { LineChartRenderer } from '../components/charts/LineChartRenderer';
import { PieChartRenderer } from '../components/charts/PieChartRenderer';
import { ChartControls } from '../components/charts/ChartControls';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TradeDetailsView } from '../components/trades/TradeDetailsView';
import { LegalDisclaimer, FooterDisclaimer } from '../components/ui/LegalDisclaimer';
import { DocumentTextIcon, ChartBarIcon, TableCellsIcon, AdjustmentsHorizontalIcon, FilterIcon } from '../components/ui/Icons';
import { processChartData, filterTradesByDateAndTags } from '../utils/chartDataProcessor';
import { calculateFinancials } from '../utils/financialCalculations';
import { getRandomColor, resetColorUsage } from '../utils/colorGenerator';
import { DEFAULT_CHART_COLOR, COMPARISON_CHART_COLOR, LONG_TRADE_COLOR, SHORT_TRADE_COLOR } from '../constants';

interface DashboardPageProps {
  initialTrades: Trade[];
  initialTagGroups: TagGroup[];
  initialPlaybookEntries: PlaybookEntry[];
  onShowLegalDisclaimer: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  initialTrades, 
  initialTagGroups, 
  initialPlaybookEntries,
  onShowLegalDisclaimer
}) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(initialTagGroups);
  const [playbookEntries, setPlaybookEntries] = useState<PlaybookEntry[]>(initialPlaybookEntries);

  // Chart and summary state
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

  // Trade form and details state
  const [isTradeFormModalOpen, setIsTradeFormModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);
  const [tradeFiltersOpen, setTradeFiltersOpen] = useState(false);

  // Trade handlers
  const handleAddTrade = (trade: Omit<Trade, 'id' | 'timeInTrade'>) => {
    const now = new Date();
    const timeInTrade = Math.round((now.getTime() - new Date(trade.timeIn).getTime()) / (1000 * 60));
    
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString(),
      timeInTrade,
    };
    
    setTrades(prev => [...prev, newTrade]);
    setIsTradeFormModalOpen(false);
  };

  const handleUpdateTrade = (updatedTrade: Omit<Trade, 'id' | 'timeInTrade'>) => {
    if (!editingTrade) return;
    
    const now = new Date();
    const timeInTrade = Math.round((now.getTime() - new Date(updatedTrade.timeIn).getTime()) / (1000 * 60));
    
    setTrades(prev => prev.map(trade => 
      trade.id === editingTrade.id 
        ? { ...updatedTrade, id: editingTrade.id, timeInTrade }
        : trade
    ));
    
    setIsTradeFormModalOpen(false);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (tradeId: string) => {
    setTrades(prev => prev.filter(trade => trade.id !== tradeId));
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsTradeFormModalOpen(true);
  };

  const handleViewTradeDetails = (trade: Trade) => {
    setViewingTrade(trade);
  };

  const handleCloseTradeDetails = () => {
    setViewingTrade(null);
  };

  const openTradeForm = () => {
    setEditingTrade(null);
    setIsTradeFormModalOpen(true);
  };

  // Chart data processing
  const baseTradesForChart = useMemo(() => {
    return filterTradesByDateAndTags(trades, chartDateRange, selectedTagsForChart, tagComparisonMode);
  }, [trades, chartDateRange, selectedTagsForChart, tagComparisonMode]);

  const filteredTradesForChart = useMemo(() => {
    if (directionFilter === 'all') return baseTradesForChart;
    return baseTradesForChart.filter(trade => trade.direction === directionFilter);
  }, [baseTradesForChart, directionFilter]);

  const chartData = useMemo(() => {
    return processChartData(filteredTradesForChart, xAxisMetric, yAxisMetric, tagGroups, selectedTagsForChart, directionFilter, false);
  }, [filteredTradesForChart, xAxisMetric, yAxisMetric, tagGroups, selectedTagsForChart, directionFilter]);

  const comparisonChartData = useMemo(() => {
    if (!compareDateRange) return null;
    const comparisonTrades = filterTradesByDateAndTags(trades, compareDateRange, selectedTagsForChart, tagComparisonMode);
    const filteredComparisonTrades = directionFilter === 'all' 
      ? comparisonTrades 
      : comparisonTrades.filter(trade => trade.direction === directionFilter);
    return processChartData(filteredComparisonTrades, xAxisMetric, yAxisMetric, tagGroups, selectedTagsForChart, directionFilter, true);
  }, [trades, compareDateRange, selectedTagsForChart, tagComparisonMode, directionFilter, xAxisMetric, yAxisMetric, tagGroups]);

  // Summary data processing
  const tradesForSummary = useMemo(() => {
    const summaryTrades = filterTradesByDateAndTags(trades, summaryDateRange, {}, 'OR');
    return directionFilter === 'all' 
      ? summaryTrades 
      : summaryTrades.filter(trade => trade.direction === directionFilter);
  }, [trades, summaryDateRange, directionFilter]);

  // Pie chart data processing
  const pieChartDataByGroup = useMemo(() => {
    const result: { [groupId: string]: { groupName: string; data: any[] } } = {};
    
    tagGroups.forEach(group => {
      const groupTrades = filteredTradesForChart.filter(trade => 
        trade.tags && trade.tags[group.id]
      );
      
      if (groupTrades.length > 0) {
        const tagCounts: { [tagId: string]: { name: string; count: number; color: string; profit: number } } = {};
        
        groupTrades.forEach(trade => {
          const tagId = trade.tags[group.id];
          if (tagId) {
            const subtag = group.subtags.find(st => st.id === tagId);
            if (subtag) {
              if (!tagCounts[tagId]) {
                tagCounts[tagId] = {
                  name: subtag.name,
                  count: 0,
                  color: subtag.color,
                  profit: 0
                };
              }
              tagCounts[tagId].count++;
              tagCounts[tagId].profit += trade.profit;
            }
          }
        });
        
        result[group.id] = {
          groupName: group.name,
          data: Object.values(tagCounts).map(tag => ({
            name: tag.name,
            value: tag.count,
            fill: tag.color,
            profit: tag.profit
          }))
        };
      }
    });
    
    return result;
  }, [filteredTradesForChart, tagGroups]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Trade Form Modal */}
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
              onSubmit={editingTrade ? handleUpdateTrade : handleAddTrade}
              tagGroups={tagGroups} 
              playbookEntries={playbookEntries}
              tradeToEdit={editingTrade || undefined} 
            />
          </Modal>
        )}

        {/* Main Dashboard Content */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {/* Chart Controls */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 flex items-center">
                <AdjustmentsHorizontalIcon className="w-6 h-6 mr-2" />
                Controls
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

            {/* Summary */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-pink-400 flex items-center">
                <TableCellsIcon className="w-6 h-6 mr-2" />
                Summary
              </h2>
              
              <div className="flex items-center space-x-2 mb-4">
                <Button onClick={() => setSummaryDateMode('daily')} variant={summaryDateMode === 'daily' ? 'primary' : 'secondary'} size="sm">Daily</Button>
                <Button onClick={() => setSummaryDateMode('range')} variant={summaryDateMode === 'range' ? 'primary' : 'secondary'} size="sm">Range</Button>
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
            
            {/* Tag Performance */}
            <TagPerformance 
              trades={trades} 
              tagGroups={tagGroups} 
              chartDateRange={chartDateRange} 
              directionFilter={directionFilter} 
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <div id="performance-chart-container" className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[400px]">
              <h2 className="text-2xl font-semibold mb-4 text-green-400 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2" />
                Performance Chart
              </h2>
              <LineChartRenderer 
                data={chartData} 
                comparisonData={comparisonChartData} 
                yAxisMetric={yAxisMetric} 
                xAxisMetric={xAxisMetric} 
              />
            </div>

            {/* Pie Charts */}
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

            {/* Trade Log */}
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
                onDeleteTrade={handleDeleteTrade}
                onEditTrade={handleEditTrade}
                onViewDetails={handleViewTradeDetails}
                filtersOpen={tradeFiltersOpen}
                setFiltersOpen={setTradeFiltersOpen}
              />
            </div>
          </div>
        </main>
          
        {/* Legal Disclaimer Footer */}
        <FooterDisclaimer />
        
        {/* Compact Legal Disclaimer and Legal Button */}
        <div className="mt-6 flex flex-col items-center space-y-4">
          <LegalDisclaimer variant="compact" />
          <Button
            onClick={onShowLegalDisclaimer}
            variant="ghost"
            size="sm"
            leftIcon={<DocumentTextIcon className="w-4 h-4"/>}
            className="text-gray-400 hover:text-gray-200"
          >
            View Full Legal Disclaimers
          </Button>
        </div>

        {/* Trade Details Modal */}
        {viewingTrade && (
          <Modal title="Trade Details" onClose={handleCloseTradeDetails} size="large">
            <TradeDetailsView trade={viewingTrade} playbookEntries={playbookEntries} />
          </Modal>
        )}

        {/* Floating Add Trade Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={openTradeForm}
            className={`flex items-center justify-center w-full mt-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full shadow-md px-4 py-1 text-sm transition-transform duration-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300`}
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