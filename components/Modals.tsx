
import React, { useState, useRef, useEffect } from 'react';
import { X, Sun, Plus, Minus, Trash2, Upload, Ticket, QrCode, Check, Camera, Copy, Key, User as UserIcon, RefreshCw, MapPin, FileText, Image as ImageIcon, Droplets, Moon, Loader2, Info, Search, Sparkles } from 'lucide-react';
import { POKE_CARD_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE, DIGITAL_FONT_STYLE, POKEMON_THEMES, CITY_WEATHER_DB } from '../constants';
import { TripSettings, ItineraryEvent, FlightSegment, Theme, Hotel, Voucher, Member, JournalEntry, WeatherInfo, User } from '../types';
import { getPokemonSprite, compressImage, fetchRealtimeWeather, getDateStrFromDay, checkWeatherWithAI } from '../utils';

// --- Weather Modal ---
interface WeatherModalProps {
  weather: WeatherInfo;
  day: number;
  dateStr: string; // New prop for specific date
  currentOverride: string | undefined;
  onClose: () => void;
  onUpdateLocation: (day: number, cityKey: string) => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ weather: initialWeather, day, dateStr, currentOverride, onClose, onUpdateLocation }) => {
  const [weather, setWeather] = useState<WeatherInfo>(initialWeather);
  const [loading, setLoading] = useState(false);
  
  // AI Verification State
  const [aiCheckResult, setAiCheckResult] = useState<string | null>(null);
  const [aiCheckLoading, setAiCheckLoading] = useState(false);

  // 當初始 weather 或 override 改變時，重新 fetch 該地點的天氣
  useEffect(() => {
    // 只有當「地點被手動切換」時，或者「初始資料缺少降雨機率(代表是靜態資料)」時，才重新抓取
    const shouldFetch = (currentOverride && currentOverride !== weather.name) || (weather.rainProb === undefined);

    if (shouldFetch && initialWeather.lat && initialWeather.lng) {
        const fetchWeather = async () => {
            setLoading(true);
            setAiCheckResult(null); // Reset AI result on location change
            // 使用 props 傳入的 dateStr，若無則 fallback 到今天
            const targetDate = dateStr || new Date().toISOString().split('T')[0]; 
            
            const realtime = await fetchRealtimeWeather(initialWeather.lat!, initialWeather.lng!, targetDate);
            if (realtime) {
                setWeather({ ...initialWeather, ...realtime });
            } else {
                setWeather(initialWeather);
            }
            setLoading(false);
        };
        fetchWeather();
    } else {
        setWeather(initialWeather);
    }
  }, [initialWeather, dateStr, currentOverride]);

  const handleAiCheck = async () => {
      setAiCheckLoading(true);
      setAiCheckResult(null);
      try {
          const result = await checkWeatherWithAI(weather.name, dateStr);
          setAiCheckResult(result);
      } catch (e) {
          setAiCheckResult("查詢失敗，請稍後再試。");
      } finally {
          setAiCheckLoading(false);
      }
  };

  // 根據小時、溫度、以及降雨機率動態決定圖示
  const getSimulatedIcon = (hour: number, temp: number, rainProb: number) => {
    const isNight = hour >= 19 || hour <= 6;
    
    // 1. 高機率降水判斷
    if (rainProb > 40) {
      if (temp <= 2) return "❄️"; // 低溫降水為雪
      if (rainProb > 70) return "🌧️"; // 強降雨
      return isNight ? "🌧️" : "🌦️"; // 陣雨
    }

    // 2. 雲量判斷
    if (weather.condition.toLowerCase().includes('cloudy') || weather.icon === '☁️') {
      if (rainProb > 20) return "☁️";
      return isNight ? "☁️" : "🌤️";
    }

    // 3. 晴朗判斷
    if (isNight) return "🌙";
    return "☀️";
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm h-[80vh] flex flex-col overflow-hidden relative`}>
        <div className="flex justify-between items-center p-4 border-b-[3px] border-black bg-gray-50 font-black">
          <div>
            <h3 className="text-xl leading-none flex items-center">
                氣候預報分析 {loading && <Loader2 size={16} className="ml-2 animate-spin text-blue-500"/>}
            </h3>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-tight mt-1">DAY {day} - {weather.name}</span>
                <span className="text-[10px] text-blue-600 font-bold font-mono tracking-wider">{dateStr}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={18} /></button>
        </div>
        
        <div className="bg-blue-50 p-2.5 border-b-2 border-dashed border-blue-200 flex items-center justify-between">
          <div className="flex items-center text-[10px] font-black text-blue-700">
            <MapPin size={12} className="mr-1"/>
            <span>{currentOverride ? "手動定位" : "自動地區偵測"}</span>
          </div>
          <select 
            value={currentOverride || ""}
            onChange={(e) => onUpdateLocation(day, e.target.value)}
            className="text-[10px] font-black border-2 border-black rounded-lg px-2 py-1 bg-white shadow-[1px_1px_0px_#000] outline-none"
          >
            <option value="">(自動偵測)</option>
            {Object.keys(CITY_WEATHER_DB).map(key => (
              <option key={key} value={key}>{CITY_WEATHER_DB[key].name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-white relative">
          
          {/* AI Check Button Area */}
          <div className="mb-4">
             {!aiCheckResult && !aiCheckLoading && (
                 <button 
                    onClick={handleAiCheck}
                    className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition-all"
                 >
                    <Sparkles size={14} className="mr-2 text-yellow-300 animate-pulse"/>
                    數據不準？用 Google 搜尋驗證
                 </button>
             )}
             
             {aiCheckLoading && (
                 <div className="w-full py-3 bg-gray-50 border-2 border-dashed border-indigo-200 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-400">
                     <Loader2 size={16} className="animate-spin mr-2" /> AI 正在查詢 Google 最新氣象...
                 </div>
             )}

             {aiCheckResult && (
                 <div className="w-full p-3 bg-indigo-50 border-2 border-indigo-500 rounded-xl relative animate-in fade-in zoom-in-95">
                     <div className="absolute -top-2 left-3 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">Google Search Result</div>
                     <p className="text-xs font-bold text-indigo-900 mt-2 whitespace-pre-wrap leading-relaxed">{aiCheckResult}</p>
                     <button onClick={() => setAiCheckResult(null)} className="absolute top-2 right-2 text-indigo-300 hover:text-indigo-600"><X size={12}/></button>
                 </div>
             )}
          </div>

          <div className="space-y-1">
            {[...Array(24)].map((_, i) => {
              const hour = i;
              const peakHour = 14; 
              const hourDiff = Math.abs(hour - peakHour);
              
              // 模擬溫度曲線 (基於即時 min/max)
              let simTemp = Math.round(weather.maxTemp - (hourDiff * ( (weather.maxTemp - weather.minTemp) / 10 )));
              if (hour < 6 || hour > 20) simTemp -= 1;
              simTemp = Math.max(simTemp, weather.minTemp);

              // 降雨機率 (使用真實 rainProb 加上隨機波動)
              const baseRain = weather.rainProb ?? 0;
              // 讓每小時機率在 baseRain 周圍波動 +/- 15%，但不小於0或大於100
              const hourRain = Math.min(100, Math.max(0, baseRain + (Math.sin(hour * 0.8) * 15)));

              const hourIcon = getSimulatedIcon(hour, simTemp, hourRain);

              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${hour === new Date().getHours() ? 'border-blue-400 bg-blue-50/30' : 'border-transparent border-b-gray-100'}`}>
                  <div className="w-12">
                    <span className={`text-xs font-black ${hour === new Date().getHours() ? 'text-blue-500' : 'text-gray-400'}`}>
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 flex-1 justify-center">
                    <span className="text-2xl filter drop-shadow-sm w-8 text-center">{hourIcon}</span>
                    <div className="flex flex-col items-start w-10">
                      <span className={`font-black text-gray-800 ${DIGITAL_FONT_STYLE}`}>{simTemp}°</span>
                    </div>
                  </div>

                  <div className="w-16 flex items-center justify-end text-[10px] font-bold">
                    <div className={`flex items-center ${hourRain > 40 ? 'text-blue-500' : 'text-gray-300'}`}>
                      {simTemp <= 2 && hourRain > 40 ? <div className="text-[8px] mr-1">❄️</div> : <Droplets size={10} className="mr-1 opacity-60" />}
                      <span>{Math.round(hourRain)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-2 border-t-2 border-black bg-gray-50 text-center flex flex-col items-center justify-center">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">數據僅供冒險參考 • 祝您旅途愉快</p>
          <div className="text-[8px] font-bold text-gray-300 flex items-center mt-1">
             <Info size={8} className="mr-1"/> Data Source: Open-Meteo API
          </div>
        </div>
      </div>
    </div>
  );
};

// ... (Rest of the file remains unchanged)
interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 250, 0.6); // 壓縮更小
        setAvatar(compressed);
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-sm p-6`}>
         <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
            <h3 className="font-black text-xl flex items-center"><UserIcon size={20} className="mr-2"/>訓練家卡片</h3>
            <button onClick={onClose}><X size={20}/></button>
         </div>
         
         <div className="flex flex-col items-center space-y-4">
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={avatar} className="w-24 h-24 rounded-full border-4 border-black bg-white object-cover" alt="avatar" />
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white border-2 border-black rounded-full p-1.5 shadow-md active:scale-90 transition-transform">
                   <Upload size={14} />
                </div>
             </div>
             
             <button onClick={handleRandomAvatar} className="text-xs font-bold text-gray-500 flex items-center hover:text-black border border-gray-300 rounded px-2 py-1 bg-white">
                 <RefreshCw size={12} className="mr-1"/> 隨機生成外觀
             </button>
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

             <div className="w-full">
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className={`w-full p-2 text-center font-black ${POKE_INPUT_STYLE}`} 
                />
             </div>
             
             <div className="w-full pt-2">
                <button onClick={() => onSave({ ...user, name, avatar })} className={`w-full bg-[#3B4CCA] text-white py-3 font-black ${POKE_BTN_STYLE}`}>
                   更新資料
                </button>
             </div>
         </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  settings: TripSettings;
  totalDays: number;
  adventureId: string;
  currentCoverImage: string;
  onClose: () => void;
  onSave: (settings: TripSettings, totalDays: number, coverImage: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, totalDays, adventureId, currentCoverImage, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const [localDays, setLocalDays] = React.useState(totalDays);
  const [coverImage, setCoverImage] = React.useState(currentCoverImage || '');
  const [pokeId, setPokeId] = React.useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyId = () => {
    if (adventureId) {
        navigator.clipboard.writeText(adventureId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRandomPokemon = () => {
      const randomId = Math.floor(Math.random() * 1025) + 1;
      setCoverImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${randomId}.png`);
      setPokeId(randomId.toString());
  };

  const handleSpecificPokemon = () => {
      if(pokeId) {
          setCoverImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`);
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 0.6); // 壓縮更積極
        setCoverImage(compressed);
        setPokeId('');
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
          <h3 className="font-black text-xl">旅行設定</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-4">
           
           {/* Adventure ID Section */}
           {adventureId && (
               <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 p-3 rounded-xl mb-4">
                  <label className="text-[10px] font-bold text-yellow-700 mb-1 block uppercase">Invite Friends (Adventure ID)</label>
                  <button 
                    onClick={copyId}
                    className="w-full flex items-center justify-between bg-white border border-yellow-500 rounded p-2 active:bg-yellow-100 transition-colors"
                  >
                     <span className="font-mono text-sm font-bold truncate mr-2 text-gray-700">{adventureId}</span>
                     {copied ? <Check size={16} className="text-green-600"/> : <Copy size={16} className="text-yellow-600"/>}
                  </button>
                  <p className="text-[9px] text-yellow-600 mt-1 font-bold">複製此 ID 給朋友，在首頁點選「加入冒險」即可。</p>
               </div>
           )}

           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Title</label>
             <input type="text" value={localSettings.title} onChange={e => setLocalSettings({...localSettings, title: e.target.value})} className={`w-full p-2 bg-gray-50 font-black ${POKE_INPUT_STYLE}`} />
           </div>
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Subtitle</label>
             <input type="text" value={localSettings.subtitle} onChange={e => setLocalSettings({...localSettings, subtitle: e.target.value})} className={`w-full p-2 bg-gray-50 font-black ${POKE_INPUT_STYLE}`} />
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Start Date</label>
                <input type="date" value={localSettings.startDate} onChange={e => setLocalSettings({...localSettings, startDate: e.target.value})} className={`w-full p-2 bg-gray-50 font-black ${POKE_INPUT_STYLE}`} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Total Days</label>
                <input 
                   type="number" 
                   value={localDays} 
                   onChange={e => setLocalDays(Math.max(1, parseInt(e.target.value) || 1))} 
                   className={`w-full p-2 bg-gray-50 font-black text-center ${POKE_INPUT_STYLE}`} 
                />
              </div>
           </div>

           {/* Cover Image Section */}
           <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-2">
              <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Cover Pokemon / Image</label>
              <div className="flex items-center space-x-2 mb-3">
                 <input 
                    type="number" 
                    placeholder="PokeID (1-1025)" 
                    value={pokeId}
                    onChange={e => setPokeId(e.target.value)}
                    className={`flex-1 p-2 text-xs font-black ${POKE_INPUT_STYLE}`}
                 />
                 <button onClick={handleSpecificPokemon} className="bg-gray-100 border border-black rounded p-2 text-xs font-bold hover:bg-gray-200">Set</button>
                 <button onClick={handleRandomPokemon} className="bg-gray-100 border border-black rounded p-2 text-xs font-bold hover:bg-gray-200"><RefreshCw size={14}/></button>
              </div>
              
              <div className="relative group w-full h-32 bg-gray-100 rounded-xl border-2 border-black overflow-hidden mb-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {coverImage ? (
                      <img src={coverImage} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    <Upload size={20} className="mr-2"/> Upload Custom
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
               </div>
           </div>

           <button onClick={() => onSave(localSettings, localDays, coverImage)} className={`w-full ${POKE_BTN_STYLE} bg-[#3B4CCA] text-white py-3 font-black mt-2`}>
             SAVE CHANGES
           </button>
        </div>
      </div>
    </div>
  );
};

export const EventModal: React.FC<{ event: ItineraryEvent; isEditing: boolean; currentTheme: Theme; onClose: () => void; onSave: (event: ItineraryEvent) => void }> = ({ event, isEditing, currentTheme, onClose, onSave }) => {
  const [localEvent, setLocalEvent] = React.useState(event);

  const handleSubmit = () => {
     onSave(localEvent);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6`}>
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
          <h3 className="font-black text-xl">{isEditing ? '編輯事件' : '新增事件'}</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-4">
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Time</label>
             <input type="time" value={localEvent.time} onChange={e => setLocalEvent({...localEvent, time: e.target.value})} className={`w-full p-2 text-center bg-gray-50 font-black ${POKE_INPUT_STYLE}`} />
           </div>
           
           <div className="flex space-x-2">
              <button onClick={() => setLocalEvent({...localEvent, type: 'event'})} className={`flex-1 py-2 text-xs font-black rounded border-2 ${localEvent.type === 'event' ? `${currentTheme.color} text-white border-black` : 'bg-gray-100 border-transparent text-gray-400'}`}>EVENT</button>
              <button onClick={() => setLocalEvent({...localEvent, type: 'transport'})} className={`flex-1 py-2 text-xs font-black rounded border-2 ${localEvent.type === 'transport' ? 'bg-gray-800 text-white border-black' : 'bg-gray-100 border-transparent text-gray-400'}`}>TRANSPORT</button>
           </div>

           {localEvent.type === 'event' ? (
              <>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Title</label>
                    <input type="text" value={localEvent.title} onChange={e => setLocalEvent({...localEvent, title: e.target.value})} className={`w-full p-2 ${POKE_INPUT_STYLE}`} placeholder="參觀博物館" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Location</label>
                    <input type="text" value={localEvent.location} onChange={e => setLocalEvent({...localEvent, location: e.target.value})} className={`w-full p-2 ${POKE_INPUT_STYLE}`} placeholder="Google Maps Keyword" />
                </div>
              </>
           ) : (
              <>
                 <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Mode</label>
                    <select value={localEvent.transportMode} onChange={e => setLocalEvent({...localEvent, transportMode: e.target.value as any})} className={`w-full p-2 ${POKE_INPUT_STYLE}`}>
                       <option value="train">Train (火車)</option>
                       <option value="walk">Walk (步行)</option>
                       <option value="bus">Bus (公車)</option>
                       <option value="car">Car (開車)</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Duration</label>
                    <input type="text" value={localEvent.duration} onChange={e => setLocalEvent({...localEvent, duration: e.target.value})} className={`w-full p-2 ${POKE_INPUT_STYLE}`} placeholder="e.g. 30m" />
                 </div>
              </>
           )}

           <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Notes</label>
              <textarea value={localEvent.notes} onChange={e => setLocalEvent({...localEvent, notes: e.target.value})} className={`w-full p-2 h-20 resize-none ${POKE_INPUT_STYLE}`} placeholder="備註..." />
           </div>

           <button onClick={handleSubmit} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>SAVE</button>
        </div>
      </div>
    </div>
  );
};

export const FlightModal: React.FC<{ flightData: FlightSegment[]; currentTheme: Theme; onClose: () => void; onSave: (data: FlightSegment[]) => void }> = ({ flightData, currentTheme, onClose, onSave }) => {
  const [segments, setSegments] = React.useState<FlightSegment[]>(flightData.length > 0 ? flightData : [{ from: '', fromCity: '', to: '', toCity: '', depTime: '', arrTime: '', date: '', duration: '', airline: '', flight: '', depTerminal: '', arrTerminal: '', gate: '', seat: '', class: '', baggage: '' }]);

  const updateSegment = (idx: number, field: keyof FlightSegment, val: string) => {
      const newSegs = [...segments];
      newSegs[idx] = { ...newSegs[idx], [field]: val };
      setSegments(newSegs);
  };

  const addSegment = () => {
      setSegments([...segments, { from: '', fromCity: '', to: '', toCity: '', depTime: '', arrTime: '', date: '', duration: '', airline: '', flight: '', depTerminal: '', arrTerminal: '', gate: '', seat: '', class: '', baggage: '' }]);
  };

  const removeSegment = (idx: number) => {
      if (segments.length > 1) {
          setSegments(segments.filter((_, i) => i !== idx));
      }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm h-[80vh] flex flex-col`}>
         <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50">
            <h3 className="font-black text-xl">航班資訊</h3>
            <button onClick={onClose}><X size={20}/></button>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {segments.map((seg, i) => (
                <div key={i} className="bg-gray-100 p-3 rounded-xl border-2 border-gray-300 relative">
                    <div className="absolute -top-3 left-3 bg-black text-white text-[10px] px-2 rounded font-bold">SEGMENT {i+1}</div>
                    {segments.length > 1 && <button onClick={() => removeSegment(i)} className="absolute top-2 right-2 text-red-500"><Minus size={16}/></button>}
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <input value={seg.airline} onChange={e => updateSegment(i, 'airline', e.target.value)} placeholder="Airline" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                        <input value={seg.flight} onChange={e => updateSegment(i, 'flight', e.target.value)} placeholder="Flight No." className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                        
                        <input value={seg.from} onChange={e => updateSegment(i, 'from', e.target.value)} placeholder="From (TPE)" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                        <input value={seg.to} onChange={e => updateSegment(i, 'to', e.target.value)} placeholder="To (NRT)" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                        
                        <input value={seg.depTime} onChange={e => updateSegment(i, 'depTime', e.target.value)} placeholder="Dep Time" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                        <input value={seg.arrTime} onChange={e => updateSegment(i, 'arrTime', e.target.value)} placeholder="Arr Time" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />

                        <input value={seg.date} onChange={e => updateSegment(i, 'date', e.target.value)} placeholder="Date (FEB 19)" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                        <input value={seg.duration} onChange={e => updateSegment(i, 'duration', e.target.value)} placeholder="Duration" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                        
                        <input value={seg.gate} onChange={e => updateSegment(i, 'gate', e.target.value)} placeholder="Gate" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                        <input value={seg.seat} onChange={e => updateSegment(i, 'seat', e.target.value)} placeholder="Seat" className={`p-1.5 text-xs ${POKE_INPUT_STYLE}`} />
                    </div>
                </div>
            ))}
            <button onClick={addSegment} className="w-full py-2 border-2 border-dashed border-gray-400 text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-50 flex items-center justify-center">
                <Plus size={14} className="mr-1"/> Add Transfer Flight
            </button>
         </div>
         <div className="p-4 border-t-2 border-black">
             <button onClick={() => onSave(segments)} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>UPDATE FLIGHTS</button>
         </div>
      </div>
    </div>
  );
};

export const HotelModal: React.FC<{ hotel: Hotel; currentTheme: Theme; onClose: () => void; onSave: (h: Hotel) => void; onDelete: (id: string) => void }> = ({ hotel, currentTheme, onClose, onSave, onDelete }) => {
    const [localHotel, setLocalHotel] = React.useState(hotel);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const bookingFileInputRef = useRef<HTMLInputElement>(null);

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const compressed = await compressImage(file, 500, 0.6); // 壓縮更積極 (500px, 0.6 quality)
          setLocalHotel({...localHotel, image: compressed});
        } catch (err) {
          console.error(err);
        }
      }
    };

    const handleBookingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setLocalHotel({...localHotel, bookingFile: reader.result as string, bookingFileType: 'pdf'});
            };
        } else {
            try {
                // 憑證圖片壓縮更積極
                const compressed = await compressImage(file, 600, 0.6);
                setLocalHotel({...localHotel, bookingFile: compressed, bookingFileType: 'image'});
            } catch (err) {
                console.error(err);
            }
        }
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto`}>
           <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
             <h3 className="font-black text-xl">{hotel.id ? '編輯住宿' : '新增住宿'}</h3>
             <button onClick={onClose}><X size={20}/></button>
           </div>
           <div className="space-y-3">
               <input value={localHotel.name} onChange={e => setLocalHotel({...localHotel, name: e.target.value})} placeholder="Hotel Name" className={`w-full p-2 ${POKE_INPUT_STYLE}`} />
               <input value={localHotel.location} onChange={e => setLocalHotel({...localHotel, location: e.target.value})} placeholder="Address / Location" className={`w-full p-2 ${POKE_INPUT_STYLE}`} />
               <input value={localHotel.bookingCode} onChange={e => setLocalHotel({...localHotel, bookingCode: e.target.value})} placeholder="Booking Ref (Optional)" className={`w-full p-2 ${POKE_INPUT_STYLE}`} />
               
               <div className="grid grid-cols-2 gap-2">
                   <div>
                       <label className="text-[10px] font-bold text-gray-500 uppercase">Check-in</label>
                       <input type="date" value={localHotel.checkIn} onChange={e => setLocalHotel({...localHotel, checkIn: e.target.value})} className={`w-full p-2 text-xs ${POKE_INPUT_STYLE}`} />
                   </div>
                   <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Check-out</label>
                       <input type="date" value={localHotel.checkOut} onChange={e => setLocalHotel({...localHotel, checkOut: e.target.value})} className={`w-full p-2 text-xs ${POKE_INPUT_STYLE}`} />
                   </div>
               </div>

               {/* Cover Image Upload */}
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 bg-gray-50 relative group hover:bg-gray-100 transition-colors">
                   <label className="text-[10px] font-bold text-gray-500 block mb-1">HOTEL COVER PHOTO (左側圖片)</label>
                   <div 
                      className="relative h-24 w-full cursor-pointer flex items-center justify-center"
                      onClick={() => imageInputRef.current?.click()}
                   >
                       {localHotel.image ? (
                            <img src={localHotel.image} className="w-full h-full object-cover rounded border border-gray-200" alt="Cover" />
                       ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                 <ImageIcon size={20} className="mb-1"/>
                                 <span className="text-[9px] font-bold">點擊上傳外觀</span>
                            </div>
                       )}
                       {/* Clear Button */}
                       {localHotel.image && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); setLocalHotel({...localHotel, image: ''}); }} 
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow z-50"
                           >
                               <X size={10}/>
                           </button>
                       )}
                   </div>
                   <input type="file" ref={imageInputRef} onChange={handleCoverImageUpload} className="hidden" accept="image/*" />
               </div>

               {/* Booking File Upload */}
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 bg-gray-50 relative group hover:bg-gray-100 transition-colors">
                   <label className="text-[10px] font-bold text-gray-500 block mb-1">BOOKING CONFIRMATION (PDF/IMG)</label>
                   <div 
                      className="relative h-24 w-full cursor-pointer flex items-center justify-center"
                      onClick={() => bookingFileInputRef.current?.click()}
                   >
                       {localHotel.bookingFile ? (
                            <div className="flex items-center justify-center w-full h-full bg-white border border-gray-200 rounded">
                               {localHotel.bookingFileType === 'pdf' ? (
                                   <div className="flex flex-col items-center text-red-500">
                                       <FileText size={32} />
                                       <span className="text-[9px] font-bold mt-1">PDF 已上傳</span>
                                   </div>
                               ) : (
                                   <img src={localHotel.bookingFile} className="w-full h-full object-contain" alt="Booking" />
                               )}
                            </div>
                       ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                 <Upload size={20} className="mb-1"/>
                                 <span className="text-[9px] font-bold">點擊上傳憑證</span>
                            </div>
                       )}
                       {/* Clear Button */}
                       {localHotel.bookingFile && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); setLocalHotel({...localHotel, bookingFile: undefined, bookingFileType: undefined}); }} 
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow z-50"
                           >
                               <X size={10}/>
                           </button>
                       )}
                   </div>
                   <input type="file" ref={bookingFileInputRef} onChange={handleBookingFileUpload} className="hidden" accept="image/*,application/pdf" />
               </div>

               <textarea value={localHotel.notes} onChange={e => setLocalHotel({...localHotel, notes: e.target.value})} placeholder="Notes..." className={`w-full p-2 h-16 resize-none ${POKE_INPUT_STYLE}`} />
               
               <div className="flex space-x-2 pt-2">
                   {hotel.id && (
                       <button onClick={() => onDelete(hotel.id)} className={`px-4 py-3 bg-red-100 text-red-600 font-bold ${POKE_BTN_STYLE}`}><Trash2 size={18}/></button>
                   )}
                   <button onClick={() => onSave(localHotel)} className={`flex-1 ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>SAVE HOTEL</button>
               </div>
           </div>
        </div>
      </div>
    );
};

export const VoucherModal: React.FC<{ voucher: Voucher; currentTheme: Theme; onClose: () => void; onSave: (v: Voucher) => void; onDelete: (id: string) => void }> = ({ voucher, currentTheme, onClose, onSave, onDelete }) => {
    const [localVoucher, setLocalVoucher] = React.useState(voucher);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Compress stronger for QR codes/tickets to save space
                const compressed = await compressImage(file, 600, 0.6);
                setLocalVoucher({...localVoucher, qrImage: compressed});
            } catch (err) {
                console.error(err);
            }
        }
    };
  
    return (
      <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[80vh] overflow-y-auto`}>
           <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
             <h3 className="font-black text-xl">{voucher.id ? '編輯憑證' : '新增憑證'}</h3>
             <button onClick={onClose}><X size={20}/></button>
           </div>
           <div className="space-y-3">
               <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Category</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                      {['transport', 'attraction', 'restaurant', 'other'].map(t => (
                          <button 
                            key={t} 
                            onClick={() => setLocalVoucher({...localVoucher, type: t as any})}
                            className={`flex-1 py-1 text-[10px] font-black uppercase rounded ${localVoucher.type === t ? 'bg-white shadow-sm border border-gray-300' : 'text-gray-400'}`}
                          >
                              {t.slice(0,4)}
                          </button>
                      ))}
                  </div>
               </div>

               <input value={localVoucher.title} onChange={e => setLocalVoucher({...localVoucher, title: e.target.value})} placeholder="Title (e.g. Swiss Pass)" className={`w-full p-2 ${POKE_INPUT_STYLE}`} />
               <input value={localVoucher.referenceNo} onChange={e => setLocalVoucher({...localVoucher, referenceNo: e.target.value})} placeholder="Reference No." className={`w-full p-2 ${POKE_INPUT_STYLE}`} />
               <input type="date" value={localVoucher.date} onChange={e => setLocalVoucher({...localVoucher, date: e.target.value})} className={`w-full p-2 ${POKE_INPUT_STYLE}`} />
               
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 relative group">
                   {localVoucher.qrImage ? (
                       <div className="relative">
                           <img src={localVoucher.qrImage} className="max-h-32 mx-auto rounded border border-gray-200" alt="QR" />
                           <button onClick={() => setLocalVoucher({...localVoucher, qrImage: undefined})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                       </div>
                   ) : (
                       <div className="text-gray-400 flex flex-col items-center">
                           <QrCode size={32} className="mb-2"/>
                           <span className="text-xs font-bold">Upload QR / Ticket Image</span>
                       </div>
                   )}
                   <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"></button>
                   <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
               </div>

               <textarea value={localVoucher.notes} onChange={e => setLocalVoucher({...localVoucher, notes: e.target.value})} placeholder="Notes..." className={`w-full p-2 h-16 resize-none ${POKE_INPUT_STYLE}`} />
               
               <div className="flex space-x-2 pt-2">
                   {voucher.id && (
                       <button onClick={() => onDelete(voucher.id)} className={`px-4 py-3 bg-red-100 text-red-600 font-bold ${POKE_BTN_STYLE}`}><Trash2 size={18}/></button>
                   )}
                   <button onClick={() => onSave(localVoucher)} className={`flex-1 ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>SAVE TICKET</button>
               </div>
           </div>
        </div>
      </div>
    );
};

export const QRModal: React.FC<{ image: string; title: string; onClose: () => void }> = ({ image, title, onClose }) => (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
        <div className="max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-white p-4 rounded-xl shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-lg truncate pr-4">{title}</h3>
                    <button onClick={onClose} className="bg-gray-100 p-1 rounded-full"><X size={20}/></button>
                </div>
                <div className="bg-white p-2 border-2 border-black rounded-lg">
                    <img src={image} className="w-full h-auto rounded" alt="Full QR" />
                </div>
                <div className="text-center mt-4 text-xs font-bold text-gray-500">
                    請出示此畫面給工作人員
                </div>
            </div>
        </div>
    </div>
);

export const MemberModal: React.FC<{ member: Member; currentTheme: Theme; onClose: () => void; onSave: (m: Member) => void; onDelete: (id: string) => void }> = ({ member, currentTheme, onClose, onSave, onDelete }) => {
    const [localMember, setLocalMember] = React.useState(member);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 250, 0.7);
                setLocalMember({...localMember, img: compressed});
            } catch (err) {
                console.error("Image compression failed", err);
            }
        }
    };

    return (
      <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6`}>
           <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
             <h3 className="font-black text-xl">{member.id ? '編輯成員' : '新增成員'}</h3>
             <button onClick={onClose}><X size={20}/></button>
           </div>
           
           <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img src={localMember.img} className="w-20 h-20 rounded-full border-4 border-black bg-white mb-3 object-cover" alt="avatar" />
                    <div className="absolute bottom-3 right-0 bg-blue-500 text-white border-2 border-black rounded-full p-1 shadow-md active:scale-90 transition-transform">
                       <Camera size={12} />
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <h4 className="font-black text-lg">{localMember.name}</h4>
           </div>

           <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Name</label>
                   <input value={localMember.name} onChange={e => setLocalMember({...localMember, name: e.target.value})} className={`w-full p-2 ${POKE_INPUT_STYLE}`} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Partner Pokemon (Theme)</label>
                    <div className="grid grid-cols-5 gap-2 h-32 overflow-y-auto p-1 border-2 border-gray-200 rounded-lg bg-gray-50">
                        {POKEMON_THEMES.map((t, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setLocalMember({...localMember, themeIdx: idx})}
                                className={`flex flex-col items-center p-1 rounded border-2 transition-all ${localMember.themeIdx === idx ? 'border-black bg-white shadow-sm scale-105 z-10' : 'border-transparent opacity-50 grayscale hover:grayscale-0'}`}
                            >
                                <img src={getPokemonSprite(t.id)} className="w-8 h-8" alt={t.name} />
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                   {member.id && (
                       <button onClick={() => onDelete(member.id)} className={`px-4 py-3 bg-red-100 text-red-600 font-bold ${POKE_BTN_STYLE}`}><Trash2 size={18}/></button>
                   )}
                   <button onClick={() => onSave(localMember)} className={`flex-1 ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>SAVE MEMBER</button>
               </div>
           </div>
        </div>
      </div>
    );
};

export const JournalModal: React.FC<{ members: Member[]; currentTheme: Theme; onClose: () => void; onSave: (e: JournalEntry) => void }> = ({ members, currentTheme, onClose, onSave }) => {
    const [content, setContent] = React.useState('');
    const [authorId, setAuthorId] = React.useState(members[0]?.id || '');
    const [image, setImage] = React.useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 600, 0.7);
                setImage(compressed);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSave = () => {
        if(!content.trim()) return;
        const entry: JournalEntry = {
            id: '', // Generated by parent
            date: new Date().toISOString().split('T')[0],
            content,
            image,
            authorId,
            createdAt: new Date().toISOString()
        };
        onSave(entry);
    };

    return (
      <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto`}>
           <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
             <h3 className="font-black text-xl">寫日記</h3>
             <button onClick={onClose}><X size={20}/></button>
           </div>
           
           <div className="space-y-3">
               <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                   {members.map(m => (
                       <button 
                        key={m.id} 
                        onClick={() => setAuthorId(m.id)}
                        className={`flex-shrink-0 flex items-center space-x-1 px-2 py-1 rounded-full border-2 transition-all ${authorId === m.id ? 'border-black bg-white shadow-sm' : 'border-transparent bg-gray-100 opacity-60'}`}
                       >
                           <img src={m.img} className="w-6 h-6 rounded-full border border-black" alt="av" />
                           <span className="text-xs font-black">{m.name}</span>
                       </button>
                   ))}
               </div>

               <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="今天發生了什麼有趣的事..." 
                  className={`w-full p-3 h-32 resize-none ${POKE_INPUT_STYLE}`} 
                  autoFocus
               />

               <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 min-h-[100px] flex items-center justify-center bg-gray-50 relative">
                   {image ? (
                       <div className="relative w-full">
                           <img src={image} className="w-full rounded border border-gray-200" alt="Journal" />
                           <button onClick={() => setImage(undefined)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"><X size={12}/></button>
                       </div>
                   ) : (
                       <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center text-gray-400 w-full h-full justify-center py-4">
                           <Camera size={24} className="mb-2"/>
                           <span className="text-xs font-bold">Add Photo</span>
                       </button>
                   )}
                   <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
               </div>

               <button onClick={handleSave} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>PUBLISH ENTRY</button>
           </div>
        </div>
      </div>
    );
};
