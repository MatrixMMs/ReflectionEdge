import React, { useState, useMemo, useRef } from 'react';
import { Trade, AdvancedTagGroup, PlaybookEntry, ChartYAxisMetric, ChartXAxisMetric, AppDateRange, TradeDirectionFilterSelection } from '../types';
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
import { DateRangePicker } from '../components/ui/DateRangePicker';

interface DashboardPageProps {
  trades: Trade[];
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
  tagGroups: AdvancedTagGroup[];
  setTagGroups: React.Dispatch<React.SetStateAction<AdvancedTagGroup[]>>;
  playbookEntries: PlaybookEntry[];
  setPlaybookEntries: React.Dispatch<React.SetStateAction<PlaybookEntry[]>>;
  onShowLegalDisclaimer: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  trades, 
  setTrades, 
  tagGroups, 
  setTagGroups, 
  playbookEntries, 
  setPlaybookEntries,
  onShowLegalDisclaimer
}) => {
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
    <div className="min-h-screen text-gray-100" style={{ background: 'var(--background-main)' }}>
      {/* Header Card: full width, flush with top/left/right - positioned absolutely to break out of main content constraints */}
      <div 
        className="bg-gray-800 p-3 flex items-center justify-between absolute top-0 left-0 right-0 z-10" 
        style={{ 
          background: 'var(--background-secondary)',
          marginLeft: 'var(--sidebar-width)',
          transition: 'margin-left 0.3s ease',
          maxWidth: 'calc(100vw - var(--sidebar-width))',
          boxSizing: 'border-box',
        }}
      >
        <h1 className="text-3xl font-[550]" style={{ color: 'var(--text-main)', marginLeft: '1rem', fontWeight: 550 }}>Dashboard</h1>
        <div style={{ marginRight: '1.5rem', maxWidth: 340, minWidth: 220, width: '100%' }}>
          <DateRangePicker
            value={summaryDateRange}
            onChange={setSummaryDateRange}
            minDate={undefined}
            maxDate={undefined}
          />
        </div>
      </div>
      {/* Dashboard Content: padded, not touching sidebar or page edges - with top margin to account for header */}
      <div className="flex flex-col pl-4 pr-4 pb-4 pt-20">
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
        <main className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          {/* Left: Trade Log */}
          <div className="flex flex-col h-full min-h-[600px]">
            <div id="tradelog-container" className="bg-gray-800 p-6 rounded-xl flex-1 flex flex-col" style={{ background: 'var(--background-secondary)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-[550] text-purple-400 flex items-center">Trade Log</h2>
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

          {/* Middle: Performance Chart (top), Summary (bottom) */}
          <div className="flex flex-col gap-6 h-full min-h-[600px]">
            <div id="performance-chart-container" className="bg-gray-800 p-6 rounded-xl min-h-[300px]" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4 text-green-400 flex items-center">
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
            <div className="bg-gray-800 p-6 rounded-xl flex-1" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4 text-pink-400 flex items-center">
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
                    <label htmlFor="summary-date" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Select Date:</label>
                    <input
                      type="date"
                      id="summary-date"
                      value={summaryDateRange.start}
                      onChange={(e) => setSummaryDateRange({ start: e.target.value, end: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                    />
                  </div>
                ) : null}
              </div>
              <Summary trades={tradesForSummary} />
              {directionFilter !== 'all' && <p className="text-xs text-gray-400 mt-2">Showing summary for {directionFilter} trades only.</p>}
            </div>
          </div>

          {/* Right: Chart Controls (top), Tag Performance (bottom) */}
          <div className="flex flex-col gap-6 h-full min-h-[600px]">
            <div className="bg-gray-800 p-6 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4 text-purple-400 flex items-center">
                <AdjustmentsHorizontalIcon className="w-6 h-6 mr-2" />
                Controls
              </h2>
              <ChartControls
                yAxisMetric={yAxisMetric}
                setYAxisMetric={setYAxisMetric}
                xAxisMetric={xAxisMetric}
                setXAxisMetric={setXAxisMetric}
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
            <div className="flex-1">
              <TagPerformance 
                trades={trades} 
                tagGroups={tagGroups} 
                chartDateRange={chartDateRange} 
                directionFilter={directionFilter} 
              />
            </div>
          </div>
        </main>

        {/* Legal Disclaimer Footer */}
        {/* <FooterDisclaimer /> */}
        
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
      </div>
    </div>
  );
};

export default DashboardPage; 