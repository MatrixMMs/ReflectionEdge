// Smart Tag Suggestion Engine
// This file provides intelligent tag suggestions based on context, time, and user patterns

import { 
  TagSuggestion, 
  TagSuggestionContext, 
  Trade, 
  TagCategory,
  AdvancedSubTag,
  TagTemplate
} from '../types';
import { 
  getTimeBasedTags, 
  getMarketConditionBasedTags, 
  getPatternBasedTags,
  getTagById,
  ADVANCED_TAGS
} from '../constants/advancedTags';
import { createDefaultTemplates } from './tagMigration';

// Time-based suggestion rules
const TIME_SUGGESTIONS: { [key: string]: { tagId: string; confidence: number; reason: string }[] } = {
  '09:30': [ // Market open
    { tagId: 'rth_open_drive', confidence: 0.8, reason: 'Market just opened - likely open drive pattern' },
    { tagId: 'anxiety_pnl_watching', confidence: 0.6, reason: 'Common to watch PnL closely at market open' }
  ],
  '10:30': [ // End of first hour
    { tagId: 'ib_break', confidence: 0.7, reason: 'Initial balance period ending' },
    { tagId: 'rth_midday_chop', confidence: 0.5, reason: 'Transitioning to midday period' }
  ],
  '11:30': [ // Midday
    { tagId: 'rth_midday_chop', confidence: 0.8, reason: 'Typical midday choppy period' },
    { tagId: 'low_volume', confidence: 0.7, reason: 'Low volume during lunch hours' }
  ],
  '13:30': [ // After lunch
    { tagId: 'rth_midday_chop', confidence: 0.6, reason: 'Still in midday period' },
    { tagId: 'mentally_fatigued', confidence: 0.4, reason: 'Afternoon fatigue setting in' }
  ],
  '15:00': [ // Closing hour
    { tagId: 'rth_closing_hour', confidence: 0.9, reason: 'Closing hour - increased activity' },
    { tagId: 'high_volume', confidence: 0.8, reason: 'Volume typically picks up near close' }
  ],
  '16:00': [ // Market close
    { tagId: 'rth_closing_hour', confidence: 0.8, reason: 'Market closing - final activity' },
    { tagId: 'mentally_fatigued', confidence: 0.7, reason: 'End of trading day fatigue' }
  ]
};

// Market condition based suggestions
const MARKET_CONDITION_SUGGESTIONS: { [key: string]: { tagId: string; confidence: number; reason: string }[] } = {
  'high_volatility': [
    { tagId: 'vix_spike_collapse', confidence: 0.8, reason: 'High volatility detected' },
    { tagId: 'anxiety_pnl_watching', confidence: 0.6, reason: 'High volatility often causes PnL anxiety' }
  ],
  'low_volatility': [
    { tagId: 'low_volatility_grind', confidence: 0.8, reason: 'Low volatility detected' },
    { tagId: 'rth_midday_chop', confidence: 0.6, reason: 'Low volatility often leads to choppy conditions' }
  ],
  'trending_up': [
    { tagId: 'trend_day_open_drive', confidence: 0.7, reason: 'Market trending higher' },
    { tagId: 'euphoria_overconfidence', confidence: 0.4, reason: 'Uptrends can lead to overconfidence' }
  ],
  'trending_down': [
    { tagId: 'trend_day_open_drive', confidence: 0.7, reason: 'Market trending lower' },
    { tagId: 'fear_exit', confidence: 0.5, reason: 'Downtrends can cause fear-based exits' }
  ]
};

// Pattern-based suggestions
const PATTERN_SUGGESTIONS: { [key: string]: { tagId: string; confidence: number; reason: string }[] } = {
  'gap_up': [
    { tagId: 'gap_rules', confidence: 0.9, reason: 'Gap up detected' },
    { tagId: 'rth_open_drive', confidence: 0.7, reason: 'Gaps often lead to open drives' }
  ],
  'gap_down': [
    { tagId: 'gap_rules', confidence: 0.9, reason: 'Gap down detected' },
    { tagId: 'rth_open_drive', confidence: 0.7, reason: 'Gaps often lead to open drives' }
  ],
  'breakout': [
    { tagId: 'ib_break', confidence: 0.6, reason: 'Breakout pattern detected' },
    { tagId: 'fomo_chase', confidence: 0.4, reason: 'Breakouts can trigger FOMO' }
  ],
  'reversal': [
    { tagId: 'failed_breakout', confidence: 0.7, reason: 'Reversal pattern detected' },
    { tagId: 'stop_cascade', confidence: 0.5, reason: 'Reversals often trigger stops' }
  ]
};

// Helper function to extract time from trade
const extractTime = (timeIn: string): string => {
  // Handle both ISO strings and HH:mm format
  if (timeIn.includes('T')) {
    return timeIn.split('T')[1].substring(0, 5);
  }
  return timeIn.substring(0, 5);
};

// Helper function to get hour-based suggestions
const getTimeBasedSuggestions = (timeIn: string): TagSuggestion[] => {
  const time = extractTime(timeIn);
  const hour = time.split(':')[0];
  const suggestions: TagSuggestion[] = [];
  
  // Check exact time matches
  if (TIME_SUGGESTIONS[time]) {
    TIME_SUGGESTIONS[time].forEach(suggestion => {
      const tag = getTagById(suggestion.tagId);
      if (tag) {
        suggestions.push({
          tagId: suggestion.tagId,
          tagName: tag.name,
          groupId: tag.groupId,
          groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
          confidence: suggestion.confidence,
          reason: suggestion.reason,
          category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
        });
      }
    });
  }
  
  // Check hour-based suggestions
  const hourSuggestions = TIME_SUGGESTIONS[`${hour}:30`] || TIME_SUGGESTIONS[`${hour}:00`];
  if (hourSuggestions) {
    hourSuggestions.forEach(suggestion => {
      const tag = getTagById(suggestion.tagId);
      if (tag && !suggestions.find(s => s.tagId === suggestion.tagId)) {
        suggestions.push({
          tagId: suggestion.tagId,
          tagName: tag.name,
          groupId: tag.groupId,
          groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
          confidence: suggestion.confidence * 0.8, // Slightly lower confidence for hour-based
          reason: `${suggestion.reason} (hour-based)`,
          category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
        });
      }
    });
  }
  
  return suggestions;
};

// Helper function to get market condition based suggestions
const getMarketConditionSuggestions = (context: TagSuggestionContext): TagSuggestion[] => {
  const suggestions: TagSuggestion[] = [];
  
  if (!context.marketConditions) return suggestions;
  
  const { vix, volume, volatility, trend } = context.marketConditions;
  
  // VIX-based suggestions
  if (vix) {
    if (vix > 25) {
      const highVolSuggestions = MARKET_CONDITION_SUGGESTIONS['high_volatility'];
      highVolSuggestions.forEach(suggestion => {
        const tag = getTagById(suggestion.tagId);
        if (tag) {
          suggestions.push({
            tagId: suggestion.tagId,
            tagName: tag.name,
            groupId: tag.groupId,
            groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
            confidence: suggestion.confidence,
            reason: `VIX at ${vix} - ${suggestion.reason}`,
            category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
          });
        }
      });
    } else if (vix < 15) {
      const lowVolSuggestions = MARKET_CONDITION_SUGGESTIONS['low_volatility'];
      lowVolSuggestions.forEach(suggestion => {
        const tag = getTagById(suggestion.tagId);
        if (tag) {
          suggestions.push({
            tagId: suggestion.tagId,
            tagName: tag.name,
            groupId: tag.groupId,
            groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
            confidence: suggestion.confidence,
            reason: `VIX at ${vix} - ${suggestion.reason}`,
            category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
          });
        }
      });
    }
  }
  
  // Trend-based suggestions
  if (trend) {
    const trendSuggestions = MARKET_CONDITION_SUGGESTIONS[`trending_${trend}`];
    if (trendSuggestions) {
      trendSuggestions.forEach(suggestion => {
        const tag = getTagById(suggestion.tagId);
        if (tag) {
          suggestions.push({
            tagId: suggestion.tagId,
            tagName: tag.name,
            groupId: tag.groupId,
            groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
            confidence: suggestion.confidence,
            reason: `Market trending ${trend} - ${suggestion.reason}`,
            category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
          });
        }
      });
    }
  }
  
  return suggestions;
};

// Helper function to get pattern-based suggestions
const getPatternBasedSuggestions = (trade: Trade, recentTrades: Trade[]): TagSuggestion[] => {
  const suggestions: TagSuggestion[] = [];
  
  // Simple pattern detection (this could be enhanced with more sophisticated analysis)
  const entryPrice = trade.entry;
  const exitPrice = trade.exit;
  const direction = trade.direction;
  
  // Gap detection (simplified)
  const previousTrade = recentTrades[recentTrades.length - 1];
  if (previousTrade) {
    const priceChange = Math.abs(entryPrice - previousTrade.exit) / previousTrade.exit;
    if (priceChange > 0.005) { // 0.5% gap
      const gapType = entryPrice > previousTrade.exit ? 'gap_up' : 'gap_down';
      const gapSuggestions = PATTERN_SUGGESTIONS[gapType];
      
      gapSuggestions.forEach(suggestion => {
        const tag = getTagById(suggestion.tagId);
        if (tag) {
          suggestions.push({
            tagId: suggestion.tagId,
            tagName: tag.name,
            groupId: tag.groupId,
            groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
            confidence: suggestion.confidence,
            reason: `${gapType.replace('_', ' ')} detected - ${suggestion.reason}`,
            category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
          });
        }
      });
    }
  }
  
  // Breakout/reversal detection
  const profit = trade.profit;
  const timeInTrade = trade.timeInTrade;
  
  if (profit > 0 && timeInTrade < 30) {
    // Quick profitable trade - possible breakout
    const breakoutSuggestions = PATTERN_SUGGESTIONS['breakout'];
    breakoutSuggestions.forEach(suggestion => {
      const tag = getTagById(suggestion.tagId);
      if (tag) {
        suggestions.push({
          tagId: suggestion.tagId,
          tagName: tag.name,
          groupId: tag.groupId,
          groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
          confidence: suggestion.confidence * 0.6, // Lower confidence for inferred patterns
          reason: `Quick profitable trade - possible ${suggestion.reason}`,
          category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
        });
      }
    });
  }
  
  return suggestions;
};

// Helper function to get user preference based suggestions
const getUserPreferenceSuggestions = (context: TagSuggestionContext): TagSuggestion[] => {
  const suggestions: TagSuggestion[] = [];
  
  if (!context.userPreferences?.frequentlyUsedTags) return suggestions;
  
  const frequentlyUsed = context.userPreferences.frequentlyUsedTags;
  
  // Suggest frequently used tags with moderate confidence
  frequentlyUsed.forEach(tagId => {
    const tag = getTagById(tagId);
    if (tag) {
      suggestions.push({
        tagId: tagId,
        tagName: tag.name,
        groupId: tag.groupId,
        groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
        confidence: 0.6,
        reason: 'Frequently used tag',
        category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
      });
    }
  });
  
  return suggestions;
};

// Helper function to get template-based suggestions
const getTemplateSuggestions = (context: TagSuggestionContext): TagSuggestion[] => {
  const suggestions: TagSuggestion[] = [];
  const templates = createDefaultTemplates();
  
  // Find relevant templates based on context
  templates.forEach(template => {
    if (template.category === 'objective' && context.marketConditions) {
      // Objective template - check if market conditions match
      Object.entries(template.tags).forEach(([groupId, tagIds]) => {
        tagIds.forEach(tagId => {
          const tag = getTagById(tagId);
          if (tag) {
            suggestions.push({
              tagId: tagId,
              tagName: tag.name,
              groupId: tag.groupId,
              groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
              confidence: 0.5,
              reason: `From template: ${template.name}`,
              category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
            });
          }
        });
      });
    }
  });
  
  return suggestions;
};

// Main function to generate smart tag suggestions
export const generateSmartTagSuggestions = (
  trade: Trade, 
  context: TagSuggestionContext,
  recentTrades: Trade[] = []
): TagSuggestion[] => {
  const allSuggestions: TagSuggestion[] = [];
  
  // 1. Time-based suggestions
  const timeSuggestions = getTimeBasedSuggestions(trade.timeIn);
  allSuggestions.push(...timeSuggestions);
  
  // 2. Market condition based suggestions
  const marketSuggestions = getMarketConditionSuggestions(context);
  allSuggestions.push(...marketSuggestions);
  
  // 3. Pattern-based suggestions
  const patternSuggestions = getPatternBasedSuggestions(trade, recentTrades);
  allSuggestions.push(...patternSuggestions);
  
  // 4. User preference based suggestions
  const userSuggestions = getUserPreferenceSuggestions(context);
  allSuggestions.push(...userSuggestions);
  
  // 5. Template-based suggestions
  const templateSuggestions = getTemplateSuggestions(context);
  allSuggestions.push(...templateSuggestions);
  
  // Remove duplicates and sort by confidence
  const uniqueSuggestions = allSuggestions.reduce((acc, suggestion) => {
    const existing = acc.find(s => s.tagId === suggestion.tagId);
    if (!existing) {
      acc.push(suggestion);
    } else if (suggestion.confidence > existing.confidence) {
      // Replace with higher confidence suggestion
      const index = acc.indexOf(existing);
      acc[index] = suggestion;
    }
    return acc;
  }, [] as TagSuggestion[]);
  
  // Sort by confidence (highest first) and limit to top 10
  return uniqueSuggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
};

// Function to get suggestions for a specific category
export const getSuggestionsByCategory = (
  suggestions: TagSuggestion[], 
  category: TagCategory
): TagSuggestion[] => {
  return suggestions.filter(s => s.category === category);
};

// Function to get high-confidence suggestions only
export const getHighConfidenceSuggestions = (
  suggestions: TagSuggestion[], 
  threshold: number = 0.7
): TagSuggestion[] => {
  return suggestions.filter(s => s.confidence >= threshold);
};

// Function to learn from user selections and improve suggestions
export const learnFromUserSelection = (
  selectedTagId: string,
  context: TagSuggestionContext,
  suggestions: TagSuggestion[]
): void => {
  // This would typically update a learning model or user preferences
  // For now, we'll just log the selection for future enhancement
  console.log('Learning from user selection:', {
    selectedTagId,
    context,
    availableSuggestions: suggestions.map(s => ({ tagId: s.tagId, confidence: s.confidence }))
  });
};

// Function to get contextual suggestions based on trade characteristics
export const getContextualSuggestions = (trade: Trade): TagSuggestion[] => {
  const suggestions: TagSuggestion[] = [];
  
  // Profit-based suggestions
  if (trade.profit > 0) {
    const profitableSuggestions = [
      { tagId: 'followed_plan', confidence: 0.6, reason: 'Profitable trade - likely followed plan' },
      { tagId: 'read_was_clear', confidence: 0.5, reason: 'Profitable trade - likely had clear read' }
    ];
    
    profitableSuggestions.forEach(suggestion => {
      const tag = getTagById(suggestion.tagId);
      if (tag) {
        suggestions.push({
          tagId: suggestion.tagId,
          tagName: tag.name,
          groupId: tag.groupId,
          groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
          confidence: suggestion.confidence,
          reason: suggestion.reason,
          category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
        });
      }
    });
  } else {
    const losingSuggestions = [
      { tagId: 'deviated_from_plan', confidence: 0.4, reason: 'Losing trade - possible plan deviation' },
      { tagId: 'anxiety_pnl_watching', confidence: 0.5, reason: 'Losing trade - may have caused anxiety' }
    ];
    
    losingSuggestions.forEach(suggestion => {
      const tag = getTagById(suggestion.tagId);
      if (tag) {
        suggestions.push({
          tagId: suggestion.tagId,
          tagName: tag.name,
          groupId: tag.groupId,
          groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
          confidence: suggestion.confidence,
          reason: suggestion.reason,
          category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
        });
      }
    });
  }
  
  // Time in trade based suggestions
  if (trade.timeInTrade < 10) {
    const quickTradeSuggestions = [
      { tagId: 'impulsive_entry_no_plan', confidence: 0.4, reason: 'Very quick trade - possible impulsive entry' },
      { tagId: 'fomo_chase', confidence: 0.3, reason: 'Very quick trade - possible FOMO' }
    ];
    
    quickTradeSuggestions.forEach(suggestion => {
      const tag = getTagById(suggestion.tagId);
      if (tag) {
        suggestions.push({
          tagId: suggestion.tagId,
          tagName: tag.name,
          groupId: tag.groupId,
          groupName: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.name || '',
          confidence: suggestion.confidence,
          reason: suggestion.reason,
          category: ADVANCED_TAGS.find(g => g.id === tag.groupId)?.category || 'subjective'
        });
      }
    });
  }
  
  return suggestions;
}; 