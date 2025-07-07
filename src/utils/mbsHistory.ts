import { MBSSession, MBSTradeLog } from '../types/mbs';

const MBS_HISTORY_KEY = 'mbs_session_history';

export const saveMBSSession = (session: MBSSession): void => {
  try {
    const existingSessions = getMBSSessions();
    const updatedSessions = [session, ...existingSessions];
    localStorage.setItem(MBS_HISTORY_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error saving MBS session:', error);
  }
};

export const getMBSSessions = (): MBSSession[] => {
  try {
    const sessions = localStorage.getItem(MBS_HISTORY_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error loading MBS sessions:', error);
    return [];
  }
};

export const deleteMBSSession = (sessionId: string): void => {
  try {
    const sessions = getMBSSessions();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem(MBS_HISTORY_KEY, JSON.stringify(filteredSessions));
  } catch (error) {
    console.error('Error deleting MBS session:', error);
  }
};

export const clearMBSHistory = (): void => {
  try {
    localStorage.removeItem(MBS_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing MBS history:', error);
  }
};

export const createMBSSession = (
  sessionGoal: string,
  tradeHistory: MBSTradeLog[],
  startTime: string,
  endTime: string,
  sessionDuration: string
): MBSSession => {
  const wins = tradeHistory.filter(t => t.result === 'win').length;
  const losses = tradeHistory.filter(t => t.result === 'lose').length;
  const avgMood = tradeHistory.length > 0 
    ? Math.round(tradeHistory.reduce((sum, t) => sum + t.mood, 0) / tradeHistory.length) 
    : 0;
  const followedPlanCount = tradeHistory.filter(t => t.followedPlan).length;
  const didNotFollowPlanCount = tradeHistory.filter(t => !t.followedPlan).length;
  const bestTrade = tradeHistory.find(t => t.isBestTrade);
  const worstTrade = tradeHistory.find(t => t.isWorstTrade);

  return {
    id: `mbs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTime,
    endTime,
    sessionGoal,
    tradeHistory,
    sessionDuration,
    totalTrades: tradeHistory.length,
    wins,
    losses,
    avgMood,
    followedPlanCount,
    didNotFollowPlanCount,
    bestTrade,
    worstTrade,
  };
};

export const getMBSStats = (sessions: MBSSession[]) => {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalTrades: 0,
      totalWins: 0,
      totalLosses: 0,
      overallWinRate: 0,
      avgMood: 0,
      avgSessionDuration: '00:00:00',
      totalFollowedPlan: 0,
      totalDidNotFollowPlan: 0,
      planAdherenceRate: 0,
    };
  }

  const totalSessions = sessions.length;
  const totalTrades = sessions.reduce((sum, session) => sum + session.totalTrades, 0);
  const totalWins = sessions.reduce((sum, session) => sum + session.wins, 0);
  const totalLosses = sessions.reduce((sum, session) => sum + session.losses, 0);
  const overallWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
  const avgMood = Math.round(
    sessions.reduce((sum, session) => sum + session.avgMood, 0) / totalSessions
  );
  const totalFollowedPlan = sessions.reduce((sum, session) => sum + session.followedPlanCount, 0);
  const totalDidNotFollowPlan = sessions.reduce((sum, session) => sum + session.didNotFollowPlanCount, 0);
  const planAdherenceRate = totalTrades > 0 ? (totalFollowedPlan / totalTrades) * 100 : 0;

  // Calculate average session duration
  const totalSeconds = sessions.reduce((sum, session) => {
    const [hours, minutes, seconds] = session.sessionDuration.split(':').map(Number);
    return sum + hours * 3600 + minutes * 60 + seconds;
  }, 0);
  const avgSeconds = Math.round(totalSeconds / totalSessions);
  const avgHours = Math.floor(avgSeconds / 3600);
  const avgMinutes = Math.floor((avgSeconds % 3600) / 60);
  const avgSecs = avgSeconds % 60;
  const avgSessionDuration = `${String(avgHours).padStart(2, '0')}:${String(avgMinutes).padStart(2, '0')}:${String(avgSecs).padStart(2, '0')}`;

  return {
    totalSessions,
    totalTrades,
    totalWins,
    totalLosses,
    overallWinRate,
    avgMood,
    avgSessionDuration,
    totalFollowedPlan,
    totalDidNotFollowPlan,
    planAdherenceRate,
  };
}; 