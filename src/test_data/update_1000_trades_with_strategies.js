import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Strategy mapping based on setup tags
const strategyMapping = {
  'mean_reversion': 'mean_reversion_strategy',
  'momentum': 'momentum_strategy',
  'trend': 'trend_following_strategy',
  'stop_runs': 'stop_run_strategy',
  'failed_auction': 'failed_auction_strategy'
};

// Checklist items for each strategy
const checklistItems = {
  'mean_reversion_strategy': ['mr_1', 'mr_2', 'mr_3', 'mr_4', 'mr_5', 'mr_6', 'mr_7', 'mr_8'],
  'momentum_strategy': ['mom_1', 'mom_2', 'mom_3', 'mom_4', 'mom_5', 'mom_6', 'mom_7', 'mom_8'],
  'trend_following_strategy': ['tf_1', 'tf_2', 'tf_3', 'tf_4', 'tf_5', 'tf_6', 'tf_7', 'tf_8'],
  'stop_run_strategy': ['sr_1', 'sr_2', 'sr_3', 'sr_4', 'sr_5', 'sr_6', 'sr_7', 'sr_8'],
  'failed_auction_strategy': ['fa_1', 'fa_2', 'fa_3', 'fa_4', 'fa_5', 'fa_6', 'fa_7', 'fa_8']
};

// Generate realistic execution data based on profit and setup
function generateExecutionData(trade) {
  const setup = trade.tags.setup;
  const strategyId = strategyMapping[setup];
  const checklistKeys = checklistItems[strategyId];
  
  if (!strategyId || !checklistKeys) {
    return null;
  }

  // Base completion rate on profit (profitable trades tend to have better execution)
  const isProfitable = trade.profit > 0;
  const baseCompletionRate = isProfitable ? 0.85 : 0.65;
  
  // Add some randomness
  const completionRate = Math.max(0.3, Math.min(1.0, baseCompletionRate + (Math.random() - 0.5) * 0.4));
  
  // Generate checklist completion
  const checklist = {};
  checklistKeys.forEach(key => {
    checklist[key] = Math.random() < completionRate;
  });
  
  // Calculate grade based on completion rate
  let grade;
  if (completionRate >= 0.9) grade = 'A+';
  else if (completionRate >= 0.8) grade = 'A';
  else if (completionRate >= 0.7) grade = 'B+';
  else if (completionRate >= 0.6) grade = 'B';
  else if (completionRate >= 0.5) grade = 'B-';
  else if (completionRate >= 0.4) grade = 'C+';
  else if (completionRate >= 0.3) grade = 'C';
  else grade = 'C-';
  
  // Generate notes based on performance
  let notes = '';
  if (grade === 'A+') {
    notes = 'Perfect execution - followed all checklist items';
  } else if (grade.startsWith('A')) {
    notes = 'Excellent execution with minor checklist misses';
  } else if (grade.startsWith('B')) {
    notes = 'Good execution but missed some key checklist items';
  } else {
    notes = 'Poor execution - significant checklist failures';
  }
  
  return {
    strategyId,
    execution: {
      checklist,
      grade,
      notes
    }
  };
}

// Read the existing file
const filePath = path.join(__dirname, 'ES_futures_1000_trades_test.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log(`Processing ${data.trades.length} trades...`);

// Update each trade with strategy and execution data
data.trades.forEach((trade, index) => {
  const executionData = generateExecutionData(trade);
  
  if (executionData) {
    trade.strategyId = executionData.strategyId;
    trade.execution = executionData.execution;
  }
  
  // Progress indicator
  if ((index + 1) % 100 === 0) {
    console.log(`Processed ${index + 1} trades...`);
  }
});

// Write the updated file
const outputPath = path.join(__dirname, 'ES_futures_1000_trades_with_strategies.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`\nUpdated file saved to: ${outputPath}`);
console.log(`Total trades processed: ${data.trades.length}`);

// Generate summary statistics
const strategyStats = {};
const gradeStats = {};

data.trades.forEach(trade => {
  if (trade.strategyId) {
    strategyStats[trade.strategyId] = (strategyStats[trade.strategyId] || 0) + 1;
  }
  if (trade.execution?.grade) {
    gradeStats[trade.execution.grade] = (gradeStats[trade.execution.grade] || 0) + 1;
  }
});

console.log('\nStrategy Distribution:');
Object.entries(strategyStats).forEach(([strategy, count]) => {
  console.log(`  ${strategy}: ${count} trades`);
});

console.log('\nGrade Distribution:');
Object.entries(gradeStats).forEach(([grade, count]) => {
  console.log(`  ${grade}: ${count} trades`);
}); 