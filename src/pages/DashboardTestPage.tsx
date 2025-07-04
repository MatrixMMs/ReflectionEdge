import React from 'react';

const DashboardTestPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100" style={{ background: 'var(--background-main)', color: 'var(--text-white)' }}>
      {/* Controls Panel */}
      <aside className="w-64 bg-gray-800 p-6 flex-shrink-0 border-r border-gray-700" style={{ background: 'var(--background-secondary)', borderColor: 'var(--border-main)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Controls</h2>
        <div className="mb-4">
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Date Range</label>
          <input type="date" className="bg-gray-700 rounded px-2 py-1 w-full mb-2" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }} />
          <input type="date" className="bg-gray-700 rounded px-2 py-1 w-full" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }} />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Tag Filter</label>
          <input type="text" className="bg-gray-700 rounded px-2 py-1 w-full" placeholder="Type to filter tags..." style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }} />
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 mt-2" style={{ background: 'var(--accent-blue)', color: 'var(--text-white)' }}>Apply Filters</button>
      </aside>
      {/* Main Dashboard Grid */}
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6 h-full">
          {/* Widget 1: KPIs */}
          <section className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between shadow col-span-1 row-span-1" style={{ background: 'var(--background-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Key Performance Indicators</h3>
            <div className="flex space-x-4">
              {/* KPI Cards */}
              <div className="bg-gray-900 rounded-lg p-4 flex-1 flex flex-col items-center" style={{ background: 'var(--background-tertiary)' }}>
                <span className="text-sm text-gray-400" style={{ color: 'var(--text-secondary)' }}>Net P&L</span>
                <span className="text-2xl font-bold text-green-400" style={{ color: 'var(--accent-green)' }}>$12,345</span>
                <span className="text-xs text-green-400" style={{ color: 'var(--accent-green)' }}>+8% vs prev.</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 flex-1 flex flex-col items-center" style={{ background: 'var(--background-tertiary)' }}>
                <span className="text-sm text-gray-400" style={{ color: 'var(--text-secondary)' }}>Win Rate</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>62%</span>
                <span className="text-xs text-green-400" style={{ color: 'var(--accent-green)' }}>+3% vs prev.</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 flex-1 flex flex-col items-center" style={{ background: 'var(--background-tertiary)' }}>
                <span className="text-sm text-gray-400" style={{ color: 'var(--text-secondary)' }}>Profit Factor</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>1.8</span>
                <span className="text-xs text-green-400" style={{ color: 'var(--accent-green)' }}>+0.2 vs prev.</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 flex-1 flex flex-col items-center" style={{ background: 'var(--background-tertiary)' }}>
                <span className="text-sm text-gray-400" style={{ color: 'var(--text-secondary)' }}>Avg. Win / Avg. Loss</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>1.3</span>
                <span className="text-xs text-red-400" style={{ color: 'var(--accent-red)' }}>-0.1 vs prev.</span>
              </div>
            </div>
          </section>
          {/* Widget 2: Performance Chart */}
          <section className="bg-gray-800 rounded-lg p-6 flex flex-col shadow col-span-1 row-span-1" style={{ background: 'var(--background-secondary)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Performance Chart</h3>
              <div className="flex space-x-2">
                {/* Quick Filters */}
                <button className="bg-gray-700 hover:bg-blue-600 text-xs px-3 py-1 rounded" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>7D</button>
                <button className="bg-gray-700 hover:bg-blue-600 text-xs px-3 py-1 rounded" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>30D</button>
                <button className="bg-gray-700 hover:bg-blue-600 text-xs px-3 py-1 rounded" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>90D</button>
                <button className="bg-gray-700 hover:bg-blue-600 text-xs px-3 py-1 rounded" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>YTD</button>
                <button className="bg-gray-700 hover:bg-blue-600 text-xs px-3 py-1 rounded" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>ALL</button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {/* Placeholder for chart */}
              <div className="w-full h-40 bg-gray-900 rounded flex items-center justify-center text-gray-500" style={{ background: 'var(--background-tertiary)', color: 'var(--text-secondary)' }}>[Cumulative P&L Line Chart]</div>
            </div>
          </section>
          {/* Widget 3: Strengths & Weaknesses */}
          <section className="bg-gray-800 rounded-lg p-6 flex flex-col shadow col-span-1 row-span-1" style={{ background: 'var(--background-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Strengths & Weaknesses</h3>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Strengths */}
              <div className="flex-1">
                <h4 className="font-semibold text-green-400 mb-2" style={{ color: 'var(--accent-green)' }}>Top Performing Setups</h4>
                <ul className="space-y-2">
                  <li><button className="w-full text-left bg-gray-900 hover:bg-green-900 rounded px-3 py-2" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>Tag: Post-FOMC Volatility <span className="ml-2 text-green-400" style={{ color: 'var(--accent-green)' }}>$2,000</span></button></li>
                  <li><button className="w-full text-left bg-gray-900 hover:bg-green-900 rounded px-3 py-2" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>Tag: Opening Range Breakout <span className="ml-2 text-green-400" style={{ color: 'var(--accent-green)' }}>$1,500</span></button></li>
                  <li><button className="w-full text-left bg-gray-900 hover:bg-green-900 rounded px-3 py-2" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>Tag: Trend Continuation <span className="ml-2 text-green-400" style={{ color: 'var(--accent-green)' }}>$1,200</span></button></li>
                </ul>
              </div>
              {/* Weaknesses */}
              <div className="flex-1">
                <h4 className="font-semibold text-red-400 mb-2" style={{ color: 'var(--accent-red)' }}>Biggest Leaks</h4>
                <ul className="space-y-2">
                  <li><button className="w-full text-left bg-gray-900 hover:bg-red-900 rounded px-3 py-2" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>Tag: FOMO Chase <span className="ml-2 text-red-400" style={{ color: 'var(--accent-red)' }}>-$800</span></button></li>
                  <li><button className="w-full text-left bg-gray-900 hover:bg-red-900 rounded px-3 py-2" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>Tag: Revenge Trading <span className="ml-2 text-red-400" style={{ color: 'var(--accent-red)' }}>-$500</span></button></li>
                  <li><button className="w-full text-left bg-gray-900 hover:bg-red-900 rounded px-3 py-2" style={{ background: 'var(--background-tertiary)', color: 'var(--text-white)' }}>Tag: Overtrading <span className="ml-2 text-red-400" style={{ color: 'var(--accent-red)' }}>-$300</span></button></li>
                </ul>
              </div>
            </div>
          </section>
          {/* Widget 4: Recent Trades */}
          <section className="bg-gray-800 rounded-lg p-6 flex flex-col shadow col-span-1 row-span-1" style={{ background: 'var(--background-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Recent Trades</h3>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left py-1" style={{ color: 'var(--text-secondary)' }}>Date</th>
                  <th className="text-left py-1" style={{ color: 'var(--text-secondary)' }}>Symbol</th>
                  <th className="text-left py-1" style={{ color: 'var(--text-secondary)' }}>Direction</th>
                  <th className="text-left py-1" style={{ color: 'var(--text-secondary)' }}>P&L</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700" style={{ borderColor: 'var(--border-main)' }}>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>2024-05-01</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>ES</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>Long</td>
                  <td className="py-1 text-green-400" style={{ color: 'var(--accent-green)' }}>$500</td>
                </tr>
                <tr className="border-t border-gray-700" style={{ borderColor: 'var(--border-main)' }}>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>2024-04-30</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>NQ</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>Short</td>
                  <td className="py-1 text-red-400" style={{ color: 'var(--accent-red)' }}>-$200</td>
                </tr>
                <tr className="border-t border-gray-700" style={{ borderColor: 'var(--border-main)' }}>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>2024-04-29</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>CL</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>Long</td>
                  <td className="py-1 text-green-400" style={{ color: 'var(--accent-green)' }}>$300</td>
                </tr>
                <tr className="border-t border-gray-700" style={{ borderColor: 'var(--border-main)' }}>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>2024-04-28</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>GC</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>Short</td>
                  <td className="py-1 text-green-400" style={{ color: 'var(--accent-green)' }}>$150</td>
                </tr>
                <tr className="border-t border-gray-700" style={{ borderColor: 'var(--border-main)' }}>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>2024-04-27</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>ES</td>
                  <td className="py-1" style={{ color: 'var(--text-white)' }}>Long</td>
                  <td className="py-1 text-red-400" style={{ color: 'var(--accent-red)' }}>-$100</td>
                </tr>
              </tbody>
            </table>
            <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 self-end" style={{ background: 'var(--accent-blue)', color: 'var(--text-white)' }}>Go to Full Trade Log</button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardTestPage; 