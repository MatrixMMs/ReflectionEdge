import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Trade, TagGroup, SubTag, ChartYAxisMetric, ChartXAxisMetric, AppDateRange, TradeDirectionFilterSelection, PlaybookEntry } from './types';
import { TradeForm } from './components/trades/TradeForm';
import { TradeList } from './components/trades/TradeList';
import { Summary } from './components/trades/Summary';
import { TagManager } from './components/tags/TagManager';
import { TagPerformance } from './components/tags/TagPerformance'; // New Import
import { LineChartRenderer } from './components/charts/LineChartRenderer';
import { PieChartRenderer } from './components/charts/PieChartRenderer';
import { ChartControls } from './components/charts/ChartControls';
import { PatternAnalysisDashboard } from './components/patterns/PatternAnalysisDashboard';
import { PatternInsights } from './components/patterns/PatternInsights';
import { KellyCriterionAnalysis } from './components/analysis/KellyCriterionAnalysis';
import { EdgeDiscoveryDashboard } from './components/analysis/EdgeDiscoveryDashboard';
import { DEFAULT_CHART_COLOR, COMPARISON_CHART_COLOR, LONG_TRADE_COLOR, SHORT_TRADE_COLOR, DEFAULT_TAG_GROUPS } from './constants';
import { processChartData, filterTradesByDateAndTags } from './utils/chartDataProcessor';
import { parseCSVToTrades as parseBrokerExportCSV } from './utils/csvImporter';
import { parseQuantowerCSVToTrades } from './utils/quantowerCsvImporter';
import { getRandomColor, resetColorUsage } from './utils/colorGenerator';
import { PlusCircleIcon, ChartBarIcon, TagIcon, TableCellsIcon, DocumentTextIcon, AdjustmentsHorizontalIcon, DocumentArrowUpIcon, CogIcon, AcademicCapIcon, LightBulbIcon, BrainIcon, CalculatorIcon } from './components/ui/Icons'; // Added AcademicCapIcon for consistency if used directly in App.tsx
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { NotificationPopup } from './components/ui/NotificationPopup';
import { PlaybookList } from './components/playbook/PlaybookList';
import { PlaybookEditor } from './components/playbook/PlaybookEditor';
import { MonkeyBrainSuppressor } from './components/trades/MonkeyBrainSuppressor';
import { validateFileUpload, safeJsonParse, rateLimiter, generateSecureId, sanitizeString, validateDateString, SECURITY_CONFIG } from './utils/security';
import { SecureStorage } from './utils/secureStorage';
import { generatePdfReport } from './utils/pdfGenerator';
import { calculateFinancials } from './utils/financialCalculations';

// Helper to normalize CSV headers for detection
const normalizeHeader = (header: string): string => header.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');

const App: React.FC = () => {
  const loadStoredData = () => {
    const result = SecureStorage.loadData();
    if (result) {
      // Merge stored tag groups with default tag groups
      const mergedTagGroups = [...DEFAULT_TAG_GROUPS];
      result.tagGroups.forEach((storedGroup: TagGroup) => {
        // Only add non-default tag groups
        if (!DEFAULT_TAG_GROUPS.some(defaultGroup => defaultGroup.id === storedGroup.id)) {
          mergedTagGroups.push(storedGroup);
        }
      });

      return {
        trades: result.trades.map((t: any) => ({
          ...t,
          direction: t.direction || 'long',
          symbol: t.symbol || '',
          contracts: t.contracts || 0,
          timeIn: t.timeIn || '',
          timeOut: t.timeOut || '',
          date: t.date || new Date().toISOString().split('T')[0],
          tags: t.tags || {},
          journal: t.journal || '',
          accountId: t.accountId || 'default'
        })),
        tagGroups: mergedTagGroups,
        playbookEntries: result.playbookEntries || []
      };
    }
    return { trades: [], tagGroups: DEFAULT_TAG_GROUPS, playbookEntries: [] };
  };

  const saveData = (trades: Trade[], tagGroups: TagGroup[], playbookEntries: PlaybookEntry[]) => {
    SecureStorage.saveData(trades, tagGroups, playbookEntries);
  };

  const { trades: initialTrades, tagGroups: initialTagGroups, playbookEntries: initialPlaybookEntries } = loadStoredData();

  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(initialTagGroups);
  const [playbookEntries, setPlaybookEntries] = useState<PlaybookEntry[]>(initialPlaybookEntries);

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


  const [isTradeFormModalOpen, setIsTradeFormModalOpen] = useState(false);
  const [isTagManagerModalOpen, setIsTagManagerModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for settings modal and notification
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [importNotification, setImportNotification] = useState<{ title: string; message: string; details?: string } | null>(null);
  const [sessionImportCount, setSessionImportCount] = useState(0);

  const [isPlaybookModalOpen, setIsPlaybookModalOpen] = useState(false);
  const [selectedPlaybookEntry, setSelectedPlaybookEntry] = useState<PlaybookEntry | null>(null);

  // Pattern analysis state
  const [isPatternAnalysisModalOpen, setIsPatternAnalysisModalOpen] = useState(false);
  const [isPatternInsightsModalOpen, setIsPatternInsightsModalOpen] = useState(false);

  // Edge Discovery analysis state
  const [isEdgeDiscoveryModalOpen, setIsEdgeDiscoveryModalOpen] = useState(false);

  const [isMonkeyBrainSuppressorOpen, setIsMonkeyBrainSuppressorOpen] = useState(false);

  // Kelly Criterion analysis state
  const [isKellyCriterionModalOpen, setIsKellyCriterionModalOpen] = useState(false);

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<AppDateRange>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [exportDateMode, setExportDateMode] = useState<'daily' | 'range'>('daily');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    saveData(trades, tagGroups, playbookEntries);
  }, [trades, tagGroups, playbookEntries]);

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

  const handleUpdateTrade = (updatedTrade: Omit<Trade, 'id' | 'timeInTrade'>) => {
    if (!editingTrade) return;
    const timeInTrade = (new Date(updatedTrade.timeOut).getTime() - new Date(updatedTrade.timeIn).getTime()) / (1000 * 60);
    setTrades(prev => prev.map(t => t.id === editingTrade.id ? {
      ...updatedTrade,
      id: editingTrade.id,
      timeInTrade,
      direction: updatedTrade.direction || 'long',
      symbol: updatedTrade.symbol || '',
      contracts: updatedTrade.contracts || 0
    } : t));
    setIsTradeFormModalOpen(false);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (tradeId: string) => {
    setTrades(prev => prev.filter(t => t.id !== tradeId));
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsTradeFormModalOpen(true);
  };

  const handleAddTagGroup = (name: string) => {
    // Check if a tag group with this name already exists
    if (tagGroups.some(group => group.name.toLowerCase() === name.toLowerCase())) {
      alert('A tag group with this name already exists.');
      return;
    }
    setTagGroups(prev => [...prev, { id: Date.now().toString(), name, subtags: [] }]);
  };

  const handleAddSubTag = (groupId: string, subTagName: string) => {
    // Only lock 'feeling' and 'market' groups
    if (groupId === 'feeling' || groupId === 'market') {
      alert('Cannot add subtags to feeling or market groups.');
      return;
    }

    setTagGroups(prev => prev.map(group => {
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
      // Rate limiting check
      if (!rateLimiter.isAllowed('file-upload', SECURITY_CONFIG.RATE_LIMIT_ATTEMPTS, SECURITY_CONFIG.RATE_LIMIT_WINDOW)) {
        alert('Too many file upload attempts. Please wait a moment before trying again.');
        event.target.value = '';
        return;
      }

      // File validation
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        alert(`File upload rejected: ${validation.error}`);
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target?.result as string;
        if (content) {
          if (content.startsWith('\uFEFF')) {
            content = content.substring(1);
          }

          // Check if the file is JSON (from our export feature)
          if (file.type === 'application/json' || file.name.endsWith('.json')) {
            const parseResult = safeJsonParse(content);
            if (!parseResult.success) {
              alert(`JSON parsing failed: ${parseResult.error}`);
              return;
            }

            const jsonData = parseResult.data;
            if (jsonData.trades && Array.isArray(jsonData.trades)) {
              // This is our exported JSON format
              const { trades: importedTrades, tagGroups: importedTagGroups, playbookEntries: importedPlaybookEntries } = jsonData;
              
              // Validate imported data structure
              if (!Array.isArray(importedTrades) || !Array.isArray(importedTagGroups)) {
                alert('Invalid data structure in imported file.');
                return;
              }

              // Sanitize imported data
              const sanitizedTrades = importedTrades.map(trade => ({
                ...trade,
                symbol: sanitizeString(trade.symbol || ''),
                journal: sanitizeString(trade.journal || ''),
                date: validateDateString(trade.date) ? trade.date : new Date().toISOString().split('T')[0]
              }));

              const sanitizedTagGroups = importedTagGroups.map(group => ({
                ...group,
                name: sanitizeString(group.name || ''),
                subtags: group.subtags?.map((subtag: any) => ({
                  ...subtag,
                  name: sanitizeString(subtag.name || '')
                })) || []
              }));
              
              // Merge tag groups with existing ones
              const mergedTagGroups = [...DEFAULT_TAG_GROUPS];
              sanitizedTagGroups.forEach((importedGroup: TagGroup) => {
                if (!DEFAULT_TAG_GROUPS.some(defaultGroup => defaultGroup.id === importedGroup.id)) {
                  mergedTagGroups.push(importedGroup);
                }
              });

              // Update state with imported data
              setTrades(sanitizedTrades);
              setTagGroups(mergedTagGroups);
              setPlaybookEntries(importedPlaybookEntries || []);

              // Show success notification
              setImportNotification({
                title: "Import Complete",
                message: `Successfully imported ${sanitizedTrades.length} trades, ${mergedTagGroups.length} tag groups, and ${importedPlaybookEntries?.length || 0} playbook entries.`
              });
              setShowImportConfirmation(true);
              return;
            }
          }

          // Continue with existing CSV parsing logic
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
                id: generateSecureId(),
                timeInTrade,
                symbol: sanitizeString(parsedTrade.symbol),
                journal: sanitizeString(parsedTrade.journal || '')
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

  const allSubTags = useMemo(() => tagGroups.flatMap(g => g.subtags), [tagGroups]);

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
  }

  const handleDeleteTagGroup = (groupId: string) => {
    // Check if this is a default tag group
    if (DEFAULT_TAG_GROUPS.some(group => group.id === groupId)) {
      alert('Cannot delete default tag groups.');
      return;
    }
    setTagGroups(prev => prev.filter(group => group.id !== groupId));
  };

  // Export feature: download all app data as JSON
  const handleExportData = () => {
    const dataToExport = {
      trades,
      tagGroups,
      playbookEntries
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-edge-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportFilteredData = () => {
    // We use baseTradesForChart as it already has date range and tag filters applied
    const dataToExport = {
      trades: baseTradesForChart,
      tagGroups,
      playbookEntries,
      filters: {
        chartDateRange,
        selectedTagsForChart,
        tagComparisonMode,
        directionFilter,
      }
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-edge-filtered-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false); // Close modal after export
  };

  const handleExportDataWithAnalytics = () => {
    // Filter trades by the selected export date range
    const filteredTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const startDate = new Date(exportDateRange.start);
      const endDate = new Date(exportDateRange.end);
      return tradeDate >= startDate && tradeDate <= endDate;
    });

    // 3. Generate analytical insights for PDF (with error handling)
    let analytics: any = undefined;
    try {
      // Limit dataset size for analytics to prevent performance issues
      const maxTradesForAnalytics = 1000;
      const tradesForAnalytics = filteredTrades.length > maxTradesForAnalytics 
        ? filteredTrades.slice(-maxTradesForAnalytics) 
        : filteredTrades;
      
      if (tradesForAnalytics.length < 10) {
        console.warn('Insufficient data for analytics (need at least 10 trades)');
      } else {
        const { discoverEdges } = require('./utils/edgeDiscovery');
        const { analyzeTimePatterns } = require('./utils/patternRecognition');
        const { calculateKellyCriterion } = require('./utils/kellyCriterion');

        analytics = {
          edgeDiscovery: discoverEdges(tradesForAnalytics),
          patternAnalysis: analyzeTimePatterns(tradesForAnalytics),
          kellyCriterion: calculateKellyCriterion(tradesForAnalytics),
        };
      }
    } catch (analyticsError) {
      console.warn('Analytics calculation failed, generating report without analytics:', analyticsError);
      // Continue without analytics rather than failing completely
    }

    const dataToExport = {
      trades: filteredTrades,
      tagGroups,
      playbookEntries,
      analytics: analytics,
      exportSettings: {
        dateRange: exportDateRange,
        dateMode: exportDateMode,
        totalTrades: filteredTrades.length,
        exportTimestamp: new Date().toISOString(),
      }
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-edge-analytics-export-${exportDateRange.start}-to-${exportDateRange.end}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportError(null);
    
    try {
      // Filter trades by the selected export date range
      const filteredTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        const startDate = new Date(exportDateRange.start);
        const endDate = new Date(exportDateRange.end);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
      
      if (filteredTrades.length === 0) {
        throw new Error('No trades found for the selected date range.');
      }
      
      // 1. Define elements to print
      const elementsToPrint = [
        { elementId: 'performance-chart-container', title: 'Performance Chart' },
        { elementId: 'summary-container', title: 'Summary' },
        { elementId: 'tradelog-container', title: 'Trade Log' }
      ];

      // 2. Gather summary stats for the filtered trades
      const summaryFinancials = calculateFinancials(filteredTrades);
      const summaryStats = {
        'Total Trades': summaryFinancials.totalTrades,
        'Net P&L': `$${summaryFinancials.netPnl.toFixed(2)}`,
        'Win Rate': `${summaryFinancials.winRate.toFixed(1)}%`,
        'Profit Factor': summaryFinancials.profitFactor.toFixed(2),
        'Average Win': `$${summaryFinancials.avgWin.toFixed(2)}`,
        'Average Loss': `$${summaryFinancials.avgLoss.toFixed(2)}`,
      };

      // 3. Generate analytical insights for PDF (with error handling)
      let analytics: any = undefined;
      try {
        // Limit dataset size for analytics to prevent performance issues
        const maxTradesForAnalytics = 1000;
        const tradesForAnalytics = filteredTrades.length > maxTradesForAnalytics 
          ? filteredTrades.slice(-maxTradesForAnalytics) 
          : filteredTrades;
        
        if (tradesForAnalytics.length < 10) {
          console.warn('Insufficient data for analytics (need at least 10 trades)');
        } else {
          const { discoverEdges } = require('./utils/edgeDiscovery');
          const { analyzeTimePatterns } = require('./utils/patternRecognition');
          const { calculateKellyCriterion } = require('./utils/kellyCriterion');

          analytics = {
            edgeDiscovery: discoverEdges(tradesForAnalytics),
            patternAnalysis: analyzeTimePatterns(tradesForAnalytics),
            kellyCriterion: calculateKellyCriterion(tradesForAnalytics),
          };
        }
      } catch (analyticsError) {
        console.warn('Analytics calculation failed, generating report without analytics:', analyticsError);
        // Continue without analytics rather than failing completely
      }

      // 4. Set report title and date range
      const reportTitle = 'Trading Performance Report';
      const dateRange = exportDateMode === 'daily' 
          ? { start: exportDateRange.start, end: exportDateRange.start } 
          : exportDateRange;

      // 5. Generate PDF with analytics
      await generatePdfReport(elementsToPrint, summaryStats, reportTitle, dateRange, analytics);
      
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setReportError(error instanceof Error ? error.message : 'Failed to generate PDF report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateBasicReport = async () => {
    setIsGeneratingReport(true);
    setReportError(null);
    
    try {
      // Filter trades by the selected export date range
      const filteredTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        const startDate = new Date(exportDateRange.start);
        const endDate = new Date(exportDateRange.end);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
      
      if (filteredTrades.length === 0) {
        throw new Error('No trades found for the selected date range.');
      }
      
      // 1. Define elements to print
      const elementsToPrint = [
        { elementId: 'performance-chart-container', title: 'Performance Chart' },
        { elementId: 'summary-container', title: 'Summary' },
        { elementId: 'tradelog-container', title: 'Trade Log' }
      ];

      // 2. Gather summary stats for the filtered trades
      const summaryFinancials = calculateFinancials(filteredTrades);
      const summaryStats = {
        'Total Trades': summaryFinancials.totalTrades,
        'Net P&L': `$${summaryFinancials.netPnl.toFixed(2)}`,
        'Win Rate': `${summaryFinancials.winRate.toFixed(1)}%`,
        'Profit Factor': summaryFinancials.profitFactor.toFixed(2),
        'Average Win': `$${summaryFinancials.avgWin.toFixed(2)}`,
        'Average Loss': `$${summaryFinancials.avgLoss.toFixed(2)}`,
      };

      // 3. Set report title and date range
      const reportTitle = 'Trading Performance Report';
      const dateRange = exportDateMode === 'daily' 
          ? { start: exportDateRange.start, end: exportDateRange.start } 
          : exportDateRange;

      // 4. Generate PDF without analytics
      await generatePdfReport(elementsToPrint, summaryStats, reportTitle, dateRange);
      
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setReportError(error instanceof Error ? error.message : 'Failed to generate PDF report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAddPlaybookEntry = (entry: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: PlaybookEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setPlaybookEntries(prev => [...prev, newEntry]);
    setIsPlaybookModalOpen(false);
  };

  const handleUpdatePlaybookEntry = (entry: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedPlaybookEntry) return;
    setPlaybookEntries(prev => prev.map(e => 
      e.id === selectedPlaybookEntry.id ? { 
        ...entry,
        id: selectedPlaybookEntry.id,
        createdAt: selectedPlaybookEntry.createdAt,
        updatedAt: new Date().toISOString()
      } : e
    ));
    setIsPlaybookModalOpen(false);
    setSelectedPlaybookEntry(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Reflection Edge</h1>
        </header>
        <div className="flex space-x-1">
          <Button
            onClick={() => setIsPlaybookModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<DocumentTextIcon className="w-4 h-4"/>}
          >
            Playbook
          </Button>
          <Button
            onClick={() => setIsTagManagerModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<TagIcon className="w-4 h-4"/>}
          >
            Tags
          </Button>
          <Button
            onClick={() => setIsPatternAnalysisModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<ChartBarIcon className="w-4 h-4"/>}
          >
            Patterns
          </Button>
          <Button
            onClick={() => setIsPatternInsightsModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<LightBulbIcon className="w-4 h-4"/>}
          >
            Insights
          </Button>
          <Button
            onClick={() => setIsEdgeDiscoveryModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<LightBulbIcon className="w-4 h-4" />}
          >
            Edge
          </Button>
          <Button
            onClick={() => setIsMonkeyBrainSuppressorOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<BrainIcon className="w-4 h-4"/>}
          >
            MBS
          </Button>
          <Button
            onClick={() => setIsKellyCriterionModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<CalculatorIcon className="w-4 h-4"/>}
          >
            Kelly
          </Button>
          <Button
            onClick={openTradeForm}
            variant="primary"
            size="sm"
            leftIcon={<PlusCircleIcon className="w-4 h-4"/>}
          >
            Add Trade
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            size="sm"
            leftIcon={<DocumentArrowUpIcon className="w-4 h-4"/>}
          >
            Import
          </Button>
          <Button
            onClick={() => setIsExportModalOpen(true)}
            variant="secondary"
            className="bg-blue-500 hover:bg-blue-600"
            size="sm"
            leftIcon={<DocumentTextIcon className="w-4 h-4"/>}
          >
            Export
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <Button
            onClick={() => setIsSettingsModalOpen(true)}
            variant="ghost"
            size="sm"
            leftIcon={<CogIcon className="w-4 h-4"/>}
          >
            Settings
          </Button>
        </div>

        {isTradeFormModalOpen && (
          <Modal title={editingTrade ? "Edit Trade" : "Add Trade"} onClose={() => { setIsTradeFormModalOpen(false); setEditingTrade(null); }}>
            <TradeForm 
              onSubmit={editingTrade 
                ? handleUpdateTrade 
                : handleAddTrade} 
              tagGroups={tagGroups} 
              playbookEntries={playbookEntries}
              tradeToEdit={editingTrade || undefined} 
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
              onDeleteGroup={handleDeleteTagGroup}
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

        {isPlaybookModalOpen && (
          <Modal title="Trading Playbook" onClose={() => { setIsPlaybookModalOpen(false); setSelectedPlaybookEntry(null); }}>
            {selectedPlaybookEntry ? (
              <PlaybookEditor
                entry={selectedPlaybookEntry}
                tagGroups={tagGroups}
                onSave={selectedPlaybookEntry.id ? handleUpdatePlaybookEntry : handleAddPlaybookEntry}
                onCancel={() => setSelectedPlaybookEntry(null)}
              />
            ) : (
              <PlaybookList
                entries={playbookEntries}
                onSelect={setSelectedPlaybookEntry}
                onAdd={() => setSelectedPlaybookEntry({} as PlaybookEntry)}
              />
            )}
          </Modal>
        )}

        {isPatternAnalysisModalOpen && (
          <Modal title="Pattern Analysis" onClose={() => setIsPatternAnalysisModalOpen(false)} wide={true}>
            <PatternAnalysisDashboard trades={trades} />
          </Modal>
        )}

        {isPatternInsightsModalOpen && (
          <Modal title="Pattern Insights" onClose={() => setIsPatternInsightsModalOpen(false)} wide={true}>
            <PatternInsights trades={trades} />
          </Modal>
        )}

        {isEdgeDiscoveryModalOpen && (
          <Modal title="Edge Discovery Dashboard" onClose={() => setIsEdgeDiscoveryModalOpen(false)} wide={true}>
            <EdgeDiscoveryDashboard trades={trades} />
          </Modal>
        )}

        {isMonkeyBrainSuppressorOpen && (
          <Modal title="Monkey Brain Suppressor" onClose={() => setIsMonkeyBrainSuppressorOpen(false)}>
            <MonkeyBrainSuppressor onClose={() => setIsMonkeyBrainSuppressorOpen(false)} />
          </Modal>
        )}

        {isKellyCriterionModalOpen && (
          <Modal title="Kelly Criterion Analysis" onClose={() => setIsKellyCriterionModalOpen(false)} wide={true}>
            <KellyCriterionAnalysis trades={trades} tagGroups={tagGroups} />
          </Modal>
        )}

        {isExportModalOpen && (
          <Modal title="Export Data & Reports" onClose={() => setIsExportModalOpen(false)}>
            <div className="space-y-6">
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
                          onChange={(e) => setExportDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                        />
                      </div>
                      <div>
                        <label htmlFor="export-end-date" className="block text-sm font-medium text-gray-300 mb-1">End Date:</label>
                        <input
                          type="date"
                          id="export-end-date"
                          value={exportDateRange.end}
                          onChange={(e) => setExportDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Report Generation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Generate PDF Report</h3>
                {reportError && (
                  <div className="mb-3 p-3 bg-red-900 border border-red-700 rounded-lg">
                    <p className="text-red-200 text-sm">{reportError}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateBasicReport}
                    variant="primary"
                    className="w-full bg-green-600 hover:bg-green-700"
                    leftIcon={<DocumentTextIcon className="w-5 h-5"/>}
                    disabled={isGeneratingReport}
                  >
                    {isGeneratingReport ? 'Generating...' : 'Generate Basic Report'}
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    variant="secondary"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    leftIcon={<DocumentTextIcon className="w-5 h-5"/>}
                    disabled={isGeneratingReport}
                  >
                    {isGeneratingReport ? 'Generating with Analytics...' : 'Generate Report with Analytics'}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Generates a PDF using the date range selected above. Analytics version includes Edge Discovery, Pattern Analysis, and Kelly Criterion insights.
                </p>
                {isGeneratingReport && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ Analytics calculation may take a few seconds for large datasets...
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
              <h2 className="text-2xl font-semibold mb-4 text-pink-400 flex items-center"><TableCellsIcon className="w-6 h-6 mr-2" />Summary</h2>
              
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
            
            <TagPerformance 
              trades={trades} 
              tagGroups={tagGroups} 
              chartDateRange={chartDateRange} 
              directionFilter={directionFilter} 
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div id="performance-chart-container" className="bg-gray-800 p-6 rounded-xl shadow-2xl min-h-[400px]">
               <h2 className="text-2xl font-semibold mb-4 text-green-400 flex items-center"><ChartBarIcon className="w-6 h-6 mr-2" />Performance Chart</h2>
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
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 flex items-center">
                <TableCellsIcon className="w-6 h-6 mr-2" /> Trade Log
              </h2>
              <TradeList 
                trades={trades} 
                tagGroups={tagGroups}
                playbookEntries={playbookEntries}
                onDeleteTrade={handleDeleteTrade} 
                onEditTrade={handleEditTrade}
                onTradeTagChange={handleTradeTagChange}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
