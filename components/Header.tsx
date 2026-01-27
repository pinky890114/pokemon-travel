import React from 'react';
import { Settings } from 'lucide-react';
import { TripSettings, Member, Theme } from '../types';

interface HeaderProps {
  tripSettings: TripSettings;
  currentTheme: Theme;
  members: Member[];
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ tripSettings, currentTheme, members, onOpenSettings }) => {
  return (
    <div className={`px-6 pt-12 pb-6 flex justify-between items-center ${currentTheme.bgLight} sticky top-0 z-20 border-b-4 border-black transition-colors duration-300`}>
      <div className="relative z-10 flex items-center">
        <div className="mr-3 w-12 h-12 flex items-center justify-center bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" className="w-full h-full object-contain p-1" alt="Ball" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-[#5C4033] leading-none mb-3">{tripSettings.title}</h1>
          <div className="flex items-center">
            <span className={`text-[10px] ${currentTheme.color} text-white px-1.5 py-0.5 rounded border border-black font-bold mr-2 uppercase`}>{tripSettings.subtitle}</span>
            <button onClick={onOpenSettings} className="bg-white border border-black p-1 rounded-full shadow-[1px_1px_0px_#000] active:translate-y-[1px]">
              <Settings size={12} />
            </button>
          </div>
        </div>
      </div>
      <div className="relative z-10 bg-white px-2 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
         <div className="text-[10px] font-bold text-center border-b border-gray-200 mb-1 pb-1 uppercase">Team</div>
         <div className="flex -space-x-2">
            {members.slice(0, 4).map((m: Member) => (
              <div key={m.id} className={`w-7 h-7 rounded-full border border-black overflow-hidden bg-gray-200 hover:z-10 transition-all hover:scale-125`}>
                <img src={m.img} className="w-full h-full object-cover" alt={m.name} />
              </div>
            ))}
            {members.length > 4 && (
               <div className="w-7 h-7 rounded-full border border-black bg-gray-100 flex items-center justify-center text-[10px] font-black z-0">+{members.length - 4}</div>
            )}
         </div>
      </div>
    </div>
  );
};
