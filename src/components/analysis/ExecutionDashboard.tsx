import React, { useMemo } from 'react';
import { Trade, PlaybookEntry } from '../../types';
import { PieChartRenderer } from '../charts/PieChartRenderer';
import { Grade, ALL_GRADES, analyzeChecklistPerformance } from '../../utils/grading';
import { ExclamationTriangleIcon } from '../ui/Icons';

interface ExecutionDashboardProps {
  trades: Trade[];
  playbookEntries: PlaybookEntry[];
}

export const ExecutionDashboard: React.FC<ExecutionDashboardProps> = ({ trades, playbookEntries }) => {
  
  const performanceByGrade = useMemo(() => {
    const data: { [key in Grade]: { totalPnl: number; tradeCount: number } } = {} as any;

    ALL_GRADES.forEach(g => {
        data[g] = { totalPnl: 0, tradeCount: 0 };
    });

    trades.forEach(trade => {
      if (trade.execution?.grade) {
        const grade = trade.execution.grade as Grade;
        if (data[grade]) {
          data[grade].totalPnl += trade.profit;
          data[grade].tradeCount++;
        }
      }
    });
    return data;
  }, [trades]);

  const commonMistakes = useMemo(() => {
    return analyzeChecklistPerformance(trades, playbookEntries).slice(0, 5); // Get top 5
  }, [trades, playbookEntries]);

  const gradedTrades = trades.filter(t => t.execution && t.execution.grade);

  if (gradedTrades.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Execution Dashboard</h3>
        <p className="text-gray-400">No graded trades found. Start by assigning a strategy from your playbook to a trade and completing the execution checklist.</p>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(performanceByGrade),
    datasets: [{
      label: 'Total P&L by Grade',
      data: Object.values(performanceByGrade).map(d => d.totalPnl),
      backgroundColor: Object.keys(performanceByGrade).map(grade => {
        if (grade.startsWith('A')) return '#2ECC71';
        if (grade.startsWith('B')) return '#3498DB';
        if (grade.startsWith('C')) return '#F1C40F';
        if (grade.startsWith('D')) return '#E67E22';
        if (grade.startsWith('F')) return '#E74C3C';
        return '#95A5A6';
      })
    }]
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-8">
      <h3 className="text-2xl font-semibold text-white text-center">Execution Dashboard</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left side: Charts and Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-purple-300 font-semibold mb-2">P&L by Grade</h4>
            <div style={{ height: '300px' }}>
              <PieChartRenderer data={Object.entries(performanceByGrade).map(([grade, stats]) => {
                let color = '#95A5A6';
                if (grade.startsWith('A')) color = '#2ECC71';
                else if (grade.startsWith('B')) color = '#3498DB';
                else if (grade.startsWith('C')) color = '#F1C40F';
                else if (grade.startsWith('D')) color = '#E67E22';
                else if (grade.startsWith('F')) color = '#E74C3C';
                return { name: grade, value: stats.totalPnl, fill: color };
              })} />
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-purple-300 font-semibold mb-2">Grade Statistics</h4>
            <ul className="space-y-2 text-sm">
              {Object.entries(performanceByGrade).map(([grade, stats]) => (
                stats.tradeCount > 0 && (
                  <li key={grade} className="flex justify-between items-center text-gray-300">
                    <span>Grade <strong className="font-bold text-white">{grade}</strong></span>
                    <div className="text-right">
                      <div>{stats.tradeCount} trades</div>
                      <div className={stats.totalPnl >= 0 ? 'text-success' : 'text-error'}>
                        ${stats.totalPnl.toFixed(2)}
                      </div>
                    </div>
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>

        {/* Right side: Common Mistakes */}
        <div className="lg:col-span-2 bg-gray-700 p-4 rounded-lg">
          <h4 className="text-orange-400 font-semibold mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            Top Execution Leaks
          </h4>
          {commonMistakes.length > 0 ? (
            <ul className="space-y-4">
              {commonMistakes.map(mistake => (
                <li key={mistake.itemId}>
                  <p className="text-gray-200 text-sm mb-1">{mistake.itemText}</p>
                  <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div 
                      className="bg-red-500 h-2.5 rounded-full" 
                      style={{ width: `${mistake.failureRate * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-right text-gray-400 mt-1">
                    Failed {mistake.failureCount} of {mistake.totalOccurrences} times ({Math.round(mistake.failureRate * 100)}%)
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No common mistakes found. Great job on your execution!</p>
          )}
        </div>
      </div>
    </div>
  );
}; 