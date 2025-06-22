import { Trade, PlaybookEntry } from '../types';

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
export type NullableGrade = Grade | null;

export const ALL_GRADES: Grade[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

/**
 * Calculates an execution grade based on checklist adherence and trade outcome.
 * @param trade The trade object, which must have an `execution` property.
 * @param playbookEntry The corresponding playbook entry with the checklist.
 * @returns A letter grade.
 */
export const calculateGrade = (trade: Trade, playbookEntry: PlaybookEntry | undefined): NullableGrade => {
  if (!trade.execution || !playbookEntry || playbookEntry.checklist.length === 0) {
    return null; // Cannot grade without execution data or a checklist
  }

  const { checklist: checkedItems } = trade.execution;
  const totalItems = playbookEntry.checklist.length;
  
  const checkedCount = Object.values(checkedItems).filter(isChecked => isChecked).length;
  const adherence = (checkedCount / totalItems) * 100;

  const isWin = trade.profit > 0;

  if (adherence >= 90) {
    if (isWin) return 'A+';
    return 'A-';
  }
  if (adherence >= 75) {
    if (isWin) return 'B+';
    return 'B-';
  }
  if (adherence >= 60) {
    if (isWin) return 'C+';
    return 'C-';
  }
  if (adherence >= 50) {
    return 'D';
  }
  
  return 'F';
};

export interface ChecklistAnalysisResult {
  itemId: string;
  itemText: string;
  failureCount: number;
  totalOccurrences: number;
  failureRate: number;
}

/**
 * Analyzes all trades to find the most commonly failed checklist items.
 * @param trades A list of all trades.
 * @param playbookEntries A list of all playbook entries.
 * @returns An array of checklist items sorted by their failure rate.
 */
export const analyzeChecklistPerformance = (trades: Trade[], playbookEntries: PlaybookEntry[]): ChecklistAnalysisResult[] => {
  const itemStats: { [itemId: string]: { text: string; failures: number; occurrences: number } } = {};

  // First, create a map of all possible checklist items from the playbooks
  playbookEntries.forEach(playbook => {
    playbook.checklist.forEach(item => {
      if (!itemStats[item.id]) {
        itemStats[item.id] = { text: item.item, failures: 0, occurrences: 0 };
      }
    });
  });

  // Now, iterate through trades to count failures and occurrences
  trades.forEach(trade => {
    if (!trade.strategyId || !trade.execution) return;

    const playbook = playbookEntries.find(p => p.id === trade.strategyId);
    if (!playbook) return;

    playbook.checklist.forEach(item => {
      // It's an occurrence if the trade used this playbook
      itemStats[item.id].occurrences++;

      // It's a failure if the checklist item is explicitly false
      if (trade.execution?.checklist[item.id] === false) {
        itemStats[item.id].failures++;
      }
    });
  });

  // Calculate failure rates and format the output
  const results = Object.entries(itemStats)
    .map(([itemId, stats]) => ({
      itemId,
      itemText: stats.text,
      failureCount: stats.failures,
      totalOccurrences: stats.occurrences,
      failureRate: stats.occurrences > 0 ? stats.failures / stats.occurrences : 0,
    }))
    .filter(result => result.totalOccurrences > 0); // Only include items that have appeared at least once

  // Sort by the highest failure rate
  return results.sort((a, b) => b.failureRate - a.failureRate);
}; 