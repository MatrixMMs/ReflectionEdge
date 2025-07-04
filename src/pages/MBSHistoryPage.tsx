import React, { useState, useEffect } from 'react';
import { MBSSession, MBSTradeLog } from '../types';
import { getMBSSessions, deleteMBSSession, getMBSStats, clearMBSHistory } from '../utils/mbsHistory';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TrashIcon, EyeIcon, CalendarIcon, ClockIcon, ChartBarIcon, CustomDetailsIcon, CustomDeleteIcon, CustomWinIcon, CustomPlanIcon, CustomClockIcon, ChartIcon } from '../components/ui/Icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

const moodEmojis = [
  { value: 1, emoji: '😡', label: 'Very Frustrated' },
  { value: 2, emoji: '😞', label: 'Sad' },
  { value: 3, emoji: '🙁', label: 'Disappointed' },
  { value: 4, emoji: '😐', label: 'Neutral' },
  { value: 5, emoji: '🙂', label: 'Content' },
  { value: 6, emoji: '😃', label: 'Happy' },
  { value: 7, emoji: '🤩', label: 'Euphoric' },
];

const moodToEmoji = (mood: number) => {
  const found = moodEmojis.find(e => e.value === mood);
  return found ? found.emoji : '😐';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper for percent change and arrow
const getPercentChange = (current: number, prev: number) => {
  if (prev === 0) return null;
  const change = ((current - prev) / Math.abs(prev)) * 100;
  return change;
};

const ArrowIndicator: React.FC<{ change: number }> = ({ change }) => {
  if (change === 0) return null;
  const isUp = change > 0;
  const color = isUp ? 'text-success' : 'text-error';
  return (
    <span className={`ml-2 font-normal text-base ${color} inline-flex items-baseline`} style={{ fontWeight: 400, lineHeight: '1.5' }}>
      <span className="inline-block relative" style={{ top: '-4px' }}>
        {isUp ? (
          <svg className="inline" width="26" height="20" fill="none" viewBox="0 0 26 20"><path d="M13 18V5M13 5l-7 7M13 5l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg className="inline" width="26" height="20" fill="none" viewBox="0 0 26 20"><path d="M13 4v13M13 17l-7-7M13 17l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </span>
      <span className="ml-0.5 align-baseline">{Math.abs(change).toFixed(1)}%</span>
    </span>
  );
};

type KPICardProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  change?: React.ReactNode;
  changeColor?: string;
};
const KPICard: React.FC<KPICardProps> = ({ icon, label, value, change, changeColor }) => (
  <div className="rounded-lg p-4 border flex flex-col justify-between min-w-[200px]" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-main)' }}>
    <div className="flex items-center gap-2 mb-2">{icon}<span style={{ color: 'var(--text-secondary)' }}>{label}</span></div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold" style={{ color: 'var(--text-white)' }}>{value}</span>
      {change !== undefined && (
        <span className={`text-sm font-normal ${changeColor}`}>{change}</span>
      )}
    </div>
  </div>
);

type SessionCardProps = {
  session: {
    goal: string;
    startTime: string;
    trades: number;
    mood: string;
    planAdherence: number;
    winRate: number;
  };
};
const SessionCard: React.FC<SessionCardProps & { onView: (s: any) => void; onDelete: (s: any, isLive: boolean) => void; isLive?: boolean }> = ({ session, onView, onDelete, isLive }) => {
  // Calculate progress bar widths
  const planAdherenceWidth = Math.max(0, Math.min(100, session.planAdherence));
  const winRateWidth = Math.max(0, Math.min(100, session.winRate));
  return (
    <div
      className="rounded-lg p-4 border flex flex-col mb-4 shadow-sm transition-shadow hover:shadow-lg focus:outline-none focus:ring-2"
      style={{ 
        backgroundColor: 'var(--background-secondary)', 
        borderColor: 'var(--border-main)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
      tabIndex={0}
      aria-label={`Session card for goal: ${session.goal}`}
      role="region"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold" style={{ color: 'var(--text-main)' }}>Goal: {session.goal}</span>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{session.startTime}</span>
      </div>
      <div className="flex items-center gap-6">
        <span style={{ color: 'var(--text-secondary)' }}>Trades: <span style={{ color: 'var(--text-white)' }}>{session.trades}</span></span>
        <span style={{ color: 'var(--text-secondary)' }}>Avg Mood: <span>{session.mood}</span></span>
        <span style={{ color: 'var(--text-secondary)' }} className="flex items-center">Plan Adherence:
          <span className="relative rounded h-3 w-24 inline-block align-middle mx-2 overflow-hidden" style={{ backgroundColor: 'var(--background-tertiary)' }} aria-label="Plan adherence progress bar" role="progressbar" aria-valuenow={planAdherenceWidth} aria-valuemin={0} aria-valuemax={100}>
            <span
              className="absolute left-0 top-0 h-3 rounded transition-all duration-500"
              style={{ width: `${planAdherenceWidth}%`, backgroundColor: 'var(--text-accent)' }}
            />
          </span>
          <span style={{ color: 'var(--text-white)' }} className="ml-1">{session.planAdherence}%</span>
        </span>
        <span style={{ color: 'var(--text-secondary)' }} className="flex items-center">Win Rate:
          <span className="relative rounded h-3 w-24 inline-block align-middle mx-2 overflow-hidden" style={{ backgroundColor: 'var(--background-tertiary)' }} aria-label="Win rate progress bar" role="progressbar" aria-valuenow={winRateWidth} aria-valuemin={0} aria-valuemax={100}>
            <span
              className="absolute left-0 top-0 h-3 rounded transition-all duration-500"
              style={{ width: `${winRateWidth}%`, backgroundColor: 'var(--accent-green)' }}
            />
          </span>
          <span style={{ color: 'var(--text-green)' }} className="ml-1">{session.winRate}%</span>
        </span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" className="p-2" aria-label="View session" tabIndex={0} onClick={() => onView(session)}><CustomDetailsIcon className="w-4 h-4" /></Button>
          <Button size="sm" variant="danger" className="p-2" aria-label="Delete session" tabIndex={0} onClick={() => onDelete(session, !!isLive)}><CustomDeleteIcon className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
};

const mockSessionsToday = [
  { goal: 'Focus on discipline', startTime: '07:49 PM', trades: 5, mood: '🙂', planAdherence: 66.7, winRate: 57.1 },
  { goal: 'Follow the plan', startTime: '10:15 AM', trades: 3, mood: '😃', planAdherence: 100, winRate: 66.7 },
];
const mockSessionsHistory = [
  { date: 'June 30, 2025', sessions: mockSessionsToday },
  { date: 'June 29, 2025', sessions: [ { goal: 'Stay calm', startTime: '09:00 AM', trades: 4, mood: '😐', planAdherence: 75, winRate: 50 } ] },
];

// Synthetic sessions for testing
const syntheticSessions = [
  {
    date: 'June 29, 2025',
    sessions: [
      {
        goal: 'Test discipline', startTime: '09:00 AM', trades: 4, mood: '😐', planAdherence: 75, winRate: 50, pnl: 20.5,
        tradeHistory: [
          { time: '09:01 AM', type: 'Long', result: 'win', followedPlan: true, mood: 4, notes: 'Good entry', reflection: 'Followed plan well.' },
          { time: '09:10 AM', type: 'Short', result: 'lose', followedPlan: false, mood: 2, notes: 'Impulsive', reflection: 'Did not wait for setup.' },
          { time: '09:20 AM', type: 'Long', result: 'win', followedPlan: true, mood: 5, notes: '', reflection: 'Stayed patient.' },
          { time: '09:30 AM', type: 'Short', result: 'lose', followedPlan: true, mood: 3, notes: '', reflection: '' },
        ],
      },
      {
        goal: 'Aggressive entries', startTime: '01:30 PM', trades: 6, mood: '😞', planAdherence: 50, winRate: 33.3, pnl: -61.58,
        tradeHistory: [
          { time: '01:31 PM', type: 'Long', result: 'lose', followedPlan: false, mood: 2, notes: '', reflection: '' },
          { time: '01:40 PM', type: 'Short', result: 'win', followedPlan: true, mood: 4, notes: '', reflection: '' },
          { time: '01:50 PM', type: 'Long', result: 'lose', followedPlan: false, mood: 1, notes: 'Bad mood', reflection: 'Should have stopped.' },
          { time: '02:00 PM', type: 'Short', result: 'lose', followedPlan: true, mood: 3, notes: '', reflection: '' },
          { time: '02:10 PM', type: 'Long', result: 'win', followedPlan: true, mood: 5, notes: '', reflection: '' },
          { time: '02:20 PM', type: 'Short', result: 'lose', followedPlan: false, mood: 2, notes: '', reflection: '' },
        ],
      },
      {
        goal: 'End strong', startTime: '04:00 PM', trades: 5, mood: '🙂', planAdherence: 90, winRate: 80, pnl: 49.87,
        tradeHistory: [
          { time: '04:01 PM', type: 'Long', result: 'win', followedPlan: true, mood: 6, notes: '', reflection: '' },
          { time: '04:10 PM', type: 'Short', result: 'win', followedPlan: true, mood: 6, notes: '', reflection: '' },
          { time: '04:20 PM', type: 'Long', result: 'win', followedPlan: true, mood: 7, notes: '', reflection: '' },
          { time: '04:30 PM', type: 'Short', result: 'lose', followedPlan: false, mood: 3, notes: '', reflection: '' },
          { time: '04:40 PM', type: 'Long', result: 'win', followedPlan: true, mood: 6, notes: '', reflection: '' },
        ],
      },
    ],
  },
  {
    date: 'June 28, 2025',
    sessions: [
      {
        goal: 'Patience focus', startTime: '10:00 AM', trades: 5, mood: '🙂', planAdherence: 80, winRate: 60, pnl: 22.01,
        tradeHistory: [
          { time: '10:01 AM', type: 'Long', result: 'win', followedPlan: true, mood: 5, notes: '', reflection: '' },
          { time: '10:10 AM', type: 'Short', result: 'lose', followedPlan: false, mood: 2, notes: '', reflection: '' },
          { time: '10:20 AM', type: 'Long', result: 'win', followedPlan: true, mood: 6, notes: '', reflection: '' },
          { time: '10:30 AM', type: 'Short', result: 'win', followedPlan: true, mood: 6, notes: '', reflection: '' },
          { time: '10:40 AM', type: 'Long', result: 'lose', followedPlan: false, mood: 3, notes: '', reflection: '' },
        ],
      },
      {
        goal: 'No FOMO', startTime: '12:30 PM', trades: 3, mood: '😃', planAdherence: 100, winRate: 100, pnl: 0.0,
        tradeHistory: [
          { time: '12:31 PM', type: 'Long', result: 'win', followedPlan: true, mood: 7, notes: '', reflection: '' },
          { time: '12:40 PM', type: 'Short', result: 'win', followedPlan: true, mood: 7, notes: '', reflection: '' },
          { time: '12:50 PM', type: 'Long', result: 'win', followedPlan: true, mood: 7, notes: '', reflection: '' },
        ],
      },
      {
        goal: 'Quick scalps', startTime: '03:00 PM', trades: 7, mood: '😡', planAdherence: 30, winRate: 14.3, pnl: -108.67,
        tradeHistory: [
          { time: '03:01 PM', type: 'Long', result: 'lose', followedPlan: false, mood: 1, notes: '', reflection: '' },
          { time: '03:10 PM', type: 'Short', result: 'lose', followedPlan: false, mood: 1, notes: '', reflection: '' },
          { time: '03:20 PM', type: 'Long', result: 'lose', followedPlan: false, mood: 1, notes: '', reflection: '' },
          { time: '03:30 PM', type: 'Short', result: 'win', followedPlan: true, mood: 4, notes: '', reflection: '' },
          { time: '03:40 PM', type: 'Long', result: 'lose', followedPlan: false, mood: 1, notes: '', reflection: '' },
          { time: '03:50 PM', type: 'Short', result: 'lose', followedPlan: false, mood: 1, notes: '', reflection: '' },
          { time: '04:00 PM', type: 'Long', result: 'lose', followedPlan: false, mood: 1, notes: '', reflection: '' },
        ],
      },
    ],
  },
  {
    date: 'June 24, 2025',
    sessions: [
      {
        goal: 'Follow signals', startTime: '11:00 AM', trades: 3, mood: '😃', planAdherence: 100, winRate: 100, pnl: 91.03,
        tradeHistory: [
          { time: '11:01 AM', type: 'Long', result: 'win', followedPlan: true, mood: 7, notes: '', reflection: '' },
          { time: '11:10 AM', type: 'Short', result: 'win', followedPlan: true, mood: 7, notes: '', reflection: '' },
          { time: '11:20 AM', type: 'Long', result: 'win', followedPlan: true, mood: 7, notes: '', reflection: '' },
        ],
      },
      {
        goal: 'No revenge trades', startTime: '03:00 PM', trades: 2, mood: '😡', planAdherence: 0, winRate: 0, pnl: -62.05,
        tradeHistory: [
          { time: '03:01 PM', type: 'Long', result: 'lose', followedPlan: false, mood: 1, notes: '', reflection: '' },
          { time: '03:10 PM', type: 'Short', result: 'lose', followedPlan: false, mood: 1, notes: '', reflection: '' },
        ],
      },
      {
        goal: 'Risk management', startTime: '08:00 AM', trades: 4, mood: '🙂', planAdherence: 75, winRate: 50, pnl: 0.0,
        tradeHistory: [
          { time: '08:01 AM', type: 'Long', result: 'win', followedPlan: true, mood: 5, notes: '', reflection: '' },
          { time: '08:10 AM', type: 'Short', result: 'lose', followedPlan: false, mood: 2, notes: '', reflection: '' },
          { time: '08:20 AM', type: 'Long', result: 'win', followedPlan: true, mood: 6, notes: '', reflection: '' },
          { time: '08:30 AM', type: 'Short', result: 'lose', followedPlan: true, mood: 4, notes: '', reflection: '' },
        ],
      },
    ],
  },
];

// Filter Modal Placeholder
const FilterModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Advanced Filter Modal">
      <div className="p-6 rounded-lg shadow-lg min-w-[300px]" style={{ backgroundColor: 'var(--background-secondary)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-accent)' }}>Advanced Filter (Coming Soon)</h2>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>This will allow you to filter sessions by mood, trade count, and more.</p>
        <button className="px-4 py-2 rounded" style={{ backgroundColor: 'var(--accent-blue)', color: 'var(--text-white)' }} onClick={onClose} aria-label="Close filter modal">Close</button>
      </div>
    </div>
  );
};

// Helper to normalize a session object for display
function normalizeSession(s: any): any {
  if ('sessionGoal' in s) {
    // Live session
    return {
      id: s.id,
      goal: s.sessionGoal,
      startTime: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      trades: s.totalTrades,
      mood: typeof s.avgMood === 'number' ? ['😡','😞','🙁','😐','🙂','😃','🤩'][Math.max(0, Math.min(6, s.avgMood-1))] : '😐',
      planAdherence: s.totalTrades > 0 ? Math.round((s.followedPlanCount / s.totalTrades) * 100) : 0,
      winRate: s.totalTrades > 0 ? ((s.wins / s.totalTrades) * 100).toFixed(1) : 0,
      tradeHistory: s.tradeHistory,
      raw: s,
    };
  } else {
    // Synthetic/mock session
    return {
      ...s,
      id: s.id || undefined,
      tradeHistory: s.tradeHistory,
      raw: s,
    };
  }
}

const MBSHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<MBSSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{ session: any; isLive: boolean } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  // --- LIVE DATA INTEGRATION ---
  // Get live sessions from local storage
  const liveSessions = getMBSSessions();

  // Helper: format date as 'Month DD, YYYY'
  const formatDateHeader = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Group live sessions by date
  const liveGrouped: { date: string; sessions: any[] }[] = [];
  liveSessions.forEach(session => {
    const date = formatDateHeader(session.startTime);
    let group = liveGrouped.find(g => g.date === date);
    if (!group) {
      group = { date, sessions: [] };
      liveGrouped.push(group);
    }
    group.sessions.push({
      goal: session.sessionGoal,
      startTime: new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      trades: session.totalTrades,
      mood: session.avgMood && typeof session.avgMood === 'number' ? ['😡','😞','🙁','😐','🙂','😃','🤩'][Math.max(0, Math.min(6, session.avgMood-1))] : '😐',
      planAdherence: session.totalTrades > 0 ? Math.round((session.followedPlanCount / session.totalTrades) * 100) : 0,
      winRate: session.totalTrades > 0 ? ((session.wins / session.totalTrades) * 100).toFixed(1) : 0,
    });
  });

  // Merge synthetic and live grouped sessions for history
  const allHistory = [
    ...syntheticSessions,
    ...liveGrouped.filter(
      group => !syntheticSessions.some(s => s.date === group.date)
    ),
  ];

  // Helper: parse date string like 'June 29, 2025' to Date object
  const parseDateHeader = (dateStr: string) => new Date(dateStr);

  // --- SEARCH, SORT, FILTER LOGIC ---
  // Today's date string
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Today's sessions: merge live and synthetic for today
  const todayLiveSessions = liveGrouped.find(g => g.date === todayStr)?.sessions || [];
  const todaySessions = [
    ...mockSessionsToday.map(normalizeSession),
    ...liveSessions.filter(s => formatDateHeader(s.startTime) === todayStr).map(normalizeSession),
  ].filter(
    s => (!search || s.goal.toLowerCase().includes(search.toLowerCase()))
  );

  // For full history: filter, search, sort, group by date
  let filteredHistory = allHistory.map(group => ({
    ...group,
    sessions: group.sessions.map(normalizeSession).filter(
      s => !search || s.goal.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(group => group.sessions.length > 0);

  // Sort sessions within each group
  filteredHistory = filteredHistory.map(group => {
    let sortedSessions = [...group.sessions];
    if (sortBy === 'winRate') {
      sortedSessions.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
    } else if (sortBy === 'planAdherence') {
      sortedSessions.sort((a, b) => b.planAdherence - a.planAdherence);
    } else {
      // Default: sort by startTime (assume AM/PM string for mock)
      sortedSessions.sort((a, b) => {
        const parseTime = (t: string) => {
          const [time, ampm] = t.split(' ');
          let [h, m] = time.split(':').map(Number);
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        };
        return parseTime(b.startTime) - parseTime(a.startTime);
      });
    }
    return { ...group, sessions: sortedSessions };
  });

  // Sort date groups in descending order (most recent first)
  filteredHistory.sort((a, b) => parseDateHeader(b.date).getTime() - parseDateHeader(a.date).getTime());

  const stats = getMBSStats(sessions);

  // Compute previous session stats for % change
  const prevSessions = sessions.slice(1, 2); // second most recent session
  const latestSession = sessions[0];
  const prevSession = prevSessions[0];

  let prevWinRate = null, prevPlanAdherence = null, prevAvgDuration = null;
  if (prevSession) {
    prevWinRate = prevSession.totalTrades > 0 ? (prevSession.wins / prevSession.totalTrades) * 100 : 0;
    prevPlanAdherence = prevSession.totalTrades > 0 ? (prevSession.followedPlanCount / prevSession.totalTrades) * 100 : 0;
    // Convert duration to seconds
    const [h, m, s] = prevSession.sessionDuration.split(':').map(Number);
    prevAvgDuration = h * 3600 + m * 60 + s;
  }
  // Current stats (from all sessions)
  const winRate = stats.overallWinRate;
  const planAdherence = stats.planAdherenceRate;
  // Avg duration in seconds
  const [ah, am, as] = stats.avgSessionDuration.split(':').map(Number);
  const avgDurationSec = ah * 3600 + am * 60 + as;

  // Latest session stats for % change (compare latest to previous)
  const winRateChange = prevWinRate !== null ? getPercentChange(winRate, prevWinRate) : null;
  const planAdherenceChange = prevPlanAdherence !== null ? getPercentChange(planAdherence, prevPlanAdherence) : null;
  const avgDurationChange = prevAvgDuration !== null ? getPercentChange(avgDurationSec, prevAvgDuration) : null;

  // Handler for View (Details)
  const handleViewSession = (session: any) => {
    if (session.id && session.raw && session.raw.tradeHistory) {
      setSelectedSession(session.raw);
      setShowSessionDetails(true);
      return;
    }
    if (session.id) {
      const full = getMBSSessions().find(s => s.id === session.id);
      if (full) {
        setSelectedSession(full);
        setShowSessionDetails(true);
        return;
      }
    }
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  // Handler for Delete
  const handleDeleteSession = (session: any, isLive: boolean) => {
    setSessionToDelete({ session, isLive });
    setShowDeleteConfirm(true);
  };

  // Confirm delete logic
  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      if (sessionToDelete.isLive && sessionToDelete.session.id) {
        deleteMBSSession(sessionToDelete.session.id);
        window.location.reload(); // quick way to refresh for now
      } else {
        // For synthetic, just close modal (could remove from UI if needed)
        setShowDeleteConfirm(false);
        setSessionToDelete(null);
      }
    }
  };

  // Handle clear history
  const handleClearHistory = () => {
    clearMBSHistory();
    setShowClearConfirm(false);
    window.location.reload(); // Refresh to reflect changes
  };

  // Helper to check if session is live (has tradeHistory)
  const isLiveSession = (session: any) => Array.isArray(session.tradeHistory);

  // Determine which sessions are currently visible (context-aware)
  const visibleSessions = showFullHistory
    ? filteredHistory.flatMap(g => g.sessions)
    : todaySessions;

  // --- Key Stats Calculation ---
  // For demo, use random/sum P&L for synthetic and 0 for mock
  const getPnl = (session: any) => {
    const val = Number(session.pnl);
    return Number.isFinite(val) ? val : 0;
  };
  const sessionPnls = visibleSessions.map(getPnl);
  const totalPnl = sessionPnls.reduce((a, b) => a + b, 0);
  const avgPnlSession = sessionPnls.length ? totalPnl / sessionPnls.length : 0;
  const totalTrades = visibleSessions.reduce((a, s) => a + (s.trades || 0), 0);
  const avgPnlTrade = totalTrades ? totalPnl / totalTrades : 0;
  const bestSession = sessionPnls.length ? Math.max(...sessionPnls) : 0;
  const worstSession = sessionPnls.length ? Math.min(...sessionPnls) : 0;
  const goalCounts = visibleSessions.reduce((acc, s) => {
    acc[s.goal] = (acc[s.goal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostFrequentGoal = Object.entries(goalCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || '-';

  // --- Chart Data ---
  // P&L Over Time (Equity Curve)
  let cumulative = 0;
  const equityCurve = sessionPnls.map((pnl, i) => {
    cumulative += pnl;
    return { name: `S${i + 1}`, pnl: cumulative };
  });
  // Performance by Goal
  const goalStats: Record<string, { total: number; count: number }> = {};
  visibleSessions.forEach(s => {
    if (!goalStats[s.goal]) goalStats[s.goal] = { total: 0, count: 0 };
    goalStats[s.goal].total += getPnl(s);
    goalStats[s.goal].count += 1;
  });
  const perfByGoal = Object.entries(goalStats).map(([goal, stat]) => ({
    goal,
    avgPnl: stat.count ? stat.total / stat.count : 0,
  }));

  // --- Panel Styles ---
  const panelBg = 'var(--background-main)';

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-white)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header and Top Controls */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>MBS Session History</h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="primary" onClick={() => setShowPerformance(v => !v)} className="flex items-center gap-2">
              <ChartIcon className="w-5 h-5" />
              {showPerformance ? 'Hide Performance Overview' : 'Show Performance Overview'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowClearConfirm(true)}
              disabled={sessions.length === 0}
            >
              Clear History
            </Button>
          </div>
        </div>

        {/* Performance Overview Panel */}
        <div
          className={`overflow-hidden transition-all duration-500 ${showPerformance ? 'max-h-[1000px] opacity-100 my-6' : 'max-h-0 opacity-0 my-0'} rounded-lg border`}
          style={{ backgroundColor: panelBg, borderColor: 'var(--border-main)' }}
          aria-hidden={!showPerformance}
        >
          {showPerformance && (
            <div className="flex flex-col md:flex-row gap-8 p-8">
              {/* Key Stats */}
              <div className="flex-1 min-w-[250px]">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-accent)' }}>Key Stats</h3>
                <div className="space-y-2">
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Net P&amp;L:</span>
                    <span className={`ml-2 text-2xl font-bold ${totalPnl >= 0 ? 'text-success' : 'text-error'}`}>{totalPnl.toFixed(2)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg P&amp;L per Session:</span>
                    <span className="ml-2 text-lg">{avgPnlSession.toFixed(2)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg P&amp;L per Trade:</span>
                    <span className="ml-2 text-lg">{avgPnlTrade.toFixed(2)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Best Session (P&amp;L):</span>
                    <span className="ml-2 text-success">{bestSession.toFixed(2)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Worst Session (P&amp;L):</span>
                    <span className="ml-2 text-error">{worstSession.toFixed(2)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Most Frequent Goal:</span>
                    <span className="ml-2" style={{ color: 'var(--text-accent)' }}>{mostFrequentGoal}</span>
                  </div>
                </div>
              </div>
              {/* Visual Charts */}
              <div className="flex-1 min-w-[300px]">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-accent)' }}>Visual Charts</h3>
                <div className="mb-6">
                  <div style={{ color: 'var(--text-secondary)' }} className="mb-1">P&amp;L Over Time</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={equityCurve} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="pnl" stroke="var(--accent-green)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }} className="mb-1">Performance by Goal</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={perfByGoal} layout="vertical" margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis dataKey="goal" type="category" stroke="var(--text-secondary)" fontSize={12} width={120} />
                      <Tooltip />
                      <Bar dataKey="avgPnl" fill="var(--text-accent)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-main)' }}>
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Total Sessions</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-accent)' }}>{stats.totalSessions}</div>
            </div>
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-main)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CustomWinIcon className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Win Rate</span>
              </div>
              <div className="text-2xl font-bold flex items-baseline" style={{ color: 'var(--text-green)' }}>
                {winRate.toFixed(1)}%
                {winRateChange !== null && <ArrowIndicator change={winRateChange} />}
              </div>
            </div>
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-main)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CustomClockIcon className="w-5 h-5" style={{ color: 'var(--accent-yellow)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Avg Duration</span>
              </div>
              <div className="text-2xl font-bold flex items-baseline" style={{ color: 'var(--accent-yellow)' }}>
                {stats.avgSessionDuration}
                {avgDurationChange !== null && <ArrowIndicator change={avgDurationChange} />}
              </div>
            </div>
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-main)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CustomPlanIcon className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Plan Adherence</span>
              </div>
              <div className="text-2xl font-bold flex items-baseline" style={{ color: 'var(--text-accent)' }}>
                {planAdherence.toFixed(1)}%
                {planAdherenceChange !== null && <ArrowIndicator change={planAdherenceChange} />}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search sessions by goal or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
            style={{ 
              backgroundColor: 'var(--background-secondary)', 
              borderColor: 'var(--border-main)', 
              color: 'var(--text-white)'
            }}
          />
          <div className="flex gap-2 items-center">
            <Button onClick={() => setShowFullHistory(v => !v)}>
              {showFullHistory ? 'Show Today Only' : 'View Full History'}
            </Button>
            {showFullHistory && (
              <>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--background-secondary)', 
                    borderColor: 'var(--border-main)', 
                    color: 'var(--text-white)' 
                  }}
                >
                  <option value="date">Sort by Date</option>
                  <option value="winRate">Sort by Win Rate</option>
                  <option value="planAdherence">Sort by Plan Adherence</option>
                </select>
                <Button variant="secondary" className="ml-2" onClick={() => setFilterOpen(true)}>
                  <span className="material-icons">filter_list</span>
                </Button>
              </>
            )}
          </div>
        </div>
        <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} />

        {/* Main Content Area */}
        <div aria-live="polite">
          {!showFullHistory ? (
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Today's Sessions</h2>
              {todaySessions.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No sessions recorded today. Start a new session to begin.</div>
              ) : (
                todaySessions.map((session, idx) => <SessionCard key={session.id || idx} session={session} onView={handleViewSession} onDelete={handleDeleteSession} isLive={!!session.id} />)
              )}
            </div>
          ) : (
            <div>
              {filteredHistory.map(group => (
                <div key={group.date} className="mb-8">
                  <div className="text-lg font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>{group.date}</div>
                  {group.sessions.map((session, idx) => <SessionCard key={session.id || idx} session={session} onView={handleViewSession} onDelete={handleDeleteSession} isLive={!!session.id} />)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <Modal
          title={<h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Session Details - {selectedSession.goal}</h2>}
          onClose={() => { setShowSessionDetails(false); setSelectedSession(null); }}
          size="large"
        >
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <div><strong>Goal:</strong> {selectedSession.goal}</div>
              <div><strong>Start Time:</strong> {selectedSession.startTime}</div>
              <div><strong>Trades:</strong> {selectedSession.trades}</div>
              <div><strong>Avg Mood:</strong> {selectedSession.mood}</div>
              <div><strong>Plan Adherence:</strong> {selectedSession.planAdherence}%</div>
              <div><strong>Win Rate:</strong> {selectedSession.winRate}%</div>
            </div>
            {isLiveSession(selectedSession) ? (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-accent mb-2">Trade Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-gray-400 border-b border-main">
                        <th className="py-1 pr-4">Time</th>
                        <th className="py-1 pr-4">Type</th>
                        <th className="py-1 pr-4">Result</th>
                        <th className="py-1 pr-4">Plan</th>
                        <th className="py-1 pr-4">Mood</th>
                        <th className="py-1 pr-4">Notes</th>
                        <th className="py-1 pr-4">Reflection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSession.tradeHistory.map((trade: any, idx: number) => (
                        <tr key={trade.id || idx} className="border-b border-secondary hover:bg-gray-800">
                          <td className="py-1 pr-4">{trade.time}</td>
                          <td className="py-1 pr-4">{trade.type}</td>
                          <td className={`py-1 pr-4 font-bold ${trade.result === 'win' ? 'text-green' : 'text-red'}`}>{trade.result === 'win' ? '🏆 Win' : '❌ Lose'}</td>
                          <td className={`py-1 pr-4 ${trade.followedPlan ? 'text-green' : 'text-red'}`}>{trade.followedPlan ? 'Yes' : 'No'}</td>
                          <td className="py-1 pr-4">{typeof trade.mood === 'number' ? moodToEmoji(trade.mood) : trade.mood}</td>
                          <td className="py-1 pr-4">{trade.notes || '-'}</td>
                          <td className="py-1 pr-4">{trade.reflection || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-gray-400">No trade breakdown available for this session.</div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && sessionToDelete && (
        <Modal
          title="Delete Session"
          onClose={() => setShowDeleteConfirm(false)}
          size="small"
        >
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this session? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteSession}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <Modal
          title="Clear All History"
          onClose={() => setShowClearConfirm(false)}
          size="small"
        >
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              Are you sure you want to clear all MBS session history? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleClearHistory}>
                Clear All
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MBSHistoryPage; 