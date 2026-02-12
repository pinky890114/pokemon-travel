
import React, { useState, useRef, useEffect } from 'react';
import { Plane, Home, QrCode, Edit3, ArrowDownCircle, Clock, Luggage, MapPin, Plus, StickyNote, Calendar, Ticket, Languages, Sparkles, Loader2, Copy, FileText, Image as ImageIcon } from 'lucide-react';
import { FlightData, Hotel, Theme, Voucher } from '../types';
import { POKE_CARD_STYLE, DIGITAL_FONT_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE } from '../constants';
// FIX: Import from utils to avoid file resolution error
import { translateText } from '../utils';

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
  const [bookingTab, setBookingTab] = useState<'flight' | 'hotel' | 'ticket' | 'translator'>('flight');
  const [flightDirection, setFlightDirection] = useState<'outbound' | 'inbound'>('outbound');

  const [translationInput, setTranslationInput] = useState('');
  const [translationResult, setTranslationResult] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);
  const [transMode, setTransMode] = useState<'to_zh' | 'to_de' | 'to_it'>('to_zh');
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleTranslate = async () => {
    if (!translationInput.trim()) return;
    
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }

    setTranslationLoading(true);
    setTranslationResult(''); 
    
    try {
        const result = await translateText(translationInput, transMode);
        setTranslationResult(result);
    } catch (e) {
        setTranslationResult("發生未預期的錯誤");
    } finally {
        setTranslationLoading(false);
    }
  };

  useEffect(() => {
    if (translationResult && resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [translationResult]);

  return (
    <div className="px-6 space-y-6 pb-40 animate-in fade-in">
      <div className="flex bg-white/50 p-2 rounded-xl border-2 border-black/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'flight', label: '機票', icon: Plane }, 
          { id: 'hotel', label: '住宿', icon: Home }, 
          { id: 'ticket', label: '憑證', icon: QrCode },
          { id: 'translator', label: '翻譯', icon: Languages }
        ].map(t => (
          <button key={t.id} onClick={() => setBookingTab(t.id as any)} className={`flex-1 min-w-[80px] py-2 px-2 rounded-lg text-sm font-bold flex items-center justify-center transition-all whitespace-nowrap ${bookingTab === t.id ? `${currentTheme.color} text-white border-2 border-black shadow-sm` : 'text-gray-500'}`}>
            <t.icon size={14} className="mr-1.5" />{t.label}
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
             <button key={h.id} onClick={() => onOpenHotelModal && onOpenHotelModal(h)} className={`${POKE_CARD_STYLE} flex overflow-hidden w-full text-left active:scale-[0.98] transition-transform h-32`}>
                <div className="w-28 bg-gray-200 border-r-2 border-black flex-shrink-0 relative overflow-hidden">
                    {h.image ? (
                        <img src={h.image} className="w-full h-full object-cover" alt={h.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                             <span className="text-white font-black text-xs tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 py-2 truncate max-h-[140px]">
                                {h.location.split(',')[0]}
                             </span>
                        </div>
                    )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between min-w-0 bg-white">
                   <div>
                       <div className="flex justify-between items-start">
                           <h4 className="font-black text-gray-800 leading-tight text-lg truncate mr-1">{h.name}</h4>
                           {h.bookingFile && (
                               <div 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (h.bookingFileType === 'pdf') {
                                            const link = document.createElement('a');
                                            link.href = h.bookingFile;
                                            link.download = `booking_${h.name.replace(/\s+/g, '_')}.pdf`;
                                            link.click();
                                        } else {
                                            onShowQR && onShowQR(h.bookingFile, `Booking: ${h.name}`);
                                        }
                                    }}
                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1 rounded border border-blue-200"
                                    title="View Booking"
                               >
                                    <FileText size={16} />
                               </div>
                           )}
                       </div>
                       <a 
                         href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.location)}`}
                         target="_blank" 
                         rel="noopener noreferrer"
                         onClick={(e) => e.stopPropagation()}
                         className="text-[10px] font-bold text-gray-500 flex items-center tracking-tighter uppercase truncate mt-0.5"
                       >
                         <MapPin size={10} className="mr-1 flex-shrink-0"/>{h.location}
                       </a>
                   </div>
                   
                   <div className="flex items-center gap-2 mt-1 w-full">
                       <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 flex flex-col items-center">
                           <span className="text-[8px] font-bold text-gray-400 leading-none mb-0.5">IN</span>
                           <span className={`text-xs font-black text-gray-700 ${DIGITAL_FONT_STYLE} leading-none`}>{h.checkIn?.slice(5).replace('-', '/') || '--/--'}</span>
                       </div>
                       <div className="text-gray-300 font-black text-[10px]">&gt;</div>
                       <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 flex flex-col items-center">
                           <span className="text-[8px] font-bold text-gray-400 leading-none mb-0.5">OUT</span>
                           <span className={`text-xs font-black text-gray-700 ${DIGITAL_FONT_STYLE} leading-none`}>{h.checkOut?.slice(5).replace('-', '/') || '--/--'}</span>
                       </div>
                   </div>
                   
                   {h.notes && (
                      <div className="text-[9px] text-gray-500 bg-yellow-50 px-1.5 py-1 rounded border border-dashed border-yellow-300 font-bold leading-tight flex items-center w-full mt-2 truncate">
                        <StickyNote size={8} className="mr-1 flex-shrink-0 text-yellow-600"/>
                        <span className="truncate">{h.notes}</span>
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
                <div className="w-8 bg-gray-100 border-r-2 border-black border-dashed flex flex-col items-center justify-center p-1 relative">
                   <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-1 border-x-2 border-dashed border-gray-300"></div>
                </div>
                <div className="p-3 flex-1">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                         <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-black text-white mb-1 inline-block ${
                           v.type === 'transport' ? 'bg-blue-500' : 
                           v.type === 'attraction' ? 'bg-red-500' : 
                           v.type === 'restaurant' ? 'bg-orange-500' : 
                           'bg-gray-500'
                         }`}>
                           {v.type === 'transport' ? '交通' : v.type === 'attraction' ? '景點' : v.type === 'restaurant' ? '餐廳' : '其他'}
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

      {bookingTab === 'translator' && (
        <div className="space-y-4">
           {/* Mode Selection */}
           <div className="flex bg-gray-100 p-1 rounded-lg border-2 border-gray-200 overflow-x-auto no-scrollbar">
              <button onClick={() => setTransMode('to_zh')} className={`flex-1 min-w-[80px] py-2 text-[10px] font-black rounded transition-all whitespace-nowrap ${transMode === 'to_zh' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>德/義 → 中</button>
              <button onClick={() => setTransMode('to_de')} className={`flex-1 min-w-[80px] py-2 text-[10px] font-black rounded transition-all whitespace-nowrap ${transMode === 'to_de' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>中 → 德文</button>
              <button onClick={() => setTransMode('to_it')} className={`flex-1 min-w-[80px] py-2 text-[10px] font-black rounded transition-all whitespace-nowrap ${transMode === 'to_it' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>中 → 義大利</button>
           </div>

           {/* Input Card */}
           <div className={`${POKE_CARD_STYLE} p-4 bg-white space-y-3`}>
              <div className="flex justify-between items-center mb-1">
                 <label className="text-xs font-black text-gray-500 uppercase">Input Text</label>
                 <button onClick={() => setTranslationInput('')} className="text-[10px] text-red-400 font-bold hover:text-red-600">CLEAR</button>
              </div>
              <textarea 
                value={translationInput}
                onChange={(e) => setTranslationInput(e.target.value)}
                placeholder={transMode === 'to_zh' ? "輸入德文或義大利文..." : "輸入中文..."}
                className={`w-full h-32 p-3 resize-none text-sm font-bold ${POKE_INPUT_STYLE}`}
              />
              <button 
                type="button"
                onClick={handleTranslate} 
                disabled={translationLoading || !translationInput}
                className={`w-full py-3 ${currentTheme.color} text-white font-black rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-y-[1px] active:shadow-none flex justify-center items-center disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[3px_3px_0px_#000] cursor-pointer`}
              >
                {translationLoading ? <Loader2 className="animate-spin" size={18}/> : <><Sparkles size={16} className="mr-2"/> 開始翻譯</>}
              </button>
           </div>

           {/* Result Card */}
           {(translationResult || translationLoading) && (
              <div ref={resultRef} className={`${POKE_CARD_STYLE} p-4 bg-[#FFF9C4] relative min-h-[100px] animate-in slide-in-from-bottom-2`}>
                 <div className="absolute top-0 left-0 bg-black text-white px-2 py-0.5 text-[10px] font-bold rounded-br-lg">RESULT</div>
                 {translationLoading ? (
                    <div className="h-full flex items-center justify-center pt-8 pb-4">
                        <span className="text-xs font-bold text-yellow-700 animate-pulse flex items-center"><Loader2 size={12} className="animate-spin mr-2"/>正在解讀語言...</span>
                    </div>
                 ) : (
                    <div className="pt-6">
                        <p className={`text-lg font-black text-gray-800 leading-relaxed break-all`}>{translationResult}</p>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => navigator.clipboard.writeText(translationResult)} className="text-xs font-bold text-yellow-800 flex items-center bg-yellow-200 px-2 py-1 rounded border border-yellow-400 active:scale-95 shadow-sm hover:bg-yellow-100 transition-colors">
                                <Copy size={12} className="mr-1"/> 複製
                            </button>
                        </div>
                    </div>
                 )}
              </div>
           )}
        </div>
      )}
    </div>
  );
};
