import React, { useState, useEffect } from 'react';
import { Loader2, Plus, LogOut, Map, ArrowRight, Copy, Check, Users } from 'lucide-react';

import { generateTransportSuggestion } from './geminiService';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ItineraryView } from './components/ItineraryView';
import { BookingView } from './components/BookingView';
import { LedgerView } from './components/LedgerView';
import { MembersView } from './components/MembersView';
import { JournalSection } from './components/JournalSection';
import { WeatherModal, SettingsModal, EventModal, FlightModal, HotelModal, VoucherModal, QRModal, MemberModal, JournalModal } from './components/Modals';

import { 
  TripSettings, ItineraryEvent, FlightData, Expense, FlightSegment, Hotel, Voucher, Member, JournalEntry, User, AdventureMetadata
} from './types';
import { POKEMON_THEMES, INITIAL_FLIGHT_DATA, INITIAL_HOTELS, INITIAL_VOUCHERS, INITIAL_MEMBERS, POKE_CARD_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE, DIGITAL_FONT_STYLE } from './constants';
import { getDateStrFromDay, calculateLevelFromExp } from './utils';

// Helper for unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Login Component ---
const LoginScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleLogin = () => {
    if (!name.trim()) return;
    
    // Generate a safe ID even for non-Latin characters (e.g. Chinese)
    let userId;
    try {
        userId = btoa(encodeURIComponent(name));
    } catch (e) {
        userId = 'user_' + Date.now();
    }

    const user: User = {
      id: userId,
      name: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
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
             <h1 className="text-3xl font-black text-gray-800 tracking-tighter">ADVENTURE LOG</h1>
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
          </div>
       </div>
    </div>
  );
};

// --- Lobby Component ---
interface LobbyScreenProps {
  user: User;
  onSelectAdventure: (id: string) => void;
  onLogout: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ user, onSelectAdventure, onLogout }) => {
  const [adventures, setAdventures] = useState<AdventureMetadata[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [joinId, setJoinId] = useState('');
  const [mode, setMode] = useState<'view' | 'create' | 'join'>('view');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Load adventures list
    const saved = localStorage.getItem('poke_adventures');
    if (saved) {
      setAdventures(JSON.parse(saved));
    }
  }, []);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    
    const newAdv: AdventureMetadata = {
      id: generateId(),
      title: newTitle,
      coverImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random() * 151) + 1}.png`,
      startDate: new Date().toISOString().split('T')[0],
      memberIds: [user.id],
      createdAt: new Date().toISOString()
    };

    const updatedList = [newAdv, ...adventures];
    setAdventures(updatedList);
    localStorage.setItem('poke_adventures', JSON.stringify(updatedList));
    
    // Initialize default data for this adventure
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
      journalEntries: []
    };
    localStorage.setItem(`poke_adv_${newAdv.id}`, JSON.stringify(initialData));
    
    setMode('view');
    setNewTitle('');
    onSelectAdventure(newAdv.id);
  };

  const handleJoin = () => {
      if (!joinId.trim()) return;

      const allAdventures: AdventureMetadata[] = JSON.parse(localStorage.getItem('poke_adventures') || '[]');
      const targetAdvIndex = allAdventures.findIndex(a => a.id === joinId);

      if (targetAdvIndex === -1) {
          alert("找不到此冒險 ID，請確認代碼是否正確。");
          return;
      }

      if (allAdventures[targetAdvIndex].memberIds.includes(user.id)) {
          alert("你已經是這個冒險的成員了！");
          setMode('view');
          setJoinId('');
          return;
      }

      allAdventures[targetAdvIndex].memberIds.push(user.id);
      localStorage.setItem('poke_adventures', JSON.stringify(allAdventures));
      setAdventures(allAdventures);

      const advDataKey = `poke_adv_${joinId}`;
      const advData = localStorage.getItem(advDataKey);
      if (advData) {
          const parsedData = JSON.parse(advData);
          if (parsedData.members) {
              parsedData.members.push({
                  id: user.id,
                  name: user.name,
                  themeIdx: Math.floor(Math.random() * 7),
                  img: user.avatar,
                  level: 1,
                  exp: 0
              });
              localStorage.setItem(advDataKey, JSON.stringify(parsedData));
          }
      }

      alert("成功加入冒險！");
      setMode('view');
      setJoinId('');
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const myAdventures = adventures.filter(a => a.memberIds.includes(user.id));

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-['DotGothic16'] pb-20">
      <div className="p-6 pt-12">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
               <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-black bg-white" alt="avatar" />
               <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Welcome back</div>
                  <h2 className="text-xl font-black">{user.name}</h2>
               </div>
            </div>
            <button onClick={onLogout} className="bg-red-100 text-red-600 p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none">
               <LogOut size={16} />
            </button>
         </div>

         <div className="mb-6">
            <h3 className="text-lg font-black mb-4 flex items-center"><Map size={20} className="mr-2"/>我的冒險</h3>
            
            {mode === 'create' ? (
               <div className={`${POKE_CARD_STYLE} p-4 animate-in fade-in`}>
                  <h4 className="font-bold text-sm mb-2">新的旅程名稱</h4>
                  <input 
                    autoFocus
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className={`w-full p-2 mb-3 ${POKE_INPUT_STYLE}`}
                    placeholder="例如: 東京五日遊"
                  />
                  <div className="flex space-x-2">
                     <button onClick={() => setMode('view')} className="flex-1 py-2 text-xs font-bold text-gray-500">取消</button>
                     <button onClick={handleCreate} className={`flex-1 py-2 text-xs font-bold bg-[#3B4CCA] text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]`}>建立</button>
                  </div>
               </div>
            ) : mode === 'join' ? (
               <div className={`${POKE_CARD_STYLE} p-4 animate-in fade-in`}>
                  <h4 className="font-bold text-sm mb-2">輸入冒險 ID</h4>
                  <input 
                    autoFocus
                    value={joinId}
                    onChange={e => setJoinId(e.target.value)}
                    className={`w-full p-2 mb-3 ${POKE_INPUT_STYLE}`}
                    placeholder="Paste ID here..."
                  />
                  <div className="flex space-x-2">
                     <button onClick={() => setMode('view')} className="flex-1 py-2 text-xs font-bold text-gray-500">取消</button>
                     <button onClick={handleJoin} className={`flex-1 py-2 text-xs font-bold bg-green-600 text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]`}>加入</button>
                  </div>
               </div>
            ) : (
               <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setMode('create')} className="py-4 border-2 border-dashed border-gray-400 rounded-xl text-gray-400 font-bold flex flex-col items-center justify-center hover:bg-white hover:border-black hover:text-black transition-colors">
                        <Plus size={24} className="mb-1"/>
                        <span>展開新冒險</span>
                    </button>
                    <button onClick={() => setMode('join')} className="py-4 border-2 border-dashed border-gray-400 rounded-xl text-gray-400 font-bold flex flex-col items-center justify-center hover:bg-white hover:border-black hover:text-black transition-colors">
                        <Users size={24} className="mb-1"/>
                        <span>加入冒險</span>
                    </button>
               </div>
            )}
         </div>

         <div className="space-y-4">
            {myAdventures.length === 0 && mode === 'view' && (
               <div className="text-center text-gray-400 text-sm mt-10">
                  還沒有任何冒險記錄...
               </div>
            )}
            {myAdventures.map(adv => (
               <div 
                 key={adv.id} 
                 className={`${POKE_CARD_STYLE} w-full p-0 overflow-hidden text-left group transition-transform relative`}
               >
                  <button onClick={() => onSelectAdventure(adv.id)} className="w-full text-left active:scale-[0.98] transition-transform">
                    <div className="h-20 bg-gray-100 relative overflow-hidden border-b-2 border-black">
                        <img src={adv.coverImage} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" alt="cover"/>
                        <div className="absolute bottom-2 left-4 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded border border-black text-[10px] font-bold">
                            {adv.startDate}
                        </div>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                        <div>
                            <h4 className="text-lg font-black leading-tight">{adv.title}</h4>
                            <div className="text-xs text-gray-500 font-bold mt-1">{adv.memberIds.length} 位訓練家</div>
                        </div>
                        <ArrowRight size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                    </div>
                  </button>

                  {/* ID Copy Button */}
                  <div className="absolute top-2 right-2">
                      <button 
                        onClick={(e) => copyToClipboard(adv.id, e)}
                        className="bg-white/90 backdrop-blur border border-black rounded px-2 py-1 text-[10px] font-bold flex items-center hover:bg-gray-100 active:scale-95"
                      >
                         {copiedId === adv.id ? <Check size={10} className="mr-1 text-green-600"/> : <Copy size={10} className="mr-1"/>}
                         ID: {adv.id}
                      </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

// --- Adventure Board ---
interface AdventureBoardProps {
  user: User;
  adventureId: string;
  onBack: () => void;
}

const AdventureBoard: React.FC<AdventureBoardProps> = ({ user, adventureId, onBack }) => {
  const [activeTab, setActiveTab] = useState('itinerary'); 
  const [activeDay, setActiveDay] = useState(1); 
  const [totalDays, setTotalDays] = useState(5);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = `poke_adv_${adventureId}`;

  // Data State
  const [tripSettings, setTripSettings] = useState<TripSettings>({ title: '', subtitle: '', startDate: '' });
  const [flightData, setFlightData] = useState<FlightData>(INITIAL_FLIGHT_DATA);
  const [events, setEvents] = useState<ItineraryEvent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  
  const [viewingQR, setViewingQR] = useState<{image: string, title: string} | null>(null);

  // Editing State
  const [currentEvent, setCurrentEvent] = useState<ItineraryEvent | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingFlightDirection, setEditingFlightDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [generatingTransportId, setGeneratingTransportId] = useState<string | null>(null);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  const currentTheme = POKEMON_THEMES[(activeDay - 1) % POKEMON_THEMES.length];

  // Initialize Data
  useEffect(() => {
    const loadData = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.tripSettings) setTripSettings(parsed.tripSettings);
          if (parsed.flightData) setFlightData(parsed.flightData);
          if (parsed.events) setEvents(parsed.events);
          if (parsed.expenses) setExpenses(parsed.expenses);
          if (parsed.totalDays) setTotalDays(parsed.totalDays);
          if (parsed.hotels) setHotels(parsed.hotels);
          if (parsed.vouchers) setVouchers(parsed.vouchers);
          
          if (parsed.members) {
             const loadedMembers = parsed.members.map((m: any) => ({
                 ...m,
                 level: m.level || 1,
                 exp: m.exp !== undefined ? m.exp : (m.level * (m.level - 1)) / 2
             }));
             setMembers(loadedMembers);
          }
          if (parsed.journalEntries) setJournalEntries(parsed.journalEntries);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [adventureId]);

  // Save Data
  useEffect(() => {
    if (loading) return; 
    const dataToSave = {
      tripSettings,
      flightData,
      events,
      expenses,
      totalDays,
      hotels,
      vouchers,
      members,
      journalEntries
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
         alert("儲存空間已滿！");
      }
    }
  }, [tripSettings, flightData, events, expenses, totalDays, hotels, vouchers, members, journalEntries, loading, adventureId]);

  // Sync Member List
  useEffect(() => {
      if (loading) return;
      const savedAdvs = localStorage.getItem('poke_adventures');
      if (savedAdvs) {
          const advs: AdventureMetadata[] = JSON.parse(savedAdvs);
          const currentAdv = advs.find(a => a.id === adventureId);
          if (currentAdv) {
              const currentMemberIds = members.map(m => m.id);
              if (JSON.stringify(currentAdv.memberIds) !== JSON.stringify(currentMemberIds)) {
                 currentAdv.memberIds = currentMemberIds;
                 localStorage.setItem('poke_adventures', JSON.stringify(advs));
              }
          }
      }
  }, [members, adventureId, loading]);

  const handleSaveSettings = (settings: TripSettings, days: number) => {
    setTripSettings(settings);
    setTotalDays(days);
    setShowSettingsModal(false);
    
    const savedAdvs = localStorage.getItem('poke_adventures');
    if (savedAdvs) {
        const advs: AdventureMetadata[] = JSON.parse(savedAdvs);
        const currentAdv = advs.find(a => a.id === adventureId);
        if (currentAdv) {
            currentAdv.title = settings.title;
            localStorage.setItem('poke_adventures', JSON.stringify(advs));
        }
    }
  };

  const handleEditFlights = (direction: 'outbound' | 'inbound') => { setEditingFlightDirection(direction); setShowFlightModal(true); };
  const handleSaveFlights = (newSegments: FlightSegment[]) => { setFlightData(prev => ({ ...prev, [editingFlightDirection]: newSegments })); setShowFlightModal(false); };
  const handleOpenAddEvent = (existingEvent?: ItineraryEvent) => {
      if (existingEvent) { setCurrentEvent(existingEvent); setIsEditingEvent(true); } 
      else { setCurrentEvent({ date: getDateStrFromDay(activeDay, tripSettings.startDate), time: '09:00', title: '', location: '', type: 'event', transportMode: 'walk', notes: '' }); setIsEditingEvent(false); }
      setShowEventModal(true);
  };
  const handleSaveEvent = (event: ItineraryEvent) => {
    if (event.type === 'event' && !event.title) return;
    if (isEditingEvent && event.id) { setEvents(prev => prev.map(e => e.id === event.id ? { ...event, updatedAt: new Date().toISOString() } : e)); } 
    else { setEvents(prev => [...prev, { ...event, id: generateId(), createdAt: new Date().toISOString() }].sort((a, b) => a.time.localeCompare(b.time))); }
    setShowEventModal(false);
  };
  const handleDeleteEvent = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setEvents(prev => prev.filter(ev => ev.id !== id)); };
  const handleAddExpense = (amount: number, item: string, payer: string) => { setExpenses(prev => [{ id: generateId(), amount, item, payer, date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() }, ...prev]); };
  const handleGenerateTransport = async (startEvent: ItineraryEvent, endEvent: ItineraryEvent) => {
    if (!startEvent.id || generatingTransportId === startEvent.id) return;
    setGeneratingTransportId(startEvent.id);
    const resultText = await generateTransportSuggestion(startEvent.location || startEvent.title, endEvent.location || endEvent.title);
    const parts = resultText.split('|');
    if (parts.length >= 2) {
      setEvents(prev => [...prev, { id: generateId(), date: getDateStrFromDay(activeDay, tripSettings.startDate), time: startEvent.time, title: '', location: '', type: 'transport', transportMode: (parts[0].trim().toLowerCase() as any) || 'train', duration: parts[1].trim(), notes: parts[2] || '', createdAt: new Date().toISOString() }].sort((a, b) => a.time.localeCompare(b.time)));
    }
    setGeneratingTransportId(null);
  };
  
  const handleOpenHotelModal = (hotel?: Hotel) => { setCurrentHotel(hotel || { id: '', name: '', location: '', bookingCode: '', image: '' }); setShowHotelModal(true); };
  const handleSaveHotel = (hotel: Hotel) => { if (hotel.id) { setHotels(prev => prev.map(h => h.id === hotel.id ? hotel : h)); } else { setHotels(prev => [...prev, { ...hotel, id: generateId() }]); } setShowHotelModal(false); };
  const handleDeleteHotel = (id: string) => { setHotels(prev => prev.filter(h => h.id !== id)); setShowHotelModal(false); };
  
  const handleOpenVoucherModal = (voucher?: Voucher) => { setCurrentVoucher(voucher || { id: '', title: '', type: 'transport', referenceNo: '' }); setShowVoucherModal(true); };
  const handleSaveVoucher = (voucher: Voucher) => { if (voucher.id) { setVouchers(prev => prev.map(v => v.id === voucher.id ? voucher : v)); } else { setVouchers(prev => [...prev, { ...voucher, id: generateId() }]); } setShowVoucherModal(false); };
  const handleDeleteVoucher = (id: string) => { setVouchers(prev => prev.filter(v => v.id !== id)); setShowVoucherModal(false); };

  const handleOpenMemberModal = (member?: Member) => { setCurrentMember(member || { id: '', name: '', themeIdx: 0, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=New', level: 1, exp: 0 }); setShowMemberModal(true); };
  const handleSaveMember = (member: Member) => { if (member.id) { setMembers(prev => prev.map(m => m.id === member.id ? member : m)); } else { setMembers(prev => [...prev, { ...member, id: generateId(), exp: 0 }]); } setShowMemberModal(false); };
  const handleDeleteMember = (id: string) => { if(members.length <= 1) { alert("不能刪除最後一位成員！"); return; } setMembers(prev => prev.filter(m => m.id !== id)); setShowMemberModal(false); };
  
  const handleAddJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => [{ ...entry, id: generateId() }, ...prev]);
    if (entry.authorId) { setMembers(prev => prev.map(m => { if (m.id === entry.authorId) { const newExp = (m.exp || 0) + 1; const newLevel = calculateLevelFromExp(newExp); return { ...m, exp: newExp, level: newLevel }; } return m; })); }
    setShowJournalModal(false);
  };
  const handleDeleteJournalEntry = (id: string) => { setJournalEntries(prev => prev.filter(e => e.id !== id)); };

  return (
    <div className={`min-h-screen ${currentTheme.bgLight} font-['DotGothic16'] text-gray-700 max-w-md mx-auto shadow-2xl relative overflow-x-hidden transition-colors duration-300`}>
      {loading && (
        <div className="fixed inset-0 z-[200] bg-black/10 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="animate-spin text-gray-400" size={48} />
        </div>
      )}
      
      <div className="relative">
         <button onClick={onBack} className="fixed top-4 left-4 z-50 bg-white/80 p-2 rounded-full border-2 border-black shadow-sm active:scale-90"><ArrowRight className="rotate-180" size={16}/></button>
         <Header tripSettings={tripSettings} currentTheme={currentTheme} members={members} onOpenSettings={() => setShowSettingsModal(true)} />
      </div>

      <main className="mt-4">
        {activeTab === 'itinerary' && (
          <ItineraryView activeDay={activeDay} setActiveDay={setActiveDay} totalDays={totalDays} setTotalDays={setTotalDays} tripSettings={tripSettings} events={events} onOpenWeather={() => setShowWeatherModal(true)} onAddEvent={handleOpenAddEvent} onDeleteEvent={handleDeleteEvent} onGenerateTransport={handleGenerateTransport} generatingTransportId={generatingTransportId} />
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

      {/* Modals Injection */}
      {showWeatherModal && <WeatherModal onClose={() => setShowWeatherModal(false)} />}
      {showSettingsModal && <SettingsModal settings={tripSettings} totalDays={totalDays} adventureId={adventureId} onClose={() => setShowSettingsModal(false)} onSave={handleSaveSettings} />}
      {showEventModal && currentEvent && <EventModal event={currentEvent} isEditing={isEditingEvent} currentTheme={currentTheme} onClose={() => setShowEventModal(false)} onSave={handleSaveEvent} />}
      {showFlightModal && <FlightModal flightData={flightData[editingFlightDirection]} currentTheme={currentTheme} onClose={() => setShowFlightModal(false)} onSave={handleSaveFlights} />}
      {showHotelModal && currentHotel && <HotelModal hotel={currentHotel} currentTheme={currentTheme} onClose={() => setShowHotelModal(false)} onSave={handleSaveHotel} onDelete={handleDeleteHotel} />}
      {showVoucherModal && currentVoucher && <VoucherModal voucher={currentVoucher} currentTheme={currentTheme} onClose={() => setShowVoucherModal(false)} onSave={handleSaveVoucher} onDelete={handleDeleteVoucher} />}
      {showMemberModal && currentMember && <MemberModal member={currentMember} currentTheme={currentTheme} onClose={() => setShowMemberModal(false)} onSave={handleSaveMember} onDelete={handleDeleteMember} />}
      {showJournalModal && <JournalModal members={members} currentTheme={currentTheme} onClose={() => setShowJournalModal(false)} onSave={handleAddJournalEntry} />}
      {viewingQR && <QRModal image={viewingQR.image} title={viewingQR.title} onClose={() => setViewingQR(null)} />}
    </div>
  );
};

// --- App Root ---
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
        />
    );
  }

  return (
    <AdventureBoard 
        user={user} 
        adventureId={currentAdventureId} 
        onBack={() => setCurrentAdventureId(null)} 
    />
  );
};

export default App;