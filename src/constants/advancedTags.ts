// Advanced Tagging System Constants
// This file contains the new hierarchical tagging system with objective and subjective categories

import { AdvancedTagGroup, AdvancedSubTag, TagCategory, TagSubcategory } from '../types';

// Color palette for the advanced tagging system
export const ADVANCED_TAG_COLORS = {
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

// Advanced Tag Groups - Objective Tags (Market's Story)
export const ADVANCED_OBJECTIVE_TAGS: AdvancedTagGroup[] = [
  // 1. Macro Environment
  {
    id: 'macro_environment',
    name: 'Macro Environment',
    category: 'objective',
    subcategory: 'macro_environment',
    isCollapsible: true,
    isSearchable: true,
    autoSuggest: true,
    description: 'Major market-moving events and economic conditions',
    priority: 1,
    subtags: [
      {
        id: 'pre_fomc_drift',
        name: 'Pre-FOMC Drift',
        color: ADVANCED_TAG_COLORS.objective.macro,
        groupId: 'macro_environment',
        description: 'The quiet, often directional action leading into a Fed announcement',
        relatedTags: ['post_fomc_volatility', 'anxiety_pnl_watching'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 1,
        isDeprecated: false
      },
      {
        id: 'post_fomc_volatility',
        name: 'Post-FOMC Volatility',
        color: ADVANCED_TAG_COLORS.objective.macro,
        groupId: 'macro_environment',
        description: 'The explosive, multi-directional movement after the announcement',
        relatedTags: ['pre_fomc_drift', 'vix_spike_collapse'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 2,
        isDeprecated: false
      },
      {
        id: 'major_data_release',
        name: 'Major Data Release',
        color: ADVANCED_TAG_COLORS.objective.macro,
        groupId: 'macro_environment',
        description: 'For NFP, CPI, PPI, etc. Can be sub-tagged with In-line, Beat, Miss',
        relatedTags: ['pre_fomc_drift', 'post_fomc_volatility'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 3,
        isDeprecated: false
      },
      {
        id: 'fed_speak',
        name: 'Fed Speak',
        color: ADVANCED_TAG_COLORS.objective.macro,
        groupId: 'macro_environment',
        description: 'A scheduled speech by a Fed member is influencing price',
        relatedTags: ['pre_fomc_drift', 'post_fomc_volatility'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 4,
        isDeprecated: false
      },
      {
        id: 'geopolitical_event',
        name: 'Geopolitical Event',
        color: ADVANCED_TAG_COLORS.objective.macro,
        groupId: 'macro_environment',
        description: 'A major news event driving unexpected volatility',
        relatedTags: ['vix_spike_collapse', 'erratic'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 5,
        isDeprecated: false
      }
    ]
  },

  // 2. Time of Day & Session
  {
    id: 'time_session',
    name: 'Time of Day & Session',
    category: 'objective',
    subcategory: 'time_session',
    isCollapsible: true,
    isSearchable: true,
    autoSuggest: true,
    description: 'Time-based market behavior patterns',
    priority: 2,
    subtags: [
      {
        id: 'globex_session',
        name: 'Globex Session',
        color: ADVANCED_TAG_COLORS.objective.time,
        groupId: 'time_session',
        description: 'Trading during the overnight session',
        relatedTags: ['london_open_crossover', 'low_volume'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 1,
        isDeprecated: false
      },
      {
        id: 'london_open_crossover',
        name: 'London Open Crossover',
        color: ADVANCED_TAG_COLORS.objective.time,
        groupId: 'time_session',
        description: 'The period of overlap with European markets',
        relatedTags: ['globex_session', 'rth_open_drive'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 2,
        isDeprecated: false
      },
      {
        id: 'pre_market',
        name: 'Pre-Market',
        color: ADVANCED_TAG_COLORS.objective.time,
        groupId: 'time_session',
        description: 'The 1-2 hours before the US cash session open',
        relatedTags: ['rth_open_drive', 'london_open_crossover'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 3,
        isDeprecated: false
      },
      {
        id: 'rth_open_drive',
        name: 'RTH Open Drive',
        color: ADVANCED_TAG_COLORS.objective.time,
        groupId: 'time_session',
        description: 'A strong, directional move right from the 9:30 AM EST open',
        relatedTags: ['pre_market', 'trend_day_open_drive'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 4,
        isDeprecated: false
      },
      {
        id: 'rth_midday_chop',
        name: 'RTH Mid-day Chop',
        color: ADVANCED_TAG_COLORS.objective.time,
        groupId: 'time_session',
        description: 'The low-volume, range-bound period often between 11:30 AM and 1:30 PM EST',
        relatedTags: ['rth_open_drive', 'rth_closing_hour', 'low_volume'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 5,
        isDeprecated: false
      },
      {
        id: 'rth_closing_hour',
        name: 'RTH Closing Hour',
        color: ADVANCED_TAG_COLORS.objective.time,
        groupId: 'time_session',
        description: 'The increased activity leading into the 4:00 PM EST close',
        relatedTags: ['rth_midday_chop', 'high_volume'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 6,
        isDeprecated: false
      }
    ]
  },

  // 3. Market Structure & Profile Context
  {
    id: 'market_structure',
    name: 'Market Structure & Profile Context',
    category: 'objective',
    subcategory: 'market_structure',
    isCollapsible: true,
    isSearchable: true,
    autoSuggest: true,
    description: 'Price action patterns and market profile context',
    priority: 3,
    subtags: [
      {
        id: 'inside_value',
        name: 'Inside Value',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Trading within the prior day\'s Value Area (VA)',
        relatedTags: ['outside_value', 'balance_multi_day'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 1,
        isDeprecated: false
      },
      {
        id: 'outside_value',
        name: 'Outside Value',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Trading outside the prior day\'s VA',
        relatedTags: ['inside_value', 'value_area_migration'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 2,
        isDeprecated: false
      },
      {
        id: 'value_area_migration',
        name: 'Value Area Migration',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Value is clearly shifting higher or lower day-over-day',
        relatedTags: ['outside_value', 'trend_day_open_drive'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 3,
        isDeprecated: false
      },
      {
        id: 'p_shaped_profile',
        name: 'P-shaped Profile',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Short-covering rally',
        relatedTags: ['b_shaped_profile', 'stop_cascade'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 4,
        isDeprecated: false
      },
      {
        id: 'b_shaped_profile',
        name: 'b-shaped Profile',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Long-liquidation break',
        relatedTags: ['p_shaped_profile', 'stop_cascade'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 5,
        isDeprecated: false
      },
      {
        id: 'balance_multi_day',
        name: 'Balance / Multi-day Balance',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Price is contained within a well-defined range over several days',
        relatedTags: ['inside_value', 'tight_range'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 6,
        isDeprecated: false
      },
      {
        id: 'trend_day_open_drive',
        name: 'Trend Day (Open-Drive)',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Price moves directionally all day, never returning to the opening range',
        relatedTags: ['rth_open_drive', 'value_area_migration'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 7,
        isDeprecated: false
      },
      {
        id: 'failed_breakout',
        name: 'Failed Breakout',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Price broke a key level but failed to find acceptance and reversed',
        relatedTags: ['stop_cascade', 'balance_multi_day'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 8,
        isDeprecated: false
      },
      {
        id: 'gap_rules',
        name: 'Gap Rules',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Can be sub-tagged with Gap Fill, Gap & Go, Gap Rejection',
        relatedTags: ['rth_open_drive', 'failed_breakout'],
        timeBased: true,
        marketConditionBased: true,
        patternBased: true,
        priority: 9,
        isDeprecated: false
      },
      {
        id: 'ib_break',
        name: 'IB Break',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'A break of the Initial Balance (the first hour\'s range)',
        relatedTags: ['rth_open_drive', 'trend_day_open_drive'],
        timeBased: true,
        marketConditionBased: true,
        patternBased: true,
        priority: 10,
        isDeprecated: false
      },
      {
        id: 'poc_acceptance_rejection',
        name: 'POC Acceptance/Rejection',
        color: ADVANCED_TAG_COLORS.objective.structure,
        groupId: 'market_structure',
        description: 'Price is interacting with a key Point of Control (daily, weekly)',
        relatedTags: ['hvn_test', 'inside_value'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 11,
        isDeprecated: false
      }
    ]
  },

  // 4. Order Flow & Volume Dynamics
  {
    id: 'order_flow',
    name: 'Order Flow & Volume Dynamics',
    category: 'objective',
    subcategory: 'order_flow',
    isCollapsible: true,
    isSearchable: true,
    autoSuggest: true,
    description: 'Volume and order flow patterns',
    priority: 4,
    subtags: [
      {
        id: 'hvn_test',
        name: 'High Volume Node (HVN) Test',
        color: ADVANCED_TAG_COLORS.objective.orderflow,
        groupId: 'order_flow',
        description: 'Price is interacting with a high-volume area on the profile',
        relatedTags: ['poc_acceptance_rejection', 'absorption'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 1,
        isDeprecated: false
      },
      {
        id: 'lvn_traversal',
        name: 'Low Volume Node (LVN) Traversal',
        color: ADVANCED_TAG_COLORS.objective.orderflow,
        groupId: 'order_flow',
        description: 'Price is moving quickly through a low-volume area',
        relatedTags: ['hvn_test', 'low_volume'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 2,
        isDeprecated: false
      },
      {
        id: 'absorption',
        name: 'Absorption',
        color: ADVANCED_TAG_COLORS.objective.orderflow,
        groupId: 'order_flow',
        description: 'Large passive orders are absorbing aggressive market orders at a key level (seen on DOM/Footprint)',
        relatedTags: ['hvn_test', 'exhaustion'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 3,
        isDeprecated: false
      },
      {
        id: 'exhaustion',
        name: 'Exhaustion',
        color: ADVANCED_TAG_COLORS.objective.orderflow,
        groupId: 'order_flow',
        description: 'Volume dries up at the peak/low of a move, signaling a potential reversal',
        relatedTags: ['absorption', 'delta_divergence'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 4,
        isDeprecated: false
      },
      {
        id: 'delta_divergence',
        name: 'Delta Divergence',
        color: ADVANCED_TAG_COLORS.objective.orderflow,
        groupId: 'order_flow',
        description: 'Price is making a new high/low, but the cumulative delta (net buying/selling) is not confirming it',
        relatedTags: ['exhaustion', 'large_lot_sweep'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 5,
        isDeprecated: false
      },
      {
        id: 'large_lot_sweep',
        name: 'Large Lot Sweep',
        color: ADVANCED_TAG_COLORS.objective.orderflow,
        groupId: 'order_flow',
        description: 'A significant market order sweeps multiple levels of the book',
        relatedTags: ['delta_divergence', 'stop_cascade'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 6,
        isDeprecated: false
      },
      {
        id: 'stop_cascade',
        name: 'Stop Cascade',
        color: ADVANCED_TAG_COLORS.objective.orderflow,
        groupId: 'order_flow',
        description: 'A series of stop-loss orders being triggered in succession',
        relatedTags: ['large_lot_sweep', 'failed_breakout'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 7,
        isDeprecated: false
      }
    ]
  },

  // 5. Inter-market & Volatility
  {
    id: 'intermarket_volatility',
    name: 'Inter-market & Volatility',
    category: 'objective',
    subcategory: 'intermarket_volatility',
    isCollapsible: true,
    isSearchable: true,
    autoSuggest: true,
    description: 'Cross-asset correlations and volatility patterns',
    priority: 5,
    subtags: [
      {
        id: 'nq_lead',
        name: '/NQ Lead',
        color: ADVANCED_TAG_COLORS.objective.intermarket,
        groupId: 'intermarket_volatility',
        description: 'Nasdaq is clearly stronger/weaker, leading the S&P 500',
        relatedTags: ['es_lead', 'rates_correlation'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 1,
        isDeprecated: false
      },
      {
        id: 'es_lead',
        name: '/ES Lead',
        color: ADVANCED_TAG_COLORS.objective.intermarket,
        groupId: 'intermarket_volatility',
        description: 'S&P 500 is leading the Nasdaq',
        relatedTags: ['nq_lead', 'rates_correlation'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 2,
        isDeprecated: false
      },
      {
        id: 'rates_correlation',
        name: 'Rates Correlation',
        color: ADVANCED_TAG_COLORS.objective.intermarket,
        groupId: 'intermarket_volatility',
        description: 'Yields (ZN, ZB) are moving in a way that is impacting equities (e.g., yields up, NQ down)',
        relatedTags: ['nq_lead', 'es_lead'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 3,
        isDeprecated: false
      },
      {
        id: 'vix_spike_collapse',
        name: 'VIX Spike / Collapse',
        color: ADVANCED_TAG_COLORS.objective.intermarket,
        groupId: 'intermarket_volatility',
        description: 'The VIX is moving sharply, indicating a change in expected volatility',
        relatedTags: ['post_fomc_volatility', 'low_volatility_grind'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 4,
        isDeprecated: false
      },
      {
        id: 'low_volatility_grind',
        name: 'Low Volatility Grind',
        color: ADVANCED_TAG_COLORS.objective.intermarket,
        groupId: 'intermarket_volatility',
        description: 'The VIX is low and the market is slowly trending',
        relatedTags: ['vix_spike_collapse', 'rth_midday_chop'],
        timeBased: false,
        marketConditionBased: true,
        patternBased: true,
        priority: 5,
        isDeprecated: false
      }
    ]
  }
];

// Advanced Tag Groups - Subjective Tags (Trader's Story)
export const ADVANCED_SUBJECTIVE_TAGS: AdvancedTagGroup[] = [
  // 1. Mental State & Clarity
  {
    id: 'mental_state',
    name: 'Mental State & Clarity',
    category: 'subjective',
    subcategory: 'mental_state',
    isCollapsible: true,
    isSearchable: true,
    autoSuggest: false,
    description: 'Your mental state and market clarity',
    priority: 1,
    subtags: [
      {
        id: 'in_the_zone',
        name: 'In the Zone / Flow State',
        color: ADVANCED_TAG_COLORS.subjective.mental,
        groupId: 'mental_state',
        description: 'Effortless focus, seeing the market clearly, executing flawlessly',
        relatedTags: ['read_was_clear', 'followed_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 1,
        isDeprecated: false
      },
      {
        id: 'mentally_fatigued',
        name: 'Mentally Fatigued',
        color: ADVANCED_TAG_COLORS.subjective.mental,
        groupId: 'mental_state',
        description: 'End of day/week, making lazy mistakes',
        relatedTags: ['deviated_from_plan', 'mistake'],
        timeBased: true,
        marketConditionBased: false,
        patternBased: false,
        priority: 2,
        isDeprecated: false
      },
      {
        id: 'distracted',
        name: 'Distracted',
        color: ADVANCED_TAG_COLORS.subjective.mental,
        groupId: 'mental_state',
        description: 'Phone, news, chatroom, or other people on the desk are breaking my focus',
        relatedTags: ['deviated_from_plan', 'impulsive_entry_no_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 3,
        isDeprecated: false
      },
      {
        id: 'confirmation_bias',
        name: 'Confirmation Bias',
        color: ADVANCED_TAG_COLORS.subjective.mental,
        groupId: 'mental_state',
        description: 'Only looking for information that supported my pre-existing thesis',
        relatedTags: ['read_was_unclear', 'deviated_from_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 4,
        isDeprecated: false
      },
      {
        id: 'recency_bias',
        name: 'Recency Bias',
        color: ADVANCED_TAG_COLORS.subjective.mental,
        groupId: 'mental_state',
        description: 'Over-weighting the last few trades/market movements in my analysis',
        relatedTags: ['confirmation_bias', 'impulsive_entry_no_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 5,
        isDeprecated: false
      },
      {
        id: 'read_was_clear',
        name: 'Read Was Clear',
        color: ADVANCED_TAG_COLORS.subjective.mental,
        groupId: 'mental_state',
        description: 'My thesis was unambiguous and based on my plan',
        relatedTags: ['in_the_zone', 'followed_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 6,
        isDeprecated: false
      },
      {
        id: 'read_was_unclear',
        name: 'Read Was Unclear / Forced',
        color: ADVANCED_TAG_COLORS.subjective.mental,
        groupId: 'mental_state',
        description: 'I didn\'t have a strong thesis but traded anyway',
        relatedTags: ['confirmation_bias', 'impulsive_entry_no_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 7,
        isDeprecated: false
      }
    ]
  },

  // 2. Emotional Response
  {
    id: 'emotional_response',
    name: 'Emotional Response',
    category: 'subjective',
    subcategory: 'emotional_response',
    isCollapsible: true,
    isSearchable: true,
    autoSuggest: false,
    description: 'Your emotional state during the trade',
    priority: 2,
    subtags: [
      {
        id: 'fomo_chase',
        name: 'FOMO Chase',
        color: ADVANCED_TAG_COLORS.subjective.emotional,
        groupId: 'emotional_response',
        description: 'Entered late because I couldn\'t stand missing the move',
        relatedTags: ['impulsive_entry_no_plan', 'entry_late'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 1,
        isDeprecated: false
      },
      {
        id: 'revenge_trading',
        name: 'Revenge Trading',
        color: ADVANCED_TAG_COLORS.subjective.emotional,
        groupId: 'emotional_response',
        description: 'Trying to make back a loss from a previous trade with a lower-quality setup',
        relatedTags: ['oversized', 'impulsive_entry_no_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 2,
        isDeprecated: false
      },
      {
        id: 'euphoria_overconfidence',
        name: 'Euphoria / Overconfidence',
        color: ADVANCED_TAG_COLORS.subjective.emotional,
        groupId: 'emotional_response',
        description: 'Feeling invincible after a string of wins, leading to oversized or sloppy trades',
        relatedTags: ['oversized', 'greed_exit'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 3,
        isDeprecated: false
      },
      {
        id: 'anxiety_pnl_watching',
        name: 'Anxiety / PnL Watching',
        color: ADVANCED_TAG_COLORS.subjective.emotional,
        groupId: 'emotional_response',
        description: 'Staring at my profit/loss instead of the market action, causing me to exit too early or too late',
        relatedTags: ['fear_exit', 'moved_to_be_prematurely'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 4,
        isDeprecated: false
      },
      {
        id: 'hesitation',
        name: 'Hesitation',
        color: ADVANCED_TAG_COLORS.subjective.emotional,
        groupId: 'emotional_response',
        description: 'Saw my signal but was too afraid to execute',
        relatedTags: ['entry_late', 'undersized'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 5,
        isDeprecated: false
      }
    ]
  },

  // 3. Execution & Management Process
  {
    id: 'execution_process',
    name: 'Execution & Management Process',
    category: 'subjective',
    subcategory: 'execution_process',
    isCollapsible: true,
    isSearchable: true,
    autoSuggest: false,
    description: 'How you executed and managed the trade',
    priority: 3,
    subtags: [
      {
        id: 'followed_plan',
        name: 'Followed Plan',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Executed the trade exactly as planned, regardless of outcome',
        relatedTags: ['in_the_zone', 'read_was_clear'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 1,
        isDeprecated: false
      },
      {
        id: 'deviated_from_plan',
        name: 'Deviated from Plan',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'I had a plan but did something else',
        relatedTags: ['impulsive_entry_no_plan', 'mistake'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 2,
        isDeprecated: false
      },
      {
        id: 'impulsive_entry_no_plan',
        name: 'Impulsive Entry / No Plan',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Traded based on a gut feeling with no pre-defined setup or risk',
        relatedTags: ['fomo_chase', 'revenge_trading'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 3,
        isDeprecated: false
      },
      {
        id: 'sized_correctly',
        name: 'Sized Correctly',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Risk size was appropriate for the setup\'s quality and my conviction',
        relatedTags: ['followed_plan', 'honored_stop'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 4,
        isDeprecated: false
      },
      {
        id: 'oversized',
        name: 'Oversized',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Took on too much risk, usually driven by emotion',
        relatedTags: ['euphoria_overconfidence', 'revenge_trading'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 5,
        isDeprecated: false
      },
      {
        id: 'undersized',
        name: 'Undersized',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Didn\'t take on enough risk, usually driven by fear/hesitation',
        relatedTags: ['hesitation', 'fear_exit'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 6,
        isDeprecated: false
      },
      {
        id: 'honored_stop',
        name: 'Honored Stop',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'My stop-loss was hit and I accepted the loss without question',
        relatedTags: ['followed_plan', 'sized_correctly'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 7,
        isDeprecated: false
      },
      {
        id: 'widened_stop',
        name: 'Widened Stop',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Moved my stop further away as price moved against me (a cardinal sin)',
        relatedTags: ['deviated_from_plan', 'anxiety_pnl_watching'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 8,
        isDeprecated: false
      },
      {
        id: 'moved_to_be_prematurely',
        name: 'Moved to BE Prematurely',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Moved my stop to break-even too soon, getting stopped out on noise before the real move',
        relatedTags: ['anxiety_pnl_watching', 'fear_exit'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 9,
        isDeprecated: false
      },
      {
        id: 'greed_exit',
        name: 'Greed Exit',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Held for an unrealistic target and gave back significant open profits',
        relatedTags: ['euphoria_overconfidence', 'deviated_from_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 10,
        isDeprecated: false
      },
      {
        id: 'fear_exit',
        name: 'Fear Exit',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Exited a good position on normal pullback/noise, leaving a lot on the table',
        relatedTags: ['anxiety_pnl_watching', 'undersized'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 11,
        isDeprecated: false
      },
      {
        id: 'entry_late',
        name: 'Entry Late',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Entered after the optimal entry point',
        relatedTags: ['fomo_chase', 'hesitation'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 12,
        isDeprecated: false
      },
      {
        id: 'entry_should_not_happened',
        name: 'Entry Should Not Happened',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Entered a trade that didn\'t meet my criteria',
        relatedTags: ['impulsive_entry_no_plan', 'deviated_from_plan'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 13,
        isDeprecated: false
      },
      {
        id: 'hold_more',
        name: 'Hold More',
        color: ADVANCED_TAG_COLORS.subjective.execution,
        groupId: 'execution_process',
        description: 'Should have held the position longer',
        relatedTags: ['fear_exit', 'moved_to_be_prematurely'],
        timeBased: false,
        marketConditionBased: false,
        patternBased: false,
        priority: 14,
        isDeprecated: false
      }
    ]
  }
];

// Combined advanced tags
export const ADVANCED_TAGS: AdvancedTagGroup[] = [
  ...ADVANCED_OBJECTIVE_TAGS,
  ...ADVANCED_SUBJECTIVE_TAGS
];

// Helper functions
export const getTagById = (tagId: string): AdvancedSubTag | null => {
  for (const group of ADVANCED_TAGS) {
    const tag = group.subtags.find(t => t.id === tagId);
    if (tag) return tag;
  }
  return null;
};

export const getGroupById = (groupId: string): AdvancedTagGroup | null => {
  return ADVANCED_TAGS.find(g => g.id === groupId) || null;
};

export const getTagsByCategory = (category: TagCategory): AdvancedTagGroup[] => {
  return ADVANCED_TAGS.filter(g => g.category === category);
};

export const getTagsBySubcategory = (subcategory: TagSubcategory): AdvancedTagGroup[] => {
  return ADVANCED_TAGS.filter(g => g.subcategory === subcategory);
};

export const getAutoSuggestTags = (): AdvancedSubTag[] => {
  const autoSuggestGroups = ADVANCED_TAGS.filter(g => g.autoSuggest);
  return autoSuggestGroups.flatMap(g => g.subtags);
};

export const getTimeBasedTags = (): AdvancedSubTag[] => {
  return ADVANCED_TAGS.flatMap(g => g.subtags.filter(t => t.timeBased));
};

export const getMarketConditionBasedTags = (): AdvancedSubTag[] => {
  return ADVANCED_TAGS.flatMap(g => g.subtags.filter(t => t.marketConditionBased));
};

export const getPatternBasedTags = (): AdvancedSubTag[] => {
  return ADVANCED_TAGS.flatMap(g => g.subtags.filter(t => t.patternBased));
}; 