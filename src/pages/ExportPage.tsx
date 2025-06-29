import React from 'react';
import { AppDateRange } from '../types';
import { Button } from '../components/ui/Button';
import { DocumentTextIcon } from '../components/ui/Icons';

interface ExportPageProps {
  exportDateRange: AppDateRange;
  setExportDateRange: (range: AppDateRange) => void;
  exportDateMode: 'daily' | 'range';
  setExportDateMode: (mode: 'daily' | 'range') => void;
  isGeneratingReport: boolean;
  reportError: string | null;
  handleGenerateReport: () => void;
  handleExportDataWithAnalytics: () => void;
  handleExportFilteredData: () => void;
  handleExportData: () => void;
  baseTradesForChart: any[];
  trades: any[];
}

const ExportPage: React.FC<ExportPageProps> = ({
  exportDateRange,
  setExportDateRange,
  exportDateMode,
  setExportDateMode,
  isGeneratingReport,
  reportError,
  handleGenerateReport,
  handleExportDataWithAnalytics,
  handleExportFilteredData,
  handleExportData,
  baseTradesForChart,
  trades
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Export Data & Reports</h1>
        <div className="space-y-6 bg-gray-800 rounded-xl shadow-2xl p-6">
          {/* Date Range Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Select Date Range</h3>
            <div className="flex items-center space-x-2 mb-4">
              <Button 
                onClick={() => setExportDateMode('daily')} 
                variant={exportDateMode === 'daily' ? 'primary' : 'secondary'} 
                size="sm"
              >
                Daily
              </Button>
              <Button 
                onClick={() => setExportDateMode('range')} 
                variant={exportDateMode === 'range' ? 'primary' : 'secondary'} 
                size="sm"
              >
                Range
              </Button>
            </div>
            <div className="mb-4">
              {exportDateMode === 'daily' ? (
                <div>
                  <label htmlFor="export-date" className="block text-sm font-medium text-gray-300 mb-1">Select Date:</label>
                  <input
                    type="date"
                    id="export-date"
                    value={exportDateRange.start}
                    onChange={(e) => setExportDateRange({ start: e.target.value, end: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div>
                    <label htmlFor="export-start-date" className="block text-sm font-medium text-gray-300 mb-1">Start Date:</label>
                    <input
                      type="date"
                      id="export-start-date"
                      value={exportDateRange.start}
                      onChange={(e) => setExportDateRange({ start: e.target.value, end: exportDateRange.end })}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="export-end-date" className="block text-sm font-medium text-gray-300 mb-1">End Date:</label>
                    <input
                      type="date"
                      id="export-end-date"
                      value={exportDateRange.end}
                      onChange={(e) => setExportDateRange({ start: exportDateRange.start, end: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* PDF Report Generation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Generate Full PDF Report</h3>
            {reportError && (
              <div className="mb-3 p-3 bg-red-900 border border-red-700 rounded-lg">
                <p className="text-red-200 text-sm">{reportError}</p>
              </div>
            )}
            <Button
              onClick={handleGenerateReport}
              variant="primary"
              className="w-full bg-green-600 hover:bg-green-700"
              leftIcon={<DocumentTextIcon className="w-5 h-5"/>}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? 'Generating Full Report...' : 'Generate Full Report'}
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Generates a comprehensive PDF report for the selected date range, including all performance metrics and analytical insights (Edge, Patterns, Kelly).
            </p>
            {isGeneratingReport && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ This may take a few seconds for large datasets...
              </p>
            )}
          </div>
          <div className="border-t border-gray-600 my-4"></div>
          {/* Data Export Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Export Raw Data</h3>
            <p className="text-sm text-gray-300 mb-3">Export your trade data to JSON files.</p>
            <div className="space-y-3">
              <Button
                onClick={handleExportDataWithAnalytics}
                variant="secondary"
                className="w-full bg-blue-600 hover:bg-blue-700"
                leftIcon={<DocumentTextIcon className="w-5 h-5"/>}
              >
                Export with Analytics (Edge, Patterns, Kelly)
              </Button>
              <Button
                onClick={handleExportFilteredData}
                variant="secondary"
                leftIcon={<DocumentTextIcon className="w-5 h-5"/>}
              >
                Export Chart Filtered Trades ({baseTradesForChart.length} trades)
              </Button>
              <Button
                onClick={handleExportData}
                variant="secondary"
                leftIcon={<DocumentTextIcon className="w-5 h-5"/>}
              >
                Export All Trades ({trades.length} trades)
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              "Chart Filtered" uses current chart controls. "With Analytics" includes Edge Discovery, Pattern Analysis, and Kelly Criterion calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage; 