import React, { useState } from 'react';
import { Trade } from '../types';
import { Button } from '../components/ui/Button';
import { ExportIcon } from '../components/ui/Icons';

interface ExportPageProps {
  initialTrades: Trade[];
}

function exportTradesToCsv(trades: Trade[]) {
  if (!trades.length) return;
  const replacer = (key: string, value: any) => (value === null ? '' : value);
  const header = Object.keys(trades[0]);
  const csv = [
    header.join(','),
    ...trades.map(row =>
      header.map(fieldName => JSON.stringify((row as any)[fieldName], replacer)).join(',')
    ),
  ].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trades-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

const ExportPage: React.FC<ExportPageProps> = ({ initialTrades }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);

  const handleExport = () => {
    exportTradesToCsv(trades);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6" style={{ background: 'var(--background-main)', color: 'var(--text-white)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-8" style={{ color: 'var(--text-accent)' }}>Export Data</h1>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 flex flex-col items-center" style={{ background: 'var(--background-secondary)' }}>
          <p className="mb-4 text-gray-300">Export your trades as a CSV file for backup or analysis in other tools.</p>
          <Button onClick={handleExport} variant="primary" leftIcon={<ExportIcon className="w-5 h-5" />}>
            Export to CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage; 