import React from 'react';
import { NAV_ITEMS } from '../../constants';
import type { View } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);


const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { logout, currentUser } = useAppContext();
  
  return (
    <aside className="w-16 sm:w-64 bg-slate-800 text-white flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center sm:justify-start sm:pl-6 h-16 border-b border-slate-700">
        <svg className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H8V8H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 16H8V20H4V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 4H20V8H16V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 16H20V20H16V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 4.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M15 4.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4.5 9H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4.5 15H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="hidden sm:inline ml-3 text-lg font-bold">Molduraria</span>
      </div>
      <nav className="flex-1 px-2 sm:px-4 py-4 space-y-2">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView(item.id);
            }}
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-indigo-500 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline ml-4 font-medium">{item.name}</span>
          </a>
        ))}
      </nav>
       <div className="px-2 sm:px-4 py-4 border-t border-slate-700">
          <div className="p-3 text-slate-400 hidden sm:block">
              <p className="text-xs">Logado como:</p>
              <p className="font-medium text-sm truncate text-slate-300" title={currentUser?.username}>{currentUser?.username}</p>
          </div>
          <a
              href="#"
              onClick={(e) => {
                  e.preventDefault();
                  logout();
              }}
              className="flex items-center p-3 w-full rounded-lg transition-colors duration-200 text-slate-300 hover:bg-red-600 hover:text-white"
          >
              <LogoutIcon />
              <span className="hidden sm:inline ml-4 font-medium">Sair</span>
          </a>
      </div>
    </aside>
  );
};

export default Sidebar;