
import React, { useRef, useState, useEffect } from 'react';
import { MapPin, ArrowUp, ArrowDown, Plus, Minus, Trash2, StickyNote, X, Train, Car, Bus, Loader2, Clock, Sparkles, Droplets, Sunrise, Sunset } from 'lucide-react';
import { ItineraryEvent, TripSettings, Theme, WeatherInfo } from '../types';
import { getDayInfo, getPokemonSprite, getCityWeather, getDateStrFromDay, fetchRealtimeWeather, identifyCityKey } from '../utils';
import { POKEMON_THEMES, POKE_CARD_STYLE, DIGITAL_FONT_STYLE, POKE_BTN_STYLE, CITY_WEATHER_DB } from '../constants';

interface ItineraryViewProps {
  activeDay: number;
  setActiveDay: (day: number) => void;
  totalDays: number;
  setTotalDays: (days: number) => void;
  tripSettings: TripSettings;
  events: ItineraryEvent[];
  weatherOverrides?: Record<string, string>;
  onOpenWeather: (info: WeatherInfo) => void;
  onAddEvent: (event?: ItineraryEvent) => void;
  onDeleteEvent: (id: string, e: React.MouseEvent) => void;
  onGenerateTransport?: (start: ItineraryEvent, end: ItineraryEvent) => void;
  generatingTransportId?: string | null;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  activeDay, setActiveDay, totalDays, setTotalDays, tripSettings, events,
  weatherOverrides = {}, onOpenWeather, onAddEvent, onDeleteEvent,
  onGenerateTransport, generatingTransportId
}) => {
  const currentDayStr = getDateStrFromDay(activeDay, tripSettings.startDate);
  const dayEvents = events.filter(e => e.date === currentDayStr);
  const currentTheme = POKEMON_THEMES[(activeDay - 1) % POKEMON_THEMES.length];
  
  const cityKey = identifyCityKey(activeDay, dayEvents, weatherOverrides);
  const [cityInfo, setCityInfo] = useState<WeatherInfo>(CITY_WEATHER_DB[cityKey] || CITY_WEATHER_DB["ZURICH"]);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const key = identifyCityKey(activeDay, dayEvents, weatherOverrides);
    const staticInfo = CITY_WEATHER_DB[key] || CITY_WEATHER_DB["ZURICH"];
    setCityInfo(staticInfo);

    if (staticInfo.lat && staticInfo.lng) {
      setLoadingWeather(true);
      // 傳入當前行程的日期字串，確保抓取正確的預報索引
      fetchRealtimeWeather(staticInfo.lat, staticInfo.lng, currentDayStr).then(realtime => {
        if (realtime) {
          setCityInfo(prev => ({ ...prev, ...realtime }));
        }
        setLoadingWeather(false);
      });
    }
  }, [activeDay, events, weatherOverrides, currentDayStr]);
  
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
    const walk = (x - startX) * 2; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleUpdateDays = (newDays: number) => {
    if (newDays < 1) return;
    setTotalDays(newDays);
    if (activeDay > newDays) setActiveDay(newDays);
  };

  return (
    <div className="space-y-4 pb-40 pt-4 animate-in fade-in">
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
              onClick={() => !isDown && setActiveDay(day)} 
              className={`flex-shrink-0 w-16 py-2 rounded-xl border-2 border-black flex flex-col items-center transition-all ${activeDay === day ? `${theme.color} text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-1` : 'bg-white text-gray-400'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">Day {day}</span>
              <span className={`text-sm font-black ${DIGITAL_FONT_STYLE}`}>{info.dateStr}</span>
            </button>
          );
        })}
        <div className="flex space-x-1 pl-4 border-l-2 border-dashed border-gray-300 ml-2">
            <button onClick={() => handleUpdateDays(totalDays + 1)} className="p-2 bg-white border-2 border-black rounded-lg text-gray-400 hover:text-black active:scale-90 transition-all"><Plus size={16}/></button>
            <button onClick={() => handleUpdateDays(totalDays - 1)} className="p-2 bg-white border-2 border-black rounded-lg text-gray-400 hover:text-black active:scale-90 transition-all"><Minus size={16}/></button>
        </div>
      </div>

      {/* Weather Summary Card */}
      <div className="px-6">
        <div 
          onClick={() => onOpenWeather(cityInfo)}
          className={`${POKE_CARD_STYLE} p-4 bg-gradient-to-br from-blue-50 to-white cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden`}
        >
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="flex items-center space-x-3">
                <div className="text-4xl filter drop-shadow-sm">{cityInfo.icon}</div>
                <div>
                   <div className="flex items-center">
                       <h2 className="text-xl font-black text-gray-800 leading-none">{cityInfo.name}</h2>
                       {loadingWeather && <Loader2 size={12} className="ml-2 animate-spin text-blue-400"/>}
                   </div>
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                      {cityInfo.condition} <span className="mx-1 opacity-50">|</span> {cityInfo.minTemp}°C ~ {cityInfo.maxTemp}°C
                   </div>
                </div>
             </div>
             
             {/* Right side: Temp only */}
             <div className="flex flex-col items-end">
                <div className={`text-4xl font-black text-gray-800 ${DIGITAL_FONT_STYLE} leading-none`}>{cityInfo.temp}°</div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-2 relative z-10 pt-2 border-t border-dashed border-gray-200">
             <div className="flex flex-col items-center py-1">
                <div className="flex items-center text-[10px] font-black text-blue-500 mb-0.5">
                   <Droplets size={10} className="mr-1" /> RAIN
                </div>
                <div className={`text-sm font-black ${DIGITAL_FONT_STYLE} text-gray-700`}>{cityInfo.rainProb ?? 0}%</div>
             </div>
             <div className="flex flex-col items-center py-1 border-x border-dashed border-gray-200">
                <div className="flex items-center text-[10px] font-black text-orange-400 mb-0.5">
                   <Sunrise size={10} className="mr-1" /> SUNRISE
                </div>
                <div className={`text-sm font-black ${DIGITAL_FONT_STYLE} text-gray-700`}>{cityInfo.sunrise}</div>
             </div>
             <div className="flex flex-col items-center py-1">
                <div className="flex items-center text-[10px] font-black text-indigo-500 mb-0.5">
                   <Sunset size={10} className="mr-1" /> SUNSET
                </div>
                <div className={`text-sm font-black ${DIGITAL_FONT_STYLE} text-gray-700`}>{cityInfo.sunset}</div>
             </div>
          </div>
          <div className={`absolute right-0 top-0 w-24 h-24 ${currentTheme.color} opacity-5 rounded-bl-full pointer-events-none`}></div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="px-6 relative">
        <h3 className="text-sm font-black text-gray-400 mb-4 flex items-center">
          <Clock size={14} className="mr-1.5" /> 本日冒險
        </h3>
        
        <div className="space-y-6 relative">
          {/* Central Vertical Line */}
          {dayEvents.length > 0 && (
              <div className="absolute left-[1.75rem] top-4 bottom-8 w-0 border-l-2 border-dashed border-gray-300 z-0"></div>
          )}

          {dayEvents.map((event, idx) => {
             const nextEvent = dayEvents[idx + 1];
             const showAITransport = onGenerateTransport && nextEvent && event.type === 'event' && nextEvent.type === 'event';

             return (
               <React.Fragment key={event.id || idx}>
                 <div className="relative z-10 flex items-start space-x-4">
                    <div className="flex flex-col items-center flex-shrink-0 w-14">
                        <div className={`w-14 h-14 rounded-full border-2 border-black flex flex-col items-center justify-center shadow-[2px_2px_0px_#000] z-10 transition-colors ${event.type === 'transport' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                            <span className={`text-base font-black ${DIGITAL_FONT_STYLE} leading-none mb-1`}>{event.time}</span>
                            {event.type === 'transport' ? (
                                <div className="text-[10px]">
                                    {event.transportMode === 'train' && <Train size={12}/>}
                                    {event.transportMode === 'walk' && <MapPin size={12}/>}
                                    {event.transportMode === 'car' && <Car size={12}/>}
                                    {event.transportMode === 'bus' && <Bus size={12}/>}
                                </div>
                            ) : (
                                <div className={`${currentTheme.text}`}>
                                    <Clock size={12}/>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <div 
                          onClick={() => onAddEvent(event)}
                          className={`${POKE_CARD_STYLE} p-4 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all group relative overflow-hidden`}
                        >
                           <div className="min-w-0 pr-6 break-words">
                              {event.type === 'event' ? (
                                 <div className="space-y-1.5">
                                    <h4 className="font-black text-gray-800 text-lg leading-tight whitespace-pre-wrap">{event.title}</h4>
                                    <div className="text-[10px] font-bold text-gray-400 flex items-start whitespace-pre-wrap">
                                       <MapPin size={10} className="mr-1 mt-0.5 flex-shrink-0" /> {event.location}
                                    </div>
                                    {event.notes && (
                                        <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex items-start gap-1.5">
                                            <StickyNote size={10} className="mt-0.5 text-gray-300 flex-shrink-0" />
                                            <p className="text-[10px] text-gray-500 font-bold whitespace-pre-wrap italic leading-relaxed">{event.notes}</p>
                                        </div>
                                    )}
                                 </div>
                              ) : (
                                 <div className="space-y-1">
                                    <div className="flex items-center">
                                        <h4 className="font-black text-gray-600 text-xs uppercase tracking-widest">{event.transportMode}</h4>
                                        <span className={`ml-2 px-1.5 py-0.5 text-[10px] font-black rounded border border-gray-300 text-gray-400 ${DIGITAL_FONT_STYLE}`}>{event.duration}</span>
                                    </div>
                                    {event.notes && (
                                        <div className="text-[10px] font-bold text-gray-400 italic whitespace-pre-wrap mt-1 leading-relaxed">{event.notes}</div>
                                    )}
                                 </div>
                              )}
                           </div>
                           <button onClick={(e) => onDeleteEvent(event.id!, e)} className="absolute top-2 right-2 p-1 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                        </div>
                    </div>
                 </div>

                 {showAITransport && (
                   <div className="flex justify-center ml-14 -my-2 relative z-20">
                     <button 
                        onClick={() => onGenerateTransport(event, nextEvent)}
                        disabled={generatingTransportId === event.id}
                        className="bg-white border-2 border-black rounded-full px-3 py-1 text-[9px] font-black flex items-center shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none transition-all hover:bg-yellow-50 text-gray-500 hover:text-black disabled:opacity-50"
                     >
                       {generatingTransportId === event.id ? (
                         <Loader2 size={10} className="animate-spin mr-1" />
                       ) : (
                         <Sparkles size={10} className="mr-1 text-yellow-500" />
                       )}
                       AI TRANSPORT SUGGESTION
                     </button>
                   </div>
                 )}
               </React.Fragment>
             );
          })}
          
          <div className="flex items-start space-x-4">
            <div className="w-14 flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Plus size={16} className="text-gray-300"/>
                </div>
            </div>
            <button 
                onClick={() => onAddEvent()}
                className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 font-bold hover:bg-white hover:border-black hover:text-black transition-all group"
            >
                <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> ADD NEW MISSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
