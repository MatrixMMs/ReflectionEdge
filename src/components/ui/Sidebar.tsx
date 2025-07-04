import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className="flex flex-col justify-between py-6 min-h-screen fixed left-0 top-0 z-40 shadow-xl transition-[width,padding] duration-300"
      style={{
        width: sidebarCollapsed ? '5rem' : '16rem',
        paddingLeft: sidebarCollapsed ? '0.5rem' : '1rem',
        paddingRight: sidebarCollapsed ? '0.5rem' : '1rem',
        backgroundColor: 'var(--background-secondary)',
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
          background: var(--background-tertiary);
          color: var(--text-white);
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
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          width: 100%;
          justify-content: start;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          color: var(--text-secondary);
          text-decoration: none;
          position: relative;
        }
        .sidebar-nav-link:hover {
          background-color: var(--background-tertiary);
          color: var(--text-main);
        }
        .sidebar-nav-link.active {
          background: linear-gradient(135deg, rgba(45, 207, 122, 0.15) 0%, rgba(36, 166, 98, 0.1) 50%, transparent 100%);
          color: var(--text-main);
        }
        .sidebar-nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: var(--accent-green);
          border-radius: 0.5rem 0 0 0.5rem;
        }
        .sidebar-divider {
          margin: 0.5rem 0;
          border-top: 1px solid var(--border-main);
        }
        .sidebar-button {
          background: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-green-dark) 100%);
          color: var(--text-white);
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          font-size: 0.875rem;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1rem;
        }
        .sidebar-button:hover {
          transform: scale(1.05);
        }
        .sidebar-button:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--accent-green);
        }
        .collapse-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background-color: var(--background-secondary);
          color: var(--text-secondary);
          transition: all 0.2s;
          border: none;
          padding: 0;
          outline: none;
        }
        .collapse-button:hover {
          color: var(--text-white);
          background-color: var(--background-tertiary);
        }
      `}</style>
      <div>
        {/* Logo/Title */}
        <div className="flex items-center mb-6 justify-start">
          <span className={`inline-block w-8 h-8 bg-gradient-to-tr from-purple-400 via-pink-400 to-yellow-400 rounded-lg flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-3.5' : 'ml-1'}`} />
          <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'} text-2xl font-bold tracking-tight align-middle`} style={{ color: 'var(--text-main)' }}>Reflection Edge</span>
        </div>
        
        {/* Divider above Dashboard */}
        <div className="sidebar-divider" />
        
        {/* Dashboard Link */}
        <nav className="space-y-2">
          <Link to="/" className={`group relative sidebar-nav-link ${isActive('/') ? 'active' : ''}`}>
            <CustomDashboardIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
            <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Dashboard</span>
            {sidebarCollapsed && <span className="sidebar-tooltip">Dashboard</span>}
          </Link>
          <Link to="/dashboard-test" className={`group relative sidebar-nav-link ${isActive('/dashboard-test') ? 'active' : ''}`}>
            <CustomDashboardIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
            <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Dashboard Test</span>
            {sidebarCollapsed && <span className="sidebar-tooltip">Dashboard Test</span>}
          </Link>
        </nav>
        
        {/* Divider below Dashboard */}
        <div className="sidebar-divider" />
        
        {/* Nav Links */}
        <nav className="space-y-2">
          {/* Section 1: Playbook & Tags */}
          <div>
            <Link to="/playbook" className={`group relative sidebar-nav-link ${isActive('/playbook') ? 'active' : ''}`}>
              <CustomPlaybookIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Playbook</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Playbook</span>}
            </Link>
            <Link to="/playbook-sandbox" className={`group relative sidebar-nav-link ${isActive('/playbook-sandbox') ? 'active' : ''}`}>
              <CustomPlaybookIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Playbook Sandbox</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Playbook Sandbox</span>}
            </Link>
            <Link to="/tags" className={`group relative sidebar-nav-link ${isActive('/tags') ? 'active' : ''}`}>
              <CustomTagsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Tags</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Tags</span>}
            </Link>
          </div>
          
          <div className="sidebar-divider" />
          
          {/* Section 2: Performance & Analysis */}
          <div>
            <Link to="/patterns" className={`group relative sidebar-nav-link ${isActive('/patterns') ? 'active' : ''}`}>
              <CustomPatternIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Patterns</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Patterns</span>}
            </Link>
            <Link to="/insights" className={`group relative sidebar-nav-link ${isActive('/insights') ? 'active' : ''}`}>
              <CustomInsightsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Insights</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Insights</span>}
            </Link>
            <Link to="/edge" className={`group relative sidebar-nav-link ${isActive('/edge') ? 'active' : ''}`}>
              <CustomEdgeIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Edge</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Edge</span>}
            </Link>
            <Link to="/kelly" className={`group relative sidebar-nav-link ${isActive('/kelly') ? 'active' : ''}`}>
              <CustomCalculatorIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Kelly</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Kelly</span>}
            </Link>
            <Link to="/execution" className={`group relative sidebar-nav-link ${isActive('/execution') ? 'active' : ''}`}>
              <CustomExecutionIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Execution</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Execution</span>}
            </Link>
            <Link to="/bestworst" className={`group relative sidebar-nav-link ${isActive('/bestworst') ? 'active' : ''}`}>
              <CustomBestWorstIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Best & Worst</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Best & Worst</span>}
            </Link>
          </div>
          
          <div className="sidebar-divider" />
          
          {/* Section 3: MBS */}
          <div>
            <button 
              onClick={onMBSClick} 
              className="group relative sidebar-nav-link text-left"
            >
              <CustomMBSIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>MBS</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">MBS</span>}
            </button>
            <Link to="/mbs-history" className={`group relative sidebar-nav-link ${isActive('/mbs-history') ? 'active' : ''}`}>
              <CustomMBSHistoryIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>MBS History</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">MBS History</span>}
            </Link>
          </div>
          
          <div className="sidebar-divider" />
          
          {/* Section 4: Data & Settings */}
          <div>
            <button 
              onClick={onImportClick} 
              className="group relative sidebar-nav-link text-left"
            >
              <CustomImportIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Import</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Import</span>}
            </button>
            <Link to="/export" className={`group relative sidebar-nav-link ${isActive('/export') ? 'active' : ''}`}>
              <CustomExportIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Export</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Export</span>}
            </Link>
            <Link to="/settings" className={`group relative sidebar-nav-link ${isActive('/settings') ? 'active' : ''}`}>
              <CustomSettingsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Settings</span>
              {sidebarCollapsed && <span className="sidebar-tooltip">Settings</span>}
            </Link>
            <div className="flex justify-center w-full" style={{ position: 'relative' }}>
              {/* Expanded state button (rectangle) */}
              <button
                onClick={onAddTradeClick}
                className="sidebar-button"
                style={{ 
                  minHeight: '40px',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: sidebarCollapsed ? 0 : 1,
                  pointerEvents: sidebarCollapsed ? 'none' : 'auto',
                  transition: 'opacity 0.3s ease',
                  width: '100%',
                  height: '40px',
                  padding: '0 1rem'
                }}
                title="Add Trade"
              >
                <span className="font-medium">Add Trade</span>
              </button>
              
              {/* Collapsed state button (square) */}
              <button
                onClick={onAddTradeClick}
                className="sidebar-button"
                style={{ 
                  minHeight: '40px',
                  minWidth: '40px',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: sidebarCollapsed ? 1 : 0,
                  pointerEvents: sidebarCollapsed ? 'auto' : 'none',
                  transition: 'opacity 0.3s ease',
                  width: '40px',
                  height: '40px',
                  padding: '0'
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
          className="collapse-button"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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