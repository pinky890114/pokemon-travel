
import React, { useState, useEffect } from 'react';
import { Loader2, Plus, LogOut, Map, ArrowRight, Copy, Check, Users, RefreshCw, AlertTriangle, Trash2, Edit2 } from 'lucide-react';

import { generateTransportSuggestion } from './utils';
import { createAdventureInDb, getUserAdventures, joinAdventureInDb, subscribeToAdventure, updateAdventureData, deleteAdventure } from './services/dbService';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ItineraryView } from './components/ItineraryView';
import { BookingView } from './components/BookingView';
import { LedgerView } from './components/LedgerView';
import { MembersView } from './components/MembersView';
import { JournalSection } from './components/JournalSection';
import { WeatherModal, SettingsModal, EventModal, FlightModal, HotelModal, VoucherModal, QRModal, MemberModal, JournalModal, ProfileModal } from './components/Modals';

import { 
  TripSettings, ItineraryEvent, FlightData, Expense, FlightSegment, Hotel, Voucher, Member, JournalEntry, User, AdventureMetadata
} from './types';
import { POKEMON_THEMES, INITIAL_FLIGHT_DATA, INITIAL_HOTELS, INITIAL_VOUCHERS, INITIAL_MEMBERS, POKE_CARD_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE } from './constants';
import { getDateStrFromDay, calculateLevelFromExp, getCityWeather } from './utils';

const generateId = () => Math.random().toString(36).substring(2, 9);

const LoginScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleLogin = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    
    let userId;
    try {
        userId = btoa(encodeURIComponent(cleanName));
    } catch (e) {
        userId = 'user_' + Date.now();
    }

    const user: User = {
      id: userId,
      name: cleanName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6 font-['DotGothic16']">
       <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
             <div className="w-20 h-20 bg-white border-2 border-black rounded-xl mx-auto flex items-center justify-center shadow-[4px_4px_0px_#000]">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" className="w-12 h-12" alt="Logo" />
             </div>
             <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
                ADVENTURE LOG <span className="text-red-500 text-lg align-top">V2</span>
             </h1>
             <p className="text-sm font-bold text-gray-500">請輸入訓練家名稱以開始</p>
          </div>
          
          <div className={`${POKE_CARD_STYLE} p-6 space-y-4`}>
             <input 
               type="text" 
               placeholder="Your Name..." 
               value={name}
               onChange={e => setName(e.target.value)}
               className={`w-full p-3 text-lg text-center font-bold ${POKE_INPUT_STYLE}`}
               onKeyDown={e => e.key === 'Enter' && handleLogin()}
             />
             <button onClick={handleLogin} className={`w-full bg-[#3B4CCA] text-white py-3 font-black text-lg ${POKE_BTN_STYLE}`}>
                START GAME
             </button>
             <p className="text-[10px] text-center text-gray-400 font-bold">
                提示：切換瀏覽器時，輸入<span className="text-red-500">完全相同</span>的名字即可存取舊資料。
             </p>
          </div>
       </div>
    </div>
  );
};

interface LobbyScreenProps {
  user: User;
  onSelectAdventure: (id: string) => void;
  onLogout: () => void;
  onUpdateUser: (u: User) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ user, onSelectAdventure, onLogout, onUpdateUser }) => {
  const [adventures, setAdventures] = useState<AdventureMetadata[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [joinId, setJoinId] = useState('');
  const [mode, setMode] = useState<'view' | 'create' | 'join'>('view');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadAdventures = async () => {
      setIsLoading(true);
      setDbError(null);
      try {
        const list = await getUserAdventures(user.id);
        setAdventures(list);
      } catch (e: any) {
        console.error("DB Load Error", e);
        let msg = "無法連接資料庫。";
        if (e.code === 'permission-denied') msg += " (權限不足)";
        if (e.code === 'unavailable') msg += " (網路問題或服務離線)";
        setDbError(msg + " 請檢查 .env 設定或 Firebase 專案是否建立正確 (US-Central)。");
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    loadAdventures();
  }, [user.id]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setIsLoading(true);
    setDbError(null);
    
    const newAdv: AdventureMetadata = {
      id: generateId(),
      title: newTitle,
      coverImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random() * 1025) + 1}.png`,
      startDate: new Date().toISOString().split('T')[0],
      memberIds: [user.id],
      createdAt: new Date().toISOString(),
      totalDays: 5
    };

    const initialData = {
      tripSettings: { title: newTitle, subtitle: 'New Adventure', startDate: newAdv.startDate },
      totalDays: 5,
      members: [{ 
        id: user.id, 
        name: user.name, 
        themeIdx: 0, 
        img: user.avatar, 
        level: 1, 
        exp: 0 
      }],
      events: [],
      expenses: [],
      journalEntries: [],
      hotels: [],
      vouchers: [],
      flightData: INITIAL_FLIGHT_DATA,
      weatherOverrides: {}
    };

    try {
        const success = await createAdventureInDb(newAdv, initialData);
        if (success) {
            await loadAdventures(); 
            setMode('view');
            setNewTitle('');
            onSelectAdventure(newAdv.id);
        }
    } catch (e) {
        setDbError("建立失敗：請確認 Firebase 資料庫已建立。");
    } finally {
        setIsLoading(false);
    }
  };

  const handleJoin = async () => {
      const cleanId = joinId.trim();
      if (!cleanId) return;
      setIsLoading(true);
      setDbError(null);

      try {
          await joinAdventureInDb(cleanId, user);
          await loadAdventures();
          setMode('view');
          setJoinId('');
          alert("成功加入冒險！");
      } catch (error) {
          alert("加入失敗：找不到此 ID 或資料庫連接錯誤");
      }
      setIsLoading(false);
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm(`確定要刪除旅程「${title}」嗎？\n刪除後所有成員將無法存取此旅程。`)) {
          return;
      }
      setIsLoading(true);
      try {
          await deleteAdventure(id);
          await loadAdventures();
      } catch (e) {
          setDbError("刪除失敗，請稍後再試。");
      } finally {
          setIsLoading(false);
      }
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateProfile = (u: User) => {
      onUpdateUser(u);
      setShowProfileModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-['DotGothic16'] pb-20">
      <div className="p-4 pt-10">
         <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
               <button onClick={() => setShowProfileModal(true)} className="relative group flex-shrink-0">
                   <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-black bg-white object-cover" alt="avatar" />
                   <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white border border-black rounded-full p-0.5 shadow-sm group-hover:scale-110 transition-transform">
                       <Edit2 size={8} />
                   </div>
               </button>
               <div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase leading-none">Trainer</div>
                  <h2 className="text-lg font-black leading-tight text-black">{user.name}</h2>
               </div>
            </div>
            <button onClick={onLogout} className="bg-red-100 text-red-600 p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none transition-all">
               <LogOut size={14} />
            </button>
         </div>

         <div className="mb-6">
            <h3 className="text-sm font-black mb-3 flex items-center justify-between text-black uppercase tracking-widest">
                <div className="flex items-center"><Map size={16} className="mr-2"/>Adventuring</div>
                <button onClick={loadAdventures} disabled={isLoading} className="text-gray-400 hover:text-black active:rotate-180 transition-all"><RefreshCw size={14}/></button>
            </h3>
            
            {dbError && (
                <div className="mb-4 bg-red-50 border-2 border-red-500 rounded-xl p-3 flex items-start text-red-700 animate-in slide-in-from-top-2">
                    <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-xs font-bold leading-tight break-all">{dbError}</div>
                </div>
            )}

            {mode === 'create' ? (
               <div className={`${POKE_CARD_STYLE} p-3 animate-in fade-in`}>
                  <h4 className="font-bold text-[10px] mb-1.5 text-black uppercase tracking-tighter">New Adventure Title</h4>
                  <input 
                    autoFocus
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className={`w-full p-2 mb-3 text-xs ${POKE_INPUT_STYLE}`}
                    placeholder="例如: 關都地區大冒險"
                  />
                  <div className="flex space-x-2">
                     <button onClick={() => setMode('view')} className="flex-1 py-2 text-[10px] font-bold text-gray-500">取消</button>
                     <button onClick={handleCreate} disabled={isLoading} className={`flex-1 py-2 text-[10px] font-bold bg-[#3B4CCA] text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] flex justify-center items-center`}>
                        {isLoading ? <Loader2 className="animate-spin" size={10}/> : '建立冒險'}
                     </button>
                  </div>
               </div>
            ) : mode === 'join' ? (
               <div className={`${POKE_CARD_STYLE} p-3 animate-in fade-in`}>
                  <h4 className="font-bold text-[10px] mb-1.5 text-black uppercase tracking-tighter">Paste Adventure ID</h4>
                  <input 
                    autoFocus
                    value={joinId}
                    onChange={e => setJoinId(e.target.value)}
                    className={`w-full p-2 mb-3 text-xs ${POKE_INPUT_STYLE}`}
                    placeholder="Adventure ID..."
                  />
                  <div className="flex space-x-2">
                     <button onClick={() => setMode('view')} className="flex-1 py-2 text-[10px] font-bold text-gray-500">取消</button>
                     <button onClick={handleJoin} disabled={isLoading} className={`flex-1 py-2 text-[10px] font-bold bg-green-600 text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] flex justify-center items-center`}>
                        {isLoading ? <Loader2 className="animate-spin" size={10}/> : '加入'}
                     </button>
                  </div>
               </div>
            ) : (
               <div className="space-y-2">
                    <button onClick={() => setMode('create')} className="w-full py-4 border-2 border-dashed border-gray-400 rounded-xl text-gray-400 font-bold flex items-center justify-center hover:bg-white hover:border-black hover:text-black transition-all active:scale-[0.99]">
                        <Plus size={18} className="mr-2"/>
                        <span className="text-xs uppercase tracking-tight">展開新冒險</span>
                    </button>
                    <button onClick={() => setMode('join')} className="w-full py-4 border-2 border-dashed border-gray-400 rounded-xl text-gray-400 font-bold flex items-center justify-center hover:bg-white hover:border-black hover:text-black transition-all active:scale-[0.99]">
                        <Users size={18} className="mr-2"/>
                        <span className="text-xs uppercase tracking-tight">加入現有冒險</span>
                    </button>
               </div>
            )}
         </div>

         <div className="grid grid-cols-3 gap-2">
            {isLoading && !dbError && adventures.length === 0 && <div className="col-span-3 text-center p-4"><Loader2 className="animate-spin mx-auto text-gray-400"/></div>}
            {!isLoading && !dbError && adventures.length === 0 && mode === 'view' && (
               <div className="col-span-3 text-center text-gray-400 text-[10px] mt-10 uppercase font-black">
                  No adventures found...
               </div>
            )}
            {adventures.map(adv => {
               const endDate = getDateStrFromDay(adv.totalDays || 5, adv.startDate);
               const dateRange = `${adv.startDate.split('-').slice(1).join('/')}-${endDate.split('-').slice(1).join('/')}`;

               return (
                 <div 
                   key={adv.id} 
                   className={`${POKE_CARD_STYLE} overflow-hidden group transition-all relative flex flex-col border-b-[2px] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer`}
                 >
                    <div onClick={() => onSelectAdventure(adv.id)} className="flex-1 flex flex-col text-left">
                      <div className="aspect-square bg-white relative overflow-hidden border-b border-black flex items-center justify-center p-1">
                          <img 
                            src={adv.coverImage} 
                            className="w-full h-full object-contain pixelated group-hover:animate-bounce-short" 
                            style={{ animationIterationCount: 'infinite', animationDuration: '2s' }}
                            alt="cover"
                          />
                          <div className="absolute top-0.5 left-0.5 bg-black text-white px-1 py-0.5 rounded border border-white text-[6px] font-black shadow-sm uppercase leading-none">
                             D{adv.totalDays || 5}
                          </div>
                      </div>
                      <div className="p-1.5 bg-gray-50 flex-1 flex flex-col justify-between">
                          <div className="min-w-0">
                              <h4 className="text-[9px] font-black leading-tight text-black line-clamp-1 mb-0.5">{adv.title}</h4>
                              <div className="text-[6px] text-gray-400 font-bold leading-none mb-1 truncate">{dateRange}</div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-0.5 pt-1 border-t border-dashed border-gray-200">
                              <div className="flex items-center text-[8px] text-gray-400 font-bold">
                                  <Users size={6} className="mr-0.5 opacity-50"/> {adv.memberIds.length}
                              </div>
                              <div className="flex space-x-0.5">
                                  <button 
                                    onClick={(e) => copyToClipboard(adv.id, e)}
                                    className={`bg-yellow-400 text-black border border-black rounded p-0.5 shadow-[1px_1px_0px_#000] active:translate-y-[0.5px] active:shadow-none hover:bg-yellow-300 transition-colors`}
                                    title="Copy ID"
                                  >
                                     {copiedId === adv.id ? <Check size={6} className="text-green-700 font-bold"/> : <Copy size={6}/>}
                                  </button>
                                  <button 
                                    onClick={(e) => handleDelete(adv.id, adv.title, e)}
                                    className="bg-white border border-black rounded p-0.5 text-red-500 shadow-[1px_1px_0px_#000] active:translate-y-[0.5px] active:shadow-none hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                     <Trash2 size={6} />
                                  </button>
                              </div>
                          </div>
                      </div>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>
      {showProfileModal && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} onSave={handleUpdateProfile} />}
      
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

interface AdventureBoardProps {
  user: User;
  adventureId: string;
  onBack: () => void;
  onUpdateUser: (u: User) => void;
}

const AdventureBoard: React.FC<AdventureBoardProps> = ({ user, adventureId, onBack, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('itinerary'); 
  const [activeDay, setActiveDay] = useState(1); 
  const [totalDays, setTotalDays] = useState(5);
  const [loading, setLoading] = useState(true);

  const [tripSettings, setTripSettings] = useState<TripSettings>({ title: '', subtitle: '', startDate: '' });
  const [flightData, setFlightData] = useState<FlightData>(INITIAL_FLIGHT_DATA);
  const [events, setEvents] = useState<ItineraryEvent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [weatherOverrides, setWeatherOverrides] = useState<Record<string, string>>({});
  const [currentCoverImage, setCurrentCoverImage] = useState('');

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [viewingQR, setViewingQR] = useState<{image: string, title: string} | null>(null);

  const [currentEvent, setCurrentEvent] = useState<ItineraryEvent | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingFlightDirection, setEditingFlightDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [generatingTransportId, setGeneratingTransportId] = useState<string | null>(null);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  const currentTheme = POKEMON_THEMES[(activeDay - 1) % POKEMON_THEMES.length];
  const currentDayEvents = events.filter(e => e.date === getDateStrFromDay(activeDay, tripSettings.startDate));
  const currentWeather = getCityWeather(activeDay, currentDayEvents, weatherOverrides);

  useEffect(() => {
      setLoading(true);
      const unsubscribe = subscribeToAdventure(adventureId, (data) => {
          if (!data) return;
          if (data.tripSettings) setTripSettings(data.tripSettings);
          if (data.flightData) setFlightData(data.flightData);
          if (data.events) setEvents(data.events);
          if (data.expenses) setExpenses(data.expenses);
          if (data.totalDays) setTotalDays(data.totalDays);
          if (data.hotels) setHotels(data.hotels);
          if (data.vouchers) setVouchers(data.vouchers);
          if (data.members) setMembers(data.members);
          if (data.journalEntries) setJournalEntries(data.journalEntries);
          if (data.weatherOverrides) setWeatherOverrides(data.weatherOverrides);
          if (data.coverImage) setCurrentCoverImage(data.coverImage); 
          setLoading(false);
      });
      return () => unsubscribe();
  }, [adventureId]);

  const saveToDb = async (overrides: Partial<any> = {}, coverImageOverride?: string) => {
      const dataToSave = {
          tripSettings,
          flightData,
          events,
          expenses,
          totalDays,
          hotels,
          vouchers,
          members,
          journalEntries,
          weatherOverrides,
          ...overrides 
      };
      await updateAdventureData(adventureId, dataToSave, coverImageOverride);
  };

  const handleSaveSettings = async (settings: TripSettings, days: number, coverImage?: string) => {
    setTripSettings(settings);
    setTotalDays(days);
    if(coverImage) setCurrentCoverImage(coverImage);
    setShowSettingsModal(false);
    await saveToDb({ tripSettings: settings, totalDays: days }, coverImage);
  };

  const handleSaveProfile = async (updatedUser: User) => {
    onUpdateUser(updatedUser); 
    
    const newMembers = members.map(m => 
        m.id === updatedUser.id 
        ? { ...m, name: updatedUser.name, img: updatedUser.avatar }
        : m
    );
    setMembers(newMembers);
    setShowProfileModal(false);
    await saveToDb({ members: newMembers });
  };

  const handleUpdateWeatherLocation = async (day: number, cityKey: string) => {
      const newOverrides = { ...weatherOverrides };
      if (!cityKey) {
          delete newOverrides[String(day)];
      } else {
          newOverrides[String(day)] = cityKey;
      }
      setWeatherOverrides(newOverrides);
      await saveToDb({ weatherOverrides: newOverrides });
  };

  const handleEditFlights = (direction: 'outbound' | 'inbound') => { setEditingFlightDirection(direction); setShowFlightModal(true); };
  const handleSaveFlights = async (newSegments: FlightSegment[]) => { 
      const newData = { ...flightData, [editingFlightDirection]: newSegments };
      setFlightData(newData); 
      setShowFlightModal(false); 
      await saveToDb({ flightData: newData });
  };
  
  const handleOpenAddEvent = (existingEvent?: ItineraryEvent) => {
      if (existingEvent) { setCurrentEvent(existingEvent); setIsEditingEvent(true); } 
      else { setCurrentEvent({ date: getDateStrFromDay(activeDay, tripSettings.startDate), time: '09:00', title: '', location: '', type: 'event', transportMode: 'walk', notes: '' }); setIsEditingEvent(false); }
      setShowEventModal(true);
  };
  const handleSaveEvent = async (event: ItineraryEvent) => {
    if (event.type === 'event' && !event.title) return;
    let newEvents;
    if (isEditingEvent && event.id) { 
        newEvents = events.map(e => e.id === event.id ? { ...event, updatedAt: new Date().toISOString() } : e);
    } else { 
        newEvents = [...events, { ...event, id: generateId(), createdAt: new Date().toISOString() }].sort((a, b) => a.time.localeCompare(b.time));
    }
    setEvents(newEvents);
    setShowEventModal(false);
    await saveToDb({ events: newEvents });
  };
  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => { 
      e.stopPropagation(); 
      const newEvents = events.filter(ev => ev.id !== id);
      setEvents(newEvents);
      await saveToDb({ events: newEvents });
  };

  const handleAddExpense = async (amount: number, item: string, payer: string, category: string) => { 
      const newExpenses = [{ id: generateId(), amount, item, payer, category, date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() }, ...expenses];
      setExpenses(newExpenses);
      await saveToDb({ expenses: newExpenses });
  };

  const handleGenerateTransport = async (startEvent: ItineraryEvent, endEvent: ItineraryEvent) => {
    if (!startEvent.id || generatingTransportId === startEvent.id) return;
    setGeneratingTransportId(startEvent.id);
    const resultText = await generateTransportSuggestion(startEvent.location || startEvent.title, endEvent.location || endEvent.title);
    const parts = resultText.split('|');
    if (parts.length >= 2) {
      const newEvent: ItineraryEvent = {
        id: generateId(),
        date: getDateStrFromDay(activeDay, tripSettings.startDate),
        time: startEvent.time,
        title: '',
        location: '',
        type: 'transport',
        transportMode: (parts[0].trim().toLowerCase() as any) || 'train',
        duration: parts[1].trim(),
        notes: parts[2] || '',
        createdAt: new Date().toISOString()
      };
      const newEvents = [...events, newEvent].sort((a, b) => a.time.localeCompare(b.time));
      setEvents(newEvents);
      await saveToDb({ events: newEvents });
    }
    setGeneratingTransportId(null);
  };
  
  const handleOpenHotelModal = (hotel?: Hotel) => { setCurrentHotel(hotel || { id: '', name: '', location: '', bookingCode: '', image: '' }); setShowHotelModal(true); };
  const handleSaveHotel = async (hotel: Hotel) => { 
      let newHotels;
      if (hotel.id) { newHotels = hotels.map(h => h.id === hotel.id ? hotel : h); } 
      else { newHotels = [...hotels, { ...hotel, id: generateId() }]; } 
      setHotels(newHotels);
      setShowHotelModal(false); 
      await saveToDb({ hotels: newHotels });
  };
  const handleDeleteHotel = async (id: string) => { 
      const newHotels = hotels.filter(h => h.id !== id);
      setHotels(newHotels); 
      setShowHotelModal(false); 
      await saveToDb({ hotels: newHotels });
  };
  
  const handleOpenVoucherModal = (voucher?: Voucher) => { setCurrentVoucher(voucher || { id: '', title: '', type: 'transport', referenceNo: '' }); setShowVoucherModal(true); };
  const handleSaveVoucher = async (voucher: Voucher) => { 
      let newVouchers;
      if (voucher.id) { newVouchers = vouchers.map(v => v.id === voucher.id ? voucher : v); } 
      else { newVouchers = [...vouchers, { ...voucher, id: generateId() }]; } 
      setVouchers(newVouchers);
      setShowVoucherModal(false); 
      await saveToDb({ vouchers: newVouchers });
  };
  const handleDeleteVoucher = async (id: string) => { 
      const newVouchers = vouchers.filter(v => v.id !== id);
      setVouchers(newVouchers); 
      setShowVoucherModal(false); 
      await saveToDb({ vouchers: newVouchers });
  };

  const handleOpenMemberModal = (member?: Member) => { setCurrentMember(member || { id: '', name: '', themeIdx: 0, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=New', level: 1, exp: 0 }); setShowMemberModal(true); };
  const handleSaveMember = async (member: Member) => { 
      let newMembers;
      if (member.id) { newMembers = members.map(m => m.id === member.id ? member : m); } 
      else { newMembers = [...members, { ...member, id: generateId(), exp: 0 }]; } 
      setMembers(newMembers);
      setShowMemberModal(false); 
      await saveToDb({ members: newMembers });
  };
  const handleDeleteMember = async (id: string) => { 
      if(members.length <= 1) { alert("不能刪除最後一位成員！"); return; } 
      const newMembers = members.filter(m => m.id !== id);
      setMembers(newMembers); 
      setShowMemberModal(false); 
      await saveToDb({ members: newMembers });
  };
  
  const handleAddJournalEntry = async (entry: JournalEntry) => {
    const newEntries = [{ ...entry, id: generateId() }, ...journalEntries];
    setJournalEntries(newEntries);
    
    let newMembers = members;
    if (entry.authorId) { 
        newMembers = members.map(m => { 
            if (m.id === entry.authorId) { 
                const newExp = (m.exp || 0) + 1; 
                const newLevel = calculateLevelFromExp(newExp); 
                return { ...m, exp: newExp, level: newLevel }; 
            } 
            return m; 
        }); 
        setMembers(newMembers);
    }
    setShowJournalModal(false);
    await saveToDb({ journalEntries: newEntries, members: newMembers });
  };
  const handleDeleteJournalEntry = async (id: string) => { 
      const newEntries = journalEntries.filter(e => e.id !== id);
      setJournalEntries(newEntries); 
      await saveToDb({ journalEntries: newEntries });
  };

  return (
    <div className={`min-h-screen ${currentTheme.bgLight} font-['DotGothic16'] text-gray-700 max-w-md mx-auto shadow-2xl relative overflow-x-hidden transition-colors duration-300`}>
      {loading && (
        <div className="fixed inset-0 z-[200] bg-black/10 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="animate-spin text-gray-400" size={48} />
        </div>
      )}
      
      <div className="relative">
         <button onClick={onBack} className="fixed top-4 left-4 z-50 bg-white/80 p-2 rounded-full border-2 border-black shadow-sm active:scale-90"><ArrowRight className="rotate-180" size={16}/></button>
         <Header 
            tripSettings={tripSettings} 
            currentTheme={currentTheme} 
            members={members} 
            currentUser={user}
            onOpenSettings={() => setShowSettingsModal(true)} 
            onOpenProfile={() => setShowProfileModal(true)}
         />
      </div>

      <main className="mt-4">
        {activeTab === 'itinerary' && (
          <ItineraryView 
             activeDay={activeDay} 
             setActiveDay={setActiveDay} 
             totalDays={totalDays} 
             setTotalDays={setTotalDays} 
             tripSettings={tripSettings} 
             events={events} 
             weatherOverrides={weatherOverrides}
             onOpenWeather={() => setShowWeatherModal(true)} 
             onAddEvent={handleOpenAddEvent} 
             onDeleteEvent={handleDeleteEvent} 
             onGenerateTransport={handleGenerateTransport} 
             generatingTransportId={generatingTransportId} 
          />
        )}
        {activeTab === 'booking' && (
          <BookingView currentTheme={currentTheme} flightData={flightData} hotels={hotels} vouchers={vouchers} onEditFlights={handleEditFlights} onOpenHotelModal={handleOpenHotelModal} onOpenVoucherModal={handleOpenVoucherModal} onShowQR={(image, title) => setViewingQR({image, title})} />
        )}
        {activeTab === 'ledger' && (
          <LedgerView currentTheme={currentTheme} expenses={expenses} members={members} onAddExpense={handleAddExpense} />
        )}
        {activeTab === 'journal' && (
            <JournalSection entries={journalEntries} members={members} onAddEntry={() => setShowJournalModal(true)} onDeleteEntry={handleDeleteJournalEntry} />
        )}
        {activeTab === 'members' && (
           <MembersView members={members} onMemberClick={handleOpenMemberModal} />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} currentTheme={currentTheme} />

      {showWeatherModal && (
        <WeatherModal 
            weather={currentWeather} 
            day={activeDay}
            currentOverride={weatherOverrides[String(activeDay)]}
            onClose={() => setShowWeatherModal(false)} 
            onUpdateLocation={handleUpdateWeatherLocation}
        />
      )}
      {showSettingsModal && <SettingsModal settings={tripSettings} totalDays={totalDays} adventureId={adventureId} currentCoverImage={currentCoverImage} onClose={() => setShowSettingsModal(false)} onSave={handleSaveSettings} />}
      {showEventModal && currentEvent && <EventModal event={currentEvent} isEditing={isEditingEvent} currentTheme={currentTheme} onClose={() => setShowEventModal(false)} onSave={handleSaveEvent} />}
      {showFlightModal && <FlightModal flightData={flightData[editingFlightDirection]} currentTheme={currentTheme} onClose={() => setShowFlightModal(false)} onSave={handleSaveFlights} />}
      {showHotelModal && currentHotel && <HotelModal hotel={currentHotel} currentTheme={currentTheme} onClose={() => setShowHotelModal(false)} onSave={handleSaveHotel} onDelete={handleDeleteHotel} />}
      {showVoucherModal && currentVoucher && <VoucherModal voucher={currentVoucher} currentTheme={currentTheme} onClose={() => setShowVoucherModal(false)} onSave={handleSaveVoucher} onDelete={handleDeleteVoucher} />}
      {showMemberModal && currentMember && <MemberModal member={currentMember} currentTheme={currentTheme} onClose={() => setShowMemberModal(false)} onSave={handleSaveMember} onDelete={handleDeleteMember} />}
      {showJournalModal && <JournalModal members={members} currentTheme={currentTheme} onClose={() => setShowJournalModal(false)} onSave={handleAddJournalEntry} />}
      {showProfileModal && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} onSave={handleSaveProfile} />}
      {viewingQR && <QRModal image={viewingQR.image} title={viewingQR.title} onClose={() => setViewingQR(null)} />}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentAdventureId, setCurrentAdventureId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('poke_user_session');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('poke_user_session', JSON.stringify(u));
  };

  const handleUpdateUser = (u: User) => {
      setUser(u);
      localStorage.setItem('poke_user_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentAdventureId(null);
    localStorage.removeItem('poke_user_session');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!currentAdventureId) {
    return (
        <LobbyScreen 
            user={user} 
            onSelectAdventure={setCurrentAdventureId} 
            onLogout={handleLogout} 
            onUpdateUser={handleUpdateUser}
        />
    );
  }

  return (
    <AdventureBoard 
        user={user} 
        adventureId={currentAdventureId} 
        onBack={() => setCurrentAdventureId(null)} 
        onUpdateUser={handleUpdateUser}
    />
  );
};

export default App;
