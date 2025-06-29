import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Trade, TagGroup, SubTag, ChartYAxisMetric, ChartXAxisMetric, AppDateRange, TradeDirectionFilterSelection, PlaybookEntry, Profile, TagCategory } from './types';
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
import { ExecutionDashboard } from './components/analysis/ExecutionDashboard';
import { DEFAULT_CHART_COLOR, COMPARISON_CHART_COLOR, LONG_TRADE_COLOR, SHORT_TRADE_COLOR, DEFAULT_TAG_GROUPS, DEFAULT_PLAYBOOK_ENTRIES } from './constants';
import { processChartData, filterTradesByDateAndTags } from './utils/chartDataProcessor';
import { parseCSVToTrades as parseBrokerExportCSV } from './utils/csvImporter';
import { parseQuantowerCSVToTrades } from './utils/quantowerCsvImporter';
import { getRandomColor, resetColorUsage } from './utils/colorGenerator';
import { PlusCircleIcon, ChartBarIcon, TagIcon, TableCellsIcon, DocumentTextIcon, AdjustmentsHorizontalIcon, DocumentArrowUpIcon, CogIcon, AcademicCapIcon, LightBulbIcon, BrainIcon, CalculatorIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon, ArrowTrendingUpIcon, ImportIcon, ExportIcon, DashboardIcon } from './components/ui/Icons';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { NotificationPopup } from './components/ui/NotificationPopup';
import { PlaybookList } from './components/playbook/PlaybookList';
import { PlaybookEditor } from './components/playbook/PlaybookEditor';
import { validateFileUpload, safeJsonParse, rateLimiter, generateSecureId, sanitizeString, validateDateString, SECURITY_CONFIG } from './utils/security';
import { SecureStorage, StoredData } from './utils/secureStorage';
import { generatePdfReport } from './utils/pdfGenerator';
import { calculateFinancials } from './utils/financialCalculations';
import { LegalDisclaimer, FooterDisclaimer } from './components/ui/LegalDisclaimer';
import { calculateGrade } from './utils/grading';
import { sampleTrades } from './sampleTrades';
import { TradeDetailsView } from './components/trades/TradeDetailsView';
import { MBSStartSession } from './components/MBSStartSession';
import { MBSSessionGoal } from './components/MBSSessionGoal';
import { MBSPreTradingChecklist } from './components/MBSPreTradingChecklist';
import { MBSTradingPanel } from './components/MBSTradingPanel';
import { MBSPostSessionReview } from './components/MBSPostSessionReview';
import { BestWorstAnalysis } from './components/analysis/BestWorstAnalysis';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import PlaybookPage from './pages/PlaybookPage';
import TagsPage from './pages/TagsPage';
import PatternsPage from './pages/PatternsPage';
import InsightsPage from './pages/InsightsPage';
import EdgePage from './pages/EdgePage';
import ImportTradePickerModal from './components/trades/ImportTradePickerModal';
import KellyPage from './pages/KellyPage';
import ExecutionPage from './pages/ExecutionPage';
import BestWorstPage from './pages/BestWorstPage';
import ExportPage from './pages/ExportPage';
import SettingsPage from './pages/SettingsPage';

// Helper to normalize CSV headers for detection
const normalizeHeader = (header: string): string => header.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');

// Add custom ChevronLeft and ChevronRight icons if not available
const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
);
const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
);

const App: React.FC = () => {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(DEFAULT_TAG_GROUPS);
  const [playbookEntries, setPlaybookEntries] = useState<PlaybookEntry[]>([]);

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
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);
  
  // Advanced tagging system state
  const [selectedAdvancedTags, setSelectedAdvancedTags] = useState<{ [category: string]: { [groupId: string]: string[] } }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for settings modal and notification
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [importNotification, setImportNotification] = useState<{ title: string; message: string; details?: string } | null>(null);
  const [sessionImportCount, setSessionImportCount] = useState(0);

  const [isPlaybookModalOpen, setIsPlaybookModalOpen] = useState(false);
  const [selectedPlaybookEntry, setSelectedPlaybookEntry] = useState<PlaybookEntry | null>(null);
  const [isAddingPlaybook, setIsAddingPlaybook] = useState(false);
  const [isEditingPlaybook, setIsEditingPlaybook] = useState(false);

  // Pattern analysis state
  const [isPatternAnalysisModalOpen, setIsPatternAnalysisModalOpen] = useState(false);
  const [isPatternInsightsModalOpen, setIsPatternInsightsModalOpen] = useState(false);

  // Edge Discovery analysis state
  const [isEdgeDiscoveryModalOpen, setIsEdgeDiscoveryModalOpen] = useState(false);

  const [isExecutionDashboardModalOpen, setIsExecutionDashboardModalOpen] = useState(false);

  // Kelly Criterion analysis state
  const [isKellyCriterionModalOpen, setIsKellyCriterionModalOpen] = useState(false);

  // Best & Worst analysis state
  const [isBestWorstModalOpen, setIsBestWorstModalOpen] = useState(false);

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<AppDateRange>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [exportDateMode, setExportDateMode] = useState<'daily' | 'range'>('daily');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Legal disclaimer state
  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState(false);
  const [hasSeenLegalDisclaimer, setHasSeenLegalDisclaimer] = useState(false);

  const [activeTab, setActiveTab] = useState<'trades' | 'charts' | 'playbook'>('trades');

  const [tradeFiltersOpen, setTradeFiltersOpen] = useState(false);

  const [isMBSModalOpen, setIsMBSModalOpen] = useState(false);
  const [mbsStep, setMbsStep] = useState(1);
  const [mbsMood, setMbsMood] = useState<number | null>(null);
  const [mbsNote, setMbsNote] = useState('');
  const [mbsGoal, setMbsGoal] = useState('');
  const [mbsSessionActive, setMbsSessionActive] = useState(false);
  const [showPostSessionReview, setShowPostSessionReview] = useState(false);
  const [mbsSessionHistory, setMbsSessionHistory] = useState<any[]>([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [pendingImportedTrades, setPendingImportedTrades] = useState<Trade[]>([]);
  const [showImportPicker, setShowImportPicker] = useState(false);

  useEffect(() => {
    const stored = SecureStorage.loadData();
    if (stored && stored.activeProfileId && stored.profileData[stored.activeProfileId]) {
      const activeData = stored.profileData[stored.activeProfileId];
      setActiveProfileId(stored.activeProfileId);
      setProfiles(stored.profiles);
      setTrades(activeData.trades || sampleTrades);
      setTagGroups(activeData.tagGroups || DEFAULT_TAG_GROUPS);
      
      // Merge default playbook entries with stored ones, ensuring defaults are always up-to-date
      const storedPlaybook = activeData.playbookEntries || [];
      const defaultPlaybook = DEFAULT_PLAYBOOK_ENTRIES;
      const defaultIds = new Set(defaultPlaybook.map(p => p.id));

      const customUserStrategies = storedPlaybook.filter(p => !defaultIds.has(p.id));
      
      const mergedPlaybook = [...defaultPlaybook, ...customUserStrategies];
      setPlaybookEntries(mergedPlaybook);

    } else {
      // Create a default profile if none exists
      const newProfileId = `profile_${Date.now()}`;
      const newProfile: Profile = { id: newProfileId, name: 'Main Profile' };
      setActiveProfileId(newProfileId);
      setProfiles([newProfile]);
      setTrades(sampleTrades);
      setPlaybookEntries(DEFAULT_PLAYBOOK_ENTRIES);
    }
  }, []);
  
  const saveData = useCallback(() => {
    if (!activeProfileId) return;

    const dataToSave: StoredData = {
      activeProfileId,
      profiles,
      profileData: {
        ...SecureStorage.loadData()?.profileData,
        [activeProfileId]: {
          trades,
          tagGroups,
          playbookEntries,
        },
      },
      version: '2.0', // Ensure version is set
    };
    SecureStorage.saveData(dataToSave);
  }, [activeProfileId, profiles, trades, tagGroups, playbookEntries]);

  useEffect(() => {
    saveData();
  }, [saveData]);

  // Show legal disclaimer on first visit
  useEffect(() => {
    const hasSeenBefore = localStorage.getItem('reflection-edge-legal-seen');
    if (!hasSeenBefore) { 
      setShowLegalDisclaimer(true);
    }
  }, []);

  const handleLegalDisclaimerClose = () => {
    setShowLegalDisclaimer(false);
    setHasSeenLegalDisclaimer(true);
    localStorage.setItem('reflection-edge-legal-seen', 'true');
  };

  const handleAddTrade = (trade: Omit<Trade, 'id' | 'timeInTrade'>) => {
    const timeInTrade = (new Date(trade.timeOut).getTime() - new Date(trade.timeIn).getTime()) / (1000 * 60); 

    const fullTrade = {
      ...trade, 
      id: generateSecureId(),
      timeInTrade, 
      execution: trade.execution,
      direction: trade.direction || 'long',
      symbol: trade.symbol || '',
      contracts: trade.contracts || 0
    } as Trade;

    const playbookEntry = fullTrade.strategyId ? playbookEntries.find(p => p.id === fullTrade.strategyId) : undefined;
    const grade = calculateGrade(fullTrade, playbookEntry);
    if(fullTrade.execution){
      fullTrade.execution.grade = grade;
    }

    setTrades(prev => [...prev, fullTrade]);
    setIsTradeFormModalOpen(false);
    setEditingTrade(null);
  };

  const handleUpdateTrade = (updatedTrade: Omit<Trade, 'id' | 'timeInTrade'>) => {
    if (!editingTrade) return;
    const timeInTrade = (new Date(updatedTrade.timeOut).getTime() - new Date(updatedTrade.timeIn).getTime()) / (1000 * 60);

    const fullTrade = {
      ...updatedTrade,
      id: editingTrade.id,
      timeInTrade,
      execution: updatedTrade.execution,
      direction: updatedTrade.direction || 'long',
      symbol: updatedTrade.symbol || '',
      contracts: updatedTrade.contracts || 0
    } as Trade;

    const playbookEntry = fullTrade.strategyId ? playbookEntries.find(p => p.id === fullTrade.strategyId) : undefined;
    const grade = calculateGrade(fullTrade, playbookEntry);
    if(fullTrade.execution){
      fullTrade.execution.grade = grade;
    }
    
    setTrades(prev => prev.map(t => t.id === editingTrade.id ? fullTrade : t));
    setIsTradeFormModalOpen(false);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (tradeId: string) => {
    setTrades(prev => prev.filter(t => t.id !== tradeId));
  };

  const handleUpdateTradeFromAnalysis = (updatedTrade: Trade) => {
    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
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

  const handleDeleteTagGroup = (groupId: string) => {
    // Check if this is a default tag group
    if (DEFAULT_TAG_GROUPS.some(group => group.id === groupId)) {
      alert('Cannot delete default tag groups.');
      return;
    }
    setTagGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const handleDeleteSubTag = (groupId: string, subTagId: string) => {
    setTagGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        // Prevent deleting the last subtag if it's a default group
        if (isDefaultGroup(group.id) && group.subtags.length === 1) {
          alert("Cannot delete the last subtag from a default group.");
          return group;
        }
        return { ...group, subtags: group.subtags.filter(st => st.id !== subTagId) };
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

  // Advanced tagging system handlers
  const handleAdvancedTagSelect = (category: TagCategory, groupId: string, tagId: string) => {
    setSelectedAdvancedTags(prev => {
      const newTags = { ...prev };
      
      // Initialize category if it doesn't exist
      if (!newTags[category]) {
        newTags[category] = {};
      }
      
      // Initialize group if it doesn't exist
      if (!newTags[category][groupId]) {
        newTags[category][groupId] = [];
      }
      
      // Toggle tag selection
      const currentTags = newTags[category][groupId];
      const tagIndex = currentTags.indexOf(tagId);
      
      if (tagIndex > -1) {
        // Remove tag if already selected
        currentTags.splice(tagIndex, 1);
        if (currentTags.length === 0) {
          delete newTags[category][groupId];
        }
        if (Object.keys(newTags[category]).length === 0) {
          delete newTags[category];
        }
      } else {
        // Add tag if not selected
        currentTags.push(tagId);
      }
      
      return newTags;
    });
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
            // Support both { trades: [...] } and flat array formats
            if (Array.isArray(jsonData)) {
              // Flat array of trades
              const sanitizedTrades = jsonData.map(trade => ({
                ...trade,
                symbol: sanitizeString(trade.symbol || ''),
                journal: sanitizeString(trade.journal || ''),
                date: validateDateString(trade.date) ? trade.date : new Date().toISOString().split('T')[0]
              }));
              setTrades(sanitizedTrades);
              setImportNotification({
                title: "Import Complete",
                message: `Successfully imported ${sanitizedTrades.length} trades from JSON array.`
              });
              setShowImportConfirmation(true);
              return;
            } else if (jsonData.trades && Array.isArray(jsonData.trades)) {
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

              // Instead of adding directly, show picker modal
              setPendingImportedTrades(sanitizedTrades);
              setShowImportPicker(true);
              event.target.value = '';
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

  const handleDeleteAllData = () => {
    SecureStorage.clearData();
    // Reset state to initial default
    setActiveProfileId(null);
    setProfiles([]);
    setTrades([]);
    setTagGroups(DEFAULT_TAG_GROUPS);
    setPlaybookEntries([]);
    alert("All data has been deleted.");
  };

  // Export feature: download all app data as JSON
  const handleExportData = () => {
    const dataToExport = {
      trades,
      tagGroups,
      playbookEntries,
      version: '2.0',
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reflection_edge_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFilteredData = () => {
    const dataToExport = {
      trades: tradesForSummary,
      tagGroups,
      playbookEntries,
      version: '2.0',
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reflection_edge_filtered_data.json';
    a.click();
    URL.revokeObjectURL(url);
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
    console.log(`Generating report for ${filteredTrades.length} trades.`);

    try {
      // Limit dataset size for analytics to prevent performance issues
      const maxTradesForAnalytics = 1000;
      const tradesForAnalytics = filteredTrades.length > maxTradesForAnalytics 
        ? filteredTrades.slice(-maxTradesForAnalytics) 
        : filteredTrades;
      
      if (tradesForAnalytics.length < 10) {
        console.warn(`Skipping analytics: Not enough trades (${tradesForAnalytics.length}). Minimum required is 10.`);
      } else {
        const { discoverEdges } = require('./utils/edgeDiscovery');
        const { analyzeTimePatterns } = require('./utils/patternRecognition');
        const { calculateKellyCriterion } = require('./utils/kellyCriterion');

        analytics = {
          edgeDiscovery: discoverEdges(tradesForAnalytics),
          patternAnalysis: analyzeTimePatterns(tradesForAnalytics),
          kellyCriterion: calculateKellyCriterion(tradesForAnalytics),
        };
        console.log("Successfully generated analytics data:", analytics);
      }
    } catch (analyticsError) {
      console.error('Analytics calculation failed:', analyticsError);
      setReportError('Could not calculate analytics, but generating basic report. Check console for details.');
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
      console.log(`Generating report for ${filteredTrades.length} trades.`);

      try {
        // Limit dataset size for analytics to prevent performance issues
        const maxTradesForAnalytics = 1000;
        const tradesForAnalytics = filteredTrades.length > maxTradesForAnalytics 
          ? filteredTrades.slice(-maxTradesForAnalytics) 
          : filteredTrades;
        
        if (tradesForAnalytics.length < 10) {
          console.warn(`Skipping analytics: Not enough trades (${tradesForAnalytics.length}). Minimum required is 10.`);
        } else {
          const { discoverEdges } = require('./utils/edgeDiscovery');
          const { analyzeTimePatterns } = require('./utils/patternRecognition');
          const { calculateKellyCriterion } = require('./utils/kellyCriterion');

          analytics = {
            edgeDiscovery: discoverEdges(tradesForAnalytics),
            patternAnalysis: analyzeTimePatterns(tradesForAnalytics),
            kellyCriterion: calculateKellyCriterion(tradesForAnalytics),
          };
          console.log("Successfully generated analytics data:", analytics);
        }
      } catch (analyticsError) {
        console.error('Analytics calculation failed:', analyticsError);
        setReportError('Could not calculate analytics, but generating basic report. Check console for details.');
        // Continue without analytics rather than failing completely
      }

      // 4. Set report title and date range
      const reportTitle = 'Trading Performance Report';
      const dateRange = exportDateMode === 'daily' 
          ? { start: exportDateRange.start, end: exportDateRange.start } 
          : exportDateRange;

      // 5. Generate PDF with analytics
      console.log("Passing analytics to PDF generator:", analytics);
      await generatePdfReport(elementsToPrint, summaryStats, reportTitle, dateRange, analytics);
      
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
    setIsEditingPlaybook(false);
    setSelectedPlaybookEntry(null);
  };

  const handleEditPlaybookEntry = (entry: PlaybookEntry) => {
    setSelectedPlaybookEntry(entry);
    setIsAddingPlaybook(false);
    setIsEditingPlaybook(true);
    setIsPlaybookModalOpen(true);
  };

  const isDefaultGroup = (groupId: string) => {
    return DEFAULT_TAG_GROUPS.some(group => group.id === groupId);
  };

  // Handler for confirming import from picker
  const handleConfirmImportTrades = (selectedTrades: Trade[]) => {
    setTrades(prev => [...prev, ...selectedTrades]);
    setPendingImportedTrades([]);
    setShowImportPicker(false);
    setImportNotification({
      title: 'Import Complete',
      message: `${selectedTrades.length} trades imported successfully!`,
    });
    setShowImportConfirmation(true);
  };

  // Handler for canceling import
  const handleCancelImportTrades = () => {
    setPendingImportedTrades([]);
    setShowImportPicker(false);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-900 text-gray-100">
        {/* Hidden file input for import */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".csv,.json"
          onChange={handleFileUpload}
        />
        {/* Sidebar Navigation */}
        <aside className={`bg-gray-800 flex flex-col justify-between py-6 ${sidebarCollapsed ? 'w-20 px-2' : 'w-64 px-4'} min-h-screen fixed left-0 top-0 z-40 shadow-xl transition-all duration-200`}>
          <div>
            {/* Logo/Title */}
            <div className={`flex items-center mb-6 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <span className="inline-block w-8 h-8 bg-gradient-to-tr from-purple-400 via-pink-400 to-yellow-400 rounded-lg" />
              {!sidebarCollapsed && <span className="text-2xl font-bold tracking-tight ml-3">Reflection Edge</span>}
            </div>
            {/* Divider above Dashboard */}
            <div className="my-2 border-t border-gray-700" />
            {/* Dashboard Link */}
            <nav className="space-y-2">
              <Link to="/" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                <DashboardIcon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
              </Link>
            </nav>
            {/* Divider below Dashboard */}
            <div className="my-2 border-t border-gray-700" />
            {/* Nav Links */}
            <nav className="space-y-2">
              {/* Section 1: Playbook & Tags */}
              <div>
                {!sidebarCollapsed && <div className="uppercase text-xs text-gray-400 font-bold mb-2 tracking-wider">Strategy & Organization</div>}
                <Link to="/playbook" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <DocumentTextIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Playbook</span>}
                </Link>
                <Link to="/tags" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <TagIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Tags</span>}
                </Link>
              </div>
              <div className="my-2 border-t border-gray-700" />
              {/* Section 2: Performance & Analysis */}
              <div>
                {!sidebarCollapsed && <div className="uppercase text-xs text-gray-400 font-bold mb-2 tracking-wider">Performance & Analysis</div>}
                <Link to="/patterns" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <ChartBarIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Patterns</span>}
                </Link>
                <Link to="/insights" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <LightBulbIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Insights</span>}
                </Link>
                <Link to="/edge" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <ArrowTrendingUpIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Edge</span>}
                </Link>
                <Link to="/kelly" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <CalculatorIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Kelly</span>}
                </Link>
                <Link to="/execution" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <BrainIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Execution</span>}
                </Link>
                <Link to="/bestworst" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <span className="text-lg">⭐</span>
                  {!sidebarCollapsed && <span className="ml-3">Best & Worst</span>}
                </Link>
              </div>
              <div className="my-2 border-t border-gray-700" />
              {/* Section 3: MBS */}
              <div>
                {!sidebarCollapsed && <div className="uppercase text-xs text-gray-400 font-bold mb-2 tracking-wider">MBS</div>}
                <button onClick={() => setIsMBSModalOpen(true)} className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <AcademicCapIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">MBS</span>}
                </button>
              </div>
              <div className="my-2 border-t border-gray-700" />
              {/* Section 4: Data & Settings */}
              <div>
                {!sidebarCollapsed && <div className="uppercase text-xs text-gray-400 font-bold mb-2 tracking-wider">Data & Settings</div>}
                <Link to="/export" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <ExportIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Export</span>}
                </Link>
                <Link to="/settings" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
                  <CogIcon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="ml-3">Settings</span>}
                </Link>
              </div>
            </nav>
          </div>
          {/* Collapse/Expand Button at the bottom center */}
          <div className="flex justify-center items-end w-full mt-6">
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="text-gray-400 hover:text-white transition-colors focus:outline-none"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-6 h-6" />
              ) : (
                <ChevronLeft className="w-6 h-6" />
              )}
            </button>
          </div>
        </aside>
        {/* Main Content (shifted right) */}
        <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          <Routes>
            <Route
              path="/playbook"
              element={
                <PlaybookPage
                  playbookEntries={playbookEntries}
                  tagGroups={tagGroups}
                  onAddPlaybookEntry={handleAddPlaybookEntry}
                  onUpdatePlaybookEntry={handleUpdatePlaybookEntry}
                  onEditPlaybookEntry={handleEditPlaybookEntry}
                />
              }
            />
            <Route
              path="/tags"
              element={
                <TagsPage
                  tagGroups={tagGroups}
                  onAddGroup={handleAddTagGroup}
                  onAddSubTag={handleAddSubTag}
                  onUpdateSubTagColor={handleUpdateSubTagColor}
                  onDeleteGroup={handleDeleteTagGroup}
                  onDeleteSubTag={handleDeleteSubTag}
                  onAdvancedTagSelect={handleAdvancedTagSelect}
                  selectedAdvancedTags={selectedAdvancedTags}
                />
              }
            />
            <Route
              path="/patterns"
              element={<PatternsPage trades={trades} />}
            />
            <Route
              path="/insights"
              element={<InsightsPage trades={trades} />}
            />
            <Route
              path="/edge"
              element={<EdgePage trades={trades} tagGroups={tagGroups} />}
            />
            <Route
              path="/kelly"
              element={<KellyPage trades={trades} tagGroups={tagGroups} />}
            />
            <Route
              path="/execution"
              element={<ExecutionPage trades={trades} playbookEntries={playbookEntries} />}
            />
            <Route
              path="/bestworst"
              element={<BestWorstPage trades={trades} onUpdateTrade={handleUpdateTradeFromAnalysis} />}
            />
            <Route
              path="/export"
              element={
                <ExportPage
                  exportDateRange={exportDateRange}
                  setExportDateRange={setExportDateRange}
                  exportDateMode={exportDateMode}
                  setExportDateMode={setExportDateMode}
                  isGeneratingReport={isGeneratingReport}
                  reportError={reportError}
                  handleGenerateReport={handleGenerateReport}
                  handleExportDataWithAnalytics={handleExportDataWithAnalytics}
                  handleExportFilteredData={handleExportFilteredData}
                  handleExportData={handleExportData}
                  baseTradesForChart={baseTradesForChart}
                  trades={trades}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  handleExportData={handleExportData}
                  handleExportFilteredData={handleExportFilteredData}
                  triggerFileInput={triggerFileInput}
                  handleDeleteAllData={handleDeleteAllData}
                />
              }
            />
            {/* Default route: main dashboard */}
            <Route
              path="/"
              element={
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
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
                          onSubmit={editingTrade ? handleUpdateTrade : handleAddTrade}
                          tagGroups={tagGroups} 
                          playbookEntries={playbookEntries}
                          tradeToEdit={editingTrade || undefined} 
                        />
                      </Modal>
                    )}

                    {isSettingsModalOpen && (
                      <Modal title="Settings" onClose={() => setIsSettingsModalOpen(false)} size="large">
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-200">Data Management</h4>
                          <div className="flex space-x-2">
                            <Button onClick={handleExportData} variant="secondary">
                              Export All Data
                            </Button>
                            <Button onClick={handleExportFilteredData} variant="secondary">
                              Export Filtered Data
                            </Button>
                          </div>
                          <p className="text-sm text-gray-400">Export your trade data to a JSON file.</p>

                          <div className="border-t border-gray-700 pt-4">
                            <h4 className="text-lg font-semibold text-gray-200">Import Data</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              Import trades from a JSON backup, or from a CSV export from your broker.
                            </p>
                            <div className="mt-2">
                              <Button onClick={triggerFileInput} variant="secondary">
                                Import from File
                              </Button>
                            </div>
                          </div>

                          <div className="border-t border-gray-700 pt-4">
                            <h4 className="text-lg font-semibold text-red-400">Danger Zone</h4>
                            <Button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                                  handleDeleteAllData();
                                }
                              }}
                              variant="danger"
                            >
                              Delete All Data
                            </Button>
                            <p className="text-sm text-gray-400 mt-1">This will permanently delete all trades, tags, and settings.</p>
                          </div>
                        </div>
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
                      </Modal>
                    )}
                  
                    {isMBSModalOpen && (
                      <>
                        {mbsStep === 1 && (
                          <MBSStartSession
                            isOpen={isMBSModalOpen}
                            onClose={() => { setIsMBSModalOpen(false); setMbsStep(1); }}
                            onContinue={(mood, note) => {
                              setMbsMood(mood);
                              setMbsNote(note);
                              setMbsStep(2);
                            }}
                          />
                        )}
                        {mbsStep === 2 && (
                          <MBSSessionGoal
                            isOpen={isMBSModalOpen}
                            onClose={() => { setIsMBSModalOpen(false); setMbsStep(1); }}
                            onBack={() => setMbsStep(1)}
                            onContinue={goal => {
                              setMbsGoal(goal);
                              setMbsStep(3);
                            }}
                            initialGoal={mbsGoal}
                          />
                        )}
                        {mbsStep === 3 && (
                          <MBSPreTradingChecklist
                            isOpen={isMBSModalOpen}
                            onClose={() => { setIsMBSModalOpen(false); setMbsStep(1); }}
                            onBack={() => setMbsStep(2)}
                            onBeginTrading={() => {
                              setIsMBSModalOpen(false);
                              setMbsStep(1);
                              setMbsSessionActive(true); // session is now active
                            }}
                            sessionGoal={mbsGoal}
                          />
                        )}
                      </>
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
                          {activeTab === 'trades' && (
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
                          )}
                          {activeTab === 'charts' && (
                            <div className="space-y-4">
                              {/* Additional content for charts tab */}
                            </div>
                          )}
                        </div>
                      </div>
                    </main>
                      
                    {/* Legal Disclaimer Footer */}
                    <FooterDisclaimer />
                    
                    {/* Compact Legal Disclaimer and Legal Button */}
                    <div className="mt-6 flex flex-col items-center space-y-4">
                      <LegalDisclaimer variant="compact" />
                      <Button
                        onClick={() => setShowLegalDisclaimer(true)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<DocumentTextIcon className="w-4 h-4"/>}
                        className="text-gray-400 hover:text-gray-200"
                      >
                        View Full Legal Disclaimers
                      </Button>
                    </div>

                    {viewingTrade && (
                      <Modal title="Trade Details" onClose={handleCloseTradeDetails} size="large">
                        <TradeDetailsView trade={viewingTrade} playbookEntries={playbookEntries} />
                      </Modal>
                    )}

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

                    {mbsSessionActive && (
                      <MBSTradingPanel
                        isOpen={mbsSessionActive}
                        sessionGoal={mbsGoal}
                        onEndSession={(sessionTrades: any[]) => {
                          setMbsSessionActive(false);
                          setShowPostSessionReview(true);
                          setMbsSessionHistory(sessionTrades);
                        }}
                      />
                    )}

                    {showPostSessionReview && (
                      <MBSPostSessionReview
                        isOpen={showPostSessionReview}
                        onClose={() => setShowPostSessionReview(false)}
                        sessionGoal={mbsGoal}
                        tradeHistory={mbsSessionHistory}
                        onSetNextSessionGoal={goal => setMbsGoal(goal)}
                      />
                    )}

                    {showImportPicker && pendingImportedTrades.length > 0 && (
                      <ImportTradePickerModal
                        trades={pendingImportedTrades}
                        onConfirm={handleConfirmImportTrades}
                        onCancel={handleCancelImportTrades}
                      />
                    )}
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          {showImportPicker && pendingImportedTrades.length > 0 && (
            <ImportTradePickerModal
              trades={pendingImportedTrades}
              onConfirm={handleConfirmImportTrades}
              onCancel={handleCancelImportTrades}
            />
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
