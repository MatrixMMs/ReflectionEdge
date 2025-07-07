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
  CustomChevronRightIcon,
  InfoIcon
} from '../components/ui/Icons';
import { processChartData, filterTradesByDateAndTags } from '../utils/chartDataProcessor';
import { calculateFinancials } from '../utils/financialCalculations';
import { getRandomColor, resetColorUsage } from '../utils/colorGenerator';
import { DEFAULT_CHART_COLOR, COMPARISON_CHART_COLOR, LONG_TRADE_COLOR, SHORT_TRADE_COLOR } from '../constants';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { CircularProgress } from '../components/ui/CircularProgress';
// @ts-ignore: If you have not installed react-minimal-pie-chart, run: npm install react-minimal-pie-chart
import { PieChart } from 'react-minimal-pie-chart';

interface DashboardPageProps {
  trades: Trade[];
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
  tagGroups: AdvancedTagGroup[];
  setTagGroups: React.Dispatch<React.SetStateAction<AdvancedTagGroup[]>>;
  playbookEntries: PlaybookEntry[];
  setPlaybookEntries: React.Dispatch<React.SetStateAction<PlaybookEntry[]>>;
  onShowLegalDisclaimer: () => void;
}

const KPI_NUMBER_STYLE = { fontSize: '1.8rem' };

// Helper for formatting numbers with commas and currency
function formatCurrency(value: number, decimals = 2) {
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
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

  // Calculate breakeven trades for WinRateProgressCircle
  const breakevenCount = kpiMetrics.financials.totalTrades - Math.round(kpiMetrics.financials.totalTrades * kpiMetrics.financials.winRate / 100) - Math.round(kpiMetrics.financials.totalTrades * kpiMetrics.financials.lossRate / 100);
  const breakevenRate = kpiMetrics.financials.totalTrades > 0 ? (breakevenCount / kpiMetrics.financials.totalTrades) * 100 : 0;

  // PieChart tooltip state
  const [pieTooltip, setPieTooltip] = React.useState<null | {
    label: string;
    count: number;
    amount: number;
    color: string;
    x: number;
    y: number;
  }>(null);

  const hidePieTooltip = () => setPieTooltip(null);

  // PieChart data calculations
  const pieData = [
    { value: kpiMetrics.financials.winRate, color: 'var(--success-main, #22c55e)', label: 'Wins', count: Math.round(kpiMetrics.financials.totalTrades * kpiMetrics.financials.winRate / 100), amount: kpiMetrics.financials.grossPnl },
    { value: breakevenRate, color: 'var(--accent-yellow, #eab308)', label: 'Breakeven', count: breakevenCount, amount: 0 },
    { value: kpiMetrics.financials.lossRate, color: 'var(--error-main, #ef4444)', label: 'Losses', count: Math.round(kpiMetrics.financials.totalTrades * kpiMetrics.financials.lossRate / 100), amount: kpiMetrics.financials.grossPnl - kpiMetrics.financials.netPnl },
  ];

  // Restore info popup state for InfoIcon tooltips
  const [infoTooltip, setInfoTooltip] = React.useState<string | null>(null);
  const [infoAnchor, setInfoAnchor] = React.useState<{ x: number, y: number } | null>(null);
  const showInfo = (text: string, e: any) => {
    setInfoTooltip(text);
    if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number') {
      setInfoAnchor({ x: e.clientX, y: e.clientY });
    } else {
      setInfoAnchor(null);
    }
  };
  const hideInfo = () => {
    setInfoTooltip(null);
    setInfoAnchor(null);
  };

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
                <p className="text-sm" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Net P&L
                  <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={e => showInfo('Net profit or loss after all trades and fees.', e)} onMouseLeave={hideInfo}>
                    <InfoIcon style={{ width: 16, height: 16, color: 'var(--text-secondary)' }} />
                  </span>
                </p>
                <p className={`text-4xl font-bold ${kpiMetrics.financials.netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`} style={KPI_NUMBER_STYLE}>
                  {formatCurrency(kpiMetrics.financials.netPnl)}
                </p>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-gray-800 p-4 rounded-xl" style={{ background: 'var(--background-secondary)', minHeight: 120, position: 'relative' }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Win Rate
                  <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={e => showInfo('Percentage of trades with positive profit.', e)} onMouseLeave={hideInfo}>
                    <InfoIcon style={{ width: 16, height: 16, color: 'var(--text-secondary)' }} />
                  </span>
                </p>
                <p className={`text-4xl font-bold ${kpiMetrics.financials.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`} style={KPI_NUMBER_STYLE}>
                  {kpiMetrics.financials.winRate.toFixed(1)}%
                </p>
              </div>
              <div className="ml-2" style={{ position: 'relative' }}>
                <PieChart
                  data={pieData}
                  lineWidth={12}
                  startAngle={-90}
                  paddingAngle={2}
                  rounded={false}
                  style={{ width: 48, height: 48 }}
                  segmentsStyle={{ cursor: 'pointer' }}
                  animate
                  label={() => ''}
                  onMouseOver={(event: any, idx: number) => {
                    const d = pieData[idx];
                    if (d && event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
                      setPieTooltip({
                        label: d.label,
                        count: d.count,
                        amount: d.amount,
                        color: d.color,
                        x: event.clientX,
                        y: event.clientY
                      });
                    }
                  }}
                  onMouseOut={hidePieTooltip}
                />
              </div>
            </div>
          </div>

          {/* Profit Factor */}
          <div className="bg-gray-800 p-4 rounded-xl" style={{ background: 'var(--background-secondary)', minHeight: 120 }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Profit Factor
                  <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={e => showInfo('Gross profit divided by gross loss.', e)} onMouseLeave={hideInfo}>
                    <InfoIcon style={{ width: 16, height: 16, color: 'var(--text-secondary)' }} />
                  </span>
                </p>
                <p className="text-4xl font-bold" style={{ color: 'var(--text-main)', ...KPI_NUMBER_STYLE }}>
                  {formatNumber(kpiMetrics.financials.profitFactor, 2)}
                </p>
              </div>
            </div>
          </div>

          {/* Max Drawdown */}
          <div className="bg-gray-800 p-4 rounded-xl" style={{ background: 'var(--background-secondary)', minHeight: 120 }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Max Drawdown
                  <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={e => showInfo('Largest drop from a peak to a trough in cumulative P&L.', e)} onMouseLeave={hideInfo}>
                    <InfoIcon style={{ width: 16, height: 16, color: 'var(--text-secondary)' }} />
                  </span>
                </p>
                <p className="text-4xl font-bold text-red-500" style={KPI_NUMBER_STYLE}>
                  {formatCurrency(drawdown.max)}
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
                        {formatCurrency(trade.profit)}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatNumber(trade.contracts)} contracts
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
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)', ...KPI_NUMBER_STYLE }}>{formatNumber(sessionPerformance.preMarket.trades)}</p>
                  <p className={`text-sm ${sessionPerformance.preMarket.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(sessionPerformance.preMarket.pnl)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {sessionPerformance.preMarket.winRate.toFixed(1)}% win rate
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--background-main)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Regular Hours</h3>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)', ...KPI_NUMBER_STYLE }}>{formatNumber(sessionPerformance.regular.trades)}</p>
                  <p className={`text-sm ${sessionPerformance.regular.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(sessionPerformance.regular.pnl)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {sessionPerformance.regular.winRate.toFixed(1)}% win rate
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--background-main)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>After Hours</h3>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)', ...KPI_NUMBER_STYLE }}>{formatNumber(sessionPerformance.afterHours.trades)}</p>
                  <p className={`text-sm ${sessionPerformance.afterHours.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(sessionPerformance.afterHours.pnl)}
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

        {/* PieChart tooltip */}
        {pieTooltip && (
          <div style={{
            position: 'fixed',
            left: pieTooltip.x,
            top: pieTooltip.y - 36,
            background: 'var(--background-main, #18181b)',
            color: pieTooltip.color,
            border: `1.5px solid ${pieTooltip.color}`,
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 600,
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}>
            <div style={{ color: pieTooltip.color, fontWeight: 700 }}>{pieTooltip.label}</div>
            <div style={{ color: 'var(--text-main, #e5e7eb)', fontWeight: 500, fontSize: 15 }}>
              Trades: <span style={{ color: pieTooltip.color, fontWeight: 700 }}>{pieTooltip.count}</span>
            </div>
            {pieTooltip.label === 'Wins' && (
              <div style={{ color: 'var(--text-main, #e5e7eb)', fontWeight: 500, fontSize: 15 }}>
                Total Won: <span style={{ color: pieTooltip.color, fontWeight: 700 }}>${formatCurrency(pieTooltip.amount)}</span>
              </div>
            )}
            {pieTooltip.label === 'Losses' && (
              <div style={{ color: 'var(--text-main, #e5e7eb)', fontWeight: 500, fontSize: 15 }}>
                Total Lost: <span style={{ color: pieTooltip.color, fontWeight: 700 }}>${formatCurrency(pieTooltip.amount)}</span>
              </div>
            )}
            {pieTooltip.label === 'Breakeven' && (
              <div style={{ color: 'var(--text-main, #e5e7eb)', fontWeight: 500, fontSize: 15 }}>
              </div>
            )}
          </div>
        )}

        {/* Render the info popup (separate from pie chart tooltip) */}
        {infoTooltip && infoAnchor && (
          <div style={{
            position: 'fixed',
            left: infoAnchor.x,
            top: infoAnchor.y - 36,
            background: 'var(--background-main, #18181b)',
            color: 'var(--text-main, #e5e7eb)',
            border: '1.5px solid var(--border-main, #333)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 500,
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}>
            {infoTooltip}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 