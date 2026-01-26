import React, { useState } from 'react';
import { Plane, Home, QrCode, Edit3, ArrowDownCircle, Clock, Luggage, MapPin, Sun } from 'lucide-react';
import { FlightData, Theme } from '../types';
import { POKE_CARD_STYLE, DIGITAL_FONT_STYLE } from '../constants';

interface BookingViewProps {
  currentTheme: Theme;
  flightData: FlightData;
  onEditFlights: (direction: 'outbound' | 'inbound') => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ currentTheme, flightData, onEditFlights }) => {
  const [bookingTab, setBookingTab] = useState<'flight' | 'hotel' | 'ticket'>('flight');
  const [flightDirection, setFlightDirection] = useState<'outbound' | 'inbound'>('outbound');

  return (
    <div className="px-6 space-y-6 pb-40 animate-in fade-in">
      <div className="flex bg-white/50 p-2 rounded-xl border-2 border-black/10">
        {[
          { id: 'flight', label: '機票', icon: Plane }, 
          { id: 'hotel', label: '住宿', icon: Home }, 
          { id: 'ticket', label: '憑證', icon: QrCode }
        ].map(t => (
          <button key={t.id} onClick={() => setBookingTab(t.id as any)} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${bookingTab === t.id ? `${currentTheme.color} text-white border-2 border-black` : 'text-gray-500'}`}>
            <t.icon size={14} className="mr-2" />{t.label}
          </button>
        ))}
      </div>

      {bookingTab === 'flight' && (
        <div className="space-y-4">
           <div className="flex justify-center space-x-2">
             {(['outbound', 'inbound'] as const).map(dir => (
               <button key={dir} onClick={() => setFlightDirection(dir)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border-2 ${flightDirection === dir ? 'bg-black text-white border-black shadow-[2px_2px_0px_#000]' : 'bg-white text-gray-500 border-gray-300'}`}>{dir === 'outbound' ? '去程' : '回程'}</button>
             ))}
             <button onClick={() => onEditFlights(flightDirection)} className="px-4 py-1.5 text-xs font-bold rounded-lg border-2 bg-blue-100 text-blue-800 border-blue-300 shadow-[2px_2px_0px_#60a5fa]"><Edit3 size={12}/></button>
           </div>
           
           <div className={`${POKE_CARD_STYLE} overflow-hidden`}>
              <div className={`${currentTheme.color} text-white text-xs font-bold px-4 py-2 border-b-[3px] border-black flex justify-between uppercase`}>
                 <span>Boarding Pass</span><span className="font-mono">EK / EY TRANSIT</span>
              </div>
              <div className="bg-gray-50">
                 {flightData[flightDirection].map((segment, index) => (
                    <React.Fragment key={segment.id || index}>
                       {index > 0 && (
                          <div className="relative h-14 bg-blue-50 border-y-2 border-dashed border-gray-300 flex items-center justify-center my-[-1px] z-10">
                              <div className="flex flex-col items-center px-4">
                                <div className="text-[10px] font-black text-blue-800 flex items-center uppercase"><ArrowDownCircle size={12} className="mr-1"/> Transfer at {segment.from}</div>
                                <div className={`text-xs font-black text-blue-600 ${DIGITAL_FONT_STYLE} flex items-center gap-1`}><Clock size={12}/> Layover {segment.layover}</div>
                              </div>
                          </div>
                       )}
                       <div className={`p-5 relative ${index === 0 && flightData[flightDirection].length > 1 ? 'border-b border-gray-200' : ''}`}>
                          <div className="flex justify-between items-end mb-4">
                             <div><div className="text-3xl font-black text-gray-800 tracking-tighter leading-none">{segment.from}</div><div className="text-[10px] font-bold text-gray-500 mt-1">{segment.depTime}</div><div className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">Term {segment.depTerminal}</div></div>
                             <div className="flex-1 px-4 flex flex-col items-center"><div className="text-[9px] font-black text-gray-400 mb-1">{segment.duration}</div><div className="w-full border-t-2 border-gray-300 relative"><Plane size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 bg-gray-50 rotate-90" /></div></div>
                             <div className="text-right"><div className="text-3xl font-black text-gray-800 tracking-tighter leading-none">{segment.to}</div><div className="text-[10px] font-bold text-gray-500 mt-1">{segment.arrTime}</div><div className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">Term {segment.arrTerminal}</div></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-600 bg-white p-2 rounded-lg border-2 border-gray-200 shadow-sm">
                             <div className="col-span-2 flex justify-between border-b-2 border-dashed border-gray-100 pb-1 mb-1">
                                <span>Airline: <span className="text-black font-black">{segment.airline}</span></span>
                                <span>Flight: <span className="text-black font-black">{segment.flight}</span></span>
                             </div>
                             <div className="flex items-center text-black font-black uppercase tracking-tighter col-span-2">
                                <Luggage size={12} className="mr-1 text-gray-400"/>Baggage: {segment.baggage}
                             </div>
                             <div className="flex justify-between col-span-2 border-t-2 border-gray-50 pt-1 mt-1 font-mono text-[9px] text-gray-400 uppercase">
                                <span>GATE: {segment.gate}</span><span>SEAT: {segment.seat}</span><span>CLASS: {segment.class}</span>
                             </div>
                          </div>
                       </div>
                    </React.Fragment>
                 ))}
              </div>
           </div>
        </div>
      )}

      {bookingTab === 'hotel' && (
        <div className="space-y-4">
          {[
            { name: 'Hotel Spinne', loc: 'Grindelwald', stars: 4, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300' },
            { name: 'Backstage Hotel', loc: 'Zermatt', stars: 4, img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300' }
          ].map((h, i) => (
             <div key={i} className={`${POKE_CARD_STYLE} flex overflow-hidden`}>
                <img src={h.img} className="w-24 h-full object-cover border-r-2 border-black" alt="hotel" />
                <div className="p-3 flex-1">
                   <h4 className="font-black text-gray-800 leading-none">{h.name}</h4>
                   <div className="text-[10px] font-bold text-gray-500 mt-1 flex items-center tracking-tighter"><MapPin size={10} className="mr-1"/>{h.loc}</div>
                   <div className="mt-2 flex">{[...Array(h.stars)].map((_, j) => <Sun key={j} size={10} className="text-yellow-500 fill-yellow-500"/>)}</div>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};