import { Trade, PlaybookEntry } from '../types';

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F' | null;

/**
 * Calculates an execution grade based on checklist adherence and trade outcome.
 * @param trade The trade object, which must have an `execution` property.
 * @param playbookEntry The corresponding playbook entry with the checklist.
 * @returns A letter grade.
 */
export const calculateGrade = (trade: Trade, playbookEntry: PlaybookEntry | undefined): Grade => {
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