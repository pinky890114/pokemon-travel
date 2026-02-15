import React from 'react';
import { Settings, ArrowLeft } from 'lucide-react';
import { TripSettings, Member, Theme, User } from '../types';
import { getPokemonSprite } from '../utils';

interface HeaderProps {
  tripSettings: TripSettings;
  currentTheme: Theme;
  members: Member[];
  currentUser?: User;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  tripSettings, 
  currentTheme, 
  members, 
  currentUser, 
  onOpenSettings,
  onOpenProfile,
  onBack
}) => {
  const myMember = members.find(m => m.id === currentUser?.id);
  const myImg = myMember ? myMember.img : currentUser?.avatar;

  return (
    <div className={`px-4 pt-4 pb-5 flex flex-col gap-4 ${currentTheme.bgLight} sticky top-0 z-50 border-b-4 border-black transition-colors duration-300 shadow-sm`}>
      {/* 頂部導航列：返回鍵 */}
      {onBack && (
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="flex items-center space-x-1.5 bg-white border-2 border-black px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <ArrowLeft size={14} className="text-black" />
            <span className="text-[10px] font-black text-black tracking-tight uppercase">Lobby</span>
          </button>
        </div>
      )}

      {/* 主標題與資訊區 */}
      <div className="flex justify-between items-center">
        <div className="relative z-10 flex items-center min-w-0 flex-1 mr-2">
          {/* 當日主題寶可夢 */}
          <div className="mr-3 w-12 h-12 flex items-center justify-center bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] overflow-hidden flex-shrink-0">
            <img src={getPokemonSprite(currentTheme.id)} className="w-full h-full object-contain pixelated" alt="Daily Partner" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-lg font-black text-black leading-tight truncate min-h-[1.2em]">
              {tripSettings.title || "載入冒險中..."}
            </h1>
            <div className="flex items-center mt-0.5">
              <span className={`text-[9px] ${currentTheme.color} text-white px-1.5 py-0.5 rounded border border-black font-bold mr-2 uppercase whitespace-nowrap`}>
                {tripSettings.subtitle}
              </span>
              <button onClick={onOpenSettings} className="bg-white border border-black p-1 rounded-full shadow-[1px_1px_0px_#000] active:translate-y-[1px] flex-shrink-0">
                <Settings size={10} />
              </button>
            </div>
          </div>
        </div>
        
        {/* 個人頭像與成員列表 */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {myImg && (
                <button onClick={onOpenProfile} className="relative active:scale-95 transition-transform outline-none">
                    <img src={myImg} className="w-9 h-9 rounded-full border-2 border-black bg-white shadow-md object-cover" alt="Me" />
                </button>
            )}

            <div className="relative z-10 bg-white px-1.5 py-0.5 border-2 border-black rounded-lg shadow-[1px_1px_0px_0px_#000]">
               <div className="flex -space-x-1.5">
                  {members.slice(0, 3).map((m: Member) => (
                    <div key={m.id} className={`w-5 h-5 rounded-full border border-black overflow-hidden bg-gray-200 hover:z-10 transition-all`}>
                      <img src={m.img} className="w-full h-full object-cover" alt={m.name} />
                    </div>
                  ))}
                  {members.length > 3 && (
                     <div className="w-5 h-5 rounded-full border border-black bg-gray-100 flex items-center justify-center text-[7px] font-black z-0">+{members.length - 3}</div>
                  )}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};