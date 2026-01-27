import React from 'react';
import { Gamepad2, Briefcase, Wallet, Users, BookOpen } from 'lucide-react';
import { Theme } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTheme: Theme;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, currentTheme }) => {
  const tabs = [
    { id: 'itinerary', label: '冒險', icon: Gamepad2 },
    { id: 'booking', label: '背包', icon: Briefcase },
    { id: 'ledger', label: '商店', icon: Wallet },
    { id: 'journal', label: '日誌', icon: BookOpen },
    { id: 'members', label: '隊伍', icon: Users },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${currentTheme.bgLight} border-t-4 border-black px-4 py-3 pb-8 flex justify-around items-center z-50 transition-colors duration-300`}>
      {tabs.map(tab => (
        <button 
          key={tab.id} 
          onClick={() => setActiveTab(tab.id)} 
          className={`flex flex-col items-center space-y-1 transition-all active:scale-90 ${activeTab === tab.id ? `${currentTheme.text} scale-110` : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-lg border-2 ${activeTab === tab.id ? 'bg-white border-black shadow-[2px_2px_0px_0px_#000]' : 'border-transparent'}`}>
            <tab.icon size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
