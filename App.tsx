import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Trade, TagGroup, SubTag, ChartYAxisMetric, ChartXAxisMetric, AppDateRange, TradeDirectionFilterSelection } from './types';
import { TradeForm } from './components/trades/TradeForm';
import { TradeList } from './components/trades/TradeList';
import { DailySummary } from './components/trades/DailySummary';
import { TagManager } from './components/tags/TagManager';
import { TagPerformance } from './components/tags/TagPerformance'; // New Import
import { LineChartRenderer } from './components/charts/LineChartRenderer';
import { PieChartRenderer } from './components/charts/PieChartRenderer';
import { ChartControls } from './components/charts/ChartControls';
import { DEFAULT_CHART_COLOR, COMPARISON_CHART_COLOR, LONG_TRADE_COLOR, SHORT_TRADE_COLOR } from './constants';
import { processChartData, filterTradesByDateAndTags } from './utils/chartDataProcessor';
import { parseCSVToTrades as parseBrokerExportCSV } from './utils/csvImporter';
import { parseQuantowerCSVToTrades } from './utils/quantowerCsvImporter';
import { getRandomColor, resetColorUsage } from './utils/colorGenerator';
import { PlusCircleIcon, ChartBarIcon, TagIcon, TableCellsIcon, DocumentTextIcon, AdjustmentsHorizontalIcon, DocumentArrowUpIcon, CogIcon, AcademicCapIcon } from './components/ui/Icons'; // Added AcademicCapIcon for consistency if used directly in App.tsx
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { NotificationPopup } from './components/ui/NotificationPopup';
import { SEO } from './components/SEO';

// Helper to normalize CSV headers for detection
const normalizeHeader = (header: string): string => header.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');

const App: React.FC = () => {
  const STORAGE_VERSION = '1.0';
  const STORAGE_KEY = 'trade-report-card-data';

  const loadStoredData = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const { version, trades: storedTrades, tagGroups: storedTagGroups } = JSON.parse(storedData);
        if (version === STORAGE_VERSION) {
          return {
            trades: storedTrades.map((t: any) => ({
              ...t,
              direction: t.direction || 'long',
              symbol: t.symbol || '',
              contracts: t.contracts || 0,
              timeIn: t.timeIn || '',
              timeOut: t.timeOut || '',
              date: t.date || new Date().toISOString().split('T')[0],
              tags: t.tags || {},
              journal: t.journal || '',
            })),
            tagGroups: storedTagGroups || []
          };
        }
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
    return { trades: [], tagGroups: [] };
  };

  const saveData = (trades: Trade[], tagGroups: TagGroup[]) => {
    try {
      const dataToStore = {
        version: STORAGE_VERSION,
        trades,
        tagGroups
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const { trades: initialTrades, tagGroups: initialTagGroups } = loadStoredData();

  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(initialTagGroups);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
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


  const [isTradeFormModalOpen, setIsTradeFormModalOpen] = useState(false);
  const [isTagManagerModalOpen, setIsTagManagerModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for settings modal and notification
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [importNotification, setImportNotification] = useState<{ title: string; message: string; details?: string } | null>(null);
  const [sessionImportCount, setSessionImportCount] = useState(0);


  useEffect(() => {
    saveData(trades, tagGroups);
  }, [trades, tagGroups]);

  const handleAddTrade = (trade: Omit<Trade, 'id' | 'timeInTrade'>) => {
    const timeInTrade = (new Date(trade.timeOut).getTime() - new Date(trade.timeIn).getTime()) / (1000 * 60); 
    setTrades(prev => [...prev, { 
      ...trade, 
      id: Date.now().toString() + Math.random().toString(16).slice(2), 
      timeInTrade, 
      direction: trade.direction || 'long',
      symbol: trade.symbol || '',
      contracts: trade.contracts || 0
    }]);
    setIsTradeFormModalOpen(false);
    setEditingTrade(null);
  };

  const handleUpdateTrade = (updatedTrade: Trade) => {
    const timeInTrade = (new Date(updatedTrade.timeOut).getTime() - new Date(updatedTrade.timeIn).getTime()) / (1000 * 60);
    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? {
      ...updatedTrade, 
      timeInTrade, 
      direction: updatedTrade.direction || 'long',
      symbol: updatedTrade.symbol || '',
      contracts: updatedTrade.contracts || 0
    } : t));
    setIsTradeFormModalOpen(false);
    setEditingTrade(null);
  }

  const handleDeleteTrade = (tradeId: string) => {
    setTrades(prev => prev.filter(t => t.id !== tradeId));
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsTradeFormModalOpen(true);
  };

  const handleAddTagGroup = (name: string) => {
    setTagGroups(prev => [...prev, { id: Date.now().toString(), name, subtags: [] }]);
  };

  const handleAddSubTag = (groupId: string, subTagName: string) => {
    setTagGroups((prev: TagGroup[]) => prev.map((group: TagGroup) => {
      if (group.id === groupId) {
        const newSubTag: SubTag = { 
          id: Date.now().toString(), 
          name: subTagName, 
          color: getRandomColor(),
          groupId
        };
        return { ...group, subtags: [...group.subtags, newSubTag] };
      }
      return group;
    }));
  };

  const handleUpdateSubTagColor = (groupId: string, subTagId: string, color: string) => {
    setTagGroups((prev: TagGroup[]) => prev.map((group: TagGroup) => {
      if (group.id === groupId) {
        return {
          ...group,
          subtags: group.subtags.map((st: SubTag) => st.id === subTagId ? { ...st, color } : st)
        };
      }
      return group;
    }));
  };

  const handleTradeTagChange = (tradeId: string, groupId: string, subTagId: string | null) => {
    setTrades((prevTrades: Trade[]) => prevTrades.map((trade: Trade) => {
      if (trade.id === tradeId) {
        const newTags = { ...trade.tags };
        if (subTagId) {
          newTags[groupId] = subTagId;
        } else {
          delete newTags[groupId];
        }
        return { ...trade, tags: newTags };
      }
      return trade;
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target?.result as string;
        if (content) {
          if (content.startsWith('\uFEFF')) {
            content = content.substring(1);
          }

          const firstLine = content.split(/\r\n|\n/)[0];
          const headersFromCSV = firstLine.split(',').map(h => normalizeHeader(h.trim()));
          
          let parseResult;
          // Corrected: Headers for detection should match the output of normalizeHeader (no slashes)
          const quantowerRequiredHeadersForDetection = ['datetime', 'side', 'quantity', 'price', 'grosspl', 'fee', 'netpl'];
          const isQuantowerFormat = quantowerRequiredHeadersForDetection.every(qh => headersFromCSV.includes(qh));

          if (isQuantowerFormat) {
            console.log("Attempting to parse as Quantower CSV format.");
            parseResult = parseQuantowerCSVToTrades(content);
          } else {
            console.log("Attempting to parse as Broker Export CSV format. Headers found:", headersFromCSV);
            console.log("Expected Quantower headers for detection:", quantowerRequiredHeadersForDetection);
            parseResult = parseBrokerExportCSV(content, tagGroups);
          }
          
          const { successfulTrades, errors: parseErrors } = parseResult;
          let notificationContent: { title: string; message: string; details?: string } | null = null;

          if (successfulTrades.length > 0) {
            const newSessionImportCount = sessionImportCount + 1;
            setSessionImportCount(newSessionImportCount);

            let mainMsg = `${successfulTrades.length} trades imported successfully!`;
            if (parseErrors.length > 0) {
              mainMsg += ` (${parseErrors.length} warnings, check console).`;
            }
             if (parseErrors.length > 0) {
                console.warn("CSV Import Warnings (some trades imported):", parseErrors);
            }
            
            notificationContent = {
              title: "Import Complete",
              message: mainMsg,
              details: `Total successful imports this session: ${newSessionImportCount}.`
            };
            
            const newTrades: Trade[] = successfulTrades.map((parsedTrade, index) => {
              const timeInTrade = (new Date(parsedTrade.timeOut).getTime() - new Date(parsedTrade.timeIn).getTime()) / (1000 * 60);
              return {
                ...parsedTrade,
                id: Date.now().toString() + "_" + index + Math.random().toString(16).slice(2),
                timeInTrade,
              };
            });
            setTrades(prev => [...prev, ...newTrades]);
            
          } else if (parseErrors.length > 0) {
            alert(`CSV Import Failed:\n- ${parseErrors.length} errors/warnings encountered:\n${parseErrors.slice(0,10).join('\n')}${parseErrors.length > 10 ? '\n...and more (check console for full list).' : ''}`);
            console.error("CSV Import Errors/Warnings (no trades imported):", parseErrors);
          } else { 
            alert("No trades were imported. Check CSV format or content. If the format is correct and there are trades, check console for any silent errors or warnings.");
          }

          if (notificationContent) {
            setImportNotification(notificationContent);
            setShowImportConfirmation(true);
          }
        }
      };
      reader.readAsText(file);
      event.target.value = ''; 
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


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


  const tradesForDailySummary = useMemo(() => {
    let filtered = trades.filter(trade => trade.date === selectedDate);
    if (directionFilter !== 'all') {
      filtered = filtered.filter(trade => trade.direction === directionFilter);
    }
    return filtered;
  }, [trades, selectedDate, directionFilter]);

  const allSubTags = useMemo(() => tagGroups.flatMap(g => g.subtags), [tagGroups]);

  const pieChartData = useMemo(() => {
    let tradesInDateRange = trades.filter(trade => 
        new Date(trade.date) >= new Date(chartDateRange.start) && new Date(trade.date) <= new Date(chartDateRange.end)
    );
    if (directionFilter !== 'all') {
        tradesInDateRange = tradesInDateRange.filter(trade => trade.direction === directionFilter);
    }

    const tagCounts: { [subTagId: string]: number } = {};
    tradesInDateRange.forEach(trade => {
      Object.values(trade.tags).forEach(subTagId => {
        tagCounts[subTagId] = (tagCounts[subTagId] || 0) + 1;
      });
    });
    return allSubTags
      .filter(subTag => tagCounts[subTag.id] > 0)
      .map(subTag => ({
        name: subTag.name,
        value: tagCounts[subTag.id],
        fill: subTag.color,
      }));
  }, [trades, chartDateRange, allSubTags, directionFilter]);


  const openTradeForm = () => {
    setEditingTrade(null);
    setIsTradeFormModalOpen(true);
  }

  return (
    <HelmetProvider>
      <SEO />
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 flex flex-col space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Trade Report Card</h1>
          <div className="flex space-x-2">
            <Button
              onClick={openTradeForm}
              variant="primary"
              className="bg-green-500 hover:bg-green-600"
              leftIcon={<PlusCircleIcon className="w-5 h-5"/>}
            >
             Add Trade
            </Button>
            <Button
              onClick={triggerFileInput}
              variant="secondary"
              leftIcon={<DocumentArrowUpIcon className="w-5 h-5"/>}
            >
              Import CSV
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv" 
              className="hidden" 
            />
            <Button
              onClick={() => setIsTagManagerModalOpen(true)}
              variant="secondary"
              className="bg-indigo-500 hover:bg-indigo-600"
              leftIcon={<TagIcon className="w-5 h-5"/>}
            >
              Manage Tags
            </Button>
            <Button
              onClick={() => setIsSettingsModalOpen(true)}
              variant="secondary"
              className="bg-gray-500 hover:bg-gray-600"
              leftIcon={<CogIcon className="w-5 h-5"/>}
            >
              Settings
            </Button>
          </div>
        </header>

        {isTradeFormModalOpen && (
          <Modal title={editingTrade ? "Edit Trade" : "Add New Trade"} onClose={() => { setIsTradeFormModalOpen(false); setEditingTrade(null); }}>
            <TradeForm 
              onSubmit={editingTrade ? handleUpdateTrade : handleAddTrade} 
              tagGroups={tagGroups} 
              tradeToEdit={editingTrade} 
            />
          </Modal>
        )}

        {isTagManagerModalOpen && (
          <Modal title="Manage Tags" onClose={() => setIsTagManagerModalOpen(false)}>
            <TagManager 
              tagGroups={tagGroups} 
              onAddGroup={handleAddTagGroup} 
              onAddSubTag={handleAddSubTag}
              onUpdateSubTagColor={handleUpdateSubTagColor}
            />
          </Modal>
        )}

        {isSettingsModalOpen && (
          <Modal title="Application Settings" onClose={() => setIsSettingsModalOpen(false)}>
            <div className="text-gray-300">
              <p>Settings panel is under construction.</p>
              <p className="mt-4">Future options might include:</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Theme customization</li>
                <li>Default values for trade form</li>
                <li>Data export options (JSON, CSV)</li>
                <li>Clearing all application data</li>
              </ul>
            </div>
          </Modal>
        )}

        {showImportConfirmation && importNotification && (
          <NotificationPopup
            title={importNotification.title}
            message={importNotification.message}
            details={importNotification.details}
            onClose={() => {
              setShowImportConfirmation(false);
              setImportNotification(null);
            }}
            duration={5000} // 5 seconds
          />
        )}
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 flex items-center"><AdjustmentsHorizontalIcon className="w-6 h-6 mr-2" />Controls</h2>
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
              <h2 className="text-2xl font-semibold mb-4 text-pink-400 flex items-center"><TableCellsIcon className="w-6 h-6 mr-2" />Daily Summary</h2>
              <div className="mb-4">
                <label htmlFor="daily-summary-date" className="block text-sm font-medium text-gray-300 mb-1">Select Date for Summary:</label>
                <input
                  type="date"
                  id="daily-summary-date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                />
              </div>
              <DailySummary trades={tradesForDailySummary} />
               {directionFilter !== 'all' && <p className="text-xs text-gray-400 mt-2">Showing summary for {directionFilter} trades only.</p>}
            </div>
            
            <TagPerformance 
              trades={trades} 
              tagGroups={tagGroups} 
              chartDateRange={chartDateRange} 
              directionFilter={directionFilter} 
            />

            {pieChartData.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-semibold mb-4 text-red-400 flex items-center"><ChartBarIcon className="w-6 h-6 mr-2" />Tag Distribution</h2>
                 <PieChartRenderer data={pieChartData} />
                 <p className="text-xs text-gray-400 mt-2 text-center">
                  For trades in selected date range{directionFilter !== 'all' ? ` (${directionFilter} only)` : ''}.
                 </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[400px]">
               <h2 className="text-2xl font-semibold mb-4 text-green-400 flex items-center"><ChartBarIcon className="w-6 h-6 mr-2" />Performance Chart</h2>
              <LineChartRenderer 
                data={chartData} 
                comparisonData={comparisonChartData} 
                yAxisMetric={yAxisMetric} 
                xAxisMetric={xAxisMetric} 
              />
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
               <h2 className="text-2xl font-semibold mb-4 text-teal-400 flex items-center"><DocumentTextIcon className="w-6 h-6 mr-2" />Trade Log</h2>
              <TradeList 
                trades={trades} 
                tagGroups={tagGroups} 
                onDeleteTrade={handleDeleteTrade} 
                onEditTrade={handleEditTrade}
                onTradeTagChange={handleTradeTagChange}
              />
            </div>
          </div>
        </main>
      </div>
    </HelmetProvider>
  );
};

export default App;
