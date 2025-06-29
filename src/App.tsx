import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trade, TagGroup, PlaybookEntry, Profile } from './types';
import { DEFAULT_TAG_GROUPS, DEFAULT_PLAYBOOK_ENTRIES } from './constants';
import { parseCSVToTrades as parseBrokerExportCSV } from './utils/csvImporter';
import { parseQuantowerCSVToTrades } from './utils/quantowerCsvImporter';
import { validateFileUpload, safeJsonParse, rateLimiter } from './utils/security';
import { SecureStorage, StoredData } from './utils/secureStorage';
import { sampleTrades } from './sampleTrades';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Modal } from './components/ui/Modal';
import { NotificationPopup } from './components/ui/NotificationPopup';
import { LegalDisclaimer } from './components/ui/LegalDisclaimer';
import Sidebar from './components/ui/Sidebar';
import ImportTradePickerModal from './components/trades/ImportTradePickerModal';
import { MBSStartSession } from './components/MBSStartSession';
import { MBSSessionGoal } from './components/MBSSessionGoal';
import { MBSPreTradingChecklist } from './components/MBSPreTradingChecklist';
import { MBSTradingPanel } from './components/MBSTradingPanel';
import { MBSPostSessionReview } from './components/MBSPostSessionReview';
import DashboardPage from './pages/DashboardPage';
import PlaybookPage from './pages/PlaybookPage';
import TagsPage from './pages/TagsPage';
import PatternsPage from './pages/PatternsPage';
import InsightsPage from './pages/InsightsPage';
import EdgePage from './pages/EdgePage';
import KellyPage from './pages/KellyPage';
import ExecutionPage from './pages/ExecutionPage';
import BestWorstPage from './pages/BestWorstPage';
import ExportPage from './pages/ExportPage';
import SettingsPage from './pages/SettingsPage';

// Helper to normalize CSV headers for detection
const normalizeHeader = (header: string): string => header.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');

const App: React.FC = () => {
  // Global state
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(DEFAULT_TAG_GROUPS);
  const [playbookEntries, setPlaybookEntries] = useState<PlaybookEntry[]>([]);

  // Import state
  const [pendingImportedTrades, setPendingImportedTrades] = useState<Trade[]>([]);
  const [showImportPicker, setShowImportPicker] = useState(false);
  const [importNotification, setImportNotification] = useState<{ title: string; message: string; details?: string } | null>(null);

  // Legal disclaimer state
  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState(false);
  const [hasSeenLegalDisclaimer, setHasSeenLegalDisclaimer] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // MBS state
  const [isMBSModalOpen, setIsMBSModalOpen] = useState(false);
  const [mbsStep, setMbsStep] = useState(1);
  const [mbsMood, setMbsMood] = useState<number | null>(null);
  const [mbsNote, setMbsNote] = useState('');
  const [mbsGoal, setMbsGoal] = useState('');
  const [mbsSessionActive, setMbsSessionActive] = useState(false);
  const [showPostSessionReview, setShowPostSessionReview] = useState(false);
  const [mbsSessionHistory, setMbsSessionHistory] = useState<any[]>([]);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    const stored = SecureStorage.loadData();
    if (stored && stored.activeProfileId && stored.profileData[stored.activeProfileId]) {
      const activeData = stored.profileData[stored.activeProfileId];
      setActiveProfileId(stored.activeProfileId);
      setProfiles(stored.profiles);
      setTrades(activeData.trades || sampleTrades);
      setTagGroups(activeData.tagGroups || DEFAULT_TAG_GROUPS);
      
      // Merge default playbook entries with stored ones
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

    // Check if user has seen legal disclaimer
    const hasSeen = localStorage.getItem('hasSeenLegalDisclaimer');
    if (!hasSeen) {
      setShowLegalDisclaimer(true);
    }
  }, []);

  // Save data when it changes
  const saveData = useCallback(() => {
    if (!activeProfileId) return;

    const dataToSave: StoredData = {
      version: '1.0.0',
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
    };

    SecureStorage.saveData(dataToSave);
  }, [activeProfileId, profiles, trades, tagGroups, playbookEntries]);

  useEffect(() => {
    saveData();
  }, [saveData]);

  // Legal disclaimer handlers
  const handleLegalDisclaimerClose = () => {
    if (!hasSeenLegalDisclaimer) return; // Prevent closing unless acknowledged
    setShowLegalDisclaimer(false);
    setHasSeenLegalDisclaimer(true);
    localStorage.setItem('hasSeenLegalDisclaimer', 'true');
  };

  // File upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Security validation
    if (!validateFileUpload(file)) {
      setImportNotification({
        title: 'Security Error',
        message: 'File upload rejected for security reasons.',
        details: 'Please ensure the file is a valid CSV or JSON file under 10MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedTrades: Trade[] = [];

        if (file.name.toLowerCase().endsWith('.csv')) {
          // Try to detect CSV format
          const lines = content.split('\n');
          const headers = lines[0]?.split(',').map(h => normalizeHeader(h.trim())) || [];
          
          if (headers.includes('date') && headers.includes('symbol') && headers.includes('profit')) {
            // Standard broker export format
            const result = parseBrokerExportCSV(content, tagGroups);
            importedTrades = result.successfulTrades.map(trade => ({
              ...trade,
              id: Date.now().toString(),
              timeInTrade: Math.round((new Date(trade.timeOut).getTime() - new Date(trade.timeIn).getTime()) / (1000 * 60))
            })) || [];
          } else if (headers.includes('date') && headers.includes('symbol') && headers.includes('pnl')) {
            // Quantower format
            const result = parseQuantowerCSVToTrades(content);
            importedTrades = result.successfulTrades.map(trade => ({
              ...trade,
              id: Date.now().toString(),
              timeInTrade: Math.round((new Date(trade.timeOut).getTime() - new Date(trade.timeIn).getTime()) / (1000 * 60))
            })) || [];
          } else {
            throw new Error('Unrecognized CSV format. Please ensure the file has columns for date, symbol, and profit/pnl.');
          }
        } else if (file.name.toLowerCase().endsWith('.json')) {
          const parsed = safeJsonParse(content);
          if (Array.isArray(parsed)) {
            importedTrades = parsed.filter(trade => 
              trade && typeof trade === 'object' && 
              'id' in trade && 'date' in trade && 'symbol' in trade
            );
          } else {
            throw new Error('Invalid JSON format. Expected an array of trade objects.');
          }
        } else {
          throw new Error('Unsupported file format. Please use CSV or JSON files.');
        }

        if (importedTrades.length === 0) {
          setImportNotification({
            title: 'No Trades Found',
            message: 'No valid trades were found in the uploaded file.',
            details: 'Please ensure the file contains properly formatted trade data.'
          });
          return;
        }

        // Rate limiting check
        if (!rateLimiter.isAllowed('import')) {
          setImportNotification({
            title: 'Rate Limit Exceeded',
            message: 'Too many import attempts. Please wait before trying again.',
            details: 'Import limit: 10 attempts per minute.'
          });
          return;
        }

        // Show import picker
        setPendingImportedTrades(importedTrades);
        setShowImportPicker(true);

        setImportNotification({
          title: 'Import Successful',
          message: `${importedTrades.length} trades found in file.`,
          details: 'Please review and select which trades to import.'
        });

      } catch (error) {
        console.error('Import error:', error);
        setImportNotification({
          title: 'Import Failed',
          message: error instanceof Error ? error.message : 'Unknown error occurred during import.',
          details: 'Please check the file format and try again.'
        });
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmImportTrades = (selectedTrades: Trade[]) => {
    setTrades(prev => [...prev, ...selectedTrades]);
    setPendingImportedTrades([]);
    setShowImportPicker(false);
    
    setImportNotification({
      title: 'Import Complete',
      message: `${selectedTrades.length} trades imported successfully.`,
      details: `Total trades: ${trades.length + selectedTrades.length}`
    });
  };

  const handleCancelImportTrades = () => {
    setPendingImportedTrades([]);
    setShowImportPicker(false);
  };

  const handleMBSClick = () => {
    setIsMBSModalOpen(true);
  };

  const handleShowLegalDisclaimer = () => {
    setShowLegalDisclaimer(true);
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
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onImportClick={triggerFileInput}
          onMBSClick={handleMBSClick}
        />

        {/* Main Content */}
        <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  initialTrades={trades}
                  initialTagGroups={tagGroups}
                  initialPlaybookEntries={playbookEntries}
                  onShowLegalDisclaimer={handleShowLegalDisclaimer}
                />
              }
            />
            <Route
              path="/playbook"
              element={
                <PlaybookPage
                  initialPlaybookEntries={playbookEntries}
                  tagGroups={tagGroups}
                />
              }
            />
            <Route
              path="/tags"
              element={
                <TagsPage
                  initialTagGroups={tagGroups}
                />
              }
            />
            <Route
              path="/patterns"
              element={<PatternsPage initialTrades={trades} />}
            />
            <Route
              path="/insights"
              element={<InsightsPage initialTrades={trades} />}
            />
            <Route
              path="/edge"
              element={<EdgePage initialTrades={trades} initialTagGroups={tagGroups} />}
            />
            <Route
              path="/kelly"
              element={<KellyPage initialTrades={trades} initialTagGroups={tagGroups} />}
            />
            <Route
              path="/execution"
              element={<ExecutionPage initialTrades={trades} initialPlaybookEntries={playbookEntries} />}
            />
            <Route
              path="/bestworst"
              element={<BestWorstPage initialTrades={trades} />}
            />
            <Route
              path="/export"
              element={<ExportPage initialTrades={trades} />}
            />
            <Route
              path="/settings"
              element={<SettingsPage initialSettings={{}} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Global Import Picker Modal */}
          {showImportPicker && pendingImportedTrades.length > 0 && (
            <ImportTradePickerModal
              trades={pendingImportedTrades}
              onConfirm={handleConfirmImportTrades}
              onCancel={handleCancelImportTrades}
            />
          )}

          {/* MBS Modals */}
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
                    setMbsSessionActive(true);
                  }}
                  sessionGoal={mbsGoal}
                />
              )}
            </>
          )}

          {/* MBS Trading Panel */}
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

          {/* MBS Post Session Review */}
          {showPostSessionReview && (
            <MBSPostSessionReview
              isOpen={showPostSessionReview}
              onClose={() => setShowPostSessionReview(false)}
              sessionGoal={mbsGoal}
              tradeHistory={mbsSessionHistory}
              onSetNextSessionGoal={goal => setMbsGoal(goal)}
            />
          )}

          {/* Global Legal Disclaimer Modal */}
          {showLegalDisclaimer && (
            <Modal title="Legal Disclaimers" onClose={hasSeenLegalDisclaimer ? handleLegalDisclaimerClose : () => {}} size="large">
              <LegalDisclaimer variant="full" />
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={e => setDontShowAgain(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="dontShowAgain" className="text-gray-300">Don't show this again</label>
              </div>
              <button
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                disabled={!dontShowAgain}
                onClick={() => {
                  if (dontShowAgain) {
                    localStorage.setItem('hasSeenLegalDisclaimer', 'true');
                  }
                  setShowLegalDisclaimer(false);
                  setHasSeenLegalDisclaimer(true);
                }}
              >
                I Understand
              </button>
            </Modal>
          )}

          {/* Global Notification Popup */}
          {importNotification && (
            <NotificationPopup
              title={importNotification.title}
              message={importNotification.message}
              details={importNotification.details}
              onClose={() => setImportNotification(null)}
            />
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
