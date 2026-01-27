import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { generateTransportSuggestion } from './services/geminiService';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ItineraryView } from './components/ItineraryView';
import { BookingView } from './components/BookingView';
import { LedgerView } from './components/LedgerView';
import { MembersView } from './components/MembersView';
import { WeatherModal, SettingsModal, EventModal, FlightModal, HotelModal, VoucherModal, QRModal } from './components/Modals';

import { 
  TripSettings, ItineraryEvent, FlightData, Expense, FlightSegment, Hotel, Voucher
} from './types';
import { POKEMON_THEMES, INITIAL_FLIGHT_DATA, INITIAL_HOTELS, INITIAL_VOUCHERS } from './constants';
import { getDateStrFromDay } from './utils';

// Helper for unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);
const STORAGE_KEY = 'adventure_log_data_v1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('itinerary'); 
  const [activeDay, setActiveDay] = useState(1); 
  const [totalDays, setTotalDays] = useState(21);
  const [loading, setLoading] = useState(true);

  // Data State
  const [tripSettings, setTripSettings] = useState<TripSettings>({ 
    title: '沙狐狸與狼尾草的度蜜月', 
    subtitle: '瑞士與義大利 21 日遊', 
    startDate: '2026-02-19' 
  });
  const [flightData, setFlightData] = useState<FlightData>(INITIAL_FLIGHT_DATA);
  const [events, setEvents] = useState<ItineraryEvent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  
  // QR View State
  const [viewingQR, setViewingQR] = useState<{image: string, title: string} | null>(null);

  // Editing State
  const [currentEvent, setCurrentEvent] = useState<ItineraryEvent | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingFlightDirection, setEditingFlightDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [generatingTransportId, setGeneratingTransportId] = useState<string | null>(null);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);

  const currentTheme = POKEMON_THEMES[(activeDay - 1) % POKEMON_THEMES.length];

  // Initialize Data from LocalStorage
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
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save Data on Change
  useEffect(() => {
    if (loading) return; 
    const dataToSave = {
      tripSettings,
      flightData,
      events,
      expenses,
      totalDays,
      hotels,
      vouchers
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [tripSettings, flightData, events, expenses, totalDays, hotels, vouchers, loading]);

  // Handlers
  const handleSaveSettings = (settings: TripSettings, days: number) => {
    setTripSettings(settings);
    setTotalDays(days);
    setShowSettingsModal(false);
  };

  const handleEditFlights = (direction: 'outbound' | 'inbound') => {
    setEditingFlightDirection(direction);
    setShowFlightModal(true);
  };

  const handleSaveFlights = (newSegments: FlightSegment[]) => {
    setFlightData(prev => ({ ...prev, [editingFlightDirection]: newSegments }));
    setShowFlightModal(false);
  };

  const handleOpenAddEvent = (existingEvent?: ItineraryEvent) => {
    if (existingEvent) {
      setCurrentEvent(existingEvent);
      setIsEditingEvent(true);
    } else {
      setCurrentEvent({ 
        date: getDateStrFromDay(activeDay, tripSettings.startDate), 
        time: '09:00', 
        title: '', 
        location: '', 
        type: 'event', 
        transportMode: 'walk', 
        notes: '' 
      });
      setIsEditingEvent(false);
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = (event: ItineraryEvent) => {
    if (event.type === 'event' && !event.title) return;
    
    if (isEditingEvent && event.id) {
      setEvents(prev => prev.map(e => e.id === event.id ? { ...event, updatedAt: new Date().toISOString() } : e));
    } else {
      setEvents(prev => [...prev, { ...event, id: generateId(), createdAt: new Date().toISOString() }].sort((a, b) => a.time.localeCompare(b.time)));
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const handleAddExpense = (amount: number, item: string, payer: string) => {
    const newExpense: Expense = {
      id: generateId(),
      amount, item, payer,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleGenerateTransport = async (startEvent: ItineraryEvent, endEvent: ItineraryEvent) => {
    if (!startEvent.id || generatingTransportId === startEvent.id) return;
    setGeneratingTransportId(startEvent.id);
    
    const resultText = await generateTransportSuggestion(
      startEvent.location || startEvent.title,
      endEvent.location || endEvent.title
    );
    
    const parts = resultText.split('|');
    if (parts.length >= 2) {
      const newTransport: ItineraryEvent = { 
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
      
      setEvents(prev => [...prev, newTransport].sort((a, b) => a.time.localeCompare(b.time)));
    }
    setGeneratingTransportId(null);
  };

  // Hotel Handlers
  const handleOpenHotelModal = (hotel?: Hotel) => {
    if (hotel) {
      setCurrentHotel(hotel);
    } else {
      setCurrentHotel({ 
        id: '', 
        name: '', 
        location: '', 
        bookingCode: '', 
        image: '' 
      });
    }
    setShowHotelModal(true);
  };

  const handleSaveHotel = (hotel: Hotel) => {
    if (!hotel.name) return;
    if (hotel.id) {
      setHotels(prev => prev.map(h => h.id === hotel.id ? hotel : h));
    } else {
      setHotels(prev => [...prev, { ...hotel, id: generateId(), createdAt: new Date().toISOString() }]);
    }
    setShowHotelModal(false);
  };

  const handleDeleteHotel = (id: string) => {
    setHotels(prev => prev.filter(h => h.id !== id));
    setShowHotelModal(false);
  };

  // Voucher Handlers
  const handleOpenVoucherModal = (voucher?: Voucher) => {
    if (voucher) {
      setCurrentVoucher(voucher);
    } else {
      setCurrentVoucher({
        id: '',
        title: '',
        type: 'transport',
        referenceNo: '',
      });
    }
    setShowVoucherModal(true);
  };

  const handleSaveVoucher = (voucher: Voucher) => {
    if (!voucher.title) return;
    if (voucher.id) {
      setVouchers(prev => prev.map(v => v.id === voucher.id ? voucher : v));
    } else {
      setVouchers(prev => [...prev, { ...voucher, id: generateId(), createdAt: new Date().toISOString() }]);
    }
    setShowVoucherModal(false);
  };

  const handleDeleteVoucher = (id: string) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
    setShowVoucherModal(false);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bgLight} font-['DotGothic16'] text-gray-700 max-w-md mx-auto shadow-2xl relative overflow-x-hidden transition-colors duration-300`}>
      {loading && activeTab === 'itinerary' && (
        <div className="fixed inset-0 z-[200] bg-black/10 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="animate-spin text-gray-400" size={48} />
        </div>
      )}
      
      <Header 
        tripSettings={tripSettings} 
        currentTheme={currentTheme} 
        onOpenSettings={() => setShowSettingsModal(true)} 
      />

      <main className="mt-4">
        {activeTab === 'itinerary' && (
          <ItineraryView 
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            totalDays={totalDays}
            setTotalDays={setTotalDays}
            tripSettings={tripSettings}
            events={events}
            onOpenWeather={() => setShowWeatherModal(true)}
            onAddEvent={handleOpenAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onGenerateTransport={handleGenerateTransport}
            generatingTransportId={generatingTransportId}
          />
        )}
        {activeTab === 'booking' && (
          <BookingView 
            currentTheme={currentTheme}
            flightData={flightData}
            hotels={hotels}
            vouchers={vouchers}
            onEditFlights={handleEditFlights}
            onOpenHotelModal={handleOpenHotelModal}
            onOpenVoucherModal={handleOpenVoucherModal}
            onShowQR={(image, title) => setViewingQR({image, title})}
          />
        )}
        {activeTab === 'ledger' && (
          <LedgerView 
            currentTheme={currentTheme}
            expenses={expenses}
            onAddExpense={handleAddExpense}
          />
        )}
        {activeTab === 'members' && <MembersView />}
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentTheme={currentTheme} 
      />

      {/* Modals */}
      {showWeatherModal && <WeatherModal onClose={() => setShowWeatherModal(false)} />}
      
      {showSettingsModal && (
        <SettingsModal 
          settings={tripSettings} 
          totalDays={totalDays} 
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
        />
      )}

      {showEventModal && currentEvent && (
        <EventModal 
          event={currentEvent} 
          isEditing={isEditingEvent} 
          currentTheme={currentTheme}
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
        />
      )}

      {showFlightModal && (
        <FlightModal 
          flightData={flightData[editingFlightDirection]} 
          currentTheme={currentTheme}
          onClose={() => setShowFlightModal(false)}
          onSave={handleSaveFlights}
        />
      )}

      {showHotelModal && currentHotel && (
        <HotelModal 
          hotel={currentHotel} 
          currentTheme={currentTheme}
          onClose={() => setShowHotelModal(false)}
          onSave={handleSaveHotel}
          onDelete={handleDeleteHotel}
        />
      )}

      {showVoucherModal && currentVoucher && (
        <VoucherModal 
          voucher={currentVoucher}
          currentTheme={currentTheme}
          onClose={() => setShowVoucherModal(false)}
          onSave={handleSaveVoucher}
          onDelete={handleDeleteVoucher}
        />
      )}
      
      {viewingQR && (
        <QRModal 
          image={viewingQR.image} 
          title={viewingQR.title} 
          onClose={() => setViewingQR(null)} 
        />
      )}
    </div>
  );
};

export default App;