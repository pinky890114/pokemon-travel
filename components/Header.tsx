
import React from 'react';
import { Settings, Edit } from 'lucide-react';
import { TripSettings, Member, Theme, User } from '../types';

interface HeaderProps {
  tripSettings: TripSettings;
  currentTheme: Theme;
  members: Member[];
  currentUser?: User; // Add current user to props
  onOpenSettings: () => void;
  onOpenProfile?: () => void; // Callback for profile edit
}

export const Header: React.FC<HeaderProps> = ({ tripSettings, currentTheme, members, currentUser, onOpenSettings, onOpenProfile }) => {
  // Find current user's member object if available, or fallback to user data
  const myMember = members.find(m => m.id === currentUser?.id);
  const myImg = myMember ? myMember.img : currentUser?.avatar;

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
      
      {/* Right side: Current User Avatar + Team Mini List */}
      <div className="flex flex-col items-end gap-2">
          {/* Main Avatar (Clickable) */}
          {myImg && (
              <button onClick={onOpenProfile} className="relative group">
                  <img src={myImg} className="w-10 h-10 rounded-full border-2 border-black bg-white shadow-md group-hover:scale-105 transition-transform object-cover" alt="Me" />
                  <div className="absolute bottom-0 right-0 bg-white border border-black rounded-full p-0.5 shadow-sm">
                      <Edit size={8} />
                  </div>
              </button>
          )}

          {/* Other Members */}
          <div className="relative z-10 bg-white px-2 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
             <div className="flex -space-x-2">
                {members.slice(0, 4).map((m: Member) => (
                  <div key={m.id} className={`w-6 h-6 rounded-full border border-black overflow-hidden bg-gray-200 hover:z-10 transition-all`}>
                    <img src={m.img} className="w-full h-full object-cover" alt={m.name} />
                  </div>
                ))}
                {members.length > 4 && (
                   <div className="w-6 h-6 rounded-full border border-black bg-gray-100 flex items-center justify-center text-[8px] font-black z-0">+{members.length - 4}</div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
};
