import React, { useMemo } from 'react';
import { Trade, PlaybookEntry } from '../../types';
import { PieChartRenderer } from '../charts/PieChartRenderer';
import { Grade } from '../../utils/grading';

interface ExecutionDashboardProps {
  trades: Trade[];
  playbookEntries: PlaybookEntry[];
}

export const ExecutionDashboard: React.FC<ExecutionDashboardProps> = ({ trades, playbookEntries }) => {
  
  const performanceByGrade = useMemo(() => {
    const grades: Grade[] = ['A+', 'A-', 'B+', 'B-', 'C+', 'C-', 'D', 'F'];
    const data: { [key in Grade]: { totalPnl: number; tradeCount: number } } = {};

    grades.forEach(g => {
        data[g] = { totalPnl: 0, tradeCount: 0 };
    });

    trades.forEach(trade => {
      if (trade.execution?.grade) {
        const grade = trade.execution.grade;
        if (data[grade]) {
          data[grade].totalPnl += trade.profit;
          data[grade].tradeCount++;
        }
      }
    });
    return data;
  }, [trades]);

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
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Execution Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gray-700 p-4 rounded-lg">
          <h4 className="text-purple-300 font-semibold mb-2">Performance by Grade</h4>
          <div style={{ height: '300px' }}>
            <PieChartRenderer data={chartData} type="bar" />
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-purple-300 font-semibold mb-2">Grade Statistics</h4>
          <ul className="space-y-2 text-sm">
            {Object.entries(performanceByGrade).map(([grade, stats]) => (
              <li key={grade} className="flex justify-between items-center text-gray-300">
                <span>Grade <strong className="font-bold text-white">{grade}</strong></span>
                <div className="text-right">
                  <div>{stats.tradeCount} trades</div>
                  <div className={stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${stats.totalPnl.toFixed(2)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}; 