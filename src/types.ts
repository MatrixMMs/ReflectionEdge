export type TradeDirection = 'long' | 'short';
export type TradeDirectionFilterSelection = 'all' | 'long' | 'short';

// Advanced tagging system types
export type TagCategory = 'objective' | 'subjective';
export type TagSubcategory = 
  // Objective subcategories
  | 'macro_environment'
  | 'time_session'
  | 'market_structure'
  | 'order_flow'
  | 'intermarket_volatility'
  // Subjective subcategories
  | 'mental_state'
  | 'emotional_response'
  | 'execution_process';

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  symbol: string; // e.g., AAPL, BTC/USD
  contracts: number; // Number of contracts or shares
  entry: number;
  exit: number;
  timeIn: string; // ISO string or HH:mm
  timeOut: string; // ISO string or HH:mm
  timeInTrade: number; // in minutes
  profit: number;
  fees?: number; // Optional field for trading fees/commissions
  tags: { [tagGroupId: string]: string }; // { tagGroupId: subTagId } - LEGACY FORMAT
  // NEW: Advanced tag structure (optional for backward compatibility)
  objectiveTags?: { [groupId: string]: string[] }; // { groupId: [subTagId1, subTagId2, ...] }
  subjectiveTags?: { [groupId: string]: string[] }; // { groupId: [subTagId1, subTagId2, ...] }
  journal: string;
  direction: TradeDirection;
  strategyId?: string;
  accountId: string; // New field for multi-account support
  execution?: {
    checklist: { [checklistItemId: string]: boolean };
    grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F' | null;
    notes: string;
  };
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

export interface SubTag {
  id: string;
  name: string;
  color: string;
  groupId: string;
  // NEW: Advanced properties (optional for backward compatibility)
  description?: string;
  relatedTags?: string[]; // IDs of related tags for cross-analysis
  timeBased?: boolean; // For auto-suggestions based on time
  marketConditionBased?: boolean; // For auto-suggestions based on market conditions
  patternBased?: boolean; // For auto-suggestions based on patterns
  priority?: number; // For ordering in UI (1 = highest priority)
  isDeprecated?: boolean; // For soft deletion of old tags
  parentId?: string; // For hierarchical structure
}

export interface TagGroup {
  id: string;
  name: string;
  subtags: SubTag[];
  // NEW: Advanced properties (optional for backward compatibility)
  category?: TagCategory;
  subcategory?: TagSubcategory;
  isCollapsible?: boolean;
  isSearchable?: boolean;
  autoSuggest?: boolean;
  description?: string;
  priority?: number; // For ordering groups in UI
  isDefault?: boolean; // For migration purposes
}

// NEW: Advanced tag interfaces for the new system
export interface AdvancedSubTag extends SubTag {
  // All SubTag properties plus required advanced properties
  description: string;
  relatedTags: string[];
  timeBased: boolean;
  marketConditionBased: boolean;
  patternBased: boolean;
  priority: number;
  parentId?: string;
}

export interface AdvancedTagGroup extends TagGroup {
  // All TagGroup properties plus required advanced properties
  category: TagCategory;
  subcategory: TagSubcategory;
  isCollapsible: boolean;
  isSearchable: boolean;
  autoSuggest: boolean;
  description: string;
  priority: number;
  subtags: AdvancedSubTag[];
}

// NEW: Tag suggestion types
export interface TagSuggestion {
  tagId: string;
  tagName: string;
  groupId: string;
  groupName: string;
  confidence: number; // 0-1, how confident we are in this suggestion
  reason: string; // Why this tag was suggested
  category: TagCategory;
}

export interface TagSuggestionContext {
  timeIn: string;
  symbol: string;
  marketConditions?: {
    vix?: number;
    volume?: number;
    volatility?: number;
    trend?: 'up' | 'down' | 'sideways';
  };
  recentTrades?: {
    profit: number;
    tags: { [groupId: string]: string[] };
  }[];
  userPreferences?: {
    frequentlyUsedTags?: string[];
    preferredCategories?: TagCategory[];
  };
}

// NEW: Cross-tag analysis types
export interface TagCombination {
  objectiveTags: string[];
  subjectiveTags: string[];
  tradeCount: number;
  totalPnl: number;
  avgPnl: number;
  winRate: number;
  sharpeRatio?: number;
}

export interface TagAnalysisResult {
  combinations: TagCombination[];
  insights: {
    mostProfitableCombination: TagCombination;
    mostFrequentCombination: TagCombination;
    worstPerformingCombination: TagCombination;
    recommendations: string[];
  };
}

// NEW: Migration types
export interface LegacyTagMapping {
  oldGroupId: string;
  oldSubTagId: string;
  newGroupId: string;
  newSubTagId: string;
  confidence: number; // How confident we are in this mapping
}

export interface MigrationPlan {
  mappings: LegacyTagMapping[];
  unmappedTags: {
    groupId: string;
    subTagId: string;
    name: string;
  }[];
  estimatedSuccessRate: number;
}

// NEW: Tag template types
export interface TagTemplate {
  id: string;
  name: string;
  description: string;
  tags: { [groupId: string]: string[] };
  category: TagCategory;
  isDefault: boolean;
  usage: number;
}

// NEW: UI state types
export type TagViewMode = 'classic' | 'advanced' | 'hierarchical';

export interface TaggingUIState {
  viewMode: TagViewMode;
  expandedCategories: Set<string>;
  selectedTags: Set<string>;
  searchQuery: string;
  filterOptions: TagFilterOptions;
  batchMode: BatchTaggingMode;
}

export interface TagFilterOptions {
  categories: TagCategory[];
  confidence: number;
  timeRange: { start: string; end: string };
  usage: 'frequent' | 'recent' | 'favorite' | 'all';
}

export interface BatchTaggingMode {
  isActive: boolean;
  selectedTrades: string[];
  pendingTags: { [groupId: string]: string[] };
  template?: TagTemplate;
}

export enum ChartYAxisMetric {
  CUMULATIVE_PNL = 'Cumulative P&L',
  INDIVIDUAL_PNL = 'Individual Trade P&L',
  WIN_PERCENTAGE = 'Win Percentage',
  AVG_PROFIT = 'Average Profit',
}

export enum ChartXAxisMetric {
  TRADE_SEQUENCE = 'Trade Sequence',
  TIME = 'Time', // This would require trades to have precise timestamps
}

export interface ChartDataPoint {
  xValue: string | number; // Trade number or date/time string
  [seriesKey: string]: number | string; // yValue for different series (e.g. PNL_series1, PNL_series2)
}

export interface ProcessedChartData {
  data: ChartDataPoint[];
  seriesKeys: { key: string; color: string; name: string }[];
}

export interface AppDateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  tags: { [groupId: string]: string[] };
  checklist: { id: string; item: string; }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  broker?: string;
  currency?: string;
}

export interface TradingSession {
  id: string;
  startTime: string;
  endTime?: string;
  tradeCount: number;
  emotions: EmotionEntry[];
}

export interface EmotionEntry {
  id: string;
  timestamp: string;
  emotion: string;
  intensity: number; // 1-5 scale
  tradeNumber: number;
}

export interface CustomEmotion {
  id: string;
  name: string;
  color: string;
}

export interface Profile {
  id: string;
  name: string;
}

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
