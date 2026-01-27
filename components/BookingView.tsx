import React, { useState } from 'react';
import { Plane, Home, QrCode, Edit3, ArrowDownCircle, Clock, Luggage, MapPin, Plus, StickyNote, Calendar, Ticket } from 'lucide-react';
import { FlightData, Hotel, Theme, Voucher } from '../types';
import { POKE_CARD_STYLE, DIGITAL_FONT_STYLE } from '../constants';

interface BookingViewProps {
  currentTheme: Theme;
  flightData: FlightData;
  hotels?: Hotel[];
  vouchers?: Voucher[];
  onEditFlights: (direction: 'outbound' | 'inbound') => void;
  onOpenHotelModal?: (hotel?: Hotel) => void;
  onOpenVoucherModal?: (voucher?: Voucher) => void;
  onShowQR?: (image: string, title: string) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ currentTheme, flightData, hotels = [], vouchers = [], onEditFlights, onOpenHotelModal, onOpenVoucherModal, onShowQR }) => {
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
             <button onClick={() => onEditFlights(flightDirection)} className="px-4 py-1.5 text-xs font-bold rounded-lg border-2 bg-[#FFF9C4] text-black border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none transition-all"><Edit3 size={12}/></button>
           </div>
           
           <div className={`${POKE_CARD_STYLE} overflow-hidden`}>
              <div className={`${currentTheme.color} text-white text-xs font-bold px-4 py-2 border-b-[3px] border-black flex justify-between uppercase`}>
                 <span>Boarding Pass</span><span className="font-mono">EK / EY TRANSIT</span>
              </div>
              <div className="bg-gray-50">
                 {flightData[flightDirection].map((segment, index) => (
                    <React.Fragment key={segment.id || index}>
                       {index > 0 && (
                          <div className="relative h-14 bg-gray-200 border-y-2 border-dashed border-gray-400 flex items-center justify-center my-[-1px] z-10">
                              <div className="flex flex-col items-center px-4">
                                <div className="text-[10px] font-black text-gray-600 flex items-center uppercase"><ArrowDownCircle size={12} className="mr-1"/> Transfer at {segment.from}</div>
                                <div className={`text-xs font-black text-gray-800 ${DIGITAL_FONT_STYLE} flex items-center gap-1`}><Clock size={12}/> Layover {segment.layover}</div>
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
                                <Luggage size={12} className="mr-1 text-gray-400"/>Baggage: {segment.baggage} <span className="text-gray-400 mx-2">|</span> Carry-On: 7KG
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
          <div className="flex justify-end">
            <button onClick={() => onOpenHotelModal && onOpenHotelModal()} className="px-3 py-1.5 text-xs font-bold rounded-lg border-2 bg-[#FFF9C4] text-[#F57F17] border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none transition-all flex items-center">
              <Plus size={14} className="mr-1" /> 新增住宿
            </button>
          </div>
          {hotels.map((h, i) => (
             <button key={h.id} onClick={() => onOpenHotelModal && onOpenHotelModal(h)} className={`${POKE_CARD_STYLE} flex overflow-hidden w-full text-left active:scale-[0.98] transition-transform`}>
                
                {/* Location Strip on Far Left */}
                <div className="w-10 bg-gray-800 border-r-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                   <span className="text-white font-black text-xs tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 py-2 truncate max-h-[140px]">
                      {h.location.split(',')[0]}
                   </span>
                </div>

                <img src={h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'} className="w-24 object-cover border-r-2 border-black" alt="hotel" />
                
                <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                   <h4 className="font-black text-gray-800 leading-tight text-lg mb-1 truncate">{h.name}</h4>
                   
                   <a 
                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.location)}`}
                     target="_blank" 
                     rel="noopener noreferrer"
                     onClick={(e) => e.stopPropagation()}
                     className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center tracking-tighter uppercase mb-2 truncate"
                   >
                     <MapPin size={10} className="mr-1 flex-shrink-0"/>{h.location}
                   </a>

                   {/* Date Info */}
                   <div className="flex items-center gap-2 mb-2 w-full">
                       <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 flex flex-col items-center">
                           <span className="text-[9px] font-bold text-gray-400 leading-none mb-0.5">CHECK-IN</span>
                           <span className={`text-xs font-black text-gray-700 ${DIGITAL_FONT_STYLE} leading-none`}>{h.checkIn?.replace(/-/g, '/') || '--/--/--'}</span>
                       </div>
                       <div className="text-gray-300 font-black">→</div>
                       <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 flex flex-col items-center">
                           <span className="text-[9px] font-bold text-gray-400 leading-none mb-0.5">CHECK-OUT</span>
                           <span className={`text-xs font-black text-gray-700 ${DIGITAL_FONT_STYLE} leading-none`}>{h.checkOut?.replace(/-/g, '/') || '--/--/--'}</span>
                       </div>
                   </div>

                   {h.bookingCode && (
                     <div className="inline-flex items-center text-[10px] bg-gray-100 px-2 py-1 rounded border border-gray-300 font-mono font-bold text-black self-start mb-2">
                        {h.bookingCode}
                     </div>
                   )}
                   {h.notes && (
                      <div className="text-[10px] text-gray-500 bg-yellow-50 p-2 rounded border border-dashed border-yellow-300 font-bold leading-tight flex items-start w-full">
                        <StickyNote size={10} className="mr-1 mt-0.5 flex-shrink-0 text-yellow-600"/>
                        <span className="break-all">{h.notes}</span>
                      </div>
                   )}
                </div>
             </button>
          ))}
          {hotels.length === 0 && (
            <div className={`${POKE_CARD_STYLE} p-8 text-center bg-gray-50 text-gray-400 font-bold`}>
              尚未新增任何住宿...
            </div>
          )}
        </div>
      )}

      {bookingTab === 'ticket' && (
        <div className="space-y-4">
           <div className="flex justify-end">
            <button onClick={() => onOpenVoucherModal && onOpenVoucherModal()} className="px-3 py-1.5 text-xs font-bold rounded-lg border-2 bg-[#FFF9C4] text-[#F57F17] border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none transition-all flex items-center">
              <Plus size={14} className="mr-1" /> 新增憑證
            </button>
          </div>
          {vouchers.map(v => (
             <button key={v.id} onClick={() => onOpenVoucherModal && onOpenVoucherModal(v)} className={`${POKE_CARD_STYLE} flex overflow-hidden w-full text-left active:scale-[0.98] transition-transform`}>
                
                {/* Barcode Strip on Left */}
                <div className="w-8 bg-gray-100 border-r-2 border-black border-dashed flex flex-col items-center justify-center p-1 relative">
                   <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-1 border-x-2 border-dashed border-gray-300"></div>
                </div>

                <div className="p-3 flex-1">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                         <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-black text-white mb-1 inline-block ${v.type === 'transport' ? 'bg-blue-500' : v.type === 'attraction' ? 'bg-red-500' : 'bg-gray-500'}`}>
                           {v.type === 'transport' ? '交通' : v.type === 'attraction' ? '景點' : '其他'}
                         </span>
                         <h4 className="font-black text-gray-800 text-lg leading-none">{v.title}</h4>
                      </div>
                      <button 
                         onClick={(e) => {
                           if (v.qrImage) {
                             e.stopPropagation();
                             onShowQR && onShowQR(v.qrImage, v.title);
                           }
                         }}
                         className={`p-1 rounded-lg border-2 transition-all ${v.qrImage ? 'border-black bg-white hover:bg-gray-100 text-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[1px]' : 'border-transparent text-gray-300 cursor-default'}`}
                      >
                         <QrCode size={28} />
                      </button>
                   </div>
                   
                   <div className="bg-gray-50 border-2 border-gray-200 rounded p-2 mb-2 font-mono">
                      <div className="text-[9px] text-gray-400 font-bold">REFERENCE NO.</div>
                      <div className="text-sm font-black text-gray-800 tracking-wider">{v.referenceNo}</div>
                   </div>

                   <div className="flex gap-4 mb-2">
                      <div>
                         <div className="text-[9px] text-gray-400 font-bold">DATE</div>
                         <div className={`text-sm font-black text-gray-800 ${DIGITAL_FONT_STYLE}`}>{v.date?.replace(/-/g, '/') || '--/--'}</div>
                      </div>
                   </div>

                   {v.notes && (
                      <div className="text-[10px] text-gray-500 border-t border-dashed border-gray-300 pt-2 flex items-start">
                        <StickyNote size={10} className="mr-1 mt-0.5 flex-shrink-0"/>
                        <span>{v.notes}</span>
                      </div>
                   )}
                </div>
             </button>
          ))}
          {vouchers.length === 0 && (
             <div className={`${POKE_CARD_STYLE} p-8 text-center bg-gray-50 text-gray-400 font-bold`}>
              背包裡空空如也...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
