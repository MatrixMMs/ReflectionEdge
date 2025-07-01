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
          <Link to="/" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            <CustomDashboardIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
            <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Dashboard</span>
          </Link>
        </nav>
        
        {/* Divider below Dashboard */}
        <div className="my-2 border-t border-gray-700" />
        
        {/* Nav Links */}
        <nav className="space-y-2">
          {/* Section 1: Playbook & Tags */}
          <div>
            <Link to="/playbook" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomPlaybookIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Playbook</span>
            </Link>
            <Link to="/tags" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomTagsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Tags</span>
            </Link>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 2: Performance & Analysis */}
          <div>
            <Link to="/patterns" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomPatternIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Patterns</span>
            </Link>
            <Link to="/insights" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomInsightsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Insights</span>
            </Link>
            <Link to="/edge" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomEdgeIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Edge</span>
            </Link>
            <Link to="/kelly" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomCalculatorIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Kelly</span>
            </Link>
            <Link to="/execution" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomExecutionIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Execution</span>
            </Link>
            <Link to="/bestworst" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomBestWorstIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Best & Worst</span>
            </Link>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 3: MBS */}
          <div>
            <button 
              onClick={onMBSClick} 
              className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <CustomMBSIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>MBS</span>
            </button>
            <Link to="/mbs-history" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomMBSHistoryIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>MBS History</span>
            </Link>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 4: Data & Settings */}
          <div>
            <button 
              onClick={onImportClick} 
              className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <CustomImportIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Import</span>
            </button>
            <Link to="/export" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomExportIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Export</span>
            </Link>
            <Link to="/settings" className="flex items-center w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CustomSettingsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-2' : ''}`} />
              <span className={`sidebar-label ml-3 ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>Settings</span>
            </Link>
            <div className="flex justify-center w-full">
              <button
                onClick={onAddTradeClick}
                className={`flex items-center mt-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg shadow-md text-sm transition-transform duration-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 ${sidebarCollapsed ? 'w-10 h-10 px-0 justify-center' : 'w-full h-10 px-4 justify-center'}`}
                style={{ minHeight: '40px', minWidth: sidebarCollapsed ? '40px' : undefined }}
                title="Add Trade"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-all duration-300 ${sidebarCollapsed ? '' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                <span
                  className={`sidebar-label font-medium transition-all duration-300${sidebarCollapsed ? ' collapsed' : ' expanded'}`}
                >
                  Add Trade
                </span>
              </button>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Collapse/Expand Button */}
      <div className="flex justify-center items-end w-full mt-6">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-gray-400 hover:text-white transition-colors focus:outline-none"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 