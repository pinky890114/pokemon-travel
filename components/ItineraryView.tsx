import React, { useRef, useState } from 'react';
import { MapPin, ArrowUp, ArrowDown, Plus, Minus, Trash2, StickyNote, X, Train, Car, Bus, Loader2, Wand2 } from 'lucide-react';
import { ItineraryEvent, TripSettings, Theme } from '../types';
import { getDayInfo, getPokemonSprite, getCityWeather, getDateStrFromDay } from '../utils';
import { POKEMON_THEMES, POKE_CARD_STYLE, DIGITAL_FONT_STYLE, POKE_BTN_STYLE } from '../constants';

interface ItineraryViewProps {
  activeDay: number;
  setActiveDay: (day: number) => void;
  totalDays: number;
  setTotalDays: (days: number) => void;
  tripSettings: TripSettings;
  events: ItineraryEvent[];
  onOpenWeather: () => void;
  onAddEvent: (event?: ItineraryEvent) => void;
  onDeleteEvent: (id: string, e: React.MouseEvent) => void;
  onGenerateTransport: (start: ItineraryEvent, end: ItineraryEvent) => void;
  generatingTransportId: string | null;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  activeDay, setActiveDay, totalDays, setTotalDays, tripSettings, events,
  onOpenWeather, onAddEvent, onDeleteEvent, onGenerateTransport, generatingTransportId
}) => {
  const dayEvents = events.filter(e => e.date === getDateStrFromDay(activeDay, tripSettings.startDate));
  const cityInfo = getCityWeather(activeDay, dayEvents);
  
  // Drag to scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleUpdateDays = (newDays: number) => {
    if (newDays < 1) return;
    setTotalDays(newDays);
    if (activeDay > newDays) setActiveDay(newDays);
  };

  return (
    <div className="space-y-4 pb-40 animate-in fade-in">
      {/* Day Selector */}
      <div 
        ref={scrollRef}
        className="flex space-x-2 overflow-x-auto px-6 py-2 no-scrollbar items-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
          const info = getDayInfo(day, tripSettings.startDate);
          const theme = POKEMON_THEMES[(day - 1) % POKEMON_THEMES.length];
          return (
            <button 
              key={day} 
              onClick={() => !isDown && setActiveDay(day)} // Prevent click when dragging
              className={`flex-shrink-0 w-16 py-2 rounded-xl border-2 border-black flex flex-col items-center transition-all ${activeDay === day ? `${theme.color} text-white shadow-[2px_2px_0px_0px_#000] -translate-y-1` : 'bg-white text-gray-500 shadow-[2px_2px_0px_#ccc]'}`}
            >
              <span className="text-[10px] font-bold">Day {day}</span>
              <span className="text-sm font-black">{info.dateStr}</span>
              <img src={getPokemonSprite(theme.id)} className="w-8 h-8 object-contain" alt="poke" />
            </button>
          );
        })}
        
        {/* Add/Remove Days Buttons */}
        <div className="flex flex-col space-y-2 flex-shrink-0 pl-1">
          <button 
            onClick={() => handleUpdateDays(totalDays + 1)} 
            className="w-8 h-8 bg-green-100 border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none hover:bg-green-200 transition-colors"
            title="Add Day"
          >
            <Plus size={16} className="text-green-800" />
          </button>
          <button 
            onClick={() => handleUpdateDays(totalDays - 1)} 
            className="w-8 h-8 bg-red-100 border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none hover:bg-red-200 transition-colors"
            title="Remove Day"
          >
            <Minus size={16} className="text-red-800" />
          </button>
        </div>
      </div>

      {/* Weather Card */}
      <div className="px-6">
        <button onClick={onOpenWeather} className={`w-full text-left ${POKE_CARD_STYLE} p-0 active:scale-[0.98] transition-transform overflow-hidden`}>
          <div className={`px-4 py-2 border-b-[3px] border-black flex justify-between items-center bg-gray-100`}>
              <div className="flex items-center font-black text-sm text-gray-700 uppercase tracking-tighter">
                <MapPin size={16} className="mr-1" /> {cityInfo.name}
              </div>
              <div className="text-xs font-black bg-black text-white px-2 py-0.5 rounded">LV.{activeDay}</div>
          </div>
          <div className={`p-4 relative ${cityInfo.condition === 'sunny' ? 'bg-[#FFF9C4]' : cityInfo.condition === 'rain' ? 'bg-[#BBDEFB]' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center relative z-10">
              <div>
                  <div className="text-[10px] text-gray-600 font-bold mb-1 tracking-widest uppercase">Status</div>
                  <h2 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">{cityInfo.condition}</h2>
                  <div className="flex items-center mt-2 space-x-3">
                      <span className="text-4xl">{cityInfo.icon}</span>
                      <div className={`flex flex-col text-sm font-bold text-gray-600 ${DIGITAL_FONT_STYLE}`}>
                          <span className="text-red-500 flex items-center text-lg leading-none"><ArrowUp size={14}/>H:{cityInfo.maxTemp}°</span>
                          <span className="text-blue-600 flex items-center text-lg leading-none mt-1"><ArrowDown size={14}/>L:{cityInfo.minTemp}°</span>
                      </div>
                  </div>
              </div>
              <div className="absolute right-0 top-0 w-28 bg-white border-2 border-black rounded p-1 shadow-sm">
                  <div className="flex justify-between text-[10px] font-black mb-0.5 px-1 text-gray-600"><span>TEMP</span><span>{cityInfo.temp}°C</span></div>
                  <div className="w-full h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden relative">
                      <div className={`h-full transition-all duration-500 ${cityInfo.temp < 5 ? 'bg-blue-400' : cityInfo.temp < 15 ? 'bg-green-400' : 'bg-red-400'}`} style={{width: `${Math.min(Math.max((cityInfo.temp + 10) / 40 * 100, 0), 100)}%`}}></div>
                  </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-6">
               {[{ label: 'RAIN', val: '10%' }, { label: 'RISE', val: cityInfo.sunrise }, { label: 'SET', val: cityInfo.sunset }, { label: 'INFO', val: 'VIEW' }].map((stat, i) => (
                  <div key={i} className="text-center bg-white border-2 border-black rounded-lg p-1 shadow-[2px_2px_0px_#ccc]">
                      <div className="text-[9px] font-bold text-gray-500 uppercase">{stat.label}</div>
                      <div className={`font-mono text-xs font-bold text-gray-800 ${DIGITAL_FONT_STYLE}`}>{stat.val}</div>
                  </div>
               ))}
            </div>
          </div>
        </button>
      </div>

      {/* Events List */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg bg-white px-3 py-1 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_0px_#333]">Day {activeDay} 任務</h3>
          <button onClick={() => onAddEvent()} className={`bg-[#FFF9C4] text-[#F57F17] px-4 py-1.5 text-sm flex items-center ${POKE_BTN_STYLE}`}>
            <Plus size={16} className="mr-1" /> 新增
          </button>
        </div>
        
        <div className="space-y-4 relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-2 bg-[#ddd] border-x-2 border-black -z-10"></div>
          {dayEvents.length === 0 ? (
            <div className={`${POKE_CARD_STYLE} p-8 text-center bg-gray-50 text-gray-400 font-bold`}>尚未遭遇任何事件...</div>
          ) : (
            dayEvents.map((item, idx) => {
              const nextItem = dayEvents[idx + 1];
              const showMagicBtn = item.type === 'event' && nextItem && nextItem.type === 'event';
              return (
                <React.Fragment key={item.id}>
                  <div className="relative pl-12 cursor-pointer" onClick={() => onAddEvent(item)}>
                    <div className="absolute left-0 top-4 w-10 h-10 rounded-full border-[3px] border-black flex items-center justify-center font-mono text-xs font-bold bg-white z-10 shadow-[2px_2px_0px_0px_#333]">{item.time}</div>
                    {item.type === 'event' ? (
                      <div className={`${POKE_CARD_STYLE} p-3 hover:bg-gray-50 transition-colors`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-black text-gray-800 text-lg leading-tight">{item.title}</span>
                            {item.location && <div className="text-xs font-bold text-blue-600 flex items-center mt-1"><MapPin size={12} className="mr-1"/>{item.location}</div>}
                            {item.notes && <div className="mt-2 text-[10px] text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200 flex items-start"><StickyNote size={10} className="mr-1 mt-0.5" />{item.notes}</div>}
                          </div>
                          <button onClick={(e) => onDeleteEvent(item.id!, e)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-black rounded-xl p-2 flex flex-col text-xs text-gray-600 shadow-[2px_2px_0px_#ccc]">
                        <div className="flex justify-between w-full font-bold">
                          <div className="flex items-center">
                            <span className="bg-black text-white p-1 rounded mr-2">
                              {item.transportMode === 'train' ? <Train size={14}/> : item.transportMode === 'car' ? <Car size={14}/> : <Bus size={14}/>}
                            </span>
                            <span>移動：{item.duration}</span>
                          </div>
                          <button onClick={(e) => onDeleteEvent(item.id!, e)} className="text-gray-300 hover:text-red-500"><X size={14}/></button>
                        </div>
                        {item.notes && <div className="mt-1 text-[10px] border-t border-dashed pt-1 flex items-start"><StickyNote size={10} className="mr-1 mt-0.5" />{item.notes}</div>}
                      </div>
                    )}
                  </div>
                  {showMagicBtn && (
                    <div className="flex justify-center -my-3 relative z-10 pl-12">
                      <button onClick={(e) => { e.stopPropagation(); onGenerateTransport(item, nextItem); }} disabled={generatingTransportId === item.id} className="bg-purple-100 text-purple-600 border-2 border-purple-300 rounded-full p-1.5 shadow-sm hover:scale-110 active:scale-95 transition-transform">
                        {generatingTransportId === item.id ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14} />}
                      </button>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
