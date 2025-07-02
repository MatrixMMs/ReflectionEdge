import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircleIcon, CustomCalculatorIcon, CustomDashboardIcon, CustomPlaybookIcon, CustomSettingsIcon, CustomBestWorstIcon, CustomExecutionIcon, CustomInsightsIcon, CustomPatternIcon, CustomTagsIcon, CustomMBSIcon, CustomMBSHistoryIcon, CustomExportIcon, CustomImportIcon, CustomEdgeIcon } from './Icons';

// Add custom ChevronLeft and ChevronRight icons
const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
);
const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
);

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onImportClick: () => void;
  onMBSClick: () => void;
  onAddTradeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  onImportClick,
  onMBSClick,
  onAddTradeClick
}) => {
  return (
    <aside
      className={
        `bg-gray-800 flex flex-col justify-between py-6 min-h-screen fixed left-0 top-0 z-40 shadow-xl transition-[width,padding] duration-300`
      }
      style={{
        width: sidebarCollapsed ? '5rem' : '16rem',
        paddingLeft: sidebarCollapsed ? '0.5rem' : '1rem',
        paddingRight: sidebarCollapsed ? '0.5rem' : '1rem',
      }}
    >
      <style>{`
        .sidebar-label {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          transition: width 0.3s, opacity 0.3s, transform 0.3s;
        }
        .sidebar-label.collapsed {
          width: 0;
          opacity: 0;
          transform: translateX(24px);
          pointer-events: none;
        }
        .sidebar-label.expanded {
          width: 180px;
          opacity: 1;
          transform: translateX(0);
        }
        .sidebar-tooltip {
          position: absolute;
          left: 110%;
          top: 50%;
          transform: translateY(-50%);
          background: #374151;
          color: #fff;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          z-index: 50;
        }
        .group:hover .sidebar-tooltip {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
      <div>
        {/* Logo/Title */}
        <div className="flex items-center mb-6 justify-start">
          <span className={`inline-block w-8 h-8 bg-gradient-to-tr from-purple-400 via-pink-400 to-yellow-400 rounded-lg flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-3.5' : 'ml-1'}`} />
          <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'} text-2xl font-bold tracking-tight align-middle`}>Reflection Edge</span>
        </div>
        
        {/* Divider above Dashboard */}
        <div className="my-2 border-t border-gray-700" />
        
        {/* Dashboard Link */}
        <nav className="space-y-2">
          <Link to="/" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            <CustomDashboardIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
            <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Dashboard</span>
            {sidebarCollapsed && <span className="sidebar-tooltip">Dashboard</span>}
          </Link>
          <Link to="/dashboard-test" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            <CustomDashboardIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
            <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Dashboard Test</span>
            {sidebarCollapsed && <span className="sidebar-tooltip">Dashboard Test</span>}
          </Link>
        </nav>
        
        {/* Divider below Dashboard */}
        <div className="my-2 border-t border-gray-700" />
        
        {/* Nav Links */}
        <nav className="space-y-2">
          {/* Section 1: Playbook & Tags */}
          <div>
            <Link to="/playbook" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomPlaybookIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Playbook</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Playbook</span>}
            </Link>
            <Link to="/playbook-sandbox" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomPlaybookIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Playbook Sandbox</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Playbook Sandbox</span>}
            </Link>
            <Link to="/tags" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomTagsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Tags</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Tags</span>}
            </Link>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 2: Performance & Analysis */}
          <div>
            <Link to="/patterns" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomPatternIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Patterns</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Patterns</span>}
            </Link>
            <Link to="/insights" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomInsightsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Insights</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Insights</span>}
            </Link>
            <Link to="/edge" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomEdgeIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Edge</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Edge</span>}
            </Link>
            <Link to="/kelly" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomCalculatorIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Kelly</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Kelly</span>}
            </Link>
            <Link to="/execution" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomExecutionIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Execution</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Execution</span>}
            </Link>
            <Link to="/bestworst" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomBestWorstIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Best & Worst</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Best & Worst</span>}
            </Link>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 3: MBS */}
          <div>
            <button 
              onClick={onMBSClick} 
              className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <CustomMBSIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>MBS</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">MBS</span>}
            </button>
            <Link to="/mbs-history" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomMBSHistoryIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>MBS History</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">MBS History</span>}
            </Link>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 4: Data & Settings */}
          <div>
            <button 
              onClick={onImportClick} 
              className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <CustomImportIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Import</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Import</span>}
            </button>
            <Link to="/export" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomExportIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Export</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Export</span>}
            </Link>
            <Link to="/settings" className="group relative flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomSettingsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Settings</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Settings</span>}
            </Link>
            <div className="flex justify-center w-full" style={{ position: 'relative' }}>
              {/* Expanded state button (rectangle) */}
              <button
                onClick={onAddTradeClick}
                className={`group flex items-center mt-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg shadow-md text-sm transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 w-full h-10 px-4 justify-center`}
                style={{ 
                  minHeight: '40px',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: sidebarCollapsed ? 0 : 1,
                  pointerEvents: sidebarCollapsed ? 'none' : 'auto',
                  transition: 'opacity 0.3s ease'
                }}
                title="Add Trade"
              >
                <span className="font-medium">Add Trade</span>
              </button>
              
              {/* Collapsed state button (square) */}
              <button
                onClick={onAddTradeClick}
                className={`group flex items-center mt-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg shadow-md text-sm transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 w-10 h-10 px-0 justify-center`}
                style={{ 
                  minHeight: '40px',
                  minWidth: '40px',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: sidebarCollapsed ? 1 : 0,
                  pointerEvents: sidebarCollapsed ? 'auto' : 'none',
                  transition: 'opacity 0.3s ease'
                }}
                title="Add Trade"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                {sidebarCollapsed && <span className="sidebar-tooltip">Add Trade</span>}
              </button>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Collapse/Expand Button - floating at right edge with roll animation */}
      <div style={{ position: 'absolute', right: '-18px', bottom: '32px', zIndex: 60 }}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ border: 'none', padding: 0, outline: 'none' }}
        >
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
              transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 