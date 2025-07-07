// MBS Session History Types
export interface MBSTradeLog {
  id: string;
  type: string;
  result: 'win' | 'lose';
  followedPlan: boolean;
  notes: string;
  mood: number;
  time: string;
  reflection?: string;
  isBestTrade?: boolean;
  isWorstTrade?: boolean;
  extendedReflection?: {
    mindset?: string;
    setup?: string;
    riskManagement?: string;
    lessons?: string;
    marketContext?: string;
  };
}

export interface MBSSession {
  id: string;
  startTime: string;
  endTime: string;
  sessionGoal: string;
  tradeHistory: MBSTradeLog[];
  sessionDuration: string; // HH:MM:SS format
  totalTrades: number;
  wins: number;
  losses: number;
  avgMood: number;
  followedPlanCount: number;
  didNotFollowPlanCount: number;
  bestTrade?: MBSTradeLog;
  worstTrade?: MBSTradeLog;
} 