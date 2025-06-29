// Advanced Tagging System Types
// This file contains the new data structures for the advanced tagging system

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

export interface AdvancedSubTag {
  id: string;
  name: string;
  color: string;
  groupId: string;
  description?: string;
  relatedTags?: string[]; // IDs of related tags for cross-analysis
  timeBased?: boolean; // For auto-suggestions based on time
  marketConditionBased?: boolean; // For auto-suggestions based on market conditions
  patternBased?: boolean; // For auto-suggestions based on patterns
  priority?: number; // For ordering in UI (1 = highest priority)
  isDeprecated?: boolean; // For soft deletion of old tags
}

export interface AdvancedTagGroup {
  id: string;
  name: string;
  category: TagCategory;
  subcategory: TagSubcategory;
  subtags: AdvancedSubTag[];
  isCollapsible?: boolean;
  isSearchable?: boolean;
  autoSuggest?: boolean;
  description?: string;
  priority?: number; // For ordering groups in UI
  isDefault?: boolean; // For migration purposes
}

// Enhanced Trade interface with new tag structure
export interface TradeWithAdvancedTags {
  id: string;
  date: string;
  symbol: string;
  contracts: number;
  entry: number;
  exit: number;
  timeIn: string;
  timeOut: string;
  timeInTrade: number;
  profit: number;
  fees?: number;
  // New tag structure - allows multiple tags per category
  objectiveTags: { [groupId: string]: string[] }; // { groupId: [subTagId1, subTagId2, ...] }
  subjectiveTags: { [groupId: string]: string[] }; // { groupId: [subTagId1, subTagId2, ...] }
  journal: string;
  direction: 'long' | 'short';
  strategyId?: string;
  accountId: string;
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

// Tag suggestion types
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

// Cross-tag analysis types
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

// Migration types
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