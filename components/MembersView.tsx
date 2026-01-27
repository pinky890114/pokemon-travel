
import React from 'react';
import { Users, Plus, Edit2 } from 'lucide-react';
import { Member } from '../types';
import { POKEMON_THEMES, POKE_CARD_STYLE, DIGITAL_FONT_STYLE } from '../constants';
import { getPokemonSprite, getExpForNextLevel } from '../utils';

interface MembersViewProps {
  members: Member[];
  onMemberClick: (member?: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({ members, onMemberClick }) => (
    <div className="px-6 space-y-4 pb-40 animate-in fade-in">
       <div className={`${POKE_CARD_STYLE} p-4 bg-white flex justify-between items-center`}>
          <h2 className="text-xl font-black flex items-center tracking-tighter"><Users size={24} className="mr-2" />冒險夥伴隊伍</h2>
          <button onClick={() => onMemberClick()} className={`bg-[#FFF9C4] text-[#F57F17] px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none flex items-center`}>
             <Plus size={14} className="mr-1" /> 新增
          </button>
       </div>
       <div className="grid grid-cols-2 gap-4">
         {members.map(m => {
           const theme = POKEMON_THEMES[m.themeIdx] || POKEMON_THEMES[0];
           
           const currentLevel = m.level || 1;
           const currentExp = m.exp || 0;
           const prevThreshold = (currentLevel * (currentLevel - 1)) / 2;
           const nextThreshold = (currentLevel * (currentLevel + 1)) / 2;
           
           const progress = Math.min(Math.max((currentExp - prevThreshold) / (nextThreshold - prevThreshold), 0), 1);
           const postsNeeded = nextThreshold - currentExp;

           return (
             <button 
                key={m.id} 
                onClick={() => onMemberClick(m)}
                className={`${POKE_CARD_STYLE} p-4 flex flex-col items-center relative active:scale-95 transition-transform ${theme.bgLight}`}
             >
                <div className="absolute top-2 right-2 bg-white/50 p-1 rounded-full"><Edit2 size={12} className="text-gray-400"/></div>
                
                <img src={m.img} className="w-16 h-16 rounded-full border-2 border-black bg-white shadow-md mb-2 object-cover" alt={m.name} />
                <h3 className="font-black text-gray-800 text-lg">{m.name}</h3>
                <div className={`mt-1 mb-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-black bg-white flex items-center gap-1 ${theme.text}`}>
                   <img src={getPokemonSprite(theme.id)} className="w-4 h-4" alt="sprite"/>
                   <span className={`mr-1 ${DIGITAL_FONT_STYLE} text-gray-500 leading-none`}>Lv.{currentLevel}</span>
                   <span>{theme.name}</span>
                </div>
                
                <div className="w-full mt-1">
                    <div className="flex justify-between text-[8px] font-bold text-gray-400 mb-0.5">
                        <span>XP</span>
                        <span>{postsNeeded} posts to up</span>
                    </div>
                    <div className="h-1.5 w-full bg-white border border-black rounded-full overflow-hidden">
                        <div className={`h-full ${theme.color}`} style={{ width: `${progress * 100}%` }}></div>
                    </div>
                </div>
             </button>
           );
         })}
       </div>
    </div>
);
