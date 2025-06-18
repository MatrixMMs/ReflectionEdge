import { Trade } from '../types';

export interface TimePattern {
  id: string;
  type: 'hour' | 'day' | 'month' | 'dayOfWeek';
  value: number | string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  averageTradeDuration: number;
}

export interface PatternAnalysis {
  hourlyPatterns: TimePattern[];
  dailyPatterns: TimePattern[];
  monthlyPatterns: TimePattern[];
  dayOfWeekPatterns: TimePattern[];
  bestPerformingHours: TimePattern[];
  worstPerformingHours: TimePattern[];
  bestPerformingDays: TimePattern[];
  worstPerformingDays: TimePattern[];
  sessionAnalysis: {
    preMarket: TimePattern;
    regular: TimePattern;
    afterHours: TimePattern;
  };
}

export interface TradeTimeData {
  hour: number;
  day: number;
  month: number;
  dayOfWeek: number;
  isPreMarket: boolean;
  isAfterHours: boolean;
  isRegularHours: boolean;
}

// Helper function to extract time data from a trade
const extractTradeTimeData = (trade: Trade): TradeTimeData => {
  const tradeDate = new Date(trade.timeIn);
  const hour = tradeDate.getHours();
  const day = tradeDate.getDate();
  const month = tradeDate.getMonth() + 1; // 1-12
  const dayOfWeek = tradeDate.getDay(); // 0-6 (Sunday-Saturday)
  
  // Define market hours (adjust as needed)
  const isPreMarket = hour >= 4 && hour < 9; // 4 AM to 9 AM
  const isAfterHours = hour >= 16 && hour < 20; // 4 PM to 8 PM
  const isRegularHours = hour >= 9 && hour < 16; // 9 AM to 4 PM
  
  return {
    hour,
    day,
    month,
    dayOfWeek,
    isPreMarket,
    isAfterHours,
    isRegularHours
  };
};

// Calculate pattern statistics for a group of trades
const calculatePatternStats = (trades: Trade[]): TimePattern | null => {
  if (trades.length === 0) return null;
  
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);
  
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const totalWinningProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const totalLosingProfit = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
  
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const averageProfit = winningTrades.length > 0 ? totalWinningProfit / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLosingProfit / losingTrades.length : 0;
  const profitFactor = totalLosingProfit > 0 ? totalWinningProfit / totalLosingProfit : 0;
  
  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = 0;
  let runningTotal = 0;
  
  trades.forEach(trade => {
    runningTotal += trade.profit;
    if (runningTotal > peak) {
      peak = runningTotal;
    }
    const drawdown = peak - runningTotal;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  const averageTradeDuration = trades.reduce((sum, t) => sum + t.timeInTrade, 0) / trades.length;
  
  return {
    id: '',
    type: 'hour',
    value: 0,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    totalProfit,
    averageProfit,
    averageLoss,
    profitFactor,
    maxDrawdown,
    averageTradeDuration
  };
};

// Analyze hourly patterns
const analyzeHourlyPatterns = (trades: Trade[]): TimePattern[] => {
  const hourlyGroups: { [hour: number]: Trade[] } = {};
  
  // Group trades by hour
  trades.forEach(trade => {
    const hour = extractTradeTimeData(trade).hour;
    if (!hourlyGroups[hour]) {
      hourlyGroups[hour] = [];
    }
    hourlyGroups[hour].push(trade);
  });
  
  // Calculate stats for each hour
  return Object.entries(hourlyGroups).map(([hour, hourTrades]) => {
    const stats = calculatePatternStats(hourTrades);
    if (!stats) return null;
    
    return {
      ...stats,
      id: `hour_${hour}`,
      type: 'hour' as const,
      value: parseInt(hour)
    };
  }).filter(Boolean) as TimePattern[];
};

// Analyze day of week patterns
const analyzeDayOfWeekPatterns = (trades: Trade[]): TimePattern[] => {
  const dayGroups: { [day: number]: Trade[] } = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Group trades by day of week
  trades.forEach(trade => {
    const dayOfWeek = extractTradeTimeData(trade).dayOfWeek;
    if (!dayGroups[dayOfWeek]) {
      dayGroups[dayOfWeek] = [];
    }
    dayGroups[dayOfWeek].push(trade);
  });
  
  // Calculate stats for each day
  return Object.entries(dayGroups).map(([day, dayTrades]) => {
    const stats = calculatePatternStats(dayTrades);
    if (!stats) return null;
    
    return {
      ...stats,
      id: `day_${day}`,
      type: 'dayOfWeek' as const,
      value: dayNames[parseInt(day)]
    };
  }).filter(Boolean) as TimePattern[];
};

// Analyze monthly patterns
const analyzeMonthlyPatterns = (trades: Trade[]): TimePattern[] => {
  const monthGroups: { [month: number]: Trade[] } = {};
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Group trades by month
  trades.forEach(trade => {
    const month = extractTradeTimeData(trade).month;
    if (!monthGroups[month]) {
      monthGroups[month] = [];
    }
    monthGroups[month].push(trade);
  });
  
  // Calculate stats for each month
  return Object.entries(monthGroups).map(([month, monthTrades]) => {
    const stats = calculatePatternStats(monthTrades);
    if (!stats) return null;
    
    return {
      ...stats,
      id: `month_${month}`,
      type: 'month' as const,
      value: monthNames[parseInt(month) - 1]
    };
  }).filter(Boolean) as TimePattern[];
};

// Analyze session patterns
const analyzeSessionPatterns = (trades: Trade[]): {
  preMarket: TimePattern;
  regular: TimePattern;
  afterHours: TimePattern;
} => {
  const preMarketTrades = trades.filter(t => extractTradeTimeData(t).isPreMarket);
  const regularTrades = trades.filter(t => extractTradeTimeData(t).isRegularHours);
  const afterHoursTrades = trades.filter(t => extractTradeTimeData(t).isAfterHours);
  
  const preMarketStats = calculatePatternStats(preMarketTrades) || {
    id: 'session_premarket',
    type: 'hour',
    value: 'Pre-Market',
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalProfit: 0,
    averageProfit: 0,
    averageLoss: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    averageTradeDuration: 0
  };
  
  const regularStats = calculatePatternStats(regularTrades) || {
    id: 'session_regular',
    type: 'hour',
    value: 'Regular Hours',
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalProfit: 0,
    averageProfit: 0,
    averageLoss: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    averageTradeDuration: 0
  };
  
  const afterHoursStats = calculatePatternStats(afterHoursTrades) || {
    id: 'session_afterhours',
    type: 'hour',
    value: 'After Hours',
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalProfit: 0,
    averageProfit: 0,
    averageLoss: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    averageTradeDuration: 0
  };
  
  return {
    preMarket: preMarketStats,
    regular: regularStats,
    afterHours: afterHoursStats
  };
};

// Main function to analyze all time-based patterns
export const analyzeTimePatterns = (trades: Trade[]): PatternAnalysis => {
  const hourlyPatterns = analyzeHourlyPatterns(trades);
  const dailyPatterns = analyzeDayOfWeekPatterns(trades);
  const monthlyPatterns = analyzeMonthlyPatterns(trades);
  const sessionAnalysis = analyzeSessionPatterns(trades);
  
  // Find best and worst performing patterns
  const bestPerformingHours = hourlyPatterns
    .filter(p => p.totalTrades >= 3) // Minimum sample size
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);
    
  const worstPerformingHours = hourlyPatterns
    .filter(p => p.totalTrades >= 3)
    .sort((a, b) => a.winRate - b.winRate)
    .slice(0, 5);
    
  const bestPerformingDays = dailyPatterns
    .filter(p => p.totalTrades >= 3)
    .sort((a, b) => b.winRate - a.winRate);
    
  const worstPerformingDays = dailyPatterns
    .filter(p => p.totalTrades >= 3)
    .sort((a, b) => a.winRate - b.winRate);
  
  return {
    hourlyPatterns,
    dailyPatterns,
    monthlyPatterns,
    dayOfWeekPatterns: dailyPatterns,
    bestPerformingHours,
    worstPerformingHours,
    bestPerformingDays,
    worstPerformingDays,
    sessionAnalysis
  };
};

// Get pattern recommendations based on current time
export const getTimeBasedRecommendations = (trades: Trade[]): {
  currentHourRecommendation: string;
  currentDayRecommendation: string;
  sessionRecommendation: string;
} => {
  const analysis = analyzeTimePatterns(trades);
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  
  // Find current hour pattern
  const currentHourPattern = analysis.hourlyPatterns.find(p => p.value === currentHour);
  const currentDayPattern = analysis.dayOfWeekPatterns.find(p => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return p.value === dayNames[currentDay];
  });
  
  // Generate recommendations
  const currentHourRecommendation = currentHourPattern 
    ? `Current hour (${currentHour}:00): ${currentHourPattern.winRate.toFixed(1)}% win rate, ${currentHourPattern.totalTrades} trades`
    : `No data for current hour (${currentHour}:00)`;
    
  const currentDayRecommendation = currentDayPattern
    ? `Current day (${currentDayPattern.value}): ${currentDayPattern.winRate.toFixed(1)}% win rate, ${currentDayPattern.totalTrades} trades`
    : `No data for current day`;
    
  const sessionRecommendation = (() => {
    const { preMarket, regular, afterHours } = analysis.sessionAnalysis;
    if (now.getHours() >= 4 && now.getHours() < 9) {
      return `Pre-market session: ${preMarket.winRate.toFixed(1)}% win rate, ${preMarket.totalTrades} trades`;
    } else if (now.getHours() >= 9 && now.getHours() < 16) {
      return `Regular hours: ${regular.winRate.toFixed(1)}% win rate, ${regular.totalTrades} trades`;
    } else if (now.getHours() >= 16 && now.getHours() < 20) {
      return `After hours: ${afterHours.winRate.toFixed(1)}% win rate, ${afterHours.totalTrades} trades`;
    }
    return 'Outside trading hours';
  })();
  
  return {
    currentHourRecommendation,
    currentDayRecommendation,
    sessionRecommendation
  };
}; 