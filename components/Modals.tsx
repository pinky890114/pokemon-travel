import React, { useState } from 'react';
import { X, Sun, Plus, Minus, Trash2, Upload, Ticket, QrCode, Check, Camera, Copy } from 'lucide-react';
import { POKE_CARD_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE, DIGITAL_FONT_STYLE, POKEMON_THEMES } from '../constants';
import { TripSettings, ItineraryEvent, FlightSegment, Theme, Hotel, Voucher, Member, JournalEntry, WeatherInfo } from '../types';
import { getPokemonSprite, compressImage } from '../utils';

// --- Weather Modal ---
export const WeatherModal: React.FC<{ weather: WeatherInfo; onClose: () => void }> = ({ weather, onClose }) => (
  <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
    <div className={`${POKE_CARD_STYLE} w-full max-w-sm h-[60vh] flex flex-col overflow-hidden`}>
       <div className="flex justify-between items-center p-4 border-b-[3px] border-black bg-gray-50 font-black">
         <h3 className="text-xl">氣候分析: {weather.name}</h3>
         <button onClick={onClose}><X size={18} /></button>
       </div>
       <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
             {[...Array(12)].map((_, i) => {
                const hour = 9 + i;
                // Simulate hourly temp curve (peak at 14:00)
                const peakHour = 14;
                const hourDiff = Math.abs(hour - peakHour);
                let simTemp = Math.round(weather.maxTemp - (hourDiff * 0.8));
                simTemp = Math.max(simTemp, weather.minTemp);

                return (
                    <div key={i} className="flex items-center justify-between p-2 border-b-2 border-dashed border-gray-200">
                    <span className="text-sm font-bold text-gray-500 w-12">{hour}:00</span>
                    <span className="text-xl">{weather.icon}</span>
                    <span className={`font-black text-gray-800 w-12 text-right ${DIGITAL_FONT_STYLE}`}>{simTemp}°</span>
                    </div>
                );
             })}
          </div>
       </div>
    </div>
  </div>
);

// --- Settings Modal ---
interface SettingsModalProps {
  settings: TripSettings;
  totalDays: number;
  adventureId?: string;
  onClose: () => void;
  onSave: (settings: TripSettings, days: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, totalDays, adventureId, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const [localDays, setLocalDays] = React.useState(totalDays);
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (adventureId) {
        navigator.clipboard.writeText(adventureId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
           
           {/* Changed to vertical stack (grid-cols-1) to prevent overlap on mobile */}
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
           <button onClick={() => onSave(localSettings, localDays)} className={`w-full bg-[#8B5A2B] text-white py-3 font-black ${POKE_BTN_STYLE}`}>確定儲存</button>
        </div>
      </div>
    </div>
  );
};

// --- Add/Edit Event Modal ---
interface EventModalProps {
  event: ItineraryEvent;
  isEditing: boolean;
  currentTheme: Theme;
  onClose: () => void;
  onSave: (event: ItineraryEvent) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, isEditing, currentTheme, onClose, onSave }) => {
  const [localEvent, setLocalEvent] = React.useState(event);

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 font-black">
          <h3 className="text-xl">{isEditing ? '編輯' : '新增'}任務</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-4 pb-12">
           <div className="grid grid-cols-2 gap-4">
             <input type="date" value={localEvent.date} onChange={e => setLocalEvent({...localEvent, date: e.target.value})} className={`w-full p-2 text-xs font-black ${POKE_INPUT_STYLE}`} />
             <input type="time" value={localEvent.time} onChange={e => setLocalEvent({...localEvent, time: e.target.value})} className={`w-full p-2 text-xs font-black ${POKE_INPUT_STYLE}`} />
           </div>
           <input type="text" placeholder="標題" value={localEvent.title} onChange={e => setLocalEvent({...localEvent, title: e.target.value})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`} />
           <input type="text" placeholder="地點" value={localEvent.location} onChange={e => setLocalEvent({...localEvent, location: e.target.value})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`} />
           <div className="grid grid-cols-2 gap-4">
              <select value={localEvent.type} onChange={e => setLocalEvent({...localEvent, type: e.target.value as 'event' | 'transport'})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`}>
                <option value="event">景點事件</option>
                <option value="transport">交通移動</option>
              </select>
              {localEvent.type === 'transport' && (
                <select value={localEvent.transportMode} onChange={e => setLocalEvent({...localEvent, transportMode: e.target.value as any})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`}>
                  <option value="walk">步行</option>
                  <option value="train">火車</option>
                  <option value="car">計程車</option>
                  <option value="bus">公車</option>
                </select>
              )}
           </div>
           <textarea placeholder="備註資訊..." value={localEvent.notes} onChange={e => setLocalEvent({...localEvent, notes: e.target.value})} className={`w-full p-2 h-24 font-bold resize-none ${POKE_INPUT_STYLE}`}></textarea>
           <button onClick={() => onSave(localEvent)} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>確定儲存</button>
        </div>
      </div>
    </div>
  );
};

// --- Edit Flight Modal ---
interface FlightModalProps {
  flightData: FlightSegment[];
  currentTheme: Theme;
  onClose: () => void;
  onSave: (data: FlightSegment[]) => void;
}

export const FlightModal: React.FC<FlightModalProps> = ({ flightData, currentTheme, onClose, onSave }) => {
  const [localData, setLocalData] = React.useState(flightData);

  const updateSegment = (index: number, field: keyof FlightSegment, value: string) => {
    const newData = [...localData];
    newData[index] = { ...newData[index], [field]: value };
    setLocalData(newData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto`}>
         <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 font-black">
           <h3 className="text-xl">編輯航班</h3>
           <button onClick={onClose}><X size={20}/></button>
         </div>
         <div className="space-y-8 pb-12">
           {localData.map((seg, i) => (
             <div key={seg.id || i} className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50 relative space-y-3 shadow-inner">
                <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black border border-gray-300 rounded uppercase tracking-widest">Segment {i+1}</div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="From" value={seg.from} onChange={e => updateSegment(i, 'from', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input placeholder="To" value={seg.to} onChange={e => updateSegment(i, 'to', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" value={seg.depTime} onChange={e => updateSegment(i, 'depTime', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input type="time" value={seg.arrTime} onChange={e => updateSegment(i, 'arrTime', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Dep Term" value={seg.depTerminal} onChange={e => updateSegment(i, 'depTerminal', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input placeholder="Arr Term" value={seg.arrTerminal} onChange={e => updateSegment(i, 'arrTerminal', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                </div>
                <input placeholder="Airline" value={seg.airline} onChange={e => updateSegment(i, 'airline', e.target.value)} className={`w-full p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="Flight" value={seg.flight} onChange={e => updateSegment(i, 'flight', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input placeholder="Gate" value={seg.gate} onChange={e => updateSegment(i, 'gate', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input placeholder="Seat" value={seg.seat} onChange={e => updateSegment(i, 'seat', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                </div>
                <input placeholder="Baggage" value={seg.baggage} onChange={e => updateSegment(i, 'baggage', e.target.value)} className={`w-full p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                {i > 0 && <input placeholder="Layover Time" value={seg.layover || ''} onChange={e => updateSegment(i, 'layover', e.target.value)} className={`w-full p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />}
             </div>
           ))}
           <button onClick={() => onSave(localData)} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>確定儲存</button>
         </div>
      </div>
    </div>
  );
};

// --- Hotel Modal ---
interface HotelModalProps {
  hotel: Hotel;
  currentTheme: Theme;
  onClose: () => void;
  onSave: (hotel: Hotel) => void;
  onDelete: (id: string) => void;
}

export const HotelModal: React.FC<HotelModalProps> = ({ hotel, currentTheme, onClose, onSave, onDelete }) => {
  const [localHotel, setLocalHotel] = React.useState(hotel);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setLocalHotel({ ...localHotel, image: compressed });
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto`}>
         <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 font-black">
           <h3 className="text-xl">住宿資訊</h3>
           <button onClick={onClose}><X size={20}/></button>
         </div>
         <div className="space-y-4 pb-12">
            <input 
              type="text" 
              placeholder="飯店名稱" 
              value={localHotel.name} 
              onChange={e => setLocalHotel({...localHotel, name: e.target.value})} 
              className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`} 
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="飯店地址" 
                value={localHotel.location} 
                onChange={e => setLocalHotel({...localHotel, location: e.target.value})} 
                className={`w-full p-2 text-xs font-black ${POKE_INPUT_STYLE}`} 
              />
              <input 
                type="text" 
                placeholder="入住代碼 (Booking Code)" 
                value={localHotel.bookingCode || ''} 
                onChange={e => setLocalHotel({...localHotel, bookingCode: e.target.value})} 
                className={`w-full p-2 text-xs font-black ${POKE_INPUT_STYLE}`}
              />
            </div>
            
            {/* Image Upload Section */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">HOTEL IMAGE</label>
              <div className="flex items-center space-x-2">
                  <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-1 py-2 font-bold text-xs border-2 border-black border-dashed bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors`}
                  >
                      <Upload size={14} className="mr-2" />
                      {localHotel.image ? '更換圖片' : '上傳圖片'}
                  </button>
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*"
                  />
              </div>
              {localHotel.image && (
                  <div className="mt-2 w-full h-32 rounded-lg border-2 border-black overflow-hidden relative group">
                       <img src={localHotel.image} alt="preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/10"></div>
                       <button 
                          onClick={() => setLocalHotel({...localHotel, image: ''})} 
                          className="absolute top-2 right-2 bg-white border-2 border-black rounded-full p-1 shadow-[1px_1px_0px_#000] active:translate-y-[1px] active:shadow-none"
                       >
                          <X size={12}/>
                       </button>
                  </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">CHECK-IN</label>
                  <input type="date" value={localHotel.checkIn || ''} onChange={e => setLocalHotel({...localHotel, checkIn: e.target.value})} className={`w-full p-1.5 text-[10px] font-black ${POKE_INPUT_STYLE}`} />
               </div>
               <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">CHECK-OUT</label>
                  <input type="date" value={localHotel.checkOut || ''} onChange={e => setLocalHotel({...localHotel, checkOut: e.target.value})} className={`w-full p-1.5 text-[10px] font-black ${POKE_INPUT_STYLE}`} />
               </div>
            </div>
            <textarea placeholder="備註..." value={localHotel.notes || ''} onChange={e => setLocalHotel({...localHotel, notes: e.target.value})} className={`w-full p-2 h-20 text-xs font-bold resize-none ${POKE_INPUT_STYLE}`}></textarea>
            
            <div className="flex space-x-2 pt-2">
              {localHotel.id && (
                <button onClick={() => onDelete(localHotel.id)} className={`flex-1 bg-red-100 text-red-600 py-3 font-black ${POKE_BTN_STYLE} flex justify-center`}>
                  <Trash2 size={16} />
                </button>
              )}
              <button onClick={() => onSave(localHotel)} className={`flex-[3] ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>
                確定儲存
              </button>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- QR Modal ---
export const QRModal: React.FC<{ image: string; title: string; onClose: () => void }> = ({ image, title, onClose }) => (
  <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
     <div className={`${POKE_CARD_STYLE} p-4 w-full max-w-sm`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-black text-lg truncate pr-2">{title}</h3>
           <button onClick={onClose}><X size={24}/></button>
        </div>
        <div className="aspect-square bg-white rounded-lg border-2 border-black flex items-center justify-center overflow-hidden p-2">
           <img src={image} alt="QR Code" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center justify-center mt-4">
           <p className="text-center text-xs font-bold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full border border-yellow-300 animate-pulse">
              請向工作人員出示此條碼
           </p>
        </div>
     </div>
  </div>
);

// --- Voucher Modal ---
interface VoucherModalProps {
  voucher: Voucher;
  currentTheme: Theme;
  onClose: () => void;
  onSave: (voucher: Voucher) => void;
  onDelete: (id: string) => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ voucher, currentTheme, onClose, onSave, onDelete }) => {
  const [localVoucher, setLocalVoucher] = React.useState(voucher);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setLocalVoucher({ ...localVoucher, qrImage: compressed });
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 font-black">
          <h3 className="text-xl">票券憑證</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-4 pb-12">
           <input 
             type="text" 
             placeholder="憑證名稱 (如: Swiss Pass)" 
             value={localVoucher.title} 
             onChange={e => setLocalVoucher({...localVoucher, title: e.target.value})} 
             className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`} 
           />
           <select value={localVoucher.type} onChange={e => setLocalVoucher({...localVoucher, type: e.target.value as any})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`}>
              <option value="transport">交通票券</option>
              <option value="attraction">景點門票</option>
              <option value="restaurant">餐廳訂位</option>
              <option value="other">其他</option>
           </select>
           
           <input 
             type="text" 
             placeholder="參考編號 / 訂位代號" 
             value={localVoucher.referenceNo} 
             onChange={e => setLocalVoucher({...localVoucher, referenceNo: e.target.value})} 
             className={`w-full p-2 text-sm font-black font-mono ${POKE_INPUT_STYLE}`} 
           />

           <input type="date" value={localVoucher.date || ''} onChange={e => setLocalVoucher({...localVoucher, date: e.target.value})} className={`w-full p-2 text-xs font-black ${POKE_INPUT_STYLE}`} />

           {/* QR Code Upload Section */}
           <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">QR CODE IMAGE</label>
              <div className="flex items-center space-x-2">
                  <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-1 py-2 font-bold text-xs border-2 border-black border-dashed bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors`}
                  >
                      <Upload size={14} className="mr-2" />
                      {localVoucher.qrImage ? '更換圖片' : '上傳圖片'}
                  </button>
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*"
                  />
              </div>
              {localVoucher.qrImage && (
                  <div className="mt-2 w-32 mx-auto aspect-square bg-white rounded-lg border-2 border-black overflow-hidden relative group">
                       <img src={localVoucher.qrImage} alt="preview" className="w-full h-full object-contain p-2" />
                       <button 
                          onClick={() => setLocalVoucher({...localVoucher, qrImage: ''})} 
                          className="absolute top-1 right-1 bg-white border-2 border-black rounded-full p-1 shadow-[1px_1px_0px_#000] active:translate-y-[1px] active:shadow-none"
                       >
                          <X size={10}/>
                       </button>
                  </div>
              )}
           </div>

           <textarea placeholder="使用說明 / 備註..." value={localVoucher.notes || ''} onChange={e => setLocalVoucher({...localVoucher, notes: e.target.value})} className={`w-full p-2 h-24 text-xs font-bold resize-none ${POKE_INPUT_STYLE}`}></textarea>
           
           <div className="flex space-x-2 pt-2">
              {localVoucher.id && (
                <button onClick={() => onDelete(localVoucher.id)} className={`flex-1 bg-red-100 text-red-600 py-3 font-black ${POKE_BTN_STYLE} flex justify-center`}>
                  <Trash2 size={16} />
                </button>
              )}
              <button onClick={() => onSave(localVoucher)} className={`flex-[3] ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>
                確定儲存
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Member Modal ---
interface MemberModalProps {
  member: Member;
  currentTheme: Theme;
  onClose: () => void;
  onSave: (member: Member) => void;
  onDelete: (id: string) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ member, currentTheme, onClose, onSave, onDelete }) => {
  const [localMember, setLocalMember] = React.useState(member);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 200, 0.7); // Smaller size for avatars
        setLocalMember({ ...localMember, img: compressed });
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 font-black">
          <h3 className="text-xl">夥伴資料</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-6 pb-12">
           {/* Avatar Section */}
           <div className="flex flex-col items-center">
             <div className="relative group w-24 h-24 mb-3">
               <img src={localMember.img} className="w-full h-full rounded-full border-4 border-black object-cover bg-gray-100" alt="avatar" />
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white border-2 border-black rounded-full p-1.5 shadow-md active:scale-90 transition-transform"
               >
                 <Upload size={14} />
               </button>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
             <input 
               type="text" 
               placeholder="訓練家名稱" 
               value={localMember.name} 
               onChange={e => setLocalMember({...localMember, name: e.target.value})} 
               className={`w-full text-center p-2 font-black ${POKE_INPUT_STYLE}`} 
             />
           </div>

           {/* Pokemon Theme Selection */}
           <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block uppercase text-center">選擇搭檔寶可夢</label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                 {POKEMON_THEMES.map((theme, idx) => (
                    <button 
                       key={theme.id}
                       onClick={() => setLocalMember({...localMember, themeIdx: idx})}
                       className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all relative ${localMember.themeIdx === idx ? 'border-black bg-gray-100 shadow-[2px_2px_0px_0px_#000]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                    >
                       <img src={getPokemonSprite(theme.id)} className="w-10 h-10 object-contain" alt={theme.name} />
                       {localMember.themeIdx === idx && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white rounded-bl-lg p-0.5 border-l border-b border-black">
                             <Check size={8} strokeWidth={4}/>
                          </div>
                       )}
                    </button>
                 ))}
              </div>
              <div className="text-center mt-2">
                 <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border border-black ${POKEMON_THEMES[localMember.themeIdx]?.text || 'text-black'} ${POKEMON_THEMES[localMember.themeIdx]?.bgLight || 'bg-white'}`}>
                    {POKEMON_THEMES[localMember.themeIdx]?.name || 'Unknown'}
                 </span>
              </div>
           </div>

           <div className="flex space-x-2 pt-2">
              {localMember.id && (
                <button onClick={() => onDelete(localMember.id)} className={`flex-1 bg-red-100 text-red-600 py-3 font-black ${POKE_BTN_STYLE} flex justify-center`}>
                  <Trash2 size={16} />
                </button>
              )}
              <button onClick={() => onSave(localMember)} className={`flex-[3] ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>
                確定儲存
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Journal Modal ---
interface JournalModalProps {
    members: Member[];
    currentTheme: Theme;
    onClose: () => void;
    onSave: (entry: JournalEntry) => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({ members, currentTheme, onClose, onSave }) => {
    const [content, setContent] = React.useState('');
    const [image, setImage] = React.useState('');
    const [authorId, setAuthorId] = React.useState(members[0]?.id || '');
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setImage(compressed);
            } catch (err) {
                console.error("Image compression failed", err);
            }
        }
    };

    const handleSave = () => {
        if (!content && !image) return;
        onSave({
            id: '', // Will be generated in App
            content,
            image,
            authorId,
            date,
            createdAt: new Date().toISOString()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
            <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 font-black">
                    <h3 className="text-xl">寫日記</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="space-y-4 pb-4">
                    <div className="flex gap-2">
                        <select 
                            value={authorId} 
                            onChange={e => setAuthorId(e.target.value)} 
                            className={`flex-1 p-2 font-black ${POKE_INPUT_STYLE}`}
                        >
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            className={`flex-1 p-2 text-xs font-black ${POKE_INPUT_STYLE}`} 
                        />
                    </div>

                    <textarea 
                        placeholder="今天發生了什麼事？" 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className={`w-full p-2 h-32 font-bold resize-none ${POKE_INPUT_STYLE}`}
                    ></textarea>

                    {/* Image Upload */}
                    <div>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full py-3 font-bold text-xs border-2 border-black border-dashed bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors`}
                            >
                                <Camera size={16} className="mr-2" />
                                {image ? '更換照片' : '上傳照片'}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                        {image && (
                            <div className="mt-2 w-full aspect-video rounded-lg border-2 border-black overflow-hidden relative">
                                <img src={image} alt="preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => setImage('')} 
                                    className="absolute top-2 right-2 bg-white border-2 border-black rounded-full p-1 shadow-[1px_1px_0px_#000] active:translate-y-[1px] active:shadow-none"
                                >
                                    <X size={12}/>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-2">
                        <p className="text-center text-xs text-gray-400 font-bold mb-2">發布日記可獲得經驗值提升等級！</p>
                        <button onClick={handleSave} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>
                            發布日記
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};