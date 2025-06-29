// Tag Migration Utilities
// This file handles the migration from the old flat tag system to the new hierarchical system

import { 
  TagGroup, 
  SubTag, 
  AdvancedTagGroup, 
  AdvancedSubTag, 
  Trade, 
  TagCategory, 
  TagSubcategory,
  LegacyTagMapping,
  MigrationPlan,
  TagTemplate
} from '../types';

// Color palette for the new tagging system
const ADVANCED_TAG_COLORS = {
  objective: {
    macro: '#3B82F6', // Blue
    time: '#10B981', // Green
    structure: '#8B5CF6', // Purple
    orderflow: '#06B6D4', // Cyan
    intermarket: '#6366F1', // Indigo
  },
  subjective: {
    mental: '#F59E0B', // Amber
    emotional: '#EF4444', // Red
    execution: '#F97316', // Orange
  },
};

// Mapping from old tag groups to new categories and subcategories
const CATEGORY_MAPPING: { [key: string]: { category: TagCategory; subcategory: TagSubcategory } } = {
  'setup': { category: 'objective', subcategory: 'market_structure' },
  'market_condition': { category: 'objective', subcategory: 'market_structure' },
  'management': { category: 'subjective', subcategory: 'execution_process' },
  'read_on_pa': { category: 'subjective', subcategory: 'mental_state' },
  'getting_upset': { category: 'subjective', subcategory: 'emotional_response' },
  'ok_with_pnl': { category: 'subjective', subcategory: 'emotional_response' },
  'wanting_to_trade_now': { category: 'subjective', subcategory: 'emotional_response' },
  'entries': { category: 'subjective', subcategory: 'execution_process' },
  'exits': { category: 'subjective', subcategory: 'execution_process' },
};

// Mapping from old subtags to new advanced tags
const SUBTAG_MAPPING: { [key: string]: LegacyTagMapping } = {
  // Setup -> Market Structure
  'setup_failed_auction': {
    oldGroupId: 'setup',
    oldSubTagId: 'failed_auction',
    newGroupId: 'market_structure',
    newSubTagId: 'failed_breakout',
    confidence: 0.8
  },
  'setup_momentum': {
    oldGroupId: 'setup',
    oldSubTagId: 'momentum',
    newGroupId: 'market_structure',
    newSubTagId: 'trend_day_open_drive',
    confidence: 0.7
  },
  'setup_stop_runs': {
    oldGroupId: 'setup',
    oldSubTagId: 'stop_runs',
    newGroupId: 'order_flow',
    newSubTagId: 'stop_cascade',
    confidence: 0.9
  },
  'setup_trend': {
    oldGroupId: 'setup',
    oldSubTagId: 'trend',
    newGroupId: 'market_structure',
    newSubTagId: 'trend_day_open_drive',
    confidence: 0.8
  },
  'setup_mean_reversion': {
    oldGroupId: 'setup',
    oldSubTagId: 'mean_reversion',
    newGroupId: 'market_structure',
    newSubTagId: 'balance_multi_day',
    confidence: 0.6
  },

  // Market Condition -> Market Structure
  'market_condition_wide_balance': {
    oldGroupId: 'market_condition',
    oldSubTagId: 'wide_balance',
    newGroupId: 'market_structure',
    newSubTagId: 'balance_multi_day',
    confidence: 0.9
  },
  'market_condition_trend': {
    oldGroupId: 'market_condition',
    oldSubTagId: 'trend',
    newGroupId: 'market_structure',
    newSubTagId: 'trend_day_open_drive',
    confidence: 0.8
  },
  'market_condition_tight_range': {
    oldGroupId: 'market_condition',
    oldSubTagId: 'tight_range',
    newGroupId: 'market_structure',
    newSubTagId: 'balance_multi_day',
    confidence: 0.7
  },
  'market_condition_erratic': {
    oldGroupId: 'market_condition',
    oldSubTagId: 'erratic',
    newGroupId: 'intermarket_volatility',
    newSubTagId: 'vix_spike_collapse',
    confidence: 0.6
  },
  'market_condition_low_volume': {
    oldGroupId: 'market_condition',
    oldSubTagId: 'low_volume',
    newGroupId: 'order_flow',
    newSubTagId: 'lvn_traversal',
    confidence: 0.8
  },
  'market_condition_high_volume': {
    oldGroupId: 'market_condition',
    oldSubTagId: 'high_volume',
    newGroupId: 'order_flow',
    newSubTagId: 'hvn_test',
    confidence: 0.8
  },

  // Management -> Execution Process
  'management_fixated_on_idea': {
    oldGroupId: 'management',
    oldSubTagId: 'fixated_on_idea',
    newGroupId: 'mental_state',
    newSubTagId: 'confirmation_bias',
    confidence: 0.8
  },
  'management_impulsive': {
    oldGroupId: 'management',
    oldSubTagId: 'impulsive',
    newGroupId: 'execution_process',
    newSubTagId: 'impulsive_entry_no_plan',
    confidence: 0.9
  },
  'management_mistake': {
    oldGroupId: 'management',
    oldSubTagId: 'mistake',
    newGroupId: 'execution_process',
    newSubTagId: 'deviated_from_plan',
    confidence: 0.7
  },

  // Read on PA -> Mental State
  'read_on_pa_clear': {
    oldGroupId: 'read_on_pa',
    oldSubTagId: 'clear',
    newGroupId: 'mental_state',
    newSubTagId: 'read_was_clear',
    confidence: 0.9
  },
  'read_on_pa_confused': {
    oldGroupId: 'read_on_pa',
    oldSubTagId: 'confused',
    newGroupId: 'mental_state',
    newSubTagId: 'read_was_unclear',
    confidence: 0.9
  },

  // Emotional responses
  'getting_upset_pissed_off': {
    oldGroupId: 'getting_upset',
    oldSubTagId: 'pissed_off',
    newGroupId: 'emotional_response',
    newSubTagId: 'revenge_trading',
    confidence: 0.7
  },
  'wanting_to_trade_now_want_to_trade_now': {
    oldGroupId: 'wanting_to_trade_now',
    oldSubTagId: 'want_to_trade_now',
    newGroupId: 'emotional_response',
    newSubTagId: 'fomo_chase',
    confidence: 0.8
  },

  // Execution
  'entries_perfect_entry': {
    oldGroupId: 'entries',
    oldSubTagId: 'perfect_entry',
    newGroupId: 'execution_process',
    newSubTagId: 'followed_plan',
    confidence: 0.8
  },
  'entries_entry_early': {
    oldGroupId: 'entries',
    oldSubTagId: 'entry_early',
    newGroupId: 'execution_process',
    newSubTagId: 'impulsive_entry_no_plan',
    confidence: 0.6
  },
  'exits_perfect_exit': {
    oldGroupId: 'exits',
    oldSubTagId: 'perfect_exit',
    newGroupId: 'execution_process',
    newSubTagId: 'followed_plan',
    confidence: 0.8
  },
  'exits_held_2_long': {
    oldGroupId: 'exits',
    oldSubTagId: 'held_2_long',
    newGroupId: 'execution_process',
    newSubTagId: 'greed_exit',
    confidence: 0.7
  },
};

// Helper function to determine category and subcategory for a tag group
export const determineCategory = (groupName: string): TagCategory => {
  const mapping = CATEGORY_MAPPING[groupName.toLowerCase().replace(/\s+/g, '_')];
  return mapping?.category || 'subjective'; // Default to subjective for unknown groups
};

export const determineSubcategory = (groupName: string): TagSubcategory => {
  const mapping = CATEGORY_MAPPING[groupName.toLowerCase().replace(/\s+/g, '_')];
  return mapping?.subcategory || 'execution_process'; // Default to execution_process for unknown groups
};

// Helper function to get tag description
export const getDescription = (tagName: string): string => {
  const descriptions: { [key: string]: string } = {
    'failed_auction': 'Price failed to hold above/below key auction levels',
    'momentum': 'Strong directional movement with volume confirmation',
    'stop_runs': 'Price swept stops before reversing',
    'trend': 'Clear directional movement over time',
    'mean_reversion': 'Price returning to equilibrium after extreme moves',
    'wide_balance': 'Price contained in a wide, well-defined range',
    'tight_range': 'Price moving in a narrow, constricted range',
    'erratic': 'Unpredictable, choppy price action',
    'low_volume': 'Below-average volume conditions',
    'high_volume': 'Above-average volume conditions',
    'clear': 'Market structure and setup were unambiguous',
    'confused': 'Market structure was unclear or conflicting',
    'impulsive': 'Acted without proper analysis or planning',
    'mistake': 'Made an error in judgment or execution',
    'perfect_entry': 'Entered at the optimal level and time',
    'perfect_exit': 'Exited at the optimal level and time',
  };
  
  return descriptions[tagName] || `Tag for ${tagName}`;
};

// Helper function to determine if a tag is time-based
export const isTimeBased = (tagName: string): boolean => {
  const timeBasedTags = [
    'pre_market', 'rth_open_drive', 'rth_midday_chop', 'rth_closing_hour',
    'globex_session', 'london_open_crossover'
  ];
  return timeBasedTags.includes(tagName);
};

// Helper function to determine priority
export const determinePriority = (groupName: string): number => {
  const priorities: { [key: string]: number } = {
    'setup': 1,
    'market_condition': 2,
    'management': 3,
    'read_on_pa': 4,
    'getting_upset': 5,
    'ok_with_pnl': 6,
    'wanting_to_trade_now': 7,
    'entries': 8,
    'exits': 9,
  };
  
  return priorities[groupName] || 10;
};

export const determineSubTagPriority = (tagName: string): number => {
  const priorities: { [key: string]: number } = {
    'failed_auction': 1,
    'momentum': 2,
    'stop_runs': 3,
    'trend': 4,
    'mean_reversion': 5,
    'wide_balance': 1,
    'tight_range': 2,
    'erratic': 3,
    'low_volume': 4,
    'high_volume': 5,
    'clear': 1,
    'confused': 2,
    'impulsive': 1,
    'mistake': 2,
    'perfect_entry': 1,
    'perfect_exit': 1,
  };
  
  return priorities[tagName] || 10;
};

// Helper function to determine if a group should auto-suggest
export const shouldAutoSuggest = (groupName: string): boolean => {
  const autoSuggestGroups = ['setup', 'market_condition', 'time_session'];
  return autoSuggestGroups.includes(groupName);
};

// Main migration function for tag groups
export const migrateToAdvancedSystem = (oldTagGroups: TagGroup[]): AdvancedTagGroup[] => {
  return oldTagGroups.map(group => {
    const category = determineCategory(group.id);
    const subcategory = determineSubcategory(group.id);
    const priority = determinePriority(group.id);
    const autoSuggest = shouldAutoSuggest(group.id);
    
    return {
      ...group,
      category,
      subcategory,
      isCollapsible: true,
      isSearchable: true,
      autoSuggest,
      description: `Advanced ${group.name} tags`,
      priority,
      subtags: group.subtags.map(subtag => ({
        ...subtag,
        description: getDescription(subtag.name),
        relatedTags: [],
        timeBased: isTimeBased(subtag.name),
        marketConditionBased: false,
        patternBased: false,
        priority: determineSubTagPriority(subtag.name),
        isDeprecated: false
      }))
    };
  });
};

// Migration function for individual trades
export const migrateTradeTags = (trade: Trade): Trade => {
  // If trade already has advanced tags, return as is
  if (trade.objectiveTags || trade.subjectiveTags) {
    return trade;
  }
  
  const objectiveTags: { [groupId: string]: string[] } = {};
  const subjectiveTags: { [groupId: string]: string[] } = {};
  
  // Convert old tag format to new format
  Object.entries(trade.tags).forEach(([groupId, subTagId]) => {
    const category = determineCategory(groupId);
    
    if (category === 'objective') {
      if (!objectiveTags[groupId]) {
        objectiveTags[groupId] = [];
      }
      objectiveTags[groupId].push(subTagId);
    } else {
      if (!subjectiveTags[groupId]) {
        subjectiveTags[groupId] = [];
      }
      subjectiveTags[groupId].push(subTagId);
    }
  });
  
  return {
    ...trade,
    objectiveTags: Object.keys(objectiveTags).length > 0 ? objectiveTags : undefined,
    subjectiveTags: Object.keys(subjectiveTags).length > 0 ? subjectiveTags : undefined
  };
};

// Generate migration plan
export const generateMigrationPlan = (oldTagGroups: TagGroup[]): MigrationPlan => {
  const mappings: LegacyTagMapping[] = [];
  const unmappedTags: { groupId: string; subTagId: string; name: string }[] = [];
  
  oldTagGroups.forEach(group => {
    group.subtags.forEach(subtag => {
      const mapping = SUBTAG_MAPPING[`${group.id}_${subtag.id}`] || SUBTAG_MAPPING[subtag.id];
      
      if (mapping) {
        mappings.push(mapping);
      } else {
        unmappedTags.push({
          groupId: group.id,
          subTagId: subtag.id,
          name: subtag.name
        });
      }
    });
  });
  
  const totalTags = oldTagGroups.reduce((sum, group) => sum + group.subtags.length, 0);
  const estimatedSuccessRate = mappings.length / totalTags;
  
  return {
    mappings,
    unmappedTags,
    estimatedSuccessRate
  };
};

// Create default templates
export const createDefaultTemplates = (): TagTemplate[] => {
  return [
    {
      id: 'fomc_morning',
      name: 'FOMC Morning Session',
      description: 'Typical FOMC day morning patterns',
      tags: {
        'macro_environment': ['pre_fomc_drift'],
        'time_session': ['rth_open_drive'],
        'emotional_response': ['anxiety_pnl_watching']
      },
      category: 'objective',
      isDefault: true,
      usage: 0
    },
    {
      id: 'flow_state_trading',
      name: 'Flow State Trading',
      description: 'When you\'re in the zone',
      tags: {
        'mental_state': ['in_the_zone', 'read_was_clear'],
        'execution_process': ['followed_plan']
      },
      category: 'subjective',
      isDefault: true,
      usage: 0
    },
    {
      id: 'revenge_trading_session',
      name: 'Revenge Trading Session',
      description: 'Trying to make back losses',
      tags: {
        'emotional_response': ['revenge_trading'],
        'execution_process': ['impulsive_entry_no_plan', 'oversized']
      },
      category: 'subjective',
      isDefault: true,
      usage: 0
    }
  ];
};

// Utility function to check if a trade needs migration
export const needsMigration = (trade: Trade): boolean => {
  return !trade.objectiveTags && !trade.subjectiveTags && Object.keys(trade.tags).length > 0;
};

// Utility function to get all trades that need migration
export const getTradesNeedingMigration = (trades: Trade[]): Trade[] => {
  return trades.filter(needsMigration);
};

// Batch migration function
export const migrateAllTrades = (trades: Trade[]): Trade[] => {
  return trades.map(trade => migrateTradeTags(trade));
};

// Validation function for migration
export const validateMigration = (originalTrades: Trade[], migratedTrades: Trade[]): {
  success: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (originalTrades.length !== migratedTrades.length) {
    errors.push('Trade count mismatch after migration');
  }
  
  migratedTrades.forEach((trade, index) => {
    const original = originalTrades[index];
    
    // Check that all original tags are preserved
    Object.entries(original.tags).forEach(([groupId, subTagId]) => {
      const category = determineCategory(groupId);
      const newTags = category === 'objective' ? trade.objectiveTags : trade.subjectiveTags;
      
      if (!newTags || !newTags[groupId] || !newTags[groupId].includes(subTagId)) {
        warnings.push(`Tag ${groupId}:${subTagId} may not have been properly migrated in trade ${trade.id}`);
      }
    });
  });
  
  return {
    success: errors.length === 0,
    errors,
    warnings
  };
}; 