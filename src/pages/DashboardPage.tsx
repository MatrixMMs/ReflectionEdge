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
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  TableCellsIcon, 
  AdjustmentsHorizontalIcon, 
  FilterIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CalendarIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  EyeIcon,
  BrainIcon,
  CustomWinIcon,
  CustomPlanIcon,
  CustomClockIcon,
  CustomCalendarIcon,
  CustomCalculatorIcon,
  CustomDashboardIcon,
  CustomPlaybookIcon,
  CustomSettingsIcon,
  CustomBestWorstIcon,
  CustomExecutionIcon,
  CustomInsightsIcon,
  CustomPatternIcon,
  CustomTagsIcon,
  CustomMBSIcon,
  CustomEdgeIcon,
  CustomImportIcon,
  CustomExportIcon,
  CustomMBSHistoryIcon,
  CustomDetailsIcon,
  CustomDeleteIcon,
  CustomPlayIcon,
  CustomChevronLeftIcon,
  CustomChevronRightIcon
} from '../components/ui/Icons';
import { processChartData, filterTradesByDateAndTags } from '../utils/chartDataProcessor';
import { calculateFinancials } from '../utils/financialCalculations';
import { getRandomColor, resetColorUsage } from '../utils/colorGenerator';
import { DEFAULT_CHART_COLOR, COMPARISON_CHART_COLOR, LONG_TRADE_COLOR, SHORT_TRADE_COLOR } from '../constants';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { CircularProgress } from '../components/ui/CircularProgress';

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
    start: '',
    end: '',
  });
  const [chartDateRange, setChartDateRange] = useState<AppDateRange>({
    start: '',
    end: '',
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

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const financials = calculateFinancials(tradesForSummary);
    const recentTrades = trades.slice(-5); // Last 5 trades
    const todayTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const today = new Date();
      return tradeDate.toDateString() === today.toDateString();
    });
    
    return {
      financials,
      recentTrades,
      todayTrades,
      totalTrades: trades.length,
      thisWeekTrades: trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return tradeDate >= weekAgo;
      }).length,
      thisMonthTrades: trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return tradeDate >= monthAgo;
      }).length
    };
  }, [trades, tradesForSummary]);

  // Calculate drawdown
  const calculateDrawdown = (trades: Trade[]) => {
    if (trades.length === 0) return { current: 0, max: 0 };
    
    let peak = 0;
    let currentDrawdown = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;
    
    trades.forEach(trade => {
      runningTotal += trade.profit;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      currentDrawdown = peak - runningTotal;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
    });
    
    return { current: currentDrawdown, max: maxDrawdown };
  };

  const drawdown = useMemo(() => calculateDrawdown(trades), [trades]);

  // Calculate session performance
  const sessionPerformance = useMemo(() => {
    const sessions = {
      preMarket: { trades: 0, pnl: 0, winRate: 0 },
      regular: { trades: 0, pnl: 0, winRate: 0 },
      afterHours: { trades: 0, pnl: 0, winRate: 0 }
    };
    
    tradesForSummary.forEach(trade => {
      const hour = new Date(trade.timeIn).getHours();
      let session: keyof typeof sessions;
      
      if (hour < 9) session = 'preMarket';
      else if (hour >= 9 && hour < 16) session = 'regular';
      else session = 'afterHours';
      
      sessions[session].trades++;
      sessions[session].pnl += trade.profit;
    });
    
    // Calculate win rates
    Object.keys(sessions).forEach(sessionKey => {
      const session = sessions[sessionKey as keyof typeof sessions];
      if (session.trades > 0) {
        const winningTrades = tradesForSummary.filter(trade => {
          const hour = new Date(trade.timeIn).getHours();
          let tradeSession: keyof typeof sessions;
          
          if (hour < 9) tradeSession = 'preMarket';
          else if (hour >= 9 && hour < 16) tradeSession = 'regular';
          else tradeSession = 'afterHours';
          
          return tradeSession === sessionKey && trade.profit > 0;
        }).length;
        
        session.winRate = (winningTrades / session.trades) * 100;
      }
    });
    
    return sessions;
  }, [tradesForSummary]);

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

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Net P&L */}
          <div className="bg-gray-800 p-4 rounded-xl" style={{ background: 'var(--background-secondary)', minHeight: 120 }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net P&L</p>
                <p className={`text-2xl font-bold ${kpiMetrics.financials.netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${kpiMetrics.financials.netPnl.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-gray-800 p-4 rounded-xl" style={{ background: 'var(--background-secondary)', minHeight: 120, position: 'relative' }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Win Rate</p>
                <p className={`text-2xl font-bold ${kpiMetrics.financials.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>{kpiMetrics.financials.winRate.toFixed(1)}%</p>
              </div>
              <div className="ml-2" style={{ position: 'relative' }}>
                <WinRateProgressCircle
                  winRate={kpiMetrics.financials.winRate}
                  lossRate={kpiMetrics.financials.lossRate}
                  winCount={kpiMetrics.financials.totalTrades * kpiMetrics.financials.winRate / 100}
                  lossCount={kpiMetrics.financials.totalTrades * kpiMetrics.financials.lossRate / 100}
                  winAmount={kpiMetrics.financials.grossPnl}
                  lossAmount={kpiMetrics.financials.grossPnl - kpiMetrics.financials.netPnl}
                  size={48}
                  strokeWidth={6}
                />
              </div>
            </div>
          </div>

          {/* Profit Factor */}
          <div className="bg-gray-800 p-4 rounded-xl" style={{ background: 'var(--background-secondary)', minHeight: 120 }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Profit Factor</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                  {kpiMetrics.financials.profitFactor.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Max Drawdown */}
          <div className="bg-gray-800 p-4 rounded-xl" style={{ background: 'var(--background-secondary)', minHeight: 120 }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Max Drawdown</p>
                <p className="text-2xl font-bold text-red-500">
                  ${drawdown.max.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <main className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          {/* Left Column: Trade Log and Recent Activity */}
          <div className="flex flex-col gap-6">
            {/* Trade Log */}
            <div id="tradelog-container" className="bg-gray-800 p-6 rounded-xl flex-1" style={{ background: 'var(--background-secondary)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-[550]" style={{ color: 'var(--text-main)' }}>Trade Log</h2>
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

            {/* Recent Activity */}
            <div className="bg-gray-800 p-6 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4" style={{ color: 'var(--text-main)' }}>Recent Activity</h2>
              <div className="space-y-3">
                {kpiMetrics.recentTrades.map((trade, index) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--background-main)' }}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${trade.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-main)' }}>
                          {trade.symbol} {trade.direction}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(trade.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${trade.profit.toFixed(2)}
                      </p>
                                             <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                         {trade.contracts} contracts
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Performance Chart and Session Performance */}
          <div className="flex flex-col gap-6">
            {/* Performance Chart */}
            <div id="performance-chart-container" className="bg-gray-800 p-6 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4" style={{ color: 'var(--text-main)' }}>
                <ChartBarIcon className="w-6 h-6 mr-2 inline" />
                Performance Chart
              </h2>
              <LineChartRenderer 
                data={chartData} 
                comparisonData={comparisonChartData} 
                yAxisMetric={yAxisMetric} 
                xAxisMetric={xAxisMetric} 
              />
            </div>

            {/* Session Performance */}
            <div className="bg-gray-800 p-6 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4" style={{ color: 'var(--text-main)' }}>
                <ClockIcon className="w-6 h-6 mr-2 inline" />
                Session Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--background-main)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Pre-Market</h3>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{sessionPerformance.preMarket.trades}</p>
                  <p className={`text-sm ${sessionPerformance.preMarket.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${sessionPerformance.preMarket.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {sessionPerformance.preMarket.winRate.toFixed(1)}% win rate
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--background-main)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Regular Hours</h3>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{sessionPerformance.regular.trades}</p>
                  <p className={`text-sm ${sessionPerformance.regular.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${sessionPerformance.regular.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {sessionPerformance.regular.winRate.toFixed(1)}% win rate
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--background-main)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>After Hours</h3>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{sessionPerformance.afterHours.trades}</p>
                  <p className={`text-sm ${sessionPerformance.afterHours.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${sessionPerformance.afterHours.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {sessionPerformance.afterHours.winRate.toFixed(1)}% win rate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary, Controls, and Tag Performance */}
          <div className="flex flex-col gap-6">
            {/* Summary */}
            <div className="bg-gray-800 p-6 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4" style={{ color: 'var(--text-main)' }}>
                <TableCellsIcon className="w-6 h-6 mr-2 inline" />
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
                      value={summaryDateRange.start || ''}
                      onChange={(e) => setSummaryDateRange({ start: e.target.value, end: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                    />
                  </div>
                ) : null}
              </div>
              <Summary trades={tradesForSummary} />
              {!summaryDateRange.start && !summaryDateRange.end && <p className="text-xs text-gray-400 mt-2">Showing summary for all trades.</p>}
              {directionFilter !== 'all' && <p className="text-xs text-gray-400 mt-2">Showing summary for {directionFilter} trades only.</p>}
            </div>

            {/* Chart Controls */}
            <div className="bg-gray-800 p-6 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <h2 className="text-2xl font-[550] mb-4" style={{ color: 'var(--text-main)' }}>
                <AdjustmentsHorizontalIcon className="w-6 h-6 mr-2 inline" />
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

            {/* Tag Performance */}
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

type WinRateProgressCircleProps = {
  winRate: number;
  lossRate: number;
  winCount: number;
  lossCount: number;
  winAmount: number;
  lossAmount: number;
  size?: number;
  strokeWidth?: number;
};

const WinRateProgressCircle = ({ winRate, lossRate, winCount, lossCount, winAmount, lossAmount, size = 48, strokeWidth = 6 }: WinRateProgressCircleProps) => {
  const [hovered, setHovered] = React.useState<'win' | 'loss' | null>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const winFraction = Math.max(0, Math.min(1, winRate / 100));
  const lossFraction = Math.max(0, Math.min(1, lossRate / 100));
  // Tooltip position: above the arc, centered
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: -38,
    transform: 'translateX(-50%)',
    minWidth: 90,
    padding: '6px 12px',
    borderRadius: 8,
    background: 'var(--background-main, #18181b)',
    color: 'var(--text-main, #e5e7eb)',
    fontSize: 13,
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    pointerEvents: 'none',
    zIndex: 10,
    textAlign: 'left',
    border: `1.5px solid ${hovered === 'win' ? 'var(--success-main, #22c55e)' : 'var(--error-main, #ef4444)'}`,
    opacity: hovered ? 1 : 0,
    transition: 'opacity 0.15s',
  };
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ display: 'block' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--background-tertiary, #e5e7eb)"
          strokeWidth={strokeWidth}
        />
        {/* Win arc (green) */}
        {winFraction > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--success-main, #22c55e)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * winFraction} ${circumference * (1 - winFraction)}`}
            strokeDashoffset={0}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dasharray 0.5s', cursor: 'pointer' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            onMouseEnter={() => setHovered('win')}
            onMouseLeave={() => setHovered(null)}
          />
        )}
        {/* Loss arc (red) */}
        {lossFraction > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--error-main, #ef4444)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * lossFraction} ${circumference * (1 - lossFraction)}`}
            strokeDashoffset={-circumference * winFraction}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dasharray 0.5s', cursor: 'pointer' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            onMouseEnter={() => setHovered('loss')}
            onMouseLeave={() => setHovered(null)}
          />
        )}
      </svg>
      {hovered === 'win' && (
        <div style={tooltipStyle}>
          <div>Wins: <span style={{ color: 'var(--success-main, #22c55e)' }}>{Math.round(winCount)}</span></div>
          <div>Total Won: <span style={{ color: 'var(--success-main, #22c55e)' }}>${winAmount.toFixed(2)}</span></div>
        </div>
      )}
      {hovered === 'loss' && (
        <div style={tooltipStyle}>
          <div>Losses: <span style={{ color: 'var(--error-main, #ef4444)' }}>{Math.round(lossCount)}</span></div>
          <div>Total Lost: <span style={{ color: 'var(--error-main, #ef4444)' }}>${lossAmount.toFixed(2)}</span></div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 