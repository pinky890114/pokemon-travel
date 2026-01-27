
import React from 'react';
import { Plus, Camera, Trash2 } from 'lucide-react';
import { JournalEntry, Member } from '../types';
import { POKE_CARD_STYLE, POKEMON_THEMES, DIGITAL_FONT_STYLE } from '../constants';
import { getPokemonSprite } from '../utils';

interface JournalSectionProps {
  entries: JournalEntry[];
  members: Member[];
  onAddEntry: () => void;
  onDeleteEntry: (id: string) => void;
}

export const JournalSection: React.FC<JournalSectionProps> = ({ entries, members, onAddEntry, onDeleteEntry }) => {
  return (
    <div className="px-6 space-y-4 pb-40 animate-in fade-in">
       <div className={`${POKE_CARD_STYLE} p-4 bg-white flex justify-between items-center`}>
          <h2 className="text-xl font-black flex items-center tracking-tighter"><Camera size={24} className="mr-2" />冒險日誌</h2>
          <button onClick={onAddEntry} className={`bg-[#E0F7FA] text-[#006064] px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none flex items-center`}>
             <Plus size={14} className="mr-1" /> 寫日記
          </button>
       </div>

       <div className="space-y-6">
          {entries.length === 0 ? (
            <div className={`${POKE_CARD_STYLE} p-12 text-center bg-gray-50 text-gray-400 font-bold flex flex-col items-center`}>
               <Camera size={48} className="mb-4 opacity-20" />
               <p>記錄旅途中的美好瞬間...</p>
               <p className="text-xs mt-2 text-gray-300">(還可以提升夥伴等級喔！)</p>
            </div>
          ) : (
             entries.map(entry => {
                const author = members.find(m => m.id === entry.authorId) || members[0];
                const theme = POKEMON_THEMES[author?.themeIdx || 0];
                
                return (
                   <div key={entry.id} className={`${POKE_CARD_STYLE} overflow-hidden bg-white`}>
                      <div className="flex items-center p-3 border-b-2 border-gray-100 bg-gray-50">
                         <div className="relative mr-3">
                            <img src={author.img} alt={author.name} className="w-10 h-10 rounded-full border-2 border-black bg-white" />
                            <div className="absolute -bottom-2 -right-3 h-5 bg-white rounded-full border border-black flex items-center px-1.5 shadow-sm z-10 whitespace-nowrap">
                               <img src={getPokemonSprite(theme.id)} className="w-3 h-3 object-contain mr-1" alt="poke"/>
                               <span className={`text-[8px] font-black leading-none ${DIGITAL_FONT_STYLE}`}>Lv.{author.level || 1}</span>
                            </div>
                         </div>
                         <div className="flex-1 ml-2">
                            <div className="flex items-baseline">
                               <span className="font-black text-sm mr-2">{author.name}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold">{entry.date}</div>
                         </div>
                         <button onClick={() => onDeleteEntry(entry.id)} className="text-gray-300 hover:text-red-500">
                            <Trash2 size={14} />
                         </button>
                      </div>

                      {entry.image && (
                         <div className="w-full aspect-square border-b-2 border-gray-100 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img src={entry.image} alt="Journal" className="w-full h-full object-cover" />
                         </div>
                      )}

                      <div className="p-4">
                         <p className="text-sm font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {entry.content}
                         </p>
                      </div>
                   </div>
                );
             })
          )}
       </div>
    </div>
  );
};
