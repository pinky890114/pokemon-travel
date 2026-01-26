import React from 'react';
import { Users } from 'lucide-react';
import { INITIAL_MEMBERS, EEVEE_THEMES, POKE_CARD_STYLE } from '../constants';

export const MembersView: React.FC = () => (
    <div className="px-6 space-y-4 pb-40 animate-in fade-in">
       <div className={`${POKE_CARD_STYLE} p-4 bg-white`}><h2 className="text-xl font-black flex items-center justify-center tracking-tighter"><Users size={24} className="mr-2" />冒險夥伴隊伍</h2></div>
       <div className="grid grid-cols-2 gap-4">
         {INITIAL_MEMBERS.map(m => {
           const theme = EEVEE_THEMES[m.themeIdx];
           return (
             <div key={m.id} className={`${POKE_CARD_STYLE} p-4 flex flex-col items-center ${theme.bgLight}`}>
                <img src={m.img} className="w-16 h-16 rounded-full border-2 border-black bg-white shadow-md mb-2" alt={m.name} />
                <h3 className="font-black text-gray-800">{m.name}</h3>
                <div className={`mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-black bg-white ${theme.text}`}>Lv.1 {theme.name}</div>
             </div>
           );
         })}
       </div>
    </div>
);