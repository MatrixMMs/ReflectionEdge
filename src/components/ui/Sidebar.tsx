import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, TagIcon, ChartBarIcon, LightBulbIcon, ArrowTrendingUpIcon, CalculatorIcon, BrainIcon, AcademicCapIcon, ExportIcon, CogIcon, DashboardIcon, ImportIcon } from './Icons';

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
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  onImportClick,
  onMBSClick
}) => {
  return (
    <aside className={`bg-gray-800 flex flex-col justify-between py-6 ${sidebarCollapsed ? 'w-20 px-2' : 'w-64 px-4'} min-h-screen fixed left-0 top-0 z-40 shadow-xl transition-all duration-200`}>
      <div>
        {/* Logo/Title */}
        <div className={`flex items-center mb-6 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <span className="inline-block w-8 h-8 bg-gradient-to-tr from-purple-400 via-pink-400 to-yellow-400 rounded-lg" />
          {!sidebarCollapsed && <span className="text-2xl font-bold tracking-tight ml-3">Reflection Edge</span>}
        </div>
        
        {/* Divider above Dashboard */}
        <div className="my-2 border-t border-gray-700" />
        
        {/* Dashboard Link */}
        <nav className="space-y-2">
          <Link to="/" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
            <DashboardIcon className="w-5 h-5" />
            {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
          </Link>
        </nav>
        
        {/* Divider below Dashboard */}
        <div className="my-2 border-t border-gray-700" />
        
        {/* Nav Links */}
        <nav className="space-y-2">
          {/* Section 1: Playbook & Tags */}
          <div>
            {!sidebarCollapsed && <div className="uppercase text-xs text-gray-400 font-bold mb-2 tracking-wider">Strategy & Organization</div>}
            <Link to="/playbook" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <DocumentTextIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Playbook</span>}
            </Link>
            <Link to="/tags" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <TagIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Tags</span>}
            </Link>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 2: Performance & Analysis */}
          <div>
            {!sidebarCollapsed && <div className="uppercase text-xs text-gray-400 font-bold mb-2 tracking-wider">Performance & Analysis</div>}
            <Link to="/patterns" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <ChartBarIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Patterns</span>}
            </Link>
            <Link to="/insights" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <LightBulbIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Insights</span>}
            </Link>
            <Link to="/edge" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <ArrowTrendingUpIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Edge</span>}
            </Link>
            <Link to="/kelly" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <CalculatorIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Kelly</span>}
            </Link>
            <Link to="/execution" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <BrainIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Execution</span>}
            </Link>
            <Link to="/bestworst" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <span className="text-lg">⭐</span>
              {!sidebarCollapsed && <span className="ml-3">Best & Worst</span>}
            </Link>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 3: MBS */}
          <div>
            {!sidebarCollapsed && <div className="uppercase text-xs text-gray-400 font-bold mb-2 tracking-wider">MBS</div>}
            <button 
              onClick={onMBSClick} 
              className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}
            >
              <AcademicCapIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">MBS</span>}
            </button>
          </div>
          
          <div className="my-2 border-t border-gray-700" />
          
          {/* Section 4: Data & Settings */}
          <div>
            {!sidebarCollapsed && <div className="uppercase text-xs text-gray-400 font-bold mb-2 tracking-wider">Data & Settings</div>}
            <button 
              onClick={onImportClick} 
              className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}
            >
              <ImportIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Import</span>}
            </button>
            <Link to="/export" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <ExportIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Export</span>}
            </Link>
            <Link to="/settings" className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors`}>
              <CogIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Settings</span>}
            </Link>
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