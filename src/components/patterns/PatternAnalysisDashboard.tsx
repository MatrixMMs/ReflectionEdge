import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '../../types';
import { analyzeTimePatterns, getTimeBasedRecommendations, TimePattern, PatternAnalysis } from '../../utils/patternRecognition';
import { Button } from '../ui/Button';
import { ChartBarIcon, ClockIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon } from '../ui/Icons';

interface PatternAnalysisDashboardProps {
  trades: Trade[];
}

type ChartType = 'hourly' | 'daily' | 'monthly' | 'session' | 'heatmap';
type MetricType = 'winRate' | 'profit' | 'trades' | 'profitFactor';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
];

export const PatternAnalysisDashboard: React.FC<PatternAnalysisDashboardProps> = ({ trades }) => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('hourly');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('winRate');
  const [showRecommendations, setShowRecommendations] = useState(true);

  const patternAnalysis = useMemo(() => analyzeTimePatterns(trades), [trades]);
  const recommendations = useMemo(() => getTimeBasedRecommendations(trades), [trades]);

  const getMetricValue = (pattern: TimePattern, metric: MetricType): number => {
    switch (metric) {
      case 'winRate':
        return pattern.winRate;
      case 'profit':
        return pattern.totalProfit;
      case 'trades':
        return pattern.totalTrades;
      case 'profitFactor':
        return pattern.profitFactor;
      default:
        return 0;
    }
  };

  const getMetricLabel = (metric: MetricType): string => {
    switch (metric) {
      case 'winRate':
        return 'Win Rate (%)';
      case 'profit':
        return 'Total Profit ($)';
      case 'trades':
        return 'Number of Trades';
      case 'profitFactor':
        return 'Profit Factor';
      default:
        return '';
    }
  };

  const getChartData = (): any[] => {
    switch (selectedChartType) {
      case 'hourly':
        return patternAnalysis.hourlyPatterns.map(pattern => {
          const { value, ...rest } = pattern;
          return {
            name: `${pattern.value}:00`,
            ...rest,
            value: getMetricValue(pattern, selectedMetric)
          };
        });
      case 'daily':
        return patternAnalysis.dayOfWeekPatterns.map(pattern => {
          const { value, ...rest } = pattern;
          return {
            name: pattern.value,
            ...rest,
            value: getMetricValue(pattern, selectedMetric)
          };
        });
      case 'monthly':
        return patternAnalysis.monthlyPatterns.map(pattern => {
          const { value, ...rest } = pattern;
          return {
            name: pattern.value,
            ...rest,
            value: getMetricValue(pattern, selectedMetric)
          };
        });
      case 'session':
        const preMarket = patternAnalysis.sessionAnalysis.preMarket;
        const regular = patternAnalysis.sessionAnalysis.regular;
        const afterHours = patternAnalysis.sessionAnalysis.afterHours;
        return [
          { name: 'Pre-Market', ...preMarket, value: getMetricValue(preMarket, selectedMetric) },
          { name: 'Regular Hours', ...regular, value: getMetricValue(regular, selectedMetric) },
          { name: 'After Hours', ...afterHours, value: getMetricValue(afterHours, selectedMetric) }
        ];
      case 'heatmap':
        // Data for heatmap is structured differently, handled in renderHeatmap
        return patternAnalysis.hourlyPatterns.length > 0 && patternAnalysis.dayOfWeekPatterns.length > 0
          ? [{placeholder: 1}] // Return a placeholder to prevent "No data" message
          : [];
      default:
        return [];
    }
  };

  const renderBarChart = () => {
    const data = getChartData();
    if (!data || data.length === 0) {
      return <div className="text-center text-gray-500 py-12">No data for this chart type.</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value: any, name: string) => [
              selectedMetric === 'winRate' ? `${value.toFixed(1)}%` : 
              selectedMetric === 'profit' ? `$${value.toFixed(2)}` : 
              selectedMetric === 'profitFactor' ? value.toFixed(2) : value,
              getMetricLabel(selectedMetric)
            ]}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            fill={selectedMetric === 'winRate' ? 'var(--accent-green)' : 
                  selectedMetric === 'profit' ? 'var(--accent-blue)' : 
                  selectedMetric === 'profitFactor' ? 'var(--accent-yellow)' : 'var(--accent-purple)'}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = () => {
    const data = getChartData();
    if (!data || data.length === 0) {
      return <div className="text-center text-gray-500 py-12">No data for this chart type.</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value: any, name: string) => [
              selectedMetric === 'winRate' ? `${value.toFixed(1)}%` : 
              selectedMetric === 'profit' ? `$${value.toFixed(2)}` : 
              selectedMetric === 'profitFactor' ? value.toFixed(2) : value,
              getMetricLabel(selectedMetric)
            ]}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={selectedMetric === 'winRate' ? 'var(--accent-green)' : 
                    selectedMetric === 'profit' ? 'var(--accent-blue)' : 
                    selectedMetric === 'profitFactor' ? 'var(--accent-yellow)' : 'var(--accent-purple)'}
            strokeWidth={3}
            dot={{ fill: selectedMetric === 'winRate' ? 'var(--accent-green)' : 
                          selectedMetric === 'profit' ? 'var(--accent-blue)' : 
                          selectedMetric === 'profitFactor' ? 'var(--accent-yellow)' : 'var(--accent-purple)', strokeWidth: 2, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    const data = getChartData();
    if (!data || data.length === 0) {
      return <div className="text-center text-gray-500 py-12">No data for this chart type.</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any, name: string) => [
              selectedMetric === 'winRate' ? `${value.toFixed(1)}%` : 
              selectedMetric === 'profit' ? `$${value.toFixed(2)}` : 
              selectedMetric === 'profitFactor' ? value.toFixed(2) : value,
              getMetricLabel(selectedMetric)
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderHeatmap = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // Create a more robust data structure for the heatmap
    const heatmapData = Array(7).fill(null).map(() => Array(24).fill(null).map(() => ({
      value: 0,
      trades: 0,
      metric: 0,
    })));

    // Populate the heatmap data from trades
    trades.forEach(trade => {
        const date = new Date(trade.timeIn);
        const dayOfWeek = date.getUTCDay();
        const hour = date.getUTCHours();
        
        if (heatmapData[dayOfWeek] && heatmapData[dayOfWeek][hour]) {
            heatmapData[dayOfWeek][hour].trades += 1;
            switch(selectedMetric) {
                case 'profit':
                    heatmapData[dayOfWeek][hour].value += trade.profit;
                    break;
                case 'winRate':
                    // We'll calculate win rate at the end
                    if (trade.profit > 0) heatmapData[dayOfWeek][hour].value += 1;
                    break;
                case 'profitFactor':
                    // We'll calculate this at the end
                    if (trade.profit > 0) heatmapData[dayOfWeek][hour].value += trade.profit;
                    else heatmapData[dayOfWeek][hour].metric += Math.abs(trade.profit);
                    break;
                default:
                    heatmapData[dayOfWeek][hour].value += 1; // Default to trade count
            }
        }
    });

    // Finalize calculations
    for(let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const cell = heatmapData[day][hour];
            if (cell.trades > 0) {
                switch(selectedMetric) {
                    case 'winRate':
                        cell.metric = (cell.value / cell.trades) * 100;
                        break;
                    case 'profitFactor':
                        cell.metric = cell.metric > 0 ? cell.value / cell.metric : cell.value > 0 ? Infinity : 0;
                        break;
                    case 'profit':
                         cell.metric = cell.value;
                         break;
                    default: // trades
                        cell.metric = cell.trades;
                }
            }
        }
    }
    
    // Find min and max for color scaling
    let minMetric = Infinity;
    let maxMetric = -Infinity;
    heatmapData.flat().forEach(cell => {
        if(cell.trades > 0) {
            minMetric = Math.min(minMetric, cell.metric);
            maxMetric = Math.max(maxMetric, cell.metric);
        }
    });

    const getCellColor = (value: number) => {
        if (value === 0 && selectedMetric !== 'trades') return 'bg-gray-800';
        if (selectedMetric === 'winRate') {
            const opacity = Math.max(0.1, Math.min(value / 100, 1));
            return `rgba(var(--accent-green), ${opacity})`;
        }
        if (selectedMetric === 'profit') {
            const isLoss = value < 0;
            const absoluteMax = Math.max(Math.abs(minMetric), Math.abs(maxMetric));
            const opacity = absoluteMax > 0 ? Math.max(0.1, Math.min(Math.abs(value) / absoluteMax, 1)) : 0.1;
            return isLoss ? `rgba(239, 68, 68, ${opacity})` : `rgba(var(--accent-green), ${opacity})`;
        }
        // trades or profitFactor
        const opacity = maxMetric > 0 ? Math.max(0.1, Math.min(value / maxMetric, 1)) : 0.1;
        return `rgba(var(--accent-green), ${opacity})`
    }
    
    return (
      <div className="w-full overflow-auto bg-gray-700 p-4 rounded-lg">
        <div className="grid grid-cols-8 gap-1 text-xs text-center">
          <div className="font-semibold p-2 text-gray-200">Hour</div>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-semibold p-2 text-gray-200">{day}</div>
          ))}
          {Array.from({ length: 24 }).map((_, hour) => (
            <React.Fragment key={hour}>
              <div className="font-semibold p-2 text-right text-gray-200">{`${hour}:00`}</div>
              {Array.from({ length: 7 }).map((_, day) => {
                const cell = heatmapData[day][hour];
                return (
                  <div
                    key={`${hour}-${day}`}
                    className="p-2 text-center text-white font-bold rounded"
                    style={{ backgroundColor: getCellColor(cell.metric) }}
                    title={`${dayNames[day]} ${hour}:00 - ${getMetricLabel(selectedMetric)}: ${cell.metric.toFixed(2)} (${cell.trades} trades)`}
                  >
                    {cell.trades > 0 ? cell.metric.toFixed(selectedMetric === 'trades' ? 0 : 1) : '-'}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (selectedChartType) {
      case 'hourly':
        return renderBarChart();
      case 'daily':
        return renderLineChart();
      case 'monthly':
        return renderBarChart();
      case 'session':
        return renderPieChart();
      case 'heatmap':
        return renderHeatmap();
      default:
        return <div className="text-center text-gray-500 py-12">Select a chart type.</div>;
    }
  };

  const renderRecommendations = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <ClockIcon className="w-5 h-5 mr-2 text-green-600" />
        Current Time Recommendations
      </h3>
      <div className="space-y-3">
        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
          <TrendingUpIcon className="w-4 h-4 mr-2 text-green-600" />
          <span className="text-sm font-medium text-gray-700">{recommendations.currentHourRecommendation}</span>
        </div>
        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
          <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">{recommendations.currentDayRecommendation}</span>
        </div>
        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
          <ChartBarIcon className="w-4 h-4 mr-2 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">{recommendations.sessionRecommendation}</span>
        </div>
      </div>
    </div>
  );

  const renderTopPerformers = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUpIcon className="w-5 h-5 mr-2 text-green-600" />
          Best Performing Hours
        </h3>
        <div className="space-y-2">
          {patternAnalysis.bestPerformingHours.map((pattern, index) => (
            <div key={pattern.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="font-medium text-black">{pattern.value}:00</span>
              <span className="text-green-700 font-bold">{pattern.winRate.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingDownIcon className="w-5 h-5 mr-2 text-red-600" />
          Worst Performing Hours
        </h3>
        <div className="space-y-2">
          {patternAnalysis.worstPerformingHours.map((pattern, index) => (
            <div key={pattern.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="font-medium text-black">{pattern.value}:00</span>
              <span className="text-red-700 font-bold">{pattern.winRate.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pattern Data Available</h3>
        <p className="text-gray-500">Add some trades to start analyzing patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pattern Analysis</h2>
          <p className="text-gray-200">Discover time-based trading patterns and optimize your strategy</p>
        </div>
        <Button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="mt-4 sm:mt-0"
        >
          {showRecommendations ? 'Hide' : 'Show'} Recommendations
        </Button>
      </div>

      {/* Recommendations */}
      {showRecommendations && renderRecommendations()}

      {/* Top Performers */}
      {renderTopPerformers()}

      {/* Chart Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
            <select
              value={selectedChartType}
              onChange={(e) => setSelectedChartType(e.target.value as ChartType)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="hourly">Hourly Patterns</option>
              <option value="daily">Daily Patterns</option>
              <option value="monthly">Monthly Patterns</option>
              <option value="session">Session Analysis</option>
              <option value="heatmap">Time Heatmap</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="winRate">Win Rate (%)</option>
              <option value="profit">Total Profit ($)</option>
              <option value="trades">Number of Trades</option>
              <option value="profitFactor">Profit Factor</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full">
          {renderChart()}
        </div>
      </div>

      {/* Pattern Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pattern Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{patternAnalysis.hourlyPatterns.length}</div>
            <div className="text-sm text-gray-600">Hour Patterns</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{patternAnalysis.dayOfWeekPatterns.length}</div>
            <div className="text-sm text-gray-600">Day Patterns</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{patternAnalysis.monthlyPatterns.length}</div>
            <div className="text-sm text-gray-600">Month Patterns</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{trades.length}</div>
            <div className="text-sm text-gray-600">Total Trades</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 